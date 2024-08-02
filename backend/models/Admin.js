const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const bcrypt = require('bcryptjs');

class Admin {
    /**
     * Create a new admin
     * @param {Object} data - Admin data
     * @returns {Object} - Created admin
     */
    static async create(data) {
        try {
            const db = getDB();
            // Hash the admin's password before saving
            data.password = await bcrypt.hash(data.password, 10);
            const result = await db.collection('admin').insertOne(data);
            return result.ops[0]; // Return the created admin object
        } catch (error) {
            console.error('Error creating admin:', error);
            throw new Error('Admin creation failed');
        }
    }

    /**
     * Find an admin by query
     * @param {Object} query - Query to find admin
     * @returns {Object|null} - Found admin or null if not found
     */
    static async findOne(query) {
        try {
            const db = getDB();
            return await db.collection('admin').findOne(query);
        } catch (error) {
            console.error('Error finding admin:', error);
            throw new Error('Admin retrieval failed');
        }
    }

    /**
     * Update an admin's data
     * @param {Object} filter - Filter to find the admin
     * @param {Object} update - Data to update
     * @returns {Object} - Result of the update operation
     */
    static async updateOne(filter, update) {
        try {
            const db = getDB();
            return await db.collection('admin').updateOne(filter, { $set: update });
        } catch (error) {
            console.error('Error updating admin:', error);
            throw new Error('Admin update failed');
        }
    }
}

module.exports = Admin;
