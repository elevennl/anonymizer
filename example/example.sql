# ************************************************************
# Sequel Ace SQL dump
# Version 20021
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# Host: 127.0.0.1 (MySQL 5.7.36)
# Database: example
# Generation Time: 2022-01-06 20:54:44 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table dummy_data
# ------------------------------------------------------------

DROP TABLE IF EXISTS `dummy_data`;

CREATE TABLE `dummy_data` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(250) DEFAULT NULL,
  `first_name` varchar(250) DEFAULT NULL,
  `last_name` varchar(250) DEFAULT NULL,
  `street` varchar(250) DEFAULT NULL,
  `city` varchar(250) DEFAULT NULL,
  `email` varchar(250) DEFAULT NULL,
  `telephone` varchar(250) DEFAULT NULL,
  `custom_column` varchar(250) DEFAULT NULL, /*Column for testing custom queries*/
  `ignored_column` varchar(250) DEFAULT NULL, /*Column to test if script still runs if column does exist in database, but not mentioned in config file*/
  PRIMARY KEY (`id`)
);

/*Table with empty columns to test if script still runs if table does exist in database, but not mentioned in config file*/
CREATE TABLE `ignored_table` (
                              `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
                              `username` varchar(250)       DEFAULT NULL,
                              PRIMARY KEY (`id`)
);

LOCK TABLES `dummy_data` WRITE;
/*!40000 ALTER TABLE `dummy_data` DISABLE KEYS */;

INSERT INTO `dummy_data` (`id`, `username`, `first_name`, `last_name`, `street`, `city`, `email`, `telephone`, `custom_column`)
VALUES
	(1,'user 1','first name 1','last name 1','street 1','city 1','email@email.nl','0612345678','test@eleven.nl'),
	(2,'user 2','first name 2','last name 2','street 2','city 2','email@email.nl','0612345678','test@domein.nl'),
	(3,'user 3','first name 3','last name 3','street 3','city 3','email@email.nl','0612345678','test@klant.nl');

/*!40000 ALTER TABLE `dummy_data` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
