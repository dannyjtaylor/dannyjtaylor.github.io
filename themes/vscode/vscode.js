/**
 * VSCode Theme JavaScript Functionality
 */

function initVSCodeFunctionality() {
    console.log('Initializing VSCode functionality...');
    
    // Initialize sidebar icons
    initSidebarIcons();
    
    // Initialize file explorer
    initFileExplorer();
    
    // Initialize editor tabs
    initEditorTabs();
    
    // Initialize terminal
    initTerminal();
    
    // Initialize file clicks
    initFileClicks();
}

/**
 * Initialize sidebar icon functionality
 */
function initSidebarIcons() {
    const sidebarIcons = document.querySelectorAll('.vscode-sidebar-icon');
    
    sidebarIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const iconType = this.getAttribute('data-icon');
            
            // Update active state
            sidebarIcons.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide corresponding panels
            switch(iconType) {
                case 'explorer':
                    showExplorerPanel();
                    break;
                case 'search':
                    showSearchPanel();
                    break;
                case 'git':
                    showGitPanel();
                    break;
                case 'extensions':
                    showExtensionsPanel();
                    break;
            }
        });
    });
}

/**
 * Initialize file explorer functionality
 */
function initFileExplorer() {
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
 * Initialize file click functionality
 */
function initFileClicks() {
    const files = document.querySelectorAll('.vscode-file');
    
    files.forEach(file => {
        file.addEventListener('click', function() {
            const fileName = this.getAttribute('data-file');
            
            // Open file in new tab
            openFileInTab(fileName);
            
            // Update code content
            updateCodeContent(fileName);
        });
    });
}

/**
 * Open a file in a new tab
 */
function openFileInTab(fileName) {
    const tabs = document.querySelector('.vscode-tabs');
    
    // Check if tab already exists
    const existingTab = document.querySelector(`.vscode-tab[data-tab="${fileName}"]`);
    if (existingTab) {
        // Make existing tab active
        document.querySelectorAll('.vscode-tab').forEach(tab => tab.classList.remove('active'));
        existingTab.classList.add('active');
        return;
    }
    
    // Create new tab
    const newTab = document.createElement('div');
    newTab.className = 'vscode-tab active';
    newTab.setAttribute('data-tab', fileName);
    
    const icon = getFileIcon(fileName);
    newTab.innerHTML = `
        <i data-lucide="${icon}" class="lucide-icon"></i>
        <span>${fileName}</span>
        <i data-lucide="x" class="lucide-icon close-tab"></i>
    `;
    
    // Remove active class from other tabs
    document.querySelectorAll('.vscode-tab').forEach(tab => tab.classList.remove('active'));
    
    // Add new tab
    tabs.appendChild(newTab);
    
    // Re-initialize Lucide icons
    lucide.createIcons();
    
    // Add close functionality
    const closeBtn = newTab.querySelector('.close-tab');
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeTab(fileName);
    });
}

/**
 * Close a tab
 */
function closeTab(fileName) {
    const tab = document.querySelector(`.vscode-tab[data-tab="${fileName}"]`);
    if (tab) {
        tab.remove();
        
        // If this was the active tab, activate another tab
        const remainingTabs = document.querySelectorAll('.vscode-tab');
        if (remainingTabs.length > 0) {
            remainingTabs[remainingTabs.length - 1].classList.add('active');
        }
    }
}

/**
 * Get appropriate icon for file type
 */
function getFileIcon(fileName) {
    const extension = fileName.split('.').pop();
    
    switch(extension) {
        case 'html':
            return 'file-text';
        case 'css':
            return 'palette';
        case 'js':
            return 'file-code';
        case 'json':
            return 'file-text';
        case 'md':
            return 'file-text';
        default:
            return 'file';
    }
}

/**
 * Update code content based on file
 */
function updateCodeContent(fileName) {
    const codeContent = document.querySelector('.vscode-code-content');
    
    // Sample content for different files
    const fileContents = {
        'index.html': `
            <span class="vscode-comment">&lt;!-- Daniel J. Taylor Portfolio --&gt;</span>
            <span class="vscode-tag">&lt;h1&gt;</span>
            <span class="vscode-text">Welcome to my Portfolio</span>
            <span class="vscode-tag">&lt;/h1&gt;</span>
            <span class="vscode-tag">&lt;p&gt;</span>
            <span class="vscode-text">Computer Engineering Student & Developer</span>
            <span class="vscode-tag">&lt;/p&gt;</span>
        `,
        'experience.html': `
            <span class="vscode-comment">&lt;!-- Professional Experience --&gt;</span>
            <span class="vscode-tag">&lt;section&gt;</span>
            <span class="vscode-tag">&lt;h2&gt;</span>
            <span class="vscode-text">Smart City Student Intern</span>
            <span class="vscode-tag">&lt;/h2&gt;</span>
            <span class="vscode-tag">&lt;p&gt;</span>
            <span class="vscode-text">City of Winter Haven Technology Services</span>
            <span class="vscode-tag">&lt;/p&gt;</span>
            <span class="vscode-tag">&lt;/section&gt;</span>
        `,
        'projects.html': `
            <span class="vscode-comment">&lt;!-- Projects --&gt;</span>
            <span class="vscode-tag">&lt;section&gt;</span>
            <span class="vscode-tag">&lt;h2&gt;</span>
            <span class="vscode-text">Technical Projects</span>
            <span class="vscode-tag">&lt;/h2&gt;</span>
            <span class="vscode-tag">&lt;div&gt;</span>
            <span class="vscode-text">Q&Apes AI Assistant</span>
            <span class="vscode-tag">&lt;/div&gt;</span>
            <span class="vscode-tag">&lt;/section&gt;</span>
        `,
        'extracurriculars.html': `
            <span class="vscode-comment">&lt;!-- Leadership & Activities --&gt;</span>
            <span class="vscode-tag">&lt;section&gt;</span>
            <span class="vscode-tag">&lt;h2&gt;</span>
            <span class="vscode-text">Student Organizations</span>
            <span class="vscode-tag">&lt;/h2&gt;</span>
            <span class="vscode-tag">&lt;ul&gt;</span>
            <span class="vscode-tag">&lt;li&gt;</span>
            <span class="vscode-text">SHPE - Vice President</span>
            <span class="vscode-tag">&lt;/li&gt;</span>
            <span class="vscode-tag">&lt;/ul&gt;</span>
            <span class="vscode-tag">&lt;/section&gt;</span>
        `,
        'contact.html': `
            <span class="vscode-comment">&lt;!-- Contact Information --&gt;</span>
            <span class="vscode-tag">&lt;section&gt;</span>
            <span class="vscode-tag">&lt;h2&gt;</span>
            <span class="vscode-text">Get In Touch</span>
            <span class="vscode-tag">&lt;/h2&gt;</span>
            <span class="vscode-tag">&lt;p&gt;</span>
            <span class="vscode-text">dannyengineers@outlook.com</span>
            <span class="vscode-tag">&lt;/p&gt;</span>
            <span class="vscode-tag">&lt;/section&gt;</span>
        `
    };
    
    const content = fileContents[fileName] || `
        <span class="vscode-comment">// File: ${fileName}</span>
        <span class="vscode-text">Content not available</span>
    `;
    
    codeContent.innerHTML = content;
}

/**
 * Initialize editor tabs functionality
 */
function initEditorTabs() {
    // Tab switching functionality is handled in openFileInTab
    // Close tab functionality is added when tabs are created
}

/**
 * Initialize terminal functionality
 */
function initTerminal() {
    const terminalPanel = document.getElementById('terminal-panel');
    const closeTerminal = document.querySelector('.close-terminal');
    
    if (closeTerminal) {
        closeTerminal.addEventListener('click', function() {
            terminalPanel.style.display = 'none';
        });
    }
    
    // Add keyboard shortcut to toggle terminal (Ctrl+`)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === '`') {
            e.preventDefault();
            if (terminalPanel.style.display === 'none') {
                terminalPanel.style.display = 'flex';
            } else {
                terminalPanel.style.display = 'none';
            }
        }
    });
}

/**
 * Show explorer panel
 */
function showExplorerPanel() {
    const explorer = document.getElementById('explorer-panel');
    if (explorer) {
        explorer.style.display = 'block';
    }
}

/**
 * Show search panel (placeholder)
 */
function showSearchPanel() {
    console.log('Search panel not implemented yet');
}

/**
 * Show git panel (placeholder)
 */
function showGitPanel() {
    console.log('Git panel not implemented yet');
}

/**
 * Show extensions panel (placeholder)
 */
function showExtensionsPanel() {
    console.log('Extensions panel not implemented yet');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initVSCodeFunctionality();
});
