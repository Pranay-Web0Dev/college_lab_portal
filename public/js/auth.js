/**
 * Authentication page specific JavaScript
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set up role selection behavior
    const roleStudent = document.getElementById('roleStudent');
    const roleTeacher = document.getElementById('roleTeacher');
    
    if (roleStudent && roleTeacher) {
        roleStudent.addEventListener('change', function() {
            toggleStudentFields(this.checked);
        });
        
        roleTeacher.addEventListener('change', function() {
            toggleStudentFields(!this.checked);
        });
        
        // Initialize based on current selection
        toggleStudentFields(roleStudent.checked);
    }
    
    // Setup tab persistence
    setupTabPersistence();
    
    // Check for error messages and switch tab accordingly
    checkErrorAndSwitchTab();
});

/**
 * Toggle visibility of student-specific fields based on role selection
 * @param {boolean} isStudent - Whether the student role is selected
 */
function toggleStudentFields(isStudent) {
    const studentFields = document.querySelectorAll('.student-field');
    
    studentFields.forEach(field => {
        if (isStudent) {
            field.style.display = 'block';
            const input = field.querySelector('input');
            if (input) {
                input.setAttribute('required', '');
            }
        } else {
            field.style.display = 'none';
            const input = field.querySelector('input');
            if (input) {
                input.removeAttribute('required');
            }
        }
    });
}

/**
 * Save and restore tab state
 */
function setupTabPersistence() {
    const authTabs = document.getElementById('authTabs');
    
    if (!authTabs) return;
    
    // Store active tab in session storage when clicked
    const tabs = authTabs.querySelectorAll('[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            sessionStorage.setItem('activeAuthTab', e.target.id);
        });
    });
    
    // Check if we have a stored active tab
    const activeTab = sessionStorage.getItem('activeAuthTab');
    if (activeTab) {
        const tab = document.getElementById(activeTab);
        if (tab) {
            const bsTab = new bootstrap.Tab(tab);
            bsTab.show();
        }
    }
}

/**
 * Check for error messages and switch to appropriate tab
 */
function checkErrorAndSwitchTab() {
    const showRegisterForm = document.querySelector('meta[name="showRegisterForm"]');
    
    if (showRegisterForm && showRegisterForm.content === 'true') {
        const registerTab = document.getElementById('register-tab');
        if (registerTab) {
            const bsTab = new bootstrap.Tab(registerTab);
            bsTab.show();
        }
    }
}