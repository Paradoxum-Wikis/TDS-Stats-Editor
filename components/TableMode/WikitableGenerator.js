import {
  allowedAttributes,
  attributeLabels,
  getTowerSpecificLabel,
} from "./FaithfulCases.js";

class WikitableGenerator {
  constructor(tower, activeUnits, propertyViewer, towerVariants, viewer) {
    // sets up the wikitable generator with necessary data
    this.tower = tower;
    this.activeUnits = activeUnits;
    this.propertyViewer = propertyViewer;
    this.towerVariants = towerVariants;
    this.viewer = viewer;
  }

  // all of these are self explanatory  i think
  generateWikitableContent() {
    // generates the wikitable content for the tower's stats
    const skinData = this.viewer.getActiveSkin();
    const towerName = this.tower.name;
    const activeVariant = this.towerVariants.getSelectedName();
    const displayedVariant =
      activeVariant === "Default" ? "" : `${activeVariant} `;
    const fullTowerName = displayedVariant + towerName;

    const levels = skinData.levels;
    const attributes = levels.attributes.filter((attr) => {
      return (
        !this.propertyViewer.isDisabled(attr) &&
        !this.propertyViewer.isHidden(attr) &&
        !["NoTable", "SideLevel", "Level"].includes(attr)
      );
    });

    let displayAttributes = attributes;
    if (this.viewer.useFaithfulFormat) {
      displayAttributes = attributes.filter((attr) =>
        allowedAttributes.includes(attr),
      );
    }

    let wikitable;
    if (this.viewer.useFaithfulFormat) {
      wikitable = `<div style="overflow-x: scroll;">\n{| class="wikitable" style="text-align: center; margin: 0 auto"\n`;
    } else {
      wikitable = `<div style="overflow-x: scroll;">\n{| class="wikitable sortable" style="margin: 0 auto"\n`;
      wikitable += `|+ '''${fullTowerName} Master'''\n`;
    }

    wikitable += `|-\n`;

    // header formatting for faithful format
    if (this.viewer.useFaithfulFormat) {
      // use the order defined in allowedAttributes
      let orderedAttributes = [];
      for (const attr of allowedAttributes) {
        if (attr === "Level" || displayAttributes.includes(attr)) {
          orderedAttributes.push(attr);
        }
      }

      // Use the ordered attributes for headers
      let isFirst = true;
      orderedAttributes.forEach((attr) => {
        if (isFirst) {
          wikitable += `! scope="col" style="padding: 5px;" |${this.#formatWikitableHeader(attr)}`;
          isFirst = false;
        } else {
          wikitable += `\n! scope="col" style="padding: 5px;" |${this.#formatWikitableHeader(attr)}`;
        }
      });
    } else {
      // regular format remains unchanged
      wikitable += `! Level`;
      displayAttributes.forEach((attr) => {
        wikitable += ` !! ${this.#formatWikitableHeader(attr)}`;
      });
    }
    wikitable += `\n`;

    // Format rows
    levels.levels.forEach((level, index) => {
      if (level.NoTable === true) return;

      wikitable += `|-\n`;

      if (this.viewer.useFaithfulFormat) {
        // use the same order for the row values
        let orderedAttributes = [];
        for (const attr of allowedAttributes) {
          if (attr === "Level" || displayAttributes.includes(attr)) {
            orderedAttributes.push(attr);
          }
        }

        let isFirst = true;
        orderedAttributes.forEach((attr) => {
          const value =
            attr === "Level"
              ? (level.Level ?? index)
              : levels.getCell(index, attr);

          if (isFirst) {
            wikitable += `| style="padding: 5px;" |${this.#formatWikitableCell(value, attr)}`;
            isFirst = false;
          } else {
            wikitable += `\n| style="padding: 5px;" |${this.#formatWikitableCell(value, attr)}`;
          }
        });
      } else {
        // regular format remains unchanged
        wikitable += `| ${level.Level ?? index}`;

        displayAttributes.forEach((attr) => {
          const value = levels.getCell(index, attr);
          wikitable += ` || ${this.#formatWikitableCell(value, attr)}`;
        });
      }

      wikitable += `\n`;
    });

    // Close table
    wikitable += `|}\n</div>`;

    return wikitable;
  }

  generateUnitWikitableContent() {
    // generates the wikitable content for the units' stats
    const towerName = this.tower.name;
    const activeVariant = this.towerVariants.getSelectedName();
    const displayedVariant =
      activeVariant === "Default" ? "" : `${activeVariant} `;
    const fullTowerName = displayedVariant + towerName;

    if (!this.activeUnits || Object.keys(this.activeUnits).length === 0) {
      return "";
    }

    const firstUnitKey = Object.keys(this.activeUnits)[0];
    const firstUnit = this.activeUnits[firstUnitKey];

    if (!firstUnit || !firstUnit.data) {
      return "";
    }

    let attributes = firstUnit.attributeNames.filter((attr) => {
      return (
        !this.propertyViewer.isDisabled(attr) &&
        !this.propertyViewer.isHidden(attr) &&
        !["NoTable", "SideLevel", "Level"].includes(attr)
      );
    });

    if (this.viewer.useFaithfulFormat) {
      attributes = attributes.filter((attr) =>
        allowedAttributes.includes(attr),
      );
    }

    const sortableClass = this.viewer.useFaithfulFormat ? "" : "sortable";

    // line break for faithful format (intentionally 2 empty space)
    let wikitable = this.viewer.useFaithfulFormat ? "\n" : "";

    wikitable += `<div style="overflow-x: scroll;">\n{| class="wikitable ${sortableClass}" style="text-align: center; margin: 0 auto"\n`;

    if (!this.viewer.useFaithfulFormat) {
      wikitable += `|+ '''${fullTowerName} Slave'''\n`;
    }

    wikitable += `|-\n`;

    if (this.viewer.useFaithfulFormat) {
      let orderedAttributes = ["Name"];
      for (const attr of allowedAttributes) {
        if (attributes.includes(attr)) {
          orderedAttributes.push(attr);
        }
      }

      let isFirst = true;
      orderedAttributes.forEach((attr) => {
        if (isFirst) {
          wikitable += `! scope="col" style="padding: 5px;" |${this.#formatWikitableHeader(attr === "Name" ? "Name" : attr)}`;
          isFirst = false;
        } else {
          wikitable += `\n! scope="col" style="padding: 5px;" |${this.#formatWikitableHeader(attr)}`;
        }
      });
    } else {
      // og format
      wikitable += `! Name`;
      attributes.forEach((attr) => {
        wikitable += ` !! ${this.#formatWikitableHeader(attr)}`;
      });
    }

    wikitable += `\n`;

    // Row formatting
    Object.entries(this.activeUnits).forEach(([unitName, unitData]) => {
      if (!unitData.data) {
        return;
      }

      wikitable += `|-\n`;

      if (this.viewer.useFaithfulFormat) {
        // Order attributes according to allowedAttributes
        let orderedAttributes = ["Name"];
        for (const attr of allowedAttributes) {
          if (attributes.includes(attr)) {
            orderedAttributes.push(attr);
          }
        }

        let isFirst = true;
        orderedAttributes.forEach((attr) => {
          let value;

          if (attr === "Name") {
            value = unitName;
          } else {
            value = unitData.attributes[attr];
          }

          if (isFirst) {
            wikitable += `| style="padding: 5px;" |${this.#formatWikitableCell(value, attr)}`;
            isFirst = false;
          } else {
            wikitable += `\n| style="padding: 5px;" |${this.#formatWikitableCell(value, attr)}`;
          }
        });
      } else {
        wikitable += `| ${unitName}`;

        attributes.forEach((attr) => {
          const value = unitData.attributes[attr];
          wikitable += ` || ${this.#formatWikitableCell(value, attr)}`;
        });
      }

      wikitable += `\n`;
    });

    wikitable += `|}\n</div>`;

    return wikitable;
  }

  #formatWikitableHeader(attribute) {
    // check for tower specific label in faithful format
    if (this.viewer.useFaithfulFormat) {
      const towerSpecificLabel = getTowerSpecificLabel(
        attribute,
        this.tower.name,
      );
      if (towerSpecificLabel) {
        return towerSpecificLabel;
      }

      // everything else
      if (attributeLabels[attribute]) {
        return attributeLabels[attribute];
      }
    }

    // formats both wikitable header, handles acronyms
    const acronyms = {
      DPS: "DPS",
      LaserDPS: "Laser DPS",
      MissileDPS: "Missile DPS",
      TotalDPS: "Total DPS",
      RamDPS: "Ram DPS",
      UnitDPS: "Unit DPS",
      ExplosionDPS: "Explosion DPS",
      BurnDPS: "Burn DPS",
      CallToArmsDPS: "Call To Arms DPS",
      CaravanDPS: "Caravan DPS",
    };

    if (acronyms[attribute]) {
      return acronyms[attribute];
    }

    return attribute
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  #formatWikitableCell(value, attribute) {
    // formats cell values with appropriate units
    if (value === undefined || value === null) {
      return "";
    }

    // don't convert 0 or nan to n/a for levels
    if (attribute === "Level") {
      return value.toString();
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      if (attribute === "Detections") {
        const detections = [];
        if (value.Hidden !== undefined)
          detections.push(`Hidden: ${value.Hidden ? "Yes" : "No"}`);
        if (value.Flying !== undefined)
          detections.push(`Flying: ${value.Flying ? "Yes" : "No"}`);
        if (value.Lead !== undefined)
          detections.push(`Lead: ${value.Lead ? "Yes" : "No"}`);
        return detections.join(", ") || "";
      } else if (attribute === "Attributes") {
        return Object.entries(value)
          .map(
            ([key, val]) =>
              `${key}: ${typeof val === "boolean" ? (val ? "Yes" : "No") : val}`,
          )
          .join(", ");
      } else {
        return JSON.stringify(value).replace(/[{}"]/g, "");
      }
    }

    // Currency formatting
    if (
      [
        "Cost",
        "NetCost",
        "Income",
        "CostEfficiency",
        "IncomeEfficiency",
        "LimitNetCost",
        "IncomePerSecond",
        "TotalIncomePerSecond",
        "BaseIncome",
        "IncomePerTower",
        "MaxIncome",
      ].includes(attribute)
    ) {
      if (this.viewer.useFaithfulFormat) {
        // Check for NaN/0 before using Money template
        if (isNaN(value) || value === 0) {
          return "N/A";
        }
        return `{{Money|${this.#formatNumberWithCommas(value)}}}`;
      } else {
        return `$${this.#formatNumber(value)}`;
      }
    }

    // Percentage formatting
    if (
      [
        "Defense",
        "SlowdownPerHit",
        "MaxSlow",
        "RangeBuff",
        "DamageBuff",
        "FirerateBuff",
        "DefenseMelt",
        "MaxDefenseMelt",
        "CallToArmsBuff",
        "ThornPower",
        "CriticalMultiplier",
        "AftershockMultiplier",
        "SpeedMultiplier",
        "Active",
        "Inactive",
        "BaseSlowdown",
        "SlowdownPerTower",
        "BaseDefenseMelt",
        "DefenseMeltPerTower",
        "MaxDefenseMelt",
      ].includes(attribute)
    ) {
      return this.viewer.useFaithfulFormat
        ? this.#formatFaithfulNumber(value / 100)
        : `${this.#formatNumber(value)}%`;
    }

    const showSeconds = window.state?.settings?.showSeconds !== false;
    const showStuds = window.state?.settings?.showStuds === true;

    // Time formatting
    if (
      [
        "Cooldown",
        "ChargeTime",
        "SlowdownTime",
        "BurnTime",
        "PoisonLength",
        "BuffLength",
        "FreezeTime",
        "Duration",
        "LaserCooldown",
        "MissileCooldown",
        "BurstCooldown",
        "RevTime",
        "ReloadTime",
        "DetectionBuffLength",
        "ComboLength",
        "ComboCooldown",
        "KnockbackCooldown",
        "Spawnrate",
        "BuildTime",
        "AftershockCooldown",
        "AimTime",
        "EquipTime",
        "BuildDelay",
        "TimeBetweenMissiles",
        "SendTime",
        "StunLength",
        "Lifetime",
        "ConfusionTime",
        "ConfusionCooldown",
      ].includes(attribute)
    ) {
      return this.viewer.useFaithfulFormat
        ? this.#formatFaithfulNumber(value)
        : `${this.#formatNumber(value)}${showSeconds ? "s" : ""}`;
    }

    // Studs
    if (
      [
        "Range",
        "ExplosionRadius",
        "AssistRange",
      ].includes(attribute)
    ) {
      if (this.viewer.useFaithfulFormat) {
        return this.#formatFaithfulNumber(value);
      } else {
        return `${this.#formatNumber(value)}${showStuds ? ` ${value === 1 ? "stud" : "studs"}` : ""}`;
      }
    }

    if (["Speed"].includes(attribute)) {
      if (this.viewer.useFaithfulFormat) {
        return this.#formatFaithfulNumber(value);
      } else {
        return `${this.#formatNumber(value)}${showStuds ? ` ${value === 1 ? "stud/s" : "studs/s"}` : ""}`;
      }
    }

    // boolean values
    if (["Hidden", "Flying", "Lead", "Boss"].includes(attribute)) {
      return value ? "Yes" : "No";
    }

    // default handling
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    } else if (typeof value === "number") {
      return this.viewer.useFaithfulFormat
        ? this.#formatFaithfulNumber(value)
        : this.#formatNumber(value);
    } else {
      return value.toString();
    }
  }

  #formatNumber(num) {
    // formats a number for display in the wikitable
    if (Math.abs(num) < 0.01) return "0";

    // non faithful format uses locale formatting
    if (!this.viewer.useFaithfulFormat) {
      const forceUSFormat = window.state?.settings?.forceUSNumbers !== false;
      const formatter = forceUSFormat
        ? new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
        : new Intl.NumberFormat("ru-RU", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          });

      if (Number.isInteger(num)) {
        return formatter.format(num);
      }

      return formatter.format(num);
    }

    // faithful no locale
    if (Number.isInteger(num)) return num.toString();

    return (+num).toFixed(2).replace(/\.?0+$/, "");
  }

  // helper method for formatting numbers with commas but no decimal places
  #formatNumberWithCommas(num) {
    if (typeof num !== "number") return num;
    if (Math.abs(num) < 0.01) return "0";
    if (Number.isInteger(num)) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // keep up to 2 decimal places, then add commas
    const formattedNum = (+num).toFixed(2).replace(/\.?0+$/, "");
    return formattedNum.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  #formatFaithfulNumber(value) {
    // NaN and 0 to N/A in faithful format
    if (isNaN(value) || value === 0) {
      return "N/A";
    }
    return this.#formatNumber(value);
  }
}

export default WikitableGenerator;
