(function () {
    function boot() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-video]"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector("[data-play-cover]");
            var buttons = Array.prototype.slice.call(player.querySelectorAll("[data-play-button]"));
            var url = player.getAttribute("data-video");
            var hls = null;

            function attach() {
                if (!video || !url || video.getAttribute("data-ready") === "1") {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }

                video.setAttribute("data-ready", "1");
            }

            function start() {
                attach();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                video.controls = true;
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        video.controls = true;
                    });
                }
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", start);
            });

            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        start();
                    }
                });

                video.addEventListener("play", function () {
                    if (cover) {
                        cover.classList.add("is-hidden");
                    }
                });
            }

            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
