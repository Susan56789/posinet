// src/models/User.js
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const bcrypt = require('bcryptjs');

class Admin {
    static async create(data) {
        const db = getDB();
        data.password = await bcrypt.hash(data.password, 10);
        const result = await db.collection('admin').insertOne(data);
        return result.ops[0];
    }

    static async findOne(query) {
        const db = getDB();
        return await db.collection('admin').findOne(query);
    }

    static async updateOne(filter, update) {
        const db = getDB();
        return await db.collection('admin').updateOne(filter, { $set: update });
    }
}

module.exports = Admin;
