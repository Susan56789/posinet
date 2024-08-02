module.exports = (client, app, authenticate) => {
    const database = client.db("posinet");
    const reports = database.collection("reports");

    app.post('/api/reports', authenticate, async (req, res) => {
        try {
            const { title, content } = req.body;

            if (!title || !content) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const newReport = { title, content, createdAt: new Date() };
            const result = await reports.insertOne(newReport);

            res.status(201).json(result);
        } catch (error) {
            console.error('Error creating report:', error);
            res.status(500).json({ message: 'Error creating report', error });
        }
    });

    app.get('/api/reports', authenticate, async (req, res) => {
        try {
            const reportList = await reports.find().toArray();
            res.status(200).json(reportList);
        } catch (error) {
            console.error('Error fetching reports:', error);
            res.status(500).json({ message: 'Error fetching reports', error });
        }
    });

    app.put('/api/reports/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;
            const { title, content } = req.body;

            if (!title || !content) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const updatedReport = { title, content, updatedAt: new Date() };
            const result = await reports.updateOne({ _id: ObjectId(id) }, { $set: updatedReport });

            res.status(200).json(result);
        } catch (error) {
            console.error('Error updating report:', error);
            res.status(500).json({ message: 'Error updating report', error });
        }
    });

    app.delete('/api/reports/:id', authenticate, async (req, res) => {
        try {
            const { id } = req.params;

            const result = await reports.deleteOne({ _id: ObjectId(id) });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error deleting report:', error);
            res.status(500).json({ message: 'Error deleting report', error });
        }
    });
};
