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
            const alert = new Alert(`Malformed Data`, {
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

    getUpgradeChangeOutput(level, filter) {
        filter = filter ?? [
            'Damage',
            'Cooldown',
            'Range',
            'Hidden',
            'Flying',
            'Lead',
            'Income',
        ];

        const changes = this.getUpgradeChanges(level)
            .filter((value) => filter.includes(value.key))
            .map((value) => {
                if (['true', 'false'].includes(String(value.original))) {
                    return value.new ? `● ${value.key}` : `❌ ${value.key}`;
                } else {
                    return `${value.key}: ${value.original} → ${value.new}`;
                }
            });

        const extras = this.data.Upgrades[level].Stats.Extras ?? [];
        return [...changes, ...extras.map((extra) => `● ${extra}`)];
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
