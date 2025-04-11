document.addEventListener('DOMContentLoaded', function() {
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

// Declare lucide variable. Assuming it's globally available after including lucide-static.js
const lucide = window.lucide;