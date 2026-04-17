const { sql } = require('../config/db');

// description:    Get all active quests (with optional filtering by type)
// route:   GET /api/quests
exports.getQuests = async (req, res) => {
    try {
        const { type } = req.query;

        let query = `
            SELECT q.QuestID, q.Title, q.Description, q.QuestType, q.Status, 
                   q.RewardAmount, q.Location, q.CreatedAt, q.ExpiresAt,
                   u.FullName AS QuestGiverName, u.Rating AS QuestGiverRating
            FROM Quests q
            INNER JOIN Users u ON q.QuestGiverID = u.UserID
            WHERE q.Status = 'Open' AND q.ExpiresAt > GETDATE()
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

        if (reward > 0) {
            const walletCheck = await sql.query`SELECT WalletBalance FROM Users WHERE UserID = ${questGiverId}`;
            if ((walletCheck.recordset[0].WalletBalance ?? 1000) < reward) {
                return res.status(400).json({ success: false, message: 'You do not have enough gold in your wallet to offer this reward!' });
            }
        }

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

// description:    Bookmark or unbookmark a quest (Toggle)
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
// @access  Private
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

// description:    Apply for an open quest
// route:   POST /api/quests/:id/apply
exports.applyForQuest = async (req, res) => {
    try {
        const questId = req.params.id;
        const applicantId = req.user.id;

        // 1. Check if quest exists and is open
        const questCheck = await sql.query`SELECT QuestGiverID, Status FROM Quests WHERE QuestID = ${questId}`;
        if (questCheck.recordset.length === 0) return res.status(404).json({ success: false, message: 'Quest not found' });

        const quest = questCheck.recordset[0];
        if (quest.Status !== 'Open') return res.status(400).json({ success: false, message: 'Too late! This quest is no longer open.' });
        if (quest.QuestGiverID === applicantId) return res.status(400).json({ success: false, message: 'You cannot apply to your own bounty, silly!' });

        // 2. Check if already applied to prevent spam
        const applyCheck = await sql.query`SELECT * FROM QuestApplicants WHERE QuestID = ${questId} AND ApplicantID = ${applicantId}`;
        if (applyCheck.recordset.length > 0) return res.status(400).json({ success: false, message: 'You have already applied to this quest.' });

        // 3. Check if user is already busy with another quest!
        const busyCheck = await sql.query`
            SELECT QuestID FROM Quests 
            WHERE QuestTakerID = ${applicantId} AND Status IN ('Accepted', 'InProgress')
        `;
        if (busyCheck.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Greedy goblin! You are already on an active quest. Finish it before applying for new ones!' });
        }

        // 4. Insert application into the waiting room
        await sql.query`INSERT INTO QuestApplicants (QuestID, ApplicantID) VALUES (${questId}, ${applicantId})`;

        res.status(200).json({ success: true, message: 'Application submitted successfully! Awaiting response.' });
    } catch (error) {
        console.error('Error applying for quest:', error);
        res.status(500).json({ success: false, message: 'Server Error applying for quest' });
    }
};

// description:    Get all applicants for a specific quest
// route:   GET /api/quests/:id/applicants
exports.getQuestApplicants = async (req, res) => {
    try {
        const questId = req.params.id;
        const userId = req.user.id;

        // Verify the requester is actually the Quest Giver
        const questCheck = await sql.query`SELECT QuestGiverID FROM Quests WHERE QuestID = ${questId}`;
        if (questCheck.recordset.length === 0 || questCheck.recordset[0].QuestGiverID !== userId) {
            return res.status(403).json({ success: false, message: 'Only the Quest Giver can view these applicants.' });
        }

        // Fetch applicants check if they are currently busy with another quest
        const applicants = await sql.query`
            SELECT qa.ApplicantID, qa.AppliedAt, qa.ApplicationStatus, u.FullName, u.Email, u.Rating,
                CAST(
                    CASE WHEN EXISTS (
                        SELECT 1 FROM Quests q2 
                        WHERE q2.QuestTakerID = qa.ApplicantID AND q2.Status IN ('Accepted', 'InProgress')
                    ) THEN 1 ELSE 0 END AS BIT
                ) AS IsBusy
            FROM QuestApplicants qa
            INNER JOIN Users u ON qa.ApplicantID = u.UserID
            WHERE qa.QuestID = ${questId}
            ORDER BY qa.AppliedAt ASC
        `;

        res.status(200).json({ success: true, count: applicants.recordset.length, data: applicants.recordset });
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching applicants' });
    }
};

// description:    Accept or Reject an applicant
// route:   PATCH /api/quests/:id/applicants/:applicantId
exports.respondToApplication = async (req, res) => {
    try {
        const questId = req.params.id;
        const applicantId = req.params.applicantId;
        const { status } = req.body; // Expecting 'Approved' or 'Rejected'
        const userId = req.user.id;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid magic! Status must be Approved or Rejected.' });
        }

        // Verify Quest Giver & Quest Status
        const questCheck = await sql.query`SELECT QuestGiverID, Status, RewardAmount FROM Quests WHERE QuestID = ${questId}`;
        if (questCheck.recordset.length === 0 || questCheck.recordset[0].QuestGiverID !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized access.' });
        }

        const quest = questCheck.recordset[0];
        if (quest.Status !== 'Open') {
            return res.status(400).json({ success: false, message: 'Cannot accept applicants. Quest is no longer Open.' });
        }

        if (status === 'Approved') {
            const busyCheck = await sql.query`
                SELECT QuestID FROM Quests 
                WHERE QuestTakerID = ${applicantId} AND Status IN ('Accepted', 'InProgress')
            `;
            if (busyCheck.recordset.length > 0) {
                return res.status(400).json({ success: false, message: 'This adventurer is currently busy with another quest.' });
            }

            if (quest.RewardAmount > 0) {
                const giverWallet = await sql.query`SELECT WalletBalance FROM Users WHERE UserID = ${userId}`;
                if ((giverWallet.recordset[0].WalletBalance ?? 1000) < quest.RewardAmount) {
                    return res.status(400).json({ success: false, message: 'Not enough gold in your wallet to hire this adventurer!' });
                }

                await sql.query`
                    UPDATE Users 
                    SET WalletBalance = ISNULL(WalletBalance, 1000) - ${quest.RewardAmount}, 
                        EscrowBalance = ISNULL(EscrowBalance, 0) + ${quest.RewardAmount} 
                    WHERE UserID = ${userId}
                `;
            }

            await sql.query`
                UPDATE Quests 
                SET QuestTakerID = ${applicantId}, Status = 'Accepted' 
                WHERE QuestID = ${questId}
            `;

            await sql.query`
                UPDATE QuestApplicants 
                SET ApplicationStatus = 'Rejected' 
                WHERE QuestID = ${questId} AND ApplicantID != ${applicantId}
            `;
        } else {
            await sql.query`
                UPDATE QuestApplicants 
                SET ApplicationStatus = ${status} 
                WHERE QuestID = ${questId} AND ApplicantID = ${applicantId}
            `;
        }

        res.status(200).json({ success: true, message: `Applicant successfully ${status.toLowerCase()}!` });
    } catch (error) {
        console.error('Error responding to applicant:', error);
        res.status(500).json({ success: false, message: 'Server Error responding to applicant' });
    }
};

// description:    Update the lifecycle status of a quest (and release Escrow)
// route:   PATCH /api/quests/:id/status
exports.updateQuestStatus = async (req, res) => {
    try {
        const questId = req.params.id;
        const { newStatus } = req.body;
        const userId = req.user.id;

        const questCheck = await sql.query`SELECT QuestGiverID, QuestTakerID, Status, RewardAmount, GiverMarkedComplete, TakerMarkedComplete FROM Quests WHERE QuestID = ${questId}`;
        if (questCheck.recordset.length === 0) return res.status(404).json({ success: false, message: 'Quest not found' });

        const quest = questCheck.recordset[0];

        if (newStatus === 'InProgress') {
            if (quest.QuestTakerID !== userId) return res.status(403).json({ success: false, message: 'Only the Quest Taker can start the quest.' });
            if (quest.Status !== 'Accepted') return res.status(400).json({ success: false, message: 'Quest must be Accepted before starting.' });

            await sql.query`UPDATE Quests SET Status = 'InProgress' WHERE QuestID = ${questId}`;
            return res.status(200).json({ success: true, message: 'Quest is now In Progress. Godspeed!' });
        }

        if (newStatus === 'Completed') {
            if (quest.Status !== 'InProgress') return res.status(400).json({ success: false, message: 'Quest must be In Progress to complete it.' });

            let giverDone = quest.GiverMarkedComplete;
            let takerDone = quest.TakerMarkedComplete;

            if (userId === quest.QuestGiverID) {
                giverDone = true;
                await sql.query`UPDATE Quests SET GiverMarkedComplete = 1 WHERE QuestID = ${questId}`;
            } else if (userId === quest.QuestTakerID) {
                takerDone = true;
                await sql.query`UPDATE Quests SET TakerMarkedComplete = 1 WHERE QuestID = ${questId}`;
            } else {
                return res.status(403).json({ success: false, message: 'You are not involved in this quest.' });
            }

            if (giverDone && takerDone) {
                if (quest.RewardAmount > 0) {
                    await sql.query`UPDATE Users SET EscrowBalance = ISNULL(EscrowBalance, 0) - ${quest.RewardAmount} WHERE UserID = ${quest.QuestGiverID}`;
                    await sql.query`UPDATE Users SET WalletBalance = ISNULL(WalletBalance, 1000) + ${quest.RewardAmount} WHERE UserID = ${quest.QuestTakerID}`;
                }

                await sql.query`UPDATE Quests SET Status = 'Completed' WHERE QuestID = ${questId}`;
                return res.status(200).json({ success: true, message: 'Mutual completion achieved! Escrow funds released to the adventurer.' });
            }

            return res.status(200).json({ success: true, message: 'Marked as complete. Waiting for the other party to confirm.' });
        }

        res.status(400).json({ success: false, message: 'Invalid status update.' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, message: 'Server Error updating quest status' });
    }
};

// description:    Cancel a quest and refund escrow if needed
// route:   PATCH /api/quests/:id/cancel
exports.cancelQuest = async (req, res) => {
    try {
        const questId = req.params.id;
        const userId = req.user.id;

        const questCheck = await sql.query`SELECT QuestGiverID, Status, RewardAmount FROM Quests WHERE QuestID = ${questId}`;
        if (questCheck.recordset.length === 0) return res.status(404).json({ success: false, message: 'Quest not found' });

        const quest = questCheck.recordset[0];

        if (quest.QuestGiverID !== userId) return res.status(403).json({ success: false, message: 'Only the Quest Giver can cancel this quest.' });

        if (['Completed', 'Cancelled', 'Expired'].includes(quest.Status)) {
            return res.status(400).json({ success: false, message: `Cannot cancel a quest that is already ${quest.Status}.` });
        }

        if (['Accepted', 'InProgress'].includes(quest.Status) && quest.RewardAmount > 0) {
            await sql.query`
                UPDATE Users 
                SET EscrowBalance = ISNULL(EscrowBalance, 0) - ${quest.RewardAmount},
                    WalletBalance = ISNULL(WalletBalance, 1000) + ${quest.RewardAmount}
                WHERE UserID = ${userId}
            `;
        }

        // Mark quest as cancelled
        await sql.query`UPDATE Quests SET Status = 'Cancelled' WHERE QuestID = ${questId}`;

        res.status(200).json({ success: true, message: 'Quest cancelled. Any escrowed funds have been returned to your wallet.' });
    } catch (error) {
        console.error('Error cancelling quest:', error);
        res.status(500).json({ success: false, message: 'Server Error cancelling quest' });
    }
};

// description:    Get active gigs (quests the user has been hired to complete)
// route:   GET /api/quests/my-gigs
exports.getMyGigs = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await sql.query`
            SELECT q.QuestID, q.Title, q.Description, q.QuestType, q.Status, 
                   q.RewardAmount, q.Location, q.ExpiresAt,
                   q.GiverMarkedComplete, q.TakerMarkedComplete,
                   u.FullName AS QuestGiverName, u.Rating AS QuestGiverRating,
                   'Hired' AS GigState
            FROM Quests q
            INNER JOIN Users u ON q.QuestGiverID = u.UserID
            WHERE q.QuestTakerID = ${userId}

            UNION

            SELECT q.QuestID, q.Title, q.Description, q.QuestType, q.Status, 
                   q.RewardAmount, q.Location, q.ExpiresAt,
                   q.GiverMarkedComplete, q.TakerMarkedComplete,
                   u.FullName AS QuestGiverName, u.Rating AS QuestGiverRating,
                   'Pending' AS GigState
            FROM Quests q
            INNER JOIN Users u ON q.QuestGiverID = u.UserID
            INNER JOIN QuestApplicants qa ON q.QuestID = qa.QuestID
            WHERE qa.ApplicantID = ${userId} AND qa.ApplicationStatus = 'Pending' AND q.Status = 'Open'
            
            ORDER BY QuestID DESC
        `;

        res.status(200).json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });
    } catch (error) {
        console.error('Error fetching my gigs:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching my gigs' });
    }
};

// description:    Get all quests created by the logged-in user
// route:   GET /api/quests/manage
exports.getMyPostedQuests = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await sql.query`
            SELECT q.QuestID, q.Title, q.Description, q.QuestType, q.Status, 
                   q.RewardAmount, q.Location, q.ExpiresAt,
                   q.GiverMarkedComplete, q.TakerMarkedComplete,
                   u.FullName AS QuestGiverName
            FROM Quests q
            INNER JOIN Users u ON q.QuestGiverID = u.UserID
            WHERE q.QuestGiverID = ${userId}
            ORDER BY q.CreatedAt DESC
        `;

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Error fetching managed quests:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching managed quests' });
    }
};

// description:    Get a single quest by ID
// route:   GET /api/quests/:id
exports.getQuestById = async (req, res) => {
    try {
        const questId = req.params.id;

        const result = await sql.query`
            SELECT q.QuestID, q.QuestGiverID, q.QuestTakerID, q.Title, q.Description, q.QuestType, q.Status, 
                   q.RewardAmount, q.Location, q.ExpiresAt, q.CreatedAt,
                   q.GiverMarkedComplete, q.TakerMarkedComplete,
                   u1.FullName AS QuestGiverName, u1.Rating AS QuestGiverRating,
                   u2.FullName AS QuestTakerName
            FROM Quests q
            INNER JOIN Users u1 ON q.QuestGiverID = u1.UserID
            LEFT JOIN Users u2 ON q.QuestTakerID = u2.UserID
            WHERE q.QuestID = ${questId}
        `;

        if (result.recordset.length === 0) return res.status(404).json({ success: false, message: 'Quest not found' });

        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Error fetching quest by ID:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching quest details' });
    }
};

// description:    Edit an existing quest (Only if Open)
// route:   PUT /api/quests/:id
exports.updateQuest = async (req, res) => {
    try {
        const questId = req.params.id;
        const userId = req.user.id;
        const { title, description, location, expiresAt } = req.body;

        if (!title || !description || !location || !expiresAt) {
            return res.status(400).json({ success: false, message: 'Please provide all editable fields!' });
        }

        const questCheck = await sql.query`SELECT QuestGiverID, Status FROM Quests WHERE QuestID = ${questId}`;
        if (questCheck.recordset.length === 0) return res.status(404).json({ success: false, message: 'Quest not found' });

        const quest = questCheck.recordset[0];

        if (quest.QuestGiverID !== userId) return res.status(403).json({ success: false, message: 'Only the Quest Giver can edit this quest.' });
        if (quest.Status !== 'Open') return res.status(400).json({ success: false, message: 'You can only edit quests that are currently Open!' });

        await sql.query`
            UPDATE Quests 
            SET Title = ${title}, Description = ${description}, Location = ${location}, ExpiresAt = ${expiresAt}
            WHERE QuestID = ${questId}
        `;

        res.status(200).json({ success: true, message: 'Quest details updated successfully!' });
    } catch (error) {
        console.error('Error updating quest:', error);
        res.status(500).json({ success: false, message: 'Server Error updating quest' });
    }
};
