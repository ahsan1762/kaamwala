const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        // unique: true, // Email no longer primary unique identifier for login, but still good to keep unique if possible. 
        // However, requirements say "onely one account can be made on one cnic". 
        // Let's keep email unique for now to avoid confusion, or relax it if multiple users share email (unlikely).
        unique: true,
    },
    cnic: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String, // Add phone number
        required: false, // Make optional for now to avoid breaking existing users login, but required for workers conceptually
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['customer', 'worker', 'admin'],
        required: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    verificationTokenExpire: Date,
}, {
    timestamps: true,
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Generate and hash verification token
userSchema.methods.getVerificationToken = function () {
    const verificationToken = crypto.randomBytes(20).toString('hex');

    this.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return verificationToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
