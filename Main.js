import App from './App.js';
import { UpdateLog } from './components/UpdateLog.js';
import SidebarToggle from './components/SidebarToggle.js';
import MobileNav from './components/MobileNav.js';
import CalcSystemUI from './components/CalcSystemUI.js';
import StorageManager from './components/StorageManager.js';
import KeyboardNavigation from './components/KeyboardNavigation.js';
import { setVersionNumber, loadUpdateLog } from './components/UIHelpers.js';
import { clearUrlAndShowLanding } from './components/TowerLoader.js';

const TDSVersion = '1.61.3'; // change GAME version number here

window.clearUrlAndShowLanding = clearUrlAndShowLanding;

// Initialize app
const app = new App();
app.start();

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI components
    new UpdateLog();
    setVersionNumber(TDSVersion);
    new SidebarToggle();
    new CalcSystemUI();
    new StorageManager();
    
    // Load mobile navigation
    const mobileNav = new MobileNav();
    window.mobileNav = mobileNav;
    
    // Load update log
    loadUpdateLog();

    // Keyboard navigation
    new KeyboardNavigation();
    
    // listens for calculation system changes
    document.addEventListener('calculationSystemChanged', (e) => {
        if (e.detail.tower) {
            app.reload();
        }
    });
});