CREATE TABLE `planShares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`careerPlanId` int NOT NULL,
	`shareToken` varchar(255) NOT NULL,
	`sharedBy` int NOT NULL,
	`shareType` enum('link','email','social') NOT NULL DEFAULT 'link',
	`expiresAt` timestamp,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `planShares_id` PRIMARY KEY(`id`),
	CONSTRAINT `planShares_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `planVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`careerPlanId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`changes` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `planVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `loginMethod` varchar(64) DEFAULT 'email';--> statement-breakpoint
ALTER TABLE `careerPlans` ADD `userTimelineMonths` int;--> statement-breakpoint
ALTER TABLE `careerPlans` ADD `progress` decimal(5,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `milestones` ADD `completedAt` timestamp;--> statement-breakpoint
ALTER TABLE `skills` ADD `isCompleted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `skills` ADD `completedAt` timestamp;--> statement-breakpoint
ALTER TABLE `skills` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `age` int;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `theme` enum('light','dark') DEFAULT 'light' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);