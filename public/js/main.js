/**
 * Main JavaScript functionality for College Lab Portal
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize form validation
    initFormValidation();
    
    // Initialize password toggle
    initPasswordToggle();
    
    // Initialize tooltips and popovers
    initBootstrapComponents();
    
    // Initialize charts if they exist on the page
    initCharts();
});

/**
 * Initialize Bootstrap form validation
 */
function initFormValidation() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation');

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            // Check password confirmation fields if they exist
            const password = form.querySelector('#new_password, #registerPassword');
            const confirm = form.querySelector('#confirm_password, #registerPassword2');
            
            if (password && confirm && password.value !== confirm.value) {
                confirm.setCustomValidity('Passwords do not match');
                event.preventDefault();
                event.stopPropagation();
            } else if (confirm) {
                confirm.setCustomValidity('');
            }
            
            form.classList.add('was-validated');
        }, false);
    });
    
    // Add password confirmation check on input
    const passwordConfirmations = document.querySelectorAll('#confirm_password, #registerPassword2');
    passwordConfirmations.forEach(confirm => {
        confirm.addEventListener('input', function() {
            const password = document.querySelector('#new_password, #registerPassword');
            if (password && this.value !== password.value) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
    });
}

/**
 * Initialize password toggle functionality
 */
function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordField = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            // Toggle password visibility
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

/**
 * Initialize Bootstrap components like tooltips and popovers
 */
function initBootstrapComponents() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

/**
 * Initialize charts if they exist on the page
 */
function initCharts() {
    // Lab attendance chart (teacher dashboard)
    const labChartElement = document.getElementById('labAttendanceChart');
    if (labChartElement && typeof labAttendanceData !== 'undefined') {
        new Chart(labChartElement, {
            type: 'bar',
            data: {
                labels: labAttendanceData.labs,
                datasets: [{
                    label: 'Attendance Count',
                    data: labAttendanceData.counts,
                    backgroundColor: 'rgba(13, 110, 253, 0.7)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Attendances'
                        },
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Labs'
                        }
                    }
                }
            }
        });
    }
    
    // Student attendance chart (student details)
    const studentChartElement = document.getElementById('studentAttendanceChart');
    if (studentChartElement && typeof getAttendanceByLab === 'function') {
        const attendanceData = getAttendanceByLab();
        new Chart(studentChartElement, {
            type: 'pie',
            data: {
                labels: attendanceData.labs,
                datasets: [{
                    data: attendanceData.counts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Attendance Distribution by Lab'
                    }
                }
            }
        });
    }
}

/**
 * Helper function to format date
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

/**
 * Helper function to toggle visibility of an element
 * @param {string} selector - Element selector
 * @param {boolean} visible - Should element be visible
 */
function toggleVisibility(selector, visible) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.toggle('d-none', !visible);
    }
}
