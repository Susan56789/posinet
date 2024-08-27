module.exports = (client, app, authenticate) => {
    const { ObjectId } = require('mongodb');
    const { v4: uuidv4 } = require('uuid');
    const database = client.db("posinet");
    const sales = database.collection("sales");
    const customers = database.collection('customers');
    const activities = database.collection('activities');

    const logActivity = async (type, description) => {
        try {
            const activity = {
                type,
                description,
                timestamp: new Date()
            };
            await activities.insertOne(activity);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    };


    //create new sale
    app.post('/api/sales', authenticate, async (req, res) => {
        const session = await client.startSession();
        session.startTransaction();

        try {
            const { products, discount, customerDetails, paymentMethod, totalAmount, date } = req.body;

            console.log('Received sale data:', req.body);

            // Validate required fields
            if (!products || !customerDetails || !paymentMethod || !totalAmount || !date) {
                throw new Error('All fields are required');
            }

            // Generate a unique sale ID
            const saleId = uuidv4();

            // Create the sale
            const sale = {
                _id: saleId,
                products,
                discount,
                customerDetails,
                paymentMethod,
                totalAmount,
                date: new Date(date)
            };

            const saleResult = await sales.insertOne(sale, { session });

            if (!saleResult.insertedId) {
                throw new Error('Failed to create sale');
            }

            // Update product stock
            for (const product of products) {
                const result = await database.collection("products").updateOne(
                    { _id: new ObjectId(product.productId) },
                    { $inc: { stock: -product.quantity } },
                    { session }
                );

                if (result.modifiedCount === 0) {
                    throw new Error(`Product ${product.productId} not found or insufficient stock`);
                }
            }

            // Create or update customer
            const { name, phone, email } = customerDetails;
            let customer = await customers.findOne({ $or: [{ email }, { phone }] }, { session });

            if (customer) {
                // Update existing customer
                await customers.updateOne(
                    { _id: customer._id },
                    {
                        $set: {
                            name,
                            phone,
                            email,
                            lastPurchaseDate: new Date(date),
                            lastSaleId: saleId
                        },
                        $inc: { totalPurchases: totalAmount }
                    },
                    { session }
                );
            } else {
                // Create new customer
                await customers.insertOne({
                    name,
                    phone,
                    email,
                    lastPurchaseDate: new Date(date),
                    totalPurchases: totalAmount,
                    lastSaleId: saleId,
                    creditLimit: 0 // Default credit limit
                }, { session });
            }

            // Commit the transaction
            await session.commitTransaction();

            res.status(201).json({
                message: 'Sale completed successfully',
                saleId: saleId
            });

        } catch (error) {
            // If an error occurred, abort the transaction
            await session.abortTransaction();

            console.error('Error processing sale:', error);
            res.status(500).json({
                message: 'Error processing sale',
                error: error.message,
                stack: error.stack
            });
        } finally {
            await session.endSession();
        }
    });



    // Get all sales
    app.get('/api/sales', authenticate, async (req, res) => {
        try {
            const salesList = await sales.find().toArray();
            res.status(200).json(salesList);
        } catch (error) {
            console.error('Error fetching sales:', error);
            res.status(500).json({ message: 'Error fetching sales', error: error.message });
        }
    });

    // Get Recent Sales (without limit)
    app.get('/api/sales/recent', authenticate, async (req, res) => {
        try {
            const recentSales = await sales.find()
                .sort({ date: -1 })
                .toArray();

            res.status(200).json(recentSales);
        } catch (error) {
            console.error('Error fetching recent sales:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    // Update a sale
    app.put('/api/sales/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;
            const { products, discount, customerDetails, paymentMethod, totalAmount } = req.body;

            // Validate required fields
            if (!products || !customerDetails || !paymentMethod || !totalAmount) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const updatedSale = {
                products,
                discount,
                customerDetails,
                paymentMethod,
                totalAmount,
                saleDate: new Date()  // Update the sale date to current
            };

            const result = await sales.updateOne({ _id: ObjectId(id) }, { $set: updatedSale });

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Sale not found' });
            }

            // Log activity
            await logActivity('sales', `Updated Sale: ${id}`);

            res.status(200).json({ message: 'Sale updated successfully', sale: updatedSale });
        } catch (error) {
            console.error('Error updating sale:', error);
            res.status(500).json({ message: 'Error updating sale', error: error.message });
        }
    });

    // Delete a sale
    app.delete('/api/sales/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;

            const result = await sales.deleteOne({ _id: ObjectId(id) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Sale not found' });
            }

            // Log activity
            await logActivity('sales', `Deleted Sale: ${id}`);

            res.status(200).json({ message: 'Sale deleted successfully' });
        } catch (error) {
            console.error('Error deleting sale:', error);
            res.status(500).json({ message: 'Error deleting sale', error: error.message });
        }
    });
};

