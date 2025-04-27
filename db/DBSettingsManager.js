class DBSettingsManager {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle");
    this.body = document.body;

    this.currentTheme = localStorage.getItem("theme") || "dark";

    this.init();
  }

  init() {
    if (this.currentTheme === "light") {
      this.body.classList.add("light-mode");
      this.themeToggle.checked = false;
    } else {
      this.body.classList.remove("light-mode");
      this.themeToggle.checked = true;
    }

    this.themeToggle.addEventListener("change", this.toggleTheme.bind(this));

    this.updateToggleLabel();
    this.updateThemeImages();
  }

  toggleTheme() {
    if (this.themeToggle.checked) {
      this.body.classList.remove("light-mode");
      this.currentTheme = "dark";
    } else {
      this.body.classList.add("light-mode");
      this.currentTheme = "light";
    }

    // save the preference to localStorage
    localStorage.setItem("theme", this.currentTheme);

    this.updateToggleLabel();
    this.updateThemeImages();
  }

  updateToggleLabel() {
    const label = document.querySelector('label[for="themeToggle"]');
    if (this.currentTheme === "dark") {
      label.innerHTML = '<i class="bi bi-moon-stars me-2"></i>Dark Mode';
    } else {
      label.innerHTML = '<i class="bi bi-sun me-2"></i>Light Mode';
    }
  }

  updateThemeImages() {
    document.querySelectorAll(".theme-image").forEach((img) => {
      if (this.currentTheme === "light") {
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
