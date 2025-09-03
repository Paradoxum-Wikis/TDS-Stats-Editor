export default class CalculationSystemManager {
  constructor() {
    this.availableSystems = [];
    this.select = document.getElementById("calculation-system-select");
    this.currentTower = null;

    this.initialize();
  }

  initialize() {
    this.collectAvailableSystems();
    this.setupSelectElement();

    document.addEventListener("towerLoaded", (e) => {
      this.currentTower = e.detail.tower;
      this.updateSelectForTower();
    });

    document.addEventListener("towerDataChanged", (e) => {
      if (e.detail.tower === this.currentTower) {
        this.updateSelectForTower();
      }
    });
  }

  collectAvailableSystems() {
    const uniqueSystems = new Set();

    const specializedSystems = [
      "Default",
      "Accelerator",
      "Ace Pilot",
      "Archer",
      "Biologist",
      "Brawler",
      "Commander",
      "Commando",
      "Commando Pre-V1.74.0",
      "Cowboy",
      "Crook Boss",
      "Cryomancer",
      "Elementalist",
      "Engineer",
      "Freezer",
      "Gatling Gun",
      "Hacker",
      "Hallow Punk",
      "Harvester",
      "Mecha Base",
      "Military Base",
      "Mortar",
      "Paintballer",
      "Pursuit",
      "Pyromancer",
      "Ranger",
      "Rocketeer",
      "Shotgunner",
      "Slasher",
      "Sledger",
      "Soldier",
      "Swarmer",
      "Toxic Gunner",
      "Trapper",
      "War Machine",
      "Warden",
    ];

    specializedSystems.forEach((system) => uniqueSystems.add(system));

    this.availableSystems = Array.from(uniqueSystems).sort();
  }

  setupSelectElement() {
    this.select = document.getElementById("calculation-system-select");

    if (this.select) {
      this.select.innerHTML = '<option value="default">Default</option>';

      this.availableSystems.forEach((system) => {
        if (system === "Default") return;

        const option = document.createElement("option");
        option.value = system;
        option.textContent = system;
        this.select.appendChild(option);
      });

      this.select.addEventListener("change", () => {
        this.applySelectedSystem();
      });

      const mobileSelect = document.getElementById(
        "mobile-calculation-system-select",
      );
      if (mobileSelect) {
        this.select.addEventListener("change", () => {
          if (mobileSelect.value !== this.select.value) {
            mobileSelect.value = this.select.value;
          }
        });
      }
    }
  }

  updateSelectForTower() {
    if (!this.select || !this.currentTower) return;

    const towerName = this.currentTower.name;
    let existingSystem = null;

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
      this.select.value = "default";
    }

    this.currentTower.calculationSystem = existingSystem || null;

    if (existingSystem && previousValue !== existingSystem) {
      document.dispatchEvent(
        new CustomEvent("calculationSystemChanged", {
          detail: { tower: this.currentTower },
        }),
      );
    }
  }

  applySelectedSystem() {
    if (!this.currentTower) return;

    const selectedSystem = this.select.value;
    const towerName = this.currentTower.name;

    let currentSystem = "default";
    const skins = this.currentTower.json[towerName];
    if (skins) {
      const firstSkinName = Object.keys(skins)[0];
      if (firstSkinName && skins[firstSkinName].CalculationSystem) {
        currentSystem = skins[firstSkinName].CalculationSystem;
      }
    }

    if (selectedSystem === currentSystem && selectedSystem !== "default")
      return;

    if (selectedSystem === "default") {
      this.currentTower.calculationSystem = null;
    } else {
      this.currentTower.calculationSystem = selectedSystem;
    }

    for (const skinName in this.currentTower.json[towerName]) {
      const skin = this.currentTower.json[towerName][skinName];

      if (selectedSystem === "default") {
        if (skin.hasOwnProperty("CalculationSystem")) {
          delete skin.CalculationSystem;
        }
      } else {
        skin.CalculationSystem = selectedSystem;
      }
    }

    document.dispatchEvent(
      new CustomEvent("calculationSystemChanged", {
        detail: { tower: this.currentTower },
      }),
    );

    document.dispatchEvent(
      new CustomEvent("towerDataChanged", {
        detail: { tower: this.currentTower },
      }),
    );

    if (
      document.querySelector("#table-view .active")?.textContent.trim() ===
      "Table"
    ) {
      let viewer =
        window.activeViewer ||
        (window.app && window.app.viewer) ||
        document.querySelector(".viewer")?.__vue__;

      if (viewer) {
        if (typeof viewer.towerTable?.removeTable === "function") {
          viewer.towerTable.removeTable();
        }

        const waitForViewerReady = () => {
          if (typeof viewer.loadTable === "function") {
            viewer.loadTable();
          } else if (typeof viewer.reload === "function") {
            viewer.reload();
          } else {
            setTimeout(waitForViewerReady, 10);
          }
        };
        waitForViewerReady();
      }
    }
  }
}
