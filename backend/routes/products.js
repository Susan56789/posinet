const Joi = require('joi');
const sharp = require('sharp');
const multer = require('multer');
const path = require('path');
const { ObjectId } = require('mongodb');
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

const productSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    stock: Joi.number().required()
});

const createImageURL = (filename) => `/api/images/${filename}`;

module.exports = (client, app, authenticate) => {
    const database = client.db("posinet");
    const products = database.collection("products");

    app.post('/api/products', authenticate, upload.single('image'), async (req, res) => {
        try {
            const { error } = productSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            const { title, description, price, stock } = req.body;
            let image = null;

            if (req.file) {
                const processedImagePath = `uploads/processed_${req.file.filename}`;
                await sharp(req.file.path)
                    .resize(300, 300)
                    .toFile(processedImagePath);
                image = createImageURL(`processed_${req.file.filename}`);
                fs.unlinkSync(req.file.path); // Remove the original file
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
            const { error } = productSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            const { title, description, price, stock } = req.body;
            let image = req.body.image;

            if (req.file) {
                const processedImagePath = `uploads/processed_${req.file.filename}`;
                await sharp(req.file.path)
                    .resize(300, 300)
                    .toFile(processedImagePath);
                image = createImageURL(`processed_${req.file.filename}`);
                fs.unlinkSync(req.file.path); // Remove the original file
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

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (product.image) {
                const imagePath = path.join(__dirname, '..', product.image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                } else {
                    console.warn(`Image not found at path: ${imagePath}`);
                }
            }

            const result = await products.deleteOne({ _id: ObjectId(id) });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ message: 'Error deleting product', error });
        }
    });
};
