import { MobileNavBase } from "../../Shared/MobileNavBase.js"; // Adjust path

export class MobileNav extends MobileNavBase {
  constructor() {
    const originalSidebar = document.querySelector(".aside");
    const sectionConfigs = {
      controls: {
        originalElement: originalSidebar,
        removeClasses: ["aside", "d-none", "d-md-flex"],
        addClasses: ["mobile-controls-section"],
        style: {
          width: "100%",
          height: "auto",
          minWidth: "auto",
          overflowY: "visible",
        },
      },
    };

    const modalConfigs = {
      about: "about-modal",
      settings: "settings-modal",
    };

    super({ sectionConfigs, modalConfigs, bodyActiveClass: null });
  }

  /**
   * Overrides the base populateSidebarContent so that the original sidebar is cloned
   * for the "controls" section.
   * @param {string} sectionName - The name of the section to populate.
   */
  populateSidebarContent(sectionName) {
    if (!this.mobileSidebarContent) return;

    this.mobileSidebarContent.innerHTML = "";

    if (sectionName === "controls") {
      const config = this.sectionConfigs.controls;
      if (config && config.originalElement) {
        const clonedElement = config.originalElement.cloneNode(true);
        clonedElement.classList.remove(...(config.removeClasses || []));
        clonedElement.classList.add(...(config.addClasses || []));
        Object.assign(clonedElement.style, config.style);
        this.mobileSidebarContent.appendChild(clonedElement);
        this.attachSectionEventListeners(clonedElement, sectionName);
      }
    } else {
      const message = document.createElement("p");
      message.className = "text-white";
      message.textContent = "Unknown section selected.";
      this.mobileSidebarContent.appendChild(message);
    }
  }

  /**
   * Overrides the base attachSectionEventListeners for skills-specific listeners.
   * @param {HTMLElement} container - The container element where the section content was added.
   * @param {string} sectionName - The name of the section.
   */
  attachSectionEventListeners(container, sectionName) {
    if (sectionName === "controls") {
      const resetBtn = container.querySelector("#reset-skills");
      const shareBtn = container.querySelector("#share-build");
      const coinsInput = container.querySelector("#total-coins");
      const creditsInput = container.querySelector("#total-credits");
      const globalIncrementInput = container.querySelector("#global-increment");

      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          if (confirm("Are you sure you want to reset all skills?")) {
            const event = new CustomEvent("skillsReset");
            document.dispatchEvent(event);
            this.closeSidebar();
          }
        });
      }

      if (shareBtn) {
        shareBtn.addEventListener("click", () => {
          const event = new CustomEvent("skillsShare");
          document.dispatchEvent(event);
          this.closeSidebar();
        });
      }

      if (coinsInput) {
        coinsInput.addEventListener("input", (e) => {
          const mainInput = document.querySelector(".aside #total-coins");
          if (mainInput) {
            mainInput.value = e.target.value;
            mainInput.dispatchEvent(new Event("input"));
          }
        });
      }

      if (creditsInput) {
        creditsInput.addEventListener("input", (e) => {
          const mainInput = document.querySelector(".aside #total-credits");
          if (mainInput) {
            mainInput.value = e.target.value;
            mainInput.dispatchEvent(new Event("input"));
          }
        });
      }

      if (globalIncrementInput) {
        globalIncrementInput.addEventListener("input", (e) => {
          const mainInput = document.querySelector(".aside #global-increment");
          if (mainInput) {
            mainInput.value = e.target.value;
            mainInput.dispatchEvent(new Event("input"));
          }
        });
      }
    }
  }
}
