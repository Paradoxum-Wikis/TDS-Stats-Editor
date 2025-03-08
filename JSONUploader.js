document.addEventListener('DOMContentLoaded', function() {
    const importPasteOption = document.getElementById('importPasteOption');
    const importFileOption = document.getElementById('importFileOption');
    const importPasteInput = document.getElementById('importPasteInput');
    const importFileInput = document.getElementById('importFileInput');
    const jsonImportFile = document.getElementById('json-import-file');
    const jsonImportText = document.getElementById('json-import-text');
    const selectedFileName = document.getElementById('selectedImportFileName');
    const jsonFilePreview = document.getElementById('json-file-preview');
    const clearFileButton = document.getElementById('clearImportFile');
    
    // toggle between paste and file upload
    document.querySelector('label[for="importPasteOption"]').addEventListener('click', function() {
        importPasteOption.checked = true;
        importPasteInput.classList.remove('d-none');
        importFileInput.classList.add('d-none');
    });
    
    document.querySelector('label[for="importFileOption"]').addEventListener('click', function() {
        importFileOption.checked = true;
        importPasteInput.classList.add('d-none');
        importFileInput.classList.remove('d-none');
    });
    
    // use json viewer js for the file upload
    jsonImportFile.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            const file = this.files[0];
            selectedFileName.textContent = 'Selected: ' + file.name;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const jsonContent = e.target.result;
                    const parsed = JSON.parse(jsonContent);
                    
                    jsonImportText.value = JSON.stringify(parsed, null, 2);
                    
                    // container for JSON viewer
                    jsonFilePreview.innerHTML = '<div id="json-preview-container" class="bg-dark p-3" style="max-height: 300px; overflow-y: auto;"></div>';
                    const container = document.getElementById('json-preview-container');
                    
                    const jsonViewer = new JSONViewer();
                    container.appendChild(jsonViewer.getContainer());
                    
                    // load json
                    jsonViewer.showJSON(parsed);
                    
                } catch (error) {
                    jsonFilePreview.innerHTML = `<div class="alert alert-danger">Invalid JSON file: ${error.message}</div>`;
                }
            };
            reader.onerror = function() {
                jsonFilePreview.innerHTML = '<div class="alert alert-danger">Failed to read file</div>';
            };
            reader.readAsText(file);
        } else {
            selectedFileName.textContent = 'No file selected';
            jsonFilePreview.innerHTML = '';
        }
    });
    
    // clear file button
    clearFileButton.addEventListener('click', function() {
        jsonImportFile.value = '';
        selectedFileName.textContent = 'No file selected';
        jsonFilePreview.innerHTML = '';
    });
    
    document.getElementById('json-import-submit').addEventListener('click', function() {
        let jsonData;
        
        if (importPasteOption.checked) {
            jsonData = jsonImportText.value;
        } else {
            jsonData = jsonImportText.value;
        }
        
        if (jsonData) {
            try {
                const importEvent = new CustomEvent('towerDataImport', { 
                    detail: { data: jsonData } 
                });
                document.dispatchEvent(importEvent);
                
            } catch (error) {
                showAlert('Failed to import JSON: ' + error.message, 'danger');
            }
        }
    });
});

function showAlert(message, type) {
    const alertContainer = document.getElementById('alert-container') || document.body;
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alertDiv);
    
    setTimeout(() => {
        const bsAlert = bootstrap.Alert.getOrCreateInstance(alertDiv);
        bsAlert.close();
    }, 3000);
}