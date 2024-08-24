
module.exports = (client, app, authenticate, bcrypt, jwt) => {
    const database = client.db("posinet");
    const users = database.collection("admin");

    app.get('/api/admin/dashboard', authenticate, async (req, res) => {
        try {
            const today = new Date();

            // Calculate the start of the week (Monday)
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
            startOfWeek.setHours(0, 0, 0, 0);

            // Calculate the end of the week (Sunday)
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            const productCount = await database.collection('products').countDocuments();
            const userCount = await database.collection('users').countDocuments();

            // Aggregate total sales for the current week
            const totalSales = await database.collection('sales').aggregate([
                {
                    $match: {
                        date: {
                            $gte: startOfWeek,
                            $lte: endOfWeek
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalAmount" } // Assuming `totalAmount` is the field storing the sale amount
                    }
                }
            ]).toArray();

            const pendingOrders = await database.collection('sales').countDocuments({ status: 'Pending' });

            res.status(200).json({
                productCount,
                userCount,
                totalSales: totalSales[0]?.total || 0,
                pendingOrders
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });


    // User Registration Endpoint
    app.post('/api/admin/register', async (req, res) => {
        try {
            const { name, email, password, phone } = req.body;

            if (!name || !email || !password || !phone) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Check if the email already exists
            const existingUser = await users.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = { name, email, password: hashedPassword, phone };
            const result = await users.insertOne(newUser);

            res.status(201).json(result);
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Error registering user', error });
        }
    });

    // Admin Login Endpoint
    app.post('/api/admin/login', async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validate request
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            // Find user by email
            const user = await users.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // Validate password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // Create JWT token with additional user information
            const token = jwt.sign(
                { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
                process.env.JWT_SECRET || 'secretkey',
                { expiresIn: '1h' }
            );

            // Send token, role, and user ID in the response
            res.json({
                token,
                userId: user._id,
                userName: user.name,
                role: user.role || 'admin'
            });
        } catch (error) {
            console.error('Error logging in user:', error);
            res.status(500).json({ message: 'Error logging in user', error });
        }
    });


    //Update Profile Details
    app.put('/api/admin/update-profile', authenticate, async (req, res) => {
        try {
            const { name, email, phone, organization } = req.body;
            const { _id } = req.user;

            // Validate input
            if (!name || !email || !phone || !organization) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Update the admin details
            const result = await users.updateOne(
                { _id: new ObjectId(_id) },
                { $set: { name, email, phone, organization } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ message: 'Profile updated successfully' });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });


    // User Profile Endpoint
    app.get('/api/admin/profile', authenticate, (req, res) => {
        const { _id, name, email, phone } = req.user;
        res.json({ _id, name, email, phone });
    });


    app.post('/api/admin/reset-password', async (req, res) => {
        try {
            const { email, newPassword, nationalId } = req.body;

            if (!email || !newPassword || !nationalId) {
                return res.status(400).json({ message: "Email, National ID and new password are required" });
            }

            // Validate new password strength
            if (newPassword.length < 8) {
                return res.status(400).json({ message: "New password must be at least 8 characters long" });
            }

            // Find the user by email
            const database = client.db("posinet");
            const users = database.collection("admin");
            const user = await users.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Hash the new password
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update the password in the database
            await users.updateOne(
                { email },
                { $set: { password: hashedNewPassword } }
            );

            res.json({ message: "Password reset successfully" });
        } catch (err) {
            console.error("Error resetting password:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    });



}