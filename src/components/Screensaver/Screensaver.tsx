import { useEffect, useRef, useCallback } from 'react';
import { useDesktopStore } from '../../stores/desktopStore';

/* ── Starfield Screensaver ── */
function StarfieldRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const NUM_STARS = 300;
    const stars: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: (Math.random() - 0.5) * canvas.width,
        y: (Math.random() - 0.5) * canvas.height,
        z: Math.random() * canvas.width,
      });
    }

    let animId = 0;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      for (const star of stars) {
        star.z -= 4;
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * w;
          star.y = (Math.random() - 0.5) * h;
          star.z = w;
        }

        const sx = (star.x / star.z) * w + cx;
        const sy = (star.y / star.z) * h + cy;
        const size = Math.max(0.5, (1 - star.z / w) * 3);
        const brightness = Math.max(0.3, 1 - star.z / w);

        ctx.fillStyle = `rgba(255,255,255,${brightness})`;
        ctx.fillRect(sx, sy, size, size);
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

/* ── Matrix Screensaver ── */
function MatrixRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    // Randomize initial positions
    for (let i = 0; i < drops.length; i++) {
      drops[i] = Math.random() * -50;
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';

    let intervalId: ReturnType<typeof setInterval>;
    intervalId = setInterval(() => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f0';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]!;
        ctx.fillStyle = `rgb(0, ${150 + Math.floor(Math.random() * 105)}, 0)`;
        ctx.fillText(text, i * fontSize, drops[i]! * fontSize);

        if (drops[i]! * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]!++;
      }
    }, 40);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

/* ── Maze Screensaver ── */
function MazeRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const cellSize = 20;
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);

    // Generate maze using recursive backtracker
    const grid: number[][] = [];
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        grid[r]![c] = 0; // walls on all sides: top=1, right=2, bottom=4, left=8
      }
    }
    const visited: boolean[][] = [];
    for (let r = 0; r < rows; r++) {
      visited[r] = new Array(cols).fill(false);
    }

    const stack: [number, number][] = [];
    const startR = 0;
    const startC = 0;
    visited[startR]![startC] = true;
    stack.push([startR, startC]);

    const directions: [number, number, number, number][] = [
      [-1, 0, 1, 4], // up: remove top from current, bottom from neighbor
      [0, 1, 2, 8],  // right
      [1, 0, 4, 1],  // down
      [0, -1, 8, 2], // left
    ];

    while (stack.length > 0) {
      const [cr, cc] = stack[stack.length - 1]!;
      const neighbors: [number, number, number, number][] = [];
      for (const [dr, dc, wall, oppWall] of directions) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr]![nc]) {
          neighbors.push([nr, nc, wall, oppWall]);
        }
      }

      if (neighbors.length === 0) {
        stack.pop();
      } else {
        const [nr, nc, wall, oppWall] = neighbors[Math.floor(Math.random() * neighbors.length)]!;
        grid[cr]![cc]! |= wall;
        grid[nr]![nc]! |= oppWall;
        visited[nr]![nc] = true;
        stack.push([nr, nc]);
      }
    }

    // Draw maze progressively
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;

    let drawIndex = 0;
    const totalCells = rows * cols;

    const intervalId = setInterval(() => {
      const batchSize = Math.max(1, Math.floor(totalCells / 200));
      for (let b = 0; b < batchSize && drawIndex < totalCells; b++, drawIndex++) {
        const r = Math.floor(drawIndex / cols);
        const c = drawIndex % cols;
        const x = c * cellSize;
        const y = r * cellSize;
        const cell = grid[r]![c]!;

        ctx.strokeStyle = '#00aa00';

        // Draw walls where there's NO passage
        if (!(cell & 1)) { // no top passage
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y);
          ctx.stroke();
        }
        if (!(cell & 2)) { // no right passage
          ctx.beginPath();
          ctx.moveTo(x + cellSize, y);
          ctx.lineTo(x + cellSize, y + cellSize);
          ctx.stroke();
        }
        if (!(cell & 4)) { // no bottom passage
          ctx.beginPath();
          ctx.moveTo(x, y + cellSize);
          ctx.lineTo(x + cellSize, y + cellSize);
          ctx.stroke();
        }
        if (!(cell & 8)) { // no left passage
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + cellSize);
          ctx.stroke();
        }
      }

      // When done drawing, start a solver dot
      if (drawIndex >= totalCells) {
        clearInterval(intervalId);
        // Animate a solver
        let solverR = 0;
        let solverC = 0;
        const solverVisited: boolean[][] = [];
        for (let r2 = 0; r2 < rows; r2++) {
          solverVisited[r2] = new Array(cols).fill(false);
        }
        const solverStack: [number, number][] = [[0, 0]];
        solverVisited[0]![0] = true;

        const solverInterval = setInterval(() => {
          // Draw current position
          ctx.fillStyle = '#ff0';
          ctx.fillRect(solverC * cellSize + 4, solverR * cellSize + 4, cellSize - 8, cellSize - 8);

          // Move to next
          const cell = grid[solverR]![solverC]!;
          const moveDirs: [number, number, number][] = [
            [-1, 0, 1], [0, 1, 2], [1, 0, 4], [0, -1, 8],
          ];
          let moved = false;
          for (const [dr, dc, wall] of moveDirs) {
            if (!(cell & wall)) continue;
            const nr = solverR + dr;
            const nc = solverC + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !solverVisited[nr]![nc]) {
              solverVisited[nr]![nc] = true;
              solverStack.push([nr, nc]);
              solverR = nr;
              solverC = nc;
              moved = true;
              break;
            }
          }

          if (!moved) {
            solverStack.pop();
            if (solverStack.length > 0) {
              const [pr, pc] = solverStack[solverStack.length - 1]!;
              // Dim the dead end
              ctx.fillStyle = 'rgba(0,0,0,0.7)';
              ctx.fillRect(solverC * cellSize + 4, solverR * cellSize + 4, cellSize - 8, cellSize - 8);
              solverR = pr;
              solverC = pc;
            } else {
              clearInterval(solverInterval);
            }
          }

          // Goal reached?
          if (solverR === rows - 1 && solverC === cols - 1) {
            clearInterval(solverInterval);
          }
        }, 30);

        // Store the interval so cleanup can stop it
        cleanupRef.current = () => clearInterval(solverInterval);
      }
    }, 16);

    const cleanupRef = { current: () => {} };

    return () => {
      clearInterval(intervalId);
      cleanupRef.current();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

/* ── Flying Windows Screensaver ── */
function FlyingWindowsRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const NUM_WINDOWS = 8;
    const logos: { x: number; y: number; dx: number; dy: number; size: number; hue: number }[] = [];
    for (let i = 0; i < NUM_WINDOWS; i++) {
      logos.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (1 + Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1),
        dy: (1 + Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1),
        size: 30 + Math.random() * 40,
        hue: Math.random() * 360,
      });
    }

    let animId = 0;
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const logo of logos) {
        logo.x += logo.dx;
        logo.y += logo.dy;

        if (logo.x <= 0 || logo.x + logo.size >= canvas.width) logo.dx *= -1;
        if (logo.y <= 0 || logo.y + logo.size >= canvas.height) logo.dy *= -1;

        // Draw a Win95-style window
        const s = logo.size;
        const x = logo.x;
        const y = logo.y;

        // Window chrome
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(x, y, s, s * 0.75);

        // Title bar
        ctx.fillStyle = `hsl(${logo.hue}, 70%, 40%)`;
        ctx.fillRect(x + 2, y + 2, s - 4, s * 0.15);

        // Window body
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 2, y + s * 0.2, s - 4, s * 0.5);

        // 3D border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, s, s * 0.75);
        ctx.strokeStyle = '#808080';
        ctx.strokeRect(x + 1, y + 1, s - 1, s * 0.75 - 1);

        logo.hue = (logo.hue + 0.3) % 360;
      }

      animId = requestAnimationFrame(draw);
    };
    // Clear first
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

/* ── Energy Star Screensaver ── */
function EnergyStarRenderer() {
  const posRef = useRef({ x: 100, y: 100, dx: 1.5, dy: 1 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const img = new Image();
    img.src = '/energystar.png';
    imgRef.current = img;

    const logoW = 200;
    const logoH = 150;

    let animId = 0;
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const p = posRef.current;
      p.x += p.dx;
      p.y += p.dy;

      if (p.x <= 0 || p.x + logoW >= canvas.width) p.dx *= -1;
      if (p.y <= 0 || p.y + logoH >= canvas.height) p.dy *= -1;

      if (imgRef.current && imgRef.current.complete) {
        ctx.drawImage(imgRef.current, p.x, p.y, logoW, logoH);
      }

      animId = requestAnimationFrame(draw);
    };

    // Wait for image to load before starting
    img.onload = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      draw();
    };

    // Start even if image hasn't loaded (will just be black)
    if (img.complete) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      draw();
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

/* ── Main Screensaver Component ── */
export function Screensaver() {
  const screensaver = useDesktopStore((s) => s.screensaver);
  const screensaverTimeout = useDesktopStore((s) => s.screensaverTimeout);
  const screensaverActive = useDesktopStore((s) => s.screensaverActive);
  const setScreensaverActive = useDesktopStore((s) => s.setScreensaverActive);
  const phase = useDesktopStore((s) => s.phase);

  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActive = useRef(false);

  const resetIdleTimer = useCallback(() => {
    // If screensaver is currently active, dismiss it
    if (isActive.current) {
      isActive.current = false;
      setScreensaverActive(false);
      // Don't return - also restart the idle timer
    }

    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
    }

    if (screensaver === '(None)' || phase !== 'desktop') return;

    idleTimer.current = setTimeout(() => {
      isActive.current = true;
      setScreensaverActive(true);
    }, screensaverTimeout * 60 * 1000);
  }, [screensaver, screensaverTimeout, phase, setScreensaverActive]);

  // Set up idle detection
  useEffect(() => {
    if (screensaver === '(None)' || phase !== 'desktop') {
      // Clean up if screensaver is disabled
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
      if (screensaverActive) {
        setScreensaverActive(false);
      }
      return;
    }

    // Start the timer initially
    resetIdleTimer();

    const handleActivity = () => {
      resetIdleTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [screensaver, screensaverTimeout, phase, screensaverActive, setScreensaverActive, resetIdleTimer]);

  if (!screensaverActive || phase !== 'desktop') return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99998,
        background: '#000',
        cursor: 'none',
      }}
    >
      {screensaver === 'Starfield' && <StarfieldRenderer />}
      {screensaver === 'Matrix' && <MatrixRenderer />}
      {screensaver === 'Maze' && <MazeRenderer />}
      {screensaver === 'Flying Windows' && <FlyingWindowsRenderer />}
      {screensaver === 'Energy Star' && <EnergyStarRenderer />}
    </div>
  );
}
