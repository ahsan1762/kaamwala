const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    type: {
        type: String,
        enum: ['booking_new', 'booking_update', 'booking_completed', 'booking_cancelled', 'payment', 'system', 'message'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // e.g. BookingId
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
