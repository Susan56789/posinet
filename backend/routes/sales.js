module.exports = (client, app, authenticate) => {
    const { ObjectId } = require('mongodb');
    const database = client.db("posinet");
    const sales = database.collection("sales");

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

    // Create a sale
    app.post('/api/sales', authenticate, async (req, res) => {
        try {
            const { products, coupon, customerDetails, paymentMethod, totalAmount, date } = req.body;

            // Store sale details in the customers collection
            const result = await customers.insertOne({
                customerDetails,
                products,
                totalAmount,
                coupon,
                paymentMethod,
                date,
                creditLimit: 0 // Default credit limit
            });
            // Log activity
            await logActivity('sales', `New Sale Amount: ${totalAmount}`);

            res.status(201).send(result.ops[0]);
        } catch (error) {
            res.status(500).send({ message: 'Error processing sale', error });
        }
    });

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

    app.get('/api/sales/recent', authenticate, async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const recentSales = await sales
                .find()
                .sort({ date: -1 })
                .limit(limit)
                .toArray();

            res.status(200).json(recentSales);
        } catch (error) {
            console.error('Error fetching recent sales:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
};
