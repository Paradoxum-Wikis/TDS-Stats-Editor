class SettingsManager {
  constructor() {
    this.themeModeControl = document.getElementById("themeModeControl");
    this.themeToggle = document.getElementById("themeToggle");
    this.themeToggleLabel = document.querySelector('label[for="themeToggle"]');
    this.showSecondsToggle = document.getElementById("showSecondsToggle");
    this.forceUSNumbersToggle = document.getElementById("forceUSNumbersToggle");
    this.showCollapsibleCountsToggle = document.getElementById("showCollapsibleCountsToggle");
    this.animationsToggle = document.getElementById("animationsToggle");
    this.enableLuaViewerToggle = document.getElementById("enableLuaViewerToggle");
    this.keepDropdownOpenToggle = document.getElementById("keepDropdownOpenToggle");
    this.classicTableSizeToggle = document.getElementById("classicTableSizeToggle");
    this.imageCacheDebugToggle = document.getElementById("imageCacheDebugToggle");
    this.autoSlideToggle = document.getElementById("autoSlideToggle");
    this.analyticsConsentToggle = document.getElementById("analyticsConsentToggle");
    this.towerRegistryDebugToggle = document.getElementById("towerRegistryDebugToggle");
    
    this.animationsStylesheet = document.getElementById("animsCSS");
    this.body = document.body;
    this.systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

    this.themeMode = localStorage.getItem("themeMode") || "auto";
    this.theme = localStorage.getItem("theme") || (this.systemThemeQuery.matches ? "dark" : "light");
    this.updateCurrentTheme();

    this.showSeconds = localStorage.getItem("showSeconds") !== "false";
    this.forceUSNumbers = localStorage.getItem("forceUSNumbers") !== "false";
    this.showCollapsibleCounts = localStorage.getItem("showCollapsibleCounts") !== "false";
    this.animationsEnabled = localStorage.getItem("animationsEnabled") !== "false";
    this.enableLuaViewer = localStorage.getItem("enableLuaViewer") === "true";
    this.keepDropdownOpen = localStorage.getItem("keepDropdownOpen") === "true";
    this.classicTableSize = localStorage.getItem("classicTableSize") === "true";
    this.imageCacheDebug = localStorage.getItem("imageCacheDebug") === "true";
    this.autoSlideEnabled = localStorage.getItem("autoSlideEnabled") !== "false";
    this.analyticsConsent = localStorage.getItem("analyticsConsent") === "true";
    this.towerRegistryDebug = localStorage.getItem("towerRegistryDebug") === "true";

    window.state = window.state || {};
    window.state.settings = window.state.settings || {};
    window.state.settings.showSeconds = this.showSeconds;
    window.state.settings.forceUSNumbers = this.forceUSNumbers;
    window.state.settings.showCollapsibleCounts = this.showCollapsibleCounts;
    window.state.settings.animationsEnabled = this.animationsEnabled;
    window.state.settings.enableLuaViewer = this.enableLuaViewer;
    window.state.settings.keepDropdownOpen = this.keepDropdownOpen;
    window.state.settings.classicTableSize = this.classicTableSize;
    window.state.settings.imageCacheDebug = this.imageCacheDebug;
    window.state.settings.autoSlideEnabled = this.autoSlideEnabled;
    window.state.settings.towerRegistryDebug = this.towerRegistryDebug;
    window.state.settings.analyticsConsent = this.analyticsConsent;

    document.addEventListener("analyticsConsentChanged", (e) => {
      this.analyticsConsent = e.detail.consent;
      window.state.settings.analyticsConsent = this.analyticsConsent;
      if (this.analyticsConsentToggle) {
        this.analyticsConsentToggle.checked = this.analyticsConsent;
      }
    });

    this.init();
  }

  updateCurrentTheme() {
    if (this.themeMode === "auto") {
      this.currentTheme = this.systemThemeQuery.matches ? "dark" : "light";
    } else {
      this.currentTheme = this.theme;
    }
  }

  applyTheme() {
    this.body.classList.toggle("light-mode", this.currentTheme === "light");
    this.updateThemeImages();
    
    if (this.themeToggle) {
      this.themeToggle.checked = this.currentTheme === "dark";
      this.updateToggleLabel();
    }
    
    if (this.themeModeControl) {
      this.themeModeControl.value = this.themeMode;
    }

    this.updateThemeToggleState();
  }

  updateThemeToggleState() {
    const isDisabled = this.themeMode === "auto";
    if (this.themeToggle) {
      this.themeToggle.disabled = isDisabled;
    }
    if (this.themeToggleLabel) {
      this.themeToggleLabel.closest(".toru-item")?.classList.toggle("disabled", isDisabled);
    }
  }

  handleSystemThemeChange() {
    if (this.themeMode === "auto") {
      this.updateCurrentTheme();
      this.applyTheme();
    }
  }

  init() {
    if (this.themeModeControl) {
      this.themeModeControl.value = this.themeMode;
      this.themeModeControl.addEventListener("change", this.setThemeMode.bind(this));
    }

    this.applyTheme();

    if (this.themeMode === "auto") {
      this.systemThemeQuery.addEventListener("change", this.handleSystemThemeChange.bind(this));
    }

    if (this.animationsStylesheet) {
      this.animationsStylesheet.disabled = !this.animationsEnabled;
    }

    if (this.themeToggle) {
      this.themeToggle.addEventListener("change", this.toggleTheme.bind(this));
    }

    if (this.animationsToggle) {
      this.animationsToggle.checked = !this.animationsEnabled;
      this.animationsToggle.addEventListener("change", this.toggleAnimations.bind(this));
    }

    if (this.showSecondsToggle) {
      this.showSecondsToggle.checked = this.showSeconds;
      this.showSecondsToggle.addEventListener("change", this.toggleShowSeconds.bind(this));
    }

    if (this.forceUSNumbersToggle) {
      this.forceUSNumbersToggle.checked = this.forceUSNumbers;
      this.forceUSNumbersToggle.addEventListener("change", this.toggleForceUSNumbers.bind(this));
    }

    if (this.showCollapsibleCountsToggle) {
      this.showCollapsibleCountsToggle.checked = this.showCollapsibleCounts;
      this.showCollapsibleCountsToggle.addEventListener("change", this.toggleShowCollapsibleCounts.bind(this));
    }

    if (this.autoSlideToggle) {
      this.autoSlideToggle.checked = this.autoSlideEnabled;
      this.autoSlideToggle.addEventListener("change", this.toggleAutoSlide.bind(this));
    }

    if (this.enableLuaViewerToggle) {
      this.enableLuaViewerToggle.checked = this.enableLuaViewer;
      this.enableLuaViewerToggle.addEventListener("change", this.toggleEnableLuaViewer.bind(this));
    }

    if (this.keepDropdownOpenToggle) {
      this.keepDropdownOpenToggle.addEventListener("change", this.toggleKeepDropdownOpen.bind(this));
    }

    if (this.classicTableSizeToggle) {
      this.classicTableSizeToggle.checked = this.classicTableSize;
      this.classicTableSizeToggle.addEventListener("change", this.toggleClassicTableSize.bind(this));
      this.applyClassicTableSize();
    }

    if (this.imageCacheDebugToggle) {
      this.imageCacheDebugToggle.checked = this.imageCacheDebug;
      this.imageCacheDebugToggle.addEventListener("change", this.toggleImageCacheDebug.bind(this));
    }

    if (this.towerRegistryDebugToggle) {
      this.towerRegistryDebugToggle.checked = this.towerRegistryDebug;
      this.towerRegistryDebugToggle.addEventListener("change", this.toggleTowerRegistryDebug.bind(this));
    }

    if (this.analyticsConsentToggle) {
      this.analyticsConsentToggle.checked = this.analyticsConsent;
      this.analyticsConsentToggle.addEventListener("change", this.toggleAnalyticsConsent.bind(this));
    }

    this.updateThemeImages();
    this.updateNumberFormatLabel();
  }

  setThemeMode(event) {
    const newMode = event.target.value;
    if (this.themeMode === newMode) return;

    if (newMode === "auto") {
      this.systemThemeQuery.addEventListener("change", this.handleSystemThemeChange.bind(this));
    } else {
      this.systemThemeQuery.removeEventListener("change", this.handleSystemThemeChange.bind(this));
    }

    this.themeMode = newMode;
    localStorage.setItem("themeMode", this.themeMode);
    this.updateCurrentTheme();
    this.applyTheme();
  }

  toggleTheme() {
    if (this.themeMode === "manual") {
      this.theme = this.themeToggle.checked ? "dark" : "light";
      localStorage.setItem("theme", this.theme);
      this.updateCurrentTheme();
      this.applyTheme();
    }
  }

  toggleAutoSlide() {
    this.autoSlideEnabled = this.autoSlideToggle.checked;
    window.state.settings.autoSlideEnabled = this.autoSlideEnabled;
    localStorage.setItem("autoSlideEnabled", this.autoSlideEnabled);
    
    document.dispatchEvent(new CustomEvent("settingsChanged", {
      detail: { setting: "autoSlideEnabled", value: this.autoSlideEnabled }
    }));
  }

  toggleShowSeconds() {
    this.showSeconds = this.showSecondsToggle.checked;
    window.state.settings.showSeconds = this.showSeconds;
    localStorage.setItem("showSeconds", this.showSeconds);
    
    document.dispatchEvent(new CustomEvent("settingsChanged", {
      detail: { setting: "showSeconds", value: this.showSeconds }
    }));
  }

  toggleForceUSNumbers() {
    this.forceUSNumbers = this.forceUSNumbersToggle.checked;
    window.state.settings.forceUSNumbers = this.forceUSNumbers;
    localStorage.setItem("forceUSNumbers", this.forceUSNumbers);
    
    this.updateNumberFormatLabel();
    
    document.dispatchEvent(new CustomEvent("settingsChanged", {
      detail: { setting: "forceUSNumbers", value: this.forceUSNumbers }
    }));
  }

  toggleShowCollapsibleCounts() {
    this.showCollapsibleCounts = this.showCollapsibleCountsToggle.checked;
    window.state.settings.showCollapsibleCounts = this.showCollapsibleCounts;
    localStorage.setItem("showCollapsibleCounts", this.showCollapsibleCounts);
    
    document.dispatchEvent(new CustomEvent("settingsChanged", {
      detail: { setting: "showCollapsibleCounts", value: this.showCollapsibleCounts }
    }));
  }

  toggleAnimations() {
    this.animationsEnabled = !this.animationsToggle.checked;
    window.state.settings.animationsEnabled = this.animationsEnabled;
    localStorage.setItem("animationsEnabled", this.animationsEnabled);
    
    if (this.animationsStylesheet) {
      this.animationsStylesheet.disabled = !this.animationsEnabled;
    }
    
    document.dispatchEvent(new CustomEvent("settingsChanged", {
      detail: { setting: "animationsEnabled", value: this.animationsEnabled }
    }));
  }

  toggleEnableLuaViewer() {
    this.enableLuaViewer = this.enableLuaViewerToggle.checked;
    window.state.settings.enableLuaViewer = this.enableLuaViewer;
    localStorage.setItem("enableLuaViewer", this.enableLuaViewer);
    
    document.dispatchEvent(new CustomEvent("settingsChanged", {
      detail: { setting: "enableLuaViewer", value: this.enableLuaViewer }
    }));
  }

  toggleKeepDropdownOpen() {
    this.keepDropdownOpen = this.keepDropdownOpenToggle.checked;
    window.state.settings.keepDropdownOpen = this.keepDropdownOpen;
    localStorage.setItem("keepDropdownOpen", this.keepDropdownOpen);
    
    document.dispatchEvent(new CustomEvent("settingsChanged", {
      detail: { setting: "keepDropdownOpen", value: this.keepDropdownOpen }
    }));
  }

  toggleClassicTableSize() {
    this.classicTableSize = this.classicTableSizeToggle.checked;
    window.state.settings.classicTableSize = this.classicTableSize;
    localStorage.setItem("classicTableSize", this.classicTableSize);
    
    this.applyClassicTableSize();
    
    document.dispatchEvent(new CustomEvent("settingsChanged", {
      detail: { setting: "classicTableSize", value: this.classicTableSize }
    }));
  }

  applyClassicTableSize() {
    const towerTable = document.getElementById("tower-table");
    const unitTable = document.getElementById("unit-table");
    
    if (this.classicTableSize) {
      if (towerTable) towerTable.style.fontSize = "0.825rem";
      if (unitTable) unitTable.style.fontSize = "0.825rem";
    } else {
      if (towerTable) towerTable.style.fontSize = "";
      if (unitTable) unitTable.style.fontSize = "";
    }
  }

  toggleImageCacheDebug() {
    this.imageCacheDebug = this.imageCacheDebugToggle.checked;
    window.state.settings.imageCacheDebug = this.imageCacheDebug;
    localStorage.setItem("imageCacheDebug", this.imageCacheDebug);
    
    document.dispatchEvent(new CustomEvent("settingsChanged", {
      detail: { setting: "imageCacheDebug", value: this.imageCacheDebug }
    }));
  }

  toggleTowerRegistryDebug() {
    this.towerRegistryDebug = this.towerRegistryDebugToggle.checked;
    window.state.settings.towerRegistryDebug = this.towerRegistryDebug;
    localStorage.setItem("towerRegistryDebug", this.towerRegistryDebug);
    
    document.dispatchEvent(new CustomEvent("settingsChanged", {
      detail: { setting: "towerRegistryDebug", value: this.towerRegistryDebug }
    }));
  }

  toggleAnalyticsConsent() {
    this.analyticsConsent = this.analyticsConsentToggle.checked;
    window.state.settings.analyticsConsent = this.analyticsConsent;
    localStorage.setItem("analyticsConsent", this.analyticsConsent);
    
    document.dispatchEvent(new CustomEvent("settingsChanged", {
      detail: { setting: "analyticsConsent", value: this.analyticsConsent }
    }));
    
    document.dispatchEvent(new CustomEvent("analyticsConsentChanged", {
      detail: { consent: this.analyticsConsent }
    }));
    
    if (this.analyticsConsent && typeof gtag === "undefined") {
      window.location.reload();
    }
  }

  updateToggleLabel() {
    if (!this.themeToggleLabel) return;
    
    const icon = this.themeToggleLabel.querySelector(".bi");
    const titleSpan = this.themeToggleLabel.querySelector(".toru-title");
    const descriptionSpan = this.themeToggleLabel.querySelector(".d-block.small.text-muted");
    
    if (!icon || !titleSpan || !descriptionSpan) return;
    
    const displayTheme = this.currentTheme;
    
    if (displayTheme === "dark") {
      icon.className = "bi bi-moon-stars me-2 toru-icon";
      titleSpan.textContent = "Dark Mode";
      descriptionSpan.textContent = "Enjoy the dark side of the web";
    } else {
      icon.className = "bi bi-sun me-2 toru-icon";
      titleSpan.textContent = "Light Mode";
      descriptionSpan.textContent = "Bathe in the light of the web";
    }
  }

  updateThemeImages() {
    document.querySelectorAll(".theme-image").forEach((img) => {
      const themeToUse = this.currentTheme;
      if (themeToUse === "light") {
        if (img.dataset.lightSrc) {
          img.src = img.dataset.lightSrc;
        }
      } else {
        if (img.dataset.darkSrc) {
          img.src = img.dataset.darkSrc;
        }
      }
    });
  }

  updateNumberFormatLabel() {
    const label = document.querySelector('label[for="forceUSNumbersToggle"]');
    if (!label) return;
    
    const titleSpan = label.querySelector(".toru-title");
    const descriptionSpan = label.querySelector(".d-block.small.text-muted");
    
    if (!titleSpan || !descriptionSpan) return;
    
    if (this.forceUSNumbers) {
      titleSpan.textContent = "US Number Format";
      descriptionSpan.textContent = "Format numbers as 1,234.56";
    } else {
      titleSpan.textContent = "RU Number Format";
      descriptionSpan.textContent = "Format numbers as 1 234,56";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.settingsManager = new SettingsManager();
});
