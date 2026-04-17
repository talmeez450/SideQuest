const { sql } = require('../config/db');

// description:    Get user's wallet balances and quest-based transaction history
// route:   GET /api/wallet
exports.getWalletDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get current gold balances
        const userCheck = await sql.query`SELECT WalletBalance, EscrowBalance FROM Users WHERE UserID = ${userId}`;
        if (userCheck.recordset.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        
        const balances = userCheck.recordset[0];

        // Fetch completed quests where money moved!
        const history = await sql.query`
            SELECT 
                q.QuestID, 
                q.Title, 
                q.RewardAmount,
                q.CreatedAt,
                CASE 
                    WHEN q.QuestTakerID = ${userId} THEN 'Earned'
                    WHEN q.QuestGiverID = ${userId} THEN 'Spent'
                END as TransactionType,
                u1.FullName AS GiverName,
                u2.FullName AS TakerName
            FROM Quests q
            INNER JOIN Users u1 ON q.QuestGiverID = u1.UserID
            LEFT JOIN Users u2 ON q.QuestTakerID = u2.UserID
            WHERE q.Status = 'Completed' 
              AND q.RewardAmount > 0 
              AND (q.QuestTakerID = ${userId} OR q.QuestGiverID = ${userId})
            ORDER BY q.CreatedAt DESC
        `;

        res.status(200).json({
            success: true,
            balances: balances,
            history: history.recordset
        });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching wallet details' });
    }
};
