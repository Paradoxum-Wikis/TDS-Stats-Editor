const ViewerUI = {
  methods: {
    loadBody() {
      this.app.towerManager.saveTower(this.tower);
      this.deltaTowerManager.saveTower(this.deltaTower);
      this.unitManager.save();
      this.unitDeltaManager.save();

      this.boostPanel.reload();

      this.loadName();

      this.hideJSON();
      this.hideTable();
      this.hideLua();
      this.hideWikitable();

      this.sidePanel.onUpdate();
      this.upgradeViewer.load(this.getActiveSkin());

      switch (this.tableView.getSelectedName()) {
        case "Table":
          this.loadTable();
          this.tableManagement.renderButtonOutlines();
          this.removeAttributeForm.load();
          document
            .querySelector(".btn-toolbar.mb-2.mb-md-0.mt-0")
            .classList.remove("d-none");
          break;
        case "JSON":
          this.showJSON();
          this.clearJSON();
          this.loadJSON();
          document
            .querySelector(".btn-toolbar.mb-2.mb-md-0.mt-0")
            .classList.add("d-none");
          break;
        case "Wikitable":
          this.showWikitable();
          this.loadWikitableContent();
          document
            .querySelector(".btn-toolbar.mb-2.mb-md-0.mt-0")
            .classList.add("d-none");
          break;
        case "Lua":
          this.hideLua();
          this.hideTable();
          this.hideJSON();
          this.hideWikitable();

          this.clearLua();
          this.loadLua();
          this.showLua();
          break;
      }

      // load tower notes
      const notesTextarea = document.getElementById("tower-notes-textarea");
      if (
        notesTextarea &&
        this.tower &&
        this.deltaTower &&
        this.towerVariants
      ) {
        const towerName = this.tower.name;
        const skinName = this.towerVariants.getSelectedName();
        const note =
          this.deltaTower?.json?.[towerName]?.[skinName]?.Defaults?.Note ??
          this.tower?.json?.[towerName]?.[skinName]?.Defaults?.Note ??
          "";
        notesTextarea.value = note;
      } else if (notesTextarea) {
        notesTextarea.value = "";
      }
    },

    // updates the tower name display
    loadName() {
      const towerName = this.tower.name;
      const activeVariant = this.towerVariants.getSelectedName();
      const displayedVariant =
        activeVariant === "Default" ? "" : `${activeVariant} `;

      this.towerNameH1.innerText = displayedVariant + towerName;
    },

    hideJSON() {
      document.querySelector("#json-panel").classList.add("d-none");
    },

    hideLua() {
      document.querySelector("#lua-panel").classList.add("d-none");
    },

    showLua() {
      document.querySelector("#lua-panel").classList.remove("d-none");
    },

    showJSON() {
      document.querySelector("#json-panel").classList.remove("d-none");
    },

    hideTable() {
      this.towerTable.root.parentElement.classList.add("d-none");
    },

    showTable() {
      this.towerTable.root.parentElement.classList.remove("d-none");
    },

    hideWikitable() {
      this.wikitablePanel.classList.add("d-none");
    },

    showWikitable() {
      this.wikitablePanel.classList.remove("d-none");
    },
  },
};

export default ViewerUI;
