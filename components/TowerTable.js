import Table from "./Table.js";
import SkinData from "../TowerComponents/SkinData.js";
import {
  towerRegistry,
  TowerRegistry,
} from "../TowerComponents/TowerRegistry.js";

import TableInput from "./TableInput.js";

export default class TowerTable extends Table {
  constructor(root, viewer) {
    super(root);
    this.viewer = viewer;
    this.tower = viewer.tower;

    // listen for settings changes
    document.addEventListener("settingsChanged", (e) => {
      if (
        this.isLoaded &&
        (e.detail.setting === "showSeconds" ||
          e.detail.setting === "showStuds" ||
          e.detail.setting === "forceUSNumbers")
      ) {
        this.refresh();
      }
    });

    this.isLoaded = false;
  }

  removeTable() {
    super.removeTable();
    this.isLoaded = false;
  }

  refresh() {
    if (!this.isLoaded || !this.loadedData) return;

    while (this.body.firstChild) {
      this.body.removeChild(this.body.firstChild);
    }

    // rebuild the table body with current data
    this.#addBody(this.loadedData.levels);
  }

  #createBaseTable() {
    this.header = this.createHeader();
    this.body = this.createBody();

    this.root.appendChild(this.header);
    this.root.appendChild(this.body);
  }

  #addHeader(elements) {
    const headerRow = this.createRow();
    elements.forEach((element) => {
      const headerCell = this.createHeaderCell(element);
      headerRow.appendChild(headerCell);
    });
    this.header.appendChild(headerRow);
  }

  #addBody(levels) {
    const deltaLevels =
      this.viewer.deltaTower.skins[this.viewer.towerVariants.getSelectedName()]
        .levels;

    levels.levels.forEach((level, index) => {
      // skip if NoTable =true
      if (level.NoTable === true) {
        return;
      }

      const tr = this.createRow();

      levels.attributes
        .filter((attribute) => !this.ignore.includes(attribute))
        .forEach((attribute, _) => {
          const tableInput = new TableInput({
            level: index,
            attribute: attribute,
            towerLevels: levels,
            referenceLevels: deltaLevels,
            useDelta: this.viewer.buttonDeltaButton.state,
            viewer: this.viewer,
            isComplex: false,
            tower: this.tower,
          });
          tableInput.createInput();
          tr.appendChild(tableInput.base);
        });

      levels.complexValues
        .filter(this.#viewFilter.bind(this))
        .forEach((attribute, _) => {
          const tableInput = new TableInput({
            level: index,
            attribute: attribute,
            towerLevels: levels,
            referenceLevels: deltaLevels,
            useDelta: this.viewer.buttonDeltaButton.state,
            viewer: this.viewer,
            isComplex: true,
            tower: this.tower,
          });
          tableInput.createInput();
          tr.appendChild(tableInput.base);
        });

      this.body.appendChild(tr);
    });
  }

  #viewFilter(attribute) {
    let attributeName = attribute;
    if (attributeName.includes(".")) {
      return !this.ignore.some((ignoreValue) =>
        attributeName.startsWith(ignoreValue),
      );
    }

    return !this.ignore.includes(attributeName);
  }

  /**
   * @param {SkinData} data
   */
  load(data, options) {
    options = options ?? {};
    this.ignore = options.ignore ?? [];
    this.loadedData = data; // store data for refresh ops

    // update tower reference when loading data
    this.tower = this.viewer.tower;

    this.removeTable();
    this.#createBaseTable();

    this.#addHeader(
      [...data.levels.attributes, ...data.levels.complexValues].filter(
        this.#viewFilter.bind(this),
      ),
    );

    this.#addBody(data.levels);
    this.isLoaded = true;

    this.updateTowerRegistry();
  }

  updateTowerRegistry() {
    if (this.tower) {
      TowerRegistry.log(`Updating tower registry for ${this.tower.name}`);
      towerRegistry.updateTower(this.tower.name, this.tower.json);
    }
  }
}
