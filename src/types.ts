export interface MenuItemConfig {
  label?: string;
  action?: string;
  shortcut?: string;
  disabled?: boolean;
  checked?: boolean;
  separator?: boolean;
}

export interface MenuConfig {
  label: string;
  items: MenuItemConfig[];
}

export interface WindowConfig {
  id: string;
  title: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultX: number;
  defaultY: number;
  menus?: MenuConfig[];
}

export interface WindowState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
}

export type AppPhase = 'boot' | 'desktop' | 'shutdown-prompt' | 'shutdown' | 'sleep' | 'restarting';

export interface DesktopIconConfig {
  id: string;
  label: string;
  icon: string;
  windowId: string;
}

export type ContextMenuVariant = 'desktop' | 'icon' | 'notepad' | 'explorer';

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  variant: ContextMenuVariant;
  targetId?: string;
}

export interface IconPosition {
  x: number;
  y: number;
}
