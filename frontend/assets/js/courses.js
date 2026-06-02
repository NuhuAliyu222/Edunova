(function () {
  async function loadCoursesGrid(selector) {
    var grid = document.querySelector(selector);
    if (!grid || !window.EdunovaAPI) return;

    try {
      var courses = await EdunovaAPI.getCourses();
      if (!courses || !courses.length) return;

      grid.innerHTML = courses
        .slice(0, 8)
        .map(function (course) {
          var thumb =
            course.thumbnail ||
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop';
          return (
            '<div class="course-card" onclick="viewCourse(' +
            course.id +
            ')">' +
            '<div class="course-image"><img src="' +
            thumb +
            '" alt="' +
            (course.title || 'Course') +
            '"></div>' +
            '<div class="course-content"><h3>' +
            (course.title || 'Course') +
            '</h3><p>' +
            (course.description || '') +
            '</p>' +
            '<div class="course-footer"><span class="rating">★ 4.8</span>' +
            '<a href="courses.html?id=' +
            course.id +
            '" class="view-btn">View Course →</a></div></div></div>'
          );
        })
        .join('');
    } catch (e) {
      console.warn('Courses API unavailable, using static content.', e.message);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadCoursesGrid('#courseGrid');
    loadCoursesGrid('#dashboardCourseGrid');
  });
})();
