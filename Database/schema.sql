-- CREATE DATABASE SideQuestDB;
-- USE SideQuestDB;

-- 1. Users Table
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    CnicNumber NVARCHAR(20) UNIQUE,
    IsKycVerified BIT DEFAULT 0,
    Rating DECIMAL(3,2) DEFAULT 0.00,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 2. Quests Table
CREATE TABLE Quests (
    QuestID INT IDENTITY(1,1) PRIMARY KEY,
    QuestGiverID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    QuestType VARCHAR(50) CHECK (QuestType IN ('Errand', 'Social')) NOT NULL,
    Status VARCHAR(50) DEFAULT 'Open' CHECK (Status IN ('Open', 'Accepted', 'InProgress', 'Completed', 'Cancelled', 'Expired')),
    RewardAmount DECIMAL(10, 2) DEFAULT 0.00,
    Location VARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    ExpiresAt DATETIME NOT NULL,
    FOREIGN KEY (QuestGiverID) REFERENCES Users(UserID)
);

-- 3. SavedQuests (Bookmarks) Table
CREATE TABLE SavedQuests (
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    QuestID INT NOT NULL FOREIGN KEY REFERENCES Quests(QuestID),
    SavedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (UserID, QuestID)
);