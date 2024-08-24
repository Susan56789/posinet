const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = function (client, app, authenticate) {
    const router = express.Router();
    const database = client.db("posinet");
    const customers = database.collection("customers");

    // Create a new customer
    router.post('/customers', authenticate, async (req, res) => {
        const { name, phone, email } = req.body;
        try {
            const newCustomer = {
                name,
                phone,
                email,
                amount: 0, // Initial amount is 0
                creditLimit: 0 // Initial credit limit is 0
            };
            const result = await customers.insertOne(newCustomer);
            res.status(201).json({ message: 'Customer added successfully', customerId: result.insertedId });
        } catch (error) {
            res.status(500).json({ message: 'Failed to add customer', error });
        }
    });

    // Get customer details by ID
    router.get('/customers/:id', authenticate, async (req, res) => {
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
    router.put('/customers/:id/credit-limit', authenticate, async (req, res) => {
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
    router.get('/customers', authenticate, async (req, res) => {
        try {
            const allCustomers = await customers.find().toArray();
            res.status(200).json(allCustomers);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching customers', error });
        }
    });

    app.use('/api', router);
};
