const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

module.exports = (client, app, authenticate) => {
    const database = client.db("posinet");
    const users = database.collection("users");

    const logActivity = async (type, description) => {
        try {
            const activity = {
                type,
                description,
                timestamp: new Date()
            };
            await activities.insertOne(activity);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    };

    // User Registration Endpoint
    app.post('/api/users/register', async (req, res) => {
        try {
            const { name, email, password, phone } = req.body;
            const role = "user";

            if (!name || !email || !password || !phone) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Check if the email already exists
            const existingUser = await users.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = { name, email, password: hashedPassword, phone, role };
            const result = await users.insertOne(newUser);


            await logActivity('user', `added user: ${newUser.name}`);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Error registering user', error });
        }
    });

    // User Login Endpoint
    app.post('/api/users/login', async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const user = await users.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
                process.env.JWT_SECRET || 'secretkey',
                { expiresIn: '1h' }
            );

            res.json({ token });
        } catch (error) {
            console.error('Error logging in user:', error);
            res.status(500).json({ message: 'Error logging in user', error });
        }
    });

    // Fetch All Users Endpoint
    app.get('/api/users', authenticate, async (req, res) => {
        try {
            const usersList = await users.find().toArray();
            res.json(usersList);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Error fetching users', error });
        }
    });

    // Update User Endpoint
    app.put('/api/users/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, role, phone } = req.body;

            if (!name || !email || !role || !phone) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const updatedUser = { name, email, role, phone };
            await users.updateOne({ _id: new ObjectId(id) }, { $set: updatedUser });

            // Log activity
            await logActivity('product', `Deleted user ID: ${id}`);

            res.json({ message: 'User updated successfully' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Error updating user', error });
        }
    });

    // Delete User Endpoint
    app.delete('/api/users/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;
            await users.deleteOne({ _id: new ObjectId(id) });

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Error deleting user', error });
        }
    });

    // User Profile Endpoint
    app.get('/api/users/profile', authenticate, (req, res) => {
        const { _id, name, email, phone, role } = req.user;
        res.json({ _id, name, email, phone, role });
    });

    // Password Reset Endpoint
    app.post('/api/users/reset-password', async (req, res) => {
        try {
            const { email, newPassword } = req.body;

            if (!email || !newPassword) {
                return res.status(400).json({ message: "Email and new password are required" });
            }

            // Validate new password strength
            if (newPassword.length < 8) {
                return res.status(400).json({ message: "New password must be at least 8 characters long" });
            }

            // Find the user by email
            const user = await users.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Hash the new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 12);

            // Update the password in the database
            await users.updateOne(
                { email },
                { $set: { password: hashedNewPassword } }
            );

            res.json({ message: "Password reset successfully" });
        } catch (error) {
            console.error("Error resetting password:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}
