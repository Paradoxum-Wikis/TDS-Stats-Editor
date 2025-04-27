class CalcSystemUI {
  constructor() {
    this.calcSystemToggle = document.getElementById("toggle-calc-system");
    this.calcSystemSection = document.getElementById("calc-system-section");
    this.sidebarToggle = document.getElementById("sidebar-toggle");
    this.mainContainer = document.querySelector(".container-main");
    this.floatingCalcSystem = null;
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;

    this.init();
  }

  init() {
    if (!this.calcSystemToggle || !this.calcSystemSection) return;

    this.createFloatingPanel();
    this.setupEventListeners();

    // Initialize state based on localStorage
    if (localStorage.getItem("showCalcSystem") === "true") {
      this.calcSystemSection.classList.remove("d-none");
      this.calcSystemSection.classList.add("animate-fade-in");
      this.calcSystemToggle.classList.remove("btn-outline-secondary");
      this.calcSystemToggle.classList.add("btn-primary");
    }

    setTimeout(() => this.updateFloatingPanel(), 100);
  }

  createFloatingPanel() {
    this.floatingCalcSystem = document.createElement("div");
    this.floatingCalcSystem.id = "floating-calc-system";
    this.floatingCalcSystem.className =
      "d-none position-fixed bg-dark text-white border border25 border-secondary rounded shadow-sm";
    this.floatingCalcSystem.style.cssText =
      "left: 4rem; top: 1rem; z-index: 1111; width: 280px; opacity: 0;";
    document.body.appendChild(this.floatingCalcSystem);
  }

  setupEventListeners() {
    this.calcSystemToggle.addEventListener("click", () =>
      this.toggleCalcSystem(),
    );
    this.sidebarToggle.addEventListener("click", () =>
      this.updateFloatingPanel(),
    );

    // dragging func
    this.floatingCalcSystem.addEventListener("mousedown", (e) =>
      this.handleMouseDown(e),
    );
    document.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    document.addEventListener("mouseup", () => this.handleMouseUp());
  }

  toggleCalcSystem() {
    const currentlyVisible = localStorage.getItem("showCalcSystem") === "true";
    const newVisibility = !currentlyVisible;
    localStorage.setItem("showCalcSystem", newVisibility);

    this.calcSystemToggle.classList.toggle("btn-outline-secondary");
    this.calcSystemToggle.classList.toggle("btn-primary");

    const isSidebarCollapsed =
      this.mainContainer.classList.contains("sidebar-collapsed");

    if (isSidebarCollapsed) {
      if (newVisibility) {
        this.floatingCalcSystem.innerHTML = this.calcSystemSection.innerHTML;
        this.floatingCalcSystem.classList.remove("d-none");
        setTimeout(() => {
          this.floatingCalcSystem.style.opacity = "1";
        }, 50);

        this.syncSelects();
      } else {
        this.floatingCalcSystem.style.opacity = "0";
        setTimeout(() => {
          this.floatingCalcSystem.classList.add("d-none");
        }, 300);
      }
    } else {
      this.calcSystemSection.classList.toggle("d-none");
      if (!this.calcSystemSection.classList.contains("d-none")) {
        this.calcSystemSection.classList.add("animate-fade-in");
      } else {
        this.calcSystemSection.classList.remove("animate-fade-in");
      }
    }
  }

  syncSelects() {
    const newSelect = this.floatingCalcSystem.querySelector("select");
    if (newSelect) {
      const originalSelect = document.getElementById(
        "calculation-system-select",
      );
      if (originalSelect) {
        newSelect.value = originalSelect.value;
        newSelect.addEventListener("change", function () {
          originalSelect.value = this.value;
          originalSelect.dispatchEvent(new Event("change"));
        });
      }
    }
  }

  updateFloatingPanel() {
    const isCalcSystemVisible =
      localStorage.getItem("showCalcSystem") === "true";
    const isSidebarCollapsed =
      this.mainContainer.classList.contains("sidebar-collapsed");
    const isMobileView = window.innerWidth <= 768;

    if (isMobileView) {
      this.floatingCalcSystem.style.opacity = "0";
      setTimeout(() => {
        this.floatingCalcSystem.classList.add("d-none");
      }, 50);
      return;
    }

    if (isSidebarCollapsed && isCalcSystemVisible) {
      this.floatingCalcSystem.innerHTML = this.calcSystemSection.innerHTML;
      this.floatingCalcSystem.classList.remove("d-none");

      setTimeout(() => {
        this.floatingCalcSystem.style.opacity = "1";
        this.floatingCalcSystem.style.transition = "opacity 0.3s ease-in-out";
      }, 50);

      this.syncSelects();

      this.calcSystemSection.classList.add("d-none");
    } else if (!isSidebarCollapsed && isCalcSystemVisible) {
      this.calcSystemSection.classList.remove("d-none");

      this.floatingCalcSystem.style.opacity = "0";
      setTimeout(() => {
        this.floatingCalcSystem.classList.add("d-none");
      }, 300);
    } else {
      this.calcSystemSection.classList.add("d-none");
      this.floatingCalcSystem.style.opacity = "0";
      setTimeout(() => {
        this.floatingCalcSystem.classList.add("d-none");
      }, 300);
    }
  }

  handleMouseDown(e) {
    if (e.target.closest(".card-header")) {
      this.isDragging = true;

      const rect = this.floatingCalcSystem.getBoundingClientRect();
      this.offsetX = e.clientX - rect.left;
      this.offsetY = e.clientY - rect.top;

      this.floatingCalcSystem.classList.add("dragging");

      e.preventDefault();
    }
  }

  handleMouseMove(e) {
    if (this.isDragging) {
      const x = e.clientX - this.offsetX;
      const y = e.clientY - this.offsetY;

      const maxX = window.innerWidth - this.floatingCalcSystem.offsetWidth;
      const maxY = window.innerHeight - this.floatingCalcSystem.offsetHeight;

      const newX = Math.max(0, Math.min(x, maxX));
      const newY = Math.max(0, Math.min(y, maxY));

      this.floatingCalcSystem.style.left = newX + "px";
      this.floatingCalcSystem.style.top = newY + "px";
    }
  }

  handleMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.floatingCalcSystem.classList.remove("dragging");
    }
  }
}

export default CalcSystemUI;
