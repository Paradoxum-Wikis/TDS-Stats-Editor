import Alert from "../Alert.js";
import TowerManager from "../../TowerComponents/TowerManager.js";

const ViewerData = {
  methods: {
    import(json, enableAlert, noCustomAlert = false) {
      enableAlert = enableAlert ?? false;

      const oldJSON = JSON.parse(JSON.stringify(this.tower.json));
      const oldUnits = {};

      if (this.activeUnits) {
        Object.entries(this.activeUnits).forEach(([unitName, _]) => {
          if (this.unitManager.baseData[unitName]) {
            oldUnits[unitName] = JSON.parse(
              JSON.stringify(this.unitManager.baseData[unitName]),
            );
          }
        });
      }

      try {
        const importedData = JSON.parse(json);

        let isCustomTower = false;
        let towerName = "";

        if (importedData.master) {
          const masterKeys = Object.keys(importedData.master);
          if (masterKeys.length > 0) {
            const key = masterKeys[0];
            if (!this.app.towerManager.towerData.hasOwnProperty(key)) {
              isCustomTower = true;
              towerName = key;
            }
          }
        } else {
          const directKeys = Object.keys(importedData);

          // Check if any imported towers are custom
          for (const key of directKeys) {
            if (!this.app.towerManager.towerData.hasOwnProperty(key)) {
              isCustomTower = true;
              towerName = key;
              break;
            }
          }
        }

        if (isCustomTower) {
          const originalName = towerName;

          const towerDataSource = importedData.master || importedData;
          const customTowerData = JSON.parse(
            JSON.stringify(towerDataSource[originalName]),
          );

          this.addNewTower(originalName, customTowerData);

          if (!window.originalCustomTowers) {
            window.originalCustomTowers = {};
          }

          if (!window.originalCustomTowers[towerName]) {
            window.originalCustomTowers[towerName] = JSON.parse(
              JSON.stringify(towerDataSource[originalName]),
            );
          }

          if (importedData.slave || importedData.units) {
            const slaveData = importedData.slave || importedData.units;
            const skinName = this.towerVariants.getSelectedName();

            if (!window.originalCustomUnits) {
              window.originalCustomUnits = {};
            }

            Object.entries(slaveData).forEach(([unitName, unitData]) => {
              unitData._towerName = originalName;
              unitData._skinName = skinName;

              window.originalCustomUnits[unitName] = JSON.parse(
                JSON.stringify(unitData),
              );

              this.unitManager.baseData[unitName] = unitData;

              this.unitDeltaManager.baseData[unitName] = JSON.parse(
                JSON.stringify(unitData),
              );

              this.unitDeltaManager.unitData[unitName] = JSON.parse(
                JSON.stringify(unitData),
              );
            });

            this.unitManager.save();
            this.unitDeltaManager.save();
          }

          this.reload();

          const deltaTowerData = JSON.parse(JSON.stringify(this.tower.json));
          this.deltaTower.importJSON(deltaTowerData);

          if (!noCustomAlert) {
            const alert = new Alert(
              `Custom tower "${originalName}" imported!`,
              {
                alertStyle: "alert-success",
              },
            );
            alert.timeBeforeShow = 0.1;
            alert.fire();
          }

          return;
        } else {
          const towerDataToImport =
            importedData.master || importedData.tower || importedData;

          const importedTowerName = Object.keys(towerDataToImport)[0];
          if (importedTowerName && towerDataToImport[importedTowerName]) {
            this.app.towerManager.addTower(
              importedTowerName,
              towerDataToImport[importedTowerName],
            );
          }

          this.tower.importJSON(towerDataToImport);

          const defaultTowerManager =
            window.cachedDefaultTowerManager || new TowerManager("default");
          if (!window.cachedDefaultTowerManager)
            window.cachedDefaultTowerManager = defaultTowerManager;

          const defaultData = defaultTowerManager.towerData[importedTowerName];

          if (defaultData) {
            this.deltaTower.importJSON({ [importedTowerName]: defaultData });
          } else {
            console.warn(
              `No default data found for ${importedTowerName}, using imported data as reference`,
            );
            this.deltaTower.importJSON(towerDataToImport);
          }

          if (importedData.slave || importedData.units) {
            const slaveData = importedData.slave || importedData.units;
            const skinName = this.towerVariants.getSelectedName();

            Object.entries(slaveData).forEach(([unitName, unitData]) => {
              unitData._towerName = this.tower.name;
              unitData._skinName = skinName;
              this.unitManager.baseData[unitName] = unitData;
            });

            this.unitManager.save();
          }

          document.dispatchEvent(
            new CustomEvent("towerLoaded", {
              detail: { tower: this.tower },
            }),
          );

          this.reload();

          if (enableAlert) {
            const alert = new Alert("Statistics imported!", {
              alertStyle: "alert-success",
            });
            alert.timeBeforeShow = 0.1;
            alert.fire();
          }
        }
      } catch (e) {
        console.error("Import error:", e);

        this.tower.importJSON(oldJSON);
        if (Object.keys(oldUnits).length > 0) {
          Object.entries(oldUnits).forEach(([unitName, unitData]) => {
            this.unitManager.baseData[unitName] = unitData;
          });
          this.unitManager.save();
        }

        const alert = new Alert("Unable to load that.", {
          alertStyle: "alert-danger",
        });
        alert.timeBeforeShow = 0.1;
        alert.alertTimeInSeconds = 1;
        alert.fire();
      }
    },

    export(json) {
      const filename = `${this.tower.name}-stats.json`;
      this.downloadFile(json, filename);
    },

    exportTowerWithUnits() {
      const combinedData = this._getCombinedData();
      const filename = `${this.tower.name}-full.json`;
      const json = JSON.stringify(combinedData, null, 2);
      this.downloadFile(json, filename);
    },

    apply(json) {
      const towerData = JSON.parse(json);
      this.deltaTower.importJSON(towerData);

      this.reload();
    },

    reset() {
      const defaultTowerManager =
        window.cachedDefaultTowerManager || new TowerManager("default");
      if (!window.cachedDefaultTowerManager)
        window.cachedDefaultTowerManager = defaultTowerManager;

      const isCustomTower = !defaultTowerManager.towerData.hasOwnProperty(
        this.tower.name,
      );

      const notesTextarea = document.getElementById("tower-notes-textarea");
      const skinName = this.towerVariants.getSelectedName();

      if (isCustomTower) {
        if (
          window.originalCustomTowers &&
          window.originalCustomTowers[this.tower.name]
        ) {
          const originalData =
            typeof structuredClone !== "undefined"
              ? structuredClone(window.originalCustomTowers[this.tower.name])
              : JSON.parse(
                  JSON.stringify(window.originalCustomTowers[this.tower.name]),
                );

          this.tower.importJSON({ [this.tower.name]: originalData });
          this.deltaTower.importJSON({ [this.tower.name]: originalData });

          if (notesTextarea) notesTextarea.value = "";

          this.reload();
          return;
        }

        if (notesTextarea) notesTextarea.value = "";
        this.reload();
        return;
      }

      // default towers that haven't been imported as custom = use default data
      const originalData =
        typeof structuredClone !== "undefined"
          ? structuredClone(defaultTowerManager.towerData[this.tower.name])
          : JSON.parse(
              JSON.stringify(defaultTowerManager.towerData[this.tower.name]),
            );

      this.tower.importJSON({ [this.tower.name]: originalData });
      this.deltaTower.importJSON({ [this.tower.name]: originalData });

      if (notesTextarea) {
        const noteValue = originalData[skinName]?.Defaults?.Note || "";
        notesTextarea.value = noteValue;
      }

      this.reload();
    },

    clearUnitChanges() {
      localStorage.removeItem(this.unitManager.dataKey);
      localStorage.removeItem(this.unitDeltaManager.dataKey);
      this.reload();
    },

    addNewTower(name, json) {
      this.app.towerManager.addTower(name, json);
      this.deltaTowerManager.addTower(name, json);

      this.app.addTowerOption(name);

      this.load(this.app.towerManager.towers[name]);
    },

    _getCombinedData() {
      this.activeUnits = this.populateActiveUnits();
      const combinedData = {
        master: this.tower.json,
        slave: {},
      };
      Object.entries(this.activeUnits).forEach(([unitName, _]) => {
        combinedData.slave[unitName] = this.unitManager.baseData[unitName];
      });
      return combinedData;
    },
  },
};

export default ViewerData;
