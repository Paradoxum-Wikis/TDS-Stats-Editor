import Viewer from "./Viewer/index.js";
import Unit from "../TowerComponents/Unit.js";
export default class TableUnitInput {
  /**
     *
     * @param {{
	 * unitName: string,
	 * attribute: string,
	 * unitData: Unit,
     * deltaData: Unit,
	 * viewer: Viewer,
	 * }} data
 
     * @returns
     */
  constructor(data) {
    this.base = this.#createBase();

    this.name = data.unitName;
    this.attribute = data.attribute;
    this.unitData = data.unitData;
    this.deltaData = data.deltaData;
    this.viewer = data.viewer;

    this.useDelta = this.viewer.buttonDeltaButton.state;

    this.sizeFactor = 1.35;
    this.sizeDeltaModifier = 0;
    this.sizeModifier = 0;
  }

  // a lot of things in this file are the same as TableInput, check it for reference and comments
  createInput() {
    const cellData = this.unitData.attributes[this.attribute];
    const deltaData = this.deltaData.attributes[this.attribute];

    const input = this.#getInput(cellData, deltaData);

    this.input = input;
  }

  #createBase() {
    const td = document.createElement("td");
    td.classList.add("table-cell");

    return td;
  }

  #getInput(value, deltaValue) {
    if (value === undefined) return this.#createNullInput(value);

    if (["true", "false"].includes(String(value))) {
      return this.#createBooleanInput(value, deltaValue);
    }

    if (Number.isFinite(+value)) {
      return this.#createNumberInput(value, deltaValue);
    }

    return this.#createTextInput(value, deltaValue);
  }

  #createNullInput(value) {
    const input = document.createElement("input");

    input.classList.add("table-cell-input");
    input.readOnly = true;

    input.size = 1;

    this.base.appendChild(input);

    return input;
  }

  #createBooleanInput(value, deltaData) {
    const input = document.createElement("input");

    input.type = "checkbox";
    input.checked = value;

    if (value !== deltaData || value === "NaN" || deltaData === "NaN") {
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

    if (value === 0) {
      input.classList.add("zero-value");
    }

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

    try {
      if (
        typeof newValue === "string" &&
        newValue.trim().toLowerCase() === "nan"
      ) {
        this.unitData.set(this.attribute, "NaN");
        this.viewer.unitManager.save();
      } else if (newValue !== "" && Number.isFinite(+newValue)) {
        this.unitData.set(this.attribute, +newValue);
        this.viewer.unitManager.save();
      }
    } catch (error) {
      console.warn(error);
    }

    this.viewer.reload();
  }

  #createTextInput(value, deltaData) {
    const input = document.createElement("input");
    input.size = 1;
    input.classList.add("table-cell-input");

    const isValueNaN = value === "NaN";
    const isDeltaNaN = deltaData === "NaN";

    if (value !== deltaData || isValueNaN || isDeltaNaN) {
      input.classList.add("table-cell-input-delta");
    }

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

    const computedSize =
      String(value).length / this.sizeFactor + this.sizeModifier;

    input.style.minWidth = `${computedSize}em`;
    input.value = value;

    this.base.appendChild(input);

    return input;
  }

  #onBooleanSubmit() {
    const newValue = this.input.checked;

    try {
      this.unitData.set(this.attribute, newValue);
      this.viewer.unitManager.save();
    } catch (error) {
      console.warn(error);
    }

    this.viewer.reload();
  }

  #onTextSubmit() {
    const newValue = this.input.value;

    try {
      if (newValue !== "" || this.attribute !== "Name") {
        this.unitData.set(this.attribute, newValue);
        this.viewer.unitManager.save();
      }
    } catch (error) {
      console.warn(error);
    }

    this.viewer.reload();
  }

  #formatNumber(number) {
    const forceUSFormat = window.state?.settings?.forceUSNumbers !== false;
    const formatter = forceUSFormat
      ? Intl.NumberFormat("en-US")
      : Intl.NumberFormat("ru-RU");
    const showSeconds = window.state?.settings?.showSeconds !== false;

    if (this.attribute === "Cooldown") {
      const formatted = formatter.format(+(+number).toFixed(3));
      return formatted + (showSeconds ? "s" : "");
    }

    switch (this.attribute) {
      case "Cost":
      case "NetCost":
      case "Income":
      case "CostEfficiency":
      case "MaxCostEfficiency":
      case "BaseIncome":
      case "IncomePerTower":
      case "MaxIncome":
        return `$${formatter.format(+(+number).toFixed(2))}`;

      case "Defense":
      case "SlowdownPerHit":
      case "MaxSlow":
      case "DefenseMelt":
      case "Active":
      case "Inactive":
      case "BaseSlowdown:":
      case "SlowdownPerTower":
      case "BaseDefenseMelt":
      case "DefenseMeltPerTower":
      case "MaxDefenseMelt":
      case "CostClone":
      case "Slowdown":
        return formatter.format(number) + "%";

      case "Duration":
      case "MissileCooldown":
      case "BurstCooldown":
      case "TimeBetweenMissiles":
      case "RevTime":
      case "ReloadTime":
      case "SendTime":
      case "BurnTime":
      case "StunLength":
      case "Lifetime":
      case "ConfusionTime":
      case "ConfusionCooldown":
      case "PoisonLength":
      case "SlowdownTime":
      case "Spawnrate":
      case "HologramLifetime":
      case "UnitSendCooldown":
        return formatter.format(number) + (showSeconds ? "s" : "");

      case "Hologram EV":
        return formatter.format(number);
    }

    return formatter.format(+(+number).toFixed(2));
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
    "TimeBetweenMissiles",
    "RevTime",
    "ReloadTime",
    "SendTime",
    "ConfusionCooldown",
    "Spawnrate",
    "ScrapCost",
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
