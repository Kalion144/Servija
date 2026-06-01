CREATE TABLE `profissionais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`senha` varchar(255) NOT NULL,
	`profissao` varchar(255) NOT NULL,
	`cidade` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	CONSTRAINT `profissionais_id` PRIMARY KEY(`id`),
	CONSTRAINT `profissionais_email_unique` UNIQUE(`email`)
);
