import Levels from "../TowerComponents/Levels.js";
import Viewer from "./Viewer";
import {
  towerRegistry,
  TowerRegistry,
} from "../TowerComponents/TowerRegistry.js";

export default class TableInput {
  /**
	 * ({
		level: level,
		attribute: attribute,
		towerLevels: levels,
		referenceLevels: deltaLevels,
		useDelta: this.viewer.buttonDeltaButton.state,
		viewer: this.viewer,
	})
	 */
  /**
     *
     * @param {{
	 * level: Number,
	 * attribute: String,
	 * towerLevels: Levels,
	 * referenceLevels: Levels,
	 * useDelta: Boolean,
	 * viewer: Viewer,
	 * }} data
 
     * @returns
     */
  constructor(data) {
    this.base = this.#createBase();

    this.level = data.level;
    this.attribute = data.attribute;
    this.towerLevels = data.towerLevels;
    this.referenceLevels = data.referenceLevels;
    this.useDelta = data.useDelta;
    this.viewer = data.viewer;
    this.isComplex = data.isComplex;

    this.sizeFactor = 1.35;
    this.sizeDeltaModifier = 0;
    this.sizeModifier = 0;
  }

  createInput() {
    const cellData = this.towerLevels.getCell(this.level, this.attribute);
    const deltaData = this.referenceLevels.getCell(this.level, this.attribute);

    const input = this.#getInput(cellData, deltaData);

    this.input = input;
  }

  #createBase() {
    const td = document.createElement("td");
    td.classList.add("table-cell");

    return td;
  }

  #getInput(value, deltaData) {
    if (["true", "false"].includes(String(value))) {
      return this.#createBooleanInput(value, deltaData);
    }

    if (Number.isFinite(+value)) {
      return this.#createNumberInput(value, deltaData);
    }

    return this.#createTextInput(value, deltaData);
  }

  #createBooleanInput(value, deltaData) {
    const input = document.createElement("input");

    input.type = "checkbox";
    input.checked = value;

    if (value !== deltaData || Number.isNaN(value) || Number.isNaN(deltaData)) {
      input.classList.add("form-check-input-delta");
    }

    input.classList.add("form-check-input");
    input.classList.add("child-center");
    input.style.padding = "0.6em";
    this.base.style.position = "relative";

    input.addEventListener("change", this.#onBooleanSubmit.bind(this));
    this.base.appendChild(input);

    return input;
  }

  #createNumberInput(value, deltaData) {
    const input = document.createElement("input");
    const form = document.createElement("form");

    input.classList.add("table-cell-input");
    input.size = 1;

    // .zero-value css
    if (value === 0 && this.attribute !== "Level") {
      input.classList.add("zero-value");
    }

    // Treat string "NaN" as NaN for coloring
    const isValueNaN = value === "NaN";
    const isDeltaNaN = deltaData === "NaN";

    let outputValue = this.#formatNumber(value);

    if (value !== deltaData || isValueNaN || isDeltaNaN) {
      input.classList.add("table-cell-input-delta");
      outputValue =
        String(outputValue) + String(this.#getDelta(value, deltaData, input));
    }

    const computedSize =
      String(outputValue).length / this.sizeFactor + this.sizeModifier;

    input.style.minWidth = `${computedSize}em`;
    input.value = outputValue;

    input.addEventListener("focusin", (() => (input.value = "")).bind(this));
    input.addEventListener("focusout", this.#onNumberSubmit.bind(this));
    form.addEventListener(
      "submit",
      ((e) => {
        e.preventDefault();
        input.blur();
      }).bind(this),
    );
    input.addEventListener("mouseup", () => {
      input.focus();
    });

    form.appendChild(input);
    this.base.appendChild(form);

    return input;
  }

  #onNumberSubmit() {
    let newValue = this.input.value;
    if (
      typeof newValue === "string" &&
      newValue.trim().toLowerCase() === "nan"
    ) {
      newValue = NaN;
    } else if (newValue !== "" && Number.isFinite(+newValue)) {
      newValue = +newValue;
    } else {
      this.#handleSubmission();
      return;
    }
    this.towerLevels.set(this.level, this.attribute, newValue);
    this.#handleSubmission();
  }

  #createTextInput(value, deltaData) {
    if (this.viewer.unitManager.hasUnit(value)) {
      this.viewer.activeUnits[value] = this.viewer.unitManager.unitData[value];
    }
    const input = document.createElement("input");
    input.size = 1;

    input.classList.add("table-cell-input");

    const isValueNaN = value === "NaN";
    const isDeltaNaN = deltaData === "NaN";

    if (value !== deltaData || isValueNaN || isDeltaNaN) {
      input.classList.add("table-cell-input-delta");
    }

    const computedSize = String(value).length / this.sizeFactor;

    input.style.minWidth = `${computedSize}em`;
    input.value = value;

    input.addEventListener(
      "focusin",
      (() => {
        input.value = "";
      }).bind(this),
    );
    input.addEventListener("focusout", this.#onTextSubmit.bind(this));
    input.addEventListener("mouseup", () => {
      input.focus();
    });

    this.base.appendChild(input);

    return input;
  }

  #onBooleanSubmit() {
    const newValue = this.input.checked;
    this.towerLevels.set(this.level, this.attribute, newValue);
    this.#handleSubmission();
  }

  #onTextSubmit() {
    const newValue = this.input.value;
    if (newValue != "") {
      this.towerLevels.set(this.level, this.attribute, newValue);
    }
    this.#handleSubmission();
  }

  #handleSubmission() {
    this.viewer.reload();

    if (this.tower && this.tower.name) {
      TowerRegistry.log(
        `TableInput updating registry for ${this.tower.name} after value change`,
      );
      towerRegistry.updateTower(this.tower.name, this.tower.json);
    }
  }

  #formatNumber(value) {
    const forceUSFormat = window.state?.settings?.forceUSNumbers !== false;
    const formatter = forceUSFormat
      ? Intl.NumberFormat("en-US")
      : Intl.NumberFormat("ru-RU");
    const showSeconds = window.state?.settings?.showSeconds !== false;
    const showStuds = window.state?.settings?.showStuds === true;

    // allows cooldown to have 3 decimal places
    if (this.attribute === "Cooldown") {
      const formatted = formatter.format(+(+value).toFixed(3));
      return formatted + (showSeconds ? "s" : "");
    }

    switch (this.attribute) {
      case "Cost":
      case "NetCost":
      case "Income":
      case "LimitNetCost":
      case "CostEfficiency":
      case "MaxCostEfficiency":
      case "IncomeEfficiency":
      case "IncomePerSecond":
      case "TotalIncomePerSecond":
        return `$${formatter.format(+(+value).toFixed(2))}`;

      case "MaxDefenseMelt":
      case "DefenseMelt":
      case "SlowdownPerHit":
      case "MaxSlow":
      case "RangeBuff":
      case "FirerateBuff":
      case "CallToArmsBuff":
      case "ThornPower":
      case "DamageBuff":
      case "Defense":
      case "CriticalMultiplier":
      case "AftershockMultiplier":
      case "SpeedMultiplier":
      case "CostClone":
      case "Slowdown":
      case "WhirlwindMultiplier":
      case "CooldownBoost":
        return formatter.format(value) + "%";

      case "BuffLength":
      case "BurnTime":
      case "FreezeTime":
      case "Duration":
      case "ChargeTime":
      case "LaserCooldown":
      case "MissileCooldown":
      case "BurstCooldown":
      case "RevTime":
      case "ReloadTime":
      case "DetectionBuffLength":
      case "ComboLength":
      case "ComboCooldown":
      case "KnockbackCooldown":
      case "Spawnrate":
      case "BuildTime":
      case "Cooldown":
      case "SlowdownTime":
      case "AftershockCooldown":
      case "PoisonLength":
      case "AimTime":
      case "EquipTime":
      case "BuildDelay":
      case "BombTime":
      case "BeeDuration":
      case "ParryCooldown":
      case "ParryLength":
      case "LaserTime":
      case "AmmoDischargeTime":
      case "HologramLifetime":
      case "UnitSendCooldown":
      case "MissileTargeting":
      case "ShieldRechargeSpeed":
      case "TowerSelectionCooldown":
      case "TimeBetweenMissiles":
        return formatter.format(value) + (showSeconds ? "s" : "");

      case "Range":
      case "ExplosionRadius":
      case "AssistRange":
      case "WhirlwindRange":
      case "KnifeRange":
      case "ClusterRadius":
      case "RepulsionRadius":
      case "PatrolRange":
        return (
          formatter.format(value) +
          (showStuds ? " " + (value === 1 ? "stud" : "studs") : "")
        );

      case "Speed":
      case "RocketSpeed":
        return (
          formatter.format(value) +
          (showStuds ? " " + (value === 1 ? "stud/s" : "studs/s") : "")
        );

      case "Hologram EV":
        return formatter.format(value);
    }

    return formatter.format(+(+value).toFixed(2));
  }

  flipped = [
    "Cooldown",
    "Cost",
    "CostEfficiency",
    "MaxCostEfficiency",
    "NetCost",
    "ChargeTime",
    "LaserCooldown",
    "BombTime",
    "MissileCooldown",
    "SpinDuration",
    "BurstCooldown",
    "ReloadSpeed",
    "TickRate",
    "BuildTime",
    "RevTime",
    "ReloadTime",
    "ComboCooldown",
    "KnockbackCooldown",
    "Spawnrate",
    "AftershockCooldown",
    "PoisonLength",
    "AimTime",
    "EquipTime",
    "BuildDelay",
    "ParryCooldown",
    "TrapPlacementTime",
    "CostClone",
  ];

  #getDelta(cellData, deltaData, input) {
    const difference = cellData - deltaData;
    if (difference === 0) return "";

    const sign = Math.sign(difference) > 0 ? "+" : "-";
    const absDifference = Math.abs(difference);

    const flipFactor = this.flipped.includes(this.attribute) ? -1 : 1;

    if (difference * flipFactor > 0) {
      input.classList.add("table-cell-input-delta-positive");
    } else {
      input.classList.add("table-cell-input-delta-negative");
    }
    this.sizeModifier = this.sizeDeltaModifier;

    return ` (${sign}${this.#formatNumber(absDifference)})`;
  }
}
