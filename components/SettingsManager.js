class SettingsManager {
    constructor() {
        this.themeModeControl = document.getElementById('themeModeControl');
        this.themeToggle = document.getElementById('themeToggle');
        this.themeToggleLabel = document.querySelector('label[for="themeToggle"]');
        this.showSecondsToggle = document.getElementById('showSecondsToggle');
        this.forceUSNumbersToggle = document.getElementById('forceUSNumbersToggle');
        this.showCollapsibleCountsToggle = document.getElementById('showCollapsibleCountsToggle');
        this.animationsToggle = document.getElementById('animationsToggle');
        this.enableLuaViewerToggle = document.getElementById('enableLuaViewerToggle');
        this.animationsStylesheet = document.getElementById('animsCSS');
        this.body = document.body;
        this.systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

        this.themeMode = localStorage.getItem('themeMode') || 'auto';
        // get manual theme, if manual isn't set, use system theme
        this.theme = localStorage.getItem('theme') || (this.systemThemeQuery.matches ? 'dark' : 'light');

        this.updateCurrentTheme();

        this.showSeconds = localStorage.getItem('showSeconds') !== 'false';
        this.forceUSNumbers = localStorage.getItem('forceUSNumbers') !== 'false';
        this.showCollapsibleCounts = localStorage.getItem('showCollapsibleCounts') !== 'false';
        this.animationsEnabled = localStorage.getItem('animationsEnabled') !== 'false';
        this.enableLuaViewer = localStorage.getItem('enableLuaViewer') === 'true'; 
        
        window.state = window.state || {};
        window.state.settings = window.state.settings || {};
        window.state.settings.showSeconds = this.showSeconds;
        window.state.settings.forceUSNumbers = this.forceUSNumbers;
        window.state.settings.showCollapsibleCounts = this.showCollapsibleCounts;
        window.state.settings.animationsEnabled = this.animationsEnabled;
        window.state.settings.enableLuaViewer = this.enableLuaViewer; // Add this
        
        this.init();
    }

    // determines what theme it is
    updateCurrentTheme() {
        if (this.themeMode === 'auto') {
            this.currentTheme = this.systemThemeQuery.matches ? 'dark' : 'light';
        } else {
            this.currentTheme = this.theme;
        }
    }

    applyTheme() {
        this.body.classList.toggle('light-mode', this.currentTheme === 'light');
        this.updateThemeImages();
        if (this.themeToggle) {
            this.themeToggle.checked = (this.currentTheme === 'dark');
            this.updateToggleLabel();
        }
        if (this.themeModeControl) {
            this.themeModeControl.value = this.themeMode;
        }

        this.updateThemeToggleState();
    }

    updateThemeToggleState() {
        const isDisabled = (this.themeMode === 'auto');
        if (this.themeToggle) {
            this.themeToggle.disabled = isDisabled;
        }
        if (this.themeToggleLabel) {
            this.themeToggleLabel.closest('.toru-item')?.classList.toggle('disabled', isDisabled);
        }
    }


    handleSystemThemeChange() {
        if (this.themeMode === 'auto') {
            this.updateCurrentTheme();
            this.applyTheme();
        }
    }
    
    init() {
        if (this.themeModeControl) {
            this.themeModeControl.value = this.themeMode;
            this.themeModeControl.addEventListener('change', this.setThemeMode.bind(this));
        }

        this.applyTheme(); // this now handles theme application and toggle states

        if (this.themeMode === 'auto') {
            this.systemThemeQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
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
        
        // toggles listener
        this.themeToggle.addEventListener('change', this.toggleTheme.bind(this));
        this.showSecondsToggle.addEventListener('change', this.toggleShowSeconds.bind(this));
        this.forceUSNumbersToggle.addEventListener('change', this.toggleForceUSNumbers.bind(this));
        this.showCollapsibleCountsToggle.addEventListener('change', this.toggleShowCollapsibleCounts.bind(this));
        this.animationsToggle.addEventListener('change', this.toggleAnimations.bind(this));
        
        if (this.enableLuaViewerToggle) {
            this.enableLuaViewerToggle.addEventListener('change', this.toggleEnableLuaViewer.bind(this));
        }
        
        this.updateNumberFormatLabel();
    }

    // deal with theme mode selection
    setThemeMode(event) {
        const newMode = event.target.value;
        if (this.themeMode === newMode) return;

        // Remove/add system theme listener
        if (newMode === 'auto') {
            this.systemThemeQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
        } else {
            this.systemThemeQuery.removeEventListener('change', this.handleSystemThemeChange.bind(this));
        }

        this.themeMode = newMode;
        localStorage.setItem('themeMode', this.themeMode);

        this.updateCurrentTheme();
        this.applyTheme(); // reapply theme
    }

    // manual selection
    toggleTheme() {
        // shouldddd only function when themeMode is manual
        if (this.themeMode === 'manual') {
            this.theme = this.themeToggle.checked ? 'dark' : 'light';
            localStorage.setItem('theme', this.theme);
            this.updateCurrentTheme();
            this.applyTheme();
        }
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
    
    // updates the label for the manual theme toggle
    updateToggleLabel() {
        if (!this.themeToggleLabel) return;
        const icon = this.themeToggleLabel.querySelector('.bi');
        const titleSpan = this.themeToggleLabel.querySelector('.toru-title');
        const descriptionSpan = this.themeToggleLabel.querySelector('.d-block.small.text-muted');

        const displayTheme = this.currentTheme;

        if (displayTheme === 'dark') {
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
            const themeToUse = this.currentTheme;
            if (themeToUse === 'light') {
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