const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    console.log('Register Request Body:', req.body); // Debugging
    const { name, email, password, role, cnic, phone } = req.body;

    if (!name || !email || !password || !role || !cnic || !phone) {
        return res.status(400).json({ message: 'Please add all fields including CNIC and Phone' });
    }

    // Admin cannot register publicly
    if (role === 'admin') {
        return res.status(400).json({ message: 'Admin registration is restricted' });
    }

    // Check if CNIC exists (strict 1 account per CNIC)
    const cnicExists = await User.findOne({ cnic });
    if (cnicExists) {
        return res.status(400).json({ message: 'Account with this CNIC already exists' });
    }

    const startEmail = await User.findOne({ email });
    if (startEmail) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        cnic,
        phone
    });

    if (user) {
        // Generate verification token
        const verificationToken = user.getVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Create verification URL
        // Assuming frontend runs on same host/port during dev or strictly configured
        // Actually, frontend runs on 5173 usually. Let's hardcode for now or use env if available.
        // req.get('host') gives backend host.
        // We need FRONTEND URL.
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;

        const message = `Please verify your email by clicking the link below: \n\n ${verifyUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Account Verification',
                message,
            });

            res.status(201).json({
                success: true,
                message: 'Registration successful! Please check your email to verify your account.'
            });
        } catch (error) {
            console.error(error);
            user.verificationToken = undefined;
            user.verificationTokenExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Email could not be sent' });
        }

    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { identifier, password } = req.body;
    // identifier can be cnic or email (for admin backward compatibility)

    // Check for user by CNIC first, then Email
    let user = await User.findOne({ cnic: identifier });

    if (!user) {
        user = await User.findOne({ email: identifier });
    }

    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email before logging in.' });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            cnic: user.cnic,
            phone: user.phone, // Return phone
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};



// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    // Check if email is in the request body
    if (!email) {
        return res.status(400).json({ message: 'Please provide an email' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'No user with that email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        // Just sending the token back for API test in case email fails, but should send email.
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message,
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify Email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Invalid token' });
    }

    const verificationToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    try {
        const user = await User.findOne({
            verificationToken,
            verificationTokenExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            token: generateToken(user._id), // Optional: Login immediately? Or just success message.
            // Let's return token so they are logged in automatically if we want.
            // But usually for security better to ask login.
            // Existing plan says "Redirect to Login".
            // So I won't return token, or maybe I will to make it smoother?
            // "Login -> Expect Success" in manual verification plan implies manual login.
            // But typically auto-login is nice.
            // Let's stick to simple success message for now to be safe.
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    forgotPassword,
    resetPassword,
    verifyEmail
};
