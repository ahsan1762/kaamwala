const mongoose = require('mongoose');

const complaintSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'dismissed'],
        default: 'pending',
    },
    adminResponse: {
        type: String,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Complaint', complaintSchema);
