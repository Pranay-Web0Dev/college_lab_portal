/**
 * Teacher-specific JavaScript functionalities
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize datatable for students list if it exists
    initDataTables();
    
    // Initialize date pickers
    initDatePickers();
    
    // Initialize modals for editing labs and sessions
    initEditModals();
    
    // Initialize search functionality
    initSearch();
});

/**
 * Initialize DataTables for better table filtering and pagination
 */
function initDataTables() {
    const tables = document.querySelectorAll('.data-table');
    
    tables.forEach(table => {
        $(table).DataTable({
            responsive: true,
            language: {
                search: "_INPUT_",
                searchPlaceholder: "Search...",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                paginate: {
                    previous: '<i class="fas fa-chevron-left"></i>',
                    next: '<i class="fas fa-chevron-right"></i>'
                }
            },
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]]
        });
    });
}

/**
 * Initialize date pickers
 */
function initDatePickers() {
    const datePickers = document.querySelectorAll('.date-picker');
    
    datePickers.forEach(picker => {
        // Setup datepicker using flatpickr or other library
        // This is a placeholder function - if we decide to add a date picker library
    });
}

/**
 * Initialize modals for editing content
 */
function initEditModals() {
    // Lab edit buttons
    const labEditButtons = document.querySelectorAll('.edit-lab-btn');
    
    labEditButtons.forEach(button => {
        button.addEventListener('click', function() {
            const labId = this.dataset.labId;
            const labName = this.dataset.labName;
            const labLocation = this.dataset.labLocation;
            const labCapacity = this.dataset.labCapacity;
            const labDescription = this.dataset.labDescription;
            
            // Fill the form with data
            const form = document.querySelector('#editLabForm');
            if (form) {
                form.action = `/teacher/labs/update/${labId}`;
                form.querySelector('#editLabName').value = labName;
                form.querySelector('#editLabLocation').value = labLocation;
                form.querySelector('#editLabCapacity').value = labCapacity;
                form.querySelector('#editLabDescription').value = labDescription;
            }
        });
    });
    
    // Session edit buttons
    const sessionEditButtons = document.querySelectorAll('.edit-session-btn');
    
    sessionEditButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sessionId = this.dataset.sessionId;
            const sessionName = this.dataset.sessionName;
            const sessionDay = this.dataset.sessionDay;
            const sessionStart = this.dataset.sessionStart;
            const sessionEnd = this.dataset.sessionEnd;
            const sessionMax = this.dataset.sessionMax;
            
            // Fill the form with data
            const form = document.querySelector('#editSessionForm');
            if (form) {
                form.action = form.action.replace(/\/update\/\d+$/, `/update/${sessionId}`);
                form.querySelector('#editSessionName').value = sessionName;
                form.querySelector('#editSessionDay').value = sessionDay;
                form.querySelector('#editSessionStart').value = sessionStart;
                form.querySelector('#editSessionEnd').value = sessionEnd;
                form.querySelector('#editSessionMax').value = sessionMax;
            }
        });
    });
}

/**
 * Initialize search functionality for tables without DataTables
 */
function initSearch() {
    const searchInputs = document.querySelectorAll('.table-search');
    
    searchInputs.forEach(input => {
        const targetTable = document.querySelector(input.dataset.target);
        
        if (targetTable) {
            input.addEventListener('keyup', function() {
                const searchText = this.value.toLowerCase();
                const rows = targetTable.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchText) ? '' : 'none';
                });
            });
        }
    });
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
    
    for (let i = 0; i < rows.length; i++) {
        const row = [], cols = rows[i].querySelectorAll('td, th');
        
        for (let j = 0; j < cols.length; j++)
            row.push('"' + cols[j].innerText + '"');
        
        csv.push(row.join(','));
    }
    
    // Download CSV file
    downloadCSV(csv.join('\n'), filename);
}

/**
 * Create and download a CSV file
 * @param {string} csv - CSV content
 * @param {string} filename - Filename for the download
 */
function downloadCSV(csv, filename) {
    const csvFile = new Blob([csv], {type: 'text/csv'});
    const downloadLink = document.createElement('a');
    
    // File name
    downloadLink.download = filename;
    
    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);
    
    // Hide download link
    downloadLink.style.display = 'none';
    
    // Add the link to DOM
    document.body.appendChild(downloadLink);
    
    // Click download link
    downloadLink.click();
    
    // Clean up and remove the link
    document.body.removeChild(downloadLink);
}
