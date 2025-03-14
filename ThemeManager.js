class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.body = document.body;
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        
        this.init();
    }
    
    init() {
        // Set initial state based on saved preference
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
        
        // Add event listener to the toggle
        this.themeToggle.addEventListener('change', this.toggleTheme.bind(this));
        
        // Update the toggle label based on current theme
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
    
    updateToggleLabel() {
        const label = document.querySelector('label[for="themeToggle"]');
        if (this.currentTheme === 'dark') {
            label.innerHTML = '<i class="bi bi-moon-stars me-2"></i>Dark Mode';
        } else {
            label.innerHTML = '<i class="bi bi-sun me-2"></i>Light Mode (BETA)';
        }
    }
}

// Initialize the theme manager when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});