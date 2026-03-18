import { useState, useCallback } from 'react';

/* ── Constants ── */
const ROWS = 9;
const COLS = 9;
const MINES = 10;

type CellState = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

type GameStatus = 'playing' | 'won' | 'lost';

function createBoard(): CellState[][] {
  const board: CellState[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  );
  // Place mines
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r]![c]!.mine) {
      board[r]![c]!.mine = true;
      placed++;
    }
  }
  // Count adjacents
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r]![c]!.mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr]![nc]!.mine) count++;
        }
      }
      board[r]![c]!.adjacent = count;
    }
  }
  return board;
}

function cloneBoard(board: CellState[][]): CellState[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function revealCell(board: CellState[][], r: number, c: number): void {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
  const cell = board[r]![c]!;
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  if (cell.adjacent === 0 && !cell.mine) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr !== 0 || dc !== 0) revealCell(board, r + dr, c + dc);
      }
    }
  }
}

function checkWin(board: CellState[][]): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r]![c]!;
      if (!cell.mine && !cell.revealed) return false;
    }
  }
  return true;
}

const NUMBER_COLORS: Record<number, string> = {
  1: '#0000FF',
  2: '#008000',
  3: '#FF0000',
  4: '#000080',
  5: '#800000',
  6: '#008080',
  7: '#000000',
  8: '#808080',
};

/* ── SVG Icons ── */
const MineSVG = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    {/* Spikes */}
    <rect x="7" y="0" width="2" height="4" fill="#000" />
    <rect x="7" y="12" width="2" height="4" fill="#000" />
    <rect x="0" y="7" width="4" height="2" fill="#000" />
    <rect x="12" y="7" width="4" height="2" fill="#000" />
    {/* Diagonal spikes */}
    <rect x="2" y="2" width="3" height="1.5" fill="#000" transform="rotate(45 3.5 2.75)" />
    <rect x="11" y="2" width="3" height="1.5" fill="#000" transform="rotate(-45 12.5 2.75)" />
    <rect x="2" y="12" width="3" height="1.5" fill="#000" transform="rotate(-45 3.5 12.75)" />
    <rect x="11" y="12" width="3" height="1.5" fill="#000" transform="rotate(45 12.5 12.75)" />
    {/* Body */}
    <circle cx="8" cy="8" r="5" fill="#000" />
    {/* Shine */}
    <circle cx="6" cy="6" r="1.5" fill="#fff" />
  </svg>
);

const FlagSVG = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    {/* Pole */}
    <rect x="5" y="2" width="1.5" height="12" fill="#000" />
    {/* Flag */}
    <polygon points="7,2 14,5 7,8" fill="#FF0000" />
    {/* Base */}
    <rect x="3" y="13" width="7" height="1.5" rx="0.5" fill="#000" />
  </svg>
);

const SmileyFace = ({ status, pressed }: { status: GameStatus; pressed: boolean }) => {
  const size = 22;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {/* Face circle */}
      <circle cx="12" cy="12" r="11" fill="#FFD700" stroke="#000" strokeWidth="1" />
      {status === 'lost' ? (
        <>
          {/* X eyes */}
          <line x1="6" y1="7" x2="10" y2="11" stroke="#000" strokeWidth="1.5" />
          <line x1="10" y1="7" x2="6" y2="11" stroke="#000" strokeWidth="1.5" />
          <line x1="14" y1="7" x2="18" y2="11" stroke="#000" strokeWidth="1.5" />
          <line x1="18" y1="7" x2="14" y2="11" stroke="#000" strokeWidth="1.5" />
          {/* Frown */}
          <path d="M7 18 Q12 14 17 18" fill="none" stroke="#000" strokeWidth="1.5" />
        </>
      ) : status === 'won' ? (
        <>
          {/* Sunglasses */}
          <rect x="4" y="7" width="7" height="4" rx="1" fill="#000" />
          <rect x="13" y="7" width="7" height="4" rx="1" fill="#000" />
          <rect x="11" y="8" width="2" height="1.5" fill="#000" />
          {/* Cool shine */}
          <rect x="5" y="8" width="2" height="1" fill="#444" rx="0.5" />
          <rect x="14" y="8" width="2" height="1" fill="#444" rx="0.5" />
          {/* Grin */}
          <path d="M7 16 Q12 20 17 16" fill="none" stroke="#000" strokeWidth="1.5" />
        </>
      ) : pressed ? (
        <>
          {/* Surprised eyes */}
          <circle cx="8" cy="9" r="2" fill="#000" />
          <circle cx="16" cy="9" r="2" fill="#000" />
          {/* O mouth */}
          <circle cx="12" cy="17" r="2.5" fill="#000" />
        </>
      ) : (
        <>
          {/* Normal eyes */}
          <circle cx="8" cy="9" r="1.5" fill="#000" />
          <circle cx="16" cy="9" r="1.5" fill="#000" />
          {/* Smile */}
          <path d="M7 15 Q12 19 17 15" fill="none" stroke="#000" strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
};

export function Minesweeper() {
  const [board, setBoard] = useState<CellState[][]>(createBoard);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [flagCount, setFlagCount] = useState(0);
  const [facePressed, setFacePressed] = useState(false);
  const [time, setTime] = useState(0);
  const [timerRef] = useState<{ id: ReturnType<typeof setInterval> | null }>({ id: null });
  const [started, setStarted] = useState(false);

  const startTimer = useCallback(() => {
    if (timerRef.id) clearInterval(timerRef.id);
    timerRef.id = setInterval(() => setTime((t) => Math.min(999, t + 1)), 1000);
  }, [timerRef]);

  const resetGame = useCallback(() => {
    if (timerRef.id) clearInterval(timerRef.id);
    timerRef.id = null;
    setBoard(createBoard());
    setStatus('playing');
    setFlagCount(0);
    setTime(0);
    setStarted(false);
  }, [timerRef]);

  const handleClick = (r: number, c: number) => {
    if (status !== 'playing') return;
    const cell = board[r]![c]!;
    if (cell.flagged || cell.revealed) return;

    if (!started) {
      setStarted(true);
      startTimer();
    }

    const next = cloneBoard(board);
    if (next[r]![c]!.mine) {
      // Reveal all mines
      for (let rr = 0; rr < ROWS; rr++) {
        for (let cc = 0; cc < COLS; cc++) {
          if (next[rr]![cc]!.mine) next[rr]![cc]!.revealed = true;
        }
      }
      setBoard(next);
      setStatus('lost');
      if (timerRef.id) clearInterval(timerRef.id);
      return;
    }

    revealCell(next, r, c);
    setBoard(next);

    if (checkWin(next)) {
      setStatus('won');
      if (timerRef.id) clearInterval(timerRef.id);
    }
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status !== 'playing') return;
    const cell = board[r]![c]!;
    if (cell.revealed) return;

    if (!started) {
      setStarted(true);
      startTimer();
    }

    const next = cloneBoard(board);
    next[r]![c]!.flagged = !next[r]![c]!.flagged;
    setBoard(next);
    setFlagCount((prev) => prev + (next[r]![c]!.flagged ? 1 : -1));
  };

  const pad3 = (n: number) => String(Math.max(0, n)).padStart(3, '0');

  return (
    <div style={S.root}>
      {/* Header with counters and face */}
      <div style={S.header}>
        <div style={S.counter}>{pad3(MINES - flagCount)}</div>
        <button
          style={S.faceBtn}
          onClick={resetGame}
          onMouseDown={() => setFacePressed(true)}
          onMouseUp={() => setFacePressed(false)}
          onMouseLeave={() => setFacePressed(false)}
        >
          <SmileyFace status={status} pressed={facePressed} />
        </button>
        <div style={S.counter}>{pad3(time)}</div>
      </div>

      {/* Board */}
      <div
        style={S.board}
        onMouseDown={() => { if (status === 'playing') setFacePressed(true); }}
        onMouseUp={() => setFacePressed(false)}
      >
        {board.map((row, r) => (
          <div key={r} style={S.row}>
            {row.map((cell, c) => {
              let content: React.ReactNode = '';
              let bg = '#C0C0C0';
              let color = '#000';
              let border = '2px outset #FFF';

              if (cell.revealed) {
                border = '1px solid #808080';
                bg = '#C0C0C0';
                if (cell.mine) {
                  content = <MineSVG size={14} />;
                  bg = status === 'lost' ? '#FF0000' : '#C0C0C0';
                } else if (cell.adjacent > 0) {
                  content = String(cell.adjacent);
                  color = NUMBER_COLORS[cell.adjacent] ?? '#000';
                }
              } else if (cell.flagged) {
                content = <FlagSVG size={14} />;
              }

              return (
                <div
                  key={c}
                  style={{
                    ...S.cell,
                    background: bg,
                    color,
                    border,
                    fontWeight: cell.adjacent > 0 ? 'bold' : 'normal',
                  }}
                  onClick={() => handleClick(r, c)}
                  onContextMenu={(e) => handleRightClick(e, r, c)}
                >
                  {content}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: {
    background: '#C0C0C0',
    padding: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    fontFamily: '"MS Sans Serif", Arial, sans-serif',
    userSelect: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '4px 4px',
    background: '#C0C0C0',
    border: '2px inset #808080',
    marginBottom: 4,
  },
  counter: {
    background: '#000',
    color: '#FF0000',
    fontFamily: '"Courier New", monospace',
    fontSize: 20,
    fontWeight: 'bold',
    padding: '2px 4px',
    letterSpacing: 2,
    minWidth: 42,
    textAlign: 'center' as const,
  },
  faceBtn: {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#C0C0C0',
    border: '2px outset #FFF',
    cursor: 'pointer',
    padding: 2,
  },
  board: {
    border: '3px inset #808080',
    display: 'inline-flex',
    flexDirection: 'column' as const,
  },
  row: {
    display: 'flex',
  },
  cell: {
    width: 18,
    height: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    cursor: 'pointer',
    lineHeight: 1,
  },
};

export default Minesweeper;
