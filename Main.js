import App from "./components/App.js";
import { UpdateLog } from "./components/News/UpdateLog.js";
import SidebarToggle from "./components/SidebarToggle.js";
import MobileNav from "./components/MobileNav.js";
import CalcSystemUI from "./components/CalcSystemUI.js";
import StorageManager from "./components/StorageManager.js";
import KeyboardNavigation from "./components/KeyboardNavigation.js";
import {
  setVersionNumber,
  loadUpdateLog,
} from "./components/News/UIHelpers.js";
import { clearUrlAndShowLanding } from "./components/TowerLoader.js";
import Consent from "./components/Consent.js";
import "./components/TableMode/JSONUploader.js";
import "./components/SettingsManager.js";
import "./components/TableMode/json-viewer.js";

// node modules
import * as bootstrap from "bootstrap";
import CryptoJS from "crypto-js";

const TDSVersion = "1.64.0"; // change GAME version number here

window.clearUrlAndShowLanding = clearUrlAndShowLanding;
window.bootstrap = bootstrap;
window.CryptoJS = CryptoJS;

import JSONViewerModule from "./components/TableMode/json-viewer.js";
window.JSONViewer = JSONViewerModule;

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
