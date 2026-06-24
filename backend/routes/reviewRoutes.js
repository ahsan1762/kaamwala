const express = require('express');
const router = express.Router();
const { createReview, getReviewsByWorker, getRecentReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createReview);
router.get('/worker/:workerId', getReviewsByWorker);
router.get('/recent', getRecentReviews);

module.exports = router;
