// backend/createAdmin.js
require('dotenv').config();
const { connectDB } = require('./db');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

const createAdmin = async (email, password, otherFields) => {
    try {
        // Establish database connection
        await connectDB();

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Hash the password before saving the admin
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin with the hashed password and other fields
        const adminData = { email, password: hashedPassword, ...otherFields };
        const newAdmin = await Admin.create(adminData);

        console.log('Admin user created successfully:', newAdmin);
    } catch (error) {
        console.error('Error creating admin user:', error.message);
    }
};

// Usage example
const email = 'admin@gmail.com';
const password = 'Admin123.';
const otherFields = { name: 'John Doe', organization: 'Quirkweb Studios', location: 'Nairobi' };

createAdmin(email, password, otherFields);
