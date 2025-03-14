class SettingsManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.showSecondsToggle = document.getElementById('showSecondsToggle');
        this.forceUSNumbersToggle = document.getElementById('forceUSNumbersToggle');
        this.body = document.body;
        
        // Initialize settings from localStorage
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.showSeconds = localStorage.getItem('showSeconds') !== 'false'; // Default to true if not set
        this.forceUSNumbers = localStorage.getItem('forceUSNumbers') !== 'false'; // Default to true if not set
        
        // Initialize state object if not already set
        window.state = window.state || {};
        window.state.settings = window.state.settings || {};
        window.state.settings.showSeconds = this.showSeconds;
        window.state.settings.forceUSNumbers = this.forceUSNumbers;
        
        this.init();
    }
    
    init() {
        // Set initial theme state
        if (this.currentTheme === 'light') {
            this.body.classList.add('light-mode');
            this.themeToggle.checked = false;
            
            // Set light version of GitHub logo
            document.querySelectorAll('.github-logo').forEach(logo => {
                if (logo.dataset.lightSrc) {
                    logo.src = logo.dataset.lightSrc;
                }
            });
        } else {
            this.body.classList.remove('light-mode');
            this.themeToggle.checked = true;
            
            // Set dark version of GitHub logo
            document.querySelectorAll('.github-logo').forEach(logo => {
                if (logo.dataset.darkSrc) {
                    logo.src = logo.dataset.darkSrc;
                }
            });
        }
        
        // Set initial seconds display state
        this.showSecondsToggle.checked = this.showSeconds;
        
        // Set initial number format state
        this.forceUSNumbersToggle.checked = this.forceUSNumbers;
        
        // Add event listeners to the toggles
        this.themeToggle.addEventListener('change', this.toggleTheme.bind(this));
        this.showSecondsToggle.addEventListener('change', this.toggleShowSeconds.bind(this));
        this.forceUSNumbersToggle.addEventListener('change', this.toggleForceUSNumbers.bind(this));
        
        // Update toggle labels
        this.updateToggleLabel();
    }
    
    toggleTheme() {
        if (this.themeToggle.checked) {
            // Switch to dark mode
            this.body.classList.remove('light-mode');
            this.currentTheme = 'dark';
            
            // Update GitHub logo
            document.querySelectorAll('.github-logo').forEach(logo => {
                if (logo.dataset.darkSrc) {
                    logo.src = logo.dataset.darkSrc;
                }
            });
        } else {
            // Switch to light mode
            this.body.classList.add('light-mode');
            this.currentTheme = 'light';
            
            // Update GitHub logo
            document.querySelectorAll('.github-logo').forEach(logo => {
                if (logo.dataset.lightSrc) {
                    logo.src = logo.dataset.lightSrc;
                }
            });
        }
        
        // Save the preference to localStorage
        localStorage.setItem('theme', this.currentTheme);
        
        // Update the toggle label
        this.updateToggleLabel();
    }
    
    toggleShowSeconds() {
        this.showSeconds = this.showSecondsToggle.checked;
        window.state.settings.showSeconds = this.showSeconds;
        localStorage.setItem('showSeconds', this.showSeconds);
        
        // Refresh the view to apply the new setting
        if (window.app && window.app.viewer) {
            window.app.viewer.reload();
        }
    }
    
    toggleForceUSNumbers() {
        this.forceUSNumbers = this.forceUSNumbersToggle.checked;
        window.state.settings.forceUSNumbers = this.forceUSNumbers;
        localStorage.setItem('forceUSNumbers', this.forceUSNumbers);
        
        // Refresh the view to apply the new setting
        if (window.app && window.app.viewer) {
            window.app.viewer.reload();
        }
    }
    
    updateToggleLabel() {
        const label = document.querySelector('label[for="themeToggle"]');
        if (this.currentTheme === 'dark') {
            label.innerHTML = '<i class="bi bi-moon-stars me-2"></i>Dark Mode';
        } else {
            label.innerHTML = '<i class="bi bi-sun me-2"></i>Light Mode (BETA)';
        }
    }
}

// Initialize the settings manager when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});