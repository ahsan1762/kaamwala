const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res) => {
    const { workerId, serviceDate, service, address, phone, notes, price, paymentMethod } = req.body;

    console.log("Creating booking for user:", req.user.id);
    console.log("Booking Data:", req.body);

    try {
        const booking = await Booking.create({
            customerId: req.user.id,
            workerId: workerId || null,
            serviceDate,
            service,
            address,
            phone,
            notes,
            price,
            paymentMethod
        });

        console.log("Booking created:", booking._id);

        // Create Notification first so it's ready when client fetches
        if (workerId) {
            await Notification.create({
                recipientId: workerId,
                senderId: req.user.id,
                type: 'booking_new',
                message: `New booking request from ${req.user.name || 'Customer'}`,
                relatedId: booking._id
            });
        }

        // Emit socket event AFTER DB updates
        const io = req.app.get('io');
        io.emit('booking_created', booking);

        res.status(201).json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get customer bookings
// @route   GET /api/bookings/my
// @access  Private (Customer)
// @desc    Get my bookings (Customer or Worker)
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        console.log("Fetching bookings for user:", req.user.id, "Role:", req.user.role);

        let query = {};
        if (req.user.role === 'worker') {
            // Wait, workerId in Booking is the User ID effectively?
            // Refer to Schema. Booking.workerId refers to User or WorkerProfile?
            // In createBooking: workerId: workerId || null.
            // Usually workerId matches the User ID of the worker.
            query = { workerId: req.user.id };
        } else {
            query = { customerId: req.user.id };
        }

        const bookings = await Booking.find(query)
            .populate('workerId', 'name email')
            .populate('customerId', 'name email')
            .sort({ createdAt: -1 });

        console.log("Found bookings count:", bookings.length);
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get worker bookings
// @route   GET /api/worker/bookings
// @access  Private (Worker)
const getWorkerBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ workerId: req.user.id })
            .populate('customerId', 'name email')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Worker)
const updateBookingStatus = async (req, res) => {
    const { status, estimatedArrival } = req.body;
    const { id } = req.params;

    // Validate status
    if (!['accepted', 'rejected', 'work_done', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check authorization (Worker or Customer)
        const isWorker = booking.workerId && booking.workerId.toString() === req.user.id;
        const isCustomer = booking.customerId.toString() === req.user.id;

        if (!isWorker && !isCustomer) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        booking.status = status;
        if (status === 'accepted' && estimatedArrival) {
            booking.estimatedArrival = estimatedArrival;
        }

        // Allow updating price when marking as work_done (Final Invoice)
        if (req.body.price) {
            booking.price = req.body.price;
        }

        await booking.save();

        // Create Notification
        let recipientId = null;
        let msg = '';

        // Determine recipient based on who triggered the update (worker vs customer)
        if (req.user.role === 'worker') {
            recipientId = booking.customerId; // Worker updated, notify Customer
            msg = `Your booking for ${booking.service} is now ${booking.status}`;
        } else {
            recipientId = booking.workerId; // Customer updated, notify Worker
            msg = `Booking status updated to ${booking.status} by customer`;
        }

        if (recipientId) {
            await Notification.create({
                recipientId,
                senderId: req.user.id,
                type: 'booking_update',
                message: msg,
                relatedId: booking._id
            });
        }

        // Emit socket event AFTER notification is created
        const io = req.app.get('io');
        io.emit('booking_updated', booking);

        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getWorkerBookings,
    updateBookingStatus,
};
