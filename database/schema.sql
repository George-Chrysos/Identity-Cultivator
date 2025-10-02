-- Cultivator Identity System Database Schema
-- This file documents the database structure for future implementation

-- Users table
CREATE TABLE Users (
    UserID VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Tier ENUM('D', 'C', 'B', 'A', 'S') DEFAULT 'D',
    TotalDaysActive INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastActiveDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tier (Tier),
    INDEX idx_last_active (LastActiveDate)
);

-- Identities table
CREATE TABLE Identities (
    IdentityID VARCHAR(50) PRIMARY KEY,
    UserID VARCHAR(50) NOT NULL,
    Title VARCHAR(200) NOT NULL,
    ImageUrl VARCHAR(500),
    Tier ENUM('D', 'C', 'B', 'A', 'S') DEFAULT 'D',
    Level INT DEFAULT 1,
    DaysCompleted INT DEFAULT 0,
    RequiredDaysPerLevel INT DEFAULT 5,
    IsActive BOOLEAN DEFAULT TRUE,
    LastCompletedDate TIMESTAMP NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IdentityType ENUM('CULTIVATOR', 'FITNESS', 'LEARNING', 'CREATIVE', 'SOCIAL') DEFAULT 'CULTIVATOR',
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX idx_user_active (UserID, IsActive),
    INDEX idx_tier_level (Tier, Level),
    INDEX idx_identity_type (IdentityType)
);

-- UserProgress table
CREATE TABLE UserProgress (
    UserProgressID VARCHAR(50) PRIMARY KEY,
    UserID VARCHAR(50) NOT NULL,
    IdentityID VARCHAR(50) NOT NULL,
    DaysCompleted INT DEFAULT 0,
    Level INT DEFAULT 1,
    Tier ENUM('D', 'C', 'B', 'A', 'S') DEFAULT 'D',
    CompletedToday BOOLEAN DEFAULT FALSE,
    LastUpdatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    StreakDays INT DEFAULT 0,
    MissedDays INT DEFAULT 0,
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (IdentityID) REFERENCES Identities(IdentityID) ON DELETE CASCADE,
    UNIQUE KEY unique_user_identity (UserID, IdentityID),
    INDEX idx_progress_date (LastUpdatedDate),
    INDEX idx_streak (StreakDays DESC)
);

-- TaskCompletions table (for historical tracking)
CREATE TABLE TaskCompletions (
    CompletionID VARCHAR(50) PRIMARY KEY,
    UserID VARCHAR(50) NOT NULL,
    IdentityID VARCHAR(50) NOT NULL,
    CompletionDate DATE NOT NULL,
    CompletedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Reversed BOOLEAN DEFAULT FALSE,
    ReversedAt TIMESTAMP NULL,
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,  
    FOREIGN KEY (IdentityID) REFERENCES Identities(IdentityID) ON DELETE CASCADE,
    UNIQUE KEY unique_daily_completion (UserID, IdentityID, CompletionDate),
    INDEX idx_completion_date (CompletionDate DESC),
    INDEX idx_user_completions (UserID, CompletionDate DESC)
);

-- Sample queries for common operations:

-- 1. Get user's active identities sorted by tier and level
SELECT i.*, p.DaysCompleted, p.CompletedToday, p.StreakDays
FROM Identities i
JOIN UserProgress p ON i.IdentityID = p.IdentityID
WHERE i.UserID = ? AND i.IsActive = TRUE
ORDER BY 
    FIELD(i.Tier, 'S', 'A', 'B', 'C', 'D'),
    i.Level DESC;

-- 2. Check if user completed task today
SELECT CompletedToday, LastUpdatedDate
FROM UserProgress
WHERE UserID = ? AND IdentityID = ?
AND DATE(LastUpdatedDate) = CURDATE();

-- 3. Update progress after task completion
UPDATE UserProgress 
SET 
    DaysCompleted = DaysCompleted + 1,
    CompletedToday = TRUE,
    LastUpdatedDate = NOW(),
    StreakDays = StreakDays + 1
WHERE UserID = ? AND IdentityID = ?;

-- 4. Handle level up and evolution
UPDATE Identities 
SET 
    Level = CASE 
        WHEN DaysCompleted >= RequiredDaysPerLevel AND Level < 10 THEN Level + 1
        WHEN DaysCompleted >= RequiredDaysPerLevel AND Level = 10 THEN 1
        ELSE Level
    END,
    Tier = CASE 
        WHEN DaysCompleted >= RequiredDaysPerLevel AND Level = 10 THEN
            CASE Tier 
                WHEN 'D' THEN 'C'
                WHEN 'C' THEN 'B'
                WHEN 'B' THEN 'A'
                WHEN 'A' THEN 'S'
                ELSE 'S'
            END
        ELSE Tier
    END,
    RequiredDaysPerLevel = CASE 
        WHEN DaysCompleted >= RequiredDaysPerLevel AND Level = 10 THEN
            CASE Tier 
                WHEN 'D' THEN 10  -- Tier C
                WHEN 'C' THEN 15  -- Tier B
                WHEN 'B' THEN 20  -- Tier A
                WHEN 'A' THEN 30  -- Tier S
                ELSE 30
            END
        ELSE RequiredDaysPerLevel
    END,
    DaysCompleted = CASE 
        WHEN DaysCompleted >= RequiredDaysPerLevel THEN DaysCompleted - RequiredDaysPerLevel
        ELSE DaysCompleted
    END
WHERE IdentityID = ?;

-- 5. Apply decay for missed days
UPDATE UserProgress 
SET 
    DaysCompleted = GREATEST(0, DaysCompleted - ?),
    MissedDays = MissedDays + ?,
    StreakDays = 0
WHERE UserID = ? 
AND DATEDIFF(NOW(), LastUpdatedDate) >= 3;

-- 6. Get user's best tier for overall ranking
SELECT MAX(
    CASE Tier 
        WHEN 'S' THEN 5
        WHEN 'A' THEN 4
        WHEN 'B' THEN 3
        WHEN 'C' THEN 2
        WHEN 'D' THEN 1
    END
) as BestTierValue,
CASE 
    WHEN MAX(CASE Tier WHEN 'S' THEN 5 WHEN 'A' THEN 4 WHEN 'B' THEN 3 WHEN 'C' THEN 2 WHEN 'D' THEN 1 END) = 5 THEN 'S'
    WHEN MAX(CASE Tier WHEN 'S' THEN 5 WHEN 'A' THEN 4 WHEN 'B' THEN 3 WHEN 'C' THEN 2 WHEN 'D' THEN 1 END) = 4 THEN 'A'
    WHEN MAX(CASE Tier WHEN 'S' THEN 5 WHEN 'A' THEN 4 WHEN 'B' THEN 3 WHEN 'C' THEN 2 WHEN 'D' THEN 1 END) = 3 THEN 'B'
    WHEN MAX(CASE Tier WHEN 'S' THEN 5 WHEN 'A' THEN 4 WHEN 'B' THEN 3 WHEN 'C' THEN 2 WHEN 'D' THEN 1 END) = 2 THEN 'C'
    ELSE 'D'
END as BestTier
FROM Identities 
WHERE UserID = ?;
