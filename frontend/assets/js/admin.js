(function () {
  document.addEventListener('DOMContentLoaded', async function () {
    if (!window.EdunovaAPI || !document.body.dataset.authGuard) return;
    if (document.body.dataset.authGuard !== 'admin') return;

    try {
      var stats = await EdunovaAPI.getAdminStats();
      var map = {
        totalStudents: stats.students,
        studentCount: stats.students,
        totalCourses: stats.courses,
        courseCount: stats.courses,
        totalQuizzes: stats.quizzes,
        totalEnrollments: stats.enrollments,
        totalCertificates: stats.enrollments,
      };
      Object.keys(map).forEach(function (id) {
        var el = document.getElementById(id);
        if (el && map[id] !== undefined) {
          el.textContent = map[id];
        }
      });
    } catch (e) {
      console.warn('Admin stats unavailable.', e.message);
    }
  });
})();
