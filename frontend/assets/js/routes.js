/**
 * Edunova frontend route map for PHP/static hosting integration.
 * Backend can mirror these paths when serving HTML pages.
 */
window.EdunovaRoutes = {
  public: {
    home: "/frontend/index.html"
  },
  student: {
    login: "/frontend/pages/student/login.html",
    register: "/frontend/pages/student/register.html",
    dashboard: "/frontend/pages/student/dashboard.html",
    courses: "/frontend/pages/student/courses.html",
    quiz: "/frontend/pages/student/quiz.html",
    profile: "/frontend/pages/student/profile.html"
  },
  admin: {
    login: "/frontend/pages/admin/login.html",
    dashboard: "/frontend/pages/admin/dashboard.html",
    students: "/frontend/pages/admin/manage students.html",
    courses: "/frontend/pages/admin/manage courses.html",
    lessons: "/frontend/pages/admin/upload lessons.html",
    quizzes: "/frontend/pages/admin/managa quiz.html"
  }
};
