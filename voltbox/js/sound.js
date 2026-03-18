/* ============================================================
   VOLTBOX — Sound Effects (Web Audio API system beeps)
   ============================================================ */

(function () {
    var VB = window.VB;
    var audioCtx = null;

    function ctx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    function tone(freq, duration, vol, type) {
        try {
            var c = ctx();
            var osc = c.createOscillator();
            var gain = c.createGain();
            osc.connect(gain);
            gain.connect(c.destination);
            osc.frequency.value = freq;
            osc.type = type || 'square';
            gain.gain.setValueAtTime(vol || 0.04, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (duration || 0.06));
            osc.start(c.currentTime);
            osc.stop(c.currentTime + (duration || 0.06));
        } catch (e) { /* silent fail */ }
    }

    VB.Sound = {
        /** UI click / tap */
        click: function () {
            tone(880, 0.04, 0.03);
        },

        /** Component placed */
        place: function () {
            tone(660, 0.06, 0.04);
            setTimeout(function () { tone(880, 0.05, 0.03); }, 50);
        },

        /** Error beep */
        error: function () {
            tone(200, 0.2, 0.06);
        },

        /** Success chord */
        success: function () {
            tone(523, 0.12, 0.04);
            setTimeout(function () { tone(659, 0.12, 0.04); }, 80);
            setTimeout(function () { tone(784, 0.15, 0.04); }, 160);
        },

        /** Generic system beep */
        beep: function () {
            tone(440, 0.12, 0.04);
        },

        /** Delete sound */
        del: function () {
            tone(330, 0.08, 0.04);
        }
    };
})();

