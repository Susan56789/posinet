const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const User = require('../models/User');
const Admin = require('../models/Admin');

// MongoDB client setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Generate a new token
const generateToken = (user) => {
    const payload = {
        userId: user._id,
        role: user.role
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Authentication Middleware
const auth = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const database = client.db('posinet');
        const users = database.collection('users');
        const admins = database.collection('admin');
        const user = await users.findOne({ _id: new ObjectId(decoded._id) });
        const admin = await admins.findOne({ _id: new ObjectId(decoded._id) });

        if (!user) return res.status(400).json({ message: 'Invalid token.' });
        if (!admin) return res.status(400).json({ message: 'Invalid token.' });

        req.user = user;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// Admin Authorization Middleware
const admin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied. Admins only.' });
    next();
};

module.exports = { auth, admin, generateToken };
