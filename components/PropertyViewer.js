import ToggleButton from './ToggleButton.js';
import CalculatedManager from '../TowerComponents/CalculatedManager.js';

export default class PropertyViewer {
    constructor(viewer, root) {
        this.viewer = viewer;
        this.root = root;
        this.liClasses = ['nav-item', 'position-relative', 'mb-1'];
        this.buttonClasses = ['btn', 'btn-sm', 'w-100', 'text-white'];
        this.activeButtonClass = 'btn-outline-secondary';
        this.inactiveButtonClass = 'btn-outline-dark';
        this.disabled = [
            'LimitDPS',
            'LimitNetCost',
            'Value',
            'Coverage',
            'BossPotential',
            'LimitBossPotential',
        ];
        this.baseProperties = [
            'Damage',
            'Cooldown',
            'Range',
            'Hidden',
            'Flying',
            'Lead',
            'Cost',
        ];

        this.allBtn = document.getElementById('property-all');
        this.baseBtn = document.getElementById('property-base');
        this.extraBtn = document.getElementById('property-extra');
        this.calcBtn = document.getElementById('property-calc');

        this.allBtn.addEventListener('click', this.toggleAll.bind(this));
        this.baseBtn.addEventListener('click', this.toggleBase.bind(this));
        this.extraBtn.addEventListener('click', this.toggleExtra.bind(this));
        this.calcBtn.addEventListener('click', this.toggleCalc.bind(this));
    }

    getProperties() {
        const levelData = this.viewer.getActiveSkin().levels;
        return [...levelData.attributes, ...levelData.complexAttributes];
    }

    getExtraProperties() {
        return this.getProperties()
            .filter(((prop) => !this.baseProperties.includes(prop)).bind(this))
            .filter(
                ((prop) => !this.getCalculatedProperties().includes(prop)).bind(
                    this
                )
            )
            .filter((prop) => prop !== 'Level');
    }

    getCalculatedProperties() {
        return Object.keys(CalculatedManager.calculated).filter(
            (key) => CalculatedManager.calculated[key]?.Type !== 'Override'
        );
    }

    toggleAll() {
        if (this.disabled.length == 0) {
            this.getProperties().forEach(this.hide.bind(this));
        } else {
            this.disabled = [];
        }
        this.viewer.reload();
    }

    toggleBase() {
        const someBaseStatDisabled = this.baseProperties.some((prop) =>
            this.disabled.includes(prop)
        );

        if (someBaseStatDisabled) {
            this.show('Level');
            this.baseProperties.forEach(this.show.bind(this));
        } else {
            this.baseProperties.forEach(this.hide.bind(this));
        }

        this.viewer.reload();
    }

    toggleExtra() {
        const extraProps = this.getExtraProperties();

        const someExtraStatDisabled = extraProps.some((prop) =>
            this.disabled.includes(prop)
        );

        if (someExtraStatDisabled) {
            this.show('Level');
            extraProps.forEach(this.show.bind(this));
        } else {
            extraProps.forEach(this.hide.bind(this));
        }

        this.viewer.reload();
    }

    toggleCalc() {
        const calcProps = this.getCalculatedProperties();
        const someCalcStatDisabled = calcProps.some((prop) =>
            this.disabled.includes(prop)
        );

        if (someCalcStatDisabled) {
            this.show('Level');
            calcProps.forEach(this.show.bind(this));
        } else {
            calcProps.forEach(this.hide.bind(this));
        }

        this.viewer.reload();
    }

    isDisabled(property) {
        return this.disabled.includes(property);
    }

    hide(property) {
        if (!this.isDisabled(property)) {
            this.disabled.push(property);
        }
    }

    show(property) {
        if (this.isDisabled(property)) {
            this.disabled = this.disabled.filter((v) => v !== property);
        }
    }

    createButton(innerText) {
        const listElement = document.createElement('li');
        const button = document.createElement('button');

        const toggleButton = new ToggleButton(button, {
            state: !this.isDisabled(innerText),
            activeClass: this.activeButtonClass,
            inactiveClass: this.inactiveButtonClass,
        });

        toggleButton.element.addEventListener(
            'enabled',
            ((e) => {
                this.show(innerText);
                this.viewer.reload();
            }).bind(this)
        );
        toggleButton.element.addEventListener('disabled', ((e) => {
			this.hide(innerText);
			this.viewer.reload();
		}).bind(this)); // prettier-ignore

        this.liClasses.forEach((className) =>
            listElement.classList.add(className)
        );
        this.buttonClasses.forEach((className) =>
            button.classList.add(className)
        );

        button.innerText = innerText;

        listElement.appendChild(button);
        return listElement;
    }

    createButtons(attributes) {
        this.root.innerHTML = '';

        attributes.forEach((attributeName) => {
            const button = this.createButton(attributeName);
            this.root.appendChild(button);
        });
    }
}
