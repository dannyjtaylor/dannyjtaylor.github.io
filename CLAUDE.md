# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

1. **Use extended thinking ("ultrathink") on every prompt.** Always enable maximum-depth reasoning before responding.
2. **Search the web for the latest documentation before making any change.** Every time you modify code involving a library, API, or framework, look up the newest docs first. Do not rely on cached knowledge alone.
3. **Only implement changes you are 100% confident will work.** If there is uncertainty, research further or ask the user before proceeding. Do not guess.
4. **Use at least 3 sub-agents per task.** Parallelize work across multiple agents (e.g., research, implementation planning, code review) for every non-trivial change.

## Project Overview

DannyOS v1.0 — a Windows 95-style interactive portfolio website. The entire UI emulates a Win95 desktop with draggable/resizable windows, a taskbar, start menu, and 24+ built-in applications (games, utilities, portfolio content).

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # TypeScript check + Vite production build (tsc -b && vite build)
npm run preview  # Preview production build locally
```

No test runner or linter is configured.

## Architecture

**Stack**: React 19 + TypeScript + Vite 8, Zustand for state, Framer Motion for animations, Firebase Realtime Database for multiplayer chat.

### State Management

All application state flows through a single Zustand store at `src/stores/desktopStore.ts`. This is the central nervous system — it manages:
- Desktop phase lifecycle: boot → desktop → shutdown-prompt → shutdown
- Window state: open/close/minimize/maximize, drag/resize positions, z-ordering
- Icon management: positions, selection, rubber-band multi-select
- In-memory filesystem: user-created notepad/paint files stored in state
- Display settings: wallpaper, brightness, contrast, color scheme, font/icon size
- Dynamic items: runtime-created folders, notepads, paint files

### Component Hierarchy

- `App.tsx` — Routes between boot screen and desktop based on phase
- `src/components/Desktop/` — Main orchestrator: renders icons, windows, taskbar, start menu, context menus
- `src/components/Window/` — Reusable window container with drag/resize, title bar, menu bar system. Provides `MenuCallbackContext` so child apps can register menu handlers
- `src/windows/` — Individual application components (24+), each rendered inside a Window

### Window Applications (`src/windows/`)

Each file is a self-contained app. Key categories:
- **Portfolio**: AboutMe, Projects, Resume, Contact, Portfolio, Transcript, SoftwareResume, EmbeddedResume
- **Interactive**: Paint (drawing app), Minesweeper, Terminal, AOLChat (Firebase multiplayer)
- **Embedded games**: Undertale, CaveStory, Valorant (iframe-based)
- **Dynamic**: DynamicNotepad (user-created text files with filesystem integration)

### Firebase Integration

Optional Firebase Realtime Database powers AOLChat multiplayer. Config via `VITE_FIREBASE_*` env vars. Falls back to NPC-only chat if unconfigured. Hook at `src/hooks/useMultiplayerChat.ts` manages rooms, presence, real-time messages, and onDisconnect cleanup.

### Styling

Authentic Win95 aesthetic using:
- W95FA bitmap font (`public/fonts/W95FA.otf`)
- CSS Modules for component scoping + `src/styles/global.css` for the design system
- Custom SVG cursors, Win95 color palette (teal desktop, gray UI chrome)
- Wallpaper support with tile/center/stretch modes

### Type Definitions

Global types in `src/types.ts` — includes `WindowState`, `DesktopIcon`, `FileSystemItem`, display settings, and all app-specific types.
