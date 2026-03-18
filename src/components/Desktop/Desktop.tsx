import { useEffect, useCallback, useRef, type MouseEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '../../stores/desktopStore';
import { DesktopIcon } from '../DesktopIcon/DesktopIcon';
import { Taskbar } from '../Taskbar/Taskbar';
import { StartMenu } from '../StartMenu/StartMenu';
import { ShutdownDialog } from '../ShutdownDialog/ShutdownDialog';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { PropertiesDialog } from '../PropertiesDialog/PropertiesDialog';
// DisplayProperties is now handled by the Settings window
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
import { Portfolio } from '../../windows/Portfolio';
import { Transcript } from '../../windows/Transcript';
import { Minesweeper } from '../../windows/Minesweeper';
import { DiscordBot } from '../../windows/DiscordBot';
import { CaveStory } from '../../windows/CaveStory';
import { Interests } from '../../windows/Interests';
import { Steam } from '../../windows/Steam';
import { Voltbox } from '../../windows/Voltbox';
import { AOLChat } from '../../windows/AOLChat';
import { Paint, PAINT_MENUS } from '../../windows/Paint';
import { DateTime } from '../../windows/DateTime';
import { Settings } from '../../windows/Settings';
import { DynamicNotepad } from '../../windows/DynamicNotepad';
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
      { label: 'Undo', action: 'edit-undo', shortcut: 'Ctrl+Z' },
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
      { label: 'Status Bar', action: 'view-status-bar', checked: false },
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
  { id: 'icon-minesweeper',label: 'Minesweeper',    icon: 'minesweeper', windowId: 'minesweeper' },
  { id: 'icon-contact',    label: 'Contact',        icon: 'mail',      windowId: 'contact' },
  { id: 'icon-mycomputer', label: 'My Computer',    icon: 'computer',  windowId: 'mycomputer' },
  { id: 'icon-recycle',    label: 'Recycle Bin',    icon: 'recycle',   windowId: 'recycle' },
  { id: 'icon-terminal',   label: 'MS-DOS',         icon: 'console',   windowId: 'terminal' },
  { id: 'icon-valorant',   label: 'VALORANT',       icon: 'valorant',  windowId: 'valorant' },
  { id: 'icon-undertale',  label: 'UNDERTALE',      icon: 'undertale', windowId: 'undertale' },
  { id: 'icon-portfolio',  label: 'Portfolio',      icon: 'document',  windowId: 'portfolio' },
  { id: 'icon-transcript', label: 'Transcript',     icon: 'notepad',   windowId: 'transcript' },
  { id: 'icon-discord',    label: '/gather Bot',    icon: 'discord',   windowId: 'discord' },
  { id: 'icon-cavestory',  label: 'Cave Story',     icon: 'cavestory', windowId: 'cavestory' },
  { id: 'icon-interests',  label: 'Interests',      icon: 'document',  windowId: 'interests' },
  { id: 'icon-voltbox',   label: 'Voltbox',        icon: 'voltbox',   windowId: 'voltbox' },
  { id: 'icon-steam',     label: 'Steam',          icon: 'steam',     windowId: 'steam' },
  { id: 'icon-aol',       label: 'AOL Messenger',  icon: 'aol',       windowId: 'aol' },
  { id: 'icon-paint',     label: 'Paint',          icon: 'paint',     windowId: 'paint' },
  { id: 'icon-datetime',  label: 'Date/Time',      icon: 'datetime',  windowId: 'datetime' },
  { id: 'icon-settings',  label: 'Settings',       icon: 'settings',  windowId: 'settings' },
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
  { id: 'portfolio',  title: 'Portfolio.txt - Notepad', icon: 'document',  defaultWidth: 520, defaultHeight: 440, defaultX: 110, defaultY: 35,  menus: NOTEPAD_MENUS },
  { id: 'transcript', title: 'Transcript.txt - Notepad',icon: 'notepad',   defaultWidth: 500, defaultHeight: 460, defaultX: 130, defaultY: 25,  menus: NOTEPAD_MENUS },
  { id: 'minesweeper',title: 'Minesweeper',              icon: 'minesweeper', defaultWidth: 200, defaultHeight: 260, defaultX: 200, defaultY: 60 },
  { id: 'discord',    title: '/gather Discord Bot',     icon: 'discord',   defaultWidth: 360, defaultHeight: 260, defaultX: 180, defaultY: 70 },
  { id: 'cavestory',  title: 'Cave Story',              icon: 'cavestory', defaultWidth: 640, defaultHeight: 480, defaultX: 80,  defaultY: 20 },
  { id: 'interests',  title: 'Interests',               icon: 'document',  defaultWidth: 440, defaultHeight: 460, defaultX: 120, defaultY: 30 },
  { id: 'voltbox',   title: 'Voltbox.exe',              icon: 'voltbox',   defaultWidth: 900, defaultHeight: 640, defaultX: 40,  defaultY: 15 },
  { id: 'steam',     title: 'Steam',                    icon: 'steam',     defaultWidth: 680, defaultHeight: 500, defaultX: 80,  defaultY: 25 },
  { id: 'aol',       title: 'AOL Instant Messenger',    icon: 'aol',       defaultWidth: 380, defaultHeight: 420, defaultX: 160, defaultY: 50 },
  { id: 'paint',    title: 'untitled - Paint',          icon: 'paint',     defaultWidth: 640, defaultHeight: 480, defaultX: 60,  defaultY: 20, menus: PAINT_MENUS },
  { id: 'datetime', title: 'Date/Time Properties',      icon: 'datetime',  defaultWidth: 410, defaultHeight: 460, defaultX: 140, defaultY: 40 },
  { id: 'settings', title: 'Display Properties',        icon: 'settings',  defaultWidth: 420, defaultHeight: 500, defaultX: 120, defaultY: 30 },
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
  portfolio: Portfolio,
  transcript: Transcript,
  minesweeper: Minesweeper,
  discord: DiscordBot,
  cavestory: CaveStory,
  interests: Interests,
  voltbox: Voltbox,
  steam: Steam,
  aol: AOLChat,
  paint: Paint,
  datetime: DateTime,
  settings: Settings,
};

export function Desktop() {
  const registerWindow = useDesktopStore((s) => s.registerWindow);
  const windows = useDesktopStore((s) => s.windows);
  const clearSelection = useDesktopStore((s) => s.clearSelection);
  const closeStartMenu = useDesktopStore((s) => s.closeStartMenu);
  const showContextMenu = useDesktopStore((s) => s.showContextMenu);
  const hideContextMenu = useDesktopStore((s) => s.hideContextMenu);
  const selectionBox = useDesktopStore((s) => s.selectionBox);
  const setSelectionBox = useDesktopStore((s) => s.setSelectionBox);
  const selectIconsInRect = useDesktopStore((s) => s.selectIconsInRect);
  const dynamicItems = useDesktopStore((s) => s.dynamicItems);
  const wallpaper = useDesktopStore((s) => s.wallpaper);
  const wallpaperStyle = useDesktopStore((s) => s.wallpaperStyle);
  const brightness = useDesktopStore((s) => s.brightness);
  const contrast = useDesktopStore((s) => s.contrast);
  const colorScheme = useDesktopStore((s) => s.colorScheme);
  const fontSize = useDesktopStore((s) => s.fontSize);
  const iconSize = useDesktopStore((s) => s.iconSize);

  const iconsRef = useRef<HTMLDivElement>(null);

  /* ── Apply color scheme to CSS variables ── */
  useEffect(() => {
    const root = document.documentElement;
    const schemes: Record<string, { bg: string; navy: string; dark: string; gray: string; btnFace: string; white: string; black: string }> = {
      'Windows Standard': { bg: '#008080', navy: '#000080', dark: '#808080', gray: '#c0c0c0', btnFace: '#c0c0c0', white: '#ffffff', black: '#000000' },
      'High Contrast':    { bg: '#000000', navy: '#000000', dark: '#404040', gray: '#000000', btnFace: '#000000', white: '#ffffff', black: '#00ff00' },
      'Rainy Day':        { bg: '#808898', navy: '#354b5e', dark: '#6a7080', gray: '#b8bcc0', btnFace: '#b8bcc0', white: '#ffffff', black: '#000000' },
      'Desert':           { bg: '#d2b48c', navy: '#a08040', dark: '#8a7050', gray: '#d2c0a0', btnFace: '#d2c0a0', white: '#fffde0', black: '#000000' },
      'Rose':             { bg: '#e8b0c0', navy: '#c06080', dark: '#a07080', gray: '#d8b0b8', btnFace: '#d8b0b8', white: '#fff0f4', black: '#000000' },
      'Slate':            { bg: '#708090', navy: '#405060', dark: '#506070', gray: '#a0a8b0', btnFace: '#a0a8b0', white: '#f0f4f8', black: '#000000' },
      'Spruce':           { bg: '#2f4f4f', navy: '#1a3030', dark: '#405050', gray: '#90a8a0', btnFace: '#90a8a0', white: '#f0f8f0', black: '#000000' },
      'Storm':            { bg: '#4a5568', navy: '#303050', dark: '#404858', gray: '#98a0b0', btnFace: '#98a0b0', white: '#f0f0f8', black: '#000000' },
      'Wheat':            { bg: '#f5deb3', navy: '#8b7355', dark: '#a09070', gray: '#e0d0b0', btnFace: '#e0d0b0', white: '#fffff0', black: '#000000' },
    };
    const s = schemes[colorScheme] ?? schemes['Windows Standard']!;
    root.style.setProperty('--win-bg', s.bg);
    root.style.setProperty('--win-navy', s.navy);
    root.style.setProperty('--win-dark', s.dark);
    root.style.setProperty('--win-gray', s.gray);
    root.style.setProperty('--win-btn-face', s.btnFace);
    root.style.setProperty('--win-white', s.white);
    root.style.setProperty('--win-black', s.black);
  }, [colorScheme]);

  /* ── Apply font size ── */
  useEffect(() => {
    const root = document.documentElement;
    const sizes: Record<string, string> = {
      'Small Fonts': '11px',
      'Normal Fonts': '13px',
      'Large Fonts': '15px',
      'small': '11px',
      'large': '15px',
    };
    root.style.fontSize = sizes[fontSize] ?? '11px';
  }, [fontSize]);

  /* ── Apply icon size via CSS custom property ── */
  useEffect(() => {
    const root = document.documentElement;
    const iconSizes: Record<string, string> = {
      'Large Icons': '32',
      'Standard Icons': '24',
      'Small Icons': '16',
      'large': '32',
      'small': '16',
    };
    root.style.setProperty('--desktop-icon-size', (iconSizes[iconSize] ?? '32') + 'px');
  }, [iconSize]);

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
        title: w.title,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDesktopClick = useCallback(() => {
    clearSelection();
    closeStartMenu();
    hideContextMenu();
  }, [clearSelection, closeStartMenu, hideContextMenu]);

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, 'desktop');
    },
    [showContextMenu],
  );

  /* ── Rubber Band Selection ── */
  const selBoxRef = useRef<{ startX: number; startY: number } | null>(null);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // Only start rubber band on left click directly on the icons area (not on an icon)
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target !== iconsRef.current) return;

      const rect = iconsRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      selBoxRef.current = { startX: x, startY: y };

      const onMove = (ev: globalThis.MouseEvent) => {
        if (!selBoxRef.current) return;
        const mx = ev.clientX - rect.left;
        const my = ev.clientY - rect.top;
        setSelectionBox({
          startX: selBoxRef.current.startX,
          startY: selBoxRef.current.startY,
          endX: mx,
          endY: my,
        });

        // Find icons within the rubber band
        const minX = Math.min(selBoxRef.current.startX, mx);
        const maxX = Math.max(selBoxRef.current.startX, mx);
        const minY = Math.min(selBoxRef.current.startY, my);
        const maxY = Math.max(selBoxRef.current.startY, my);

        const iconEls = iconsRef.current?.querySelectorAll('[data-icon-id]');
        const selected: string[] = [];
        iconEls?.forEach((el) => {
          const iconRect = el.getBoundingClientRect();
          const iconRelX = iconRect.left - rect.left;
          const iconRelY = iconRect.top - rect.top;
          const iconRight = iconRelX + iconRect.width;
          const iconBottom = iconRelY + iconRect.height;

          if (iconRelX < maxX && iconRight > minX && iconRelY < maxY && iconBottom > minY) {
            selected.push(el.getAttribute('data-icon-id')!);
          }
        });
        selectIconsInRect(selected);
      };

      const onUp = () => {
        selBoxRef.current = null;
        setSelectionBox(null);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [setSelectionBox, selectIconsInRect],
  );

  // All icons (static + dynamic)
  const allIcons = [
    ...ICONS,
    ...dynamicItems.map((d) => ({
      id: d.id,
      label: d.label,
      icon: d.icon,
      windowId: d.windowId,
    })),
  ];

  // All windows (static + dynamic)
  const allWindows = [
    ...WINDOWS,
    ...dynamicItems.map((d) => {
      const isPaint = d.label.endsWith('.bmp');
      return {
        id: d.windowId,
        title: d.type === 'folder' ? d.label : isPaint ? `${d.label} - Paint` : `${d.label} - Notepad`,
        icon: d.icon,
        defaultWidth: d.type === 'folder' ? 420 : isPaint ? 640 : 480,
        defaultHeight: d.type === 'folder' ? 300 : isPaint ? 480 : 360,
        defaultX: 100,
        defaultY: 50,
        menus: isPaint ? PAINT_MENUS : d.type === 'notepad' ? NOTEPAD_MENUS : undefined,
      };
    }),
  ];

  // Render rubber band rectangle
  const renderSelectionBox = () => {
    if (!selectionBox) return null;
    const left = Math.min(selectionBox.startX, selectionBox.endX);
    const top = Math.min(selectionBox.startY, selectionBox.endY);
    const width = Math.abs(selectionBox.endX - selectionBox.startX);
    const height = Math.abs(selectionBox.endY - selectionBox.startY);
    return (
      <div className={styles.selectionBox} style={{ left, top, width, height }} />
    );
  };

  // Build wallpaper style dynamically
  const desktopStyle: React.CSSProperties = {};
  if (brightness !== 100 || contrast !== 100) {
    desktopStyle.filter = `brightness(${brightness / 100}) contrast(${contrast / 100})`;
  }
  if (wallpaper) {
    desktopStyle.backgroundImage = `url(${wallpaper})`;
    if (wallpaperStyle === 'stretch') {
      desktopStyle.backgroundSize = 'cover';
      desktopStyle.backgroundPosition = 'center';
      desktopStyle.backgroundRepeat = 'no-repeat';
    } else if (wallpaperStyle === 'center') {
      desktopStyle.backgroundSize = 'contain';
      desktopStyle.backgroundPosition = 'center';
      desktopStyle.backgroundRepeat = 'no-repeat';
    } else {
      desktopStyle.backgroundSize = 'auto';
      desktopStyle.backgroundRepeat = 'repeat';
    }
  }

  return (
    <div className={styles.desktop} style={desktopStyle}>
      {/* Icon grid */}
      <div
        ref={iconsRef}
        className={styles.icons}
        onClick={handleDesktopClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
      >
        {allIcons.map((ic) => (
          <DesktopIcon
            key={ic.id}
            id={ic.id}
            label={ic.label}
            icon={ic.icon}
            windowId={ic.windowId}
          />
        ))}
        {renderSelectionBox()}
      </div>

      {/* Windows */}
      <AnimatePresence>
        {allWindows.map((wc) => {
          const win = windows[wc.id];
          if (!win || !win.isOpen) return null;

          // Check if it's a dynamic notepad/paint
          const dynItem = dynamicItems.find((d) => d.windowId === wc.id);
          const isStaticWindow = WINDOW_CONTENT[wc.id];
          const isPaintFile = dynItem?.label.endsWith('.bmp');

          let content: React.ReactNode;
          if (isStaticWindow) {
            const Content = isStaticWindow;
            content = <Content />;
          } else if (isPaintFile) {
            content = <Paint />;
          } else if (dynItem?.type === 'notepad') {
            content = <DynamicNotepad fileId={wc.id} />;
          } else {
            // Dynamic folder — show empty explorer
            content = (
              <div style={{ padding: 16, color: 'var(--win-dark)', textAlign: 'center', fontFamily: 'var(--font-system)', fontSize: 11 }}>
                This folder is empty.
              </div>
            );
          }

          return (
            <Window
              key={wc.id}
              id={wc.id}
              title={wc.title}
              icon={wc.icon}
              menus={wc.menus}
            >
              {content}
            </Window>
          );
        })}
      </AnimatePresence>

      <ContextMenu />
      <PropertiesDialog />
      <StartMenu />
      <ShutdownDialog />
      <Taskbar />
    </div>
  );
}
