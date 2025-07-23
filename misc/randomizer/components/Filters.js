import { UI_ELEMENTS, appState } from "./Constants.js";
import {
  renderPreselectedTowers,
  renderExcludedMaps,
  renderExcludedTowers,
} from "./Render.js";

export function setupFilterHandlers(syncMobileControls) {
  UI_ELEMENTS.addPreselectTowerBtn.addEventListener("click", () => {
    const towerName = UI_ELEMENTS.preselectTowerInput.value.trim();
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
          UI_ELEMENTS.preselectTowerInput.value = "";
          syncMobileControls();
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

  UI_ELEMENTS.addExcludeMapBtn.addEventListener("click", () => {
    const mapName = UI_ELEMENTS.excludeMapInput.value.trim();
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
          UI_ELEMENTS.excludeMapInput.value = "";
          syncMobileControls();
        } else {
          alert(`"${map.name}" is already excluded or pre-selected.`);
        }
      } else {
        alert(`Map "${mapName}" not found.`);
      }
    }
  });

  UI_ELEMENTS.addExcludeTowerBtn.addEventListener("click", () => {
    const towerName = UI_ELEMENTS.excludeTowerInput.value.trim();
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
          UI_ELEMENTS.excludeTowerInput.value = "";
          syncMobileControls();
        } else {
          alert(`"${tower.name}" is already excluded or pre-selected.`);
        }
      } else {
        alert(`Tower "${towerName}" not found.`);
      }
    }
  });

  UI_ELEMENTS.clearFiltersBtn.addEventListener("click", () => {
    clearAllFilters();
    syncMobileControls();
  });
}

export function clearAllFilters() {
  UI_ELEMENTS.preselectMapDropdown.value = "random";
  UI_ELEMENTS.preselectModeDropdown.value = "random";

  appState.preselectedTowers = [];
  renderPreselectedTowers();

  appState.excludedMaps = [];
  renderExcludedMaps();

  appState.excludedTowers = [];
  renderExcludedTowers();

  UI_ELEMENTS.includeMapsToggle.checked = true;
  UI_ELEMENTS.includeLoadoutsToggle.checked = true;
  UI_ELEMENTS.includeGamemodesToggle.checked = true;
  UI_ELEMENTS.excludeExclusiveTowersToggle.checked = false;
  UI_ELEMENTS.excludeGoldenTowersToggle.checked = false;
  UI_ELEMENTS.excludeRemovedTowersToggle.checked = true;
}
