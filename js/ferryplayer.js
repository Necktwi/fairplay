//Author: Gowtham
//Copyright 2013 Ferryfair, Inc.
//2013/05/20 10:01:00

window.ferryplayer = {
    init: function() {
        //debugger;
        var ferryvideos = document.getElementsByClassName("ferryvideo");
        var ferry;
        var launchpad;
        var launchpadURL;
        var src;
        var fvideo;
        for (var i = 0; i < ferryvideos.length; i++) {
            fvideo = ferryvideos[i];
            src = fvideo.getAttribute("data-src");
            var path;
            if (src.search("fmwsp://") == 0) {
                var port = "";
                var pathIndex = -1;
                var portIndex = -1;
                if ((pathIndex = src.indexOf("/", 8)) > 0) {
                    path = src.substring(pathIndex, src.length)
                }
                if ((portIndex = src.indexOf(":", 8)) > 0 && ((pathIndex > 0) === (portIndex < pathIndex))) {
                    port = src.substring(portIndex + 1, (pathIndex > 0 ? pathIndex : src.length));
                }
                port = port.length > 0 ? port : "17291";
                var dn = src.substring(8, portIndex > 0 ? portIndex : (pathIndex > 0 ? pathIndex : src.length));
                launchpadURL = "ws://" + dn + ":" + port;
            } else {
                launchpadURL = src;
            }
            launchpad = new ferrytools.launchpad(launchpadURL, "", function() {
                var player = new ferryplayer.player(fvideo, this.mediaSRC, this.ferry.responseText, 2);
                ferryplayer.players.push(player);
                player.path = path;
                player.launchpad = this;
                player.processSRC();
            });
            launchpad.mediaSRC = src;
            launchpad.path = path;
            launchpad.oncrash = function() {
                console.log("an error occured");
            };
            launchpad.onclose = function() {
                console.log("unable to connecto to server");
            }
            ferry = new ferrytools.ferry(launchpad);
        }
    },
    players: [],
    player: function(fvcontainer, src, initParams, buffersize) {
        if (this instanceof arguments.callee) {
            var mobile = (navigator.userAgent.search("Mobile") > 0);
            var that = this;
            var fvideo = document.createElement("div");
            if (!fvcontainer.getAttribute("width")) {
                fvideo.style.width = "320px";
            } else {
                fvideo.style.width = fvcontainer.getAttribute("width") + "px";
            }
            if (!fvcontainer.getAttribute("height")) {
                fvideo.style.height = "240px";
            } else {
                fvideo.style.height = fvcontainer.getAttribute("height") + "px";
            }
            fvcontainer.insertAdjacentElement("afterBegin", fvideo);
            fvideo.classList.add("container");
            this.controls = document.createElement("div");
            this.controls.classList.add("controls");
            //if (!mobile) {
            this.controls.gauge = this.gauge = document.createElement("div");
            this.controls.gauge.classList.add("gauge");
            this.gauge.width = 0;
            this.controls.gauge.buffers = [];
            //}
            var createPlaybckControls = function() {
                var playbck = document.createElement("div");
                playbck.id = "playbck";
                insertAdjacentElement("beforeEnd", playbck);
                playbck.playpause = document.createElement("button");
                playbck.playpause.id = "playpause";
                playbck.playpause.classList.add("buttons");
                playbck.insertAdjacentElement("afterBegin", playbck.playpause);
                playbck.fastForward = document.createElement("button");
                playbck.fastForward.id = "fastForward";
                playbck.fastForward.classList.add("buttons");
                playbck.playpause.insertAdjacentElement("afterEnd", playbck.fastForward);
                playbck.rewind = document.createElement("button");
                playbck.rewind.id = "rewind";
                playbck.rewind.classList.add("buttons");
                playbck.playpause.insertAdjacentElement("beforeBegin", playbck.rewind);
                playbck.skipForward = document.createElement("button");
                playbck.skipForward.id = "skipForward";
                playbck.skipForward.classList.add("buttons");
                playbck.fastForward.insertAdjacentElement("afterEnd", playbck.skipForward);
                playbck.skipBackward = document.createElement("button");
                playbck.skipBackward.id = "skipBackward";
                playbck.skipBackward.classList.add("buttons");
                playbck.rewind.insertAdjacentElement("beforeBegin", playbck.skipBackward);
                return playbck;
            }
            this.controls.playbck = createPlaybckControls();
            var pause;
            var play;
            var pollingGauge;
            var live;
            var onendedevt = document.createEvent("Event");
            var startBuffer = 0;
            var bufferSize = 30;
            onendedevt.initEvent("ended", true, true);
            var frameoverevt = document.createEvent("Event");
            frameoverevt.initEvent("frameover", true, true);
            var clipToBufferSize = function() {
                if (bufferSize && that.gauge.buffers.length > bufferSize) {
                    playSegment("clipToBuffer");
                    delete playlist[startBuffer];
                    delete segments[startBuffer];
                    that.gauge.removeChild(that.gauge.buffers[startBuffer]);
                    delete that.gauge.buffers[startBuffer];
                    ++startBuffer;
                }
            }
            var seekPosition = function() {
                event.cancelBubble = true;
                pause();
                segments[segments.currentsegmentindex].currentTime = 0;
                segments.currentsegmentindex = this.index;
                playSegment("seek", segments[this.index], parseInt((event.offsetX / this.offsetWidth) * playlist[this.index].duration));
            };
            function createBuf() {
                var buf = document.createElement("div");
                if (that.gauge.buffers.length > 0) {
                    that.gauge.buffers[that.gauge.buffers.length - 1].insertAdjacentElement("afterEnd", buf);
                } else {
                    that.gauge.insertAdjacentElement("afterBegin", buf);
                }
                buf.classList.add("buffer");
                buf.index = that.gauge.buffers.length;
                buf.fill = document.createElement("div");
                buf.insertAdjacentElement("afterBegin", buf.fill);
                buf.fill.classList.add("fill");
                that.gauge.buffers.push(buf);
                buf.addEventListener("mousedown", seekPosition, false);
                return buf;
            }
            this.gauge.slider = document.createElement("div");
            this.gauge.slider.classList.add("slider");
            this.gauge.insertAdjacentElement("beforeEnd", this.gauge.slider);
            this.gauge.markFace = document.createElement("div");
            this.gauge.markFace.classList.add("markFace");
            this.gauge.insertAdjacentElement("beforeEnd", this.gauge.markFace);
            fvideo.insertAdjacentElement("beforeEnd", this.controls);
            this.controls.insertAdjacentElement("beforeEnd", this.gauge);
            this.controls.insertAdjacentElement("beforeEnd", this.controls.playbck);
            (this.info = document.createElement("div")).classList.add("info");
            fvideo.insertAdjacentElement("beforeEnd", this.info);
            var bufferedLength = 0;
            var bufferedFraction = 0;
            var m3ul;
            var maxSegmentLength;
            var segments = [];
            var path = src.slice(0, src.lastIndexOf('/') + 1);
            var state = "seeknext";
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
            var lastXSegmentSize;
            var lastYSegmentSize;
            segments.currentsegmentindex = -1;
            this.gauge.addEventListener("mouseover", function() {
                var x = event.pageX - that.controls.gauge.offsetLeft - 8;
                var st = playlist[startBuffer].tillDuration - playlist[startBuffer].duration;
                var mark = parseInt(st + (x / that.controls.gauge.width) * (totalDuration - st));
                that.controls.gauge.markFace.style.left = x + "px";
                that.gauge.markFace.classList.add("visible");
                that.gauge.markFace.textContent = parseInt(mark / 60) + ":" + (mark % 60);
            }, false);

            this.gauge.addEventListener("mouseout", function() {
                that.gauge.markFace.classList.remove("visible");
            }, false);


            fvideo.addEventListener("resize", function() {
                resizeControls();
            }, false);
            if (fvcontainer.getAttribute("data-controls") !== "show") {
                fvideo.addEventListener("mouseout", function() {
                    hideControls();
                });
                fvideo.addEventListener("mouseover", function() {
                    showControls();
                });
            } else {
                that.controls.classList.add("visible");
            }
            fvideo.addEventListener("mousedown", function() {
                pauseplay();
            });
            var validURI = function(uri) {
                return true;
            };
            this.processSRC = function() {
                if (src.search("fmwsp://") === 0) {
                    var lastpackindex = -1;
                    var processPacket = function(pck) {
                        if (pck.index !== lastpackindex) {
                            lastpackindex = pck.index;
                            var video = newFramio(pck);
                            video.index = segments.length;
                            totalDuration += video.duration;
                            var play = {
                                tags: ["index:" + pck.index],
                                URI: "",
                                tillDuration: totalDuration,
                                duration: video.duration
                            };
                            playlist.push(play);
                            segments.push(video);
                            video.player = that;
                            video.classList.add("ferrymediasegment");
                            if (that.gauge) {
                                var buf = createBuf();
                                buf.totalDuration = that.gauge.buffers;
                                buf.duration = video.duration;
                            }
                            video.onplayend = function() {
                                state = "seeknext";
                                wholePlayedLength += this.duration - playSegmentStartTime;
                                updatePlayProgress();
                                playSegment("ended");
                            };
                            video.addEventListener("ended", video.onplayend);
                            video.addEventListener("frameover", updatePlayProgress);
                            bufferedLength += video.duration;
                            totalDuration = bufferedLength;
                            that.gauge.buffers[segments.length - 1].totalDuration = bufferedLength;
                            that.gauge.buffers[segments.length - 1].duration = video.duration;
                            clipToBufferSize();
                            setTimeout(function() {
                                playSegment("loaded", video);
                            }, 0);
                            //bufferedFraction = bufferedLength / totalDuration;
//                            if (!playProgressInterval) {
//                                trackPlayProgress();
//                            } else {
//                                that.gauge.buffers[segments.length - 1].style.width = (parseInt((playlist[segments.length - 1].tillDuration / totalDuration) * (that.gauge.width - 2)) - that.gauge.buffers[segments.length - 1].offsetLeft) + "px";
//                            }
                        }
                    };
                    this.launchpad.ferry.__proto__.onmessage = function(e) {
                        var pck;
                        try {
                            pck = JSON.parse(e.data);
                        } catch (excp) {
                            console.log(excp);
                            console.log(e.data);
                            return;
                        }
                        if (pck.error) {
                            if (pck.error.search("end of stream") === 0) {

                            } else if (pck.error.search("") === 0) {

                            }
                        } else {
                            processPacket(pck);
                        }
                    }
                    this.launchpad.ferry.__proto__.send("{path:\"" + this.path + "\"}");
                } else {
                    pollingGauge = true;
                    m3ul = initParams.split("\n");
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
                                            play.tillDuration = totalDuration;
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
                }
            };
            var processNextSegment = function() {
                if (src.search("fmwsp://") === 0) {

                } else if (segments.length < playlist.length) {
                    if (segments.length - (segments.currentsegmentindex + 1) < buffersize) {
                        var video = document.createElement("video");
                        video.index = segments.length;
                        segments.push(video);
                        if (that.gauge)
                            createBuf();
                        video.player = that;
                        video.classList.add("ferrymediasegment");
                        video.onloadprogress = function() {
                            this.bufferwatch = function() {
                                try {
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
                                        if (that.gauge) {
                                            that.gauge.buffers[arguments.callee.i].totalDuration = bufferedLength;
                                            that.gauge.buffers[arguments.callee.i].duration = playlist[arguments.callee.i].duration;
                                        }
                                        bufferedFraction = bufferedLength / totalDuration;
                                        if (!playProgressInterval) {
                                            trackPlayProgress();
                                        } else {
                                            if (that.gauge)
                                                that.gauge.buffers[arguments.callee.i].style.width = (parseInt((playlist[arguments.callee.i].tillDuration / totalDuration) * (that.gauge.width - 2)) - that.gauge.buffers[arguments.callee.i].offsetLeft) + "px";
                                        }
                                    }
                                } catch (e) {
                                    //console.log(e);
                                }
                            };
                            this.bufferwatch.i = segments.length - 1;
                            this.bufferwatcher = setInterval(this.bufferwatch, 100);
                        };
                        video.onplayend = function() {
                            state = "seeknext";
                            wholePlayedLength += this.duration - playSegmentStartTime;
                            updatePlayProgress();
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
                var presentvideo = fvideo.getElementsByClassName("ferrymediasegment")[0];
                if (presentvideo) {
                    if (!fvcontainer.getAttribute("width") && (fvideo.offsetWidth !== (video.naturalWidth || video.videoWidth))) {
                        fvideo.style.width = presentvideo.offsetWidth + "px";
                    }
                    if (!fvcontainer.getAttribute("height") && fvideo.offsetHeight !== (video.naturalWidth || video.videoWidth)) {
                        fvideo.style.height = presentvideo.offsetHeight + "px";
                    }
                    presentvideo.parentElement.replaceChild(video, presentvideo);
                } else {
                    fvideo.insertAdjacentElement("afterBegin", video);
                }
                resizeControls();
            };
            var resizeControls = function() {
                if (fvideo.offsetWidth !== that.controls.width || bufferCount !== segments.length) {
                    that.gauge.style.width = (lastXSegmentSize = that.gauge.width = fvideo.offsetWidth) + "px";
                    var i = startBuffer;
                    var st = playlist[startBuffer].tillDuration - playlist[startBuffer].duration;
                    while (that.gauge.buffers[i]) {
                        //that.gauge.buffers[i].style.left=that.gauge.buffers[i-1]?(that.gauge.buffers[i-1].offsetLeft+that.gauge.buffers[i-1].offsetWidth);
                        that.gauge.buffers[i].style.width = (parseInt(((playlist[i].tillDuration - st) / (totalDuration - st)) * (that.gauge.width - 2)) - that.gauge.buffers[i].offsetLeft) + "px";
                        i++;
                    }
                }
                bufferCount = segments.length;
            };
            var playSegment = function(event, segment, position) {
                if (event === "loaded" && state !== "paused") {
                    if (segments.currentsegmentindex === -1) {
                        playSegment("ended");
                    } else if (state === "halted" && segment === segments[segments.currentsegmentindex + 1]) {
                        playSegment("ended");
                    }
                } else if (event === "ended" && state !== "paused") {
                    playNextSegment();
                } else if (event === "resume" && state === "paused") {
                    segments[segments.currentsegmentindex].play();
                } else if (event === "seek") {
                    segment.currentTime = position;
                    setInterval(processNextSegment, 0);
                    drawplayer(segments[segments.currentsegmentindex]);
                    play();
                    state = "playing";
                } else if (event === "clipToBuffer") {
                    if (segments.currentsegmentindex === startBuffer) {
                        var ps = state;
                        playNextSegment();
                        if (ps === "paused") {
                            pause();
                        }
                    }
                }
            };
            var playNextSegment = function() {
                if (segments[segments.currentsegmentindex + 1]) {
                    playSegmentStartTime = 0;
                    segments.currentsegmentindex++;
                    segments[segments.currentsegmentindex].play();
                    drawplayer(segments[segments.currentsegmentindex]);
                    state = "playing";
                } else {
                    state = "halted";
                }
            };
            var showControls = function() {
                that.controls.classList.add("visible");
            };
            var hideControls = function() {
                that.controls.classList.remove("visible");
            };
            var bufferCount = 0;
            var updatePlayProgress = function() {
                fillFraction = (segments[segments.currentsegmentindex].currentTime / segments[segments.currentsegmentindex].duration);
                if (fillFraction >= 1) {
                    //that.gauge.buffers[segments.currentsegmentindex].fill.style.width = (that.gauge.buffers[segments.currentsegmentindex].offsetWidth) + "px";
                    that.gauge.buffers[segments.currentsegmentindex].fill.style.width = "100%";
                    that.gauge.slider.style.left = that.gauge.buffers[segments.currentsegmentindex].offsetLeft + that.gauge.buffers[segments.currentsegmentindex].offsetWidth + "px";
                    if (segments.currentsegmentindex === playlist.length - 1) {
                        stopTrackingPlayProgress();
                    }
                } else {
                    var augmentedLength = parseInt(fillFraction * that.gauge.buffers[segments.currentsegmentindex].offsetWidth);
//                    if (that.gauge.buffers[segments.currentsegmentindex].fill.offsetWidth < augmentedLength) {
//                        //that.gauge.buffers[segments.currentsegmentindex].fill.style.width = augmentedLength + "px";
//                        that.gauge.buffers[segments.currentsegmentindex].fill.style.width = parseInt(fillFraction*100) + "%";
//                    }
                    that.gauge.buffers[segments.currentsegmentindex].fill.style.width = parseInt(fillFraction * 100) + "%";
                    that.gauge.slider.style.left = that.gauge.buffers[segments.currentsegmentindex].offsetLeft + augmentedLength + "px";
                }
            };
            var pauseplay = function() {
                if (!segments[segments.currentsegmentindex].paused) {
                    state = "paused";
                    segments[segments.currentsegmentindex].pause();
                    stopTrackingPlayProgress();
                } else {
                    state = "playing";
                    if (segments.currentsegmentindex === segments.length - 1 && segments[segments.currentsegmentindex].currentTime === segments[segments.currentsegmentindex].played.end(0)) {
                        segments.currentsegmentindex = 0;
                        drawplayer(segments[0]);
                    }
                    segments[segments.currentsegmentindex].play();
                    trackPlayProgress();
                }
            };
            pause = this.pause = function() {
                state = "paused";
                segments[segments.currentsegmentindex].pause();
                stopTrackingPlayProgress();
            };
            play = this.play = function() {
                segments[segments.currentsegmentindex].play();
                trackPlayProgress();
            };

            function trackPlayProgress() {
                if (pollingGauge) {
                    playProgressInterval = setInterval(updatePlayProgress, 50);
                }
            }
            function stopTrackingPlayProgress() {
                if (pollingGauge) {
                    clearInterval(playProgressInterval);
                }
            }
            function newFramio(packet) {
                var elm = document.createElement("img");
                elm.audio = document.createElement("audio");
                elm.audio.style.display = "none";
                if (packet.ferrymp3)
                    elm.audio.src = "data:audio/mp3;base64," + packet.ferrymp3;
                fvideo.insertAdjacentElement("afterBegin", elm.audio);
                elm.classList.add("ferrymediasegment");
                elm.duration = packet.duration;
                elm.realTime = packet.time;
                elm.frames = packet.ferryframes;
                elm.currentTime = 0;
                elm.paused = true;
                //elm.onendedevt = document.createEvent("Event");
                elm.index = packet.index;
                //elm.onendedevt.initEvent("ended", true, true); //true for can bubble, true for cancelable
                //elm.frameover = document.createEvent("Event");
                //elm.frameover.initEvent("ended", true, true);
                var time = 0;
                elm.currentFrameIndex = -1;
                elm.frameDuration = elm.duration / elm.frames.length;
                elm.loadNextFrame = function() {
                    if (!this.paused) {
                        this.currentFrameIndex++;
                        if (this.frames[this.currentFrameIndex]) {
                            this.currentTime += this.frameDuration;
                            this.src = "data:image/jpeg;base64," + this.frames[this.currentFrameIndex];
                            setTimeout(function(e) {
                                e.loadNextFrame();
                            }, (this.frameDuration * 1000), this);
                            this.dispatchEvent(frameoverevt);
                        } else {
                            this.paused = true;
                            this.currentFrameIndex = -1;
                            this.dispatchEvent(onendedevt);
                        }
                    }
                }
                elm.play = function() {
                    if (this.paused) {
                        this.paused = false;
                        try {
                            //this.audio.currentTime = this.currentTime;
                        } catch (e) {

                        }
                        this.audio.play();
                        this.currentTime %= this.frameDuration;
                        this.currentFrameIndex = parseInt(this.currentTime / this.frameDuration) - 1;
                        setTimeout(function(e) {
                            e.loadNextFrame();
                        }, 0, this);
                    }
                }
                elm.pause = function() {
                    this.paused = true;
                    this.audio.pause();
                }
                elm.played = {
                    start: function(index) {

                    },
                    end: function(index) {
                        return this.duration;
                    },
                    duration: elm.duration
                }
                return elm;
            }
        } else {
            throw "player object constructor cannot be called as a function";
        }
    }
};