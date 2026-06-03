-- =====================================================================
-- Edunova Smart Learning Database Schema
-- RDBMS: MySQL 5.7+ / 8.0+
-- This schema matches the application code (backend/models, controllers).
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `edunova` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `edunova`;

-- 1. USERS
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'instructor', 'admin') NOT NULL DEFAULT 'student',
  `profile_image` VARCHAR(255) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_email (`email`),
  INDEX idx_role (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. COURSES
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(80) DEFAULT NULL,
  `thumbnail` VARCHAR(255) DEFAULT NULL,
  `instructor` VARCHAR(120) DEFAULT NULL,
  `instructor_id` INT DEFAULT NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX idx_instructor (`instructor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. LESSONS
CREATE TABLE IF NOT EXISTS `lessons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `video_url` VARCHAR(255) DEFAULT NULL,
  `pdf_url` VARCHAR(255) DEFAULT NULL,
  `duration` VARCHAR(20) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX idx_course_lessons (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ENROLLMENTS
CREATE TABLE IF NOT EXISTS `enrollments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_enrollment (`user_id`, `course_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. PROGRESS (lesson completion + quiz scores per course)
CREATE TABLE IF NOT EXISTS `progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `lesson_id` INT DEFAULT NULL,
  `completed` TINYINT(1) NOT NULL DEFAULT 0,
  `completion_percentage` INT NOT NULL DEFAULT 0,
  `quiz_score` INT NOT NULL DEFAULT 0,
  `quiz_attempts` INT NOT NULL DEFAULT 0,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `last_activity` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_progress (`user_id`, `course_id`, `lesson_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  INDEX idx_progress_user (`user_id`, `course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. QUIZZES (one question per row)
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `question` TEXT NOT NULL,
  `options` JSON NOT NULL,
  `correct_answer` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX idx_quiz_course (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. REVIEWS
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `rating` TINYINT NOT NULL,
  `comment` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_review (`user_id`, `course_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BOOKMARKS
CREATE TABLE IF NOT EXISTS `bookmarks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_bookmark (`user_id`, `course_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. ANNOUNCEMENTS (per course)
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `author_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX idx_ann_course (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. MESSAGES
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender_id` INT NOT NULL,
  `receiver_id` INT NOT NULL,
  `course_id` INT DEFAULT NULL,
  `subject` VARCHAR(150) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  INDEX idx_msg_receiver (`receiver_id`),
  INDEX idx_msg_sender (`sender_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. CERTIFICATES
CREATE TABLE IF NOT EXISTS `certificates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `certificate_code` VARCHAR(50) NOT NULL UNIQUE,
  `pdf_path` VARCHAR(255) DEFAULT NULL,
  `issued_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_certificate (`user_id`, `course_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  INDEX idx_certificate_code (`certificate_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. EMAIL QUEUE (used by EmailHelper)
CREATE TABLE IF NOT EXISTS `email_queue` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `to_email` VARCHAR(150) NOT NULL,
  `to_name` VARCHAR(150) DEFAULT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `body` MEDIUMTEXT NOT NULL,
  `status` ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- SEED DATA
-- Passwords: admin@edunova.com -> admin123, sarah@student.com -> student123
-- =====================================================================

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `bio`) VALUES
(1, 'Dean Henderson', 'admin@edunova.com', '$2y$10$mrVfpbAraDDYcWlGZqo2besVTEeHIv.kpL5b5l8Lodz1I6JDHv1Ye', 'admin', 'Platform administrator.'),
(2, 'Sarah Jenkins', 'sarah@student.com', '$2y$10$a.hV0M77c5Ny6lNk850f9ubnzRYT20z/3EYc3i4rHB5Jrsf8blbfi', 'student', 'Lifelong learner.');

INSERT INTO `courses` (`id`, `title`, `description`, `category`, `thumbnail`, `instructor`, `instructor_id`, `price`) VALUES
(1, 'Introduction to Computer Architectures', 'Delve cleanly into standard computer science von Neumann pipelines, instruction sets, CPU structures, cycles, caching systems, and hardware layouts.', 'Computer Science', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600', 'Dr. Aris Thorne', NULL, 49.99),
(2, 'Reactive Web Framework Architectures', 'Master client-side application modeling, progressive rendering, VDOM mechanics, event dispatchers, and state synchronization loops.', 'Web Development', 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=600', 'Sarah Jenkins', NULL, 0.00),
(3, 'Modern Cloud Native Databases', 'Learn the mechanics of cloud databases including replication consistency models, high availability clusters, global partition indices, and ACID optimization.', 'Database Systems', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=600', 'Dean Henderson', 1, 79.00);

INSERT INTO `lessons` (`id`, `course_id`, `title`, `duration`, `video_url`) VALUES
(1, 1, 'Welcome to the Microarchitecture Frontier', '12 mins', 'https://www.w3schools.com/html/mov_bbb.mp4'),
(2, 1, 'The CPU Pipeline & RISC-V Assembler Basics', '15 mins', 'https://www.w3schools.com/html/mov_bbb.mp4'),
(3, 1, 'Exploring Cache Hierarchies (L1, L2, L3)', '18 mins', 'https://www.w3schools.com/html/mov_bbb.mp4'),
(4, 2, 'Decoupled Client-Side UI Lifecycles', '10 mins', 'https://www.w3schools.com/html/mov_bbb.mp4'),
(5, 2, 'Unidirectional Data-Flow Optimization Rules', '14 mins', 'https://www.w3schools.com/html/mov_bbb.mp4'),
(6, 3, 'Spanner Engine & Global Multi-Region Replication', '25 mins', 'https://www.w3schools.com/html/mov_bbb.mp4');

INSERT INTO `quizzes` (`id`, `course_id`, `question`, `options`, `correct_answer`) VALUES
(1, 1, 'Which component handles arithmetic registers and instruction hazard detection inside standard pipelines?', '["Arithmetic Logic Unit (ALU)", "Memory Cache Controller", "Instruction Pipeline Decoder / Hazard Unit", "Floating Point Register Map"]', '2'),
(2, 1, 'What is the primary benefit of speculative instruction execution inside modern branch predictors?', '["Reduces pipeline instruction bubbles during branches", "Bypasses primary hardware memory leaks perfectly", "Decreases total energy consumption indices inside registers", "Simplifies the underlying silicon wiring bus layout"]', '0'),
(3, 1, 'Which cache mapping design is subject to conflict misses because multiple memory lines overlap on identical index banks?', '["Fully Associative Cache Map", "Direct-Mapped Cache Design", "2-Way Set-Associative Layout", "Multi-Threaded Hardware Registers"]', '1'),
(4, 2, 'What was the foundational problem progressive Virtual DOM algorithms set out to scale and solve?', '["Providing asynchronous memory serialization dynamically", "Minimizing expensive re-paints triggered by deep DOM updates", "Simplifying legacy cascading style sheets variables", "Bypassing server security handshakes entirely"]', '1'),
(5, 3, 'How does the Google Spanner database achieve consistent consensus locks globally without introducing sync bottlenecks?', '["By utilizing physical GPS atomic clocks (TrueTime API)", "Using arbitrary timestamp hashing algorithms on replicas", "Forcing serial single-node queues across channels", "By trusting local system timestamps only"]', '0');

INSERT INTO `announcements` (`id`, `course_id`, `author_id`, `title`, `content`) VALUES
(1, 1, 1, 'Free Certificates Campaign Active', 'Earn free verifiable course certificates automatically once you finish all lessons in any course.'),
(2, 3, 1, 'Scheduled Server Maintenance', 'Edunova smart database engines will undergo standard optimization this Saturday morning.');
