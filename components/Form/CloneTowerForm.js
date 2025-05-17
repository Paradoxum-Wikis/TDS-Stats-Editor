import Dropdown from "../Dropdown.js";
import Alert from "../Alert.js";
import Viewer from "../Viewer/index.js";

export default class CloneTowerForm {
  /**
   *
   * @param {Viewer} viewer
   */
  constructor(viewer) {
    this.viewer = viewer;

    this.towerName = document.getElementById("clone-tower-name");

    this.fromTowerName = document.getElementById("clone-tower-reference");
    this.fromTowerDropdown = document.getElementById("clone-tower-options");

    this.addCloneSubmit = document.getElementById("clone-submit");

    this.towerNames = [...this.viewer.defaultTowerManager.towerNames];
    this.towerNamesLower = this.towerNames.map((name) => name.toLowerCase());

    new Dropdown(this.fromTowerName, this.fromTowerDropdown, this.towerNames, {
      setTextMode: true,
    });

    const cloneTowerOptions = document.getElementById("clone-tower-options");
    cloneTowerOptions.addEventListener("hidden.bs.dropdown", ((e) => {
      const targetValue = e.target.querySelector(".dropdown-item:focus")?.textContent;
      
      if (targetValue === undefined) return;

      this.fromTowerName.value = targetValue;
      this.#onTowerChange();
    }).bind(this));

    this.addCloneSubmit.addEventListener(
      "click",
      ((e) => {
        this.#onSubmit();
      }).bind(this),
    );

    this.towerName.addEventListener(
      "input",
      ((e) => {
        this.#onNameInput(this.towerName.value);
      }).bind(this),
    );

    this.towerName.value = "";
    this.#onTowerChange();
  }

  #isNameValue(attributeName) {
    let isValid = !this.towerNamesLower.includes(attributeName.toLowerCase());
    isValid &= attributeName != "";
    return isValid;
  }

  #onNameInput(attributeName) {
    if (this.#isNameValue(attributeName)) {
      this.towerName.classList.remove("is-invalid");
      this.towerName.classList.add("is-valid");
    } else {
      this.towerName.classList.remove("is-valid");
      this.towerName.classList.add("is-invalid");
    }
  }

  #onSubmit() {
    const newTowerName = this.towerName.value;
    const referenceTowerName = this.fromTowerName.value;

    if (!this.#isNameValue(newTowerName)) {
      return;
    }

    // gets ref tower
    const referenceTower =
      this.viewer.deltaTowerManager.towers[referenceTowerName];
    if (!referenceTower) {
      return;
    }

    const currentTower = this.viewer.tower;
    this.viewer.load(referenceTower);
    const combinedData = this.viewer._getCombinedData();

    // create a new master tower with the custom name
    const newMaster = {};
    newMaster[newTowerName] = JSON.parse(
      JSON.stringify(combinedData.master[referenceTowerName]),
    );

    // combined data structure with the new master and slave
    const newCombinedData = {
      master: newMaster,
      slave: JSON.parse(JSON.stringify(combinedData.slave)),
    };

    this.viewer.load(currentTower);
    this.viewer.import(JSON.stringify(newCombinedData), false, true);

    // success notification
    const alert = new Alert(
      `Tower "${referenceTowerName}" successfully cloned as "${newTowerName}"`,
      { alertStyle: "alert-success" },
    );
    alert.alertTimeInSeconds = 2;
    alert.fire();

    // clear the form for next use
    this.towerName.value = "";
    this.#onNameInput("");
  }

  #onTowerChange() {
    // validate current tower
  }
}
