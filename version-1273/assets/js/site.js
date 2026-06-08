(function () {
    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function bindMenu() {
        var toggle = document.querySelector('.js-menu-toggle');
        var panel = document.querySelector('.js-mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function bindSearch() {
        var fields = Array.prototype.slice.call(document.querySelectorAll('.js-search-field'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-card'));
        if (!fields.length || !cards.length) {
            return;
        }
        function apply(value) {
            var query = normalize(value);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
            });
            fields.forEach(function (field) {
                if (field.value !== value) {
                    field.value = value;
                }
            });
        }
        fields.forEach(function (field) {
            field.addEventListener('input', function () {
                apply(field.value);
            });
        });
    }

    function bindFilters() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('.js-filter-btn'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-card'));
        if (!buttons.length || !cards.length) {
            return;
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var filter = normalize(button.getAttribute('data-filter'));
                buttons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                cards.forEach(function (card) {
                    var year = normalize(card.getAttribute('data-year'));
                    var type = normalize(card.getAttribute('data-type'));
                    var search = normalize(card.getAttribute('data-search'));
                    var matched = filter === 'all' || year === filter || type.indexOf(filter) !== -1 || search.indexOf(filter) !== -1;
                    card.classList.toggle('is-hidden', !matched);
                });
            });
        });
    }

    function bindHero() {
        var hero = document.querySelector('.js-hero');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    bindMenu();
    bindSearch();
    bindFilters();
    bindHero();
}());
