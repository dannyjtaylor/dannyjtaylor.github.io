import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { MenuCallbackContext } from '../components/Window/Window';
import { useDesktopStore } from '../stores/desktopStore';
import type { MenuConfig } from '../types';

/* ── Types ── */
type Tool =
  | 'select'
  | 'pencil'
  | 'brush'
  | 'eraser'
  | 'fill'
  | 'picker'
  | 'line'
  | 'rect'
  | 'filledRect'
  | 'ellipse'
  | 'filledEllipse'
  | 'text'
  | 'spray';

/* ── Classic Win95 Paint palette ── */
const PALETTE_ROW1 = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#808040', '#004040', '#0080FF', '#004080', '#4000FF', '#804000',
];
const PALETTE_ROW2 = [
  '#FFFFFF', '#C0C0C0', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF',
  '#FFFF80', '#00FF80', '#80FFFF', '#0080FF', '#FF0080', '#FF8040',
];

/* ── Menu config ── */
export const PAINT_MENUS: MenuConfig[] = [
  {
    label: 'File',
    items: [
      { label: 'New', action: 'file-new' },
      { separator: true },
      { label: 'Save', action: 'file-save', shortcut: 'Ctrl+S' },
      { separator: true },
      { label: 'Exit', action: 'file-exit' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', action: 'edit-undo', shortcut: 'Ctrl+Z' },
      { separator: true },
      { label: 'Clear All', action: 'edit-clear' },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Tool Box', action: 'view-toolbox', checked: true },
      { label: 'Color Box', action: 'view-colorbox', checked: true },
    ],
  },
  {
    label: 'Image',
    items: [
      { label: 'Flip/Rotate...', action: 'image-flip', disabled: true },
      { label: 'Stretch/Skew...', action: 'image-stretch', disabled: true },
      { separator: true },
      { label: 'Invert Colors', action: 'image-invert' },
      { separator: true },
      { label: 'Attributes...', action: 'image-attr', disabled: true },
    ],
  },
  {
    label: 'Help',
    items: [{ label: 'About Paint', action: 'help-about' }],
  },
];

/* ── Tool SVG icons (24x24) ── */
const TOOL_ICONS: Record<Tool, JSX.Element> = {
  select: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <rect x="2" y="2" width="12" height="12" fill="none" stroke="black" strokeWidth="1" strokeDasharray="2,2" />
    </svg>
  ),
  pencil: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <line x1="3" y1="13" x2="13" y2="3" stroke="black" strokeWidth="1.5" />
      <line x1="3" y1="13" x2="5" y2="11" stroke="black" strokeWidth="2.5" />
    </svg>
  ),
  brush: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <line x1="3" y1="13" x2="12" y2="4" stroke="black" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  eraser: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <rect x="2" y="7" width="12" height="6" rx="1" fill="#FF8080" stroke="black" strokeWidth="1" />
      <rect x="2" y="7" width="6" height="6" rx="1" fill="#FFFFFF" stroke="black" strokeWidth="1" />
    </svg>
  ),
  fill: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path d="M4 12 L8 2 L10 8 L14 10 Z" fill="black" />
      <ellipse cx="12" cy="13" rx="2" ry="2" fill="#FFFF00" />
    </svg>
  ),
  picker: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path d="M7 14 L5 10 L10 5 L12 7 L7 12 Z" fill="none" stroke="black" strokeWidth="1" />
      <circle cx="12" cy="4" r="2" fill="black" />
    </svg>
  ),
  line: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <line x1="2" y1="14" x2="14" y2="2" stroke="black" strokeWidth="2" />
    </svg>
  ),
  rect: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <rect x="2" y="4" width="12" height="8" fill="none" stroke="black" strokeWidth="1.5" />
    </svg>
  ),
  filledRect: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <rect x="2" y="4" width="12" height="8" fill="#0080FF" stroke="black" strokeWidth="1.5" />
    </svg>
  ),
  ellipse: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <ellipse cx="8" cy="8" rx="6" ry="4" fill="none" stroke="black" strokeWidth="1.5" />
    </svg>
  ),
  filledEllipse: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <ellipse cx="8" cy="8" rx="6" ry="4" fill="#0080FF" stroke="black" strokeWidth="1.5" />
    </svg>
  ),
  text: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <text x="3" y="13" fontFamily="serif" fontSize="14" fontWeight="bold" fill="black">A</text>
    </svg>
  ),
  spray: (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <circle cx="5" cy="6" r="1" fill="black" />
      <circle cx="8" cy="4" r="1" fill="black" />
      <circle cx="10" cy="7" r="1" fill="black" />
      <circle cx="7" cy="9" r="1" fill="black" />
      <circle cx="4" cy="10" r="1" fill="black" />
      <circle cx="11" cy="10" r="1" fill="black" />
      <circle cx="9" cy="12" r="1" fill="black" />
      <circle cx="6" cy="12" r="1" fill="black" />
    </svg>
  ),
};

const TOOL_LIST: { tool: Tool; label: string }[] = [
  { tool: 'select', label: 'Select' },
  { tool: 'eraser', label: 'Eraser' },
  { tool: 'fill', label: 'Fill' },
  { tool: 'picker', label: 'Pick Color' },
  { tool: 'pencil', label: 'Pencil' },
  { tool: 'brush', label: 'Brush' },
  { tool: 'spray', label: 'Airbrush' },
  { tool: 'text', label: 'Text' },
  { tool: 'line', label: 'Line' },
  { tool: 'rect', label: 'Rectangle' },
  { tool: 'filledRect', label: 'Filled Rectangle' },
  { tool: 'ellipse', label: 'Ellipse' },
  { tool: 'filledEllipse', label: 'Filled Ellipse' },
];

const LINE_WIDTHS = [1, 2, 3, 5];

/* ── Flood fill (scanline) ── */
function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string,
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Parse fillColor hex to RGBA
  const fr = parseInt(fillColor.slice(1, 3), 16);
  const fg = parseInt(fillColor.slice(3, 5), 16);
  const fb = parseInt(fillColor.slice(5, 7), 16);

  const idx = (startY * w + startX) * 4;
  const tr = data[idx]!;
  const tg = data[idx + 1]!;
  const tb = data[idx + 2]!;
  const ta = data[idx + 3]!;

  // If target color equals fill color, no-op
  if (tr === fr && tg === fg && tb === fb && ta === 255) return;

  const tolerance = 2;
  const match = (i: number) =>
    Math.abs(data[i]! - tr) <= tolerance &&
    Math.abs(data[i + 1]! - tg) <= tolerance &&
    Math.abs(data[i + 2]! - tb) <= tolerance &&
    Math.abs(data[i + 3]! - ta) <= tolerance;

  const set = (i: number) => {
    data[i] = fr;
    data[i + 1] = fg;
    data[i + 2] = fb;
    data[i + 3] = 255;
  };

  const stack: [number, number][] = [[startX, startY]];

  while (stack.length > 0) {
    // eslint-disable-next-line prefer-const
    let [x, y] = stack.pop()!;
    let i = (y * w + x) * 4;

    // Move up to find top of column
    while (y >= 0 && match(i)) {
      y--;
      i -= w * 4;
    }
    y++;
    i += w * 4;

    let spanLeft = false;
    let spanRight = false;

    while (y < h && match(i)) {
      set(i);

      if (x > 0) {
        if (match(i - 4)) {
          if (!spanLeft) {
            stack.push([x - 1, y]);
            spanLeft = true;
          }
        } else {
          spanLeft = false;
        }
      }
      if (x < w - 1) {
        if (match(i + 4)) {
          if (!spanRight) {
            stack.push([x + 1, y]);
            spanRight = true;
          }
        } else {
          spanRight = false;
        }
      }

      y++;
      i += w * 4;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/* ── Hex color from canvas pixel ── */
function getPixelColor(ctx: CanvasRenderingContext2D, x: number, y: number): string {
  const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
  return `#${r!.toString(16).padStart(2, '0')}${g!.toString(16).padStart(2, '0')}${b!.toString(16).padStart(2, '0')}`.toUpperCase();
}

/* ── Component ── */
export function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const undoStack = useRef<ImageData[]>([]);
  const registerCallback = useContext(MenuCallbackContext);
  const saveFile = useDesktopStore((s) => s.saveFile);

  const [tool, setTool] = useState<Tool>('pencil');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [lineWidth, setLineWidth] = useState(1);
  const [showToolbox, setShowToolbox] = useState(true);
  const [showColorbox, setShowColorbox] = useState(true);

  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const activeButton = useRef<number>(0);
  const sprayInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectionRect = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  /* Save undo snapshot */
  const pushUndo = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    undoStack.current.push(snap);
    if (undoStack.current.length > 30) undoStack.current.shift();
  }, []);

  /* Init canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.width = w;
    canvas.height = h;
    overlay.width = w;
    overlay.height = h;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    // Try to load saved canvas data
    const saved = useDesktopStore.getState().loadFile('paint');
    if (saved) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = saved;
    }

    pushUndo();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Menu callbacks */
  useEffect(() => {
    return registerCallback((action: string) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      switch (action) {
        case 'file-new':
          pushUndo();
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          break;
        case 'file-save':
          saveFile('paint', canvasRef.current!.toDataURL());
          break;
        case 'file-exit':
          useDesktopStore.getState().closeWindow('paint');
          break;
        case 'edit-undo':
          if (undoStack.current.length > 0) {
            const snap = undoStack.current.pop()!;
            ctx.putImageData(snap, 0, 0);
          }
          break;
        case 'edit-clear':
          pushUndo();
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          break;
        case 'view-toolbox':
          setShowToolbox((v) => !v);
          break;
        case 'view-colorbox':
          setShowColorbox((v) => !v);
          break;
        case 'image-invert': {
          pushUndo();
          const img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
          const d = img.data;
          for (let i = 0; i < d.length; i += 4) {
            d[i] = 255 - d[i]!;
            d[i + 1] = 255 - d[i + 1]!;
            d[i + 2] = 255 - d[i + 2]!;
          }
          ctx.putImageData(img, 0, 0);
          break;
        }
        case 'help-about':
          useDesktopStore.getState().showProperties?.('About Paint', {
            Version: '1.0',
            Description: 'Windows 95 Paint Clone',
          });
          break;
      }
    });
  }, [registerCallback, pushUndo, saveFile, bgColor]);

  /* Get coords relative to canvas */
  const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    };
  }, []);

  /* Get active color based on which mouse button */
  const getColor = useCallback(
    (button: number) => (button === 2 ? bgColor : fgColor),
    [fgColor, bgColor],
  );

  /* Draw overlay for shape preview */
  const drawOverlay = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }, color: string) => {
      const ctx = overlayRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';

      switch (tool) {
        case 'line':
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
          break;
        case 'rect':
          ctx.beginPath();
          ctx.strokeRect(
            Math.min(from.x, to.x), Math.min(from.y, to.y),
            Math.abs(to.x - from.x), Math.abs(to.y - from.y),
          );
          break;
        case 'filledRect':
          ctx.fillRect(
            Math.min(from.x, to.x), Math.min(from.y, to.y),
            Math.abs(to.x - from.x), Math.abs(to.y - from.y),
          );
          break;
        case 'ellipse':
        case 'filledEllipse': {
          const cx = (from.x + to.x) / 2;
          const cy = (from.y + to.y) / 2;
          const rx = Math.abs(to.x - from.x) / 2;
          const ry = Math.abs(to.y - from.y) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, Math.max(rx, 0.1), Math.max(ry, 0.1), 0, 0, Math.PI * 2);
          if (tool === 'filledEllipse') ctx.fill();
          else ctx.stroke();
          break;
        }
        case 'select': {
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            Math.min(from.x, to.x), Math.min(from.y, to.y),
            Math.abs(to.x - from.x), Math.abs(to.y - from.y),
          );
          ctx.setLineDash([]);
          break;
        }
      }
    },
    [tool, lineWidth],
  );

  /* Commit overlay shape to main canvas */
  const commitShape = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }, color: string) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';

      switch (tool) {
        case 'line':
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
          break;
        case 'rect':
          ctx.beginPath();
          ctx.strokeRect(
            Math.min(from.x, to.x), Math.min(from.y, to.y),
            Math.abs(to.x - from.x), Math.abs(to.y - from.y),
          );
          break;
        case 'filledRect':
          ctx.fillRect(
            Math.min(from.x, to.x), Math.min(from.y, to.y),
            Math.abs(to.x - from.x), Math.abs(to.y - from.y),
          );
          break;
        case 'ellipse':
        case 'filledEllipse': {
          const cx = (from.x + to.x) / 2;
          const cy = (from.y + to.y) / 2;
          const rx = Math.abs(to.x - from.x) / 2;
          const ry = Math.abs(to.y - from.y) / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, Math.max(rx, 0.1), Math.max(ry, 0.1), 0, 0, Math.PI * 2);
          if (tool === 'filledEllipse') ctx.fill();
          else ctx.stroke();
          break;
        }
      }
    },
    [tool, lineWidth],
  );

  /* Spray dots */
  const sprayDots = useCallback(
    (x: number, y: number, color: string) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const radius = lineWidth * 8;
      const density = lineWidth * 6;
      ctx.fillStyle = color;
      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        const dx = Math.cos(angle) * r;
        const dy = Math.sin(angle) * r;
        ctx.fillRect(Math.round(x + dx), Math.round(y + dy), 1, 1);
      }
    },
    [lineWidth],
  );

  /* Mouse down */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const pos = getPos(e);
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      drawing.current = true;
      activeButton.current = e.button;
      lastPos.current = pos;
      startPos.current = pos;
      const color = getColor(e.button);

      // Push undo for freehand tools on mouse down
      if (['pencil', 'brush', 'eraser', 'spray', 'fill', 'picker', 'text'].includes(tool)) {
        if (tool !== 'picker') pushUndo();
      }

      switch (tool) {
        case 'pencil':
        case 'brush': {
          ctx.strokeStyle = color;
          ctx.lineWidth = tool === 'brush' ? lineWidth * 3 : lineWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
          break;
        }
        case 'eraser': {
          ctx.strokeStyle = bgColor;
          ctx.lineWidth = lineWidth * 4;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
          break;
        }
        case 'fill':
          floodFill(ctx, pos.x, pos.y, color);
          break;
        case 'picker': {
          const c = getPixelColor(ctx, pos.x, pos.y);
          if (e.button === 2) setBgColor(c);
          else setFgColor(c);
          break;
        }
        case 'text': {
          const text = prompt('Enter text:');
          if (text) {
            ctx.fillStyle = color;
            ctx.font = `${Math.max(lineWidth * 6, 14)}px "MS Sans Serif", Arial, sans-serif`;
            ctx.fillText(text, pos.x, pos.y);
          }
          break;
        }
        case 'spray': {
          sprayDots(pos.x, pos.y, color);
          sprayInterval.current = setInterval(() => {
            if (lastPos.current) {
              sprayDots(lastPos.current.x, lastPos.current.y, color);
            }
          }, 50);
          break;
        }
        case 'line':
        case 'rect':
        case 'filledRect':
        case 'ellipse':
        case 'filledEllipse':
        case 'select':
          // Push undo for shape tools
          pushUndo();
          break;
      }
    },
    [tool, lineWidth, fgColor, bgColor, getPos, getColor, pushUndo, sprayDots],
  );

  /* Mouse move */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!drawing.current) return;
      const pos = getPos(e);
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const color = getColor(activeButton.current);

      switch (tool) {
        case 'pencil':
        case 'brush': {
          ctx.strokeStyle = color;
          ctx.lineWidth = tool === 'brush' ? lineWidth * 3 : lineWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
          break;
        }
        case 'eraser': {
          ctx.strokeStyle = bgColor;
          ctx.lineWidth = lineWidth * 4;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
          break;
        }
        case 'spray':
          // lastPos updated below, interval handles spraying
          break;
        case 'line':
        case 'rect':
        case 'filledRect':
        case 'ellipse':
        case 'filledEllipse':
        case 'select':
          drawOverlay(startPos.current!, pos, color);
          break;
      }

      lastPos.current = pos;
    },
    [tool, lineWidth, bgColor, getPos, getColor, drawOverlay],
  );

  /* Mouse up */
  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!drawing.current) return;
      drawing.current = false;
      const pos = getPos(e);
      const color = getColor(activeButton.current);

      // Clear spray interval
      if (sprayInterval.current) {
        clearInterval(sprayInterval.current);
        sprayInterval.current = null;
      }

      // Commit shapes
      if (['line', 'rect', 'filledRect', 'ellipse', 'filledEllipse'].includes(tool) && startPos.current) {
        commitShape(startPos.current, pos, color);
      }

      // Store selection rect for visual
      if (tool === 'select' && startPos.current) {
        selectionRect.current = {
          x: Math.min(startPos.current.x, pos.x),
          y: Math.min(startPos.current.y, pos.y),
          w: Math.abs(pos.x - startPos.current.x),
          h: Math.abs(pos.y - startPos.current.y),
        };
      }

      // Clear overlay
      const overlayCtx = overlayRef.current?.getContext('2d');
      if (overlayCtx) overlayCtx.clearRect(0, 0, overlayCtx.canvas.width, overlayCtx.canvas.height);

      lastPos.current = null;
      startPos.current = null;
    },
    [tool, getPos, getColor, commitShape],
  );

  /* Prevent context menu on canvas */
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  /* ── Win95 3D border helpers ── */
  const raised: React.CSSProperties = {
    borderTop: '1px solid var(--win-btn-hilight)',
    borderLeft: '1px solid var(--win-btn-hilight)',
    borderBottom: '1px solid var(--win-btn-dk-shadow)',
    borderRight: '1px solid var(--win-btn-dk-shadow)',
  };
  const sunken: React.CSSProperties = {
    borderTop: '1px solid var(--win-btn-dk-shadow)',
    borderLeft: '1px solid var(--win-btn-dk-shadow)',
    borderBottom: '1px solid var(--win-btn-hilight)',
    borderRight: '1px solid var(--win-btn-hilight)',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'var(--win-gray)',
        fontFamily: 'var(--font-system)',
        fontSize: 11,
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Main area: toolbox + canvas */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Toolbox */}
        {showToolbox && (
          <div
            style={{
              width: 58,
              minWidth: 58,
              background: 'var(--win-gray)',
              padding: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              ...raised,
            }}
          >
            {/* Tool buttons grid - 2 columns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1,
                padding: 2,
                ...sunken,
                background: 'var(--win-gray)',
              }}
            >
              {TOOL_LIST.map(({ tool: t, label }) => (
                <button
                  key={t}
                  title={label}
                  onClick={() => setTool(t)}
                  style={{
                    width: 24,
                    height: 24,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: tool === t ? 'var(--win-white)' : 'var(--win-gray)',
                    cursor: 'pointer',
                    outline: 'none',
                    ...(tool === t ? sunken : raised),
                  }}
                >
                  {TOOL_ICONS[t]}
                </button>
              ))}
            </div>

            {/* Line width selector */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                padding: 2,
                marginTop: 4,
                ...sunken,
                background: 'var(--win-white)',
              }}
            >
              {LINE_WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => setLineWidth(w)}
                  title={`${w}px`}
                  style={{
                    width: '100%',
                    height: 10,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: lineWidth === w ? '#000080' : 'var(--win-white)',
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                  }}
                >
                  <div
                    style={{
                      width: '80%',
                      height: Math.min(w, 8),
                      background: lineWidth === w ? 'var(--win-white)' : 'var(--win-black)',
                      borderRadius: w > 2 ? 1 : 0,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Canvas area */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            background: '#808080',
            position: 'relative',
            ...sunken,
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                cursor:
                  tool === 'pencil' || tool === 'brush'
                    ? 'crosshair'
                    : tool === 'eraser'
                      ? 'cell'
                      : tool === 'fill'
                        ? 'crosshair'
                        : tool === 'picker'
                          ? 'crosshair'
                          : tool === 'text'
                            ? 'text'
                            : 'crosshair',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onContextMenu={handleContextMenu}
            />
            <canvas
              ref={overlayRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Color palette at bottom */}
      {showColorbox && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '2px 4px',
            background: 'var(--win-gray)',
            ...raised,
            minHeight: 32,
          }}
        >
          {/* Current color indicator */}
          <div
            style={{
              position: 'relative',
              width: 28,
              height: 28,
              marginRight: 2,
            }}
          >
            {/* Background color (behind, offset) */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 18,
                height: 18,
                background: bgColor,
                ...sunken,
              }}
            />
            {/* Foreground color (front, offset) */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 18,
                height: 18,
                background: fgColor,
                ...sunken,
              }}
            />
          </div>

          {/* Palette grid */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              ...sunken,
              padding: 1,
              background: 'var(--win-gray)',
            }}
          >
            <div style={{ display: 'flex', gap: 1 }}>
              {PALETTE_ROW1.map((c) => (
                <div
                  key={`r1-${c}`}
                  onClick={() => setFgColor(c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setBgColor(c);
                  }}
                  title={c}
                  style={{
                    width: 16,
                    height: 16,
                    background: c,
                    cursor: 'pointer',
                    ...raised,
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 1 }}>
              {PALETTE_ROW2.map((c) => (
                <div
                  key={`r2-${c}`}
                  onClick={() => setFgColor(c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setBgColor(c);
                  }}
                  title={c}
                  style={{
                    width: 16,
                    height: 16,
                    background: c,
                    cursor: 'pointer',
                    ...raised,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
