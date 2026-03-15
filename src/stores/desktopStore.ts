import { create } from 'zustand';
import type { AppPhase, WindowState, ContextMenuState, ContextMenuVariant, IconPosition } from '../types';

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

  selectedIcon: string | null;
  selectIcon: (id: string | null) => void;

  iconPositions: Record<string, IconPosition>;
  updateIconPosition: (id: string, x: number, y: number) => void;

  contextMenu: ContextMenuState;
  showContextMenu: (x: number, y: number, variant: ContextMenuVariant, targetId?: string) => void;
  hideContextMenu: () => void;
}

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  phase: 'boot',
  setPhase: (phase) => set({ phase }),

  windows: {},
  highestZ: 100,
  activeWindowId: null,

  registerWindow: (id, state) =>
    set((s) => ({ windows: { ...s.windows, [id]: state } })),

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

  selectedIcon: null,
  selectIcon: (id) => set({ selectedIcon: id }),

  iconPositions: {},
  updateIconPosition: (id, x, y) =>
    set((s) => ({ iconPositions: { ...s.iconPositions, [id]: { x, y } } })),

  contextMenu: { visible: false, x: 0, y: 0, variant: 'desktop' },
  showContextMenu: (x, y, variant, targetId) =>
    set({ contextMenu: { visible: true, x, y, variant, targetId } }),
  hideContextMenu: () =>
    set({ contextMenu: { visible: false, x: 0, y: 0, variant: 'desktop' } }),
}));
