const { sql } = require('../config/db');

// description:    Get all active quests
// route:   GET /api/quests
exports.getQuests = async (req, res) => {
    try {
        const { type } = req.query; 

        // Flip the status of any old quests to 'Expired'
        await sql.query`
            UPDATE Quests 
            SET Status = 'Expired' 
            WHERE Status = 'Open' AND ExpiresAt <= GETDATE()
        `;

        // Fetch the ones that are still 'Open'
        let query = `
            SELECT q.QuestID, q.Title, q.Description, q.QuestType, q.Status, 
                   q.RewardAmount, q.Location, q.CreatedAt, q.ExpiresAt,
                   u.FullName AS QuestGiverName, u.Rating AS QuestGiverRating
            FROM Quests q
            INNER JOIN Users u ON q.QuestGiverID = u.UserID
            WHERE q.Status = 'Open' 
        `;

        let result;
        if (type && (type === 'Social' || type === 'Errand')) {
            result = await sql.query(query + ` AND q.QuestType = '${type}' ORDER BY q.CreatedAt DESC`);
        } else {
            result = await sql.query(query + ` ORDER BY q.CreatedAt DESC`);
        }

        res.status(200).json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });
    } catch (error) {
        console.error('Error fetching quests:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching quests' });
    }
};

// description:    Create a new quest
// route:   POST /api/quests
exports.createQuest = async (req, res) => {
    try {
        const { title, description, questType, rewardAmount, location, expiresAt } = req.body;
        const questGiverId = req.user.id;

        if (!title || !description || !questType || !location || !expiresAt) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields, including an expiration date!' });
        }

        // Default reward to 0 if not provided
        const reward = rewardAmount ? parseFloat(rewardAmount) : 0.00;

        const result = await sql.query`
            INSERT INTO Quests (QuestGiverID, Title, Description, QuestType, RewardAmount, Location, ExpiresAt)
            OUTPUT INSERTED.*
            VALUES (${questGiverId}, ${title}, ${description}, ${questType}, ${reward}, ${location}, ${expiresAt})
        `;

        res.status(201).json({
            success: true,
            message: 'Quest created successfully',
            data: result.recordset[0]
        });

    } catch (error) {
        console.error('Error creating quest:', error);
        res.status(500).json({ success: false, message: 'Server Error creating quest' });
    }
};

// description:    Bookmark or unbookmark a quest
// route:   POST /api/quests/:id/bookmark
exports.bookmarkQuest = async (req, res) => {
    try {
        const questId = req.params.id;
        const userId = req.user.id;

        const check = await sql.query`SELECT * FROM SavedQuests WHERE UserID = ${userId} AND QuestID = ${questId}`;
        
        if (check.recordset.length > 0) {
            await sql.query`DELETE FROM SavedQuests WHERE UserID = ${userId} AND QuestID = ${questId}`;
            return res.status(200).json({ success: true, message: 'Quest removed from bookmarks' });
        } else {
            await sql.query`INSERT INTO SavedQuests (UserID, QuestID) VALUES (${userId}, ${questId})`;
            return res.status(200).json({ success: true, message: 'Quest bookmarked successfully' });
        }
    } catch (error) {
        console.error('Error bookmarking quest:', error);
        res.status(500).json({ success: false, message: 'Server Error bookmarking quest' });
    }
};

// description:    Get all bookmarked quests for the logged-in user
// route:   GET /api/quests/saved
exports.getSavedQuests = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await sql.query`
            SELECT q.QuestID, q.Title, q.Description, q.QuestType, q.Status, 
                   q.RewardAmount, q.Location, q.ExpiresAt, sq.SavedAt,
                   u.FullName AS QuestGiverName
            FROM SavedQuests sq
            INNER JOIN Quests q ON sq.QuestID = q.QuestID
            INNER JOIN Users u ON q.QuestGiverID = u.UserID
            WHERE sq.UserID = ${userId}
            ORDER BY sq.SavedAt DESC
        `;

        res.status(200).json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });
    } catch (error) {
        console.error('Error fetching saved quests:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching saved quests' });
    }
};