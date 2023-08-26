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
    constructor(data) {
        super(data);
    }
}

export default Defaults;
