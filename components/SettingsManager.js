class SettingsManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.showSecondsToggle = document.getElementById('showSecondsToggle');
        this.forceUSNumbersToggle = document.getElementById('forceUSNumbersToggle');
        this.showCollapsibleCountsToggle = document.getElementById('showCollapsibleCountsToggle');
        this.animationsToggle = document.getElementById('animationsToggle');
        this.enableLuaViewerToggle = document.getElementById('enableLuaViewerToggle');
        this.animationsStylesheet = document.getElementById('animsCSS');
        this.body = document.body;
        
        // Initialize settings from localStorage
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.showSeconds = localStorage.getItem('showSeconds') !== 'false';
        this.forceUSNumbers = localStorage.getItem('forceUSNumbers') !== 'false';
        this.showCollapsibleCounts = localStorage.getItem('showCollapsibleCounts') !== 'false';
        this.animationsEnabled = localStorage.getItem('animationsEnabled') !== 'false';
        this.enableLuaViewer = localStorage.getItem('enableLuaViewer') === 'true'; 
        
        // Initialize state object if not already set
        window.state = window.state || {};
        window.state.settings = window.state.settings || {};
        window.state.settings.showSeconds = this.showSeconds;
        window.state.settings.forceUSNumbers = this.forceUSNumbers;
        window.state.settings.showCollapsibleCounts = this.showCollapsibleCounts;
        window.state.settings.animationsEnabled = this.animationsEnabled;
        window.state.settings.enableLuaViewer = this.enableLuaViewer; // Add this
        
        this.init();
    }
    
    init() {
        // Set initial theme state
        if (this.currentTheme === 'light') {
            this.body.classList.add('light-mode');
            this.themeToggle.checked = false;
        } else {
            this.body.classList.remove('light-mode');
            this.themeToggle.checked = true;
        }
        
        // Set initial anims state
        if (this.animationsStylesheet) {
            this.animationsStylesheet.disabled = !this.animationsEnabled;
        }
        
        this.animationsToggle.checked = !this.animationsEnabled;
        
        // Update theme aware images
        this.updateThemeImages();
        
        // Set initial seconds display state
        this.showSecondsToggle.checked = this.showSeconds;
        
        // Set initial number format state
        this.forceUSNumbersToggle.checked = this.forceUSNumbers;
        
        // Set initial collapsible counter state
        this.showCollapsibleCountsToggle.checked = this.showCollapsibleCounts;
        
        // Set initial lua viewer state
        if (this.enableLuaViewerToggle) {
            this.enableLuaViewerToggle.checked = this.enableLuaViewer;
        }
        
        // Add event listeners to the toggles
        this.themeToggle.addEventListener('change', this.toggleTheme.bind(this));
        this.showSecondsToggle.addEventListener('change', this.toggleShowSeconds.bind(this));
        this.forceUSNumbersToggle.addEventListener('change', this.toggleForceUSNumbers.bind(this));
        this.showCollapsibleCountsToggle.addEventListener('change', this.toggleShowCollapsibleCounts.bind(this));
        this.animationsToggle.addEventListener('change', this.toggleAnimations.bind(this));
        
        // Add event listener for Lua Viewer toggle
        if (this.enableLuaViewerToggle) {
            this.enableLuaViewerToggle.addEventListener('change', this.toggleEnableLuaViewer.bind(this));
        }
        
        // Update toggle labels
        this.updateToggleLabel();
        this.updateNumberFormatLabel();
    }
    
    toggleTheme() {
        if (this.themeToggle.checked) {
            // Switch to dark mode
            this.body.classList.remove('light-mode');
            this.currentTheme = 'dark';
        } else {
            // Switch to light mode
            this.body.classList.add('light-mode');
            this.currentTheme = 'light';
        }
        
        // Update theme aware images
        this.updateThemeImages();
        
        // Save the preference to localStorage
        localStorage.setItem('theme', this.currentTheme);
        
        // Update the toggle label
        this.updateToggleLabel();
    }
    
    toggleShowSeconds() {
        this.showSeconds = this.showSecondsToggle.checked;
        window.state.settings.showSeconds = this.showSeconds;
        localStorage.setItem('showSeconds', this.showSeconds);
        
        // dispatch settingsChanged event (found in TowerTable and UnitTable)
        document.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { setting: 'showSeconds', value: this.showSeconds }
        }));
    }
    
    toggleForceUSNumbers() {
        this.forceUSNumbers = this.forceUSNumbersToggle.checked;
        window.state.settings.forceUSNumbers = this.forceUSNumbers;
        localStorage.setItem('forceUSNumbers', this.forceUSNumbers);
        
        this.updateNumberFormatLabel();
        
        document.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { setting: 'forceUSNumbers', value: this.forceUSNumbers }
        }));
    }
    
    // Toggle method for collapsible counts (hopefully it works lmao)
    toggleShowCollapsibleCounts() {
        this.showCollapsibleCounts = this.showCollapsibleCountsToggle.checked;
        window.state.settings.showCollapsibleCounts = this.showCollapsibleCounts;
        localStorage.setItem('showCollapsibleCounts', this.showCollapsibleCounts);

        document.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { setting: 'showCollapsibleCounts', value: this.showCollapsibleCounts }
        }));
    }
    
    toggleAnimations() {
        this.animationsEnabled = !this.animationsToggle.checked;
        window.state.settings.animationsEnabled = this.animationsEnabled;
        localStorage.setItem('animationsEnabled', this.animationsEnabled);
        
        // toggles the css import
        if (this.animationsStylesheet) {
            this.animationsStylesheet.disabled = !this.animationsEnabled;
        }
        
        document.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { setting: 'animationsEnabled', value: this.animationsEnabled }
        }));
    }
    
    toggleEnableLuaViewer() {
        this.enableLuaViewer = this.enableLuaViewerToggle.checked;
        window.state.settings.enableLuaViewer = this.enableLuaViewer;
        localStorage.setItem('enableLuaViewer', this.enableLuaViewer);
        
        document.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { setting: 'enableLuaViewer', value: this.enableLuaViewer }
        }));
    }
    
    updateToggleLabel() {
        const label = document.querySelector('label[for="themeToggle"]');
        const icon = label.querySelector('.bi');
        const titleSpan = label.querySelector('.toru-title');
        const descriptionSpan = label.querySelector('.d-block.small.text-muted');
        
        if (this.currentTheme === 'dark') {
            icon.className = 'bi bi-moon-stars me-2 toru-icon';
            titleSpan.textContent = 'Dark Mode';
            descriptionSpan.textContent = 'Enjoy the darker side of the web';
        } else {
            icon.className = 'bi bi-sun me-2 toru-icon';
            titleSpan.textContent = 'Light Mode';
            descriptionSpan.textContent = 'Bathe in the light of the web';
        }
    }
    
    // handle all theme aware images
    updateThemeImages() {
        document.querySelectorAll('.theme-image').forEach(img => {
            if (this.currentTheme === 'light') {
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
        const titleSpan = label.querySelector('.toru-title');
        const descriptionSpan = label.querySelector('.d-block.small.text-muted');
        
        if (this.forceUSNumbers) {
            titleSpan.textContent = 'US Number Format';
            descriptionSpan.textContent = 'Format numbers as 1,234.56';
        } else {
            titleSpan.textContent = 'RU Number Format';
            descriptionSpan.textContent = 'Format numbers as 1 234,56';
        }
    }
}

// Initialize the settings manager when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});