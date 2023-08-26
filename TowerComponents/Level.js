import Levels from './Levels.js';

class Level {
    /**
     *
     * @param {Levels} levels
     */
    constructor(levels, data) {
        this.levels = levels;
        this.Level = levels.levels.length;

        levels.attributes.forEach((attribute) => {
            if (this[attribute] !== undefined) return;

            if (data[attribute] !== undefined)
                return (this[attribute] = data[attribute]);

            this[attribute] = levels.getCell(this.Level - 1, attribute);
        });
    }
}

export default Level;
