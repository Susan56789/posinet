// src/models/Product.js
const { getDB } = require('../db');

class Product {
    static async create(data) {
        const db = getDB();
        const result = await db.collection('products').insertOne(data);
        return result.ops[0];
    }

    static async find(query) {
        const db = getDB();
        return await db.collection('products').find(query).toArray();
    }

    static async findOne(query) {
        const db = getDB();
        return await db.collection('products').findOne(query);
    }

    static async updateOne(filter, update) {
        const db = getDB();
        return await db.collection('products').updateOne(filter, { $set: update });
    }

    static async deleteOne(query) {
        const db = getDB();
        return await db.collection('products').deleteOne(query);
    }
}

module.exports = Product;
