/* ============================================================
   VOLTBOX — UI Controller
   Menus, toolbars, dialogs, window dragging, save/load
   ============================================================ */

(function () {
    var VB = window.VB;

    var activeMenu       = null;
    var isDragging        = false;
    var dragOX = 0, dragOY = 0;

    VB.UI = {

        /* ==================== Initialisation ==================== */

        init: function () {
            this._setupMenus();
            this._setupToolbar();
            this._setupPalette();
            this._setupDialogs();
            this._setupWindowDrag();
            this._setupWindowButtons();
            this._setupWireColors();
            this._setupClock();
            this._setupKeyboard();
            this.updateCRT();

            // Close menus when clicking anywhere else
            document.addEventListener('mousedown', function (e) {
                if (!e.target.closest('.menu-item')) VB.UI.closeMenus();
            });
        },

        /* ==================== Menus ==================== */

        _setupMenus: function () {
            var items = document.querySelectorAll('.menu-item');
            for (var i = 0; i < items.length; i++) {
                (function (item) {
                    item.addEventListener('click', function (e) {
                        e.stopPropagation();
                        var wasOpen = item.classList.contains('open');
                        VB.UI.closeMenus();
                        if (!wasOpen) { item.classList.add('open'); activeMenu = item; }
                        VB.Sound.click();
                    });
                    item.addEventListener('mouseenter', function () {
                        if (activeMenu && activeMenu !== item) {
                            VB.UI.closeMenus();
                            item.classList.add('open');
                            activeMenu = item;
                        }
                    });
                })(items[i]);
            }

            var opts = document.querySelectorAll('.menu-option');
            for (var j = 0; j < opts.length; j++) {
                (function (opt) {
                    opt.addEventListener('click', function (e) {
                        e.stopPropagation();
                        VB.UI._menuAction(opt.dataset.action);
                        VB.UI.closeMenus();
                    });
                })(opts[j]);
            }
        },

        closeMenus: function () {
            var items = document.querySelectorAll('.menu-item');
            for (var i = 0; i < items.length; i++) items[i].classList.remove('open');
            activeMenu = null;
        },

        _menuAction: function (action) {
            switch (action) {
                case 'new':
                    if (VB.state.components.length > 0) {
                        VB.state.undoStack.push(JSON.stringify(VB.state.components));
                        VB.state.components = [];
                        VB.state.firstPin = null;
                        VB.state.simulationResults = null;
                        this.setStatus('New circuit — board cleared');
                        VB.Sound.beep();
                    }
                    break;

                case 'open':   this.loadCircuit();  break;
                case 'save':   this.saveCircuit();  break;
                case 'saveas': this.downloadCircuit(); break;

                case 'exit':
                    VB.Sound.beep();
                    document.getElementById('voltbox-window').style.display = 'none';
                    var tb = document.getElementById('taskbar-voltbox');
                    if (tb) tb.classList.remove('active');
                    break;

                case 'undo':  this.undo(); break;

                case 'clear':
                    VB.state.undoStack.push(JSON.stringify(VB.state.components));
                    VB.state.components = [];
                    VB.state.firstPin = null;
                    VB.state.simulationResults = null;
                    this.setStatus('Board cleared');
                    VB.Sound.beep();
                    break;

                case 'toggle-crt':
                    VB.state.crtEnabled = !VB.state.crtEnabled;
                    this.updateCRT();
                    this._updateViewMenu();
                    break;

                case 'toggle-flow':
                    VB.state.flowEnabled = !VB.state.flowEnabled;
                    this._updateViewMenu();
                    break;

                case 'toggle-highlight':
                    VB.state.highlightEnabled = !VB.state.highlightEnabled;
                    this._updateViewMenu();
                    break;

                case 'about':  this.showDialog('about-dialog'); VB.Sound.beep(); break;
                case 'howto':  this.showDialog('howto-dialog');  VB.Sound.beep(); break;
            }
        },

        /* ==================== Toolbar ==================== */

        _setupToolbar: function () {
            var btns = document.querySelectorAll('.tool-btn[data-tool]');
            for (var i = 0; i < btns.length; i++) {
                (function (btn) {
                    btn.addEventListener('click', function () {
                        VB.UI.setTool(btn.dataset.tool);
                        VB.Sound.click();
                    });
                })(btns[i]);
            }

            document.getElementById('btn-simulate').addEventListener('click', function () {
                VB.UI.runSimulation();
            });
        },

        /* ==================== Palette ==================== */

        _setupPalette: function () {
            var btns = document.querySelectorAll('.palette-btn[data-tool]');
            for (var i = 0; i < btns.length; i++) {
                (function (btn) {
                    btn.addEventListener('click', function () {
                        VB.UI.setTool(btn.dataset.tool);
                        VB.Sound.click();
                    });
                })(btns[i]);
            }
        },

        /* ==================== Tool Selection ==================== */

        setTool: function (tool) {
            VB.state.tool = tool;
            VB.state.firstPin = null;

            // Update toolbar highlights
            var tbBtns = document.querySelectorAll('.tool-btn[data-tool]');
            for (var i = 0; i < tbBtns.length; i++)
                tbBtns[i].classList.toggle('active', tbBtns[i].dataset.tool === tool);

            // Update palette highlights
            var pBtns = document.querySelectorAll('.palette-btn[data-tool]');
            for (var j = 0; j < pBtns.length; j++)
                pBtns[j].classList.toggle('active', pBtns[j].dataset.tool === tool);

            document.getElementById('status-tool').textContent = tool.toUpperCase();

            var canvas = document.getElementById('breadboard-canvas');
            canvas.style.cursor = (tool === 'eraser') ? 'not-allowed' :
                                  (tool === 'select') ? 'default' : 'crosshair';
        },

        /* ==================== Dialogs ==================== */

        _setupDialogs: function () {
            var self = this;
            ['about-close', 'about-ok'].forEach(function (id) {
                document.getElementById(id).addEventListener('click', function () {
                    self.hideDialog('about-dialog'); VB.Sound.click();
                });
            });
            ['howto-close', 'howto-ok'].forEach(function (id) {
                document.getElementById(id).addEventListener('click', function () {
                    self.hideDialog('howto-dialog'); VB.Sound.click();
                });
            });
        },

        showDialog: function (id) {
            var dlg = document.getElementById(id);
            var desk = document.getElementById('desktop');
            dlg.style.display = 'flex';
            // Center
            dlg.style.left = Math.max(20, (desk.offsetWidth  - dlg.offsetWidth)  / 2) + 'px';
            dlg.style.top  = Math.max(20, (desk.offsetHeight - dlg.offsetHeight) / 2 - 20) + 'px';
        },

        hideDialog: function (id) {
            document.getElementById(id).style.display = 'none';
        },

        /* ==================== Window Dragging ==================== */

        _setupWindowDrag: function () {
            var bar = document.getElementById('title-bar');
            var win = document.getElementById('voltbox-window');

            bar.addEventListener('mousedown', function (e) {
                if (e.target.closest('.title-bar-controls')) return;
                isDragging = true;
                dragOX = e.clientX - win.offsetLeft;
                dragOY = e.clientY - win.offsetTop;
                e.preventDefault();
            });

            document.addEventListener('mousemove', function (e) {
                if (!isDragging) return;
                win.style.left = (e.clientX - dragOX) + 'px';
                win.style.top  = (e.clientY - dragOY) + 'px';
            });

            document.addEventListener('mouseup', function () { isDragging = false; });

            // Center on load
            var desk = document.getElementById('desktop');
            setTimeout(function () {
                win.style.left = Math.max(0, (desk.offsetWidth  - win.offsetWidth)  / 2) + 'px';
                win.style.top  = Math.max(0, (desk.offsetHeight - win.offsetHeight) / 2 - 16) + 'px';
            }, 0);
        },

        /* ==================== Window Title-Bar Buttons ==================== */

        _setupWindowButtons: function () {
            var win = document.getElementById('voltbox-window');
            var tb  = document.getElementById('taskbar-voltbox');

            // Minimize
            document.getElementById('btn-minimize').addEventListener('click', function () {
                win.style.display = 'none';
                if (tb) tb.classList.remove('active');
                VB.Sound.click();
            });

            // Maximize (toggle)
            var maximized = false;
            var savedStyle = {};
            document.getElementById('btn-maximize').addEventListener('click', function () {
                if (!maximized) {
                    savedStyle = { w: win.style.width, h: win.style.height, l: win.style.left, t: win.style.top };
                    win.style.left = '0px';
                    win.style.top = '0px';
                    win.style.width = '100%';
                    win.style.height = 'calc(100% - 30px)';
                } else {
                    win.style.width  = savedStyle.w || '860px';
                    win.style.height = savedStyle.h || '580px';
                    win.style.left   = savedStyle.l || '50px';
                    win.style.top    = savedStyle.t || '30px';
                }
                maximized = !maximized;
                VB.Sound.click();
            });

            // Close
            document.getElementById('btn-close').addEventListener('click', function () {
                VB.Sound.beep();
                win.style.display = 'none';
                if (tb) tb.classList.remove('active');
            });

            // Taskbar click to restore
            if (tb) {
                tb.addEventListener('click', function () {
                    if (win.style.display === 'none') {
                        win.style.display = 'flex';
                        tb.classList.add('active');
                        VB.Sound.click();
                    }
                });
            }
        },

        /* ==================== Wire Colour Swatches ==================== */

        _setupWireColors: function () {
            var container = document.getElementById('wire-colors');
            VB.CONFIG.WIRE_COLORS.forEach(function (color, i) {
                var sw = document.createElement('div');
                sw.className = 'color-swatch' + (i === 0 ? ' active' : '');
                sw.style.backgroundColor = color;
                sw.title = color;
                sw.addEventListener('click', function () {
                    var all = container.querySelectorAll('.color-swatch');
                    for (var k = 0; k < all.length; k++) all[k].classList.remove('active');
                    sw.classList.add('active');
                    VB.state.wireColor = i;
                    VB.Sound.click();
                });
                container.appendChild(sw);
            });
        },

        /* ==================== Clock ==================== */

        _setupClock: function () {
            function tick() {
                var d = new Date();
                var h = d.getHours(), m = d.getMinutes();
                var ap = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                document.getElementById('taskbar-clock').textContent =
                    h + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
            }
            tick();
            setInterval(tick, 15000);
        },

        /* ==================== Keyboard Shortcuts ==================== */

        _setupKeyboard: function () {
            document.addEventListener('keydown', function (e) {
                // Don't capture if dialog is open
                var key = e.key;

                if (e.ctrlKey) {
                    if (key === 'z' || key === 'Z') { e.preventDefault(); VB.UI.undo(); }
                    if (key === 's' || key === 'S') { e.preventDefault(); VB.UI.saveCircuit(); }
                    if (key === 'n' || key === 'N') { e.preventDefault(); VB.UI._menuAction('new'); }
                    if (key === 'o' || key === 'O') { e.preventDefault(); VB.UI.loadCircuit(); }
                    return;
                }

                switch (key) {
                    case '1': VB.UI.setTool('select');   break;
                    case '2': VB.UI.setTool('wire');     break;
                    case '3': VB.UI.setTool('resistor'); break;
                    case '4': VB.UI.setTool('led');      break;
                    case '5': VB.UI.setTool('power');    break;
                    case '6': VB.UI.setTool('ground');   break;
                    case '7': VB.UI.setTool('eraser');   break;
                    case ' ': e.preventDefault(); VB.UI.runSimulation(); break;
                    case 'Escape':
                        VB.state.firstPin = null;
                        VB.UI.setStatus('Cancelled');
                        break;
                    case 'Delete':
                        if (VB.state.hoveredHole) {
                            var idx = VB.Breadboard.getComponentAt(
                                VB.state.hoveredHole.col, VB.state.hoveredHole.row);
                            if (idx >= 0) {
                                VB.state.components.splice(idx, 1);
                                VB.state.simulationResults = null;
                                VB.Sound.del();
                                VB.UI.setStatus('Component removed');
                                if (VB.state.components.length > 0) VB.UI.runSimulation();
                            }
                        }
                        break;
                }
            });
        },

        /* ==================== View Menu Updates ==================== */

        updateCRT: function () {
            document.getElementById('crt-overlay').classList.toggle('active', VB.state.crtEnabled);
        },

        _updateViewMenu: function () {
            var opts = document.querySelectorAll('#menu-view .menu-option');
            if (opts[0]) opts[0].textContent = (VB.state.crtEnabled      ? '\u2713 ' : '   ') + 'CRT Scanlines';
            if (opts[1]) opts[1].textContent = (VB.state.flowEnabled     ? '\u2713 ' : '   ') + 'Current Flow';
            if (opts[2]) opts[2].textContent = (VB.state.highlightEnabled ? '\u2713 ' : '   ') + 'Net Highlight';
        },

        /* ==================== Status Bar ==================== */

        setStatus: function (text) {
            document.getElementById('status-text').textContent = text;
        },

        /* ==================== Simulation Trigger ==================== */

        runSimulation: function () {
            var r = VB.Simulation.run();
            if (r.shortCircuit) {
                VB.Sound.error();
                this.setStatus('\u26A0 SHORT CIRCUIT DETECTED!');
            } else if (r.activeLEDs.length > 0) {
                VB.Sound.success();
                this.setStatus(r.activeLEDs.length + ' LED(s) active \u2713');
            } else if (r.messages.length > 0) {
                VB.Sound.beep();
                this.setStatus(r.messages[r.messages.length - 1]);
            } else {
                this.setStatus('READY');
            }
        },

        /* ==================== Undo ==================== */

        undo: function () {
            if (VB.state.undoStack.length > 0) {
                VB.state.components = JSON.parse(VB.state.undoStack.pop());
                VB.state.firstPin = null;
                VB.state.simulationResults = null;
                this.setStatus('Undo');
                VB.Sound.click();
            } else if (VB.state.components.length > 0) {
                VB.state.components.pop();
                VB.state.firstPin = null;
                VB.state.simulationResults = null;
                this.setStatus('Removed last component');
                VB.Sound.click();
            }
        },

        /* ==================== Save / Load ==================== */

        saveCircuit: function () {
            var data = JSON.stringify({ version: 1, components: VB.state.components });
            try {
                localStorage.setItem('voltbox_circuit', data);
                VB.Sound.beep();
                this.setStatus('Circuit saved to local storage');
            } catch (e) {
                VB.Sound.error();
                this.setStatus('Error: Could not save circuit');
            }
        },

        downloadCircuit: function () {
            var data = JSON.stringify({ version: 1, components: VB.state.components }, null, 2);
            var blob = new Blob([data], { type: 'application/json' });
            var url  = URL.createObjectURL(blob);
            var a    = document.createElement('a');
            a.href = url;
            a.download = 'circuit.vbx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            VB.Sound.beep();
            this.setStatus('Circuit exported as circuit.vbx');
        },

        loadCircuit: function () {
            // First try localStorage
            var saved = null;
            try { saved = localStorage.getItem('voltbox_circuit'); } catch (e) {}

            if (saved) {
                try {
                    var parsed = JSON.parse(saved);
                    if (parsed && parsed.components) {
                        VB.state.undoStack.push(JSON.stringify(VB.state.components));
                        VB.state.components = parsed.components;
                        VB.state.firstPin = null;
                        VB.state.simulationResults = null;
                        VB.Sound.success();
                        this.setStatus('Circuit loaded from local storage');
                        return;
                    }
                } catch (e) {}
            }

            // Fallback: file picker
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.vbx,.json';
            input.addEventListener('change', function (e) {
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function (ev) {
                    try {
                        var p = JSON.parse(ev.target.result);
                        if (p && p.components) {
                            VB.state.undoStack.push(JSON.stringify(VB.state.components));
                            VB.state.components = p.components;
                            VB.state.firstPin = null;
                            VB.state.simulationResults = null;
                            VB.Sound.success();
                            VB.UI.setStatus('Circuit loaded from ' + file.name);
                        }
                    } catch (err) {
                        VB.Sound.error();
                        VB.UI.setStatus('Error: Invalid circuit file');
                    }
                };
                reader.readAsText(file);
            });
            input.click();
        }
    };
})();

