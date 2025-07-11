// if you're reading this, please never use mutationobserver that shit killed me i had to rewrite this whole thing twice
export default class MobileNav {
  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.mobileNav = document.querySelector(".mobile-nav");
    this.mobileSidebar = document.querySelector(".mobile-sidebar");
    this.sidebarContent = document.querySelector(".mobile-sidebar-content");
    this.navButtons = document.querySelectorAll(".mobile-nav-btn");
    this.activeSection = null;

    this.containers = {
      upgrades: {
        element: document.getElementById("level-view"),
        parent: document.getElementById("level-view").parentNode,
        originalIndex: this.getElementIndex(
          document.getElementById("level-view"),
        ),
      },
      views: {
        element: document.getElementById("property-viewer-section"),
        parent: document.getElementById("property-viewer-section").parentNode,
        originalIndex: this.getElementIndex(
          document.getElementById("property-viewer-section"),
        ),
      },
      boosts: {
        element: document.getElementById("boost-view"),
        parent: document.getElementById("boost-view").parentNode,
        originalIndex: this.getElementIndex(
          document.getElementById("boost-view"),
        ),
      },
    };

    for (const section in this.containers) {
      const container = this.containers[section];
      container.originalDisplay = window.getComputedStyle(
        container.element,
      ).display;
    }

    this.init();
    this.setupEventListeners();
  }

  init() {
    this.checkMobile();
    window.addEventListener("resize", () => this.checkMobile());
  }

  getElementIndex(element) {
    return Array.from(element.parentNode.children).indexOf(element);
  }

  checkMobile() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;

    if (wasMobile && !this.isMobile) {
      this.restoreAllSections();
      this.mobileSidebar.style.display = "none";
      document.body.classList.remove("is-mobile");
    } else if (!wasMobile && this.isMobile) {
      this.mobileSidebar.style.display = "";
      document.body.classList.add("is-mobile");
    }
  }

  setupEventListeners() {
    this.navButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const section = btn.dataset.mobileSection;

        if (
          this.activeSection === section &&
          this.mobileSidebar.classList.contains("active")
        ) {
          this.closeSidebar();
          return;
        }

        this.openSection(section);

        this.navButtons.forEach((b) => {
          b.classList.remove("active");
          const iconElement = b.querySelector("i");
          const originalClass =
            iconElement.dataset.originalClass || iconElement.className;
          iconElement.className = originalClass;
        });

        btn.classList.add("active");
        const iconElement = btn.querySelector("i");
        if (!iconElement.dataset.originalClass) {
          iconElement.dataset.originalClass = iconElement.className;
        }
        iconElement.className = "bi bi-x-lg";
      });
    });
  }

  openSection(section) {
    if (
      this.activeSection &&
      this.activeSection !== section &&
      this.activeSection !== "tools"
    ) {
      this.restoreSection(this.activeSection);
    }

    this.activeSection = section;
    this.sidebarContent.innerHTML = "";

    if (section === "tools") {
      const content = document.createElement("div");
      content.className = "mobile-tools-section";
      content.innerHTML = `
        <h5 class="text-white mb-3">Tools</h5>
        
        <!-- View Selection Buttons -->
        <div>
          <p class="text-muted small mb-2 text-center">View Mode</p>
          <div class="btn-group w-100 mb-2" id="mobile-table-view">
            <button class="btn btn-sm btn-outline-secondary" data-view="Table">
              <i class="bi bi-table me-2"></i>Table
            </button>
            <button class="btn btn-sm btn-outline-secondary" data-view="Wikitable">
              <i class="bi bi-layout-text-window me-2"></i>Wikitable
            </button>
            <button class="btn btn-sm btn-outline-secondary" data-view="JSON">
              <i class="bi bi-filetype-json me-2"></i>JSON
            </button>
            ${
              window.settingsManager && window.settingsManager.enableLuaViewer
                ? `<button class="btn btn-sm btn-outline-secondary" data-view="Lua">
                <i class="bi bi-braces me-2"></i>Lua
              </button>`
                : ""
            }
          </div>
        </div>
        
        <!-- Calculation System -->
        <div class="mt-4">
          <p class="text-muted small mb-2 text-center">Calculation System Changer</p>
          <div class="card bg-dark text-white border-secondary mb-3">
            <div class="card-body p-3">
              <select class="form-select form-select-sm bg-dark text-white mb-2" id="mobile-calculation-system-select">
                <option value="default">Default</option>
              </select>
              <div class="form-text text-muted small">
                Choose calculation formulas for DPS, Cost Efficiency, etc.
              </div>
            </div>
          </div>
        </div>
        
        <p class="text-muted small mb-2 text-center">Jibber-jabbers</p>
        <div class="d-flex flex-column gap-2">
          <button class="btn btn-outline-secondary" id="mobile-poll-btn">
            <i class="bi bi-broadcast me-2"></i>Community Poll
          </button>
          <button class="btn btn-outline-secondary" id="mobile-delta-btn">
            <i class="bi bi-triangle me-2"></i>Show Deltas
          </button>
          <button class="btn btn-outline-secondary" id="mobile-clone-btn" data-bs-toggle="modal" data-bs-target="#clone-tower">
            <i class="bi bi-pencil me-2"></i>Clone Tower
          </button>
          <button class="btn btn-outline-secondary" id="mobile-settings-btn" data-bs-toggle="modal" data-bs-target="#settings-modal">
            <i class="bi bi-gear me-2"></i>Settings
          </button>
          <a href="https://tds.fandom.com/wiki/" class="btn btn-outline-secondary" id="mobile-wiki-btn" target="_blank">
            <i class="bi bi-journal-text me-2"></i>TDS Wiki
          </a>
          <a href="/db/" class="btn btn-outline-secondary" id="mobile-database-btn">
            <i class="bi bi-database me-2"></i>TDS Database
          </a>
          <a href="https://resources.tds-editor.com/" class="btn btn-outline-secondary" id="mobile-gpr-btn">
            <i class="bi bi-file-image me-2"></i>GP Resources
          </a>
          <a href="./ranker/" class="btn btn-outline-secondary" id="mobile-gpr-btn">
            <i class="bi bi-bar-chart-steps me-2"></i>TDS Ranker
          </a>
          <a href="./misc/" class="btn btn-outline-secondary" id="mobile-gpr-btn">
            <i class="bi bi-app me-2"></i>Miscellaneous
          </a>
          <button class="btn btn-outline-secondary" id="mobile-about-btn" data-bs-toggle="modal" data-bs-target="#discord-modal">
            <i class="bi bi-info-circle me-2"></i>About
          </button>
        </div>
      `;
      this.sidebarContent.appendChild(content);

      this.setupMobileViewButtons();
      this.syncCalculationSystemDropdown();
      this.connectToolButton("mobile-delta-btn", "button-delta");
      this.connectToolButton("mobile-poll-btn", "poll-toggle");

      const modalButtons = [
        "mobile-clone-btn",
        "mobile-settings-btn",
        "mobile-about-btn",
      ];
      modalButtons.forEach((btnId) => {
        const mobileBtn = document.getElementById(btnId);
        if (mobileBtn) {
          mobileBtn.addEventListener("click", () => {
            setTimeout(() => this.closeSidebar(), 100);
          });
        }
      });
    } else if (this.containers[section]) {
      const container = this.containers[section];
      const element = container.element;

      element.classList.add("mobile-view");

      const wrapper = document.createElement("div");
      wrapper.className = "mobile-direct-container";
      wrapper.appendChild(element);
      this.sidebarContent.appendChild(wrapper);

      element.style.display = "block";
    }

    this.mobileSidebar.classList.add("active");
    this.updateActiveButton(section);
  }

  updateActiveButton(section) {
    this.navButtons.forEach((btn) => {
      btn.classList.remove("active");
      const iconElement = btn.querySelector("i");
      if (iconElement && iconElement.dataset.originalClass) {
        iconElement.className = iconElement.dataset.originalClass;
      }
    });

    const activeBtn = Array.from(this.navButtons).find(
      (btn) => btn.dataset.mobileSection === section,
    );

    if (activeBtn) {
      activeBtn.classList.add("active");
      const iconElement = activeBtn.querySelector("i");
      if (!iconElement.dataset.originalClass) {
        iconElement.dataset.originalClass = iconElement.className;
      }
      iconElement.className = "bi bi-x-lg";
    }
  }

  restoreSection(section) {
    if (this.containers[section]) {
      const container = this.containers[section];
      const element = container.element;
      const parent = container.parent;

      element.classList.remove("mobile-view");

      if (container.originalIndex < parent.children.length) {
        parent.insertBefore(element, parent.children[container.originalIndex]);
      } else {
        parent.appendChild(element);
      }

      element.style.display = "";
    }
  }

  restoreAllSections() {
    for (const section in this.containers) {
      this.restoreSection(section);
    }
  }

  closeSidebar() {
    if (this.activeSection && this.activeSection !== "tools") {
      this.restoreSection(this.activeSection);
    }

    this.mobileSidebar.classList.remove("active");
    this.activeSection = null;

    this.navButtons.forEach((btn) => {
      btn.classList.remove("active");
      const iconElement = btn.querySelector("i");
      if (iconElement && iconElement.dataset.originalClass) {
        iconElement.className = iconElement.dataset.originalClass;
      }
    });
  }

  connectToolButton(mobileButtonId, desktopButtonId) {
    const mobileButton = document.getElementById(mobileButtonId);
    const desktopButton = document.getElementById(desktopButtonId);

    if (mobileButton && desktopButton) {
      const newMobileButton = mobileButton.cloneNode(true);
      mobileButton.parentNode.replaceChild(newMobileButton, mobileButton);

      newMobileButton.addEventListener("click", (event) => {
        event.preventDefault();

        desktopButton.click();
        this.updateToolButtonState(newMobileButton, desktopButton);

        if (mobileButtonId === "mobile-delta-btn") {
          setTimeout(() => this.closeSidebar(), 100);
        }
      });

      this.updateToolButtonState(newMobileButton, desktopButton);

      const observer = new MutationObserver(() => {
        this.updateToolButtonState(newMobileButton, desktopButton);
      });

      observer.observe(desktopButton, {
        attributes: true,
        attributeFilter: ["class", "aria-pressed"],
      });

      if (!this.toolButtonObservers) this.toolButtonObservers = {};
      this.toolButtonObservers[mobileButtonId] = observer;
    }
  }

  updateToolButtonState(mobileButton, desktopButton) {
    const isActive =
      desktopButton.classList.contains("active") ||
      desktopButton.getAttribute("aria-pressed") === "true" ||
      desktopButton.classList.contains("btn-primary");

    if (isActive) {
      mobileButton.classList.add("active");
      mobileButton.classList.remove("btn-outline-secondary");
      mobileButton.classList.add("btn-primary");
    } else {
      mobileButton.classList.remove("active");
      mobileButton.classList.remove("btn-primary");
      mobileButton.classList.add("btn-outline-secondary");
    }
  }

  setupMobileViewButtons() {
    const mobileViewContainer = document.getElementById("mobile-table-view");
    if (!mobileViewContainer) return;

    const desktopTableView = document.querySelector("#table-view");
    if (!desktopTableView) return;

    const activeDesktopButton = desktopTableView.querySelector(
      ".active, .btn-primary",
    );
    const currentView =
      activeDesktopButton?.dataset.view ||
      activeDesktopButton?.textContent.trim() ||
      "Table";

    const buttons = mobileViewContainer.querySelectorAll("button");
    buttons.forEach((btn) => {
      const viewMode = btn.dataset.view;

      btn.classList.remove("btn-primary");
      btn.classList.add("btn-outline-secondary");

      if (viewMode === currentView) {
        btn.classList.remove("btn-outline-secondary");
        btn.classList.add("btn-primary");
      }

      btn.addEventListener("click", () => {
        const desktopButton = Array.from(
          desktopTableView.querySelectorAll("button"),
        ).find(
          (button) =>
            button.textContent.trim() === viewMode ||
            button.dataset.view === viewMode,
        );

        if (desktopButton) {
          desktopButton.click();

          buttons.forEach((b) => {
            b.classList.remove("btn-primary");
            b.classList.add("btn-outline-secondary");
          });
          btn.classList.remove("btn-outline-secondary");
          btn.classList.add("btn-primary");

          setTimeout(() => this.closeSidebar(), 100);
        }
      });
    });

    if (!this.viewButtonObserver) {
      this.viewButtonObserver = new MutationObserver(() => {
        if (this.activeSection === "tools") {
          this.updateMobileViewButtons();
        }
      });

      this.viewButtonObserver.observe(desktopTableView, {
        attributes: true,
        attributeFilter: ["class"],
        subtree: true,
      });
    }
  }

  updateMobileViewButtons() {
    const mobileViewContainer = document.getElementById("mobile-table-view");
    if (!mobileViewContainer) return;

    const desktopTableView = document.querySelector("#table-view");
    if (!desktopTableView) return;

    const activeDesktopButton = desktopTableView.querySelector(
      ".active, .btn-primary",
    );
    const currentView =
      activeDesktopButton?.dataset.view ||
      activeDesktopButton?.textContent.trim() ||
      "Table";

    const buttons = mobileViewContainer.querySelectorAll("button");
    buttons.forEach((btn) => {
      const viewMode = btn.dataset.view;

      if (viewMode === currentView) {
        btn.classList.remove("btn-outline-secondary");
        btn.classList.add("btn-primary");
      } else {
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-outline-secondary");
      }
    });
  }

  syncCalculationSystemDropdown() {
    const desktopSelect = document.getElementById("calculation-system-select");
    const mobileSelect = document.getElementById(
      "mobile-calculation-system-select",
    );

    if (!desktopSelect || !mobileSelect) return;

    mobileSelect.innerHTML = desktopSelect.innerHTML;
    mobileSelect.value = desktopSelect.value;

    mobileSelect.addEventListener("change", () => {
      desktopSelect.value = mobileSelect.value;
      desktopSelect.dispatchEvent(new Event("change"));
    });
  }
}
