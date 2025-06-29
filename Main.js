import "./Styles/bootstrap.css";
import "./Styles/Dashboard.css";
import "./Styles/Sidebars.css";
import "./Styles/json-viewer.css";
import "./Styles/torus.css";
import "./Styles/theme.css";
import "./Styles/MobileNav.css";
import "./Styles/Consent.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import "./components/ButtonSelection.js";
import App from "./components/App.js";
import { UpdateLog } from "./components/News/UpdateLog.js";
import SidebarToggle from "./components/SidebarToggle.js";
import MobileNav from "./components/MobileNav.js";
import CalcSystemUI from "./components/CalcSystemUI.js";
import StorageManager from "./components/StorageManager.js";
import KeyboardNavigation from "./components/KeyboardNavigation.js";
import TowerImportHandler from "./components/TowerImportHandler.js";
import {
  setVersionNumber,
  loadUpdateLog,
} from "./components/News/UIHelpers.js";
import { clearUrlAndShowLanding } from "./components/TowerLoader.js";
import Consent from "./components/Consent.js";
import "./components/TableMode/JSONUploader.js";
import "./components/SettingsManager.js";
import "./components/TableMode/json-viewer.js";
import "./components/Consent.js";
import "./components/Slides.js";
import "./components/News/UpdateLog.js";
import "./components/News/HeadsUp.js";

// node modules
import * as bootstrap from "bootstrap";
import CryptoJS from "crypto-js";

const TDSVersion = "1.68.2"; // change GAME version number here

window.clearUrlAndShowLanding = clearUrlAndShowLanding;
window.bootstrap = bootstrap;
window.CryptoJS = CryptoJS;

import JSONViewerModule from "./components/TableMode/json-viewer.js";
window.JSONViewer = JSONViewerModule;

const app = new App();
window.app = app;
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

  const towerImportHandler = new TowerImportHandler();

  loadUpdateLog();
  setVersionNumber(TDSVersion);

  towerImportHandler.checkForPendingImport();

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
