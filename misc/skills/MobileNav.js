export class MobileNav {
  constructor() {
    this.mobileSidebar = document.querySelector(".mobile-sidebar");
    this.mobileSidebarContent = document.querySelector(
      ".mobile-sidebar-content",
    );
    this.mobileNavBtns = document.querySelectorAll(".mobile-nav-btn");
    this.activeSection = null;
    this.originalSidebar = document.querySelector(".aside");
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // nav button clicks
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

    if (this.mobileSidebar) {
      this.mobileSidebar.addEventListener("click", (e) => {
        if (e.target === this.mobileSidebar) {
          this.closeSidebar();
        }
      });
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768 && this.isSidebarOpen()) {
        this.closeSidebar();
      }
    });
  }

  openSection(sectionName) {
    if (!sectionName) return;
    if (sectionName === "about") {
      this.closeSidebar();
      const aboutModal = document.getElementById("about-modal");
      if (aboutModal) {
        const bsModal = new bootstrap.Modal(aboutModal);
        bsModal.show();
      }
      return;
    }

    if (sectionName === "settings") {
      this.closeSidebar();
      const settingsModal = document.getElementById("settings-modal");
      if (settingsModal) {
        const bsModal = new bootstrap.Modal(settingsModal);
        bsModal.show();
      }
      return;
    }

    if (sectionName === "controls") {
      this.populateControlsSection();
    }

    this.mobileSidebar?.classList.add("active");
    this.updateActiveButton(sectionName);
    this.activeSection = sectionName;
  }

  populateControlsSection() {
    if (!this.mobileSidebarContent || !this.originalSidebar) return;

    const sidebarClone = this.originalSidebar.cloneNode(true);
    sidebarClone.classList.remove("aside", "d-none", "d-md-flex");
    sidebarClone.classList.add("mobile-controls-section");
    sidebarClone.style.cssText =
      "width: 100%; height: auto; min-width: auto; overflow-y: visible;";

    this.mobileSidebarContent.innerHTML = "";
    this.mobileSidebarContent.appendChild(sidebarClone);

    this.setupClonedEventListeners(sidebarClone);
  }

  setupClonedEventListeners(container) {
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

  updateActiveButton(sectionName) {
    this.mobileNavBtns.forEach((btn) => {
      const btnSection = btn.getAttribute("data-mobile-section");
      
      btn.classList.remove("active");
      const iconElement = btn.querySelector("i");
      
      if (btnSection === sectionName) {
        btn.classList.add("active");
        
        if (iconElement) {
          if (!iconElement.dataset.originalClass) {
            iconElement.dataset.originalClass = iconElement.className;
          }
          iconElement.className = "bi bi-x-lg";
        }
      } else {
        if (iconElement && iconElement.dataset.originalClass) {
          iconElement.className = iconElement.dataset.originalClass;
        }
      }
    });
  }

  closeSidebar() {
    this.mobileSidebar?.classList.remove("active");
    this.activeSection = null;
    this.mobileNavBtns.forEach((btn) => {
      btn.classList.remove("active");
      const iconElement = btn.querySelector("i");
      if (iconElement && iconElement.dataset.originalClass) {
        iconElement.className = iconElement.dataset.originalClass;
      }
    });
  }

  isSidebarOpen() {
    return this.mobileSidebar?.classList.contains("active");
  }
}