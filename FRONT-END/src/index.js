// Nav menu toggle

var nav = document.getElementById("nav");
var formLink = document.getElementById("formLink");
var navmenutoggle = document.getElementById("navmenu");
var menuoverlay = document.getElementById("menuoverlay");
var menuoverlayclose = document.getElementById("menuoverlayclose");
navmenutoggle.onclick = function () {
  if (!nav.classList.contains("menuopened")) {
    nav.classList.add("menuopened");
    // Open menu
    menuoverlay.classList.add("show");
    menuoverlayclose.classList.add("show");
  } else {
    nav.classList.remove("menuopened");
    // Close menu
    menuoverlay.classList.remove("show");
    menuoverlayclose.classList.remove("show");
  }
};
menuoverlayclose.onclick = function () {
  navmenutoggle.click();
};
// Close when window > 800px

window.addEventListener("resize", function () {
  if (window.innerWidth >= 800 && nav.classList.contains("menuopened")) {
    navmenutoggle.click();
  }
});

// Nav menu toggle end

// JS Typewritter

var app = document.getElementById("typewrite");

var typewriter = new Typewriter(app, {
  loop: true
});

typewriter
  .pauseFor(250)
  .typeString("computación")
  .pauseFor(2500)
  .deleteAll()
  .pauseFor(250)
  .typeString("big data")
  .pauseFor(2500)
  .deleteAll()
  .pauseFor(250)
  .typeString("deep learning")
  .pauseFor(2500)
  .deleteAll()
  .pauseFor(250)
  .typeString("IA")
  .pauseFor(2500)
  .deleteAll()
  .pauseFor(250)
  .typeString("UX")
  .pauseFor(2500)
  .deleteAll()
  .pauseFor(250)
  .typeString("UI")
  .pauseFor(2500)
  .deleteAll()
  .pauseFor(250)
  .typeString("diseño web")
  .pauseFor(2500)
  .start();

// JS Typewriter END
