import { useEffect, useCallback, type MouseEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '../../stores/desktopStore';
import { DesktopIcon } from '../DesktopIcon/DesktopIcon';
import { Taskbar } from '../Taskbar/Taskbar';
import { StartMenu } from '../StartMenu/StartMenu';
import { ShutdownDialog } from '../ShutdownDialog/ShutdownDialog';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { Window } from '../Window/Window';
import { AboutMe } from '../../windows/AboutMe';
import { Projects } from '../../windows/Projects';
import { Resume } from '../../windows/Resume';
import { Contact } from '../../windows/Contact';
import { MyComputer } from '../../windows/MyComputer';
import { RecycleBin } from '../../windows/RecycleBin';
import { Terminal } from '../../windows/Terminal';
import { Valorant } from '../../windows/Valorant';
import { Undertale } from '../../windows/Undertale';
import type { DesktopIconConfig, WindowConfig, MenuConfig } from '../../types';
import styles from './Desktop.module.css';

/* ── Menu Configurations ── */

const NOTEPAD_MENUS: MenuConfig[] = [
  {
    label: 'File',
    items: [
      { label: 'New', action: 'file-new', shortcut: 'Ctrl+N' },
      { label: 'Open...', action: 'file-open', shortcut: 'Ctrl+O', disabled: true },
      { label: 'Save', action: 'file-save', shortcut: 'Ctrl+S' },
      { label: 'Save As...', action: 'file-save-as' },
      { separator: true },
      { label: 'Page Setup...', action: 'file-page-setup', disabled: true },
      { label: 'Print...', action: 'file-print', shortcut: 'Ctrl+P', disabled: true },
      { separator: true },
      { label: 'Exit', action: 'file-exit' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', action: 'edit-undo', shortcut: 'Ctrl+Z', disabled: true },
      { separator: true },
      { label: 'Cut', action: 'edit-cut', shortcut: 'Ctrl+X' },
      { label: 'Copy', action: 'edit-copy', shortcut: 'Ctrl+C' },
      { label: 'Paste', action: 'edit-paste', shortcut: 'Ctrl+V' },
      { label: 'Delete', action: 'edit-delete', shortcut: 'Del' },
      { separator: true },
      { label: 'Select All', action: 'edit-select-all', shortcut: 'Ctrl+A' },
      { label: 'Time/Date', action: 'edit-time-date', shortcut: 'F5' },
    ],
  },
  {
    label: 'Format',
    items: [
      { label: 'Word Wrap', action: 'format-word-wrap', checked: false },
      { label: 'Font...', action: 'format-font', disabled: true },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Status Bar', action: 'view-status-bar', checked: false, disabled: true },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'Help Topics', action: 'help-topics', disabled: true },
      { separator: true },
      { label: 'About Notepad', action: 'help-about' },
    ],
  },
];

const EXPLORER_MENUS: MenuConfig[] = [
  {
    label: 'File',
    items: [
      { label: 'Open', action: 'file-open', disabled: true },
      { label: 'Explore', action: 'file-explore', disabled: true },
      { separator: true },
      { label: 'Close', action: 'file-exit' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Select All', action: 'edit-select-all', shortcut: 'Ctrl+A', disabled: true },
      { label: 'Invert Selection', action: 'edit-invert', disabled: true },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Large Icons', action: 'view-large', checked: true },
      { label: 'Small Icons', action: 'view-small' },
      { label: 'List', action: 'view-list' },
      { label: 'Details', action: 'view-details' },
      { separator: true },
      { label: 'Refresh', action: 'view-refresh', shortcut: 'F5' },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'About Windows', action: 'help-about' },
    ],
  },
];

const MAIL_MENUS: MenuConfig[] = [
  {
    label: 'File',
    items: [
      { label: 'Send', action: 'file-send', shortcut: 'Ctrl+Enter', disabled: true },
      { label: 'Save', action: 'file-save', shortcut: 'Ctrl+S', disabled: true },
      { separator: true },
      { label: 'Close', action: 'file-exit' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Cut', action: 'edit-cut', shortcut: 'Ctrl+X', disabled: true },
      { label: 'Copy', action: 'edit-copy', shortcut: 'Ctrl+C', disabled: true },
      { label: 'Paste', action: 'edit-paste', shortcut: 'Ctrl+V', disabled: true },
      { label: 'Select All', action: 'edit-select-all', shortcut: 'Ctrl+A', disabled: true },
    ],
  },
  {
    label: 'View',
    items: [
      { label: 'Toolbar', action: 'view-toolbar', checked: true, disabled: true },
      { label: 'Status Bar', action: 'view-status-bar', checked: true, disabled: true },
    ],
  },
  {
    label: 'Insert',
    items: [
      { label: 'File Attachment...', action: 'insert-attachment', disabled: true },
      { label: 'Signature', action: 'insert-signature', disabled: true },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'About Internet Mail', action: 'help-about' },
    ],
  },
];

const ICONS: DesktopIconConfig[] = [
  { id: 'icon-about',      label: 'About Me',       icon: 'document',  windowId: 'about' },
  { id: 'icon-projects',   label: 'Projects',       icon: 'file',      windowId: 'projects' },
  { id: 'icon-resume',     label: 'Resume',         icon: 'notepad',   windowId: 'resume' },
  { id: 'icon-contact',    label: 'Contact',        icon: 'mail',      windowId: 'contact' },
  { id: 'icon-mycomputer', label: 'My Computer',    icon: 'computer',  windowId: 'mycomputer' },
  { id: 'icon-recycle',    label: 'Recycle Bin',    icon: 'recycle',   windowId: 'recycle' },
  { id: 'icon-terminal',   label: 'MS-DOS',         icon: 'console',   windowId: 'terminal' },
  { id: 'icon-valorant',   label: 'VALORANT',       icon: 'valorant',  windowId: 'valorant' },
  { id: 'icon-undertale',  label: 'UNDERTALE',      icon: 'undertale', windowId: 'undertale' },
];

const WINDOWS: WindowConfig[] = [
  { id: 'about',      title: 'About Me - Notepad',    icon: 'document',  defaultWidth: 500, defaultHeight: 380, defaultX: 80,  defaultY: 40,  menus: NOTEPAD_MENUS },
  { id: 'projects',   title: 'C:\\Projects',            icon: 'file',      defaultWidth: 540, defaultHeight: 400, defaultX: 140, defaultY: 60,  menus: EXPLORER_MENUS },
  { id: 'resume',     title: 'Resume.txt - Notepad',   icon: 'notepad',   defaultWidth: 520, defaultHeight: 420, defaultX: 120, defaultY: 50,  menus: NOTEPAD_MENUS },
  { id: 'contact',    title: 'New Message',             icon: 'mail',      defaultWidth: 460, defaultHeight: 340, defaultX: 160, defaultY: 80,  menus: MAIL_MENUS },
  { id: 'mycomputer', title: 'My Computer',             icon: 'computer',  defaultWidth: 480, defaultHeight: 360, defaultX: 100, defaultY: 40,  menus: EXPLORER_MENUS },
  { id: 'recycle',    title: 'Recycle Bin',             icon: 'recycle',   defaultWidth: 420, defaultHeight: 300, defaultX: 200, defaultY: 100, menus: EXPLORER_MENUS },
  { id: 'terminal',   title: 'MS-DOS Prompt',           icon: 'console',   defaultWidth: 560, defaultHeight: 380, defaultX: 60,  defaultY: 30 },
  { id: 'valorant',   title: 'VALORANT',                icon: 'valorant',  defaultWidth: 520, defaultHeight: 400, defaultX: 90,  defaultY: 35 },
  { id: 'undertale',  title: 'UNDERTALE',               icon: 'undertale', defaultWidth: 320, defaultHeight: 380, defaultX: 150, defaultY: 30 },
];

const WINDOW_CONTENT: Record<string, React.ComponentType> = {
  about: AboutMe,
  projects: Projects,
  resume: Resume,
  contact: Contact,
  mycomputer: MyComputer,
  recycle: RecycleBin,
  terminal: Terminal,
  valorant: Valorant,
  undertale: Undertale,
};

export function Desktop() {
  const registerWindow = useDesktopStore((s) => s.registerWindow);
  const windows = useDesktopStore((s) => s.windows);
  const selectIcon = useDesktopStore((s) => s.selectIcon);
  const closeStartMenu = useDesktopStore((s) => s.closeStartMenu);
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);
  const hideContextMenu = useDesktopStore((s) => s.hideContextMenu);

  useEffect(() => {
    for (const w of WINDOWS) {
      registerWindow(w.id, {
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 100,
        x: w.defaultX,
        y: w.defaultY,
        width: w.defaultWidth,
        height: w.defaultHeight,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDesktopClick = useCallback(() => {
    selectIcon(null);
    closeStartMenu();
    hideContextMenu();
  }, [selectIcon, closeStartMenu, hideContextMenu]);

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, 'desktop');
    },
    [showContextMenu],
  );

  return (
    <div className={styles.desktop}>
      {/* Icon grid */}
      <div
        className={styles.icons}
        onClick={handleDesktopClick}
        onContextMenu={handleContextMenu}
      >
        {ICONS.map((ic) => (
          <DesktopIcon
            key={ic.id}
            id={ic.id}
            label={ic.label}
            icon={ic.icon}
            windowId={ic.windowId}
          />
        ))}
      </div>

      {/* Windows */}
      <AnimatePresence>
        {WINDOWS.map((wc) => {
          const win = windows[wc.id];
          if (!win || !win.isOpen || win.isMinimized) return null;
          const Content = WINDOW_CONTENT[wc.id]!;
          return (
            <Window
              key={wc.id}
              id={wc.id}
              title={wc.title}
              icon={wc.icon}
              menus={wc.menus}
            >
              <Content />
            </Window>
          );
        })}
      </AnimatePresence>

      <ContextMenu />
      <StartMenu />
      <ShutdownDialog />
      <Taskbar />
    </div>
  );
}
