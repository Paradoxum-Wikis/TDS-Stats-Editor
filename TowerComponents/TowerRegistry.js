export class TowerRegistry {
  static #instance; // singleton instance
  static debugMode = false; // toggle for debug logs
  #towerData = {}; // stores edited tower data

  constructor() {
    // ensure only one instance exists
    if (TowerRegistry.#instance) {
      return TowerRegistry.#instance;
    }
    TowerRegistry.#instance = this;
  }

  // helper to log stuff when debug mode is on
  static log(message, ...args) {
    if (TowerRegistry.debugMode) {
      console.log(`[TowerRegistry] ${message}`, ...args);
    }
  }

  // turn debug logging on/off
  static setDebugMode(enabled) {
    TowerRegistry.debugMode = enabled;
  }

  // update tower data when it's edited somewhere else
  updateTower(towerName, data) {
    TowerRegistry.log(`updating tower registry for ${towerName}`);
    // deep copy to prevent weird reference issues
    this.#towerData[towerName] = JSON.parse(JSON.stringify(data));

    // let other parts know the tower data changed
    document.dispatchEvent(
      new CustomEvent("towerDataChanged", {
        detail: { tower: towerName },
      }),
    );
  }

  // get the currently stored data for a tower
  getTower(towerName) {
    return this.#towerData[towerName] || null;
  }

  // calculate the total cost for a tower up to a specific level
  getTowerCostForLevel(towerName, level) {
    const towerData = this.getTower(towerName);
    if (!towerData) return null; // no data stored for this tower

    try {
      // data is nested under the tower name
      const towerInfo = towerData[towerName];
      if (!towerInfo || !towerInfo.Default || !towerInfo.Default.Defaults) {
        TowerRegistry.log(`invalid tower data structure for ${towerName}`);
        return null;
      }

      // start with the base price
      let price = towerInfo.Default.Defaults.Price;
      TowerRegistry.log(`registry base price for ${towerName}: ${price}`);

      // add costs for each upgrade up to the requested level
      if (level > 0 && towerInfo.Default.Upgrades) {
        for (
          let i = 0;
          i < level && i < towerInfo.Default.Upgrades.length;
          i++
        ) {
          // make sure the upgrade has a cost defined
          const upgradeCost = towerInfo.Default.Upgrades[i]?.Cost || 0;
          price += upgradeCost;
          TowerRegistry.log(
            `registry after adding level ${i + 1} cost (${upgradeCost}): ${price}`,
          );
        }
      }

      TowerRegistry.log(
        `registry final price for ${towerName} level ${level}: ${price}`,
      );
      return price;
    } catch (e) {
      console.error(`failed to get tower cost from registry:`, e);
      return null;
    }
  }
}

// create the single instance for export
export const towerRegistry = new TowerRegistry();

// check if debug mode was enabled last time
if (localStorage.getItem("towerRegistryDebug") === "true") {
  TowerRegistry.setDebugMode(true);
}

// listen for settings changes to toggle debug mode
document.addEventListener("settingsChanged", (event) => {
  if (event.detail.setting === "towerRegistryDebug") {
    TowerRegistry.setDebugMode(event.detail.value);
  }
});
