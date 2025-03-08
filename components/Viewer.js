// import Tower from '../TowerComponents/Tower.js';
import TowerTable from './TowerTable.js';
import UnitTable from './UnitTable.js';
import ButtonSelection from './ButtonSelection.js';
import ToggleButton from './ToggleButton.js';
import TowerManager from '../TowerComponents/TowerManager.js';
import TableDataManagement from './TableDataManagement.js';
import PropertyViewer from './PropertyViewer.js';
import SidePanel from './SidePanel.js';
import UpgradeViewer from './UpgradeViewer.js';
import Alert from './Alert.js';
// import Dropdown from './Dropdown.js';
import AddAttributeForm from './AddAttributeForm.js';
import RemoveAttributeForm from './RemoveAttributeForm.js';
import UnitManager from '../TowerComponents/UnitManager.js';
import BoostPanel from './BoostPanel.js';
import CloneTowerForm from './CloneTowerForm.js';
import LuaViewer from './LuaConverter/index.js';
import WikitextViewer from './WikitextViewer.js';
import WikitableGenerator from './WikitableGenerator.js'; // Import the new class

class Viewer {
    // takes a div element to start things up
    constructor(app) {
        this.app = app;

        // setting up managers for units and towers
        this.unitManager = new UnitManager('units');
        this.unitDeltaManager = new UnitManager('unitDeltas');
        this.defaultTowerManager = new TowerManager('default');
        this.deltaTowerManager = new TowerManager('delta');

        // hooking up the property viewer and side panel
        this.propertyViewer = new PropertyViewer(
            this,
            document.getElementById('property-viewer')
        );
        this.sidePanel = new SidePanel();

        this.upgradeViewer = new UpgradeViewer(this);
        this.boostPanel = new BoostPanel(this);

        // grabbing the tower name heading
        this.towerNameH1 = document.querySelector('#tower-name');

        // setting up button selections for variants and views
        this.towerVariants = new ButtonSelection(
            document.querySelector('#tower-variants')
        );

        this.tableView = new ButtonSelection(
            document.querySelector('#table-view')
        ).setButtons(['Table', 'Wikitable', 'JSON']);
        this.tableView.root.addEventListener('submit', () => this.#loadBody());

        // toggle button for delta view
        this.buttonDeltaButton = new ToggleButton(
            document.querySelector('#button-delta button'),
            { state: true }
        );

        // reloads when toggle changes
        this.buttonDeltaButton.element.addEventListener('toggled', (() => {this.reload()}).bind(this))

        this.towerViewDropdownButton = document.querySelector(
            '#tower-view-dropdown'
        );

        // setting up tables and viewers
        this.towerTable = new TowerTable(
            document.querySelector('#tower-table'),
            this
        );
        this.unitTable = new UnitTable(
            document.querySelector('#unit-table'),
            this
        );

        this.jsonViewer = new JSONViewer();
        this.luaViewer = new LuaViewer();

        // json copy button setup
        this.jsonCopy = document.querySelector('#json-copy');
        this.jsonCopy.addEventListener('click', this.#onCopyJSON.bind(this));
        
        // toggle for showing combined json
        this.showCombinedJSON = document.querySelector('#show-combined-json');
        if (this.showCombinedJSON) {
            this.showCombinedJSONActive = true; // default to active state
            
            // applies active styling immediately
            this.showCombinedJSON.classList.remove('btn-outline-secondary');
            this.showCombinedJSON.classList.add('btn-primary');
            
            this.showCombinedJSON.addEventListener('click', () => {
                this.showCombinedJSONActive = !this.showCombinedJSONActive; // toggle state
                
                // toggles button appearance
                if (this.showCombinedJSONActive) {
                    this.showCombinedJSON.classList.remove('btn-outline-secondary');
                    this.showCombinedJSON.classList.add('btn-primary');
                } else {
                    this.showCombinedJSON.classList.remove('btn-primary');
                    this.showCombinedJSON.classList.add('btn-outline-secondary');
                }
                this.#clearJSON();
                this.#loadJSON();
            });
        }

        // import button setup
        this.importButtonOpen = document.querySelector('#json-import');
        this.importButtonOpen.addEventListener(
            'click',
            (() => {
                document.querySelector('#json-import-text').value = '';
            }).bind(this)
        );

        // import submit button
        this.importButtonSubmit = document.querySelector('#json-import-submit');
        this.importButtonSubmit.addEventListener(
            'click',
            (() => {
                this.import(
                    document.querySelector('#json-import-text').value,
                    true
                );
            }).bind(this)
        );

        // export button
        this.exportButton = document.querySelector('#json-export');
        this.exportButton.addEventListener(
            'click',
            (() => {
                if (this.showCombinedJSON && this.showCombinedJSONActive) {
                    this.exportTowerWithUnits();
                } else {
                    this.export(JSON.stringify(this.tower.json));
                }
            }).bind(this)
        );
        
        // export with units button
        this.exportWithUnitsButton = document.querySelector('#json-export-with-units');
        if (this.exportWithUnitsButton) {
            this.exportWithUnitsButton.addEventListener(
                'click',
                this.exportTowerWithUnits.bind(this)
            );
        }

        // setting up more management stuff
        this.tableManagement = new TableDataManagement(this);
        new AddAttributeForm(this);
        new CloneTowerForm(this);
        this.removeAttributeForm = new RemoveAttributeForm(this);

        // starts wikitable setup
        this.wikitablePanel = document.querySelector('#wikitable-panel');
        this.wikitableContent = document.querySelector('#wikitable');
        this.wikitableCopy = document.querySelector('#wikitable-copy');
        this.wikitableCopy.addEventListener('click', this.#onCopyWikitable.bind(this));
        
        this.wikitableExport = document.querySelector('#wikitable-export');
        this.wikitableExport.addEventListener('click', this.#exportWikitable.bind(this));

        // Create wikitable viewer instance
        this.wikitextViewer = new WikitextViewer();
    }

    // loads up a tower to show
    load(tower) {
        this.tower = tower;
        this.deltaTower = this.deltaTowerManager.towers[this.tower.name];

        this.#setVariantButtons();
        this.unitManager.load();
        this.unitDeltaManager.load();

        this.#loadBody();
    }

    // refreshes everything
    reload() {
        this.unitManager.load();
        this.unitDeltaManager.load();

        this.#loadBody();
    }

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
    }

    // saves json to a file
    export(json) {
        const filename = `${this.tower.name}-stats.json`;
        const file = new Blob([json], { type: 'json' });

        if (window.navigator.msSaveOrOpenBlob)
            window.navigator.msSaveOrOpenBlob(file, filename);
        else {
            var a = document.createElement('a'),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    // exports tower and units together
    exportTowerWithUnits() {
        const combinedData = this._getCombinedData();
        const filename = `${this.tower.name}-full.json`;
        const json = JSON.stringify(combinedData, null, 2);
        const file = new Blob([json], { type: 'json' });

        if (window.navigator.msSaveOrOpenBlob)
            window.navigator.msSaveOrOpenBlob(file, filename);
        else {
            var a = document.createElement('a'),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    // applies json changes
    apply(json) {
        const towerData = JSON.parse(json);
        this.deltaTower.importJSON(towerData);

        this.reload();
    }

    // updates unit table data
    applyUnitTable() {
        Object.entries(this.activeUnits).forEach(([unitName, unitData]) => {
            this.unitDeltaManager.baseData[unitName] = unitData.data;
        });

        this.unitDeltaManager.save();

        this.reload();
    }

    // resets tower to default
    reset() {
        const towerManager = new TowerManager();
        const towerJSON = JSON.stringify(
            towerManager.towers[this.tower.name].json
        );

        this.deltaTower.importJSON(JSON.parse(towerJSON));
        this.tower.importJSON(JSON.parse(towerJSON));

        this.reload();
    }

    // resets unit table to default
    resetUnitTable() {
        const defaultUnitManager = new UnitManager();

        Object.entries(this.activeUnits).forEach(([unitName, _]) => {
            this.unitManager.baseData[unitName] =
                defaultUnitManager.baseData[unitName];
            this.unitDeltaManager.baseData[unitName] =
                defaultUnitManager.baseData[unitName];
        });

        this.unitManager.save();
        this.unitDeltaManager.save();

        this.reload();
    }

    // gets the current skin being viewed
    getActiveSkin() {
        return this.tower.skins[this.towerVariants.getSelectedName()];
    }

    // clears unit table changes
    clearUnitTable() {
        Object.entries(this.activeUnits).forEach(([unitName, _]) => {
            this.unitManager.baseData[unitName] =
                this.unitDeltaManager.baseData[unitName];
        });

        this.unitManager.save();

        this.reload();
    }

    // wipes all unit changes
    clearUnitChanges() {
        localStorage.removeItem(this.unitManager.dataKey);
        localStorage.removeItem(this.unitDeltaManager.dataKey);
        this.reload();
    }

    // adds a new tower
    addNewTower(name, json) {
        this.app.towerManager.addTower(name, json);
        this.deltaTowerManager.addTower(name, json);
        this.defaultTowerManager.addTower(name, json);

        this.app.addTowerOption(name);

        this.load(this.defaultTowerManager.towers[name]);
    }

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
    }

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

    // sets up the variant buttons
    #setVariantButtons() {
        this.towerVariants.setButtons(this.tower.skinNames);
        this.towerVariants.root.addEventListener('submit', () => this.#loadBody());
    }

    // loads the main content
    #loadBody() {
        this.app.towerManager.saveTower(this.tower);
        this.deltaTowerManager.saveTower(this.deltaTower);
        this.unitManager.save();
        this.unitDeltaManager.save();

        this.boostPanel.reload();

        this.#loadName();

        this.#hideJSON();
        this.#hideTable();
        this.#hideLua();
        this.#hideWikitable(); // Add this line

        this.sidePanel.onUpdate();
        this.upgradeViewer.load(this.getActiveSkin());

        switch (this.tableView.getSelectedName()) {
            case 'Table':
                this.#loadTable();
                this.tableManagement.renderButtonOutlines();
                this.removeAttributeForm.load();
                document.querySelector('.btn-toolbar.mb-2.mb-md-0.mt-0').classList.remove('d-none');
                break;
            case 'JSON':
                this.#showJSON();
                this.#clearJSON();
                this.#loadJSON();
                document.querySelector('.btn-toolbar.mb-2.mb-md-0.mt-0').classList.add('d-none');
                break;
//            case 'Lua':
//                this.#showLua();
//                this.#clearLua();
//                this.#loadLua();
//                document.querySelector('.btn-toolbar.mb-2.mb-md-0.mt-0').classList.add('d-none');
//                break;
            case 'Wikitable':
                this.#showWikitable();
                this.#loadWikitableContent();
                document.querySelector('.btn-toolbar.mb-2.mb-md-0.mt-0').classList.add('d-none');
                break;
        }
    }

    // updates the tower name display
    #loadName() {
        const towerName = this.tower.name;
        const activeVariant = this.towerVariants.getSelectedName();
        const displayedVariant =
            activeVariant === 'Default' ? '' : `${activeVariant} `;

        this.towerNameH1.innerText = displayedVariant + towerName;
    }

    // loads the table view
    #loadTable() {
        // clear old wikitable boxes before a fresh start
        const existingContainers = this.towerTable.root.parentElement.querySelectorAll('.wikitable-container');
        existingContainers.forEach(container => container.remove());
        
        this.activeUnits = this.unitManager.populate(
            this.tower.name,
            this.getActiveSkin().name
        );

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
    }

    // hides the table
    #hideTable() {
        this.towerTable.root.parentElement.classList.add('d-none');
    }

    #loadWikitableContent() {
        // wipe the content first
        this.wikitableContent.innerHTML = '';
        
        // set up a responsive div for the table
        const responsiveDiv = document.createElement('div');
        responsiveDiv.className = 'table-responsive';
        
        // add the wikitext viewer's container to the responsive div
        responsiveDiv.appendChild(this.wikitextViewer.getContainer());
        
        // attach the responsive div to the wikitable content
        this.wikitableContent.appendChild(responsiveDiv);
        
        // make sure we have loaded the unit data
        this.activeUnits = this.unitManager.populate(
            this.tower.name,
            this.getActiveSkin().name
        );
        
        // create a WikitableGenerator instance
        this.wikitableGenerator = new WikitableGenerator(
            this.tower,
            this.activeUnits,
            this.propertyViewer,
            this.towerVariants,
            this // pass the viewer instance (not broken, i hope)
        );
        
        // generates the wikitable content
        this.currentWikitableContent = this.wikitableGenerator.generateWikitableContent();
        
        // add unit table if units exist
        if (this.activeUnits && Object.keys(this.activeUnits).length > 0) {
            this.currentWikitableContent += "\n\n" + this.wikitableGenerator.generateUnitWikitableContent();
        }
        
        // add notice at the very end
        this.currentWikitableContent += `\n<!-- Generated using the TDS Stats Editor (v1.0) on ${new Date().toUTCString()} -->\n`;
        
        // show the wikitextViewer with syntax highlighting
        this.wikitextViewer.showWikitext(this.currentWikitableContent);
    }

    // hides json panel
    #hideJSON() {
        document.querySelector('#json-panel').classList.add('d-none');
    }

    // hides lua panel
    #hideLua() {
        document.querySelector('#lua-panel').classList.add('d-none');
    }

    // shows json panel
    #showJSON() {
        document.querySelector('#json-panel').classList.remove('d-none');
    }

    // clears json display
    #clearJSON() {
        document.querySelector('#json').innerHTML = '';
    }

    // loads json view
    #loadJSON() {
        document.querySelector('#json').appendChild(this.jsonViewer.getContainer());
        if (this.showCombinedJSON && this.showCombinedJSONActive) {
            this.jsonViewer.showJSON(this._getCombinedData());
        } else {
            this.jsonViewer.showJSON(this.tower.json);
        }
    }

    // handles copying json to clipboard
    #onCopyJSON() {
        const data = (this.showCombinedJSON && this.showCombinedJSONActive)
            ? this._getCombinedData()
            : this.tower.json;
        navigator.clipboard.writeText(JSON.stringify(data));
        const alert = new Alert('JSON Copied!', {
            alertStyle: 'alert-success',
        });
        alert.fire();
    }

    _getCombinedData() {
        this.activeUnits = this.unitManager.populate(
            this.tower.name,
            this.getActiveSkin().name
        );
        const combinedData = {
            master: this.tower.json,
            slave: {}
        };
        Object.entries(this.activeUnits).forEach(([unitName, _]) => {
            combinedData.slave[unitName] = this.unitManager.baseData[unitName];
        });
        return combinedData;
    }

    // hides wikitable panel
    #hideWikitable() {
        this.wikitablePanel.classList.add('d-none');
    }

    // shows wikitable panel
    #showWikitable() {
        this.wikitablePanel.classList.remove('d-none');
    }

    // handles copying wikitable to clipboard
    #onCopyWikitable() {
        navigator.clipboard.writeText(this.currentWikitableContent);
        const alert = new Alert('Wikitable Copied!', {
            alertStyle: 'alert-success',
        });
        alert.fire();
    }

    // exports wikitable to a file
    #exportWikitable() {
        const towerName = this.tower.name;
        const activeVariant = this.towerVariants.getSelectedName();
        const displayedVariant = activeVariant === 'Default' ? '' : `${activeVariant}-`;
        const filename = `${displayedVariant}${towerName}-wikitable.txt`;
        const file = new Blob([this.currentWikitableContent], { type: 'text/plain' });

        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(file, filename);
        } else {
            var a = document.createElement('a'),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
}

export default Viewer;