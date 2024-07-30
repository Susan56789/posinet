// src/routes/auth.js
const express = require('express');
const { register, loginUser, loginAdmin } = require('../controllers/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login/user', loginUser);
router.post('/login/admin', loginAdmin);

module.exports = router;
