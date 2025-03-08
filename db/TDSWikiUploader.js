document.addEventListener('DOMContentLoaded', function() {
    const imageCache = {};
    
    const uploadTowerBtn = document.getElementById('upload-tower-btn');
    const uploadTowerModal = document.getElementById('uploadTowerModal');
    const uploadTowerButton = document.getElementById('uploadTowerButton');
    const jsonFileOption = document.getElementById('jsonFileOption');
    const jsonPasteOption = document.getElementById('jsonPasteOption');
    const jsonFileInput = document.getElementById('jsonFileInput');
    const jsonPasteInput = document.getElementById('jsonPasteInput');
    const imageUrlInput = document.getElementById('towerImageUrl');
    const imageUrlOption = document.getElementById('imageUrlOption');
    const imageUploadOption = document.getElementById('imageUploadOption');
    const jsonLinkOption = document.getElementById('jsonLinkOption');
    const jsonLinkInput = document.getElementById('jsonLinkInput');
    
    // add a preview for the image
    const previewContainer = document.createElement('div');
    previewContainer.className = 'mt-2 text-center';
    previewContainer.innerHTML = '<img id="image-preview" class="img-fluid border border-secondary rounded" style="max-height: 150px; display: none;">';
    imageUrlInput.parentNode.appendChild(previewContainer);
    const imagePreview = document.getElementById('image-preview');
    
    // setup the modal
    const towerModal = new bootstrap.Modal(uploadTowerModal);
    
    // handle json file selection
    document.getElementById('towerJSON').addEventListener('change', function() {
        const selectedText = document.getElementById('selectedJSONName');
        if (this.files && this.files.length > 0) {
            selectedText.textContent = 'Selected: ' + this.files[0].name;
        } else {
            selectedText.textContent = 'No file selected';
        }
    });

    document.getElementById('clearJSONFile').addEventListener('click', function() {
        const fileInput = document.getElementById('towerJSON');
        fileInput.value = '';
        document.getElementById('selectedJSONName').textContent = 'No file selected';
    });
    
    // handle image file selection
    document.getElementById('towerImage').addEventListener('change', function() {
        const selectedText = document.getElementById('selectedImageName');
        if (this.files && this.files.length > 0) {
            selectedText.textContent = 'Selected: ' + this.files[0].name;
        } else {
            selectedText.textContent = 'No file selected';
        }
    });

    document.getElementById('clearImageFile').addEventListener('click', function() {
        const fileInput = document.getElementById('towerImage');
        fileInput.value = '';
        document.getElementById('selectedImageName').textContent = 'No file selected';
    });
    
    // clean up when modal is closed
    uploadTowerModal.addEventListener('hidden.bs.modal', function() {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    });

    // show modal when upload button is clicked
    uploadTowerBtn.addEventListener('click', function() {
        towerModal.show();
    });

    // switch between json file and pasted json
    jsonFileOption.addEventListener('change', function() {
        if (this.checked) {
            jsonFileInput.classList.remove('d-none');
            jsonPasteInput.classList.add('d-none');
            jsonLinkInput.classList.add('d-none');
        }
    });

    jsonPasteOption.addEventListener('change', function() {
        if (this.checked) {
            jsonFileInput.classList.add('d-none');
            jsonPasteInput.classList.remove('d-none');
            jsonLinkInput.classList.add('d-none');
        }
    });

    jsonLinkOption.addEventListener('change', function() {
        if (this.checked) {
            jsonFileInput.classList.add('d-none');
            jsonPasteInput.classList.add('d-none');
            jsonLinkInput.classList.remove('d-none');
        }
    });

    // switch between image url and file upload
    if (imageUrlOption && imageUploadOption) {
        document.querySelectorAll('input[name="imageInputType"]').forEach((radio) => {
            radio.addEventListener('change', () => {
                if (radio.id === 'imageUrlOption') {
                    document.getElementById('imageUrlInput').classList.remove('d-none');
                    document.getElementById('imageUploadInput').classList.add('d-none');
                } else {
                    document.getElementById('imageUrlInput').classList.add('d-none');
                    document.getElementById('imageUploadInput').classList.remove('d-none');
                }
            });
        });
    }

    // when the upload button is clicked
    uploadTowerButton.addEventListener('click', async () => {
        try {
            if (!validateForm()) {
                return;
            }

            // store original button content and disable the button
            const originalButtonContent = uploadTowerButton.innerHTML;
            uploadTowerButton.disabled = true;
            uploadTowerButton.innerHTML = `
                <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Processing...
            `;
            
            // get and check the json data
            const jsonData = await getJsonData();
            if (!jsonData) {
                showValidationError('JSON data is required');
                
                // Restore button
                uploadTowerButton.innerHTML = originalButtonContent;
                uploadTowerButton.disabled = false;
                return;
            }
        
            // format everything for the wiki
            const content = formatWikiContent();
            const finalContent = content.replace('JSONDATA', jsonData);
        
            // try to copy to clipboard
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(finalContent);
                    showAlert('Content copied to clipboard!', 'success');
                } else {
                    // old browser fallback
                    const textarea = document.createElement('textarea');
                    textarea.value = finalContent;
                    textarea.style.position = 'absolute';
                    textarea.style.left = '-9999px';
                    document.body.appendChild(textarea);
                    textarea.focus();
                    textarea.select();
                    const success = document.execCommand('copy');
                    document.body.removeChild(textarea);
                    if (success) {
                        showAlert('Content copied to clipboard!', 'success');
                    } else {
                        throw new Error('Copy failed');
                    }
                }
                
                // Add a 2-second delay before opening the new page
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (copyError) {
                // Restore button if copy fails
                uploadTowerButton.innerHTML = originalButtonContent;
                uploadTowerButton.disabled = false;
                showManualCopyDialog(finalContent);
                return;
            }
        
            // open the wiki page
            openFandomEditPage();
            
            // make sure modal is fully gone
            towerModal.hide();
            
            // Always restore button at the end
            uploadTowerButton.innerHTML = originalButtonContent;
            uploadTowerButton.disabled = false;
            
            setTimeout(() => {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }, 300);
            
        } catch (error) {
            // show error if something went wrong
            showValidationError('Error: ' + error.message);
            
            // Restore button on error
            if (originalButtonContent) {
                uploadTowerButton.innerHTML = originalButtonContent;
                uploadTowerButton.disabled = false;
            }
        }
    });

    // check if the form is filled properly
    function validateForm() {
        let isValid = true;
        let requiredFields = ['towerDescription'];
        
        // Only require username and tower name if not using link option
        if (!jsonLinkOption.checked) {
            requiredFields.push('fandomUsername', 'towerName');
        }

        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                element.classList.add('is-invalid');
                isValid = false;
            } else {
                element.classList.remove('is-invalid');
            }
        });

        // Validate link or JSON data
        if (jsonFileOption.checked) {
            const jsonFile = document.getElementById('towerJSON');
            if (!jsonFile.files || jsonFile.files.length === 0) {
                jsonFile.classList.add('is-invalid');
                isValid = false;
            } else {
                jsonFile.classList.remove('is-invalid');
            }
        } else if (jsonPasteOption.checked) {
            const jsonText = document.getElementById('towerJSONText');
            if (!jsonText.value.trim()) {
                jsonText.classList.add('is-invalid');
                isValid = false;
            } else {
                jsonText.classList.remove('is-invalid');
            }
        } else if (jsonLinkOption.checked) {
            const linkInput = document.getElementById('towerJSONLink');
            const linkValue = linkInput.value.trim();
            const validLink = linkValue && linkValue.match(/https?:\/\/tds\.fandom\.com\/wiki\/User_blog:.+\/.+/i);
            
            if (!validLink) {
                linkInput.classList.add('is-invalid');
                isValid = false;
            } else {
                linkInput.classList.remove('is-invalid');
                
                // Auto-fill username and tower name fields from the link
                const linkInfo = extractInfoFromBlogLink(linkValue);
                if (linkInfo) {
                    const usernameField = document.getElementById('fandomUsername');
                    const towerNameField = document.getElementById('towerName');
                    
                    usernameField.value = linkInfo.username;
                    usernameField.classList.remove('is-invalid');
                    
                    towerNameField.value = linkInfo.towerName;
                    towerNameField.classList.remove('is-invalid');
                }
            }
        }

        return isValid;
    }

    // get json data from file or text
    async function getJsonData() {
        if (jsonFileOption.checked) {
            const jsonFile = document.getElementById('towerJSON').files[0];
            if (!jsonFile) return null;
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const jsonData = JSON.parse(e.target.result);
                        resolve(JSON.stringify(jsonData, null, 2));
                    } catch (error) {
                        reject(new Error('Invalid JSON format'));
                    }
                };
                reader.onerror = function() {
                    reject(new Error('Failed to read file'));
                };
                reader.readAsText(jsonFile);
            });
        } else if (jsonPasteOption.checked) {
            const jsonText = document.getElementById('towerJSONText').value.trim();
            if (!jsonText) return null;
            
            try {
                const jsonData = JSON.parse(jsonText);
                return JSON.stringify(jsonData, null, 2);
            } catch (error) {
                throw new Error('Invalid JSON format');
            }
        } else if (jsonLinkOption.checked) {
            const linkValue = document.getElementById('towerJSONLink').value.trim();
            if (!linkValue) return null;
            
            return `<a href="${linkValue}">${linkValue}</a>`;
        }
    }

    // format the content for the wiki
    function formatWikiContent() {
        const description = document.getElementById('towerDescription').value.trim();
        
        // get tower type (new/rework/rebalance)
        let towerType = "New"; // Default
        if (document.getElementById('typeRework').checked) {
            towerType = "Rework";
        } else if (document.getElementById('typeRebalance').checked) {
            towerType = "Rebalance";
        } else if (document.getElementById('typeNew').checked) {
            towerType = "New";
        }
        
        // process the image
        let imageContent = '';
        const imageUrlOption = document.getElementById('imageUrlOption');
        if (imageUrlOption.checked) {
            const imageUrl = document.getElementById('towerImageUrl').value.trim();
            if (imageUrl) {
                // check if we already have a formatted version
                const contentFormat = imageCache[`content_${imageUrl}`];
                imageContent = contentFormat || imageUrl;
                
                // handle roblox ids
                if (!contentFormat && /^\d+$/.test(imageUrl)) {
                    imageContent = `RobloxID${imageUrl}`;
                }
            }
        } else {
            const imageFile = document.getElementById('towerImage').files[0];
            if (imageFile) {
                imageContent = '<!-- File uploading is currently not supported in this beta. -->';
            }
        }

        // add wiki categories
        return `${description}\n\n${imageContent}\n\n${towerType}\n\n<pre id="towerdata" style="display: none">JSONDATA</pre>\n\n<!-- DO NOT EDIT, MODIFY, DELETE, ANYTHING IN HERE UNLESS YOU KNOW WHAT YOU ARE DOING. MAKE SURE THE CODE YOU PASTED IS THE ONLY THING HERE. -->\n[[Category:TDSDatabase]]\n[[Category:Blog posts]]`;
    }

    // open the wiki edit page
    function openFandomEditPage() {
        let username, towerName;
        
        // If using link option, extract info from link
        if (jsonLinkOption.checked) {
            const linkValue = document.getElementById('towerJSONLink').value.trim();
            const linkInfo = extractInfoFromBlogLink(linkValue);
            
            if (linkInfo) {
                username = linkInfo.username;
                towerName = linkInfo.towerName.replace(/\s+/g, '_');
            } else {
                // Fallback to input fields if extraction fails
                username = document.getElementById('fandomUsername').value.trim();
                towerName = document.getElementById('towerName').value.trim().replace(/\s+/g, '_');
            }
        } else {
            // Use input fields directly for other options
            username = document.getElementById('fandomUsername').value.trim();
            towerName = document.getElementById('towerName').value.trim().replace(/\s+/g, '_');
        }
        
        const url = `https://tds.fandom.com/wiki/User_blog:${encodeURIComponent(username)}/${encodeURIComponent(towerName)}?action=edit`;
        window.open(url, '_blank');
    }

    // display validation error
    function showValidationError(message) {
        showAlert(message, 'danger');
    }

    // display alert message
    function showAlert(message, type) {
        const alertPlaceholder = document.createElement('div');
        alertPlaceholder.className = 'position-fixed bottom-0 end-0 p-3';
        alertPlaceholder.style.zIndex = '1337';
        
        const wrapper = document.createElement('div');
        wrapper.className = `alert alert-${type} alert-dismissible fade`;
        wrapper.innerHTML = `
            <div>${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        alertPlaceholder.appendChild(wrapper);
        document.body.appendChild(alertPlaceholder);
        
        wrapper.offsetHeight;
        setTimeout(() => {
            wrapper.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            wrapper.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(alertPlaceholder);
            }, 300);
        }, 3000);
    }

    // process image url as you type
    imageUrlInput.addEventListener('input', debounce(function() {
        processImageUrl(imageUrlInput.value.trim());
    }, 500));
    
    // prevent too many requests while typing
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // handle image url
    async function processImageUrl(imageId) {
        if (!imageId) {
            imagePreview.style.display = 'none';
            return '';
        }
        
        try {
            const imageUrl = await fetchImage(imageId);
            if (imageUrl) {
                // show preview
                imagePreview.src = imageUrl;
                imagePreview.style.display = 'block';
                return imageUrl;
            } else {
                imagePreview.style.display = 'none';
                return '';
            }
        } catch (error) {
            console.error('Failed to process image URL:', error);
            imagePreview.style.display = 'none';
            return '';
        }
    }

    // get image from url or roblox id
    async function fetchImage(imageId) {
        if (!imageId) return '';
        
        const imageIdStr = String(imageId);
        
        // for the preview
        let previewUrl;
        // for the wiki content
        let contentUrl;
        
        // check if we already loaded this image
        if (imageCache[imageIdStr]) {
            previewUrl = imageCache[imageIdStr];
        } else {
            if (imageIdStr.startsWith('https')) { // handle urls
                if (imageIdStr.includes('static.wikia.nocookie.net')) {
                    previewUrl = trimFandomUrl(imageIdStr); // clean up fandom urls
                    contentUrl = previewUrl; // use same url for content
                } else {
                    previewUrl = imageIdStr; // use url directly
                    contentUrl = previewUrl; // keep same url for content
                }
            } else {
                // check for roblox ids
                if (/^\d+$/.test(imageIdStr)) {
                    // format as robloxid for wiki
                    contentUrl = `RobloxID${imageIdStr}`;
                    
                    // get actual image for preview
                    const roProxyUrl = `https://assetdelivery.RoProxy.com/v2/assetId/${imageIdStr}`;
                    try {
                        const response = await fetch(roProxyUrl, {
                            method: 'GET',
                            mode: 'cors',
                        });
                        const data = await response.json();
                        if (data?.locations?.[0]?.location) {
                            previewUrl = data.locations[0].location;
                        } else {
                            previewUrl = `https://static.wikia.nocookie.net/tower-defense-sim/images/${imageIdStr}`;
                        }
                    } catch (error) {
                        console.error(`Failed to fetch Roblox asset ${imageIdStr}:`, error);
                        previewUrl = ''; // nothing to show if failed
                    }
                } else {
                    // use as-is for other input
                    previewUrl = imageIdStr;
                    contentUrl = imageIdStr;
                }
            }
            
            // save for later
            if (previewUrl) {
                imageCache[imageIdStr] = previewUrl;
            }
        }
        
        // save formatted url for wiki content
        if (contentUrl) {
            imageCache[`content_${imageIdStr}`] = contentUrl;
        }
        
        // return url for preview
        return previewUrl;
    }
    
    // clean up fandom urls
    function trimFandomUrl(fullUrl) {
        // extract the basic url without parameters
        const match = fullUrl.match(/https:\/\/static\.wikia\.nocookie\.net\/.*?\.(png|jpg|jpeg|gif)/i);
        return match ? match[0] : fullUrl;
    }

    // process url if already filled in
    if (imageUrlInput.value) {
        processImageUrl(imageUrlInput.value.trim());
    }

    // expose this function globally
    window.formatWikiContent = formatWikiContent;

    function extractInfoFromBlogLink(link) {
        // Pattern: https://tds.fandom.com/wiki/User_blog:USERNAME/TOWERNAME
        const match = link.match(/https?:\/\/tds\.fandom\.com\/wiki\/User_blog:([^\/]+)\/([^?&#]+)/i);
        
        if (match) {
            return {
                username: decodeURIComponent(match[1]),
                towerName: decodeURIComponent(match[2]).replace(/_/g, ' ')
            };
        }
        
        return null;
    }

    // change handler for the link input to auto-fill username and tower name
    document.getElementById('towerJSONLink')?.addEventListener('input', debounce(function() {
        const linkValue = this.value.trim();
        if (linkValue) {
            const linkInfo = extractInfoFromBlogLink(linkValue);
            if (linkInfo) {
                document.getElementById('fandomUsername').value = linkInfo.username;
                document.getElementById('towerName').value = linkInfo.towerName;
            }
        }
    }, 500));

    setupRadioButtonHandlers();
});

// improved setupRadioButtonHandlers function to fix all radio button groups
function setupRadioButtonHandlers() {
    const imageUrlOption = document.getElementById('imageUrlOption');
    const imageUploadOption = document.getElementById('imageUploadOption');
    const imageUrlInput = document.getElementById('imageUrlInput');
    const imageUploadInput = document.getElementById('imageUploadInput');
    
    // add click handlers to the labels for more reliable response
    document.querySelector('label[for="imageUrlOption"]').addEventListener('click', function() {
        imageUrlOption.checked = true;
        imageUrlInput.classList.remove('d-none');
        imageUploadInput.classList.add('d-none');
    });
    
    document.querySelector('label[for="imageUploadOption"]').addEventListener('click', function() {
        imageUploadOption.checked = true;
        imageUrlInput.classList.add('d-none');
        imageUploadInput.classList.remove('d-none');
    });
    
    const jsonFileOption = document.getElementById('jsonFileOption');
    const jsonPasteOption = document.getElementById('jsonPasteOption');
    const jsonLinkOption = document.getElementById('jsonLinkOption');
    const jsonFileInput = document.getElementById('jsonFileInput');
    const jsonPasteInput = document.getElementById('jsonPasteInput');
    const jsonLinkInput = document.getElementById('jsonLinkInput');
    
    document.querySelector('label[for="jsonPasteOption"]')?.addEventListener('click', function() {
        jsonPasteOption.checked = true;
        jsonFileInput.classList.add('d-none');
        jsonPasteInput.classList.remove('d-none');
        jsonLinkInput.classList.add('d-none');
    });
    
    document.querySelector('label[for="jsonFileOption"]')?.addEventListener('click', function() {
        jsonFileOption.checked = true;
        jsonFileInput.classList.remove('d-none');
        jsonPasteInput.classList.add('d-none');
        jsonLinkInput.classList.add('d-none');
    });
    
    document.querySelector('label[for="jsonLinkOption"]')?.addEventListener('click', function() {
        jsonLinkOption.checked = true;
        jsonFileInput.classList.add('d-none');
        jsonPasteInput.classList.add('d-none');
        jsonLinkInput.classList.remove('d-none');
    });
    
    const typeNew = document.getElementById('typeNew');
    const typeRework = document.getElementById('typeRework');
    const typeRebalance = document.getElementById('typeRebalance');
    
    document.querySelector('label[for="typeNew"]')?.addEventListener('click', function() {
        typeNew.checked = true;
    });
    
    document.querySelector('label[for="typeRework"]')?.addEventListener('click', function() {
        typeRework.checked = true;
    });
    
    document.querySelector('label[for="typeRebalance"]')?.addEventListener('click', function() {
        typeRebalance.checked = true;
    });
    
    document.querySelectorAll('.btn-check').forEach(radio => {
        const label = document.querySelector(`label[for="${radio.id}"]`);
        if (label) {
            label.addEventListener('click', function() {
                setTimeout(() => {
                    radio.checked = true;
                    const event = new Event('change', { bubbles: true });
                    radio.dispatchEvent(event);
                }, 0);
            });
        }
    });
}