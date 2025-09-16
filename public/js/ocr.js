// FRA Atlas DSS - OCR Document Processing JavaScript

// Global variables
let currentFile = null;
let isProcessing = false;

// Sample extracted text for demonstration
const sampleExtractedTexts = {
    'fra-claim': `FOREST RIGHTS ACT - INDIVIDUAL CLAIM FORM

Claim Application No: FRA/2024/MP/001234
Date of Application: 15th March 2024

PERSONAL DETAILS:
Name: Ramesh Kumar Gond
Father's Name: Shyam Lal Gond
Age: 45 years
Address: Village Piparia, Tehsil Baihar, District Balaghat
State: Madhya Pradesh
Caste: Scheduled Tribe (Gond)

CLAIM DETAILS:
Type of Rights Claimed: Individual Forest Rights
Area Claimed: 2.5 acres
Survey Number: 123/1, 123/2
Village: Piparia
Forest Range: Baihar
Forest Division: Balaghat

EVIDENCE SUBMITTED:
1. Revenue records showing continuous occupation
2. Genealogy records
3. Community verification letter
4. Photographs of cultivation
5. GPS survey coordinates

DECLARATION:
I hereby declare that all information provided is true and correct. I have been cultivating this land for more than 75 years through my ancestors.

Signature: [Signature]
Date: 15/03/2024

VERIFICATION BY FOREST RIGHTS COMMITTEE:
Recommended by: Piparia Village Forest Rights Committee
Date: 20/03/2024
Status: APPROVED`,

    'government-letter': `GOVERNMENT OF MADHYA PRADESH
FOREST DEPARTMENT
DISTRICT FOREST OFFICE, BALAGHAT

Letter No: DFO/BLG/FRA/2024/456
Date: 25th March 2024

To,
The Village Forest Rights Committee
Village Piparia, Tehsil Baihar

Subject: Approval of Forest Rights Claim - Application No. FRA/2024/MP/001234

Sir/Madam,

This is to inform you that the forest rights claim application submitted by Shri Ramesh Kumar Gond, S/o Shyam Lal Gond, resident of Village Piparia has been examined by the competent authority.

After thorough verification of documents and field inspection, the claim for Individual Forest Rights over 2.5 acres of forest land bearing Survey No. 123/1, 123/2 in Village Piparia is hereby APPROVED.

The claimant is entitled to the following rights:
1. Right to hold and live in forest land
2. Right to cultivate forest land
3. Right to access and use forest produce
4. Right to in-situ rehabilitation

This approval is subject to the following conditions:
- The land shall be used only for the purposes mentioned in the application
- No commercial activities without proper authorization
- Sustainable use of forest resources

The title documents will be issued within 30 days of this approval.

Yours faithfully,

[Signature]
District Forest Officer
Balaghat District`,

    'survey-report': `FOREST LAND SURVEY REPORT

Survey Date: 18th March 2024
Survey Team: Revenue Department & Forest Department Joint Team

LOCATION DETAILS:
Village: Piparia
Tehsil: Baihar
District: Balaghat
State: Madhya Pradesh
GPS Coordinates: 22°15'30"N, 80°36'45"E

LAND DETAILS:
Survey Numbers: 123/1, 123/2
Total Area: 2.5 acres (1.01 hectares)
Land Classification: Forest Land (Sarkar)
Current Land Use: Agricultural cultivation

OCCUPANCY VERIFICATION:
Claimant: Ramesh Kumar Gond
Period of Occupation: 75+ years (ancestral)
Type of Cultivation: Mixed crops (wheat, rice, vegetables)
Infrastructure: Traditional mud house, well, farm boundaries

FOREST ASSESSMENT:
Tree Cover: 15% (scattered native trees)
Forest Type: Deciduous mixed forest
Wildlife Impact: Minimal human-wildlife conflict
Conservation Value: Low to moderate

RECOMMENDATIONS:
1. Claim is genuine based on revenue records
2. Continuous occupation established
3. No significant ecological impact
4. Recommended for approval under FRA 2006

Survey Team:
1. Shri A.K. Sharma - Revenue Inspector
2. Shri M.L. Verma - Forest Guard
3. Smt. Sunita Devi - Village Representative

Date: 18/03/2024`
};

// Initialize OCR functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupDragAndDrop();
});

// Setup event listeners
function setupEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const browseButton = document.getElementById('browseButton');
    const uploadArea = document.getElementById('uploadArea');
    const removeFile = document.getElementById('removeFile');
    const copyText = document.getElementById('copyText');
    const downloadText = document.getElementById('downloadText');

    // Browse button click
    browseButton.addEventListener('click', () => {
        fileInput.click();
    });

    // Upload area click
    uploadArea.addEventListener('click', () => {
        if (!isProcessing) {
            fileInput.click();
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Remove file
    removeFile.addEventListener('click', () => {
        clearFile();
    });

    // Copy text
    copyText.addEventListener('click', () => {
        copyExtractedText();
    });

    // Download text
    downloadText.addEventListener('click', () => {
        downloadExtractedText();
    });
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    uploadArea.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    document.getElementById('uploadArea').classList.add('dragover');
}

function unhighlight() {
    document.getElementById('uploadArea').classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
}

// Handle file upload
function handleFileUpload(file) {
    // Validate file
    if (!validateFile(file)) {
        return;
    }

    currentFile = file;
    isProcessing = true;

    // Show file info
    showFileInfo(file);

    // Show progress
    showProgress();

    // Preview file
    previewFile(file);

    // Simulate OCR processing
    simulateOCRProcessing();
}

// Validate uploaded file
function validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/tiff'];

    if (file.size > maxSize) {
        showAlert('File size must be less than 10MB', 'danger');
        return false;
    }

    if (!allowedTypes.includes(file.type)) {
        showAlert('Please upload a valid document (PDF, JPG, PNG, TIFF)', 'danger');
        return false;
    }

    return true;
}

// Show file information
function showFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');

    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'block';
}

// Show progress bar
function showProgress() {
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.getElementById('uploadProgress');
    const progressText = document.getElementById('progressText');

    progressContainer.style.display = 'block';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        
        progressBar.style.width = progress + '%';
        progressText.textContent = progress < 100 ? 'Uploading...' : 'Upload complete';
    }, 200);
}

// Preview uploaded file
function previewFile(file) {
    const preview = document.getElementById('documentPreview');
    
    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);
        
        preview.innerHTML = '';
        preview.appendChild(img);
    } else if (file.type === 'application/pdf') {
        preview.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-file-pdf text-danger" style="font-size: 5rem;"></i>
                <h5 class="mt-3">${file.name}</h5>
                <p class="text-muted">PDF Preview</p>
                <p class="small text-muted">PDF preview not available in demo mode</p>
            </div>
        `;
    }
}

// Simulate OCR processing
function simulateOCRProcessing() {
    const processingIndicator = document.getElementById('processingIndicator');
    processingIndicator.style.display = 'block';

    // Simulate processing delay
    setTimeout(() => {
        processingIndicator.style.display = 'none';
        
        // Get sample text based on file name or use default
        const extractedText = getSampleText(currentFile.name);
        showExtractedText(extractedText);
        
        isProcessing = false;
        showAlert('Text extraction completed successfully!', 'success');
    }, 3000 + Math.random() * 2000); // 3-5 seconds delay
}

// Get sample extracted text
function getSampleText(fileName) {
    const lowerFileName = fileName.toLowerCase();
    
    if (lowerFileName.includes('claim') || lowerFileName.includes('application')) {
        return sampleExtractedTexts['fra-claim'];
    } else if (lowerFileName.includes('letter') || lowerFileName.includes('approval')) {
        return sampleExtractedTexts['government-letter'];
    } else if (lowerFileName.includes('survey') || lowerFileName.includes('report')) {
        return sampleExtractedTexts['survey-report'];
    } else {
        // Random selection
        const texts = Object.values(sampleExtractedTexts);
        return texts[Math.floor(Math.random() * texts.length)];
    }
}

// Display extracted text
function showExtractedText(text) {
    const extractedTextElement = document.getElementById('extractedText');
    const copyButton = document.getElementById('copyText');
    const downloadButton = document.getElementById('downloadText');

    extractedTextElement.textContent = text;
    copyButton.style.display = 'inline-block';
    downloadButton.style.display = 'inline-block';
}

// Copy extracted text to clipboard
function copyExtractedText() {
    const extractedText = document.getElementById('extractedText').textContent;
    
    navigator.clipboard.writeText(extractedText).then(() => {
        showAlert('Text copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = extractedText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showAlert('Text copied to clipboard!', 'success');
    });
}

// Download extracted text as file
function downloadExtractedText() {
    const extractedText = document.getElementById('extractedText').textContent;
    const fileName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') + '_extracted.txt' : 'extracted_text.txt';
    
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAlert('Text file downloaded successfully!', 'success');
}

// Clear uploaded file
function clearFile() {
    currentFile = null;
    isProcessing = false;
    
    // Reset file input
    document.getElementById('fileInput').value = '';
    
    // Hide file info
    document.getElementById('fileInfo').style.display = 'none';
    
    // Hide progress
    document.querySelector('.progress-container').style.display = 'none';
    
    // Reset preview
    document.getElementById('documentPreview').innerHTML = `
        <div class="text-center text-muted py-5">
            <i class="fas fa-file-text" style="font-size: 4rem; opacity: 0.3;"></i>
            <p class="mt-3 mb-0">Upload a document to see preview</p>
        </div>
    `;
    
    // Reset extracted text
    document.getElementById('extractedText').textContent = 'Upload and process a document to see extracted text here...';
    document.getElementById('copyText').style.display = 'none';
    document.getElementById('downloadText').style.display = 'none';
    
    // Hide processing indicator
    document.getElementById('processingIndicator').style.display = 'none';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Show alert messages
function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}