(function () {
  function initNavbarActiveLinks() {
    var links = document.querySelectorAll(".nav-links a");
    if (!links.length) return;
    var currentHash = window.location.hash;
    links.forEach(function (link) {
      if (currentHash && link.getAttribute("href") === currentHash) {
        link.classList.add("active");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initNavbarActiveLinks);
})();
