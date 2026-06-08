(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function normalizeText(value) {
    return (value || '').toLowerCase().replace(/\s+/g, '');
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-nav-list]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initSearch() {
    var inputs = document.querySelectorAll('[data-search-input]');
    inputs.forEach(function (input) {
      var scopeSelector = input.getAttribute('data-search-scope');
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
      var empty = scope.querySelector('[data-empty-state]');
      var filter = function () {
        var keyword = normalizeText(input.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalizeText(card.getAttribute('data-search-text'));
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      };
      input.addEventListener('input', filter);
      filter();
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    var activate = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === current);
      });
    };
    var nextSlide = function () {
      activate(current + 1);
    };
    var start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(nextSlide, 5000);
    };
    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        activate(position);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        activate(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        nextSlide();
        start();
      });
    }
    activate(0);
    start();
  }

  window.initMoviePlayer = function (sourceUrl) {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-overlay]');
    if (!video || !overlay) {
      return;
    }
    var hlsInstance = null;
    var sourceReady = false;
    var loadSource = function () {
      if (sourceReady) {
        return;
      }
      sourceReady = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      }
    };
    var play = function () {
      loadSource();
      overlay.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    };
    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
    loadSource();
  };

  ready(function () {
    initNavigation();
    initSearch();
    initHero();
  });
})();
