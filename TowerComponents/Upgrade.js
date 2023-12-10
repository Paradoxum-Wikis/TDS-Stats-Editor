import BaseStats from './BaseStats.js';

class Upgrade extends BaseStats {
    /**
     *
     * @param {SkinData} skinData
     * @param {{
     * 	Stats: {},
     * 	Image: {},
     * }} data
     */
    constructor(data, locator) {
        super(data.Stats, locator);
        this.upgradeData = data;

        this.addAttributeValue('Cost', data.Cost);

        //Fixes extras being wrongly typed as an object
        if (
            data.Stats.Extras !== undefined &&
            !(data.Stats.Extras instanceof Array)
        ) {
            data.Stats.Extras = [];
        }
    }

    set(attribute, value) {
        super.set(attribute, value);

        if (this.upgradeData[attribute] !== undefined) {
            this.upgradeData[attribute] = value;
        }
    }

    get(attribute) {
        const value = super.get(attribute);

        if (value == null) {
            return this.upgradeData[attribute];
        }

        return value;
    }
}

export default Upgrade;
