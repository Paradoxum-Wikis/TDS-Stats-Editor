import TextFormatter from "./TextFormatter.js";

const previewClass =
  "small text-muted mt-1 formatted-preview ps-2 border-start border-secondary";
const formControlClass = [
  "form-control",
  "form-control-sm",
  "text-white",
  "bg-dark",
];
const dangerClass = ["btn", "btn-sm", "btn-outline-danger"];
const primaryClass = ["btn", "btn-sm", "btn-primary"];
const secondaryClass = ["btn", "btn-sm", "btn-outline-secondary"];
const formatRegex = /('''|''|\\u\\|\\c([a-zA-Z]+|#[0-9a-fA-F]{3,6})\\)/;

export default class ExtrasManager {
  constructor(viewer, container, addButton, addGroupButton) {
    this.viewer = viewer;
    this.container = container;
    this.addButton = addButton;
    this.addGroupButton = addGroupButton;
    this.upgradeChangesEl = document.getElementById(
      "side-upgrade-extras-output",
    );
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.addButton.addEventListener("click", () => {
      if (!this.viewer || this.upgradeIndex === undefined) {
        console.warn(
          "Cannot add extra: viewer or upgrade index not set (I DONT KNOW HOW TO FIX THIS CRAP HELP ME PLEASE)",
        );
        return;
      }

      const skin = this.viewer.getActiveSkin();
      if (
        !skin ||
        !skin.data ||
        !skin.data.Upgrades ||
        !skin.data.Upgrades[this.upgradeIndex]
      ) {
        console.warn("Cannot add extra: skin data not available");
        return;
      }

      const upgradeStats = skin.data.Upgrades[this.upgradeIndex].Stats;
      if (upgradeStats.Extras === undefined) {
        upgradeStats.Extras = [];
      }

      upgradeStats.Extras.push("");
      this.viewer.reload();
    });

    this.addGroupButton.addEventListener("click", () => {
      if (!this.viewer || this.upgradeIndex === undefined) {
        console.warn(
          "Cannot add group: viewer or upgrade index not set (RAAAAHHHHH)",
        );
        return;
      }

      this.showAddGroupForm();
    });

    document.addEventListener("settingsChanged", (event) => {
      if (event.detail.setting === "showCollapsibleCounts") {
        this.renderUpgradeChanges();
      }
    });
  }

  createPreviewElement(inputElement, parent) {
    const previewElement = document.createElement("div");
    previewElement.className = previewClass;
    TextFormatter.initForElement(inputElement, previewElement);

    // Show/hide preview based on format tags usage
    inputElement.addEventListener("input", () => {
      const hasFormatting = formatRegex.test(inputElement.value);
      previewElement.style.display = hasFormatting ? "block" : "none";
    });

    parent.appendChild(previewElement);
    previewElement.style.display = "none";

    return previewElement;
  }

  showAddGroupForm() {
    const upgradeIndex = this.upgradeIndex;
    const skin = this.viewer.getActiveSkin();
    const upgradeStats = skin.data.Upgrades[upgradeIndex].Stats;
    if (upgradeStats.Extras === undefined) {
      upgradeStats.Extras = [];
    }

    const groupForm = document.createElement("div");
    groupForm.classList.add(
      "mb-3",
      "p-2",
      "border",
      "border-primary",
      "rounded",
    );

    // Group ID field
    const groupIdField = document.createElement("div");
    groupIdField.classList.add("d-flex", "mb-2", "align-items-center");
    groupIdField.innerHTML = `
            <label class="me-2">Group ID:</label>
            <select class="form-select form-select-sm text-white bg-dark">
                <option value="">Default</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        `;
    const groupIdSelect = groupIdField.querySelector("select");
    const groupNameField = document.createElement("div");
    groupNameField.classList.add("mb-2");
    groupNameField.innerHTML = `
            <div class="d-flex mb-1 align-items-center">
                <label class="me-2">Name:</label>
                <input type="text" class="form-control form-control-sm text-white bg-dark" placeholder="Custom group name">
            </div>
            <small class="text-muted d-block">If this group ID already has a name, you don't need to specify it again.</small> 
        `;
    const groupNameInput = groupNameField.querySelector("input");

    this.createPreviewElement(groupNameInput, groupNameField);

    const contentField = document.createElement("div");
    contentField.classList.add("mb-2");
    contentField.innerHTML = `
            <label class="mb-1">Content:</label>
            <textarea class="form-control form-control-sm bg-dark" rows="2" placeholder="Enter content for the first item"></textarea>
        `;
    const contentInput = contentField.querySelector("textarea");

    this.createPreviewElement(contentInput, contentField);

    const buttonGroup = document.createElement("div");
    buttonGroup.classList.add("d-flex", "justify-content-end", "gap-2");

    const cancelButton = document.createElement("button");
    secondaryClass.forEach((className) =>
      cancelButton.classList.add(className),
    );
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", () => {
      this.container.removeChild(groupForm);
    });

    const saveButton = document.createElement("button");
    primaryClass.forEach((className) => saveButton.classList.add(className));
    saveButton.textContent = "Create Group";
    saveButton.addEventListener("click", () => {
      const groupId = groupIdSelect.value;
      const groupName = groupNameInput.value.trim();
      const content = contentInput.value.trim();

      // Format the collapsible group tag with content
      let groupTag = "[Collapsible";
      if (groupId) groupTag += groupId;
      if (groupName) groupTag += `:${groupName}`;
      groupTag += "]";

      // Add content directly to the group tag if provided
      if (content) {
        groupTag += content;
      }

      // Add the combined group to extras
      upgradeStats.Extras.push(groupTag);

      this.container.removeChild(groupForm);
      this.viewer.reload();
    });

    buttonGroup.appendChild(cancelButton);
    buttonGroup.appendChild(saveButton);

    groupForm.appendChild(groupIdField);
    groupForm.appendChild(groupNameField);
    groupForm.appendChild(contentField);
    groupForm.appendChild(buttonGroup);

    this.container.appendChild(groupForm);
  }

  setUpgradeIndex(index) {
    this.upgradeIndex = index;
  }

  loadExtras(upgrade) {
    const extras = upgrade?.data?.Extras ?? [];
    this.container.innerHTML = "";
    extras.forEach((extra, index) => {
      this.addExtra(extra, index);
    });
  }

  addExtra(extra, index) {
    const inputGroup = document.createElement("form");
    ["input-group", "mb-2"].forEach((className) =>
      inputGroup.classList.add(className),
    );

    const inputText = document.createElement("input");
    formControlClass.forEach((className) => inputText.classList.add(className));
    inputText.type = "text";
    inputText.value = extra;
    inputText.placeholder = "Add something...";

    const previewElement = this.createPreviewElement(inputText, this.container);
    const inputButtonGroup = document.createElement("div");
    const removeButton = document.createElement("div");
    dangerClass.forEach((className) => removeButton.classList.add(className));
    removeButton.innerText = "Remove";
    inputButtonGroup.appendChild(removeButton);
    inputGroup.appendChild(inputText);
    inputGroup.appendChild(inputButtonGroup);
    this.container.appendChild(inputGroup);
    this.container.appendChild(previewElement);

    inputGroup.addEventListener(
      "submit",
      ((e) => {
        e.preventDefault();
        this.processExtraInput(index, inputText.value);
      }).bind(this),
    );

    inputText.addEventListener(
      "focusout",
      (() => {
        this.processExtraInput(index, inputText.value);
      }).bind(this),
    );

    inputText.addEventListener("mouseup", (() => inputText.focus()).bind(this));

    removeButton.addEventListener(
      "mouseup",
      (() => {
        this.removeExtra(index);
        this.viewer.reload();
      }).bind(this),
    );
  }

  processExtraInput(index, value) {
    if (value !== "") {
      this.updateExtra(index, value);
    }
    this.viewer.reload();
  }

  updateExtra(extraIndex, value) {
    const upgradeIndex = this.upgradeIndex;
    const skin = this.viewer.getActiveSkin();
    skin.data.Upgrades[upgradeIndex].Stats.Extras[extraIndex] = value;
  }

  removeExtra(deletedIndex) {
    const upgradeIndex = this.upgradeIndex;
    const skin = this.viewer.getActiveSkin();
    const stats = skin.data.Upgrades[upgradeIndex].Stats;
    stats.Extras = stats.Extras.filter((_, index) => index !== deletedIndex);
  }

  renderUpgradeChanges() {
    if (!this.viewer.getActiveSkin() || this.upgradeIndex === undefined) return;

    const upgradeChanges = this.viewer
      .getActiveSkin()
      .getUpgradeChangeOutput(this.upgradeIndex);

    const regularExtras = [];
    const collapsibleGroups = {};

    upgradeChanges.forEach((change) => {
      // Check for collapsible groups with custom names:
      // [Collapsible], [Collapsible1], [Collapsible:CustomName], etc.
      const collapsibleMatch = change.match(/^\[Collapsible(\d*):?(.*?)\]/);

      if (collapsibleMatch) {
        const groupId = collapsibleMatch[1] || "default";
        const customName = collapsibleMatch[2]
          ? collapsibleMatch[2].trim()
          : "";

        if (!collapsibleGroups[groupId]) {
          collapsibleGroups[groupId] = {
            items: [],
            customName: customName,
          };
        } else if (customName && !collapsibleGroups[groupId].customName) {
          collapsibleGroups[groupId].customName = customName;
        }

        const cleanedText = change
          .replace(/\[Collapsible\d*:?.*?\]/, "")
          .trim();
        collapsibleGroups[groupId].items.push(cleanedText);
      } else {
        regularExtras.push(change);
      }
    });

    let html = "";
    regularExtras.forEach((change) => {
      // user entered extra (starts with ●)
      // auto generated extra (has img icon)
      if (change.startsWith("●")) {
        html += `<div class="upgrade-change">${TextFormatter.format(change)}</div>`;
      } else {
        html += `<div class="upgrade-change">${TextFormatter.format(change, false)}</div>`;
      }
    });

    const showCounts = window.state?.settings?.showCollapsibleCounts !== false;

    // sort group ids, default (none) is first, then numeric order
    const sortedGroupIds = Object.keys(collapsibleGroups).sort((a, b) => {
      if (a === "default") return -1;
      if (b === "default") return 1;
      return parseInt(a) - parseInt(b);
    });

    sortedGroupIds.forEach((groupId) => {
      const group = collapsibleGroups[groupId];
      const items = group.items;

      if (items.length > 0) {
        const collapsibleId = `collapsible-extras-${this.upgradeIndex}-${groupId}`;

        let groupLabel;
        if (group.customName) {
          groupLabel = group.customName;
        } else {
          groupLabel = `Group`;
          if (groupId !== "default") {
            groupLabel += ` ${groupId}`;
          }
        }

        html += `
                    <div class="mt-2">
                        <button class="btn btn-sm btn-primary border25 w-100" 
                                type="button" 
                                data-bs-toggle="collapse" 
                                data-bs-target="#${collapsibleId}" 
                                aria-expanded="false">
                            <span class="when-closed">▼ ${TextFormatter.format(groupLabel, false)}${showCounts ? ` (${items.length})` : ""} ▼</span>
                            <span class="when-open">▲ ${TextFormatter.format(groupLabel, false)} ▲</span>
                        </button>
                        <div class="collapse mt-2" id="${collapsibleId}">
                            <div class="ps-2 border-start border-secondary">
                                ${items
                                  .map((item) => {
                                    const escapeHtml = item.startsWith("●");
                                    return `<div>${TextFormatter.format(item, !escapeHtml)}</div>`;
                                  })
                                  .join("")}
                            </div>
                        </div>
                    </div>
                `;
      }
    });

    this.upgradeChangesEl.innerHTML = html;

    if (!document.getElementById("collapsible-styles")) {
      const style = document.createElement("style");
      style.id = "collapsible-styles";
      style.textContent = `
                [aria-expanded="false"] .when-open {
                    display: none;
                }
                [aria-expanded="true"] .when-closed {
                    display: none;
                }
            `;
      document.head.appendChild(style);
    }
  }
}
