import { create } from 'zustand';
import type { AppPhase, WindowState, ContextMenuState, ContextMenuVariant, IconPosition } from '../types';

export interface PropertiesDialog {
  visible: boolean;
  title: string;
  info: Record<string, string>;
}

export interface DynamicDesktopItem {
  id: string;
  label: string;
  icon: string;
  windowId: string;
  type: 'folder' | 'notepad';
}

interface DesktopStore {
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;

  windows: Record<string, WindowState>;
  highestZ: number;
  activeWindowId: string | null;

  registerWindow: (id: string, state: WindowState) => void;
  openWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  bringToFront: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateSize: (id: string, width: number, height: number) => void;

  startMenuOpen: boolean;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;

  // Multi-select icons
  selectedIcons: Set<string>;
  selectIcon: (id: string | null) => void;
  toggleSelectIcon: (id: string) => void;
  selectIconsInRect: (ids: string[]) => void;
  clearSelection: () => void;

  // Backward compat
  selectedIcon: string | null;

  iconPositions: Record<string, IconPosition>;
  updateIconPosition: (id: string, x: number, y: number) => void;
  arrangeIcons: () => void;

  contextMenu: ContextMenuState;
  showContextMenu: (x: number, y: number, variant: ContextMenuVariant, targetId?: string) => void;
  hideContextMenu: () => void;

  // Fake filesystem for saving notepad content
  fileSystem: Record<string, string>;
  saveFile: (filename: string, content: string) => void;
  loadFile: (filename: string) => string | undefined;

  // Dynamic desktop items (user-created folders/notepads)
  dynamicItems: DynamicDesktopItem[];
  addDesktopItem: (type: 'folder' | 'notepad') => void;
  removeDesktopItem: (id: string) => void;
  renameDesktopItem: (id: string, newLabel: string) => void;

  // Properties dialog (Win95-style, not browser alert)
  propertiesDialog: PropertiesDialog | null;
  showProperties: (title: string, info: Record<string, string>) => void;
  hideProperties: () => void;

  // Selection box (rubber band)
  selectionBox: { startX: number; startY: number; endX: number; endY: number } | null;
  setSelectionBox: (box: { startX: number; startY: number; endX: number; endY: number } | null) => void;

  // Track all icon IDs for arrange
  allIconIds: string[];
  setAllIconIds: (ids: string[]) => void;
}

let dynamicCounter = 0;

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  phase: 'boot',
  setPhase: (phase) => set({ phase }),

  windows: {},
  highestZ: 100,
  activeWindowId: null,

  registerWindow: (id, state) =>
    set((s) => {
      // Don't overwrite if already registered (preserves re-opened state)
      if (s.windows[id]) return s;
      return { windows: { ...s.windows, [id]: state } };
    }),

  openWindow: (id) => {
    const { windows, highestZ } = get();
    const win = windows[id];
    if (!win) return;
    const newZ = highestZ + 1;
    set((s) => ({
      highestZ: newZ,
      activeWindowId: id,
      startMenuOpen: false,
      windows: {
        ...s.windows,
        [id]: { ...win, isOpen: true, isMinimized: false, zIndex: newZ },
      },
    }));
  },

  closeWindow: (id) =>
    set((s) => {
      const win = s.windows[id];
      if (!win) return s;
      return {
        windows: {
          ...s.windows,
          [id]: { ...win, isOpen: false, isMinimized: false, isMaximized: false },
        },
        activeWindowId: s.activeWindowId === id ? null : s.activeWindowId,
      };
    }),

  minimizeWindow: (id) =>
    set((s) => {
      const win = s.windows[id];
      if (!win) return s;
      return {
        windows: { ...s.windows, [id]: { ...win, isMinimized: true } },
        activeWindowId: s.activeWindowId === id ? null : s.activeWindowId,
      };
    }),

  toggleMaximize: (id) =>
    set((s) => {
      const win = s.windows[id];
      if (!win) return s;
      return {
        windows: { ...s.windows, [id]: { ...win, isMaximized: !win.isMaximized } },
      };
    }),

  bringToFront: (id) => {
    const { highestZ } = get();
    const newZ = highestZ + 1;
    set((s) => ({
      highestZ: newZ,
      activeWindowId: id,
      windows: { ...s.windows, [id]: { ...s.windows[id]!, zIndex: newZ } },
    }));
  },

  updatePosition: (id, x, y) =>
    set((s) => {
      const win = s.windows[id];
      if (!win) return s;
      return { windows: { ...s.windows, [id]: { ...win, x, y } } };
    }),

  updateSize: (id, width, height) =>
    set((s) => {
      const win = s.windows[id];
      if (!win) return s;
      return { windows: { ...s.windows, [id]: { ...win, width, height } } };
    }),

  startMenuOpen: false,
  toggleStartMenu: () => set((s) => ({ startMenuOpen: !s.startMenuOpen })),
  closeStartMenu: () => set({ startMenuOpen: false }),

  // Multi-select
  selectedIcons: new Set<string>(),
  selectedIcon: null,

  selectIcon: (id) => set({
    selectedIcons: id ? new Set([id]) : new Set(),
    selectedIcon: id,
  }),

  toggleSelectIcon: (id) => set((s) => {
    const next = new Set(s.selectedIcons);
    if (next.has(id)) next.delete(id); else next.add(id);
    return { selectedIcons: next, selectedIcon: next.size === 1 ? [...next][0]! : null };
  }),

  selectIconsInRect: (ids) => set({
    selectedIcons: new Set(ids),
    selectedIcon: ids.length === 1 ? ids[0]! : null,
  }),

  clearSelection: () => set({ selectedIcons: new Set(), selectedIcon: null }),

  iconPositions: {},
  updateIconPosition: (id, x, y) =>
    set((s) => ({ iconPositions: { ...s.iconPositions, [id]: { x, y } } })),

  arrangeIcons: () =>
    set(() => {
      // Reset all icon positions to grid layout (clear custom positions)
      return { iconPositions: {} };
    }),

  contextMenu: { visible: false, x: 0, y: 0, variant: 'desktop' },
  showContextMenu: (x, y, variant, targetId) =>
    set({ contextMenu: { visible: true, x, y, variant, targetId } }),
  hideContextMenu: () =>
    set({ contextMenu: { visible: false, x: 0, y: 0, variant: 'desktop' } }),

  // Fake filesystem
  fileSystem: {},
  saveFile: (filename, content) =>
    set((s) => ({ fileSystem: { ...s.fileSystem, [filename]: content } })),
  loadFile: (filename) => get().fileSystem[filename],

  // Dynamic desktop items
  dynamicItems: [],
  addDesktopItem: (type) => {
    dynamicCounter++;
    const id = `dynamic-${type}-${dynamicCounter}`;
    const windowId = id;
    const label = type === 'folder' ? 'New Folder' : 'New Text Document.txt';
    const icon = type === 'folder' ? 'folder' : 'notepad';
    const item: DynamicDesktopItem = { id, label, icon, windowId, type };

    // Register the window for this item
    const { highestZ } = get();
    set((s) => ({
      dynamicItems: [...s.dynamicItems, item],
      windows: {
        ...s.windows,
        [windowId]: {
          isOpen: false,
          isMinimized: false,
          isMaximized: false,
          zIndex: highestZ,
          x: 100 + dynamicCounter * 20,
          y: 50 + dynamicCounter * 20,
          width: type === 'folder' ? 420 : 480,
          height: type === 'folder' ? 300 : 360,
        },
      },
    }));

    // Initialize empty file content for notepads
    if (type === 'notepad') {
      get().saveFile(windowId, '');
    }
  },

  removeDesktopItem: (id) =>
    set((s) => ({
      dynamicItems: s.dynamicItems.filter((i) => i.id !== id),
    })),

  renameDesktopItem: (id, newLabel) =>
    set((s) => ({
      dynamicItems: s.dynamicItems.map((i) =>
        i.id === id ? { ...i, label: newLabel } : i
      ),
    })),

  // Properties dialog
  propertiesDialog: null,
  showProperties: (title, info) =>
    set({ propertiesDialog: { visible: true, title, info } }),
  hideProperties: () =>
    set({ propertiesDialog: null }),

  // Selection box
  selectionBox: null,
  setSelectionBox: (box) => set({ selectionBox: box }),

  allIconIds: [],
  setAllIconIds: (ids) => set({ allIconIds: ids }),
}));
