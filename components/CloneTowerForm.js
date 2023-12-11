import Dropdown from './Dropdown.js';
import Alert from './Alert.js';
import Viewer from './Viewer.js';

export default class AddAttributeForm {
    /**
     *
     * @param {Viewer} viewer
     */
    constructor(viewer) {
        this.viewer = viewer;

        this.towerName = document.getElementById('clone-tower-name');

        this.fromTowerName = document.getElementById('clone-tower-reference');
        this.fromTowerDropdown = document.getElementById('clone-tower-options'); // prettier-ignore

        this.addCloneSubmit = document.getElementById('clone-submit') // prettier-ignore

        this.towerNames = [...this.viewer.defaultTowerManager.towerNames];
        this.towerNamesLower = this.towerNames.map((name) =>
            name.toLowerCase()
        );

        new Dropdown(
            this.fromTowerName,
            this.fromTowerDropdown,
            this.towerNames,
            {
                setTextMode: true,
            }
        );

        $('#clone-tower-options').on(
            'hidden.bs.dropdown',
            ((e) => {
                const targetValue = e.clickEvent?.target?.text;

                if (targetValue === undefined) return;

                this.typeInput.value = targetValue;
                this.#onTowerChange();
            }).bind(this)
        );

        this.addCloneSubmit.addEventListener(
            'click',
            ((e) => {
                this.#onSubmit();
            }).bind(this)
        );

        this.towerName.addEventListener(
            'input',
            ((e) => {
                this.#onNameInput(this.towerName.value);
            }).bind(this)
        );

        this.towerName.value = '';
        this.#onTowerChange();
    }

    #isNameValue(attributeName) {
        let isValid = !this.towerNamesLower.includes(
            attributeName.toLowerCase()
        );
        isValid &= attributeName != '';
        return isValid;
    }

    #onNameInput(attributeName) {
        if (this.#isNameValue(attributeName)) {
            this.towerName.classList.remove('is-invalid');
            this.towerName.classList.add('is-valid');
        } else {
            this.towerName.classList.remove('is-valid');
            this.towerName.classList.add('is-invalid');
        }
    }

    #onSubmit() {
        const towerName = this.towerName.value;
        const towerReference = this.fromTowerName.value;

        if (!this.#isNameValue(towerName)) {
            return;
        }

        const towerData =
            this.viewer.deltaTowerManager.towers[towerReference]?.json?.[
                towerReference
            ];

        if (!towerData) {
            return;
        }

        this.viewer.addNewTower(towerName, towerData);

        // const didAdd = this.viewer
        //     .getActiveSkin()
        //     .addAttribute(this.nameInput.value, this.#getInput());

        // if (didAdd) {
        //     const alert = new Alert(
        //         `${this.nameInput.value} added to ${this.viewer.tower.name}`,
        //         { alertStyle: 'alert-success' }
        //     );
        //     alert.alertTimeInSeconds = 1;
        //     alert.fire();
        // }

        // this.viewer.import(JSON.stringify(this.viewer.tower.json));
    }

    #onTowerChange() {
        console.log('onTowerChange');
    }
}
