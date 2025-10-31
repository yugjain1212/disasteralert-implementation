CREATE TABLE `disaster_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`severity` text NOT NULL,
	`magnitude` real,
	`description` text,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`timestamp` integer NOT NULL,
	`user_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
