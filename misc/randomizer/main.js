import "../../Styles/bootstrap.css";
import "../../Styles/Dashboard.css";
import "../../Styles/torus.css";
import "../../Styles/theme.css";
import "./randomizer.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../components/SettingsManager.js";

import MapFetcher from "./MapFetcher.js";
import LoadoutFetcher from "./LoadoutFetcher.js";
import ModeFetcher from "./ModeFetcher.js";

import { UI_ELEMENTS } from "./components/Constants.js";
import { appState } from "./components/Constants.js";
import { showLoading, showError } from "./components/utils.js";
import {
  renderMapGallery,
  renderTowerGallery,
  renderPreselectedTowers,
  renderExcludedMaps,
  renderExcludedTowers,
} from "./components/Render.js";
import { populatePreselectionOptions } from "./components/Populator.js";
import { setupFilterHandlers } from "./components/Filters.js";
import { performRandomization } from "./components/Randomize.js";
import { generateResultUrl, applyUrlParameters } from "./components/url.js";
import {
  setupMobileNav,
  populateControlsSection,
  isSidebarOpen,
  closeSidebar,
} from "./components/MobileNav.js";

import * as bootstrap from "bootstrap";
document.addEventListener("DOMContentLoaded", function () {
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-tooltip="true"]'),
  );
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const mapFetcher = new MapFetcher();
  const loadoutFetcher = new LoadoutFetcher();
  const modeFetcher = new ModeFetcher();

  showLoading(UI_ELEMENTS.randomizedResultsContainer);
  showLoading(UI_ELEMENTS.mapGalleryContainer);
  showLoading(UI_ELEMENTS.towerGalleryContainer);

  try {
    const [maps, towers, modes] = await Promise.all([
      mapFetcher.fetchMaps(),
      loadoutFetcher.fetchTowers(),
      modeFetcher.fetchModes(),
    ]);
    appState.allMaps = maps;
    appState.allTowers = towers;
    appState.allModes = modes;

    if (
      appState.allMaps.length === 0 ||
      appState.allTowers.length === 0 ||
      appState.allModes.length === 0
    ) {
      showError(
        UI_ELEMENTS.randomizedResultsContainer,
        "Some data could not be loaded. Please check console for details.",
      );
    } else {
      UI_ELEMENTS.randomizedResultsContainer.innerHTML =
        '<p class="text-muted text-center mb-0">Click "Randomize!" to generate your challenge!</p>';
    }

    renderMapGallery(appState.allMaps);
    renderTowerGallery(appState.allTowers);
    populatePreselectionOptions();
    renderPreselectedTowers();
    renderExcludedMaps();
    renderExcludedTowers();

    applyUrlParameters();
  } catch (error) {
    showError(
      UI_ELEMENTS.randomizedResultsContainer,
      "Error fetching initial data.",
    );
    showError(UI_ELEMENTS.mapGalleryContainer, "Error loading maps.");
    showError(UI_ELEMENTS.towerGalleryContainer, "Error loading towers.");
    console.error("Initial data fetch error:", error);
  }

  UI_ELEMENTS.randomizeBtn.addEventListener("click", performRandomization);

  UI_ELEMENTS.copyResultBtn.addEventListener("click", async () => {
    if (
      !appState.lastSelectedMap &&
      !appState.lastSelectedMode &&
      appState.lastFinalTowers.length === 0
    ) {
      alert("Please randomize a challenge first!");
      return;
    }
    const resultUrl = generateResultUrl(
      appState.lastSelectedMap,
      appState.lastSelectedMode,
      appState.lastFinalTowers,
    );
    try {
      await navigator.clipboard.writeText(resultUrl);
      alert("Result URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy URL: ", err);
      alert("Failed to copy URL. Please copy manually:\n" + resultUrl);
    }
  });

  // mobile shit
  setupFilterHandlers(() => {
    if (isSidebarOpen() && appState.activeMobileSection === "controls") {
      populateControlsSection();
    }
  });

  setupMobileNav();

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768 && isSidebarOpen()) {
      closeSidebar();
    }
  });
});
