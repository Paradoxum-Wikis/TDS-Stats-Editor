import SkinData from './SkinData.js';

class Tower {
    constructor(name, data, unitKey) {
        this.json = {
            [name]: data,
        };

        this.name = this.#getName();
        this.skinNames = this.#getSkinNames();
        this.skins = this.#getSkins();
        this.unitKey = unitKey;
    }

    importJSON(json) {
        this.json = json;

        this.name = this.#getName();
        this.skinNames = this.#getSkinNames();
        this.skins = this.#getSkins();
    }

    #getName() {
        for (const [towerName] of Object.entries(this.json)) {
            return towerName;
        }
    }

    #getSkinNames() {
        return Object.entries(this.json[this.name]).map(
            ([skinName]) => skinName
        );
    }

    #getSkins() {
        return this.skinNames.reduce((output, skinName) => {
            const skinData = this.json[this.name][skinName];
            output[skinName] = new SkinData(
                this,
                skinName,
                skinData,
                this.unitKey
            );
            return output;
        }, {});
    }

    get attributes() {
        let allAttributes = [];

        for (const skinData of Object.values(this.skins)) {
            const attributes = Object.keys(skinData.locator.locations);

            allAttributes = [...new Set([...allAttributes, ...attributes])];
        }

        return allAttributes;
    }

    getOccurrencesForAttribute(attributeName) {
        let occurrences = [];

        for (const skinData of Object.values(this.skins)) {
            const attributes =
                skinData.getOccurrencesForAttribute(attributeName);

            occurrences = [...new Set([...occurrences, ...attributes])];
        }

        return occurrences;
    }

    getAttributeType(attributeName) {
        for (const skinData of Object.values(this.skins)) {
            if (
                !Object.keys(skinData.locator.locations).includes(attributeName)
            )
                continue;

            return skinData.getAttributeType(attributeName);
        }
    }

    getAttributeLocation(attributeName) {
        for (const skinData of Object.values(this.skins)) {
            if (!skinData.locator.hasLocation(attributeName)) continue;

            return skinData.locator.getLocation(attributeName);
        }
    }

    /**
     * @param {String} skinName
     * @returns {SkinData}
     */
    getSkin(skinName) {
        return this.skins[skinName];
    }

    /**
     * @param {String} skinName
     * @returns {Boolean}
     */
    hasSkin(skinName) {
        return skinName in this.skinNames;
    }
}

export default Tower;
