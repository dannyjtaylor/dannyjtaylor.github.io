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
    
    // Hide professional and discord elements
    const professionalContainer = document.querySelector('.professional-container');
    const discordContainer = document.querySelector('.discord-container');
    if (professionalContainer) professionalContainer.style.display = 'none';
    if (discordContainer) discordContainer.style.display = 'none';
}

/**
 * Show Discord layout
 */
function showDiscordLayout() {
    // Hide VSCode and professional elements
    const vscodeElements = document.querySelectorAll('.vscode-container, .vscode-top-bar, .vscode-sidebar-icons, .vscode-explorer, .vscode-tabs, .vscode-status-bar');
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