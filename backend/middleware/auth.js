const jwt = require('jsonwebtoken');

// Generate a new token
const generateToken = (user) => {
    const payload = {
        userId: user._id,
        role: user.role
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Authentication Middleware
const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        // If no token, create a new one for an anonymous user
        const anonymousUser = { _id: 'anonymous', role: 'guest' };
        const newToken = generateToken(anonymousUser);

        // Send new token in response header
        res.setHeader('Authorization', `Bearer ${newToken}`);
        req.user = anonymousUser;
        return next();
    }

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
