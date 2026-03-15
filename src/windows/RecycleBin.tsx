import { useCallback } from 'react';
import { DynamicIcon } from '../components/Icons/Icons';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

const TRASH_FILES = [
  { name: 'old_portfolio.html', icon: 'document' },
  { name: 'boring_website.css', icon: 'document' },
  { name: 'TODO_learn_css_grid.txt', icon: 'notepad' },
];

export function RecycleBin() {
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);

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
      <div className={styles.explorerList}>
        {TRASH_FILES.map((f) => (
          <div key={f.name} className={styles.explorerItem}>
            <span className={styles.explorerIcon}>
              <DynamicIcon name={f.icon} size={16} />
            </span>
            <span>{f.name}</span>
          </div>
        ))}
      </div>
      <div className={styles.statusBar}>3 object(s)&nbsp;&nbsp;&nbsp;&nbsp;12 KB</div>
    </div>
  );
}
