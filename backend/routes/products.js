const { ObjectId } = require('mongodb');
const multer = require('multer');
const stream = require('stream');

module.exports = function (client, app, authenticate) {

    const database = client.db("posinet");
    const products = database.collection("products");

    // Multer setup to handle file uploads in memory
    const upload = multer({
        storage: multer.memoryStorage(), // Keep files in memory temporarily
    });

    // Log activity for product operations
    const logActivity = async (type, description) => {
        try {
            const activity = {
                type,
                description,
                timestamp: new Date()
            };
            await database.collection('activities').insertOne(activity);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    };

    // Create product route
    app.post('/api/products', authenticate, upload.array('images', 10), async (req, res) => {
        try {
            const { title, description, price, stock, category, discountedPrice } = req.body;

            if (!title || !description || !price || !stock) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            const images = req.files.map(file => ({
                data: file.buffer.toString('base64'),
                contentType: file.mimetype
            }));

            const newProduct = {
                title,
                description,
                category,
                price: parseFloat(price),
                discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
                stock: parseInt(stock, 10),
                images, // Store images directly in the product document
                createdAt: new Date()
            };

            const result = await products.insertOne(newProduct);

            if (result.insertedId) {
                res.status(201).json({
                    message: 'Product created successfully',
                    product: { ...newProduct, _id: result.insertedId }
                });
            } else {
                res.status(500).json({ message: 'Failed to create product' });
            }
        } catch (err) {
            console.error('Error creating product:', err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
    });

    // Get all products
    app.get('/api/products', async (req, res) => {
        try {
            const productList = await products.find().toArray();
            res.status(200).json(productList);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ message: 'Error fetching products', error });
        }
    });
    // Get product by ID
    app.get('/api/product/:id', async (req, res) => {
        try {
            const productId = req.params.id;

            // Ensure the id is a valid ObjectId
            if (!ObjectId.isValid(productId)) {
                return res.status(400).json({ message: 'Invalid product ID' });
            }

            const product = await products.findOne({ _id: new ObjectId(productId) });

            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.status(200).json(product);
        } catch (error) {
            console.error('Error fetching product by ID:', error);
            res.status(500).json({ message: 'Error fetching product', error: error.message });
        }
    });
    // Update product route
    app.put('/api/product/:id', authenticate, upload.array('images', 5), async (req, res) => {
        try {
            const { id } = req.params;
            const { title, category, description, price, stock, discountedPrice } = req.body;

            const productData = {
                title,
                category,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null
            };

            if (!productData.title || !productData.description || isNaN(productData.price) || isNaN(productData.stock)) {
                return res.status(400).json({ message: 'Invalid product data' });
            }

            // Process new images if any
            if (req.files && req.files.length > 0) {
                productData.images = req.files.map(file => ({
                    data: file.buffer.toString('base64'),
                    contentType: file.mimetype
                }));
            }

            const result = await products.updateOne(
                { _id: new ObjectId(id) },
                { $set: productData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            await logActivity('product', `Updated product ID: ${id}`);

            const updatedProductData = await products.findOne({ _id: new ObjectId(id) });
            res.status(200).json(updatedProductData);
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Error updating product', error: error.message });
        }
    });

    // Delete product route
    app.delete('/api/product/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await products.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            await logActivity('product', `Deleted product ID: ${id}`);

            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ message: 'Error deleting product', error: error.toString() });
        }
    });

    // Get the latest products
    app.get('/api/products/latest', async (req, res) => {
        try {
            const latestProducts = await products.find().sort({ createdAt: -1 }).limit(10).toArray();
            const processedProducts = latestProducts.map(product => ({
                ...product,
                salePrice: product.discountedPrice && product.discountedPrice > 0 ? product.discountedPrice : product.price
            }));
            res.status(200).json(processedProducts);
        } catch (error) {
            console.error('Error fetching latest products:', error);
            res.status(500).json({ message: 'Error fetching latest products', error: error.toString() });
        }
    });

    // Search for products by title or description
    app.get('/api/products/search', authenticate, async (req, res) => {
        try {
            const query = req.query.q;
            const regex = new RegExp(query, 'i');
            const searchedProducts = await products.find({
                $or: [
                    { title: regex },
                    { description: regex }
                ]
            }).toArray();
            res.status(200).json(searchedProducts);
        } catch (error) {
            console.error('Error searching for products:', error);
            res.status(500).json({ message: 'Error searching for products', error });
        }
    });
};
