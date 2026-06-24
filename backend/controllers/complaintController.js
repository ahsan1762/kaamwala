const Complaint = require('../models/Complaint');

// Generate unique ticket ID: TKT-YYMMDD-XXXX
const generateTicketId = async () => {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticketId = `TKT-${dateStr}-${random}`;
    const exists = await Complaint.findOne({ ticketId });
    if (exists) return generateTicketId();
    return ticketId;
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res) => {
    const { subject, description, category, priority } = req.body;

    if (!subject || !description) {
        return res.status(400).json({ message: 'Please provide subject and description' });
    }

    try {
        const ticketId = await generateTicketId();

        const complaint = new Complaint({
            userId: req.user._id,
            ticketId,
            subject,
            description,
            category: category || 'other',
            priority: priority || 'medium',
            lastActivity: new Date(),
        });

        const createdComplaint = await complaint.save();
        res.status(201).json(createdComplaint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all complaints (Admin) with optional filters
// @route   GET /api/complaints
// @access  Private (Admin)
const getAllComplaints = async (req, res) => {
    try {
        const { status, priority, category } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (category) filter.category = category;

        const complaints = await Complaint.find(filter)
            .populate('userId', 'name email')
            .populate('assignedTo', 'name')
            .sort({ lastActivity: -1 });
        res.json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get my complaints
// @route   GET /api/complaints/my
// @access  Private
const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.user._id })
            .populate('assignedTo', 'name')
            .sort({ lastActivity: -1 });
        res.json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update complaint status / assign / respond
// @route   PATCH /api/complaints/:id/status
// @access  Private (Admin)
const updateComplaintStatus = async (req, res) => {
    const { status, adminResponse, assignedTo, priority, category } = req.body;

    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        if (status) complaint.status = status;
        if (adminResponse) complaint.adminResponse = adminResponse;
        if (assignedTo) complaint.assignedTo = assignedTo;
        if (priority) complaint.priority = priority;
        if (category) complaint.category = category;
        complaint.lastActivity = new Date();

        const updatedComplaint = await complaint.save();
        const populated = await Complaint.populate(updatedComplaint, [
            { path: 'userId', select: 'name email' },
            { path: 'assignedTo', select: 'name' },
        ]);
        res.json(populated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createComplaint,
    getAllComplaints,
    getMyComplaints,
    updateComplaintStatus,
};
