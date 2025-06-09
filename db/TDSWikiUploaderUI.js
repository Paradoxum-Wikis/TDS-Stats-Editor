/**
 * TDSWikiUploaderUI.js
 * UI related things built on top of the main uploader script
 */

document.addEventListener("DOMContentLoaded", function () {
  window.imageCache = {};
  const imageUrlInput = document.getElementById("towerImageUrl");

  const previewContainer = document.createElement("div");
  previewContainer.className = "mt-2 text-center";
  previewContainer.innerHTML =
    '<img id="image-preview" class="img-fluid border border-secondary rounded" style="max-height: 150px; display: none;">';
  imageUrlInput.parentNode.appendChild(previewContainer);
  const imagePreview = document.getElementById("image-preview");

  // handle json file selection
  document.getElementById("towerJSON").addEventListener("change", function () {
    const selectedText = document.getElementById("selectedJSONName");
    if (this.files && this.files.length > 0) {
      selectedText.textContent = "Selected: " + this.files[0].name;
    } else {
      selectedText.textContent = "No file selected";
    }
  });

  document
    .getElementById("clearJSONFile")
    .addEventListener("click", function () {
      const fileInput = document.getElementById("towerJSON");
      fileInput.value = "";
      document.getElementById("selectedJSONName").textContent =
        "No file selected";
    });

  // display validation error
  function showValidationError(message) {
    showAlert(message, "danger");
  }

  // display alert message
  function showAlert(message, type) {
    const alertPlaceholder = document.createElement("div");
    alertPlaceholder.className = "position-fixed bottom-0 end-0 p-3";
    alertPlaceholder.style.zIndex = "1337";

    const wrapper = document.createElement("div");
    wrapper.className = `alert alert-${type} alert-dismissible fade`;
    wrapper.innerHTML = `
            <div>${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

    alertPlaceholder.appendChild(wrapper);
    document.body.appendChild(alertPlaceholder);

    wrapper.offsetHeight;
    setTimeout(() => {
      wrapper.classList.add("show");
    }, 10);

    setTimeout(() => {
      wrapper.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(alertPlaceholder);
      }, 300);
    }, 3000);
  }

  // process image url as you type
  imageUrlInput.addEventListener(
    "input",
    debounce(function () {
      processImageUrl(imageUrlInput.value.trim());
    }, 500),
  );

  // prevent too many requests while typing
  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // handle image url
  async function processImageUrl(imageId) {
    if (!imageId) {
      imagePreview.style.display = "none";
      return "";
    }

    try {
      const imageUrl = await fetchImage(imageId);
      if (imageUrl) {
        // show preview
        imagePreview.src = imageUrl;
        imagePreview.style.display = "block";
        return imageUrl;
      } else {
        imagePreview.style.display = "none";
        return "";
      }
    } catch (error) {
      console.error("Failed to process image URL:", error);
      imagePreview.style.display = "none";
      return "";
    }
  }

  // get image from url or roblox id
  async function fetchImage(imageId) {
    if (!imageId) return "";

    const imageIdStr = String(imageId);

    // for the preview
    let previewUrl;
    // for the wiki content
    let contentUrl;

    // check if we already loaded this image
    if (window.imageCache[imageIdStr]) {
      previewUrl = window.imageCache[imageIdStr];
    } else {
      // syntax for Fandom images
      if (imageIdStr.startsWith("File:")) {
        const filename = imageIdStr.substring(5); // Remove "File:" prefix
        previewUrl = convertFileToFandomUrl(filename);
        contentUrl = previewUrl; // Use same URL for content
        console.log(`Converted File: syntax to URL: ${previewUrl}`);
      } else if (imageIdStr.startsWith("https")) {
        // handle urls
        if (imageIdStr.startsWith("https://static.wikia.nocookie.net/")) {
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

          // get actual image for preview using the o;n proxy
          const roProxyUrl = `https://assetdelivery.roblox.com/v2/assetId/${imageIdStr}`;
          try {
            const response = await fetch(
              `https://api.tds-editor.com/?url=${encodeURIComponent(roProxyUrl)}`,
              {
                method: "GET",
                headers: {
                  Origin: window.location.origin,
                  "X-Requested-With": "XMLHttpRequest",
                },
              },
            );

            const data = await response.json();
            if (data?.locations?.[0]?.location) {
              previewUrl = data.locations[0].location;
            } else {
              previewUrl = `./../htmlassets/Unavailable.png`;
            }
          } catch (error) {
            console.error(`Failed to fetch Roblox asset ${imageIdStr}:`, error);
            previewUrl = ""; // nothing to show if failed
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

    return previewUrl;
  }

  // clean up fandom urls
  function trimFandomUrl(fullUrl) {
    // extract the basic url without parameters
    const match = fullUrl.match(
      /https:\/\/static\.wikia\.nocookie\.net\/.*?\.(png|jpg|jpeg|gif)/i,
    );
    return match ? match[0] : fullUrl;
  }

  function convertFileToFandomUrl(filename) {
    const md5Hash = CryptoJS.MD5(filename).toString();

    const firstChar = md5Hash.charAt(0);
    const firstTwoChars = md5Hash.substring(0, 2);

    return `https://static.wikia.nocookie.net/tower-defense-sim/images/${firstChar}/${firstTwoChars}/${encodeURIComponent(filename)}`;
  }

  // process url if already filled in
  if (imageUrlInput.value) {
    processImageUrl(imageUrlInput.value.trim());
  }

  // change handler for the link input to auto-fill username and tower name
  document.getElementById("towerJSONLink")?.addEventListener(
    "input",
    debounce(function () {
      const linkValue = this.value.trim();
      if (linkValue) {
        const linkInfo = window.extractInfoFromBlogLink?.(linkValue);
        if (linkInfo) {
          document.getElementById("fandomUsername").value = linkInfo.username;
          document.getElementById("towerName").value = linkInfo.towerName;
        }
      }
    }, 500),
  );

  // Export functions used by TDSWikiUploader.js
  window.showAlert = showAlert;
  window.showValidationError = showValidationError;
  window.setupRadioButtonHandlers = setupRadioButtonHandlers;
});

// improved setupRadioButtonHandlers function to fix all radio button groups
function setupRadioButtonHandlers() {
  const toggleVisibility = (options, inputs) => {
    options.forEach((option, i) => {
      inputs[i].classList.toggle("d-none", !option.checked);
    });
  };

  const imageUrlOption = document.getElementById("imageUrlOption");
  const imageUploadOption = document.getElementById("imageUploadOption");
  const imageOptions = [imageUrlOption, imageUploadOption];
  const imageInputs = [
    document.getElementById("imageUrlInput"),
    document.getElementById("imageUploadInput"),
  ];

  imageUrlOption.addEventListener("change", () =>
    toggleVisibility(imageOptions, imageInputs),
  );
  imageUploadOption.addEventListener("change", () =>
    toggleVisibility(imageOptions, imageInputs),
  );

  const jsonPasteOption = document.getElementById("jsonPasteOption");
  const jsonFileOption = document.getElementById("jsonFileOption");
  const jsonLinkOption = document.getElementById("jsonLinkOption");
  const jsonOptions = [jsonPasteOption, jsonFileOption, jsonLinkOption];
  const jsonInputs = [
    document.getElementById("jsonPasteInput"),
    document.getElementById("jsonFileInput"),
    document.getElementById("jsonLinkInput"),
  ];

  jsonOptions.forEach((option) => {
    option.addEventListener("change", () =>
      toggleVisibility(jsonOptions, jsonInputs),
    );
  });

  const typeOptions = ["typeNew", "typeRework", "typeRebalance"];
  typeOptions.forEach((id) => {
    document.getElementById(id).addEventListener("change", function () {
      if (this.checked) {
        // Uncheck others
        typeOptions.forEach((otherId) => {
          if (otherId !== id) {
            document.getElementById(otherId).checked = false;
          }
        });
      }
    });
  });
}
