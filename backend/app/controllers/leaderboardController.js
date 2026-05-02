const { sql } = require('../config/db');

// @desc    Get top rated adventurers for the Hall of Fame
// @route   GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const result = await sql.query`
            SELECT TOP 10 
                UserID, FullName, Rating, AvatarUrl, IsKYCVerified, TotalRatingsCount,
                (SELECT COUNT(*) FROM Quests WHERE QuestTakerID = UserID AND Status = 'Completed') AS QuestsCompleted
            FROM Users
            WHERE Rating > 0 OR TotalRatingsCount > 0
            ORDER BY Rating DESC, QuestsCompleted DESC
        `;
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch the Hall of Fame' });
    }
};
