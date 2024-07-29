// src/controllers/inventory.js
const Inventory = require('../models/Inventory');

const addInventory = async (req, res) => {
    try {
        const inventory = await Inventory.create(req.body);
        res.status(201).send(inventory);
    } catch (error) {
        res.status(400).send(error);
    }
};

const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find({});
        res.status(200).send(inventory);
    } catch (error) {
        res.status(400).send(error);
    }
};

const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const inventory = await Inventory.updateOne({ _id: new ObjectId(id) }, req.body);
        res.status(200).send(inventory);
    } catch (error) {
        res.status(400).send(error);
    }
};

const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        await Inventory.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send({ message: 'Inventory deleted' });
    } catch (error) {
        res.status(400).send(error);
    }
};

module.exports = { addInventory, getInventory, updateInventory, deleteInventory };
