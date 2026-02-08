const Complaint = require('../models/Complaint');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res) => {
    const { subject, description } = req.body;

    if (!subject || !description) {
        return res.status(400).json({ message: 'Please provide subject and description' });
    }

    try {
        const complaint = new Complaint({
            userId: req.user._id,
            subject,
            description,
        });

        const createdComplaint = await complaint.save();
        res.status(201).json(createdComplaint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all complaints (Admin)
// @route   GET /api/complaints
// @access  Private (Admin)
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
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
        const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private (Admin)
const updateComplaintStatus = async (req, res) => {
    const { status, adminResponse } = req.body;

    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        if (status) complaint.status = status;
        if (adminResponse) complaint.adminResponse = adminResponse;

        const updatedComplaint = await complaint.save();
        res.json(updatedComplaint);
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
