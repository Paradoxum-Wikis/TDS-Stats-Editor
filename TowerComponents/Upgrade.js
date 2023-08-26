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
    }

    set(attribute, value) {
        super.set(attribute, value);

        if (this.upgradeData[attribute]) {
            this.upgradeData[attribute] = value;
        }
    }
}

export default Upgrade;
