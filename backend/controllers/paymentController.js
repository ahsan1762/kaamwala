const Booking = require('../models/Booking');

// @desc    Process simulated payment
// @route   POST /api/payment/process
// @access  Private
const processPayment = async (req, res) => {
    const { bookingId, paymentMethod, amount } = req.body;

    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Booking is already paid' });
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate fake transaction ID
        const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        booking.paymentStatus = 'paid';
        booking.paymentMethod = paymentMethod;
        booking.transactionId = transactionId;

        // If work was already done, mark completely finished
        if (booking.status === 'work_done') {
            booking.status = 'completed';
        }

        await booking.save();

        res.json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                transactionId,
                status: 'paid'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    processPayment
};
