(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    onReady(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        initHero();
        initFilters();
        initPlayers();
    });

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });

        show(0);
        restart();
    }

    function initFilters() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
        areas.forEach(function (area) {
            var parent = area.parentElement || document;
            var cards = Array.prototype.slice.call(parent.querySelectorAll("[data-card]"));
            var search = area.querySelector("[data-filter-control='search']");
            var year = area.querySelector("[data-filter-control='year']");
            var type = area.querySelector("[data-filter-control='type']");
            var empty = area.querySelector("[data-empty-state]");

            function filter() {
                var text = search ? search.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-keywords") || ""
                    ].join(" ").toLowerCase();
                    var matchesText = !text || haystack.indexOf(text) !== -1;
                    var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                    var matchesType = !selectedType || card.getAttribute("data-type") === selectedType;
                    var matches = matchesText && matchesYear && matchesType;
                    card.hidden = !matches;
                    if (matches) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [search, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", filter);
                    control.addEventListener("change", filter);
                }
            });
        });
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (frame) {
            var video = frame.querySelector("video");
            var overlay = frame.querySelector("[data-player-overlay]");
            if (!video) {
                return;
            }

            var url = video.getAttribute("data-video-url");
            var loaded = false;
            var hlsInstance = null;

            function load() {
                if (loaded || !url) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }
            }

            function play() {
                load();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var started = video.play();
                if (started && typeof started.catch === "function") {
                    started.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });

            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });

            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }
})();
