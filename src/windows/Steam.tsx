import { useState } from 'react';
import { useDesktopStore } from '../stores/desktopStore';

/* ─── Game SVG Icons ─── */
function GameIcon({ gameId }: { gameId: string }) {
  switch (gameId) {
    case 'valorant':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="7" cy="7" r="6" stroke="#ff4655" strokeWidth="1.5" fill="none" />
          <circle cx="7" cy="7" r="2" fill="#ff4655" />
          <line x1="7" y1="0.5" x2="7" y2="3.5" stroke="#ff4655" strokeWidth="1" />
          <line x1="7" y1="10.5" x2="7" y2="13.5" stroke="#ff4655" strokeWidth="1" />
          <line x1="0.5" y1="7" x2="3.5" y2="7" stroke="#ff4655" strokeWidth="1" />
          <line x1="10.5" y1="7" x2="13.5" y2="7" stroke="#ff4655" strokeWidth="1" />
        </svg>
      );
    case 'undertale':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M7 12 L1.5 5.5 C0.5 3.5 1 1.5 3.5 1.5 C5.5 1.5 7 4 7 4 C7 4 8.5 1.5 10.5 1.5 C13 1.5 13.5 3.5 12.5 5.5 Z" fill="#ff4655" />
        </svg>
      );
    case 'cavestory':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <rect x="6" y="1" width="2" height="10" fill="#4a9eff" />
          <rect x="4" y="1" width="6" height="2" fill="#4a9eff" />
          <rect x="5" y="11" width="4" height="2" fill="#4a9eff" />
          <rect x="3" y="12" width="8" height="1" fill="#4a9eff" />
        </svg>
      );
    case 'cookieclicker':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="7" cy="7" r="6" fill="#c89632" stroke="#7a5a2a" strokeWidth="0.8" />
          <circle cx="4.5" cy="5" r="1.2" fill="#5a3a1a" />
          <circle cx="8.5" cy="4.5" r="1" fill="#5a3a1a" />
          <circle cx="6" cy="8.5" r="1.1" fill="#5a3a1a" />
          <circle cx="9.5" cy="8" r="0.9" fill="#5a3a1a" />
          <circle cx="5" cy="11" r="0.8" fill="#5a3a1a" />
        </svg>
      );
    case 'halflife3':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <text x="2" y="12" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#ff9900">λ</text>
        </svg>
      );
    default:
      return null;
  }
}

/* ─── Achievement SVG Icons ─── */
type AchievementIconId = 'target' | 'star' | 'diamond' | 'fire' | 'trophy' | 'heart-yellow' | 'heart-red' | 'heart-dark' | 'heart-double' | 'star-glow' | 'sparkle' | 'lightning' | 'skull' | 'ribbon' | 'timer' | 'question';

function AchievementIcon({ icon, color }: { icon: AchievementIconId; color: string }) {
  const s = { flexShrink: 0 as const, display: 'block' as const };
  switch (icon) {
    case 'target':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.2" />
          <circle cx="7" cy="7" r="3" stroke={color} strokeWidth="1" />
          <circle cx="7" cy="7" r="1" fill={color} />
        </svg>
      );
    case 'star':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <path d="M7 1.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6L7 9.7 3.8 11.4l.6-3.6L1.8 5.3l3.6-.5z" fill={color} />
        </svg>
      );
    case 'diamond':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <path d="M7 1L12.5 5.5L7 13L1.5 5.5Z" fill={color} />
          <path d="M1.5 5.5H12.5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          <path d="M7 1L5 5.5L7 13L9 5.5Z" fill="rgba(255,255,255,0.15)" />
        </svg>
      );
    case 'fire':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <path d="M7 1C7 1 4 4.5 4 7.5C4 9.5 5.3 11.5 7 12.5C8.7 11.5 10 9.5 10 7.5C10 4.5 7 1 7 1Z" fill={color} />
          <path d="M7 5C7 5 5.5 7 5.5 8.5C5.5 9.6 6.2 10.5 7 11C7.8 10.5 8.5 9.6 8.5 8.5C8.5 7 7 5 7 5Z" fill="#ffdd57" />
        </svg>
      );
    case 'trophy':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <path d="M4 2H10V6C10 8.2 8.7 9.5 7 9.5C5.3 9.5 4 8.2 4 6Z" fill={color} />
          <path d="M4 3H2.5C2 3 1.5 3.5 1.5 4V5C1.5 6 2.2 6.5 3 6.5H4" stroke={color} strokeWidth="1" />
          <path d="M10 3H11.5C12 3 12.5 3.5 12.5 4V5C12.5 6 11.8 6.5 11 6.5H10" stroke={color} strokeWidth="1" />
          <rect x="6" y="9.5" width="2" height="2" fill={color} />
          <rect x="4.5" y="11.5" width="5" height="1.5" rx="0.5" fill={color} />
        </svg>
      );
    case 'heart-yellow':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <path d="M7 12L1.5 6.5C0.5 4.5 1 2.5 3.5 2.5C5.5 2.5 7 5 7 5C7 5 8.5 2.5 10.5 2.5C13 2.5 13.5 4.5 12.5 6.5Z" fill="#ffdd57" />
        </svg>
      );
    case 'heart-red':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <path d="M7 12L1.5 6.5C0.5 4.5 1 2.5 3.5 2.5C5.5 2.5 7 5 7 5C7 5 8.5 2.5 10.5 2.5C13 2.5 13.5 4.5 12.5 6.5Z" fill="#ff4655" />
        </svg>
      );
    case 'heart-dark':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <path d="M7 12L1.5 6.5C0.5 4.5 1 2.5 3.5 2.5C5.5 2.5 7 5 7 5C7 5 8.5 2.5 10.5 2.5C13 2.5 13.5 4.5 12.5 6.5Z" fill="#555" />
        </svg>
      );
    case 'heart-double':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <path d="M5.5 10L1 5.5C0.2 4 0.6 2.5 2.5 2.5C4 2.5 5.5 4.5 5.5 4.5C5.5 4.5 7 2.5 8.5 2.5C10.4 2.5 10.8 4 10 5.5Z" fill="#ff8fba" opacity="0.7" />
          <path d="M8.5 12L4 7.5C3.2 6 3.6 4.5 5.5 4.5C7 4.5 8.5 6.5 8.5 6.5C8.5 6.5 10 4.5 11.5 4.5C13.4 4.5 13.8 6 13 7.5Z" fill="#ff69b4" />
        </svg>
      );
    case 'star-glow':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <path d="M7 1.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6L7 9.7 3.8 11.4l.6-3.6L1.8 5.3l3.6-.5z" fill={color} />
          <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="0.5" opacity="0.4" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <path d="M7 0.5L8 5.5L13 7L8 8.5L7 13.5L6 8.5L1 7L6 5.5Z" fill={color} />
          <path d="M11 1.5L11.5 3.5L13.5 4L11.5 4.5L11 6.5L10.5 4.5L8.5 4L10.5 3.5Z" fill={color} opacity="0.6" />
        </svg>
      );
    case 'lightning':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <path d="M8.5 1L4 7.5H7L5.5 13L10 6.5H7Z" fill={color} />
        </svg>
      );
    case 'skull':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <path d="M7 1C4 1 2 3.5 2 6C2 8 3 9.5 4.5 10.5V12.5H5.5V11H6.5V12.5H7.5V11H8.5V12.5H9.5V10.5C11 9.5 12 8 12 6C12 3.5 10 1 7 1Z" fill={color} />
          <circle cx="5" cy="6" r="1.2" fill="#1b2838" />
          <circle cx="9" cy="6" r="1.2" fill="#1b2838" />
          <path d="M5.5 9H8.5" stroke="#1b2838" strokeWidth="0.8" />
          <path d="M6.5 8.5V9.5M7.5 8.5V9.5" stroke="#1b2838" strokeWidth="0.6" />
        </svg>
      );
    case 'ribbon':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <path d="M7 2C5.5 2 4.5 3 4.5 4.5C4.5 6 5.5 7 7 7C8.5 7 9.5 6 9.5 4.5C9.5 3 8.5 2 7 2Z" fill={color} />
          <path d="M5 6.5L3 12L5.5 10L7 12.5L8.5 10L11 12L9 6.5" fill={color} />
        </svg>
      );
    case 'timer':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <circle cx="7" cy="7.5" r="5" stroke={color} strokeWidth="1.2" />
          <path d="M7 4.5V7.5L9 9.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
          <rect x="5.5" y="1" width="3" height="1.5" rx="0.5" fill={color} />
          <path d="M10 3.5L11 2.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case 'question':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={s}>
          <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.2" />
          <path d="M5 5.5C5 4 6 3.5 7 3.5C8 3.5 9 4 9 5.2C9 6.2 8 6.5 7 7V8" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <circle cx="7" cy="10" r="0.8" fill={color} />
        </svg>
      );
  }
}

/* ─── Game data ─── */
interface SteamGame {
  id: string;
  title: string;
  developer: string;
  size: string;
  installed: boolean;
  lastPlayed?: string;
  hours: number;
  description: string;
  windowId?: string;
  tags: string[];
  boxArt?: string;
  bgImage?: string;
}

interface Achievement {
  name: string;
  description: string;
  unlocked: boolean;
  icon: AchievementIconId;
}

const GAME_ACHIEVEMENTS: Record<string, Achievement[]> = {
  valorant: [
    { name: 'First Blood', description: 'Get your first kill', unlocked: true, icon: 'target' },
    { name: 'Ace', description: 'Kill all 5 enemies in a round', unlocked: true, icon: 'star' },
    { name: 'Radiant', description: 'Reach Radiant rank', unlocked: false, icon: 'diamond' },
    { name: 'Clutch Master', description: 'Win a 1v5 clutch', unlocked: true, icon: 'fire' },
    { name: 'Agent Expert', description: 'Master all agents', unlocked: false, icon: 'trophy' },
  ],
  undertale: [
    { name: 'Pacifist', description: 'Complete True Pacifist route', unlocked: true, icon: 'heart-yellow' },
    { name: 'Determined', description: 'Die and come back 10 times', unlocked: true, icon: 'heart-red' },
    { name: 'Genocide', description: 'Complete Genocide route', unlocked: false, icon: 'heart-dark' },
    { name: 'Date Night', description: 'Complete all dates', unlocked: true, icon: 'heart-double' },
    { name: 'Spare Everyone', description: 'Never kill a single monster', unlocked: true, icon: 'star-glow' },
  ],
  cavestory: [
    { name: 'Best Ending', description: 'Get the best ending', unlocked: true, icon: 'sparkle' },
    { name: 'Polar Star', description: 'Keep the Polar Star to the end', unlocked: false, icon: 'lightning' },
    { name: 'Sacred Grounds', description: 'Complete Sacred Grounds', unlocked: false, icon: 'skull' },
    { name: 'Curly Story', description: 'Complete Curly Story mode', unlocked: true, icon: 'ribbon' },
    { name: 'Speed Run', description: 'Beat the game in under 1 hour', unlocked: false, icon: 'timer' },
  ],
  cookieclicker: [
    { name: 'Wake and Bake', description: 'Bake your first cookie', unlocked: true, icon: 'star' },
    { name: 'Cookie Monster', description: 'Bake 10,000 cookies per second', unlocked: true, icon: 'fire' },
    { name: 'Mass Production', description: 'Bake 1 million cookies per second', unlocked: false, icon: 'lightning' },
    { name: 'Cosmic Bakery', description: 'Bake 1 trillion cookies total', unlocked: false, icon: 'diamond' },
    { name: 'Neverclick', description: 'Reach 1 million cookies without clicking', unlocked: false, icon: 'skull' },
    { name: 'Frenzy', description: 'Activate a golden cookie frenzy', unlocked: true, icon: 'sparkle' },
    { name: 'Quincentennial', description: 'Own 500 buildings', unlocked: false, icon: 'trophy' },
    { name: 'Speed Baking III', description: 'Bake 1M cookies in 15 minutes', unlocked: false, icon: 'timer' },
  ],
  halflife3: [
    { name: '???', description: 'Game not released yet', unlocked: false, icon: 'question' },
    { name: '???', description: 'Game not released yet', unlocked: false, icon: 'question' },
    { name: '???', description: 'Game not released yet', unlocked: false, icon: 'question' },
  ],
};

const GAMES: SteamGame[] = [
  {
    id: 'valorant',
    title: 'VALORANT',
    developer: 'Riot Games',
    size: '22.5 GB',
    installed: true,
    lastPlayed: 'Today',
    hours: 1337,
    description: 'A 5v5 character-based tactical FPS where precise gunplay meets unique agent abilities.',
    windowId: 'valorant',
    tags: ['FPS', 'Competitive', 'Multiplayer'],
    boxArt: '/art/valorant_box.png',
    bgImage: '/art/valorant_bg.png',
  },
  {
    id: 'undertale',
    title: 'UNDERTALE',
    developer: 'Toby Fox',
    size: '200 MB',
    installed: true,
    lastPlayed: 'Yesterday',
    hours: 42,
    description: 'A friendly RPG where nobody has to die. Explore the underground and meet a cast of unforgettable characters.',
    windowId: 'undertale',
    tags: ['RPG', 'Indie', 'Story Rich'],
    boxArt: '/art/undertale_box.png',
    bgImage: '/art/undertale_bg.png',
  },
  {
    id: 'cavestory',
    title: 'Cave Story+',
    developer: 'Studio Pixel',
    size: '85 MB',
    installed: true,
    lastPlayed: 'Last week',
    hours: 28,
    description: 'A freeware side-scrolling platformer. Explore a vast cave system, fight monsters and uncover the mysteries within.',
    windowId: 'cavestory',
    tags: ['Platformer', 'Indie', 'Action'],
    boxArt: '/art/cavestory_box.png',
    bgImage: '/art/cavestory_bg.png',
  },
  {
    id: 'cookieclicker',
    title: 'Cookie Clicker',
    developer: 'Orteil',
    size: '2.4 MB',
    installed: true,
    lastPlayed: 'Today',
    hours: 9999,
    description: 'Bake cookies by clicking a giant cookie. Use your cookies to buy upgrades, buildings, and more in this classic idle game.',
    windowId: 'cookieclicker',
    tags: ['Idle', 'Clicker', 'Casual'],
  },
  {
    id: 'halflife3',
    title: 'Half-Life 3',
    developer: 'Valve',
    size: '??? GB',
    installed: false,
    hours: 0,
    description: 'Coming soon... probably... maybe... one day...',
    tags: ['FPS', 'Sci-Fi', 'Wishlist'],
    boxArt: '/art/halflife3_box.png',
  },
];

type SteamTab = 'Library' | 'Store' | 'Community' | 'Profile';

/* ─── Inline style helpers ─── */
const steamDark = '#1b2838';
const steamDarker = '#171a21';
const steamBlue = '#1a9fff';
const steamGreen = '#4c6b22';
const steamGreenLight = '#a4d007';
const steamGray = '#2a475e';
const steamText = '#c7d5e0';
const steamTextDim = '#8f98a0';
const steamBorder = '#0e1a26';

export function Steam() {
  const openWindow = useDesktopStore((s) => s.openWindow);
  const [activeTab, setActiveTab] = useState<SteamTab>('Library');
  const [selectedGame, setSelectedGame] = useState<SteamGame>(GAMES[0]!);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInstalled, setFilterInstalled] = useState(false);

  const [installedGames, setInstalledGames] = useState<Set<string>>(
    () => new Set(GAMES.filter(g => g.installed).map(g => g.id))
  );

  const isInstalled = (id: string) => installedGames.has(id);

  const installGame = (id: string) => {
    setInstalledGames(prev => new Set([...prev, id]));
  };

  const uninstallGame = (id: string) => {
    setInstalledGames(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const filteredGames = GAMES.filter((g) => {
    if (filterInstalled && !isInstalled(g.id)) return false;
    if (searchQuery && !g.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handlePlay = (game: SteamGame) => {
    if (game.windowId && isInstalled(game.id)) {
      openWindow(game.windowId);
    }
  };

  const totalUnlocked = Object.values(GAME_ACHIEVEMENTS).reduce(
    (sum, achs) => sum + achs.filter(a => a.unlocked).length, 0
  );
  const totalAchievements = Object.values(GAME_ACHIEVEMENTS).reduce(
    (sum, achs) => sum + achs.length, 0
  );

  const playBtnStyle: React.CSSProperties = {
    background: `linear-gradient(to right, ${steamGreen}, ${steamGreenLight})`,
    border: 'none',
    color: '#fff',
    fontFamily: 'var(--font-system)',
    fontSize: 14,
    fontWeight: 'bold',
    padding: '8px 32px',
    letterSpacing: 1,
    cursor: 'pointer',
  };

  const uninstallBtnStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.08)',
    border: `1px solid ${steamBorder}`,
    color: steamTextDim,
    fontFamily: 'var(--font-system)',
    fontSize: 10,
    padding: '6px 14px',
    cursor: 'pointer',
  };

  const installBtnStyle: React.CSSProperties = {
    background: steamBlue,
    border: 'none',
    color: '#fff',
    fontFamily: 'var(--font-system)',
    fontSize: 12,
    fontWeight: 'bold',
    padding: '8px 24px',
    cursor: 'pointer',
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: steamDark,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-system)',
      fontSize: 11,
      color: steamText,
      overflow: 'hidden',
    }}>
      {/* ─── Top Navigation Bar ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: steamDarker,
        padding: '0 8px',
        height: 28,
        gap: 0,
        borderBottom: `1px solid ${steamBorder}`,
        flexShrink: 0,
      }}>
        <span style={{
          fontWeight: 'bold',
          fontSize: 12,
          color: steamText,
          marginRight: 16,
          letterSpacing: 1,
        }}>
          STEAM
        </span>
        {(['Library', 'Store', 'Community', 'Profile'] as SteamTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === tab ? '#fff' : steamTextDim,
              fontFamily: 'var(--font-system)',
              fontSize: 11,
              padding: '4px 12px',
              borderBottom: activeTab === tab ? `2px solid ${steamBlue}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ color: steamTextDim, fontSize: 10 }}>
          Danny
        </span>
      </div>

      {/* ─── Library View ─── */}
      {activeTab === 'Library' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* ─── Left Sidebar: Game List ─── */}
          <div style={{
            width: 200,
            background: steamGray,
            borderRight: `1px solid ${steamBorder}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {/* Search bar */}
            <div style={{ padding: 6 }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: steamDarker,
                  border: `1px solid ${steamBorder}`,
                  color: steamText,
                  fontFamily: 'var(--font-system)',
                  fontSize: 11,
                  padding: '3px 6px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Filter */}
            <div style={{
              padding: '2px 8px 6px',
              borderBottom: `1px solid ${steamBorder}`,
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: steamTextDim }}>
                <input
                  type="checkbox"
                  checked={filterInstalled}
                  onChange={(e) => setFilterInstalled(e.target.checked)}
                  style={{ accentColor: steamBlue }}
                />
                Installed only
              </label>
            </div>

            {/* Game list */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  style={{
                    padding: '6px 10px',
                    background: selectedGame?.id === game.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                    borderLeft: selectedGame?.id === game.id ? `3px solid ${steamBlue}` : '3px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {game.boxArt ? (
                    <img
                      src={game.boxArt}
                      alt=""
                      style={{
                        width: 24,
                        height: 16,
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: `1px solid ${steamBorder}`,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: isInstalled(game.id) ? steamGreenLight : steamTextDim,
                      flexShrink: 0,
                    }} />
                  )}
                  <GameIcon gameId={game.id} />
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{
                      fontSize: 11,
                      color: selectedGame?.id === game.id ? '#fff' : steamText,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {game.title}
                    </div>
                    {game.hours > 0 && (
                      <div style={{ fontSize: 9, color: steamTextDim }}>
                        {game.hours} hrs on record
                      </div>
                    )}
                  </div>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: isInstalled(game.id) ? steamGreenLight : steamTextDim,
                    flexShrink: 0,
                  }} />
                </div>
              ))}
            </div>

            {/* Stats footer */}
            <div style={{
              padding: '6px 10px',
              borderTop: `1px solid ${steamBorder}`,
              fontSize: 10,
              color: steamTextDim,
            }}>
              {installedGames.size} installed / {GAMES.length} games
            </div>
          </div>

          {/* ─── Right Panel: Game Detail ─── */}
          {selectedGame && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              background: steamDark,
            }}>
              {/* Hero banner area */}
              <div style={{
                background: selectedGame.bgImage
                  ? `url(${selectedGame.bgImage}) center/cover no-repeat`
                  : `linear-gradient(135deg, ${steamGray} 0%, ${steamDark} 100%)`,
                height: selectedGame.bgImage ? 180 : 160,
                borderBottom: `1px solid ${steamBorder}`,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                flexShrink: 0,
              }}>
                {/* Dark gradient overlay for readability */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: selectedGame.bgImage
                    ? 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.85) 100%)'
                    : 'none',
                  pointerEvents: 'none',
                }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '0 20px 16px' }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4, textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
                  {selectedGame.title}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>
                  {selectedGame.developer}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                  {selectedGame.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        padding: '2px 8px',
                        borderRadius: 2,
                        fontSize: 9,
                        color: steamBlue,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Play/Install/Uninstall buttons */}
                {isInstalled(selectedGame.id) ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => handlePlay(selectedGame)} style={playBtnStyle}>
                      {'\u25B6'} Play
                    </button>
                    <button onClick={() => uninstallGame(selectedGame.id)} style={uninstallBtnStyle}>
                      Uninstall
                    </button>
                  </div>
                ) : selectedGame.id === 'halflife3' ? (
                  <button style={{ ...installBtnStyle, opacity: 0.5 }} disabled>
                    Coming Soon...
                  </button>
                ) : (
                  <button onClick={() => installGame(selectedGame.id)} style={installBtnStyle}>
                    Install
                  </button>
                )}
                </div>
              </div>

              {/* Game Info Section */}
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
                  About This Game
                </div>
                <p style={{ color: steamText, lineHeight: 1.6, marginBottom: 16 }}>
                  {selectedGame.description}
                </p>

                {/* Info grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px 16px',
                  background: 'rgba(0,0,0,0.2)',
                  padding: 12,
                  borderRadius: 2,
                }}>
                  <div>
                    <div style={{ fontSize: 9, color: steamTextDim, marginBottom: 2 }}>Developer</div>
                    <div style={{ color: steamBlue }}>{selectedGame.developer}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: steamTextDim, marginBottom: 2 }}>Size</div>
                    <div>{selectedGame.size}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: steamTextDim, marginBottom: 2 }}>Play Time</div>
                    <div>{selectedGame.hours > 0 ? `${selectedGame.hours} hours` : 'Not played yet'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: steamTextDim, marginBottom: 2 }}>Last Played</div>
                    <div>{selectedGame.lastPlayed ?? 'Never'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: steamTextDim, marginBottom: 2 }}>Status</div>
                    <div style={{ color: isInstalled(selectedGame.id) ? steamGreenLight : '#f44' }}>
                      {isInstalled(selectedGame.id) ? 'Installed' : 'Not installed'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: steamTextDim, marginBottom: 2 }}>Tags</div>
                    <div>{selectedGame.tags.join(', ')}</div>
                  </div>
                </div>

                {/* Achievements section */}
                {GAME_ACHIEVEMENTS[selectedGame.id] && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
                      Achievements
                    </div>
                    {(() => {
                      const achs = GAME_ACHIEVEMENTS[selectedGame.id]!;
                      const unlocked = achs.filter(a => a.unlocked).length;
                      const total = achs.length;
                      const pct = total > 0 ? (unlocked / total) * 100 : 0;
                      return (
                        <>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 10,
                          }}>
                            <div style={{
                              flex: 1,
                              height: 6,
                              background: 'rgba(255,255,255,0.1)',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: steamGreenLight,
                                borderRadius: 3,
                              }} />
                            </div>
                            <span style={{ fontSize: 10, color: steamTextDim, whiteSpace: 'nowrap' }}>
                              {unlocked}/{total} Achievements Unlocked
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                          }}>
                            {achs.map((ach, i) => (
                              <div
                                key={`${ach.name}-${i}`}
                                title={ach.description}
                                style={{
                                  background: ach.unlocked ? 'rgba(164,208,7,0.15)' : 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${ach.unlocked ? steamGreenLight : steamBorder}`,
                                  padding: '6px 10px',
                                  borderRadius: 2,
                                  fontSize: 10,
                                  color: ach.unlocked ? steamGreenLight : steamTextDim,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  opacity: ach.unlocked ? 1 : 0.6,
                                }}
                              >
                                <AchievementIcon icon={ach.icon} color={ach.unlocked ? steamGreenLight : steamTextDim} />
                                {ach.name}
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Store View ─── */}
      {activeTab === 'Store' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>Featured & Recommended</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', padding: 16 }}>
            {GAMES.slice(0, 4).map((game) => (
              <div
                key={game.id}
                onClick={() => { setSelectedGame(game); setActiveTab('Library'); }}
                style={{
                  width: 140,
                  background: steamGray,
                  border: `1px solid ${steamBorder}`,
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                {game.boxArt ? (
                  <div style={{
                    width: '100%',
                    height: 60,
                    background: `url(${game.boxArt}) center/cover`,
                    marginBottom: 6,
                    border: `1px solid ${steamBorder}`,
                  }} />
                ) : (
                  <div style={{
                    width: '100%',
                    height: 60,
                    background: `linear-gradient(135deg, ${steamDarker}, ${steamGray})`,
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: steamBlue,
                  }}>
                    {game.title.charAt(0)}
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#fff', marginBottom: 2 }}>{game.title}</div>
                <div style={{ fontSize: 9, color: steamTextDim }}>{game.developer}</div>
                <div style={{
                  marginTop: 6,
                  fontSize: 10,
                  color: isInstalled(game.id) ? steamGreenLight : steamBlue,
                }}>
                  {isInstalled(game.id) ? 'In Library' : 'Free to Play'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Community View ─── */}
      {activeTab === 'Community' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>Community Hub</div>
          <div style={{ color: steamTextDim, textAlign: 'center', maxWidth: 300 }}>
            Discussions, screenshots, guides, and workshop content from the DannyOS gaming community.
          </div>
          <div style={{
            marginTop: 12,
            padding: '8px 16px',
            background: steamGray,
            border: `1px solid ${steamBorder}`,
            color: steamTextDim,
            fontSize: 10,
          }}>
            No community content available yet. Check back later!
          </div>
        </div>
      )}

      {/* ─── Profile View ─── */}
      {activeTab === 'Profile' && (
        <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
          <div style={{
            display: 'flex',
            gap: 16,
            marginBottom: 20,
            alignItems: 'flex-start',
          }}>
            {/* Avatar */}
            <div style={{
              width: 64,
              height: 64,
              background: steamGray,
              border: `2px solid ${steamBlue}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 'bold',
              color: steamBlue,
              flexShrink: 0,
            }}>
              D
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>Danny</div>
              <div style={{ fontSize: 10, color: steamGreenLight, marginTop: 2 }}>Online</div>
              <div style={{ fontSize: 10, color: steamTextDim, marginTop: 4 }}>
                Level 42 | {GAMES.length} games owned
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 12,
            marginBottom: 20,
          }}>
            {[
              { label: 'Games Owned', value: String(GAMES.length) },
              { label: 'Hours Played', value: String(GAMES.reduce((sum, g) => sum + g.hours, 0)) },
              { label: 'Achievements', value: `${totalUnlocked}/${totalAchievements}` },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: steamGray,
                  padding: 12,
                  textAlign: 'center',
                  border: `1px solid ${steamBorder}`,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 'bold', color: steamBlue }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: steamTextDim, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
            Recent Activity
          </div>
          {GAMES.filter((g) => g.lastPlayed).slice(0, 3).map((game) => (
            <div
              key={game.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.2)',
                marginBottom: 4,
                borderRadius: 2,
              }}
            >
              <div>
                <div style={{ color: '#fff' }}>{game.title}</div>
                <div style={{ fontSize: 9, color: steamTextDim }}>{game.hours} hrs total</div>
              </div>
              <div style={{ fontSize: 10, color: steamTextDim }}>{game.lastPlayed}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Bottom Status Bar ─── */}
      <div style={{
        height: 20,
        background: steamDarker,
        borderTop: `1px solid ${steamBorder}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        fontSize: 10,
        color: steamTextDim,
        flexShrink: 0,
        justifyContent: 'space-between',
      }}>
        <span>Steam Client v1.0 - DannyOS Edition</span>
        <span>{installedGames.size} games installed</span>
      </div>
    </div>
  );
}
