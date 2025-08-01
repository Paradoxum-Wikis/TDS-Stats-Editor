import html2canvas from "html2canvas";

export default class StatsImageExporter {
  constructor(viewer) {
    this.viewer = viewer;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const exportButton = document.getElementById("export-stats-image");
    if (exportButton) {
      exportButton.addEventListener(
        "click",
        this.exportStatsAsImage.bind(this),
      );
    }
  }

  createHeader() {
    const header = document.createElement("div");
    header.style.marginBottom = "20px";
    header.style.textAlign = "center";

    const title = document.createElement("h1");
    title.textContent = this.viewer.tower.name;
    title.style.fontSize = "2.5rem";
    title.style.margin = "0";
    title.style.color = "inherit";
    title.style.fontFamily = '"Uni Sans Heavy", sans-serif';
    title.style.fontWeight = "900";

    const variant = this.viewer.towerVariants.getSelectedName();
    if (variant !== "Default") {
      const variantSpan = document.createElement("span");
      variantSpan.textContent = ` (${variant})`;
      variantSpan.style.fontSize = "1.8rem";
      variantSpan.style.color = "inherit";
      variantSpan.style.fontFamily = '"Uni Sans Heavy", sans-serif';
      variantSpan.style.fontWeight = "900";
      title.appendChild(variantSpan);
    }

    const subtitle = document.createElement("p");
    subtitle.textContent =
      "Tower Defense Simulator Statistics Editor - tds-editor.com";
    subtitle.style.margin = "10px 0 0 0";
    subtitle.style.fontSize = "1rem";
    subtitle.style.color = "inherit";

    header.appendChild(title);
    header.appendChild(subtitle);
    return header;
  }

  createWrapper() {
    const wrapper = document.createElement("div");
    wrapper.style.fontFamily = "Montserrat, sans-serif";
    wrapper.style.padding = "20px";
    wrapper.style.minWidth = "800px";
    wrapper.style.position = "relative";

    if (document.body.classList.contains("light-mode")) {
      wrapper.classList.add("light-mode");
      wrapper.style.backgroundColor = "#f8f9fa";
      wrapper.style.color = "#212529";
    } else {
      wrapper.classList.add("bg-dark", "text-white");
      wrapper.style.backgroundColor = "#212529";
      wrapper.style.color = "#ffffff";
    }

    const logo = document.createElement("img");
    logo.src = "/htmlassets/landinglogo.webp";
    logo.alt = "TDS Statistics Editor Logo";
    logo.style.position = "absolute";
    logo.style.top = "20px";
    logo.style.right = "10px";
    logo.style.width = "15rem";
    logo.style.height = "auto";
    logo.style.opacity = "0.5";
    logo.style.zIndex = "1";
    wrapper.appendChild(logo);

    const header = this.createHeader();
    wrapper.appendChild(header);

    const towerTable = this.cloneTable("tower-table", "Tower Statistics");
    if (towerTable) {
      wrapper.appendChild(towerTable);
    }

    const unitTable = this.cloneTable("unit-table", "Supporting Statistics");
    if (unitTable) {
      wrapper.appendChild(unitTable);
    }

    const abilitiesSection = this.cloneAbilities();
    if (abilitiesSection) {
      wrapper.appendChild(abilitiesSection);
    }

    const notesSection = this.cloneNotes();
    if (notesSection) {
      wrapper.appendChild(notesSection);
    }

    return wrapper;
  }

  async exportStatsAsImage() {
    const exportBtn = document.getElementById("export-stats-image");
    const originalHTML = exportBtn.innerHTML;

    exportBtn.innerHTML =
      '<i class="bi bi-hourglass-split me-2"></i>Exporting...';
    exportBtn.disabled = true;

    try {
      await this.ensureFontLoaded();

      const wrapper = this.createWrapper();

      wrapper.style.position = "absolute";
      wrapper.style.top = "-9999px";
      wrapper.style.left = "-9999px";
      wrapper.style.visibility = "visible";
      wrapper.style.opacity = "1";

      document.body.appendChild(wrapper);

      await this.waitForImages(wrapper);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(wrapper, {
        backgroundColor: document.body.classList.contains("light-mode")
          ? "#f8f9fa"
          : "#212529",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: wrapper.scrollWidth,
        height: wrapper.scrollHeight,
        onclone: (clonedDoc) => {
          const fontStyle = clonedDoc.createElement("style");
          fontStyle.textContent = `
            @font-face {
              font-family: "Uni Sans Heavy";
              src: url("https://static.wikia.nocookie.net/abd-stand-archive/images/d/d6/Uni_Sans_Heavy.ttf") format("truetype");
              font-display: swap;
            }
          `;
          clonedDoc.head.appendChild(fontStyle);
        },
      });

      const link = document.createElement("a");
      const towerName = this.viewer.tower.name;
      const variant = this.viewer.towerVariants.getSelectedName();
      const displayedVariant = variant === "Default" ? "" : `${variant}-`;

      link.download = `${displayedVariant}${towerName}-stats.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      document.body.removeChild(wrapper);
    } catch (error) {
      console.error("Error exporting stats image:", error);
      alert("Failed to export stats image. Check console for details.");
    } finally {
      exportBtn.innerHTML = originalHTML;
      exportBtn.disabled = false;
    }
  }

  async ensureFontLoaded() {
    try {
      if (document.fonts && document.fonts.check) {
        const isLoaded = document.fonts.check('16px "Uni Sans Heavy"');
        if (isLoaded) {
          return;
        }
      }

      if (document.fonts && document.fonts.load) {
        await document.fonts.load('16px "Uni Sans Heavy"');
      }
    } catch (error) {
      console.warn("Failed to load Uni Sans Heavy font:", error);
    }
  }

  async waitForImages(container) {
    const images = container.querySelectorAll("img");
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        return Promise.resolve();
      } else {
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }
    });

    await Promise.all(imagePromises);
  }

  cloneTable(tableId, sectionTitle) {
    const originalTable = document.getElementById(tableId);
    if (!originalTable || originalTable.classList.contains("d-none")) {
      return null;
    }

    const rows = originalTable.querySelectorAll("tbody tr");
    if (rows.length === 0) {
      return null;
    }

    const section = document.createElement("div");
    section.style.marginBottom = "20px";

    const title = document.createElement("h2");
    title.textContent = sectionTitle;
    title.style.fontSize = "1.5rem";
    title.style.marginBottom = "10px";
    title.style.color = "inherit";
    section.appendChild(title);

    const tableClone = originalTable.cloneNode(true);

    this.preserveFormStates(originalTable, tableClone);

    tableClone.style.maxHeight = "none";
    tableClone.style.height = "auto";
    tableClone.style.overflow = "visible";

    const tbody = tableClone.querySelector("tbody");
    if (tbody) {
      tbody.style.maxHeight = "none";
      tbody.style.height = "auto";
      tbody.style.overflow = "visible";
    }

    tableClone.style.width = "100%";
    tableClone.style.display = "table";

    section.appendChild(tableClone);
    return section;
  }

  cloneAbilities() {
    const originalContainer = document.getElementById("side-ability-container");
    if (!originalContainer || originalContainer.children.length === 0) {
      return null;
    }

    const abilityGroups = originalContainer.querySelectorAll(".ability-group");
    if (abilityGroups.length === 0) {
      return null;
    }

    const section = document.createElement("div");
    section.style.marginBottom = "20px";

    const title = document.createElement("h2");
    title.textContent = "Abilities";
    title.style.fontSize = "1.5rem";
    title.style.marginBottom = "10px";
    title.style.color = "inherit";
    section.appendChild(title);

    abilityGroups.forEach((abilityGroup, index) => {
      const abilityDiv = document.createElement("div");
      abilityDiv.style.marginBottom = "10px";
      abilityDiv.style.padding = "10px";
      abilityDiv.style.border = "1px solid #666";
      abilityDiv.style.borderRadius = "25px 0 25px 0";
      abilityDiv.style.backgroundColor = document.body.classList.contains(
        "light-mode",
      )
        ? "rgba(0, 0, 0, 0.05)"
        : "rgba(0, 0, 2, 0.2)";
      abilityDiv.style.fontSize = "0.85rem";

      const titleInput = abilityGroup.querySelector(
        '[id*="side-ability-title"]',
      );
      const descInput = abilityGroup.querySelector(
        '[id*="side-ability-description"]',
      );
      const levelInput = abilityGroup.querySelector(
        '[id*="side-unlock-level"]',
      );
      const cooldownInput = abilityGroup.querySelector('[id*="side-cd-title"]');
      const costInput = abilityGroup.querySelector('[id*="side-ability-cost"]');

      const abilityTitle = titleInput?.value || `Ability ${index + 1}`;
      const description = descInput?.value || "";
      const level = levelInput?.value || "";
      const cooldown = cooldownInput?.value || "";
      const cost = costInput?.value || "";

      let abilityContent = `<strong>${abilityTitle}</strong>`;

      if (level || cooldown || cost) {
        const details = [];
        if (level) details.push(`Level: ${level}`);
        if (cooldown) details.push(`Cooldown: ${cooldown}s`);
        if (cost) details.push(`Cost: $${cost}`);
        abilityContent += ` (${details.join(" | ")})`;
      }

      if (description) {
        abilityContent += `<br><em>${description}</em>`;
      }

      abilityDiv.innerHTML = abilityContent;
      section.appendChild(abilityDiv);
    });

    return section;
  }

  cloneNotes() {
    const notesTextarea = document.getElementById("tower-notes-textarea");
    if (!notesTextarea || !notesTextarea.value.trim()) {
      return null;
    }

    const section = document.createElement("div");
    section.style.marginBottom = "20px";

    const title = document.createElement("h2");
    title.textContent = "Notes";
    title.style.fontSize = "1.5rem";
    title.style.marginBottom = "10px";
    title.style.color = "inherit";
    section.appendChild(title);

    const notesDiv = document.createElement("div");
    notesDiv.style.padding = "15px";
    notesDiv.style.border = "1px solid #666";
    notesDiv.style.borderRadius = "25px 0 25px 0";
    notesDiv.style.backgroundColor = document.body.classList.contains(
      "light-mode",
    )
      ? "rgba(0, 0, 0, 0.05)"
      : "rgba(0, 0, 2, 0.2)";
    notesDiv.style.fontSize = "0.9rem";
    notesDiv.style.lineHeight = "1.5";
    notesDiv.style.whiteSpace = "pre-wrap";

    const notesContent = notesTextarea.value;
    notesDiv.textContent = notesContent;

    section.appendChild(notesDiv);
    return section;
  }

  preserveFormStates(original, clone) {
    const originalInputs = original.querySelectorAll("input, select, textarea");
    const clonedInputs = clone.querySelectorAll("input, select, textarea");

    for (let i = 0; i < originalInputs.length && i < clonedInputs.length; i++) {
      const originalInput = originalInputs[i];
      const clonedInput = clonedInputs[i];

      if (originalInput.type === "checkbox" || originalInput.type === "radio") {
        clonedInput.checked = originalInput.checked;
        if (originalInput.checked) {
          clonedInput.setAttribute("checked", "checked");
        } else {
          clonedInput.removeAttribute("checked");
        }
        clonedInput.style.position = "relative";
        clonedInput.style.top = "25px";
        clonedInput.style.left = "30px";
      } else if (
        originalInput.type === "text" ||
        originalInput.tagName === "TEXTAREA"
      ) {
        clonedInput.value = originalInput.value;
        clonedInput.setAttribute("value", originalInput.value);
      }
    }
  }
}
