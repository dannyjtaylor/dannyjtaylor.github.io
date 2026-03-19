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

  const timeOffset = useDesktopStore((s) => s.timeOffset);
  const timeZone = useDesktopStore((s) => s.timeZone);
  const [clock, setClock] = useState('');

  useEffect(() => {
    // Map timezone label to UTC offset hours
    const TIME_ZONE_OFFSETS: Record<string, number> = {
      '(GMT-12:00) Intl Date Line West': -12,
      '(GMT-11:00) Midway Island, Samoa': -11,
      '(GMT-10:00) Hawaii': -10,
      '(GMT-09:00) Alaska': -9,
      '(GMT-08:00) Pacific Time (US & Canada)': -8,
      '(GMT-07:00) Mountain Time (US & Canada)': -7,
      '(GMT-06:00) Central Time (US & Canada)': -6,
      '(GMT-05:00) Eastern Time (US & Canada)': -5,
      '(GMT-04:00) Atlantic Time (Canada)': -4,
      '(GMT-03:00) Buenos Aires, Greenland': -3,
      '(GMT-02:00) Mid-Atlantic': -2,
      '(GMT-01:00) Azores, Cape Verde Is.': -1,
      '(GMT+00:00) UTC / London, Dublin': 0,
      '(GMT+01:00) Berlin, Paris, Rome': 1,
      '(GMT+02:00) Cairo, Helsinki, Athens': 2,
      '(GMT+03:00) Moscow, Kuwait, Riyadh': 3,
      '(GMT+04:00) Abu Dhabi, Muscat, Baku': 4,
      '(GMT+05:00) Islamabad, Karachi': 5,
      '(GMT+05:30) Mumbai, Kolkata, Chennai': 5.5,
      '(GMT+06:00) Astana, Dhaka': 6,
      '(GMT+07:00) Bangkok, Hanoi, Jakarta': 7,
      '(GMT+08:00) Beijing, Singapore, Perth': 8,
      '(GMT+09:00) Tokyo, Seoul, Osaka': 9,
      '(GMT+10:00) Sydney, Melbourne, Guam': 10,
      '(GMT+11:00) Magadan, Solomon Is.': 11,
      '(GMT+12:00) Auckland, Wellington, Fiji': 12,
    };

    function update() {
      const now = new Date();
      const tzOffsetHours = TIME_ZONE_OFFSETS[timeZone] ?? -(now.getTimezoneOffset() / 60);
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const adjusted = new Date(utcMs + tzOffsetHours * 3600000 + timeOffset);

      let h = adjusted.getHours();
      const m = String(adjusted.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setClock(`${h}:${m} ${ampm}`);
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timeOffset, timeZone]);

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
