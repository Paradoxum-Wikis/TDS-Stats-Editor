import TowerManager from './TowerComponents/TowerManager.js';
import Dropdown from './components/Dropdown.js';
import Viewer from './components/Viewer.js';

class App {
    constructor() {
        this.towerManager = new TowerManager('New');
    }

    start() {
        const dropdown = new Dropdown(
            document.querySelector('#Tower-Selector input'),
            document.querySelector('#Tower-Selector .dropdown-menu'),
            this.towerManager.towerNames
        );

        dropdown.textForm.addEventListener('submit', (e) => {
            viewer.load(this.towerManager.towers[e.detail]);
        });

        const viewer = new Viewer(this);

        viewer.load(this.towerManager.towers[this.towerManager.towerNames[0]]);
    }
}

const app = new App();
app.start();
