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
        this.addLevelButton = document.querySelector('#table-add-level');
        this.removeLevelButton = document.querySelector('#table-remove-level');

        this.clearButton.addEventListener('click', this.clearTable.bind(this));
        this.applyButton.addEventListener('click', this.applyTable.bind(this));
        this.resetButton.addEventListener('click', this.resetTable.bind(this));
        this.addLevelButton.addEventListener('click', this.addLevel.bind(this));
        this.removeLevelButton.addEventListener(
            'click',
            this.removeLevel.bind(this)
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

    clearTable() {
        this.viewer.import(JSON.stringify(this.viewer.deltaTower.json));
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
