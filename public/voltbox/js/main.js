/* ============================================================
   VOLTBOX — Main Entry Point
   Initialisation, canvas events, game loop
   ============================================================ */

(function () {
    var VB  = window.VB;
    var CFG = VB.CONFIG;
    var canvas;

    /* ==================== Initialise ==================== */

    function init() {
        canvas = document.getElementById('breadboard-canvas');
        VB.Breadboard.init(canvas);
        VB.UI.init();

        setupCanvasEvents();

        // Start render loop
        requestAnimationFrame(loop);

        VB.UI.setStatus('READY \u2014 Select a component and click the breadboard');

        // Show tutorial on first visit
        if (!localStorage.getItem('voltbox_visited')) {
            setTimeout(function () { VB.UI.showDialog('howto-dialog'); }, 400);
            localStorage.setItem('voltbox_visited', '1');
        }
    }

    /* ==================== Canvas Event Handlers ==================== */

    function setupCanvasEvents() {

        /* -- Mouse move: track hovered hole -- */
        canvas.addEventListener('mousemove', function (e) {
            var rect = canvas.getBoundingClientRect();
            var sx = canvas.width  / rect.width;
            var sy = canvas.height / rect.height;
            var px = (e.clientX - rect.left) * sx;
            var py = (e.clientY - rect.top)  * sy;

            var hole = VB.Breadboard.pixelToGrid(px, py);
            VB.state.hoveredHole = hole;

            if (hole) {
                document.getElementById('status-pos').textContent =
                    CFG.ROW_LABELS[hole.row] + (hole.col + 1);
            } else {
                document.getElementById('status-pos').textContent = '';
            }
        });

        canvas.addEventListener('mouseleave', function () {
            VB.state.hoveredHole = null;
            document.getElementById('status-pos').textContent = '';
        });

        /* -- Left click: place component -- */
        canvas.addEventListener('click', function (e) {
            var hole = holeFromEvent(e);
            if (!hole) return;
            handleLeftClick(hole);
        });

        /* -- Right click: delete -- */
        canvas.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            var hole = holeFromEvent(e);
            if (!hole) return;
            handleRightClick(hole);
        });
    }

    /** Extract grid hole from a mouse event on canvas */
    function holeFromEvent(e) {
        var rect = canvas.getBoundingClientRect();
        var sx = canvas.width  / rect.width;
        var sy = canvas.height / rect.height;
        var px = (e.clientX - rect.left) * sx;
        var py = (e.clientY - rect.top)  * sy;
        return VB.Breadboard.pixelToGrid(px, py);
    }

    /* ==================== Click Logic ==================== */

    function handleLeftClick(hole) {
        var tool = VB.state.tool;

        /* --- Eraser --- */
        if (tool === 'eraser') {
            handleRightClick(hole);
            return;
        }

        /* --- Select / Inspect --- */
        if (tool === 'select') {
            var ci = VB.Breadboard.getComponentAt(hole.col, hole.row);
            if (ci >= 0) {
                var comp = VB.state.components[ci];
                var info = comp.type.toUpperCase();
                if (comp.type === 'clock') {
                    info += ' at col ' + (comp.col + 1) + ' (' + VB.state.clockFrequency + 'Hz, OUT=' + (VB.state.clockOutputHigh ? 'HIGH' : 'LOW') + ')';
                } else if (comp.pin) {
                    info += ' at ' + CFG.ROW_LABELS[comp.pin.row]  + (comp.pin.col  + 1);
                } else if (comp.pin1) {
                    info += ' ' + CFG.ROW_LABELS[comp.pin1.row] + (comp.pin1.col + 1) +
                            ' \u2192 ' + CFG.ROW_LABELS[comp.pin2.row] + (comp.pin2.col + 1);
                }
                VB.UI.setStatus(info);
            } else {
                var net = VB.Breadboard.getNetId(hole.col, hole.row);
                VB.UI.setStatus('Hole: ' + CFG.ROW_LABELS[hole.row] + (hole.col + 1) + '  Net: ' + net);
            }
            VB.Sound.click();
            return;
        }

        /* --- 7-Segment display placement --- */
        if (tool === 'seg7-cc' || tool === 'seg7-ca') {
            var startCol = hole.col;
            // Check bounds: need 5 columns
            if (startCol + 4 >= CFG.COLS) {
                VB.UI.setStatus('Not enough space \u2014 need 5 columns from here');
                VB.Sound.error();
                return;
            }
            // Check that rows 6 and 7 for these columns aren't occupied
            var blocked = false;
            for (var sc = startCol; sc <= startCol + 4; sc++) {
                if (VB.Breadboard.getComponentAt(sc, CFG.SEG7_TOP_ROW) >= 0 ||
                    VB.Breadboard.getComponentAt(sc, CFG.SEG7_BOT_ROW) >= 0) {
                    blocked = true;
                    break;
                }
            }
            if (blocked) {
                VB.UI.setStatus('Holes occupied \u2014 cannot place 7-segment here');
                VB.Sound.error();
                return;
            }
            VB.state.components.push({ type: tool, col: startCol });
            VB.Sound.place();
            VB.UI.setStatus(tool.toUpperCase() + ' placed at column ' + (startCol + 1));
            VB.UI.runSimulation();
            return;
        }

        /* --- Clock/Oscillator placement --- */
        if (tool === 'clock') {
            var clkStartCol = hole.col;
            // Check bounds: need 3 columns
            if (clkStartCol + 2 >= CFG.COLS) {
                VB.UI.setStatus('Not enough space \u2014 need 3 columns from here');
                VB.Sound.error();
                return;
            }
            // Check that rows 6 and 7 for these columns aren't occupied
            var clkBlocked = false;
            for (var clkc = clkStartCol; clkc <= clkStartCol + 2; clkc++) {
                if (VB.Breadboard.getComponentAt(clkc, CFG.CLOCK_TOP_ROW) >= 0 ||
                    VB.Breadboard.getComponentAt(clkc, CFG.CLOCK_BOT_ROW) >= 0) {
                    clkBlocked = true;
                    break;
                }
            }
            if (clkBlocked) {
                VB.UI.setStatus('Holes occupied \u2014 cannot place clock here');
                VB.Sound.error();
                return;
            }
            VB.state.components.push({ type: 'clock', col: clkStartCol });
            VB.Sound.place();
            VB.UI.setStatus('Clock placed at column ' + (clkStartCol + 1) + ' \u2014 Pins: VCC(top-left), OUT(top-right), GND(bot-left)');
            VB.UI.restartClockTimer();
            VB.UI.runSimulation();
            return;
        }

        /* --- Single-pin components (power, ground) --- */
        if (tool === 'power' || tool === 'ground') {
            VB.state.components.push({
                type: tool,
                pin: { col: hole.col, row: hole.row }
            });
            VB.Sound.place();
            VB.UI.setStatus(tool.charAt(0).toUpperCase() + tool.slice(1) +
                ' placed at ' + CFG.ROW_LABELS[hole.row] + (hole.col + 1));
            VB.UI.runSimulation();
            return;
        }

        /* --- Two-pin components (wire, resistor, LED) --- */
        if (!VB.state.firstPin) {
            // First click
            VB.state.firstPin = { col: hole.col, row: hole.row };
            VB.Sound.click();
            VB.UI.setStatus('Click second pin for ' + tool + '...');
        } else {
            // Second click
            var p1 = VB.state.firstPin;
            var p2 = { col: hole.col, row: hole.row };

            if (p1.col === p2.col && p1.row === p2.row) {
                VB.state.firstPin = null;
                VB.UI.setStatus('Cancelled \u2014 same hole');
                return;
            }

            var comp = { type: tool, pin1: p1, pin2: p2 };
            if (tool === 'wire') {
                comp.color = CFG.WIRE_COLORS[VB.state.wireColor];
            }
            if (tool === 'resistor') {
                comp.bands = VB.state.resistorBands.slice();
                comp.value = VB.state.resistorValue;
            }

            VB.state.components.push(comp);
            VB.state.firstPin = null;
            VB.Sound.place();
            VB.UI.setStatus(
                tool.charAt(0).toUpperCase() + tool.slice(1) + ' placed: ' +
                CFG.ROW_LABELS[p1.row] + (p1.col + 1) + ' \u2192 ' +
                CFG.ROW_LABELS[p2.row] + (p2.col + 1)
            );

            // Auto-simulate after placing
            VB.UI.runSimulation();
        }
    }

    function handleRightClick(hole) {
        var idx = VB.Breadboard.getComponentAt(hole.col, hole.row);
        if (idx >= 0) {
            var removedType = VB.state.components[idx].type;
            VB.state.components.splice(idx, 1);
            VB.Sound.del();
            VB.UI.setStatus('Component removed');
            VB.state.simulationResults = null;
            // Restart clock timer if a clock was removed (or if any clock remains)
            if (removedType === 'clock') VB.UI.restartClockTimer();
            if (VB.state.components.length > 0) VB.UI.runSimulation();
            else VB.UI.setStatus('READY');
        } else {
            // Cancel current placement
            VB.state.firstPin = null;
            VB.UI.setStatus('READY');
        }
    }

    /* ==================== Render Loop ==================== */

    function loop() {
        VB.state.animFrame++;
        VB.Breadboard.render();
        VB.Breadboard.drawCurrentFlow();
        requestAnimationFrame(loop);
    }

    /* ==================== Boot ==================== */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

