// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) return res.status(401).send('Access denied');
    try {
        const decoded = jwt.verify(token, 'secret');
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token');
    }
};

const admin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access denied');
    next();
};

module.exports = { auth, admin };
