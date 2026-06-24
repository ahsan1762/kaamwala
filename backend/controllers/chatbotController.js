const { getBotResponse } = require('../utils/chatbotResponses');

// @desc    Get chatbot response
// @route   POST /api/chatbot
// @access  Public
const handleChatbotRequest = (req, res) => {
    const { message } = req.body;

    // Simple validation
    if (!message && message !== '') {
        return res.status(400).json({ message: 'Message field is required' });
    }

    const response = getBotResponse(message);

    res.json(response);
};

module.exports = { handleChatbotRequest };
