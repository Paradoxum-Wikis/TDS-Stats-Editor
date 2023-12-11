import TowerManager from './TowerComponents/TowerManager.js';
import Dropdown from './components/Dropdown.js';
import Viewer from './components/Viewer.js';

class App {
    constructor() {
        this.towerManager = new TowerManager('New');

        window.state = {
            boosts: {
                tower: {
                    extraCooldown: 0,
                    firerateBuff: 0,
                    damageBuff: 0,
                    rangeBuff: 0,
                    discount: 0,
                },
                unit: {
                    extraCooldown: 0,
                    firerateBuff: 0,
                    damageBuff: 0,
                    rangeBuff: 0,
                    healthBuff: 0,
                    spawnrateBuff: 0,
                },
            },
            cache: {},
        };
    }

    addTowerOption(name) {
        this.dropdown.options.push(name);
    }

    start() {
        this.dropdown = new Dropdown(
            document.querySelector('#Tower-Selector input'),
            document.querySelector('#Tower-Selector .dropdown-menu'),
            this.towerManager.towerNames
        );

        this.dropdown.textForm.addEventListener('submit', (e) => {
            viewer.load(this.towerManager.towers[e.detail]);
        });

        const viewer = new Viewer(this);

        viewer.load(this.towerManager.towers[this.towerManager.towerNames[0]]);
    }
}

const app = new App();
app.start();
