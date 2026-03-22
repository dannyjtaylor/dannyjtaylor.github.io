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
                if (c.type === 'seg7-cc' || c.type === 'seg7-ca') {
                    // 7-seg occupies rows 6–7, columns [col..col+4]
                    if (row >= CFG.SEG7_TOP_ROW && row <= CFG.SEG7_BOT_ROW &&
                        col >= c.col && col <= c.col + CFG.SEG7_WIDTH - 1) return i;
                } else if (c.type === 'clock') {
                    // Clock occupies rows 6–7, columns [col..col+2]
                    if (row >= CFG.CLOCK_TOP_ROW && row <= CFG.CLOCK_BOT_ROW &&
                        col >= c.col && col <= c.col + CFG.CLOCK_WIDTH - 1) return i;
                } else if (c.pin) { // single-pin (power / ground)
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
                if (comp.type === 'seg7-cc' || comp.type === 'seg7-ca') {
                    // 7-segment display
                    var segStatus = (sim.seg7Status && sim.seg7Status[i]) || null;
                    this._drawSeg7(comp, segStatus);
                } else if (comp.type === 'clock') {
                    // Clock/oscillator
                    this._drawClock(comp, sim);
                } else if (comp.pin) {
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
                            this._drawResistor(p1, p2, comp);
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
        _drawResistor: function (p1, p2, comp) {
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

            // Colour bands — use component-specific bands if available
            var bandNames = (comp && comp.bands) ? comp.bands : null;
            var bandColors;
            if (bandNames) {
                bandColors = [];
                for (var b = 0; b < bandNames.length; b++) {
                    bandColors.push(VB.getBandHex(bandNames[b]));
                }
            } else {
                bandColors = CFG.RESISTOR_BANDS;
            }
            var bw = 2, spacing = bLen / (bandColors.length + 1);
            for (var i = 0; i < bandColors.length; i++) {
                ctx.fillStyle = bandColors[i];
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

        /* -- 7-Segment Display -- */
        _drawSeg7: function (comp, segStatus) {
            var startCol = comp.col;
            var isCA = (comp.type === 'seg7-ca');

            // Pixel positions for the DIP body corners
            var topLeft  = this.gridToPixel(startCol, CFG.SEG7_TOP_ROW);
            var topRight = this.gridToPixel(startCol + CFG.SEG7_WIDTH - 1, CFG.SEG7_TOP_ROW);
            var botLeft  = this.gridToPixel(startCol, CFG.SEG7_BOT_ROW);
            var botRight = this.gridToPixel(startCol + CFG.SEG7_WIDTH - 1, CFG.SEG7_BOT_ROW);

            var bodyX = topLeft.x - 8;
            var bodyY = topLeft.y - 10;
            var bodyW = (topRight.x - topLeft.x) + 16;
            var bodyH = (botLeft.y - topLeft.y) + 20;

            // Draw pin legs extending from body into holes
            ctx.strokeStyle = '#AAA';
            ctx.lineWidth = 1.5;
            for (var p = 1; p <= 10; p++) {
                var pin = VB.SEG7_PINS[p];
                var pinPos = this.gridToPixel(startCol + pin.colOff, pin.row);
                var legEndY = (pin.row === CFG.SEG7_TOP_ROW) ? bodyY : bodyY + bodyH;
                ctx.beginPath();
                ctx.moveTo(pinPos.x, pinPos.y);
                ctx.lineTo(pinPos.x, legEndY);
                ctx.stroke();
            }

            // DIP body — dark package
            ctx.fillStyle = '#333';
            ctx.fillRect(bodyX, bodyY, bodyW, bodyH);
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1;
            ctx.strokeRect(bodyX, bodyY, bodyW, bodyH);

            // Notch/dot at pin 1 end (top-left corner)
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(bodyX + 6, bodyY + 6, 3, 0, Math.PI * 2);
            ctx.fill();

            // Type label ("CC" or "CA")
            ctx.fillStyle = '#888';
            ctx.font = '7px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(isCA ? 'CA' : 'CC', bodyX + bodyW / 2, bodyY + bodyH - 2);

            // Pin number labels
            ctx.fillStyle = '#666';
            ctx.font = '6px monospace';
            ctx.textAlign = 'center';
            for (var p = 1; p <= 10; p++) {
                var pin = VB.SEG7_PINS[p];
                var pinPos = this.gridToPixel(startCol + pin.colOff, pin.row);
                if (pin.row === CFG.SEG7_TOP_ROW) {
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(String(p), pinPos.x, bodyY - 1);
                } else {
                    ctx.textBaseline = 'top';
                    ctx.fillText(String(p), pinPos.x, bodyY + bodyH + 1);
                }
            }

            // 7-segment digit display area
            var dispCx = bodyX + bodyW / 2;
            var dispCy = bodyY + bodyH / 2 - 1;
            var sw = bodyW * 0.45;  // segment area width
            var sh = bodyH * 0.55;  // segment area height
            var segW = sw * 0.7;    // horizontal segment length
            var segH = sh * 0.4;    // vertical segment length
            var segT = 2.5;         // segment thickness

            // Display background
            ctx.fillStyle = '#1A1A1A';
            var dispX = dispCx - sw / 2 - 4;
            var dispY = dispCy - sh / 2 - 4;
            ctx.fillRect(dispX, dispY, sw + 8, sh + 8);

            // Helper: draw a segment rectangle at given position
            var self = this;
            function drawSeg(name, x, y, w, h) {
                var lit = segStatus && segStatus[name];
                if (lit) {
                    // Glow effect
                    ctx.shadowColor = '#FF3333';
                    ctx.shadowBlur = 6;
                    ctx.fillStyle = '#FF3333';
                } else {
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#444';
                }
                ctx.fillRect(x, y, w, h);
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }

            // Segment positions relative to display center
            var hLeft  = dispCx - segW / 2;
            var hRight = dispCx + segW / 2;
            var vTop   = dispCy - sh / 2;
            var vMid   = dispCy;
            var vBot   = dispCy + sh / 2;

            // a: top horizontal
            drawSeg('a', hLeft, vTop - segT / 2, segW, segT);
            // b: top-right vertical
            drawSeg('b', hRight - segT, vTop, segT, segH);
            // c: bottom-right vertical
            drawSeg('c', hRight - segT, vMid, segT, segH);
            // d: bottom horizontal
            drawSeg('d', hLeft, vBot - segT / 2, segW, segT);
            // e: bottom-left vertical
            drawSeg('e', hLeft, vMid, segT, segH);
            // f: top-left vertical
            drawSeg('f', hLeft, vTop, segT, segH);
            // g: middle horizontal
            drawSeg('g', hLeft, vMid - segT / 2, segW, segT);
            // dp: decimal point (small dot bottom-right)
            var dpLit = segStatus && segStatus.dp;
            ctx.fillStyle = dpLit ? '#FF3333' : '#444';
            if (dpLit) { ctx.shadowColor = '#FF3333'; ctx.shadowBlur = 6; }
            ctx.beginPath();
            ctx.arc(hRight + 5, vBot, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        },

        /* -- Clock/Oscillator -- */
        _drawClock: function (comp, sim) {
            var startCol = comp.col;
            var pins = VB.getClockPins(startCol);

            // Pixel positions for the DIP body corners
            var topLeft  = this.gridToPixel(startCol, CFG.CLOCK_TOP_ROW);
            var topRight = this.gridToPixel(startCol + CFG.CLOCK_WIDTH - 1, CFG.CLOCK_TOP_ROW);
            var botLeft  = this.gridToPixel(startCol, CFG.CLOCK_BOT_ROW);

            var bodyX = topLeft.x - 8;
            var bodyY = topLeft.y - 10;
            var bodyW = (topRight.x - topLeft.x) + 16;
            var bodyH = (botLeft.y - topLeft.y) + 20;

            // Draw pin legs extending from body into holes
            ctx.strokeStyle = '#AAA';
            ctx.lineWidth = 1.5;
            for (var p = 1; p <= 3; p++) {
                var pin = VB.CLOCK_PINS[p];
                var pinPos = this.gridToPixel(startCol + pin.colOff, pin.row);
                var legEndY = (pin.row === CFG.CLOCK_TOP_ROW) ? bodyY : bodyY + bodyH;
                ctx.beginPath();
                ctx.moveTo(pinPos.x, pinPos.y);
                ctx.lineTo(pinPos.x, legEndY);
                ctx.stroke();
            }

            // DIP body — dark package
            ctx.fillStyle = '#2A3A2A';
            ctx.fillRect(bodyX, bodyY, bodyW, bodyH);
            ctx.strokeStyle = '#1A2A1A';
            ctx.lineWidth = 1;
            ctx.strokeRect(bodyX, bodyY, bodyW, bodyH);

            // Notch/dot at pin 1 end (top-left corner)
            ctx.fillStyle = '#556655';
            ctx.beginPath();
            ctx.arc(bodyX + 5, bodyY + 5, 2, 0, Math.PI * 2);
            ctx.fill();

            // Label "CLK"
            ctx.fillStyle = '#99BB99';
            ctx.font = '7px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('CLK', bodyX + bodyW / 2, bodyY + bodyH / 2 - 4);

            // Frequency label
            ctx.fillStyle = '#778877';
            ctx.font = '6px monospace';
            ctx.fillText(VB.state.clockFrequency + 'Hz', bodyX + bodyW / 2, bodyY + bodyH / 2 + 4);

            // Pin labels
            ctx.fillStyle = '#668866';
            ctx.font = '5px monospace';
            ctx.textAlign = 'center';

            // VCC label (pin 1 - top left)
            var vccPos = this.gridToPixel(startCol + VB.CLOCK_PINS[1].colOff, VB.CLOCK_PINS[1].row);
            ctx.textBaseline = 'bottom';
            ctx.fillText('V', vccPos.x, bodyY - 1);

            // OUT label (pin 2 - top right)
            var outPos = this.gridToPixel(startCol + VB.CLOCK_PINS[2].colOff, VB.CLOCK_PINS[2].row);
            ctx.fillText('O', outPos.x, bodyY - 1);

            // GND label (pin 3 - bottom left)
            var gndPos = this.gridToPixel(startCol + VB.CLOCK_PINS[3].colOff, VB.CLOCK_PINS[3].row);
            ctx.textBaseline = 'top';
            ctx.fillText('G', gndPos.x, bodyY + bodyH + 1);

            // Output state indicator LED on the chip
            var isPowered = sim && sim.clockActive;
            var ledX = bodyX + bodyW - 8;
            var ledY = bodyY + bodyH / 2;
            if (isPowered && VB.state.clockOutputHigh) {
                // Glow
                var grad = ctx.createRadialGradient(ledX, ledY, 0, ledX, ledY, 8);
                grad.addColorStop(0, 'rgba(0,255,100,0.5)');
                grad.addColorStop(1, 'rgba(0,255,100,0)');
                ctx.fillStyle = grad;
                ctx.beginPath(); ctx.arc(ledX, ledY, 8, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#00FF66';
            } else if (isPowered) {
                ctx.fillStyle = '#336633';
            } else {
                ctx.fillStyle = '#333';
            }
            ctx.beginPath(); ctx.arc(ledX, ledY, 2.5, 0, Math.PI * 2); ctx.fill();

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

