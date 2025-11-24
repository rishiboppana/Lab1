-- MySQL dump 10.13  Distrib 8.0.43, for macos15 (x86_64)
--
-- Host: localhost    Database: airbnb
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `check_in` date DEFAULT NULL,
  `check_out` date DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Pending','Accepted','Cancelled') DEFAULT 'Pending',
  `guests` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_b_property_status_dates` (`property_id`,`status`,`check_in`,`check_out`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,6,1,'2025-10-24','2025-10-27',360.00,'2025-10-25 04:30:34','Cancelled',1),(2,7,5,'2025-10-25','2025-10-28',630.00,'2025-10-25 19:45:58','Accepted',1),(3,6,1,'2025-10-29','2025-10-31',NULL,'2025-10-26 00:35:29','Cancelled',1),(4,12,1,'2025-10-25','2025-10-26',NULL,'2025-10-26 00:36:14','Accepted',1),(5,12,1,'2025-10-06','2025-10-14',NULL,'2025-10-26 00:58:07','Accepted',1),(6,6,1,'2025-10-01','2025-10-04',NULL,'2025-10-26 01:47:07','Cancelled',1),(7,12,1,'2025-10-30','2025-10-31',NULL,'2025-10-26 01:52:16','Accepted',1),(8,8,1,'2025-10-27','2025-10-29',NULL,'2025-10-26 07:50:23','Cancelled',1),(9,8,1,'2025-10-26','2025-10-29',NULL,'2025-10-26 07:53:17','Accepted',1),(10,7,8,'2025-10-28','2025-10-29',NULL,'2025-10-27 02:27:02','Cancelled',1),(11,6,9,'2025-10-27','2025-10-28',NULL,'2025-10-27 18:59:48','Pending',1),(12,13,8,'2025-10-28','2025-10-29',NULL,'2025-10-27 20:27:06','Accepted',1),(13,6,1,'2025-11-01','2025-11-05',600.00,'2025-10-28 04:53:24','Pending',2),(14,13,1,'2025-10-31','2025-10-31',NULL,'2025-10-28 05:49:48','Pending',1),(15,6,14,'2025-11-25','2025-11-26',NULL,'2025-11-24 00:36:01','Accepted',1);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `traveler_id` int NOT NULL,
  `property_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorite` (`traveler_id`,`property_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Owners`
--

DROP TABLE IF EXISTS `Owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Owners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `about` json DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `languages` json DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `avatar_url` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Owners`
--

LOCK TABLES `Owners` WRITE;
/*!40000 ALTER TABLE `Owners` DISABLE KEYS */;
/*!40000 ALTER TABLE `Owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `title` varchar(140) NOT NULL,
  `type` varchar(60) DEFAULT NULL,
  `location` varchar(140) DEFAULT NULL,
  `description` text,
  `price_per_night` decimal(10,2) DEFAULT NULL,
  `bedrooms` int DEFAULT NULL,
  `bathrooms` int DEFAULT NULL,
  `amenities` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `number_of_guests` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_location` (`location`),
  KEY `idx_price` (`price_per_night`),
  KEY `idx_p_owner` (`owner_id`),
  CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (6,1,'Cozy Studio in Downtown','Apartment','Livermore','A bright studio with balcony, kitchen, and fast Wi-Fi — perfect for short stays.',120.00,1,1,'[\"WiFi\", \"Balcony\", \"Kitchen\", \"Air conditioning\"]','[\"https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800\"]','2025-10-25 01:07:35',1),(7,1,'Modern Apartment near Lake','Apartment','San Jose','Spacious 2-bedroom apartment with lake view, parking, and workspace.',210.00,2,1,'[\"Lake view\", \"Workspace\", \"Parking\", \"WiFi\"]','[\"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800\"]','2025-10-25 01:07:35',1),(8,2,'Beachfront Cottage','Cottage','Santa Cruz','Private beachfront cottage with deck, kitchen, and sea breeze.',280.00,3,2,'[\"Beach access\", \"Kitchen\", \"Deck\", \"Sea view\"]','[\"https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800\"]','2025-10-25 01:07:35',1),(11,4,'Sjsu','Apartment','San Jose','Good Place To Study',300.00,2,1,'[\"Wifi\", \"AC\", \"Elevators\"]','[\"/uploads/1761419080085-831601197-sjsu.jpeg\"]','2025-10-25 05:59:20',1),(12,5,'Motel Mp','Motel','Milpitas','',90.00,NULL,NULL,'[]','[\"/uploads/1761422982577-407518422-motel.webp\"]','2025-10-25 20:09:42',1),(13,2,'Home in Livermore','Studio','Livermore','This space is a private entry 275 square foot small studio with a  private bath, connected to the main house but with no access to the main house. The unit has a standard sized mini fridge, microwave and keurig coffee maker with coffees to choose from, a very mini toaster oven for one bagel or one piece of toast, lite snacks and waters for you. Also a small table and chair set, desk and a brand new queen sized bed, the location is great if you work at the lab or if visiting family in the area.',350.00,2,2,'[]','[\"/uploads/1761498344894-36303197-Screenshot2025-10-26at10.05.30â¯AM.png\"]','2025-10-26 17:04:41',1),(14,2,'Hotel','Room','Livermore','Live like a local at Aloft Dublin-Pleasanton—where bold style meets Bay Area energy. Grab tacos at Grafton Plaza, walk to outlet finds at San Francisco Premium Outlets, or hop on BART for a city adventure. Back at the property, chill poolside, sip cocktails at WXYZ Bar, or unwind in a space that feels more like your own studio than a standard room. Whether you\'re wine tasting in Livermore or exploring NorCal, this isn’t just a stay—it’s your East Bay home base.',400.00,3,2,'[]','[\"/uploads/1761498458992-338294340-Screenshot2025-10-26at10.07.30â¯AM.png\"]','2025-10-26 17:07:38',1),(15,2,'Bunglow','Compelte Home','Livermore','Welcome to your home away from home in our beautifully updated modern farmhouse. This spacious 2-bedroom, 2-bathroom ground floor flat offers all the comforts and conveniences you need for a perfect stay.  With an an expansive kitchen and a dedicated office you\'ll be tempted to stay in but at less than 1 mile from downtown Livermore, you\'ll find plenty of reasons to explore',212.00,2,2,'[]','[\"/uploads/1761498589792-433733963-Screenshot2025-10-26at10.08.24â¯AM.png\", \"/uploads/1761498589801-26740342-Screenshot2025-10-26at10.09.16â¯AM.png\", \"/uploads/1761498589805-443007361-Screenshot2025-10-26at10.09.24â¯AM.png\", \"/uploads/1761498589811-709261746-Screenshot2025-10-26at10.09.32â¯AM.png\"]','2025-10-26 17:09:49',4),(17,9,'Room in Livermore','Apartment','Livermore','',55.00,1,1,'[]','[\"/uploads/1761592860648-491298764-bc96b4fe-7ed0-4b37-8b32-0d3cc2adfefd.avif\"]','2025-10-27 19:21:00',1),(18,9,'Room in San jose','Apartment','San Jose','',45.00,1,1,'[]','[\"/uploads/1761592958837-645367682-d7ed527a-3bed-45e2-a8df-1414f0ce3463.avif\"]','2025-10-27 19:22:38',1),(19,10,'Cozy Downtown Apartment','apartment','San Francisco','Beautiful furnished apartment in downtown area',150.00,2,1,'[\"wifi\", \"kitchen\", \"ac\"]','[\"/uploads/1761760053810-834189386-OIP.webp\"]','2025-10-28 04:02:16',1),(24,1,'Test','Test','Pleasanton','TEst Property',200.00,NULL,NULL,'[]','[\"/uploads/1762666591038-72604842-IMG_1970.JPG\"]','2025-11-09 05:36:31',1),(25,1,'Eaves','Apartment','Dublin ','',200.00,1,1,'[]','[\"/uploads/1763941920283-96113908-eaves.jpg\"]','2025-11-23 23:52:00',1);
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `property_id` (`property_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (11,6,1,5,'Amazing stay! The studio was super clean and close to everything.','2025-10-25 01:53:24'),(12,6,2,4,'Nice place overall, balcony view was great but Wi-Fi was a bit slow.','2025-10-25 01:53:24'),(13,7,1,5,'Loved waking up to the lake view every morning.','2025-10-25 01:53:24'),(14,7,3,4,'Spacious and comfortable, could use better lighting.','2025-10-25 01:53:24'),(15,8,2,5,'Perfect beach getaway! The cottage is right on the sand.','2025-10-25 01:53:24'),(16,8,3,5,'Incredible location, spotless interiors and lovely host.','2025-10-25 01:53:24'),(21,6,1,5,'Good Place','2025-10-25 04:30:44'),(22,11,3,5,'Great place to wrok','2025-10-26 16:56:10'),(23,13,8,5,'good','2025-10-28 00:12:54'),(24,13,8,4,'nice','2025-10-28 02:57:53');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Travellers`
--

DROP TABLE IF EXISTS `Travellers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Travellers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `about` json DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `languages` json DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `avatar_url` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Travellers`
--

LOCK TABLES `Travellers` WRITE;
/*!40000 ALTER TABLE `Travellers` DISABLE KEYS */;
INSERT INTO `Travellers` VALUES (1,'rishi','rishi@traveler.com','$2b$10$Pm5Fn6iGzdfkImoES95xZehgKfK5riprCM6jXNn.oRmN9XD2GH/x6','9999988888',NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-16 03:59:22','2025-11-16 03:59:22'),(2,'owner1','owner@rent.com','$2b$10$ioziVktQm3kow.EQs3w9l.wnL7lhyyQ6qucHvdRomoP9UZgbDrv0W','7777777777',NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-16 18:45:42','2025-11-16 18:45:42');
/*!40000 ALTER TABLE `Travellers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` enum('traveler','owner') NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `about` text,
  `city` varchar(80) DEFAULT NULL,
  `country` varchar(80) DEFAULT NULL,
  `languages` varchar(120) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'owner','Rishi Traveler','traveler@test.com','$2b$10$agFM/A9dzo7D3rDxP.Evlu3pZR/WlABUM6yYShrIVlBMg7txETm3O',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-24 22:17:17'),(2,'owner','Rishi Owner','owner@test.com','$2b$10$B43jIB.YxA.LSyjIHoFLced8V7kWp4ZVhNo5262FNQLAHaVJxSrO.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-24 22:21:23'),(3,'owner','Rishi','rishi@gmail.com','$2b$10$ZJcdMOzjI.VwGOYJCwDT0.aHZuY.gQF.3oDP6t/eXYsgZAILFKNdC',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-25 01:07:11'),(4,'owner','Kapil','kapil@gmail.com','$2b$10$nZZFqNMAITm9YQ1fCnhRV.VOnP.Y3ns3oxkuPcGLzX2ClSRUInxoK',NULL,'Student at SanJose',NULL,NULL,NULL,NULL,NULL,'2025-10-25 04:53:12'),(5,'owner','Rishi','rishi2@gmail.com','$2b$10$BervaOdqUmamz/SxEfzLzOFw9siZi5ovMaifo.V3t1LjZyCtFaQKy','6509876543',NULL,'San Jose','US',NULL,'Male',NULL,'2025-10-25 04:55:35'),(6,'traveler','John','john@gmail.com','$2b$10$1WVVR7DqyaVUXyiG75mniuYBL6TsoVzEESmdLw6CuolEY4jArXZhe',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-25 20:39:04'),(7,'traveler','Alice','alice@example.com','$2b$10$oEvrga1YQH7VV3LMMdVSLeRPrj4saE307Gy1LMSUJmC.3ZRjl9vDC',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-25 20:44:32'),(8,'owner','kapils','s@gmail.com','$2b$10$9lPNkrNFzpCc12LV/tg3ze5rP4gGxJx6ZQSbg.tsZv5IpT.aUssaq',NULL,NULL,NULL,NULL,NULL,NULL,'/uploads/avatars/avatar-1761628752113-152057723.jpg','2025-10-26 20:19:37'),(9,'owner','simon','simon@gmail.com','$2b$10$4Ww9/YMjlBRJNzeY0PvxiuIzaG6qQjx8B2NTV.ZSZkSWvBD2xlsQa','99999999','DS prof','san jose',NULL,NULL,'Male',NULL,'2025-10-27 18:31:58'),(10,'owner','John Doe','john@example.com','$2b$10$gAK4m5CkiybXvrAfL0I4GePyXxv28A7JWVZ2MVDzolcZ4XXili65G',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-28 03:51:27'),(11,'owner','John','john@test.com','$2b$10$QvkZJq51focpQCsxXVXgPe/2q0UgoK15pkmSp/mnHwPMWpFpW3HmK',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-28 04:40:32'),(12,'owner','Johny','johny@test.com','$2b$10$h8eMdUpy7D/8ndRSFkRwjOxiYvxIg7HzruEOnnvFGmri/sG2WG/py',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-28 04:42:41'),(13,'traveler','travel man','man@test.com','$2b$10$05qM//Oo5J7bxStNd4ytu.84/sUEckQQ3jpQEN2yjRthFh5XkgP0G',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-29 18:00:01'),(14,'traveler','Ram','ram@traveler.com','$2b$10$wcw450zBXeDwt/ep.sTUxO3hWIAXGi/m65xwlSGWlcI4HzlQCbhl.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-11-24 00:35:44');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-24  3:12:14
