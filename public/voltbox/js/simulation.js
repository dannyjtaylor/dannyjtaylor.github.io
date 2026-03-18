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

    /** Add a component's pin connections into a UF (skip index `skipIdx`) */
    function addComponent(uf, comp) {
        if (comp.pin) {
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

            /* --- Step 1: short-circuit check (wires + markers only, no resistors/LEDs) --- */
            var wireUF = new UF();
            seedNets(wireUF);
            for (var i = 0; i < comps.length; i++) {
                var c = comps[i];
                if (c.type === 'wire' || c.type === 'power' || c.type === 'ground') {
                    addComponent(wireUF, c);
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

            // Summary
            if (results.activeLEDs.length > 0 && !results.shortCircuit) {
                results.messages.unshift('Circuit active! ' + results.activeLEDs.length + ' LED(s) lit');
            }

            VB.state.simulationResults = results;
            return results;
        }
    };

})();

