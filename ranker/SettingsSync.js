/**
 * SettingsSync.js
 * Syncs preferences from the main Statistics Editor (localStorage) to the Ranker.
 */

const ThemeSync = {
    THEME_KEY: 'theme',
    THEME_MODE_KEY: 'themeMode',
    ANIMATIONS_KEY: 'animationsEnabled',
    systemThemeQuery: window.matchMedia('(prefers-color-scheme: dark)'),

    applyTheme() {
        const theme = localStorage.getItem(this.THEME_KEY) || 'dark';
        const themeMode = localStorage.getItem(this.THEME_MODE_KEY) || 'auto';
        const animationsEnabled = localStorage.getItem(this.ANIMATIONS_KEY);

        let effectiveTheme = theme;
        if (themeMode === 'auto') {
            effectiveTheme = this.systemThemeQuery.matches ? 'dark' : 'light';
        }

        if (effectiveTheme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }

        const themeModeControl = document.getElementById('themeModeControl');
        if (themeModeControl) {
            themeModeControl.value = themeMode;
        }

        const animsCSS = document.getElementById('animsCSS');
        if (animsCSS) {
            animsCSS.disabled = (animationsEnabled === 'false');
        }
    },

    listenForChanges() {
        window.addEventListener('storage', (event) => {
            if (
                event.key === this.THEME_KEY ||
                event.key === this.THEME_MODE_KEY ||
                event.key === this.ANIMATIONS_KEY
            ) {
                this.applyTheme();
                this.updateSystemThemeListener();
            }
        });
    },

    updateSystemThemeListener() {
        if (this._systemThemeListener) {
            this.systemThemeQuery.removeEventListener('change', this._systemThemeListener);
            this._systemThemeListener = null;
        }
        const themeMode = localStorage.getItem(this.THEME_MODE_KEY) || 'auto';
        if (themeMode === 'auto') {
            this._systemThemeListener = () => this.applyTheme();
            this.systemThemeQuery.addEventListener('change', this._systemThemeListener);
        }
    },

    init() {
        this.applyTheme();
        this.listenForChanges();
        this.updateSystemThemeListener();
    }
};

ThemeSync.init();