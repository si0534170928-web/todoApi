-- Create the todoapi database and tables
USE todoapi;

-- ASP.NET Identity Tables
CREATE TABLE IF NOT EXISTS `AspNetRoles` (
    `Id` varchar(255) NOT NULL,
    `Name` varchar(256) DEFAULT NULL,
    `NormalizedName` varchar(256) DEFAULT NULL,
    `ConcurrencyStamp` longtext,
    PRIMARY KEY (`Id`),
    UNIQUE KEY `RoleNameIndex` (`NormalizedName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AspNetUsers` (
    `Id` varchar(255) NOT NULL,
    `UserName` varchar(256) DEFAULT NULL,
    `NormalizedUserName` varchar(256) DEFAULT NULL,
    `Email` varchar(256) DEFAULT NULL,
    `NormalizedEmail` varchar(256) DEFAULT NULL,
    `EmailConfirmed` tinyint(1) NOT NULL DEFAULT 0,
    `PasswordHash` longtext,
    `SecurityStamp` longtext,
    `ConcurrencyStamp` longtext,
    `PhoneNumber` longtext,
    `PhoneNumberConfirmed` tinyint(1) NOT NULL DEFAULT 0,
    `TwoFactorEnabled` tinyint(1) NOT NULL DEFAULT 0,
    `LockoutEnd` datetime(6) DEFAULT NULL,
    `LockoutEnabled` tinyint(1) NOT NULL DEFAULT 0,
    `AccessFailedCount` int NOT NULL DEFAULT 0,
    `DisplayName` longtext,
    `CreatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`Id`),
    UNIQUE KEY `UserNameIndex` (`NormalizedUserName`),
    KEY `EmailIndex` (`NormalizedEmail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AspNetUserRoles` (
    `UserId` varchar(255) NOT NULL,
    `RoleId` varchar(255) NOT NULL,
    PRIMARY KEY (`UserId`,`RoleId`),
    KEY `IX_AspNetUserRoles_RoleId` (`RoleId`),
    CONSTRAINT `FK_AspNetUserRoles_AspNetRoles_RoleId` 
        FOREIGN KEY (`RoleId`) REFERENCES `AspNetRoles` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_AspNetUserRoles_AspNetUsers_UserId` 
        FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AspNetUserClaims` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `UserId` varchar(255) NOT NULL,
    `ClaimType` longtext,
    `ClaimValue` longtext,
    PRIMARY KEY (`Id`),
    KEY `IX_AspNetUserClaims_UserId` (`UserId`),
    CONSTRAINT `FK_AspNetUserClaims_AspNetUsers_UserId` 
        FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AspNetUserLogins` (
    `LoginProvider` varchar(255) NOT NULL,
    `ProviderKey` varchar(255) NOT NULL,
    `ProviderDisplayName` longtext,
    `UserId` varchar(255) NOT NULL,
    PRIMARY KEY (`LoginProvider`,`ProviderKey`),
    KEY `IX_AspNetUserLogins_UserId` (`UserId`),
    CONSTRAINT `FK_AspNetUserLogins_AspNetUsers_UserId` 
        FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AspNetUserTokens` (
    `UserId` varchar(255) NOT NULL,
    `LoginProvider` varchar(255) NOT NULL,
    `Name` varchar(255) NOT NULL,
    `Value` longtext,
    PRIMARY KEY (`UserId`,`LoginProvider`,`Name`),
    CONSTRAINT `FK_AspNetUserTokens_AspNetUsers_UserId` 
        FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AspNetRoleClaims` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `RoleId` varchar(255) NOT NULL,
    `ClaimType` longtext,
    `ClaimValue` longtext,
    PRIMARY KEY (`Id`),
    KEY `IX_AspNetRoleClaims_RoleId` (`RoleId`),
    CONSTRAINT `FK_AspNetRoleClaims_AspNetRoles_RoleId` 
        FOREIGN KEY (`RoleId`) REFERENCES `AspNetRoles` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Todos Table
CREATE TABLE IF NOT EXISTS `Todos` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Title` varchar(200) NOT NULL,
    `Description` varchar(1000) DEFAULT NULL,
    `IsCompleted` tinyint(1) NOT NULL DEFAULT 0,
    `CreatedDate` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `CompletedDate` datetime(6) DEFAULT NULL,
    `UserId` varchar(255) NOT NULL,
    PRIMARY KEY (`Id`),
    KEY `IX_Todos_UserId` (`UserId`),
    CONSTRAINT `FK_Todos_AspNetUsers_UserId` 
        FOREIGN KEY (`UserId`) REFERENCES `AspNetUsers` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration History Table
CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) NOT NULL,
    `ProductVersion` varchar(32) NOT NULL,
    PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Migration Records
INSERT IGNORE INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`) VALUES
('20251106221712_InitialCreate', '8.0.0'),
('20251202154256_AddUserIdentitySupport', '8.0.0');

-- Create Default User for Testing
INSERT IGNORE INTO `AspNetUsers` (
    `Id`, 
    `UserName`, 
    `NormalizedUserName`, 
    `Email`, 
    `NormalizedEmail`, 
    `DisplayName`,
    `CreatedAt`,
    `EmailConfirmed`,
    `PhoneNumberConfirmed`,
    `TwoFactorEnabled`,
    `LockoutEnabled`,
    `AccessFailedCount`,
    `PasswordHash`,
    `SecurityStamp`,
    `ConcurrencyStamp`
) VALUES (
    'default-user',
    'defaultuser',
    'DEFAULTUSER',
    'default@todoapp.com',
    'DEFAULT@TODOAPP.COM',
    'Default User',
    UTC_TIMESTAMP(),
    0, 0, 0, 0, 0,
    'AQAAAAIAAYagAAAAEH8v7DrqTwdmQwdRDUtd7eKqF8c9VYo8bvlm1zKc0v2+g8Vc1O8rOuPzB2CrmG7gCw==',
    'XQCJPQD6SFKQSV3U4AXFQNBCGSJDWK3M',
    '12345678-1234-1234-1234-123456789abc'
);

-- Insert Sample Todo Data
INSERT IGNORE INTO `Todos` (
    `Title`, 
    `Description`, 
    `IsCompleted`, 
    `CreatedDate`, 
    `CompletedDate`, 
    `UserId`
) VALUES
('Complete the project', 'Finish the todo application with all features', 0, UTC_TIMESTAMP(), NULL, 'default-user'),
('Buy groceries', 'Milk, bread, eggs, and vegetables', 0, UTC_TIMESTAMP(), NULL, 'default-user'),
('Read a book', 'Start reading the new programming book', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY), UTC_TIMESTAMP(), 'default-user');