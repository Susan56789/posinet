// src/models/Sales.js
const { getDB } = require('../db');

class Sales {
    static async create(data) {
        const db = getDB();
        const result = await db.collection('sales').insertOne(data);
        return result.ops[0];
    }

    static async find(query) {
        const db = getDB();
        return await db.collection('sales').find(query).toArray();
    }

    static async findOne(query) {
        const db = getDB();
        return await db.collection('sales').findOne(query);
    }
}

module.exports = Sales;
