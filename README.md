# Edunova Smart Learning

Production-ready learning management system with a static HTML/CSS frontend and PHP REST API backend.

## Stack

- **Frontend:** HTML, CSS, JavaScript (design preserved)
- **Backend:** PHP 8+ with PDO
- **Database:** MySQL 8

## Quick start (local)

### 1. Database

```bash
mysql -u root -p < database/schema.sql
php database/install.php
```

Default admin:

- Email: `admin@edunova.com`
- Password: `admin123`

### 2. Environment

Copy `.env.example` to `.env` and set database credentials (optional for local XAMPP defaults).

### 3. Run server

From project root:

```bash
php -S localhost:8080 router.php
```

Open:

- Home: http://localhost:8080/frontend/index.html
- Student login: http://localhost:8080/frontend/pages/student/login.html
- Admin login: http://localhost:8080/frontend/pages/admin/login.html

### Docker

```bash
docker compose up -d
docker compose exec api php database/install.php
```

App: http://localhost:8080/frontend/index.html

## API

Base URL: `/backend/routes/api.php?action=`

| Action | Method | Auth |
| --- | --- | --- |
| `health` | GET | No |
| `register` | POST | No |
| `login` | POST | No |
| `adminLogin` | POST | No |
| `getCourses` | GET | No |
| `getCourse&id=` | GET | No |
| `studentDashboard` | GET | Student JWT |
| `getCourseProgress&id=` | GET | Student JWT |
| `getMyProgress` | GET | Student JWT |
| `markLessonComplete` | POST | Student JWT — body: `{ "course_id", "lesson_id" }` |
| `profile` | GET | JWT |
| `getStudents` | GET | Admin JWT |
| `adminStats` | GET | Admin JWT |

Send JWT as header: `Authorization: Bearer <token>`

## Project structure

```
backend/          PHP API, models, controllers
frontend/         Static UI pages and assets
database/         SQL schema and install helper
router.php        PHP built-in server router
```

## Security notes

- Change `JWT_SECRET` in production.
- Use HTTPS in production.
- Run `database/install.php` after import to set a secure admin password.
