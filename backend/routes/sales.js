module.exports = (client, app, authenticate) => {
    const { ObjectId } = require('mongodb');
    const database = client.db("posinet");
    const sales = database.collection("sales");

    // Create a sale
    app.post('/api/sales', authenticate, async (req, res) => {
        try {
            const { productId, quantity, coupon, customerDetails, paymentMethod } = req.body;

            if (!productId || !quantity || !customerDetails || !paymentMethod) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const newSale = {
                productId: new ObjectId(productId),
                quantity,
                coupon,
                customerDetails,
                paymentMethod,
                saleDate: new Date()
            };

            const result = await sales.insertOne(newSale);

            res.status(201).json({ message: 'Sale created successfully', sale: newSale });
        } catch (error) {
            console.error('Error creating sale:', error);
            res.status(500).json({ message: 'Error creating sale', error });
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
            res.status(200).json({ message: 'Sale deleted successfully' });
        } catch (error) {
            console.error('Error deleting sale:', error);
            res.status(500).json({ message: 'Error deleting sale', error });
        }
    });
};
