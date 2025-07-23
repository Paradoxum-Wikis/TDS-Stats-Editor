import * as bootstrap from "bootstrap";
import { UI_ELEMENTS, appState } from "./Constants.js";
import { performRandomization } from "./Randomize.js";
import { generateResultUrl } from "./url.js";
import { clearAllFilters } from "./Filters.js";
import {
  renderPreselectedTowers,
  renderExcludedMaps,
  renderExcludedTowers,
} from "./Render.js";

export function setupMobileNav() {
  UI_ELEMENTS.mobileNavBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionName = btn.getAttribute("data-mobile-section");

      if (appState.activeMobileSection === sectionName && isSidebarOpen()) {
        closeSidebar();
        return;
      }

      openSection(sectionName);
    });
  });

  if (UI_ELEMENTS.mobileSidebar) {
    UI_ELEMENTS.mobileSidebar.addEventListener("click", (e) => {
      if (e.target === UI_ELEMENTS.mobileSidebar) {
        closeSidebar();
      }
    });
  }
}

function openSection(sectionName) {
  if (!sectionName) return;

  if (sectionName === "about") {
    closeSidebar();
    if (UI_ELEMENTS.aboutModal) {
      const bsModal = new bootstrap.Modal(UI_ELEMENTS.aboutModal);
      bsModal.show();
    }
    return;
  }

  if (sectionName === "settings") {
    closeSidebar();
    if (UI_ELEMENTS.settingsModal) {
      const bsModal = new bootstrap.Modal(UI_ELEMENTS.settingsModal);
      bsModal.show();
    }
    return;
  }

  if (sectionName === "controls") {
    populateControlsSection();
  }

  UI_ELEMENTS.mobileSidebar?.classList.add("active");
  document.body.classList.add("mobile-sidebar-open");
  updateActiveButton(sectionName);
  appState.activeMobileSection = sectionName;
}

export function populateControlsSection() {
  if (!UI_ELEMENTS.mobileSidebarContent || !UI_ELEMENTS.originalSidebar) return;

  const sidebarClone = UI_ELEMENTS.originalSidebar.cloneNode(true);
  sidebarClone.classList.remove("aside", "d-none", "d-md-flex");
  sidebarClone.classList.add("mobile-controls-section");
  sidebarClone.style.cssText =
    "width: 100%; height: auto; min-width: auto; overflow-y: visible;";

  UI_ELEMENTS.mobileSidebarContent.innerHTML = "";
  UI_ELEMENTS.mobileSidebarContent.appendChild(sidebarClone);

  setupClonedEventListeners(sidebarClone);
}

function setupClonedEventListeners(container) {
  // Syncs
  const clonedIncludeMapsToggle = container.querySelector("#includeMapsToggle");
  const clonedIncludeGamemodesToggle = container.querySelector(
    "#includeGamemodesToggle",
  );
  const clonedIncludeLoadoutsToggle = container.querySelector(
    "#includeLoadoutsToggle",
  );

  if (clonedIncludeMapsToggle) {
    clonedIncludeMapsToggle.checked = UI_ELEMENTS.includeMapsToggle.checked;
    clonedIncludeMapsToggle.addEventListener("change", (e) => {
      UI_ELEMENTS.includeMapsToggle.checked = e.target.checked;
    });
  }
  if (clonedIncludeGamemodesToggle) {
    clonedIncludeGamemodesToggle.checked =
      UI_ELEMENTS.includeGamemodesToggle.checked;
    clonedIncludeGamemodesToggle.addEventListener("change", (e) => {
      UI_ELEMENTS.includeGamemodesToggle.checked = e.target.checked;
    });
  }
  if (clonedIncludeLoadoutsToggle) {
    clonedIncludeLoadoutsToggle.checked =
      UI_ELEMENTS.includeLoadoutsToggle.checked;
    clonedIncludeLoadoutsToggle.addEventListener("change", (e) => {
      UI_ELEMENTS.includeLoadoutsToggle.checked = e.target.checked;
    });
  }

  const clonedPreselectMapDropdown = container.querySelector("#preselectMap");
  const clonedPreselectModeDropdown = container.querySelector("#preselectMode");

  if (clonedPreselectMapDropdown) {
    clonedPreselectMapDropdown.innerHTML =
      UI_ELEMENTS.preselectMapDropdown.innerHTML;
    clonedPreselectMapDropdown.value = UI_ELEMENTS.preselectMapDropdown.value;
    clonedPreselectMapDropdown.addEventListener("change", (e) => {
      UI_ELEMENTS.preselectMapDropdown.value = e.target.value;
    });
  }
  if (clonedPreselectModeDropdown) {
    clonedPreselectModeDropdown.innerHTML =
      UI_ELEMENTS.preselectModeDropdown.innerHTML;
    clonedPreselectModeDropdown.value = UI_ELEMENTS.preselectModeDropdown.value;
    clonedPreselectModeDropdown.addEventListener("change", (e) => {
      UI_ELEMENTS.preselectModeDropdown.value = e.target.value;
    });
  }

  const clonedPreselectedTowersContainer = container.querySelector(
    "#preselectedTowersContainer",
  );
  if (clonedPreselectedTowersContainer) {
    clonedPreselectedTowersContainer.innerHTML = "";
    appState.preselectedTowers.forEach((tower, index) => {
      const towerBadge = document.createElement("span");
      towerBadge.className =
        "badge bg-primary text-white d-flex align-items-center me-1 mb-1";
      towerBadge.innerHTML = `
        ${tower.name}
        <button type="button" class="btn-close btn-close-white ms-2" aria-label="Remove" data-index="${index}"></button>
      `;
      clonedPreselectedTowersContainer.appendChild(towerBadge);

      towerBadge.querySelector(".btn-close").addEventListener("click", (e) => {
        const idxToRemove = parseInt(e.target.dataset.index);
        appState.preselectedTowers.splice(idxToRemove, 1);
        renderPreselectedTowers();
        populateControlsSection();
      });
    });
    container.querySelector("#preselectedTowerCount").textContent =
      `${appState.preselectedTowers.length}/5 towers selected`;
  }

  const clonedExcludedMapsContainer = container.querySelector(
    "#excludedMapsContainer",
  );
  if (clonedExcludedMapsContainer) {
    clonedExcludedMapsContainer.innerHTML = "";
    appState.excludedMaps.forEach((map, index) => {
      const mapBadge = document.createElement("span");
      mapBadge.className =
        "badge bg-danger text-white d-flex align-items-center me-1 mb-1";
      mapBadge.innerHTML = `
        ${map.name}
        <button type="button" class="btn-close btn-close-white ms-2" aria-label="Remove" data-index="${index}"></button>
      `;
      clonedExcludedMapsContainer.appendChild(mapBadge);

      mapBadge.querySelector(".btn-close").addEventListener("click", (e) => {
        const idxToRemove = parseInt(e.target.dataset.index);
        appState.excludedMaps.splice(idxToRemove, 1);
        renderExcludedMaps();
        populateControlsSection();
      });
    });
    container.querySelector("#excludedMapCount").textContent =
      `${appState.excludedMaps.length} maps excluded`;
  }

  const clonedExcludedTowersContainer = container.querySelector(
    "#excludedTowersContainer",
  );
  if (clonedExcludedTowersContainer) {
    clonedExcludedTowersContainer.innerHTML = "";
    appState.excludedTowers.forEach((tower, index) => {
      const towerBadge = document.createElement("span");
      towerBadge.className =
        "badge bg-danger text-white d-flex align-items-center me-1 mb-1";
      towerBadge.innerHTML = `
        ${tower.name}
        <button type="button" class="btn-close btn-close-white ms-2" aria-label="Remove" data-index="${index}"></button>
      `;
      clonedExcludedTowersContainer.appendChild(towerBadge);

      towerBadge.querySelector(".btn-close").addEventListener("click", (e) => {
        const idxToRemove = parseInt(e.target.dataset.index);
        appState.excludedTowers.splice(idxToRemove, 1);
        renderExcludedTowers();
        populateControlsSection();
      });
    });
    container.querySelector("#excludedTowerCount").textContent =
      `${appState.excludedTowers.length} towers excluded`;
  }

  const clonedAddPreselectTowerBtn = container.querySelector(
    "#addPreselectTowerBtn",
  );
  const clonedPreselectTowerInput = container.querySelector(
    "#preselectTowerInput",
  );
  if (clonedAddPreselectTowerBtn && clonedPreselectTowerInput) {
    clonedAddPreselectTowerBtn.addEventListener("click", () => {
      const towerName = clonedPreselectTowerInput.value.trim();
      if (towerName && appState.preselectedTowers.length < 5) {
        const tower = appState.allTowers.find(
          (t) => t.name.toLowerCase() === towerName.toLowerCase(),
        );
        if (tower) {
          if (
            !appState.preselectedTowers.some(
              (t) => t.name.toLowerCase() === tower.name.toLowerCase(),
            ) &&
            !appState.excludedTowers.some(
              (t) => t.name.toLowerCase() === tower.name.toLowerCase(),
            )
          ) {
            appState.preselectedTowers.push(tower);
            renderPreselectedTowers();
            clonedPreselectTowerInput.value = "";
            populateControlsSection();
          } else {
            alert(`"${tower.name}" is already selected or excluded.`);
          }
        } else {
          alert(`Tower "${towerName}" not found.`);
        }
      } else if (appState.preselectedTowers.length >= 5) {
        alert("You can select a maximum of 5 towers.");
      }
    });
  }

  const clonedAddExcludeMapBtn = container.querySelector("#addExcludeMapBtn");
  const clonedExcludeMapInput = container.querySelector("#excludeMapInput");
  if (clonedAddExcludeMapBtn && clonedExcludeMapInput) {
    clonedAddExcludeMapBtn.addEventListener("click", () => {
      const mapName = clonedExcludeMapInput.value.trim();
      if (mapName) {
        const map = appState.allMaps.find(
          (m) => m.name.toLowerCase() === mapName.toLowerCase(),
        );
        if (map) {
          if (
            !appState.excludedMaps.some(
              (m) => m.name.toLowerCase() === map.name.toLowerCase(),
            ) &&
            UI_ELEMENTS.preselectMapDropdown.value.toLowerCase() !==
              map.name.toLowerCase()
          ) {
            appState.excludedMaps.push(map);
            renderExcludedMaps();
            clonedExcludeMapInput.value = "";
            populateControlsSection();
          } else {
            alert(`"${map.name}" is already excluded or pre-selected.`);
          }
        } else {
          alert(`Map "${mapName}" not found.`);
        }
      }
    });
  }

  const clonedAddExcludeTowerBtn = container.querySelector(
    "#addExcludeTowerBtn",
  );
  const clonedExcludeTowerInput = container.querySelector("#excludeTowerInput");
  if (clonedAddExcludeTowerBtn && clonedExcludeTowerInput) {
    clonedAddExcludeTowerBtn.addEventListener("click", () => {
      const towerName = clonedExcludeTowerInput.value.trim();
      if (towerName) {
        const tower = appState.allTowers.find(
          (t) => t.name.toLowerCase() === towerName.toLowerCase(),
        );
        if (tower) {
          if (
            !appState.excludedTowers.some(
              (t) => t.name.toLowerCase() === tower.name.toLowerCase(),
            ) &&
            !appState.preselectedTowers.some(
              (t) => t.name.toLowerCase() === tower.name.toLowerCase(),
            )
          ) {
            appState.excludedTowers.push(tower);
            renderExcludedTowers();
            clonedExcludeTowerInput.value = "";
            populateControlsSection();
          } else {
            alert(`"${tower.name}" is already excluded or pre-selected.`);
          }
        } else {
          alert(`Tower "${towerName}" not found.`);
        }
      }
    });
  }

  const clonedRandomizeBtn = container.querySelector("#randomize-btn");
  const clonedCopyResultBtn = container.querySelector("#copy-result-btn");
  const clonedClearFiltersBtn = container.querySelector("#clear-filters-btn");

  if (clonedRandomizeBtn) {
    clonedRandomizeBtn.addEventListener("click", () => {
      performRandomization();
      closeSidebar();
    });
  }
  if (clonedCopyResultBtn) {
    clonedCopyResultBtn.addEventListener("click", async () => {
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
      closeSidebar();
    });
  }
  if (clonedClearFiltersBtn) {
    clonedClearFiltersBtn.addEventListener("click", () => {
      clearAllFilters();
      closeSidebar();
    });
  }
}

function updateActiveButton(sectionName) {
  UI_ELEMENTS.mobileNavBtns.forEach((btn) => {
    const btnSection = btn.getAttribute("data-mobile-section");

    btn.classList.remove("active");
    const iconElement = btn.querySelector("i");

    if (btnSection === sectionName) {
      btn.classList.add("active");

      if (iconElement) {
        if (!iconElement.dataset.originalClass) {
          iconElement.dataset.originalClass = iconElement.className;
        }
        iconElement.className = "bi bi-x-lg";
      }
    } else {
      if (iconElement && iconElement.dataset.originalClass) {
        iconElement.className = iconElement.dataset.originalClass;
      }
    }
  });
}

export function closeSidebar() {
  UI_ELEMENTS.mobileSidebar?.classList.remove("active");
  document.body.classList.remove("mobile-sidebar-open");
  appState.activeMobileSection = null;
  UI_ELEMENTS.mobileNavBtns.forEach((btn) => {
    btn.classList.remove("active");
    const iconElement = btn.querySelector("i");
    if (iconElement && iconElement.dataset.originalClass) {
      iconElement.className = iconElement.dataset.originalClass;
    }
  });
}

export function isSidebarOpen() {
  return UI_ELEMENTS.mobileSidebar?.classList.contains("active");
}
