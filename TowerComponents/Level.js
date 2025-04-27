import Levels from "./Levels.js";

class Level {
  /**
   *
   * @param {Levels} levels
   * @param {object} data
   */
  constructor(levels, data = {}) {
    this.levels = levels;
    this.Level = levels.levels.length;

    levels.attributes.forEach((attribute) => {
      if (this[attribute] !== undefined) return;
      if (data[attribute] !== undefined) {
        this[attribute] = data[attribute];
      } else if (this.Level > 0) {
        this[attribute] = levels.getCell(this.Level - 1, attribute);
      }
    });
  }
}

export default Level;
