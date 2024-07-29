const User = require('../models/User');
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
        const user = new User({ email, password: hashedPassword, ...otherFields });

        // Save the user to the database
        await user.save();

        // Return the newly created user (without the password)
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(201).send(userWithoutPassword);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, 'secret', { expiresIn: '1h' });

        res.status(200).send({ token });
    } catch (error) {
        res.status(400).send(error.message);
    }
};

module.exports = { register, login };
