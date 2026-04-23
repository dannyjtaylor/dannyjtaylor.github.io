# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

1. **Use extended thinking ("ultrathink") on every prompt.** Always enable maximum-depth reasoning before responding.
2. **Search the web for the latest documentation before making any change.** Every time you modify code involving a library, API, or framework, look up the newest docs first. Do not rely on cached knowledge alone.
3. **Only implement changes you are 100% confident will work.** If there is uncertainty, research further or ask the user before proceeding. Do not guess.
4. **Use at least 3 sub-agents per task.** Parallelize work across multiple agents (e.g., research, implementation planning, code review) for every non-trivial change.
5. **Always validate code before finishing.** After writing or modifying code, use a sub-agent to review every changed file for: unused variables/imports, TypeScript errors, missing exports, and undeclared references. The build (`tsc -b`) treats unused locals as errors. Never declare a variable, const, or import without using it. Remove dead code immediately — do not leave "for later" stubs.

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

**Stack**: React 19 + TypeScript 5.9 (strict mode) + Vite 8, Zustand 5 for state, Framer Motion 12 for animations, Firebase 11 Realtime Database for multiplayer chat.

**TypeScript enforcement**: `noUnusedLocals` and `noUnusedParameters` are both `true`. Unused imports or variables are **build errors**, not warnings. Never declare anything without using it immediately.

### State Management

All application state flows through a single Zustand store at `src/stores/desktopStore.ts`. It manages:
- **Phase lifecycle**: boot → desktop → shutdown-prompt → shutdown → sleep → restarting
- **Window state**: open/close/minimize/maximize, drag/resize positions, z-ordering, title overrides
- **Icon management**: positions, selection (Set\<string\>), label overrides, multi-select, rubber-band selection box, `hiddenIcons` (static icons sent to recycle bin)
- **In-memory filesystem**: notepad/paint content keyed by `windowId`
- **Dynamic items**: user-created folders, notepads, paint files (added at runtime)
- **Pending files**: new notepads that exist in state but are NOT yet on the desktop (visible only after first save)
- **Recycle bin**: deleted items with content + restore metadata
- **Display settings**: wallpaper (tile/center/stretch), brightness/contrast, 9 color schemes, font size (3), icon size (3), 9 cursor themes

### Static vs. Dynamic Icons

Two distinct categories exist on the desktop:
- **Static icons** — defined in the `ICONS` array in `Desktop.tsx`. Always present unless recycled (added to `hiddenIcons` Set). Restoring removes from `hiddenIcons`.
- **Dynamic items** — user-created at runtime via `addDesktopItem()`. Stored in `dynamicItems` in the store. Only appear on desktop after `commitFileToDesktop(windowId)` is called (i.e., after first save).
- **Pending files** — intermediate state: created by right-click > New Notepad, exist in store, but invisible on desktop until saved. Closing without saving deletes them entirely.

### Component Hierarchy

- `App.tsx` — Routes between boot screen and desktop based on phase. Also handles `/credits` as a standalone static page with a GitHub Pages SPA redirect workaround (`/?/credits` → `/credits`).
- `src/components/Desktop/` — Main orchestrator: renders icons, windows, taskbar, start menu, context menus. Defines `ICONS`, `WINDOWS`, and `WINDOW_CONTENT` map.
- `src/components/Window/` — Reusable window container with drag (titlebar only), 8-direction resize (min 200×100px), menu bar, z-ordering. Exports `MenuCallbackContext` so child apps can register handlers.
- `src/windows/` — Individual application components (24+), each rendered inside a `<Window>`.

### Window Registration Pattern

In `Desktop.tsx`:
1. `ICONS` array — static icon configs (id, label, icon, position)
2. `WINDOWS` array — window configs (id, title, default size/position, optional menu config)
3. `WINDOW_CONTENT` map — `{ [id]: ReactComponent }`
4. On mount: `registerWindow(config)` for each entry
5. `<DesktopIcon>` renders each icon; double-click calls `openWindow(windowId)`
6. `<Window>` renders for each open window, wrapping `WINDOW_CONTENT[id]`

Dynamic windows (user-created notepads/paint) follow the same pattern but are created at runtime via `addDesktopItem` and registered individually.

### MenuCallbackContext Pattern

Apps inside windows register an action handler to respond to menu bar clicks:

```tsx
const registerCallback = useContext(MenuCallbackContext);
useEffect(() => {
  return registerCallback((action: string) => {
    if (action === 'file-save') { /* save logic */ }
    if (action === 'file-save-as') { /* save-as dialog */ }
  });
}, []);
```

`registerCallback` returns a cleanup function (unregisters on unmount). See `DynamicNotepad.tsx` for the canonical implementation. The callback set is unordered — don't rely on execution order if multiple handlers exist.

### Window Applications (`src/windows/`)

Each file is a self-contained app. Key categories:
- **Portfolio**: AboutMe, Projects, Resume, Contact, Portfolio, Transcript, SoftwareResume, EmbeddedResume
- **Interactive**: Paint (canvas drawing + Save-As), Minesweeper, Terminal, AOLChat (Firebase multiplayer)
- **Embedded games**: Undertale, CaveStory, Valorant (iframe-based)
- **Dynamic**: DynamicNotepad (user-created text files, Ctrl+S quicksave, Save-As dialog)

Window state is preserved on close (`isOpen: false`, not deleted). Reopening a window restores its last position and size.

### Firebase Integration

Optional Firebase Realtime Database powers AOLChat multiplayer. Config via `VITE_FIREBASE_*` env vars in `.env`. Falls back gracefully to NPC-only chat if unconfigured.

Hook at `src/hooks/useMultiplayerChat.ts` manages:
- Room joining/leaving with `onDisconnect().remove()` for automatic presence cleanup
- Real-time message listener (capped at 50 messages per room)
- Online user tracking
- Message ordering by Firebase key (chronologically reliable, independent of client clock)

### Styling

Authentic Win95 aesthetic using:
- W95FA bitmap font (`public/fonts/W95FA.otf` + WOFF2 fallback)
- CSS Modules for component scoping + `src/styles/global.css` for the design system (CSS custom properties: `--win-bg`, `--win-gray`, `--win-dark`, `--win-light`, etc.)
- 9 color schemes defined in `Desktop.tsx`, applied dynamically via CSS custom properties
- Cursor themes: 9 variants (Inverted, Neon, Hotdog, Ocean, Lavender, Crosshair, Pixel Sword, etc.) — default uses SVG cursors; themes load `cursor.png` and resize on-the-fly via Canvas API
- Wallpaper: tile / center / stretch modes

### Type Definitions

Global types in `src/types.ts` — includes `WindowState`, `DesktopIcon`, `FileSystemItem`, display settings enums, and all app-specific types.

## Key Gotchas

1. **Pending files vanish on close**: New notepads are in a "pending" state until Ctrl+S or File > Save. Closing before saving deletes them with no recovery.
2. **Static icon recycling is hide, not delete**: Adding a static icon to recycle bin adds it to `hiddenIcons` but leaves the window config intact. Restore just removes it from `hiddenIcons`.
3. **Window state is never deleted**: `closeWindow` sets `isOpen: false`; the window stays in the `windows` map. This preserves component state across open/close cycles.
4. **Strict TS = no dead code**: `noUnusedLocals` + `noUnusedParameters` makes the build fail on any unused symbol. Remove stubs immediately.
5. **Phase enum is larger than it looks**: The lifecycle includes `sleep` and `restarting` states beyond the obvious boot/desktop/shutdown cycle.
