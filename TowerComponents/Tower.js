import SkinData from './SkinData.js';

class Tower {
    constructor(name, data) {
        this.json = {
            [name]: data,
        };

        this.name = this.#getName();
        this.skinNames = this.#getSkinNames();
        this.skins = this.#getSkins();
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
            output[skinName] = new SkinData(this, skinName, skinData);
            return output;
        }, {});
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
