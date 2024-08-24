module.exports = (client, app, authenticate) => {
    const database = client.db("posinet");

    app.get('/api/activities/recent', authenticate, async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 5;
            const recentActivities = await activities.find()
                .sort({ timestamp: -1 })
                .limit(limit)
                .toArray();

            res.status(200).json(recentActivities);
        } catch (error) {
            console.error('Error fetching recent activities:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    app.get('/api/activities', authenticate, async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            // Optional: date range filter
            const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
            const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

            // Optional: activity type filter
            const type = req.query.type;

            // Build the query
            let query = {};
            if (startDate && endDate) {
                query.timestamp = { $gte: startDate, $lte: endDate };
            }
            if (type) {
                query.type = type;
            }

            const totalActivities = await activities.countDocuments(query);
            const totalPages = Math.ceil(totalActivities / limit);

            const allActivities = await activities.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            res.status(200).json({
                activities: allActivities,
                currentPage: page,
                totalPages: totalPages,
                totalActivities: totalActivities
            });
        } catch (error) {
            console.error('Error fetching activities:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    // Endpoint to log a new activity
    app.post('/api/activities', authenticate, async (req, res) => {
        try {
            const { type, description } = req.body;
            const newActivity = {
                type,
                description,
                timestamp: new Date(),
                userId: req.user._id // Assuming the authenticate middleware adds user info to req
            };

            const result = await activities.insertOne(newActivity);

            res.status(201).json({
                message: 'Activity logged successfully',
                activityId: result.insertedId
            });
        } catch (error) {
            console.error('Error logging activity:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    // Endpoint to delete an activity (optional, use with caution)
    app.delete('/api/activities/:id', authenticate, async (req, res) => {
        try {
            const result = await activities.deleteOne({ _id: new ObjectId(req.params.id) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Activity not found' });
            }

            res.status(200).json({ message: 'Activity deleted successfully' });
        } catch (error) {
            console.error('Error deleting activity:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });


};

