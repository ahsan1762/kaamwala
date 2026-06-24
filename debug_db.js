const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./backend/models/User');
const WorkerProfile = require('./backend/models/WorkerProfile');

dotenv.config({ path: './backend/.env' });

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}] ID: ${u._id}`));

        const profiles = await WorkerProfile.find({});
        console.log(`\nTotal Worker Profiles: ${profiles.length}`);
        profiles.forEach(p => console.log(`- UserId: ${p.userId} | Status: ${p.verificationStatus}`));

        console.log('\nChecking for mismatched profiles...');
        for (let p of profiles) {
            const user = await User.findById(p.userId);
            if (!user) console.error(`!! Profile ${p._id} points to non-existent user ${p.userId}`);
            else console.log(`OK: Profile linked to ${user.name}`);
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

checkDB();
