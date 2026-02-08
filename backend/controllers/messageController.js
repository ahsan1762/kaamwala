const Message = require('../models/Message');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @desc    Get messages for a booking
// @route   GET /api/bookings/:id/messages
// @access  Private
const getMessages = async (req, res) => {
    try {
        // user must be part of booking
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.customerId.toString() !== req.user.id &&
            booking.workerId && booking.workerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const messages = await Message.find({ bookingId: req.params.id })
            .populate('senderId', 'name')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send a message
// @route   POST /api/bookings/:id/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Authorization check
        if (booking.customerId.toString() !== req.user.id &&
            booking.workerId && booking.workerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const message = await Message.create({
            bookingId: req.params.id,
            senderId: req.user.id,
            text
        });

        const populatedMessage = await message.populate('senderId', 'name');

        const io = req.app.get('io');
        io.emit('new_message', populatedMessage);

        // Create Persistent Notification for the recipient
        // Determine recipient: if sender is customer, recipient is worker, and vice versa.
        let recipientId = null;
        if (booking.customerId.toString() === req.user.id) {
            recipientId = booking.workerId;
        } else {
            recipientId = booking.customerId; // Sender is worker (or other), recipient is customer
        }

        if (recipientId) {
            await Notification.create({
                recipientId,
                senderId: req.user.id,
                type: 'message',
                message: `New message from ${req.user.name || 'User'}`,
                relatedId: booking._id,
                // optional: add logic to check if user is currently online/viewing chat to mark as read immediately?
                // For now, keep it unread.
            });
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMessages,
    sendMessage
};
