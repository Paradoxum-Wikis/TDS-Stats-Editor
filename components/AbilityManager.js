import ImageLoader from "./ImageLoader.js";

export default class AbilityManager {
  constructor(viewer, container) {
    this.viewer = viewer;
    this.container = container;
    this.abilityAddButton = document.getElementById("side-ability-add");
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.abilityAddButton.addEventListener("click", () => {
      const newAbility = {
        Name: "",
        Icon: "https://static.wikia.nocookie.net/tower-defense-sim/images/f/f7/Place.png",
        Level: "",
        Cooldown: "",
        Cost: "",
      };

      const abilities = this.getAbilities();
      if (abilities) {
        abilities.push(newAbility);
        this.viewer.reload();
      } else {
        // create ability array if it doesn't have one
        const defaults =
          this.viewer.getActiveSkin()?.defaults?.data ||
          this.viewer.getActiveSkin()?.data?.Defaults ||
          {};
        if (!defaults.Abilities) {
          defaults.Abilities = [];
        }
        defaults.Abilities.push(newAbility);
        this.viewer.reload();
      }
    });
  }

  getAbilities() {
    const skinData = this.viewer.getActiveSkin();
    if (!skinData) return null;

    if (skinData?.defaults?.Abilities) return skinData.defaults.Abilities;
    if (skinData?.Defaults?.Abilities) return skinData.Defaults.Abilities;
    if (skinData?.Default?.Defaults?.Abilities)
      return skinData.Default.Defaults.Abilities;
    if (skinData?.data?.Abilities) return skinData.data.Abilities;
    if (skinData?.defaults?.data?.Abilities)
      return skinData.defaults.data.Abilities;
    if (skinData?.defaults?.attributes?.Abilities)
      return skinData.defaults.attributes.Abilities;

    return null;
  }

  loadAbilities() {
    const abilities = this.getAbilities();
    this.container.innerHTML = "";
    if (abilities?.length > 0) {
      abilities.forEach((ability, index) => {
        this.addAbilityFields(ability, index);
      });
    }
  }

  addAbilityFields(ability, index) {
    const abilityDiv = document.createElement("div");
    abilityDiv.classList.add("ability-group", "mb-3");

    const imageElement = document.createElement("img");
    imageElement.src = "";
    imageElement.classList.add("p-3", "border-dark", "ability-image");
    this.loadAbilityImage(ability.Icon, imageElement);
    abilityDiv.appendChild(imageElement);

    const descriptionInput = this.createInputField(
      `side-ability-description-${index}`,
      "Ability Description (what it does, what it is, etc.).",
      ability.Description || "",
      (value) => {
        this.onAbilityDescriptionChanged(index, value);
        this.viewer.reload();
      },
      "textarea",
      "Description",
    );
    abilityDiv.appendChild(descriptionInput);

    const imageInput = this.createInputField(
      `side-ability-image-${index}`,
      "Image URL / Roblox ID",
      ability.Icon,
      (value) => {
        this.onAbilityImageChanged(index, value);
        this.loadAbilityImage(value, imageElement);
        this.viewer.reload();
      },
      "text",
      "Icon",
    );
    abilityDiv.appendChild(imageInput);

    const titleInput = this.createInputField(
      `side-ability-title-${index}`,
      "Ability Name",
      ability.Name,
      (value) => {
        this.onAbilityTitleChanged(index, value);
        this.viewer.reload();
      },
      "text",
      "Title",
    );
    abilityDiv.appendChild(titleInput);

    const unlockLevelInput = this.createInputField(
      `side-unlock-level-${index}`,  // possible future use
      "Unlock Level",
      ability.Level,
      (value) => {
        this.onUnlockLevelChanged(index, value);
        this.viewer.reload();
      },
      "text",
      "Level",
    );
    abilityDiv.appendChild(unlockLevelInput);

    const cooldownInput = this.createInputField(
      `side-cd-title-${index}`,
      "Ability Cooldown",
      ability.Cooldown,
      (value) => {
        this.onCooldownChanged(index, value);
        this.viewer.reload();
      },
      "text",
      "Cooldown",
    );
    abilityDiv.appendChild(cooldownInput);

    const abilityCostInput = this.createInputField(
      `side-ability-cost-${index}`,
      "Ability Price",
      ability.Cost,
      (value) => {
        this.onAbilityCostChanged(index, value);
        this.viewer.reload();
      },
      "text",
      "Cost",
    );
    abilityDiv.appendChild(abilityCostInput);

    // Store the input elements for later access
    abilityDiv.levelInput = unlockLevelInput.querySelector("input");
    abilityDiv.cooldownInput = cooldownInput.querySelector("input");
    abilityDiv.costInput = abilityCostInput.querySelector("input");

    this.container.appendChild(abilityDiv);
  }

  async loadAbilityImage(iconId, imageElement) {
    if (!iconId) {
      imageElement.src = "";
      return;
    }
    let imageLocation = ImageLoader.getFromCache(iconId);
    if (!imageLocation) {
      imageLocation = await ImageLoader.fetchImage(iconId);
    }
    imageElement.src = imageLocation || "";
  }

  onAbilityImageChanged(abilityIndex, value) {
    const abilities = this.getAbilities();
    if (abilities?.[abilityIndex]) {
      abilities[abilityIndex].Icon = value;
    }
  }

  onAbilityTitleChanged(abilityIndex, value) {
    const abilities = this.getAbilities();
    if (abilities?.[abilityIndex]) {
      abilities[abilityIndex].Name = value;
    }
  }

  onUnlockLevelChanged(abilityIndex, value) {
    const numValue = Number(value);
    if (!Number.isFinite(numValue)) return;

    const abilities = this.getAbilities();
    if (abilities?.[abilityIndex]) {
      abilities[abilityIndex].Level = numValue;
    }
  }

  onCooldownChanged(abilityIndex, value) {
    const numValue = Number(value);
    if (!Number.isFinite(numValue)) return;

    const abilities = this.getAbilities();
    if (abilities?.[abilityIndex]) {
      abilities[abilityIndex].Cooldown = numValue;
    }
  }

  onAbilityCostChanged(abilityIndex, value) {
    const numValue = Number(value);
    if (!Number.isFinite(numValue)) return;

    const abilities = this.getAbilities();
    if (abilities?.[abilityIndex]) {
      abilities[abilityIndex].Cost = numValue;
    }
  }

  onAbilityDescriptionChanged(abilityIndex, value) {
    const abilities = this.getAbilities();
    if (abilities?.[abilityIndex]) {
      abilities[abilityIndex].Description = value;
    }
  }

  getAbilityCooldownValue(abilityIndex) {
    const abilityDiv = this.container.children[abilityIndex];
    if (abilityDiv && abilityDiv.cooldownInput) {
      return abilityDiv.cooldownInput.value;
    }
    return null;
  }

  getAbilityLevelValue(abilityIndex) {
    const abilityDiv = this.container.children[abilityIndex];
    if (abilityDiv && abilityDiv.levelInput) {
      return abilityDiv.levelInput.value;
    }
    return null;
  }

  createInputField(
    id,
    placeholder,
    value,
    onChange,
    type = "text",
    labelText = "",
  ) {
    const formGroup = document.createElement("div");
    formGroup.classList.add("form-group", "mb-2");

    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = labelText || placeholder.split(" ")[0];
    formGroup.appendChild(label);

    if (type === "textarea") {
      const textarea = document.createElement("textarea");
      textarea.classList.add("form-control", "form-control-sm", "bg-dark");
      textarea.id = id;
      textarea.placeholder = placeholder;
      textarea.value = value !== undefined && value !== null ? value : "";
      textarea.rows = 3;

      textarea.addEventListener("focusout", () => {
        onChange(textarea.value.trim());
      });

      formGroup.appendChild(textarea);
    } else {
      const input = document.createElement("input");
      input.type = type;
      input.classList.add(
        "form-control",
        "form-control-sm",
        "text-white",
        "bg-dark",
      );
      input.id = id;
      input.placeholder = placeholder;
      input.value = value !== undefined && value !== null ? value : "";

      input.addEventListener("focusout", () => {
        onChange(input.value.trim());
      });

      formGroup.appendChild(input);
    }

    return formGroup;
  }
}
