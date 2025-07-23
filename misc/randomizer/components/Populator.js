import { UI_ELEMENTS, appState } from './Constants.js';

export function populatePreselectionOptions() {
  // Map Dropdown
  UI_ELEMENTS.preselectMapDropdown.innerHTML = '<option value="random">Random Map</option>';
  appState.allMaps.forEach(map => {
    const option = document.createElement('option');
    option.value = map.name;
    option.textContent = map.name;
    UI_ELEMENTS.preselectMapDropdown.appendChild(option);
  });

  // Mode Dropdown
  UI_ELEMENTS.preselectModeDropdown.innerHTML = '<option value="random">Random Gamemode</option>';
  appState.allModes.forEach(mode => {
    const option = document.createElement('option');
    option.value = mode.name;
    option.textContent = mode.name;
    UI_ELEMENTS.preselectModeDropdown.appendChild(option);
  });

  // Tower Datalist autocomplete
  UI_ELEMENTS.towerDatalist.innerHTML = '';
  appState.allTowers.forEach(tower => {
    const option = document.createElement('option');
    option.value = tower.name;
    UI_ELEMENTS.towerDatalist.appendChild(option);
  });

  // Map Datalist autocomplete
  UI_ELEMENTS.mapDatalist.innerHTML = '';
  appState.allMaps.forEach(map => {
    const option = document.createElement('option');
    option.value = map.name;
    UI_ELEMENTS.mapDatalist.appendChild(option);
  });
}