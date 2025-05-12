/**
 * Student-specific JavaScript functionalities
 */
document.addEventListener('DOMContentLoaded', function() {
    initLabSessionFilter();
    formatDateElements();
    initConfirmationDialogs();
    initAttendanceDonutChart();
});

/**
 * Initialize filtering of lab sessions based on selected lab
 */
function initLabSessionFilter() {
    const labFilter = document.getElementById('labFilter');
    
    if (labFilter) {
        labFilter.addEventListener('change', function() {
            const selectedLabId = this.value;
            const labSessions = document.querySelectorAll('.lab-session-container');
            
            labSessions.forEach(session => {
                if (selectedLabId === 'all' || session.getAttribute('data-lab-id') === selectedLabId) {
                    session.style.display = 'block';
                } else {
                    session.style.display = 'none';
                }
            });
        });
    }
}

/**
 * Format date elements
 */
function formatDateElements() {
    const dateElements = document.querySelectorAll('.format-date');
    
    dateElements.forEach(element => {
        const date = new Date(element.textContent);
        if (!isNaN(date)) {
            element.textContent = formatDate(date);
        }
    });
}

/**
 * Initialize confirmation dialogs
 */
function initConfirmationDialogs() {
    const confirmButtons = document.querySelectorAll('[data-confirm]');
    
    confirmButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const message = this.getAttribute('data-confirm');
            if (!confirm(message)) {
                event.preventDefault();
            }
        });
    });
}

/**
 * Initialize donut chart for student dashboard
 */
function initAttendanceDonutChart() {
    const chartCanvas = document.getElementById('attendanceChart');
    
    if (chartCanvas) {
        // Get attendance data from a data attribute or other source
        const attendedCount = parseInt(chartCanvas.getAttribute('data-attended') || 0);
        const totalCount = parseInt(chartCanvas.getAttribute('data-total') || 0);
        const missedCount = totalCount - attendedCount;
        
        // Create the chart
        new Chart(chartCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Attended', 'Missed'],
                datasets: [{
                    data: [attendedCount, missedCount],
                    backgroundColor: ['#28a745', '#dc3545'],
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
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const percentage = totalCount > 0 ? Math.round((value / totalCount) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
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
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show fixed-top mx-auto mt-3`;
    alertContainer.style.maxWidth = '500px';
    alertContainer.style.zIndex = '9999';
    
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertContainer);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertContainer.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(alertContainer);
        }, 150);
    }, 5000);
}