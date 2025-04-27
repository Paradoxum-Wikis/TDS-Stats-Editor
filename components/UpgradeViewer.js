import ButtonSelection from "./ButtonSelection.js";
import ImageLoader from "./ImageLoader.js";
import AbilityManager from "./AbilityManager.js";
import ExtrasManager from "./ExtrasManager.js";

export default class UpgradeViewer {
  constructor(viewer) {
    this.viewer = viewer;
    this.levelPanel = document.getElementById("side-upgrade-levels");
    this.levelButtons = new ButtonSelection(this.levelPanel);
    this.levelButtons.activeClass = "btn-dark";
    this.levelButtons.inactiveClass = "btn-outline-dark";
    this.dataReady = false;
    this.isLoading = false;

    this.imageInput = document.getElementById("side-upgrade-image");
    this.imageInput.addEventListener(
      "focusout",
      (() => {
        if (!this.dataReady) return;
        this.#onTextChanged("Image", this.imageInput.value);
        this.#loadImage();
        this.viewer.reload();
      }).bind(this),
    );

    this.titleInput = document.getElementById("side-upgrade-title");
    this.titleInput.addEventListener(
      "focusout",
      (() => {
        if (!this.dataReady) return;
        this.#onTextChanged("Title", this.titleInput.value);
        this.viewer.reload();
      }).bind(this),
    );

    // Initialize extras manager
    this.extrasInput = document.getElementById("side-upgrade-extras");
    this.addExtraButton = document.getElementById("side-upgrade-extras-add");
    this.addGroupButton = document.getElementById(
      "side-upgrade-extras-add-group",
    );
    this.upgradeChanges = document.getElementById("side-upgrade-extras-output");
    this.extrasManager = new ExtrasManager(
      this.viewer,
      this.extrasInput,
      this.addExtraButton,
      this.addGroupButton,
    );

    // Initialize ability manager
    this.abilityContainer = document.getElementById("side-ability-container");
    this.abilityManager = new AbilityManager(
      this.viewer,
      this.abilityContainer,
    );
  }

  // this checks if any level name is a custom string (ex "4T", "5B")
  async load(skinData) {
    if (skinData.upgrades.length === 0) {
      document.getElementById("level-view").classList.add("d-none");
    } else if (this.skinData === skinData) {
      this.loadUpgrade(this.levelButtons.getSelectedName() - 1);
    } else {
      this.skinData = skinData;
      this.dataReady = true; // Mark data as ready
      this.#loadLevelHeader(skinData);
    }
  }

  #loadLevelHeader(skinData) {
    const levelNames = skinData.upgrades.map((upgrade, index) => {
      return upgrade.upgradeData.Stats?.Attributes?.SideLevel ?? index + 1;
    });

    this.levelButtons.setButtons(levelNames);
    this.levelButtons.root.addEventListener(
      "submit",
      ((e) => {
        const selectedName = e.detail;
        const index = levelNames.indexOf(selectedName);
        this.loadUpgrade(index);
      }).bind(this),
    );
    if (skinData.upgrades.length > 0) {
      this.loadUpgrade(0);
    }
  }

  loadUpgrade(index) {
    if (
      !this.skinData?.upgrades ||
      index < 0 ||
      index >= this.skinData.upgrades.length
    ) {
      return;
    }

    this.index = index;
    this.upgrade = this.skinData.upgrades[index];

    if (!this.upgrade) {
      return;
    }

    this.imageInput.value = this.upgrade.upgradeData.Image || "";
    this.titleInput.value = this.upgrade.upgradeData.Title || "";

    // Update managers with new upgrade
    this.extrasManager.setUpgradeIndex(index);
    this.extrasManager.loadExtras(this.upgrade);
    this.extrasManager.renderUpgradeChanges();

    // load image will disable buttons during loading
    this.#loadImage();
    this.abilityManager.loadAbilities();
  }

  async #loadImage() {
    // don't start another load if one is in progress
    if (this.isLoading) return;

    const imageId = this.imageInput.value.trim();
    const imgElement = document.getElementById("upgrade-image");

    if (!imgElement) return;

    this.isLoading = true;
    this.#disableLevelButtons();

    imgElement.alt = "No Upgrade Image";
    // Clear previous error handler and state
    imgElement.onerror = null;
    imgElement.removeAttribute("data-load-attempted");

    if (!imageId) {
      imgElement.src = "";
      setTimeout(() => {
        this.isLoading = false;
        this.#enableLevelButtons();
      }, 100);
      return;
    }

    const tryLoadImage = async (src, isFromCache) => {
      if (!src) {
        imgElement.src = "";
        this.isLoading = false;
        this.#enableLevelButtons();
        return;
      }

      imgElement.onload = () => {
        this.isLoading = false;
        this.#enableLevelButtons();
      };

      imgElement.onerror = async () => {
        // attempt refetch
        if (imgElement.getAttribute("data-load-attempted")) {
          console.error(`Failed to load image even after re-fetch: ${imageId}`);
          imgElement.src = "";
          imgElement.onerror = null;
          this.isLoading = false;
          this.#enableLevelButtons();
          return;
        }

        console.warn(
          `Image failed to load${isFromCache ? " from cache" : ""}: ${src}. Clearing cache and re-fetching for ID: ${imageId}`,
        );
        ImageLoader.clearCacheEntry(imageId);
        imgElement.setAttribute("data-load-attempted", "true"); // mark as attempted

        const freshImageLocation = await ImageLoader.fetchImage(imageId);
        tryLoadImage(freshImageLocation, false);
      };

      imgElement.src = src;
    };

    let imageLocation = ImageLoader.getFromCache(imageId);

    if (imageLocation) {
      // attempt to load from cache
      tryLoadImage(imageLocation, true);
    } else {
      // not in cache so fetch it
      imageLocation = await ImageLoader.fetchImage(imageId);
      tryLoadImage(imageLocation, false);
    }
  }

  #disableLevelButtons() {
    if (!this.levelPanel) return;

    // disable all buttons in the level panel when loading
    const buttons = this.levelPanel.querySelectorAll("button, label.btn");
    buttons.forEach((button) => {
      button.classList.add("disabled");
      button.style.opacity = "0.6";
      button.style.pointerEvents = "none";
    });
  }

  #enableLevelButtons() {
    if (!this.levelPanel) return;

    const buttons = this.levelPanel.querySelectorAll("button, label.btn");
    buttons.forEach((button) => {
      button.classList.remove("disabled");
      button.style.opacity = "";
      button.style.pointerEvents = "";
    });
  }

  #onTextChanged(property, value) {
    if (!this.skinData) {
      console.warn("Cannot update property, skinData is not initialized yet");
      return;
    }
    this.skinData.set(this.index + 1, property, value);
  }

  // backwards compatibility
  getAbilityCooldownValue(abilityIndex) {
    return this.abilityManager.getAbilityCooldownValue(abilityIndex);
  }

  getAbilityLevelValue(abilityIndex) {
    return this.abilityManager.getAbilityLevelValue(abilityIndex);
  }
}
