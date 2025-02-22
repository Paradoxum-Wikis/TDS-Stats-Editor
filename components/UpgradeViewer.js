import ButtonSelection from './ButtonSelection.js';

const imageCache = {};

export default class UpgradeViewer {
    constructor(viewer) {
        this.viewer = viewer;
        this.levelPanel = document.getElementById('side-upgrade-levels');
        this.levelButtons = new ButtonSelection(this.levelPanel);
        this.levelButtons.activeClass = 'btn-dark';
        this.levelButtons.inactiveClass = 'btn-outline-dark';

        this.levelButtons.root.addEventListener(
            'submit',
            ((e) => {
                this.loadUpgrade(e.detail - 1);
            }).bind(this)
        );

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
        this.abilityImage = document.getElementById('ability-image');
        this.abilityImageInput = document.getElementById('side-ability-image');

        this.abilityImageInput.addEventListener(
            'focusout',
            (async () => {
                const newValue = this.abilityImageInput.value.trim();
                this.#onAbilityImageChanged(newValue);
                await this.#loadAbilityImage();
                this.viewer.reload();
            }).bind(this)
        );

        this.abilityTitleInput = document.getElementById('side-ability-title');
        this.abilityTitleInput.addEventListener(
            'focusout',
            (() => {
                const newTitle = this.abilityTitleInput.value.trim();
                this.#onAbilityTitleChanged(newTitle);
                this.viewer.reload();
            }).bind(this)
        );

        this.unlockTitleInput = document.getElementById('side-unlock-title');
        this.unlockTitleInput.addEventListener(
            'focusout',
            (() => {
                const newLevel = this.unlockTitleInput.value.trim();
                this.#onUnlockLevelChanged(newLevel);
                this.viewer.reload();
            }).bind(this)
        );

        this.cdTitleInput = document.getElementById('side-cd-title');
        this.cdTitleInput.addEventListener(
            'focusout',
            (() => {
                const newCooldown = this.cdTitleInput.value.trim();
                this.#onCooldownChanged(newCooldown);
                this.viewer.reload();
            }).bind(this)
        );
    }

    async load(skinData) {
        if (skinData.upgrades.length === 0) {
            document.getElementById('level-view').classList.add('d-none');
        } else if (this.skinData == skinData) {
            this.loadUpgrade(this.levelButtons.getSelectedName() - 1);
        } else {
            this.skinData = skinData;
            const abilities = (
                skinData?.defaults?.Abilities || 
                skinData?.Defaults?.Abilities || 
                skinData?.Default?.Defaults?.Abilities || 
                skinData?.data?.Abilities || 
                skinData?.defaults?.data?.Abilities || 
                skinData?.defaults?.attributes?.Abilities
            );
            const initialIcon = abilities && abilities.length > 0 ? (abilities[0].Icon || '') : '';
            const initialTitle = abilities && abilities.length > 0 ? (abilities[0].Name || '') : '';
            const initialLevel = abilities && abilities.length > 0 ? (abilities[0].Level ?? '') : '';
            const initialCooldown = abilities && abilities.length > 0 ? (abilities[0].Cooldown ?? '') : '';
            this.abilityImageInput.value = initialIcon;
            this.abilityTitleInput.value = initialTitle;
            this.unlockTitleInput.value = initialLevel;
            this.cdTitleInput.value = initialCooldown;
            await this.#loadAbilityImage();
            this.#loadLevelHeader(skinData);
        }
    }

    #loadLevelHeader(skinData) {
        this.levelButtons.setButtons(
            skinData.upgrades.map((_, index) => index + 1)
        );
        this.loadUpgrade(this.levelButtons.getSelectedName() - 1);
    }

    loadUpgrade(index) {
        this.index = index;
        this.upgrade = this.skinData.upgrades[index];
        this.imageInput.value = this.upgrade.upgradeData.Image;
        this.titleInput.value = this.upgrade.upgradeData.Title;
        this.#loadExtras(this.upgrade);
        this.#loadUpgradeChanges();
        this.#loadImage(); // make the image loads automatically
    }

    #loadUpgradeChanges() {
        const upgradeChanges = this.skinData.getUpgradeChangeOutput(this.index);
        const minRows = 5;
        this.upgradeChanges.textContent = '';
        this.upgradeChanges.value = '';
        this.upgradeChanges.value = upgradeChanges.join('\n');
        this.upgradeChanges.rows = Math.max(upgradeChanges.length, minRows);
    }

    async #fetchImage(imageId) {
        let url;
        if (imageId.startsWith('https')) { // check if it's a url or fandom url
            if (imageId.includes('static.wikia.nocookie.net')) {
                url = this.#trimFandomUrl(imageId); // Trim the url to the base file path (fandom doesn't allow it otherwise)
            } else {
                url = imageId; // Use the url as is for non fandom urls
            }
        } else {
            // Try RoProxy first
            const roProxyUrl = `https://assetdelivery.RoProxy.com/v2/assetId/${imageId}`;
            try {
                const response = await fetch(roProxyUrl, {
                    method: 'GET',
                    mode: 'cors',
                });
                const data = await response.json();
                if (data?.locations?.[0]?.location) {
                    url = data.locations[0].location;
                } else {
                    url = `https://static.wikia.nocookie.net/tower-defense-sim/images/${imageId}`;
                }
            } catch (error) {
                url = `https://static.wikia.nocookie.net/tower-defense-sim/images/${imageId}`;
            }
        }
        if (url) {
            imageCache[imageId] = url;
        }
        return url;
    }

    #trimFandomUrl(fullUrl) {
        // Fandom url chopping
        const match = fullUrl.match(/https:\/\/static\.wikia\.nocookie\.net\/.*?\.(png|jpg|jpeg|gif)/i);
        if (match) {
            return match[0];
        }
        return fullUrl;
    }

    async #loadImage() {
        const imageId = this.imageInput.value.trim();
        if (!imageId) {
            document.getElementById('upgrade-image').src = ''; // Set default empty image if no ID
            return;
        }
        // Check cache first
        let imageLocation = imageCache[imageId];
        if (!imageLocation) {
            imageLocation = await this.#fetchImage(imageId); // Fetch the image location
        }
        document.getElementById('upgrade-image').src = imageLocation || ''; // Set image source
    }

    async #loadAbilityImage() {
        const iconId = this.abilityImageInput.value.trim();
        if (!iconId) {
            this.abilityImage.src = '';
            return;
        }
        let imageLocation = imageCache[iconId];
        if (!imageLocation) {
            imageLocation = await this.#fetchImage(iconId);
        }
        this.abilityImage.src = imageLocation || '';
    }

    #onTextChanged(property, value) {
        this.skinData.set(this.index + 1, property, value);
    }

    #onAbilityImageChanged(value) {
        const abilities = (
            this.skinData?.defaults?.Abilities || 
            this.skinData?.Defaults?.Abilities || 
            this.skinData?.Default?.Defaults?.Abilities || 
            this.skinData?.data?.Abilities || 
            this.skinData?.defaults?.data?.Abilities || 
            this.skinData?.defaults?.attributes?.Abilities
        );
        if (abilities && abilities.length > 0) {
            abilities[0].Icon = value;
        }
    }

    #onAbilityTitleChanged(value) {
        const abilities = (
            this.skinData?.defaults?.Abilities || 
            this.skinData?.Defaults?.Abilities || 
            this.skinData?.Default?.Defaults?.Abilities || 
            this.skinData?.data?.Abilities || 
            this.skinData?.defaults?.data?.Abilities || 
            this.skinData?.defaults?.attributes?.Abilities
        );
        if (abilities && abilities.length > 0) {
            abilities[0].Name = value;
        }
    }

    #onUnlockLevelChanged(value) {
        const numValue = Number(value);
        if (!Number.isFinite(numValue)) return;
    
        const abilities = (
            this.skinData?.defaults?.Abilities || 
            this.skinData?.Defaults?.Abilities || 
            this.skinData?.Default?.Defaults?.Abilities || 
            this.skinData?.data?.Abilities || 
            this.skinData?.defaults?.data?.Abilities || 
            this.skinData?.defaults?.attributes?.Abilities
        );
        if (abilities && abilities.length > 0) {
            abilities[0].Level = numValue;
        }
    }
    
    #onCooldownChanged(value) {
        const numValue = Number(value);
        if (!Number.isFinite(numValue)) return;
    
        const abilities = (
            this.skinData?.defaults?.Abilities || 
            this.skinData?.Defaults?.Abilities || 
            this.skinData?.Default?.Defaults?.Abilities || 
            this.skinData?.data?.Abilities || 
            this.skinData?.defaults?.data?.Abilities || 
            this.skinData?.defaults?.attributes?.Abilities
        );
        if (abilities && abilities.length > 0) {
            abilities[0].Cooldown = numValue;
        }
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
        inputText.addEventListener('focusin', () => {
            inputText.value = '';
        });
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