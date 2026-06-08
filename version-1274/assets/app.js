(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var previous = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-target-slide")) || 0);
        restart();
      });
    });

    root.addEventListener("mouseenter", function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });

    root.addEventListener("mouseleave", function () {
      restart();
    });

    show(0);
    play();
  }

  function normalized(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var scope = document.querySelector(form.getAttribute("data-filter-form"));
      if (!scope) {
        return;
      }
      var input = form.querySelector("[data-search-input]");
      var region = form.querySelector("[data-region-filter]");
      var type = form.querySelector("[data-type-filter]");
      var year = form.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-title]"));
      var empty = document.querySelector(form.getAttribute("data-empty-target"));

      function apply() {
        var query = normalized(input ? input.value : "");
        var regionValue = normalized(region ? region.value : "");
        var typeValue = normalized(type ? type.value : "");
        var yearValue = normalized(year ? year.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalized([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (regionValue && normalized(card.getAttribute("data-region")).indexOf(regionValue) === -1) {
            ok = false;
          }
          if (typeValue && normalized(card.getAttribute("data-type")).indexOf(typeValue) === -1) {
            ok = false;
          }
          if (yearValue && normalized(card.getAttribute("data-year")) !== yearValue) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });

      apply();
    });
  }

  function startPlayer(shell) {
    var video = shell.querySelector("video");
    var layer = shell.querySelector(".play-layer");
    var stream = shell.getAttribute("data-stream");
    if (!video || !stream) {
      return;
    }

    if (!video.getAttribute("data-ready")) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = stream;
      }
      video.setAttribute("data-ready", "true");
    }

    shell.classList.add("is-playing");
    video.controls = true;
    if (layer) {
      layer.setAttribute("aria-hidden", "true");
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".watch-shell[data-stream]"));
    shells.forEach(function (shell) {
      var layer = shell.querySelector(".play-layer");
      var video = shell.querySelector("video");
      if (layer) {
        layer.addEventListener("click", function () {
          startPlayer(shell);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!video.getAttribute("data-ready")) {
            startPlayer(shell);
          }
        });
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
