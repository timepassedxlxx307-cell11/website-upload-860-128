(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        let active = slides.findIndex(function (slide) {
            return slide.classList.contains('is-active');
        });

        if (active < 0) {
            active = 0;
        }

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const input = scope.querySelector('[data-search-input]');
        const chips = Array.from(scope.querySelectorAll('[data-filter-value]'));
        const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
        const empty = scope.querySelector('[data-empty-state]');
        let activeFilter = 'all';

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            const query = normalize(input ? input.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region')
                ].join(' '));
                const filterText = normalize([
                    card.getAttribute('data-category'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' '));
                const matchesQuery = !query || haystack.indexOf(query) !== -1;
                const matchesFilter = activeFilter === 'all' || filterText.indexOf(activeFilter) !== -1;
                const isVisible = matchesQuery && matchesFilter;

                card.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeFilter = normalize(chip.getAttribute('data-filter-value')) || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                apply();
            });
        });
    });
})();
