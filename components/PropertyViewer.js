import ToggleButton from './ToggleButton.js';
import CalculatedManager from '../TowerComponents/CalculatedManager.js';

export default class PropertyViewer {
    constructor(viewer, root) {
        this.viewer = viewer;
        this.root = root;
        this.userModified = false;
        this.liClasses = ['nav-item', 'position-relative', 'mb-1'];
        this.buttonClasses = ['btn', 'btn-sm', 'w-100', 'text-white'];
        this.activeButtonClass = 'btn-outline-secondary';
        this.inactiveButtonClass = 'btn-outline-dark';
        // stuffs that's off limits by default
        this.defaultDisabled = [
            'LimitDPS',
            'LimitNetCost',
            'Value',
            'Coverage',
            'BossPotential',
            'LimitBossPotential',
            'BossValue',
            'BookAim',
            'Summon_Debounce',
            'BookDebounce',
            'GraveCooldown',
            'MustAim',
            'AggregateUnitDPS',
            'EnemyBuff',
            'Velocity',
            'BleedCollaspeDamage (10HP)',
            'BleedCollaspeDamage (1000HP)',
            'BleedCollaspeDamage (10000HP)',
            'BleedCollaspeDamage (100000HP)',
            'BleedCollaspeDamage (1000000HP)',
            'BleedDamageTick (10HP)',
            'BleedDamageTick (1000HP)',
            'BleedDamageTick (10000HP)',
            'BleedDamageTick (100000HP)',
            'BleedDamageTick (1000000HP)',
            'AnimTimes',
            'SummonDebounce',
            'BookDebounce',
        ];
        this.disabled = [...this.defaultDisabled];
        this.towerSpecificDisabled = []; // this keeps track of tower specific disables
        // stuffs we never show
        this.hidden = [
            'NoTable',
            'SideLevel',
            'Abilities.0',
            'Abilities',
            'Note',
        ];
        // the basic stats everyone cares about
        this.baseProperties = [
            'Damage',
            'Cooldown',
            'Range',
            'Flying',
            'Lead',
            'Cost',
        ];

        this.allBtn = document.getElementById('property-all');
        this.baseBtn = document.getElementById('property-base');
        this.extraBtn = document.getElementById('property-extra');
        this.calcBtn = document.getElementById('property-calc');

        // this hooks the button clicks
        this.allBtn.addEventListener('click', this.toggleAll.bind(this));
        this.baseBtn.addEventListener('click', this.toggleBase.bind(this));
        this.extraBtn.addEventListener('click', this.toggleExtra.bind(this));
        this.calcBtn.addEventListener('click', this.toggleCalc.bind(this));

        // slave table's configs - all in one place
        this.unitDisabled = [
        ];
        
        this.unitHidden = [
            '_towerName',
            '_skinName',
        ]; 
        
        this.unitBaseProperties = [
            'Name',
            'Damage',
            'Health', 
            'Speed',
            'Cooldown',
            'Range'
        ];

        this.viewSection = document.getElementById('property-viewer-section');
        const existingBtnGroup = this.viewSection.querySelector('.btn-group');
        const tabsGroup = document.createElement('div');
        tabsGroup.className = 'btn-group w-100 p-2 pt-0';
        
        // tower button
        this.towerPropsBtn = document.createElement('button');
        this.towerPropsBtn.id = 'property-tower';
        this.towerPropsBtn.className = 'btn btn-sm btn-dark';
        this.towerPropsBtn.textContent = 'Tower';
        this.towerPropsBtn.addEventListener('click', this.showTowerProperties.bind(this));
        
        // unit button
        this.unitPropsBtn = document.createElement('button');
        this.unitPropsBtn.id = 'property-unit';
        this.unitPropsBtn.className = 'btn btn-sm btn-outline-dark';
        this.unitPropsBtn.textContent = 'Unit';
        this.unitPropsBtn.addEventListener('click', this.showUnitProperties.bind(this));

        tabsGroup.appendChild(this.towerPropsBtn);
        tabsGroup.appendChild(this.unitPropsBtn);

        this.viewSection.insertBefore(tabsGroup, existingBtnGroup);
        this.currentView = 'tower'; // track current view "tower" or "unit"
    }

    // tower checks
    isFarmTower() {
        const activeSkin = this.viewer.getActiveSkin();
        if (!activeSkin) return false;
        return activeSkin.tower.name === 'Farm';
    }

    isMilitaryBaseTower() {
        const activeSkin = this.viewer.getActiveSkin();
        if (!activeSkin) return false;
        return activeSkin.tower.name === 'Military Base';
    }

    isMechaBaseTower() {
        const activeSkin = this.viewer.getActiveSkin();
        if (!activeSkin) return false;
        return activeSkin.tower.name === 'Mecha Base';
    }

    isTrapperTower() {
        const activeSkin = this.viewer.getActiveSkin();
        if (!activeSkin) return false;
        return activeSkin.tower.name === 'Trapper';
    }

    isBiologistTower() {
        const activeSkin = this.viewer.getActiveSkin();
        if (!activeSkin) return false;
        return activeSkin.tower.name === 'Biologist';
    }

    isMercenaryBaseTower() {
        const activeSkin = this.viewer.getActiveSkin();
        if (!activeSkin) return false;
        return activeSkin.tower.name === 'Mercenary Base';
    }

    isSwarmerTower() {
        const activeSkin = this.viewer.getActiveSkin();
        if (!activeSkin) return false;
        return activeSkin.tower.name === 'Swarmer';
    }
    
    isDJTower() {
        const activeSkin = this.viewer.getActiveSkin();
        if (!activeSkin) return false;
        return activeSkin.tower.name === 'DJ Booth';
    }

    isArcherTower() {
        const activeSkin = this.viewer.getActiveSkin();
        if (!activeSkin) return false;
        return activeSkin.tower.name === 'Archer';
    }

    isElfCampTower() {
        const activeSkin = this.viewer.getActiveSkin();
        if (!activeSkin) return false;
        return activeSkin.tower.name === 'Elf Camp';
    }

    // grab all properties for the current tower
    getProperties() {
        const levelData = this.viewer.getActiveSkin().levels;
        return [...levelData.attributes, ...levelData.complexAttributes];
    }

    // filters
    getExtraProperties() {
        return this.getProperties()
            .filter(prop => !this.baseProperties.includes(prop))
            .filter(prop => !this.getCalculatedProperties().includes(prop))
            .filter(prop => prop !== 'Level');
    }

    // get the fancy calculated stats
    getCalculatedProperties() {
        return Object.keys(CalculatedManager.calculated).filter(
            key => CalculatedManager.calculated[key]?.Type !== 'Override'
        );
    }

    // show or hide everything with one click
    toggleAll() {
        if (this.disabled.length == 0) {
            this.getProperties().forEach(this.hide.bind(this));
        } else {
            this.disabled = [];
        }
        this.viewer.reload();
    }

    // toggle just the basic stats
    toggleBase() {
        const someBaseStatDisabled = this.baseProperties.some(prop =>
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

    // toggle the extra stuff
    toggleExtra() {
        const extraProps = this.getExtraProperties();
        const someExtraStatDisabled = extraProps.some(prop =>
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

    // toggle the calcs
    toggleCalc() {
        const calcProps = this.getCalculatedProperties();
        const someCalcStatDisabled = calcProps.some(prop =>
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

    // is this property off limits?
    isDisabled(property) {
        return this.currentView === 'tower' 
            ? this.disabled.includes(property)
            : this.unitDisabled.includes(property);
    }

    // should this property stay hidden?
    isHidden(property) {
        if (this.isFarmTower() && (property === 'Damage' || property === 'Cooldown' || property === 'Hidden' || property === 'Flying' || property === 'Lead')) {
            return true;
        }
        
        if ((this.isMilitaryBaseTower() || this.isMechaBaseTower() || this.isElfCampTower()) && (property === 'Damage' || property === 'Cooldown' || property === 'Range' || property === 'Hidden' || property === 'Flying' || property === 'Lead')) {
            return true;
        }
        
        if ((this.isTrapperTower() || this.isSwarmerTower()) && property === 'Damage') {
            return true;
        }
        
        if (this.isMercenaryBaseTower() || this.isBiologistTower() && (property === 'Damage' || property === 'Cooldown' || property === 'Hidden' || property === 'Flying' || property === 'Lead')) {
            return true;
        }

        if (this.isDJTower() && (property === 'Damage' || property === 'Cooldown')) {
            return true;
        }

        if (this.isArcherTower() && (property === 'Hidden' || property === 'Flying' || property === 'Lead')) {
            return true;
        }
        
        return this.hidden.includes(property);
    }

    // hide said property
    hide(property) {
        if (!this.isDisabled(property)) {
            this.disabled.push(property);
        }
    }

    // show this property and let users override em
    show(property, userAction = false) {
        if (!userAction) {
            // Tower-specific rules kick in if not a user click
            if (this.isFarmTower() && (property === 'Damage' || property === 'Cooldown' || property === 'Hidden' || property === 'Flying' || property === 'Lead')) {
                this.hide(property);
                return;
            }
        } else {
            // user clicked it, so clear it from tower specific disables
            const index = this.towerSpecificDisabled.indexOf(property);
            if (index !== -1) {
                this.towerSpecificDisabled.splice(index, 1);
            }
        }
        
        if (this.isDisabled(property)) {
            console.log(`Removing ${property} from disabled list`);
            this.disabled = this.disabled.filter(v => v !== property);
        }
    }

    // fancy button lololol
    createButton(innerText) {
        if (this.isHidden(innerText)) {
            this.hide(innerText);
            return null;
        }

        const listElement = document.createElement('li');
        const button = document.createElement('button');
        
        this.buttonClasses.forEach(className =>
            button.classList.add(className)
        );
        
        const toggleButton = new ToggleButton(button, {
            state: !this.isDisabled(innerText),
            activeClass: this.activeButtonClass,
            inactiveClass: this.inactiveButtonClass,
        });

        toggleButton.element.addEventListener(
            'enabled',
            ((e) => {
                console.log(`Enabling property: ${innerText}`);
                this.show(innerText, true); // user clicked it
                this.viewer.reload();
                console.log(`Property ${innerText} state after show: ${this.isDisabled(innerText) ? 'disabled' : 'enabled'}`);
            }).bind(this)
        );
        
        toggleButton.element.addEventListener(
            'disabled', 
            ((e) => {
                console.log(`Disabling property: ${innerText}`);
                this.hide(innerText);
                this.viewer.reload();
                console.log(`Property ${innerText} state after hide: ${this.isDisabled(innerText) ? 'disabled' : 'enabled'}`);
            }).bind(this)
        );

        this.liClasses.forEach(className =>
            listElement.classList.add(className)
        );

        button.innerText = innerText;
        listElement.appendChild(button);
        return listElement;
    }

    // make buttons for all the attributes
    createButtons(attributes) {
        if (!this.userModified) {
            this.disabled = [...this.defaultDisabled];
            this.userModified = true;
        } else {
            // clear out old tower speicfic disables when switching towers
            this.disabled = this.disabled.filter(prop => !this.towerSpecificDisabled.includes(prop));
            this.towerSpecificDisabled = [];
        }
        
        // apply the tower specific rules
        this.applyTowerSpecificRules();
        
        this.root.innerHTML = '';

        attributes.forEach(attributeName => {
            const button = this.createButton(attributeName);
            if (button) {
                this.root.appendChild(button);
            }
        });
    }

    // set up tower specific hiding rules
    applyTowerSpecificRules() {
        if (this.isFarmTower()) {
            ['Damage', 'Cooldown', 'Hidden', 'Flying', 'Lead'].forEach(prop => {
                this.hideForTowerType(prop);
            });
        }
        
        if (this.isMilitaryBaseTower() || this.isMechaBaseTower() || this.isElfCampTower()) {
            ['Damage', 'Cooldown', 'Range', 'Hidden', 'Flying', 'Lead'].forEach(prop => {
                this.hideForTowerType(prop);
            });
        }
        
        if (this.isTrapperTower() || this.isSwarmerTower()) {
            this.hideForTowerType('Damage');
        }
        
        if (this.isMercenaryBaseTower()) {
            ['Damage', 'Cooldown', 'Hidden', 'Flying', 'Lead'].forEach(prop => {
                this.hideForTowerType(prop);
            });
        }
        
        if (this.isDJTower()) {
            ['Damage', 'Cooldown'].forEach(prop => {
                this.hideForTowerType(prop);
            });
        }
        
        if (this.isArcherTower()) {
            ['Hidden', 'Flying', 'Lead'].forEach(prop => {
                this.hideForTowerType(prop);
            });
        }
    }

    // hide properties and mark it as tower-specific
    hideForTowerType(property) {
        if (!this.isDisabled(property)) {
            this.disabled.push(property);
            this.towerSpecificDisabled.push(property);
        }
    }

    // methods to switch between tower and unit property views
    showTowerProperties() {
        this.towerPropsBtn.classList.remove('btn-outline-dark');
        this.towerPropsBtn.classList.add('btn-dark');
        this.unitPropsBtn.classList.remove('btn-dark');
        this.unitPropsBtn.classList.add('btn-outline-dark');
        this.currentView = 'tower';
        this.loadCurrentProperties();
    }

    showUnitProperties() {
        this.unitPropsBtn.classList.remove('btn-outline-dark');
        this.unitPropsBtn.classList.add('btn-dark');
        this.towerPropsBtn.classList.remove('btn-dark');
        this.towerPropsBtn.classList.add('btn-outline-dark');
        this.currentView = 'unit';
        this.loadCurrentProperties();
    }
    
    // load appropriate properties based on current view
    loadCurrentProperties() {
        if (this.currentView === 'tower') {
            const skinData = this.viewer.getActiveSkin();
            if (skinData) {
                this.createButtons([
                    ...skinData.levels.attributes,
                    ...skinData.levels.complexAttributes
                ]);
            }
        } else {
            this.createUnitButtons();
        }
    }

    initializeUnitProperties() {
        if (this.currentView === 'unit') {
            this.createUnitButtons();
        }
    }

    getUnitAttributes() {
        if (!this.viewer.activeUnits) return [];
        
        const attributes = new Set();
        this.unitBaseProperties.forEach(attr => attributes.add(attr));
        
        Object.values(this.viewer.activeUnits).forEach(unit => {
            if (unit.attributeNames) {
                unit.attributeNames.forEach(attr => attributes.add(attr));
            }
        });
        
        return Array.from(attributes);
    }

    createUnitButtons() {
        this.root.innerHTML = '';
        
        // check if units exist
        if (!this.viewer.activeUnits || Object.keys(this.viewer.activeUnits).length === 0) {
            const noUnitsMessage = document.createElement('div');
            noUnitsMessage.className = 'text-muted p-3 text-center';
            noUnitsMessage.textContent = 'There is no slave table for this tower.';
            this.root.appendChild(noUnitsMessage);
            return;
        }
        
        const unitAttributes = this.getUnitAttributes();
        unitAttributes.forEach(attributeName => {
            const button = this.createUnitPropertyButton(attributeName);
            if (button) {
                this.root.appendChild(button);
            }
        });
    }

    // toggle buttons for slave properties
    createUnitPropertyButton(innerText) {
        // skip hidden properties (check both common hidden and unit-specific hidden)
        if (this.hidden.includes(innerText) || this.unitHidden.includes(innerText)) {
            return null;
        }

        const listElement = document.createElement('li');
        const button = document.createElement('button');
        
        this.buttonClasses.forEach(className =>
            button.classList.add(className)
        );
        
        const toggleButton = new ToggleButton(button, {
            state: !this.unitDisabled.includes(innerText),
            activeClass: this.activeButtonClass,
            inactiveClass: this.inactiveButtonClass,
        });

        toggleButton.element.addEventListener(
            'enabled',
            ((e) => {
                console.log(`Enabling unit property: ${innerText}`);
                this.unitDisabled = this.unitDisabled.filter(v => v !== innerText);
                this.refreshUnitTable();
            }).bind(this)
        );
        
        toggleButton.element.addEventListener(
            'disabled', 
            ((e) => {
                console.log(`Disabling unit property: ${innerText}`);
                if (!this.unitDisabled.includes(innerText)) {
                    this.unitDisabled.push(innerText);
                }
                this.refreshUnitTable();
            }).bind(this)
        );

        this.liClasses.forEach(className =>
            listElement.classList.add(className)
        );

        button.innerText = innerText;
        listElement.appendChild(button);
        return listElement;
    }

    // refresh slave table when properties change
    refreshUnitTable() {
        if (this.viewer && this.viewer.unitTable) {
            this.viewer.unitTable.load(this.viewer.activeUnits, {
                ignore: this.unitDisabled
            });
        }
    }
}