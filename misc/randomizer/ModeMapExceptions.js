/**
 * Defines map restrictions based on the selected gamemode
 * @param {Object} selectedMode - The randomized gamemode object
 * @param {Array<Object>} allMaps - The full list of all available maps
 * @returns {Array<Object>} A filtered list of maps allowed for the given mode
 */
export function getFilteredMapsForMode(selectedMode, allMaps) {
  if (!selectedMode || !allMaps || allMaps.length === 0) {
    return [];
  }

  if (selectedMode.type === "special") {
    return allMaps.filter((map) => map.name === selectedMode.name);
  }

  if (selectedMode.name === "Hardcore") {
    return allMaps.filter((map) => map.tableNumber === 4); // table 4 is from its location on the wiki
  }

  return allMaps;
}
