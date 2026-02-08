const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Made optional for unassigned bookings
    },
    service: {
        type: String, // e.g. "Plumber"
        required: true,
    },
    serviceDate: {
        type: Date,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
    },
    price: {
        type: Number,
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'jazzcash', 'easypaisa'],
        default: 'cash'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'work_done', 'completed', 'cancelled'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    transactionId: {
        type: String,
    },
    estimatedArrival: {
        type: String, // e.g. "15 minutes", "1 hour"
    },
}, {
    timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
