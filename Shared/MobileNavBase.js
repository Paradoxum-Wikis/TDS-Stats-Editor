import * as bootstrap from "bootstrap";

export class MobileNavBase {
  /**
   * Base class for mobile navigation functionality.
   * @param {object} options - Configuration options for the mobile navigation.
   * @param {object} options.sectionConfigs - Map of section names to their configuration (e.g., originalElement, contentGenerator, classes, styles).
   * @param {object} options.modalConfigs - Map of section names that open modals to their modal element IDs.
   * @param {string|null} options.bodyActiveClass - CSS class to add/remove from the document body when the sidebar is open.
   */
  constructor(options = {}) {
    this.mobileSidebar = document.querySelector(".mobile-sidebar");
    this.mobileSidebarContent = document.querySelector(".mobile-sidebar-content");
    this.mobileNavBtns = document.querySelectorAll(".mobile-nav-btn");
    this.activeSection = null;

    this.sectionConfigs = options.sectionConfigs || {};
    this.modalConfigs = options.modalConfigs || {};
    this.bodyActiveClass = options.bodyActiveClass || null;

    this.init();
  }

  /**
   * Initializes the mobile navigation by setting up event listeners and calling subclass-specific init logic.
   */
  init() {
    this.setupEventListeners();
    this.onInit(); // Hook for subclasses
  }

  /**
   * Placeholder method for subclass-specific initialization logic (e.g., URL hash checking).
   * Subclasses should override this method.
   */
  onInit() {
    // Default has no specific init logic
  }

  /**
   * Sets up event listeners for navigation buttons, sidebar backdrop, window resize, and escape key.
   */
  setupEventListeners() {
    this.mobileNavBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const sectionName = btn.getAttribute("data-mobile-section");

        // Toggle off if already open
        if (this.activeSection === sectionName && this.isSidebarOpen()) {
          this.closeSidebar();
          return;
        }

        this.openSection(sectionName);
      });
    });

    // backdrop click to close sidebar
    if (this.mobileSidebar) {
      this.mobileSidebar.addEventListener("click", (e) => {
        if (e.target === this.mobileSidebar) {
          this.closeSidebar();
        }
      });
    }

    // Close on resize to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768 && this.isSidebarOpen()) {
        this.closeSidebar();
      }
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isSidebarOpen()) {
        this.closeSidebar();
      }
    });
  }

  /**
   * Opens a specific section in the mobile sidebar or a modal.
   * @param {string} sectionName - The name of the section to open.
   */
  openSection(sectionName) {
    if (!sectionName) return;

    // Handle sections that open a modal instead of sidebar content
    if (this.modalConfigs[sectionName]) {
      this.closeSidebar();
      const modalElement = document.getElementById(this.modalConfigs[sectionName]);
      if (modalElement) {
        const bsModal = new bootstrap.Modal(modalElement);
        bsModal.show();
      }
      return;
    }

    this.populateSidebarContent(sectionName);
    this.updateActiveButton(sectionName);
    this.openSidebar();
    this.activeSection = sectionName;
  }

  /**
   * Populates the mobile sidebar content based on the section's configuration.
   * Subclasses can override this method for custom content generation.
   * @param {string} sectionName - The name of the section to populate.
   */
  populateSidebarContent(sectionName) {
    if (!this.mobileSidebarContent) return;

    this.mobileSidebarContent.innerHTML = "";

    const config = this.sectionConfigs[sectionName];
    if (config) {
      let contentElement = null;
      if (config.originalElement) {
        // Clone existing DOM element
        contentElement = config.originalElement.cloneNode(true);
        if (config.removeClasses) {
          contentElement.classList.remove(...config.removeClasses);
        }
        if (config.addClasses) {
          contentElement.classList.add(...config.addClasses);
        }
        if (config.style) {
          Object.assign(contentElement.style, config.style);
        }
      } else if (typeof config.contentGenerator === 'function') {
        contentElement = config.contentGenerator();
      }

      if (contentElement) {
        this.mobileSidebarContent.appendChild(contentElement);
        this.attachSectionEventListeners(contentElement, sectionName);
      }
    } else {
      const message = document.createElement("p");
      message.className = "text-white";
      message.textContent = "Unknown section selected.";
      this.mobileSidebarContent.appendChild(message);
    }
  }

  /**
   * Attaches event listeners to the newly populated section content.
   * Subclasses must override this method to attach their specific listeners.
   * @param {HTMLElement} container - The container element where the section content was added.
   * @param {string} sectionName - The name of the section.
   */
  attachSectionEventListeners(_container, _sectionName) {
    // These are placeholder methods, intended for subclasses to implement specific listeners okkei
  }

  /**
   * Updates the active state of the mobile navigation buttons.
   * @param {string} sectionName - The name of the currently active section.
   */
  updateActiveButton(sectionName) {
    this.mobileNavBtns.forEach((btn) => {
      const btnSection = btn.getAttribute("data-mobile-section");

      btn.classList.toggle("active", btnSection === sectionName);

      const iconElement = btn.querySelector("i");
      if (!iconElement) return;

      // Change icon to X
      if (btnSection === sectionName) {
        if (!iconElement.dataset.originalClass) {
          iconElement.dataset.originalClass = iconElement.className;
        }
        iconElement.className = "bi bi-x-lg";
      } else if (iconElement.dataset.originalClass) {
        iconElement.className = iconElement.dataset.originalClass;
      }
    });
  }

  /**
   * Opens the mobile sidebar and adds the configured body class.
   */
  openSidebar() {
    if (this.mobileSidebar) {
      this.mobileSidebar.classList.add("active");
      if (this.bodyActiveClass) {
        document.body.classList.add(this.bodyActiveClass);
      }
    }
  }

  /**
   * Closes the mobile sidebar and removes the configured body class.
   */
  closeSidebar() {
    if (this.mobileSidebar) {
      this.mobileSidebar.classList.remove("active");
      if (this.bodyActiveClass) {
        document.body.classList.remove(this.bodyActiveClass);
      }

      // Reset button icons
      this.mobileNavBtns.forEach((btn) => {
        btn.classList.remove("active");
        const iconElement = btn.querySelector("i");
        if (iconElement && iconElement.dataset.originalClass) {
          iconElement.className = iconElement.dataset.originalClass;
        }
      });

      this.activeSection = null;
    }
  }

  /**
   * Checks if the mobile sidebar is currently open.
   * @returns {boolean} True if the sidebar is open, false otherwise.
   */
  isSidebarOpen() {
    return this.mobileSidebar?.classList.contains("active");
  }
}