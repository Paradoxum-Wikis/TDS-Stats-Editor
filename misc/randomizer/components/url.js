import { UI_ELEMENTS, appState } from './Constants.js';
import { performRandomization } from './Randomize.js';
import { renderPreselectedTowers } from './Render.js';

export function generateResultUrl(map, mode, towers) {
  const params = new URLSearchParams();
  
  if (map) {
    params.set('map', map.name);
  }
  if (mode) {
    params.set('mode', mode.name);
  }
  if (towers && towers.length > 0) {
    const towerNames = towers.map(t => t.name);
    params.set('towers', btoa(JSON.stringify(towerNames))); 
  }
  
  const baseUrl = window.location.origin + window.location.pathname;
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

export function applyUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialMapName = urlParams.get('map');
  const initialModeName = urlParams.get('mode');
  const initialTowersEncoded = urlParams.get('towers');

  let paramsFound = false;

  if (initialMapName) {
    const mapFromUrl = appState.allMaps.find(m => m.name === initialMapName);
    if (mapFromUrl) {
      UI_ELEMENTS.preselectMapDropdown.value = initialMapName;
      UI_ELEMENTS.includeMapsToggle.checked = true;
      paramsFound = true;
    } else {
      console.warn(`Map "${initialMapName}" from URL not found. Falling back to random.`);
      UI_ELEMENTS.preselectMapDropdown.value = 'random';
    }
  } else {
    UI_ELEMENTS.preselectMapDropdown.value = 'random';
  }

  if (initialModeName) {
    const modeFromUrl = appState.allModes.find(m => m.name === initialModeName);
    if (modeFromUrl) {
      UI_ELEMENTS.preselectModeDropdown.value = initialModeName;
      UI_ELEMENTS.includeGamemodesToggle.checked = true;
      paramsFound = true;
    } else {
      console.warn(`Mode "${initialModeName}" from URL not found. Falling back to random.`);
      UI_ELEMENTS.preselectModeDropdown.value = 'random';
    }
  } else {
    UI_ELEMENTS.preselectModeDropdown.value = 'random';
  }

  if (initialTowersEncoded) {
    try {
      const decodedTowerNames = JSON.parse(atob(initialTowersEncoded));
      decodedTowerNames.forEach(towerName => {
        const tower = appState.allTowers.find(t => t.name === towerName);
        if (tower) {
          if (appState.preselectedTowers.length < 5 && !appState.preselectedTowers.some(t => t.name === tower.name)) {
            appState.preselectedTowers.push(tower);
            paramsFound = true;
          }
        } else {
          console.warn(`Tower "${towerName}" from URL not found.`);
        }
      });
      renderPreselectedTowers();
      if (appState.preselectedTowers.length > 0) {
        UI_ELEMENTS.includeLoadoutsToggle.checked = true;
      }
    } catch (e) {
      console.error("Failed to decode or parse towers from URL:", e);
    }
  }

  if (paramsFound) {
    appState.isInitialLoadFromUrl = true;
    performRandomization();
    appState.isInitialLoadFromUrl = false;
  }
}