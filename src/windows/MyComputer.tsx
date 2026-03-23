import { useState, useCallback } from 'react';
import { DynamicIcon } from '../components/Icons/Icons';
import { useDesktopStore } from '../stores/desktopStore';
import styles from './windows.module.css';

interface FsEntry {
  name: string;
  icon: string;
  type: 'drive' | 'folder' | 'file';
  children?: FsEntry[];
  size?: string;
}

const FILE_SYSTEM: FsEntry[] = [
  {
    name: '(C:) DannyOS',
    icon: 'drive',
    type: 'drive',
    children: [
      { name: 'WINDOWS', icon: 'folder', type: 'folder', children: [
        { name: 'system.ini', icon: 'document', type: 'file', size: '2 KB' },
        { name: 'win.ini', icon: 'document', type: 'file', size: '1 KB' },
        { name: 'notepad.exe', icon: 'notepad', type: 'file', size: '64 KB' },
      ]},
      { name: 'Program Files', icon: 'folder', type: 'folder', children: [
        { name: 'Internet Explorer', icon: 'folder', type: 'folder', children: [] },
        { name: 'DJTech Suite', icon: 'folder', type: 'folder', children: [
          { name: 'readme.txt', icon: 'document', type: 'file', size: '4 KB' },
        ]},
      ]},
      { name: 'My Documents', icon: 'folder', type: 'folder', children: [
        { name: 'about_me.txt', icon: 'notepad', type: 'file', size: '1 KB' },
        { name: 'resume.txt', icon: 'document', type: 'file', size: '3 KB' },
        { name: 'Projects', icon: 'folder', type: 'folder', children: [] },
      ]},
      { name: 'AUTOEXEC.BAT', icon: 'document', type: 'file', size: '512 B' },
      { name: 'CONFIG.SYS', icon: 'document', type: 'file', size: '256 B' },
    ],
  },
  {
    name: '(A:) 3\u00BD Floppy',
    icon: 'floppy',
    type: 'drive',
    children: [
      { name: 'backup.zip', icon: 'document', type: 'file', size: '1.2 MB' },
    ],
  },
  {
    name: '(D:) CD-ROM',
    icon: 'cd',
    type: 'drive',
    children: [
      { name: 'setup.exe', icon: 'document', type: 'file', size: '4.2 MB' },
      { name: 'readme.txt', icon: 'notepad', type: 'file', size: '8 KB' },
      { name: 'data', icon: 'folder', type: 'folder', children: [] },
    ],
  },
];

// Map virtual filenames to real window IDs
const FILE_TO_WINDOW: Record<string, string> = {
  'about_me.txt': 'about',
  'resume.txt': 'resume',
  'readme.txt': 'about',
  'notepad.exe': 'paint',
  'system.ini': 'terminal',
  'win.ini': 'terminal',
  'setup.exe': 'terminal',
  'AUTOEXEC.BAT': 'terminal',
  'CONFIG.SYS': 'terminal',
  'backup.zip': 'mycomputer',
};

export function MyComputer() {
  const [path, setPath] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);
  const openWindow = useDesktopStore((s) => s.openWindow);
  const showProperties = useDesktopStore((s) => s.showProperties);

  const getCurrentEntries = (): FsEntry[] => {
    if (path.length === 0) return FILE_SYSTEM;
    let current: FsEntry[] = FILE_SYSTEM;
    for (const segment of path) {
      const found = current.find((e) => e.name === segment);
      if (found?.children) {
        current = found.children;
      } else {
        return [];
      }
    }
    return current;
  };

  const entries = getCurrentEntries();
  const pathDisplay = path.length === 0 ? 'My Computer' : `My Computer\\${path.join('\\')}`;

  const handleDoubleClick = (entry: FsEntry) => {
    if (entry.children) {
      setPath([...path, entry.name]);
      setSelectedItem(null);
    } else {
      // Try to open the file in a mapped window
      const windowId = FILE_TO_WINDOW[entry.name];
      if (windowId) {
        openWindow(windowId);
      } else {
        showProperties(`${entry.name} Properties`, {
          'Type': entry.type === 'file' ? 'File' : 'Folder',
          'Location': `C:\\${path.join('\\')}`,
          'Size': entry.size ?? 'Unknown',
          'Created': 'January 1, 2004',
        });
      }
    }
  };

  const handleItemContextMenu = (e: React.MouseEvent, entry: FsEntry) => {
    e.preventDefault();
    e.stopPropagation();
    if (entry.children) {
      // Folders: use explorer variant (right-click on empty space behavior)
      showContextMenu(e.clientX, e.clientY, 'explorer');
    } else {
      // Files: use explorer-item with mapped window ID
      const windowId = FILE_TO_WINDOW[entry.name];
      showContextMenu(e.clientX, e.clientY, 'explorer-item', windowId ?? 'mycomputer');
    }
  };

  const goUp = () => {
    if (path.length > 0) {
      setPath(path.slice(0, -1));
      setSelectedItem(null);
    }
  };

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showContextMenu(e.clientX, e.clientY, 'explorer');
    },
    [showContextMenu],
  );

  const totalItems = entries.length;

  return (
    <div className={styles.explorer} onContextMenu={handleContextMenu}>
      <div className={styles.explorerToolbar}>
        <button
          className={styles.explorerUpBtn}
          onClick={goUp}
          disabled={path.length === 0}
          title="Up One Level"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" shapeRendering="crispEdges">
            <path d="M5 1 L1 6 L3 6 L3 9 L7 9 L7 6 L9 6 Z" fill={path.length === 0 ? '#808080' : '#000'} />
          </svg>
        </button>
        <div className={styles.explorerPath}>{pathDisplay}</div>
      </div>

      <div className={styles.explorerList}>
        {entries.map((entry) => (
          <div
            key={entry.name}
            className={`${styles.explorerItem} ${selectedItem === entry.name ? styles.explorerItemSelected : ''}`}
            onClick={() => setSelectedItem(entry.name)}
            onDoubleClick={() => handleDoubleClick(entry)}
            onContextMenu={(ev) => handleItemContextMenu(ev, entry)}
          >
            <span className={styles.explorerIcon}>
              <DynamicIcon name={entry.icon} size={16} />
            </span>
            <span>{entry.name}</span>
            {entry.size && <span className={styles.explorerSize}>{entry.size}</span>}
          </div>
        ))}
        {entries.length === 0 && (
          <div className={styles.explorerEmpty}>This folder is empty.</div>
        )}
      </div>

      <div className={styles.statusBar}>{totalItems} object(s)&nbsp;&nbsp;&nbsp;&nbsp;420 MB free</div>
    </div>
  );
}
