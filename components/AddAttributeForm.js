import Dropdown from './Dropdown.js';
import Alert from './Alert.js';

export default class AddAttributeForm {
    constructor(viewer) {
        this.viewer = viewer;

        this.typeDropdown = document.getElementById('add-attribute-type-dropdown'); // prettier-ignore
        this.typeInput = document.getElementById('add-attribute-type');

        this.nameInput = document.getElementById('add-attribute-name');
        this.nameOptions = document.getElementById('add-attribute-name-options'); // prettier-ignore

        this.numberForm = document.getElementById('add-attribute-number-form');
        this.numberValue = document.getElementById('add-attribute-number-value'); // prettier-ignore

        this.booleanForm = document.getElementById('add-attribute-boolean-form'); // prettier-ignore
        this.booleanValue = document.getElementById('add-attribute-boolean-value'); // prettier-ignore

        this.stringForm = document.getElementById('add-attribute-string-form');
        this.stringValue = document.getElementById('add-attribute-string-value'); // prettier-ignore
        this.stringOptions = document.getElementById('add-attribute-string-options') // prettier-ignore

        this.addAttributeSubmit = document.getElementById('add-attribute-submit') // prettier-ignore

        this.attributes = this.viewer.deltaTowerManager
            .getAllAttributes()
            .sort((a, b) => a > b);

        const addAttributeDropdown = new Dropdown(
            this.nameInput,
            this.nameOptions,
            this.attributes,
            {
                setTextMode: true,
            }
        );

        addAttributeDropdown.textForm.addEventListener(
            'submit',
            ((e) => {
                this.#onNameInput(e.detail);
            }).bind(this)
        );

        $('#add-attribute-type-dropdown').on(
            'hidden.bs.dropdown',
            ((e) => {
                const targetValue = e.clickEvent?.target?.text;

                if (targetValue === undefined) return;

                this.typeInput.value = targetValue;
                this.#onTypeChange();
            }).bind(this)
        );

        this.addAttributeSubmit.addEventListener(
            'click',
            ((e) => {
                const didAdd = this.viewer
                    .getActiveSkin()
                    .addAttribute(this.nameInput.value, this.#getInput());

                if (didAdd) {
                    const alert = new Alert(
                        `${this.nameInput.value} added to ${this.viewer.tower.name}`,
                        { alertStyle: 'alert-success' }
                    );
                    alert.alertTimeInSeconds = 1;
                    alert.fire();
                }

                this.viewer.import(JSON.stringify(this.viewer.tower.json));
            }).bind(this)
        );

        this.numberValue.addEventListener('input', (e) => {
            const isValid = Number.isFinite(+e.target.value);

            if (isValid) {
                this.numberValue.classList.remove('is-invalid');
                this.numberValue.classList.add('is-valid');
            } else {
                this.numberValue.classList.remove('is-valid');
                this.numberValue.classList.add('is-invalid');
            }
        });

        this.nameInput.value = '';
        this.#onTypeChange();
    }

    #onNameInput(attributeName) {
        this.nameInput.value = attributeName;
        const attributeType = this.viewer.deltaTowerManager.getTypeForAttribute(attributeName); // prettier-ignore
        if (attributeType === undefined) return;

        this.typeInput.value = attributeType;
        this.#onTypeChange();
    }

    #hideForms() {
        this.numberForm.classList.add('d-none');
        this.stringForm.classList.add('d-none');
        this.booleanForm.classList.add('d-none');
    }

    #getType() {
        return String(this.typeInput.value).toLowerCase();
    }

    #getInput() {
        switch (this.#getType()) {
            case 'number':
                const number = +this.numberValue.value;
                return Number.isFinite(number) ? number : 0;

            case 'string':
                return this.stringValue.value;

            case 'boolean':
                return this.booleanValue.checked;

            default:
                return null;
        }
    }

    #onTypeChange() {
        this.#hideForms();

        switch (this.#getType()) {
            case 'number':
                this.numberForm.classList.remove('d-none');
                break;
            case 'string':
                this.stringForm.classList.remove('d-none');

                new Dropdown(
                    this.stringValue,
                    this.stringOptions,
                    this.viewer.deltaTowerManager.getOccurrencesForAttribute(
                        this.nameInput.value
                    ),
                    {
                        setTextMode: true,
                    }
                );

                break;
            case 'boolean':
                this.booleanForm.classList.remove('d-none');

                break;
        }
    }
}
