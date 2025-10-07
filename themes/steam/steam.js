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
                window.location.href = `/themes/steam/${page}.html`;
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSteamFunctionality();
});
