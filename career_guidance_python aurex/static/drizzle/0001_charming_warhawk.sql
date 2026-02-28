CREATE TABLE `careerPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`educationLevel` varchar(100) NOT NULL,
	`educationField` varchar(255) NOT NULL,
	`careerGoals` text NOT NULL,
	`aiAnalysis` json NOT NULL,
	`mindmapData` json,
	`timelineData` json,
	`skillsRecommendation` json,
	`resourcesRecommendation` json,
	`status` enum('draft','active','completed','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `careerPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`careerPlanId` int,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`careerPlanId` int NOT NULL,
	`milestoneId` int,
	`notificationType` enum('milestone_reminder','resource_suggestion','progress_checkin') NOT NULL,
	`subject` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('sent','failed','pending') NOT NULL DEFAULT 'pending',
	CONSTRAINT `emailNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`careerPlanId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetDate` timestamp NOT NULL,
	`category` varchar(100) NOT NULL,
	`status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
	`notificationSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`careerPlanId` int NOT NULL,
	`skillName` varchar(255) NOT NULL,
	`skillType` enum('technical','soft') NOT NULL,
	`proficiencyLevel` enum('beginner','intermediate','advanced','expert') NOT NULL DEFAULT 'beginner',
	`importance` enum('critical','important','nice_to_have') NOT NULL DEFAULT 'important',
	`learningResources` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skills_id` PRIMARY KEY(`id`)
);
