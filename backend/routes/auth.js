// src/routes/auth.js
const express = require('express');
const { register, loginUser, loginAdmin } = require('../controllers/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const router = express.Router();

// Middleware to authenticate admin
const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).send('Authentication required');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).send('Admin access required');
        }
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).send('Invalid token');
    }
};

router.post('/register', register);
router.post('/login/user', loginUser);
router.post('/login/admin', loginAdmin);

// Password reset route for users
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.send({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send('Server error');
    }
});

// Admin change password route
router.post('/admin/change-password', authenticateAdmin, async (req, res) => {
    try {
        const { nationalId, newPassword } = req.body;
        const adminId = req.admin.userId;

        // Find the admin by ID
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Check if the provided National ID matches the admin's National ID
        if (admin.nationalId !== nationalId) {
            return res.status(400).json({ message: 'Invalid National ID' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the admin's password
        admin.password = hashedPassword;
        await admin.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;