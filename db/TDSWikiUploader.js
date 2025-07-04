/**
 * TDSWikiUploader.js
 * The uploading script to upload towers to the database
 */

document.addEventListener("DOMContentLoaded", function () {
  const uploadTowerBtn = document.getElementById("upload-tower-btn");
  const uploadTowerModal = document.getElementById("uploadTowerModal");
  const uploadTowerButton = document.getElementById("uploadTowerButton");
  const jsonFileOption = document.getElementById("jsonFileOption");
  const jsonPasteOption = document.getElementById("jsonPasteOption");
  const jsonLinkOption = document.getElementById("jsonLinkOption");
  const towerModal = new bootstrap.Modal(uploadTowerModal);

  uploadTowerModal.addEventListener("hidden.bs.modal", function () {
    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) {
      backdrop.remove();
    }
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  uploadTowerBtn.addEventListener("click", function () {
    towerModal.show();
  });

  uploadTowerButton.addEventListener("click", async () => {
    const originalButtonContent = uploadTowerButton.innerHTML;

    try {
      if (!validateForm()) {
        return;
      }

      uploadTowerButton.disabled = true;
      uploadTowerButton.innerHTML = `
                <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Processing...
            `;

      const jsonData = await getJsonData();
      if (!jsonData) {
        window.showValidationError("JSON data is required");
        return;
      }

      const content = formatWikiContent();
      const finalContent = content.replace("JSONDATA", jsonData);

      let clipboardSuccess = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(finalContent);
        window.showAlert("Content copied to clipboard!", "success");
        clipboardSuccess = true;
      } else {
        // old browser fallback
        const textarea = document.createElement("textarea");
        textarea.value = finalContent;
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        clipboardSuccess = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (clipboardSuccess) {
          window.showAlert("Content copied to clipboard!", "success");
        } else {
          window.showValidationError(
            "Failed to copy content to clipboard. Please try again.",
          );
          return;
        }
      }

      if (clipboardSuccess) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        openFandomEditPage();
        towerModal.hide();

        setTimeout(() => {
          const backdrop = document.querySelector(".modal-backdrop");
          if (backdrop) {
            backdrop.remove();
          }
          document.body.classList.remove("modal-open");
          document.body.style.overflow = "";
          document.body.style.paddingRight = "";
        }, 300);
      }
    } catch (error) {
      window.showValidationError("Error: " + error.message);
    } finally {
      uploadTowerButton.innerHTML = originalButtonContent;
      uploadTowerButton.disabled = false;
    }
  });

  function validateForm() {
    let isValid = true;
    let requiredFields = ["towerDescription"];

    // Only require username and tower name if not using link option
    if (!jsonLinkOption.checked) {
      requiredFields.push("fandomUsername", "towerName");
    }

    requiredFields.forEach((field) => {
      const element = document.getElementById(field);
      if (!element.value.trim()) {
        element.classList.add("is-invalid");
        isValid = false;
      } else {
        element.classList.remove("is-invalid");
      }
    });

    // Validate link or JSON data
    if (jsonFileOption.checked) {
      const jsonFile = document.getElementById("towerJSON");
      if (!jsonFile.files || jsonFile.files.length === 0) {
        jsonFile.classList.add("is-invalid");
        isValid = false;
      } else {
        jsonFile.classList.remove("is-invalid");
      }
    } else if (jsonPasteOption.checked) {
      const jsonText = document.getElementById("towerJSONText");
      if (!jsonText.value.trim()) {
        jsonText.classList.add("is-invalid");
        isValid = false;
      } else {
        jsonText.classList.remove("is-invalid");
      }
    } else if (jsonLinkOption.checked) {
      const linkInput = document.getElementById("towerJSONLink");
      const linkValue = linkInput.value.trim();
      const validLink =
        linkValue &&
        linkValue.match(/https?:\/\/tds\.fandom\.com\/wiki\/User_blog:.+\/.+/i);

      if (!validLink) {
        linkInput.classList.add("is-invalid");
        isValid = false;
      } else {
        linkInput.classList.remove("is-invalid");

        const linkInfo = extractInfoFromBlogLink(linkValue);
        if (linkInfo) {
          const usernameField = document.getElementById("fandomUsername");
          const towerNameField = document.getElementById("towerName");
          const towerNameValue = towerNameField.value.trim();

          // checks if the tower name from the form matches the tower name from the link (it shouldn't)
          const formattedLinkTowerName = linkInfo.towerName
            .toLowerCase()
            .replace(/_/g, " ");
          const formattedInputTowerName = towerNameValue.toLowerCase();

          if (formattedLinkTowerName === formattedInputTowerName) {
            towerNameField.classList.add("is-invalid");
            const errorDiv =
              towerNameField.nextElementSibling ||
              document.createElement("div");
            errorDiv.className = "invalid-feedback";
            errorDiv.textContent =
              "Tower name must be different from blog post name.";
            if (!towerNameField.nextElementSibling) {
              towerNameField.parentNode.appendChild(errorDiv);
            }
            isValid = false;
          } else {
            usernameField.value = linkInfo.username;
            usernameField.classList.remove("is-invalid");
          }
        }
      }
    }

    return isValid;
  }

  // get json data from file or text
  async function getJsonData() {
    if (jsonFileOption.checked) {
      const jsonFile = document.getElementById("towerJSON").files[0];
      if (!jsonFile) return null;

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          try {
            const jsonData = JSON.parse(e.target.result);
            resolve(JSON.stringify(jsonData, null, 2));
          } catch (error) {
            reject(new Error("Invalid JSON format"));
          }
        };
        reader.onerror = function () {
          reject(new Error("Failed to read file"));
        };
        reader.readAsText(jsonFile);
      });
    } else if (jsonPasteOption.checked) {
      const jsonText = document.getElementById("towerJSONText").value.trim();
      if (!jsonText) return null;

      try {
        const jsonData = JSON.parse(jsonText);
        return JSON.stringify(jsonData, null, 2);
      } catch (error) {
        throw new Error("Invalid JSON format");
      }
    } else if (jsonLinkOption.checked) {
      const linkValue = document.getElementById("towerJSONLink").value.trim();
      if (!linkValue) return null;

      return `<a href="${linkValue}">${linkValue}</a>`;
    }
  }

  function formatWikiContent() {
    const description = document
      .getElementById("towerDescription")
      .value.trim();

    // get tower type (new/rework/rebalance)
    let towerType = "New"; // Default
    if (document.getElementById("typeRework").checked) {
      towerType = "Rework";
    } else if (document.getElementById("typeRebalance").checked) {
      towerType = "Rebalance";
    } else if (document.getElementById("typeNew").checked) {
      towerType = "New";
    }

    let imageContent = "";
    const imageUrlOption = document.getElementById("imageUrlOption");
    if (imageUrlOption.checked) {
      const imageUrl = document.getElementById("towerImageUrl").value.trim();
      if (imageUrl) {
        const contentFormat = window.imageCache?.[`content_${imageUrl}`];
        imageContent = contentFormat || imageUrl;

        if (!contentFormat && /^\d+$/.test(imageUrl)) {
          imageContent = `RobloxID${imageUrl}`;
        }
      }
    }

    return `<div id="desc">${description}</div>\n\n${imageContent}\n\n${towerType}\n\n<pre id="towerdata">JSONDATA</pre>\n\n<!-- DO NOT EDIT, MODIFY, DELETE, ANYTHING IN HERE UNLESS YOU KNOW WHAT YOU ARE DOING. MAKE SURE THE CODE YOU PASTED IS THE ONLY THING HERE. -->\n[[Category:TDSDatabase]]\n[[Category:Blog posts]]`;
  }

  function openFandomEditPage() {
    const username = document.getElementById("fandomUsername").value.trim();
    const towerName = document
      .getElementById("towerName")
      .value.trim()
      .replace(/\s+/g, "_");
    const url = `https://tds.fandom.com/wiki/User_blog:${encodeURIComponent(username)}/${encodeURIComponent(towerName)}?action=edit`;
    window.open(url, "_blank");
  }

  function extractInfoFromBlogLink(link) {
    const match = link.match(
      /https?:\/\/tds\.fandom\.com\/wiki\/User_blog:([^\/]+)\/([^?&#]+)/i,
    );

    if (match) {
      return {
        username: decodeURIComponent(match[1]),
        towerName: decodeURIComponent(match[2]).replace(/_/g, " "),
      };
    }

    return null;
  }

  window.formatWikiContent = formatWikiContent;
  window.openFandomEditPage = openFandomEditPage;
  window.extractInfoFromBlogLink = extractInfoFromBlogLink;

  if (typeof window.setupRadioButtonHandlers === "function") {
    window.setupRadioButtonHandlers();
  }
});
