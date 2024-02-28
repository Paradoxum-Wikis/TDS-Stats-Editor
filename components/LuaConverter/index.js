export default class LuaConverter {
    #domContainer;

    constructor() {
        this.#domContainer = document.createElement('pre');
    }

    getContainer() {
        return this.#domContainer;
    }

    /**
     *
     * @param {Object} json
     */
    showJSONAsLua(json) {
        this.#domContainer.innerText = format(json);
    }
}
