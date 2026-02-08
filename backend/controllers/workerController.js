const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');

// @desc    Create or update worker profile
// @route   POST /api/worker/profile
// @access  Private (Worker)
const createOrUpdateProfile = async (req, res) => {
    const { skill, city, area, availability } = req.body;

    const profileFields = {
        userId: req.user.id,
        skill,
        city,
        area,
        availability,
    };

    if (req.files) {
        if (req.files.profilePic) profileFields.profilePic = req.files.profilePic[0].path;
        if (req.files.document) profileFields.document = req.files.document[0].path;
        if (req.files.cnicBack) profileFields.cnicBack = req.files.cnicBack[0].path;
        if (req.files.serviceVideo) profileFields.serviceVideo = req.files.serviceVideo[0].path;
    }

    try {
        let profile = await WorkerProfile.findOne({ userId: req.user.id });

        if (profile) {
            // Update
            profile = await WorkerProfile.findOneAndUpdate(
                { userId: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profile = new WorkerProfile(profileFields);
        await profile.save();
        res.status(201).json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get current worker profile
// @route   GET /api/worker/profile
// @access  Private (Worker)
const getWorkerProfile = async (req, res) => {
    try {
        const profile = await WorkerProfile.findOne({ userId: req.user.id }).populate('userId', 'name email');

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Search workers
// @route   GET /api/workers/search
// @access  Private (Customer)

const searchWorkers = async (req, res) => {
    const { skill, city, area } = req.query;

    const query = {
        verificationStatus: 'approved',
    };

    if (skill) query.skill = { $regex: skill.trim(), $options: 'i' };
    if (city) query.city = { $regex: city.trim(), $options: 'i' };

    if (area) {
        // Flexible area matching logic
        // 1. Remove non-alphanumeric chars to get a "clean" version (e.g. "F-10" -> "F10", "F 10" -> "F10")
        const cleanArea = area.replace(/[^a-zA-Z0-9]/g, '');

        // 2. Check if it matches pattern like "F10" (Letters followed by Numbers)
        // This covers Islamabad sectors like F-10, G-11, etc.
        const match = cleanArea.match(/^([a-zA-Z]+)(\d+)$/);

        if (match) {
            // 3. Construct regex to allow optional space or hyphen between letters and numbers
            // Example: "F10" becomes "F[- ]?10", matching "F10", "F-10", "F 10"
            const flexibleRegex = `${match[1]}[- ]?${match[2]}`;
            query.area = { $regex: flexibleRegex, $options: 'i' };
        } else {
            // Fallback for areas that don't follow the Sector pattern
            query.area = { $regex: area.trim(), $options: 'i' };
        }
    }

    try {
        const workers = await WorkerProfile.find(query).populate('userId', 'name email');
        res.json(workers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get worker by ID (Public)
// @route   GET /api/workers/:id
// @access  Private (Customer/Admin)
const getWorkerById = async (req, res) => {
    try {
        const worker = await WorkerProfile.findOne({ userId: req.params.id }).populate('userId', 'name email');
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        // Count completed jobs
        const completedJobs = await require('../models/Booking').countDocuments({
            workerId: req.params.id,
            status: 'completed'
        });

        // Convert to object and add field
        const workerObj = worker.toObject();
        workerObj.completedJobs = completedJobs;

        res.json(workerObj);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createOrUpdateProfile,
    getWorkerProfile,
    searchWorkers,
    getWorkerById
};
