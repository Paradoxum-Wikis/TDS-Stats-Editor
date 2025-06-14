import Tower from "./Tower.js";
import TowerData from "./TowerData.js";

class TowerManager {
  constructor(dataKey) {
    this.dataKey = dataKey;
    this.towerData = this.getTowerData();

    this.towerNames = this.parseTowerNames(this.towerData);
    this.towers = this.parseTowers(this.towerData);
  }

  getDefault() {
    return JSON.parse(JSON.stringify(TowerData));
  }

  loadLocalData(localData) {
    const loadedLocal = JSON.parse(localData);
    const loadedStatic = JSON.parse(JSON.stringify(TowerData));

    for (let [key, value] of Object.entries(loadedStatic)) {
      if (key in loadedLocal) {
        loadedLocal[key] = this.mergeDefaultProperties(loadedLocal[key], value);
      } else {
        loadedLocal[key] = value;
      }
    }

    return loadedLocal;
  }

  // merge default properties while preserving user customizations
  mergeDefaultProperties(localTowerData, defaultTowerData) {
    const merged = JSON.parse(JSON.stringify(localTowerData));
    
    // For each skin variant (Default, Golden, etc.)
    for (const [skinName, skinData] of Object.entries(defaultTowerData)) {
      if (!merged[skinName]) {
        merged[skinName] = JSON.parse(JSON.stringify(skinData));
        continue;
      }
      
      // merge Defaults section
      if (skinData.Defaults && merged[skinName].Defaults) {
        for (const [prop, value] of Object.entries(skinData.Defaults)) {
          if (!(prop in merged[skinName].Defaults)) {
            merged[skinName].Defaults[prop] = value;
          }
        }
        
        // merge new attributes
        if (skinData.Defaults.Attributes && merged[skinName].Defaults.Attributes) {
          for (const [attr, value] of Object.entries(skinData.Defaults.Attributes)) {
            if (!(attr in merged[skinName].Defaults.Attributes)) {
              merged[skinName].Defaults.Attributes[attr] = value;
            }
          }
        }
      }
      
      // Merge new upgrades
      if (skinData.Upgrades && Array.isArray(skinData.Upgrades)) {
        if (!merged[skinName].Upgrades) {
          merged[skinName].Upgrades = [];
        }
        
        // If default has more upgrades than local - add the new ones
        if (skinData.Upgrades.length > merged[skinName].Upgrades.length) {
          for (let i = merged[skinName].Upgrades.length; i < skinData.Upgrades.length; i++) {
            merged[skinName].Upgrades[i] = JSON.parse(JSON.stringify(skinData.Upgrades[i]));
          }
        }
        
        // update existing upgrades with new properties
        for (let i = 0; i < Math.min(merged[skinName].Upgrades.length, skinData.Upgrades.length); i++) {
          if (skinData.Upgrades[i].Stats?.Attributes) {
            if (!merged[skinName].Upgrades[i].Stats) {
              merged[skinName].Upgrades[i].Stats = {};
            }
            if (!merged[skinName].Upgrades[i].Stats.Attributes) {
              merged[skinName].Upgrades[i].Stats.Attributes = {};
            }
            
            // this adds new attributes to upgrade levels
            for (const [attr, value] of Object.entries(skinData.Upgrades[i].Stats.Attributes)) {
              if (!(attr in merged[skinName].Upgrades[i].Stats.Attributes)) {
                merged[skinName].Upgrades[i].Stats.Attributes[attr] = value;
              }
            }
          }
        }
      }
    }
    
    return merged;
  }

  getTowerData() {
    const localData = localStorage.getItem(this.dataKey);

    return localData ? this.loadLocalData(localData) : this.getDefault();
  }

  addTower(name, json) {
    this.towerData[name] = json;

    this.towerNames = this.parseTowerNames(this.towerData);
    const towerData = new Tower(name, json, this.getUnitKey());
    this.towers[name] = towerData;
    this.saveTower(towerData);
  }

  #unique(arrayA, arrayB) {
    return [...new Set([...arrayA, ...arrayB])];
  }

  getAllAttributes() {
    const attributes = Object.values(this.towers).reduce(
      (a, v) => this.#unique(a, v.attributes),
      [],
    );

    return [...new Set(attributes)];
  }

  getTypeForAttribute(attributeName) {
    for (const tower of Object.values(this.towers)) {
      if (!tower.attributes.includes(attributeName)) continue;

      return tower.getAttributeType(attributeName);
    }
  }

  getAttributeLocation(attributeName) {
    for (const tower of Object.values(this.towers)) {
      if (!tower.attributes.includes(attributeName)) continue;

      return tower.getAttributeLocation(attributeName);
    }
  }

  getOccurrencesForAttribute(attributeName) {
    const attributes = Object.values(this.towers).reduce(
      (a, v) => this.#unique(a, v.getOccurrencesForAttribute(attributeName)),
      [],
    );

    return [...new Set(attributes)];
  }
  parseTowerNames(towerData) {
    return Object.keys(towerData).sort((a, b) => a > b);
  }

  getUnitKey() {
    if (!this.dataKey) return "units";

    switch (this.dataKey) {
      case "delta":
        return "unitDeltas";
      case "new":
      case "default":
      default:
        return "units";
    }
  }

  parseTowers(towerData) {
    return Object.entries(towerData).reduce(
      (towers, [towerName, towerData]) => {
        towers[towerName] = new Tower(towerName, towerData, this.getUnitKey());

        return towers;
      },
      {},
    );
  }

  saveTower(tower) {
    if (!this.dataKey) return;

    this.towerData[tower.name] = tower.json[tower.name];
    this.save();
  }

  save() {
    if (!this.dataKey) return;

    localStorage.setItem(this.dataKey, JSON.stringify(this.towerData));
  }
}

export default TowerManager;
