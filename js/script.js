// Global Variables
let files = JSON.parse(localStorage.getItem('files')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// File types
const FILE_TYPE = {
    NOTING: 'noting',
    CORRESPONDING: 'corresponding'
};

// DOM Elements based on current page
document.addEventListener('DOMContentLoaded', function() {
    // Check for login status
    if (!currentUser && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Upload Tab Switching
    const tabNotingBtn = document.getElementById('tabNotingBtn');
    const tabCorrespondingBtn = document.getElementById('tabCorrespondingBtn');
    const notingSideSection = document.getElementById('notingSideSection');
    const correspondingSideSection = document.getElementById('correspondingSideSection');
    
    if (tabNotingBtn && tabCorrespondingBtn) {
        tabNotingBtn.addEventListener('click', function() {
            tabNotingBtn.classList.add('active');
            tabCorrespondingBtn.classList.remove('active');
            notingSideSection.classList.remove('hidden');
            correspondingSideSection.classList.add('hidden');
        });
        
        tabCorrespondingBtn.addEventListener('click', function() {
            tabCorrespondingBtn.classList.add('active');
            tabNotingBtn.classList.remove('active');
            correspondingSideSection.classList.remove('hidden');
            notingSideSection.classList.add('hidden');
        });
    }

    // Noting Upload Form
    const notingUploadForm = document.getElementById('notingUploadForm');
    if (notingUploadForm) {
        console.log('Noting upload form found, setting up event listener');
        notingUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Noting form submitted');
            handleFileUpload(e, FILE_TYPE.NOTING);
        });
        setupFileDropArea('noting');
        loadRecentFiles('noting');
        
        // Set current date for creation date field by default
        const notingCreationDate = document.getElementById('notingCreationDate');
        if (notingCreationDate) {
            notingCreationDate.valueAsDate = new Date();
        }
    } else {
        console.log('Noting upload form not found');
    }

    // Corresponding Upload Form
    const correspondingUploadForm = document.getElementById('correspondingUploadForm');
    if (correspondingUploadForm) {
        console.log('Corresponding upload form found, setting up event listener');
        correspondingUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Corresponding form submitted');
            handleFileUpload(e, FILE_TYPE.CORRESPONDING);
        });
        setupFileDropArea('corresponding');
        loadRecentFiles('corresponding');
        
        // Set current date for creation date field by default
        const correspondingCreationDate = document.getElementById('correspondingCreationDate');
        if (correspondingCreationDate) {
            correspondingCreationDate.valueAsDate = new Date();
        }
    } else {
        console.log('Corresponding upload form not found');
    }

    // Dashboard
    const fileTableBody = document.getElementById('fileTableBody');
    if (fileTableBody) {
        loadDashboardStats();
        loadFileTable();
    }

    // Search functionality
    const searchFiles = document.getElementById('searchFiles');
    if (searchFiles) {
        searchFiles.addEventListener('input', function() {
            loadFileTable(this.value);
        });
    }

    // Logout functionality
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    });
});

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // For demo purposes - in production this would connect to a server
    if (username && password) {
        // Simple validation - in production use proper authentication
        localStorage.setItem('currentUser', JSON.stringify({ username }));
        window.location.href = 'dashboard.html';
    } else {
        alert('Please enter username and password');
    }
}

// Constants
const MAX_UPLOAD_SIZE = 1024 * 1024 * 1024 * 1024; // 1TB in bytes

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// File upload is now handled by the handleFileUpload function in the new implementation

// Toast notification function
function showToast(message, type = 'info', duration = 3000) {
    // If duration is 0, don't auto-remove
    const autoRemove = duration > 0;
    // Check if toast container exists, if not create it
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
        
        // Add styles if not already added
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.innerHTML = `
                .toast-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                }
                .toast {
                    min-width: 250px;
                    margin-top: 10px;
                    padding: 15px 20px;
                    border-radius: 4px;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    animation: slideIn 0.3s, fadeOut 0.5s 2.5s;
                    animation-fill-mode: forwards;
                    opacity: 0;
                }
                .toast.success {
                    background-color: #27ae60;
                    color: white;
                }
                .toast.error {
                    background-color: #e74c3c;
                    color: white;
                }
                .toast i {
                    margin-right: 10px;
                    font-size: 1.2rem;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fas fa-check-circle';
    if (type === 'error') {
        icon = 'fas fa-exclamation-circle';
    }
    
    toast.innerHTML = `<i class="${icon}"></i> ${message}`;
    toastContainer.appendChild(toast);
    
    // Make visible
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Auto remove toast after delay if auto-remove is enabled
    if (autoRemove) {
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.remove();
            }
        }, duration);
    }
    
    // Return the toast element in case we need to modify it later
    return toast;
}

// File Drop Area Setup
function setupFileDropArea(type) {
    const prefix = type === 'noting' ? 'noting' : 'corresponding';
    const dropArea = document.getElementById(`${prefix}DropArea`);
    const fileInput = document.getElementById(`${prefix}FileInput`);
    const fileName = document.getElementById(`${prefix}FileName`);

    if (!dropArea || !fileInput || !fileName) return;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    // Handle selected files through browse button
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            fileName.textContent = this.files[0].name;
        }
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files && files[0]) {
            // We cannot directly set fileInput.files as it's read-only
            // Instead, we can use the DataTransfer object to trigger a change event
            const dT = new DataTransfer();
            dT.items.add(files[0]);
            fileInput.files = dT.files;
            
            // Trigger change event to ensure the file input value is updated
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
            
            fileName.textContent = files[0].name;
        }
    }
}

// Load Recent Files for Noting or Corresponding sides
function loadRecentFiles(type) {
    const targetType = type === 'noting' ? FILE_TYPE.NOTING : FILE_TYPE.CORRESPONDING;
    const containerId = type === 'noting' ? 'recentNotingFiles' : 'recentCorrespondingFiles';
    const container = document.getElementById(containerId);
    const loader = document.getElementById(`${type}Loader`);
    
    if (!container) return;
    
    // Hide loader after a small delay to simulate loading
    setTimeout(() => {
        if (loader) loader.style.display = 'none';
        
        // Filter files by type and sort by newest first
        const filteredFiles = files
            .filter(file => file.fileType === targetType)
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, 5); // Show only the 5 most recent files
        
        // Clear container
        container.innerHTML = '';
        
        if (filteredFiles.length === 0) {
            container.innerHTML = `<div class="no-files">No ${type} files uploaded yet</div>`;
            return;
        }
        
        // Add files to container
        filteredFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const icon = type === 'noting' ? 'file-signature' : 'envelope-open-text';
            const date = new Date(file.uploadDate).toLocaleDateString();
            
            fileItem.innerHTML = `
                <i class="fas fa-${icon} file-item-icon"></i>
                <div class="file-item-details">
                    <div class="file-item-name">${file.fileSubject}</div>
                    <div class="file-item-info">
                        <span>${file.fileNumber}</span> • 
                        <span>${date}</span> • 
                        <span>Class: ${file.classification}</span>
                    </div>
                </div>
                <div class="file-item-actions">
                    <button class="file-item-btn" onclick="viewFileDetails(${file.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="file-item-btn" onclick="window.location.href='dashboard.html'" title="Go to Dashboard">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(fileItem);
        });
    }, 800);
}

// View File Details
function viewFileDetails(id) {
    const file = files.find(f => f.id === id);
    
    if (!file) {
        showToast('File not found', 'error');
        return;
    }
    
    // Create modal if not exists
    let modal = document.getElementById('fileDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fileDetailsModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
        
        // Add styles if not already added
        if (!document.getElementById('modalStyles')) {
            const style = document.createElement('style');
            style.id = 'modalStyles';
            style.innerHTML = `
                .modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0,0,0,0.5);
                    z-index: 1000;
                    align-items: center;
                    justify-content: center;
                }
                .modal-content {
                    background-color: white;
                    border-radius: 8px;
                    max-width: 600px;
                    width: 100%;
                    padding: 1.5rem;
                    position: relative;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 1rem;
                }
                .modal-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--primary-color);
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #777;
                }
                .detail-row {
                    margin-bottom: 1rem;
                    display: flex;
                }
                .detail-label {
                    font-weight: 600;
                    width: 150px;
                    color: var(--primary-color);
                }
                .detail-value {
                    flex: 1;
                }
                .file-notes {
                    margin-top: 1rem;
                    padding: 1rem;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    border-left: 3px solid var(--secondary-color);
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 1.5rem;
                    border-top: 1px solid #ddd;
                    padding-top: 1rem;
                }
                .modal-footer button {
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    margin-left: 0.5rem;
                }
                .btn-dashboard {
                    background-color: var(--secondary-color);
                    color: white;
                }
                .btn-download {
                    background-color: #4CAF50;
                    color: white;
                    margin: 0 0.5rem;
                }
                .btn-download:hover {
                    background-color: #45a049;
                }
                .btn-cancel {
                    background-color: #f44336;
                    color: white;
                }
                .btn-cancel:hover {
                    background-color: #d32f2f;
                }
                .modal-enter {
                    animation: modalEnter 0.3s;
                }
                @keyframes modalEnter {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Format dates
    const uploadDate = new Date(file.uploadDate).toLocaleString();
    const creationDate = new Date(file.creationDate).toLocaleDateString();
    const closingDate = file.closingDate ? new Date(file.closingDate).toLocaleDateString() : 'Not closed';
    
    // Set modal content
    modal.innerHTML = `
        <div class="modal-content modal-enter">
            <div class="modal-header">
                <h2 class="modal-title">${file.fileType === FILE_TYPE.NOTING ? 'Noting File' : 'Corresponding File'} Details</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="detail-row">
                <div class="detail-label">File Subject:</div>
                <div class="detail-value">${file.fileSubject}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">File Number:</div>
                <div class="detail-value">${file.fileNumber}</div>
            </div>
            ${file.partNumber ? `
            <div class="detail-row">
                <div class="detail-label">Part Number:</div>
                <div class="detail-value">${file.partNumber}</div>
            </div>` : ''}
            <div class="detail-row">
                <div class="detail-label">Classification:</div>
                <div class="detail-value">${file.classification}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Date of Creation:</div>
                <div class="detail-value">${creationDate}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Closing Date:</div>
                <div class="detail-value">${closingDate}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Uploaded By:</div>
                <div class="detail-value">${file.uploader}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Upload Date:</div>
                <div class="detail-value">${uploadDate}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">File Name:</div>
                <div class="detail-value">${file.fileName}</div>
            </div>
            ${file.fileType === FILE_TYPE.CORRESPONDING && file.referenceNumber ? `
            <div class="detail-row">
                <div class="detail-label">Reference Number:</div>
                <div class="detail-value">${file.referenceNumber}</div>
            </div>` : ''}
            ${file.fileType === FILE_TYPE.CORRESPONDING && file.source ? `
            <div class="detail-row">
                <div class="detail-label">Source:</div>
                <div class="detail-value">${file.source}</div>
            </div>` : ''}
            ${file.notes ? `
            <div class="file-notes">
                <h3><i class="fas fa-sticky-note"></i> Notes</h3>
                <p>${file.notes}</p>
            </div>` : ''}
            <div class="modal-footer">
                <button onclick="closeModal()" class="btn-cancel">Close</button>
                <button onclick="downloadFile(${JSON.stringify(file).replace(/[\"\'\n\r\t\b\f\\]/g, '\\$&')})" class="btn-download">
                    <i class="fas fa-download"></i> Download
                </button>
                <button onclick="window.location.href='dashboard.html'" class="btn-dashboard">
                    <i class="fas fa-tachometer-alt"></i> Go to Dashboard
                </button>
            </div>
        </div>
    `;
    
    // Show modal
    modal.style.display = 'flex';
    
    // Add close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Close modal
function closeModal() {
    const modal = document.getElementById('fileDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Notes Management
function addNote() {
    const noteText = document.getElementById('noteText').value.trim();
    
    if (!noteText) {
        alert('Please enter note text');
        return;
    }

    const newNote = {
        id: Date.now(),
        text: noteText,
        date: new Date().toISOString(),
        user: currentUser.username
    };

    notes.push(newNote);
    localStorage.setItem('notes', JSON.stringify(notes));
    
    document.getElementById('noteText').value = '';
    loadNotes();
}

function loadNotes() {
    const notesContent = document.getElementById('notesContent');
    notesContent.innerHTML = '';

    if (notes.length === 0) {
        notesContent.innerHTML = '<p class="text-center">No notes yet.</p>';
        return;
    }

    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        
        // Format date for display
        const noteDate = new Date(note.date);
        const formattedDate = `${noteDate.toLocaleDateString()} ${noteDate.toLocaleTimeString()}`;
        
        noteElement.innerHTML = `
            <div class="note-date">
                <i class="fas fa-user"></i> ${note.user} | <i class="fas fa-clock"></i> ${formattedDate}
            </div>
            <div class="note-text">${note.text}</div>
        `;
        
        notesContent.appendChild(noteElement);
    });
}

// Dashboard Functions
function loadDashboardStats() {
    const SOTfiles = files.filter(file => file.Department === 'SOT').length;
    const SOSfiles = files.filter(file => file.Department === 'SOS').length;
    const SOMLAfiles = files.filter(file => file.Department === 'SOM&LA').length;
    const AdministrationFiles = files.filter(file => file.Department === 'Administration').length;
    
    // Update dashboard counters
    document.getElementById('SOT').textContent = SOTfiles;
    document.getElementById('SOS').textContent = SOSfiles;
    document.getElementById('SOMLA').textContent = SOMLAfiles;
    document.getElementById('Administration').textContent = AdministrationFiles;
}

// Current filter state
let currentFilter = {
    type: 'all',
    search: '',
    classification: '',
    department: ''
};

function loadFileTable(searchTerm = '') {
    const fileTableBody = document.getElementById('fileTableBody');
    const noFilesRow = document.getElementById('noFilesRow');
    const itemsCount = document.getElementById('itemsCount');
    
    if (!fileTableBody) return;

    // Update search term in filter state
    if (searchTerm !== undefined) {
        currentFilter.search = searchTerm;
    }

    // Clear table
    fileTableBody.innerHTML = '';
    
    if (files.length === 0) {
        fileTableBody.appendChild(noFilesRow);
        if (itemsCount) itemsCount.textContent = '0';
        return;
    }

    // Apply all filters
    let filteredFiles = files;
    
    // Filter by type (noting/corresponding/all)
    if (currentFilter.type !== 'all') {
        const typeFilter = currentFilter.type === 'noting' ? FILE_TYPE.NOTING : FILE_TYPE.CORRESPONDING;
        filteredFiles = filteredFiles.filter(file => file.fileType === typeFilter);
    }
    
    // Filter by classification
    if (currentFilter.classification) {
        filteredFiles = filteredFiles.filter(file => file.classification === currentFilter.classification);
    }
    
    // Filter by department
    if (currentFilter.department) {
        filteredFiles = filteredFiles.filter(file => file.Department === currentFilter.department);
    }
    
    // Apply search term filter
    if (searchTerm || currentFilter.search) {
        const search = searchTerm || currentFilter.search;
        currentFilter.search = search.toLowerCase();
        filteredFiles = filteredFiles.filter(file => 
            file.fileNumber.toLowerCase().includes(currentFilter.search) ||
            file.fileSubject.toLowerCase().includes(currentFilter.search) ||
            (file.partNumber && file.partNumber.toLowerCase().includes(currentFilter.search)) ||
            (file.classification && file.classification.toLowerCase().includes(currentFilter.search)) ||
            (file.Department && file.Department.toLowerCase().includes(currentFilter.search))
        );
    }

    // Update count
    if (itemsCount) itemsCount.textContent = filteredFiles.length.toString();

    if (filteredFiles.length === 0) {
        const noMatchRow = document.createElement('tr');
        noMatchRow.innerHTML = `<td colspan="10" class="no-files-message">
            <div class="empty-state">
                <i class="fas fa-search empty-icon"></i>
                <p>No matching files found</p>
                <button onclick="clearFilters()" class="btn-upload-now">Clear Filters</button>
            </div>
        </td>`;
        fileTableBody.appendChild(noMatchRow);
        return;
    }

    // Sort files by newest first
    filteredFiles.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

    // Add files to table
    filteredFiles.forEach((file, index) => {
        const row = document.createElement('tr');
        
        // Format dates
        const creationDate = new Date(file.creationDate).toLocaleDateString();
        const closingDate = file.closingDate ? new Date(file.closingDate).toLocaleDateString() : '-';
        
        // Get file type display
        const fileTypeBadge = file.fileType === FILE_TYPE.NOTING 
            ? `<span class="file-type-badge badge-noting">Noting</span>` 
            : `<span class="file-type-badge badge-corresponding">Corresponding</span>`;
        
        row.innerHTML = `
            <tr>
                <td>${index + 1}</td>
                <td>${fileTypeBadge}</td>
                <td>${file.fileNumber}</td>
                <td>${file.Department || '-'}</td>
                <td>${file.fileSubject}</td>
                <td>${creationDate}</td>
                <td>${closingDate}</td>
                <td>${file.classification}</td>
                <td>${file.disposalYear || '-'}</td>
                <td class="actions">
                    <button class="file-action-btn download-btn" onclick="downloadFile(${JSON.stringify(file)})" title="Download File">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="file-action-btn view-btn" onclick="viewFileDetails(${file.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="file-action-btn delete-btn" onclick="deleteFile(${file.id})" title="Delete File">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        
        fileTableBody.appendChild(row);
    });
}

// Setup dashboard filter tabs
document.addEventListener('DOMContentLoaded', function() {
    const filterAllBtn = document.getElementById('filterAllBtn');
    const filterNotingBtn = document.getElementById('filterNotingBtn');
    const filterCorrespondingBtn = document.getElementById('filterCorrespondingBtn');
    const classificationFilter = document.getElementById('classificationFilter');
    
    if (filterAllBtn && filterNotingBtn && filterCorrespondingBtn) {
        // Set up filter buttons
        filterAllBtn.addEventListener('click', function() {
            updateFilterButtons(this);
            currentFilter.type = 'all';
            loadFileTable();
        });
        
        filterNotingBtn.addEventListener('click', function() {
            updateFilterButtons(this);
            currentFilter.type = 'noting';
            loadFileTable();
        });
        
        filterCorrespondingBtn.addEventListener('click', function() {
            updateFilterButtons(this);
            currentFilter.type = 'corresponding';
            loadFileTable();
        });
    }
    
    // Set up classification filter
    if (classificationFilter) {
        classificationFilter.addEventListener('change', function() {
            currentFilter.classification = this.value;
            loadFileTable();
        });
    }

    // Set up department filter
    const departmentFilter = document.getElementById('departmentFilter');
    if (departmentFilter) {
        departmentFilter.addEventListener('change', function() {
            currentFilter.department = this.value;
            loadFileTable();
        });
    }

    // Set up clear filters button
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            clearFilters();
        });
    }
});

// Update active filter button
function updateFilterButtons(activeBtn) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// Clear all filters
function clearFilters() {
    currentFilter = {
        type: 'all',
        search: '',
        classification: '',
        department: ''
    };
    
    // Reset UI
    updateFilterButtons(document.getElementById('filterAllBtn'));
    document.getElementById('searchFiles').value = '';
    document.getElementById('classificationFilter').value = '';
    document.getElementById('departmentFilter').value = '';
    
    // Reload table
    loadFileTable();
}

// File Actions
function downloadFile(file) {
    try {
        // Create a temporary anchor element
        const a = document.createElement('a');
        a.style.display = 'none';
        
        // Set the download attribute with the filename
        a.download = file.fileName || 'download';
        
        // Set the href to trigger the download
        a.href = `/download/${encodeURIComponent(file.fileName)}`;
        
        // Add to the document, trigger click, and remove
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
    } catch (error) {
        console.error('Download error:', error);
        showToast('Failed to start download', 'error');
    }
}

function viewFile(id) {
    const file = files.find(f => f.id === id);
    if (file) {
        // Open file details modal
        openFileDetailsModal(file);
    }
}

function deleteFile(id) {
    if (confirm('Are you sure you want to delete this file?')) {
        files = files.filter(f => f.id !== id);
        localStorage.setItem('files', JSON.stringify(files));
        loadDashboardStats();
        loadFileTable();
    }
}

// Add CSS class for file drop area highlighting
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.innerHTML = `
        .file-drop-area.highlight {
            border-color: var(--secondary-color);
            background-color: rgba(52, 152, 219, 0.1);
        }
    `;
    document.head.appendChild(style);
});
