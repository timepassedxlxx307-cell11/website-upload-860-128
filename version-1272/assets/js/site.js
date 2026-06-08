(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function text(value) {
        return (value || "").toString().toLowerCase();
    }

    function initMenu() {
        var button = document.querySelector(".menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        start();
    }

    function initFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll(".filterable-grid"));
        if (!grids.length) {
            return;
        }
        var localSearch = document.querySelector(".local-search");
        var genreButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-genre]"));
        var yearButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-year]"));
        var sortButtons = Array.prototype.slice.call(document.querySelectorAll("[data-sort]"));
        var state = {
            query: "",
            genre: "",
            year: "",
            sort: "default"
        };
        var original = new Map();
        grids.forEach(function (grid) {
            original.set(grid, Array.prototype.slice.call(grid.children));
        });
        function apply() {
            grids.forEach(function (grid) {
                var cards = original.get(grid).slice();
                if (state.sort === "year-desc") {
                    cards.sort(function (a, b) {
                        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                    });
                }
                if (state.sort === "title-asc") {
                    cards.sort(function (a, b) {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                    });
                }
                cards.forEach(function (card) {
                    grid.appendChild(card);
                    var haystack = text(card.textContent + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-region"));
                    var okQuery = !state.query || haystack.indexOf(state.query) !== -1;
                    var okGenre = !state.genre || text(card.getAttribute("data-genre")).indexOf(text(state.genre)) !== -1;
                    var okYear = !state.year || (card.getAttribute("data-year") || "") === state.year;
                    card.classList.toggle("hidden-card", !(okQuery && okGenre && okYear));
                });
            });
        }
        if (localSearch) {
            localSearch.addEventListener("input", function () {
                state.query = text(localSearch.value.trim());
                apply();
            });
        }
        genreButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                state.genre = button.getAttribute("data-filter-genre") || "";
                genreButtons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        });
        yearButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                state.year = button.getAttribute("data-filter-year") || "";
                yearButtons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        });
        sortButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                state.sort = button.getAttribute("data-sort") || "default";
                sortButtons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        });
    }

    function initSearch() {
        var input = document.getElementById("search-input");
        var results = document.getElementById("search-results");
        var status = document.getElementById("search-status");
        var form = document.querySelector(".search-page-form");
        if (!input || !results || !status || !window.SITE_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function card(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return "<article class=\"movie-card movie-card-standard\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-region=\"" + escapeHtml(movie.region) + "\">" +
                "<a class=\"movie-thumb\" href=\"" + escapeHtml(movie.file) + "\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"movie-type\">" + escapeHtml(movie.type) + "</span><span class=\"movie-year\">" + escapeHtml(movie.year) + "</span></a>" +
                "<div class=\"movie-info\"><h3><a href=\"" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3><p>" + escapeHtml(movie.one_line) + "</p><div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div><div class=\"movie-tags\">" + tags + "</div></div></article>";
        }
        function escapeHtml(value) {
            return (value || "").toString().replace(/[&<>\"]/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;"
                }[char];
            });
        }
        function run(query) {
            var q = text(query.trim());
            if (!q) {
                results.innerHTML = "";
                status.textContent = "输入关键词查找你感兴趣的影片";
                return;
            }
            var found = window.SITE_MOVIES.filter(function (movie) {
                var haystack = text([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.one_line, (movie.tags || []).join(" ")].join(" "));
                return haystack.indexOf(q) !== -1;
            }).slice(0, 120);
            if (!found.length) {
                results.innerHTML = "";
                status.textContent = "没有找到相关视频，请尝试其他关键词";
                return;
            }
            status.textContent = "搜索结果";
            results.innerHTML = found.map(card).join("");
        }
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var q = input.value.trim();
                var nextUrl = q ? "search.html?q=" + encodeURIComponent(q) : "search.html";
                window.history.replaceState(null, "", nextUrl);
                run(q);
            });
        }
        run(initial);
    }

    function initPlayer() {
        var video = document.getElementById("movie-video");
        if (!video) {
            return;
        }
        var wrapper = video.closest(".player-wrap");
        var button = wrapper ? wrapper.querySelector(".player-start") : null;
        var src = video.getAttribute("data-hls") || "";
        var hlsInstance = null;
        var loaded = false;
        function attach() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                return new Promise(function (resolve) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function () {
                        resolve();
                    });
                });
            }
            video.src = src;
            return Promise.resolve();
        }
        function play() {
            attach().then(function () {
                if (wrapper) {
                    wrapper.classList.add("is-playing");
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        if (wrapper) {
                            wrapper.classList.remove("is-playing");
                        }
                    });
                }
            });
        }
        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (wrapper) {
                wrapper.classList.add("is-playing");
            }
        });
        video.addEventListener("pause", function () {
            if (wrapper && video.currentTime === 0) {
                wrapper.classList.remove("is-playing");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initSearch();
        initPlayer();
    });
}());
