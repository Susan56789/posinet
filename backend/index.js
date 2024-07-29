const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const { connectDB } = require('./db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const { auth, admin } = require('./middleware/auth');

// Function to generate a random string
function generateSecretKey() {
    return crypto.randomBytes(64).toString('hex');
}

// Set JWT_SECRET if not already set
process.env.JWT_SECRET = generateSecretKey();


const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Public Routes
app.use(authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to PosiNet Backend');
});

// Protected Routes
app.use(auth);
app.use(productRoutes);
app.use(inventoryRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
});
