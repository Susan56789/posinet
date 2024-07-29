// src/routes/sales.js
const express = require('express');
const { getDB } = require('../db');

const router = express.Router();

// Create a new sale
router.post('/sales', async (req, res) => {
    try {
        const db = getDB();
        const result = await db.collection('sales').insertOne(req.body);
        res.status(201).send(result.ops[0]);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all sales
router.get('/sales', async (req, res) => {
    try {
        const db = getDB();
        const sales = await db.collection('sales').find({}).toArray();
        res.status(200).send(sales);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
