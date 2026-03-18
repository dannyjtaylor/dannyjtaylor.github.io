import { useEffect, useState } from 'react';
import { useDesktopStore } from '../../stores/desktopStore';
import { DynamicIcon } from '../Icons/Icons';
import styles from './Taskbar.module.css';

export function Taskbar() {
  const windows = useDesktopStore((s) => s.windows);
  const activeWindowId = useDesktopStore((s) => s.activeWindowId);
  const openWindow = useDesktopStore((s) => s.openWindow);
  const minimizeWindow = useDesktopStore((s) => s.minimizeWindow);
  const bringToFront = useDesktopStore((s) => s.bringToFront);
  const startMenuOpen = useDesktopStore((s) => s.startMenuOpen);
  const toggleStartMenu = useDesktopStore((s) => s.toggleStartMenu);

  const [clock, setClock] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setClock(`${h}:${m} ${ampm}`);
    }
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const openWindows = Object.entries(windows).filter(
    ([, w]) => w.isOpen,
  );

  return (
    <div className={styles.taskbar}>
      {/* Start button */}
      <button
        className={`${styles.startButton} ${startMenuOpen ? styles.startActive : ''}`}
        onClick={toggleStartMenu}
        data-start-area
      >
        <DynamicIcon name="windows" size={16} />
        <span>Start</span>
      </button>

      <div className={styles.divider} />

      {/* Window buttons */}
      <div className={styles.windowButtons}>
        {openWindows.map(([id, w]) => {
          const isActive = activeWindowId === id && !w.isMinimized;
          return (
            <button
              key={id}
              className={`${styles.windowBtn} ${isActive ? styles.windowBtnActive : ''}`}
              onClick={() => {
                if (w.isMinimized) {
                  openWindow(id);
                } else if (activeWindowId === id) {
                  minimizeWindow(id);
                } else {
                  bringToFront(id);
                }
              }}
            >
              {w.title || id}
            </button>
          );
        })}
      </div>

      {/* System tray */}
      <div className={styles.tray}>
        <span
          className={styles.clock}
          onDoubleClick={() => openWindow('datetime')}
          title="Double-click to open Date/Time Properties"
        >
          {clock}
        </span>
      </div>
    </div>
  );
}
