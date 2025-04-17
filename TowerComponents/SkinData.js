import Tower from './Tower.js';
import Defaults from './Defaults.js';
import Upgrade from './Upgrade.js';
import Levels from './Levels.js';
import CalculatedManager from './CalculatedManager.js';
import BaseStats from './BaseStats.js';
import Locator from './Locator.js';
import Alert from '../components/Alert.js';

class SkinData {
    /**
     *
     * @param {Tower} tower
     * @param {{
     * 	Defaults: {any},
     * 	Upgrades: [any]}} data
     */
    constructor(tower, name, data, unitKey) {
        this.tower = tower;
        this.name = name;
        this.data = data;
        this.calculatedManager = new CalculatedManager(unitKey ?? 'units');

        this.createData();
    }

    createData() {
        this.locator = new Locator();

        this.defaults = new Defaults(this.data.Defaults, this.locator);

        this.upgrades = this.data.Upgrades.map(
            (upgrade) => new Upgrade(upgrade, this.locator)
        );

        this.levels = new Levels(this);

        this.calculatedManager.addCalculate(this);
    }

    getAttributeType(attributeName) {
        return typeof this.levels.levels[this.levels.levels.length - 1][
            attributeName
        ];
    }

    removeAttribute(attributeName) {
        if (!this.locator.hasLocation(attributeName)) {
            const alert = new Alert(`Attribute not found`, {
                alertStyle: 'alert-warning',
            });

            alert.fire();
            return false;
        }

        for (const baseStat of [this.defaults, ...this.upgrades]) {
            const success = baseStat.removeAttribute(attributeName);

            if (!success) return false;
        }
        return true;
    }

    addAttribute(attributeName, defaultValue) {
        if (attributeName === '' || defaultValue === undefined) {
            const alert = new Alert(`Empty data, reloaded table instead`, {
                alertStyle: 'alert-warning',
            });

            alert.fire();
            return false;
        }

        for (const baseStat of [this.defaults, ...this.upgrades]) {
            const success = baseStat.addNewAttribute(
                attributeName,
                defaultValue
            );

            if (!success) return false;
        }
        return true;
    }

    getOccurrencesForAttribute(attributeName) {
        const occurrences = [];

        this.levels.levels.forEach((level) => {
            if (
                level[attributeName] === undefined ||
                level[attributeName] === null
            )
                return;

            occurrences.push(level[attributeName]);
        });

        return [...new Set(occurrences)];
    }

    /**
     * @returns {BaseStats}
     */
    getBaseStatForUpgrade(level) {
        if (level === 0) {
            return this.defaults;
        } else {
            return this.upgrades[level - 1];
        }
    }

    getUpgradeChanges(level) {
        const baseStatB = this.getBaseStatForUpgrade(level + 1);

        return Object.keys(baseStatB.attributes)
            .map((key) => {
                const valueA = this.levels.getCell(level, key);
                const valueB = this.levels.getCell(level + 1, key);
                return {
                    key: key,
                    original: valueA,
                    new: valueB,
                };
            })
            .filter((value) => value.original != value.new);
    }

    getUpgradeChangeOutput(upgradeIndex, filter) {
        filter = filter ?? [
            'Damage',
            'Cooldown',
            'Range',
            'Hidden',
            'Flying',
            'Lead',
            'Income',
        ];

        const changes = this.getUpgradeChanges(upgradeIndex)
            .filter((value) => filter.includes(value.key))
            .map((value) => {
                let icon = '';
                switch (value.key) {
                    case 'Damage':
                        icon = '<img src="htmlassets/DamageIcon.png" width="16" class="align-text-bottom me-1">';
                        break;
                    case 'Cooldown':
                        icon = '<img src="htmlassets/CooldownIcon.png" width="16" class="align-text-bottom me-1">';
                        break;
                    case 'Range':
                        icon = '<img src="htmlassets/RangeIcon.png" width="16" class="align-text-bottom me-1">';
                        break;
                    case 'Hidden':
                        icon = '<img src="htmlassets/HiddenIcon.png" width="16" class="align-text-bottom me-1 linvert">';
                        break;
                    case 'Flying':
                        icon = '<img src="htmlassets/FlyingIcon.png" width="16" class="align-text-bottom me-1 linvert">';
                        break;
                    case 'Lead':
                        icon = '<img src="htmlassets/LeadIcon.png" width="16" class="align-text-bottom me-1 linvert">';
                        break;
                    case 'Income':
                        icon = '<img src="htmlassets/IncomeIcon.png" width="16" class="align-text-bottom me-1">';
                        break;
                }
    
                if (['Hidden', 'Flying', 'Lead'].includes(value.key)) {
                    return value.new ? `${icon}${value.key}` : `❌ ${icon}${value.key}`;
                } else if (['true', 'false'].includes(String(value.original))) {
                    return value.new ? `● ${icon}${value.key}` : `❌ ${icon}${value.key}`;
                } else {
                    return `${icon}${value.key}: ${value.original} → ${value.new}`;
                }
            });
    
        const extras = this.upgrades[upgradeIndex]?.upgradeData?.Stats?.Extras || [];
        
        const formattedExtras = extras.map(extra => {
            // checks if the extra is a collapsible group tag
            if (extra.match(/^\[Collapsible(\d*):?(.*?)\]/)) {
                return extra;
            } else {
                return `● ${extra}`; // add bullet point to regular extras
            }
        });
        
        return [...changes, ...formattedExtras];
    }

    get attributes() {
        return Object.keys(this.locator.locations);
    }

    set(level, attribute, newValue) {
        if (level === 0) {
            this.defaults.set(attribute, newValue);
        } else {
            this.upgrades[level - 1].set(attribute, newValue);
        }

        this.createData();
    }

    get(level, attribute) {
        if (level === 0) {
            return this.defaults.get(attribute);
        } else {
            return this.upgrades[level - 1].get(attribute);
        }
    }
}
export default SkinData;
