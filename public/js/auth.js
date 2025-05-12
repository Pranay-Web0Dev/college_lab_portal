/**
 * Authentication page specific JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Role selection change event in registration form
    const roleSelect = document.getElementById('registerRole');
    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            toggleStudentFields(this.value === 'student');
        });
    }
    
    // Set up tab persistence
    setupTabPersistence();
    
    // If there's an error, make sure the correct tab is shown
    checkErrorAndSwitchTab();
});

/**
 * Toggle visibility of student-specific fields based on role selection
 * @param {boolean} isStudent - Whether the student role is selected
 */
function toggleStudentFields(isStudent) {
    const studentFields = document.querySelectorAll('.student-field');
    
    studentFields.forEach(field => {
        field.classList.toggle('d-none', !isStudent);
        
        // Update required attribute on input fields
        const inputs = field.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (isStudent) {
                input.setAttribute('required', 'required');
            } else {
                input.removeAttribute('required');
            }
        });
    });
}

/**
 * Save and restore tab state
 */
function setupTabPersistence() {
    // Check if there's a stored tab
    const activeTab = sessionStorage.getItem('activeAuthTab');
    if (activeTab) {
        try {
            const tab = new bootstrap.Tab(document.querySelector(activeTab));
            tab.show();
        } catch (e) {
            console.error('Error restoring tab:', e);
        }
    }
    
    // Add event listener to save tab state
    const tabElements = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabElements.forEach(tabEl => {
        tabEl.addEventListener('shown.bs.tab', function (event) {
            sessionStorage.setItem('activeAuthTab', '#' + event.target.id);
        });
    });
}

/**
 * Check for error messages and switch to appropriate tab
 */
function checkErrorAndSwitchTab() {
    const errorMsg = document.querySelector('.alert-danger');
    
    if (errorMsg) {
        // If error message contains specific text related to registration
        const errorText = errorMsg.textContent.toLowerCase();
        const registrationErrors = [
            'passwords do not match',
            'password should be at least',
            'email already in use',
            'student id is required'
        ];
        
        const isRegistrationError = registrationErrors.some(err => errorText.includes(err));
        
        if (isRegistrationError) {
            // Switch to registration tab
            try {
                const tab = new bootstrap.Tab(document.querySelector('#register-tab'));
                tab.show();
            } catch (e) {
                console.error('Error switching tab:', e);
            }
        }
    }
}
