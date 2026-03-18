import { useState, useRef, useCallback } from 'react';
import { useDesktopStore } from '../../stores/desktopStore';
import styles from './DisplayProperties.module.css';

const PRESETS = [
  { label: '(None)',                         url: null },
  { label: 'Fullmetal Alchemist',            url: '/backgrounds/fmab_bg.png' },
  { label: 'Frieren: Beyond Journey\'s End', url: '/backgrounds/freiren_bg.png' },
  { label: 'Tokyo Cityscape',               url: '/backgrounds/tokyo_bg.png' },
];

const DISPLAY_STYLES: { label: string; value: 'tile' | 'center' | 'stretch' }[] = [
  { label: 'Tile',    value: 'tile' },
  { label: 'Center',  value: 'center' },
  { label: 'Stretch', value: 'stretch' },
];

export function DisplayProperties() {
  const isOpen = useDesktopStore((s) => s.displayPropsOpen);
  const closeDialog = useDesktopStore((s) => s.closeDisplayProps);
  const currentWallpaper = useDesktopStore((s) => s.wallpaper);
  const currentStyle = useDesktopStore((s) => s.wallpaperStyle);
  const setWallpaper = useDesktopStore((s) => s.setWallpaper);
  const setWallpaperStyle = useDesktopStore((s) => s.setWallpaperStyle);

  // Local state for preview before applying
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentWallpaper);
  const [selectedStyle, setSelectedStyle] = useState(currentStyle);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sync local state when dialog opens
  const prevOpen = useRef(false);
  if (isOpen && !prevOpen.current) {
    // Dialog just opened — reset local state
    prevOpen.current = true;
  }
  if (!isOpen && prevOpen.current) {
    prevOpen.current = false;
  }

  const handleApply = useCallback(() => {
    setWallpaper(selectedUrl);
    setWallpaperStyle(selectedStyle);
  }, [selectedUrl, selectedStyle, setWallpaper, setWallpaperStyle]);

  const handleOk = useCallback(() => {
    handleApply();
    closeDialog();
  }, [handleApply, closeDialog]);

  const handleCancel = useCallback(() => {
    setSelectedUrl(currentWallpaper);
    setSelectedStyle(currentStyle);
    closeDialog();
  }, [currentWallpaper, currentStyle, closeDialog]);

  const handleFileUpload = useCallback(() => {
    const input = fileRef.current;
    if (!input) return;
    input.click();
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCustomBg(dataUrl);
      setSelectedUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }, []);

  if (!isOpen) return null;

  // Which item is selected in the list?
  const previewUrl = selectedUrl;

  // Build preview inline style
  const previewStyle: React.CSSProperties = {
    background: previewUrl ? undefined : '#008080',
  };
  if (previewUrl) {
    if (selectedStyle === 'stretch') {
      previewStyle.backgroundImage = `url(${previewUrl})`;
      previewStyle.backgroundSize = 'cover';
      previewStyle.backgroundPosition = 'center';
      previewStyle.backgroundRepeat = 'no-repeat';
    } else if (selectedStyle === 'center') {
      previewStyle.backgroundImage = `url(${previewUrl})`;
      previewStyle.backgroundSize = 'contain';
      previewStyle.backgroundPosition = 'center';
      previewStyle.backgroundRepeat = 'no-repeat';
      previewStyle.backgroundColor = '#008080';
    } else {
      previewStyle.backgroundImage = `url(${previewUrl})`;
      previewStyle.backgroundSize = '60px 45px';
      previewStyle.backgroundRepeat = 'repeat';
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        {/* Title bar */}
        <div className={styles.titleBar}>
          <span className={styles.titleText}>Display Properties</span>
          <button className={styles.closeBtn} onClick={handleCancel} aria-label="Close">
            <svg width="8" height="8" viewBox="0 0 8 8" shapeRendering="crispEdges">
              <line x1="0" y1="0" x2="8" y2="8" stroke="#000" strokeWidth="2" />
              <line x1="8" y1="0" x2="0" y2="8" stroke="#000" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Tab strip */}
        <div className={styles.tabs}>
          <div className={`${styles.tab} ${styles.tabActive}`}>Background</div>
          <div className={styles.tab}>Screen Saver</div>
          <div className={styles.tab}>Appearance</div>
          <div className={styles.tab}>Settings</div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Preview monitor */}
          <div className={styles.monitorFrame}>
            <div className={styles.monitorScreen} style={previewStyle} />
            <div className={styles.monitorStand} />
          </div>

          {/* Wallpaper list + controls */}
          <div className={styles.controls}>
            <label className={styles.label}>Wallpaper:</label>
            <div className={styles.listBox}>
              {PRESETS.map((p) => (
                <div
                  key={p.label}
                  className={`${styles.listItem} ${selectedUrl === p.url ? styles.listItemSelected : ''}`}
                  onClick={() => setSelectedUrl(p.url)}
                >
                  {p.label}
                </div>
              ))}
              {customBg && (
                <div
                  className={`${styles.listItem} ${selectedUrl === customBg ? styles.listItemSelected : ''}`}
                  onClick={() => setSelectedUrl(customBg)}
                >
                  Custom Image
                </div>
              )}
            </div>

            <div className={styles.row}>
              <label className={styles.label}>Display:</label>
              <select
                className={styles.select}
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value as 'tile' | 'center' | 'stretch')}
              >
                {DISPLAY_STYLES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <button className={styles.browseBtn} onClick={handleFileUpload}>
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

        {/* Footer buttons */}
        <div className={styles.footer}>
          <button className={styles.btn} onClick={handleOk}>OK</button>
          <button className={styles.btn} onClick={handleCancel}>Cancel</button>
          <button className={styles.btn} onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
}

