/**
 * TDSWikiUploaderUI.js
 * UI related things built on top of the main uploader script
 */

document.addEventListener('DOMContentLoaded', function() {
    window.imageCache = {};
    const imageUrlInput = document.getElementById('towerImageUrl');

    const previewContainer = document.createElement('div');
    previewContainer.className = 'mt-2 text-center';
    previewContainer.innerHTML = '<img id="image-preview" class="img-fluid border border-secondary rounded" style="max-height: 150px; display: none;">';
    imageUrlInput.parentNode.appendChild(previewContainer);
    const imagePreview = document.getElementById('image-preview');
    
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
        if (window.imageCache[imageIdStr]) {
            previewUrl = window.imageCache[imageIdStr];
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
                window.imageCache[imageIdStr] = previewUrl;
            }
        }
        
        // save formatted url for wiki content
        if (contentUrl) {
            window.imageCache[`content_${imageIdStr}`] = contentUrl;
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

    // change handler for the link input to auto-fill username and tower name
    document.getElementById('towerJSONLink')?.addEventListener('input', debounce(function() {
        const linkValue = this.value.trim();
        if (linkValue) {
            const linkInfo = window.extractInfoFromBlogLink?.(linkValue);
            if (linkInfo) {
                document.getElementById('fandomUsername').value = linkInfo.username;
                document.getElementById('towerName').value = linkInfo.towerName;
            }
        }
    }, 500));

    // Export functions used by TDSWikiUploader.js
    window.showAlert = showAlert;
    window.showValidationError = showValidationError;
    window.setupRadioButtonHandlers = setupRadioButtonHandlers;
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