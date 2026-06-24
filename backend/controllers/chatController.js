const Chat = require('../models/Chat');
const Booking = require('../models/Booking');

// @desc    Send message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
    const { bookingId, receiverId, message } = req.body;

    try {
        // Verify booking exists and user is part of it
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (
            booking.customerId.toString() !== req.user.id &&
            booking.workerId.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: 'Not authorized for this chat' });
        }

        const chat = await Chat.create({
            senderId: req.user.id,
            receiverId,
            bookingId,
            message,
        });

        res.status(201).json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get chat history
// @route   GET /api/chat/:bookingId
// @access  Private
const getChatHistory = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (
            booking.customerId.toString() !== req.user.id &&
            booking.workerId.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const chats = await Chat.find({ bookingId }).sort({ createdAt: 1 });
        res.json(chats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    sendMessage,
    getChatHistory,
};
