const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');

// Register function for users
const register = async (req, res) => {
    try {
        const { email, password, ...otherFields } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password before saving the user
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the hashed password
        const user = await User.create({ email, password: hashedPassword, ...otherFields });

        // Return the newly created user (without the password)
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(400).json({ message: error.message });
    }
};

// Login function for users
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check in User collection
        const user = await User.findOne({ email });

        // If user not found
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = generateToken({ _id: user._id, role: 'user' });

        // Prepare the response object
        const response = {
            token,
            user: {
                id: user._id,
                email: user.email,
                role: 'user',
                name: user.name // Ensure name field is present
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(400).json({ message: error.message });
    }
};

// Login function for admins
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check in Admin collection
        const admin = await Admin.findOne({ email });

        // If admin not found
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = generateToken({ _id: admin._id, role: 'admin' });

        // Prepare the response object
        const response = {
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                role: 'admin',
                name: admin.name // Ensure name field is present
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = { register, loginUser, loginAdmin };
