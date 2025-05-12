import App from "./App.js";
import { UpdateLog } from "./components/UpdateLog.js";
import SidebarToggle from "./components/SidebarToggle.js";
import MobileNav from "./components/MobileNav.js";
import CalcSystemUI from "./components/CalcSystemUI.js";
import StorageManager from "./components/StorageManager.js";
import KeyboardNavigation from "./components/KeyboardNavigation.js";
import { setVersionNumber, loadUpdateLog } from "./components/UIHelpers.js";
import { clearUrlAndShowLanding } from "./components/TowerLoader.js";
import Consent from "./components/Consent.js";

const TDSVersion = "1.63.0"; // change GAME version number here

window.clearUrlAndShowLanding = clearUrlAndShowLanding;

const app = new App();
app.start();

document.addEventListener("DOMContentLoaded", () => {
  new UpdateLog();
  new SidebarToggle();
  new CalcSystemUI();
  new StorageManager();
  new KeyboardNavigation();
  new Consent();

  const mobileNav = new MobileNav();
  window.mobileNav = mobileNav;

  loadUpdateLog();
  setVersionNumber(TDSVersion);

  document.addEventListener("calculationSystemChanged", (e) => {
    if (e.detail.tower) {
      app.reload();
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-tooltip="true"]'),
  );
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
