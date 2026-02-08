const WorkerProfile = require('../models/WorkerProfile');

// @desc    Get AI Recommendations
// @route   GET /api/ai/recommend
// @access  Public (or Private?) - Spec doesn't say. Customer flow? "Customer can Search". Let's assume Customer/Public. I'll make it protected for Customer.
const recommendWorkers = async (req, res) => {
    const { skill, city } = req.query;

    const AI_API_KEY = process.env.AI_API_KEY; // Placeholder for future AI service

    try {
        // Logic: filter approved workers, sort by rating, limit 3
        const query = {
            verificationStatus: 'approved',
        };

        if (skill) query.skill = { $regex: skill, $options: 'i' };
        if (city) query.city = { $regex: city, $options: 'i' };

        const workers = await WorkerProfile.find(query)
            .sort({ averageRating: -1 })
            .limit(3)
            .populate('userId', 'name email');

        res.json({
            message: 'AI Recommendations',
            recommendations: workers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    recommendWorkers,
};
