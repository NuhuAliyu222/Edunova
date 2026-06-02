(function () {
  var routeByLabel = {
    Dashboard: "dashboard.html",
    Courses: "manage courses.html",
    Lessons: "upload lessons.html",
    Quizzes: "managa quiz.html",
    "Manage Quizzes": "managa quiz.html",
    Users: "manage students.html",
    Profile: "profile.html",
    "My Courses": "courses.html"
  };

  function wireSidebarLinks() {
    var links = document.querySelectorAll(".menu a.menu-item, .menu-item[data-route]");
    if (!links.length) return;

    links.forEach(function (item) {
      if (item.dataset && item.dataset.route) {
        item.addEventListener("click", function () {
          window.location.href = item.dataset.route;
        });
      }
    });
  }

  function wireMenuCardRoutes() {
    var items = document.querySelectorAll(".menu-item:not(a)");
    if (!items.length) return;

    items.forEach(function (item) {
      var label = item.textContent.replace(/\s+/g, " ").trim();
      var route = routeByLabel[label];
      if (!route) return;

      item.style.cursor = "pointer";
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.addEventListener("click", function () {
        window.location.href = route;
      });
      item.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          window.location.href = route;
        }
      });
    });
  }

  function wireLogout() {
    var clear = window.EdunovaAuth ? window.EdunovaAuth.clearSession : function () {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    };
    document.querySelectorAll("[data-logout]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        clear();
        window.location.href = link.getAttribute("href") || "login.html";
      });
    });
    document.querySelectorAll('a[href*="login.html"]').forEach(function (link) {
      if (link.dataset.logoutWired) return;
      var text = (link.textContent || "").trim().toLowerCase();
      if (text.indexOf("logout") === -1) return;
      link.dataset.logoutWired = "1";
      link.addEventListener("click", function (event) {
        event.preventDefault();
        clear();
        window.location.href = link.getAttribute("href") || "login.html";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireSidebarLinks();
    wireMenuCardRoutes();
    wireLogout();
  });
})();
