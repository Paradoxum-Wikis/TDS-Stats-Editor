import Alert from "../Alert.js";
import WikitableGenerator from "../TableMode/WikitableGenerator.js";

const ViewerWikitable = {
  methods: {
    loadWikitableContent() {
      this.wikitableContent.innerHTML = "";
      this.wikitableContent.appendChild(this.wikitextViewer.getContainer());
      this.activeUnits = this.populateActiveUnits();
      this.wikitableGenerator = new WikitableGenerator(
        this.tower,
        this.activeUnits,
        this.propertyViewer,
        this.towerVariants,
        this,
      );

      this.currentWikitableContent =
        this.wikitableGenerator.generateWikitableContent();

      if (this.activeUnits && Object.keys(this.activeUnits).length > 0) {
        this.currentWikitableContent +=
          "\n\n" + this.wikitableGenerator.generateUnitWikitableContent();
      }

      const versionElement = document.querySelector(".version-full");
      const ver = versionElement ? versionElement.textContent : "Unknown";
      this.currentWikitableContent += `\n<!-- Generated using the TDS Stats Editor [v${ver}] on ${new Date().toUTCString()} -->\n<!-- Faithful format is still very early in development, expect bugs! -->\n`;

      this.wikitextViewer.showWikitext(this.currentWikitableContent);
    },

    onCopyWikitable() {
      navigator.clipboard.writeText(this.currentWikitableContent);
      const alert = new Alert("Wikitable Copied!", {
        alertStyle: "alert-success",
      });
      alert.fire();
    },

    exportWikitable() {
      const towerName = this.tower.name;
      const activeVariant = this.towerVariants.getSelectedName();
      const displayedVariant =
        activeVariant === "Default" ? "" : `${activeVariant}-`;
      const filename = `${displayedVariant}${towerName}-wikitable.txt`;
      this.downloadFile(this.currentWikitableContent, filename, "text/plain");
    },

    setupWikitableEventListeners() {
      document.addEventListener("settingsChanged", (e) => {
        if (
          e.detail.setting === "showSeconds" ||
          e.detail.setting === "showStuds" ||
          e.detail.setting === "forceUSNumbers"
        ) {
          if (
            this.tableView.getSelectedName() === "Wikitable" &&
            !this.wikitablePanel.classList.contains("d-none")
          ) {
            this.loadWikitableContent();
          }
        }
      });
    },
  },

  init() {
    this.setupWikitableEventListeners();
  },
};

export default ViewerWikitable;
