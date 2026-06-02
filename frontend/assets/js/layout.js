(function () {
  function bindMobileSidebar() {
    var sidebar = document.getElementById("sidebar");
    var toggle = document.querySelector(".menu-toggle, .hamburger");
    if (!sidebar || !toggle) return;

    toggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });

    document.addEventListener("click", function (event) {
      if (window.innerWidth > 992) return;
      if (!sidebar.classList.contains("open")) return;
      if (sidebar.contains(event.target) || toggle.contains(event.target)) return;
      sidebar.classList.remove("open");
    });
  }

  document.addEventListener("DOMContentLoaded", bindMobileSidebar);
})();
