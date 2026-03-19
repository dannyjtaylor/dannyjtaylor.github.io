import { useCallback } from 'react';
import { DynamicIcon } from '../components/Icons/Icons';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

export function RecycleBin() {
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);
  const recycleBin = useDesktopStore((s) => s.recycleBin);
  const restoreFromRecycleBin = useDesktopStore((s) => s.restoreFromRecycleBin);
  const emptyRecycleBin = useDesktopStore((s) => s.emptyRecycleBin);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showContextMenu(e.clientX, e.clientY, 'explorer');
    },
    [showContextMenu],
  );

  return (
    <div className={styles.explorer} onContextMenu={handleContextMenu}>
      {/* Toolbar */}
      <div className={styles.explorerToolbar}>
        <button
          className={styles.explorerUpBtn}
          disabled={recycleBin.length === 0}
          onClick={() => emptyRecycleBin()}
          title="Empty Recycle Bin"
        >
          Empty Recycle Bin
        </button>
      </div>
      <div className={styles.explorerList}>
        {recycleBin.length === 0 ? (
          <div className={styles.explorerEmpty}>
            <span style={{ color: 'var(--win-dark, #808080)', fontFamily: 'var(--font-system)', fontSize: 11 }}>
              Recycle Bin is empty.
            </span>
          </div>
        ) : (
          recycleBin.map((item) => (
            <div key={item.id} className={styles.explorerItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className={styles.explorerIcon}>
                  <DynamicIcon name={item.icon} size={16} />
                </span>
                <span>{item.label}</span>
              </div>
              <button
                onClick={() => restoreFromRecycleBin(item.id)}
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: 11,
                  padding: '1px 8px',
                  cursor: 'pointer',
                  background: 'var(--win-btn-face, #c0c0c0)',
                  border: '2px outset var(--win-btn-face, #c0c0c0)',
                }}
              >
                Restore
              </button>
            </div>
          ))
        )}
      </div>
      <div className={styles.statusBar}>
        {recycleBin.length} object(s)
      </div>
    </div>
  );
}
