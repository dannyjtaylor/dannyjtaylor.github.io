/**
 * Initialize Valorant functionality
 */
function initValorantFunctionality() {
    const gamemodes = document.querySelectorAll('.valorant-gamemode');
    const playButton = document.getElementById('valorant-play-button');
    const pageTitle = document.getElementById('valorant-page-title');
    const pageSubtitle = document.getElementById('valorant-page-subtitle');
    const pageContent = document.getElementById('valorant-page-content');
    
    // Page configurations with alternating social media buttons
    const pageConfigs = {
        'home': {
            title: 'Daniel J. Taylor',
            subtitle: 'Computer Engineering Student & Developer',
            button: { icon: 'linkedin', text: 'LinkedIn', url: 'https://www.linkedin.com/in/dannyjtaylor/' },
            content: 'Welcome to my portfolio! I\'m a Computer Engineering student at Florida Polytechnic University with experience in software development, research, and smart city technologies. Ready to make an impact in the tech world!'
        },
        'experience': {
            title: 'Professional Experience',
            subtitle: 'Work History & Achievements',
            button: { icon: 'github', text: 'GitHub', url: 'https://github.com/dannyjtaylor' },
            content: 'Explore my professional journey including internships, research positions, and academic achievements. From Smart City internships to research assistant roles, I\'ve gained valuable experience in technology and engineering.'
        },
        'projects': {
            title: 'Portfolio Projects',
            subtitle: 'Technical Projects & Development',
            button: { icon: 'linkedin', text: 'LinkedIn', url: 'https://www.linkedin.com/in/dannyjtaylor/' },
            content: 'Discover my technical projects ranging from web development to embedded systems and research applications. Each project showcases my skills in programming, problem-solving, and innovation.'
        },
        'extracurriculars': {
            title: 'Leadership & Activities',
            subtitle: 'Student Organizations & Leadership',
            button: { icon: 'github', text: 'GitHub', url: 'https://github.com/dannyjtaylor' },
            content: 'Learn about my involvement in student organizations, leadership roles, and extracurricular activities. I believe in giving back to the community and developing leadership skills alongside technical expertise.'
        },
        'contact': {
            title: 'Get In Touch',
            subtitle: 'Connect & Collaborate',
            button: { icon: 'linkedin', text: 'LinkedIn', url: 'https://www.linkedin.com/in/dannyjtaylor/' },
            content: 'Ready to connect? Reach out for opportunities, collaborations, or just to say hello! I\'m always interested in discussing technology, engineering, and potential opportunities.'
        }
    };
    
    // Handle gamemode clicks
    gamemodes.forEach(gamemode => {
        gamemode.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            switchToMode(mode);
        });
    });
    
    // Handle play button click
    if (playButton) {
        playButton.addEventListener('click', function() {
            const currentMode = getCurrentMode();
            const config = pageConfigs[currentMode];
            if (config && config.button.url) {
                window.open(config.button.url, '_blank');
            }
        });
    }
    
    function switchToMode(mode) {
        const config = pageConfigs[mode];
        if (!config) return;
        
        // Update active states
        gamemodes.forEach(gm => {
            gm.classList.toggle('active', gm.getAttribute('data-mode') === mode);
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
        if (mode !== 'home') {
            setTimeout(() => {
                window.location.href = `../${mode}/index.html`;
            }, 500);
        }
    }
    
    function getCurrentMode() {
        const activeGamemode = document.querySelector('.valorant-gamemode.active');
        return activeGamemode ? activeGamemode.getAttribute('data-mode') : 'home';
    }
    
    // Initialize with home mode
    switchToMode('home');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initValorantFunctionality();
});
