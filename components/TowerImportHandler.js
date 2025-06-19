/**
 * TowerImportHandler.js
 * Lets user imports towers from /db
 */
import { loadTower } from "./TowerLoader.js";

class TowerImportHandler {
  constructor() {
    this.maxImportAge = 5 * 60 * 1000; // 5 minutes
  }

  checkForPendingImport() {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldImport = urlParams.get('import');
    
    if (shouldImport === 'pending') {
      const pendingImport = localStorage.getItem('pendingTowerImport');
      
      if (pendingImport) {
        try {
          const importData = JSON.parse(pendingImport);
          const now = Date.now();
          const importAge = now - importData.timestamp;
          
          if (importAge < this.maxImportAge && importData.source === 'database') {
            this.attemptImportWithRetry(importData);
          } else {
            localStorage.removeItem('pendingTowerImport');
          }
        } catch (error) {
          console.error('Failed to parse pending import:', error);
        }
      }
    }
  }

  attemptImportWithRetry(importData) {
    const attemptImport = () => {
      if (window.app && window.app.viewer) {
        if (!window.app.viewer.tower) {
          return this.loadDefaultTowerThenImport(importData);
        } else {
          return this.performDirectImport(importData);
        }
      }
      return false;
    };

    setTimeout(() => {
      if (!attemptImport()) {
        setTimeout(() => {
          if (!attemptImport()) {
            setTimeout(() => {
              attemptImport();
            }, 3000);
          }
        }, 2000);
      }
    }, 1000);
  }

  loadDefaultTowerThenImport(importData) {
    const firstTowerName = Object.keys(window.app.towerManager.towerData)[0];
    if (firstTowerName) {
      const defaultTower = window.app.towerManager.towers[firstTowerName];
      window.app.viewer.load(defaultTower);
      
      setTimeout(() => {
        if (window.app.viewer.tower) {
          this.performImport(importData);
        }
      }, 500);
      return true;
    }
    return false;
  }

  performDirectImport(importData) {
    try {
      this.performImport(importData);
      return true;
    } catch (importError) {
      console.error('Error during tower import:', importError);
      return false;
    }
  }

  performImport(importData) {
    try {
      const parsedData = JSON.parse(importData.data);
      let towerName;
      
      if (parsedData.master) {
        towerName = Object.keys(parsedData.master)[0];
      } else {
        towerName = Object.keys(parsedData)[0];
      }
      
      this.storeOriginalCustomTowerData(parsedData, towerName);
      this.markAsImportedCustomTower(towerName);
      this.dispatchImportEvent(importData);
      
      setTimeout(() => {
        this.loadImportedTowerInUI(towerName);
        this.cleanupAfterImport();
      }, 100);
      
    } catch (importError) {
      console.error('Error during tower import:', importError);
    }
  }

  storeOriginalCustomTowerData(parsedData, towerName) {
    if (!window.originalCustomTowers) {
      window.originalCustomTowers = {};
    }
    
    const towerData = parsedData.master?.[towerName] || parsedData[towerName];
    if (towerData) {
      window.originalCustomTowers[towerName] = 
        typeof structuredClone !== "undefined"
          ? structuredClone(towerData)
          : JSON.parse(JSON.stringify(towerData));
    }
  }

  markAsImportedCustomTower(towerName) {
    if (!window.importedCustomTowers) {
      window.importedCustomTowers = new Set();
    }
    window.importedCustomTowers.add(towerName);
  }

  dispatchImportEvent(importData) {
    const importEvent = new CustomEvent("towerDataImport", {
      detail: {
        data: importData.data,
        type: "json",
        source: "database"
      }
    });
    document.dispatchEvent(importEvent);
  }

  loadImportedTowerInUI(towerName) {    
    if (window.app.towerManager.towers[towerName]) {
      const tower = window.app.towerManager.towers[towerName];
      loadTower(tower, window.app.viewer);
    }
    
    const newUrl = `${window.location.pathname}?tower=${encodeURIComponent(towerName)}`;
    window.history.replaceState({}, document.title, newUrl);
  }

  cleanupAfterImport() {
    localStorage.removeItem('pendingTowerImport');
  }
}

export default TowerImportHandler;