module.exports = (client, app, authenticate) => {
    const database = client.db("posinet");

    app.get('/api/activities/recent', authenticate, async (req, res) => {
        try {
            // Fetch recent activities from the 'activities' collection
            const recentActivities = await database.collection('activities')
                .find()
                .sort({ timestamp: -1 })
                .limit(10)
                .toArray();

            res.status(200).json(recentActivities);
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
};
