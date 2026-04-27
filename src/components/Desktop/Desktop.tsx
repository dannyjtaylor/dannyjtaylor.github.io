import { useEffect, useCallback, useRef, type MouseEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '../../stores/desktopStore';
import { DesktopIcon } from '../DesktopIcon/DesktopIcon';
import { Taskbar } from '../Taskbar/Taskbar';
import { StartMenu } from '../StartMenu/StartMenu';
import { ShutdownDialog } from '../ShutdownDialog/ShutdownDialog';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { PropertiesDialog } from '../PropertiesDialog/PropertiesDialog';
import { SaveAsDialog } from '../SaveAsDialog/SaveAsDialog';
import { Screensaver } from '../Screensaver/Screensaver';
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
import { Breadbox } from '../../windows/Voltbox';
import { AOLChat } from '../../windows/AOLChat';
import { Paint, PAINT_MENUS } from '../../windows/Paint';
import { DateTime } from '../../windows/DateTime';
import { Settings } from '../../windows/Settings';
import { MusicPlayer } from '../../windows/MusicPlayer';
import { DynamicNotepad } from '../../windows/DynamicNotepad';
import { CookieClicker } from '../../windows/CookieClicker';
import { NYTGames } from '../../windows/NYTGames';
import { Leaderboard } from '../../windows/Leaderboard';
import { Birthdays } from '../../windows/Birthdays';
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
  { id: 'icon-contact',    label: 'Contact',        icon: 'mail',      windowId: 'contact' },
  { id: 'icon-mycomputer', label: 'My Computer',    icon: 'computer',  windowId: 'mycomputer' },
  { id: 'icon-recycle',    label: 'Recycle Bin',    icon: 'recycle',   windowId: 'recycle' },
  { id: 'icon-terminal',   label: 'MS-DOS',         icon: 'console',   windowId: 'terminal' },
  { id: 'icon-portfolio',  label: 'Portfolio',      icon: 'document',  windowId: 'portfolio' },
  { id: 'icon-transcript', label: 'Transcript',     icon: 'notepad',   windowId: 'transcript' },
  { id: 'icon-discord',    label: '/gather Bot',    icon: 'discord',   windowId: 'discord' },
  { id: 'icon-interests',  label: 'Interests',      icon: 'document',  windowId: 'interests' },
  { id: 'icon-breadbox',  label: 'Breadbox',       icon: 'breadbox',  windowId: 'breadbox' },
  { id: 'icon-minesweeper', label: 'Minesweeper',  icon: 'minesweeper', windowId: 'minesweeper' },
  { id: 'icon-steam',     label: 'Steam',          icon: 'steam',     windowId: 'steam' },
  { id: 'icon-aol',       label: 'AOL Messenger',  icon: 'aol',       windowId: 'aol' },
  { id: 'icon-paint',     label: 'Paint',          icon: 'paint',     windowId: 'paint' },
  { id: 'icon-datetime',  label: 'Date/Time',      icon: 'datetime',  windowId: 'datetime' },
  { id: 'icon-settings',  label: 'Settings',       icon: 'settings',  windowId: 'settings' },
  { id: 'icon-musicplayer', label: 'Music Player', icon: 'musicplayer', windowId: 'musicplayer' },
  { id: 'icon-nytgames', label: 'NYT Games', icon: 'document', windowId: 'nytgames' },
  { id: 'icon-credits', label: 'Credits', icon: 'credits', windowId: 'credits', externalUrl: '/credits' },
  { id: 'icon-leaderboard', label: 'Leaderboard.txt', icon: 'notepad', windowId: 'leaderboard' },
  { id: 'icon-birthdays',   label: 'Birthdays',        icon: 'cake',    windowId: 'birthdays' },
];

const WINDOWS: WindowConfig[] = [
  { id: 'about',      title: 'About Me',               icon: 'document',  defaultWidth: 500, defaultHeight: 380, defaultX: 80,  defaultY: 40 },
  { id: 'projects',   title: 'C:\\Projects',            icon: 'file',      defaultWidth: 540, defaultHeight: 400, defaultX: 140, defaultY: 60,  menus: EXPLORER_MENUS },
  { id: 'resume',     title: 'Resume',                  icon: 'notepad',   defaultWidth: 520, defaultHeight: 420, defaultX: 120, defaultY: 50 },
  { id: 'contact',    title: 'New Message',             icon: 'mail',      defaultWidth: 460, defaultHeight: 340, defaultX: 160, defaultY: 80,  menus: MAIL_MENUS },
  { id: 'mycomputer', title: 'My Computer',             icon: 'computer',  defaultWidth: 480, defaultHeight: 360, defaultX: 100, defaultY: 40,  menus: EXPLORER_MENUS },
  { id: 'recycle',    title: 'Recycle Bin',             icon: 'recycle',   defaultWidth: 420, defaultHeight: 300, defaultX: 200, defaultY: 100, menus: EXPLORER_MENUS },
  { id: 'terminal',   title: 'MS-DOS Prompt',           icon: 'console',   defaultWidth: 560, defaultHeight: 380, defaultX: 60,  defaultY: 30 },
  { id: 'valorant',   title: 'VALORANT',                icon: 'valorant',  defaultWidth: 520, defaultHeight: 400, defaultX: 90,  defaultY: 35 },
  { id: 'undertale',  title: 'UNDERTALE',               icon: 'undertale', defaultWidth: 320, defaultHeight: 380, defaultX: 150, defaultY: 30 },
  { id: 'portfolio',  title: 'Portfolio',               icon: 'document',  defaultWidth: 520, defaultHeight: 440, defaultX: 110, defaultY: 35 },
  { id: 'transcript', title: 'Transcript.txt - Notepad',icon: 'notepad',   defaultWidth: 500, defaultHeight: 460, defaultX: 130, defaultY: 25,  menus: NOTEPAD_MENUS },
  { id: 'minesweeper',title: 'Minesweeper',              icon: 'minesweeper', defaultWidth: 200, defaultHeight: 260, defaultX: 200, defaultY: 60 },
  { id: 'discord',    title: '/gather Discord Bot',     icon: 'discord',   defaultWidth: 360, defaultHeight: 260, defaultX: 180, defaultY: 70 },
  { id: 'cavestory',  title: 'Cave Story',              icon: 'cavestory', defaultWidth: 640, defaultHeight: 480, defaultX: 80,  defaultY: 20 },
  { id: 'interests',  title: 'Interests',               icon: 'document',  defaultWidth: 440, defaultHeight: 460, defaultX: 120, defaultY: 30 },
  { id: 'breadbox',  title: 'Breadbox.exe',             icon: 'breadbox',  defaultWidth: 900, defaultHeight: 640, defaultX: 40,  defaultY: 15 },
  { id: 'steam',     title: 'Steam',                    icon: 'steam',     defaultWidth: 680, defaultHeight: 500, defaultX: 80,  defaultY: 25 },
  { id: 'aol',       title: 'AOL Instant Messenger',    icon: 'aol',       defaultWidth: 380, defaultHeight: 420, defaultX: 160, defaultY: 50 },
  { id: 'paint',    title: 'untitled - Paint',          icon: 'paint',     defaultWidth: 640, defaultHeight: 480, defaultX: 60,  defaultY: 20, menus: PAINT_MENUS },
  { id: 'datetime', title: 'Date/Time Properties',      icon: 'datetime',  defaultWidth: 410, defaultHeight: 370, defaultX: 140, defaultY: 40 },
  { id: 'settings', title: 'Display Properties',        icon: 'settings',  defaultWidth: 420, defaultHeight: 500, defaultX: 120, defaultY: 30 },
  { id: 'musicplayer', title: 'Music Player',            icon: 'musicplayer', defaultWidth: 480, defaultHeight: 440, defaultX: 100, defaultY: 35 },
  { id: 'cookieclicker', title: 'Cookie Clicker',       icon: 'file',       defaultWidth: 640, defaultHeight: 480, defaultX: 80,  defaultY: 20 },
  { id: 'nytgames', title: 'NYT Games',                  icon: 'document',  defaultWidth: 500, defaultHeight: 520, defaultX: 100, defaultY: 30 },
  { id: 'leaderboard', title: 'Leaderboard.txt - Notepad', icon: 'notepad', defaultWidth: 380, defaultHeight: 420, defaultX: 160, defaultY: 60 },
  { id: 'birthdays',   title: 'Birthdays',                 icon: 'cake',   defaultWidth: 500, defaultHeight: 440, defaultX: 140, defaultY: 55 },
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
  breadbox: Breadbox,
  steam: Steam,
  aol: AOLChat,
  paint: Paint,
  datetime: DateTime,
  settings: Settings,
  musicplayer: MusicPlayer,
  cookieclicker: CookieClicker,
  nytgames: NYTGames,
  leaderboard: Leaderboard,
  birthdays: Birthdays,
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
  const pendingFileData = useDesktopStore((s) => s.pendingFileData);
  const iconLabelOverrides = useDesktopStore((s) => s.iconLabelOverrides);
  const recycleBin = useDesktopStore((s) => s.recycleBin);
  const hiddenIcons = useDesktopStore((s) => s.hiddenIcons);
  const wallpaper = useDesktopStore((s) => s.wallpaper);
  const wallpaperStyle = useDesktopStore((s) => s.wallpaperStyle);
  const brightness = useDesktopStore((s) => s.brightness);
  const contrast = useDesktopStore((s) => s.contrast);
  const colorScheme = useDesktopStore((s) => s.colorScheme);
  const fontSize = useDesktopStore((s) => s.fontSize);
  const iconSize = useDesktopStore((s) => s.iconSize);
  const cursorTheme = useDesktopStore((s) => s.cursorTheme);

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

  /* ── Load cursor.png as resized pointer cursor + apply cursor themes ── */
  useEffect(() => {
    const root = document.documentElement;

    // Cursor theme definitions — each has default (arrow), pointer (hand), text (I-beam)
    const CURSOR_THEMES: Record<string, { default: string; pointer: string; text: string }> = {
      'Windows Default': {
        default: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='19' viewBox='0 0 12 19'%3E%3Cpath d='M1 1v15l4-4 2.8 5.2 1.4-.8-2.8-5.2L11 11z' fill='white' stroke='black' stroke-width='.8' stroke-linejoin='round'/%3E%3C/svg%3E") 0 0`,
        pointer: '', // will be set from cursor.png below
        text: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='16' viewBox='0 0 7 16'%3E%3Cpath d='M1 0h5M3.5 0v16M1 16h5' fill='none' stroke='black' stroke-width='1'/%3E%3C/svg%3E") 3 8`,
      },
      'Inverted': {
        default: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='19' viewBox='0 0 12 19'%3E%3Cpath d='M1 1v15l4-4 2.8 5.2 1.4-.8-2.8-5.2L11 11z' fill='black' stroke='white' stroke-width='.8' stroke-linejoin='round'/%3E%3C/svg%3E") 0 0`,
        pointer: '', // also set from cursor.png
        text: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='16' viewBox='0 0 7 16'%3E%3Cpath d='M1 0h5M3.5 0v16M1 16h5' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E") 3 8`,
      },
      'Neon': {
        default: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='19' viewBox='0 0 12 19'%3E%3Cpath d='M1 1v15l4-4 2.8 5.2 1.4-.8-2.8-5.2L11 11z' fill='%2300ff88' stroke='%23003322' stroke-width='.8' stroke-linejoin='round'/%3E%3C/svg%3E") 0 0`,
        pointer: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='20' viewBox='0 0 15 20'%3E%3Cpath d='M5.5 0v8H3v2H1v7h10v-2h2V9h-2V8h-2V7H7V1h-1.5z' fill='%2300ff88' stroke='%23003322' stroke-width='.6'/%3E%3C/svg%3E") 5 0`,
        text: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='16' viewBox='0 0 7 16'%3E%3Cpath d='M1 0h5M3.5 0v16M1 16h5' fill='none' stroke='%2300ff88' stroke-width='1'/%3E%3C/svg%3E") 3 8`,
      },
      'Hotdog': {
        default: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='19' viewBox='0 0 12 19'%3E%3Cpath d='M1 1v15l4-4 2.8 5.2 1.4-.8-2.8-5.2L11 11z' fill='%23ffcc00' stroke='%23ff0000' stroke-width='1' stroke-linejoin='round'/%3E%3C/svg%3E") 0 0`,
        pointer: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='20' viewBox='0 0 15 20'%3E%3Cpath d='M5.5 0v8H3v2H1v7h10v-2h2V9h-2V8h-2V7H7V1h-1.5z' fill='%23ffcc00' stroke='%23ff0000' stroke-width='.8'/%3E%3C/svg%3E") 5 0`,
        text: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='16' viewBox='0 0 7 16'%3E%3Cpath d='M1 0h5M3.5 0v16M1 16h5' fill='none' stroke='%23ff0000' stroke-width='1'/%3E%3C/svg%3E") 3 8`,
      },
      'Ocean': {
        default: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='19' viewBox='0 0 12 19'%3E%3Cpath d='M1 1v15l4-4 2.8 5.2 1.4-.8-2.8-5.2L11 11z' fill='%2366ccff' stroke='%23003366' stroke-width='.8' stroke-linejoin='round'/%3E%3C/svg%3E") 0 0`,
        pointer: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='20' viewBox='0 0 15 20'%3E%3Cpath d='M5.5 0v8H3v2H1v7h10v-2h2V9h-2V8h-2V7H7V1h-1.5z' fill='%2366ccff' stroke='%23003366' stroke-width='.6'/%3E%3C/svg%3E") 5 0`,
        text: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='16' viewBox='0 0 7 16'%3E%3Cpath d='M1 0h5M3.5 0v16M1 16h5' fill='none' stroke='%23003366' stroke-width='1'/%3E%3C/svg%3E") 3 8`,
      },
      'Lavender': {
        default: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='19' viewBox='0 0 12 19'%3E%3Cpath d='M1 1v15l4-4 2.8 5.2 1.4-.8-2.8-5.2L11 11z' fill='%23cc99ff' stroke='%234400aa' stroke-width='.8' stroke-linejoin='round'/%3E%3C/svg%3E") 0 0`,
        pointer: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='20' viewBox='0 0 15 20'%3E%3Cpath d='M5.5 0v8H3v2H1v7h10v-2h2V9h-2V8h-2V7H7V1h-1.5z' fill='%23cc99ff' stroke='%234400aa' stroke-width='.6'/%3E%3C/svg%3E") 5 0`,
        text: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='16' viewBox='0 0 7 16'%3E%3Cpath d='M1 0h5M3.5 0v16M1 16h5' fill='none' stroke='%234400aa' stroke-width='1'/%3E%3C/svg%3E") 3 8`,
      },
      'Crosshair': {
        default: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='17' height='17' viewBox='0 0 17 17'%3E%3Ccircle cx='8.5' cy='8.5' r='7' fill='none' stroke='%23ff3333' stroke-width='1'/%3E%3Cline x1='8.5' y1='0' x2='8.5' y2='5' stroke='%23ff3333' stroke-width='1'/%3E%3Cline x1='8.5' y1='12' x2='8.5' y2='17' stroke='%23ff3333' stroke-width='1'/%3E%3Cline x1='0' y1='8.5' x2='5' y2='8.5' stroke='%23ff3333' stroke-width='1'/%3E%3Cline x1='12' y1='8.5' x2='17' y2='8.5' stroke='%23ff3333' stroke-width='1'/%3E%3Ccircle cx='8.5' cy='8.5' r='1' fill='%23ff3333'/%3E%3C/svg%3E") 8 8`,
        pointer: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='17' height='17' viewBox='0 0 17 17'%3E%3Ccircle cx='8.5' cy='8.5' r='7' fill='none' stroke='%2300ff00' stroke-width='1'/%3E%3Cline x1='8.5' y1='0' x2='8.5' y2='5' stroke='%2300ff00' stroke-width='1'/%3E%3Cline x1='8.5' y1='12' x2='8.5' y2='17' stroke='%2300ff00' stroke-width='1'/%3E%3Cline x1='0' y1='8.5' x2='5' y2='8.5' stroke='%2300ff00' stroke-width='1'/%3E%3Cline x1='12' y1='8.5' x2='17' y2='8.5' stroke='%2300ff00' stroke-width='1'/%3E%3Ccircle cx='8.5' cy='8.5' r='1' fill='%2300ff00'/%3E%3C/svg%3E") 8 8`,
        text: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='16' viewBox='0 0 7 16'%3E%3Cpath d='M1 0h5M3.5 0v16M1 16h5' fill='none' stroke='%23ff3333' stroke-width='1'/%3E%3C/svg%3E") 3 8`,
      },
      'Pixel Sword': {
        default: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect x='12' y='0' width='2' height='2' fill='%23888'/%3E%3Crect x='10' y='2' width='2' height='2' fill='%23ccc'/%3E%3Crect x='8' y='4' width='2' height='2' fill='%23ccc'/%3E%3Crect x='6' y='6' width='2' height='2' fill='%23ccc'/%3E%3Crect x='4' y='8' width='2' height='2' fill='%23964B00'/%3E%3Crect x='2' y='10' width='2' height='2' fill='%23964B00'/%3E%3Crect x='0' y='12' width='2' height='2' fill='%23ffcc00'/%3E%3Crect x='14' y='0' width='2' height='2' fill='%23aaa'/%3E%3Crect x='12' y='2' width='2' height='2' fill='%23ddd'/%3E%3Crect x='10' y='4' width='2' height='2' fill='%23ddd'/%3E%3C/svg%3E") 0 0`,
        pointer: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='20' viewBox='0 0 15 20'%3E%3Cpath d='M5.5 0v8H3v2H1v7h10v-2h2V9h-2V8h-2V7H7V1h-1.5z' fill='%23ffcc00' stroke='%23964B00' stroke-width='.6'/%3E%3C/svg%3E") 5 0`,
        text: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='16' viewBox='0 0 7 16'%3E%3Cpath d='M1 0h5M3.5 0v16M1 16h5' fill='none' stroke='%23964B00' stroke-width='1'/%3E%3C/svg%3E") 3 8`,
      },
    };

    // Load and resize cursor.png for the pointer cursor (used by Windows Default and Inverted)
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = 24;
      const h = Math.round((img.height / img.width) * w);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/png');
        const cursorCss = `url("${dataUrl}") 8 0`;
        // Set the loaded cursor for themes that need it
        CURSOR_THEMES['Windows Default']!.pointer = cursorCss;
        CURSOR_THEMES['Inverted']!.pointer = cursorCss;
        applyCursorTheme();
      }
    };
    img.src = '/cursors/cursor.png';

    function applyCursorTheme() {
      const theme = CURSOR_THEMES[cursorTheme] ?? CURSOR_THEMES['Windows Default']!;
      if (theme.default) root.style.setProperty('--cursor-default', theme.default);
      if (theme.pointer) root.style.setProperty('--cursor-pointer', theme.pointer);
      if (theme.text) root.style.setProperty('--cursor-text', theme.text);
    }

    // Apply immediately for non-cursor.png themes
    applyCursorTheme();
  }, [cursorTheme]);

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

  /* ── Position Credits & Leaderboard icons in top-right column ── */
  const updateIconPosition = useDesktopStore((s) => s.updateIconPosition);
  const iconPositions = useDesktopStore((s) => s.iconPositions);
  useEffect(() => {
    // Only set initial positions once (if they haven't been dragged)
    if (!iconPositions['icon-credits'] && !iconPositions['icon-leaderboard']) {
      const rightX = window.innerWidth - 85;
      const snappedX = Math.round(rightX / 75) * 75;
      updateIconPosition('icon-credits', snappedX, 0);
      updateIconPosition('icon-leaderboard', snappedX, 75);
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

  // All icons (static + dynamic), applying any label overrides from rename
  // Filter out hidden static icons (those sent to recycle bin)
  const allIcons = [
    ...ICONS.filter((ic) => !hiddenIcons.has(ic.id)).map((ic) => ({
      ...ic,
      label: iconLabelOverrides[ic.id] || ic.label,
      // Dynamically change recycle bin icon based on contents
      icon: ic.id === 'icon-recycle'
        ? (recycleBin.length > 0 ? 'recyclebinfull' : 'recyclebinempty')
        : ic.icon,
    })),
    ...dynamicItems.map((d) => ({
      id: d.id,
      label: iconLabelOverrides[d.id] || d.label,
      icon: d.icon,
      windowId: d.windowId,
      externalUrl: undefined as string | undefined,
    })),
  ];

  // Pending files as an array for mapping
  const pendingFileItems = Object.values(pendingFileData);

  // All windows (static + dynamic + pending + project files)
  const staticAndDynamicIds = new Set([
    ...WINDOWS.map((w) => w.id),
    ...dynamicItems.map((d) => d.windowId),
    ...pendingFileItems.map((d) => d.windowId),
  ]);

  // Find project file windows (registered by Projects component)
  const projectFileWindows = Object.keys(windows)
    .filter((id) => id.startsWith('proj-') && !staticAndDynamicIds.has(id))
    .map((id) => ({
      id,
      title: windows[id]!.title || id,
      icon: 'notepad',
      defaultWidth: 480,
      defaultHeight: 360,
      defaultX: 160,
      defaultY: 60,
      menus: NOTEPAD_MENUS,
    }));

  // Helper to map a dynamic/pending item to a window config
  const dynamicItemToWindowConfig = (d: typeof dynamicItems[number]) => {
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
  };

  const allWindows = [
    ...WINDOWS,
    ...dynamicItems.map(dynamicItemToWindowConfig),
    ...pendingFileItems.map(dynamicItemToWindowConfig),
    ...projectFileWindows,
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
            externalUrl={ic.externalUrl}
          />
        ))}
        {renderSelectionBox()}
      </div>

      {/* Windows */}
      <AnimatePresence>
        {allWindows.map((wc) => {
          const win = windows[wc.id];
          if (!win || !win.isOpen) return null;

          // Check if it's a dynamic notepad/paint (committed or pending)
          const dynItem = dynamicItems.find((d) => d.windowId === wc.id)
            || pendingFileData[wc.id];
          const isStaticWindow = WINDOW_CONTENT[wc.id];
          const isPaintFile = dynItem?.label.endsWith('.bmp');

          let content: React.ReactNode;
          if (isStaticWindow) {
            const Content = isStaticWindow;
            content = <Content />;
          } else if (isPaintFile) {
            content = <Paint fileId={wc.id} />;
          } else if (dynItem?.type === 'notepad') {
            content = <DynamicNotepad fileId={wc.id} />;
          } else if (wc.id.startsWith('proj-')) {
            // Project file opened from Projects folder
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
      <SaveAsDialog />
      <StartMenu />
      <ShutdownDialog />
      <Screensaver />
      <Taskbar />
    </div>
  );
}
