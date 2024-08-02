const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const bcrypt = require('bcryptjs');

class User {
    /**
     * Create a new user
     * @param {Object} data - User data
     * @returns {Object} - Created user
     */
    static async create(data) {
        try {
            const db = getDB();
            // Hash the user's password before saving
            data.password = await bcrypt.hash(data.password, 10);
            const result = await db.collection('users').insertOne(data);
            return result.ops[0]; // Return the created user object
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('User creation failed');
        }
    }

    /**
     * Find a user by query
     * @param {Object} query - Query to find user
     * @returns {Object|null} - Found user or null if not found
     */
    static async findOne(query) {
        try {
            const db = getDB();
            return await db.collection('users').findOne(query);
        } catch (error) {
            console.error('Error finding user:', error);
            throw new Error('User retrieval failed');
        }
    }

    /**
     * Update a user's data
     * @param {Object} filter - Filter to find the user
     * @param {Object} update - Data to update
     * @returns {Object} - Result of the update operation
     */
    static async updateOne(filter, update) {
        try {
            const db = getDB();
            return await db.collection('users').updateOne(filter, { $set: update });
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('User update failed');
        }
    }
}

module.exports = User;
