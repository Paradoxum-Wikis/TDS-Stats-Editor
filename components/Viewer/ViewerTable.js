import UnitManager from "../../TowerComponents/UnitManager.js";
import TowerManager from "../../TowerComponents/TowerManager.js";

const ViewerTable = {
  methods: {
    loadTable() {
      const existingContainers =
        this.towerTable.root.parentElement.querySelectorAll(
          ".wikitable-container",
        );
      existingContainers.forEach((container) => container.remove());

      this.activeUnits = this.populateActiveUnits();

      this.towerTable.root.parentElement.classList.remove("d-none");

      if (this.unitTable && this.unitTable.root) {
        this.unitTable.root.classList.remove("d-none");
      }

      const skinData = this.getActiveSkin();

      const allProps = [
        ...skinData.levels.attributes,
        ...skinData.levels.complexAttributes,
      ];
      const visibleProps = allProps.filter(
        (prop) => !this.propertyViewer.isHidden(prop),
      );

      this.propertyViewer.createButtons(visibleProps);

      this.towerTable.load(skinData, {
        ignore: [
          ...this.propertyViewer.disabled,
          ...allProps.filter((prop) => this.propertyViewer.isHidden(prop)),
        ],
      });

      this.propertyViewer.initializeUnitProperties();

      this.unitTable.load(this.activeUnits, {
        ignore:
          this.propertyViewer.currentView === "unit"
            ? this.propertyViewer.unitDisabled
            : [],
      });
    },

    applyUnitTable() {
      Object.entries(this.activeUnits).forEach(([unitName, unitData]) => {
        this.unitDeltaManager.baseData[unitName] = unitData.data;
      });

      this.unitDeltaManager.save();

      this.reload();
    },

    resetUnitTable() {
      const defaultUnitManager =
        window.cachedDefaultUnitManager || new UnitManager();
      if (!window.cachedDefaultUnitManager)
        window.cachedDefaultUnitManager = defaultUnitManager;

      const defaultTowerManager =
        window.cachedDefaultTowerManager || new TowerManager();
      if (!window.cachedDefaultTowerManager)
        window.cachedDefaultTowerManager = defaultTowerManager;

      const isCustomTower = !defaultTowerManager.towerData.hasOwnProperty(
        this.tower.name,
      );

      const updates = [];

      Object.entries(this.activeUnits).forEach(([unitName, _]) => {
        let sourceData;

        if (isCustomTower || !defaultUnitManager.baseData[unitName]) {
          if (
            window.originalCustomUnits &&
            window.originalCustomUnits[unitName]
          ) {
            sourceData = window.originalCustomUnits[unitName];
          } else if (this.unitManager.baseData[unitName]) {
            sourceData = this.unitManager.baseData[unitName];
          }
        } else {
          sourceData = defaultUnitManager.baseData[unitName];
        }

        if (sourceData) {
          updates.push({ unitName, data: sourceData });
        }
      });

      updates.forEach(({ unitName, data }) => {
        const dataCopy =
          typeof structuredClone !== "undefined"
            ? structuredClone(data)
            : JSON.parse(JSON.stringify(data));

        this.unitManager.baseData[unitName] = dataCopy;
        this.unitDeltaManager.baseData[unitName] = dataCopy;
      });

      this.unitManager.save();
      this.unitDeltaManager.save();

      this.reload();
    },

    clearUnitTable() {
      Object.entries(this.activeUnits).forEach(([unitName, _]) => {
        this.unitManager.baseData[unitName] =
          this.unitDeltaManager.baseData[unitName];
      });

      this.unitManager.save();

      this.reload();
    },

    hasUnitChanges() {
      if (!this.activeUnits) return false;

      for (const [unitName, _] of Object.entries(this.activeUnits)) {
        const currentData = JSON.stringify(
          this.unitManager.baseData[unitName] || {},
        );
        const referenceData = JSON.stringify(
          this.unitDeltaManager.baseData[unitName] || {},
        );

        if (currentData !== referenceData) {
          return true;
        }
      }
      return false;
    },

    hasUnitDeltaChanges() {
      if (!this.activeUnits) return false;

      const defaultUnitManager = new UnitManager();

      for (const [unitName, _] of Object.entries(this.activeUnits)) {
        const deltaData = JSON.stringify(
          this.unitDeltaManager.baseData[unitName] || {},
        );
        const defaultData = JSON.stringify(
          defaultUnitManager.baseData[unitName] || {},
        );

        if (deltaData !== defaultData) {
          return true;
        }
      }
      return false;
    },
  },
};

export default ViewerTable;