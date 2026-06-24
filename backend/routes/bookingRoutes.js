const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    updateBookingStatus,
} = require('../controllers/bookingController');
const { getMessages, sendMessage } = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createBooking);
router.get('/my', protect, getMyBookings); // Removed authorize('customer') to allow workers too
router.patch('/:id/status', protect, updateBookingStatus);

// Chat Routes
router.get('/:id/messages', protect, getMessages);
router.post('/:id/messages', protect, sendMessage);

module.exports = router;
