// src/controllers/auth.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).send('User not found');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid credentials');
        const token = jwt.sign({ userId: user._id, role: user.role }, 'secret', { expiresIn: '1h' });
        res.status(200).send({ token });
    } catch (error) {
        res.status(400).send(error);
    }
};

module.exports = { register, login };
