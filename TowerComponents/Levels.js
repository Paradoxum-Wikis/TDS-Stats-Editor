import SkinData from './SkinData.js';
import Level from './Level.js';

class Levels {
    /**
     *
     * @param {SkinData} skinData
     */
    constructor(skinData) {
        this.skinData = skinData;
        this.attributes = this.#getAttributes();
        this.levels = [];

        this.addLevel(skinData.defaults.attributes);

        this.skinData.upgrades.forEach((upgrade) =>
            this.addLevel(upgrade.attributes)
        );
    }

    #getAttributes() {
        const attributes = ['Level'];

        const processAttribute = (attributeName) => {
            if (attributes.includes(attributeName)) return;
            attributes.push(attributeName);
        };

        this.skinData.defaults.attributeNames.forEach(processAttribute);
        this.skinData.upgrades.forEach((level) =>
            level.attributeNames.forEach(processAttribute)
        );

        return attributes;
    }

    addLevel(data) {
        this.levels.push(new Level(this, data));
    }

    getCell(level, property) {
        if (level < 0 || level > this.levels.length) return null;

        return this.levels[level][property];
    }

    set(level, attribute, newValue) {
        this.skinData.set(level, attribute, newValue);
    }

    #format(cell, header) {
        switch (header) {
            case 'Income':
            case 'Cost':
            case 'NetCost':
                return `$${cell.toFixed(0)}`;
            default:
                break;
        }

        switch (typeof cell) {
            case 'number':
                return Number.parseFloat(cell.toFixed(2)).toString();
            default:
                return cell;
        }
    }

    getCSV() {
        const table = [[...this.attributes]];

        this.levels.forEach((level) => {
            let levelData = this.attributes.map((header) =>
                this.#format(level[header], header)
            );

            table.push(levelData);
        });

        return table;
    }

    getTable() {
        const header = [...this.attributes];
        const table = [];

        this.levels.forEach((level) => {
            let levelData = header.reduce((newLevel, headerName) => {
                newLevel[headerName] = this.#format(
                    level[headerName],
                    headerName
                );
                return newLevel;
            }, {});

            table.push(levelData);
        });

        return [table, header];
    }

    addCalculated(name, getter) {
        if (this.attributes.includes(name))
            return this.addOverride(name, getter);
        this.attributes.push(name);

        this.levels.forEach((level) => {
            Object.defineProperty(level, name, {
                get() {
                    return getter(this);
                },
            });
        });
    }

    addOverride(name, getter) {
        this.levels.forEach((level) => {
            const originalValue = level[name];
            Object.defineProperty(level, name, {
                get() {
                    return getter(originalValue, this);
                },
            });
        });
    }
}

export default Levels;
