-- SideQuest: Sprint 1 Sample Data (Seed)
-- Run this AFTER creating your tables with schema.sql

-- NOTE: The PasswordHash for all these users is exactly: password123

SET IDENTITY_INSERT Users ON;

INSERT INTO Users (UserID, FullName, Email, PasswordHash, CnicNumber, WalletBalance, EscrowBalance, Rating, TotalRatingsCount, IsKycVerified, KycStatus, AvatarUrl, IsAdmin, IsSuspended, CreatedAt)
VALUES 
-- The Grandmaster (Admin, Verified)
(1, 'Talmeez ur Rehman', 'talmeez@sidequest.com', '$2b$10$zCR.6U7stKU4XLvA8IDFGeil9mSGIFxv68TZjuWf4H8XG.p5ACwF6', '36103-8958896-1', 1050.00, 150.00, 4.9, 10, 1, 'Approved', 'https://i.pravatar.cc/150?u=1', 1, 0, GETDATE()),
(2, 'Muhammad Yaseen', 'yaseen@sidequest.com', '$2b$10$zCR.6U7stKU4XLvA8IDFGeil9mSGIFxv68TZjuWf4H8XG.p5ACwF6', '35202-1234567-1', 1000.00, 0.00, 4.8, 5, 1, 'Approved', 'https://i.pravatar.cc/150?u=2', 0, 0, GETDATE()),
(3, 'Taimur Amir', 'taimur@sidequest.com', '$2b$10$zCR.6U7stKU4XLvA8IDFGeil9mSGIFxv68TZjuWf4H8XG.p5ACwF6', '35202-7654321-9', 950.00, 0.00, 4.5, 3, 1, 'Approved', 'https://i.pravatar.cc/150?u=3', 0, 0, GETDATE()),
(4, 'Geralt of Rivia', 'witcher@sidequest.com', '$2b$10$zCR.6U7stKU4XLvA8IDFGeil9mSGIFxv68TZjuWf4H8XG.p5ACwF6', '12345-6789012-3', 200.00, 800.00, 5.0, 1, 0, 'Pending', NULL, 0, 0, GETDATE()),
(5, 'Shady Goblin', 'scam@sidequest.com', '$2b$10$zCR.6U7stKU4XLvA8IDFGeil9mSGIFxv68TZjuWf4H8XG.p5ACwF6', '99999-9999999-9', 0.00, 0.00, 1.0, 2, 0, 'Rejected', NULL, 0, 1, GETDATE());

SET IDENTITY_INSERT Users OFF;
SET IDENTITY_INSERT Quests ON;

INSERT INTO Quests (QuestID, QuestGiverID, QuestTakerID, Title, Description, QuestType, Status, RewardAmount, Location, GiverMarkedComplete, TakerMarkedComplete, GiverRated, TakerRated, ExpiresAt, CreatedAt)
VALUES
(1, 1, NULL, 'Slay the Basement Rat King', 'A massive rodent has claimed my basement. Bring your own sword. No magic allowed inside the house!', 'Errand', 'Open', 300.00, 'Talmeez''s Basement', 0, 0, 0, 0, DATEADD(day, 7, GETDATE()), GETDATE()),
(2, 2, NULL, 'Need a 5th for Futsal', 'Looking for a solid defender for a 1-hour game tonight. No sliding tackles please, my ankles are fragile!', 'Social', 'Open', 0.00, 'Model Town FC', 0, 0, 0, 0, DATEADD(day, 2, GETDATE()), GETDATE()),
(3, 1, 3, 'Deliver the Secret Scroll', 'Need someone to carry this highly classified scroll to the CS Department. Do NOT open it.', 'Errand', 'Accepted', 150.00, 'FAST NUCES Campus', 0, 0, 0, 0, DATEADD(day, 5, GETDATE()), GETDATE()),
(4, 4, 2, 'Brew 5 Potion of Healing', 'I am out of ingredients. Need a local alchemist to brew 5 standard healing potions. Will pay handsomely.', 'Errand', 'InProgress', 800.00, 'Kaer Morhen / DHA Phase 5', 0, 0, 0, 0, DATEADD(day, 10, GETDATE()), GETDATE()),
(5, 3, 1, 'Fix the broken Tavern Cart', 'The wheel on my cart broke. Need someone with high Strength stat to lift it while I replace the wheel.', 'Errand', 'Completed', 50.00, 'Gulberg III', 1, 1, 1, 1, DATEADD(day, -1, GETDATE()), DATEADD(day, -5, GETDATE()));

SET IDENTITY_INSERT Quests OFF;

INSERT INTO SavedQuests (UserID, QuestID, SavedAt)
VALUES
(1, 2, GETDATE()),
(3, 1, GETDATE()),
(4, 1, GETDATE());


INSERT INTO QuestApplicants (QuestID, ApplicantID, ApplicationStatus, AppliedAt)
VALUES
(1, 2, 'Pending', GETDATE()),
(1, 4, 'Pending', GETDATE()),
(2, 1, 'Pending', GETDATE()),
(3, 3, 'Approved', DATEADD(day, -1, GETDATE())),
(3, 4, 'Rejected', DATEADD(day, -1, GETDATE())),
(4, 2, 'Approved', DATEADD(day, -2, GETDATE())),
(4, 1, 'Rejected', DATEADD(day, -2, GETDATE())),
(5, 1, 'Approved', DATEADD(day, -4, GETDATE()));

SET IDENTITY_INSERT TavernMessages ON;

INSERT INTO TavernMessages (MessageID, QuestID, SenderID, ReceiverID, Content, CreatedAt)
VALUES
(1, 3, 1, 3, 'Hail Taimur! Are you ready to deliver the scroll?', GETUTCDATE()),
(2, 3, 3, 1, 'Yes Grandmaster, I am leaving the tavern now.', GETUTCDATE()),
(3, 4, 4, 2, 'Yaseen, do you have enough Drowner brains for the potions?', GETUTCDATE()),
(4, 4, 2, 4, 'Almost! I am brewing the final batch as we speak.', GETUTCDATE());

SET IDENTITY_INSERT TavernMessages OFF;
SET IDENTITY_INSERT Ratings ON;

INSERT INTO Ratings (RatingID, QuestID, RaterID, RateeID, Stars, Feedback, CreatedAt)
VALUES
(1, 5, 3, 1, 5, 'Completed via Tavern.', GETDATE()),
(2, 5, 1, 3, 5, 'Completed via Tavern.', GETDATE());

SET IDENTITY_INSERT Ratings OFF;


-- If there is an issue in any Insertion, DROP All the tables, run schemq.sql again and then run this again. 
--Make sure to run in the correct order: Users -> Quests -> SavedQuests -> QuestApplicants -> TavernMessages -> Ratings, due to foreign key constraints.
