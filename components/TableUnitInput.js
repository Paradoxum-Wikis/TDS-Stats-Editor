import Viewer from './Viewer.js';

export default class TableUnitInput {
    /**
     *
     * @param {{
	 * unitName: string,
	 * attribute: string,
	 * unitData: {},
	 * viewer: Viewer,
	 * }} data
 
     * @returns
     */
    constructor(data) {
        this.base = this.#createBase();

        this.name = data.unitData;
        this.attribute = data.attribute;
        this.unitData = data.unitData;
        this.viewer = data.viewer;

        this.sizeFactor = 1.35;
        this.sizeDeltaModifier = 0;
        this.sizeModifier = 0;
    }

    createInput() {
        const cellData = this.unitData[this.attribute];
        const input = this.#getInput(cellData);

        this.input = input;
    }

    #createBase() {
        const td = document.createElement('td');
        td.classList.add('table-cell');

        return td;
    }

    #getInput(value) {
        if (value === undefined) return this.#createNullInput(value);

        if (['true', 'false'].includes(String(value))) {
            return this.#createBooleanInput(value);
        }

        if (Number.isFinite(+value)) {
            return this.#createNumberInput(value);
        }

        return this.#createTextInput(value);
    }

    #createNullInput(value) {
        const input = document.createElement('input');

        input.classList.add('table-cell-input');
        input.readOnly = true;

        input.size = 1;

        this.base.appendChild(input);

        return input;
    }

    #createBooleanInput(value, deltaData) {
        const input = document.createElement('input');

        input.type = 'checkbox';
        input.checked = value;

        if (this.useDelta && value != deltaData) {
            input.classList.add('form-check-input-delta');
        }

        input.classList.add('form-check-input');
        input.classList.add('child-center');
        input.style.padding = '0.6em';
        this.base.style.position = 'relative';

        input.addEventListener('change', this.#onBooleanSubmit.bind(this)); // prettier-ignore
        this.base.appendChild(input);

        return input;
    }

    #createNumberInput(value, deltaData) {
        const input = document.createElement('input');
        const form = document.createElement('form');

        input.classList.add('table-cell-input');

        input.size = 1;

        input.addEventListener('focusin', (() => input.value = '').bind(this)); // prettier-ignore
        input.addEventListener('focusout', this.#onNumberSubmit.bind(this));
        form.addEventListener(
            'submit',
            ((e) => {
                e.preventDefault();
                input.blur();
            }).bind(this)
        );
        input.addEventListener('mouseup', () => {
            input.focus();
        });

        let outputValue = this.#formatNumber(value);

        const computedSize =
            String(outputValue).length / this.sizeFactor + this.sizeModifier;

        input.style.minWidth = `${computedSize}em`;
        input.value = outputValue;

        form.appendChild(input);
        this.base.appendChild(form);

        return input;
    }

    #createTextInput(value, deltaData) {
        if (this.viewer.unitManager.hasUnit(value)) {
            this.viewer.activeUnits[value] =
                this.viewer.unitManager.unitData[value];
        }
        const input = document.createElement('input');
        input.size = 1;
        input.classList.add('table-cell-input');

        input.addEventListener('focusin', (() => {
			input.value = ''
		}).bind(this)); // prettier-ignore
        input.addEventListener('focusout', this.#onTextSubmit.bind(this));
        input.addEventListener('mouseup', () => {
            input.focus();
        });

        if (this.useDelta && value != deltaData) {
            input.classList.add('table-cell-input-delta');
        }
        const computedSize =
            String(value).length / this.sizeFactor + this.sizeModifier;

        input.style.minWidth = `${computedSize}em`;
        input.value = value;

        this.base.appendChild(input);

        return input;
    }

    #onBooleanSubmit() {
        const newValue = this.input.checked;

        try {
            this.viewer.unitManager.set(
                this.unitData.Name,
                this.attribute,
                newValue
            );
        } catch (error) {}

        this.viewer.load(this.viewer.tower);
    }

    #onNumberSubmit() {
        const newValue = this.input.value;

        try {
            if (newValue !== '' && Number.isFinite(+newValue))
                this.viewer.unitManager.set(
                    this.unitData.Name,
                    this.attribute,
                    newValue
                );
        } catch (error) {}

        this.viewer.load(this.viewer.tower);
    }

    #onTextSubmit() {
        const newValue = this.input.value;

        try {
            if (newValue !== '' || this.attribute !== 'Name')
                this.viewer.unitManager.set(
                    this.unitData.Name,
                    this.attribute,
                    newValue
                );
        } catch (error) {}

        this.viewer.load(this.viewer.tower);
    }

    #formatNumber(number) {
        switch (this.attribute) {
            case 'Cost':
            case 'NetCost':
            case 'Income':
                return `$${Intl.NumberFormat().format(number)}`;
        }
        return +(+number).toFixed(2);
    }
}
