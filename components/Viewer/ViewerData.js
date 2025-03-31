import Alert from '../Alert.js';
import TowerManager from '../../TowerComponents/TowerManager.js';

const ViewerData = {
    methods: {
        // brings in json data
        import(json, enableAlert, noCustomAlert = false) {
            enableAlert = enableAlert ?? false;
            
            const oldJSON = JSON.parse(JSON.stringify(this.tower.json));
            const oldUnits = {};
            
            // saving current unit data just in case (i think)
            if (this.activeUnits) {
                Object.entries(this.activeUnits).forEach(([unitName, _]) => {
                    if (this.unitManager.baseData[unitName]) {
                        oldUnits[unitName] = JSON.parse(JSON.stringify(this.unitManager.baseData[unitName]));
                    }
                });
            }
            
            try {
                const importedData = JSON.parse(json);
                let isCustomTower = false;
                let towerName = "";
                let newTowerData = null;
                
                if (importedData.master && importedData.slave) {
                    // get the imported master data to get the tower name
                    newTowerData = importedData.master;
                    
                    for (const [key] of Object.entries(importedData.master)) {
                        towerName = key;
                        break;
                    }
                } else if (importedData.tower && importedData.units) {
                    // legacy format
                    newTowerData = importedData.tower;

                    for (const [key] of Object.entries(importedData.tower)) {
                        towerName = key;
                        break;
                    }
                } else {
                    // just tower data
                    newTowerData = importedData;

                    for (const [key] of Object.entries(importedData)) {
                        towerName = key;
                        break;
                    }
                }
                
                // check if it's a custom tower by comparing the tower name with the default tower names
                const defaultManager = new TowerManager();
                isCustomTower = !defaultManager.towerData.hasOwnProperty(towerName);
                
                if (isCustomTower) {
                    const originalName = towerName;
                    
                    let renamedTowerData = {};
                    renamedTowerData[originalName] = JSON.parse(JSON.stringify(newTowerData[originalName]));
                    
                    this.addNewTower(originalName, renamedTowerData[originalName]);
                    
                    if (!window.originalCustomTowers) {
                        window.originalCustomTowers = {};
                    }

                    window.originalCustomTowers[originalName] = JSON.parse(JSON.stringify(newTowerData));

                    if (importedData.slave || importedData.units) {
                        const slaveData = importedData.slave || importedData.units;
                        const skinName = this.towerVariants.getSelectedName();
                        
                        if (!window.originalCustomUnits) {
                            window.originalCustomUnits = {};
                        }

                        Object.entries(slaveData).forEach(([unitName, unitData]) => {
                            // add metadata to track which tower this unit belongs to
                            unitData._towerName = originalName;
                            unitData._skinName = skinName;
                            
                            // store the original import state
                            window.originalCustomUnits[unitName] = JSON.parse(JSON.stringify(unitData));
                            
                            this.unitManager.baseData[unitName] = unitData;
                            
                            this.unitDeltaManager.baseData[unitName] = JSON.parse(JSON.stringify(unitData));
                            
                            // apply changes automatically
                            this.unitDeltaManager.unitData[unitName] = JSON.parse(JSON.stringify(unitData));
                        });
                        
                        this.unitManager.save();
                        this.unitDeltaManager.save();
                    }
                    
                    this.reload();
                    
                    this.deltaTower.importJSON(JSON.parse(JSON.stringify(this.tower.json)));
                    
                    if (!noCustomAlert) {
                        const alert = new Alert(`Custom tower "${originalName}" imported!`, {
                            alertStyle: 'alert-success',
                        });
                        alert.timeBeforeShow = 0.1;
                        alert.fire();
                    }
                    
                    return;
                } else {
                    // non custom towers
                    this.tower.importJSON(newTowerData);
                    
                    if (importedData.slave || importedData.units) {
                        const slaveData = importedData.slave || importedData.units;
                        const skinName = this.towerVariants.getSelectedName();
                        
                        Object.entries(slaveData).forEach(([unitName, unitData]) => {
                            unitData._towerName = towerName;
                            unitData._skinName = skinName;
                            this.unitManager.baseData[unitName] = unitData;
                        });
                        
                        this.unitManager.save();
                    }
                    
                    this.reload();
                    
                    if (enableAlert) {
                        const alert = new Alert('Statistics imported!', {
                            alertStyle: 'alert-success',
                        });
                        alert.timeBeforeShow = 0.1;
                        alert.fire();
                    }
                }
            } catch (e) {
                // oops, something went wrong, let's roll back
                this.tower.importJSON(oldJSON);
                if (Object.keys(oldUnits).length > 0) {
                    Object.entries(oldUnits).forEach(([unitName, unitData]) => {
                        this.unitManager.baseData[unitName] = unitData;
                    });
                    this.unitManager.save();
                }
                
                const alert = new Alert('Unable to load that.', {
                    alertStyle: 'alert-danger',
                });
                alert.timeBeforeShow = 0.1;
                alert.alertTimeInSeconds = 1;
                alert.fire();
                console.error(e);
            }
        },

        // saves json to a file
        export(json) {
            const filename = `${this.tower.name}-stats.json`;
            this.downloadFile(json, filename);
        },

        // exports tower and units together
        exportTowerWithUnits() {
            const combinedData = this._getCombinedData();
            const filename = `${this.tower.name}-full.json`;
            const json = JSON.stringify(combinedData, null, 2);
            this.downloadFile(json, filename);
        },

        // applies json changes
        apply(json) {
            const towerData = JSON.parse(json);
            this.deltaTower.importJSON(towerData);

            this.reload();
        },

        // resets tower to default
        reset() {
            // avoid creating new managers and reuse existing ones
            const defaultTowerManager = window.cachedDefaultTowerManager || new TowerManager();
            if (!window.cachedDefaultTowerManager) window.cachedDefaultTowerManager = defaultTowerManager;
            
            const isCustomTower = !defaultTowerManager.towerData.hasOwnProperty(this.tower.name);
            
            if (isCustomTower) {
                if (window.originalCustomTowers && window.originalCustomTowers[this.tower.name]) {
                    const originalData = typeof structuredClone !== 'undefined' 
                        ? structuredClone(window.originalCustomTowers[this.tower.name])
                        : JSON.parse(JSON.stringify(window.originalCustomTowers[this.tower.name]));
                        
                    this.tower.importJSON(originalData);
                    this.deltaTower.importJSON(originalData);
                    
                    this.reload();
                    return;
                }
                return;
            }
            
            // for non custom towers just reset to default
            const towerData = defaultTowerManager.towers[this.tower.name].json;
            
            const towerDataCopy = typeof structuredClone !== 'undefined'
                ? structuredClone(towerData) 
                : JSON.parse(JSON.stringify(towerData));
            
            this.deltaTower.importJSON(towerDataCopy);
            this.tower.importJSON(towerDataCopy);

            this.reload();
        },

        // wipes all unit changes
        clearUnitChanges() {
            localStorage.removeItem(this.unitManager.dataKey);
            localStorage.removeItem(this.unitDeltaManager.dataKey);
            this.reload();
        },

        // adds a new tower
        addNewTower(name, json) {
            this.app.towerManager.addTower(name, json);
            this.deltaTowerManager.addTower(name, json);
            this.defaultTowerManager.addTower(name, json);

            this.app.addTowerOption(name);

            this.load(this.defaultTowerManager.towers[name]);
        },

        _getCombinedData() {
            this.activeUnits = this.populateActiveUnits();
            const combinedData = {
                master: this.tower.json,
                slave: {}
            };
            Object.entries(this.activeUnits).forEach(([unitName, _]) => {
                combinedData.slave[unitName] = this.unitManager.baseData[unitName];
            });
            return combinedData;
        }
    }
};

export default ViewerData;
