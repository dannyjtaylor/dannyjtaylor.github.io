/* ============================================================
   VOLTBOX — Breadboard Model + Canvas Rendering
   ============================================================ */

(function () {
    var VB  = window.VB;
    var CFG = VB.CONFIG;
    var canvas, ctx;

    VB.Breadboard = {

        /* ---------- Initialisation ---------- */

        init: function (canvasEl) {
            canvas = canvasEl;
            ctx    = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
        },

        /* ---------- Data Model Helpers ---------- */

        /** Return the base electrical net id for a hole */
        getNetId: function (col, row) {
            if (row === 0 || row === 13) return 'POWER';
            if (row === 1 || row === 12) return 'GROUND';
            if (row >= 2 && row <= 6)    return 'T_TOP_' + col;
            if (row >= 7 && row <= 11)   return 'T_BOT_' + col;
            return null;
        },

        /** Map pixel (px,py) on canvas → grid {col, row} or null */
        pixelToGrid: function (px, py) {
            var col = Math.round((px - CFG.PADDING_LEFT) / CFG.CELL_SIZE);
            if (col < 0 || col >= CFG.COLS) return null;

            var best = -1, bestD = Infinity;
            for (var r = 0; r < CFG.TOTAL_ROWS; r++) {
                var d = Math.abs(py - CFG.ROW_Y[r]);
                if (d < bestD) { bestD = d; best = r; }
            }
            if (bestD > CFG.CELL_SIZE * 0.6) return null;
            return { col: col, row: best };
        },

        /** Map grid → pixel center {x, y} */
        gridToPixel: function (col, row) {
            return {
                x: CFG.PADDING_LEFT + col * CFG.CELL_SIZE,
                y: CFG.ROW_Y[row]
            };
        },

        /** Return array of all holes in the same base net */
        getNetHoles: function (col, row) {
            var net = this.getNetId(col, row);
            if (!net) return [];
            var holes = [];
            if (net === 'POWER') {
                for (var c = 0; c < CFG.COLS; c++) { holes.push({col:c,row:0}); holes.push({col:c,row:13}); }
            } else if (net === 'GROUND') {
                for (var c = 0; c < CFG.COLS; c++) { holes.push({col:c,row:1}); holes.push({col:c,row:12}); }
            } else if (net.indexOf('T_TOP_') === 0) {
                var cc = parseInt(net.split('_')[2], 10);
                for (var r = 2; r <= 6; r++) holes.push({col:cc, row:r});
            } else if (net.indexOf('T_BOT_') === 0) {
                var cc = parseInt(net.split('_')[2], 10);
                for (var r = 7; r <= 11; r++) holes.push({col:cc, row:r});
            }
            return holes;
        },

        /** Find component index whose pin(s) touch (col,row). Returns -1 if none. */
        getComponentAt: function (col, row) {
            for (var i = VB.state.components.length - 1; i >= 0; i--) {
                var c = VB.state.components[i];
                if (c.pin) { // single-pin (power / ground)
                    if (c.pin.col === col && c.pin.row === row) return i;
                } else {     // two-pin
                    if ((c.pin1.col === col && c.pin1.row === row) ||
                        (c.pin2.col === col && c.pin2.row === row)) return i;
                }
            }
            return -1;
        },

        /* =========================================================
           RENDERING
           ========================================================= */

        render: function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this._drawBoard();
            this._drawRails();
            this._drawHoles();
            this._drawLabels();
            this._drawNetHighlight();
            this._drawComponents();
            this._drawActivePin();
            this._drawPreview();
        },

        /* ---------- Board background ---------- */
        _drawBoard: function () {
            var x = CFG.PADDING_LEFT - 18;
            var y = 4;
            var w = CFG.COLS * CFG.CELL_SIZE + 16;
            var h = canvas.height - 8;

            // shadow
            ctx.fillStyle = '#A09070';
            ctx.fillRect(x + 3, y + 3, w, h);

            // body
            ctx.fillStyle = CFG.BOARD_COLOR;
            ctx.fillRect(x, y, w, h);

            // border bevel
            ctx.strokeStyle = '#D8C8A8';
            ctx.strokeRect(x, y, w, h);
            ctx.strokeStyle = '#B8A070';
            ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

            // DIP center gap
            var gapY = (CFG.ROW_Y[6] + CFG.ROW_Y[7]) / 2;
            ctx.fillStyle = '#D8C8A8';
            ctx.fillRect(x + 2, gapY - 10, w - 4, 20);
            ctx.strokeStyle = '#C0A880';
            ctx.beginPath();
            ctx.moveTo(x + 2, gapY - 10); ctx.lineTo(x + w - 2, gapY - 10);
            ctx.moveTo(x + 2, gapY + 10); ctx.lineTo(x + w - 2, gapY + 10);
            ctx.stroke();
        },

        /* ---------- Power/ground rail lines ---------- */
        _drawRails: function () {
            var sx = CFG.PADDING_LEFT - 8;
            var ex = CFG.PADDING_LEFT + (CFG.COLS - 1) * CFG.CELL_SIZE + 8;

            ctx.lineWidth = 2;

            // top + rail
            ctx.strokeStyle = CFG.POWER_COLOR;
            ctx.beginPath(); ctx.moveTo(sx, CFG.ROW_Y[0] - 7); ctx.lineTo(ex, CFG.ROW_Y[0] - 7); ctx.stroke();
            // top - rail
            ctx.strokeStyle = CFG.GND_COLOR;
            ctx.beginPath(); ctx.moveTo(sx, CFG.ROW_Y[1] + 7); ctx.lineTo(ex, CFG.ROW_Y[1] + 7); ctx.stroke();
            // bottom - rail
            ctx.beginPath(); ctx.moveTo(sx, CFG.ROW_Y[12] - 7); ctx.lineTo(ex, CFG.ROW_Y[12] - 7); ctx.stroke();
            // bottom + rail
            ctx.strokeStyle = CFG.POWER_COLOR;
            ctx.beginPath(); ctx.moveTo(sx, CFG.ROW_Y[13] + 7); ctx.lineTo(ex, CFG.ROW_Y[13] + 7); ctx.stroke();

            ctx.lineWidth = 1;
        },

        /* ---------- Grid holes ---------- */
        _drawHoles: function () {
            for (var r = 0; r < CFG.TOTAL_ROWS; r++) {
                for (var c = 0; c < CFG.COLS; c++) {
                    var px = CFG.PADDING_LEFT + c * CFG.CELL_SIZE;
                    var py = CFG.ROW_Y[r];
                    var rad = CFG.HOLE_RADIUS;

                    // shadow ring
                    ctx.fillStyle = '#1A1A1A';
                    ctx.beginPath(); ctx.arc(px, py, rad + 1, 0, Math.PI * 2); ctx.fill();

                    // hole
                    ctx.fillStyle = CFG.HOLE_COLOR;
                    ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fill();

                    // inner highlight
                    ctx.fillStyle = '#3C3C3C';
                    ctx.beginPath(); ctx.arc(px - 0.5, py - 0.5, rad - 1, 0, Math.PI * 2); ctx.fill();
                }
            }
        },

        /* ---------- Row/column labels ---------- */
        _drawLabels: function () {
            ctx.textBaseline = 'middle';

            // Row labels (left side)
            ctx.textAlign = 'right';
            ctx.font = '9px monospace';
            for (var r = 0; r < CFG.TOTAL_ROWS; r++) {
                if (r === 0 || r === 13) ctx.fillStyle = CFG.POWER_COLOR;
                else if (r === 1 || r === 12) ctx.fillStyle = CFG.GND_COLOR;
                else ctx.fillStyle = '#777';
                ctx.fillText(CFG.ROW_LABELS[r], CFG.PADDING_LEFT - 20, CFG.ROW_Y[r]);
            }

            // Column numbers along top
            ctx.fillStyle = '#999';
            ctx.font = '7px monospace';
            ctx.textAlign = 'center';
            for (var c = 0; c < CFG.COLS; c += 5) {
                ctx.fillText(String(c + 1), CFG.PADDING_LEFT + c * CFG.CELL_SIZE, CFG.ROW_Y[0] - 16);
            }
        },

        /* ---------- Highlight connected net on hover ---------- */
        _drawNetHighlight: function () {
            if (!VB.state.highlightEnabled || !VB.state.hoveredHole) return;
            var holes = this.getNetHoles(VB.state.hoveredHole.col, VB.state.hoveredHole.row);
            ctx.fillStyle = CFG.NET_HIGHLIGHT;
            for (var i = 0; i < holes.length; i++) {
                var p = this.gridToPixel(holes[i].col, holes[i].row);
                ctx.beginPath(); ctx.arc(p.x, p.y, CFG.HOLE_RADIUS + 4, 0, Math.PI * 2); ctx.fill();
            }
        },

        /* ---------- Draw all placed components ---------- */
        _drawComponents: function () {
            var sim = VB.state.simulationResults || {};
            var comps = VB.state.components;

            for (var i = 0; i < comps.length; i++) {
                var comp = comps[i];
                if (comp.pin) {
                    // single-pin (power / ground marker)
                    var pp = this.gridToPixel(comp.pin.col, comp.pin.row);
                    this._drawMarker(pp, comp.type);
                } else {
                    var p1 = this.gridToPixel(comp.pin1.col, comp.pin1.row);
                    var p2 = this.gridToPixel(comp.pin2.col, comp.pin2.row);
                    switch (comp.type) {
                        case 'wire':
                            this._drawWire(p1, p2, comp.color);
                            break;
                        case 'resistor':
                            this._drawResistor(p1, p2);
                            break;
                        case 'led':
                            var active = sim.activeLEDs && sim.activeLEDs.indexOf(i) !== -1;
                            this._drawLED(p1, p2, active);
                            break;
                    }
                }
            }

            // Short-circuit flash
            if (sim.shortCircuit) this._drawShortWarning();
        },

        /* -- Marker (power / ground) -- */
        _drawMarker: function (p, type) {
            var isPower = (type === 'power');
            ctx.save();

            // Outer ring
            ctx.strokeStyle = isPower ? '#FF0000' : '#0044CC';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.stroke();

            // Fill
            ctx.fillStyle = isPower ? 'rgba(255,0,0,0.25)' : 'rgba(0,68,204,0.25)';
            ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill();

            // Symbol
            ctx.fillStyle = isPower ? '#FF0000' : '#0044CC';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(isPower ? '+' : '−', p.x, p.y + 1);

            ctx.restore();
        },

        /* -- Wire -- */
        _drawWire: function (p1, p2, color) {
            color = color || '#DD0000';
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();

            // endpoints
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(p1.x, p1.y, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(p2.x, p2.y, 2.5, 0, Math.PI * 2); ctx.fill();

            ctx.lineWidth = 1;
            ctx.lineCap = 'butt';
        },

        /* -- Resistor -- */
        _drawResistor: function (p1, p2) {
            var dx = p2.x - p1.x, dy = p2.y - p1.y;
            var len = Math.sqrt(dx * dx + dy * dy);
            var ang = Math.atan2(dy, dx);

            // Lead wires
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 1.5;
            var bsx = p1.x + dx * 0.25, bsy = p1.y + dy * 0.25;
            var bex = p1.x + dx * 0.75, bey = p1.y + dy * 0.75;
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(bsx, bsy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(bex, bey); ctx.lineTo(p2.x, p2.y); ctx.stroke();

            // Body
            ctx.save();
            ctx.translate((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
            ctx.rotate(ang);
            var bLen = len * 0.5, bH = 8;
            ctx.fillStyle = CFG.RESISTOR_BODY;
            ctx.fillRect(-bLen / 2, -bH / 2, bLen, bH);
            ctx.strokeStyle = '#8B6914';
            ctx.lineWidth = 1;
            ctx.strokeRect(-bLen / 2, -bH / 2, bLen, bH);

            // Colour bands
            var bands = CFG.RESISTOR_BANDS;
            var bw = 2, spacing = bLen / (bands.length + 1);
            for (var i = 0; i < bands.length; i++) {
                ctx.fillStyle = bands[i];
                ctx.fillRect(-bLen / 2 + spacing * (i + 1) - bw / 2, -bH / 2 + 1, bw, bH - 2);
            }
            ctx.restore();
            ctx.lineWidth = 1;
        },

        /* -- LED -- */
        _drawLED: function (p1, p2, active) {
            var mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
            var dx = p2.x - p1.x, dy = p2.y - p1.y;
            var ang = Math.atan2(dy, dx);

            // Lead wires
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(mx - Math.cos(ang) * 7, my - Math.sin(ang) * 7); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(mx + Math.cos(ang) * 7, my + Math.sin(ang) * 7); ctx.lineTo(p2.x, p2.y); ctx.stroke();

            // Glow
            if (active) {
                var grad = ctx.createRadialGradient(mx, my, 0, mx, my, CFG.LED_GLOW_RADIUS);
                grad.addColorStop(0, 'rgba(255,80,80,0.55)');
                grad.addColorStop(0.4, 'rgba(255,40,40,0.2)');
                grad.addColorStop(1, 'rgba(255,0,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(mx, my, CFG.LED_GLOW_RADIUS, 0, Math.PI * 2); ctx.fill();
            }

            // Body
            ctx.save();
            ctx.translate(mx, my);
            ctx.rotate(ang);

            ctx.fillStyle = active ? '#FF4444' : '#CC0000';
            ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#880000';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();

            // Flat-side cathode marker
            ctx.strokeStyle = '#660000';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(5, -5); ctx.lineTo(5, 5); ctx.stroke();

            // Anode "+" hint
            ctx.fillStyle = active ? 'rgba(255,255,255,0.5)' : '#FF8888';
            ctx.font = '7px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', -2, 1);

            // Specular highlight when active
            if (active) {
                ctx.fillStyle = 'rgba(255,255,255,0.35)';
                ctx.beginPath(); ctx.arc(-2, -2, 3, 0, Math.PI * 2); ctx.fill();
            }

            ctx.restore();
            ctx.lineWidth = 1;
        },

        /* -- Short-circuit warning overlay -- */
        _drawShortWarning: function () {
            VB.state.animFrame++;
            if (VB.state.animFrame % 40 < 20) {
                ctx.fillStyle = 'rgba(255,0,0,0.12)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('\u26A0 SHORT CIRCUIT \u26A0', canvas.width / 2, canvas.height - 8);
        },

        /* ---------- Active first-pin indicator ---------- */
        _drawActivePin: function () {
            if (!VB.state.firstPin) return;
            var p = this.gridToPixel(VB.state.firstPin.col, VB.state.firstPin.row);

            // Pulsing ring
            var pulse = 3 + Math.sin(VB.state.animFrame * 0.15) * 1.5;
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(p.x, p.y, CFG.HOLE_RADIUS + pulse, 0, Math.PI * 2); ctx.stroke();
            ctx.lineWidth = 1;
        },

        /* ---------- Preview dashed line while placing ---------- */
        _drawPreview: function () {
            if (!VB.state.firstPin || !VB.state.hoveredHole) return;
            var fp = VB.state.firstPin, hh = VB.state.hoveredHole;
            if (fp.col === hh.col && fp.row === hh.row) return;

            var p1 = this.gridToPixel(fp.col, fp.row);
            var p2 = this.gridToPixel(hh.col, hh.row);

            ctx.strokeStyle = 'rgba(255,255,0,0.45)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]);
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
        },

        /* ---------- Animated current-flow dots ---------- */
        drawCurrentFlow: function () {
            if (!VB.state.flowEnabled) return;
            var sim = VB.state.simulationResults;
            if (!sim || !sim.activeLEDs || sim.activeLEDs.length === 0) return;

            var t = (VB.state.animFrame % 60) / 60;
            var comps = VB.state.components;

            for (var i = 0; i < comps.length; i++) {
                var comp = comps[i];
                if (comp.type === 'wire' || comp.type === 'resistor') {
                    if (!comp.pin1) continue;
                    var p1 = this.gridToPixel(comp.pin1.col, comp.pin1.row);
                    var p2 = this.gridToPixel(comp.pin2.col, comp.pin2.row);

                    for (var d = 0; d < 3; d++) {
                        var prog = (t + d * 0.33) % 1;
                        var dx = p1.x + (p2.x - p1.x) * prog;
                        var dy = p1.y + (p2.y - p1.y) * prog;
                        ctx.fillStyle = 'rgba(255,255,0,0.7)';
                        ctx.beginPath(); ctx.arc(dx, dy, 1.5, 0, Math.PI * 2); ctx.fill();
                    }
                }
            }
        }
    };
})();

