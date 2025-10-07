/**
 * Simple Theme Switcher
 * This provides theme switching functionality for all theme pages
 */

function initThemeSwitcher() {
    // Create theme switcher if it doesn't exist
    let switcher = document.querySelector('.theme-switcher');
    if (!switcher) {
        switcher = document.createElement('div');
        switcher.className = 'theme-switcher';
        switcher.innerHTML = `
            <button class="theme-switch-btn" title="Switch Theme">
                <i data-lucide="layout" class="lucide-icon"></i>
            </button>
            <div class="theme-switch-menu" style="display: none;">
                <button class="theme-switch-option" data-theme="professional">
                    <i data-lucide="briefcase" class="lucide-icon"></i>
                    Professional
                </button>
                <button class="theme-switch-option" data-theme="vscode">
                    <i data-lucide="code" class="lucide-icon"></i>
                    VSCode
                </button>
                <button class="theme-switch-option" data-theme="discord">
                    <i data-lucide="message-circle" class="lucide-icon"></i>
                    Discord
                </button>
                <button class="theme-switch-option" data-theme="steam">
                    <i data-lucide="gamepad-2" class="lucide-icon"></i>
                    Steam
                </button>
                <button class="theme-switch-option" data-theme="valorant">
                    <i data-lucide="target" class="lucide-icon"></i>
                    Valorant
                </button>
                <button class="theme-switch-option" data-theme="undertale">
                    <i data-lucide="heart" class="lucide-icon"></i>
                    Undertale
                </button>
                <button class="theme-switch-option" data-theme="persona3">
                    <i data-lucide="sparkles" class="lucide-icon"></i>
                    Persona 3
                </button>
            </div>
        `;
        document.body.appendChild(switcher);
        
        // Add CSS for the theme switcher
        const style = document.createElement('style');
        style.textContent = `
            .theme-switcher {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                font-family: 'Inter', sans-serif;
            }
            
            .theme-switch-btn {
                background: rgba(0, 0, 0, 0.7);
                border: none;
                color: white;
                padding: 10px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s ease;
            }
            
            .theme-switch-btn:hover {
                background: rgba(0, 0, 0, 0.9);
            }
            
            .theme-switch-menu {
                position: absolute;
                top: 100%;
                right: 0;
                background: rgba(0, 0, 0, 0.9);
                border-radius: 8px;
                padding: 8px;
                margin-top: 4px;
                min-width: 150px;
            }
            
            .theme-switch-option {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 8px 12px;
                background: transparent;
                border: none;
                color: white;
                text-align: left;
                cursor: pointer;
                border-radius: 4px;
                transition: background-color 0.2s ease;
                font-size: 14px;
            }
            
            .theme-switch-option:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .theme-switch-option .lucide-icon {
                width: 16px;
                height: 16px;
            }
        `;
        document.head.appendChild(style);
        
        // Add event listeners
        const switchBtn = switcher.querySelector('.theme-switch-btn');
        const switchMenu = switcher.querySelector('.theme-switch-menu');
        const switchOptions = switcher.querySelectorAll('.theme-switch-option');
        
        switchBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            switchMenu.style.display = switchMenu.style.display === 'none' ? 'block' : 'none';
        });
        
        switchOptions.forEach(option => {
            option.addEventListener('click', function() {
                const theme = this.getAttribute('data-theme');
                switchTheme(theme);
                switchMenu.style.display = 'none';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function() {
            switchMenu.style.display = 'none';
        });
    }
}

function switchTheme(theme) {
    // Theme navigation mapping
    const themePaths = {
        'professional': '/themes/professional/index.html',
        'vscode': '/themes/vscode/vscode-theme.html',
        'discord': '/themes/discord/discord-theme.html',
        'steam': '/themes/steam/steam-theme.html',
        'valorant': '/themes/valorant/valorant-theme.html',
        'undertale': '/themes/undertale/undertale-theme.html',
        'persona3': '/themes/persona3/persona3-theme.html'
    };
    
    const path = themePaths[theme];
    if (path) {
        window.location.href = path;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initThemeSwitcher();
});
