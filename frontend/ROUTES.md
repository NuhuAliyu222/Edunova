# Edunova Frontend Route Map (PHP integration)

Use these paths when wiring backend routes to static HTML pages.

## Public

| Route | File |
| --- | --- |
| `/` or `/index` | `frontend/index.html` |

## Student

| Route | File |
| --- | --- |
| `/student/login` | `frontend/pages/student/login.html` (redirects to `login`) |
| `/student/register` | `frontend/pages/student/register.html` |
| `/student/dashboard` | `frontend/pages/student/dashboard.html` |
| `/student/courses` | `frontend/pages/student/courses.html` |
| `/student/quiz` | `frontend/pages/student/quiz.html` |
| `/student/profile` | `frontend/pages/student/profile.html` |

## Admin

| Route | File |
| --- | --- |
| `/admin/login` | `frontend/pages/admin/login.html` |
| `/admin/dashboard` | `frontend/pages/admin/dashboard.html` |
| `/admin/students` | `frontend/pages/admin/manage students.html` |
| `/admin/courses` | `frontend/pages/admin/manage courses.html` |
| `/admin/lessons` | `frontend/pages/admin/upload lessons.html` |
| `/admin/quizzes` | `frontend/pages/admin/managa quiz.html` |
| `/admin/quizzes` (alias) | `frontend/pages/admin/manage quiz.html` (redirect) |
