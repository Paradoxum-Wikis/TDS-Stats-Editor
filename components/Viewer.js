import Tower from '../TowerComponents/Tower.js';
import TowerTable from './TowerTable.js';
import ButtonSelection from './ButtonSelection.js';
import ToggleButton from './ToggleButton.js';
import TowerManager from '../TowerComponents/TowerManager.js';
import TableDataManagement from './TableDataManagement.js';
import PropertyViewer from './PropertyViewer.js';
import SidePanel from './SidePanel.js';
import UpgradeViewer from './UpgradeViewer.js';

class Viewer {
    /**
     * @param {HTMLDivElement} root
     */
    constructor(app) {
        this.app = app;

        this.deltaTowerManager = new TowerManager('delta');
        this.propertyViewer = new PropertyViewer(
            this,
            document.getElementById('property-viewer')
        );
        this.sidePanel = new SidePanel();

        this.upgradeViewer = new UpgradeViewer(this);

        /** @type {HTMLHeadingElement} */
        this.towerNameH1 = document.querySelector('#tower-name');

        this.towerVariants = new ButtonSelection(
            document.querySelector('#tower-variants')
        );

        this.tableView = new ButtonSelection(
            document.querySelector('#table-view')
        ).setButtons(['Table', 'JSON']);
        this.tableView.root.addEventListener('submit', (() => this.#loadBody()).bind(this)); // prettier-ignore

        this.buttonDeltaButton = new ToggleButton(
            document.querySelector('#button-delta button')
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

        this.jsonViewer = new JSONViewer();

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
                this.import(document.querySelector('#json-import-text').value);
            }).bind(this)
        );

        this.exportButton = document.querySelector('#json-export');
        this.exportButton.addEventListener(
            'click',
            (() => {
                this.export(JSON.stringify(this.tower.json));
            }).bind(this)
        );
        new TableDataManagement(this);
    }

    /**
     * @param {Tower} tower
     */
    load(tower) {
        this.tower = tower;
        this.deltaTower = this.deltaTowerManager.towers[this.tower.name];

        this.towerNameH1.innerText = tower.name;

        this.#setVariantButtons();
        this.#loadBody();
    }

    reload() {
        this.#loadBody();
    }

    import(json) {
        const oldJSON = JSON.parse(JSON.stringify(this.tower.json));
        try {
            const towerData = JSON.parse(json);
            this.tower.importJSON(towerData);
        } catch (e) {
            this.tower.importJSON(oldJSON);
            console.log('Someone just tried to upload something silly');
            console.log(e);
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

    reset() {
        const towerManager = new TowerManager();
        const towerJSON = JSON.stringify(
            towerManager.towers[this.tower.name].json
        );

        this.deltaTower.importJSON(JSON.parse(towerJSON));
        this.tower.importJSON(JSON.parse(towerJSON));

        this.reload();
    }

    getActiveSkin() {
        return this.tower.skins[this.towerVariants.getSelectedName()];
    }

    #setVariantButtons() {
        this.towerVariants.setButtons(this.tower.skinNames);
        this.towerVariants.root.addEventListener('submit', (() => this.#loadBody()).bind(this)); // prettier-ignore
    }

    #loadBody() {
        this.app.towerManager.saveTower(this.tower);
        this.deltaTowerManager.saveTower(this.deltaTower);

        this.#hideJSON();
        this.#hideTable();

        this.sidePanel.onUpdate();
        this.upgradeViewer.load(this.getActiveSkin());

        switch (this.tableView.getSelectedName()) {
            case 'Table':
                this.#loadTable();
                break;
            case 'JSON':
                this.#showJSON();
                this.#clearJSON();
                this.#loadJSON();
                break;
        }
    }

    #loadTable() {
        this.towerTable.root.parentElement.classList.remove('d-none');

        const skinData = this.getActiveSkin();
        this.propertyViewer.createButtons(skinData.levels.attributes);

        this.towerTable.load(skinData, {
			ignore: this.propertyViewer.disabled
		}); // prettier-ignore
    }

    #hideTable() {
        this.towerTable.root.parentElement.classList.add('d-none');
    }

    #clearJSON() {
        document.querySelector('#json').innerHTML = '';
    }

    #hideJSON() {
        document.querySelector('#json-panel').classList.add('d-none');
    }

    #showJSON() {
        document.querySelector('#json-panel').classList.remove('d-none');
    }

    #loadJSON() {
        document
            .querySelector('#json')
            .appendChild(this.jsonViewer.getContainer());
        this.jsonViewer.showJSON(this.tower.json);
    }

    #onCopyJSON() {
        navigator.clipboard.writeText(JSON.stringify(this.tower.json));
    }
}

export default Viewer;
