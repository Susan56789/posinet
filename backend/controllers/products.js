// src/controllers/products.js
const Product = require('../models/Product');

const addProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).send(product);
    } catch (error) {
        res.status(400).send(error);
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).send(products);
    } catch (error) {
        res.status(400).send(error);
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.updateOne({ _id: new ObjectId(id) }, req.body);
        res.status(200).send(product);
    } catch (error) {
        res.status(400).send(error);
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Product.deleteOne({ _id: new ObjectId(id) });
        res.status(200).send({ message: 'Product deleted' });
    } catch (error) {
        res.status(400).send(error);
    }
};

module.exports = { addProduct, getProducts, updateProduct, deleteProduct };
