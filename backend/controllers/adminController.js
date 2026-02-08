const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const Booking = require('../models/Booking');

// @desc    Get pending workers
// @route   GET /api/admin/pending-workers
// @access  Private (Admin)
const getPendingWorkers = async (req, res) => {
    try {
        const workers = await WorkerProfile.find({ verificationStatus: 'pending' })
            .populate('userId', 'name email');
        res.json(workers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify worker
// @route   PATCH /api/admin/verify-worker/:workerId
// @access  Private (Admin)
const verifyWorker = async (req, res) => {
    const { workerId } = req.params; // Expecting workerId (WorkerProfile ID or User ID? Spec says :workerId. Let's assume WorkerProfile ID for precision, or User ID if passed from UI. Usually UI passes Profile ID if listing profiles. )

    // However, looking at WorkerProfile schema, it has `_id` and `userId`.
    // Let's assume the parameter is `userId` or `_id`. 
    // "PATCH /api/admin/verify-worker/:workerId"
    // I'll try to find by `_id` first.

    const { status } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        // Try finding by ID (Profile ID)
        let worker = await WorkerProfile.findById(workerId);

        // If not found, maybe they sent userId? 
        if (!worker) {
            worker = await WorkerProfile.findOne({ userId: workerId });
        }

        if (!worker) {
            return res.status(404).json({ message: 'Worker profile not found' });
        }

        worker.verificationStatus = status;
        await worker.save();

        res.json(worker);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('customerId', 'name email')
            .populate('workerId', 'name email');
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalWorkers = await WorkerProfile.countDocuments({ verificationStatus: 'approved' });
        const pendingWorkers = await WorkerProfile.countDocuments({ verificationStatus: 'pending' });
        const totalBookings = await Booking.countDocuments();

        // Group workers by skill
        const workersBySkill = await WorkerProfile.aggregate([
            { $match: { verificationStatus: 'approved' } },
            { $group: { _id: '$skill', count: { $sum: 1 } } }
        ]);

        // Group bookings by status
        const bookingsByStatus = await Booking.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            overview: {
                totalUsers,
                totalWorkers,
                pendingWorkers,
                totalBookings
            },
            workersBySkill,
            bookingsByStatus
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete booking
// @route   DELETE /api/admin/bookings/:id
// @access  Private (Admin)
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        await booking.deleteOne();
        res.json({ message: 'Booking removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update booking status (Admin)
// @route   PATCH /api/admin/bookings/:id
// @access  Private (Admin)
const updateBookingStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        booking.status = status;
        await booking.save();
        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single user details (Profile, Bookings, Reviews)
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let workerProfile = null;
        let reviews = [];
        let bookings = [];

        // If user is a worker, fetch profile and reviews received
        if (user.role === 'worker') {
            workerProfile = await WorkerProfile.findOne({ userId: user._id });
            const Review = require('../models/Review'); // Lazy load to avoid circular dependency if any
            reviews = await Review.find({ workerId: user._id })
                .populate('customerId', 'name')
                .populate('bookingId', 'service');

            // As a worker, bookings where they are the worker
            bookings = await Booking.find({ workerId: user._id })
                .populate('customerId', 'name')
                .sort({ createdAt: -1 });
        } else {
            // As a customer, bookings where they are the customer
            bookings = await Booking.find({ customerId: user._id })
                .populate('workerId', 'name')
                .sort({ createdAt: -1 });
        }

        res.json({
            user,
            workerProfile,
            reviews,
            bookings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getPendingWorkers,
    verifyWorker,
    getAllUsers,
    getAllBookings,
    getDashboardStats,
    deleteUser,
    deleteBooking,
    updateBookingStatus,
    getUserDetails,
};
