import Viewer from './Viewer.js';
import Unit from '../TowerComponents/Unit.js';
export default class TableUnitInput {
    /**
     *
     * @param {{
	 * unitName: string,
	 * attribute: string,
	 * unitData: Unit,
     * deltaData: Unit,
	 * viewer: Viewer,
	 * }} data
 
     * @returns
     */
    constructor(data) {
        this.base = this.#createBase();

        this.name = data.unitName;
        this.attribute = data.attribute;
        this.unitData = data.unitData;
        this.deltaData = data.deltaData;
        this.viewer = data.viewer;

        this.useDelta = this.viewer.buttonDeltaButton.state;

        this.sizeFactor = 1.35;
        this.sizeDeltaModifier = 0;
        this.sizeModifier = 0;
    }

    createInput() {
        const cellData = this.unitData.attributes[this.attribute];
        const deltaData = this.deltaData.attributes[this.attribute];

        const input = this.#getInput(cellData, deltaData);

        this.input = input;
    }

    #createBase() {
        const td = document.createElement('td');
        td.classList.add('table-cell');

        return td;
    }

    #getInput(value, deltaValue) {
        if (value === undefined) return this.#createNullInput(value);

        if (['true', 'false'].includes(String(value))) {
            return this.#createBooleanInput(value, deltaValue);
        }

        if (Number.isFinite(+value)) {
            return this.#createNumberInput(value, deltaValue);
        }

        return this.#createTextInput(value, deltaValue);
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
        if (this.useDelta)
            outputValue =
                String(outputValue) +
                String(this.#getDelta(value, deltaData, input));

        const computedSize =
            String(outputValue).length / this.sizeFactor + this.sizeModifier;

        input.style.minWidth = `${computedSize}em`;
        input.value = outputValue;

        form.appendChild(input);
        this.base.appendChild(form);

        return input;
    }

    #createTextInput(value, deltaData) {
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
            this.unitData.set(this.attribute, newValue);
            this.viewer.unitManager.save();
        } catch (error) {
            console.warn(error);
        }

        this.viewer.reload();
    }

    #onNumberSubmit() {
        const newValue = this.input.value;

        try {
            if (newValue !== '' && Number.isFinite(+newValue)) {
                this.unitData.set(this.attribute, +newValue);
                this.viewer.unitManager.save();
            }
        } catch (error) {
            console.warn(error);
        }

        this.viewer.reload();
    }

    #onTextSubmit() {
        const newValue = this.input.value;

        try {
            if (newValue !== '' || this.attribute !== 'Name') {
                this.unitData.set(this.attribute, newValue);
                this.viewer.unitManager.save();
            }
        } catch (error) {
            console.warn(error);
        }

        this.viewer.reload();
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

    flipped = [
        'Cooldown',
        'Cost',
        'CostEfficiency',
        'NetCost',
        'ChargeTime',
        'LaserCooldown',
        'BombTime',
        'MissileCooldown',
        'SpinDuration',
        'BurstCool',
        'ReloadSpeed',
        'TickRate',
    ];

    #getDelta(cellData, deltaData, input) {
        const difference = cellData - deltaData;
        if (difference === 0) return '';

        const sign = Math.sign(difference) > 0 ? '+' : '-';
        const absDifference = Math.abs(difference);

        const flipFactor = this.flipped.includes(this.attribute) ? -1 : 1;

        if (difference * flipFactor > 0) {
            input.classList.add('table-cell-input-delta-positive');
        } else {
            input.classList.add('table-cell-input-delta-negative');
        }
        this.sizeModifier = this.sizeDeltaModifier;

        return ` (${sign}${this.#formatNumber(absDifference)})`;
    }
}
