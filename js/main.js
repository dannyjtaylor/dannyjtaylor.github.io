document.addEventListener('DOMContentLoaded', function() {
    // Initialize layout system
    initLayoutSystem();
    
    // Initialize folder toggles
    initFolderToggles();
    
    // Handle form submission
    initContactForm();
});

/**
 * Initialize folder toggle functionality in the sidebar
 */
function initFolderToggles() {
    const folderHeaders = document.querySelectorAll('.vscode-folder-header');
    
    folderHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const folderId = this.getAttribute('data-folder');
            const folderContent = document.getElementById(`${folderId}-folder`);
            const folderIcon = this.querySelector('.folder-icon');
            if (folderContent.style.display === 'none') {
                folderContent.style.display = 'block';
                if (folderIcon) {
                    folderIcon.setAttribute('data-lucide', 'chevron-down');
                    lucide.createIcons();
                }
            } else {
                folderContent.style.display = 'none';
                if (folderIcon) {
                    folderIcon.setAttribute('data-lucide', 'chevron-right');
                    lucide.createIcons();
                }
            }
        });
    });
}

/**
 * Initialize contact form submission
 */
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;
    
    const submitButton = document.querySelector('.primary-button');
    if (!submitButton) return;
    
    submitButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');
        
        // Simple validation
        let isValid = true;
        
        if (!nameInput.value.trim()) {
            nameInput.style.borderColor = 'red';
            isValid = false;
        } else {
            nameInput.style.borderColor = '';
        }
        
        if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
            emailInput.style.borderColor = 'red';
            isValid = false;
        } else {
            emailInput.style.borderColor = '';
        }
        
        if (!messageInput.value.trim()) {
            messageInput.style.borderColor = 'red';
            isValid = false;
        } else {
            messageInput.style.borderColor = '';
        }
        
        if (isValid) {
            // In a real application, you would send the form data to a server
            // For this demo, we'll just show an alert
            alert('Message sent successfully! (This is a demo)');
            
            // Reset form
            nameInput.value = '';
            emailInput.value = '';
            subjectInput.value = '';
            messageInput.value = '';
        } else {
            alert('Please fill in all required fields correctly.');
        }
    });
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Handle window resize events
 */
window.addEventListener('resize', function() {
    // Add responsive behavior if needed
});

/**
 * Initialize layout system
 */
function initLayoutSystem() {
    // Check if user has a saved layout preference
    const savedLayout = localStorage.getItem('portfolioLayout');
    
    // Show overlay if no layout is saved
    if (!savedLayout) {
        showLayoutOverlay();
    } else {
        applyLayout(savedLayout);
    }
    
    // Initialize layout switcher if it exists
    initLayoutSwitcher();
}

/**
 * Show the layout selection overlay
 */
function showLayoutOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'layout-overlay';
    overlay.innerHTML = `
        <div class="layout-overlay-content">
            <div class="layout-overlay-header">
                <h1>Welcome to Daniel Taylor's Portfolio</h1>
                <p>Choose your preferred viewing experience:</p>
            </div>
            
            <div class="layout-options">
                <div class="layout-option" data-layout="professional">
                    <div class="layout-preview professional-preview">
                        <div class="preview-header">
                            <div class="preview-title">Professional</div>
                        </div>
                        <div class="preview-content">
                            <div class="preview-section">Clean & Modern</div>
                            <div class="preview-section">Recruiter Friendly</div>
                            <div class="preview-section">Easy Navigation</div>
                        </div>
                    </div>
                    <h3>Professional</h3>
                    <p>Clean, modern design perfect for recruiters and professional networking</p>
                    <button class="layout-select-btn" data-layout="professional">Select Professional</button>
                </div>
                
                <div class="layout-option" data-layout="vscode">
                    <div class="layout-preview vscode-preview">
                        <div class="preview-header vscode-header">
                            <div class="preview-title">VSCode</div>
                        </div>
                        <div class="preview-content vscode-content">
                            <div class="preview-section vscode-section">// Code-themed</div>
                            <div class="preview-section vscode-section">Developer Experience</div>
                            <div class="preview-section vscode-section">Interactive</div>
                        </div>
                    </div>
                    <h3>VSCode Theme</h3>
                    <p>Developer-focused interface that mimics Visual Studio Code</p>
                    <button class="layout-select-btn" data-layout="vscode">Select VSCode</button>
                </div>
            </div>
            
            <div class="layout-overlay-footer">
                <p>You can change this anytime using the layout switcher in the top-right corner</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add event listeners to layout options
    const layoutOptions = overlay.querySelectorAll('.layout-option');
    layoutOptions.forEach(option => {
        option.addEventListener('click', function() {
            const layout = this.getAttribute('data-layout');
            selectLayout(layout);
        });
    });
}

/**
 * Select a layout and hide overlay
 */
function selectLayout(layout) {
    // Save layout preference
    localStorage.setItem('portfolioLayout', layout);
    
    // Hide overlay
    const overlay = document.querySelector('.layout-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    // Apply the selected layout
    applyLayout(layout);
}

/**
 * Apply the selected layout
 */
function applyLayout(layout) {
    const body = document.body;
    
    // Remove existing layout classes
    body.classList.remove('professional-layout', 'vscode-layout');
    
    // Add new layout class
    body.classList.add(`${layout}-layout`);
    
    // Show/hide appropriate content
    if (layout === 'professional') {
        showProfessionalLayout();
    } else if (layout === 'vscode') {
        showVSCodeLayout();
    }
    
    // Update layout switcher
    updateLayoutSwitcher(layout);
}

/**
 * Show professional layout
 */
function showProfessionalLayout() {
    // Hide VSCode elements
    const vscodeElements = document.querySelectorAll('.vscode-container, .vscode-top-bar, .vscode-sidebar-icons, .vscode-explorer, .vscode-tabs, .vscode-status-bar');
    vscodeElements.forEach(el => el.style.display = 'none');
    
    // Show professional elements
    const professionalContainer = document.querySelector('.professional-container');
    if (professionalContainer) {
        professionalContainer.style.display = 'block';
    }
}

/**
 * Show VSCode layout
 */
function showVSCodeLayout() {
    // Show VSCode elements
    const vscodeElements = document.querySelectorAll('.vscode-container, .vscode-top-bar, .vscode-sidebar-icons, .vscode-explorer, .vscode-tabs, .vscode-status-bar');
    vscodeElements.forEach(el => el.style.display = '');
    
    // Hide professional elements
    const professionalContainer = document.querySelector('.professional-container');
    if (professionalContainer) {
        professionalContainer.style.display = 'none';
    }
}

/**
 * Initialize layout switcher
 */
function initLayoutSwitcher() {
    // Create layout switcher if it doesn't exist
    let switcher = document.querySelector('.layout-switcher');
    if (!switcher) {
        switcher = document.createElement('div');
        switcher.className = 'layout-switcher';
        switcher.innerHTML = `
            <button class="layout-switch-btn" title="Switch Layout">
                <i data-lucide="layout" class="lucide-icon"></i>
            </button>
            <div class="layout-switch-menu" style="display: none;">
                <button class="layout-switch-option" data-layout="professional">
                    <i data-lucide="briefcase" class="lucide-icon"></i>
                    Professional
                </button>
                <button class="layout-switch-option" data-layout="vscode">
                    <i data-lucide="code" class="lucide-icon"></i>
                    VSCode
                </button>
            </div>
        `;
        document.body.appendChild(switcher);
        
        // Add event listeners
        const switchBtn = switcher.querySelector('.layout-switch-btn');
        const switchMenu = switcher.querySelector('.layout-switch-menu');
        const switchOptions = switcher.querySelectorAll('.layout-switch-option');
        
        switchBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            switchMenu.style.display = switchMenu.style.display === 'none' ? 'block' : 'none';
        });
        
        switchOptions.forEach(option => {
            option.addEventListener('click', function() {
                const layout = this.getAttribute('data-layout');
                applyLayout(layout);
                localStorage.setItem('portfolioLayout', layout);
                switchMenu.style.display = 'none';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function() {
            switchMenu.style.display = 'none';
        });
    }
}

/**
 * Update layout switcher to show current layout
 */
function updateLayoutSwitcher(currentLayout) {
    const switcher = document.querySelector('.layout-switcher');
    if (switcher) {
        const options = switcher.querySelectorAll('.layout-switch-option');
        options.forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-layout') === currentLayout) {
                option.classList.add('active');
            }
        });
    }
}

// Declare lucide variable. Assuming it's globally available after including lucide-static.js
const lucide = window.lucide;