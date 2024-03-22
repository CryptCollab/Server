CREATE DATABASE cryptcollab;

USE cryptcollab;

CREATE TABLE `users` (
	`user_id` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL UNIQUE,
	`user_name` varchar(255) NOT NULL UNIQUE,
	`password` varchar(255) NOT NULL,
	PRIMARY KEY (`user_id`)
);

CREATE TABLE `user_list` (
	`user_id` varchar(255) NOT NULL,
	`document_id` varchar(255) NOT NULL
);

CREATE TABLE `documents` (
	`document_id` varchar(255) NOT NULL,
	`owner` varchar(255) NOT NULL,
	PRIMARY KEY (`document_id`)
);

ALTER TABLE `user_list` ADD CONSTRAINT `user_list_fk0` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`);

ALTER TABLE `user_list` ADD CONSTRAINT `user_list_fk1` FOREIGN KEY (`document_id`) REFERENCES `documents`(`document_id`);

ALTER TABLE `documents` ADD CONSTRAINT `documents_fk0` FOREIGN KEY (`owner`) REFERENCES `users`(`user_id`);


INSERT INTO `users` VALUES ('01231','chyna83@vandervort.com','agulgowski','dab0ad4b3b0c85bb73ee6ee2b8a47718762050fa'),('942','bessie74@hessel.com','louie.hickle','fe053e155ff3970445b43fc997025011201b122a'),('84131','west.roy@hotmail.com','angelina.kuvalis','b1e326164b52f8f7eeb3d64c9c280afd6d8c5ef8');





