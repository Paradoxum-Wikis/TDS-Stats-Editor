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
      Precision: Math.max(1, 29 - currentLevel), // Critical hit every 29-X shots
      Resourcefulness: currentLevel * 1.2, // 1.2% sell value increase per level
      "Bigger Budget": currentLevel * 1, // 1% starting cash increase per level
      Stonks: currentLevel * 0.5, // 0.5% wave reward increase per level
      Scavenger: Math.max(1, 29 - currentLevel), // Bonus every 29-X kills
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
    let nextCost = 0;
    if (
      currentLevel < this.skill.maxLevel &&
      this.getCostForSkillLevelCallback
    ) {
      nextCost = this.getCostForSkillLevelCallback(
        this.skillName,
        currentLevel + 1,
      );
    }

    // prerequisites check
    const prereqsMet = this.skill.prerequisites.every(
      (prereq) => this.skillLevels[prereq] >= 10,
    );
    const hasPrereqs = this.skill.prerequisites.length > 0;

    if (hasPrereqs && !prereqsMet) {
      skillDiv.classList.add("lockedout");
    } else {
      skillDiv.classList.remove("lockedout");
    }

    const skillImage = skillImages[this.skillName] || "Unavailable.png";
    const dynamicDescription = this.getDynamicDescription(
      this.skillName,
      currentLevel,
    );

    let costBreakdownHtml = "";
    if (currentLevel < this.skill.maxLevel && this.costBreakdownCallback) {
      const breakdown = this.costBreakdownCallback(nextCost);
      const parts = [];

      if (breakdown.credits > 0) {
        parts.push(
          `${breakdown.credits.toLocaleString()} <img src="/htmlassets/SkillCredit.png" alt="Skill Credits" class="cost-icon">`,
        );
      }
      if (breakdown.coins > 0) {
        parts.push(
          `${breakdown.coins.toLocaleString()} <img src="/htmlassets/Coin.png" alt="Coins" class="cost-icon">`,
        );
      }

      costBreakdownHtml = `<small class="text-light">
        Next: ${parts.join(" + ")}
      </small>`;
    }

    let totalSpentHtml = "";

    if (currentLevel > 0 && this.skillSpendingCallback) {
      const actualSpending = this.skillSpendingCallback(this.skillName);
      const totalParts = [];

      if (actualSpending.credits > 0) {
        totalParts.push(
          `${actualSpending.credits.toLocaleString()} <img src="/htmlassets/SkillCredit.png" alt="Skill Credits" class="cost-icon">`,
        );
      }
      if (actualSpending.coins > 0) {
        totalParts.push(
          `${actualSpending.coins.toLocaleString()} <img src="/htmlassets/Coin.png" alt="Coins" class="cost-icon">`,
        );
      }

      if (totalParts.length > 0) {
        totalSpentHtml = `<br><small class="text-muted">
          Total spent: ${totalParts.join(" + ")}
        </small>`;
      }
    }

    skillDiv.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div class="d-flex align-items-start flex-grow-1">
          <img 
            src="/htmlassets/skills/${skillImage}" 
            alt="${this.skillName}" 
            class="me-3 rounded"
            style="width: 48px; height: 48px; object-fit: cover; flex-shrink: 0;"
            loading="lazy"
          />
          <div class="flex-grow-1">
            <h6 class="text-white mb-1">${this.skillName}</h6>
            <p class="text-light small mb-2">${dynamicDescription}</p>
            <small class="text-info d-block mb-1">${this.skill.effect}</small>
            ${
              hasPrereqs
                ? `<small class="${prereqsMet ? "text-success" : "text-warning"}">
                <i class="bi bi-arrow-right me-1"></i>Requires: ${this.skill.prerequisites.join(", ")} (Level 10)
              </small>`
                : ""
            }
          </div>
        </div>
        <div class="text-end">
          <div class="skill-level-display">
            <span class="badge ${currentLevel === this.skill.maxLevel ? "bg-success" : "bg-secondary"}">
              ${currentLevel}/${this.skill.maxLevel}
            </span>
          </div>
        </div>
      </div>
      
      <div class="skill-controls d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center" style="gap: 0.5rem;">
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-danger skill-decrease" 
                    ${currentLevel === 0 ? "disabled" : ""}
                    title="Decrease skill level">
              <i class="bi bi-dash"></i>
            </button>
            <button class="btn btn-sm btn-outline-success skill-increase" 
                    ${currentLevel >= this.skill.maxLevel || !this.canUpgradeCallback(this.skillName) ? "disabled" : ""}
                    title="Increase skill level">
              <i class="bi bi-plus"></i>
            </button>
          </div>
          <input type="number" 
                 class="form-control form-control-sm skill-increment"  
                 min="1" 
                 max="${this.skill.maxLevel}" 
                 value="1"
                 title="Number of levels to add/remove at once">
        </div>
        
        <div class="skill-cost-info text-end">
          ${
            currentLevel < this.skill.maxLevel
              ? costBreakdownHtml
              : `<small class="text-success">
              <i class="bi bi-check-circle"></i> Maxed
            </small>`
          }
          ${totalSpentHtml}
        </div>
      </div>
    `;
  }

  updateDisplay(skillDiv) {
    this.updateElement(skillDiv);
  }
}
