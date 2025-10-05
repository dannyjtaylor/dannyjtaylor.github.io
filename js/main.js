document.addEventListener('DOMContentLoaded', function() {
    // Initialize layout system
    initLayoutSystem();
    
    // Initialize folder toggles
    initFolderToggles();
    
    // Handle form submission
    initContactForm();
    
    // Initialize terminal functionality
    initTerminal();
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
    
    // Show overlay if no layout is saved, otherwise default to VSCode
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
                
                <div class="layout-option" data-layout="discord">
                    <div class="layout-preview discord-preview">
                        <div class="preview-header discord-header">
                            <div class="preview-title">Discord</div>
                        </div>
                        <div class="preview-content discord-content">
                            <div class="preview-section discord-section"># channels</div>
                            <div class="preview-section discord-section">Interactive Chat</div>
                            <div class="preview-section discord-section">Gaming Style</div>
                        </div>
                    </div>
                    <h3>Discord Theme</h3>
                    <p>Gaming-inspired interface with channels and interactive messaging</p>
                    <button class="layout-select-btn" data-layout="discord">Select Discord</button>
                </div>
                
                <div class="layout-option" data-layout="steam">
                    <div class="layout-preview steam-preview">
                        <div class="preview-header steam-header">
                            <div class="preview-title">Steam</div>
                        </div>
                        <div class="preview-content steam-content">
                            <div class="preview-section steam-section">Game Library</div>
                            <div class="preview-section steam-section">Social Features</div>
                            <div class="preview-section steam-section">Gaming UI</div>
                        </div>
                    </div>
                    <h3>Steam Theme</h3>
                    <p>Gaming platform interface with library navigation and social integration</p>
                    <button class="layout-select-btn" data-layout="steam">Select Steam</button>
                </div>
                
                <div class="layout-option" data-layout="valorant">
                    <div class="layout-preview valorant-preview">
                        <div class="preview-header valorant-header">
                            <div class="preview-title">Valorant</div>
                        </div>
                        <div class="preview-content valorant-content">
                            <div class="preview-section valorant-section">Tactical FPS</div>
                            <div class="preview-section valorant-section">Game Modes</div>
                            <div class="preview-section valorant-section">Competitive</div>
                        </div>
                    </div>
                    <h3>Valorant Theme</h3>
                    <p>Tactical shooter interface with game mode selection and competitive styling</p>
                    <button class="layout-select-btn" data-layout="valorant">Select Valorant</button>
                </div>
                
                <div class="layout-option" data-layout="undertale">
                    <div class="layout-preview undertale-preview">
                        <div class="preview-header undertale-header">
                            <div class="preview-title">Undertale</div>
                        </div>
                        <div class="preview-content undertale-content">
                            <div class="preview-section undertale-section">Battle Menu</div>
                            <div class="preview-section undertale-section">Retro Style</div>
                            <div class="preview-section undertale-section">Pixel Art</div>
                        </div>
                    </div>
                    <h3>Undertale Theme</h3>
                    <p>Retro RPG battle interface with pixel art styling and nostalgic charm</p>
                    <button class="layout-select-btn" data-layout="undertale">Select Undertale</button>
                </div>
                
                <div class="layout-option" data-layout="persona3">
                    <div class="layout-preview persona3-preview">
                        <div class="preview-header persona3-header">
                            <div class="preview-title">Persona 3</div>
                        </div>
                        <div class="preview-content persona3-content">
                            <div class="preview-section persona3-section">Modern UI</div>
                            <div class="preview-section persona3-section">Stylish Design</div>
                            <div class="preview-section persona3-section">Anime Style</div>
                        </div>
                    </div>
                    <h3>Persona 3 Theme</h3>
                    <p>Modern anime-inspired interface with sleek design and smooth animations</p>
                    <button class="layout-select-btn" data-layout="persona3">Select Persona 3</button>
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
    body.classList.remove('professional-layout', 'vscode-layout', 'discord-layout');
    
    // Add new layout class
    body.classList.add(`${layout}-layout`);
    
    // Show/hide appropriate content
    if (layout === 'professional') {
        showProfessionalLayout();
    } else if (layout === 'vscode') {
        showVSCodeLayout();
    } else if (layout === 'discord') {
        showDiscordLayout();
    } else if (layout === 'steam') {
        showSteamLayout();
    } else if (layout === 'valorant') {
        showValorantLayout();
    } else if (layout === 'undertale') {
        showUndertaleLayout();
    } else if (layout === 'persona3') {
        showPersona3Layout();
    }
    
    // Update layout switcher
    updateLayoutSwitcher(layout);
}

/**
 * Show professional layout
 */
function showProfessionalLayout() {
    // Hide VSCode elements
    const vscodeElements = document.querySelectorAll('.vscode-container, .vscode-top-bar, .vscode-sidebar-icons, .vscode-explorer, .vscode-tabs, .vscode-status-bar, .vscode-terminal-panel');
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
    const vscodeElements = document.querySelectorAll('.vscode-container, .vscode-top-bar, .vscode-sidebar-icons, .vscode-explorer, .vscode-tabs, .vscode-status-bar, .vscode-terminal-panel');
    vscodeElements.forEach(el => el.style.display = '');
    
    // Hide professional and discord elements
    const professionalContainer = document.querySelector('.professional-container');
    const discordContainer = document.querySelector('.discord-container');
    if (professionalContainer) professionalContainer.style.display = 'none';
    if (discordContainer) discordContainer.style.display = 'none';
    
    // Re-initialize terminal when switching to VSCode layout
    setTimeout(() => {
        console.log('Re-initializing terminal for VSCode layout');
        initTerminal();
    }, 100);
}

/**
 * Show Discord layout
 */
function showDiscordLayout() {
    // Hide VSCode and professional elements
    const vscodeElements = document.querySelectorAll('.vscode-container, .vscode-top-bar, .vscode-sidebar-icons, .vscode-explorer, .vscode-tabs, .vscode-status-bar, .vscode-terminal-panel');
    vscodeElements.forEach(el => el.style.display = 'none');
    
    const professionalContainer = document.querySelector('.professional-container');
    if (professionalContainer) professionalContainer.style.display = 'none';
    
    // Show Discord elements
    const discordContainer = document.querySelector('.discord-container');
    if (discordContainer) {
        discordContainer.style.display = 'flex';
        initDiscordFunctionality();
    }
}

/**
 * Show Steam layout
 */
function showSteamLayout() {
    // Hide other layout elements
    const vscodeElements = document.querySelectorAll('.vscode-container, .vscode-top-bar, .vscode-sidebar-icons, .vscode-explorer, .vscode-tabs, .vscode-status-bar, .vscode-terminal-panel');
    vscodeElements.forEach(el => el.style.display = 'none');
    
    const professionalContainer = document.querySelector('.professional-container');
    const discordContainer = document.querySelector('.discord-container');
    if (professionalContainer) professionalContainer.style.display = 'none';
    if (discordContainer) discordContainer.style.display = 'none';
    
    // Show Steam elements
    const steamContainer = document.querySelector('.steam-container');
    if (steamContainer) {
        steamContainer.style.display = 'flex';
        initSteamFunctionality();
    }
}

/**
 * Initialize Discord functionality
 */
function initDiscordFunctionality() {
    // Channel switching
    const channels = document.querySelectorAll('.discord-channel');
    const channelName = document.getElementById('discord-channel-name');
    const messagesContainer = document.getElementById('discord-messages');
    const input = document.getElementById('discord-input');
    
    // Channel data
    const channelData = {
        home: {
            name: 'home',
            content: `
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:00 PM</span>
                        </div>
                        <div class="discord-message-text">
                            Hey there! 👋 Welcome to my portfolio! I'm Daniel J. Taylor, a Computer Engineering student at Florida Polytechnic University with a 4.0 GPA. I'm passionate about embedded systems, AI, and full-stack development. Currently working as a Smart City Student Intern for the City of Winter Haven, developing applications for 650+ employees across 11 departments.
                        </div>
                    </div>
                </div>
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:01 PM</span>
                        </div>
                        <div class="discord-message-text">
                            I'm pursuing both a BS in Computer Engineering (Advanced Topics) and an MS in Electrical Engineering. I love working on projects that combine hardware and software, from FPGA processors to AI assistants. Check out my other channels to see my work! 🚀
                        </div>
                    </div>
                </div>
            `
        },
        experience: {
            name: 'experience',
            content: `
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:02 PM</span>
                        </div>
                        <div class="discord-message-text">
                            <strong>Current Role:</strong> Smart City Student Intern at City of Winter Haven Technology Services (July 2024 - Current)
                            <br><br>• Developed full-stack CRUD app with PostgreSQL, Python, Docker, JavaScript, HTML, & CSS for 650+ employees
                            <br>• Increased city security & implemented Kisi code readers, controllers, IDs, and 2FA hardware tokens
                            <br>• Transformed point cloud data into Sketchup 3D models for evacuation routes & projection mapping
                        </div>
                    </div>
                </div>
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:03 PM</span>
                        </div>
                        <div class="discord-message-text">
                            <strong>Education Assistant/TA:</strong> Florida Polytechnic University (July 2024 - December 2024)
                            <br><br>• Utilized Peer Learning Strategist techniques to tutor 20+ students weekly
                            <br>• TA'd for Precalculus Algebra & Trigonometry as part of Phoenix Rising program
                            <br>• Teacher's Assistant for 3 sections of Differential Equations
                        </div>
                    </div>
                </div>
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:04 PM</span>
                        </div>
                        <div class="discord-message-text">
                            <strong>Research Assistant:</strong> Automotive & Applied Math Research (July 2024 - December 2024)
                            <br><br>• Led hybrid vehicle fuel efficiency study over 100 km routes
                            <br>• Interfaced with Ford Maverick's OBD-II port using FORScan
                            <br>• Automated generation of 100,000+ constrained polynomials using NumPy
                        </div>
                    </div>
                </div>
            `
        },
        projects: {
            name: 'projects',
            content: `
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:05 PM</span>
                        </div>
                        <div class="discord-message-text">
                            <strong>Q&Apes AI Assistant</strong> 🤖
                            <br>Developed an internal AI assistant serving 650+ city employees using GPT-4o, LangChain, and ChromaDB. Features document ingestion, REST endpoints, and integrated Whisper/ElevenLabs for speech functionality.
                        </div>
                    </div>
                </div>
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:06 PM</span>
                        </div>
                        <div class="discord-message-text">
                            <strong>32-bit RISC-V Processor</strong> 🔧
                            <br>Collaborated on designing a 32-bit RISC-V processor using SystemVerilog and Verilog. Prototyped on Intel FPGA DE10-Lite board with VGA output displaying live Fibonacci sequence.
                        </div>
                    </div>
                </div>
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:07 PM</span>
                        </div>
                        <div class="discord-message-text">
                            <strong>CRUD Employee Management App</strong> 💼
                            <br>Built full-stack CRUD application for City of Winter Haven serving 650+ employees. Features Excel-like interface with PostgreSQL, Python, FastAPI, and Docker.
                        </div>
                    </div>
                </div>
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:08 PM</span>
                        </div>
                        <div class="discord-message-text">
                            <strong>Autonomous Vehicle Simulation</strong> 🚗
                            <br>Designed full-scale AV simulation using Simulink with longitudinal/lateral controllers. Incorporated aerodynamic drag, friction, and tuned PID controller for optimal stability.
                        </div>
                    </div>
                </div>
            `
        },
        leadership: {
            name: 'leadership',
            content: `
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:09 PM</span>
                        </div>
                        <div class="discord-message-text">
                            <strong>Vice President of Professional Development</strong> - Society of Hispanic Professional Engineers (SHPE)
                            <br><br>Leading professional development initiatives for engineering students, organizing workshops, networking events, and career development programs. Helping members advance their professional skills and career prospects.
                        </div>
                    </div>
                </div>
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:10 PM</span>
                        </div>
                        <div class="discord-message-text">
                            <strong>Vice President</strong> - Rotaract International
                            <br><br>Organizing community service projects, fundraising events, and international service initiatives. Leading efforts to make a positive impact in the local community and beyond.
                        </div>
                    </div>
                </div>
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:11 PM</span>
                        </div>
                        <div class="discord-message-text">
                            <strong>Certifications:</strong> Python Certified Associate Programmer (PCAP), PCEP, CompTIA ITF+, SOLIDWORKS (CSWA), Microsoft Office
                            <br><br><strong>Academic Achievements:</strong> President's List, 4.0 GPA, Advanced Topics Concentration
                        </div>
                    </div>
                </div>
            `
        },
        contact: {
            name: 'contact',
            content: `
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:12 PM</span>
                        </div>
                        <div class="discord-message-text">
                            <strong>Let's connect! 📧</strong>
                            <br><br>📧 Email: dannyengineers@outlook.com
                            <br>📍 Location: Lakeland, FL (Open to relocate)
                            <br>💼 LinkedIn: linkedin.com/in/dannyjtaylor
                            <br>🐙 GitHub: github.com/dannyjtaylor
                        </div>
                    </div>
                </div>
                <div class="discord-message">
                    <div class="discord-avatar">D</div>
                    <div class="discord-message-content">
                        <div class="discord-message-header">
                            <span class="discord-username">danny</span>
                            <span class="discord-timestamp">Today at 12:13 PM</span>
                        </div>
                        <div class="discord-message-text">
                            I'm always interested in new opportunities, collaborations, and conversations about technology and engineering! Whether you're looking for a talented engineer, want to collaborate on a project, or just want to chat about tech, I'd love to hear from you! 🚀
                        </div>
                    </div>
                </div>
            `
        }
    };
    
    // Channel switching
    channels.forEach(channel => {
        channel.addEventListener('click', function() {
            const channelType = this.getAttribute('data-channel');
            
            // Update active channel
            channels.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Update channel name and content
            channelName.textContent = `# ${channelType}`;
            messagesContainer.innerHTML = channelData[channelType].content;
            
            // Update input placeholder
            input.placeholder = `Message #${channelType}`;
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
    });
    
    // Message sending functionality
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = this.value.trim();
            if (message) {
                addUserMessage(message);
                this.value = '';
            }
        }
    });
    
    // Auto-resize textarea
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });
}

/**
 * Add user message to Discord chat
 */
function addUserMessage(message) {
    const messagesContainer = document.getElementById('discord-messages');
    const username = document.getElementById('discord-username').textContent;
    const userAvatar = document.getElementById('discord-user-avatar').textContent;
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const messageElement = document.createElement('div');
    messageElement.className = 'discord-message';
    messageElement.innerHTML = `
        <div class="discord-avatar" style="background: #5865f2;">${userAvatar}</div>
        <div class="discord-message-content">
            <div class="discord-message-header">
                <span class="discord-username">${username}</span>
                <span class="discord-timestamp">Today at ${timestamp}</span>
            </div>
            <div class="discord-message-text">${message}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
                <button class="layout-switch-option" data-layout="discord">
                    <i data-lucide="message-circle" class="lucide-icon"></i>
                    Discord
                </button>
                <button class="layout-switch-option" data-layout="steam">
                    <i data-lucide="gamepad-2" class="lucide-icon"></i>
                    Steam
                </button>
                <button class="layout-switch-option" data-layout="valorant">
                    <i data-lucide="target" class="lucide-icon"></i>
                    Valorant
                </button>
                <button class="layout-switch-option" data-layout="undertale">
                    <i data-lucide="heart" class="lucide-icon"></i>
                    Undertale
                </button>
                <button class="layout-switch-option" data-layout="persona3">
                    <i data-lucide="sparkles" class="lucide-icon"></i>
                    Persona 3
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

/**
 * Initialize terminal functionality (only on home page)
 */
function initTerminal() {
    // Only initialize terminal on home page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage !== 'index.html' && currentPage !== '') {
        console.log('Terminal only available on home page');
        return;
    }
    
    const terminalContent = document.getElementById('terminal-content');
    
    if (!terminalContent) {
        console.log('Terminal content not found');
        return;
    }
    
    console.log('Initializing terminal on home page...');
    
    // Terminal state
    let currentPath = '~';
    let commandHistory = [];
    let historyIndex = -1;
    let currentInput = '';
    let isProcessing = false;
    
    // Available commands and directories
    const commands = {
        'help': {
            description: 'Show available commands',
            usage: '/help'
        },
        'ls': {
            description: 'List directory contents',
            usage: 'ls [directory]'
        },
        'cd': {
            description: 'Change directory',
            usage: 'cd <directory>'
        },
        'clear': {
            description: 'Clear terminal screen',
            usage: 'clear'
        }
    };
    
    const directories = {
        '~': ['home', 'experience', 'projects', 'extracurriculars', 'contact'],
        'home': [],
        'experience': [],
        'projects': [],
        'extracurriculars': [],
        'contact': []
    };
    
    const pageMapping = {
        'home': 'index.html',
        'experience': 'experience.html',
        'projects': 'projects.html',
        'extracurriculars': 'extracurriculars.html',
        'contact': 'contact.html'
    };
    
    // Clear any existing content and show welcome message
    terminalContent.innerHTML = '';
    addTerminalOutput('Welcome to Daniel\'s Portfolio Terminal!');
    addTerminalOutput('Type /help to see available commands.');
    addNewPrompt();
    
    // Handle keyboard input on terminal content
    terminalContent.addEventListener('keydown', handleKeyDown);
    terminalContent.addEventListener('click', function() {
        terminalContent.focus();
    });
    
    // Make terminal content focusable
    terminalContent.setAttribute('tabindex', '0');
    terminalContent.style.outline = 'none';
    
    // Focus the terminal
    setTimeout(() => {
        terminalContent.focus();
        console.log('Terminal focused');
    }, 100);
    
    function handleKeyDown(e) {
        console.log('Key pressed:', e.key);
        if (isProcessing) return;
        
        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentInput.trim()) {
                // Add command to history
                commandHistory.push(currentInput.trim());
                historyIndex = commandHistory.length;
                
                // Display the command
                addCommandLine(currentInput.trim());
                
                // Process the command
                processCommand(currentInput.trim());
                
                // Clear input
                currentInput = '';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                currentInput = commandHistory[historyIndex];
                updateCurrentPrompt();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                currentInput = commandHistory[historyIndex];
                updateCurrentPrompt();
            } else {
                historyIndex = commandHistory.length;
                currentInput = '';
                updateCurrentPrompt();
            }
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            if (currentInput.length > 0) {
                currentInput = currentInput.slice(0, -1);
                updateCurrentPrompt();
            }
        } else if (e.key.length === 1) {
            e.preventDefault();
            currentInput += e.key;
            updateCurrentPrompt();
        }
    }
    
    function addCommandLine(command) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="terminal-prompt">danny@portfolio:${currentPath}$</span> ${command}`;
        terminalContent.appendChild(line);
        scrollToBottom();
    }
    
    function addTerminalOutput(text, type = 'output') {
        const line = document.createElement('div');
        line.className = `terminal-${type}`;
        line.textContent = text;
        terminalContent.appendChild(line);
        scrollToBottom();
    }
    
    function addNewPrompt() {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.id = 'current-prompt';
        line.innerHTML = `<span class="terminal-prompt">danny@portfolio:${currentPath}$</span> <span class="terminal-cursor">█</span>`;
        terminalContent.appendChild(line);
        scrollToBottom();
    }
    
    function updateCurrentPrompt() {
        const currentPrompt = document.getElementById('current-prompt');
        if (currentPrompt) {
            currentPrompt.innerHTML = `<span class="terminal-prompt">danny@portfolio:${currentPath}$</span> ${currentInput}<span class="terminal-cursor">█</span>`;
        }
    }
    
    function scrollToBottom() {
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }
    
    function processCommand(command) {
        isProcessing = true;
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        switch (cmd) {
            case '/help':
            case 'help':
                showHelp();
                break;
            case 'ls':
                listDirectory(args[0]);
                break;
            case 'cd':
                changeDirectory(args[0]);
                break;
            case 'clear':
                clearTerminal();
                break;
            default:
                addTerminalOutput(`Unknown command. Try /help to see the list of commands!`, 'error');
                addNewPrompt();
        }
        isProcessing = false;
    }
    
    function showHelp() {
        addTerminalOutput('Available commands:');
        Object.entries(commands).forEach(([cmd, info]) => {
            addTerminalOutput(`  ${info.usage.padEnd(20)} - ${info.description}`);
        });
        addNewPrompt();
    }
    
    function listDirectory(dir = null) {
        const targetDir = dir || currentPath;
        const contents = directories[targetDir];
        
        if (contents === undefined) {
            addTerminalOutput(`ls: cannot access '${targetDir}': No such file or directory`, 'error');
        } else {
            if (contents.length === 0) {
                addTerminalOutput('(empty)');
            } else {
                contents.forEach(item => {
                    addTerminalOutput(item);
                });
            }
        }
        addNewPrompt();
    }
    
    function changeDirectory(dir) {
        if (!dir) {
            currentPath = '~';
            addNewPrompt();
        } else if (directories[dir] !== undefined) {
            currentPath = dir;
            addNewPrompt();
            
            // Navigate to the corresponding page if it's not the home directory
            if (dir !== '~' && pageMapping[dir]) {
                addTerminalOutput(`Navigating to ${dir}...`, 'success');
                setTimeout(() => {
                    window.location.href = pageMapping[dir];
                }, 1000);
            }
        } else {
            addTerminalOutput(`cd: ${dir}: No such file or directory`, 'error');
            addNewPrompt();
        }
    }
    
    function clearTerminal() {
        terminalContent.innerHTML = '';
        addTerminalOutput('Welcome to Daniel\'s Portfolio Terminal!');
        addTerminalOutput('Type /help to see available commands.');
        addNewPrompt();
    }
}

/**
 * Initialize Steam functionality
 */
function initSteamFunctionality() {
    const games = document.querySelectorAll('.steam-game');
    const tabs = document.querySelectorAll('.steam-tab');
    const playButton = document.getElementById('steam-play-button');
    const pageTitle = document.getElementById('steam-page-title');
    const pageSubtitle = document.getElementById('steam-page-subtitle');
    const pageContent = document.getElementById('steam-page-content');
    
    // Page configurations with alternating social media buttons
    const pageConfigs = {
        'home': {
            title: 'Daniel J Taylor Portfolio',
            subtitle: 'Computer Engineering Student & Developer',
            button: { icon: 'linkedin', text: 'LinkedIn', url: 'https://www.linkedin.com/in/dannyjtaylor/' },
            content: 'Welcome to my portfolio! I\'m a Computer Engineering student at Florida Polytechnic University with experience in software development, research, and smart city technologies.'
        },
        'experience': {
            title: 'Professional Experience',
            subtitle: 'Work History & Achievements',
            button: { icon: 'github', text: 'GitHub', url: 'https://github.com/dannyjtaylor' },
            content: 'Explore my professional journey including internships, research positions, and academic achievements.'
        },
        'projects': {
            title: 'Portfolio Projects',
            subtitle: 'Technical Projects & Development',
            button: { icon: 'linkedin', text: 'LinkedIn', url: 'https://www.linkedin.com/in/dannyjtaylor/' },
            content: 'Discover my technical projects ranging from web development to embedded systems and research applications.'
        },
        'extracurriculars': {
            title: 'Leadership & Activities',
            subtitle: 'Student Organizations & Leadership',
            button: { icon: 'github', text: 'GitHub', url: 'https://github.com/dannyjtaylor' },
            content: 'Learn about my involvement in student organizations, leadership roles, and extracurricular activities.'
        },
        'contact': {
            title: 'Get In Touch',
            subtitle: 'Connect & Collaborate',
            button: { icon: 'linkedin', text: 'LinkedIn', url: 'https://www.linkedin.com/in/dannyjtaylor/' },
            content: 'Ready to connect? Reach out for opportunities, collaborations, or just to say hello!'
        }
    };
    
    // Handle game clicks (only portfolio game is functional)
    games.forEach(game => {
        game.addEventListener('click', function() {
            const gameType = this.getAttribute('data-game');
            
            // Update active states
            games.forEach(g => g.classList.remove('active'));
            this.classList.add('active');
            
            // Only portfolio game shows content
            if (gameType === 'portfolio') {
                switchToPage('home');
            } else {
                // Show "Coming Soon" or game info for other games
                if (pageTitle) pageTitle.textContent = this.querySelector('.steam-game-name').textContent;
                if (pageSubtitle) pageSubtitle.textContent = 'Game Information';
                if (pageContent) pageContent.textContent = 'This game is not available in this portfolio demo.';
                
                // Update play button for games
                if (playButton) {
                    const icon = playButton.querySelector('.lucide-icon');
                    const text = playButton.querySelector('span');
                    
                    if (icon) {
                        icon.setAttribute('data-lucide', 'play');
                        lucide.createIcons();
                    }
                    if (text) text.textContent = 'Play';
                }
            }
        });
    });
    
    // Handle tab clicks
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const page = this.getAttribute('data-tab');
            switchToPage(page);
        });
    });
    
    // Handle play button click
    if (playButton) {
        playButton.addEventListener('click', function() {
            const currentPage = getCurrentPage();
            const config = pageConfigs[currentPage];
            if (config && config.button.url) {
                window.open(config.button.url, '_blank');
            }
        });
    }
    
    function switchToPage(page) {
        const config = pageConfigs[page];
        if (!config) return;
        
        // Update active states
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === page);
        });
        
        // Update page content
        if (pageTitle) pageTitle.textContent = config.title;
        if (pageSubtitle) pageSubtitle.textContent = config.subtitle;
        if (pageContent) pageContent.textContent = config.content;
        
        // Update play button
        if (playButton) {
            const icon = playButton.querySelector('.lucide-icon');
            const text = playButton.querySelector('span');
            
            if (icon) {
                icon.setAttribute('data-lucide', config.button.icon);
                lucide.createIcons();
            }
            if (text) text.textContent = config.button.text;
        }
        
        // Navigate to the actual page
        if (page !== 'home') {
            setTimeout(() => {
                window.location.href = `${page}.html`;
            }, 500);
        }
    }
    
    function getCurrentPage() {
        const activeTab = document.querySelector('.steam-tab.active');
        return activeTab ? activeTab.getAttribute('data-tab') : 'home';
    }
    
    // Initialize with portfolio game selected
    const portfolioGame = document.querySelector('.steam-game[data-game="portfolio"]');
    if (portfolioGame) {
        portfolioGame.click();
    }
}

/**
 * Show Professional layout
 */
function showProfessionalLayout() {
    window.location.href = 'themes/professional/index.html';
}

/**
 * Show VSCode layout
 */
function showVSCodeLayout() {
    window.location.href = 'themes/vscode/index.html';
}

/**
 * Show Discord layout
 */
function showDiscordLayout() {
    window.location.href = 'themes/discord/index.html';
}

/**
 * Show Steam layout
 */
function showSteamLayout() {
    window.location.href = 'themes/steam/index.html';
}

/**
 * Show Valorant layout
 */
function showValorantLayout() {
    window.location.href = 'themes/valorant/index.html';
}

/**
 * Show Undertale layout
 */
function showUndertaleLayout() {
    window.location.href = 'themes/undertale/index.html';
}

/**
 * Show Persona 3 layout
 */
function showPersona3Layout() {
    window.location.href = 'themes/persona3/index.html';
}
