import Tower from './Tower.js';
import TowerData from './TowerData.js';

class TowerManager {
    constructor(dataKey) {
        this.dataKey = dataKey;
        this.towerData = this.getTowerData();

        this.towerNames = this.parseTowerNames(this.towerData);
        this.towers = this.parseTowers(this.towerData);
    }

    getDefault() {
        return JSON.parse(JSON.stringify(TowerData));
    }

    loadLocalData(localData) {
        const loadedLocal = JSON.parse(localData);
        const loadedStatic = JSON.parse(JSON.stringify(TowerData));

        for (let [key, value] of Object.entries(loadedStatic)) {
            if (key in loadedLocal) continue;

            loadedLocal[key] = value;
        }

        return loadedLocal;
    }

    getTowerData() {
        const localData = localStorage.getItem(this.dataKey);

        return localData ? this.loadLocalData(localData) : this.getDefault();
    }

    addTower(name, json) {
        this.towerData[name] = json;

        this.towerNames = this.parseTowerNames(this.towerData);
        const towerData = new Tower(name, json, this.getUnitKey());
        this.towers[name] = towerData;
        this.saveTower(towerData);
    }

    #unique(arrayA, arrayB) {
        return [...new Set([...arrayA, ...arrayB])];
    }

    getAllAttributes() {
        const attributes = Object.values(this.towers).reduce(
            (a, v) => this.#unique(a, v.attributes),
            []
        );

        return [...new Set(attributes)];
    }

    getTypeForAttribute(attributeName) {
        for (const tower of Object.values(this.towers)) {
            if (!tower.attributes.includes(attributeName)) continue;

            return tower.getAttributeType(attributeName);
        }
    }

    getAttributeLocation(attributeName) {
        for (const tower of Object.values(this.towers)) {
            if (!tower.attributes.includes(attributeName)) continue;

            return tower.getAttributeLocation(attributeName);
        }
    }

    getOccurrencesForAttribute(attributeName) {
        const attributes = Object.values(this.towers).reduce(
            (a, v) =>
                this.#unique(a, v.getOccurrencesForAttribute(attributeName)),
            []
        );

        return [...new Set(attributes)];
    }
    parseTowerNames(towerData) {
        return Object.keys(towerData).sort((a, b) => a > b);
    }

    getUnitKey() {
        if (!this.dataKey) return 'units';

        switch (this.dataKey) {
            case 'delta':
                return 'unitDeltas';
            case 'new':
            case 'default':
            default:
                return 'units';
        }
    }

    parseTowers(towerData) {
        return Object.entries(towerData).reduce(
            (towers, [towerName, towerData]) => {
                towers[towerName] = new Tower(
                    towerName,
                    towerData,
                    this.getUnitKey()
                );

                return towers;
            },
            {}
        );
    }

    saveTower(tower) {
        if (!this.dataKey) return;

        this.towerData[tower.name] = tower.json[tower.name];
        this.save();
    }

    save() {
        if (!this.dataKey) return;

        localStorage.setItem(this.dataKey, JSON.stringify(this.towerData));
    }
}

export default TowerManager;
