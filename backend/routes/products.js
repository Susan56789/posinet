const express = require('express');
const multer = require('multer');
const path = require('path');
const { ObjectId } = require('mongodb');
const fs = require('fs');

module.exports = function (client, app, authenticate) {
    const router = express.Router();
    const database = client.db("posinet");
    const products = database.collection("products");

    // Setup multer for image uploads
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
    const upload = multer({ storage: storage });

    // Create product route
    router.post('/', authenticate, upload.array('images', 10), async (req, res) => {
        try {
            const { title, description, price, stock } = req.body;

            if (!title || !description || !price || !stock) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            const imagePaths = req.files.map(file => {
                return {
                    url: `https://posinet.onrender.com/api/images/${file.filename}`,
                    filename: file.filename
                };
            });

            const newProduct = {
                title,
                description,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                images: imagePaths,
                createdAt: new Date()
            };

            const result = await products.insertOne(newProduct);

            if (result.insertedCount === 1) {
                res.status(201).json({ message: 'Product created successfully', product: newProduct });
            } else {
                res.status(500).json({ message: 'Failed to create product' });
            }
        } catch (err) {
            console.error('Error creating product:', err);
            res.status(500).json({ message: 'Internal Server Error' });
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

    app.put('/api/product/:id', authenticate, upload.array('images', 5), async (req, res) => {
        try {
            const { id } = req.params;

            const productData = {
                title: req.body.title,
                description: req.body.description,
                price: parseFloat(req.body.price),
                stock: parseInt(req.body.stock)
            };

            const { error } = productSchema.validate(productData);
            if (error) {
                return res.status(400).json({ message: "Invalid data", error: error.details[0].message });
            }

            const updatedProduct = { ...productData };

            // Process new images if any
            const images = [];
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const webpBuffer = await sharp(file.buffer)
                        .webp({ quality: 80 })
                        .toBuffer();

                    const uploadStream = bucket.openUploadStream(file.originalname + '.webp', {
                        contentType: 'image/webp'
                    });
                    uploadStream.end(webpBuffer);
                    images.push({ filename: file.originalname + '.webp' });
                }
            }

            // Update the product
            const result = await products.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedProduct }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Log activity
            await logActivity('product', `Updated product ID: ${id}`);

            // Fetch the updated product to return in the response
            const updatedProductData = await products.findOne({ _id: new ObjectId(id) });

            res.status(200).json(updatedProductData);
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Error updating product', error: error.toString() });
        }
    });

    app.delete('/api/product/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await products.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Log activity
            await logActivity('product', `Deleted product ID: ${id}`);

            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ message: 'Error deleting product', error: error.toString() });
        }
    });
};


