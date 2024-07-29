const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectDB } = require('./db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
// Import other routes
const { auth, admin } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use(authRoutes);
app.use(auth);
app.use(productRoutes);
app.use(inventoryRoutes);
// Use other routes

app.get('/', (req, res) => {
    res.send('Welcome to PosiNet Backend');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
});
