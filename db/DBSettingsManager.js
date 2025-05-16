class DBSettingsManager {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle");
    this.body = document.body;
    this.THEME_KEY = "theme";
    this.THEME_MODE_KEY = "themeMode";
    this.ANIMATIONS_KEY = "animationsEnabled";
    this.systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    this.currentTheme = localStorage.getItem(this.THEME_KEY) || "dark";
    this.themeMode = localStorage.getItem(this.THEME_MODE_KEY) || "auto";
    this.animationsEnabled = localStorage.getItem(this.ANIMATIONS_KEY) !== "false";

    this.init();
  }

  init() {
    this.applyTheme();
    this.setupEventListeners();
    this.updateSystemThemeListener();
  }
  
  applyTheme() {
    let effectiveTheme = this.currentTheme;
    if (this.themeMode === "auto") {
      effectiveTheme = this.systemThemeQuery.matches ? "dark" : "light";
    }
    
    if (effectiveTheme === "light") {
      this.body.classList.add("light-mode");
      this.themeToggle.checked = false;
    } else {
      this.body.classList.remove("light-mode");
      this.themeToggle.checked = true;
    }

    this.updateToggleLabel();
    this.updateThemeImages();
  }

  setupEventListeners() {
    this.themeToggle.addEventListener("change", this.toggleTheme.bind(this));

    window.addEventListener("storage", (event) => {
      if (
        event.key === this.THEME_KEY ||
        event.key === this.THEME_MODE_KEY ||
        event.key === this.ANIMATIONS_KEY
      ) {
        this.currentTheme = localStorage.getItem(this.THEME_KEY) || "dark";
        this.themeMode = localStorage.getItem(this.THEME_MODE_KEY) || "auto";
        this.applyTheme();
        this.updateSystemThemeListener();
      }
    });
  }

  updateSystemThemeListener() {
    if (this._systemThemeListener) {
      this.systemThemeQuery.removeEventListener(
        "change",
        this._systemThemeListener
      );
      this._systemThemeListener = null;
    }
    
    if (this.themeMode === "auto") {
      this._systemThemeListener = () => this.applyTheme();
      this.systemThemeQuery.addEventListener(
        "change",
        this._systemThemeListener
      );
    }
  }

  toggleTheme() {
    if (this.themeToggle.checked) {
      this.currentTheme = "dark";
    } else {
      this.currentTheme = "light";
    }

    this.themeMode = "manual"; // Override auto mode when manually toggling

    localStorage.setItem(this.THEME_KEY, this.currentTheme);
    localStorage.setItem(this.THEME_MODE_KEY, this.themeMode);
    
    this.applyTheme();
    this.updateSystemThemeListener();
  }

  updateToggleLabel() {
    const label = document.querySelector('label[for="themeToggle"]');
    if (this.currentTheme === "dark" || 
       (this.themeMode === "auto" && this.systemThemeQuery.matches)) {
      label.innerHTML = '<i class="bi bi-moon-stars me-2"></i>Dark Mode';
    } else {
      label.innerHTML = '<i class="bi bi-sun me-2"></i>Light Mode';
    }
  }

  updateThemeImages() {
    document.querySelectorAll(".theme-image").forEach((img) => {
      const effectiveTheme = (this.themeMode === "auto")
        ? (this.systemThemeQuery.matches ? "dark" : "light")
        : this.currentTheme;
        
      if (effectiveTheme === "light") {
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
}

document.addEventListener("DOMContentLoaded", () => {
  window.dbSettingsManager = new DBSettingsManager();
});
