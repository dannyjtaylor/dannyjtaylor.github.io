/* ============================================================
   VOLTBOX — Configuration & Shared State
   ============================================================ */

window.VB = window.VB || {};

VB.CONFIG = {
    // Breadboard grid
    COLS: 30,
    TERMINAL_ROWS: 5,
    CELL_SIZE: 20,
    HOLE_RADIUS: 3,
    PADDING_LEFT: 45,
    TOTAL_ROWS: 14,

    // Row mapping:
    //  0  = Top power rail (+5V)
    //  1  = Top ground rail (GND)
    //  2–6  = Terminal top half (a–e)
    //  7–11 = Terminal bottom half (f–j)
    //  12 = Bottom ground rail (GND)
    //  13 = Bottom power rail (+5V)

    // Y pixel positions for each row
    ROW_Y: [
        18,   //  0: top +
        38,   //  1: top -
        68,   //  2: a
        88,   //  3: b
        108,  //  4: c
        128,  //  5: d
        148,  //  6: e
        188,  //  7: f
        208,  //  8: g
        228,  //  9: h
        248,  // 10: i
        268,  // 11: j
        298,  // 12: bottom -
        318   // 13: bottom +
    ],

    ROW_LABELS: ['+', '−', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', '−', '+'],

    // Colors — low-color Win95 palette
    BOARD_COLOR:    '#E8D5A3',
    BOARD_BORDER:   '#B8A583',
    HOLE_COLOR:     '#2A2A2A',
    HOLE_HOVER:     '#666666',
    POWER_COLOR:    '#DD0000',
    GND_COLOR:      '#0044CC',
    NET_HIGHLIGHT:  'rgba(255, 255, 0, 0.25)',

    WIRE_COLORS: [
        '#DD0000',  // red
        '#00AA00',  // green
        '#0066DD',  // blue
        '#DD8800',  // orange
        '#CC00CC',  // magenta
        '#00AAAA',  // cyan
        '#DDDD00',  // yellow
        '#888888',  // gray
    ],

    // Component rendering
    RESISTOR_BODY:  '#D4A76A',
    RESISTOR_BANDS: ['#AA4400', '#000000', '#DD0000', '#FFD700'],
    LED_BODY:       '#CC0000',
    LED_GLOW_RADIUS: 18,

    // 7-Segment display
    SEG7_WIDTH: 5,     // columns occupied
    SEG7_TOP_ROW: 6,   // row e (bottom of top terminal block)
    SEG7_BOT_ROW: 7,   // row f (top of bottom terminal block)

    // Clock/Oscillator component
    CLOCK_WIDTH: 3,      // columns occupied
    CLOCK_TOP_ROW: 6,    // row e (bottom of top terminal block)
    CLOCK_BOT_ROW: 7,    // row f (top of bottom terminal block)
    CLOCK_FREQUENCIES: [0.5, 1, 2, 5],  // Hz options
};

/* ---- Resistor Color Band Data ---- */

VB.RESISTOR_COLORS = {
    'black':  { digit: 0, mult: 1,         hex: '#000000' },
    'brown':  { digit: 1, mult: 10,        hex: '#8B4513' },
    'red':    { digit: 2, mult: 100,       hex: '#DD0000' },
    'orange': { digit: 3, mult: 1000,      hex: '#FF8C00' },
    'yellow': { digit: 4, mult: 10000,     hex: '#FFD700' },
    'green':  { digit: 5, mult: 100000,    hex: '#008800' },
    'blue':   { digit: 6, mult: 1000000,   hex: '#0000CC' },
    'violet': { digit: 7, mult: 10000000,  hex: '#8B008B' },
    'gray':   { digit: 8, mult: null,      hex: '#808080' },
    'white':  { digit: 9, mult: null,      hex: '#FFFFFF' },
};

VB.TOLERANCE_COLORS = {
    'gold':   { hex: '#CFB53B', tolerance: 5 },
    'silver': { hex: '#C0C0C0', tolerance: 10 },
};

// Ordered list for band selection cycling
VB.RESISTOR_DIGIT_NAMES = ['black','brown','red','orange','yellow','green','blue','violet','gray','white'];
VB.RESISTOR_MULT_NAMES  = ['black','brown','red','orange','yellow','green','blue'];
VB.RESISTOR_TOL_NAMES   = ['gold','silver'];

// Common resistor values for the dropdown
VB.COMMON_VALUES = [
    100, 150, 220, 330, 470, 680,
    1000, 1500, 2200, 3300, 4700, 6800,
    10000, 22000, 47000, 100000, 220000, 470000,
    1000000
];

/** Convert resistance in ohms to 4-band color names */
VB.valueToBands = function (ohms) {
    // Normalize to two significant digits + multiplier
    var val = ohms;
    var multIdx = 0;
    while (val >= 100 && multIdx < 6) { val /= 10; multIdx++; }
    var d1 = Math.floor(val / 10);
    var d2 = Math.round(val % 10);
    if (d1 < 1) d1 = 1; // first digit can't be 0
    if (d1 > 9) d1 = 9;
    if (d2 > 9) d2 = 9;
    return [
        VB.RESISTOR_DIGIT_NAMES[d1],
        VB.RESISTOR_DIGIT_NAMES[d2],
        VB.RESISTOR_MULT_NAMES[multIdx],
        'gold'
    ];
};

/** Convert 4-band color names to resistance in ohms */
VB.bandsToValue = function (bands) {
    var c1 = VB.RESISTOR_COLORS[bands[0]];
    var c2 = VB.RESISTOR_COLORS[bands[1]];
    var c3 = VB.RESISTOR_COLORS[bands[2]];
    if (!c1 || !c2 || !c3) return 0;
    return (c1.digit * 10 + c2.digit) * c3.mult;
};

/** Format ohms for display: 220, 1K, 4.7K, 1M, etc. */
VB.formatOhms = function (ohms) {
    if (ohms >= 1000000) return (ohms / 1000000) + 'M\u03A9';
    if (ohms >= 1000) {
        var k = ohms / 1000;
        return (k % 1 === 0 ? k : k.toFixed(1)) + 'K\u03A9';
    }
    return ohms + '\u03A9';
};

/** Get hex color for a band name (handles both digit and tolerance colors) */
VB.getBandHex = function (name) {
    if (VB.RESISTOR_COLORS[name]) return VB.RESISTOR_COLORS[name].hex;
    if (VB.TOLERANCE_COLORS[name]) return VB.TOLERANCE_COLORS[name].hex;
    return '#000000';
};

/* ---- 7-Segment Display Pin Mapping ---- */
// Standard 10-pin DIP package straddling the center gap
// Row 6 (e): pins 1–5 left to right
// Row 7 (f): pins 10–6 left to right (DIP U-turn)

VB.SEG7_PINS = {
    // { pinNumber: segment, row, colOffset_from_startCol }
    1:  { seg: 'e',   row: 6, colOff: 0 },
    2:  { seg: 'd',   row: 6, colOff: 1 },
    3:  { seg: 'com', row: 6, colOff: 2 },
    4:  { seg: 'c',   row: 6, colOff: 3 },
    5:  { seg: 'dp',  row: 6, colOff: 4 },
    6:  { seg: 'b',   row: 7, colOff: 4 },
    7:  { seg: 'g',   row: 7, colOff: 3 },
    8:  { seg: 'com', row: 7, colOff: 2 },
    9:  { seg: 'f',   row: 7, colOff: 1 },
    10: { seg: 'a',   row: 7, colOff: 0 },
};

VB.SEG7_SEGMENTS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'];

/** Get all pin positions for a 7-seg placed at startCol.
 *  Returns { segmentName: [{col, row}, ...], com: [{col, row}, ...] }
 */
VB.getSeg7Pins = function (startCol) {
    var result = { com: [] };
    for (var p = 1; p <= 10; p++) {
        var pin = VB.SEG7_PINS[p];
        var pos = { col: startCol + pin.colOff, row: pin.row };
        if (pin.seg === 'com') {
            result.com.push(pos);
        } else {
            if (!result[pin.seg]) result[pin.seg] = [];
            result[pin.seg].push(pos);
        }
    }
    return result;
};

/* ---- Clock/Oscillator Pin Mapping ---- */
// 3-pin DIP package straddling the center gap
// Row 6 (e): pin 1 (VCC), pin 2 (OUT)  — left to right
// Row 7 (f): pin 3 (GND)               — leftmost column

VB.CLOCK_PINS = {
    1: { func: 'vcc', row: 6, colOff: 0 },
    2: { func: 'out', row: 6, colOff: 2 },
    3: { func: 'gnd', row: 7, colOff: 0 },
};

/** Get all pin positions for a clock placed at startCol.
 *  Returns { vcc: {col, row}, gnd: {col, row}, out: {col, row} }
 */
VB.getClockPins = function (startCol) {
    var result = {};
    for (var p = 1; p <= 3; p++) {
        var pin = VB.CLOCK_PINS[p];
        result[pin.func] = { col: startCol + pin.colOff, row: pin.row };
    }
    return result;
};

// ---- Shared Application State ----
VB.state = {
    tool:             'wire',
    wireColor:         0,
    components:        [],       // placed components
    firstPin:          null,     // {col, row} — first click for 2-pin placement
    hoveredHole:       null,     // {col, row} — cursor position on grid
    simulationResults: null,     // output of last sim run
    crtEnabled:        true,
    flowEnabled:       false,
    highlightEnabled:  true,
    animFrame:         0,
    undoStack:         [],

    // Resistor configuration
    resistorValue:     220,
    resistorBands:     ['red', 'red', 'brown', 'gold'],

    // Clock/Oscillator state
    clockFrequency:    1,          // Hz (default 1Hz)
    clockOutputHigh:   false,      // current output state
    clockTimerId:      null,       // interval timer id
};
