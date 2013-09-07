//Author: Gowtham
//Copyright 2013 Ferryfair, Inc.
//2013/05/20 10:01:00

window.ferryplayer = {
    init: function() {
        debugger;
        var ferryvideos = document.getElementsByClassName("ferryvideo");
        var ferry;
        var launchpad;
        var src;
        var fvideo;
        for (var i = 0; i < ferryvideos.length; i++) {
            fvideo = ferryvideos[i];
            src = fvideo.getAttribute("data-src");
            launchpad = new ferrytools.launchpad(src, "", function() {
                var player = new ferryplayer.player(fvideo, this.url, this.ferry.responseText, 2);
                ferryplayer.players.push(player);
                player.processm3u();
            });
            ferry = new ferrytools.ferry(launchpad);
        }
    },
    players: [],
    player: function(fvcontainer, src, m3u, buffersize) {
        if (this instanceof arguments.callee) {
            var fvideo = document.createElement("div");
            fvcontainer.insertAdjacentElement("afterBegin", fvideo);
            fvideo.classList.add("container");
            this.controls = document.createElement("div");
            this.controls.classList.add("controls");
            this.controls.gauge = this.gauge = document.createElement("div");
            this.gauge.classList.add("gauge");
            this.gauge.buffer = document.createElement("div");
            this.gauge.insertAdjacentElement("afterBegin", this.gauge.buffer);
            this.gauge.buffer.classList.add("buffer");
            this.gauge.buffer.fill = this.gauge.buffer.insertAdjacentElement("afterBegin", document.createElement("div"));
            this.gauge.buffer.fill.classList.add("fill");
            fvideo.insertAdjacentElement("beforeEnd", this.controls);
            this.controls.insertAdjacentElement("beforeEnd", this.gauge);
            (this.info = document.createElement("div")).classList.add("info");
            fvideo.insertAdjacentElement("beforeEnd", this.info);
            var bufferedLength = 0;
            var bufferedFraction = 0;
            var that = this;
            var m3ul;
            var maxSegmentLength;
            var segments = [];
            var path = src.slice(0, src.lastIndexOf('/') + 1);
            var state = "halted";
            var playlist = [];
            var totalDuration = 0;
            var playProgressInterval;
            var fillFraction = 0;
            var m3u8version;
            var allowCache;
            var mediaSequence;
            var wholePlayedLength = 0;
            var firstPlayedSegmentIndex = 0;
            var playSegmentStartTime = 0;
            segments.currentsegmentindex = -1;
            fvideo.addEventListener("resize", function() {
                resizeControls();
            }, false);
            fvideo.addEventListener("mouseout", function() {
                hideControls();
            });
            fvideo.addEventListener("mouseover", function() {
                showControls();
            });
            fvideo.addEventListener("click", function() {
                pauseplay();
            });
            var validURI = function(uri) {
                return true;
            };
            this.processm3u = function() {
                m3ul = m3u.split("\n");
                m3ul.i = -1;
                m3ul.tags = [];
                m3ul.i++;
                if (m3ul[m3ul.i] === "#EXTM3U") {
                    while (m3ul[m3ul.i + 1]) {
                        m3ul.i++;
                        if (m3ul[m3ul.i] !== "") {
                            if (m3ul[m3ul.i][0] !== "#") {
                                var play = {tags: [], URI: ""};
                                for (var i = 0; i < m3ul.tags.length; i++) {
                                    if (m3ul.tags[i] && m3ul.tags[i].slice(0, 7) === "#EXTINF") {
                                        var t = m3ul.tags.splice(i, 1)[0];
                                        i--;
                                        if ((play.duration = parseFloat(t.slice(8, t.indexOf(",")))) > maxSegmentLength) {
                                            throw "segment length exceeded max segment length";
                                        }
                                        totalDuration += play.duration;
                                        play.tags.push(t);
                                    }
                                }
                                if (validURI(m3ul[m3ul.i])) {
                                    play.URI = m3ul[m3ul.i];
                                    playlist.push(play);
                                }
                            } else {
                                if (m3ul[m3ul.i].slice(0, 4) === "#EXT") {
                                    if (m3ul[m3ul.i].slice(0, 21) === "#EXT-X-TARGETDURATION") {
                                        maxSegmentLength = parseFloat(m3ul[m3ul.i].slice(22));
                                    } else if (m3ul[m3ul.i].slice(0, 21) === "#EXT-X-MEDIA-SEQUENCE") {
                                        mediaSequence = parseFloat(m3ul[m3ul.i].slice(22));
                                    } else if (m3ul[m3ul.i].slice(0, 14) === "#EXT-X-VERSION") {
                                        m3u8version = parseFloat(m3ul[m3ul.i].slice(15));
                                    } else if (m3ul[m3ul.i].slice(0, 18) === "#EXT-X-ALLOW-CACHE") {
                                        allowCache = m3ul[m3ul.i].slice(19).toLowerCase() === "yes";
                                    } else if (m3ul[m3ul.i] === "#EXT-X-ENDLIST") {
                                        break;
                                    } else {
                                        m3ul.tags.push(m3ul[m3ul.i]);
                                    }
                                } else {
                                    throw "Invalid extended m3u";
                                }
                            }
                        }
                    }
                    setTimeout(processNextSegment, 0);
                } else {
                    throw "Invalid extended m3u";
                }
            };
            var processNextSegment = function() {
                if (segments.length < playlist.length) {
                    if (segments.length - (segments.currentsegmentindex + 1) < buffersize) {
                        var video = document.createElement("video");
                        segments.push(video);
                        video.player = that;
                        video.classList.add("ferrymediasegment");
                        video.onloadprogress = function() {
                            this.bufferwatch = function() {
                                if (parseInt(video.buffered.end(0).toFixed(6) / video.duration) === 1) {
                                    delete video.bufferwatch;
                                    clearInterval(video.bufferwatcher);
                                    delete video.bufferwatcher;
                                    delete video.onloadprogress;
                                    setTimeout(function() {
                                        playSegment("loaded", video);
                                    }, 0);
                                    setTimeout(processNextSegment, 0);
                                    bufferedLength += playlist[arguments.callee.i].duration;
                                    bufferedFraction = bufferedLength / totalDuration;
                                    if (!playProgressInterval) {
                                        trackPlayProgress();
                                    } else {
                                        resizeControls();
                                    }
                                }
                            };
                            this.bufferwatch.i = segments.length - 1;
                            this.bufferwatcher = setInterval(this.bufferwatch, 100);
                        };
                        video.onplayend = function() {
                            state = "halted";
                            wholePlayedLength += this.duration - playSegmentStartTime;
                            playSegment("ended");
                            setTimeout(processNextSegment, 0);
                        };
                        video.addEventListener("progress", video.onloadprogress);
                        video.addEventListener("ended", video.onplayend);
                        if (playlist[segments.length - 1].tags[0]) {
                            video.info = playlist[segments.length - 1].tags[0];
                        }
                        video.src = path + playlist[segments.length - 1].URI;
                    }
                } else {
                }
            };
            var drawplayer = function(video) {
                var presentvideo = fvideo.getElementsByTagName("video")[0];
                if (presentvideo) {
                    presentvideo.parentElement.replaceChild(video, presentvideo);
                } else {
                    fvideo.insertAdjacentElement("afterBegin", video);
                }
                that.info.innerText = video.info;
                resizeControls();
            };
            var playSegment = function(event, position) {
                if (event === "loaded") {
                    if (segments.currentsegmentindex === -1) {
                        playSegment("ended");
                    } else if (state === "halted") {
                        playSegment("ended");
                    }
                } else if (event === "ended") {
                    playNextSegment();
                } else if (event === "resume" && state === "paused") {
                    segments[segments.currentsegmentindex].play();
                }
            };
            var playNextSegment = function() {
                if (segments[segments.currentsegmentindex + 1]) {
                    playSegmentStartTime = 0;
                    segments[++segments.currentsegmentindex].play();
                    drawplayer(segments[segments.currentsegmentindex]);
                    state = "playing";
                }
            };
            var showControls = function() {
                that.controls.classList.add("visible");
            };
            var hideControls = function() {
                that.controls.classList.remove("visible");
            };
            var resizeControls = function() {
                that.gauge.style.width = (that.gauge.width = fvideo.offsetWidth) + "px";
                that.gauge.buffer.style.width = parseInt(bufferedFraction * (that.gauge.width - 2)) + "px";
                that.gauge.buffer.fill.style.width = parseInt(fillFraction * (that.gauge.width - 2)) + "px";
            };
            var updatePlayProgress = function() {
                fillFraction = ((segments[segments.currentsegmentindex].currentTime + wholePlayedLength) / totalDuration);
                that.gauge.buffer.fill.style.width = parseInt(fillFraction * (that.gauge.width - 2)) + "px";
                if (fillFraction >= 1) {
                    stopTrackingPlayProgress();
                }
            };
            var pauseplay = function() {
                if (!segments[segments.currentsegmentindex].paused) {
                    segments[segments.currentsegmentindex].pause();
                    stopTrackingPlayProgress();
                } else {
                    if (segments.currentsegmentindex === segments.length - 1 && segments[segments.currentsegmentindex].currentTime === segments[segments.currentsegmentindex].played.end(0)) {
                        segments.currentsegmentindex = 0;
                        drawplayer(segments[0]);
                    }
                    segments[segments.currentsegmentindex].play();
                    trackPlayProgress();
                }
            };
            function trackPlayProgress() {
                playProgressInterval = setInterval(updatePlayProgress, 330);
            }
            function stopTrackingPlayProgress() {
                clearInterval(playProgressInterval);
            }
        } else {
            throw "player object constructor cannot be called as a function";
        }
    }
};