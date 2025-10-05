/**
 * Initialize Undertale functionality
 */
function initUndertaleFunctionality() {
    const menuOptions = document.querySelectorAll('.undertale-menu-option');
    const actionButton = document.getElementById('undertale-action-button');
    const textContent = document.getElementById('undertale-text-content');
    const soul = document.getElementById('undertale-soul');
    
    // Page configurations with alternating social media buttons
    const pageConfigs = {
        'home': {
            button: { icon: 'linkedin', text: 'LinkedIn', url: 'https://www.linkedin.com/in/dannyjtaylor/' },
            text: `* Daniel J. Taylor appears!
* Computer Engineering Student & Developer
* Ready to make an impact in the tech world!
* You feel your determination growing stronger.`
        },
        'experience': {
            button: { icon: 'github', text: 'GitHub', url: 'https://github.com/dannyjtaylor' },
            text: `* You choose to ACT.
* Daniel shares his professional journey.
* Smart City internships, research positions...
* You feel inspired by his dedication.`
        },
        'projects': {
            button: { icon: 'linkedin', text: 'LinkedIn', url: 'https://www.linkedin.com/in/dannyjtaylor/' },
            text: `* You choose to use an ITEM.
* Daniel shows his technical projects.
* Web development, embedded systems...
* The power of innovation fills you with determination.`
        },
        'contact': {
            button: { icon: 'linkedin', text: 'LinkedIn', url: 'https://www.linkedin.com/in/dannyjtaylor/' },
            text: `* You choose MERCY.
* Daniel offers to connect and collaborate.
* Ready to discuss opportunities...
* You feel a connection forming.`
        }
    };
    
    // Handle menu option clicks
    menuOptions.forEach(option => {
        option.addEventListener('click', function() {
            const optionType = this.getAttribute('data-option');
            selectOption(optionType);
        });
    });
    
    // Handle action button click
    if (actionButton) {
        actionButton.addEventListener('click', function() {
            const currentOption = getCurrentOption();
            const config = pageConfigs[currentOption];
            if (config && config.button.url) {
                window.open(config.button.url, '_blank');
            }
        });
    }
    
    // Soul movement
    if (soul) {
        document.addEventListener('mousemove', function(e) {
            soul.style.left = e.clientX - 10 + 'px';
            soul.style.top = e.clientY - 10 + 'px';
        });
    }
    
    function selectOption(option) {
        const config = pageConfigs[option];
        if (!config) return;
        
        // Update active states
        menuOptions.forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-option') === option);
        });
        
        // Update text content with typewriter effect
        if (textContent) {
            typewriterEffect(textContent, config.text);
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
        if (option !== 'home') {
            setTimeout(() => {
                window.location.href = `../${option}/index.html`;
            }, 2000);
        }
    }
    
    function typewriterEffect(element, text) {
        element.textContent = '';
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
            }
        }, 50);
    }
    
    function getCurrentOption() {
        const activeOption = document.querySelector('.undertale-menu-option.active');
        return activeOption ? activeOption.getAttribute('data-option') : 'home';
    }
    
    // Initialize with home option
    selectOption('home');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initUndertaleFunctionality();
});
