export default class CalculationSystemManager {
  constructor() {
    this.availableSystems = [];
    this.select = document.getElementById('calculation-system-select');
    this.currentTower = null;
    
    this.initialize();
  }
  
  initialize() {
    // grab all calculation systems
    this.collectAvailableSystems();
    
    // set up the dropdown
    this.setupSelectElement();
    
    // catch tower changes
    document.addEventListener('towerLoaded', (e) => {
      this.currentTower = e.detail.tower;
      this.updateSelectForTower();
    });
    
    // catch tower data updates too
    document.addEventListener('towerDataChanged', (e) => {
      if (e.detail.tower === this.currentTower) {
        this.updateSelectForTower();
      }
    });
  }
  
  collectAvailableSystems() {
    // toss in the usual stuff
    const uniqueSystems = new Set();
    
    const specializedSystems = [
      'Default', 
      'Accelerator', 'Ace Pilot', 'Archer', 'Brawler', 'Commander', 'Commando', 
      'Cowboy', 'Crook Boss', 'Cryomancer', 'Elementalist', 'Engineer', 
      'Freezer', 'Gatling Gun', 'Hallow Punk', 'Harvester', 'Mecha Base', 
      'Military Base', 'Mortar', 'Paintballer', 'Pursuit', 'Pyromancer', 
      'Ranger', 'Rocketeer', 'Shotgunner', 'Slasher', 'Sledger', 'Swarmer', 
      'Toxic Gunner', 'Trapper', 'War Machine', 'Warden'
    ];
    
    specializedSystems.forEach(system => uniqueSystems.add(system));
    
    this.availableSystems = Array.from(uniqueSystems).sort();
  }
  
  setupSelectElement() {
    this.select = document.getElementById('calculation-system-select');
    
    if (this.select) {
      // clear old options
      this.select.innerHTML = '<option value="default">Default</option>';
      
      // add all systems
      this.availableSystems.forEach(system => {
        if (system === 'Default') return; // skip default, already there
        
        const option = document.createElement('option');
        option.value = system;
        option.textContent = system;
        this.select.appendChild(option);
      });
      
      // update on change
      this.select.addEventListener('change', () => {
        this.applySelectedSystem();
      });
      
      // mobile compatibility
      const mobileSelect = document.getElementById('mobile-calculation-system-select');
      if (mobileSelect) {
        // when desktop changes - also update mobile (in case)
        this.select.addEventListener('change', () => {
          if (mobileSelect.value !== this.select.value) {
            mobileSelect.value = this.select.value;
          }
        });
      }
    }
  }
  
  updateSelectForTower() {
    if (!this.select || !this.currentTower) return;
    
    // check tower json for calc system
    const towerName = this.currentTower.name;
    let existingSystem = null;
    
    // peek at first skin for calc system
    const skins = this.currentTower.json[towerName];
    if (skins) {
      const firstSkinName = Object.keys(skins)[0];
      if (firstSkinName && skins[firstSkinName].CalculationSystem) {
        existingSystem = skins[firstSkinName].CalculationSystem;
      }
    }
    
    // sync dropdown with json
    const previousValue = this.select.value;
    if (existingSystem && this.availableSystems.includes(existingSystem)) {
      this.select.value = existingSystem;
    } else {
      this.select.value = 'default';
    }
    
    // update tower object
    this.currentTower.calculationSystem = existingSystem || null;
    
    // fix for calculatedsystem json data being ignored when loading
    if (existingSystem && previousValue !== existingSystem) {
      document.dispatchEvent(new CustomEvent('calculationSystemChanged', {
        detail: { tower: this.currentTower }
      }));
    }
  }
  
  applySelectedSystem() {
    if (!this.currentTower) return;
    
    const selectedSystem = this.select.value;
    const towerName = this.currentTower.name;
    
    // grab current system from json
    let currentSystem = 'default';
    const skins = this.currentTower.json[towerName];
    if (skins) {
      const firstSkinName = Object.keys(skins)[0];
      if (firstSkinName && skins[firstSkinName].CalculationSystem) {
        currentSystem = skins[firstSkinName].CalculationSystem;
      }
    }
    
    // skip if no change - ALLOW DEFAULT TO ALWAYS TRIGGER
    // this was causing the bug that didn't allow default to be loaded
    if (selectedSystem === currentSystem && selectedSystem !== 'default') return;
    
    // update tower object
    if (selectedSystem === 'default') {
      this.currentTower.calculationSystem = null;
    } else {
      this.currentTower.calculationSystem = selectedSystem;
    }
    
    // tweak tower json
    for (const skinName in this.currentTower.json[towerName]) {
      const skin = this.currentTower.json[towerName][skinName];
      
      if (selectedSystem === 'default') {
        // ditch calc system if default
        if (skin.hasOwnProperty('CalculationSystem')) {
          delete skin.CalculationSystem;
        }
      } else {
        // slap on new calc system
        skin.CalculationSystem = selectedSystem;
      }
    }
    
    // kick off recalc
    document.dispatchEvent(new CustomEvent('calculationSystemChanged', {
      detail: { tower: this.currentTower }
    }));
    
    // refresh ui
    document.dispatchEvent(new CustomEvent('towerDataChanged', {
      detail: { tower: this.currentTower }
    }));
    
    // table force rebuild/reload
    if (document.querySelector('#table-view .active')?.textContent.trim() === 'Table') {
      let viewer = window.activeViewer || 
                  (window.app && window.app.viewer) || 
                  document.querySelector('.viewer')?.__vue__;
      
      if (viewer) {
        if (typeof viewer.towerTable?.removeTable === 'function') {
          viewer.towerTable.removeTable();
        }
        
        setTimeout(() => {
          if (typeof viewer.loadTable === 'function') {
            viewer.loadTable();
          } else if (typeof viewer.reload === 'function') {
            viewer.reload();
          }
        }, 50); // delay just to make sure changes are made
      }
    }
  }
}