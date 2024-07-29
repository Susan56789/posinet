// src/controllers/sales.js
const Sales = require('../models/Sales');
const Inventory = require('../models/Inventory');

const addSale = async (req, res) => {
    try {
        const sale = await Sales.create(req.body);
        const product = await Inventory.findOne({ _id: new ObjectId(req.body.productId) });
        if (product.quantity < req.body.quantity) {
            return res.status(400).send('Not enough stock');
        }
        await Inventory.updateOne({ _id: new ObjectId(req.body.productId) }, { quantity: product.quantity - req.body.quantity });
        res.status(201).send(sale);
    } catch (error) {
        res.status(400).send(error);
    }
};

module.exports = { addSale };
