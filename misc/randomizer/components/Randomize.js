import { UI_ELEMENTS, appState } from "./Constants.js";
import { getFilteredMapsForMode } from "../ModeMapExceptions.js";
import { renderRandomizedResult } from "./Render.js";
import { generateResultUrl } from "./url.js";

export function performRandomization() {
  let selectedMap = null;
  let selectedMode = null;
  let finalTowers = [];

  // check selectedMode (preselected or randomized)
  if (
    UI_ELEMENTS.includeGamemodesToggle.checked &&
    appState.allModes.length > 0
  ) {
    const preselectedModeName = UI_ELEMENTS.preselectModeDropdown.value;
    if (preselectedModeName !== "random") {
      selectedMode = appState.allModes.find(
        (m) => m.name === preselectedModeName,
      );
    } else {
      const randomIndex = Math.floor(Math.random() * appState.allModes.length);
      selectedMode = appState.allModes[randomIndex];
    }
  }

  // check selectedMap (preselected or randomized, then check mode exceptions+exclusions)
  if (UI_ELEMENTS.includeMapsToggle.checked && appState.allMaps.length > 0) {
    let availableMapsForRandomization = [...appState.allMaps];

    availableMapsForRandomization = availableMapsForRandomization.filter(
      (map) =>
        !appState.excludedMaps.some((exclMap) => exclMap.name === map.name),
    );

    const preselectedMapName = UI_ELEMENTS.preselectMapDropdown.value;
    if (preselectedMapName !== "random") {
      selectedMap = availableMapsForRandomization.find(
        (m) => m.name === preselectedMapName,
      );
      if (!selectedMap) {
        console.warn(
          `Pre-selected map "${preselectedMapName}" is excluded or not found. Falling back to random.`,
        );
        UI_ELEMENTS.preselectMapDropdown.value = "random";
      }
    } else {
      const allowedMapsByMode = getFilteredMapsForMode(
        selectedMode,
        availableMapsForRandomization,
      );
      if (allowedMapsByMode.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * allowedMapsByMode.length,
        );
        selectedMap = allowedMapsByMode[randomIndex];
      } else {
        console.warn(
          `No maps found for selected mode: ${selectedMode ? selectedMode.name : "N/A"} after exclusions. Randomizing from all non-excluded maps as fallback.`,
        );
        if (availableMapsForRandomization.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * availableMapsForRandomization.length,
          );
          selectedMap = availableMapsForRandomization[randomIndex];
        } else {
          console.error(
            "No maps available for randomization after all filters.",
          );
        }
      }
    }
  }

  // check finalTowers (preselected+randomized to fill slots, and check exclusions)
  if (
    UI_ELEMENTS.includeLoadoutsToggle.checked &&
    appState.allTowers.length > 0
  ) {
    finalTowers = [...appState.preselectedTowers];
    const loadoutSize = 5;

    let availableTowersForRandomization = appState.allTowers.filter(
      (tower) =>
        !finalTowers.some((pre) => pre.name === tower.name) &&
        !appState.excludedTowers.some(
          (exclTower) => exclTower.name === tower.name,
        ),
    );

    if (UI_ELEMENTS.excludeExclusiveTowersToggle.checked) {
      availableTowersForRandomization = availableTowersForRandomization.filter(
        (tower) => !tower.isExclusive,
      );
    }

    if (UI_ELEMENTS.excludeGoldenTowersToggle.checked) {
      availableTowersForRandomization = availableTowersForRandomization.filter(
        (tower) => !tower.isGolden,
      );
    }

    if (UI_ELEMENTS.excludeRemovedTowersToggle.checked) {
      availableTowersForRandomization = availableTowersForRandomization.filter(
        (tower) => !tower.isRemoved,
      );
    }

    for (let i = finalTowers.length; i < loadoutSize; i++) {
      if (availableTowersForRandomization.length === 0) {
        break;
      }
      const randomIndex = Math.floor(
        Math.random() * availableTowersForRandomization.length,
      );
      finalTowers.push(availableTowersForRandomization[randomIndex]);
      availableTowersForRandomization.splice(randomIndex, 1);
    }
  }

  appState.lastSelectedMap = selectedMap;
  appState.lastSelectedMode = selectedMode;
  appState.lastFinalTowers = finalTowers;

  renderRandomizedResult(
    appState.lastSelectedMap,
    appState.lastSelectedMode,
    appState.lastFinalTowers,
  );

  if (!appState.isInitialLoadFromUrl) {
    const resultUrl = generateResultUrl(
      appState.lastSelectedMap,
      appState.lastSelectedMode,
      appState.lastFinalTowers,
    );
    history.replaceState(null, "", resultUrl);
  }
}
