import Tower from '../TowerComponents/Tower.js';
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
import Dropdown from './Dropdown.js';
import AddAttributeForm from './AddAttributeForm.js';
import RemoveAttributeForm from './RemoveAttributeForm.js';
import UnitManager from '../TowerComponents/UnitManager.js';
import BoostPanel from './BoostPanel.js';
import CloneTowerForm from './CloneTowerForm.js';
import LuaViewer from './LuaConverter/index.js';

class Viewer {
    /**
     * @param {HTMLDivElement} root
     */
    constructor(app) {
        this.app = app;

        this.unitManager = new UnitManager('units');
        this.unitDeltaManager = new UnitManager('unitDeltas');
        this.defaultTowerManager = new TowerManager('default');
        this.deltaTowerManager = new TowerManager('delta');

        this.propertyViewer = new PropertyViewer(
            this,
            document.getElementById('property-viewer')
        );
        this.sidePanel = new SidePanel();

        this.upgradeViewer = new UpgradeViewer(this);
        this.boostPanel = new BoostPanel(this);

        /** @type {HTMLHeadingElement} */
        this.towerNameH1 = document.querySelector('#tower-name');

        this.towerVariants = new ButtonSelection(
            document.querySelector('#tower-variants')
        );

        this.tableView = new ButtonSelection(
            document.querySelector('#table-view')
        ).setButtons(['Table', 'JSON', 'Lua']);
        this.tableView.root.addEventListener('submit', (() => this.#loadBody()).bind(this)); // prettier-ignore

        this.buttonDeltaButton = new ToggleButton(
            document.querySelector('#button-delta button'),
            { state: true }
        );

        this.buttonDeltaButton.element.addEventListener('toggled', (() => {this.reload()}).bind(this)) // prettier-ignore

        /** @type {HTMLButtonElement} */
        this.towerViewDropdownButton = document.querySelector(
            '#tower-view-dropdown'
        );

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

        this.jsonCopy = document.querySelector('#json-copy');
        this.jsonCopy.addEventListener('click', this.#onCopyJSON.bind(this));

        this.importButtonOpen = document.querySelector('#json-import');
        this.importButtonOpen.addEventListener(
            'click',
            (() => {
                document.querySelector('#json-import-text').value = '';
            }).bind(this)
        );

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

        this.exportButton = document.querySelector('#json-export');
        this.exportButton.addEventListener(
            'click',
            (() => {
                this.export(JSON.stringify(this.tower.json));
            }).bind(this)
        );
        this.tableManagement = new TableDataManagement(this);
        new AddAttributeForm(this);
        new CloneTowerForm(this);
        this.removeAttributeForm = new RemoveAttributeForm(this);
    }

    /**
     * @param {Tower} tower
     */
    load(tower) {
        this.tower = tower;
        this.deltaTower = this.deltaTowerManager.towers[this.tower.name];

        this.#setVariantButtons();
        this.unitManager.load();
        this.unitDeltaManager.load();

        this.#loadBody();
    }

    reload() {
        this.unitManager.load();
        this.unitDeltaManager.load();

        this.#loadBody();
    }

    import(json, enableAlert) {
        enableAlert = enableAlert ?? false;

        const oldJSON = JSON.parse(JSON.stringify(this.tower.json));
        try {
            const towerData = JSON.parse(json);
            this.tower.importJSON(towerData);

            if (enableAlert) {
                const alert = new Alert('JSON Imported!', {
                    alertStyle: 'alert-success',
                });
                alert.timeBeforeShow = 0.1;

                alert.fire();
            }
        } catch (e) {
            this.tower.importJSON(oldJSON);
            const alert = new Alert('Unable to load that 🦊', {
                alertStyle: 'alert-danger',
            });
            alert.timeBeforeShow = 0.1;
            alert.alertTimeInSeconds = 1;
            alert.fire();
            console.error(e);
        }

        this.reload();
    }

    export(json) {
        const filename = `${this.tower.name}-stats.json`;
        const file = new Blob([json], { type: 'json' });

        if (window.navigator.msSaveOrOpenBlob)
            // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else {
            // Others
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

    apply(json) {
        const towerData = JSON.parse(json);
        this.deltaTower.importJSON(towerData);

        this.reload();
    }
    applyUnitTable() {
        Object.entries(this.activeUnits).forEach(([unitName, unitData]) => {
            this.unitDeltaManager.baseData[unitName] = unitData.data;
        });

        this.unitDeltaManager.save();

        this.reload();
    }

    reset() {
        const towerManager = new TowerManager();
        const towerJSON = JSON.stringify(
            towerManager.towers[this.tower.name].json
        );

        this.deltaTower.importJSON(JSON.parse(towerJSON));
        this.tower.importJSON(JSON.parse(towerJSON));

        this.reload();
    }
    resetUnitTable() {
        const defaultUnitManager = new UnitManager();

        Object.entries(this.activeUnits).forEach(([unitName, unitData]) => {
            this.unitManager.baseData[unitName] =
                defaultUnitManager.baseData[unitName];
            this.unitDeltaManager.baseData[unitName] =
                defaultUnitManager.baseData[unitName];
        });

        this.unitManager.save();
        this.unitDeltaManager.save();

        this.reload();
    }

    getActiveSkin() {
        return this.tower.skins[this.towerVariants.getSelectedName()];
    }

    clearUnitTable() {
        Object.entries(this.activeUnits).forEach(([unitName, unitData]) => {
            this.unitManager.baseData[unitName] =
                this.unitDeltaManager.baseData[unitName];
        });

        this.unitManager.save();

        this.reload();
    }

    clearUnitChanges() {
        localStorage.removeItem(this.unitManager.dataKey);
        localStorage.removeItem(this.unitDeltaManager.dataKey);
        this.reload();
    }

    addNewTower(name, json) {
        this.app.towerManager.addTower(name, json);
        this.deltaTowerManager.addTower(name, json);
        this.defaultTowerManager.addTower(name, json);

        this.app.addTowerOption(name);

        this.load(this.defaultTowerManager.towers[name]);
    }

    #setVariantButtons() {
        this.towerVariants.setButtons(this.tower.skinNames);
        this.towerVariants.root.addEventListener('submit', (() => this.#loadBody()).bind(this)); // prettier-ignore
    }

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

        this.sidePanel.onUpdate();
        this.upgradeViewer.load(this.getActiveSkin());

        switch (this.tableView.getSelectedName()) {
            case 'Table':
                this.#loadTable();
                this.tableManagement.renderButtonOutlines();
                this.removeAttributeForm.load();
                break;
            case 'JSON':
                this.#showJSON();
                this.#clearJSON();
                this.#loadJSON();
                break;
            case 'Lua':
            //this.#showLua();
            //this.#clearLua();
            //this.#loadLua();
        }
    }

    #loadName() {
        const towerName = this.tower.name;
        const activeVariant = this.towerVariants.getSelectedName();
        const displayedVariant =
            activeVariant === 'Default' ? '' : `${activeVariant} `;

        this.towerNameH1.innerText = displayedVariant + towerName;
    }

    #loadTable() {
        this.activeUnits = this.unitManager.populate(
            this.tower.name,
            this.getActiveSkin().name
        );

        this.towerTable.root.parentElement.classList.remove('d-none');

        const skinData = this.getActiveSkin();
        this.propertyViewer.createButtons([
            ...skinData.levels.attributes,
            ...skinData.levels.complexAttributes,
        ]);

        this.towerTable.load(skinData, {
			ignore: this.propertyViewer.disabled
		}); // prettier-ignore

        this.unitTable.load(this.activeUnits);
    }

    #hideTable() {
        this.towerTable.root.parentElement.classList.add('d-none');
    }

    #clearJSON() {
        document.querySelector('#json').innerHTML = '';
    }
    #clearLua() {
        document.querySelector('#lua').innerHTML = '';
    }

    #hideJSON() {
        document.querySelector('#json-panel').classList.add('d-none');
    }

    #hideLua() {
        document.querySelector('#lua-panel').classList.add('d-none');
    }

    #showJSON() {
        document.querySelector('#json-panel').classList.remove('d-none');
    }
    #showLua() {
        document.querySelector('#lua-panel').classList.remove('d-none');
    }

    #loadJSON() {
        document
            .querySelector('#json')
            .appendChild(this.jsonViewer.getContainer());
        this.jsonViewer.showJSON(this.tower.json);
    }
    #loadLua() {
        document
            .querySelector('#lua')
            .appendChild(this.luaViewer.getContainer());

        this.luaViewer.showJSONAsLua(this.tower.json);
    }

    #onCopyJSON() {
        navigator.clipboard.writeText(JSON.stringify(this.tower.json));
        const alert = new Alert('JSON Copied!', {
            alertStyle: 'alert-success',
        });
        alert.fire();
    }
}

export default Viewer;
