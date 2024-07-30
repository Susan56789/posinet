const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register function for users
const register = async (req, res) => {
    try {
        const { email, password, ...otherFields } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Hash the password before saving the user
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the hashed password
        const user = await User.create({ email, password: hashedPassword, ...otherFields });

        // Return the newly created user (without the password)
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(201).send(userWithoutPassword);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Login function for users
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('User login attempt for email:', email);

        // Check in User collection
        const user = await User.findOne({ email });
        console.log('User found in User collection:', user);

        // If user not found
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user._id, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

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

        res.status(200).send(response);
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(400).send(error.message);
    }
};

// Login function for admins
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Admin login attempt for email:', email);

        // Check in Admin collection
        const admin = await Admin.findOne({ email });
        console.log('Admin found in Admin collection:', admin);

        // If admin not found
        if (!admin) {
            return res.status(404).send('Admin not found');
        }

        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

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

        res.status(200).send(response);
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(400).send(error.message);
    }
};

module.exports = { register, loginUser, loginAdmin };
