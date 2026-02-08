const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const resetAdmin = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Define schema minimally to find and delete
        const User = mongoose.model('User', new mongoose.Schema({ email: String }), 'users');

        const res = await User.deleteOne({ email: 'admin@kaamwala.com' });
        console.log(`Deleted admin user: ${res.deletedCount}`);

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

resetAdmin();
