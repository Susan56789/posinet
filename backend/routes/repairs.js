const express = require('express');
const { ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

module.exports = (client, app, authenticate) => {
    const database = client.db("posinet");
    const repairs = database.collection("repairs");
    const customers = database.collection("customers");
    const sales = database.collection("sales");

    // Get all repair items
    app.get('/api/repairs', authenticate, async (req, res) => {
        try {
            const query = req.query.search
                ? { name: { $regex: req.query.search, $options: 'i' } }
                : {};
            const items = await repairs.find(query).toArray();
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.post('/api/repairs', authenticate, async (req, res) => {
        const session = await client.startSession();
        session.startTransaction();

        try {
            const { name, customerDetails, estimatedAmount } = req.body;

            if (!name || !customerDetails || !estimatedAmount) {
                throw new Error('Name, customer details, and estimated amount are required');
            }

            // Create or update customer
            const { name: customerName, phone, email } = customerDetails;
            let customer = await customers.findOne({ $or: [{ email }, { phone }] }, { session });

            if (customer) {
                await customers.updateOne(
                    { _id: customer._id },
                    { $set: { name: customerName, phone, email } },
                    { session }
                );
            } else {
                const customerResult = await customers.insertOne({
                    name: customerName,
                    phone,
                    email,
                    totalPurchases: 0,
                    creditLimit: 0 // Default credit limit
                }, { session });
                customer = { _id: customerResult.insertedId };
            }

            const newItem = {
                name,
                customerId: customer._id,
                dateCreated: new Date(),
                dateClosed: null,
                status: 'OPEN',
                estimatedAmount: parseFloat(estimatedAmount)
            };

            const result = await repairs.insertOne(newItem, { session });

            await session.commitTransaction();

            // Combine the newItem with the generated _id
            const responseItem = result.insertedId ? { ...newItem, _id: result.insertedId } : newItem;

            res.status(201).json(responseItem);
        } catch (error) {
            await session.abortTransaction();
            console.error('Error adding repair item:', error);
            res.status(400).json({ message: error.message || 'Error adding repair item' });
        } finally {
            await session.endSession();
        }
    });


    // Update repair item
    app.put('/api/repairs/:id', authenticate, async (req, res) => {
        try {
            const id = req.params.id;
            const { name, status, actualAmount } = req.body;

            const updateData = {
                name,
                status,
                dateClosed: status === 'CLOSED' ? new Date() : null
            };

            if (status === 'CLOSED' && actualAmount) {
                updateData.actualAmount = parseFloat(actualAmount);

                // Create a sale for the closed repair
                const repair = await repairs.findOne({ _id: new ObjectId(id) });

                if (!repair) {
                    return res.status(404).json({ message: 'Repair not found' });
                }

                const customer = await customers.findOne({ _id: repair.customerId });

                // ... rest of your logic ...
            }

            const result = await repairs.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateData },
                { returnDocument: 'after' }
            );

            if (!result.value) {
                return res.status(404).json({ message: 'Repair not found' });
            }

            res.json(result.value);
        } catch (error) {
            console.error('Error updating repair:', error);
            res.status(500).json({ message: 'Error updating repair', error: error.message });
        }
    });
};