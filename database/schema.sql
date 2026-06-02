CREATE DATABASE IF NOT EXISTS edunova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edunova;

-- Users table (updated with more fields)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
    profile_image VARCHAR(255),
    bio TEXT,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- Courses table (removed price)
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    thumbnail VARCHAR(255),
    category VARCHAR(100),
    instructor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_courses_category (category),
    INDEX idx_courses_instructor (instructor_id)
);

-- Course enrollments (new table)
CREATE TABLE IF NOT EXISTS enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    INDEX idx_enrollments_user (user_id),
    INDEX idx_enrollments_course (course_id)
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    pdf_url VARCHAR(500),
    file_path VARCHAR(500),
    duration VARCHAR(50),
    order_index INT DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_lessons_course (course_id),
    INDEX idx_lessons_order (order_index)
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    lesson_id INT NULL,
    title VARCHAR(200),
    question TEXT NOT NULL,
    options JSON,
    correct_answer VARCHAR(10),
    points INT DEFAULT 1,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_quizzes_course (course_id)
);

-- Progress table (updated)
CREATE TABLE IF NOT EXISTS progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    lesson_id INT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    quiz_score INT DEFAULT 0,
    quiz_attempts INT DEFAULT 0,
    completion_percentage INT DEFAULT 0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_progress_user (user_id),
    INDEX idx_progress_course (course_id),
    INDEX idx_progress_user_course (user_id, course_id)
);

-- Certificates table (new)
CREATE TABLE IF NOT EXISTS certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    certificate_code VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_path VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_certificates_user (user_id),
    INDEX idx_certificates_code (certificate_code)
);

-- Course reviews table (new)
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (user_id, course_id),
    INDEX idx_reviews_course (course_id),
    INDEX idx_reviews_rating (rating)
);

-- Bookmarks/wishlist table (new)
CREATE TABLE IF NOT EXISTS bookmarks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bookmark (user_id, course_id),
    INDEX idx_bookmarks_user (user_id)
);

-- Announcements table (new)
CREATE TABLE IF NOT EXISTS announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    author_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_announcements_course (course_id),
    INDEX idx_announcements_created (created_at)
);

-- Messages table (new)
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    course_id INT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    INDEX idx_messages_sender (sender_id),
    INDEX idx_messages_receiver (receiver_id),
    INDEX idx_messages_read (is_read)
);

-- Email queue table (new for notifications)
CREATE TABLE IF NOT EXISTS email_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    to_email VARCHAR(100) NOT NULL,
    to_name VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    INDEX idx_email_queue_status (status)
);

-- Default users (password: admin123 for admin, instructor123 for instructor)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@edunova.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('John Instructor', 'instructor@edunova.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor')
ON DUPLICATE KEY UPDATE email = email;

-- Sample courses (no price)
INSERT INTO courses (title, description, thumbnail, category, instructor_id) VALUES
('Web Development Bootcamp', 'Complete web development course with HTML, CSS, JavaScript, and PHP', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', 'Development', 2),
('Data Science Fundamentals', 'Learn data analysis, visualization, and machine learning basics', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71', 'Data Science', 2),
('UI/UX Design Mastery', 'Master user interface and user experience design principles', 'https://images.unsplash.com/photo-1561070791-2526d30994b5', 'Design', 2);

-- Sample lessons
INSERT INTO lessons (course_id, title, content, video_url, duration, order_index) VALUES
(1, 'Introduction to HTML', 'Learn the basics of HTML markup language', 'https://www.youtube.com/embed/qz0aGYrrlhU', '12:30', 1),
(1, 'CSS Fundamentals', 'Master CSS styling and layouts', 'https://www.youtube.com/embed/1PnVor36_40', '18:45', 2),
(2, 'Python Basics', 'Introduction to Python programming', 'https://www.youtube.com/embed/_uQrJ0TkZlc', '15:20', 1),
(3, 'Design Principles', 'Learn core UI/UX design principles', 'https://www.youtube.com/embed/y882XR8lhlY', '20:10', 1);

-- Sample quizzes
INSERT INTO quizzes (course_id, question, options, correct_answer, points) VALUES
(1, 'What does HTML stand for?', '["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language"]', '0', 1),
(1, 'Which tag is used for the largest heading?', '["<h6>", "<h1>", "<head>"]', '1', 1),
(2, 'Which library is commonly used for data analysis in Python?', '["NumPy", "Pandas", "React"]', '1', 1);