-- =====================================================================
-- Edunova Smart Learning Database Schema
-- RDBMS: MySQL 5.7+ / 8.0+
-- Description: Highly optimized SQL schema supporting real-time progress,
--              secure credential storage, certificates, quiz tracking,
--              and admin support tickets.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `edunova_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `edunova_db`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `gender` VARCHAR(20) DEFAULT NULL,
  `dob` DATE DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `role` ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  `registered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (`email`),
  INDEX idx_username (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `instructor` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT '0.00',
  `thumbnail` VARCHAR(255) NOT NULL,
  `rating` DECIMAL(3, 2) DEFAULT '0.00',
  `reviews_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. LESSONS TABLE
CREATE TABLE IF NOT EXISTS `lessons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `duration` VARCHAR(20) NOT NULL DEFAULT '5 mins',
  `video_url` VARCHAR(255) DEFAULT NULL,
  `lesson_order` INT NOT NULL DEFAULT 1,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX idx_course_lessons (`course_id`, `lesson_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ENROLLMENTS TABLE (Unique pair prevents duplicate enrollments)
CREATE TABLE IF NOT EXISTS `enrollments` (
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `course_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. LESSON PROGRESS TABLE (Track complete stamps dynamically)
CREATE TABLE IF NOT EXISTS `lesson_progress` (
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `lesson_id` INT NOT NULL,
  `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `course_id`, `lesson_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `question` TEXT NOT NULL,
  `options` JSON NOT NULL, -- Stored as a serialized JSON array of options
  `correct_index` INT NOT NULL, -- 0-based index
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. QUIZ ATTEMPTS TABLE (Track scores, correct counts and progress)
CREATE TABLE IF NOT EXISTS `quiz_attempts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `score` DECIMAL(5, 2) NOT NULL, -- percentage score
  `correct_count` INT NOT NULL,
  `total_count` INT NOT NULL,
  `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX idx_attempts_leaderboard (`course_id`, `score` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. CERTIFICATES TABLE (verifiable progress certs)
CREATE TABLE IF NOT EXISTS `certificates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `certificate_code` VARCHAR(50) NOT NULL UNIQUE,
  `issued_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX idx_certificate_code (`certificate_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS `bookmarks` (
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `course_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. MESSAGES TABLE (Helpdesk, announcements and support logs)
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL, -- context channel (usually student id, 0 or system matches public logs)
  `text` TEXT NOT NULL,
  `sender` ENUM('system', 'admin', 'student') NOT NULL DEFAULT 'student',
  `is_read` TINYINT(1) DEFAULT 0,
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_messages (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. ANNOUNCEMENTS TABLE (General broadcasts)
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `excerpt` TEXT NOT NULL,
  `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- SEED INITIAL DATA FOR THE ENTIRE ECOSYSTEM
-- =====================================================================

-- Passwords match: 'student123' and 'admin123'
INSERT INTO `users` (`id`, `name`, `username`, `email`, `password_hash`, `phone`, `gender`, `dob`, `role`) VALUES
(1, 'Dean Henderson', 'dean_admin', 'dean@edunova.org', '$2y$10$R9n5r6FidR.i9g7EByC7tO0l/pSgUqK.O3p8h99/T0D1s9gBvSvyK', '+1 (555) 721-0000', 'Male', '1985-05-12', 'admin'),
(2, 'Sarah Jenkins', 'sarah_j', 'sarah@student.com', '$2y$10$wT0H779B3m5aJ5U/K/gXye7Z.1BvK7p8vJ6T0D9C1s8gBvSvyK9L.', '+1 (555) 124-7890', 'Female', '2005-09-18', 'student');

-- INITIAL COURSES
INSERT INTO `courses` (`id`, `title`, `description`, `category`, `instructor`, `price`, `thumbnail`, `rating`, `reviews_count`) VALUES
(1, 'Introduction to Computer Architectures', 'Delve cleanly into standard computer science von Neumann pipelines, instruction sets, CPU structures, cycles, caching systems, and hardware layouts.', 'Computer Science', 'Dr. Aris Thorne', 49.99, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600', 4.90, 114),
(2, 'Reactive Web Framework Architectures', 'Master client-side application modeling, progressive rendering, VDOM mechanics, event dispatchers, and state synchronization loops.', 'Web Development', 'Instructor Sarah Jenkins', 0.00, 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=600', 4.85, 252),
(3, 'Modern Cloud Native Databases', 'Learn the mechanics of cloud databases including replication consistency models, high availability clusters, global partition indices, and ACID optimization.', 'Database Systems', 'Dean Henderson', 79.00, 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=600', 4.95, 87);

-- INITIAL LESSONS
INSERT INTO `lessons` (`id`, `course_id`, `title`, `duration`, `video_url`, `lesson_order`) VALUES
(1, 1, 'Welcome to the Microarchitecture Frontier', '12 mins', 'https://www.w3schools.com/html/mov_bbb.mp4', 1),
(2, 1, 'The CPU Pipeline & RISC-V Assembler Basics', '15 mins', 'https://www.w3schools.com/html/mov_bbb.mp4', 2),
(3, 1, 'Exploring Cache Hierarchies (L1, L2, L3)', '18 mins', 'https://www.w3schools.com/html/mov_bbb.mp4', 3),
(4, 2, 'Decoupled Client-Side UI Lifecycles', '10 mins', 'https://www.w3schools.com/html/mov_bbb.mp4', 1),
(5, 2, 'Unidirectional Data-Flow Optimization Rules', '14 mins', 'https://www.w3schools.com/html/mov_bbb.mp4', 2),
(6, 3, 'Spanner Engine & Global Multi-Region Replication', '25 mins', 'https://www.w3schools.com/html/mov_bbb.mp4', 1);

-- INITIAL QUIZ QUESTIONS
INSERT INTO `quiz_questions` (`id`, `course_id`, `question`, `options`, `correct_index`) VALUES
(1, 1, 'Which component handles arithmetic registers and instruction hazard detection inside standard pipelines?', '["Arithmetic Logic Unit (ALU)", "Memory Cache Controller", "Instruction Pipeline Decoder / Hazard Unit", "Floating Point Register Map"]', 2),
(2, 1, 'What is the primary benefit of speculative instruction execution inside modern branch predictors?', '["Reduces pipeline instruction bubbles during branches", "Bypasses primary hardware memory leaks perfectly", "Decreases total energy consumption indices inside registers", "Simplifies the underlying silicon wiring bus layout"]', 0),
(3, 1, 'Which cache mapping design is subject to conflict misses because multiple memory lines overlap on identical index banks?', '["Fully Associative Cache Map", "Direct-Mapped Cache Design", "2-Way Set-Associative Layout", "Multi-Threaded Hardware Registers"]', 1),
(4, 2, 'What was the foundational problem progressive Virtual DOM algorithms set out to scale and solve?', '["Providing asynchronous memory serialization dynamically", "Minimizing expensive re-paints triggered by deep DOM updates", "Simplifying legacy cascading style sheets variables", "Bypassing server security handshakes entirely"]', 1),
(5, 3, 'How does the Google Spanner database achieve consistent consensus locks globally without introducing sync bottlenecks?', '["By utilizing physical GPS atomic clocks (TrueTime API)", "Using arbitrary timestamp hashing algorithms on replicas", "Forcing serial single-node queues across channels", "By trusting local system timestamps only"]', 0);

-- INITIAL BROADCASTS
INSERT INTO `announcements` (`id`, `title`, `excerpt`, `published_at`) VALUES
(1, '🚀 Free Certificates Campaign Active', 'Earn free verifiable course certificates automatically once you finish all lessons in any course.', '2026-05-18 10:00:00'),
(2, '🔧 Scheduled Server Maintenance', 'Edunova smart database engines will undergo standard optimization this Saturday morning.', '2026-05-17 08:30:00');
