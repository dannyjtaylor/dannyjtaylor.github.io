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
};

