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
    const activities = database.collection("activities");

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
            console.log('Received request body:', req.body);
            console.log('Received files:', req.files);

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

            const images = [];
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const filename = Date.now() + '_' + file.originalname;
                    const processedImagePath = path.join('uploads', filename);

                    await sharp(file.buffer)
                        .resize(300, 300)
                        .toFile(processedImagePath);

                    images.push({ filename: filename });
                }
            }

            const newProduct = {
                ...productData,
                images,
                createdAt: new Date()
            };

            const result = await products.insertOne(newProduct);

            // Log activity
            await logActivity('product', `Created product: ${productData.title}`);

            res.status(201).json({ ...newProduct, _id: result.insertedId });
        } catch (error) {
            console.error('Error creating product:', error);
            console.error('Error details:', error.stack);
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

            // Log activity
            await logActivity('product', `Updated product ID: ${id}`);

            res.status(200).json(result);
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Error updating product', error });
        }
    });

    app.delete('/api/products/:id', authenticate, async (req, res) => {
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


