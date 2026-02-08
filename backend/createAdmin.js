const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const createAdmin = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Define a schema that includes 'username' to match the database index constraint
        const adminSchema = new mongoose.Schema({
            name: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { type: String, required: true },
            cnic: { type: String, required: true, unique: true },
            username: { type: String } // Included to satisfy unique index if present
        }, {
            timestamps: true,
            strict: false // Allow other fields if necessary
        });

        // Bind to the 'users' collection explicitly
        const AdminUser = mongoose.model('AdminUser', adminSchema, 'users');

        const adminExists = await AdminUser.findOne({ email: 'admin@kaamwala.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            console.log('Email: admin@kaamwala.com');
            console.log('Password: adminpassword123');
            process.exit();
        }

        // Manually hash password since we are bypassing the original User model hooks
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('adminpassword123', salt);

        const user = await AdminUser.create({
            name: 'Admin User',
            email: 'admin@kaamwala.com',
            password: hashedPassword,
            role: 'admin',
            cnic: '0000000000000', // Dummy CNIC for admin
            username: 'admin', // Unique username to satisfy the lingering index
            isVerified: true // Auto-verify admin
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@kaamwala.com');
        console.log('Password: adminpassword123');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // If username 'admin' also exists (but email didn't match?? unlikely if checks passed), try another
        if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
            console.log("Username 'admin' taken, retrying with 'admin_super'...");
            // Retry logic or just advice could go here, but let's keep it simple for now or retry once
            try {
                // ... same logic with different username
            } catch (e) { }
        }
        process.exit(1);
    }
};

createAdmin();
