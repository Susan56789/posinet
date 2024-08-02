module.exports = (client, app, authenticate) => {
    const database = client.db("posinet");
    const sales = database.collection("sales");

    app.post('/api/sales', authenticate, async (req, res) => {
        try {
            const { orderId, customer, amount, status } = req.body;

            if (!orderId || !customer || !amount || !status) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const newSale = { orderId, customer, amount, status };
            const result = await sales.insertOne(newSale);

            res.status(201).json(result);
        } catch (error) {
            console.error('Error creating sale:', error);
            res.status(500).json({ message: 'Error creating sale', error });
        }
    });

    app.get('/api/sales', authenticate, async (req, res) => {
        try {
            const salesList = await sales.find().toArray();
            res.status(200).json(salesList);
        } catch (error) {
            console.error('Error fetching sales:', error);
            res.status(500).json({ message: 'Error fetching sales', error });
        }
    });

    app.put('/api/sales/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;
            const { orderId, customer, amount, status } = req.body;

            if (!orderId || !customer || !amount || !status) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const updatedSale = { orderId, customer, amount, status };
            const result = await sales.updateOne({ _id: ObjectId(id) }, { $set: updatedSale });

            res.status(200).json(result);
        } catch (error) {
            console.error('Error updating sale:', error);
            res.status(500).json({ message: 'Error updating sale', error });
        }
    });

    app.delete('/api/sales/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;

            const result = await sales.deleteOne({ _id: ObjectId(id) });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error deleting sale:', error);
            res.status(500).json({ message: 'Error deleting sale', error });
        }
    });
};
