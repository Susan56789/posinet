// src/routes/inventory.js
const express = require('express');
const { addInventory, getInventory, updateInventory, deleteInventory } = require('../controllers/inventory');
const router = express.Router();

router.post('/inventory', addInventory);
router.get('/inventory', getInventory);
router.put('/inventory/:id', updateInventory);
router.delete('/inventory/:id', deleteInventory);

module.exports = router;
