import { skillImages } from "./SkillData.js";

export class SkillElement {
  constructor(
    skillName,
    skill,
    category,
    skillLevels,
    canUpgradeCallback,
    costBreakdownCallback,
    skillSpendingCallback,
    getCostForSkillLevelCallback,
  ) {
    this.skillName = skillName;
    this.skill = skill;
    this.category = category;
    this.skillLevels = skillLevels;
    this.canUpgradeCallback = canUpgradeCallback;
    this.costBreakdownCallback = costBreakdownCallback;
    this.skillSpendingCallback = skillSpendingCallback;
    this.getCostForSkillLevelCallback = getCostForSkillLevelCallback;
  }

  createElement() {
    const skillDiv = document.createElement("div");
    skillDiv.className = "skill-item mb-3 p-3 border border-secondary rounded";
    skillDiv.dataset.skill = this.skillName;

    this.updateElement(skillDiv);
    return skillDiv;
  }

  calculateSkillValue(skillName, currentLevel) {
    const skillEffects = {
      "Enhanced Optics": currentLevel * 0.5, // 0.5% range increase per level
      "Improved Gunpowder": currentLevel * 0.5, // 0.5% explosion radius increase per level
      "Fight Dirty": currentLevel * 1, // 1% debuff duration increase per level
      Precision: Math.max(10, 30 - currentLevel), // Critical hit every 29-X shots
      Resourcefulness: currentLevel * 1.2, // 1.2% sell value increase per level
      "Bigger Budget": currentLevel * 1, // 1% starting cash increase per level
      Stonks: currentLevel * 0.5, // 0.5% wave reward increase per level
      Scavenger: Math.max(10, 30 - currentLevel), // Bonus every 29-X kills
      Accelerator: currentLevel * 0.5, // 0.5% cooldown reduction per level
      Scholar: 1 + currentLevel * 0.01, // 1.01x multiplier increasing by 0.01 per level
      "Expanded Barracks": currentLevel * 0.75, // 0.75% spawn cooldown reduction per level
      "Re-enforcements": currentLevel * 1, // 1 placement limit increase per level
      Fortify: currentLevel * 5, // 5 health increase per level
      "Over-Heal": currentLevel * 8, // 8 over-heal capacity increase per level
      Bandages: currentLevel * 1, // 1 health regeneration per level
      "Extreme Conditioning": currentLevel * 0.8, // 0.8% debuff duration reduction per level
      "Beefed Up Minions": currentLevel * 0.6, // 0.6% unit health increase per level
    };

    return skillEffects[skillName] || 0;
  }

  getDynamicDescription(skillName, currentLevel) {
    const value = this.calculateSkillValue(skillName, currentLevel);

    // level 0
    if (currentLevel === 0) {
      const placeholderDescriptions = {
        "Enhanced Optics": `Tower range is increased by X%`,
        "Improved Gunpowder": `AOE explosion radius is increased by X%`,
        "Fight Dirty": `Debuff durations applied to enemies are increased by X%`,
        Precision: `Every X shots, towers deal a critical hit (1.25x damage)`,
        Resourcefulness: `Selling towers returns X% more money`,
        "Bigger Budget": `Starting cash is increased by X%`,
        Stonks: `Wave rewards are increased by X%`,
        Scavenger: `Every X enemy kills grant 1.5x rewards from enemies`,
        Accelerator: `Reduces cooldowns of active abilities by X%`,
        Scholar: `Logbook drop rate increases by X.XXx`,
        "Expanded Barracks": `Cooldown for spawning units is reduced by X%`,
        "Re-enforcements": `Increases the tower placement limit by X`,
        Fortify: `Increases the player's health pool by X`,
        "Over-Heal": `Increases how much extra HP can be kept from over-healing by X`,
        Bandages: `Regenerates X health at the start of every wave`,
        "Extreme Conditioning": `Reduces stun and debuff durations from enemies by X%`,
        "Beefed Up Minions": `Health of summoned units is increased by X%`,
      };

      return placeholderDescriptions[skillName] || this.skill.description;
    }

    // actual upgrades
    const descriptions = {
      "Enhanced Optics": `Tower range is increased by ${value.toFixed(1)}%`,
      "Improved Gunpowder": `AOE explosion radius is increased by ${value.toFixed(1)}%`,
      "Fight Dirty": `Debuff durations applied to enemies are increased by ${value}%`,
      Precision: `Every ${Math.floor(value)} shots, towers deal a critical hit (1.25x damage)`,
      Resourcefulness: `Selling towers returns ${value.toFixed(1)}% more money`,
      "Bigger Budget": `Starting cash is increased by ${value}%`,
      Stonks: `Wave rewards are increased by ${value.toFixed(1)}%`,
      Scavenger: `Every ${Math.floor(value)} enemy kills grant 1.5x rewards from enemies`,
      Accelerator: `Reduces cooldowns of active abilities by ${value.toFixed(1)}%`,
      Scholar: `Logbook drop rate increases by ${value.toFixed(2)}x`,
      "Expanded Barracks": `Cooldown for spawning units is reduced by ${value.toFixed(2)}%`,
      "Re-enforcements": `Increases the tower placement limit by ${Math.floor(value)}`,
      Fortify: `Increases the player's health pool by ${Math.floor(value)}`,
      "Over-Heal": `Increases how much extra HP can be kept from over-healing by ${Math.floor(value)}`,
      Bandages: `Regenerates ${Math.floor(value)} health at the start of every wave`,
      "Extreme Conditioning": `Reduces stun and debuff durations from enemies by ${value.toFixed(1)}%`,
      "Beefed Up Minions": `Health of summoned units is increased by ${value.toFixed(1)}%`,
    };

    return descriptions[skillName] || this.skill.description;
  }

  updateElement(skillDiv) {
    const currentLevel = this.skillLevels[this.skillName];
    const existingIncrementInput = skillDiv.querySelector(".skill-increment");
    const currentIncrementValue = existingIncrementInput
      ? existingIncrementInput.value
      : "1";
    const prereqsMet = this.skill.prerequisites.every(
      (prereq) => this.skillLevels[prereq] >= 10,
    );
    const hasPrereqs = this.skill.prerequisites.length > 0;
    const skillImage = skillImages[this.skillName] || "Unavailable.png";
    const dynamicDescription = this.getDynamicDescription(
      this.skillName,
      currentLevel,
    );

    skillDiv.innerHTML = '';
    const createCostNodes = (breakdown) => {
      const nodes = [];
      if (breakdown.credits > 0) {
        nodes.push(document.createTextNode(`${breakdown.credits.toLocaleString()} `));
        const img = document.createElement('img');
        img.src = "/htmlassets/SkillCredit.png";
        img.alt = "Skill Credits";
        img.className = "cost-icon";
        nodes.push(img);
      }
      if (nodes.length > 0 && breakdown.coins > 0) {
        nodes.push(document.createTextNode(' + '));
      }
      if (breakdown.coins > 0) {
        nodes.push(document.createTextNode(`${breakdown.coins.toLocaleString()} `));
        const img = document.createElement('img');
        img.src = "/htmlassets/Coin.png";
        img.alt = "Coins";
        img.className = "cost-icon";
        nodes.push(img);
      }
      return nodes;
    };

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'd-flex justify-content-between align-items-start mb-2';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'd-flex align-items-start flex-grow-1';

    const img = document.createElement('img');
    img.src = `/htmlassets/skills/${skillImage}`;
    img.alt = this.skillName;
    img.className = 'me-3 rounded';
    img.style = 'width: 48px; height: 48px; object-fit: cover; flex-shrink: 0;';
    img.loading = 'lazy';

    const textWrapper = document.createElement('div');
    textWrapper.className = 'flex-grow-1';

    const title = document.createElement('h6');
    title.className = 'text-white mb-1';
    title.textContent = this.skillName;

    const description = document.createElement('p');
    description.className = 'text-light small mb-2';
    description.textContent = dynamicDescription;

    const effect = document.createElement('small');
    effect.className = 'text-info d-block mb-1';
    effect.textContent = this.skill.effect;

    textWrapper.append(title, description, effect);

    if (hasPrereqs) {
      const prereqEl = document.createElement('small');
      prereqEl.className = prereqsMet ? 'text-success' : 'text-warning';
      const icon = document.createElement('i');
      icon.className = 'bi bi-arrow-right me-1';
      prereqEl.append(icon, document.createTextNode(`Requires: ${this.skill.prerequisites.join(", ")} (Level 10)`));
      textWrapper.append(prereqEl);
    }

    contentWrapper.append(img, textWrapper);

    const endWrapper = document.createElement('div');
    endWrapper.className = 'text-end';
    const levelDisplay = document.createElement('div');
    levelDisplay.className = 'skill-level-display';
    const badge = document.createElement('span');
    badge.className = `badge ${currentLevel === this.skill.maxLevel ? "bg-success" : "bg-secondary"}`;
    badge.textContent = `${currentLevel}/${this.skill.maxLevel}`;
    levelDisplay.append(badge);
    endWrapper.append(levelDisplay);

    mainWrapper.append(contentWrapper, endWrapper);

    const controlsWrapper = document.createElement('div');
    controlsWrapper.className = 'skill-controls d-flex align-items-center justify-content-between';
    
    controlsWrapper.innerHTML = `
      <div class="d-flex align-items-center" style="gap: 0.5rem;">
        <div class="btn-group" role="group">
          <button class="btn btn-sm btn-outline-danger skill-decrease" ${currentLevel === 0 ? "disabled" : ""} title="Decrease skill level">
            <i class="bi bi-dash"></i>
          </button>
          <button class="btn btn-sm btn-outline-success skill-increase" ${currentLevel >= this.skill.maxLevel || !this.canUpgradeCallback(this.skillName) ? "disabled" : ""} title="Increase skill level">
            <i class="bi bi-plus"></i>
          </button>
        </div>
        <input type="number" class="form-control form-control-sm skill-increment" min="1" max="${this.skill.maxLevel}" value="${currentIncrementValue}" title="Number of levels to add/remove at once">
      </div>
    `;

    const costInfo = document.createElement('div');
    costInfo.className = 'skill-cost-info text-end';

    if (currentLevel < this.skill.maxLevel) {
      const nextCost = this.getCostForSkillLevelCallback(this.skillName, currentLevel + 1);
      const breakdown = this.costBreakdownCallback(nextCost);
      const nextCostEl = document.createElement('small');
      nextCostEl.className = 'text-light';
      nextCostEl.append(document.createTextNode('Next: '), ...createCostNodes(breakdown));
      costInfo.append(nextCostEl);
    } else {
      costInfo.innerHTML = `<small class="text-success"><i class="bi bi-check-circle"></i> Maxed</small>`;
    }

    if (currentLevel > 0) {
      const actualSpending = this.skillSpendingCallback(this.skillName);
      if (actualSpending.credits > 0 || actualSpending.coins > 0) {
        const totalSpentEl = document.createElement('small');
        totalSpentEl.className = 'text-muted';
        const br = document.createElement('br');
        totalSpentEl.append(br, document.createTextNode('Total spent: '), ...createCostNodes(actualSpending));
        costInfo.append(totalSpentEl);
      }
    }
    
    controlsWrapper.append(costInfo);
    skillDiv.append(mainWrapper, controlsWrapper);
  }

  updateDisplay(skillDiv) {
    this.updateElement(skillDiv);
  }
}
