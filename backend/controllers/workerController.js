const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const PayoutRequest = require('../models/PayoutRequest');

// @desc    Create or update worker profile
// @route   POST /api/worker/profile
// @access  Private (Worker)
const createOrUpdateProfile = async (req, res) => {
    const { skill, city, area, availability } = req.body;

    const profileFields = {
        userId: req.user.id,
        skill,
        city,
        area,
        availability,
    };

    if (req.files) {
        if (req.files.profilePic) profileFields.profilePic = req.files.profilePic[0].path;
        if (req.files.document) profileFields.document = req.files.document[0].path;
        if (req.files.cnicBack) profileFields.cnicBack = req.files.cnicBack[0].path;
        if (req.files.serviceVideo) profileFields.serviceVideo = req.files.serviceVideo[0].path;
    }

    try {
        let profile = await WorkerProfile.findOne({ userId: req.user.id });

        if (profile) {
            // Update
            profile = await WorkerProfile.findOneAndUpdate(
                { userId: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profile = new WorkerProfile(profileFields);
        await profile.save();
        res.status(201).json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get current worker profile
// @route   GET /api/worker/profile
// @access  Private (Worker)
const getWorkerProfile = async (req, res) => {
    try {
        const profile = await WorkerProfile.findOne({ userId: req.user.id }).populate('userId', 'name email');

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Search workers
// @route   GET /api/workers/search
// @access  Private (Customer)

const searchWorkers = async (req, res) => {
    const { skill, city, area } = req.query;

    const query = {
        verificationStatus: 'approved',
    };

    if (skill) query.skill = { $regex: skill.trim(), $options: 'i' };
    if (city) query.city = { $regex: city.trim(), $options: 'i' };

    if (area) {
        // Flexible area matching logic
        // 1. Remove non-alphanumeric chars to get a "clean" version (e.g. "F-10" -> "F10", "F 10" -> "F10")
        const cleanArea = area.replace(/[^a-zA-Z0-9]/g, '');

        // 2. Check if it matches pattern like "F10" (Letters followed by Numbers)
        // This covers Islamabad sectors like F-10, G-11, etc.
        const match = cleanArea.match(/^([a-zA-Z]+)(\d+)$/);

        if (match) {
            // 3. Construct regex to allow optional space or hyphen between letters and numbers
            // Example: "F10" becomes "F[- ]?10", matching "F10", "F-10", "F 10"
            const flexibleRegex = `${match[1]}[- ]?${match[2]}`;
            query.area = { $regex: flexibleRegex, $options: 'i' };
        } else {
            // Fallback for areas that don't follow the Sector pattern
            query.area = { $regex: area.trim(), $options: 'i' };
        }
    }

    try {
        const workers = await WorkerProfile.find(query).populate('userId', 'name email');

        // Fetch completed jobs count for each worker
        const Booking = require('../models/Booking');
        const enrichedWorkers = await Promise.all(
            workers
                .filter(worker => worker.userId) // Filter out orphaned profiles with no user
                .map(async (worker) => {
                    const completedJobs = await Booking.countDocuments({
                        workerId: worker.userId._id,
                        status: 'completed'
                    });
                    const workerObj = worker.toObject();
                    workerObj.completedJobs = completedJobs;
                    return workerObj;
                })
        );

        console.log(`[searchWorkers] Found ${workers.length} profiles total, ${enrichedWorkers.length} with valid users, query:`, query);
        res.json(enrichedWorkers);
    } catch (error) {
        console.error('[searchWorkers Error]:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get worker by ID (Public)
// @route   GET /api/workers/:id
// @access  Private (Customer/Admin)
const getWorkerById = async (req, res) => {
    try {
        const worker = await WorkerProfile.findOne({ userId: req.params.id }).populate('userId', 'name email phone');
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        // Check if userId was populated (user still exists)
        if (!worker.userId) {
            return res.status(404).json({ message: 'Worker user not found (orphaned profile)' });
        }

        // Count completed jobs
        const Booking = require('../models/Booking');
        const completedJobs = await Booking.countDocuments({
            workerId: req.params.id,
            status: 'completed'
        });

        // Convert to object and add field
        const workerObj = worker.toObject();
        workerObj.completedJobs = completedJobs;

        // Ensure profilePic is included
        console.log('Worker object profilePic:', workerObj.profilePic);

        res.json(workerObj);
    } catch (error) {
        console.error('[getWorkerById Error]:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update payout methods and bank details
// @route   PUT /api/worker/payout-methods
// @access  Private (Worker)
const updatePayoutMethods = async (req, res) => {
    try {
        const { easypaisaPhone, jazzcashPhone, bankAccount, accountTitle, preferredMethod } = req.body;

        // Validation for phone numbers and account
        const phoneRegex = /^03\d{2}-\d{7}$/; // Format: 03xx-xxxxxxx
        const accountRegex = /^03\d{2}-\d{7}$/; // Same format for account number

        if (easypaisaPhone && !phoneRegex.test(easypaisaPhone)) {
            return res.status(400).json({ message: 'Invalid Easypaisa phone format. Use: 03xx-xxxxxxx' });
        }

        if (jazzcashPhone && !phoneRegex.test(jazzcashPhone)) {
            return res.status(400).json({ message: 'Invalid Jazz Cash phone format. Use: 03xx-xxxxxxx' });
        }

        if (bankAccount && !accountRegex.test(bankAccount)) {
            return res.status(400).json({ message: 'Invalid account number format. Use: 03xx-xxxxxxx' });
        }

        if (bankAccount && !accountTitle) {
            return res.status(400).json({ message: 'Account title is required when adding bank account' });
        }

        const profile = await WorkerProfile.findOne({ userId: req.user.id });

        if (!profile) {
            return res.status(404).json({ message: 'Worker profile not found' });
        }

        // Update payout methods
        if (easypaisaPhone) {
            profile.payoutMethods.easypaisa = {
                enabled: true,
                phoneNumber: easypaisaPhone,
            };
        }

        if (jazzcashPhone) {
            profile.payoutMethods.jazzcash = {
                enabled: true,
                phoneNumber: jazzcashPhone,
            };
        }

        if (bankAccount) {
            profile.payoutMethods.bankTransfer = {
                enabled: true,
                accountNumber: bankAccount,
                accountTitle: accountTitle,
            };
        }

        if (preferredMethod) {
            if (!['easypaisa', 'jazzcash', 'bankTransfer'].includes(preferredMethod)) {
                return res.status(400).json({ message: 'Invalid preferred method' });
            }
            profile.preferredPayoutMethod = preferredMethod;
        }

        await profile.save();
        res.json({ message: 'Payout methods updated successfully', profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get worker earning balance
// @route   GET /api/worker/earnings
// @access  Private (Worker)
const getEarnings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const profile = await WorkerProfile.findOne({ userId: req.user.id });

        if (!user || !profile) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        res.json({
            totalEarnings: user.totalEarnings,
            availableBalance: user.availableBalance,
            payoutMethods: profile.payoutMethods,
            preferredPayoutMethod: profile.preferredPayoutMethod,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Request withdrawal
// @route   POST /api/worker/request-withdrawal
// @access  Private (Worker)
const requestWithdrawal = async (req, res) => {
    try {
        const { amount, method } = req.body;

        // Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        if (!['easypaisa', 'jazzcash', 'bank'].includes(method)) {
            return res.status(400).json({ message: 'Invalid payment method' });
        }

        // Get worker profile and user
        const user = await User.findById(req.user.id);
        const profile = await WorkerProfile.findOne({ userId: req.user.id });

        if (!user || !profile) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        // Check available balance (including 20% fee)
        const companyFee = amount * 0.20; // 20% fee
        const totalDeduction = amount + companyFee;
        
        if (user.availableBalance < totalDeduction) {
            return res.status(400).json({ 
                message: `Insufficient balance. You need Rs. ${totalDeduction} but have Rs. ${user.availableBalance}`,
                requiredAmount: totalDeduction,
                availableBalance: user.availableBalance
            });
        }

        // Get method details based on selected method
        let methodDetails;
        if (method === 'easypaisa' && profile.payoutMethods.easypaisa.enabled) {
            methodDetails = profile.payoutMethods.easypaisa.phoneNumber;
        } else if (method === 'jazzcash' && profile.payoutMethods.jazzcash.enabled) {
            methodDetails = profile.payoutMethods.jazzcash.phoneNumber;
        } else if (method === 'bank' && profile.payoutMethods.bankTransfer.enabled) {
            methodDetails = profile.payoutMethods.bankTransfer.accountNumber;
        } else {
            return res.status(400).json({ message: 'Selected payment method not configured' });
        }

        // Create payout request (Don't deduct balance yet - only when admin approves)
        const payoutRequest = new PayoutRequest({
            workerId: req.user.id,
            workerName: user.name,
            amount,
            companyFee,
            netAmount: amount - companyFee, // What worker will actually receive
            method,
            methodDetails,
            status: 'pending',
        });

        await payoutRequest.save();

        res.status(201).json({
            message: 'Withdrawal request submitted successfully. Admin will review shortly.',
            request: payoutRequest,
            details: {
                requestedAmount: amount,
                companyFee: companyFee,
                netAmount: amount - companyFee,
                feePercentage: 20
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get withdrawal history
// @route   GET /api/worker/withdrawal-history
// @access  Private (Worker)
const getWithdrawalHistory = async (req, res) => {
    try {
        const requests = await PayoutRequest.find({ workerId: req.user.id })
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createOrUpdateProfile,
    getWorkerProfile,
    searchWorkers,
    getWorkerById,
    updatePayoutMethods,
    getEarnings,
    requestWithdrawal,
    getWithdrawalHistory,
};
