export const appState = {
  allMaps: [],
  allTowers: [],
  allModes: [],
  preselectedTowers: [],
  excludedMaps: [],
  excludedTowers: [],

  lastSelectedMap: null,
  lastSelectedMode: null,
  lastFinalTowers: [],

  isInitialLoadFromUrl: false,
  activeMobileSection: null,
};

export const UI_ELEMENTS = {
  randomizeBtn: document.getElementById("randomize-btn"),
  copyResultBtn: document.getElementById("copy-result-btn"),
  clearFiltersBtn: document.getElementById("clear-filters-btn"),
  includeMapsToggle: document.getElementById("includeMapsToggle"),
  includeLoadoutsToggle: document.getElementById("includeLoadoutsToggle"),
  includeGamemodesToggle: document.getElementById("includeGamemodesToggle"),
  randomizedResultsContainer: document.getElementById(
    "randomized-results-container",
  ),
  mapGalleryContainer: document.getElementById("map-gallery"),
  towerGalleryContainer: document.getElementById("tower-gallery"),

  preselectMapDropdown: document.getElementById("preselectMap"),
  preselectModeDropdown: document.getElementById("preselectMode"),
  preselectTowerInput: document.getElementById("preselectTowerInput"),
  addPreselectTowerBtn: document.getElementById("addPreselectTowerBtn"),
  preselectedTowersContainer: document.getElementById(
    "preselectedTowersContainer",
  ),
  preselectedTowerCountSpan: document.getElementById("preselectedTowerCount"),
  towerDatalist: document.getElementById("tower-datalist"),

  excludeMapInput: document.getElementById("excludeMapInput"),
  addExcludeMapBtn: document.getElementById("addExcludeMapBtn"),
  excludedMapsContainer: document.getElementById("excludedMapsContainer"),
  excludedMapCountSpan: document.getElementById("excludedMapCount"),
  mapDatalist: document.getElementById("map-datalist"),

  excludeTowerInput: document.getElementById("excludeTowerInput"),
  addExcludeTowerBtn: document.getElementById("addExcludeTowerBtn"),
  excludedTowersContainer: document.getElementById("excludedTowersContainer"),
  excludedTowerCountSpan: document.getElementById("excludedTowerCount"),

  mobileSidebar: document.querySelector(".mobile-sidebar"),
  mobileSidebarContent: document.querySelector(".mobile-sidebar-content"),
  mobileNavBtns: document.querySelectorAll(".mobile-nav-btn"),
  originalSidebar: document.querySelector(".aside"),
  aboutModal: document.getElementById("about-modal"),
  settingsModal: document.getElementById("settings-modal"),
};
