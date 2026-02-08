const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Booking',
    },
    message: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
