import Tower from './Tower.js';
import Defaults from './Defaults.js';
import Upgrade from './Upgrade.js';
import Levels from './Levels.js';
import CalculatedManager from './CalculatedManager.js';
import BaseStats from './BaseStats.js';
import Locator from './Locator.js';

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
        this.locator = new Locator();
        this.defaults = new Defaults(this.data.Defaults, this.locator);
        this.upgrades = this.data.Upgrades.map(
            (upgrade) => new Upgrade(upgrade, this.locator)
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
