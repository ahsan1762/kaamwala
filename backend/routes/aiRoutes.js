const express = require('express');
const router = express.Router();
const { recommendWorkers } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.get('/recommend', protect, recommendWorkers);

module.exports = router;
