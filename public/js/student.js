/**
 * Student-specific JavaScript functionalities
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize session filtering on attendance page
    initLabSessionFilter();
    
    // Initialize date formatting
    formatDateElements();
    
    // Initialize confirmation dialogs
    initConfirmationDialogs();
    
    // Initialize attendance chart if on dashboard
    initAttendanceDonutChart();
});

/**
 * Initialize filtering of lab sessions based on selected lab
 */
function initLabSessionFilter() {
    const labSelect = document.getElementById('lab_id');
    const sessionSelect = document.getElementById('lab_session_id');
    
    if (labSelect && sessionSelect) {
        labSelect.addEventListener('change', function() {
            const selectedLabId = this.value;
            
            // Reset session dropdown
            sessionSelect.innerHTML = '<option value="" selected disabled>Choose a session</option>';
            
            // Get all session options that match the selected lab
            const sessions = document.querySelectorAll('#lab_session_id option[data-lab]');
            sessions.forEach(option => {
                if (option.dataset.lab === selectedLabId) {
                    const clonedOption = option.cloneNode(true);
                    sessionSelect.appendChild(clonedOption);
                }
            });
            
            // Enable/disable session dropdown
            sessionSelect.disabled = selectedLabId === "";
        });
        
        // Initial trigger to set the correct sessions
        if (labSelect.value !== "") {
            labSelect.dispatchEvent(new Event('change'));
        }
    }
}

/**
 * Format date elements
 */
function formatDateElements() {
    const dateElements = document.querySelectorAll('.format-date');
    
    dateElements.forEach(el => {
        const dateString = el.textContent.trim();
        const date = new Date(dateString);
        
        if (!isNaN(date.getTime())) {
            el.textContent = formatDate(date);
        }
    });
}

/**
 * Initialize confirmation dialogs
 */
function initConfirmationDialogs() {
    const deleteButtons = document.querySelectorAll('.confirm-delete');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                e.preventDefault();
            }
        });
    });
}

/**
 * Initialize donut chart for student dashboard
 */
function initAttendanceDonutChart() {
    const chartElement = document.getElementById('attendanceDonutChart');
    
    if (chartElement && typeof studentAttendanceData !== 'undefined') {
        new Chart(chartElement, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent'],
                datasets: [{
                    data: [
                        studentAttendanceData.present,
                        studentAttendanceData.total - studentAttendanceData.present
                    ],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.7)',
                        'rgba(220, 53, 69, 0.7)'
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(220, 53, 69, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'This Month\'s Attendance'
                    }
                }
            }
        });
    }
}

/**
 * Display notification to user
 * @param {string} message - Message to show
 * @param {string} type - Type of notification (success, danger, warning, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show notification-toast`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}
