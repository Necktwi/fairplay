var charmap = function() {
    var e = {a: "01111111001000100100010010000111111", b: "11111111001001100100110010010110110", c: "00111000100010100000110000011000001", d: "11111111000001100000101000100011100", e: "11111111001001100100110010011000001", f: "11111111001000100100010010001000000", g: "011111010000011000001100010110001111", h: "111111100010000001000000100011111111", i: "100000110000011111111100000110000011", j: "000011000000010000001000000111111101", k: "111111100010000010100010001010000011", l: "111111100000010000001000000100000011", m: "111111101100000001100011000011111111", n: "111111101000000011000000010011111111", o: "011111010000011000001100000101111101", p: "111111110010001001000100100001100001", q: "011111010000011000101100001101111101", r: "111111110011001001010100101001100011", s: "011000110010011001001100100110001101", t: "100000010000001111111100000010000001", u: "111111100000010000001000000111111111", v: "111000000011000000011000110011100001", w: "111111100001100011000000011011111111", x: "110001100101000001000001010011000111", y: "110000000110000000111001100011000001", z: "100001110001011001001101000111000011"};
    var t = function(t) {
        var n = new Array;
        var r = new Array;
        for (var i = 0; i < e[t].length; i++) {
            if (i > 0 && i % 7 == 0) {
                n.push(r);
                r = []
            }
            r.push(parseInt(e[t].charAt(i)))
        }
        n.push(r);
        return n
    };
    return{getArrayFor: t}
};
var gameOfLife = function(e, t) {
    var n, r, i, s, o = new Array, u, a;
    window.requestAnimFrame = function(e) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(e) {
            window.setTimeout(e, 1e3 / 60)
        }
    }();
    var f = function() {
        n = document.createElement("canvas");
        n.height = window.innerHeight || html.clientHeight;
        n.width = window.innerWidth || html.clientWidth;
        var t = n.style;
        var u = document.body;
        u.appendChild(n);
        r = r = n.getContext("2d");
        s = Math.floor(n.width / e);
        i = Math.floor(n.height / e);
        for (var a = 0; a < s; a++) {
            var f = new Array;
            for (var h = 0; h < i; h++) {
                f.push(0)
            }
            o.push(f)
        }
        c();
        l()
    };
    var l = function() {
        n.onclick = function(t) {
            var n = Math.floor((t.pageX - this.offsetLeft) / e);
            var r = Math.floor((t.pageY - this.offsetTop) / e);
            if (o[n][r] == 0)
                o[n][r] = 1;
            else
                o[n][r] = 0;
            p(n, r)
        }
    };
    var c = function() {
        r.lineWidth = .05;
        r.strokeStyle = "#fff";
        for (var t = 0; t < s; t++) {
            for (var n = 0; n < i; n++) {
                r.beginPath();
                r.rect(t * e, n * e, e, e);
                r.stroke();
                r.closePath()
            }
        }
    };
    var h = function() {
        r.clearRect(0, 0, n.width, n.height);
        for (var t = 0; t < s; t++) {
            for (var u = 0; u < i; u++) {
                r.beginPath();
                r.rect(t * e, u * e, e, e);
                if (o[t][u] == 1) {
                    r.fillStyle = "#999";
                    r.fill()
                }
                r.stroke();
                r.closePath()
            }
        }
    };
    var p = function(t, n) {
        r.beginPath();
        r.rect(t * e, n * e, e, e);
        if (o[t][n] == 3) {
            r.fillStyle = "#FFF"
        } else if (o[t][n] == 1) {
            r.fillStyle = "#999"
        } else {
            r.fillStyle = "#fff"
        }
        r.fill();
        r.stroke();
        r.closePath()
    };
    var d = function(e, t) {
        if (e < 0)
            e = s - 1;
        if (t < 0)
            t = i - 1;
        if (e >= s)
            e = 0;
        if (t >= i)
            t = 0;
        var n = o[e][t];
        if (n == 0 || n == 4)
            return false;
        else
            return true
    };
    var v = function() {
        a = false;
        var e;
        for (var t = 0; t < o.length; t++) {
            for (var n = 0; n < o[t].length; n++) {
                e = 0;
                if (d(t - 1, n - 1))
                    e++;
                if (d(t - 1, n))
                    e++;
                if (d(t - 1, n + 1))
                    e++;
                if (d(t, n - 1))
                    e++;
                if (d(t, n + 1))
                    e++;
                if (d(t + 1, n - 1))
                    e++;
                if (d(t + 1, n))
                    e++;
                if (d(t + 1, n + 1))
                    e++;
                if (o[t][n] == 1 || o[t][n] == 4) {
                    if (e < 2) {
                        o[t][n] = 3;
                        a = true
                    }
                    if (e > 3) {
                        o[t][n] = 3;
                        a = true
                    }
                } else if (o[t][n] == 0 || o[t][n] == 4) {
                    if (e == 3) {
                        o[t][n] = 4;
                        a = true
                    }
                }
            }
        }
        for (var t = 0; t < o.length; t++) {
            for (var n = 0; n < o[t].length; n++) {
                if (o[t][n] == 3) {
                    o[t][n] = 0
                }
                if (o[t][n] == 4) {
                    o[t][n] = 1
                }
            }
        }
        h();
        if (!a)
            g()
    };
    var m = function() {
        u = window.setInterval(v, t)
    };
    var g = function() {
        window.clearInterval(u)
    };
    var y = function() {
        for (var e = 0; e < o.length; e++) {
            for (var t = 0; t < o[e].length; t++) {
                o[e][t] = 0
            }
        }
        h()
    };
    var b = function() {
        return o
    };
    var w = function(e) {
        if (/^[ a-z]+$/i.test(e)) {
            y();
            var t = charmap();
            var n = Math.floor(s / 2) - Math.floor(e.length * 6 / 2);
            var r = Math.floor(i / 2) - 4;
            for (var u = 0; u < e.length; u++) {
                var a = t.getArrayFor(e.charAt(u));
                for (var f = 0; f < 5; f++) {
                    for (var l = 0; l < 7; l++) {
                        o[n + f][r + l] = a[f][l]
                    }
                }
                n += 6
            }
            h()
        }
    };
    return{init: f, startAnimation: m, stopAnimation: g, getBoard: b, clearBoard: y, writeText: w}
};
var setup = function() {
    var h = document.getElementsByTagName('html')[0];
    if (h.className == '') {
        var e = gameOfLife(15, 100);
        e.init();
        e.writeText("fairplay");
        setTimeout(e.startAnimation, 3e3)
    }
};
