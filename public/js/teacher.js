/**
 * Teacher-specific JavaScript functionalities
 */
document.addEventListener('DOMContentLoaded', function() {
    initDataTables();
    initDatePickers();
    initEditModals();
    initSearch();
    initTeacherCharts();
});

/**
 * Initialize DataTables for better table filtering and pagination
 */
function initDataTables() {
    const tables = document.querySelectorAll('.datatable');
    
    tables.forEach(table => {
        $(table).DataTable({
            responsive: true,
            language: {
                search: "Search:",
                lengthMenu: "Show _MENU_ entries per page",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                paginate: {
                    first: "First",
                    last: "Last",
                    next: "Next",
                    previous: "Previous"
                }
            }
        });
    });
}

/**
 * Initialize date pickers
 */
function initDatePickers() {
    const datePickers = document.querySelectorAll('.datepicker');
    
    datePickers.forEach(picker => {
        $(picker).datepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            todayHighlight: true
        });
    });
}

/**
 * Initialize modals for editing content
 */
function initEditModals() {
    // Populate edit modal with existing data
    const editButtons = document.querySelectorAll('[data-bs-toggle="modal"][data-bs-target^="#edit"]');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetModal = document.querySelector(this.getAttribute('data-bs-target'));
            if (!targetModal) return;
            
            // Get item ID
            const itemId = this.getAttribute('data-id');
            if (!itemId) return;
            
            // Set form action to include item ID
            const form = targetModal.querySelector('form');
            if (form) {
                const actionBase = form.getAttribute('data-action-base');
                if (actionBase) {
                    form.action = `${actionBase}/${itemId}`;
                }
            }
            
            // Populate form fields
            const dataFields = this.querySelectorAll('[data-field]');
            dataFields.forEach(field => {
                const fieldName = field.getAttribute('data-field');
                const fieldValue = field.textContent.trim();
                
                const input = targetModal.querySelector(`[name="${fieldName}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = fieldValue === 'true' || fieldValue === 'yes';
                    } else {
                        input.value = fieldValue;
                    }
                }
            });
        });
    });
}

/**
 * Initialize search functionality for tables without DataTables
 */
function initSearch() {
    const searchInputs = document.querySelectorAll('.table-search');
    
    searchInputs.forEach(input => {
        input.addEventListener('keyup', function() {
            const searchValue = this.value.toLowerCase();
            const targetTableId = this.getAttribute('data-target');
            const table = document.getElementById(targetTableId);
            
            if (table) {
                const rows = table.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchValue) ? '' : 'none';
                });
            }
        });
    });
}

/**
 * Initialize teacher dashboard charts
 */
function initTeacherCharts() {
    initWeeklyAttendanceChart();
    initLabUtilizationChart();
}

/**
 * Initialize weekly attendance chart for teacher dashboard
 */
function initWeeklyAttendanceChart() {
    const chartCanvas = document.getElementById('weeklyAttendanceChart');
    
    if (chartCanvas) {
        // Example data - in a real app, this would come from the server
        const chartData = {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            datasets: [{
                label: 'Attendance Count',
                data: chartCanvas.getAttribute('data-attendance-values')?.split(',') || [12, 19, 8, 15, 10],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
        
        new Chart(chartCanvas, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Students'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Day of Week'
                        }
                    }
                }
            }
        });
    }
}

/**
 * Initialize lab utilization chart for teacher dashboard
 */
function initLabUtilizationChart() {
    const chartCanvas = document.getElementById('labUtilizationChart');
    
    if (chartCanvas) {
        // Example data - in a real app, this would come from the server
        const labels = chartCanvas.getAttribute('data-lab-names')?.split(',') || 
                      ['Computer Lab', 'Physics Lab', 'Chemistry Lab'];
                      
        const data = chartCanvas.getAttribute('data-utilization-values')?.split(',') || 
                    [85, 60, 45];
        
        new Chart(chartCanvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
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
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}% utilization`;
                            }
                        }
                    }
                }
            }
        });
    }
}

/**
 * Export table data to CSV
 * @param {string} tableId - ID of the table to export
 * @param {string} filename - Filename for the CSV
 */
function exportTableToCSV(tableId, filename = 'export.csv') {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const rowData = [];
        const cols = row.querySelectorAll('td, th');
        
        cols.forEach(col => {
            // Clean data: remove commas, replace multiple spaces with one, trim
            let text = col.innerText;
            text = text.replace(/,/g, ' ');
            text = text.replace(/\s+/g, ' ').trim();
            
            // Surround with quotes
            rowData.push('"' + text + '"');
        });
        
        csv.push(rowData.join(','));
    });
    
    downloadCSV(csv.join('\n'), filename);
}

/**
 * Create and download a CSV file
 * @param {string} csv - CSV content
 * @param {string} filename - Filename for the download
 */
function downloadCSV(csv, filename) {
    const csvFile = new Blob([csv], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    
    // Create a link to the file
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    
    // Add link to DOM and trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Clean up
    document.body.removeChild(downloadLink);
}