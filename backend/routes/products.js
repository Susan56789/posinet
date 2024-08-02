module.exports = (client, app, authenticate) => {
    const database = client.db("posinet");
    const products = database.collection("products");

    app.post('/api/products', authenticate, async (req, res) => {
        try {
            const { title, description, price, stock } = req.body;

            if (!title || !description || !price || !stock) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const newProduct = { title, description, price, stock };
            const result = await products.insertOne(newProduct);

            res.status(201).json(result);
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ message: 'Error creating product', error });
        }
    });

    app.get('/api/products', authenticate, async (req, res) => {
        try {
            const productList = await products.find().toArray();
            res.status(200).json(productList);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ message: 'Error fetching products', error });
        }
    });

    app.put('/api/products/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;
            const { title, description, price, stock } = req.body;

            if (!title || !description || !price || !stock) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const updatedProduct = { title, description, price, stock };
            const result = await products.updateOne({ _id: ObjectId(id) }, { $set: updatedProduct });

            res.status(200).json(result);
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Error updating product', error });
        }
    });

    app.delete('/api/products/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;

            const result = await products.deleteOne({ _id: ObjectId(id) });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ message: 'Error deleting product', error });
        }
    });
};
