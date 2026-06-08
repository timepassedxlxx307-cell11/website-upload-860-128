(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            function schedule() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    schedule();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    schedule();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    schedule();
                });
            }

            if (slides.length > 1) {
                schedule();
            }
        }

        var input = document.querySelector("[data-search-input]");
        var button = document.querySelector("[data-search-button]");
        var results = document.querySelector("[data-search-results]");
        var data = window.SearchMovies || [];

        function renderSearch() {
            if (!input || !results) {
                return;
            }

            var query = input.value.trim().toLowerCase();
            if (!query) {
                results.classList.remove("is-open");
                results.innerHTML = "";
                return;
            }

            var matches = data.filter(function (item) {
                return item.text.indexOf(query) !== -1;
            }).slice(0, 24);

            results.classList.add("is-open");
            if (!matches.length) {
                results.innerHTML = '<div class="search-result-card"><strong>未找到匹配影片</strong><span>可以尝试更换片名、地区、年份或类型关键词。</span></div>';
                return;
            }

            results.innerHTML = matches.map(function (item) {
                return '<a class="search-result-card" href="' + item.url + '">' +
                    '<strong>' + item.title + '</strong>' +
                    '<span>' + item.meta + '</span>' +
                    '<small>' + item.desc + '</small>' +
                    '</a>';
            }).join("");
        }

        if (input && results) {
            input.addEventListener("input", renderSearch);
            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    renderSearch();
                }
            });
        }

        if (button) {
            button.addEventListener("click", renderSearch);
        }
    });
})();
