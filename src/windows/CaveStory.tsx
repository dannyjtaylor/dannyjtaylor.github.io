import { useEffect, useRef, useCallback } from 'react';
import styles from './windows.module.css';

/* ══════════════════════════════════════════════════════════
   Cave Story – a playable side-scrolling platformer
   ══════════════════════════════════════════════════════════ */

/* ── Constants ── */
const CANVAS_W = 640;
const CANVAS_H = 400;
const TILE = 16;
const GRAVITY = 0.45;
const JUMP_VEL = -7.5;
const MOVE_SPEED = 2.8;
const BULLET_SPEED = 7;
const BULLET_LIFETIME = 40;
const MAX_HP = 16;
const CRITTER_HP = 3;
const XP_PER_LEVEL = [0, 5, 15]; // cumulative thresholds for weapon level 2, 3
const LEVEL_WIDTH = 200; // in tiles
const LEVEL_HEIGHT = 25;
const CAMERA_LEAD = CANVAS_W / 3;

/* ── Types ── */
interface Vec2 { x: number; y: number; }

interface Player {
  x: number; y: number;
  vx: number; vy: number;
  w: number; h: number;
  hp: number;
  facing: number; // -1 left, 1 right
  grounded: boolean;
  invincible: number; // invincibility frames remaining
  shootCooldown: number;
}

interface Bullet {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  level: number;
}

interface Critter {
  x: number; y: number;
  vx: number; vy: number;
  w: number; h: number;
  hp: number;
  grounded: boolean;
  bounceTimer: number;
}

interface XpPickup {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  value: number;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface GameState {
  phase: 'playing' | 'gameover' | 'win';
  player: Player;
  bullets: Bullet[];
  critters: Critter[];
  xpPickups: XpPickup[];
  particles: Particle[];
  cameraX: number;
  weaponXp: number;
  weaponLevel: number;
  score: number;
  shakeTimer: number;
}

/* ── Level generation ── */
function generateLevel(): number[][] {
  const map: number[][] = [];
  for (let y = 0; y < LEVEL_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < LEVEL_WIDTH; x++) {
      // Bottom floor
      if (y >= LEVEL_HEIGHT - 2) {
        map[y]![x] = 1;
      }
      // Ceiling
      else if (y <= 1) {
        map[y]![x] = 1;
      }
      // Left wall
      else if (x <= 0) {
        map[y]![x] = 1;
      }
      // Right wall
      else if (x >= LEVEL_WIDTH - 1) {
        map[y]![x] = 1;
      }
      else {
        map[y]![x] = 0;
      }
    }
  }

  // Platforms — hand-placed for good gameplay flow
  const platforms: { x: number; y: number; w: number }[] = [
    // Starting area
    { x: 5, y: 19, w: 6 },
    { x: 14, y: 17, w: 5 },
    { x: 8, y: 15, w: 4 },
    { x: 20, y: 20, w: 8 },

    // First cave section
    { x: 30, y: 18, w: 6 },
    { x: 38, y: 15, w: 5 },
    { x: 34, y: 12, w: 4 },
    { x: 44, y: 19, w: 7 },
    { x: 50, y: 16, w: 4 },

    // Middle area — more vertical
    { x: 56, y: 20, w: 5 },
    { x: 62, y: 17, w: 6 },
    { x: 60, y: 13, w: 3 },
    { x: 68, y: 14, w: 5 },
    { x: 70, y: 19, w: 4 },

    // Challenging section
    { x: 78, y: 18, w: 3 },
    { x: 84, y: 15, w: 4 },
    { x: 82, y: 20, w: 6 },
    { x: 90, y: 17, w: 5 },
    { x: 96, y: 13, w: 3 },
    { x: 92, y: 20, w: 7 },

    // High platforms
    { x: 100, y: 19, w: 5 },
    { x: 108, y: 16, w: 6 },
    { x: 106, y: 11, w: 3 },
    { x: 115, y: 14, w: 4 },
    { x: 112, y: 20, w: 8 },

    // Near the exit
    { x: 125, y: 18, w: 5 },
    { x: 132, y: 15, w: 4 },
    { x: 130, y: 20, w: 6 },
    { x: 140, y: 17, w: 5 },
    { x: 138, y: 12, w: 3 },

    // Final approach
    { x: 148, y: 19, w: 6 },
    { x: 155, y: 16, w: 5 },
    { x: 160, y: 18, w: 4 },
    { x: 165, y: 20, w: 7 },
    { x: 172, y: 17, w: 4 },
    { x: 178, y: 15, w: 3 },
    { x: 182, y: 19, w: 6 },

    // Exit platform
    { x: 190, y: 18, w: 6 },
  ];

  for (const p of platforms) {
    for (let dx = 0; dx < p.w; dx++) {
      const px = p.x + dx;
      const py = p.y;
      if (px > 0 && px < LEVEL_WIDTH - 1 && py > 1 && py < LEVEL_HEIGHT - 2) {
        map[py]![px] = 1;
      }
    }
  }

  // Some stalactites from ceiling
  const stalactites = [10, 25, 45, 65, 85, 105, 130, 155, 175];
  for (const sx of stalactites) {
    for (let dy = 2; dy < 2 + 3; dy++) {
      if (sx < LEVEL_WIDTH - 1) {
        map[dy]![sx] = 1;
      }
    }
  }

  // Some stalagmites from floor
  const stalagmites = [18, 42, 58, 75, 98, 120, 145, 168, 188];
  for (const sx of stalagmites) {
    for (let dy = LEVEL_HEIGHT - 4; dy < LEVEL_HEIGHT - 2; dy++) {
      if (sx < LEVEL_WIDTH - 1 && sx > 0) {
        map[dy]![sx] = 1;
      }
    }
  }

  return map;
}

/* ── Critter spawning ── */
function spawnCritters(): Critter[] {
  const positions: Vec2[] = [
    { x: 18 * TILE, y: 18 * TILE },
    { x: 35 * TILE, y: 16 * TILE },
    { x: 48 * TILE, y: 17 * TILE },
    { x: 55 * TILE, y: 18 * TILE },
    { x: 66 * TILE, y: 15 * TILE },
    { x: 72 * TILE, y: 17 * TILE },
    { x: 86 * TILE, y: 13 * TILE },
    { x: 94 * TILE, y: 18 * TILE },
    { x: 104 * TILE, y: 17 * TILE },
    { x: 113 * TILE, y: 14 * TILE },
    { x: 128 * TILE, y: 16 * TILE },
    { x: 136 * TILE, y: 13 * TILE },
    { x: 152 * TILE, y: 17 * TILE },
    { x: 163 * TILE, y: 16 * TILE },
    { x: 175 * TILE, y: 15 * TILE },
    { x: 185 * TILE, y: 17 * TILE },
  ];

  return positions.map(p => ({
    x: p.x, y: p.y,
    vx: (Math.random() > 0.5 ? 1 : -1) * 0.8,
    vy: 0,
    w: 12, h: 12,
    hp: CRITTER_HP,
    grounded: false,
    bounceTimer: Math.random() * 60,
  }));
}

/* ── Initial game state ── */
function createInitialState(): GameState {
  return {
    phase: 'playing',
    player: {
      x: 3 * TILE, y: 18 * TILE,
      vx: 0, vy: 0,
      w: 12, h: 16,
      hp: MAX_HP,
      facing: 1,
      grounded: false,
      invincible: 0,
      shootCooldown: 0,
    },
    bullets: [],
    critters: spawnCritters(),
    xpPickups: [],
    particles: [],
    cameraX: 0,
    weaponXp: 0,
    weaponLevel: 1,
    score: 0,
    shakeTimer: 0,
  };
}

/* ── Tile collision helpers ── */
function tileAt(map: number[][], tx: number, ty: number): number {
  if (tx < 0 || tx >= LEVEL_WIDTH || ty < 0 || ty >= LEVEL_HEIGHT) return 1;
  return map[ty]![tx]!;
}

function rectCollidesMap(map: number[][], x: number, y: number, w: number, h: number): boolean {
  const left = Math.floor(x / TILE);
  const right = Math.floor((x + w - 1) / TILE);
  const top = Math.floor(y / TILE);
  const bottom = Math.floor((y + h - 1) / TILE);
  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      if (tileAt(map, tx, ty) === 1) return true;
    }
  }
  return false;
}

function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/* ══════════════════════════════════════════════════════════
   Component
   ══════════════════════════════════════════════════════════ */
export function CaveStory() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const mapRef = useRef<number[][]>(generateLevel());
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);

  // Door position (exit)
  const doorX = 192 * TILE;
  const doorY = (LEVEL_HEIGHT - 4) * TILE;

  /* ── Physics tick ── */
  const tick = useCallback(() => {
    const gs = stateRef.current;
    const map = mapRef.current;
    const keys = keysRef.current;
    if (gs.phase !== 'playing') return;

    const p = gs.player;

    // Horizontal movement
    if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
      p.vx = -MOVE_SPEED;
      p.facing = -1;
    } else if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
      p.vx = MOVE_SPEED;
      p.facing = 1;
    } else {
      p.vx *= 0.7;
      if (Math.abs(p.vx) < 0.1) p.vx = 0;
    }

    // Jump
    if ((keys.has('ArrowUp') || keys.has('w') || keys.has('W') || keys.has(' ')) && p.grounded) {
      p.vy = JUMP_VEL;
      p.grounded = false;
    }

    // Shoot
    if (keys.has('z') || keys.has('Z')) {
      if (p.shootCooldown <= 0) {
        const bSpeed = BULLET_SPEED + gs.weaponLevel * 1.5;
        gs.bullets.push({
          x: p.x + p.w / 2 + p.facing * 8,
          y: p.y + p.h / 2 - 2,
          vx: p.facing * bSpeed,
          vy: 0,
          life: BULLET_LIFETIME,
          level: gs.weaponLevel,
        });
        p.shootCooldown = gs.weaponLevel >= 3 ? 6 : gs.weaponLevel >= 2 ? 8 : 10;
      }
    }

    if (p.shootCooldown > 0) p.shootCooldown--;
    if (p.invincible > 0) p.invincible--;
    if (gs.shakeTimer > 0) gs.shakeTimer--;

    // Gravity
    p.vy += GRAVITY;
    if (p.vy > 8) p.vy = 8;

    // Move X
    const nextX = p.x + p.vx;
    if (!rectCollidesMap(map, nextX, p.y, p.w, p.h)) {
      p.x = nextX;
    } else {
      p.vx = 0;
    }

    // Move Y
    const nextY = p.y + p.vy;
    if (!rectCollidesMap(map, p.x, nextY, p.w, p.h)) {
      p.y = nextY;
      p.grounded = false;
    } else {
      if (p.vy > 0) p.grounded = true;
      p.vy = 0;
    }

    // Clamp player to level
    p.x = Math.max(TILE, Math.min(p.x, (LEVEL_WIDTH - 2) * TILE));

    // ── Bullets ──
    gs.bullets = gs.bullets.filter(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (b.life <= 0) return false;
      // Tile collision
      const tx = Math.floor(b.x / TILE);
      const ty = Math.floor(b.y / TILE);
      if (tileAt(map, tx, ty) === 1) {
        // Spark particles
        for (let i = 0; i < 3; i++) {
          gs.particles.push({
            x: b.x, y: b.y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 8, maxLife: 8,
            color: '#ffcc00', size: 2,
          });
        }
        return false;
      }
      return true;
    });

    // ── Critters ──
    for (const c of gs.critters) {
      // Bounce AI
      c.bounceTimer--;
      if (c.bounceTimer <= 0 && c.grounded) {
        c.vy = -4 - Math.random() * 2;
        c.grounded = false;
        c.bounceTimer = 40 + Math.random() * 40;
        // Occasionally switch direction
        if (Math.random() < 0.3) c.vx = -c.vx;
      }

      c.vy += GRAVITY;
      if (c.vy > 6) c.vy = 6;

      // Move X
      const cnx = c.x + c.vx;
      if (!rectCollidesMap(map, cnx, c.y, c.w, c.h)) {
        c.x = cnx;
      } else {
        c.vx = -c.vx;
      }

      // Move Y
      const cny = c.y + c.vy;
      if (!rectCollidesMap(map, c.x, cny, c.w, c.h)) {
        c.y = cny;
        c.grounded = false;
      } else {
        if (c.vy > 0) c.grounded = true;
        c.vy = 0;
      }

      // Bullet-critter collision
      for (let bi = gs.bullets.length - 1; bi >= 0; bi--) {
        const b = gs.bullets[bi];
        if (b && rectsOverlap(b.x - 2, b.y - 2, 4, 4, c.x, c.y, c.w, c.h)) {
          const dmg = b.level;
          c.hp -= dmg;
          gs.bullets.splice(bi, 1);
          // Hit particles
          for (let i = 0; i < 4; i++) {
            gs.particles.push({
              x: c.x + c.w / 2, y: c.y + c.h / 2,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 12, maxLife: 12,
              color: '#ffffff', size: 2,
            });
          }
          break;
        }
      }

      // Player-critter collision
      if (p.invincible <= 0 && rectsOverlap(p.x, p.y, p.w, p.h, c.x, c.y, c.w, c.h) && c.hp > 0) {
        p.hp -= 2;
        p.invincible = 60;
        gs.shakeTimer = 8;
        // Knockback
        p.vx = p.x < c.x ? -3 : 3;
        p.vy = -3;
        p.grounded = false;
        if (p.hp <= 0) {
          gs.phase = 'gameover';
        }
      }
    }

    // Remove dead critters -> spawn XP
    gs.critters = gs.critters.filter(c => {
      if (c.hp <= 0) {
        gs.score += 100;
        // Spawn XP triangles
        for (let i = 0; i < 3; i++) {
          gs.xpPickups.push({
            x: c.x + c.w / 2,
            y: c.y + c.h / 2,
            vx: (Math.random() - 0.5) * 3,
            vy: -2 - Math.random() * 2,
            life: 300,
            value: 1,
          });
        }
        // Death particles
        for (let i = 0; i < 8; i++) {
          gs.particles.push({
            x: c.x + c.w / 2, y: c.y + c.h / 2,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 20, maxLife: 20,
            color: '#ff6644', size: 3,
          });
        }
        return false;
      }
      return true;
    });

    // ── XP pickups ──
    gs.xpPickups = gs.xpPickups.filter(xp => {
      xp.vy += 0.15;
      xp.x += xp.vx;
      xp.y += xp.vy;
      xp.vx *= 0.98;
      xp.life--;
      // Floor collision
      const tx = Math.floor(xp.x / TILE);
      const ty = Math.floor(xp.y / TILE);
      if (tileAt(map, tx, ty) === 1) {
        xp.vy = -Math.abs(xp.vy) * 0.5;
        xp.y = ty * TILE - 1;
      }
      // Player pickup
      if (rectsOverlap(xp.x - 4, xp.y - 4, 8, 8, p.x, p.y, p.w, p.h)) {
        gs.weaponXp += xp.value;
        // Level up check
        if (gs.weaponLevel < 3 && gs.weaponXp >= XP_PER_LEVEL[gs.weaponLevel]!) {
          gs.weaponLevel++;
          // Level up particles
          for (let i = 0; i < 10; i++) {
            gs.particles.push({
              x: p.x + p.w / 2, y: p.y + p.h / 2,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              life: 25, maxLife: 25,
              color: '#ffff00', size: 3,
            });
          }
        }
        return false;
      }
      return xp.life > 0;
    });

    // ── Particles ──
    gs.particles = gs.particles.filter(pt => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      return pt.life > 0;
    });

    // ── Camera ──
    const targetCam = p.x - CAMERA_LEAD;
    gs.cameraX += (targetCam - gs.cameraX) * 0.1;
    gs.cameraX = Math.max(0, Math.min(gs.cameraX, LEVEL_WIDTH * TILE - CANVAS_W));

    // ── Win condition — door at far right ──
    if (rectsOverlap(p.x, p.y, p.w, p.h, doorX, doorY, TILE * 2, TILE * 3)) {
      gs.phase = 'win';
    }
  }, [doorX, doorY]);

  /* ── Render frame ── */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const gs = stateRef.current;
    const map = mapRef.current;

    // Screen shake
    const shakeX = gs.shakeTimer > 0 ? (Math.random() - 0.5) * 4 : 0;
    const shakeY = gs.shakeTimer > 0 ? (Math.random() - 0.5) * 4 : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Clear with cave background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(-2, -2, CANVAS_W + 4, CANVAS_H + 4);

    // Background parallax cave details
    const camX = gs.cameraX;
    ctx.save();
    ctx.translate(-camX * 0.3, 0);
    ctx.fillStyle = '#12122a';
    for (let i = 0; i < 20; i++) {
      const bx = i * 160;
      const by = 100 + Math.sin(i * 1.3) * 40;
      ctx.beginPath();
      ctx.arc(bx, by, 30 + Math.sin(i * 2.1) * 15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-camX, 0);

    // ── Draw tiles ──
    const startTX = Math.max(0, Math.floor(camX / TILE) - 1);
    const endTX = Math.min(LEVEL_WIDTH, Math.ceil((camX + CANVAS_W) / TILE) + 1);

    for (let ty = 0; ty < LEVEL_HEIGHT; ty++) {
      for (let tx = startTX; tx < endTX; tx++) {
        if (tileAt(map, tx, ty) !== 1) continue;
        const px = tx * TILE;
        const py = ty * TILE;

        // Determine tile appearance based on neighbors
        const hasAbove = tileAt(map, tx, ty - 1) === 1;
        const hasBelow = tileAt(map, tx, ty + 1) === 1;

        if (!hasAbove) {
          // Top surface — grassy/mossy brown
          ctx.fillStyle = '#6b4c2a';
          ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = '#5a3d1e';
          ctx.fillRect(px, py + TILE - 4, TILE, 4);
          // Highlight edge
          ctx.fillStyle = '#7d5c36';
          ctx.fillRect(px, py, TILE, 2);
        } else if (!hasBelow) {
          // Bottom surface
          ctx.fillStyle = '#3d2a14';
          ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = '#4a3420';
          ctx.fillRect(px, py, TILE, 3);
        } else {
          // Inner rock
          ctx.fillStyle = '#4a3420';
          ctx.fillRect(px, py, TILE, TILE);
          // Texture variation
          if ((tx + ty) % 3 === 0) {
            ctx.fillStyle = '#3d2a14';
            ctx.fillRect(px + 2, py + 2, 4, 4);
          }
          if ((tx * 7 + ty * 3) % 5 === 0) {
            ctx.fillStyle = '#5a3d1e';
            ctx.fillRect(px + 8, py + 6, 3, 3);
          }
        }

        // Tile border for pixel grid feel
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(px, py, 1, TILE);
        ctx.fillRect(px, py, TILE, 1);
      }
    }

    // ── Draw door / exit ──
    // Door frame
    ctx.fillStyle = '#8866aa';
    ctx.fillRect(doorX - 2, doorY - 2, TILE * 2 + 4, TILE * 3 + 4);
    ctx.fillStyle = '#221133';
    ctx.fillRect(doorX, doorY, TILE * 2, TILE * 3);
    // Door handle
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(doorX + TILE * 2 - 6, doorY + TILE * 1.5, 3, 3);
    // Star above door
    ctx.fillStyle = '#ffcc00';
    const starY = doorY - 10 + Math.sin(Date.now() / 300) * 3;
    ctx.fillRect(doorX + TILE - 2, starY, 4, 4);
    ctx.fillRect(doorX + TILE - 4, starY + 2, 8, 1);
    // Label
    ctx.fillStyle = '#aaaacc';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', doorX + TILE, doorY - 14);

    // ── Draw XP pickups ──
    for (const xp of gs.xpPickups) {
      const alpha = xp.life < 60 ? xp.life / 60 : 1;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.moveTo(xp.x, xp.y - 4);
      ctx.lineTo(xp.x - 3, xp.y + 3);
      ctx.lineTo(xp.x + 3, xp.y + 3);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ── Draw bullets ──
    for (const b of gs.bullets) {
      if (b.level >= 3) {
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(b.x - 4, b.y - 2, 8, 4);
        ctx.fillStyle = '#ffaaaa';
        ctx.fillRect(b.x - 2, b.y - 1, 4, 2);
      } else if (b.level >= 2) {
        ctx.fillStyle = '#44aaff';
        ctx.fillRect(b.x - 3, b.y - 1.5, 6, 3);
        ctx.fillStyle = '#aaddff';
        ctx.fillRect(b.x - 1, b.y - 0.5, 2, 1);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(b.x - 2, b.y - 1, 4, 2);
      }
    }

    // ── Draw critters ──
    for (const c of gs.critters) {
      // Body — brown bouncy creature
      ctx.fillStyle = '#cc8844';
      ctx.fillRect(c.x, c.y + 2, c.w, c.h - 2);
      // Head round top
      ctx.fillStyle = '#dd9955';
      ctx.fillRect(c.x + 1, c.y, c.w - 2, 4);
      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(c.x + 2, c.y + 3, 3, 3);
      ctx.fillRect(c.x + c.w - 5, c.y + 3, 3, 3);
      ctx.fillStyle = '#000000';
      ctx.fillRect(c.x + 3, c.y + 4, 1, 1);
      ctx.fillRect(c.x + c.w - 4, c.y + 4, 1, 1);
      // Feet
      ctx.fillStyle = '#aa6633';
      ctx.fillRect(c.x, c.y + c.h - 2, 3, 2);
      ctx.fillRect(c.x + c.w - 3, c.y + c.h - 2, 3, 2);
    }

    // ── Draw player (Quote) ──
    const p = gs.player;
    const blink = p.invincible > 0 && Math.floor(p.invincible / 3) % 2 === 0;
    if (!blink) {
      // Body — white robot
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      // Head top
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x + 1, p.y, p.w - 2, 6);
      // Red cap
      ctx.fillStyle = '#cc3333';
      ctx.fillRect(p.x, p.y, p.w, 3);
      // Eyes
      ctx.fillStyle = '#000000';
      if (p.facing > 0) {
        ctx.fillRect(p.x + 6, p.y + 5, 3, 3);
        ctx.fillRect(p.x + 9, p.y + 5, 2, 3);
      } else {
        ctx.fillRect(p.x + 3, p.y + 5, 3, 3);
        ctx.fillRect(p.x + 1, p.y + 5, 2, 3);
      }
      // Eye highlight
      ctx.fillStyle = '#ffffff';
      if (p.facing > 0) {
        ctx.fillRect(p.x + 7, p.y + 5, 1, 1);
      } else {
        ctx.fillRect(p.x + 4, p.y + 5, 1, 1);
      }
      // Body detail
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(p.x + 2, p.y + 10, p.w - 4, 2);
      // Legs
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(p.x + 1, p.y + p.h - 3, 4, 3);
      ctx.fillRect(p.x + p.w - 5, p.y + p.h - 3, 4, 3);
      // Gun
      ctx.fillStyle = '#888888';
      const gunX = p.facing > 0 ? p.x + p.w : p.x - 6;
      ctx.fillRect(gunX, p.y + 7, 6, 3);
      ctx.fillStyle = '#666666';
      ctx.fillRect(gunX + (p.facing > 0 ? 4 : 0), p.y + 7, 2, 3);
    }

    // ── Draw particles ──
    for (const pt of gs.particles) {
      const alpha = pt.life / pt.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
    }
    ctx.globalAlpha = 1;

    ctx.restore(); // end camera transform

    // ══════ HUD (screen-space) ══════

    // HUD background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_W, 28);

    // HP hearts
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('HP', 8, 18);

    const hearts = Math.ceil(MAX_HP / 2);
    for (let i = 0; i < hearts; i++) {
      const hpForHeart = (i + 1) * 2;
      const hx = 28 + i * 14;
      if (gs.player.hp >= hpForHeart) {
        // Full heart
        drawHeart(ctx, hx, 8, '#ff3344');
      } else if (gs.player.hp >= hpForHeart - 1) {
        // Half heart
        drawHeart(ctx, hx, 8, '#882222');
        drawHalfHeart(ctx, hx, 8, '#ff3344');
      } else {
        // Empty heart
        drawHeart(ctx, hx, 8, '#442222');
      }
    }

    // Weapon level
    const wepLabel = `Polar Star Lv.${gs.weaponLevel}`;
    ctx.fillStyle = gs.weaponLevel >= 3 ? '#ff4444' : gs.weaponLevel >= 2 ? '#44aaff' : '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(wepLabel, 150, 12);

    // XP bar
    const xpBarX = 150;
    const xpBarY = 16;
    const xpBarW = 80;
    const xpBarH = 6;
    ctx.fillStyle = '#333333';
    ctx.fillRect(xpBarX, xpBarY, xpBarW, xpBarH);
    if (gs.weaponLevel < 3) {
      const needed = XP_PER_LEVEL[gs.weaponLevel]! - (gs.weaponLevel > 1 ? XP_PER_LEVEL[gs.weaponLevel - 1]! : 0);
      const current = gs.weaponXp - (gs.weaponLevel > 1 ? XP_PER_LEVEL[gs.weaponLevel - 1]! : 0);
      const pct = Math.min(1, current / needed);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(xpBarX, xpBarY, xpBarW * pct, xpBarH);
    } else {
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(xpBarX, xpBarY, xpBarW, xpBarH);
      ctx.fillStyle = '#ffffff';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MAX', xpBarX + xpBarW / 2, xpBarY + 5);
    }

    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE: ${gs.score}`, CANVAS_W - 10, 18);

    // Controls hint (fades after start)
    ctx.fillStyle = 'rgba(150, 150, 180, 0.6)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Arrow keys/WASD: Move & Jump | Z: Shoot | Reach the exit door!', CANVAS_W / 2, CANVAS_H - 6);

    ctx.restore(); // end shake transform

    // ── Overlay screens ──
    if (gs.phase === 'gameover') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#ff3344';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 20);
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '14px monospace';
      ctx.fillText(`Score: ${gs.score}`, CANVAS_W / 2, CANVAS_H / 2 + 10);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.fillText('Press R to retry', CANVAS_W / 2, CANVAS_H / 2 + 40);
    }

    if (gs.phase === 'win') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('You escaped the cave!', CANVAS_W / 2, CANVAS_H / 2 - 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.fillText(`Final Score: ${gs.score}`, CANVAS_W / 2, CANVAS_H / 2 + 5);
      ctx.fillStyle = '#88ccff';
      ctx.font = '11px monospace';
      ctx.fillText(`Weapon Level: ${gs.weaponLevel} | HP: ${gs.player.hp}/${MAX_HP}`, CANVAS_W / 2, CANVAS_H / 2 + 30);
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '12px monospace';
      ctx.fillText('Press R to play again', CANVAS_W / 2, CANVAS_H / 2 + 60);
    }
  }, [doorX, doorY]);

  /* ── Game loop ── */
  useEffect(() => {
    const loop = () => {
      tick();
      render();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick, render]);

  /* ── Keyboard ── */
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      // Prevent page scroll on arrow keys / space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      // Retry
      if ((e.key === 'r' || e.key === 'R') &&
          (stateRef.current.phase === 'gameover' || stateRef.current.phase === 'win')) {
        stateRef.current = createInitialState();
        mapRef.current = generateLevel();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  return (
    <div className={styles.notepadEditable} style={{ background: '#1a1a2e', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          display: 'block',
        }}
      />
    </div>
  );
}

/* ── Heart drawing helpers ── */
function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  // Simple pixel heart: 10x10
  ctx.fillRect(x + 1, y, 3, 1);
  ctx.fillRect(x + 6, y, 3, 1);
  ctx.fillRect(x, y + 1, 5, 1);
  ctx.fillRect(x + 5, y + 1, 5, 1);
  ctx.fillRect(x, y + 2, 10, 1);
  ctx.fillRect(x, y + 3, 10, 1);
  ctx.fillRect(x + 1, y + 4, 8, 1);
  ctx.fillRect(x + 1, y + 5, 8, 1);
  ctx.fillRect(x + 2, y + 6, 6, 1);
  ctx.fillRect(x + 3, y + 7, 4, 1);
  ctx.fillRect(x + 4, y + 8, 2, 1);
}

function drawHalfHeart(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y, 3, 1);
  ctx.fillRect(x, y + 1, 5, 1);
  ctx.fillRect(x, y + 2, 5, 1);
  ctx.fillRect(x, y + 3, 5, 1);
  ctx.fillRect(x + 1, y + 4, 4, 1);
  ctx.fillRect(x + 1, y + 5, 4, 1);
  ctx.fillRect(x + 2, y + 6, 3, 1);
  ctx.fillRect(x + 3, y + 7, 2, 1);
  ctx.fillRect(x + 4, y + 8, 1, 1);
}

export default CaveStory;
