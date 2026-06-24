const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const WorkerProfile = require('./models/WorkerProfile');

dotenv.config();

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const profiles = await WorkerProfile.find({});
        console.log(`\nTotal Worker Profiles: ${profiles.length}`);

        let orphanedCount = 0;
        const orphanedIds = [];

        console.log('\nChecking for orphaned profiles...');
        for (let p of profiles) {
            const user = await User.findById(p.userId);
            if (!user) {
                console.log(`✗ ORPHANED: Profile ${p._id} points to non-existent user ${p.userId}`);
                orphanedIds.push(p._id);
                orphanedCount++;
            } else {
                console.log(`✓ OK: Profile ${p._id} linked to ${user.name}`);
            }
        }

        if (orphanedCount > 0) {
            console.log(`\n⚠️  Found ${orphanedCount} orphaned profiles. Deleting...`);
            const result = await WorkerProfile.deleteMany({ _id: { $in: orphanedIds } });
            console.log(`✓ Deleted ${result.deletedCount} orphaned profiles`);
        } else {
            console.log('\n✓ No orphaned profiles found');
        }

        const remainingProfiles = await WorkerProfile.find({});
        console.log(`\nRemaining Worker Profiles: ${remainingProfiles.length}`);

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
        mongoose.connection.close();
    }
};

cleanup();
