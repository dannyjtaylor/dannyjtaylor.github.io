import { useState, useEffect, useRef } from 'react';

/* ── Types ── */
type BattlePhase =
  | 'intro'
  | 'menu'
  | 'fight-aim'
  | 'fight-result'
  | 'act-menu'
  | 'act-result'
  | 'item-menu'
  | 'mercy-menu'
  | 'enemy-turn'
  | 'win'
  | 'game-over';

interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/* ── Constants ── */
const BOX_W = 230;
const BOX_H = 130;
const HEART_SIZE = 12;
const FROGGIT_MAX_HP = 30;
const PLAYER_MAX_HP = 20;

const FLAVOR_TEXTS = [
  "Froggit doesn't seem to know why it's here.",
  'Froggit hops to and fro.',
  "You are intimidated by Froggit's raw strength. Just kidding.",
  'The battlefield is filled with the smell of mustard seed.',
];

const ITEMS = [
  { name: 'Monster Candy', heal: 10 },
  { name: 'Spider Donut', heal: 12 },
];

export function Undertale() {
  /* ── State ── */
  const [phase, setPhase] = useState<BattlePhase>('intro');
  const [menuIdx, setMenuIdx] = useState(0);
  const [actIdx, setActIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const [mercyIdx, setMercyIdx] = useState(0);
  const [dialogText, setDialogText] = useState('* Froggit attacks you!');
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [froggitHp, setFroggitHp] = useState(FROGGIT_MAX_HP);
  const [froggitSpare, setFroggitSpare] = useState(false);
  const [fightBarX, setFightBarX] = useState(0);
  const [lastDamage, setLastDamage] = useState(0);

  // Dodge phase
  const [heartX, setHeartX] = useState(BOX_W / 2);
  const [heartY, setHeartY] = useState(BOX_H / 2);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [dodgeTimer, setDodgeTimer] = useState(0);
  const keysRef = useRef<Set<string>>(new Set());
  const animRef = useRef(0);
  const projIdRef = useRef(0);

  // Refs to avoid stale closures in keyboard handler
  const phaseRef = useRef(phase);
  const menuIdxRef = useRef(menuIdx);
  const actIdxRef = useRef(actIdx);
  const itemIdxRef = useRef(itemIdx);
  const mercyIdxRef = useRef(mercyIdx);
  const fightBarXRef = useRef(fightBarX);
  const froggitSpareRef = useRef(froggitSpare);
  const playerHpRef = useRef(playerHp);

  phaseRef.current = phase;
  menuIdxRef.current = menuIdx;
  actIdxRef.current = actIdx;
  itemIdxRef.current = itemIdx;
  mercyIdxRef.current = mercyIdx;
  fightBarXRef.current = fightBarX;
  froggitSpareRef.current = froggitSpare;
  playerHpRef.current = playerHp;

  /* ── Action handlers ── */
  const doMenuSelect = (idx: number) => {
    if (idx === 0) { setPhase('fight-aim'); setFightBarX(0); }
    if (idx === 1) { setPhase('act-menu'); setActIdx(0); }
    if (idx === 2) { setPhase('item-menu'); setItemIdx(0); }
    if (idx === 3) { setPhase('mercy-menu'); setMercyIdx(0); }
  };

  const doActSelect = (idx: number) => {
    if (idx === 0) {
      setDialogText('* FROGGIT - ATK 4  DEF 5\n* Life is difficult for this enemy.');
      setPhase('act-result');
    } else if (idx === 1) {
      setDialogText("* Froggit didn't understand what\n  you said, but was flattered anyway.");
      setFroggitSpare(true);
      setPhase('act-result');
    } else {
      setDialogText("* Froggit didn't understand what\n  you said, but was scared anyway.");
      setFroggitSpare(true);
      setPhase('act-result');
    }
  };

  const doItemSelect = (idx: number) => {
    const item = ITEMS[idx]!;
    const healed = Math.min(item.heal, PLAYER_MAX_HP - playerHpRef.current);
    setPlayerHp((hp) => Math.min(PLAYER_MAX_HP, hp + item.heal));
    setDialogText(`* You ate the ${item.name}.\n* You recovered ${healed} HP!`);
    setPhase('act-result');
  };

  const doMercySelect = (idx: number) => {
    if (idx === 0) {
      if (froggitSpareRef.current) {
        setDialogText('* You spared Froggit.\n* YOU WON!\n* You earned 0 EXP and 2 gold.');
        setPhase('win');
        return;
      }
      setDialogText("* Froggit doesn't want to be\n  spared yet.");
      setPhase('act-result');
    } else {
      setDialogText('* You fled from the battle.');
      setPhase('win');
    }
  };

  const doFightConfirm = () => {
    const barX = fightBarXRef.current;
    const accuracy = 1 - Math.abs(barX - 50) / 50;
    const dmg = Math.max(1, Math.round(accuracy * 18 + Math.random() * 4));
    setLastDamage(dmg);
    setFroggitHp((hp) => {
      const next = Math.max(0, hp - dmg);
      if (next <= 0) {
        setDialogText('* You defeated Froggit!\n* YOU WON!\n* You earned 3 EXP and 2 gold.');
        setTimeout(() => setPhase('win'), 600);
      } else {
        setPhase('fight-result');
        setDialogText(`* ${dmg} damage!`);
      }
      return next;
    });
  };

  const startEnemyTurn = () => {
    setPhase('enemy-turn');
    setHeartX(BOX_W / 2);
    setHeartY(BOX_H - 20);
    setProjectiles([]);
    setDodgeTimer(0);
    setDialogText('');
  };

  const advanceDialog = () => {
    const p = phaseRef.current;
    if (p === 'intro') {
      setPhase('menu');
      setDialogText(FLAVOR_TEXTS[Math.floor(Math.random() * FLAVOR_TEXTS.length)]!);
    } else if (p === 'fight-result' || p === 'act-result') {
      startEnemyTurn();
    }
  };

  /* ── Keyboard input ── */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      const p = phaseRef.current;
      const isConfirm = e.key === 'z' || e.key === 'Z' || e.key === 'Enter';
      const isBack = e.key === 'x' || e.key === 'X' || e.key === 'Escape';

      if (p === 'menu') {
        if (e.key === 'ArrowLeft') setMenuIdx((i) => Math.max(0, i - 1));
        if (e.key === 'ArrowRight') setMenuIdx((i) => Math.min(3, i + 1));
        if (isConfirm) doMenuSelect(menuIdxRef.current);
      }
      if (p === 'act-menu') {
        if (e.key === 'ArrowUp') setActIdx((i) => Math.max(0, i - 1));
        if (e.key === 'ArrowDown') setActIdx((i) => Math.min(2, i + 1));
        if (isConfirm) doActSelect(actIdxRef.current);
        if (isBack) setPhase('menu');
      }
      if (p === 'item-menu') {
        if (e.key === 'ArrowUp') setItemIdx((i) => Math.max(0, i - 1));
        if (e.key === 'ArrowDown') setItemIdx((i) => Math.min(ITEMS.length - 1, i + 1));
        if (isConfirm) doItemSelect(itemIdxRef.current);
        if (isBack) setPhase('menu');
      }
      if (p === 'mercy-menu') {
        if (e.key === 'ArrowUp') setMercyIdx((i) => Math.max(0, i - 1));
        if (e.key === 'ArrowDown') setMercyIdx((i) => Math.min(1, i + 1));
        if (isConfirm) doMercySelect(mercyIdxRef.current);
        if (isBack) setPhase('menu');
      }
      if (p === 'fight-aim' && isConfirm) doFightConfirm();
      if ((p === 'intro' || p === 'fight-result' || p === 'act-result') && isConfirm) advanceDialog();
    };
    const up = (e: KeyboardEvent) => { keysRef.current.delete(e.key); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Fight aim animation ── */
  useEffect(() => {
    if (phase !== 'fight-aim') return;
    let x = 0;
    let dir = 1;
    const iv = setInterval(() => {
      x += dir * 3;
      if (x >= 100) { x = 100; dir = -1; }
      if (x <= 0) { x = 0; dir = 1; }
      setFightBarX(x);
    }, 16);
    return () => clearInterval(iv);
  }, [phase]);

  /* ── Enemy turn (dodge phase) ── */
  useEffect(() => {
    if (phase !== 'enemy-turn') return;
    let elapsed = 0;
    let spawnTimer = 0;

    const step = () => {
      elapsed += 16;
      spawnTimer += 16;

      if (spawnTimer > 500 && elapsed < 3500) {
        spawnTimer = 0;
        const id = ++projIdRef.current;
        setProjectiles((prev) => [
          ...prev,
          {
            id,
            x: 20 + Math.random() * (BOX_W - 40),
            y: -8,
            vx: (Math.random() - 0.5) * 0.8,
            vy: 1.2 + Math.random() * 0.6,
          },
        ]);
      }

      const keys = keysRef.current;
      setHeartX((hx) => {
        let nx = hx;
        if (keys.has('ArrowLeft')) nx -= 2.5;
        if (keys.has('ArrowRight')) nx += 2.5;
        return Math.max(HEART_SIZE / 2, Math.min(BOX_W - HEART_SIZE / 2, nx));
      });
      setHeartY((hy) => {
        let ny = hy;
        if (keys.has('ArrowUp')) ny -= 2.5;
        if (keys.has('ArrowDown')) ny += 2.5;
        return Math.max(HEART_SIZE / 2, Math.min(BOX_H - HEART_SIZE / 2, ny));
      });

      setProjectiles((prev) =>
        prev
          .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy }))
          .filter((p) => p.y < BOX_H + 10),
      );

      setDodgeTimer(elapsed);

      if (elapsed >= 4000) {
        setProjectiles([]);
        setDialogText(FLAVOR_TEXTS[Math.floor(Math.random() * FLAVOR_TEXTS.length)]!);
        setPhase('menu');
        return;
      }

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  /* ── Collision detection ── */
  useEffect(() => {
    if (phase !== 'enemy-turn') return;
    for (const p of projectiles) {
      const dx = p.x - heartX;
      const dy = p.y - heartY;
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
        setPlayerHp((hp) => {
          const next = Math.max(0, hp - 3);
          if (next <= 0) {
            setPhase('game-over');
            setDialogText('* You were slain by Froggit...');
          }
          return next;
        });
        setProjectiles((prev) => prev.filter((pp) => pp.id !== p.id));
        break;
      }
    }
  }, [projectiles, heartX, heartY, phase]);

  /* ── Render Froggit ── */
  const renderFroggit = () => {
    const alive = froggitHp > 0 && phase !== 'win';
    return (
      <svg width={50} height={46} style={{ opacity: alive ? 1 : 0.3, imageRendering: 'pixelated' }}>
        {/* Body */}
        <rect x={10} y={8} width={30} height={24} rx={6} fill="#fff" />
        {/* Eyes (under body — Froggit's defining trait) */}
        <circle cx={16} cy={34} r={4} fill="#fff" stroke="#000" strokeWidth={1} />
        <circle cx={34} cy={34} r={4} fill="#fff" stroke="#000" strokeWidth={1} />
        <circle cx={16} cy={35} r={1.5} fill="#000" />
        <circle cx={34} cy={35} r={1.5} fill="#000" />
        {/* Legs */}
        <rect x={8} y={30} width={8} height={6} rx={2} fill="#fff" />
        <rect x={34} y={30} width={8} height={6} rx={2} fill="#fff" />
        {/* Top bumps */}
        <circle cx={18} cy={8} r={4} fill="#fff" />
        <circle cx={32} cy={8} r={4} fill="#fff" />
        {/* Mouth */}
        <ellipse cx={25} cy={24} rx={4} ry={2} fill="none" stroke="#000" strokeWidth={1} />
        {/* Damage number */}
        {phase === 'fight-result' && lastDamage > 0 && (
          <text x={25} y={6} textAnchor="middle" fill="#FF0000" fontSize={12} fontWeight="bold"
            fontFamily="var(--font-terminal)">{lastDamage}</text>
        )}
      </svg>
    );
  };

  const menuBtns = ['FIGHT', 'ACT', 'ITEM', 'MERCY'];

  /* ── Styles ── */
  const S: Record<string, React.CSSProperties> = {
    root: { width: '100%', height: '100%', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: '"Courier New", monospace', fontSize: 14, overflow: 'hidden', userSelect: 'none', outline: 'none' },
    top: { width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 0 },
    dialog: { width: BOX_W, padding: '4px 0', fontSize: 13, whiteSpace: 'pre-wrap' as const, lineHeight: 1.4, minHeight: 36 },
    box: { width: BOX_W, height: BOX_H, border: '3px solid #fff', position: 'relative' as const, overflow: 'hidden', background: '#000' },
    bottom: { width: BOX_W + 20, padding: '6px 0', display: 'flex', flexDirection: 'column' as const, gap: 4 },
    hpRow: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 },
    hpBar: { width: 80, height: 10, background: '#600', position: 'relative' as const },
    hpFill: { height: '100%', background: '#FF0', transition: 'width 0.3s' },
    menuRow: { display: 'flex', gap: 4, justifyContent: 'space-between' },
    menuBtn: { flex: 1, padding: '4px 2px', textAlign: 'center' as const, fontSize: 12, fontWeight: 'bold', cursor: 'pointer', fontFamily: '"Courier New", monospace', border: '2px solid #fff', background: '#000', color: '#fff' },
    menuBtnActive: { background: '#FF6600', color: '#000' },
    subMenu: { padding: '4px 8px', fontSize: 12, lineHeight: 1.8 },
    fightBar: { width: BOX_W - 20, height: 16, background: '#333', margin: '0 auto', position: 'relative' as const },
  };

  /* ── Game Over ── */
  if (phase === 'game-over') {
    return (
      <div style={S.root} tabIndex={0}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#FF0000' }}>GAME OVER</div>
          <div style={{ fontSize: 12, color: '#888' }}>Stay determined...</div>
          <button
            style={{ ...S.menuBtn, ...S.menuBtnActive, width: 120, marginTop: 8 }}
            onClick={() => {
              setPlayerHp(PLAYER_MAX_HP);
              setFroggitHp(FROGGIT_MAX_HP);
              setFroggitSpare(false);
              setPhase('intro');
              setDialogText('* Froggit attacks you!');
              setMenuIdx(0);
            }}
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  /* ── Win Screen ── */
  if (phase === 'win') {
    return (
      <div style={S.root} tabIndex={0}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ whiteSpace: 'pre-wrap', textAlign: 'center', lineHeight: 1.6 }}>{dialogText}</div>
          <button
            style={{ ...S.menuBtn, ...S.menuBtnActive, width: 140, marginTop: 12 }}
            onClick={() => {
              setPlayerHp(PLAYER_MAX_HP);
              setFroggitHp(FROGGIT_MAX_HP);
              setFroggitSpare(false);
              setPhase('intro');
              setDialogText('* Froggit attacks you!');
              setMenuIdx(0);
            }}
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  /* ── Main battle screen ── */
  return (
    <div style={S.root} tabIndex={0}>
      <div style={S.top}>
        {/* Froggit sprite */}
        {renderFroggit()}

        {/* HP bar for Froggit */}
        {phase !== 'enemy-turn' && (
          <div style={{ width: 60, height: 4, background: '#600', marginBottom: 2 }}>
            <div style={{ width: `${(froggitHp / FROGGIT_MAX_HP) * 100}%`, height: '100%', background: '#0F0', transition: 'width 0.3s' }} />
          </div>
        )}

        {/* Dialog text */}
        <div style={S.dialog}>
          {phase === 'intro' || phase === 'fight-result' || phase === 'act-result'
            ? <>{dialogText}<br /><span style={{ color: '#888', fontSize: 10 }}>[Z] to continue</span></>
            : phase === 'menu'
            ? <>* {dialogText}</>
            : null}
        </div>

        {/* Battle box */}
        <div style={S.box}>
          {/* Fight timing bar */}
          {phase === 'fight-aim' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={S.fightBar}>
                <div style={{ position: 'absolute', left: '45%', width: '10%', height: '100%', background: '#0F04' }} />
                <div style={{
                  position: 'absolute',
                  left: `${fightBarX}%`, top: 0,
                  width: 3, height: '100%', background: '#fff',
                }} />
              </div>
              <div style={{ position: 'absolute', bottom: 6, color: '#888', fontSize: 10 }}>[Z] to strike!</div>
            </div>
          )}

          {/* ACT submenu */}
          {phase === 'act-menu' && (
            <div style={S.subMenu}>
              {['Check', 'Compliment', 'Threaten'].map((opt, i) => (
                <div key={opt} style={{ display: 'flex', gap: 6, cursor: 'pointer' }}
                  onClick={() => doActSelect(i)}>
                  <span style={{ color: actIdx === i ? '#FF0' : 'transparent', width: 12 }}>
                    {actIdx === i ? '\u2764' : ''}
                  </span>
                  <span>{opt}</span>
                </div>
              ))}
              <div style={{ color: '#555', fontSize: 9, marginTop: 4 }}>[X] back</div>
            </div>
          )}

          {/* ITEM submenu */}
          {phase === 'item-menu' && (
            <div style={S.subMenu}>
              {ITEMS.map((it, i) => (
                <div key={it.name} style={{ display: 'flex', gap: 6, cursor: 'pointer' }}
                  onClick={() => doItemSelect(i)}>
                  <span style={{ color: itemIdx === i ? '#FF0' : 'transparent', width: 12 }}>
                    {itemIdx === i ? '\u2764' : ''}
                  </span>
                  <span>{it.name}</span>
                </div>
              ))}
              <div style={{ color: '#555', fontSize: 9, marginTop: 4 }}>[X] back</div>
            </div>
          )}

          {/* MERCY submenu */}
          {phase === 'mercy-menu' && (
            <div style={S.subMenu}>
              {['Spare', 'Flee'].map((opt, i) => (
                <div key={opt} style={{ display: 'flex', gap: 6, cursor: 'pointer' }}
                  onClick={() => doMercySelect(i)}>
                  <span style={{ color: mercyIdx === i ? '#FF0' : 'transparent', width: 12 }}>
                    {mercyIdx === i ? '\u2764' : ''}
                  </span>
                  <span style={{ color: i === 0 && froggitSpare ? '#FF0' : '#fff' }}>{opt}</span>
                </div>
              ))}
              <div style={{ color: '#555', fontSize: 9, marginTop: 4 }}>[X] back</div>
            </div>
          )}

          {/* Enemy turn — dodging */}
          {phase === 'enemy-turn' && (
            <>
              {/* Player heart */}
              <div style={{
                position: 'absolute',
                left: heartX - HEART_SIZE / 2,
                top: heartY - HEART_SIZE / 2,
              }}>
                <svg width={HEART_SIZE} height={HEART_SIZE} viewBox="0 0 12 12">
                  <path d="M6 10 L1 5 Q0 3 2 2 Q4 1 6 4 Q8 1 10 2 Q12 3 11 5 Z" fill="#FF0000" />
                </svg>
              </div>

              {/* Projectiles (white flies) */}
              {projectiles.map((p) => (
                <div
                  key={p.id}
                  style={{
                    position: 'absolute',
                    left: p.x - 4,
                    top: p.y - 3,
                    width: 8,
                    height: 6,
                    pointerEvents: 'none',
                  }}
                >
                  <svg width={8} height={6} viewBox="0 0 8 6">
                    <ellipse cx={4} cy={3} rx={3} ry={2.5} fill="#fff" />
                    <line x1={1} y1={0} x2={3} y2={2} stroke="#fff" strokeWidth={0.5} />
                    <line x1={7} y1={0} x2={5} y2={2} stroke="#fff" strokeWidth={0.5} />
                  </svg>
                </div>
              ))}

              {/* Dodge instructions */}
              <div style={{ position: 'absolute', top: 2, left: 6, color: '#555', fontSize: 9 }}>
                Arrow keys to dodge!
              </div>

              {/* Timer indicator */}
              <div style={{
                position: 'absolute', bottom: 2, left: 4, right: 4, height: 2, background: '#333',
              }}>
                <div style={{ width: `${Math.min(100, (dodgeTimer / 4000) * 100)}%`, height: '100%', background: '#666' }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={S.bottom}>
        <div style={S.hpRow}>
          <span>CHARA</span>
          <span style={{ color: '#FF0' }}>LV 1</span>
          <span>HP</span>
          <div style={S.hpBar}>
            <div style={{ ...S.hpFill, width: `${(playerHp / PLAYER_MAX_HP) * 100}%` }} />
          </div>
          <span>{playerHp} / {PLAYER_MAX_HP}</span>
        </div>
        <div style={S.menuRow}>
          {menuBtns.map((btn, i) => (
            <div
              key={btn}
              style={{
                ...S.menuBtn,
                ...(phase === 'menu' && menuIdx === i ? S.menuBtnActive : {}),
              }}
              onClick={() => { if (phase === 'menu') { setMenuIdx(i); doMenuSelect(i); } }}
            >
              {btn}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
