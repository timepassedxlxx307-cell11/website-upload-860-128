(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var cardFilter = qs('[data-card-filter]');
  var yearFilter = qs('[data-year-filter]');
  var emptyState = qs('[data-empty-state]');
  var cards = qsa('[data-card]');

  function filterCards() {
    if (!cards.length) {
      return;
    }
    var keyword = cardFilter ? cardFilter.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || ''
      ].join(' ').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!year || cardYear === year);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (cardFilter) {
    cardFilter.addEventListener('input', filterCards);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', filterCards);
  }
  filterCards();

  var searchForm = qs('[data-search-form]');
  var searchInput = qs('[data-search-input]');
  var searchResults = qs('[data-search-results]');
  var searchEmpty = qs('[data-search-empty]');

  function renderSearch(keyword) {
    if (!searchResults || !window.SEARCH_MOVIES) {
      return;
    }
    var q = (keyword || '').trim().toLowerCase();
    var results = window.SEARCH_MOVIES.filter(function (item) {
      if (!q) {
        return item.featured;
      }
      return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.category]
        .join(' ')
        .toLowerCase()
        .indexOf(q) !== -1;
    }).slice(0, 96);

    searchResults.innerHTML = results.map(function (item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + item.url + '">',
        '    <img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="play-chip">播放</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <a class="card-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>',
        '    <p class="card-meta">' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</p>',
        '    <p class="card-desc">' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.genre.split(/[，,\/]/)[0] || item.type) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');

    if (searchEmpty) {
      searchEmpty.classList.toggle('is-visible', results.length === 0);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  if (searchForm && searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;
    renderSearch(initial);
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = searchInput.value.trim();
      var url = new URL(window.location.href);
      if (value) {
        url.searchParams.set('q', value);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
      renderSearch(value);
    });
  }
})();
