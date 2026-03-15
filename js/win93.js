/* ============================================
   DannyOS — Boot Sequence + Desktop Engine
   ============================================ */

(function () {
    'use strict';

    // ── Boot Sequence ──────────────────────────────
    const BOOT_LINES = [
        { text: '', delay: 300 },
        { text: '  DannyTech BIOS v4.20 - 1993 Edition', cls: 'boot-white', delay: 80 },
        { text: '  (C) 1993 DannyTech Industries, Inc.', cls: 'boot-dim', delay: 60 },
        { text: '', delay: 200 },
        { text: '  ╔══════════════════════════════════════════════╗', cls: 'boot-white', delay: 30 },
        { text: '  ║                                              ║', cls: 'boot-white', delay: 30 },
        { text: '  ║    ██████╗  █████╗ ███╗   ██╗███╗   ██╗██╗  ██╗   ║', cls: 'boot-green', delay: 30 },
        { text: '  ║    ██╔══██╗██╔══██╗████╗  ██║████╗  ██║╚██╗ ██╔╝   ║', cls: 'boot-green', delay: 30 },
        { text: '  ║    ██║  ██║███████║██╔██╗ ██║██╔██╗ ██║ ╚████╔╝    ║', cls: 'boot-green', delay: 30 },
        { text: '  ║    ██║  ██║██╔══██║██║╚██╗██║██║╚██╗██║  ╚██╔╝     ║', cls: 'boot-green', delay: 30 },
        { text: '  ║    ██████╔╝██║  ██║██║ ╚████║██║ ╚████║   ██║      ║', cls: 'boot-green', delay: 30 },
        { text: '  ║    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝   ╚═╝      ║', cls: 'boot-green', delay: 30 },
        { text: '  ║                                              ║', cls: 'boot-white', delay: 30 },
        { text: '  ║          ████████  ██████                    ║', cls: 'boot-green', delay: 30 },
        { text: '  ║          ██    ██  ██                        ║', cls: 'boot-green', delay: 30 },
        { text: '  ║          ██    ██  ██████                    ║', cls: 'boot-green', delay: 30 },
        { text: '  ║          ██    ██      ██                    ║', cls: 'boot-green', delay: 30 },
        { text: '  ║          ████████  ██████                    ║', cls: 'boot-green', delay: 30 },
        { text: '  ║                                              ║', cls: 'boot-white', delay: 30 },
        { text: '  ╚══════════════════════════════════════════════╝', cls: 'boot-white', delay: 30 },
        { text: '', delay: 400 },
        { text: '  BIOS POST (Power-On Self Test)...', cls: 'boot-white', delay: 300 },
        { text: '', delay: 100 },
        { text: '  CPU: DannyTech 486DX2-66MHz ............. OK', delay: 120 },
        { text: '  FPU: DannyTech 487 Co-Processor ........ OK', delay: 80 },
        { text: '  RAM: 640K Conventional .................. OK', delay: 100 },
        { text: '       8192K Extended ..................... OK', delay: 80 },
        { text: '  ┌──────────────────────────────────────────┐', cls: 'boot-dim', delay: 40 },
        { text: '  │  640K ought to be enough for anybody.    │', cls: 'boot-dim', delay: 40 },
        { text: '  └──────────────────────────────────────────┘', cls: 'boot-dim', delay: 200 },
        { text: '  VGA: 256 Colors @ 640x480 .............. OK', delay: 80 },
        { text: '  HDD: 420MB IDE (C:) .................... OK', delay: 80 },
        { text: '  FDD: 1.44MB 3.5" (A:) ................. OK', delay: 80 },
        { text: '  CD-ROM: 2x Speed (D:) .................. OK', delay: 80 },
        { text: '  SoundBlaster 16 (IRQ 5, DMA 1) ........ OK', delay: 80 },
        { text: '  Serial Mouse on COM1 ................... OK', delay: 80 },
        { text: '', delay: 300 },
        { text: '  All systems operational.', cls: 'boot-green', delay: 200 },
        { text: '', delay: 200 },
        { text: '  C:\\> DANNY.EXE /load', cls: 'boot-yellow', delay: 400 },
        { text: '', delay: 200 },
        { text: '  Loading DannyOS v1.0...', cls: 'boot-white', delay: 200 },
        { text: '', delay: 100 },
        { text: '  ├─ Initializing kernel ................. done', delay: 100 },
        { text: '  ├─ Loading device drivers .............. done', delay: 100 },
        { text: '  ├─ Mounting file system ................ done', delay: 80 },
        { text: '  ├─ Starting portfolio services ......... done', delay: 80 },
        { text: '  ├─ Loading desktop environment ......... done', delay: 80 },
        { text: '  └─ Preparing workspace ................. done', delay: 100 },
        { text: '', delay: 200 },
        { text: '  [PROGRESS_BAR]', delay: 0 },
        { text: '', delay: 100 },
        { text: '  Welcome, visitor. Starting desktop...', cls: 'boot-green', delay: 600 },
    ];

    const bootScreen = document.getElementById('boot-screen');
    const bootTextEl = document.getElementById('boot-text');
    const bootCursor = document.getElementById('boot-cursor');
    const desktop = document.getElementById('desktop');

    function typeBootLine(line) {
        return new Promise((resolve) => {
            if (line.text === '[PROGRESS_BAR]') {
                animateProgressBar().then(resolve);
                return;
            }

            const span = document.createElement('span');
            if (line.cls) span.className = line.cls;
            span.textContent = line.text + '\n';
            bootTextEl.appendChild(span);

            // Auto-scroll
            bootScreen.scrollTop = bootScreen.scrollHeight;

            setTimeout(resolve, line.delay);
        });
    }

    function animateProgressBar() {
        return new Promise((resolve) => {
            const barWidth = 40;
            const span = document.createElement('span');
            span.className = 'boot-green';
            bootTextEl.appendChild(span);

            let progress = 0;
            const interval = setInterval(() => {
                progress += 1;
                const filled = Math.round((progress / 100) * barWidth);
                const empty = barWidth - filled;
                const bar = '  [' + '\u2588'.repeat(filled) + '\u2591'.repeat(empty) + '] ' + progress + '%';
                span.textContent = bar + '\n';
                bootScreen.scrollTop = bootScreen.scrollHeight;

                if (progress >= 100) {
                    clearInterval(interval);
                    resolve();
                }
            }, 25);
        });
    }

    async function runBootSequence() {
        for (const line of BOOT_LINES) {
            await typeBootLine(line);
        }

        // Fade to desktop
        setTimeout(() => {
            bootCursor.classList.remove('blink');
            bootScreen.style.transition = 'opacity 0.5s ease';
            bootScreen.style.opacity = '0';
            setTimeout(() => {
                bootScreen.classList.add('hidden');
                desktop.classList.remove('hidden');
                initDesktop();
            }, 500);
        }, 400);
    }

    // Check for skip
    let skipBoot = false;

    bootScreen.addEventListener('click', () => { skipBoot = true; });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
            if (!bootScreen.classList.contains('hidden')) {
                skipBoot = true;
                bootScreen.classList.add('hidden');
                desktop.classList.remove('hidden');
                initDesktop();
            }
        }
    });

    // Override typeBootLine when skip requested
    const originalType = typeBootLine;

    runBootSequence();

    // ── Desktop Engine ─────────────────────────────
    let highestZ = 100;
    let activeWindow = null;
    let dragState = null;

    function initDesktop() {
        initClock();
        initIcons();
        initStartMenu();
        initWindowControls();
        initShutdown();
        initDesktopClick();
    }

    // --- Clock ---
    function initClock() {
        function updateClock() {
            const now = new Date();
            let h = now.getHours();
            const m = String(now.getMinutes()).padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            document.getElementById('taskbar-clock').textContent = h + ':' + m + ' ' + ampm;
        }
        updateClock();
        setInterval(updateClock, 10000);
    }

    // --- Icons ---
    function initIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        let clickTimer = null;
        let lastClicked = null;

        icons.forEach((icon) => {
            icon.addEventListener('click', (e) => {
                // Deselect all
                icons.forEach(i => i.classList.remove('selected'));
                icon.classList.add('selected');

                // Double-click detection
                if (lastClicked === icon && clickTimer) {
                    clearTimeout(clickTimer);
                    clickTimer = null;
                    lastClicked = null;
                    openWindow(icon.dataset.window);
                } else {
                    lastClicked = icon;
                    clickTimer = setTimeout(() => {
                        clickTimer = null;
                        lastClicked = null;
                    }, 400);
                }
            });
        });
    }

    // --- Open Window ---
    function openWindow(id) {
        const win = document.getElementById('window-' + id);
        if (!win) return;

        closeStartMenu();

        if (!win.classList.contains('hidden')) {
            // Already open — bring to front
            bringToFront(win);
            return;
        }

        win.classList.remove('hidden');
        bringToFront(win);
        addTaskbarItem(id, win);
        initDragging(win);
    }

    function closeWindow(win) {
        win.classList.add('hidden');
        win.classList.remove('maximized');
        const id = win.id.replace('window-', '');
        removeTaskbarItem(id);
        if (activeWindow === win) activeWindow = null;
    }

    function minimizeWindow(win) {
        win.classList.add('hidden');
        const id = win.id.replace('window-', '');
        const tbItem = document.querySelector('.taskbar-item[data-id="' + id + '"]');
        if (tbItem) tbItem.classList.remove('active');
        if (activeWindow === win) activeWindow = null;
    }

    function maximizeWindow(win) {
        win.classList.toggle('maximized');
    }

    function bringToFront(win) {
        highestZ++;
        win.style.zIndex = highestZ;

        // Mark all windows inactive
        document.querySelectorAll('.window').forEach(w => w.classList.add('inactive'));
        win.classList.remove('inactive');
        activeWindow = win;

        // Update taskbar
        const id = win.id.replace('window-', '');
        document.querySelectorAll('.taskbar-item').forEach(ti => ti.classList.remove('active'));
        const tbItem = document.querySelector('.taskbar-item[data-id="' + id + '"]');
        if (tbItem) tbItem.classList.add('active');
    }

    // --- Taskbar Items ---
    function addTaskbarItem(id, win) {
        const container = document.getElementById('taskbar-windows');

        // Don't duplicate
        if (document.querySelector('.taskbar-item[data-id="' + id + '"]')) {
            const item = document.querySelector('.taskbar-item[data-id="' + id + '"]');
            item.classList.add('active');
            return;
        }

        const titleText = win.querySelector('.window-title span').textContent;
        const item = document.createElement('button');
        item.className = 'taskbar-item active';
        item.dataset.id = id;
        item.textContent = titleText;

        item.addEventListener('click', () => {
            if (win.classList.contains('hidden')) {
                win.classList.remove('hidden');
                bringToFront(win);
                item.classList.add('active');
            } else if (activeWindow === win) {
                minimizeWindow(win);
            } else {
                bringToFront(win);
            }
        });

        container.appendChild(item);
    }

    function removeTaskbarItem(id) {
        const item = document.querySelector('.taskbar-item[data-id="' + id + '"]');
        if (item) item.remove();
    }

    // --- Dragging ---
    function initDragging(win) {
        const titlebar = win.querySelector('.window-titlebar');

        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.win-btn')) return;
            if (win.classList.contains('maximized')) return;

            bringToFront(win);

            dragState = {
                win: win,
                startX: e.clientX,
                startY: e.clientY,
                origLeft: win.offsetLeft,
                origTop: win.offsetTop,
            };

            e.preventDefault();
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!dragState) return;
        const dx = e.clientX - dragState.startX;
        const dy = e.clientY - dragState.startY;
        dragState.win.style.left = (dragState.origLeft + dx) + 'px';
        dragState.win.style.top = (dragState.origTop + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
        dragState = null;
    });

    // --- Window Controls ---
    function initWindowControls() {
        document.querySelectorAll('.window').forEach((win) => {
            const closeBtn = win.querySelector('.btn-close');
            const minBtn = win.querySelector('.btn-minimize');
            const maxBtn = win.querySelector('.btn-maximize');

            if (closeBtn) closeBtn.addEventListener('click', () => closeWindow(win));
            if (minBtn) minBtn.addEventListener('click', () => minimizeWindow(win));
            if (maxBtn) maxBtn.addEventListener('click', () => maximizeWindow(win));

            // Click anywhere on window to bring to front
            win.addEventListener('mousedown', () => bringToFront(win));

            // Init dragging for pre-existing windows
            initDragging(win);
        });
    }

    // --- Start Menu ---
    function initStartMenu() {
        const startBtn = document.getElementById('start-button');
        const startMenu = document.getElementById('start-menu');

        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.toggle('hidden');
            startBtn.classList.toggle('active');
        });

        document.querySelectorAll('.start-menu-item[data-window]').forEach(item => {
            item.addEventListener('click', () => {
                openWindow(item.dataset.window);
                closeStartMenu();
            });
        });
    }

    function closeStartMenu() {
        document.getElementById('start-menu').classList.add('hidden');
        document.getElementById('start-button').classList.remove('active');
    }

    // --- Desktop Click ---
    function initDesktopClick() {
        document.getElementById('desktop-icons').addEventListener('click', (e) => {
            if (e.target === e.currentTarget || e.target.id === 'desktop-icons') {
                document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#start-menu') && !e.target.closest('#start-button')) {
                closeStartMenu();
            }
        });
    }

    // --- Shutdown ---
    function initShutdown() {
        const shutdownBtn = document.getElementById('start-shutdown');
        const overlay = document.getElementById('shutdown-overlay');
        const yesBtn = document.getElementById('btn-shutdown-yes');
        const noBtn = document.getElementById('btn-shutdown-no');
        const closeBtn = overlay.querySelector('.dialog-close');
        const shutdownScreen = document.getElementById('shutdown-screen');

        shutdownBtn.addEventListener('click', () => {
            closeStartMenu();
            overlay.classList.remove('hidden');
        });

        noBtn.addEventListener('click', () => overlay.classList.add('hidden'));
        closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));

        yesBtn.addEventListener('click', () => {
            overlay.classList.add('hidden');
            desktop.style.transition = 'opacity 0.8s';
            desktop.style.opacity = '0';
            setTimeout(() => {
                desktop.classList.add('hidden');
                shutdownScreen.classList.remove('hidden');
            }, 800);
        });
    }
})();
