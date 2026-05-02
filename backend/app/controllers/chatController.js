const { sql } = require('../config/db');

// @desc    Get chat history between current user and another user for a specific quest!
// @route   GET /api/chat/:questId/:otherUserId
exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.otherUserId;
        const questId = req.params.questId;

        // 1. Fetch the other user's actual name to display
        const userCheck = await sql.query`SELECT FullName, AvatarUrl FROM Users WHERE UserID = ${otherUserId}`;
        const otherUserName = userCheck.recordset.length > 0 ? userCheck.recordset[0].FullName : 'Unknown Adventurer';
        const otherUserAvatar = userCheck.recordset.length > 0 ? userCheck.recordset[0].AvatarUrl : null;

        // 2. Fetch the quest title
        const questCheck = await sql.query`SELECT Title FROM Quests WHERE QuestID = ${questId}`;
        const questTitle = questCheck.recordset.length > 0 ? questCheck.recordset[0].Title : 'Unknown Quest';

        // 3. Fetch messages!
        const result = await sql.query`
            SELECT MessageID, QuestID, SenderID, ReceiverID, Content, CreatedAt 
            FROM TavernMessages
            WHERE QuestID = ${questId}
              AND ((SenderID = ${userId} AND ReceiverID = ${otherUserId})
               OR (SenderID = ${otherUserId} AND ReceiverID = ${userId}))
            ORDER BY CreatedAt ASC
        `;
        
        res.status(200).json({ 
            success: true, 
            otherUserName, 
            questTitle,
            otherUserAvatar, 
            data: result.recordset 
        });
    } catch (error) {
        console.error('Error fetching chat:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
    }
};

// @desc    Send a direct message
// @route   POST /api/chat/:questId/:receiverId
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const receiverId = req.params.receiverId;
        const questId = req.params.questId;
        const { content } = req.body;

        if (!content || content.trim() === '') return res.status(400).json({ success: false, message: 'Message cannot be empty.' });

        const result = await sql.query`
            INSERT INTO TavernMessages (QuestID, SenderID, ReceiverID, Content, CreatedAt)
            OUTPUT INSERTED.*
            VALUES (${questId}, ${senderId}, ${receiverId}, ${content}, GETUTCDATE())
        `;
        
        const newMessage = result.recordset[0];

        if (req.io) {
            req.io.to(`user_${receiverId}`).emit('receive_message', newMessage);
            req.io.to(`user_${senderId}`).emit('receive_message', newMessage);
        }

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};
