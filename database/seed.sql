-- SideQuest: Sprint 1 Sample Data (Seed)
-- Run this AFTER creating your tables with schema.sql

-- 1. Insert Guild Members (Users)
-- NOTE: The PasswordHash for all these users is exactly: password123
INSERT INTO Users (FullName, Email, PasswordHash, CnicNumber)
VALUES 
('Talmeez ur Rehman', 'talmeez@sidequest.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', '12345-1234567-1'),
('Muhammad Yaseen', 'yaseen@sidequest.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', '12345-1234567-2'),
('Taimur Amir', 'taimur@sidequest.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', '12345-1234567-3');

-- 2. Insert Bounties (Quests)
-- Assuming the users above got UserID 1, 2, and 3 respectively due to IDENTITY(1,1)
INSERT INTO Quests (QuestGiverID, Title, Description, QuestType, RewardAmount, Location, ExpiresAt, Status)
VALUES 
-- Talmeez's Quests (UserID 1)
(1, 'Need a 5th player for Futsal', 'Looking for a solid defender for a 1-hour game tonight. No sliding tackles please, my ankles are fragile!', 'Social', 0.00, 'Model Town FC', DATEADD(day, 2, GETDATE()), 'Open'),
(1, 'UI/UX Testing Subjects Needed', 'Need 3 brave souls to click around my new interface and tell me if it breaks.', 'Errand', 500.00, 'FAST NUCES Lab 3', DATEADD(day, 5, GETDATE()), 'Open'),

-- Yaseen's Quests (UserID 2)
(2, 'Pick up my dry cleaning', 'Need someone to pick up 3 suits from the laundry. I am stuck at work fighting dragons (spreadsheets).', 'Errand', 300.00, 'DHA Phase 5', DATEADD(day, 1, GETDATE()), 'Open'),
(2, 'Backend Bug Hunt', 'My Express routes are acting possessed. Offering gold to anyone who can cast a debugging spell on them.', 'Errand', 1000.00, 'Discord Server', DATEADD(day, 3, GETDATE()), 'Open'),

-- Taimur's Quests (UserID 3)
(3, 'Board Game Night Tavern Gather', 'Hosting a D&D one-shot. Snacks provided, bring your own lucky dice.', 'Social', 0.00, 'Johar Town', DATEADD(day, 7, GETDATE()), 'Open'),
(3, 'Help moving a heavy cursed artifact', 'Okay, it is just a sofa, but it feels cursed. Need one strong adventurer to help me move it up two flights of stairs.', 'Errand', 1500.00, 'Gulberg III', DATEADD(day, 4, GETDATE()), 'Open');

-- 3. Insert Bookmarks (SavedQuests)
INSERT INTO SavedQuests (UserID, QuestID)
VALUES 
(2, 1),
(3, 3),
(3, 1),
(1, 5);

-- If there is an issue in the Quests or SavedQuests Insertion. DROP All the tables, run schemq.sql again and then this