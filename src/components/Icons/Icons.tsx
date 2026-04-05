/**
 * Icon system — uses PNG images where available, canvas pixel art as fallback.
 */

import { useRef, useEffect, memo } from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

type DrawFn = (ctx: CanvasRenderingContext2D) => void;

/* ── PNG Icons (served from /icons/) ── */
const PNG_ICONS: Record<string, string> = {
  computer: '/icons/computer.png',
  file: '/icons/file.png',
  mail: '/icons/mail.png',
  recycle: '/icons/recycle-full.png',
  'recycle-empty': '/icons/recycle-empty.png',
  'recycle-full': '/icons/recycle-full.png',
  console: '/icons/console.png',
  notepad: '/icons/notepad.png',
  document: '/icons/document.png',
  windows: '/icons/windows.png',
  valorant: '/icons/valorant.png',
  discord: '/icons/discord.png',
  cavestory: '/icons/quote.gif',
  froggit: '/icons/froggit.png',
  minesweeper: '/icons/minesweeper.png',
  undertale: '/icons/undertale.png',
  aol: '/icons/aol.png',
  paint: '/icons/paint.png',
  datetime: '/icons/datetime.png',
  settings: '/icons/settings.png',
  breadbox: '/icons/breadbox.png',
  steam: '/icons/steam.png',
  folder: '/icons/file.png',
  musicplayer: '/icons/musicplayer.png',
  recyclebinfull: '/icons/recycle-full.png',
  recyclebinempty: '/icons/recycle-empty.png',
  credits: '/icons/credits.svg',
};

/* ── Canvas Pixel Art Component ── */
const PixelIconCanvas = memo(function PixelIconCanvas({
  draw,
  size = 48,
  className,
}: {
  draw: DrawFn;
  size?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 16, 16);
    ctx.imageSmoothingEnabled = false;
    draw(ctx);
  }, [draw]);

  return (
    <canvas
      ref={ref}
      width={16}
      height={16}
      className={className}
      style={{ width: size, height: size, imageRendering: 'pixelated' }}
    />
  );
});

/* ── PNG Icon Component ── */
function PngIcon({ src, size = 48, className }: { src: string; size?: number; className?: string }) {
  return (
    <img
      src={src}
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
      draggable={false}
      alt=""
    />
  );
}

/* ── Canvas Draw Functions ── */

function drawFolder(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#FFCC00';
  ctx.fillRect(1, 2, 6, 3);
  ctx.fillStyle = '#000';
  ctx.fillRect(1, 2, 6, 1); ctx.fillRect(1, 2, 1, 3);
  ctx.fillStyle = '#FFE066';
  ctx.fillRect(2, 3, 4, 1);
  ctx.fillStyle = '#FFCC00';
  ctx.fillRect(1, 4, 13, 10);
  ctx.fillStyle = '#000';
  ctx.fillRect(1, 4, 13, 1); ctx.fillRect(1, 4, 1, 10);
  ctx.fillRect(13, 4, 1, 10); ctx.fillRect(1, 13, 13, 1);
  ctx.fillStyle = '#FFE066';
  ctx.fillRect(2, 5, 11, 1);
  ctx.fillStyle = '#CC9900';
  ctx.fillRect(2, 12, 11, 1);
  ctx.fillStyle = '#808080';
  ctx.fillRect(14, 5, 1, 9);
  ctx.fillRect(2, 14, 13, 1);
}

function drawDrive(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(1, 4, 13, 8);
  ctx.fillStyle = '#000';
  ctx.fillRect(1, 4, 13, 1); ctx.fillRect(1, 4, 1, 8);
  ctx.fillRect(13, 4, 1, 8); ctx.fillRect(1, 11, 13, 1);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(2, 5, 11, 1);
  ctx.fillStyle = '#000';
  ctx.fillRect(3, 7, 7, 2);
  ctx.fillStyle = '#33FF33';
  ctx.fillRect(12, 9, 1, 1);
  ctx.fillStyle = '#808080';
  ctx.fillRect(3, 10, 7, 1);
}

function drawFloppy(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#222';
  ctx.fillRect(2, 1, 12, 14);
  ctx.fillStyle = '#000';
  ctx.fillRect(2, 1, 12, 1); ctx.fillRect(2, 1, 1, 14);
  ctx.fillRect(13, 1, 1, 14); ctx.fillRect(2, 14, 12, 1);
  ctx.fillStyle = '#AAA';
  ctx.fillRect(5, 1, 6, 5);
  ctx.fillStyle = '#222';
  ctx.fillRect(7, 2, 2, 3);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(4, 8, 8, 5);
  ctx.fillStyle = '#888';
  ctx.fillRect(5, 9, 6, 1);
  ctx.fillRect(5, 11, 5, 1);
}

function drawCD(ctx: CanvasRenderingContext2D) {
  const cx = 7.5, cy = 7.5;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= 7) {
        ctx.fillStyle = dist <= 2 ? '#FFF' : dist <= 3 ? '#CCC' : '#E8E8E8';
        ctx.fillRect(x, y, 1, 1);
      }
      if (dist >= 6.5 && dist <= 7.5) {
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  ctx.fillStyle = '#88CCFF';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(4, 4, 2, 1);
  ctx.fillRect(3, 5, 1, 1);
  ctx.fillStyle = '#FF88CC';
  ctx.fillRect(5, 3, 2, 1);
  ctx.globalAlpha = 1;
}

function drawVoltbox(ctx: CanvasRenderingContext2D) {
  // Chip / breadboard icon with a lightning bolt
  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(1, 1, 14, 14);
  ctx.fillStyle = '#000';
  ctx.fillRect(1, 1, 14, 1); ctx.fillRect(1, 1, 1, 14);
  ctx.fillRect(14, 1, 1, 14); ctx.fillRect(1, 14, 14, 1);
  // Inner board color
  ctx.fillStyle = '#E8D5A3';
  ctx.fillRect(2, 2, 12, 12);
  // Lightning bolt (yellow)
  ctx.fillStyle = '#FFCC00';
  ctx.fillRect(8, 2, 3, 1);
  ctx.fillRect(7, 3, 3, 1);
  ctx.fillRect(6, 4, 3, 1);
  ctx.fillRect(5, 5, 5, 1);
  ctx.fillRect(7, 6, 3, 1);
  ctx.fillRect(8, 7, 3, 1);
  ctx.fillRect(7, 8, 3, 1);
  ctx.fillRect(6, 9, 3, 1);
  ctx.fillRect(5, 10, 3, 1);
  ctx.fillRect(4, 11, 3, 1);
  // DIP pins (left/right edges)
  ctx.fillStyle = '#808080';
  for (let y = 3; y <= 12; y += 2) {
    ctx.fillRect(0, y, 2, 1);
    ctx.fillRect(14, y, 2, 1);
  }
}

function drawMinesweeper(ctx: CanvasRenderingContext2D) {
  // Gray square background
  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 16, 1); ctx.fillRect(0, 0, 1, 16);
  ctx.fillRect(15, 0, 1, 16); ctx.fillRect(0, 15, 16, 1);
  // Mine body (dark circle)
  ctx.fillStyle = '#000';
  ctx.fillRect(5, 5, 6, 6);
  ctx.fillRect(4, 6, 8, 4);
  ctx.fillRect(6, 4, 4, 8);
  // Spikes
  ctx.fillRect(7, 2, 2, 2);
  ctx.fillRect(7, 12, 2, 2);
  ctx.fillRect(2, 7, 2, 2);
  ctx.fillRect(12, 7, 2, 2);
  // Shine
  ctx.fillStyle = '#FFF';
  ctx.fillRect(6, 6, 2, 2);
}

function drawShutdown(ctx: CanvasRenderingContext2D) {
  const cx = 7.5, cy = 7.5;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= 6) {
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(x, y, 1, 1);
      }
      if (dist >= 5.5 && dist <= 6.5) {
        ctx.fillStyle = '#800000';
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist >= 3 && dist <= 4 && y > 6) {
        ctx.fillStyle = '#FF3333';
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  ctx.fillStyle = '#FFF';
  ctx.fillRect(7, 3, 2, 6);
}

/* ── Icon Registry ── */

function drawPaint(ctx: CanvasRenderingContext2D) {
  // Paint palette icon
  ctx.fillStyle = '#F5DEB3';
  ctx.fillRect(2, 2, 12, 12);
  ctx.fillStyle = '#000';
  ctx.fillRect(2, 2, 12, 1); ctx.fillRect(2, 2, 1, 12);
  ctx.fillRect(13, 2, 1, 12); ctx.fillRect(2, 13, 12, 1);
  // Color blobs
  ctx.fillStyle = '#FF0000'; ctx.fillRect(4, 4, 2, 2);
  ctx.fillStyle = '#0000FF'; ctx.fillRect(7, 4, 2, 2);
  ctx.fillStyle = '#00FF00'; ctx.fillRect(10, 4, 2, 2);
  ctx.fillStyle = '#FFFF00'; ctx.fillRect(4, 7, 2, 2);
  ctx.fillStyle = '#FF00FF'; ctx.fillRect(7, 7, 2, 2);
  ctx.fillStyle = '#00FFFF'; ctx.fillRect(10, 7, 2, 2);
  // Brush
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(5, 10, 1, 3); ctx.fillRect(6, 9, 1, 3);
  ctx.fillRect(7, 8, 1, 3);
}

function drawSettings(ctx: CanvasRenderingContext2D) {
  // Monitor/display icon
  ctx.fillStyle = '#C0C0C0';
  ctx.fillRect(2, 1, 12, 10);
  ctx.fillStyle = '#000';
  ctx.fillRect(2, 1, 12, 1); ctx.fillRect(2, 1, 1, 10);
  ctx.fillRect(13, 1, 1, 10); ctx.fillRect(2, 10, 12, 1);
  // Screen
  ctx.fillStyle = '#008080';
  ctx.fillRect(4, 3, 8, 6);
  // Stand
  ctx.fillStyle = '#808080';
  ctx.fillRect(6, 11, 4, 1);
  ctx.fillRect(5, 12, 6, 1);
  // Gear on screen
  ctx.fillStyle = '#FFF';
  ctx.fillRect(7, 4, 2, 1);
  ctx.fillRect(6, 5, 4, 2);
  ctx.fillRect(7, 7, 2, 1);
}

function drawDateTime(ctx: CanvasRenderingContext2D) {
  // Clock icon
  const cx = 7.5, cy = 7;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= 6.5 && dist > 5.5) {
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, 1, 1);
      } else if (dist <= 5.5) {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  // Hour hand
  ctx.fillStyle = '#000';
  ctx.fillRect(7, 4, 2, 4);
  // Minute hand
  ctx.fillRect(8, 5, 3, 1);
  // Center dot
  ctx.fillRect(7, 7, 2, 1);
  // Calendar at bottom
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(10, 11, 5, 1);
  ctx.fillStyle = '#FFF';
  ctx.fillRect(10, 12, 5, 3);
  ctx.fillStyle = '#000';
  ctx.fillRect(10, 12, 5, 1); ctx.fillRect(10, 12, 1, 3);
  ctx.fillRect(14, 12, 1, 3); ctx.fillRect(10, 14, 5, 1);
  ctx.fillStyle = '#000';
  ctx.fillRect(12, 13, 1, 1);
}

const DRAW_MAP: Record<string, DrawFn> = {
  folder: drawFolder,
  drive: drawDrive,
  floppy: drawFloppy,
  cd: drawCD,
  breadbox: drawVoltbox,
  minesweeper: drawMinesweeper,
  shutdown: drawShutdown,
  paint: drawPaint,
  settings: drawSettings,
  datetime: drawDateTime,
};

export function DynamicIcon({ name, size = 48, className }: IconProps & { name: string }) {
  // Check for PNG first
  const pngSrc = PNG_ICONS[name];
  if (pngSrc) {
    return <PngIcon src={pngSrc} size={size} className={className} />;
  }
  // Fallback to canvas pixel art
  const draw = DRAW_MAP[name];
  if (!draw) return null;
  return <PixelIconCanvas draw={draw} size={size} className={className} />;
}
