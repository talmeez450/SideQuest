const { sql } = require('../config/db');

// @desc    Submit KYC Application
// @route   POST /api/users/kyc
exports.submitKycApplication = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cnicFrontUrl, cnicBackUrl } = req.body;
        if (!cnicFrontUrl || !cnicBackUrl) return res.status(400).json({ success: false, message: 'Both images required.' });
        
        const userCheck = await sql.query`SELECT KycStatus FROM Users WHERE UserID = ${userId}`;
        const currentStatus = userCheck.recordset[0].KycStatus;
        if (currentStatus === 'Pending' || currentStatus === 'Approved') return res.status(400).json({ success: false, message: 'Invalid status for re-application.' });

        await sql.query`UPDATE Users SET KycStatus = 'Pending', CnicFrontUrl = ${cnicFrontUrl}, CnicBackUrl = ${cnicBackUrl} WHERE UserID = ${userId}`;
        res.status(200).json({ success: true, message: 'KYC Application submitted!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get current user profile
// @route   GET /api/users/me
exports.getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await sql.query`SELECT UserID, FullName, Email, Rating, IsAdmin, KycStatus, AvatarUrl FROM Users WHERE UserID = ${userId}`;
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching profile details' });
    }
};

// @desc    Upload Profile Avatar
// @route   POST /api/users/avatar
exports.uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        const { avatarUrl } = req.body;
        await sql.query`UPDATE Users SET AvatarUrl = ${avatarUrl} WHERE UserID = ${userId}`;
        res.status(200).json({ success: true, message: 'Avatar updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update avatar' });
    }
};
