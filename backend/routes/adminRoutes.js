const express = require('express');
const router = express.Router();
const {
    getPendingWorkers,
    verifyWorker,
    getAllUsers,
    getAllBookings,
    getDashboardStats,
    deleteUser,
    deleteBooking,
    updateBookingStatus,
    getUserDetails,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/pending-workers', protect, authorize('admin'), getPendingWorkers);
router.patch('/verify-worker/:workerId', protect, authorize('admin'), verifyWorker);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), getUserDetails);
router.get('/bookings', protect, authorize('admin'), getAllBookings);
router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.delete('/bookings/:id', protect, authorize('admin'), deleteBooking);
router.patch('/bookings/:id', protect, authorize('admin'), updateBookingStatus);

module.exports = router;
