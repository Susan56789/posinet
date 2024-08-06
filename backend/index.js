require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require("mongodb");


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5050;

// MongoDB URI
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Middleware setup
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Set up multer for handling file uploads



// Authentication Middleware
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(400).json({ message: 'Invalid token' });
            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Connect to the database and initialize collections
const run = async () => {
    try {
        await client.connect();
        console.log("Connected to the database");

        const database = client.db("posinet");
        const products = database.collection("products");
        const users = database.collection("users");

        console.log("Collections initialized");

        // Ensure text index on 'cars' collection
        await createTextIndex(products);

        // Import and initialize routes
        require('./routes/admin')(client, app, authenticate, bcrypt, jwt);
        require('./routes/user')(client, app, authenticate, bcrypt, jwt);
        require('./routes/products')(client, app, authenticate);
        require('./routes/sales')(client, app, authenticate);
        require('./routes/reports')(client, app, authenticate);
        require('./routes/activties')(client, app, authenticate);

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (err) {
        console.error("Error connecting to the database:", err);
    }
};

const createTextIndex = async (collection) => {
    const indexes = await collection.indexes();
    const hasTextIndex = indexes.some(index => index.key && index.key._fts === "text");

    if (!hasTextIndex) {
        await collection.createIndex({ title: "text", description: "text" });
        console.log("Text index created on 'title' and 'description' fields.");
    } else {
        console.log("Text index already exists on 'title' and 'description' fields.");
    }
};

run().catch(console.dir);

// Close MongoDB connection on server shutdown
process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});