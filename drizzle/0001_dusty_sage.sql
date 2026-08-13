CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` int,
	`beforeData` text,
	`afterData` text,
	`ipAddress` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documentTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`documentType` varchar(100) NOT NULL,
	`body` text NOT NULL,
	`variables` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documentTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dossierId` int,
	`schoolId` int,
	`officeId` int,
	`title` varchar(240) NOT NULL,
	`documentType` varchar(100) NOT NULL,
	`category` varchar(100),
	`reference` varchar(180),
	`version` int NOT NULL DEFAULT 1,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(1000) NOT NULL,
	`mimeType` varchar(160) NOT NULL,
	`fileSize` int,
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dossierEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dossierId` int NOT NULL,
	`action` varchar(80) NOT NULL,
	`fromStatus` varchar(60),
	`toStatus` varchar(60),
	`fromOfficeId` int,
	`toOfficeId` int,
	`comment` text,
	`actorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dossierEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dossiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(180) NOT NULL,
	`subject` varchar(240) NOT NULL,
	`description` text,
	`source` varchar(120) NOT NULL,
	`sender` varchar(180) NOT NULL,
	`externalReference` varchar(120),
	`schoolId` int,
	`currentOfficeId` int,
	`status` varchar(60) NOT NULL DEFAULT 'received',
	`priority` varchar(30) NOT NULL DEFAULT 'normal',
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`dueAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dossiers_id` PRIMARY KEY(`id`),
	CONSTRAINT `dossiers_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(80) NOT NULL,
	`title` varchar(200) NOT NULL,
	`body` text NOT NULL,
	`entityType` varchar(80),
	`entityId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offices_id` PRIMARY KEY(`id`),
	CONSTRAINT `offices_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(100) NOT NULL,
	`label` varchar(180) NOT NULL,
	`module` varchar(80) NOT NULL,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schoolId` int NOT NULL,
	`reportType` varchar(100) NOT NULL,
	`period` varchar(60) NOT NULL,
	`status` varchar(60) NOT NULL DEFAULT 'received',
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(1000) NOT NULL,
	`observations` text,
	`submittedBy` int NOT NULL,
	`reviewedBy` int,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rolePermissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` varchar(64) NOT NULL,
	`permissionId` int NOT NULL,
	CONSTRAINT `rolePermissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `rolePermissions_role_permissionId_unique` UNIQUE(`role`,`permissionId`)
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(80) NOT NULL,
	`officialName` varchar(220) NOT NULL,
	`schoolType` varchar(80) NOT NULL,
	`level` varchar(120) NOT NULL,
	`directorName` varchar(160),
	`phone` varchar(40),
	`email` varchar(320),
	`province` varchar(100) DEFAULT 'Sud-Kivu',
	`territory` varchar(120),
	`commune` varchar(120),
	`quartier` varchar(120),
	`status` varchar(60) NOT NULL DEFAULT 'active',
	`legalStatus` varchar(100),
	`decreeNumber` varchar(100),
	`decreeDate` timestamp,
	`studentCount` int NOT NULL DEFAULT 0,
	`femaleStudentCount` int NOT NULL DEFAULT 0,
	`maleStudentCount` int NOT NULL DEFAULT 0,
	`teacherCount` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schools_id` PRIMARY KEY(`id`),
	CONSTRAINT `schools_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `sequences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`namespace` varchar(100) NOT NULL,
	`year` int NOT NULL,
	`prefix` varchar(160),
	`nextValue` int NOT NULL DEFAULT 1,
	`padding` int NOT NULL DEFAULT 4,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sequences_id` PRIMARY KEY(`id`),
	CONSTRAINT `sequences_namespace_year_unique` UNIQUE(`namespace`,`year`)
);
--> statement-breakpoint
CREATE TABLE `userOfficeAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`officeId` int NOT NULL,
	`jobTitle` varchar(160),
	`employeeNumber` varchar(80),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userOfficeAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','sous_proved','secretariat','chef_bureau','ops','inspecteur','ecole') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documentTemplates` ADD CONSTRAINT `documentTemplates_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_dossierId_dossiers_id_fk` FOREIGN KEY (`dossierId`) REFERENCES `dossiers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_officeId_offices_id_fk` FOREIGN KEY (`officeId`) REFERENCES `offices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_uploadedBy_users_id_fk` FOREIGN KEY (`uploadedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dossierEvents` ADD CONSTRAINT `dossierEvents_dossierId_dossiers_id_fk` FOREIGN KEY (`dossierId`) REFERENCES `dossiers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dossierEvents` ADD CONSTRAINT `dossierEvents_fromOfficeId_offices_id_fk` FOREIGN KEY (`fromOfficeId`) REFERENCES `offices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dossierEvents` ADD CONSTRAINT `dossierEvents_toOfficeId_offices_id_fk` FOREIGN KEY (`toOfficeId`) REFERENCES `offices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dossierEvents` ADD CONSTRAINT `dossierEvents_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dossiers` ADD CONSTRAINT `dossiers_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dossiers` ADD CONSTRAINT `dossiers_currentOfficeId_offices_id_fk` FOREIGN KEY (`currentOfficeId`) REFERENCES `offices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dossiers` ADD CONSTRAINT `dossiers_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reports` ADD CONSTRAINT `reports_schoolId_schools_id_fk` FOREIGN KEY (`schoolId`) REFERENCES `schools`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reports` ADD CONSTRAINT `reports_submittedBy_users_id_fk` FOREIGN KEY (`submittedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reports` ADD CONSTRAINT `reports_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rolePermissions` ADD CONSTRAINT `rolePermissions_permissionId_permissions_id_fk` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schools` ADD CONSTRAINT `schools_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userOfficeAssignments` ADD CONSTRAINT `userOfficeAssignments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userOfficeAssignments` ADD CONSTRAINT `userOfficeAssignments_officeId_offices_id_fk` FOREIGN KEY (`officeId`) REFERENCES `offices`(`id`) ON DELETE no action ON UPDATE no action;