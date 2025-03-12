import UnitManager from '../../TowerComponents/UnitManager.js';
import TowerManager from '../../TowerComponents/TowerManager.js'; // Add this import

const ViewerTable = {
    methods: {
        // loads the table view
        loadTable() {
            // clear old wikitable boxes before a fresh start
            const existingContainers = this.towerTable.root.parentElement.querySelectorAll('.wikitable-container');
            existingContainers.forEach(container => container.remove());
            
            this.activeUnits = this.populateActiveUnits();

            this.towerTable.root.parentElement.classList.remove('d-none');
            
            // unit table shows up in table view
            if (this.unitTable && this.unitTable.root) {
                this.unitTable.root.classList.remove('d-none');
            }

            const skinData = this.getActiveSkin();
            this.propertyViewer.createButtons([
                ...skinData.levels.attributes,
                ...skinData.levels.complexAttributes,
            ]);

            this.towerTable.load(skinData, {
                ignore: this.propertyViewer.disabled
            });

            this.unitTable.load(this.activeUnits);
        },

        // updates unit table data
        applyUnitTable() {
            Object.entries(this.activeUnits).forEach(([unitName, unitData]) => {
                this.unitDeltaManager.baseData[unitName] = unitData.data;
            });

            this.unitDeltaManager.save();

            this.reload();
        },

        // resets unit table to default
        resetUnitTable() {
            const defaultUnitManager = new UnitManager();
            const defaultTowerManager = new TowerManager();
            
            const isCustomTower = !defaultTowerManager.towerData.hasOwnProperty(this.tower.name);
            
            Object.entries(this.activeUnits).forEach(([unitName, _]) => {
                if (isCustomTower || !defaultUnitManager.baseData[unitName]) {
                    if (this.unitManager.baseData[unitName]) {
                        if (window.originalCustomUnits && window.originalCustomUnits[unitName]) {
                            this.unitManager.baseData[unitName] = 
                                JSON.parse(JSON.stringify(window.originalCustomUnits[unitName]));
                            this.unitDeltaManager.baseData[unitName] = 
                                JSON.parse(JSON.stringify(window.originalCustomUnits[unitName]));
                        } else {
                            this.unitDeltaManager.baseData[unitName] = 
                                JSON.parse(JSON.stringify(this.unitManager.baseData[unitName]));
                            this.unitManager.baseData[unitName] = 
                                JSON.parse(JSON.stringify(this.unitManager.baseData[unitName]));
                        }
                    }
                } else {
                    this.unitManager.baseData[unitName] = defaultUnitManager.baseData[unitName];
                    this.unitDeltaManager.baseData[unitName] = defaultUnitManager.baseData[unitName];
                }
            });

            this.unitManager.save();
            this.unitDeltaManager.save();

            this.reload();
        },

        // clears unit table changes
        clearUnitTable() {
            Object.entries(this.activeUnits).forEach(([unitName, _]) => {
                this.unitManager.baseData[unitName] =
                    this.unitDeltaManager.baseData[unitName];
            });

            this.unitManager.save();

            this.reload();
        },

        // checks if units have changes
        hasUnitChanges() {
            if (!this.activeUnits) return false;
            
            for (const [unitName, _] of Object.entries(this.activeUnits)) {
                const currentData = JSON.stringify(this.unitManager.baseData[unitName] || {});
                const referenceData = JSON.stringify(this.unitDeltaManager.baseData[unitName] || {});
                
                if (currentData !== referenceData) {
                    return true;
                }
            }
            return false;
        },

        // checks if unit deltas have changes
        hasUnitDeltaChanges() {
            if (!this.activeUnits) return false;
            
            const defaultUnitManager = new UnitManager();
            
            for (const [unitName, _] of Object.entries(this.activeUnits)) {
                const deltaData = JSON.stringify(this.unitDeltaManager.baseData[unitName] || {});
                const defaultData = JSON.stringify(defaultUnitManager.baseData[unitName] || {});
                
                if (deltaData !== defaultData) {
                    return true;
                }
            }
            return false;
        }
    }
};

export default ViewerTable;
