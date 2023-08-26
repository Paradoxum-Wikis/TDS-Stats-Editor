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
    constructor(data) {
        super(data.Stats);
        this.upgradeData = data;

        this.addAttribute('Cost', data.Cost);
    }

    set(attribute, value) {
        super.set(attribute, value);

        if (this.upgradeData[attribute]) {
            this.upgradeData[attribute] = value;
        }
    }
}

export default Upgrade;
