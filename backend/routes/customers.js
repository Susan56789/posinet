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
            // Log activity
            await logActivity('customer', `New Customer: ${name}`);

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
                // Log activity
                await logActivity('sales', `Updated Sale: ${id}`);
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


    // Update customer details
    app.put('/api/customers/:id', authenticate, async (req, res) => {
        const { id } = req.params;
        const { name, phone, email, lastPurchaseDate, totalPurchases } = req.body;

        try {
            const result = await customers.updateOne(
                { _id: new ObjectId(id) },
                { $set: { name, phone, email, lastPurchaseDate, totalPurchases } }
            );

            if (result.matchedCount > 0) {
                await logActivity('customer_update', `Customer ${id} updated`);
                res.status(200).json({ message: 'Customer updated successfully' });
            } else {
                res.status(404).json({ message: 'Customer not found' });
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            res.status(500).json({ message: 'Error updating customer', error: error.message });
        }
    });

    // Delete a customer
    app.delete('/api/customers/:id', authenticate, async (req, res) => {
        const { id } = req.params;

        try {
            const result = await customers.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount > 0) {
                await logActivity('customer_delete', `Customer ${id} deleted`);
                res.status(200).json({ message: 'Customer deleted successfully' });
            } else {
                res.status(404).json({ message: 'Customer not found' });
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            res.status(500).json({ message: 'Error deleting customer', error: error.message });
        }
    });

    // Search customers
    app.get('/api/customers/search', authenticate, async (req, res) => {
        const { query } = req.query;

        try {
            const searchResults = await customers.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } },
                    { phone: { $regex: query, $options: 'i' } }
                ]
            }).toArray();

            res.status(200).json(searchResults);
        } catch (error) {
            console.error('Error searching customers:', error);
            res.status(500).json({ message: 'Error searching customers', error: error.message });
        }
    });

    // Get customer purchase history
    app.get('/api/customers/:id/purchases', authenticate, async (req, res) => {
        const { id } = req.params;

        try {
            const purchases = await database.collection("sales").find({
                customerId: new ObjectId(id)
            }).toArray();

            res.status(200).json(purchases);
        } catch (error) {
            console.error('Error fetching customer purchases:', error);
            res.status(500).json({ message: 'Error fetching customer purchases', error: error.message });
        }
    });

    // Get top customers
    app.get('/api/customers/top', authenticate, async (req, res) => {
        const { limit = 10 } = req.query;

        try {
            const topCustomers = await customers.find()
                .sort({ totalPurchases: -1 })
                .limit(parseInt(limit))
                .toArray();

            res.status(200).json(topCustomers);
        } catch (error) {
            console.error('Error fetching top customers:', error);
            res.status(500).json({ message: 'Error fetching top customers', error: error.message });
        }
    });


};
