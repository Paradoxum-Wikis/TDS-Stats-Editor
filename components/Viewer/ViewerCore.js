import TowerTable from "../TowerTable.js";
import UnitTable from "../UnitTable.js";
import ButtonSelection from "../ButtonSelection.js";
import ToggleButton from "../ToggleButton.js";
import TowerManager from "../../TowerComponents/TowerManager.js";
import TableDataManagement from "../TableDataManagement.js";
import PropertyViewer from "../PropertyViewer.js";
import SidePanel from "../SidePanel.js";
import UpgradeViewer from "../UpgradeViewer.js";
import AddAttributeForm from "../Form/AddAttributeForm.js";
import RemoveAttributeForm from "../Form/RemoveAttributeForm.js";
import UnitManager from "../../TowerComponents/UnitManager.js";
import BoostPanel from "../BoostPanel.js";
import CloneTowerForm from "../Form/CloneTowerForm.js";
import LuaViewer from "../TableMode/LuaConverter.js";
import WikitextViewer from "../TableMode/WikitextViewer.js";
import ViewerUI from "./ViewerUI.js";
import ViewerData from "./ViewerData.js";
import ViewerTable from "./ViewerTable.js";
import ViewerWikitable from "./ViewerWikitable.js";
import ViewerUtils from "./ViewerUtils.js";
import Alert from "../Alert.js";
import CalculationSystemManager from "../CalculationSystemManager.js";

class ViewerCore {
  constructor(app) {
    this.app = app;

    this.unitManager = new UnitManager("units");
    this.unitDeltaManager = new UnitManager("unitDeltas");
    this.defaultTowerManager = new TowerManager("default");
    this.deltaTowerManager = new TowerManager("delta");

    // Mix in other modules first, before using their methods
    Object.assign(this, ViewerUI.methods);
    Object.assign(this, ViewerData.methods);
    Object.assign(this, ViewerTable.methods);
    Object.assign(this, ViewerWikitable.methods);
    Object.assign(this, ViewerUtils.methods);

    this.propertyViewer = new PropertyViewer(
      this,
      document.getElementById("property-viewer"),
    );
    this.sidePanel = new SidePanel();

    this.upgradeViewer = new UpgradeViewer(this);
    this.boostPanel = new BoostPanel(this);

    this.towerNameH1 = document.querySelector("#tower-name");

    this.towerVariants = new ButtonSelection(
      document.querySelector("#tower-variants"),
    );

    // check if lua viewer is enabled from settings or localStorage
    const enableLuaViewer = window.settingsManager
      ? window.settingsManager.enableLuaViewer
      : localStorage.getItem("enableLuaViewer") === "true";

    const viewOptions = ["Table", "Wikitable", "JSON"];
    if (enableLuaViewer) {
      viewOptions.push("Lua");
    }

    this.tableView = new ButtonSelection(
      document.querySelector("#table-view"),
    ).setButtons(viewOptions);

    this.tableView.root.addEventListener("submit", () => this.loadBody());

    document.addEventListener("settingsChanged", (e) => {
      if (e.detail.setting === "enableLuaViewer") {
        const viewOptions = ["Table", "Wikitable", "JSON"];
        if (e.detail.value) {
          viewOptions.push("Lua");
        }

        const currentView = this.tableView.getSelectedName();

        this.tableView.setButtons(viewOptions);

        // If Lua was selected but is now disabled, switch to JSON view
        if (currentView === "Lua" && !e.detail.value) {
          this.tableView.selectButton("JSON");
          this.loadBody();
        }
      } else if (
        e.detail.setting === "showStuds" ||
        e.detail.setting === "showSeconds"
      ) {
        this.reload();
      }
    });

    this.buttonDeltaButton = new ToggleButton(
      document.querySelector("#button-delta"),
      { state: true },
    );

    this.buttonDeltaButton.element.addEventListener(
      "toggled",
      (() => {
        this.reload();
      }).bind(this),
    );

    this.towerViewDropdownButton = document.querySelector(
      "#tower-view-dropdown",
    );

    this.towerTable = new TowerTable(
      document.querySelector("#tower-table"),
      this,
    );
    this.unitTable = new UnitTable(document.querySelector("#unit-table"), this);

    this.jsonViewer = new JSONViewer();
    this.luaViewer = new LuaViewer();

    this.jsonCopy = document.querySelector("#json-copy");
    this.jsonCopy.addEventListener("click", this.onCopyJSON.bind(this));

    this.luaCopy = document.querySelector("#lua-copy");
    if (this.luaCopy) {
      this.luaCopy.addEventListener("click", this.onCopyLua.bind(this));
    }

    this.showCombinedJSON = document.querySelector("#show-combined-json");
    if (this.showCombinedJSON) {
      this.showCombinedJSONActive = true;

      this.showCombinedJSON.classList.remove("btn-outline-secondary");
      this.showCombinedJSON.classList.add("btn-primary");

      this.showCombinedJSON.addEventListener("click", () => {
        this.showCombinedJSONActive = !this.showCombinedJSONActive;

        if (this.showCombinedJSONActive) {
          this.showCombinedJSON.classList.remove("btn-outline-secondary");
          this.showCombinedJSON.classList.add("btn-primary");
        } else {
          this.showCombinedJSON.classList.remove("btn-primary");
          this.showCombinedJSON.classList.add("btn-outline-secondary");
        }
        this.clearJSON();
        this.loadJSON();
      });
    }

    this.useFaithfulFormat = false;
    this.useFaithfulFormatButton = document.querySelector(
      "#use-faithful-format",
    );
    if (this.useFaithfulFormatButton) {
      this.useFaithfulFormatButton.addEventListener("click", () => {
        this.useFaithfulFormat = !this.useFaithfulFormat;

        if (this.useFaithfulFormat) {
          this.useFaithfulFormatButton.classList.add("btn-primary");
          this.useFaithfulFormatButton.classList.remove(
            "btn-outline-secondary",
          );
        } else {
          this.useFaithfulFormatButton.classList.remove("btn-primary");
          this.useFaithfulFormatButton.classList.add("btn-outline-secondary");
        }

        if (this.tableView.getSelectedName() === "Wikitable") {
          this.loadWikitableContent();
        }
      });
    }

    this.importButtonOpen = document.querySelector("#json-import");
    this.importButtonOpen.addEventListener(
      "click",
      (() => {
        document.querySelector("#json-import-text").value = "";
      }).bind(this),
    );

    this.exportButton = document.querySelector("#json-export");
    this.exportButton.addEventListener(
      "click",
      (() => {
        if (this.showCombinedJSON && this.showCombinedJSONActive) {
          this.exportTowerWithUnits();
        } else {
          this.export(JSON.stringify(this.tower.json));
        }
      }).bind(this),
    );

    this.exportWithUnitsButton = document.querySelector(
      "#json-export-with-units",
    );
    if (this.exportWithUnitsButton) {
      this.exportWithUnitsButton.addEventListener(
        "click",
        this.exportTowerWithUnits.bind(this),
      );
    }

    this.luaExport = document.querySelector("#lua-export");
    if (this.luaExport) {
      this.luaExport.addEventListener("click", () => {
        if (this.showCombinedJSON && this.showCombinedJSONActive) {
          this.exportLuaWithUnits();
        } else {
          this.exportLua(this.tower.json);
        }
      });
    }

    this.tableManagement = new TableDataManagement(this);
    new AddAttributeForm(this);
    new CloneTowerForm(this);
    this.removeAttributeForm = new RemoveAttributeForm(this);

    this.wikitablePanel = document.querySelector("#wikitable-panel");
    this.wikitableContent = document.querySelector("#wikitable");
    this.wikitableCopy = document.querySelector("#wikitable-copy");
    this.wikitableCopy.addEventListener(
      "click",
      this.onCopyWikitable.bind(this),
    );

    this.wikitableExport = document.querySelector("#wikitable-export");
    this.wikitableExport.addEventListener(
      "click",
      this.exportWikitable.bind(this),
    );

    this.wikitextViewer = new WikitextViewer();

    if (this.setupWikitableEventListeners) {
      this.setupWikitableEventListeners();
    } else if (ViewerWikitable.init) {
      ViewerWikitable.init.call(this);
    }

    document.addEventListener("towerDataImport", (event) => {
      try {
        const { data, type, error } = event.detail;

        if (type === "empty") {
          const alert = new Alert("No content to import.", {
            alertStyle: "alert-warning",
          });
          alert.fire();
          return;
        }

        if (type === "error") {
          const alert = new Alert(`Failed to import: ${error}`, {
            alertStyle: "alert-danger",
          });
          alert.fire();
          return;
        }

        if (type === "lua") {
          const jsonData = this.parseLuaToJSON(data);
          this.import(JSON.stringify(jsonData), true);
        } else {
          this.import(data, true);
        }
      } catch (error) {
        console.error("Import error:", error);
        const alert = new Alert(`Import Error: ${error.message}`, {
          alertStyle: "alert-danger",
        });
        alert.fire();
      }
    });

    document.addEventListener("calculationSystemChanged", (e) => {
      if (e.detail.tower === this.tower) {
        const activeSkin = this.getActiveSkin();
        if (activeSkin) {
          activeSkin.createData();
        }

        // force a complete table reload if we're in table view
        if (this.tableView && this.tableView.getSelectedName() === "Table") {
          if (this.towerTable) {
            this.towerTable.removeTable();

            setTimeout(() => {
              this.loadTable();
              if (
                this.tableManagement &&
                typeof this.tableManagement.renderButtonOutlines === "function"
              ) {
                this.tableManagement.renderButtonOutlines();
              }
            }, 50);
          }
        }
      }
    });

    this.calculationSystemManager = new CalculationSystemManager();

    const notesTextarea = document.getElementById("tower-notes-textarea");
    if (notesTextarea) {
      notesTextarea.addEventListener("input", () => {
        if (this.tower && this.deltaTower) {
          this.saveNotes(notesTextarea.value);
        }
      });
    }
  }

  saveNotes(noteText) {
    if (!this.tower || !this.deltaTower) return;

    const towerName = this.tower.name;
    const skinName = this.towerVariants.getSelectedName();

    if (!this.deltaTower.json[towerName]) {
      this.deltaTower.json[towerName] = {};
    }

    if (!this.deltaTower.json[towerName][skinName]) {
      this.deltaTower.json[towerName][skinName] = {};
    }

    if (!this.deltaTower.json[towerName][skinName].Defaults) {
      this.deltaTower.json[towerName][skinName].Defaults = {};
    }

    this.deltaTower.json[towerName][skinName].Defaults.Note = noteText;

    if (!this.tower.json[towerName]) {
      this.tower.json[towerName] = {};
    }

    if (!this.tower.json[towerName][skinName]) {
      this.tower.json[towerName][skinName] = {};
    }

    if (!this.tower.json[towerName][skinName].Defaults) {
      this.tower.json[towerName][skinName].Defaults = {};
    }

    this.tower.json[towerName][skinName].Defaults.Note = noteText;
    this.deltaTowerManager.saveTower(this.deltaTower);
    this.app.towerManager.saveTower(this.tower);
  }

  load(tower) {
    this.tower = tower;
    this.deltaTower = this.deltaTowerManager.towers[this.tower.name];

    document.dispatchEvent(
      new CustomEvent("towerLoaded", {
        detail: { tower: this.tower },
      }),
    );

    this.setVariantButtons();
    this.unitManager.load();
    this.unitDeltaManager.load();

    this.loadBody();
  }

  reload() {
    this.unitManager.load();
    this.unitDeltaManager.load();

    this.loadBody();
  }

  getActiveSkin() {
    return this.tower.skins[this.towerVariants.getSelectedName()];
  }

  convertToLuaString(obj, indent = 0) {
    if (obj === null) return "nil";

    const indentStr = "    ".repeat(indent);
    const indentStrNext = "    ".repeat(indent + 1);

    if (typeof obj === "string") {
      const escaped = obj
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n");
      return `"${escaped}"`;
    }

    if (typeof obj === "number" || typeof obj === "boolean") {
      return String(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) return "{}";

      let result = "{\n";
      obj.forEach((item, index) => {
        result += `${indentStrNext}${this.convertToLuaString(item, indent + 1)}`;
        if (index < obj.length - 1) {
          result += ",";
        }
        result += "\n";
      });
      result += `${indentStr}}`;
      return result;
    }

    if (typeof obj === "object") {
      const keys = Object.keys(obj);
      if (keys.length === 0) return "{}";

      let result = "{\n";
      keys.forEach((key, index) => {
        const luaKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)
          ? key
          : `["${key}"]`;

        result += `${indentStrNext}${luaKey} = ${this.convertToLuaString(obj[key], indent + 1)}`;
        if (index < keys.length - 1) {
          result += ",";
        }
        result += "\n";
      });
      result += `${indentStr}}`;
      return result;
    }

    return String(obj);
  }

  loadLua() {
    document.querySelector("#lua").appendChild(this.luaViewer.getContainer());
    if (this.showCombinedJSON && this.showCombinedJSONActive) {
      this.luaViewer.showJSONAsLua(this._getCombinedData());
    } else {
      this.luaViewer.showJSONAsLua(this.tower.json);
    }
  }

  clearLua() {
    document.querySelector("#lua").innerHTML = "";
  }

  exportLua(data) {
    const luaString = `local data = ${this.convertToLuaString(data)}\n\nreturn data`;
    this.downloadFile(luaString, `${this.tower.name}.lua`, "lua");
  }

  exportLuaWithUnits() {
    const combinedData = this._getCombinedData();
    const luaString = `local data = ${this.convertToLuaString(combinedData)}\n\nreturn data`;
    this.downloadFile(luaString, `${this.tower.name}_with_units.lua`, "lua");
  }

  isLuaTable(text) {
    text = text.trim();

    const startsWithLocal = /^local\s+data\s*=/.test(text);
    const hasReturnData = /return\s+data\s*$/.test(text);

    // if it's a valid json, it's probably not Lua
    try {
      JSON.parse(text);
      return false;
    } catch (e) {
      return startsWithLocal && hasReturnData;
    }
  }

  parseLuaToJSON(luaText) {
    let text = luaText.trim();

    const modulePattern = /local\s+data\s*=\s*({[\s\S]*})\s*return\s+data/;
    const moduleMatch = text.match(modulePattern);

    if (!moduleMatch) {
      throw new Error(
        "Invalid Lua format. Expected 'local data = { ... } return data' format.",
      );
    }

    text = moduleMatch[1];
    text = text.replace(/\bnil\b/g, "null");
    text = text.replace(/--.*$/gm, "");

    const parseNestedLua = (luaStr) => {
      if (!luaStr.trim().startsWith("{") || !luaStr.trim().endsWith("}")) {
        throw new Error("Invalid Lua table format");
      }

      luaStr = luaStr.trim().slice(1, -1).trim();

      const result = {};
      let arrayIndex = 0;
      let currentKey = null;
      let currentToken = "";
      let inString = false;
      let stringQuote = "";
      let bracketDepth = 0;
      let inKey = false;

      for (let i = 0; i < luaStr.length; i++) {
        const char = luaStr[i];

        if (
          (char === '"' || char === "'") &&
          (i === 0 || luaStr[i - 1] !== "\\")
        ) {
          if (!inString) {
            inString = true;
            stringQuote = char;
            continue;
          } else if (char === stringQuote) {
            inString = false;
            continue;
          }
        }

        if (inString) {
          currentToken += char;
          continue;
        }

        if (char === "{") bracketDepth++;
        if (char === "}") bracketDepth--;

        if (bracketDepth > 0 || inString) {
          currentToken += char;
          continue;
        }

        if (char === "=" && !inKey) {
          inKey = true;
          currentKey = currentToken.trim();
          currentToken = "";
          continue;
        }

        if (char === "," || i === luaStr.length - 1) {
          if (i === luaStr.length - 1 && char !== ",") {
            currentToken += char;
          }

          if (inKey) {
            let value = currentToken.trim();

            if (currentKey.startsWith("[") && currentKey.endsWith("]")) {
              currentKey = currentKey.slice(1, -1).trim();
              if (
                (currentKey.startsWith('"') && currentKey.endsWith('"')) ||
                (currentKey.startsWith("'") && currentKey.endsWith("'"))
              ) {
                currentKey = currentKey.slice(1, -1);
              }
            } else {
              currentKey = currentKey;
            }

            if (value === "null" || value === "nil") {
              result[currentKey] = null;
            } else if (value === "true") {
              result[currentKey] = true;
            } else if (value === "false") {
              result[currentKey] = false;
            } else if (!isNaN(Number(value))) {
              result[currentKey] = Number(value);
            } else if (value.startsWith("{") && value.endsWith("}")) {
              result[currentKey] = parseNestedLua(value);
            } else if (
              (value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))
            ) {
              result[currentKey] = value.slice(1, -1);
            } else {
              result[currentKey] = value;
            }
          } else {
            let value = currentToken.trim();

            if (value === "null" || value === "nil") {
              result[arrayIndex++] = null;
            } else if (value === "true") {
              result[arrayIndex++] = true;
            } else if (value === "false") {
              result[arrayIndex++] = false;
            } else if (!isNaN(Number(value))) {
              result[arrayIndex++] = Number(value);
            } else if (value.startsWith("{") && value.endsWith("}")) {
              result[arrayIndex++] = parseNestedLua(value);
            } else if (
              (value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))
            ) {
              result[arrayIndex++] = value.slice(1, -1);
            } else {
              result[arrayIndex++] = value;
            }
          }

          currentToken = "";
          inKey = false;
          continue;
        }

        currentToken += char;
      }

      // convert to array if appropriate
      const keys = Object.keys(result);
      if (keys.length > 0 && keys.every((k) => !isNaN(parseInt(k)))) {
        const array = [];
        keys
          .sort((a, b) => parseInt(a) - parseInt(b))
          .forEach((k) => {
            array.push(result[k]);
          });
        return array;
      }

      return result;
    };

    try {
      return JSON.parse(text);
    } catch (e) {
      try {
        return parseNestedLua(text);
      } catch (parserError) {
        console.error("Lua parsing error:", parserError);
        throw new Error(`Failed to parse Lua: ${e.message}`);
      }
    }
  }
}

export default ViewerCore;
