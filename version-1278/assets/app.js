(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function normalizeText(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var next = document.querySelector("[data-hero-next]");
        var prev = document.querySelector("[data-hero-prev]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }
        function start() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                show(current);
                start();
            });
        });
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        show(0);
        start();
    }

    function initCategoryFilter() {
        var grid = document.querySelector("[data-filter-grid]");
        var input = document.querySelector("[data-filter-input]");
        var select = document.querySelector("[data-sort-select]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        function apply() {
            var keyword = normalizeText(input ? input.value : "");
            var sorted = cards.slice();
            var mode = select ? select.value : "default";
            if (mode === "rating") {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                });
            }
            if (mode === "year") {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
            }
            if (mode === "views") {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                });
            }
            if (mode === "title") {
                sorted.sort(function (a, b) {
                    return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
                });
            }
            sorted.forEach(function (card) {
                var haystack = normalizeText([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.textContent
                ].join(" "));
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = matched ? "" : "none";
                grid.appendChild(card);
            });
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        if (select) {
            select.addEventListener("change", apply);
        }
        apply();
    }

    function cardTemplate(movie) {
        return [
            '<article class="movie-card" data-title="' + escapeAttr(movie.title) + '" data-year="' + escapeAttr(movie.year) + '" data-rating="' + escapeAttr(movie.rating) + '" data-views="' + escapeAttr(movie.views) + '" data-region="' + escapeAttr(movie.region) + '" data-genre="' + escapeAttr(movie.genre) + '" data-tags="' + escapeAttr((movie.tags || []).join(" ")) + '">',
            '<a class="poster-link" href="' + escapeAttr(movie.url) + '">',
            '<img src="' + escapeAttr(movie.cover) + '" alt="' + escapeAttr(movie.title) + '">',
            '<span class="card-rating">' + escapeHtml(movie.rating) + '</span>',
            '</a>',
            '<div class="card-body">',
            '<h3><a href="' + escapeAttr(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.one_line) + '</p>',
            '<div class="movie-meta"><span class="badge">' + escapeHtml(movie.year) + '</span><span class="badge">' + escapeHtml(movie.region) + '</span></div>',
            '<div class="card-foot"><span>' + escapeHtml(movie.genre) + '</span><span>' + escapeHtml(movie.viewsText) + '</span></div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }

    function initGlobalSearch() {
        var form = document.getElementById("globalSearchForm");
        var input = document.getElementById("globalSearchInput");
        var result = document.getElementById("globalSearchResults");
        if (!form || !input || !result || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        function render(keyword) {
            var query = normalizeText(keyword);
            var list = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                if (!query) {
                    return movie.hot === true;
                }
                var haystack = normalizeText([
                    movie.title,
                    movie.region,
                    movie.genre,
                    movie.category,
                    (movie.tags || []).join(" "),
                    movie.one_line
                ].join(" "));
                return haystack.indexOf(query) !== -1;
            }).slice(0, 80);
            if (!list.length) {
                result.innerHTML = '<div class="empty-result">没有找到匹配的影片</div>';
                return;
            }
            result.innerHTML = list.map(cardTemplate).join("");
        }
        var params = new URLSearchParams(window.location.search);
        var current = params.get("q") || "";
        if (current) {
            input.value = current;
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var value = input.value.trim();
            var nextUrl = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
            if (window.history && window.history.replaceState) {
                window.history.replaceState(null, "", nextUrl);
            }
            render(value);
        });
        input.addEventListener("input", function () {
            render(input.value);
        });
        render(input.value);
    }

    window.bindMoviePlayer = function (videoId, buttonId, sourceUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !sourceUrl) {
            return;
        }
        var prepared = false;
        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                return;
            }
            video.src = sourceUrl;
        }
        function start() {
            prepare();
            button.classList.add("is-hidden");
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }
        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("is-hidden");
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initCategoryFilter();
        initGlobalSearch();
    });
})();
