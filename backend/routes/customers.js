const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = function (client, app, authenticate) {

    const database = client.db("posinet");
    const customers = database.collection("customers");

    const logActivity = async (type, description) => {
        try {
            const activity = {
                type,
                description,
                timestamp: new Date()
            };
            await activities.insertOne(activity);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    };

    // Create a new customer
    app.post('/api/customers', authenticate, async (req, res) => {
        try {
            const { name, phone, email, lastPurchaseDate, totalPurchases } = req.body;

            // Check if customer exists
            let customer = await customers.findOne({ $or: [{ email }, { phone }] });

            if (customer) {
                // Update existing customer
                await customers.updateOne(
                    { _id: customer._id },
                    {
                        $set: { name, phone, email, lastPurchaseDate },
                        $inc: { totalPurchases: totalPurchases }
                    }
                );
            } else {
                // Create new customer
                await customers.insertOne({
                    name,
                    phone,
                    email,
                    lastPurchaseDate,
                    totalPurchases
                });
            }

            res.status(200).json({ message: 'Customer data updated successfully' });
        } catch (error) {
            console.error('Error updating customer data:', error);
            res.status(500).json({ message: 'Error updating customer data', error: error.message });
        }
    });
    // Get customer details by ID
    app.get('/api/customers/:id', authenticate, async (req, res) => {
        const { id } = req.params;
        try {
            const customer = await customers.findOne({ _id: new ObjectId(id) });
            if (customer) {
                res.status(200).json(customer);
            } else {
                res.status(404).json({ message: 'Customer not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error fetching customer details', error });
        }
    });

    // Update the credit limit for a customer (Admin only)
    app.put('/api/customers/:id/credit-limit', authenticate, async (req, res) => {
        const { id } = req.params;
        const { creditLimit } = req.body;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        try {
            const result = await customers.updateOne(
                { _id: new ObjectId(id) },
                { $set: { creditLimit: creditLimit } }
            );
            if (result.matchedCount > 0) {
                res.status(200).json({ message: 'Credit limit updated successfully' });
            } else {
                res.status(404).json({ message: 'Customer not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating credit limit', error });
        }
    });

    // Get all customers
    app.get('/api/customers', authenticate, async (req, res) => {
        try {
            const allCustomers = await customers.find().toArray();
            res.status(200).json(allCustomers);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching customers', error });
        }
    });


};
