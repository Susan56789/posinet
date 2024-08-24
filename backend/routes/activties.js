module.exports = (client, app, authenticate) => {
    const database = client.db("posinet");

    app.get('/api/activities/recent', authenticate, async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const recentActivities = await database.collection('activities')
                .find()
                .sort({ date: -1 })
                .limit(limit)
                .toArray();

            res.status(200).json(recentActivities);
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

};

