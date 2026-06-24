const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getAllComplaints,
    getMyComplaints,
    updateComplaintStatus,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/', protect, authorize('admin'), getAllComplaints);
router.patch('/:id/status', protect, authorize('admin'), updateComplaintStatus);

module.exports = router;
