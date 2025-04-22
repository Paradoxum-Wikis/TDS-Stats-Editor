import Levels from '../TowerComponents/Levels.js';
import Viewer from './Viewer/index.js';
import { towerRegistry, TowerRegistry } from '../TowerComponents/TowerRegistry.js';

export default class TableInput {
    /**
	 * ({
		level: level,
		attribute: attribute,
		towerLevels: levels,
		referenceLevels: deltaLevels,
		useDelta: this.viewer.buttonDeltaButton.state,
		viewer: this.viewer,
	})
	 */
    /**
     *
     * @param {{
	 * level: Number,
	 * attribute: String,
	 * towerLevels: Levels,
	 * referenceLevels: Levels,
	 * useDelta: Boolean,
	 * viewer: Viewer,
	 * }} data
 
     * @returns
     */
    constructor(data) {
        this.base = this.#createBase();

        this.level = data.level;
        this.attribute = data.attribute;
        this.towerLevels = data.towerLevels;
        this.referenceLevels = data.referenceLevels;
        this.useDelta = data.useDelta;
        this.viewer = data.viewer;
        this.isComplex = data.isComplex;

        this.sizeFactor = 1.35;
        this.sizeDeltaModifier = 0;
        this.sizeModifier = 0;
    }

    createInput() {
        const cellData = this.towerLevels.getCell(this.level, this.attribute);
        const deltaData = this.referenceLevels.getCell(
            this.level,
            this.attribute
        );

        const input = this.#getInput(cellData, deltaData);

        this.input = input;
    }

    #createBase() {
        const td = document.createElement('td');
        td.classList.add('table-cell');

        return td;
    }

    #getInput(value, deltaData) {
        if (['true', 'false'].includes(String(value))) {
            return this.#createBooleanInput(value, deltaData);
        }

        if (Number.isFinite(+value)) {
            return this.#createNumberInput(value, deltaData);
        }

        return this.#createTextInput(value, deltaData);
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

    // .zero-value css
    if (value === 0 && this.attribute !== "Level") {
        input.classList.add('zero-value');
    }

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

        const computedSize = String(value).length / this.sizeFactor;

        input.style.minWidth = `${computedSize}em`;
        input.value = value;

        this.base.appendChild(input);

        return input;
    }

    #onBooleanSubmit() {
        const newValue = this.input.checked;
        this.towerLevels.set(this.level, this.attribute, newValue);
        this.#handleSubmission();
    }

    #onNumberSubmit() {
        const newValue = this.input.value;
        if (newValue !== '' && Number.isFinite(+newValue)) {
            this.towerLevels.set(this.level, this.attribute, +newValue);
        }
        this.#handleSubmission();
    }

    #onTextSubmit() {
        const newValue = this.input.value;
        if (newValue != '') {
            this.towerLevels.set(this.level, this.attribute, newValue);
        }
        this.#handleSubmission();
    }

    #handleSubmission() {
        this.viewer.reload();
        
        if (this.tower && this.tower.name) {
            TowerRegistry.log(`TableInput updating registry for ${this.tower.name} after value change`);
            towerRegistry.updateTower(this.tower.name, this.tower.json);
        }
    }

    #formatNumber(value) {
        const forceUSFormat = window.state?.settings?.forceUSNumbers !== false;
        const formatter = forceUSFormat ? Intl.NumberFormat('en-US') : Intl.NumberFormat('ru-RU');
        const showSeconds = window.state?.settings?.showSeconds !== false;

        // allows cooldown to have 3 decimal places
        if (this.attribute === 'Cooldown') {
            const formatted = formatter.format(+(+value).toFixed(3));
            return formatted + (showSeconds ? 's' : '');
        }

        switch (this.attribute) {
            case 'Cost':
            case 'NetCost':
            case 'Income':
            case 'LimitNetCost':
            case 'CostEfficiency':
            case 'MaxCostEfficiency':
            case 'IncomeEfficiency':
            case 'IncomePerSecond':
            case 'TotalIncomePerSecond':
                return `$${formatter.format(+(+value).toFixed(2))}`; 
            
            case 'MaxDefMelt':
            case 'DefenseMelt':
            case 'SlowdownPerHit':
            case 'MaxSlow':
            case 'RangeBuff':
            case 'FirerateBuff':
            case 'CallToArmsBuff':
            case 'ThornPower':
            case 'DamageBuff':
            case 'Defense':
            case 'CriticalMultiplier':
            case 'AftershockMultiplier':
            case 'SpeedMultiplier':
                return formatter.format(value) + '%';
    
            case 'BuffLength':
            case 'BurnTime':
            case 'FreezeTime':
            case 'Duration':
            case 'ChargeTime':
            case 'LaserCooldown':
            case 'MissileCooldown':
            case 'BurstCooldown':
            case 'RevTime':
            case 'ReloadTime':    
            case 'DetectionBuffLength':
            case 'ComboLength':
            case 'ComboCooldown':
            case 'KnockbackCooldown':
            case 'Spawnrate':
            case 'BuildTime':
            case 'Cooldown':
            case 'SlowdownTime':
            case 'AftershockCooldown':
            case 'PoisonLength':
            case 'AimTime':
            case 'EquipTime':
            case 'BuildDelay':
            case 'BombTime':
                return formatter.format(value) + (showSeconds ? 's' : '');
        }
    
        return formatter.format(+(+value).toFixed(2));
    }

    flipped = [
        'Cooldown',
        'Cost',
        'CostEfficiency',
        'MaxCostEfficiency',
        'NetCost',
        'ChargeTime',
        'LaserCooldown',
        'BombTime',
        'MissileCooldown',
        'SpinDuration',
        'BurstCooldown',
        'ReloadSpeed',
        'TickRate',
        'BuildTime',
        'RevTime',
        'ReloadTime',
        'ComboCooldown',
        'KnockbackCooldown',
        'Spawnrate',
        'AftershockCooldown',
        'PoisonLength',
        'AimTime',
        'EquipTime',
        'BuildDelay',
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
