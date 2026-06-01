# Edunova Smart Learning - PHP & MySQL Full-Stack Backend

This directory houses a highly secure, object-oriented RESTful API backend engineered completely in **PHP (7.4+ or 8.x)** and structured on a **MySQL database engine**.

The backend operates with PDO connections, parameterized inputs protecting against SQL injection vulnerabilities, strict JSON request parsers, CORS pre-flight authorization checkouts, and clean token-based authenticate parameters.

---

## 📂 Backend Architecture

```bash
/backend
├── schema.sql             # SQL Script for Tables, Indexes, Seed Logins & Courses
├── config/
│   ├── database.php       # Object-Oriented MySQL PDO Connector
│   └── helpers.php        # CORS configurations, JWT-Bearer authorization & responses
├── auth/
│   ├── login.php          # User & Admin Unified Authentication Portal
│   └── register.php       # Student Registration with Secure Password Hash
└── api/
    ├── courses.php        # Courses CRUD, dynamic category/search filter, enrollment checks
    ├── lessons.php        # Upload Lessons (Admin) or load lessons with completed checks (Student)
    ├── enroll.php         # Student enrollments trigger endpoint
    ├── complete_lesson.php# Progress logger WITH AUTO-GENERATING verifiable certificates
    ├── quizzes.php        # Pull course questions (secure options) or submit secure graded evaluation
    ├── messages.php       # Complete Helpdesk threads, system logs lists & responses
    ├── certificate.php    # Verification Engine (validate cert codes on website/LinkedIn)
    ├── users.php          # Manage active student rosters & modify account profile
    └── announcements.php  # Public campus announcements & dynamic broadcasts alerts
```

---

## 🛠️ Step-by-Step Installation & Deployment

### 1. Database Setup
1. Launch your MySQL command line client or graphical interface (such as phpMyAdmin, TablePlus, or DBeaver).
2. Create a database called `edunova_db`:
   ```sql
   CREATE DATABASE edunova_db CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Open or import the `schema.sql` file provided in this directory. Execute all lines to bootstrap the table structures, indexes, cascade foreign key rules, and seed files.
   *(The seed contains initial courses, micro-lessons, quiz questions, announcements, and mock accounts)*.

### 2. Configure Database Connection
Modify variables in `/backend/config/database.php` to match your local PHP development environment parameters (e.g. XAMPP, MAMP, WampServer):
```php
private $host = "localhost";
private $db_name = "edunova_db";
private $username = "root";  -- Your database user
private $password = "";      -- Your database password
```

### 3. Deploying underneath Apache / Nginx
1. Move the folders inside this directory directly into your server virtual hosts web-root (e.g., `/var/www/html/edunova-backend` or `C:\xampp\htdocs\edunova-backend`).
2. Make sure your local webserver has `mod_rewrite` enabled for smooth request flow routing.
3. Test your database connection. Open your web browser or api tester (Postman) and send a `GET` request:
   ```http
   GET http://localhost/edunova-backend/api/courses.php
   ```
   You should receive a clean JSON list with seed courses:
   ```json
   {
       "status": "success",
       "message": "Course list aggregated.",
       "data": [ ... ]
   }
   ```

---

## 🔑 Default Seed Account Logins

To explore both user portals instantly, log in using these default credentials:

| Portal | Role | Username / Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin Panel** | Administrator | `dean@edunova.org` | `admin123` |
| **Student Portal** | Student Scholar | `sarah@student.com` | `student123` |

---

## 📡 REST API Reference Endpoints

All inputs can be transmitted either as standard `POST/PUT/DELETE` Form variables or directly as a raw `application/json` request body payload (such as `fetch` sends by default!).

### 1. Authentication Portal

*   **User/Admin Login**
    *   `POST /auth/login.php`
    *   Body: `{"email": "...", "password": "...", "role": "student|admin"}`
*   **Student Self-Registration**
    *   `POST /auth/register.php`
    *   Body: `{"name": "...", "username": "...", "email": "...", "password": "..."}`

### 2. Digital Curriculum Modules

*   **List Courses / Search**
    *   `GET /api/courses.php?search=CPU&category=Computer Science`  *(Supports Bearer Token authorization inside Authorization Headers to map `isEnrolled` variables!)*
*   **Create Course (Admin only)**
    *   `POST /api/courses.php`  *(Must supply Admin Bearer Token)*
    *   Body: `{"title": "...", "description": "...", "category": "...", "instructor": "...", "price": 49.99}`
*   **Course Enrollments**
    *   `POST /api/enroll.php` *(Bearer Auth Token required)*
    *   Body: `{"courseId": 2}`

### 3. Lesson Controls & Progress Modules

*   **Query Lessons for a Course**
    *   `GET /api/lessons.php?courseId=1` *(Supports Bearer Token header to verify completed checkmarks!)*
*   **Track Completed Lessons & Claim Certificate**
    *   `POST /api/complete_lesson.php` *(Bearer Token required)*
    *   Body: `{"courseId": 1, "lessonId": 3}`
    *   *System automatically checks if this completes the course curriculums. If yes, it logs a congratulatory notification system message and inserts your verifiable certificate code!*

### 4. Interactive Quiz Portal

*   **Fetch Questions**
    *   `GET /api/quizzes.php?courseId=1` *(Hides correct indexes to prevent cheating unless user is authorized as administrator!)*
*   **Grade Submissions & Record Score**
    *   `POST /api/quizzes.php` *(Bearer Token required)*
    *   Body: `{"courseId": 1, "answers": {"1": 2, "2": 0}}`
    *   *Performs strict server-side scoring verification, logs user percentages in the leaderboard databases, and triggers system broadcasts if they top the scores.*

### 5. Verifiable Certifications Registry

*   **Verify Credentials (Public Verification Ledger)**
    *   `GET /api/certificate.php?code=EDN-A58F931D22`
    *   *Instantly responses indicating the legal student name, graduation date, and instructor name to authenticate certifications resumes.*
*   **List personal generated certificates**
    *   `GET /api/certificate.php`  *(Bearer Token required)*

### 6. Support Channels Helpdesk & Campus News

*   **Support Conversation feeds (Student Inbox)**
    *   `GET /api/messages.php` *(Bearer Token required)*
*   **Send Message (Ticket inquiries or Admin support answers)**
    *   `POST /api/messages.php` *(Bearer Token required)*
    *   Body: `{"text": "...", "userId": 10}` *(Admins pass custom Student ID recipient target)*
*   **Global Broadcasts Announcements**
    *   `GET /api/announcements.php`

---

## 🔒 Security Best Practices Integrated
1.  **PDO Binding Prevention**: Handled via `:variable` parameter mappings. No raw concatenations are used within PDO handlers.
2.  **Password Storing**: Newly registered user passwords undergo one-way crypt salts matching `PASSWORD_DEFAULT` frameworks.
3.  **Cross-Origin Isolation**: CORS headers are globally mounted allowing developers to run the React UI side-by-side with decoupled APIs during dev handovers with ease.
