CREATE TABLE `cars` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`year` integer
);
--> statement-breakpoint
CREATE TABLE `product_car_compatibility` (
	`product_id` integer NOT NULL,
	`car_id` integer NOT NULL,
	PRIMARY KEY(`product_id`, `car_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`shn_code` text NOT NULL,
	`oem_code` text NOT NULL,
	`category` text NOT NULL,
	`status` text NOT NULL,
	`image_url` text,
	`price` real,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_oem_code_unique` ON `products` (`oem_code`);