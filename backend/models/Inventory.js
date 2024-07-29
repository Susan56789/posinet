// src/models/Inventory.js
const { getDB } = require('../db');

class Inventory {
    static async create(data) {
        const db = getDB();
        const result = await db.collection('inventory').insertOne(data);
        return result.ops[0];
    }

    static async find(query) {
        const db = getDB();
        return await db.collection('inventory').find(query).toArray();
    }

    static async findOne(query) {
        const db = getDB();
        return await db.collection('inventory').findOne(query);
    }

    static async updateOne(filter, update) {
        const db = getDB();
        return await db.collection('inventory').updateOne(filter, { $set: update });
    }

    static async deleteOne(query) {
        const db = getDB();
        return await db.collection('inventory').deleteOne(query);
    }
}

module.exports = Inventory;
