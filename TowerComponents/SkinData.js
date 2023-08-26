import Tower from './Tower.js';
import Defaults from './Defaults.js';
import Upgrade from './Upgrade.js';
import Levels from './Levels.js';
import CalculatedManager from './CalculatedManager.js';
import BaseStats from './BaseStats.js';

class SkinData {
    /**
     *
     * @param {Tower} tower
     * @param {{
     * 	Defaults: {any},
     * 	Upgrades: [any]}} data
     */
    constructor(tower, name, data) {
        this.tower = tower;
        this.name = name;
        this.data = data;

        this.createData();
    }

    createData() {
        this.defaults = new Defaults(this.data.Defaults);
        this.upgrades = this.data.Upgrades.map(
            (upgrade) => new Upgrade(upgrade)
        );
        this.levels = new Levels(this);

        CalculatedManager.addCalculate(this);
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
        const baseStatA = this.getBaseStatForUpgrade(level);
        const baseStatB = this.getBaseStatForUpgrade(level + 1);

        return Object.entries(baseStatB.attributes)
            .filter(([key, valueB]) => {
                const valueA = baseStatA.attributes[key];
                return valueA != valueB;
            })
            .map(([key, valueB]) => {
                const valueA = baseStatA.attributes[key];
                return {
                    key: key,
                    original: valueA,
                    new: valueB,
                };
            });
    }

    getUpgradeChangeOutput(level, filter) {
        filter = filter ?? [
            'Damage',
            'Cooldown',
            'Range',
            'Hidden',
            'Flying',
            'Lead',
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

        return [
            ...changes,
            ...this.data.Upgrades[level].Stats.Extras.map(
                (extra) => `● ${extra}`
            ),
        ];
    }

    set(level, attribute, newValue) {
        if (level === 0) {
            this.defaults.set(attribute, newValue);
        } else {
            this.upgrades[level - 1].set(attribute, newValue);
        }

        this.createData();
    }
}
export default SkinData;
