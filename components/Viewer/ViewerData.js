import Alert from '../Alert.js';
import TowerManager from '../../TowerComponents/TowerManager.js';

const ViewerData = {
    methods: {
        // brings in json data
        import(json, enableAlert) {
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
                
                // handling combined tower and units data
                if (importedData.master && importedData.slave) {
                    this.tower.importJSON(importedData.master);
                    Object.entries(importedData.slave).forEach(([unitName, unitData]) => {
                        this.unitManager.baseData[unitName] = unitData;
                    });
                    this.unitManager.save();
                } else if (importedData.tower && importedData.units) {
                    // legacy format
                    this.tower.importJSON(importedData.tower);
                    Object.entries(importedData.units).forEach(([unitName, unitData]) => {
                        this.unitManager.baseData[unitName] = unitData;
                    });
                    this.unitManager.save();
                } else {
                    // just tower data
                    this.tower.importJSON(importedData);
                }

                if (enableAlert) {
                    const alert = new Alert('JSON Imported!', {
                        alertStyle: 'alert-success',
                    });
                    alert.timeBeforeShow = 0.1;
                    alert.fire();
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

            this.reload();
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
            const towerManager = new TowerManager();
            const towerJSON = JSON.stringify(
                towerManager.towers[this.tower.name].json
            );

            this.deltaTower.importJSON(JSON.parse(towerJSON));
            this.tower.importJSON(JSON.parse(towerJSON));

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
