import ButtonSelection from './ButtonSelection.js';

const imageCache = {};

export default class UpgradeViewer {
    constructor(viewer) {
        this.viewer = viewer;
        this.levelPanel = document.getElementById('side-upgrade-levels');
        this.levelButtons = new ButtonSelection(this.levelPanel);
        this.levelButtons.activeClass = 'btn-dark';
        this.levelButtons.inactiveClass = 'btn-outline-dark';

        this.imageInput = document.getElementById('side-upgrade-image');
        this.imageInput.addEventListener(
            'focusout',
            (() => {
                this.#onTextChanged('Image', this.imageInput.value);
                this.#loadImage();
                this.viewer.reload();
            }).bind(this)
        );

        this.titleInput = document.getElementById('side-upgrade-title');
        this.titleInput.addEventListener(
            'focusout',
            (() => {
                this.#onTextChanged('Title', this.titleInput.value);
                this.viewer.reload();
            }).bind(this)
        );

        this.extrasInput = document.getElementById('side-upgrade-extras');
        this.addExtraButton = document.getElementById('side-upgrade-extras-add');
        this.addExtraButton.addEventListener('click', () => {
            const upgradeIndex = this.index;
            const skin = this.viewer.getActiveSkin();
            const upgradeStats = skin.data.Upgrades[upgradeIndex].Stats;
            if (upgradeStats.Extras === undefined) {
                upgradeStats.Extras = [];
            }
            upgradeStats.Extras.push('');
            this.viewer.reload();
        });

        this.upgradeChanges = document.getElementById('side-upgrade-extras-output');
        this.abilityContainer = document.getElementById('side-ability-container');
    }

     // this checks if any level name is a custom string (ex "4T", "5B")
    async load(skinData) {
        if (skinData.upgrades.length === 0) {
            document.getElementById('level-view').classList.add('d-none');
        } else if (this.skinData === skinData) {
            this.loadUpgrade(this.levelButtons.getSelectedName() - 1);
        } else {
            this.skinData = skinData;
    
            this.#loadLevelHeader(skinData);
        }
    }

    #loadLevelHeader(skinData) {
        const levelNames = skinData.upgrades.map((upgrade, index) => {
            return upgrade.upgradeData.Stats?.Attributes?.SideLevel ?? index + 1;
        });
    
        this.levelButtons.setButtons(levelNames);
        this.levelButtons.root.addEventListener(
            'submit',
            ((e) => {
                const selectedName = e.detail;
                const index = levelNames.indexOf(selectedName);
                this.loadUpgrade(index);
            }).bind(this)
        );
        if (skinData.upgrades.length > 0) {
            this.loadUpgrade(0);
        }
    }
    
    loadUpgrade(index) {
        if (!this.skinData?.upgrades || index < 0 || index >= this.skinData.upgrades.length) {
            return;
        }
    
        this.index = index;
        this.upgrade = this.skinData.upgrades[index];
    
        if (!this.upgrade) {
            return;
        }
    
        this.imageInput.value = this.upgrade.upgradeData.Image || '';
        this.titleInput.value = this.upgrade.upgradeData.Title || '';
        this.#loadExtras(this.upgrade);
        this.#loadUpgradeChanges();
        this.#loadImage();
        this.#loadAbilities(this.skinData);
    }    

    #loadUpgradeChanges() {
        const upgradeChanges = this.skinData.getUpgradeChangeOutput(this.index);
        const minRows = 5;
        this.upgradeChanges.value = upgradeChanges.join('\n');
        this.upgradeChanges.rows = Math.max(upgradeChanges.length, minRows);
    }

    async #fetchImage(imageId) {
        let url;
        // convert to imageid to string to safely use string methods
        const imageIdStr = String(imageId);
    
        if (imageIdStr.startsWith('https')) { // check if its a url
            if (imageIdStr.includes('static.wikia.nocookie.net')) {
                url = this.#trimFandomUrl(imageIdStr); // Trim Fandom URL if needed
            } else {
                url = imageIdStr; // use the url as is
            }
        } else {
            // assume that it's a Roblox asset id
            const roProxyUrl = `https://assetdelivery.RoProxy.com/v2/assetId/${imageIdStr}`;
            try {
                const response = await fetch(roProxyUrl, {
                    method: 'GET',
                    mode: 'cors',
                });
                const data = await response.json();
                if (data?.locations?.[0]?.location) {
                    url = data.locations[0].location;
                } else {
                    url = `https://static.wikia.nocookie.net/tower-defense-sim/images/${imageIdStr}`;
                }
            } catch (error) {
                console.error(`Failed to fetch image ${imageIdStr}:`, error); // Log errors for debugging
                url = ''; // Fallback to empty string
            }
        }
    
        if (url) {
            imageCache[imageId] = url; // cache using original imageid
        }
        return url;
    }

    #trimFandomUrl(fullUrl) {
        // Fandom url chopping
        const match = fullUrl.match(/https:\/\/static\.wikia\.nocookie\.net\/.*?\.(png|jpg|jpeg|gif)/i);
        return match ? match[0] : fullUrl;
    }

    async #loadImage() {
        const imageId = this.imageInput.value.trim();
        if (!imageId) {
            document.getElementById('upgrade-image').src = '';
            return;
        }
        // check cache first
        let imageLocation = imageCache[imageId];
        if (!imageLocation) {
            imageLocation = await this.#fetchImage(imageId);
        }
        document.getElementById('upgrade-image').src = imageLocation || '';
    }

    async #loadAbilityImage(iconId, imageElement) {
        if (!iconId) {
            imageElement.src = '';
            return;
        }
        let imageLocation = imageCache[iconId];
        if (!imageLocation) {
            imageLocation = await this.#fetchImage(iconId);
        }
        imageElement.src = imageLocation || '';
    }

    #onTextChanged(property, value) {
        this.skinData.set(this.index + 1, property, value);
    }

    #onAbilityImageChanged(abilityIndex, value) {
        const abilities = this.#getAbilities();
        if (abilities?.[abilityIndex]) {
            abilities[abilityIndex].Icon = value;
        }
    }

    #onAbilityTitleChanged(abilityIndex, value) {
        const abilities = this.#getAbilities();
        if (abilities?.[abilityIndex]) {
            abilities[abilityIndex].Name = value;
        }
    }

    #onUnlockLevelChanged(abilityIndex, value) {
        const numValue = Number(value);
        if (!Number.isFinite(numValue)) return;
    
        const abilities = this.#getAbilities();
        if (abilities?.[abilityIndex]) {
            abilities[abilityIndex].Level = numValue;
        }
    }
    
    #onCooldownChanged(abilityIndex, value) {
        const numValue = Number(value);
        if (!Number.isFinite(numValue)) return;
    
        const abilities = this.#getAbilities();
        if (abilities?.[abilityIndex]) {
            abilities[abilityIndex].Cooldown = numValue;
        }
    }

    #onAbilityCostChanged(abilityIndex, value) {
        const numValue = Number(value);
        if (!Number.isFinite(numValue)) return;
    
        const abilities = this.#getAbilities();
        if (abilities?.[abilityIndex]) {
            abilities[abilityIndex].Cost = numValue;
        }
    }

    #getAbilities() {
        return (
            this.skinData?.defaults?.Abilities || 
            this.skinData?.Defaults?.Abilities || 
            this.skinData?.Default?.Defaults?.Abilities || 
            this.skinData?.data?.Abilities || 
            this.skinData?.defaults?.data?.Abilities || 
            this.skinData?.defaults?.attributes?.Abilities || 
            []
        );
    }

    #loadAbilities(skinData) {
        const abilities = this.#getAbilities();
        this.abilityContainer.innerHTML = '';
        if (abilities?.length > 0) {
            abilities.forEach((ability, index) => {
                this.#addAbilityFields(ability, index);
            });
        }
    }

    #addAbilityFields(ability, index) {
        const abilityDiv = document.createElement('div');
        abilityDiv.classList.add('ability-group', 'mb-3');
    
        const imageElement = document.createElement('img');
        imageElement.src = '';
        imageElement.classList.add('p-3', 'border-dark', 'ability-image');
        this.#loadAbilityImage(ability.Icon, imageElement);
        abilityDiv.appendChild(imageElement);
    
        const imageInput = this.#createInputField(
            `side-ability-image-${index}`, 
            'Image URL / Roblox ID', 
            ability.Icon, 
            (value) => {
                this.#onAbilityImageChanged(index, value);
                this.#loadAbilityImage(value, imageElement);
                this.viewer.reload();
            }, 
            'text',
            'Icon'
        );
        abilityDiv.appendChild(imageInput);
    
        const titleInput = this.#createInputField(
            `side-ability-title-${index}`, 
            'Ability Name', 
            ability.Name, 
            (value) => {
                this.#onAbilityTitleChanged(index, value);
                this.viewer.reload();
            }, 
            'text',
            'Title'
        );
        abilityDiv.appendChild(titleInput);
    
        const unlockLevelInput = this.#createInputField(
            `side-unlock-title-${index}`, 
            'Unlock Level', 
            ability.Level, 
            (value) => {
                this.#onUnlockLevelChanged(index, value);
                this.viewer.reload();
            }, 
            'text',
            'Level'
        );
        abilityDiv.appendChild(unlockLevelInput);
        
        const cooldownInput = this.#createInputField(
            `side-cd-title-${index}`, 
            'Ability Cooldown', 
            ability.Cooldown, 
            (value) => {
                this.#onCooldownChanged(index, value);
                this.viewer.reload();
            }, 
            'text',
            'Cooldown'
        );
        abilityDiv.appendChild(cooldownInput);

        const abilityCostInput = this.#createInputField(
            `side-unlock-title-${index}`, 
            'Ability Price',
            ability.Cost, 
            (value) => {
                this.#onAbilityCostChanged(index, value);
                this.viewer.reload();
            }, 
            'text',
            'Cost'
        );
        abilityDiv.appendChild(abilityCostInput);

        // Store the cooldown input element for later access
        abilityDiv.cooldownInput = cooldownInput.querySelector('input');

        // Store the level input element for later access
        abilityDiv.levelInput = unlockLevelInput.querySelector('input');

        // Store the level input element for later access
        abilityDiv.levelInput = abilityCostInput.querySelector('input');
    
        this.abilityContainer.appendChild(abilityDiv);
    }

    getAbilityCooldownValue(abilityIndex) {
        const abilityDiv = this.abilityContainer.children[abilityIndex];
        if (abilityDiv && abilityDiv.cooldownInput) {
            return abilityDiv.cooldownInput.value;
        }
        return null;
    }

    // New function to get the ability level value
    getAbilityLevelValue(abilityIndex) {
        const abilityDiv = this.abilityContainer.children[abilityIndex];
        if (abilityDiv && abilityDiv.levelInput) {
            return abilityDiv.levelInput.value;
        }
        return null;
    }

    #createInputField(id, placeholder, value, onChange, type = 'text', labelText = '') {
        const formGroup = document.createElement('div');
        formGroup.classList.add('form-group', 'mb-2');
    
        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.textContent = labelText || placeholder.split(' ')[0];
        formGroup.appendChild(label);
    
        const input = document.createElement('input');
        input.type = type;
        input.classList.add('form-control', 'form-control-sm', 'text-white', 'bg-dark');
        input.id = id;
        input.placeholder = placeholder;
        input.value = value !== undefined && value !== null ? value : '';
    
        input.addEventListener('focusout', () => {
            onChange(input.value.trim());
        });
    
        formGroup.appendChild(input);
        return formGroup;
    }

    #loadExtras(upgrade) {
        const extras = upgrade?.data?.Extras ?? [];
        this.extrasInput.innerHTML = '';
        extras.forEach((extra, index) => {
            this.#addExtra(extra, index);
        });
    }

    #addExtra(extra, index) {
        const inputGroup = document.createElement('form');
        ['input-group', 'mb-2'].forEach(className => inputGroup.classList.add(className)); // prettier-ignore
        const inputText = document.createElement('input');
        ['form-control', 'form-control-sm', 'text-white'].forEach(className => inputText.classList.add(className)); // prettier-ignore
        inputText.type = 'text';
        inputText.value = extra;
        const inputButtonGroup = document.createElement('div');
        const removeButton = document.createElement('div');
        ['btn', 'btn-sm', 'btn-outline-danger'].forEach(className => removeButton.classList.add(className));
        removeButton.innerText = 'Remove';
        inputButtonGroup.appendChild(removeButton);
        inputGroup.appendChild(inputText);
        inputGroup.appendChild(inputButtonGroup);
        this.extrasInput.appendChild(inputGroup);

        inputGroup.addEventListener(
            'submit',
            ((e) => {
                e.preventDefault();
                this.#processExtraInput(index, inputText.value);
            }).bind(this)
        );
//        inputText.addEventListener('focusin', () => {
//            inputText.value = '';
//        });
        inputText.addEventListener(
            'focusout',
            (() => {
                this.#processExtraInput(index, inputText.value);
            }).bind(this)
        );
        inputText.addEventListener(
            'mouseup',
            (() => inputText.focus()).bind(this)
        );
        removeButton.addEventListener(
            'mouseup',
            (() => {
                this.removeExtra(index);
                this.viewer.reload();
            }).bind(this)
        );
    }

    #processExtraInput(index, value) {
        if (value !== '') {
            this.updateExtra(index, value);
        }
        this.viewer.reload();
    }

    updateExtra(extraIndex, value) {
        const upgradeIndex = this.index;
        const skin = this.viewer.getActiveSkin();
        skin.data.Upgrades[upgradeIndex].Stats.Extras[extraIndex] = value;
    }

    removeExtra(deletedIndex) {
        const upgradeIndex = this.index;
        const skin = this.viewer.getActiveSkin();
        const stats = skin.data.Upgrades[upgradeIndex].Stats;
        stats.Extras = stats.Extras.filter((_, index) => index !== deletedIndex);
    }
}