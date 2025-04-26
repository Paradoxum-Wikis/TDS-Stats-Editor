import UnitManager from '../../TowerComponents/UnitManager.js';
import TowerManager from '../../TowerComponents/TowerManager.js';

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

            // Filter out hidden properties for the table
            const allProps = [
                ...skinData.levels.attributes,
                ...skinData.levels.complexAttributes,
            ];
            const visibleProps = allProps.filter(
                prop => !this.propertyViewer.isHidden(prop)
            );

            this.propertyViewer.createButtons(visibleProps);

            this.towerTable.load(skinData, {
                ignore: [
                    ...this.propertyViewer.disabled,
                    // Also ignore all hidden properties
                    ...allProps.filter(prop => this.propertyViewer.isHidden(prop))
                ]
            });

            // give property viewer its slave properties
            this.propertyViewer.initializeUnitProperties();
            
            // load the slave table with property filtering
            this.unitTable.load(this.activeUnits, {
                ignore: this.propertyViewer.currentView === 'unit' ? 
                    this.propertyViewer.unitDisabled : []
            });
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
            // cache manager instances
            const defaultUnitManager = window.cachedDefaultUnitManager || new UnitManager();
            if (!window.cachedDefaultUnitManager) window.cachedDefaultUnitManager = defaultUnitManager;
            
            const defaultTowerManager = window.cachedDefaultTowerManager || new TowerManager();
            if (!window.cachedDefaultTowerManager) window.cachedDefaultTowerManager = defaultTowerManager;
            
            const isCustomTower = !defaultTowerManager.towerData.hasOwnProperty(this.tower.name);
            
            // batch process changes before saving/reloading
            const updates = [];
            
            Object.entries(this.activeUnits).forEach(([unitName, _]) => {
                let sourceData;
                
                if (isCustomTower || !defaultUnitManager.baseData[unitName]) {
                    if (window.originalCustomUnits && window.originalCustomUnits[unitName]) {
                        sourceData = window.originalCustomUnits[unitName];
                    } else if (this.unitManager.baseData[unitName]) {
                        sourceData = this.unitManager.baseData[unitName];
                    }
                } else {
                    sourceData = defaultUnitManager.baseData[unitName];
                }
                
                if (sourceData) {
                    updates.push({ unitName, data: sourceData });
                }
            });
            
            // apply all updates at once
            updates.forEach(({ unitName, data }) => {
                // efficient cloning
                const dataCopy = typeof structuredClone !== 'undefined'
                    ? structuredClone(data)
                    : JSON.parse(JSON.stringify(data));
                    
                this.unitManager.baseData[unitName] = dataCopy;
                this.unitDeltaManager.baseData[unitName] = dataCopy;
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
