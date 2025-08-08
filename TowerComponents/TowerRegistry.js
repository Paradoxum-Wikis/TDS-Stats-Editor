export class TowerRegistry {
  static #instance;
  static debugMode = false;
  #towerData = {};

  constructor() {
    if (TowerRegistry.#instance) {
      return TowerRegistry.#instance;
    }
    TowerRegistry.#instance = this;
  }

  static log(message, ...args) {
    if (TowerRegistry.debugMode) {
      console.log(`[TowerRegistry] ${message}`, ...args);
    }
  }

  static setDebugMode(enabled) {
    TowerRegistry.debugMode = enabled;
  }

  // update tower data when it's edited somewhere else
  updateTower(towerName, data) {
    TowerRegistry.log(`updating tower registry for ${towerName}`);
    // deep copy to prevent weird reference issues
    this.#towerData[towerName] = JSON.parse(JSON.stringify(data));

    document.dispatchEvent(
      new CustomEvent("towerDataChanged", {
        detail: { tower: towerName },
      }),
    );
  }

  getTower(towerName) {
    return this.#towerData[towerName] || null;
  }

  getTowerCostForLevel(towerName, level, variant = "Default") {
    const towerData = this.getTower(towerName);
    if (!towerData) return null;

    try {
      const towerInfo = towerData[towerName];
      if (!towerInfo || !towerInfo[variant] || !towerInfo[variant].Defaults) {
        TowerRegistry.log(
          `invalid tower data structure for ${towerName} ${variant}`,
        );
        return null;
      }

      let price = towerInfo[variant].Defaults.Price;
      TowerRegistry.log(
        `registry base price for ${towerName} ${variant}: ${price}`,
      );

      if (level > 0 && towerInfo[variant].Upgrades) {
        for (
          let i = 0;
          i < level && i < towerInfo[variant].Upgrades.length;
          i++
        ) {
          const upgradeCost = towerInfo[variant].Upgrades[i]?.Cost || 0;
          price += upgradeCost;
          TowerRegistry.log(
            `registry after adding level ${i + 1} cost (${upgradeCost}): ${price}`,
          );
        }
      }

      TowerRegistry.log(
        `registry final price for ${towerName} ${variant} level ${level}: ${price}`,
      );
      return price;
    } catch (error) {
      TowerRegistry.log(`Error getting tower cost: ${error.message}`);
      return null;
    }
  }
}

export const towerRegistry = new TowerRegistry();

// check if debug mode was enabled last time
if (localStorage.getItem("towerRegistryDebug") === "true") {
  TowerRegistry.setDebugMode(true);
}

document.addEventListener("settingsChanged", (event) => {
  if (event.detail.setting === "towerRegistryDebug") {
    TowerRegistry.setDebugMode(event.detail.value);
  }
});
