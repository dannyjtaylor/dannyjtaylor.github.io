import { useDesktopStore } from '../../stores/desktopStore';
import styles from './PropertiesDialog.module.css';

export function PropertiesDialog() {
  const dialog = useDesktopStore((s) => s.propertiesDialog);
  const hideProperties = useDesktopStore((s) => s.hideProperties);

  if (!dialog || !dialog.visible) return null;

  return (
    <div className={styles.overlay} onClick={hideProperties}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Title bar */}
        <div className={styles.titlebar}>
          <span>{dialog.title}</span>
          <button className={styles.closeBtn} onClick={hideProperties} aria-label="Close">
            <svg width="8" height="8" viewBox="0 0 8 8" shapeRendering="crispEdges">
              <line x1="0" y1="0" x2="8" y2="8" stroke="#000" strokeWidth="2" />
              <line x1="8" y1="0" x2="0" y2="8" stroke="#000" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <div className={styles.tabActive}>General</div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.iconRow}>
            <div className={styles.bigIcon}>
              <svg width="32" height="32" viewBox="0 0 32 32" shapeRendering="crispEdges">
                <rect x="4" y="2" width="24" height="28" fill="#c0c0c0" stroke="#000" strokeWidth="1" />
                <rect x="8" y="6" width="16" height="2" fill="#000080" />
                <rect x="8" y="10" width="12" height="1" fill="#808080" />
                <rect x="8" y="13" width="14" height="1" fill="#808080" />
                <rect x="8" y="16" width="10" height="1" fill="#808080" />
                <rect x="8" y="19" width="16" height="1" fill="#808080" />
                <rect x="8" y="22" width="8" height="1" fill="#808080" />
              </svg>
            </div>
            <div className={styles.nameField}>{dialog.title}</div>
          </div>

          <div className={styles.separator} />

          <div className={styles.infoGrid}>
            {Object.entries(dialog.info).map(([key, value]) => (
              <div key={key} className={styles.infoRow}>
                <span className={styles.infoLabel}>{key}:</span>
                <span className={styles.infoValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className={styles.buttons}>
          <button className={styles.btn} onClick={hideProperties}>OK</button>
          <button className={styles.btn} onClick={hideProperties}>Cancel</button>
          <button className={styles.btn} onClick={hideProperties}>Apply</button>
        </div>
      </div>
    </div>
  );
}
