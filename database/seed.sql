-- SideQuest: Sprint 1 Sample Data (Seed)
-- Run this AFTER creating your tables with schema.sql

-- 1. Insert Guild Members (Users)
-- NOTE: The PasswordHash for all these users is exactly: password123
INSERT INTO Users (FullName, Email, PasswordHash, CnicNumber, WalletBalance)
VALUES 
('Talmeez ur Rehman', 'talmeez@sidequest.com', '$2b$10$zCR.6U7stKU4XLvA8IDFGeil9mSGIFxv68TZjuWf4H8XG.p5ACwF6', '36103-8958896-1', 1050.00, 150.00, 4.9, GETDATE()),
('Muhammad Yaseen', 'yaseen@sidequest.com', '$2b$10$zCR.6U7stKU4XLvA8IDFGeil9mSGIFxv68TZjuWf4H8XG.p5ACwF6', '35202-1234567-1', 1000.00, 0.00, 4.8, GETDATE()),
('Taimur Amir', 'taimur@sidequest.com', '$2b$10$zCR.6U7stKU4XLvA8IDFGeil9mSGIFxv68TZjuWf4H8XG.p5ACwF6', '35202-7654321-9', 950.00, 0.00, 4.5, GETDATE()),
('Geralt of Rivia', 'witcher@sidequest.com', '$2b$10$zCR.6U7stKU4XLvA8IDFGeil9mSGIFxv68TZjuWf4H8XG.p5ACwF6', '12345-6789012-3', 200.00, 800.00, 5.0, GETDATE());

-- 2. Insert Bounties (Quests)
-- Assuming the users above got UserID 1, 2, and 3 respectively due to IDENTITY(1,1)
INSERT INTO Quests (QuestGiverID, QuestTakerID, Title, Description, QuestType, Status, RewardAmount, Location, ExpiresAt, CreatedAt, GiverMarkedComplete, TakerMarkedComplete)
VALUES
(1, NULL, 'Slay the Basement Rat King', 'A massive rodent has claimed my basement. Bring your own sword. No magic allowed inside the house!', 'Errand', 'Open', 300.00, 'Talmeez''s Basement', DATEADD(day, 7, GETDATE()), GETDATE(), 0, 0),
(2, NULL, 'Need a 5th for Futsal', 'Looking for a solid defender for a 1-hour game tonight. No sliding tackles please, my ankles are fragile!', 'Social', 'Open', 0.00, 'Model Town FC', DATEADD(day, 2, GETDATE()), GETDATE(), 0, 0),
(1, 3, 'Deliver the Secret Scroll', 'Need someone to carry this highly classified scroll to the CS Department. Do NOT open it.', 'Errand', 'Accepted', 150.00, 'FAST NUCES Campus', DATEADD(day, 5, GETDATE()), GETDATE(), 0, 0),
(4, 2, 'Brew 5 Potion of Healing', 'I am out of ingredients. Need a local alchemist to brew 5 standard healing potions. Will pay handsomely.', 'Errand', 'InProgress', 800.00, 'Kaer Morhen / DHA Phase 5', DATEADD(day, 10, GETDATE()), GETDATE(), 0, 0),
(3, 1, 'Fix the broken Tavern Cart', 'The wheel on my cart broke. Need someone with high Strength stat to lift it while I replace the wheel.', 'Errand', 'Completed', 50.00, 'Gulberg III', DATEADD(day, -1, GETDATE()), DATEADD(day, -5, GETDATE()), 1, 1);

-- 3. Insert Bookmarks (SavedQuests)
INSERT INTO SavedQuests (UserID, QuestID, SavedAt)
VALUES
(1, 2, GETDATE()), -- Talmeez saved the Futsal quest
(3, 1, GETDATE()), -- Taimur saved the Rat King quest
(4, 1, GETDATE()); -- Geralt saved the Rat King quest

-- 4. Insert Quest Applications (QuestApplicants)
INSERT INTO QuestApplicants (QuestID, ApplicantID, ApplicationStatus, AppliedAt)
VALUES
(1, 2, 'Pending', GETDATE()),
(1, 4, 'Pending', GETDATE()),
(2, 1, 'Pending', GETDATE()),
(3, 3, 'Approved', DATEADD(day, -1, GETDATE())),
(4, 2, 'Approved', DATEADD(day, -2, GETDATE())),
(5, 1, 'Approved', DATEADD(day, -4, GETDATE()));

-- If there is an issue in the Quests, SavedQuests orQuestApplicants Insertion. DROP All the tables, run schemq.sql again and then this
