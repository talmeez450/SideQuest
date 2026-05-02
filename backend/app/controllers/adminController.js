const { sql } = require('../config/db');

exports.getPendingKYC = async (req, res) => {
    try {
        const result = await sql.query`SELECT UserID, FullName, Email, CnicNumber, CnicFrontUrl, CnicBackUrl, CreatedAt FROM Users WHERE KycStatus = 'Pending' ORDER BY CreatedAt ASC`;
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch KYC queue' }); }
};

exports.resolveKYC = async (req, res) => {
    try {
        const userId = req.params.id;
        const { action } = req.body;
        if (action === 'Approve') {
            await sql.query`UPDATE Users SET KycStatus = 'Approved', IsKycVerified = 1 WHERE UserID = ${userId}`;
            res.status(200).json({ success: true, message: 'User KYC Approved!' });
        } else if (action === 'Reject') {
            await sql.query`UPDATE Users SET KycStatus = 'Rejected', IsKycVerified = 0, CnicFrontUrl = NULL, CnicBackUrl = NULL WHERE UserID = ${userId}`;
            res.status(200).json({ success: true, message: 'User KYC Rejected.' });
        }
    } catch (error) { res.status(500).json({ success: false, message: 'Failed to resolve KYC' }); }
};

exports.getAdminStats = async (req, res) => {
    try {
        const users = await sql.query`SELECT COUNT(*) as count FROM Users`;
        const gold = await sql.query`SELECT SUM(WalletBalance + EscrowBalance) as total FROM Users`;
        const quests = await sql.query`SELECT COUNT(*) as count FROM Quests WHERE Status = 'Completed'`;

        res.status(200).json({
            success: true,
            data: {
                totalUsers: users.recordset[0].count,
                totalGold: gold.recordset[0].total || 0,
                completedQuests: quests.recordset[0].count
            }
        });
    } catch (error) { res.status(500).json({ success: false, message: 'Failed to fetch stats' }); }
};

exports.getGuildMembers = async (req, res) => {
    try {
        const adminId = req.user.id;
        
        const result = await sql.query`
            SELECT UserID, FullName, Email, Rating, KycStatus, IsKycVerified, IsSuspended, AvatarUrl, CreatedAt 
            FROM Users 
            WHERE UserID != ${adminId} 
            ORDER BY CreatedAt DESC
        `;
        
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) { 
        res.status(500).json({ success: false, message: 'Failed to fetch members' }); 
    }
};

exports.toggleSuspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userCheck = await sql.query`SELECT IsSuspended, IsAdmin FROM Users WHERE UserID = ${id}`;
        if (userCheck.recordset[0].IsAdmin) return res.status(403).json({ success: false, message: 'You cannot suspend another Grandmaster!' });
        
        const newStatus = userCheck.recordset[0].IsSuspended ? 0 : 1;
        await sql.query`UPDATE Users SET IsSuspended = ${newStatus} WHERE UserID = ${id}`;
        res.status(200).json({ success: true, message: newStatus ? 'Adventurer Suspended!' : 'Adventurer Pardoned!' });
    } catch (error) { res.status(500).json({ success: false, message: 'Failed to toggle suspension' }); }
};

exports.revokeUserKyc = async (req, res) => {
    try {
        const { id } = req.params;
        await sql.query`UPDATE Users SET KycStatus = 'Rejected', IsKycVerified = 0, CnicFrontUrl = NULL, CnicBackUrl = NULL WHERE UserID = ${id}`;
        res.status(200).json({ success: true, message: 'KYC Revoked successfully!' });
    } catch (error) { res.status(500).json({ success: false, message: 'Failed to revoke KYC' }); }
};
