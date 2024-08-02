const jwt = require('jsonwebtoken');

// Authentication Middleware
const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).send('Access denied. No token provided.');

    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
};

// Admin Authorization Middleware
const admin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') return res.status(403).send('Access denied. Admins only.');
    next();
};

module.exports = { auth, admin };
