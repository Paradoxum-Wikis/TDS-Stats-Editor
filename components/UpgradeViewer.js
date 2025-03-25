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
        
        // add group button
        this.addGroupButton = document.getElementById('side-upgrade-extras-add-group');
        this.addGroupButton.addEventListener('click', () => {
            const upgradeIndex = this.index;
            const skin = this.viewer.getActiveSkin();
            const upgradeStats = skin.data.Upgrades[upgradeIndex].Stats;
            if (upgradeStats.Extras === undefined) {
                upgradeStats.Extras = [];
            }
            
            // form to add group
            const groupForm = document.createElement('div');
            groupForm.classList.add('mb-3', 'p-2', 'border', 'border-primary', 'rounded');
            
            // Group ID field
            const groupIdField = document.createElement('div');
            groupIdField.classList.add('d-flex', 'mb-2', 'align-items-center');
            groupIdField.innerHTML = `
                <label class="me-2">Group ID:</label>
                <select class="form-select form-select-sm text-white bg-dark">
                    <option value="">Default</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            `;
            const groupIdSelect = groupIdField.querySelector('select');
            
            // Group name field
            const groupNameField = document.createElement('div');
            groupNameField.classList.add('mb-2');
            groupNameField.innerHTML = `
                <div class="d-flex mb-1 align-items-center">
                    <label class="me-2">Name:</label>
                    <input type="text" class="form-control form-control-sm text-white bg-dark" placeholder="Custom group name">
                </div>
                <small class="text-muted">If this group ID already has a name, you don't need to specify it again.</small>
            `;
            const groupNameInput = groupNameField.querySelector('input');
            
            // Add item
            const contentField = document.createElement('div');
            contentField.classList.add('mb-2');
            contentField.innerHTML = `
                <label class="mb-1">Content:</label>
                <textarea class="form-control form-control-sm bg-dark" rows="2" placeholder="Enter content for the first item" style="color: #fff;"></textarea>
            `;
            const contentInput = contentField.querySelector('textarea');
            
            // Buttons
            const buttonGroup = document.createElement('div');
            buttonGroup.classList.add('d-flex', 'justify-content-end', 'gap-2');
            
            const cancelButton = document.createElement('button');
            cancelButton.classList.add('btn', 'btn-sm', 'btn-outline-secondary');
            cancelButton.textContent = 'Cancel';
            cancelButton.addEventListener('click', () => {
                this.extrasInput.removeChild(groupForm);
            });
            
            const saveButton = document.createElement('button');
            saveButton.classList.add('btn', 'btn-sm', 'btn-primary');
            saveButton.textContent = 'Create Group';
            saveButton.addEventListener('click', () => {
                const groupId = groupIdSelect.value;
                const groupName = groupNameInput.value.trim();
                const content = contentInput.value.trim();
                
                // Format the collapsible group tag with content
                let groupTag = '[Collapsible';
                if (groupId) groupTag += groupId;
                if (groupName) groupTag += `:${groupName}`;
                groupTag += ']';
                
                // Add content directly to the group tag if provided
                if (content) {
                    groupTag += content;
                }
                
                // Add the combined group to extras
                upgradeStats.Extras.push(groupTag);
                
                this.extrasInput.removeChild(groupForm);
                this.viewer.reload();
            });
            
            buttonGroup.appendChild(cancelButton);
            buttonGroup.appendChild(saveButton);
            
            groupForm.appendChild(groupIdField);
            groupForm.appendChild(groupNameField);
            groupForm.appendChild(contentField);
            groupForm.appendChild(buttonGroup);

            this.extrasInput.appendChild(groupForm);
        });
        
        // event listener for settings changes
        document.addEventListener('settingsChanged', (event) => {
            if (event.detail.setting === 'showCollapsibleCounts' && this.upgradeChanges) {
                this.#loadUpgradeChanges();
            }
        });

        this.abilityAddButton = document.getElementById('side-ability-add');
        this.abilityAddButton.addEventListener('click', () => {
            const newAbility = {
                Name: "",
                Icon: "https://static.wikia.nocookie.net/tower-defense-sim/images/f/f7/Place.png",
                Level: "",
                Cooldown: "",
                Cost: "",
            };
            
            const abilities = this.#getAbilities();
            if (abilities) {
                abilities.push(newAbility);
                this.viewer.reload();
            } else {
                // create ability array if it doesn't have one
                const defaults = this.skinData?.defaults?.data || this.skinData?.data?.Defaults || {};
                if (!defaults.Abilities) {
                    defaults.Abilities = [];
                }
                defaults.Abilities.push(newAbility);
                this.viewer.reload();
            }
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
        
        const regularExtras = [];
        const collapsibleGroups = {};
        
        upgradeChanges.forEach(change => {
            // check for collapsible groups with custom names: [Collapsible], [Collapsible1], [Collapsible:CustomName], etc.
            const collapsibleMatch = change.match(/^\[Collapsible(\d*):?(.*?)\]/);
            
            if (collapsibleMatch) {
                // get the group number or use default if none
                const groupId = collapsibleMatch[1] || 'default';
                
                // get custom name if provided
                const customName = collapsibleMatch[2] ? collapsibleMatch[2].trim() : '';
                
                // create the group array if it doesn't already exist
                if (!collapsibleGroups[groupId]) {
                    collapsibleGroups[groupId] = {
                        items: [],
                        customName: customName
                    };
                } else if (customName && !collapsibleGroups[groupId].customName) {
                    collapsibleGroups[groupId].customName = customName;
                }
                
                const cleanedText = change.replace(/\[Collapsible\d*:?.*?\]/, '').trim();
                collapsibleGroups[groupId].items.push(cleanedText);
            } else {
                // this is a regular extra
                regularExtras.push(change);
            }
        });
        
        let html = '';
        regularExtras.forEach(extra => {
            html += `<div>${extra}</div>`;
        });

        const showCounts = window.state?.settings?.showCollapsibleCounts !== false;
        
        // add each collapsible group
        Object.entries(collapsibleGroups).forEach(([groupId, group], index) => {
            const items = group.items;
            
            if (items.length > 0) {
                const collapsibleId = `collapsible-extras-${this.index}-${groupId}`;
                
                let groupLabel;
                if (group.customName) {
                    groupLabel = group.customName;
                } else {
                    groupLabel = `Group`;
                    if (groupId !== 'default') {
                        groupLabel += ` ${groupId}`;
                    }
                }
                
                html += `
                    <div class="mt-2">
                        <button class="btn btn-sm btn-primary border25 w-100" 
                                type="button" 
                                data-bs-toggle="collapse" 
                                data-bs-target="#${collapsibleId}" 
                                aria-expanded="false">
                            <span class="when-closed">▼ ${groupLabel}${showCounts ? ` (${items.length})` : ''} ▼</span>
                            <span class="when-open">▲ ${groupLabel} ▲</span>
                        </button>
                        <div class="collapse mt-2" id="${collapsibleId}">
                            <div class="ps-2 border-start border-secondary">
                                ${items.map(extra => `<div>${extra}</div>`).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        this.upgradeChanges.innerHTML = html;
        
        if (!document.getElementById('collapsible-styles')) {
            const style = document.createElement('style');
            style.id = 'collapsible-styles';
            style.textContent = `
                [aria-expanded="false"] .when-open {
                    display: none;
                }
                [aria-expanded="true"] .when-closed {
                    display: none;
                }
            `;
            document.head.appendChild(style);
        }
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
        if (this.skinData?.defaults?.Abilities) return this.skinData.defaults.Abilities;
        if (this.skinData?.Defaults?.Abilities) return this.skinData.Defaults.Abilities;
        if (this.skinData?.Default?.Defaults?.Abilities) return this.skinData.Default.Defaults.Abilities;
        if (this.skinData?.data?.Abilities) return this.skinData.data.Abilities;
        if (this.skinData?.defaults?.data?.Abilities) return this.skinData.defaults.data.Abilities;
        if (this.skinData?.defaults?.attributes?.Abilities) return this.skinData.defaults.attributes.Abilities;

        return null;
    }

    #loadAbilities(skinData) {
        this.skinData = skinData
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

        // Store the input elements for later access
        abilityDiv.levelInput = unlockLevelInput.querySelector('input');
        abilityDiv.cooldownInput = cooldownInput.querySelector('input');
        abilityDiv.costInput = abilityCostInput.querySelector('input');
    
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