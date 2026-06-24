const Review = require('../models/Review');
const Booking = require('../models/Booking');
const WorkerProfile = require('../models/WorkerProfile');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Customer)
const createReview = async (req, res) => {
    const { bookingId, rating, comment } = req.body;

    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user is the customer of this booking
        if (booking.customerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to review this booking' });
        }

        // Check if booking is completed
        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed bookings' });
        }

        // Check if review already exists
        const reviewExists = await Review.findOne({ bookingId });
        if (reviewExists) {
            return res.status(400).json({ message: 'Review already submitted' });
        }

        const review = await Review.create({
            bookingId,
            customerId: req.user.id,
            workerId: booking.workerId,
            rating,
            comment,
        });

        // Update worker average rating (Optional but good for completeness)
        // I will calculate average rating for the worker
        const reviews = await Review.find({ workerId: booking.workerId });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await WorkerProfile.findOneAndUpdate(
            { userId: booking.workerId },
            {
                averageRating: avgRating,
                reviewsCount: reviews.length
            }
        );

        res.status(201).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get reviews by worker ID
// @route   GET /api/reviews/worker/:workerId
// @access  Public
const getReviewsByWorker = async (req, res) => {
    try {
        const reviews = await Review.find({ workerId: req.params.workerId })
            .populate('customerId', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get recent reviews (Public)
// @route   GET /api/reviews/recent
// @access  Public
const getRecentReviews = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('customerId', 'name') // only name needed
            .populate('workerId', 'name')   // maybe needed
            .sort({ createdAt: -1 })
            .limit(6);

        // Transform for frontend
        const formattedReviews = reviews.map(r => ({
            id: r._id,
            name: r.customerId ? r.customerId.name : 'Anonymous',
            location: "Islamabad", // Placeholder as customer location isn't linked easily yet
            rating: r.rating,
            text: r.comment
        }));

        res.json(formattedReviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createReview,
    getReviewsByWorker,
    getRecentReviews
};
