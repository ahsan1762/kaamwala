const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/send', protect, sendMessage);
router.get('/:bookingId', protect, getChatHistory);

module.exports = router;
