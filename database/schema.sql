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
    CreatedAt DATETIME DEFAULT GETDATE(),
    EscrowBalance DECIMAL(10, 2) DEFAULT 0.00,
    WalletBalance DECIMAL(10, 2) DEFAULT 1000.00
);

-- 2. Quests Table
CREATE TABLE Quests (
    QuestID INT IDENTITY(1,1) PRIMARY KEY,
    QuestGiverID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    QuestTakerID INT NULL FOREIGN KEY REFERENCES Users(UserID), -- NEW: The brave soul chosen for the task! (NULL until accepted)
    Title NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    QuestType NVARCHAR(50) CHECK (QuestType IN ('Social', 'Errand')) NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Open' CHECK (Status IN ('Open', 'Accepted', 'InProgress', 'Completed', 'Cancelled', 'Expired')),
    RewardAmount DECIMAL(10, 2) DEFAULT 0.00,
    Location NVARCHAR(255) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    ExpiresAt DATETIME NOT NULL,
    GiverMarkedComplete BIT DEFAULT 0,
    TakerMarkedComplete BIT DEFAULT 0
);

-- 3. SavedQuests (Bookmarks) Table
CREATE TABLE SavedQuests (
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    QuestID INT NOT NULL FOREIGN KEY REFERENCES Quests(QuestID),
    SavedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (UserID, QuestID) 
);

-- 4. QuestApplicants Table
CREATE TABLE QuestApplicants (
    QuestID INT NOT NULL FOREIGN KEY REFERENCES Quests(QuestID),
    ApplicantID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    AppliedAt DATETIME DEFAULT GETDATE(),
    ApplicationStatus NVARCHAR(50) DEFAULT 'Pending' CHECK (ApplicationStatus IN ('Pending', 'Approved', 'Rejected')),
    PRIMARY KEY (QuestID, ApplicantID)
);
