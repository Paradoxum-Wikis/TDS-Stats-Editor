import SkinData from "./SkinData.js";
import Level from "./Level.js";

class Levels {
  /**
   *
   * @param {SkinData} skinData
   */
  constructor(skinData) {
    this.skinData = skinData;
    this.complexValues = [];
    this.complexAttributes = [];
    this.attributes = this.#getAttributes();
    this.levels = [];

    this.addLevel(skinData.defaults.attributes);

    this.skinData.upgrades.forEach((upgrade) =>
      this.addLevel(upgrade.attributes),
    );
  }

  #getAttributes() {
    const attributes = ["Level"];
    const complexValues = [];
    const complexAttributes = [];

    const addComplex = (attribute, fullName) => {
      for (const [attributeName, attributeValue] of Object.entries(attribute)) {
        const combinedName = fullName + attributeName;
        if (attributeValue instanceof Object) {
          if (!complexAttributes.includes(combinedName))
            complexAttributes.push(combinedName);
          addComplex(attributeValue, combinedName + ".");
        } else {
          if (!complexValues.includes(combinedName))
            complexValues.push(combinedName);
        }
      }
    };

    const processAttribute = (attributeName, level) => {
      const foundStat = this.skinData.get(level, attributeName);
      if (foundStat instanceof Object) {
        if (!complexAttributes.includes(attributeName))
          complexAttributes.push(attributeName);
        addComplex(foundStat, attributeName + ".");
      } else {
        if (!attributes.includes(attributeName)) attributes.push(attributeName);
      }
    };

    this.skinData.defaults.attributeNames.forEach((name) =>
      processAttribute(name, 0),
    );

    this.skinData.upgrades.forEach((level, index) =>
      level.attributeNames.forEach((name) => processAttribute(name, index + 1)),
    );

    this.complexValues = complexValues;
    this.complexAttributes = complexAttributes;

    return attributes;
  }

  addLevel(data) {
    this.levels.push(new Level(this, data));
  }

  getCell(level, propertyId) {
    // checks if the level index is valid for the current internal levels array
    if (!this.levels || level < 0 || level >= this.levels.length) {
      console.error(
        `getCell: Invalid level index ${level} requested. Available levels: ${this.levels?.length}`,
      );
      // returns a default value/structure expected by the caller to avoid crashing :sob:
      return undefined;
    }

    const levelData = this.levels[level];

    if (!levelData) {
      console.error(
        `getCell: Level data at index ${level} is null or undefined.`,
      );
      return undefined;
    }

    return levelData[propertyId];
  }

  set(level, attribute, newValue) {
    this.skinData.set(level, attribute, newValue);
  }

  #format(cell, header) {
    switch (header) {
      case "Income":
      case "Cost":
      case "NetCost":
        return `$${cell.toFixed(0)}`;
      default:
        break;
    }

    switch (typeof cell) {
      case "number":
        return (Math.ceil(cell * 100) / 100).toFixed(2);
      default:
        return cell;
    }
  }

  getCSV() {
    const table = [[...this.attributes]];

    this.levels.forEach((level) => {
      let levelData = this.attributes.map((header) =>
        this.#format(level[header], header),
      );

      table.push(levelData);
    });

    return table;
  }

  getTable() {
    const header = [...this.attributes];
    const table = [];

    this.levels.forEach((level) => {
      let levelData = header.reduce((newLevel, headerName) => {
        newLevel[headerName] = this.#format(level[headerName], headerName);
        return newLevel;
      }, {});

      table.push(levelData);
    });

    return [table, header];
  }

  addCalculated(name, getter) {
    if (this.attributes.includes(name)) return this.addOverride(name, getter);
    this.attributes.push(name);

    this.levels.forEach((level) => {
      Object.defineProperty(level, name, {
        get() {
          return getter(this);
        },
      });
    });
  }

  addOverride(name, getter) {
    this.levels.forEach((level) => {
      const originalValue = level[name];
      Object.defineProperty(level, name, {
        get() {
          return getter(originalValue, this);
        },
      });
    });
  }
}

export default Levels;
