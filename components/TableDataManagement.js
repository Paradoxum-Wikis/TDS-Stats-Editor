import Viewer from './Viewer.js';

export default class TableDataManagement {
    /**
     *
     * @param {Viewer} viewer
     */
    constructor(viewer) {
        this.viewer = viewer;

        this.activeClass = 'btn-outline-primary';
        this.inactiveClass = 'btn-outline-secondary';

        this.clearButton = document.querySelector('#table-clear');
        this.applyButton = document.querySelector('#table-apply');
        this.resetButton = document.querySelector('#table-reset');
        this.clearDataButton = document.querySelector('#table-clear-data');

        this.addLevelButton = document.querySelector('#table-add-level');
        this.removeLevelButton = document.querySelector('#table-remove-level');

        this.clearUnitButton = document.querySelector('#table-unit-clear');
        this.applyUnitButton = document.querySelector('#table-unit-apply');
        this.resetUnitButton = document.querySelector('#table-unit-reset');

        this.clearUnitChangesButton = document.querySelector(
            '#table-unit-resetAll'
        );

        this.clearButton.addEventListener('click', this.clearTable.bind(this));
        this.applyButton.addEventListener('click', this.applyTable.bind(this));
        this.resetButton.addEventListener('click', this.resetTable.bind(this));

        this.clearUnitButton.addEventListener(
            'click',
            this.clearUnitTable.bind(this)
        );
        this.applyUnitButton.addEventListener(
            'click',
            this.applyUnitTable.bind(this)
        );
        this.resetUnitButton.addEventListener(
            'click',
            this.resetUnitTable.bind(this)
        );

        this.clearDataButton.addEventListener(
            'click',
            this.clearTableFull.bind(this)
        );

        this.addLevelButton.addEventListener('click', this.addLevel.bind(this));
        this.removeLevelButton.addEventListener(
            'click',
            this.removeLevel.bind(this)
        );

        this.clearUnitChangesButton.addEventListener(
            'click',
            this.clearUnitChanges.bind(this)
        );
    }

    renderButtonOutlines() {
        const currentJSON = JSON.stringify(this.viewer.tower.json);
        const referenceJSON = JSON.stringify(this.viewer.deltaTower.json);
        const savedJSON = JSON.stringify(
            this.viewer.defaultTowerManager.towers[this.viewer.tower.name].json
        );

        const activeChanges = currentJSON !== referenceJSON;
        const deltaChanges = savedJSON !== referenceJSON;

        this.#setEnabled(this.clearButton, activeChanges);
        this.#setEnabled(this.applyButton, activeChanges);
        this.#setEnabled(this.resetButton, deltaChanges, 'btn-outline-danger');
    }

    #setEnabled(button, state, active) {
        active = active ?? this.activeClass;
        if (state) {
            button.classList.add(active);
            button.classList.remove(this.inactiveClass);
        } else {
            button.classList.remove(active);
            button.classList.add(this.inactiveClass);
        }
    }

    clearUnitChanges() {
        this.viewer.clearUnitChanges();
    }
    clearUnitTable() {
        this.viewer.clearUnitTable();
    }
    applyUnitTable() {
        this.viewer.applyUnitTable();
    }
    resetUnitTable() {
        this.viewer.resetUnitTable();
    }

    clearTable() {
        this.viewer.import(JSON.stringify(this.viewer.deltaTower.json));
    }

    clearTableFull() {
        localStorage.removeItem('New');
        localStorage.removeItem('delta');
        localStorage.removeItem('default');
        location.reload();
    }

    applyTable() {
        this.viewer.apply(JSON.stringify(this.viewer.tower.json));
    }

    resetTable() {
        this.viewer.reset();
    }

    addLevel() {
        const towerName = this.viewer.tower.name;
        const variant = this.viewer.towerVariants.getSelectedName();
        const towerVariant = this.viewer.tower.json[towerName][variant];

        const lastUpgrade =
            towerVariant.Upgrades[towerVariant.Upgrades.length - 1];

        if (lastUpgrade) {
            towerVariant.Upgrades.push(lastUpgrade);
            this.viewer.deltaTower.json[towerName][variant].Upgrades.push(
                lastUpgrade
            );
        }

        this.viewer.tower.importJSON(this.viewer.tower.json);
        this.viewer.deltaTower.importJSON(this.viewer.deltaTower.json);

        this.viewer.reload();
    }

    removeLevel() {
        const towerName = this.viewer.tower.name;
        const variant = this.viewer.towerVariants.getSelectedName();
        const towerVariant = this.viewer.tower.json[towerName][variant];

        if (towerVariant.Upgrades.length > 0) {
            towerVariant.Upgrades.pop();
            this.viewer.deltaTower.json[towerName][variant].Upgrades.pop();
        }

        this.viewer.tower.importJSON(this.viewer.tower.json);
        this.viewer.deltaTower.importJSON(this.viewer.deltaTower.json);

        this.viewer.reload();
    }
}
