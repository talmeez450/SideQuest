-- CREATE DATABASE SideQuestDB;
-- USE SideQuestDB;

-- 1. ADVENTURERS (USERS) TABLE
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    CnicNumber NVARCHAR(20) NOT NULL UNIQUE,
    WalletBalance DECIMAL(10, 2) DEFAULT 1000.00,
    EscrowBalance DECIMAL(10, 2) DEFAULT 0.00,
    Rating DECIMAL(10, 2) DEFAULT 0.00,
    TotalRatingsCount INT DEFAULT 0,
    IsKycVerified BIT DEFAULT 0,
    KycStatus NVARCHAR(20) DEFAULT 'None',
    CnicFrontUrl VARCHAR(MAX) NULL,
    CnicBackUrl VARCHAR(MAX) NULL,
    AvatarUrl VARCHAR(MAX) NULL,
    IsAdmin BIT DEFAULT 0,
    IsSuspended BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 2. BOUNTIES (QUESTS) TABLE
CREATE TABLE Quests (
    QuestID INT IDENTITY(1,1) PRIMARY KEY,
    QuestGiverID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    QuestTakerID INT NULL FOREIGN KEY REFERENCES Users(UserID),
    Title NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    QuestType NVARCHAR(50) CHECK (QuestType IN ('Social', 'Errand')) NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Open' CHECK (Status IN ('Open', 'Accepted', 'InProgress', 'Completed', 'Cancelled', 'Expired')),
    RewardAmount DECIMAL(10, 2) DEFAULT 0.00,
    Location NVARCHAR(255) NOT NULL,
    GiverMarkedComplete BIT DEFAULT 0,
    TakerMarkedComplete BIT DEFAULT 0,
    GiverRated BIT DEFAULT 0,
    TakerRated BIT DEFAULT 0,
    ExpiresAt DATETIME NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 3. SAVED QUESTS (BOOKMARKS) TABLE
CREATE TABLE SavedQuests (
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    QuestID INT NOT NULL FOREIGN KEY REFERENCES Quests(QuestID),
    SavedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (UserID, QuestID) 
);

-- 4. QUEST APPLICANTS (WAITLIST) TABLE
CREATE TABLE QuestApplicants (
    QuestID INT NOT NULL FOREIGN KEY REFERENCES Quests(QuestID),
    ApplicantID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    ApplicationStatus NVARCHAR(50) DEFAULT 'Pending' CHECK (ApplicationStatus IN ('Pending', 'Approved', 'Rejected')),
    AppliedAt DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (QuestID, ApplicantID)
);

-- 5. TAVERN MESSAGES (DIRECT CHAT) TABLE
CREATE TABLE TavernMessages (
    MessageID INT IDENTITY(1,1) PRIMARY KEY,
    QuestID INT NOT NULL FOREIGN KEY REFERENCES Quests(QuestID),
    SenderID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    ReceiverID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Content NVARCHAR(500) NOT NULL,
    CreatedAt DATETIME DEFAULT GETUTCDATE()
);

-- 6. REPUTATION LEDGER (RATINGS) TABLE
CREATE TABLE Ratings (
    RatingID INT IDENTITY(1,1) PRIMARY KEY,
    QuestID INT NOT NULL FOREIGN KEY REFERENCES Quests(QuestID),
    RaterID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    RateeID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
    Stars INT NOT NULL CHECK (Stars BETWEEN 0 AND 5),
    Feedback NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UNIQUE (QuestID, RaterID)
);
