CREATE TABLE `assignmentCommissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(180) NOT NULL,
	`agentDinacope` varchar(80) NOT NULL,
	`agentName` varchar(180) NOT NULL,
	`postName` varchar(160),
	`firstName` varchar(160),
	`gender` varchar(20),
	`diploma` varchar(100),
	`option` varchar(160),
	`destinationSchoolId` int NOT NULL,
	`destinationFunction` varchar(160) NOT NULL,
	`functionGrade` varchar(80),
	`actNature` varchar(100) NOT NULL,
	`actReference` varchar(120),
	`actDate` timestamp,
	`effectiveDate` timestamp,
	`replacedAgentDinacope` varchar(80),
	`reason` varchar(120),
	`previousSchoolName` varchar(220),
	`previousSchoolCode` varchar(80),
	`previousFunction` varchar(160),
	`previousProvince` varchar(120),
	`previousSubDivision` varchar(160),
	`status` varchar(60) NOT NULL DEFAULT 'draft',
	`createdBy` int NOT NULL,
	`signedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assignmentCommissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `assignmentCommissions_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `schoolBulletinRecipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bulletinId` int NOT NULL,
	`schoolId` int NOT NULL,
	`readAt` timestamp,
	`acknowledgedAt` timestamp,
	CONSTRAINT `schoolBulletinRecipients_id` PRIMARY KEY(`id`),
	CONSTRAINT `schoolBulletinRecipients_bulletinId_schoolId_unique` UNIQUE(`bulletinId`,`schoolId`)
);
--> statement-breakpoint
CREATE TABLE `schoolBulletins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(180) NOT NULL,
	`title` varchar(240) NOT NULL,
	`body` text NOT NULL,
	`audience` varchar(30) NOT NULL DEFAULT 'targeted',
	`documentId` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `schoolBulletins_id` PRIMARY KEY(`id`),
	CONSTRAINT `schoolBulletins_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `schoolStaff` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schoolId` int NOT NULL,
	`fullName` varchar(180) NOT NULL,
	`gender` varchar(20),
	`functionTitle` varchar(160) NOT NULL,
	`qualification` varchar(120),
	`employeeNumber` varchar(80),
	`status` varchar(60) NOT NULL DEFAULT 'active',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schoolStaff_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schoolStatistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schoolId` int NOT NULL,
	`schoolYear` varchar(20) NOT NULL,
	`studentCount` int NOT NULL DEFAULT 0,
	`femaleStudentCount` int NOT NULL DEFAULT 0,
	`maleStudentCount` int NOT NULL DEFAULT 0,
	`teacherCount` int NOT NULL DEFAULT 0,
	`classroomCount` int NOT NULL DEFAULT 0,
	`status` varchar(40) NOT NULL DEFAULT 'draft',
	`submittedBy` int NOT NULL,
	`reviewedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schoolStatistics_id` PRIMARY KEY(`id`),
	CONSTRAINT `schoolStatistics_schoolId_schoolYear_unique` UNIQUE(`schoolId`,`schoolYear`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `schoolId` int;--> statement-breakpoint
ALTER TABLE `assignmentCommissions` ADD CONSTRAINT `assignmentCommissions_destinationSchoolId_schools_id_fk` FOREIGN KEY (`destinationSchoolId`) REFERENCES `schools`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assignmentCommissions` ADD CONSTRAINT `assignmentCommissions_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assignmentCommissions` ADD CONSTRAINT `assignmentCommissions_signedBy_users_id_fk` FOREIGN KEY (`signedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schoolBulletinRecipients` ADD CONSTRAINT `schoolBulletinRecipients_bulletinId_schoolBulletins_id_fk` FOREIGN KEY (`bulletinId`) REFERENCES `schoolBulletins`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schoolBulletinRecipients` ADD CONSTRAINT `schoolBulletinRecipients_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schoolBulletins` ADD CONSTRAINT `schoolBulletins_documentId_documents_id_fk` FOREIGN KEY (`documentId`) REFERENCES `documents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schoolBulletins` ADD CONSTRAINT `schoolBulletins_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schoolStaff` ADD CONSTRAINT `schoolStaff_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schoolStaff` ADD CONSTRAINT `schoolStaff_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schoolStatistics` ADD CONSTRAINT `schoolStatistics_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schoolStatistics` ADD CONSTRAINT `schoolStatistics_submittedBy_users_id_fk` FOREIGN KEY (`submittedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schoolStatistics` ADD CONSTRAINT `schoolStatistics_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;