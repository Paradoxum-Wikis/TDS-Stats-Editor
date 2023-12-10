import SkinData from './SkinData.js';
import Level from './Level.js';

class Levels {
    /**
     *
     * @param {SkinData} skinData
     */
    constructor(skinData) {
        this.skinData = skinData;
        this.complexValues = [];
        this.complexAttributes = [];
        this.attributes = this.#getAttributes();
        this.levels = [];

        this.addLevel(skinData.defaults.attributes);

        this.skinData.upgrades.forEach((upgrade) =>
            this.addLevel(upgrade.attributes)
        );
    }

    #getAttributes() {
        const attributes = ['Level'];
        const complexValues = [];
        const complexAttributes = [];

        const addComplex = (attribute, fullName) => {
            for (const [attributeName, attributeValue] of Object.entries(
                attribute
            )) {
                const combinedName = fullName + attributeName;
                if (attributeValue instanceof Object) {
                    if (!complexAttributes.includes(combinedName))
                        complexAttributes.push(combinedName);
                    addComplex(attributeValue, combinedName + '.');
                } else {
                    if (!complexValues.includes(combinedName))
                        complexValues.push(combinedName);
                }
            }
        };

        const processAttribute = (attributeName, level) => {
            const foundStat = this.skinData.get(level, attributeName);
            if (foundStat instanceof Object) {
                if (!complexAttributes.includes(attributeName))
                    complexAttributes.push(attributeName);
                addComplex(foundStat, attributeName + '.');
            } else {
                if (!attributes.includes(attributeName))
                    attributes.push(attributeName);
            }
        };

        this.skinData.defaults.attributeNames.forEach((name) =>
            processAttribute(name, 0)
        );

        this.skinData.upgrades.forEach((level, index) =>
            level.attributeNames.forEach((name) =>
                processAttribute(name, index + 1)
            )
        );

        this.complexValues = complexValues;
        this.complexAttributes = complexAttributes;

        return attributes;
    }

    addLevel(data) {
        this.levels.push(new Level(this, data));
    }

    getCell(level, property) {
        if (level < 0 || level > this.levels.length) return null;

        if (property.includes('.')) {
            const props = property.split('.');

            try {
                let currentValue = this.skinData.get(level, props[0]);
                for (let i = 1; i < props.length; i++) {
                    let key = props[i];

                    currentValue = currentValue?.[key];
                }

                return currentValue ?? this.getCell(level - 1, property);
            } catch (error) {
                return this.getCell(level - 1, property);
            }
        }
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
