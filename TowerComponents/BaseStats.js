import Locator from './Locator.js';

class BaseStats {
    #baseAttributes = [
        'Damage',
        'Cooldown',
        'Range',
        'Attributes',
        'Detections',
        'Price',
        'Extras',
    ];

    attributeNames = [
        'Damage',
        'Cooldown',
        'Range',
        'Hidden',
        'Flying',
        'Lead',
        'Cost',
    ];
    /**
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
     * @param {Locator} locator
     */
    constructor(data, locator) {
        this.data = data;
        this.locator = locator;

        this.special = {};
        this.attributes = {};

        this.addAttribute('Damage');
        this.addAttribute('Cooldown');
        this.addAttribute('Range');

        this.addDetection('Hidden');
        this.addAttribute('Flying', ['Detections']);
        this.addAttribute('Lead', ['Detections']);

        this.attributes.Cost = data.Cost | data.Price;

        for (let [key, value] of Object.entries(data)) {
            if (this.#baseAttributes.includes(key)) continue;

            this.addAttribute(key);
        }

        for (let [key, value] of Object.entries(data.Attributes ?? {})) {
            if (this.#baseAttributes.includes(key)) continue;

            this.addAttribute(key, ['Attributes']);
        }
    }

    addAttribute(name, location) {
        const value = this.locator.locate(this.data, name, location);
        if (value === undefined) return;

        this.locator.addLocation(name, location);
        this.addAttributeValue(name, value);
    }

    addAttributeValue(name, value) {
        this.attributeNames.push(name);
        this.attributes[name] = value;
    }

    addDetection(name) {
        if (this.locator.hasDetection(name)) return;

        const value = this.locator.locate(this.data, name, ['Detections']);
        if (value === undefined) return;

        if (value) this.locator.addDetection(name);

        this.addAttributeValue(name, value);
    }

    set(attribute, value) {
        if (['Hidden', 'Flying', 'Lead'].includes(attribute)) {
            if (this.data.Detections == undefined) {
                this.data.Detections = {};
            }

            if (value) {
                this.data.Detections[attribute] = value;
            } else {
                delete this.data.Detections[attribute];
            }

            if (Object.keys(this.data.Detections).length == 0) {
                delete this.data.Detections;
            }
        } else if (this.locator.hasLocation(attribute)) {
            const targetData = this.locator.getTargetData(
                this.data,
                this.locator.getLocation(attribute)
            );

            targetData[attribute] = value;
        } else if (attribute === 'Cost' && this.data.Price !== undefined) {
            this.data.Price = value;
        }
    }
}

export default BaseStats;
