module.exports = (client, app, authenticate) => {
    const { ObjectId } = require('mongodb');
    const database = client.db("posinet");
    const sales = database.collection("sales");
    const customers = database.collection('customers');
    const activities = database.collection('activities');


    // Create a sale

    app.post('/api/sales', authenticate, async (req, res) => {
        try {
            const { products, coupon, customerDetails, paymentMethod, totalAmount, date } = req.body;

            // Create the sale
            const saleResult = await sales.insertOne({
                products,
                coupon,
                customerDetails,
                paymentMethod,
                totalAmount,
                date
            });

            const saleId = saleResult.insertedId;

            // Create or update customer
            const { name, phone, email } = customerDetails;
            let customer = await customers.findOne({ $or: [{ email }, { phone }] });

            if (customer) {
                // Update existing customer
                await customers.updateOne(
                    { _id: customer._id },
                    {
                        $set: {
                            name,
                            phone,
                            email,
                            lastPurchaseDate: date,
                            lastSaleId: saleId
                        },
                        $inc: { totalPurchases: totalAmount }
                    }
                );
            } else {
                // Create new customer
                await customers.insertOne({
                    name,
                    phone,
                    email,
                    lastPurchaseDate: date,
                    totalPurchases: totalAmount,
                    lastSaleId: saleId,
                    creditLimit: 0 // Default credit limit
                });
            }

            // Log activity
            await logActivity('sales', `New Sale Amount: ${totalAmount}`);

            res.status(201).json({
                message: 'Sale completed successfully',
                saleId: saleId.toString()
            });
        } catch (error) {
            console.error('Error processing sale:', error);
            res.status(500).json({ message: 'Error processing sale', error: error.message });
        }
    });

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

    // Get all sales
    app.get('/api/sales', authenticate, async (req, res) => {
        try {
            const salesList = await sales.find().toArray();
            res.status(200).json(salesList);
        } catch (error) {
            console.error('Error fetching sales:', error);
            res.status(500).json({ message: 'Error fetching sales', error });
        }
    });

    //Get Recent Sales
    app.get('/api/sales/recent', authenticate, async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 5;
            const recentSales = await sales.find()
                .sort({ date: -1 })
                .limit(limit)
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
            const { productId, quantity, coupon, customerDetails, paymentMethod } = req.body;

            if (!productId || !quantity || !customerDetails || !paymentMethod) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const updatedSale = {
                productId: new ObjectId(productId),
                quantity,
                coupon,
                customerDetails,
                paymentMethod,
                saleDate: new Date()  // Update the sale date
            };

            const result = await sales.updateOne({ _id: ObjectId(id) }, { $set: updatedSale });

            // Log activity
            await logActivity('sale', `Updated Sale: ${id}`);


            res.status(200).json({ message: 'Sale updated successfully', sale: updatedSale });
        } catch (error) {
            console.error('Error updating sale:', error);
            res.status(500).json({ message: 'Error updating sale', error });
        }
    });

    // Delete a sale
    app.delete('/api/sales/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;

            const result = await sales.deleteOne({ _id: ObjectId(id) });
            // Log activity
            await logActivity('sale', `Deleted Sale: ${id}`);

            res.status(200).json({ message: 'Sale deleted successfully' });
        } catch (error) {
            console.error('Error deleting sale:', error);
            res.status(500).json({ message: 'Error deleting sale', error });
        }
    });


};
