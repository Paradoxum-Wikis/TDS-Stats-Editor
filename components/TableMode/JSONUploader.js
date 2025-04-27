document.addEventListener("DOMContentLoaded", function () {
  const importPasteOption = document.getElementById("importPasteOption");
  const importFileOption = document.getElementById("importFileOption");
  const importPasteInput = document.getElementById("importPasteInput");
  const importFileInput = document.getElementById("importFileInput");
  const jsonImportFile = document.getElementById("json-import-file");
  const jsonImportText = document.getElementById("json-import-text");
  const selectedFileName = document.getElementById("selectedImportFileName");
  const jsonFilePreview = document.getElementById("json-file-preview");
  const clearFileButton = document.getElementById("clearImportFile");

  // toggle between paste and file upload
  document
    .querySelector('label[for="importPasteOption"]')
    .addEventListener("click", function () {
      importPasteOption.checked = true;
      importPasteInput.classList.remove("d-none");
      importFileInput.classList.add("d-none");
    });

  document
    .querySelector('label[for="importFileOption"]')
    .addEventListener("click", function () {
      importFileOption.checked = true;
      importPasteInput.classList.add("d-none");
      importFileInput.classList.remove("d-none");
    });

  // use json viewer js for the file upload
  jsonImportFile.addEventListener("change", function () {
    if (this.files && this.files.length > 0) {
      const file = this.files[0];
      selectedFileName.textContent = "Selected: " + file.name;

      const reader = new FileReader();
      reader.onload = function (e) {
        const fileContent = e.target.result;
        jsonImportText.value = fileContent;

        // detect if lua or json
        const isLuaFile =
          file.name.toLowerCase().endsWith(".lua") || isLuaContent(fileContent);

        if (isLuaFile) {
          // show lua preview
          jsonFilePreview.innerHTML =
            '<div class="alert alert-info">Lua file detected. Click Import to convert and use it.</div>';

          // mark as lua for submit handler
          jsonImportText.dataset.contentType = "lua";
        } else {
          try {
            // try parsing as json
            const parsed = JSON.parse(fileContent);

            // mark as json for submit handler
            jsonImportText.dataset.contentType = "json";

            // container for JSON viewer
            jsonFilePreview.innerHTML =
              '<div id="json-preview-container" class="bg-dark p-3" style="max-height: 300px; overflow-y: auto;"></div>';
            const container = document.getElementById("json-preview-container");

            const jsonViewer = new JSONViewer();
            container.appendChild(jsonViewer.getContainer());

            // load json
            jsonViewer.showJSON(parsed);
          } catch (error) {
            // check if might be lua when json parse fails
            if (isLuaContent(fileContent)) {
              jsonImportText.dataset.contentType = "lua";
              jsonFilePreview.innerHTML =
                '<div class="alert alert-info">Lua content detected. Click Import to convert and use it.</div>';
            } else {
              jsonImportText.dataset.contentType = "unknown";
              jsonFilePreview.innerHTML = `<div class="alert alert-warning">Invalid JSON format: ${error.message}</div>`;
            }
          }
        }
      };
      reader.onerror = function () {
        jsonFilePreview.innerHTML =
          '<div class="alert alert-danger">Failed to read file</div>';
      };
      reader.readAsText(file);
    } else {
      selectedFileName.textContent = "No file selected";
      jsonFilePreview.innerHTML = "";
    }
  });

  // detect lua content patterns
  function isLuaContent(text) {
    text = text.trim();

    // always parse as json first
    try {
      JSON.parse(text);
      return false;
    } catch (e) {
      // check for common lua patterns
      const startsWithReturn = text.startsWith("return");
      const containsLuaAssignments = /\w+\s*=/.test(text);
      const hasNil = /\bnil\b/.test(text);
      const hasCurlyBraces = text.startsWith("{") && text.includes("=");

      return (
        startsWithReturn || containsLuaAssignments || hasNil || hasCurlyBraces
      );
    }
  }

  // clear file input
  clearFileButton.addEventListener("click", function () {
    jsonImportFile.value = "";
    selectedFileName.textContent = "No file selected";
    jsonFilePreview.innerHTML = "";
    jsonImportText.dataset.contentType = "";
  });

  // check for lua when pasting text
  jsonImportText.addEventListener("input", function () {
    const content = this.value.trim();
    if (content && isLuaContent(content)) {
      this.dataset.contentType = "lua";
    } else {
      // try json parse
      try {
        JSON.parse(content);
        this.dataset.contentType = "json";
      } catch (e) {
        if (content) {
          this.dataset.contentType = "unknown";
        } else {
          this.dataset.contentType = "";
        }
      }
    }
  });

  document
    .getElementById("json-import-submit")
    .addEventListener("click", function () {
      let content = jsonImportText.value.trim();
      const contentType = jsonImportText.dataset.contentType;

      if (!content) {
        const detail = {
          data: "",
          type: "empty",
          error: "No content to import",
        };

        const importEvent = new CustomEvent("towerDataImport", { detail });
        document.dispatchEvent(importEvent);
        return;
      }

      try {
        // send content type with data
        const detail = {
          data: content,
          type: contentType || (isLuaContent(content) ? "lua" : "json"),
        };

        const importEvent = new CustomEvent("towerDataImport", { detail });
        document.dispatchEvent(importEvent);
      } catch (error) {
        // pass error in event
        const detail = {
          data: content,
          type: "error",
          error: error.message,
        };

        const importEvent = new CustomEvent("towerDataImport", { detail });
        document.dispatchEvent(importEvent);
      }
    });
});
