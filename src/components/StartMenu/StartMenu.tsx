import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '../../stores/desktopStore';
import { DynamicIcon } from '../Icons/Icons';
import styles from './StartMenu.module.css';

interface MenuItem {
  label: string;
  icon: string;
  windowId?: string;
  action?: string;
  separator?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'About Me', icon: 'document', windowId: 'about' },
  { label: 'Projects', icon: 'file', windowId: 'projects' },
  { label: 'Resume', icon: 'notepad', windowId: 'resume' },
  { label: 'Contact', icon: 'mail', windowId: 'contact' },
  { label: 'Portfolio', icon: 'document', windowId: 'portfolio' },
  { label: 'Transcript', icon: 'notepad', windowId: 'transcript' },
  { label: 'Minesweeper', icon: 'minesweeper', windowId: 'minesweeper' },
  { label: '/gather Bot', icon: 'discord', windowId: 'discord' },
  { label: 'Cave Story', icon: 'cavestory', windowId: 'cavestory' },
  { label: 'Interests', icon: 'document', windowId: 'interests' },
  { label: 'Voltbox', icon: 'voltbox', windowId: 'voltbox' },
  { label: 'Steam', icon: 'steam', windowId: 'steam' },
  { label: 'Paint', icon: 'paint', windowId: 'paint' },
  { label: 'AOL Messenger', icon: 'aol', windowId: 'aol' },
  { label: '', icon: '', separator: true },
  { label: 'My Computer', icon: 'computer', windowId: 'mycomputer' },
  { label: 'MS-DOS Prompt', icon: 'console', windowId: 'terminal' },
  { label: 'Settings', icon: 'settings', windowId: 'settings' },
  { label: 'Date/Time', icon: 'datetime', windowId: 'datetime' },
  { label: '', icon: '', separator: true },
  { label: 'Shut Down...', icon: 'shutdown', action: 'shutdown' },
];

export function StartMenu() {
  const isOpen = useDesktopStore((s) => s.startMenuOpen);
  const closeStartMenu = useDesktopStore((s) => s.closeStartMenu);
  const openWindow = useDesktopStore((s) => s.openWindow);
  const setPhase = useDesktopStore((s) => s.setPhase);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: globalThis.MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-start-area]')) {
        closeStartMenu();
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [isOpen, closeStartMenu]);

  const handleItemClick = (item: MenuItem) => {
    if (item.windowId) {
      openWindow(item.windowId);
      closeStartMenu();
    } else if (item.action === 'shutdown') {
      setPhase('shutdown-prompt');
      closeStartMenu();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className={styles.menu}
          data-start-area
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <span className={styles.sidebarText}>DannyOS</span>
          </div>

          {/* Items */}
          <div className={styles.items}>
            {MENU_ITEMS.map((item, i) =>
              item.separator ? (
                <div key={i} className={styles.separator} />
              ) : (
                <div
                  key={item.label}
                  className={styles.item}
                  onClick={() => handleItemClick(item)}
                >
                  <DynamicIcon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </div>
              ),
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
