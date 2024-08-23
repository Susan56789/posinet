const express = require('express');
const Joi = require('joi');
const sharp = require('sharp');
const multer = require('multer');
const path = require('path');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const GridFSBucket = require('mongodb').GridFSBucket;
const helmet = require('helmet');

const app = express();

// Use helmet for basic security best practices
app.use(helmet({
    crossOriginEmbedderPolicy: false,
}));

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Set up multer storage to save files on disk
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
    stock: Joi.number().required(),
    images: Joi.array().items(Joi.object({
        filename: Joi.string().required(),
        url: Joi.string().required()
    }))
});

const createImageURL = (filename) => `/api/images/${filename}`;


module.exports = (client, app, authenticate) => {
    const database = client.db("posinet");
    const products = database.collection("products");
    const activities = database.collection("activities");

    const bucket = new GridFSBucket(database, {
        bucketName: 'images'
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

    app.post('/api/products', authenticate, upload.array('images', 5), async (req, res) => {
        try {
            // Process images first
            const images = [];
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const filename = `${Date.now()}_${file.originalname}`;
                    const filePath = path.join('uploads', filename);

                    await sharp(file.path)
                        .resize(300, 300)
                        .toFile(filePath);

                    fs.unlinkSync(file.path); // Remove the original file

                    images.push({ filename, url: createImageURL(filename) });
                }
            }

            // Prepare product data including images
            const productData = {
                title: req.body.title,
                description: req.body.description,
                price: parseFloat(req.body.price),
                stock: parseInt(req.body.stock),
                images: images
            };

            // Validate product data
            const { error } = productSchema.validate(productData);
            if (error) {
                return res.status(400).json({ message: "Invalid data", error: error.details[0].message });
            }

            // Create new product object
            const newProduct = {
                ...productData,
                createdAt: new Date()
            };

            // Insert product into database
            const result = await products.insertOne(newProduct);

            // Log activity
            await logActivity('product', `Created product: ${productData.title}`);

            // Send response
            res.status(201).json({ ...newProduct, _id: result.insertedId });
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ message: "Error creating product", error: error.message });
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
            if (req.files && req.files.length > 0) {
                const newImages = [];
                for (const file of req.files) {
                    const filename = Date.now() + '_' + file.originalname;
                    const processedImagePath = path.join('uploads', filename);

                    await sharp(file.path)
                        .resize(300, 300)
                        .toFile(processedImagePath);

                    newImages.push({ filename: filename });
                    fs.unlinkSync(file.path); // Remove the original file
                }

                // Append new images to existing ones
                updatedProduct.images = newImages;
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


