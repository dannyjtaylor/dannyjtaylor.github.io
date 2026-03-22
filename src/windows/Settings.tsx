import { useState, useRef, useCallback, useEffect } from 'react';
import { useDesktopStore } from '../stores/desktopStore';

/* ─── Preset wallpapers (same list used by DisplayProperties) ─── */
const WALLPAPER_PRESETS: { label: string; url: string | null }[] = [
  { label: '(None)',                            url: null },
  { label: 'Fullmetal Alchemist',              url: '/backgrounds/fmab_bg.png' },
  { label: "Frieren: Beyond Journey's End",    url: '/backgrounds/freiren_bg.png' },
  { label: 'Tokyo Cityscape',                  url: '/backgrounds/tokyo_bg.png' },
];

const DISPLAY_STYLES: { label: string; value: 'tile' | 'center' | 'stretch' }[] = [
  { label: 'Tile',    value: 'tile' },
  { label: 'Center',  value: 'center' },
  { label: 'Stretch', value: 'stretch' },
];

const SCREENSAVERS = ['(None)', 'Starfield', 'Matrix', 'Maze', 'Flying Windows', 'Energy Star'];

const COLOR_SCHEMES = [
  'Windows Standard',
  'High Contrast',
  'Rainy Day',
  'Desert',
  'Rose',
  'Slate',
  'Spruce',
  'Storm',
  'Wheat',
];

const DESKTOP_AREAS = ['640x480', '800x600', '1024x768', '1280x1024'];
const COLOR_PALETTES = ['16 Colors', '256 Colors', 'High Color (16 bit)', 'True Color (32 bit)'];

type TabName = 'Background' | 'Screen Saver' | 'Appearance' | 'Settings';

/* ─── Shared inline style helpers ─── */
const btnOutset: React.CSSProperties = {
  borderTop: '2px solid var(--win-btn-hilight)',
  borderLeft: '2px solid var(--win-btn-hilight)',
  borderBottom: '2px solid var(--win-btn-dk-shadow)',
  borderRight: '2px solid var(--win-btn-dk-shadow)',
};

const btnInset: React.CSSProperties = {
  borderTop: '2px solid var(--win-btn-dk-shadow)',
  borderLeft: '2px solid var(--win-btn-dk-shadow)',
  borderBottom: '2px solid var(--win-btn-hilight)',
  borderRight: '2px solid var(--win-btn-hilight)',
};

const btnBase: React.CSSProperties = {
  ...btnOutset,
  background: 'var(--win-btn-face)',
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  padding: '4px 16px',
  minWidth: 75,
  textAlign: 'center' as const,
};

const groupBox: React.CSSProperties = {
  border: '1px solid var(--win-btn-shadow)',
  borderRight: '1px solid var(--win-btn-hilight)',
  borderBottom: '1px solid var(--win-btn-hilight)',
  padding: '12px 8px 8px',
  position: 'relative' as const,
  marginBottom: 8,
};

const groupLabel: React.CSSProperties = {
  position: 'absolute' as const,
  top: -7,
  left: 8,
  background: 'var(--win-btn-face)',
  padding: '0 4px',
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  color: 'var(--win-black)',
};

const selectStyle: React.CSSProperties = {
  ...btnInset,
  background: 'var(--win-white)',
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  padding: '2px 4px',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-system)',
  fontSize: 11,
  color: 'var(--win-black)',
  marginBottom: 2,
};

/* ─── CRT monitor preview component ─── */
function MonitorPreview({
  children,
  style,
  small,
}: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  small?: boolean;
}) {
  const w = small ? 160 : 200;
  const h = small ? 110 : 140;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      {/* Monitor body */}
      <div
        style={{
          width: w + 32,
          height: h + 24,
          background: '#a0a0a0',
          borderRadius: 4,
          borderTop: '2px solid #d0d0d0',
          borderLeft: '2px solid #d0d0d0',
          borderRight: '2px solid #606060',
          borderBottom: '2px solid #606060',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
        }}
      >
        {/* Screen bezel */}
        <div
          style={{
            width: w + 8,
            height: h + 4,
            background: '#333',
            borderTop: '2px solid #000',
            borderLeft: '2px solid #000',
            borderRight: '2px solid #555',
            borderBottom: '2px solid #555',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
          }}
        >
          {/* Screen surface */}
          <div
            style={{
              width: w,
              height: h,
              background: '#008080',
              overflow: 'hidden',
              position: 'relative',
              ...style,
            }}
          >
            {children}
          </div>
        </div>
      </div>
      {/* Stand neck */}
      <div
        style={{
          width: 40,
          height: 10,
          background: '#a0a0a0',
          borderLeft: '2px solid #d0d0d0',
          borderRight: '2px solid #606060',
        }}
      />
      {/* Stand base */}
      <div
        style={{
          width: 80,
          height: 8,
          background: '#a0a0a0',
          borderRadius: '0 0 4px 4px',
          borderTop: '2px solid #d0d0d0',
          borderLeft: '2px solid #d0d0d0',
          borderRight: '2px solid #606060',
          borderBottom: '2px solid #606060',
        }}
      />
      {/* Power LED */}
      <div style={{ marginTop: -28, marginLeft: 80, width: 4, height: 4, borderRadius: '50%', background: '#0f0' }} />
    </div>
  );
}

/* ─── Mini Win95 window for Appearance preview ─── */
function MiniWindow({
  title,
  active,
  scheme,
}: {
  title: string;
  active: boolean;
  scheme: string;
}) {
  const titleBg = active
    ? scheme === 'High Contrast' ? '#000' : scheme === 'Desert' ? '#a08040' : scheme === 'Rose' ? '#c06080' : scheme === 'Slate' ? '#405060' : scheme === 'Storm' ? '#303050' : 'var(--win-navy)'
    : scheme === 'High Contrast' ? '#404040' : 'var(--win-dark)';
  const titleColor = '#fff';
  const bodyBg = scheme === 'High Contrast' ? '#000' : scheme === 'Desert' ? '#fffde0' : 'var(--win-white)';
  const bodyText = scheme === 'High Contrast' ? '#0f0' : 'var(--win-black)';

  return (
    <div
      style={{
        border: '2px outset var(--win-btn-face)',
        background: 'var(--win-btn-face)',
        width: '100%',
        marginBottom: 4,
      }}
    >
      <div
        style={{
          background: titleBg,
          color: titleColor,
          fontFamily: 'var(--font-system)',
          fontSize: 9,
          fontWeight: 'bold',
          padding: '1px 3px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{title}</span>
        <div style={{ display: 'flex', gap: 1 }}>
          <div style={{ width: 10, height: 9, background: 'var(--win-btn-face)', border: '1px outset var(--win-btn-face)', fontSize: 7, textAlign: 'center', lineHeight: '8px', color: '#000' }}>_</div>
          <div style={{ width: 10, height: 9, background: 'var(--win-btn-face)', border: '1px outset var(--win-btn-face)', fontSize: 7, textAlign: 'center', lineHeight: '7px', color: '#000' }}>X</div>
        </div>
      </div>
      <div
        style={{
          background: bodyBg,
          color: bodyText,
          fontFamily: 'var(--font-system)',
          fontSize: 8,
          padding: 4,
          minHeight: 20,
        }}
      >
        Window Text
      </div>
    </div>
  );
}

/* ─── Main Settings Component ─── */
export function Settings() {
  const closeWindow = useDesktopStore((s) => s.closeWindow);
  const currentWallpaper = useDesktopStore((s) => s.wallpaper);
  const currentWallpaperStyle = useDesktopStore((s) => s.wallpaperStyle);
  const setWallpaper = useDesktopStore((s) => s.setWallpaper);
  const setWallpaperStyle = useDesktopStore((s) => s.setWallpaperStyle);

  const storeBrightness = useDesktopStore((s) => s.brightness);
  const storeContrast = useDesktopStore((s) => s.contrast);
  const storeColorScheme = useDesktopStore((s) => s.colorScheme);
  const storeDesktopArea = useDesktopStore((s) => s.desktopArea);
  const storeFontSize = useDesktopStore((s) => s.fontSize);
  const storeIconSize = useDesktopStore((s) => s.iconSize);
  const storeCursorTheme = useDesktopStore((s) => s.cursorTheme);
  const storeScreensaver = useDesktopStore((s) => s.screensaver);
  const storeScreensaverTimeout = useDesktopStore((s) => s.screensaverTimeout);
  const storeScreensaverSet = useDesktopStore((s) => s.setScreensaver);
  const storeScreensaverTimeoutSet = useDesktopStore((s) => s.setScreensaverTimeout);
  const storeBrightnessSet = useDesktopStore((s) => s.setBrightness);
  const storeContrastSet = useDesktopStore((s) => s.setContrast);
  const storeColorSchemeSet = useDesktopStore((s) => s.setColorScheme);
  const storeDesktopAreaSet = useDesktopStore((s) => s.setDesktopArea);
  const storeFontSizeSet = useDesktopStore((s) => s.setFontSize);
  const storeIconSizeSet = useDesktopStore((s) => s.setIconSize);
  const storeCursorThemeSet = useDesktopStore((s) => s.setCursorTheme);

  const [activeTab, setActiveTab] = useState<TabName>('Background');

  /* --- Local state (editable, applied on OK/Apply) --- */
  // Background
  const [localWallpaper, setLocalWallpaper] = useState<string | null>(currentWallpaper);
  const [localWallpaperStyle, setLocalWallpaperStyle] = useState(currentWallpaperStyle);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Screen Saver
  const [screensaver, setScreensaver] = useState(storeScreensaver);
  const [ssWait, setSsWait] = useState(storeScreensaverTimeout);
  const [ssPreviewActive, setSsPreviewActive] = useState(false);

  // Appearance
  const [localBrightness, setLocalBrightness] = useState(storeBrightness ?? 100);
  const [localContrast, setLocalContrast] = useState(storeContrast ?? 100);
  const [localColorScheme, setLocalColorScheme] = useState(storeColorScheme ?? 'Windows Standard');
  const [localFontSize, setLocalFontSize] = useState(storeFontSize ?? 'small');
  const [localIconSize, setLocalIconSize] = useState(storeIconSize ?? 'large');
  const [localCursorTheme, setLocalCursorTheme] = useState(storeCursorTheme ?? 'Windows Default');

  // Settings
  const [localDesktopArea, setLocalDesktopArea] = useState(storeDesktopArea ?? '1024x768');
  const [localColorPalette, setLocalColorPalette] = useState('True Color (32 bit)');

  /* --- Snapshot of originals for Cancel --- */
  const originals = useRef({
    wallpaper: currentWallpaper,
    wallpaperStyle: currentWallpaperStyle,
    brightness: storeBrightness ?? 100,
    contrast: storeContrast ?? 100,
    colorScheme: storeColorScheme ?? 'Windows Standard',
    desktopArea: storeDesktopArea ?? '1024x768',
    fontSize: storeFontSize ?? 'small',
    iconSize: storeIconSize ?? 'large',
    cursorTheme: storeCursorTheme ?? 'Windows Default',
    screensaver: storeScreensaver,
    screensaverTimeout: storeScreensaverTimeout,
  });

  /* --- Apply all settings to the store --- */
  const applyAll = useCallback(() => {
    setWallpaper(localWallpaper);
    setWallpaperStyle(localWallpaperStyle);
    storeBrightnessSet?.(localBrightness);
    storeContrastSet?.(localContrast);
    storeColorSchemeSet?.(localColorScheme);
    storeDesktopAreaSet?.(localDesktopArea);
    storeFontSizeSet?.(localFontSize);
    storeIconSizeSet?.(localIconSize);
    storeCursorThemeSet?.(localCursorTheme);
    storeScreensaverSet(screensaver);
    storeScreensaverTimeoutSet(ssWait);
  }, [
    localWallpaper, localWallpaperStyle, localBrightness, localContrast,
    localColorScheme, localDesktopArea, localFontSize, localIconSize, localCursorTheme,
    screensaver, ssWait,
    setWallpaper, setWallpaperStyle, storeBrightnessSet, storeContrastSet,
    storeColorSchemeSet, storeDesktopAreaSet, storeFontSizeSet, storeIconSizeSet, storeCursorThemeSet,
    storeScreensaverSet, storeScreensaverTimeoutSet,
  ]);

  const handleOk = useCallback(() => {
    applyAll();
    closeWindow('settings');
  }, [applyAll, closeWindow]);

  const handleCancel = useCallback(() => {
    // Revert to originals
    const o = originals.current;
    setWallpaper(o.wallpaper);
    setWallpaperStyle(o.wallpaperStyle);
    storeBrightnessSet?.(o.brightness);
    storeContrastSet?.(o.contrast);
    storeColorSchemeSet?.(o.colorScheme);
    storeDesktopAreaSet?.(o.desktopArea);
    storeFontSizeSet?.(o.fontSize);
    storeIconSizeSet?.(o.iconSize);
    storeCursorThemeSet?.(o.cursorTheme);
    storeScreensaverSet(o.screensaver);
    storeScreensaverTimeoutSet(o.screensaverTimeout);
    closeWindow('settings');
  }, [closeWindow, setWallpaper, setWallpaperStyle, storeBrightnessSet, storeContrastSet, storeColorSchemeSet, storeDesktopAreaSet, storeFontSizeSet, storeIconSizeSet, storeCursorThemeSet, storeScreensaverSet, storeScreensaverTimeoutSet]);

  const handleApply = useCallback(() => {
    applyAll();
  }, [applyAll]);

  /* --- File upload handler --- */
  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCustomBg(dataUrl);
      setLocalWallpaper(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  /* --- Screensaver preview effect --- */
  useEffect(() => {
    if (!ssPreviewActive) return;
    const timer = setTimeout(() => setSsPreviewActive(false), 3000);
    return () => clearTimeout(timer);
  }, [ssPreviewActive]);

  /* --- Build wallpaper preview style --- */
  const buildWpPreview = (url: string | null, wpStyle: 'tile' | 'center' | 'stretch'): React.CSSProperties => {
    if (!url) return { background: '#008080' };
    if (wpStyle === 'stretch') return { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
    if (wpStyle === 'center') return { backgroundImage: `url(${url})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#008080' };
    return { backgroundImage: `url(${url})`, backgroundSize: '40px 30px', backgroundRepeat: 'repeat' };
  };

  /* --- Tabs --- */
  const TABS: TabName[] = ['Background', 'Screen Saver', 'Appearance', 'Settings'];

  const desktopAreaIndex = DESKTOP_AREAS.indexOf(localDesktopArea);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--win-btn-face)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-system)',
        fontSize: 11,
        color: 'var(--win-black)',
        overflow: 'hidden',
      }}
    >
      {/* ─── Tab strip ─── */}
      <div
        style={{
          display: 'flex',
          padding: '6px 6px 0',
          gap: 0,
          borderBottom: 'none',
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: 11,
                padding: '4px 12px',
                background: 'var(--win-btn-face)',
                border: 'none',
                borderTop: isActive ? '2px solid var(--win-btn-hilight)' : '1px solid var(--win-btn-hilight)',
                borderLeft: isActive ? '2px solid var(--win-btn-hilight)' : '1px solid var(--win-btn-hilight)',
                borderRight: isActive ? '2px solid var(--win-btn-dk-shadow)' : '1px solid var(--win-btn-dk-shadow)',
                borderBottom: isActive ? '2px solid var(--win-btn-face)' : '1px solid var(--win-btn-dk-shadow)',
                marginBottom: isActive ? -1 : 0,
                position: 'relative',
                zIndex: isActive ? 2 : 1,
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
                color: 'var(--win-black)',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ─── Tab body ─── */}
      <div
        style={{
          flex: 1,
          margin: '0 6px',
          padding: 12,
          ...btnOutset,
          background: 'var(--win-btn-face)',
          overflow: 'auto',
        }}
      >
        {/* ════════════ BACKGROUND TAB ════════════ */}
        {activeTab === 'Background' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <MonitorPreview style={buildWpPreview(localWallpaper, localWallpaperStyle)} />

            <div style={{ ...groupBox, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={groupLabel}>Wallpaper</span>

              {/* List box */}
              <div
                style={{
                  ...btnInset,
                  background: 'var(--win-white)',
                  flex: 1,
                  minHeight: 80,
                  maxHeight: 120,
                  overflow: 'auto',
                  marginBottom: 8,
                }}
              >
                {WALLPAPER_PRESETS.map((p) => (
                  <div
                    key={p.label}
                    onClick={() => setLocalWallpaper(p.url)}
                    style={{
                      padding: '1px 4px',
                      fontFamily: 'var(--font-system)',
                      fontSize: 11,
                      background: localWallpaper === p.url ? 'var(--win-navy)' : 'transparent',
                      color: localWallpaper === p.url ? 'var(--win-white)' : 'var(--win-black)',
                    }}
                  >
                    {p.label}
                  </div>
                ))}
                {customBg && (
                  <div
                    onClick={() => setLocalWallpaper(customBg)}
                    style={{
                      padding: '1px 4px',
                      fontFamily: 'var(--font-system)',
                      fontSize: 11,
                      background: localWallpaper === customBg ? 'var(--win-navy)' : 'transparent',
                      color: localWallpaper === customBg ? 'var(--win-white)' : 'var(--win-black)',
                    }}
                  >
                    Custom Image
                  </div>
                )}
              </div>

              {/* Display style + Browse */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={labelStyle}>Display:</label>
                <select
                  style={{ ...selectStyle, width: 100 }}
                  value={localWallpaperStyle}
                  onChange={(e) => setLocalWallpaperStyle(e.target.value as 'tile' | 'center' | 'stretch')}
                >
                  {DISPLAY_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button style={btnBase} onClick={() => fileRef.current?.click()}>
                  Browse...
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={onFileChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* ════════════ SCREEN SAVER TAB ════════════ */}
        {activeTab === 'Screen Saver' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <MonitorPreview
              style={{ background: '#000' }}
            >
              {ssPreviewActive && screensaver === 'Starfield' && (
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        width: 2,
                        height: 2,
                        borderRadius: '50%',
                        background: '#fff',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `starTwinkle ${0.5 + Math.random() * 2}s infinite alternate`,
                        opacity: Math.random(),
                      }}
                    />
                  ))}
                  <style>{`@keyframes starTwinkle { from { opacity: 0.2; } to { opacity: 1; } }`}</style>
                </div>
              )}
              {ssPreviewActive && screensaver === 'Matrix' && (
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', fontFamily: 'monospace', fontSize: 8, color: '#0f0' }}>
                  {Array.from({ length: 12 }).map((_, col) => (
                    <div
                      key={col}
                      style={{
                        position: 'absolute',
                        left: col * 16,
                        top: 0,
                        animation: `matrixFall ${1 + Math.random() * 2}s linear infinite`,
                        whiteSpace: 'pre',
                        lineHeight: '8px',
                      }}
                    >
                      {Array.from({ length: 20 }).map((_, r) => (
                        <div key={r} style={{ opacity: 1 - r * 0.05 }}>
                          {String.fromCharCode(0x30A0 + Math.random() * 96)}
                        </div>
                      ))}
                    </div>
                  ))}
                  <style>{`@keyframes matrixFall { from { transform: translateY(-100%); } to { transform: translateY(100%); } }`}</style>
                </div>
              )}
              {ssPreviewActive && screensaver === 'Flying Windows' && (
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        width: 16,
                        height: 12,
                        background: `hsl(${i * 60}, 80%, 60%)`,
                        border: '1px solid #fff',
                        animation: `flyWin ${2 + i * 0.3}s ease-in-out infinite alternate`,
                        left: `${10 + i * 15}%`,
                        top: `${20 + (i % 3) * 20}%`,
                      }}
                    >
                      <div style={{ width: '100%', height: 3, background: 'var(--win-navy)' }} />
                    </div>
                  ))}
                  <style>{`@keyframes flyWin { from { transform: scale(0.5) rotate(-5deg); opacity: 0.3; } to { transform: scale(1.5) rotate(5deg); opacity: 1; } }`}</style>
                </div>
              )}
              {ssPreviewActive && screensaver === 'Maze' && (
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <svg viewBox="0 0 200 140" style={{ width: '100%', height: '100%' }}>
                    {/* Simple maze lines */}
                    <line x1="0" y1="20" x2="160" y2="20" stroke="#fff" strokeWidth="2" />
                    <line x1="40" y1="20" x2="40" y2="60" stroke="#fff" strokeWidth="2" />
                    <line x1="0" y1="60" x2="80" y2="60" stroke="#fff" strokeWidth="2" />
                    <line x1="80" y1="40" x2="80" y2="100" stroke="#fff" strokeWidth="2" />
                    <line x1="120" y1="0" x2="120" y2="80" stroke="#fff" strokeWidth="2" />
                    <line x1="120" y1="80" x2="200" y2="80" stroke="#fff" strokeWidth="2" />
                    <line x1="160" y1="20" x2="160" y2="120" stroke="#fff" strokeWidth="2" />
                    <line x1="0" y1="100" x2="80" y2="100" stroke="#fff" strokeWidth="2" />
                    <line x1="40" y1="100" x2="40" y2="140" stroke="#fff" strokeWidth="2" />
                    <line x1="80" y1="120" x2="160" y2="120" stroke="#fff" strokeWidth="2" />
                    {/* Walking dot */}
                    <circle r="4" fill="#ff0" opacity="0.9">
                      <animateMotion dur="4s" repeatCount="indefinite" path="M 10,10 L 10,50 L 70,50 L 70,90 L 110,90 L 110,30 L 150,30 L 150,110 L 70,110 L 10,110 L 10,10" />
                    </circle>
                  </svg>
                </div>
              )}
              {ssPreviewActive && screensaver === 'Energy Star' && (
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src="/energystar.png"
                    alt="Energy Star"
                    style={{
                      width: 60,
                      height: 45,
                      objectFit: 'contain',
                      animation: 'energyBounce 3s ease-in-out infinite alternate',
                    }}
                  />
                  <style>{`@keyframes energyBounce { 0% { transform: translate(-40px, -20px); } 50% { transform: translate(40px, 20px); } 100% { transform: translate(-20px, 10px); } }`}</style>
                </div>
              )}
              {ssPreviewActive && screensaver === '(None)' && (
                <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'var(--font-system)', fontSize: 9 }}>
                  No screensaver
                </div>
              )}
              {!ssPreviewActive && (
                <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#666', fontFamily: 'var(--font-system)', fontSize: 9 }}>
                    {screensaver === '(None)' ? '(None)' : screensaver}
                  </span>
                </div>
              )}
            </MonitorPreview>

            <div style={{ ...groupBox }}>
              <span style={groupLabel}>Screen Saver</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <select
                  style={{ ...selectStyle, width: 180 }}
                  value={screensaver}
                  onChange={(e) => setScreensaver(e.target.value)}
                >
                  {SCREENSAVERS.map((ss) => (
                    <option key={ss} value={ss}>{ss}</option>
                  ))}
                </select>
                <button
                  style={btnBase}
                  onClick={() => setSsPreviewActive(true)}
                  disabled={screensaver === '(None)'}
                >
                  Preview
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={labelStyle}>Wait:</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={ssWait}
                  onChange={(e) => setSsWait(Math.max(1, Math.min(99, Number(e.target.value))))}
                  style={{
                    ...btnInset,
                    width: 50,
                    background: 'var(--win-white)',
                    fontFamily: 'var(--font-system)',
                    fontSize: 11,
                    padding: '2px 4px',
                    textAlign: 'right' as const,
                  }}
                />
                <label style={labelStyle}>minutes</label>
              </div>
            </div>

            <div style={{ ...groupBox }}>
              <span style={groupLabel}>Energy Star</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
                <svg width="24" height="20" viewBox="0 0 24 20">
                  <polygon points="12,0 15,7 24,7 17,12 19,20 12,15 5,20 7,12 0,7 9,7" fill="#060" stroke="#0a0" strokeWidth="0.5" />
                </svg>
                <span style={{ fontFamily: 'var(--font-system)', fontSize: 11, color: 'var(--win-black)' }}>
                  Low-power standby: Disabled
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ APPEARANCE TAB ════════════ */}
        {activeTab === 'Appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Appearance preview */}
            <div
              style={{
                ...btnInset,
                background: localColorScheme === 'High Contrast' ? '#000' : localColorScheme === 'Desert' ? '#d2b48c' : localColorScheme === 'Rose' ? '#e8b0c0' : localColorScheme === 'Slate' ? '#708090' : localColorScheme === 'Storm' ? '#4a5568' : localColorScheme === 'Spruce' ? '#2f4f4f' : localColorScheme === 'Wheat' ? '#f5deb3' : localColorScheme === 'Rainy Day' ? '#808898' : '#008080',
                padding: 12,
                marginBottom: 8,
                minHeight: 100,
                filter: `brightness(${localBrightness / 100}) contrast(${localContrast / 100})`,
              }}
            >
              <div style={{ width: '80%', margin: '0 auto' }}>
                <MiniWindow title="Active Window" active={true} scheme={localColorScheme} />
                <div style={{ marginLeft: 20, marginTop: -8, position: 'relative', zIndex: 0 }}>
                  <MiniWindow title="Inactive Window" active={false} scheme={localColorScheme} />
                </div>
              </div>
              {/* Message box */}
              <div
                style={{
                  width: '60%',
                  margin: '4px auto 0',
                  border: '2px outset var(--win-btn-face)',
                  background: 'var(--win-btn-face)',
                  padding: 4,
                }}
              >
                <div style={{ background: 'var(--win-navy)', color: '#fff', fontFamily: 'var(--font-system)', fontSize: 9, padding: '1px 3px', fontWeight: 'bold' }}>
                  Message Box
                </div>
                <div style={{ padding: 4, textAlign: 'center' as const }}>
                  <button style={{ ...btnBase, fontSize: 8, padding: '2px 8px', minWidth: 40 }}>OK</button>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ ...groupBox }}>
              <span style={groupLabel}>Scheme</span>
              <select
                style={{ ...selectStyle, marginBottom: 8 }}
                value={localColorScheme}
                onChange={(e) => setLocalColorScheme(e.target.value)}
              >
                {COLOR_SCHEMES.map((cs) => (
                  <option key={cs} value={cs}>{cs}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {/* Brightness */}
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Brightness: {localBrightness}%</label>
                <input
                  type="range"
                  min={20}
                  max={150}
                  value={localBrightness}
                  onChange={(e) => setLocalBrightness(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: 18,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    background: 'var(--win-btn-face)',
                    outline: 'none',
                    accentColor: 'var(--win-navy)',
                  }}
                />
              </div>
              {/* Contrast */}
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Contrast: {localContrast}%</label>
                <input
                  type="range"
                  min={20}
                  max={150}
                  value={localContrast}
                  onChange={(e) => setLocalContrast(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: 18,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    background: 'var(--win-btn-face)',
                    outline: 'none',
                    accentColor: 'var(--win-navy)',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Font Size:</label>
                <select
                  style={selectStyle}
                  value={localFontSize}
                  onChange={(e) => setLocalFontSize(e.target.value)}
                >
                  <option value="small">Small Fonts</option>
                  <option value="large">Large Fonts</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Icon Size:</label>
                <select
                  style={selectStyle}
                  value={localIconSize}
                  onChange={(e) => setLocalIconSize(e.target.value)}
                >
                  <option value="large">Large Icons</option>
                  <option value="small">Small Icons</option>
                </select>
              </div>
            </div>

            {/* Cursor Theme */}
            <div style={{ ...groupBox, marginTop: 8 }}>
              <span style={groupLabel}>Mouse Pointers</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ ...labelStyle, minWidth: 50 }}>Scheme:</label>
                <select
                  style={{ ...selectStyle, flex: 1 }}
                  value={localCursorTheme}
                  onChange={(e) => setLocalCursorTheme(e.target.value)}
                >
                  {['Windows Default', 'Inverted', 'Neon', 'Hotdog', 'Ocean', 'Lavender', 'Crosshair', 'Pixel Sword'].map(ct => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>
              <div style={{
                display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8,
                padding: '6px 0',
              }}>
                {/* Preview cursors inline as small SVGs */}
                <div style={{ textAlign: 'center' }}>
                  <svg width="16" height="24" viewBox="0 0 12 19" style={{ display: 'block', margin: '0 auto' }}>
                    <path d="M1 1v15l4-4 2.8 5.2 1.4-.8-2.8-5.2L11 11z"
                      fill={localCursorTheme === 'Neon' ? '#00ff88' : localCursorTheme === 'Hotdog' ? '#ffcc00' : localCursorTheme === 'Ocean' ? '#66ccff' : localCursorTheme === 'Lavender' ? '#cc99ff' : localCursorTheme === 'Inverted' ? '#000' : '#fff'}
                      stroke={localCursorTheme === 'Neon' ? '#003322' : localCursorTheme === 'Hotdog' ? '#ff0000' : localCursorTheme === 'Ocean' ? '#003366' : localCursorTheme === 'Lavender' ? '#4400aa' : localCursorTheme === 'Inverted' ? '#fff' : '#000'}
                      strokeWidth="0.8" strokeLinejoin="round"
                    />
                  </svg>
                  <span style={{ fontSize: 8, color: 'var(--win-black)' }}>Normal</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <svg width="16" height="24" viewBox="0 0 15 20" style={{ display: 'block', margin: '0 auto' }}>
                    <path d="M5.5 0v8H3v2H1v7h10v-2h2V9h-2V8h-2V7H7V1h-1.5z"
                      fill={localCursorTheme === 'Neon' ? '#00ff88' : localCursorTheme === 'Hotdog' ? '#ffcc00' : localCursorTheme === 'Ocean' ? '#66ccff' : localCursorTheme === 'Lavender' ? '#cc99ff' : '#fff'}
                      stroke={localCursorTheme === 'Neon' ? '#003322' : localCursorTheme === 'Hotdog' ? '#ff0000' : localCursorTheme === 'Ocean' ? '#003366' : localCursorTheme === 'Lavender' ? '#4400aa' : '#000'}
                      strokeWidth="0.6"
                    />
                  </svg>
                  <span style={{ fontSize: 8, color: 'var(--win-black)' }}>Select</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <svg width="10" height="20" viewBox="0 0 7 16" style={{ display: 'block', margin: '0 auto' }}>
                    <path d="M1 0h5M3.5 0v16M1 16h5" fill="none"
                      stroke={localCursorTheme === 'Neon' ? '#00ff88' : localCursorTheme === 'Hotdog' ? '#ff0000' : localCursorTheme === 'Ocean' ? '#003366' : localCursorTheme === 'Lavender' ? '#4400aa' : localCursorTheme === 'Inverted' ? '#fff' : '#000'}
                      strokeWidth="1"
                    />
                  </svg>
                  <span style={{ fontSize: 8, color: 'var(--win-black)' }}>Text</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ SETTINGS TAB ════════════ */}
        {activeTab === 'Settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <MonitorPreview small>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#008080',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-system)',
                  fontSize: 8,
                  color: '#fff',
                }}
              >
                <div>{localDesktopArea}</div>
                <div style={{ marginTop: 2, fontSize: 7 }}>{localColorPalette}</div>
              </div>
            </MonitorPreview>

            <div style={{ ...groupBox }}>
              <span style={groupLabel}>Desktop Area</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-system)', fontSize: 11 }}>Less</span>
                <input
                  type="range"
                  min={0}
                  max={DESKTOP_AREAS.length - 1}
                  value={desktopAreaIndex >= 0 ? desktopAreaIndex : 2}
                  onChange={(e) => setLocalDesktopArea(DESKTOP_AREAS[Number(e.target.value)]!)}
                  style={{
                    flex: 1,
                    height: 18,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    background: 'var(--win-btn-face)',
                    outline: 'none',
                    accentColor: 'var(--win-navy)',
                  }}
                />
                <span style={{ fontFamily: 'var(--font-system)', fontSize: 11 }}>More</span>
              </div>
              <div style={{ textAlign: 'center', fontFamily: 'var(--font-system)', fontSize: 11, marginTop: 4 }}>
                {localDesktopArea} pixels
              </div>
            </div>

            <div style={{ ...groupBox }}>
              <span style={groupLabel}>Color Palette</span>
              <select
                style={selectStyle}
                value={localColorPalette}
                onChange={(e) => setLocalColorPalette(e.target.value)}
              >
                {COLOR_PALETTES.map((cp) => (
                  <option key={cp} value={cp}>{cp}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                style={{
                  ...btnBase,
                  opacity: 0.5,
                }}
                disabled
              >
                Change Display Type...
              </button>
            </div>

            <div
              style={{
                marginTop: 'auto',
                padding: '8px 0 0',
                fontFamily: 'var(--font-system)',
                fontSize: 11,
                color: 'var(--win-btn-shadow)',
              }}
            >
              Note: Display settings are cosmetic only and do not change actual screen resolution.
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer buttons ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 6,
          padding: '8px 6px',
        }}
      >
        <button style={btnBase} onClick={handleOk}>OK</button>
        <button style={btnBase} onClick={handleCancel}>Cancel</button>
        <button style={btnBase} onClick={handleApply}>Apply</button>
      </div>
    </div>
  );
}
