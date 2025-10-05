/**
 * Initialize Persona 3 functionality
 */
function initPersona3Functionality() {
    const menuItems = document.querySelectorAll('.persona3-menu-item');
    const actionButton = document.getElementById('persona3-action-button');
    const pageTitle = document.getElementById('persona3-page-title');
    const pageSubtitle = document.getElementById('persona3-page-subtitle');
    const pageContent = document.getElementById('persona3-page-content');
    
    // Page configurations with alternating social media buttons
    const pageConfigs = {
        'home': {
            title: 'Daniel J. Taylor',
            subtitle: 'Computer Engineering Student & Developer',
            button: { icon: 'linkedin', text: 'LinkedIn', url: 'https://www.linkedin.com/in/dannyjtaylor/' },
            content: 'Welcome to my portfolio! I\'m a Computer Engineering student at Florida Polytechnic University with experience in software development, research, and smart city technologies. Ready to make an impact in the tech world with determination and innovation!'
        },
        'experience': {
            title: 'Professional Experience',
            subtitle: 'Work History & Achievements',
            button: { icon: 'github', text: 'GitHub', url: 'https://github.com/dannyjtaylor' },
            content: 'Explore my professional journey including internships, research positions, and academic achievements. From Smart City internships to research assistant roles, I\'ve gained valuable experience in technology and engineering that has shaped my career path.'
        },
        'projects': {
            title: 'Portfolio Projects',
            subtitle: 'Technical Projects & Development',
            button: { icon: 'linkedin', text: 'LinkedIn', url: 'https://www.linkedin.com/in/dannyjtaylor/' },
            content: 'Discover my technical projects ranging from web development to embedded systems and research applications. Each project showcases my skills in programming, problem-solving, and innovation, demonstrating my passion for technology.'
        },
        'extracurriculars': {
            title: 'Leadership & Activities',
            subtitle: 'Student Organizations & Leadership',
            button: { icon: 'github', text: 'GitHub', url: 'https://github.com/dannyjtaylor' },
            content: 'Learn about my involvement in student organizations, leadership roles, and extracurricular activities. I believe in giving back to the community and developing leadership skills alongside technical expertise to become a well-rounded professional.'
        },
        'contact': {
            title: 'Get In Touch',
            subtitle: 'Connect & Collaborate',
            button: { icon: 'linkedin', text: 'LinkedIn', url: 'https://www.linkedin.com/in/dannyjtaylor/' },
            content: 'Ready to connect? Reach out for opportunities, collaborations, or just to say hello! I\'m always interested in discussing technology, engineering, and potential opportunities that can help us both grow.'
        }
    };
    
    // Handle menu item clicks
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const menuType = this.getAttribute('data-menu');
            selectMenu(menuType);
        });
    });
    
    // Handle action button click
    if (actionButton) {
        actionButton.addEventListener('click', function() {
            const currentMenu = getCurrentMenu();
            const config = pageConfigs[currentMenu];
            if (config && config.button.url) {
                window.open(config.button.url, '_blank');
            }
        });
    }
    
    function selectMenu(menu) {
        const config = pageConfigs[menu];
        if (!config) return;
        
        // Update active states
        menuItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-menu') === menu);
        });
        
        // Update page content with smooth transition
        if (pageTitle) {
            fadeOut(pageTitle, () => {
                pageTitle.textContent = config.title;
                fadeIn(pageTitle);
            });
        }
        
        if (pageSubtitle) {
            fadeOut(pageSubtitle, () => {
                pageSubtitle.textContent = config.subtitle;
                fadeIn(pageSubtitle);
            });
        }
        
        if (pageContent) {
            fadeOut(pageContent, () => {
                pageContent.textContent = config.content;
                fadeIn(pageContent);
            });
        }
        
        // Update action button
        if (actionButton) {
            const icon = actionButton.querySelector('.lucide-icon');
            const text = actionButton.querySelector('span');
            
            if (icon) {
                icon.setAttribute('data-lucide', config.button.icon);
                lucide.createIcons();
            }
            if (text) text.textContent = config.button.text;
        }
        
        // Navigate to the actual page
        if (menu !== 'home') {
            setTimeout(() => {
                window.location.href = `../${menu}/index.html`;
            }, 1000);
        }
    }
    
    function fadeOut(element, callback) {
        element.style.transition = 'opacity 0.3s ease';
        element.style.opacity = '0';
        setTimeout(callback, 300);
    }
    
    function fadeIn(element) {
        element.style.transition = 'opacity 0.3s ease';
        element.style.opacity = '1';
    }
    
    function getCurrentMenu() {
        const activeMenuItem = document.querySelector('.persona3-menu-item.active');
        return activeMenuItem ? activeMenuItem.getAttribute('data-menu') : 'home';
    }
    
    // Initialize with home menu
    selectMenu('home');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initPersona3Functionality();
});
