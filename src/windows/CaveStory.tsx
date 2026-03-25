import { useEffect, useRef, useCallback } from 'react';
import styles from './windows.module.css';

/* ══════════════════════════════════════════════════════════
   Cave Story – A Tribute Recreation
   4 areas, 4 weapons, NPCs, dialog, boss fight, title screen
   ══════════════════════════════════════════════════════════ */

const CW = 640;
const CH = 480;
const TILE = 16;
const GRAV = 0.4;
const JUMP_V = -7;
const MOVE_SPD = 2.5;
const MAX_HP = 16;

/* ── Types ── */
type Phase = 'title' | 'playing' | 'dialog' | 'transition' | 'gameover' | 'win';
type AreaId = 'first_cave' | 'village' | 'egg_corridor' | 'sand_zone';
type WpnId = 'polar_star' | 'fireball' | 'missile' | 'blade';
type EType = 'critter' | 'bat' | 'beetle' | 'press';
type CharId = 'quote' | 'curly';

interface Vec2 { x: number; y: number }

interface Player {
  x: number; y: number; vx: number; vy: number;
  w: number; h: number; hp: number; facing: number;
  grounded: boolean; invincible: number; shootCooldown: number;
  walkFrame: number; walkTimer: number; charId: CharId;
  weapons: Weapon[]; activeWeapon: number;
  weaponXp: number[]; weaponLevels: number[];
}

interface Weapon { id: WpnId; ammo: number; maxAmmo: number }

interface Bullet {
  x: number; y: number; vx: number; vy: number;
  life: number; damage: number; weaponId: WpnId;
  bounces: number;
}

interface Enemy {
  x: number; y: number; vx: number; vy: number;
  w: number; h: number; hp: number; maxHp: number;
  type: EType; grounded: boolean; timer: number;
  sinOffset: number; baseY: number; active: boolean;
}

interface Boss {
  x: number; y: number; vx: number; vy: number;
  w: number; h: number; hp: number; maxHp: number;
  phase: number; timer: number; attackIndex: number;
  active: boolean; dialogShown: boolean; defeated: boolean;
}

interface NpcDef {
  x: number; y: number; w: number; h: number;
  name: string; dialog: string[]; spriteKey: string;
  givesWeapon: WpnId | null; requiresFlag: string | null;
}

interface DoorDef {
  x: number; y: number; w: number; h: number;
  targetArea: AreaId; targetX: number; targetY: number;
  requiresFlag: string | null;
}

interface Pickup {
  x: number; y: number; type: 'xp' | 'hp' | 'missile';
  life: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; color: string; size: number;
}

interface BossBullet {
  x: number; y: number; vx: number; vy: number;
  life: number; damage: number;
}

interface DialogState {
  lines: string[]; lineIndex: number; charIndex: number;
  speaker: string; timer: number; done: boolean;
  onClose: (() => void) | null;
}

interface TransitionState {
  active: boolean; fadeOut: boolean; timer: number;
  targetArea: AreaId; targetX: number; targetY: number;
}

interface StarParticle { x: number; y: number; speed: number; bright: number }

interface GameState {
  phase: Phase;
  charSelect: number;
  player: Player;
  enemies: Enemy[];
  boss: Boss | null;
  npcs: NpcDef[];
  doors: DoorDef[];
  bullets: Bullet[];
  bossBullets: BossBullet[];
  pickups: Pickup[];
  particles: Particle[];
  dialog: DialogState;
  transition: TransitionState;
  camera: Vec2;
  area: AreaId;
  areaMap: number[][];
  areaW: number;
  areaH: number;
  flags: Set<string>;
  frameCount: number;
  score: number;
  stars: StarParticle[];
  titleBlink: number;
}

/* ── Sprite helper ── */
function drawSprite(ctx: CanvasRenderingContext2D, data: string[], colors: Record<string, string>, x: number, y: number, mirror: boolean) {
  for (let r = 0; r < data.length; r++) {
    const line = data[r]!;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c]!;
      const clr = colors[ch];
      if (ch === '.' || !clr) continue;
      ctx.fillStyle = clr;
      ctx.fillRect(mirror ? x + (line.length - 1 - c) : x + c, y + r, 1, 1);
    }
  }
}

/* ── Pixel text ── */
const FONT_DATA: Record<string, string[]> = {
  A: ['0110','1001','1111','1001','1001'],
  B: ['1110','1001','1110','1001','1110'],
  C: ['0111','1000','1000','1000','0111'],
  D: ['1110','1001','1001','1001','1110'],
  E: ['1111','1000','1110','1000','1111'],
  F: ['1111','1000','1110','1000','1000'],
  G: ['0111','1000','1011','1001','0110'],
  H: ['1001','1001','1111','1001','1001'],
  I: ['111','010','010','010','111'],
  J: ['0011','0001','0001','1001','0110'],
  K: ['1001','1010','1100','1010','1001'],
  L: ['1000','1000','1000','1000','1111'],
  M: ['10001','11011','10101','10001','10001'],
  N: ['1001','1101','1011','1001','1001'],
  O: ['0110','1001','1001','1001','0110'],
  P: ['1110','1001','1110','1000','1000'],
  Q: ['0110','1001','1001','1010','0101'],
  R: ['1110','1001','1110','1010','1001'],
  S: ['0111','1000','0110','0001','1110'],
  T: ['11111','00100','00100','00100','00100'],
  U: ['1001','1001','1001','1001','0110'],
  V: ['10001','10001','01010','01010','00100'],
  W: ['10001','10001','10101','11011','10001'],
  X: ['1001','1001','0110','1001','1001'],
  Y: ['10001','01010','00100','00100','00100'],
  Z: ['1111','0010','0100','1000','1111'],
  '0': ['0110','1001','1001','1001','0110'],
  '1': ['010','110','010','010','111'],
  '2': ['1110','0001','0110','1000','1111'],
  '3': ['1110','0001','0110','0001','1110'],
  '4': ['1001','1001','1111','0001','0001'],
  '5': ['1111','1000','1110','0001','1110'],
  '6': ['0110','1000','1110','1001','0110'],
  '7': ['1111','0001','0010','0100','0100'],
  '8': ['0110','1001','0110','1001','0110'],
  '9': ['0110','1001','0111','0001','0110'],
  ':': ['0','1','0','1','0'],
  '-': ['000','000','111','000','000'],
  '!': ['1','1','1','0','1'],
  '?': ['0110','1001','0010','0000','0010'],
  '.': ['0','0','0','0','1'],
  ',': ['0','0','0','1','1'],
  "'": ['1','1','0','0','0'],
  ' ': ['00','00','00','00','00'],
};

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number, color: string) {
  ctx.fillStyle = color;
  let cx = x;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!.toUpperCase();
    const glyph = FONT_DATA[ch];
    if (glyph) {
      for (let row = 0; row < glyph.length; row++) {
        const rowStr = glyph[row]!;
        for (let col = 0; col < rowStr.length; col++) {
          if (rowStr[col] === '1') {
            ctx.fillRect(cx + col * scale, y + row * scale, scale, scale);
          }
        }
      }
      cx += ((glyph[0]?.length ?? 3) + 1) * scale;
    } else {
      cx += 3 * scale;
    }
  }
}

/* ── Character sprites (14x16) ── */
const QUOTE_FRAMES: string[][] = [
  [ // Stand
    '....RRRR......',
    '...RRRRRR.....',
    '..RRRRRRRR....',
    '..WWWWWWWW....',
    '..WDDWWDDW....',
    '..WDDWWDDW....',
    '..WWWWWWWW....',
    '..WWWMMWWW....',
    '...WWWWWW.....',
    '...SSSSSS.....',
    '..SSWWWWSS....',
    '..SSWWWWSS....',
    '...WWWWWW.....',
    '...WWWWWW.....',
    '...GG..GG.....',
    '...GG..GG.....',
  ],
  [ // Walk 1
    '....RRRR......',
    '...RRRRRR.....',
    '..RRRRRRRR....',
    '..WWWWWWWW....',
    '..WDDWWDDW....',
    '..WDDWWDDW....',
    '..WWWWWWWW....',
    '..WWWMMWWW....',
    '...WWWWWW.....',
    '...SSSSSS.....',
    '..SSWWWWSS....',
    '..SSWWWWSS....',
    '...WWWWWW.....',
    '....GG.GG.....',
    '...GG...GG....',
    '...GG.........',
  ],
  [ // Walk 2
    '....RRRR......',
    '...RRRRRR.....',
    '..RRRRRRRR....',
    '..WWWWWWWW....',
    '..WDDWWDDW....',
    '..WDDWWDDW....',
    '..WWWWWWWW....',
    '..WWWMMWWW....',
    '...WWWWWW.....',
    '...SSSSSS.....',
    '..SSWWWWSS....',
    '..SSWWWWSS....',
    '...WWWWWW.....',
    '...GG.GG......',
    '....GG..GG....',
    '.........GG...',
  ],
  [ // Walk 3
    '....RRRR......',
    '...RRRRRR.....',
    '..RRRRRRRR....',
    '..WWWWWWWW....',
    '..WDDWWDDW....',
    '..WDDWWDDW....',
    '..WWWWWWWW....',
    '..WWWMMWWW....',
    '...WWWWWW.....',
    '...SSSSSS.....',
    '..SSWWWWSS....',
    '..SSWWWWSS....',
    '...WWWWWW.....',
    '...GGGG.......',
    '...GG..GG.....',
    '......GG......',
  ],
];

const CURLY_FRAMES: string[][] = [
  [
    '...YYYYYY.....',
    '..YYYYYYYY....',
    '..YYYYYYYY....',
    '..WWWWWWWW....',
    '..WDDWWDDW....',
    '..WDDWWDDW....',
    '..WWWWWWWW....',
    '..WWWMMWWW....',
    '...WWWWWW.....',
    '...SSSSSS.....',
    '..SSWWWWSS....',
    '..SSWWWWSS....',
    '...WWWWWW.....',
    '...WWWWWW.....',
    '...GG..GG.....',
    '...GG..GG.....',
  ],
  [
    '...YYYYYY.....',
    '..YYYYYYYY....',
    '..YYYYYYYY....',
    '..WWWWWWWW....',
    '..WDDWWDDW....',
    '..WDDWWDDW....',
    '..WWWWWWWW....',
    '..WWWMMWWW....',
    '...WWWWWW.....',
    '...SSSSSS.....',
    '..SSWWWWSS....',
    '..SSWWWWSS....',
    '...WWWWWW.....',
    '....GG.GG.....',
    '...GG...GG....',
    '...GG.........',
  ],
  [
    '...YYYYYY.....',
    '..YYYYYYYY....',
    '..YYYYYYYY....',
    '..WWWWWWWW....',
    '..WDDWWDDW....',
    '..WDDWWDDW....',
    '..WWWWWWWW....',
    '..WWWMMWWW....',
    '...WWWWWW.....',
    '...SSSSSS.....',
    '..SSWWWWSS....',
    '..SSWWWWSS....',
    '...WWWWWW.....',
    '...GG.GG......',
    '....GG..GG....',
    '.........GG...',
  ],
  [
    '...YYYYYY.....',
    '..YYYYYYYY....',
    '..YYYYYYYY....',
    '..WWWWWWWW....',
    '..WDDWWDDW....',
    '..WDDWWDDW....',
    '..WWWWWWWW....',
    '..WWWMMWWW....',
    '...WWWWWW.....',
    '...SSSSSS.....',
    '..SSWWWWSS....',
    '..SSWWWWSS....',
    '...WWWWWW.....',
    '...GGGG.......',
    '...GG..GG.....',
    '......GG......',
  ],
];

const QUOTE_COLORS: Record<string, string> = { R: '#cc2222', W: '#eeeeff', D: '#222244', M: '#cc8866', S: '#4466aa', G: '#666688' };
const CURLY_COLORS: Record<string, string> = { Y: '#ddcc44', W: '#eeeeff', D: '#222244', M: '#cc8866', S: '#4466aa', G: '#666688' };

/* ── Enemy sprites ── */
const CRITTER_SPRITE: string[] = [
  '..OOOOOO..',
  '.OOOOOOOO.',
  'OOWWWWWWOO',
  'OWDDWWDDWO',
  'OWDDWWDDWO',
  'OOWWWWWWOO',
  'OOOMMMOOO.',
  '.OOOOOOOO.',
  '..OOOOOO..',
  '.OO....OO.',
  'OO......OO',
  'OO......OO',
];
const CRITTER_COLORS: Record<string, string> = { O: '#ee8833', W: '#ffffff', D: '#222222', M: '#cc6622' };

const BAT_FRAMES: string[][] = [
  [
    'P..........P',
    'PP........PP',
    'PPP..PP..PPP',
    '.PPPPPPPPPP.',
    '..PPWPPWPP..',
    '..PPWPPWPP..',
    '...PPPPPP...',
    '...PMMMPP...',
    '....PPPP....',
    '....PPPP....',
  ],
  [
    '............',
    'P..........P',
    'PP...PP...PP',
    'PPP.PPPP.PPP',
    '.PPPPPPPPPP.',
    '..PPWPPWPP..',
    '..PPWPPWPP..',
    '...PPPPPP...',
    '...PMMMPP...',
    '....PPPP....',
  ],
];
const BAT_COLORS: Record<string, string> = { P: '#8844aa', W: '#ffff00', M: '#aa2266' };

const BEETLE_SPRITE: string[] = [
  '..GGGGGGGG..',
  '.GGGGGGGGGG.',
  'GGWWGGGGWWGG',
  'GGWWGGGGWWGG',
  'GGGGGGGGGGGG',
  'GGGGLLLGGGGG',
  '.GGGGGGGGGG.',
  '.GGGGGGGGG..',
  '..GG....GG..',
  '..GG....GG..',
];
const BEETLE_COLORS: Record<string, string> = { G: '#33aa44', W: '#ffffff', L: '#226633' };

const PRESS_SPRITE: string[] = [
  'PPPPPPPPPPPPPPPP',
  'PPPPPPPPPPPPPPPP',
  'PP..........PP..',
  'PPPPPPPPPPPPPPPP',
  'PPPPPPPPPPPPPPPP',
  '.PPPPPPPPPPPPPP.',
  '..PPPPPPPPPPPP..',
  '...PPPPPPPPPP...',
  '....PPPPPPPP....',
  '.....PPPPPP.....',
  '......PPPP......',
  '.......PP.......',
  '......PPPP......',
  '.....PPPPPP.....',
  '....PPPPPPPP....',
  '...PPPPPPPPPP...',
];
const PRESS_COLORS: Record<string, string> = { P: '#888899' };

/* ── Balrog sprite (24x24) ── */
const BALROG_SPRITE: string[] = [
  '......BBBBBBBB........',
  '....BBBBBBBBBBBB......',
  '...BBBBBBBBBBBBBB.....',
  '..BBBBBBBBBBBBBBBB....',
  '..BBBWWWBBBBWWWBBB....',
  '..BBBWRRBBBBWRRBBB....',
  '..BBBWRRBBBBWRRBBB....',
  '..BBBBBBBBBBBBBBBB....',
  '..BBBBBBMMMMBBBBBB....',
  '..BBBMMMMMMMMMMBBBB...',
  '...BBBBBBBBBBBBBBB....',
  '....BBBBBBBBBBBBBB....',
  '...SSSSSSSSSSSSSS.....',
  '..SSBBBBBBBBBBBSS.....',
  '..SSBBBBBBBBBBBSS.....',
  '..SSBBBBBBBBBBBSS.....',
  '...BBBBBBBBBBBBB......',
  '...BBBBBBBBBBBBB......',
  '...BBBB.....BBBB......',
  '...BBBB.....BBBB......',
  '..GGGG.......GGGG.....',
  '..GGGG.......GGGG.....',
  '..GGGG.......GGGG.....',
  '..GGGG.......GGGG.....',
];
const BALROG_COLORS: Record<string, string> = { B: '#886633', W: '#ffffff', R: '#cc2222', M: '#442211', S: '#556688', G: '#555544' };

/* ── NPC sprites (10x14) ── */
const KING_SPRITE: string[] = [
  '..CCCCCC..',
  '.CCYCYCCC.',
  '.CYYYYCC..',
  '..WWWWWW..',
  '.WDDWWDDW.',
  '.WDDWWDDW.',
  '..WWWWWW..',
  '..WWMMWW..',
  '...PPPP...',
  '..PPPPPP..',
  '..PPPPPP..',
  '..PPPPPP..',
  '..GG..GG..',
  '..GG..GG..',
];
const KING_COLORS: Record<string, string> = { C: '#ccaa22', Y: '#ffdd44', W: '#eeeeff', D: '#222244', M: '#cc8866', P: '#aa2222', G: '#666688' };

const TOROKO_SPRITE: string[] = [
  '....RR....',
  '..WWWWWW..',
  '.WWWWWWWW.',
  '.WDDWWDDW.',
  '.WDDWWDDW.',
  '.WWWWWWWW.',
  '..WWMMWW..',
  '...PPPP...',
  '..PPPPPP..',
  '..PPPPPP..',
  '..PPPPPP..',
  '...PPPP...',
  '..GG..GG..',
  '..GG..GG..',
];
const TOROKO_COLORS: Record<string, string> = { R: '#ff4466', W: '#eeeeff', D: '#222244', M: '#cc8866', P: '#ffccaa', G: '#666688' };

const JACK_SPRITE: string[] = [
  '..GGGGGG..',
  '.GGGGGGGG.',
  '.GWWWWWWG.',
  '.WDDWWDDW.',
  '.WDDWWDDW.',
  '.WWWWWWWW.',
  '..WWMMWW..',
  '...SSSS...',
  '..SSSSSS..',
  '..SSSSSS..',
  '..SSLLSS..',
  '...SSSS...',
  '..GG..GG..',
  '..GG..GG..',
];
const JACK_COLORS: Record<string, string> = { G: '#556677', W: '#eeeeff', D: '#222244', M: '#cc8866', S: '#4466aa', L: '#334488', };

const SUE_SPRITE: string[] = [
  '...BBBB...',
  '..BBBBBB..',
  '.BBWWWWBB.',
  '.WDDWWDDW.',
  '.WDDWWDDW.',
  '.WWWWWWWW.',
  '..WWMMWW..',
  '...PPPP...',
  '..PPPPPP..',
  '..PPPPPP..',
  '..PPPPPP..',
  '...PPPP...',
  '..GG..GG..',
  '..GG..GG..',
];
const SUE_COLORS: Record<string, string> = { B: '#9944cc', W: '#eeeeff', D: '#222244', M: '#cc8866', P: '#cc66aa', G: '#666688' };

/* ── Door sprite (16x16) ── */
const DOOR_SPRITE: string[] = [
  '..DDDDDDDDDD..',
  '.DDDDDDDDDDDD.',
  '.DD........DD.',
  '.DD........DD.',
  '.DD........DD.',
  '.DD........DD.',
  '.DD........DD.',
  '.DD...DD...DD.',
  '.DD...DD...DD.',
  '.DD........DD.',
  '.DD........DD.',
  '.DD........DD.',
  '.DD........DD.',
  '.DDDDDDDDDDDD.',
  '.DDDDDDDDDDDD.',
  'DDDDDDDDDDDDDD',
];
const DOOR_COLORS: Record<string, string> = { D: '#886644' };

/* ── Chest sprite (16x12) ── */
const CHEST_SPRITE: string[] = [
  '..CCCCCCCCCC..',
  '.CCCCCCCCCCCC.',
  '.CCYYCCCCYYCC.',
  '.CCCCCCCCCCCC.',
  '.CCCCCCCCCCCC.',
  '.CCCCYYYYCCCC.',
  '.CCCCCCCCCCCC.',
  '.CCCCCCCCCCCC.',
  '.CCCCCCCCCCCC.',
  '.CCCCCCCCCCCC.',
  '.CCCCCCCCCCCC.',
  '..CCCCCCCCCC..',
];
const CHEST_COLORS: Record<string, string> = { C: '#aa7722', Y: '#ffdd44' };

/* ── Area tile colors ── */
const AREA_TILE_COLORS: Record<AreaId, { floor: string; wall: string; bg: string; ceil: string }> = {
  first_cave: { floor: '#775533', wall: '#664422', bg: '#111111', ceil: '#553311' },
  village: { floor: '#999988', wall: '#888877', bg: '#222233', ceil: '#777766' },
  egg_corridor: { floor: '#556688', wall: '#445577', bg: '#0a0a1a', ceil: '#334466' },
  sand_zone: { floor: '#ccaa66', wall: '#bb9955', bg: '#1a1408', ceil: '#aa8844' },
};

const AREA_NAMES: Record<AreaId, string> = {
  first_cave: 'First Cave',
  village: 'Mimiga Village',
  egg_corridor: 'Egg Corridor',
  sand_zone: 'Sand Zone',
};

/* ── XP thresholds per level ── */
const XP_THRESH = [0, 10, 30, 100];

/* ── Map generation ── */
function genFirstCave(): number[][] {
  const w = 60, h = 25;
  const m: number[][] = [];
  for (let y = 0; y < h; y++) {
    m[y] = [];
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) { m[y]![x] = 1; }
      else if (y >= h - 2) { m[y]![x] = 1; }
      else { m[y]![x] = 0; }
    }
  }
  // platforms
  for (let x = 8; x < 16; x++) m[18]![x] = 1;
  for (let x = 20; x < 28; x++) m[15]![x] = 1;
  for (let x = 32; x < 38; x++) m[18]![x] = 1;
  for (let x = 42; x < 50; x++) m[16]![x] = 1;
  // walls
  for (let y = 8; y < 16; y++) m[y]![15] = 1;
  for (let y = 5; y < 12; y++) m[y]![30] = 1;
  // ceiling formations
  for (let x = 10; x < 20; x++) { m[1]![x] = 1; m[2]![x] = 1; }
  for (let x = 35; x < 45; x++) { m[1]![x] = 1; }
  return m;
}

function genVillage(): number[][] {
  const w = 80, h = 25;
  const m: number[][] = [];
  for (let y = 0; y < h; y++) {
    m[y] = [];
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) { m[y]![x] = 1; }
      else if (y >= h - 2) { m[y]![x] = 1; }
      else { m[y]![x] = 0; }
    }
  }
  // buildings / platforms
  for (let x = 10; x < 20; x++) m[18]![x] = 1;
  for (let x = 10; x < 20; x++) m[12]![x] = 1;
  for (let x = 25; x < 35; x++) m[16]![x] = 1;
  for (let x = 40; x < 50; x++) m[18]![x] = 1;
  for (let x = 55; x < 65; x++) m[15]![x] = 1;
  for (let x = 68; x < 75; x++) m[18]![x] = 1;
  // some walls
  for (let y = 12; y < 23; y++) { m[y]![10] = 1; m[y]![19] = 1; }
  return m;
}

function genEggCorridor(): number[][] {
  const w = 100, h = 25;
  const m: number[][] = [];
  for (let y = 0; y < h; y++) {
    m[y] = [];
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) { m[y]![x] = 1; }
      else if (y >= h - 2) { m[y]![x] = 1; }
      else { m[y]![x] = 0; }
    }
  }
  // corridor platforms
  for (let x = 10; x < 18; x++) m[19]![x] = 1;
  for (let x = 22; x < 30; x++) m[16]![x] = 1;
  for (let x = 34; x < 42; x++) m[19]![x] = 1;
  for (let x = 46; x < 54; x++) m[14]![x] = 1;
  for (let x = 58; x < 66; x++) m[19]![x] = 1;
  for (let x = 70; x < 78; x++) m[16]![x] = 1;
  for (let x = 82; x < 90; x++) m[19]![x] = 1;
  // ceiling blocks for presses
  for (let x = 15; x < 18; x++) { m[1]![x] = 1; m[2]![x] = 1; }
  for (let x = 50; x < 53; x++) { m[1]![x] = 1; m[2]![x] = 1; }
  for (let x = 85; x < 88; x++) { m[1]![x] = 1; m[2]![x] = 1; }
  // walls
  for (let y = 6; y < 14; y++) m[y]![45] = 1;
  for (let y = 8; y < 18; y++) m[y]![65] = 1;
  return m;
}

function genSandZone(): number[][] {
  const w = 80, h = 25;
  const m: number[][] = [];
  for (let y = 0; y < h; y++) {
    m[y] = [];
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) { m[y]![x] = 1; }
      else if (y >= h - 2) { m[y]![x] = 1; }
      else { m[y]![x] = 0; }
    }
  }
  // sand dunes / platforms
  for (let x = 8; x < 18; x++) m[19]![x] = 1;
  for (let x = 22; x < 30; x++) m[17]![x] = 1;
  for (let x = 34; x < 44; x++) m[19]![x] = 1;
  for (let x = 48; x < 56; x++) m[15]![x] = 1;
  // boss arena area (right side)
  for (let x = 58; x < 78; x++) m[20]![x] = 1;
  for (let y = 5; y < 21; y++) { m[y]![58] = 1; m[y]![78] = 1; }
  for (let x = 58; x < 78; x++) m[5]![x] = 1;
  // entrance into arena
  m[18]![58] = 0; m[19]![58] = 0; m[20]![58] = 0;
  return m;
}

function getAreaMap(area: AreaId): number[][] {
  switch (area) {
    case 'first_cave': return genFirstCave();
    case 'village': return genVillage();
    case 'egg_corridor': return genEggCorridor();
    case 'sand_zone': return genSandZone();
  }
}

function getAreaSize(area: AreaId): { w: number; h: number } {
  switch (area) {
    case 'first_cave': return { w: 60, h: 25 };
    case 'village': return { w: 80, h: 25 };
    case 'egg_corridor': return { w: 100, h: 25 };
    case 'sand_zone': return { w: 80, h: 25 };
  }
}

/* ── Area content generators ── */
function getAreaEnemies(area: AreaId): Enemy[] {
  const mkEnemy = (type: EType, x: number, y: number): Enemy => {
    const sizes: Record<EType, { w: number; h: number; hp: number }> = {
      critter: { w: 12, h: 12, hp: 3 },
      bat: { w: 12, h: 10, hp: 2 },
      beetle: { w: 14, h: 10, hp: 4 },
      press: { w: 16, h: 16, hp: 999 },
    };
    const s = sizes[type];
    return { x: x * TILE, y: y * TILE - s.h, vx: type === 'beetle' ? 0.8 : 0, vy: 0, w: s.w, h: s.h, hp: s.hp, maxHp: s.hp, type, grounded: false, timer: 0, sinOffset: Math.random() * Math.PI * 2, baseY: y * TILE - s.h, active: true };
  };
  switch (area) {
    case 'first_cave': return [mkEnemy('critter', 12, 22), mkEnemy('critter', 25, 14), mkEnemy('bat', 35, 10), mkEnemy('critter', 45, 15)];
    case 'village': return [];
    case 'egg_corridor': return [mkEnemy('beetle', 14, 18), mkEnemy('bat', 26, 10), mkEnemy('beetle', 38, 18), mkEnemy('bat', 50, 8), mkEnemy('press', 16, 3), mkEnemy('beetle', 72, 15), mkEnemy('bat', 85, 12), mkEnemy('press', 51, 3), mkEnemy('press', 86, 3)];
    case 'sand_zone': return [mkEnemy('critter', 12, 18), mkEnemy('beetle', 26, 16), mkEnemy('bat', 36, 12), mkEnemy('critter', 50, 14)];
  }
}

function getAreaNpcs(area: AreaId): NpcDef[] {
  if (area !== 'village') return [];
  return [
    { x: 14 * TILE, y: 11 * TILE - 14, w: 10, h: 14, name: 'King', dialog: ['I am King of the Mimigas.', 'Take this Blade. It has served me well.', 'Use it wisely, warrior.'], spriteKey: 'king', givesWeapon: 'blade', requiresFlag: null },
    { x: 28 * TILE, y: 15 * TILE - 14, w: 10, h: 14, name: 'Toroko', dialog: ['Please be careful in the Sand Zone...', 'Balrog is guarding it.', 'You need to go through Egg Corridor first!'], spriteKey: 'toroko', givesWeapon: null, requiresFlag: null },
    { x: 44 * TILE, y: 17 * TILE - 14, w: 10, h: 14, name: 'Jack', dialog: ['The Egg Corridor is to the east.', 'Be wary of the Beetles there.', 'And watch out for ceiling Presses!'], spriteKey: 'jack', givesWeapon: null, requiresFlag: null },
    { x: 60 * TILE, y: 14 * TILE - 14, w: 10, h: 14, name: 'Sue', dialog: ['The Doctor has taken over the island.', 'We need someone brave to stop him.', 'Please help us...'], spriteKey: 'sue', givesWeapon: null, requiresFlag: null },
  ];
}

function getAreaDoors(area: AreaId): DoorDef[] {
  switch (area) {
    case 'first_cave': return [
      { x: 56 * TILE, y: 21 * TILE, w: 16, h: 16, targetArea: 'village', targetX: 3 * TILE, targetY: 21 * TILE, requiresFlag: null },
    ];
    case 'village': return [
      { x: 2 * TILE, y: 21 * TILE, w: 16, h: 16, targetArea: 'first_cave', targetX: 54 * TILE, targetY: 21 * TILE, requiresFlag: null },
      { x: 76 * TILE, y: 21 * TILE, w: 16, h: 16, targetArea: 'egg_corridor', targetX: 3 * TILE, targetY: 21 * TILE, requiresFlag: null },
      { x: 38 * TILE, y: 21 * TILE, w: 16, h: 16, targetArea: 'sand_zone', targetX: 3 * TILE, targetY: 21 * TILE, requiresFlag: 'visited_egg' },
    ];
    case 'egg_corridor': return [
      { x: 2 * TILE, y: 21 * TILE, w: 16, h: 16, targetArea: 'village', targetX: 74 * TILE, targetY: 21 * TILE, requiresFlag: null },
    ];
    case 'sand_zone': return [
      { x: 2 * TILE, y: 21 * TILE, w: 16, h: 16, targetArea: 'village', targetX: 36 * TILE, targetY: 21 * TILE, requiresFlag: null },
    ];
  }
}

function getAreaBoss(area: AreaId): Boss | null {
  if (area !== 'sand_zone') return null;
  return { x: 66 * TILE, y: 14 * TILE, vx: 0, vy: 0, w: 24, h: 24, hp: 40, maxHp: 40, phase: 0, timer: 60, attackIndex: 0, active: false, dialogShown: false, defeated: false };
}

/* ── Chest locations ── */
interface ChestDef { x: number; y: number; area: AreaId; flag: string; weapon: WpnId | null }

const CHESTS: ChestDef[] = [
  { x: 40 * TILE, y: 17 * TILE, area: 'first_cave', flag: 'chest_polar', weapon: 'polar_star' },
  { x: 92 * TILE, y: 18 * TILE, area: 'egg_corridor', flag: 'chest_missile', weapon: 'missile' },
  { x: 30 * TILE, y: 18 * TILE, area: 'sand_zone', flag: 'chest_fireball', weapon: 'fireball' },
];

/* ── Collision helpers ── */
function tileAt(map: number[][], tx: number, ty: number, mw: number, mh: number): number {
  if (tx < 0 || ty < 0 || tx >= mw || ty >= mh) return 1;
  return map[ty]?.[tx] ?? 1;
}

function rectOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function resolveMapCollision(x: number, y: number, w: number, h: number, vx: number, vy: number, map: number[][], mw: number, mh: number): { x: number; y: number; vx: number; vy: number; grounded: boolean } {
  let nx = x + vx;
  let ny = y + vy;
  let gnd = false;
  let nvx = vx;
  let nvy = vy;

  // X axis
  const xLeft = Math.floor(nx / TILE);
  const xRight = Math.floor((nx + w - 1) / TILE);
  const yTop = Math.floor(y / TILE);
  const yBot = Math.floor((y + h - 1) / TILE);
  for (let ty = yTop; ty <= yBot; ty++) {
    for (let tx = xLeft; tx <= xRight; tx++) {
      if (tileAt(map, tx, ty, mw, mh) === 1) {
        if (vx > 0) { nx = tx * TILE - w; nvx = 0; }
        else if (vx < 0) { nx = (tx + 1) * TILE; nvx = 0; }
      }
    }
  }

  // Y axis
  const xL2 = Math.floor(nx / TILE);
  const xR2 = Math.floor((nx + w - 1) / TILE);
  const yT2 = Math.floor(ny / TILE);
  const yB2 = Math.floor((ny + h - 1) / TILE);
  for (let ty = yT2; ty <= yB2; ty++) {
    for (let tx = xL2; tx <= xR2; tx++) {
      if (tileAt(map, tx, ty, mw, mh) === 1) {
        if (vy > 0) { ny = ty * TILE - h; nvy = 0; gnd = true; }
        else if (vy < 0) { ny = (ty + 1) * TILE; nvy = 0; }
      }
    }
  }

  return { x: nx, y: ny, vx: nvx, vy: nvy, grounded: gnd };
}

function tileSolid(map: number[][], px: number, py: number, mw: number, mh: number): boolean {
  return tileAt(map, Math.floor(px / TILE), Math.floor(py / TILE), mw, mh) === 1;
}

/* ── Init state ── */
function initGameState(): GameState {
  const stars: StarParticle[] = [];
  for (let i = 0; i < 80; i++) {
    stars.push({ x: Math.random() * CW, y: Math.random() * CH, speed: 0.3 + Math.random() * 1.2, bright: 0.3 + Math.random() * 0.7 });
  }
  return {
    phase: 'title',
    charSelect: 0,
    player: {
      x: 3 * TILE, y: 20 * TILE, vx: 0, vy: 0, w: 14, h: 16,
      hp: MAX_HP, facing: 1, grounded: false, invincible: 0, shootCooldown: 0,
      walkFrame: 0, walkTimer: 0, charId: 'quote',
      weapons: [{ id: 'polar_star', ammo: -1, maxAmmo: -1 }],
      activeWeapon: 0, weaponXp: [0, 0, 0, 0], weaponLevels: [1, 1, 1, 1],
    },
    enemies: getAreaEnemies('first_cave'),
    boss: null,
    npcs: [],
    doors: getAreaDoors('first_cave'),
    bullets: [],
    bossBullets: [],
    pickups: [],
    particles: [],
    dialog: { lines: [], lineIndex: 0, charIndex: 0, speaker: '', timer: 0, done: false, onClose: null },
    transition: { active: false, fadeOut: true, timer: 0, targetArea: 'first_cave', targetX: 0, targetY: 0 },
    camera: { x: 0, y: 0 },
    area: 'first_cave',
    areaMap: genFirstCave(),
    areaW: 60,
    areaH: 25,
    flags: new Set<string>(),
    frameCount: 0,
    score: 0,
    stars,
    titleBlink: 0,
  };
}

/* ── Weapon index helper ── */
function wpnIndex(id: WpnId): number {
  const idx: Record<WpnId, number> = { polar_star: 0, fireball: 1, missile: 2, blade: 3 };
  return idx[id];
}

/* ── Component ── */
export function CaveStory() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef = useRef<GameState>(initGameState());
  const keysRef = useRef<Set<string>>(new Set());
  const justPressedRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (!keysRef.current.has(k)) {
      justPressedRef.current.add(k);
    }
    keysRef.current.add(k);
    if (['arrowup','arrowdown','arrowleft','arrowright','z','x',' '].includes(k)) {
      e.preventDefault();
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.key.toLowerCase());
  }, []);

  const spawnParticles = useCallback((x: number, y: number, count: number, color: string) => {
    const gs = gsRef.current;
    for (let i = 0; i < count; i++) {
      gs.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 1,
        life: 15 + Math.random() * 15,
        color,
        size: 1 + Math.random() * 2,
      });
    }
  }, []);

  const spawnPickup = useCallback((x: number, y: number, type: 'xp' | 'hp' | 'missile') => {
    gsRef.current.pickups.push({ x, y, type, life: 300 });
  }, []);

  const startDialog = useCallback((speaker: string, lines: string[], onClose: (() => void) | null) => {
    const gs = gsRef.current;
    gs.phase = 'dialog';
    gs.dialog = { lines, lineIndex: 0, charIndex: 0, speaker, timer: 0, done: false, onClose };
  }, []);

  const startTransition = useCallback((targetArea: AreaId, targetX: number, targetY: number) => {
    const gs = gsRef.current;
    gs.phase = 'transition';
    gs.transition = { active: true, fadeOut: true, timer: 20, targetArea, targetX, targetY };
  }, []);

  const giveWeapon = useCallback((id: WpnId) => {
    const gs = gsRef.current;
    const p = gs.player;
    const exists = p.weapons.some(w => w.id === id);
    if (!exists) {
      const ammo = id === 'missile' ? 10 : -1;
      const maxAmmo = id === 'missile' ? 30 : -1;
      p.weapons.push({ id, ammo, maxAmmo });
    }
  }, []);

  const damagePlayer = useCallback((dmg: number) => {
    const gs = gsRef.current;
    const p = gs.player;
    if (p.invincible > 0) return;
    p.hp -= dmg;
    p.invincible = 60;
    // lose weapon xp
    const wi = wpnIndex(p.weapons[p.activeWeapon]?.id ?? 'polar_star');
    gs.player.weaponXp[wi] = Math.max(0, (gs.player.weaponXp[wi] ?? 0) - 5);
    // level down if xp drops below threshold
    const curLvl = gs.player.weaponLevels[wi] ?? 1;
    if (curLvl > 1 && (gs.player.weaponXp[wi] ?? 0) < (XP_THRESH[curLvl - 1] ?? 0)) {
      gs.player.weaponLevels[wi] = curLvl - 1;
    }
    spawnParticles(p.x + p.w / 2, p.y + p.h / 2, 8, '#ff4444');
    if (p.hp <= 0) {
      p.hp = 0;
      gs.phase = 'gameover';
    }
  }, [spawnParticles]);

  const shoot = useCallback(() => {
    const gs = gsRef.current;
    const p = gs.player;
    if (p.shootCooldown > 0) return;
    if (p.weapons.length === 0) return;
    const wpn = p.weapons[p.activeWeapon];
    if (!wpn) return;
    if (wpn.id === 'missile' && wpn.ammo === 0) return;
    p.shootCooldown = 8;
    const wi = wpnIndex(wpn.id);
    const lvl = gs.player.weaponLevels[wi] ?? 1;
    const bx = p.x + (p.facing > 0 ? p.w : -4);
    const by = p.y + p.h / 2 - 2;

    if (wpn.id === 'polar_star') {
      const dmg = lvl === 1 ? 1 : lvl === 2 ? 2 : 4;
      const spd = 6;
      gs.bullets.push({ x: bx, y: by, vx: p.facing * spd, vy: 0, life: 30, damage: dmg, weaponId: 'polar_star', bounces: 0 });
    } else if (wpn.id === 'fireball') {
      const dmg = lvl;
      gs.bullets.push({ x: bx, y: by, vx: p.facing * 4, vy: -1, life: 60, damage: dmg, weaponId: 'fireball', bounces: lvl + 1 });
    } else if (wpn.id === 'missile') {
      if (wpn.ammo > 0) wpn.ammo--;
      const dmg = lvl * 2;
      gs.bullets.push({ x: bx, y: by, vx: p.facing * 5, vy: 0, life: 40, damage: dmg, weaponId: 'missile', bounces: 0 });
      if (lvl === 3) {
        gs.bullets.push({ x: bx, y: by - 6, vx: p.facing * 5, vy: -1, life: 40, damage: dmg, weaponId: 'missile', bounces: 0 });
        gs.bullets.push({ x: bx, y: by + 6, vx: p.facing * 5, vy: 1, life: 40, damage: dmg, weaponId: 'missile', bounces: 0 });
      }
    } else if (wpn.id === 'blade') {
      const range = lvl === 3 ? 40 : 20;
      const dmg = lvl === 1 ? 2 : lvl === 2 ? 4 : 6;
      const spd = lvl === 3 ? 5 : 3;
      gs.bullets.push({ x: bx, y: by, vx: p.facing * spd, vy: 0, life: Math.ceil(range / spd), damage: dmg, weaponId: 'blade', bounces: 0 });
    }
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const gs = gsRef.current;
    const keys = keysRef.current;
    const jp = justPressedRef.current;

    gs.frameCount++;

    /* ── Title screen ── */
    if (gs.phase === 'title') {
      gs.titleBlink++;
      // update stars
      for (const s of gs.stars) {
        s.y += s.speed;
        if (s.y > CH) { s.y = 0; s.x = Math.random() * CW; }
      }
      // char select
      if (jp.has('arrowleft') || jp.has('a')) gs.charSelect = 0;
      if (jp.has('arrowright') || jp.has('d')) gs.charSelect = 1;
      if (jp.has('z') || jp.has('enter')) {
        gs.player.charId = gs.charSelect === 0 ? 'quote' : 'curly';
        gs.phase = 'playing';
        gs.player.x = 3 * TILE;
        gs.player.y = 20 * TILE;
        gs.area = 'first_cave';
        gs.areaMap = getAreaMap('first_cave');
        const sz = getAreaSize('first_cave');
        gs.areaW = sz.w; gs.areaH = sz.h;
        gs.enemies = getAreaEnemies('first_cave');
        gs.npcs = getAreaNpcs('first_cave');
        gs.doors = getAreaDoors('first_cave');
        gs.boss = getAreaBoss('first_cave');
        gs.bullets = [];
        gs.bossBullets = [];
        gs.pickups = [];
        gs.particles = [];
        gs.player.hp = MAX_HP;
        gs.player.weapons = [];
        gs.player.activeWeapon = 0;
        gs.player.weaponXp = [0, 0, 0, 0];
        gs.player.weaponLevels = [1, 1, 1, 1];
        gs.flags = new Set();
      }

      // Draw title
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, CW, CH);
      for (const s of gs.stars) {
        ctx.fillStyle = `rgba(255,255,255,${s.bright})`;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
      }
      drawText(ctx, 'CAVE STORY', 160, 80, 5, '#ffffff');
      drawText(ctx, 'A TRIBUTE BY DANNYOS', 180, 150, 2, '#888899');

      // Characters
      const qx = 230, cx = 370, cy = 250;
      ctx.save();
      ctx.scale(3, 3);
      drawSprite(ctx, QUOTE_FRAMES[0]!, QUOTE_COLORS, Math.floor(qx / 3), Math.floor(cy / 3), false);
      drawSprite(ctx, CURLY_FRAMES[0]!, CURLY_COLORS, Math.floor(cx / 3), Math.floor(cy / 3), false);
      ctx.restore();

      drawText(ctx, 'QUOTE', qx - 5, cy + 55, 2, gs.charSelect === 0 ? '#ffff00' : '#666666');
      drawText(ctx, 'CURLY', cx - 5, cy + 55, 2, gs.charSelect === 1 ? '#ffff00' : '#666666');

      // Selection arrow
      const arrX = gs.charSelect === 0 ? qx + 12 : cx + 12;
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(arrX, cy - 15, 8, 3);
      ctx.fillRect(arrX + 2, cy - 18, 4, 3);
      ctx.fillRect(arrX + 3, cy - 21, 2, 3);

      drawText(ctx, 'LEFT RIGHT TO SELECT', 170, 340, 2, '#777788');
      if (gs.titleBlink % 60 < 40) {
        drawText(ctx, 'PRESS Z OR ENTER TO START', 145, 380, 2, '#aaaacc');
      }

      jp.clear();
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    /* ── Game Over ── */
    if (gs.phase === 'gameover') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, CW, CH);
      drawText(ctx, 'GAME OVER', 190, 180, 4, '#cc2222');
      drawText(ctx, 'PRESS R TO RETRY', 200, 260, 2, '#888888');
      if (jp.has('r')) {
        const fresh = initGameState();
        fresh.phase = 'title';
        Object.assign(gs, fresh);
      }
      jp.clear();
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    /* ── Win ── */
    if (gs.phase === 'win') {
      ctx.fillStyle = '#050520';
      ctx.fillRect(0, 0, CW, CH);
      for (const s of gs.stars) {
        s.y += s.speed;
        if (s.y > CH) { s.y = 0; s.x = Math.random() * CW; }
        ctx.fillStyle = `rgba(255,255,255,${s.bright})`;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
      }
      drawText(ctx, 'VICTORY!', 210, 140, 5, '#ffdd44');
      drawText(ctx, 'BALROG DEFEATED', 205, 220, 3, '#ffffff');
      drawText(ctx, 'SCORE ' + String(gs.score), 230, 280, 2, '#aaaacc');
      drawText(ctx, 'THANKS FOR PLAYING!', 185, 330, 2, '#888899');
      drawText(ctx, 'PRESS R FOR TITLE', 200, 390, 2, '#666677');
      if (jp.has('r')) {
        const fresh = initGameState();
        Object.assign(gs, fresh);
      }
      jp.clear();
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    /* ── Transition ── */
    if (gs.phase === 'transition') {
      const tr = gs.transition;
      tr.timer--;
      if (tr.timer <= 0) {
        if (tr.fadeOut) {
          // Swap area
          gs.area = tr.targetArea;
          gs.areaMap = getAreaMap(tr.targetArea);
          const sz = getAreaSize(tr.targetArea);
          gs.areaW = sz.w; gs.areaH = sz.h;
          gs.enemies = getAreaEnemies(tr.targetArea);
          gs.npcs = getAreaNpcs(tr.targetArea);
          gs.doors = getAreaDoors(tr.targetArea);
          gs.boss = getAreaBoss(tr.targetArea);
          gs.bullets = [];
          gs.bossBullets = [];
          gs.pickups = [];
          gs.particles = [];
          gs.player.x = tr.targetX;
          gs.player.y = tr.targetY;
          gs.player.vx = 0;
          gs.player.vy = 0;
          if (tr.targetArea === 'egg_corridor') gs.flags.add('visited_egg');
          tr.fadeOut = false;
          tr.timer = 20;
        } else {
          tr.active = false;
          gs.phase = 'playing';
        }
      }
      // draw fade
      const alpha = tr.fadeOut ? 1 - tr.timer / 20 : tr.timer / 20;
      // render area behind fade
      renderGame(ctx, gs);
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fillRect(0, 0, CW, CH);
      jp.clear();
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    /* ── Dialog ── */
    if (gs.phase === 'dialog') {
      const dl = gs.dialog;
      dl.timer++;
      if (!dl.done) {
        if (dl.timer % 2 === 0) {
          dl.charIndex++;
          const curLine = dl.lines[dl.lineIndex] ?? '';
          if (dl.charIndex >= curLine.length) {
            dl.done = true;
          }
        }
      }
      if (jp.has('enter') || jp.has('z')) {
        if (dl.done) {
          dl.lineIndex++;
          dl.charIndex = 0;
          dl.timer = 0;
          dl.done = false;
          if (dl.lineIndex >= dl.lines.length) {
            gs.phase = 'playing';
            if (dl.onClose) dl.onClose();
          }
        } else {
          dl.charIndex = (dl.lines[dl.lineIndex] ?? '').length;
          dl.done = true;
        }
      }
      renderGame(ctx, gs);
      // Draw dialog box
      ctx.fillStyle = 'rgba(0,0,30,0.9)';
      ctx.fillRect(20, CH - 100, CW - 40, 85);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, CH - 100, CW - 40, 85);
      drawText(ctx, dl.speaker, 35, CH - 92, 2, '#ffdd44');
      const curText = (dl.lines[dl.lineIndex] ?? '').substring(0, dl.charIndex);
      drawText(ctx, curText, 35, CH - 68, 2, '#ffffff');
      if (dl.done) {
        if (gs.frameCount % 40 < 25) {
          drawText(ctx, '...', CW - 80, CH - 28, 2, '#aaaacc');
        }
      }
      jp.clear();
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    /* ══ Playing ══ */
    const p = gs.player;

    // Movement
    const left = keys.has('arrowleft') || keys.has('a');
    const right = keys.has('arrowright') || keys.has('d');
    const jumpKey = keys.has('arrowup') || keys.has('w') || keys.has(' ');

    if (left) { p.vx = -MOVE_SPD; p.facing = -1; }
    else if (right) { p.vx = MOVE_SPD; p.facing = 1; }
    else { p.vx = 0; }

    if (jumpKey && p.grounded) { p.vy = JUMP_V; p.grounded = false; }

    p.vy += GRAV;
    if (p.vy > 10) p.vy = 10;

    const res = resolveMapCollision(p.x, p.y, p.w, p.h, p.vx, p.vy, gs.areaMap, gs.areaW, gs.areaH);
    p.x = res.x; p.y = res.y; p.vx = res.vx; p.vy = res.vy; p.grounded = res.grounded;

    // Walk animation
    if (Math.abs(p.vx) > 0.1 && p.grounded) {
      p.walkTimer++;
      if (p.walkTimer >= 6) { p.walkTimer = 0; p.walkFrame = (p.walkFrame + 1) % 4; }
    } else if (p.grounded) {
      p.walkFrame = 0; p.walkTimer = 0;
    }

    if (p.invincible > 0) p.invincible--;
    if (p.shootCooldown > 0) p.shootCooldown--;

    // Shooting
    if (keys.has('z') || keys.has('x')) { shoot(); }

    // Weapon switch
    if (p.weapons.length > 0) {
      if (jp.has('a') && !left) {
        p.activeWeapon = (p.activeWeapon - 1 + p.weapons.length) % p.weapons.length;
      }
      if (jp.has('s')) {
        p.activeWeapon = (p.activeWeapon + 1) % p.weapons.length;
      }
      if (jp.has('1') && p.weapons.length > 0) p.activeWeapon = 0;
      if (jp.has('2') && p.weapons.length > 1) p.activeWeapon = 1;
      if (jp.has('3') && p.weapons.length > 2) p.activeWeapon = 2;
      if (jp.has('4') && p.weapons.length > 3) p.activeWeapon = 3;
    }

    // Door interaction
    if (jp.has('arrowup') || jp.has('w')) {
      for (const door of gs.doors) {
        if (rectOverlap(p.x, p.y, p.w, p.h, door.x, door.y, door.w, door.h)) {
          if (door.requiresFlag && !gs.flags.has(door.requiresFlag)) {
            startDialog('System', ['This area is not yet accessible.', 'Try exploring elsewhere first.'], null);
          } else {
            startTransition(door.targetArea, door.targetX, door.targetY);
          }
          break;
        }
      }
    }

    // NPC interaction
    if (jp.has('arrowup') || jp.has('w')) {
      for (const npc of gs.npcs) {
        if (rectOverlap(p.x - 8, p.y, p.w + 16, p.h, npc.x, npc.y, npc.w, npc.h)) {
          const onClose = npc.givesWeapon ? () => {
            giveWeapon(npc.givesWeapon!);
            gs.flags.add('has_' + npc.givesWeapon);
          } : null;
          startDialog(npc.name, npc.dialog, onClose);
          break;
        }
      }
    }

    // Chest interaction
    if (jp.has('arrowup') || jp.has('w')) {
      for (const chest of CHESTS) {
        if (chest.area === gs.area && !gs.flags.has(chest.flag)) {
          if (rectOverlap(p.x, p.y, p.w, p.h, chest.x, chest.y, 16, 12)) {
            gs.flags.add(chest.flag);
            if (chest.weapon) {
              giveWeapon(chest.weapon);
              startDialog('System', ['Got ' + chest.weapon.replace('_', ' ').toUpperCase() + '!'], null);
            }
          }
        }
      }
    }

    // Update bullets
    for (let i = gs.bullets.length - 1; i >= 0; i--) {
      const b = gs.bullets[i]!;
      b.life--;
      if (b.weaponId === 'fireball') {
        b.vy += GRAV * 0.6;
        if (tileSolid(gs.areaMap, b.x, b.y + b.vy, gs.areaW, gs.areaH)) {
          b.vy = -Math.abs(b.vy) * 0.8;
          b.bounces--;
          if (b.bounces <= 0) b.life = 0;
        }
      }
      b.x += b.vx;
      b.y += b.vy;
      // wall collision
      if (tileSolid(gs.areaMap, b.x, b.y, gs.areaW, gs.areaH)) {
        if (b.weaponId === 'missile') {
          spawnParticles(b.x, b.y, 10, '#ff8800');
        }
        b.life = 0;
      }
      if (b.life <= 0) { gs.bullets.splice(i, 1); }
    }

    // Update enemies
    for (let i = gs.enemies.length - 1; i >= 0; i--) {
      const e = gs.enemies[i]!;
      if (!e.active) continue;
      e.timer++;

      if (e.type === 'critter') {
        e.vy += GRAV;
        if (e.timer % 60 === 0 && e.grounded) { e.vy = -5; e.vx = (Math.random() > 0.5 ? 1 : -1) * 1.5; }
        const er = resolveMapCollision(e.x, e.y, e.w, e.h, e.vx, e.vy, gs.areaMap, gs.areaW, gs.areaH);
        e.x = er.x; e.y = er.y; e.vx = er.vx; e.vy = er.vy; e.grounded = er.grounded;
      } else if (e.type === 'bat') {
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          e.vx += (dx / dist) * 0.1;
          e.vy += (dy / dist) * 0.05;
        }
        e.vx *= 0.98;
        e.vy *= 0.98;
        e.y = e.baseY + Math.sin(e.sinOffset + e.timer * 0.05) * 20;
        e.x += e.vx;
      } else if (e.type === 'beetle') {
        e.vy += GRAV;
        const er = resolveMapCollision(e.x, e.y, e.w, e.h, e.vx, e.vy, gs.areaMap, gs.areaW, gs.areaH);
        e.x = er.x; e.y = er.y; e.vy = er.vy; e.grounded = er.grounded;
        if (er.vx === 0) e.vx = -e.vx;
      } else if (e.type === 'press') {
        // drops when player near
        const dx = Math.abs(p.x + p.w / 2 - (e.x + e.w / 2));
        if (dx < 30 && p.y > e.y) {
          e.vy += GRAV * 2;
        }
        e.y += e.vy;
        if (tileSolid(gs.areaMap, e.x + e.w / 2, e.y + e.h + 1, gs.areaW, gs.areaH)) {
          e.vy = 0;
          if (e.timer % 120 === 0) { e.y = e.baseY; e.vy = 0; }
        }
      }

      // Enemy-bullet collision
      if (e.type !== 'press') {
        for (let j = gs.bullets.length - 1; j >= 0; j--) {
          const b = gs.bullets[j]!;
          if (rectOverlap(b.x - 2, b.y - 2, 4, 4, e.x, e.y, e.w, e.h)) {
            e.hp -= b.damage;
            spawnParticles(b.x, b.y, 4, '#ffff00');
            b.life = 0;
            gs.bullets.splice(j, 1);
            if (e.hp <= 0) {
              e.active = false;
              gs.score += e.maxHp * 10;
              spawnParticles(e.x + e.w / 2, e.y + e.h / 2, 12, '#ffaa00');
              // drop XP
              spawnPickup(e.x + e.w / 2, e.y, 'xp');
              if (Math.random() < 0.3) spawnPickup(e.x + e.w / 2 + 8, e.y, 'hp');
            }
            break;
          }
        }
      }

      // Enemy-player collision
      if (e.active && rectOverlap(p.x, p.y, p.w, p.h, e.x, e.y, e.w, e.h)) {
        const dmg = e.type === 'press' ? 5 : 2;
        damagePlayer(dmg);
      }
    }
    // Remove dead enemies
    gs.enemies = gs.enemies.filter(e => e.active);

    // Update boss
    if (gs.boss && gs.boss.active && !gs.boss.defeated) {
      const b = gs.boss;
      b.timer--;

      if (!b.dialogShown) {
        b.dialogShown = true;
        startDialog('Balrog', ['Huzzah!', 'You dare challenge me?!', 'I will crush you!'], null);
      }

      if (b.timer <= 0) {
        b.attackIndex = (b.attackIndex + 1) % 3;
        b.phase = b.attackIndex;
        b.timer = 120;
      }

      if (b.phase === 0) {
        // Jump attack
        b.vy += GRAV;
        if (b.timer % 30 === 0) { b.vy = -8; }
        b.y += b.vy;
        if (b.y > 14 * TILE) { b.y = 14 * TILE; b.vy = 0; spawnParticles(b.x + b.w / 2, b.y + b.h, 6, '#886633'); }
      } else if (b.phase === 1) {
        // Charge
        const dir = p.x > b.x ? 1 : -1;
        b.vx = dir * 3;
        b.x += b.vx;
        if (b.x < 59 * TILE) b.x = 59 * TILE;
        if (b.x > 76 * TILE) b.x = 76 * TILE;
      } else if (b.phase === 2) {
        // Projectile
        if (b.timer % 30 === 0) {
          const dx = p.x - b.x;
          const dy = p.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            gs.bossBullets.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, vx: (dx / dist) * 3, vy: (dy / dist) * 3, life: 80, damage: 3 });
          }
        }
      }

      // Boss-bullet collision
      for (let j = gs.bullets.length - 1; j >= 0; j--) {
        const bl = gs.bullets[j]!;
        if (rectOverlap(bl.x - 2, bl.y - 2, 4, 4, b.x, b.y, b.w, b.h)) {
          b.hp -= bl.damage;
          spawnParticles(bl.x, bl.y, 5, '#ffff00');
          bl.life = 0;
          gs.bullets.splice(j, 1);
          if (b.hp <= 0) {
            b.defeated = true;
            gs.score += 500;
            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, 30, '#ffaa00');
            startDialog('Balrog', ['Gyaaah!', 'I will remember this...!'], () => { gs.phase = 'win'; });
          }
        }
      }

      // Boss-player collision
      if (!b.defeated && rectOverlap(p.x, p.y, p.w, p.h, b.x, b.y, b.w, b.h)) {
        damagePlayer(3);
      }
    }

    // Activate boss if in sand zone boss arena
    if (gs.boss && !gs.boss.active && !gs.boss.defeated && gs.area === 'sand_zone') {
      if (p.x > 60 * TILE) {
        gs.boss.active = true;
      }
    }

    // Update boss bullets
    for (let i = gs.bossBullets.length - 1; i >= 0; i--) {
      const bb = gs.bossBullets[i]!;
      bb.x += bb.vx;
      bb.y += bb.vy;
      bb.life--;
      if (bb.life <= 0 || tileSolid(gs.areaMap, bb.x, bb.y, gs.areaW, gs.areaH)) {
        gs.bossBullets.splice(i, 1);
        continue;
      }
      if (rectOverlap(p.x, p.y, p.w, p.h, bb.x - 3, bb.y - 3, 6, 6)) {
        damagePlayer(bb.damage);
        gs.bossBullets.splice(i, 1);
      }
    }

    // Update pickups
    for (let i = gs.pickups.length - 1; i >= 0; i--) {
      const pk = gs.pickups[i]!;
      pk.life--;
      if (pk.life <= 0) { gs.pickups.splice(i, 1); continue; }
      if (rectOverlap(p.x, p.y, p.w, p.h, pk.x - 4, pk.y - 4, 8, 8)) {
        if (pk.type === 'xp') {
          if (p.weapons.length > 0) {
            const wi = wpnIndex(p.weapons[p.activeWeapon]?.id ?? 'polar_star');
            gs.player.weaponXp[wi] = (gs.player.weaponXp[wi] ?? 0) + 1;
            // Level up check
            const curLvl = gs.player.weaponLevels[wi] ?? 1;
            if (curLvl < 3 && (gs.player.weaponXp[wi] ?? 0) >= (XP_THRESH[curLvl] ?? 100)) {
              gs.player.weaponLevels[wi] = curLvl + 1;
              spawnParticles(p.x + p.w / 2, p.y, 10, '#ffff00');
            }
          }
        } else if (pk.type === 'hp') {
          p.hp = Math.min(MAX_HP, p.hp + 2);
        } else if (pk.type === 'missile') {
          const mWpn = p.weapons.find(w => w.id === 'missile');
          if (mWpn && mWpn.ammo < mWpn.maxAmmo) { mWpn.ammo = Math.min(mWpn.maxAmmo, mWpn.ammo + 3); }
        }
        gs.pickups.splice(i, 1);
      }
    }

    // Update particles
    for (let i = gs.particles.length - 1; i >= 0; i--) {
      const pt = gs.particles[i]!;
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.1;
      pt.life--;
      if (pt.life <= 0) gs.particles.splice(i, 1);
    }

    // Camera
    const camTargetX = p.x + p.w / 2 - CW / 2;
    const camTargetY = p.y + p.h / 2 - CH / 2;
    gs.camera.x += (camTargetX - gs.camera.x) * 0.1;
    gs.camera.y += (camTargetY - gs.camera.y) * 0.1;
    const maxCamX = gs.areaW * TILE - CW;
    const maxCamY = gs.areaH * TILE - CH;
    gs.camera.x = Math.max(0, Math.min(maxCamX, gs.camera.x));
    gs.camera.y = Math.max(0, Math.min(maxCamY, gs.camera.y));

    // Render
    renderGame(ctx, gs);

    jp.clear();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [shoot, damagePlayer, spawnParticles, spawnPickup, startDialog, startTransition, giveWeapon]);

  /* ── Render function ── */
  function renderGame(ctx: CanvasRenderingContext2D, gs: GameState) {
    const cam = gs.camera;
    const colors = AREA_TILE_COLORS[gs.area];
    const p = gs.player;

    // Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, CW, CH);

    // Tiles
    const startTX = Math.max(0, Math.floor(cam.x / TILE));
    const endTX = Math.min(gs.areaW, Math.ceil((cam.x + CW) / TILE) + 1);
    const startTY = Math.max(0, Math.floor(cam.y / TILE));
    const endTY = Math.min(gs.areaH, Math.ceil((cam.y + CH) / TILE) + 1);

    for (let ty = startTY; ty < endTY; ty++) {
      for (let tx = startTX; tx < endTX; tx++) {
        if (gs.areaMap[ty]?.[tx] === 1) {
          const sx = tx * TILE - cam.x;
          const sy = ty * TILE - cam.y;
          ctx.fillStyle = ty === 0 ? colors.ceil : colors.floor;
          ctx.fillRect(Math.floor(sx), Math.floor(sy), TILE, TILE);
          // edge highlight
          ctx.fillStyle = colors.wall;
          ctx.fillRect(Math.floor(sx), Math.floor(sy), TILE, 1);
          ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, TILE);
        }
      }
    }

    // Doors
    for (const door of gs.doors) {
      const dx = door.x - cam.x;
      const dy = door.y - cam.y;
      if (dx > -20 && dx < CW + 20 && dy > -20 && dy < CH + 20) {
        ctx.save();
        ctx.translate(Math.floor(dx), Math.floor(dy));
        drawSprite(ctx, DOOR_SPRITE, DOOR_COLORS, 0, 0, false);
        ctx.restore();
      }
    }

    // Chests
    for (const chest of CHESTS) {
      if (chest.area === gs.area && !gs.flags.has(chest.flag)) {
        const cx = chest.x - cam.x;
        const cy = chest.y - cam.y;
        if (cx > -20 && cx < CW + 20) {
          ctx.save();
          ctx.translate(Math.floor(cx), Math.floor(cy));
          drawSprite(ctx, CHEST_SPRITE, CHEST_COLORS, 0, 0, false);
          ctx.restore();
        }
      }
    }

    // NPCs
    for (const npc of gs.npcs) {
      const nx = npc.x - cam.x;
      const ny = npc.y - cam.y;
      if (nx > -20 && nx < CW + 20) {
        ctx.save();
        ctx.translate(Math.floor(nx), Math.floor(ny));
        const npcSprites: Record<string, { sprite: string[]; colors: Record<string, string> }> = {
          king: { sprite: KING_SPRITE, colors: KING_COLORS },
          toroko: { sprite: TOROKO_SPRITE, colors: TOROKO_COLORS },
          jack: { sprite: JACK_SPRITE, colors: JACK_COLORS },
          sue: { sprite: SUE_SPRITE, colors: SUE_COLORS },
        };
        const sd = npcSprites[npc.spriteKey];
        if (sd) drawSprite(ctx, sd.sprite, sd.colors, 0, 0, false);
        // name above
        drawText(ctx, npc.name, -2, -10, 1, '#ffffff');
        ctx.restore();
      }
    }

    // Enemies
    for (const e of gs.enemies) {
      if (!e.active) continue;
      const ex = e.x - cam.x;
      const ey = e.y - cam.y;
      if (ex < -20 || ex > CW + 20) continue;
      ctx.save();
      ctx.translate(Math.floor(ex), Math.floor(ey));
      if (e.type === 'critter') {
        drawSprite(ctx, CRITTER_SPRITE, CRITTER_COLORS, 0, 0, e.vx < 0);
      } else if (e.type === 'bat') {
        const frame = Math.floor(gs.frameCount / 8) % 2;
        drawSprite(ctx, BAT_FRAMES[frame]!, BAT_COLORS, 0, 0, false);
      } else if (e.type === 'beetle') {
        drawSprite(ctx, BEETLE_SPRITE, BEETLE_COLORS, 0, 0, e.vx < 0);
      } else if (e.type === 'press') {
        drawSprite(ctx, PRESS_SPRITE, PRESS_COLORS, 0, 0, false);
      }
      ctx.restore();
    }

    // Boss
    if (gs.boss && gs.boss.active && !gs.boss.defeated) {
      const b = gs.boss;
      const bx = b.x - cam.x;
      const by = b.y - cam.y;
      ctx.save();
      ctx.translate(Math.floor(bx), Math.floor(by));
      drawSprite(ctx, BALROG_SPRITE, BALROG_COLORS, 0, 0, false);
      ctx.restore();
      // HP bar
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(CW / 2 - 102, 32, 204, 14);
      ctx.fillStyle = '#cc2222';
      ctx.fillRect(CW / 2 - 100, 34, 200 * (b.hp / b.maxHp), 10);
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(CW / 2 - 100, 34, 200 * (b.hp / b.maxHp), 4);
      drawText(ctx, 'BALROG', CW / 2 - 30, 24, 1, '#ffffff');
    }

    // Boss bullets
    for (const bb of gs.bossBullets) {
      const bx = bb.x - cam.x;
      const by = bb.y - cam.y;
      ctx.fillStyle = '#ff4488';
      ctx.fillRect(Math.floor(bx) - 3, Math.floor(by) - 3, 6, 6);
      ctx.fillStyle = '#ffaacc';
      ctx.fillRect(Math.floor(bx) - 1, Math.floor(by) - 1, 2, 2);
    }

    // Player
    const px = p.x - cam.x;
    const py = p.y - cam.y;
    if (p.invincible <= 0 || gs.frameCount % 4 < 2) {
      ctx.save();
      ctx.translate(Math.floor(px), Math.floor(py));
      const frames = p.charId === 'quote' ? QUOTE_FRAMES : CURLY_FRAMES;
      const pColors = p.charId === 'quote' ? QUOTE_COLORS : CURLY_COLORS;
      const frame = frames[p.walkFrame % 4]!;
      drawSprite(ctx, frame, pColors, 0, 0, p.facing < 0);
      ctx.restore();
    }

    // Bullets
    for (const b of gs.bullets) {
      const bx = b.x - cam.x;
      const by = b.y - cam.y;
      if (b.weaponId === 'polar_star') {
        const wi = wpnIndex('polar_star');
        const lvl = gs.player.weaponLevels[wi] ?? 1;
        ctx.fillStyle = lvl === 1 ? '#ffffff' : lvl === 2 ? '#4488ff' : '#ff4444';
        ctx.fillRect(Math.floor(bx) - 2, Math.floor(by) - 1, 5, 3);
      } else if (b.weaponId === 'fireball') {
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(Math.floor(bx) - 3, Math.floor(by) - 3, 6, 6);
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(Math.floor(bx) - 1, Math.floor(by) - 1, 3, 3);
      } else if (b.weaponId === 'missile') {
        ctx.fillStyle = '#888888';
        ctx.fillRect(Math.floor(bx) - 3, Math.floor(by) - 2, 7, 4);
        ctx.fillStyle = '#ff4400';
        ctx.fillRect(Math.floor(bx) - 5, Math.floor(by) - 1, 2, 2);
      } else if (b.weaponId === 'blade') {
        ctx.fillStyle = '#88ccff';
        ctx.fillRect(Math.floor(bx) - 4, Math.floor(by) - 1, 9, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.floor(bx) - 2, Math.floor(by), 5, 1);
      }
    }

    // Pickups
    for (const pk of gs.pickups) {
      const pkx = pk.x - cam.x;
      const pky = pk.y - cam.y;
      if (pk.life < 60 && gs.frameCount % 6 < 3) continue; // blink when expiring
      if (pk.type === 'xp') {
        ctx.fillStyle = '#ffdd00';
        // triangle shape
        ctx.beginPath();
        ctx.moveTo(Math.floor(pkx), Math.floor(pky) - 4);
        ctx.lineTo(Math.floor(pkx) - 4, Math.floor(pky) + 3);
        ctx.lineTo(Math.floor(pkx) + 4, Math.floor(pky) + 3);
        ctx.closePath();
        ctx.fill();
      } else if (pk.type === 'hp') {
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(Math.floor(pkx) - 2, Math.floor(pky) - 3, 5, 6);
        ctx.fillRect(Math.floor(pkx) - 3, Math.floor(pky) - 2, 7, 4);
      } else {
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(Math.floor(pkx) - 3, Math.floor(pky) - 2, 6, 4);
      }
    }

    // Particles
    for (const pt of gs.particles) {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.min(1, pt.life / 10);
      ctx.fillRect(Math.floor(pt.x - cam.x), Math.floor(pt.y - cam.y), Math.ceil(pt.size), Math.ceil(pt.size));
    }
    ctx.globalAlpha = 1;

    // HUD (top 28px)
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, CW, 28);

    // HP hearts
    for (let i = 0; i < MAX_HP; i += 2) {
      const hx = 8 + (i / 2) * 12;
      if (i + 2 <= p.hp) {
        ctx.fillStyle = '#ff2222';
        ctx.fillRect(hx, 6, 4, 8);
        ctx.fillRect(hx + 4, 6, 4, 8);
        ctx.fillRect(hx + 1, 4, 6, 2);
      } else if (i + 1 <= p.hp) {
        ctx.fillStyle = '#ff2222';
        ctx.fillRect(hx, 6, 4, 8);
        ctx.fillRect(hx + 1, 4, 3, 2);
        ctx.fillStyle = '#441111';
        ctx.fillRect(hx + 4, 6, 4, 8);
      } else {
        ctx.fillStyle = '#441111';
        ctx.fillRect(hx, 6, 8, 8);
      }
    }

    // Weapon info
    if (p.weapons.length > 0) {
      const wpn = p.weapons[p.activeWeapon];
      if (wpn) {
        const wi = wpnIndex(wpn.id);
        const lvl = gs.player.weaponLevels[wi] ?? 1;
        const xp = gs.player.weaponXp[wi] ?? 0;
        const wpnName = wpn.id.replace('_', ' ').toUpperCase();
        drawText(ctx, wpnName, 120, 4, 1, '#ffffff');
        drawText(ctx, 'LV' + String(lvl), 120, 14, 1, '#ffdd44');
        // XP bar
        const maxXp = XP_THRESH[lvl] ?? 100;
        const prevXp = XP_THRESH[lvl - 1] ?? 0;
        const barW = 40;
        const fill = lvl >= 3 ? barW : barW * ((xp - prevXp) / Math.max(1, maxXp - prevXp));
        ctx.fillStyle = '#333355';
        ctx.fillRect(152, 15, barW, 5);
        ctx.fillStyle = lvl >= 3 ? '#ffdd44' : '#44aaff';
        ctx.fillRect(152, 15, Math.max(0, Math.min(barW, fill)), 5);
        // Missile ammo
        if (wpn.id === 'missile') {
          drawText(ctx, 'AMMO ' + String(wpn.ammo), 200, 4, 1, '#44ff44');
        }
      }
    }

    // Area name
    drawText(ctx, AREA_NAMES[gs.area], CW - 200, 8, 1, '#aaaacc');

    // Score
    drawText(ctx, 'SCORE ' + String(gs.score), CW - 200, 18, 1, '#888899');

    // Interaction hints
    if (gs.phase === 'playing') {
      for (const door of gs.doors) {
        if (rectOverlap(p.x, p.y, p.w, p.h, door.x, door.y, door.w, door.h)) {
          drawText(ctx, 'UP TO ENTER', Math.floor(door.x - cam.x) - 15, Math.floor(door.y - cam.y) - 14, 1, '#ffff00');
        }
      }
      for (const npc of gs.npcs) {
        if (rectOverlap(p.x - 8, p.y, p.w + 16, p.h, npc.x, npc.y, npc.w, npc.h)) {
          drawText(ctx, 'UP TO TALK', Math.floor(npc.x - cam.x) - 10, Math.floor(npc.y - cam.y) - 20, 1, '#ffff00');
        }
      }
      for (const chest of CHESTS) {
        if (chest.area === gs.area && !gs.flags.has(chest.flag) && rectOverlap(p.x, p.y, p.w, p.h, chest.x, chest.y, 16, 12)) {
          drawText(ctx, 'UP TO OPEN', Math.floor(chest.x - cam.x) - 10, Math.floor(chest.y - cam.y) - 14, 1, '#ffff00');
        }
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CW;
    canvas.height = CH;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    rafRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleKeyDown, handleKeyUp, gameLoop]);

  return (
    <div className={styles.gameContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ imageRendering: 'pixelated', maxWidth: '100%', maxHeight: '100%' }}
        tabIndex={0}
      />
    </div>
  );
}

export default CaveStory;
