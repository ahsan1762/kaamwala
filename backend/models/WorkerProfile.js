const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    skill: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    area: {
        type: String,
        required: true,
    },
    availability: {
        type: String,
        required: true, // e.g., '9AM - 5PM'
    },
    experience: {
        type: Number,
        default: 0
    },
    description: {
        type: String
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    reviewsCount: {
        type: Number,
        default: 0,
    },
    hourlyRate: {
        type: Number,
        default: 500, // Default base rate
    },
    profilePic: {
        type: String, // URL from Cloudinary
    },
    document: {
        type: String, // Keeping this as CNIC Front for now
    },
    cnicBack: {
        type: String,
    },
    serviceVideo: {
        type: String,
    },
}, {
    timestamps: true,
});

const WorkerProfile = mongoose.model('WorkerProfile', workerProfileSchema);

module.exports = WorkerProfile;
