const { ObjectId } = require('mongodb');

module.exports = (client, app, authenticate) => {
    const database = client.db("posinet");
    const repairs = database.collection("repairs");

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

    // Add new repair item
    app.post('/api/repairs', authenticate, async (req, res) => {
        try {
            const newItem = {
                name: req.body.name,
                dateCreated: new Date(),
                dateClosed: null,
                status: 'OPEN'
            };
            const result = await repairs.insertOne(newItem);
            res.status(201).json(result.ops[0]);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

    // Update repair item
    app.put('/api/repairs/:id', authenticate, async (req, res) => {
        try {
            const id = req.params.id;
            const updateData = {
                name: req.body.name,
                status: req.body.status,
                dateClosed: req.body.status === 'CLOSED' ? new Date() : null
            };
            const result = await repairs.findOneAndUpdate(
                { _id: ObjectId(id) },
                { $set: updateData },
                { returnOriginal: false }
            );
            res.json(result.value);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });
};

