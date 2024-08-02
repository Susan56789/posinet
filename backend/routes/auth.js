const express = require('express');
const { auth, admin } = require('../middleware/auth');
const { register, loginUser, loginAdmin } = require('../controllers/auth');
const router = express.Router();

// User and Admin Registration/Login Routes
router.post('/register', register);
router.post('/login/user', loginUser);
router.post('/login/admin', loginAdmin);

// Password reset route for users
router.post('/reset-password', auth, async (req, res) => {
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
router.post('/admin/change-password', auth, admin, async (req, res) => {
    try {
        const { nationalId, newPassword } = req.body;
        const adminId = req.user.userId;

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
