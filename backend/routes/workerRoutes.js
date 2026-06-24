const express = require('express');
const router = express.Router();
const {
    createOrUpdateProfile,
    getWorkerProfile,
    searchWorkers,
    getWorkerById,
    updatePayoutMethods,
    getEarnings,
    requestWithdrawal,
    getWithdrawalHistory,
} = require('../controllers/workerController');
const { getWorkerBookings } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

router.post('/profile',
    (req, res, next) => {
        console.log('DEBUG: POST /api/worker/profile hit');
        console.log('Headers:', req.headers['content-type']);
        console.log('Authorization:', req.headers['authorization'] ? 'Present' : 'Missing');
        next();
    },
    protect,
    authorize('worker'),
    (req, res, next) => {
        console.log('DEBUG: Auth passed, starting upload...');
        upload.fields([
            { name: 'profilePic', maxCount: 1 },
            { name: 'document', maxCount: 1 },
            { name: 'cnicBack', maxCount: 1 },
            { name: 'serviceVideo', maxCount: 1 }
        ])(req, res, (err) => {
            if (err) {
                console.error('DEBUG: Upload Middleware Error:', err);
                return res.status(400).json({ message: 'File upload error', error: err.message });
            }
            console.log('DEBUG: Upload finished, files:', req.files ? Object.keys(req.files) : 'None');
            next();
        });
    },
    createOrUpdateProfile
);
router.get('/profile', protect, authorize('worker'), getWorkerProfile);
router.put('/payout-methods', protect, authorize('worker'), updatePayoutMethods);
router.get('/earnings', protect, authorize('worker'), getEarnings);
router.post('/request-withdrawal', protect, authorize('worker'), requestWithdrawal);
router.get('/withdrawal-history', protect, authorize('worker'), getWithdrawalHistory);
router.get('/search', searchWorkers);
router.get('/bookings', protect, authorize('worker'), getWorkerBookings);
router.get('/:id', getWorkerById);

module.exports = router;
