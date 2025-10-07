/**
 * Discord Theme JavaScript Functionality
 */

function initDiscordFunctionality() {
    console.log('Initializing Discord functionality...');
    
    // Initialize channel switching
    initChannelSwitching();
    
    // Initialize message input
    initMessageInput();
    
    // Initialize auto-resize textarea
    initAutoResizeTextarea();
    
    // Load initial channel content
    loadChannelContent('home');
}

/**
 * Initialize channel switching functionality
 */
function initChannelSwitching() {
    const channels = document.querySelectorAll('.discord-channel');
    
    channels.forEach(channel => {
        channel.addEventListener('click', function() {
            const channelType = this.getAttribute('data-channel');
            
            // Update active channel
            channels.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Update channel name and content
            const channelName = document.getElementById('discord-channel-name');
            if (channelName) {
                channelName.textContent = channelType;
            }
            
            // Load channel content
            loadChannelContent(channelType);
            
            // Update input placeholder
            const input = document.getElementById('discord-input');
            if (input) {
                input.placeholder = `Message #${channelType}`;
            }
            
            // Scroll to bottom
            const messagesContainer = document.getElementById('discord-messages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        });
    });
}

/**
 * Load content for a specific channel
 */
function loadChannelContent(channelType) {
    const messagesContainer = document.getElementById('discord-messages');
    if (!messagesContainer) return;
    
    // Channel data
    const channelData = {
        'home': {
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
        'experience': {
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
        'projects': {
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
        'extracurriculars': {
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
        'contact': {
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
    
    const content = channelData[channelType] ? channelData[channelType].content : '<div class="discord-message"><div class="discord-avatar">D</div><div class="discord-message-content"><div class="discord-message-text">Channel not found!</div></div></div>';
    messagesContainer.innerHTML = content;
}

/**
 * Initialize message input functionality
 */
function initMessageInput() {
    const input = document.getElementById('discord-input');
    if (!input) return;
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = this.value.trim();
            if (message) {
                addUserMessage(message);
                this.value = '';
                this.style.height = 'auto';
            }
        }
    });
}

/**
 * Initialize auto-resize textarea
 */
function initAutoResizeTextarea() {
    const input = document.getElementById('discord-input');
    if (!input) return;
    
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
    if (!messagesContainer) return;
    
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const messageElement = document.createElement('div');
    messageElement.className = 'discord-message';
    messageElement.innerHTML = `
        <div class="discord-avatar" style="background: #5865f2;">D</div>
        <div class="discord-message-content">
            <div class="discord-message-header">
                <span class="discord-username">You</span>
                <span class="discord-timestamp">Today at ${timestamp}</span>
            </div>
            <div class="discord-message-text">${message}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simulate a response after a short delay
    setTimeout(() => {
        addBotResponse(message);
    }, 1000);
}

/**
 * Add bot response to Discord chat
 */
function addBotResponse(userMessage) {
    const messagesContainer = document.getElementById('discord-messages');
    if (!messagesContainer) return;
    
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Simple response logic
    let response = "Thanks for your message! Feel free to explore my other channels to learn more about my experience and projects.";
    
    if (userMessage.toLowerCase().includes('experience')) {
        response = "Check out the #experience channel for details about my professional background and internships!";
    } else if (userMessage.toLowerCase().includes('project')) {
        response = "Take a look at the #projects channel to see my technical work and development projects!";
    } else if (userMessage.toLowerCase().includes('contact')) {
        response = "You can find my contact information in the #contact channel!";
    } else if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        response = "Hello! 👋 Welcome to my portfolio! Feel free to ask me anything about my work or experience.";
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = 'discord-message';
    messageElement.innerHTML = `
        <div class="discord-avatar">D</div>
        <div class="discord-message-content">
            <div class="discord-message-header">
                <span class="discord-username">danny</span>
                <span class="discord-timestamp">Today at ${timestamp}</span>
            </div>
            <div class="discord-message-text">${response}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initDiscordFunctionality();
});
