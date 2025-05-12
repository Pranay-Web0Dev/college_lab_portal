/**
 * Main JavaScript functionality for College Lab Portal
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initFormValidation();
    initPasswordToggle();
    initBootstrapComponents();
    initCharts();
});

/**
 * Initialize Bootstrap form validation
 */
function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
}

/**
 * Initialize password toggle functionality
 */
function initPasswordToggle() {
    const toggles = document.querySelectorAll('.toggle-password');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const target = document.getElementById(targetId);
            
            // Toggle password visibility
            if (target.type === 'password') {
                target.type = 'text';
                this.querySelector('i').classList.remove('fa-eye');
                this.querySelector('i').classList.add('fa-eye-slash');
            } else {
                target.type = 'password';
                this.querySelector('i').classList.remove('fa-eye-slash');
                this.querySelector('i').classList.add('fa-eye');
            }
        });
    });
}

/**
 * Initialize Bootstrap components like tooltips and popovers
 */
function initBootstrapComponents() {
    // Activate tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Activate popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

/**
 * Initialize charts if they exist on the page
 */
function initCharts() {
    // Charts will be initialized in more specific JS files
    // This is just a placeholder in case we need global chart initialization
}

/**
 * Helper function to format date
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

/**
 * Helper function to toggle visibility of an element
 * @param {string} selector - Element selector
 * @param {boolean} visible - Should element be visible
 */
function toggleVisibility(selector, visible) {
    const element = document.querySelector(selector);
    if (element) {
        if (visible) {
            element.classList.remove('d-none');
        } else {
            element.classList.add('d-none');
        }
    }
}