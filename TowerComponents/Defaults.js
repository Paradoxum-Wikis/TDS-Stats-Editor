import SkinData from './SkinData.js';
import BaseStats from './BaseStats.js';

class Defaults extends BaseStats {
    /**
     *
     * @param {SkinData} skinData
     * @param {{
     * 	Damage: Number,
     * 	Cooldown: Number,
     * 	Range: Number,
     * 	Attributes: {any}
     * 	Detections: {
     * 		Hidden: Boolean,
     * 		Lead: Boolean,
     * 		Flying: Boolean,
     * }}} data
     */
    constructor(data, locator) {
        super(data, locator);

        this.attributes['Hidden'] = this.attributes['Hidden'] ?? false;
        this.attributes['Lead'] = this.attributes['Lead'] ?? false;
        this.attributes['Flying'] = this.attributes['Flying'] ?? false;
    }
}

export default Defaults;
