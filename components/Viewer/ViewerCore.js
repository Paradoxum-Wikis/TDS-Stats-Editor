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

    // setting up managers for units and towers
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

    // hooking up the property viewer and side panel
    this.propertyViewer = new PropertyViewer(
      this,
      document.getElementById("property-viewer"),
    );
    this.sidePanel = new SidePanel();

    this.upgradeViewer = new UpgradeViewer(this);
    this.boostPanel = new BoostPanel(this);

    // grabbing the tower name heading
    this.towerNameH1 = document.querySelector("#tower-name");

    // setting up buttons for variants and views
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

        // Store current view
        const currentView = this.tableView.getSelectedName();

        // Update buttons
        this.tableView.setButtons(viewOptions);

        // If Lua was selected but is now disabled, switch to JSON view
        if (currentView === "Lua" && !e.detail.value) {
          this.tableView.selectButton("JSON");
          this.loadBody();
        }
      }
    });

    // toggle button for delta view
    this.buttonDeltaButton = new ToggleButton(
      document.querySelector("#button-delta"),
      { state: true },
    );

    // reloads when toggle changes
    this.buttonDeltaButton.element.addEventListener(
      "toggled",
      (() => {
        this.reload();
      }).bind(this),
    );

    this.towerViewDropdownButton = document.querySelector(
      "#tower-view-dropdown",
    );

    // setting up tables and viewers
    this.towerTable = new TowerTable(
      document.querySelector("#tower-table"),
      this,
    );
    this.unitTable = new UnitTable(document.querySelector("#unit-table"), this);

    this.jsonViewer = new JSONViewer();
    this.luaViewer = new LuaViewer();

    // json copy button setup - now works because onCopyJSON exists
    this.jsonCopy = document.querySelector("#json-copy");
    this.jsonCopy.addEventListener("click", this.onCopyJSON.bind(this));

    this.luaCopy = document.querySelector("#lua-copy");
    if (this.luaCopy) {
      this.luaCopy.addEventListener("click", this.onCopyLua.bind(this));
    }

    // toggle for showing combined json
    this.showCombinedJSON = document.querySelector("#show-combined-json");
    if (this.showCombinedJSON) {
      this.showCombinedJSONActive = true; // default to active state

      // applies active styling immediately
      this.showCombinedJSON.classList.remove("btn-outline-secondary");
      this.showCombinedJSON.classList.add("btn-primary");

      this.showCombinedJSON.addEventListener("click", () => {
        this.showCombinedJSONActive = !this.showCombinedJSONActive; // toggle state

        // toggles button appearance
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

    // setup faithful format toggle
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

    // import button setup
    this.importButtonOpen = document.querySelector("#json-import");
    this.importButtonOpen.addEventListener(
      "click",
      (() => {
        document.querySelector("#json-import-text").value = "";
      }).bind(this),
    );

    // export button
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

    // export with units button
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

    // setting up more management stuff
    this.tableManagement = new TableDataManagement(this);
    new AddAttributeForm(this);
    new CloneTowerForm(this);
    this.removeAttributeForm = new RemoveAttributeForm(this);

    // starts wikitable setup
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

    // Create wikitable viewer instance
    this.wikitextViewer = new WikitextViewer();

    // wikitable events
    if (this.setupWikitableEventListeners) {
      this.setupWikitableEventListeners();
    } else if (ViewerWikitable.init) {
      ViewerWikitable.init.call(this);
    }

    // add tower import event listener
    document.addEventListener("towerDataImport", (event) => {
      try {
        const { data, type, error } = event.detail;

        // handle empty content
        if (type === "empty") {
          const alert = new Alert("No content to import.", {
            alertStyle: "alert-warning",
          });
          alert.fire();
          return;
        }

        // handle error case
        if (type === "error") {
          const alert = new Alert(`Failed to import: ${error}`, {
            alertStyle: "alert-danger",
          });
          alert.fire();
          return;
        }

        // process valid input
        if (type === "lua") {
          // Convert Lua to JSON first
          const jsonData = this.parseLuaToJSON(data);
          this.import(JSON.stringify(jsonData), true);
        } else {
          // Process as JSON directly
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
        // get the active skin
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

    // setup notes saving
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

    // checks for structure
    if (!this.deltaTower.json[towerName]) {
      this.deltaTower.json[towerName] = {};
    }

    if (!this.deltaTower.json[towerName][skinName]) {
      this.deltaTower.json[towerName][skinName] = {};
    }

    if (!this.deltaTower.json[towerName][skinName].Defaults) {
      this.deltaTower.json[towerName][skinName].Defaults = {};
    }

    // add/update the note
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

  // loads up a tower to show
  load(tower) {
    this.tower = tower;
    this.deltaTower = this.deltaTowerManager.towers[this.tower.name];

    // dispatch event that tower was loaded
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

  // refreshes everything
  reload() {
    this.unitManager.load();
    this.unitDeltaManager.load();

    this.loadBody();
  }

  // gets the current skin being viewed
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

    // process nested Lua tables recursively
    const parseNestedLua = (luaStr) => {
      // basic sanity check for table structure
      if (!luaStr.trim().startsWith("{") || !luaStr.trim().endsWith("}")) {
        throw new Error("Invalid Lua table format");
      }

      // remove outer braces
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

        // handle strings
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

        // track bracket depth for nested tables
        if (char === "{") bracketDepth++;
        if (char === "}") bracketDepth--;

        // if we're in a nested structure, just collect everything until we reach the matching closing bracket
        if (bracketDepth > 0 || inString) {
          currentToken += char;
          continue;
        }

        // handle key-value separators
        if (char === "=" && !inKey) {
          inKey = true;
          currentKey = currentToken.trim();
          currentToken = "";
          continue;
        }

        // handle entry separators
        if (char === "," || i === luaStr.length - 1) {
          // includes last character if we're at the end
          if (i === luaStr.length - 1 && char !== ",") {
            currentToken += char;
          }

          // process what was collected
          if (inKey) {
            // keys
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
              // normal keys don't need quotes in Lua but need them in JSON soooo
              currentKey = currentKey;
            }

            // parse the value
            if (value === "null" || value === "nil") {
              result[currentKey] = null;
            } else if (value === "true") {
              result[currentKey] = true;
            } else if (value === "false") {
              result[currentKey] = false;
            } else if (!isNaN(Number(value))) {
              result[currentKey] = Number(value);
            } else if (value.startsWith("{") && value.endsWith("}")) {
              // recursively parse nested table
              result[currentKey] = parseNestedLua(value);
            } else if (
              (value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))
            ) {
              // handle string values
              result[currentKey] = value.slice(1, -1);
            } else {
              // default
              result[currentKey] = value;
            }
          } else {
            // no = sign, so it must be an array element
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

          // reset for the next entry
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
