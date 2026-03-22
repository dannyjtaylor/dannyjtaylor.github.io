/* ============================================================
   VOLTBOX — Circuit Simulation Engine
   Uses Union-Find to evaluate breadboard connectivity.
   ============================================================ */

(function () {
    var VB = window.VB;

    /* ---------- Union-Find (Disjoint Set) ---------- */

    function UF() {
        this.p = {};   // parent
        this.r = {};   // rank
    }

    UF.prototype.find = function (x) {
        if (!(x in this.p)) { this.p[x] = x; this.r[x] = 0; }
        if (this.p[x] !== x) this.p[x] = this.find(this.p[x]); // path compression
        return this.p[x];
    };

    UF.prototype.union = function (a, b) {
        var ra = this.find(a), rb = this.find(b);
        if (ra === rb) return;
        if (this.r[ra] < this.r[rb])      this.p[ra] = rb;
        else if (this.r[ra] > this.r[rb]) this.p[rb] = ra;
        else { this.p[rb] = ra; this.r[ra]++; }
    };

    UF.prototype.connected = function (a, b) {
        return this.find(a) === this.find(b);
    };

    /* ---------- Helper: seed base breadboard nets ---------- */

    function seedNets(uf) {
        uf.find('POWER');
        uf.find('GROUND');
        for (var c = 0; c < VB.CONFIG.COLS; c++) {
            uf.find('T_TOP_' + c);
            uf.find('T_BOT_' + c);
        }
    }

    /** Add a component's pin connections into a UF */
    function addComponent(uf, comp) {
        if (comp.type === 'seg7-cc' || comp.type === 'seg7-ca') {
            // 7-segment display: only union the two common pins (internally connected)
            var pins = VB.getSeg7Pins(comp.col);
            if (pins.com.length >= 2) {
                var comNet0 = VB.Breadboard.getNetId(pins.com[0].col, pins.com[0].row);
                var comNet1 = VB.Breadboard.getNetId(pins.com[1].col, pins.com[1].row);
                if (comNet0 && comNet1) uf.union(comNet0, comNet1);
            }
            // Segment pins are NOT unioned to common — each is an independent LED path
        } else if (comp.type === 'clock') {
            // Clock/oscillator: VCC pin unions to POWER, GND pin unions to GROUND
            // OUT pin unions to POWER only when clockOutputHigh is true
            var cPins = VB.getClockPins(comp.col);
            var vccNet = VB.Breadboard.getNetId(cPins.vcc.col, cPins.vcc.row);
            var gndNet = VB.Breadboard.getNetId(cPins.gnd.col, cPins.gnd.row);
            var outNet = VB.Breadboard.getNetId(cPins.out.col, cPins.out.row);
            // VCC and GND are passthrough — they connect to whatever net they sit on
            // but internally the chip routes VCC→POWER and GND→GROUND
            // We don't auto-union VCC/GND to POWER/GROUND; they connect through wires.
            // The OUT pin acts as a switched connection to VCC (power) when high.
            if (VB.state.clockOutputHigh && vccNet && outNet) {
                uf.union(vccNet, outNet);
            }
        } else if (comp.pin) {
            // single-pin: power or ground marker
            var net = VB.Breadboard.getNetId(comp.pin.col, comp.pin.row);
            if (!net) return;
            if (comp.type === 'power')  uf.union(net, 'POWER');
            if (comp.type === 'ground') uf.union(net, 'GROUND');
        } else {
            // two-pin component (wire, resistor, led)
            var n1 = VB.Breadboard.getNetId(comp.pin1.col, comp.pin1.row);
            var n2 = VB.Breadboard.getNetId(comp.pin2.col, comp.pin2.row);
            if (n1 && n2) uf.union(n1, n2);
        }
    }

    /* ---------- Public API ---------- */

    VB.Simulation = {

        /**
         * Run the simulation on the current component set.
         * Returns { activeLEDs:[], shortCircuit:bool, messages:[] }
         */
        run: function () {
            var comps   = VB.state.components;
            var results = { activeLEDs: [], shortCircuit: false, messages: [] };

            if (comps.length === 0) {
                results.messages.push('No components placed');
                VB.state.simulationResults = results;
                return results;
            }

            /* --- Step 1: short-circuit check (wires + markers + seg7 common pins, no resistors/LEDs) --- */
            var wireUF = new UF();
            seedNets(wireUF);
            for (var i = 0; i < comps.length; i++) {
                var c = comps[i];
                if (c.type === 'wire' || c.type === 'power' || c.type === 'ground') {
                    addComponent(wireUF, c);
                }
                // Include seg7 common pin union in short-circuit check
                if (c.type === 'seg7-cc' || c.type === 'seg7-ca') {
                    var seg7Pins = VB.getSeg7Pins(c.col);
                    if (seg7Pins.com.length >= 2) {
                        var cn0 = VB.Breadboard.getNetId(seg7Pins.com[0].col, seg7Pins.com[0].row);
                        var cn1 = VB.Breadboard.getNetId(seg7Pins.com[1].col, seg7Pins.com[1].row);
                        if (cn0 && cn1) wireUF.union(cn0, cn1);
                    }
                }
                // Include clock output union in short-circuit check when output is high
                if (c.type === 'clock' && VB.state.clockOutputHigh) {
                    var clkPins = VB.getClockPins(c.col);
                    var clkVcc = VB.Breadboard.getNetId(clkPins.vcc.col, clkPins.vcc.row);
                    var clkOut = VB.Breadboard.getNetId(clkPins.out.col, clkPins.out.row);
                    if (clkVcc && clkOut) wireUF.union(clkVcc, clkOut);
                }
            }
            if (wireUF.connected('POWER', 'GROUND')) {
                results.shortCircuit = true;
                results.messages.push('\u26A0 SHORT CIRCUIT! Power connected directly to ground with no resistance');
            }

            /* --- Step 2: per-LED activation check --- */
            for (var li = 0; li < comps.length; li++) {
                var led = comps[li];
                if (led.type !== 'led') continue;

                // Build UF with everything EXCEPT this LED
                var uf = new UF();
                seedNets(uf);
                for (var j = 0; j < comps.length; j++) {
                    if (j === li) continue;
                    addComponent(uf, comps[j]);
                }

                var anodeNet   = VB.Breadboard.getNetId(led.pin1.col, led.pin1.row);
                var cathodeNet = VB.Breadboard.getNetId(led.pin2.col, led.pin2.row);
                if (!anodeNet || !cathodeNet) continue;

                var aPower = uf.connected(anodeNet, 'POWER');
                var cGround = uf.connected(cathodeNet, 'GROUND');

                if (aPower && cGround) {
                    results.activeLEDs.push(li);
                    results.messages.push('LED ' + (li + 1) + ' is ON \u2713');
                } else if (uf.connected(cathodeNet, 'POWER') && uf.connected(anodeNet, 'GROUND')) {
                    results.messages.push('LED ' + (li + 1) + ': Wrong polarity! Flip the LED.');
                } else {
                    var parts = [];
                    if (!aPower)  parts.push('anode (+) not connected to power');
                    if (!cGround) parts.push('cathode (\u2212) not connected to ground');
                    results.messages.push('LED ' + (li + 1) + ': Open circuit \u2014 ' + parts.join(', '));
                }
            }

            /* --- Step 3: per-segment activation check for 7-segment displays --- */
            results.seg7Status = {};
            for (var si = 0; si < comps.length; si++) {
                var seg7 = comps[si];
                if (seg7.type !== 'seg7-cc' && seg7.type !== 'seg7-ca') continue;

                var isCA = (seg7.type === 'seg7-ca');
                var s7pins = VB.getSeg7Pins(seg7.col);
                var segResult = {};
                var litCount = 0;

                // Get the net for one of the common pins
                var comNet = VB.Breadboard.getNetId(s7pins.com[0].col, s7pins.com[0].row);

                // Check each segment independently
                var segments = VB.SEG7_SEGMENTS;
                for (var sg = 0; sg < segments.length; sg++) {
                    var segName = segments[sg];
                    var segPinArr = s7pins[segName];
                    if (!segPinArr || segPinArr.length === 0) { segResult[segName] = false; continue; }

                    var segNet = VB.Breadboard.getNetId(segPinArr[0].col, segPinArr[0].row);
                    if (!segNet || !comNet) { segResult[segName] = false; continue; }

                    // Build UF with everything EXCEPT this seg7 component
                    var suf = new UF();
                    seedNets(suf);
                    for (var sj = 0; sj < comps.length; sj++) {
                        if (sj === si) continue;
                        addComponent(suf, comps[sj]);
                    }
                    // Add the common pin internal union (they're connected inside the package)
                    if (s7pins.com.length >= 2) {
                        var cn0 = VB.Breadboard.getNetId(s7pins.com[0].col, s7pins.com[0].row);
                        var cn1 = VB.Breadboard.getNetId(s7pins.com[1].col, s7pins.com[1].row);
                        if (cn0 && cn1) suf.union(cn0, cn1);
                    }

                    if (isCA) {
                        // Common Anode: common→POWER, segment→GROUND to light
                        segResult[segName] = suf.connected(comNet, 'POWER') && suf.connected(segNet, 'GROUND');
                    } else {
                        // Common Cathode: segment→POWER, common→GROUND to light
                        segResult[segName] = suf.connected(segNet, 'POWER') && suf.connected(comNet, 'GROUND');
                    }

                    if (segResult[segName]) litCount++;
                }

                results.seg7Status[si] = segResult;

                if (litCount > 0) {
                    results.messages.push('7-Seg display ' + (si + 1) + ': ' + litCount + ' segment(s) lit');
                } else {
                    results.messages.push('7-Seg display ' + (si + 1) + ': No segments lit');
                }
            }

            /* --- Step 4: clock status --- */
            results.clockActive = false;
            for (var ci = 0; ci < comps.length; ci++) {
                if (comps[ci].type === 'clock') {
                    var clkP = VB.getClockPins(comps[ci].col);
                    // Build UF without the clock to check if VCC reaches POWER and GND reaches GROUND
                    var cuf = new UF();
                    seedNets(cuf);
                    for (var cj = 0; cj < comps.length; cj++) {
                        if (cj === ci) continue;
                        addComponent(cuf, comps[cj]);
                    }
                    var clkVccNet = VB.Breadboard.getNetId(clkP.vcc.col, clkP.vcc.row);
                    var clkGndNet = VB.Breadboard.getNetId(clkP.gnd.col, clkP.gnd.row);
                    var powered = clkVccNet && clkGndNet &&
                                  cuf.connected(clkVccNet, 'POWER') &&
                                  cuf.connected(clkGndNet, 'GROUND');
                    if (powered) {
                        results.clockActive = true;
                        results.messages.push('Clock ' + (ci + 1) + ': Running at ' + VB.state.clockFrequency + 'Hz — OUT is ' + (VB.state.clockOutputHigh ? 'HIGH' : 'LOW'));
                    } else {
                        results.messages.push('Clock ' + (ci + 1) + ': Not powered (connect VCC to +5V and GND to ground)');
                    }
                }
            }

            // Summary
            if (results.activeLEDs.length > 0 && !results.shortCircuit) {
                results.messages.unshift('Circuit active! ' + results.activeLEDs.length + ' LED(s) lit');
            }

            VB.state.simulationResults = results;
            return results;
        }
    };

})();

