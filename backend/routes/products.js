const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        // Create the uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
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

            // Validate input
            if (!title || !description || !price || !stock) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Convert price and stock to numbers
            const numericPrice = parseFloat(price);
            const numericStock = parseInt(stock);

            if (isNaN(numericPrice) || isNaN(numericStock)) {
                return res.status(400).json({ message: 'Invalid price or stock value' });
            }

            const newProduct = {
                title,
                description,
                price: numericPrice,
                stock: numericStock,
                image: image ? `/${image}` : null // Store the relative path
            };

            const result = await products.insertOne(newProduct);

            if (result.acknowledged && result.insertedId) {
                const insertedProduct = await products.findOne({ _id: result.insertedId });
                res.status(201).json(insertedProduct);
            } else {
                throw new Error('Failed to insert product');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ message: 'Error creating product', error: error.message });
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
