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
     */
    constructor(data) {
        this.data = data;
        this.special = {};
        this.attributes = {};

        this.attributes.Damage = data.Damage;
        this.attributes.Cooldown = data.Cooldown;
        this.attributes.Range = data.Range;
        this.attributes.Hidden = data.Detections.Hidden;
        this.attributes.Flying = data.Detections.Flying;
        this.attributes.Lead = data.Detections.Lead;
        this.attributes.Cost = data.Cost | data.Price;

        for (let [key, value] of Object.entries(data)) {
            if (this.#baseAttributes.includes(key)) continue;

            this.addAttribute(key, value);
        }

        for (let [key, value] of Object.entries(data.Attributes ?? {})) {
            if (this.#baseAttributes.includes(key)) continue;

            this.addAttribute(key, value);
        }
    }

    addAttribute(name, value) {
        this.attributeNames.push(name);
        this.attributes[name] = value;
    }

    set(attribute, value) {
        if (this.data[attribute] != undefined) {
            this.data[attribute] = value;
        } else if (this.data.Detections?.[attribute] != undefined) {
            this.data.Detections[attribute] = value;
        } else if (this.data.Attributes?.[attribute] != undefined) {
            this.data.Attributes[attribute] = value;
        } else if (attribute === 'Cost' && this.data.Price !== undefined) {
            this.data.Price = value;
        }
    }
}

export default BaseStats;
