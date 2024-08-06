const multer = require('multer');
const { ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

module.exports = (client, app, authenticate) => {
    const database = client.db("posinet");
    const products = database.collection("products");

    app.post('/api/products', authenticate, upload.single('image'), async (req, res) => {
        try {
            const { title, description, price, stock } = req.body;
            const image = req.file ? req.file.path : null;

            if (!title || !description || !price || !stock || !image) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const newProduct = { title, description, price, stock, image };
            const result = await products.insertOne(newProduct);

            res.status(201).json(result.ops[0]);
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

    app.put('/api/products/:id', authenticate, upload.single('image'), async (req, res) => {
        try {
            const { id } = req.params;
            const { title, description, price, stock } = req.body;
            const image = req.file ? req.file.path : req.body.image;

            if (!title || !description || !price || !stock) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const updatedProduct = { title, description, price, stock, image };
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
            const product = await products.findOne({ _id: ObjectId(id) });

            if (product.image) {
                fs.unlinkSync(product.image);
            }

            const result = await products.deleteOne({ _id: ObjectId(id) });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ message: 'Error deleting product', error });
        }
    });
};
