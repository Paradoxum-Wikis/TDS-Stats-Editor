import Tower from './Tower.js';
import TowerData from './TowerData.js';

class TowerManager {
    constructor(dataKey) {
        this.dataKey = dataKey;
        this.towerData = this.getTowerData();

        this.towerNames = this.parseTowerNames(this.towerData);
        this.towers = this.parseTowers(this.towerData);
    }

    getTowerData() {
        const localData = localStorage.getItem(this.dataKey);
        return localData
            ? JSON.parse(localData)
            : JSON.parse(JSON.stringify(TowerData));
    }

    parseTowerNames(towerData) {
        return Object.keys(towerData).sort((a, b) => a > b);
    }

    parseTowers(towerData) {
        return Object.entries(towerData).reduce(
            (towers, [towerName, towerData]) => {
                towers[towerName] = new Tower(towerName, towerData);

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
