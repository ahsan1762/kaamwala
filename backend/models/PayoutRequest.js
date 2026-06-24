const mongoose = require('mongoose');

const payoutRequestSchema = new mongoose.Schema({
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    workerName: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    companyFee: {
        type: Number,
        default: 0, // 20% of amount
    },
    netAmount: {
        type: Number, // Amount after fees (amount - companyFee)
    },
    method: {
        type: String,
        enum: ['easypaisa', 'jazzcash', 'bank'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    methodDetails: {
        // For easypaisa/jazzcash: phone number
        // For bank: account number
        type: String,
        required: true,
    },
    adminNotes: {
        type: String, // Reason for rejection or approval notes
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin who processed
    },
    processedAt: {
        type: Date,
    },
}, {
    timestamps: true, // createdAt, updatedAt
});

const PayoutRequest = mongoose.model('PayoutRequest', payoutRequestSchema);

module.exports = PayoutRequest;
