const User = require('../models/User');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).send(userWithoutPassword);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt:', email);

        let user = null;
        let isAdmin = false;

        // Check in User collection
        user = await User.findOne({ email });
        console.log('User found in User collection:', user);

        // If not found in User collection, check in Admin collection
        if (!user) {
            user = await Admin.findOne({ email });
            console.log('User found in Admin collection:', user);
            if (user) {
                isAdmin = true;
            }
        }

        // If user not found in either collection
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        // Generate a JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                role: isAdmin ? 'admin' : 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Prepare the response object
        const response = {
            token,
            user: {
                id: user._id,
                email: user.email,
                role: isAdmin ? 'admin' : 'user',
                // Add any other user fields you want to include
            }
        };

        console.log('Login successful:', response);

        res.status(200).send(response);
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(400).send(error.message);
    }
};


module.exports = { register, login };
