
module.exports = (client, app, authenticate, bcrypt, jwt) => {
    const database = client.db("posinet");
    const users = database.collection("users");

    // User Registration Endpoint
    app.post('/api/users/register', async (req, res) => {
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

    // User Login Endpoint
    app.post('/api/users/login', async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const user = await users.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { _id: user._id, name: user.name, email: user.email, phone: user.phone },
                process.env.JWT_SECRET || 'secretkey',
                { expiresIn: '1h' }
            );

            res.json({ token });
        } catch (error) {
            console.error('Error logging in user:', error);
            res.status(500).json({ message: 'Error logging in user', error });
        }
    });

    // User Profile Endpoint
    app.get('/api/users/profile', authenticate, (req, res) => {
        const { _id, name, email, phone } = req.user;
        res.json({ _id, name, email, phone });
    });


    app.post('/api/user/reset-password', async (req, res) => {
        try {
            const { email, newPassword } = req.body;

            if (!email || !newPassword) {
                return res.status(400).json({ message: "Email and new password are required" });
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
    })

}