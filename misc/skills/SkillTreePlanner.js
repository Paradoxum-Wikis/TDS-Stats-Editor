import { skillData, skillExponentialValues } from './SkillData.js';
import { SkillElement } from './SkillElement.js';
import { BuildManager } from './BuildManager.js';

export class SkillTreePlanner {
  constructor() {
    this.totalCoins = 0;
    this.totalCredits = 0;
    this.usedCoins = 0;
    this.usedCredits = 0;
    this.skillLevels = {};
    this.skillElements = new Map();
    this.skillSpending = {};
    this.urlUpdateTimer = null;
    this.lastUrlUpdate = 0;
    this.URL_UPDATE_DELAY = 10000; // 10 secs
    
    Object.keys(skillData).forEach(category => {
      Object.keys(skillData[category]).forEach(skill => {
        this.skillLevels[skill] = 0;
        this.skillSpending[skill] = { credits: 0, coins: 0 };
      });
    });

    this.init();
  }

  init() {
    this.loadFromURL();
    this.renderSkills();
    this.setupEventListeners();
    this.setupMobileEventListeners();
    this.updateDisplay();
  }

  setupEventListeners() {
    document.getElementById('total-coins').addEventListener('input', (e) => {
      this.totalCoins = parseInt(e.target.value) || 0;
      this.syncMobileInputs('coins', this.totalCoins);
      this.updateDisplay();
    });

    document.getElementById('total-credits').addEventListener('input', (e) => {
      this.totalCredits = parseInt(e.target.value) || 0;
      this.syncMobileInputs('credits', this.totalCredits);
      this.updateDisplay();
    });

    document.getElementById('global-increment').addEventListener('input', (e) => {
      const globalIncrement = parseInt(e.target.value) || 1;
      this.updateAllSkillIncrements(globalIncrement);
      this.syncMobileInputs('increment', globalIncrement);
    });

    document.getElementById('reset-skills').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all skills?')) {
        this.resetSkills();
      }
    });

    document.getElementById('share-build')?.addEventListener('click', () => {
      this.updateURL(true);
      BuildManager.shareURL();
    });
  }

  setupMobileEventListeners() {
    // mobile events
    document.addEventListener('skillsReset', () => {
      this.resetSkills();
    });

    document.addEventListener('skillsShare', () => {
      this.updateURL(true);
      BuildManager.shareURL();
    });
  }

  syncMobileInputs(type, value) {
    // sync mobile sidebar inputs with main inputs
    const mobileInput = document.querySelector(`.mobile-sidebar #total-${type}`);
    if (mobileInput && mobileInput.value != value) {
      mobileInput.value = value;
    }

    if (type === 'increment') {
      const mobileGlobalIncrement = document.querySelector('.mobile-sidebar #global-increment');
      if (mobileGlobalIncrement && mobileGlobalIncrement.value != value) {
        mobileGlobalIncrement.value = value;
      }
    }
  }

  updateAllSkillIncrements(value) {
    const allIncrementInputs = document.querySelectorAll('.skill-increment');
    allIncrementInputs.forEach(input => {
      input.value = value;
    });
  }

  calculateCostBreakdown(cost) {
    const creditsToUse = Math.min(cost, this.totalCredits - this.usedCredits);
    const coinsToUse = Math.max(0, cost - creditsToUse);
    
    return {
      credits: creditsToUse,
      coins: coinsToUse,
      total: creditsToUse + coinsToUse
    };
  }

  canAfford(cost) {
    const breakdown = this.calculateCostBreakdown(cost);
    const availableCoins = this.totalCoins - this.usedCoins;
    const availableCredits = this.totalCredits - this.usedCredits;
    
    return breakdown.credits <= availableCredits && breakdown.coins <= availableCoins;
  }

getCostForSkillLevel(skillName, level) {
    if (level <= 0) return 0;
    const skillInfo = this.getSkillData(skillName);
    if (!skillInfo || skillInfo.baseCost === undefined) {
      console.error(`Skill data or baseCost not found for ${skillName}`);
      return Infinity;
    }
    const exponent = skillExponentialValues[skillName];
    if (exponent === undefined) {
      console.error(`Exponent not found for ${skillName}`);
      return Infinity;
    }
    
    const calculatedCost = Math.pow(skillInfo.baseCost * level, exponent);
    const divided = calculatedCost / 5;
    const remainder = divided - Math.floor(divided);
    
    // If remainder is greater than 0.6, round up; otherwise round down
    if (remainder > 0.6) {
      return Math.ceil(divided) * 5;
    } else {
      return Math.floor(divided) * 5;
    }
  }

  renderSkills() {
    Object.keys(skillData).forEach(category => {
      const container = document.getElementById(`${category.toLowerCase()}-skills`);
      if (!container) return;
      
      Object.keys(skillData[category]).forEach(skillName => {
        const skill = skillData[category][skillName];
        const skillElementInstance = new SkillElement(
          skillName, 
          skill, 
          category, 
          this.skillLevels,
          (name) => this.canUpgradeSkill(name),
          (cost) => this.calculateCostBreakdown(cost),
          (name) => this.skillSpending[name],
          (sName, lvl) => this.getCostForSkillLevel(sName, lvl)
        );
        
        const skillDiv = skillElementInstance.createElement();
        this.skillElements.set(skillName, { instance: skillElementInstance, element: skillDiv });

        skillDiv.addEventListener('click', (event) => {
          const targetButton = event.target.closest('button');
          if (!targetButton) return;

          const incrementInput = skillDiv.querySelector('.skill-increment');
          const increment = parseInt(incrementInput.value) || 1;

          if (targetButton.classList.contains('skill-decrease')) {
            this.decreaseSkillMultiple(skillName, increment);
          } else if (targetButton.classList.contains('skill-increase')) {
            this.upgradeSkillMultiple(skillName, increment);
          }
        });
        
        container.appendChild(skillDiv);
      });
    });
  }

  upgradeSkillMultiple(skillName, count) {
    for (let i = 0; i < count; i++) {
      if (!this.canUpgradeSkill(skillName)) {
        break; // Stop if we can't upgrade anymore
      }
      this.upgradeSkill(skillName, false);
    }
    this.updateDisplay();
  }

  decreaseSkillMultiple(skillName, count) {
    for (let i = 0; i < count; i++) {
      const currentLevel = this.skillLevels[skillName];
      if (currentLevel <= 0) {
        break;
      }
      
      if (this.isSkillRequired(skillName, currentLevel - 1)) {
        alert(`Cannot decrease ${skillName} further as it's required by other skills.`);
        break;
      }
      
      this.decreaseSkill(skillName, false);
    }
    this.updateDisplay();
  }

  canUpgradeSkill(skillName) {
    const skill = this.getSkillData(skillName);
    const currentLevel = this.skillLevels[skillName];
    
    if (currentLevel >= skill.maxLevel) return false;
    
    const nextCost = this.getCostForSkillLevel(skillName, currentLevel + 1);
    if (!this.canAfford(nextCost)) return false;
    
    return skill.prerequisites.every(prereq => this.skillLevels[prereq] >= 10);
  }

upgradeSkill(skillName, updateUrl = true) {
    const skill = this.getSkillData(skillName);
    if (!skill) return;

    const currentLevel = this.skillLevels[skillName];
    if (currentLevel >= skill.maxLevel) return;

    if (!this.canUpgradeSkill(skillName)) return;

    const cost = this.getCostForSkillLevel(skillName, currentLevel + 1);
    const breakdown = this.calculateCostBreakdown(cost);

    this.usedCredits += breakdown.credits;
    this.usedCoins += breakdown.coins;
    this.skillSpending[skillName].credits += breakdown.credits;
    this.skillSpending[skillName].coins += breakdown.coins;
    this.skillLevels[skillName]++;

    if (updateUrl) {
      this.updateDisplay();
    }
  }

  decreaseSkill(skillName, updateUrl = true) {
    const currentLevel = this.skillLevels[skillName];
    if (currentLevel <= 0) return;

    if (this.isSkillRequired(skillName, currentLevel - 1)) {
      alert(`Cannot decrease ${skillName} as it's required by other skills.`);
      return;
    }

    const cost = this.getCostForSkillLevel(skillName, currentLevel);
    const refund = this.calculateRefundBreakdown(cost);

    this.usedCredits -= refund.credits;
    this.usedCoins -= refund.coins;
    this.skillSpending[skillName].credits -= refund.credits;
    this.skillSpending[skillName].coins -= refund.coins;
    this.skillLevels[skillName]--;

    if (updateUrl) {
      this.updateDisplay();
    }
  }

  calculateRefundBreakdown(cost) {
    const creditsToRefund = Math.min(cost, this.usedCredits);
    const coinsToRefund = Math.max(0, cost - creditsToRefund);
    
    return {
      credits: creditsToRefund,
      coins: coinsToRefund
    };
  }

  isSkillRequired(skillName, newLevel) {
    return Object.keys(skillData).some(category => 
      Object.keys(skillData[category]).some(otherSkill => 
        skillData[category][otherSkill].prerequisites.includes(skillName) && 
        this.skillLevels[otherSkill] > 0 &&
        newLevel < 10
      )
    );
  }

  getSkillData(skillName) {
    for (const category of Object.keys(skillData)) {
      if (skillData[category][skillName]) {
        return skillData[category][skillName];
      }
    }
    return null;
  }

  updateSkillDisplay(skillName) {
    const skillElementData = this.skillElements.get(skillName);
    if (skillElementData) {
      skillElementData.instance.updateDisplay(skillElementData.element);
    }
  }

  updateDisplay() {
    const availableCoins = this.totalCoins - this.usedCoins;
    const availableCredits = this.totalCredits - this.usedCredits;
    
    document.getElementById('available-coins').textContent = availableCoins.toLocaleString();
    document.getElementById('used-coins').textContent = this.usedCoins.toLocaleString();
    document.getElementById('available-credits').textContent = availableCredits.toLocaleString();
    document.getElementById('used-credits').textContent = this.usedCredits.toLocaleString();

    Object.keys(this.skillLevels).forEach(skillName => {
      this.updateSkillDisplay(skillName);
    });

    this.scheduleURLUpdate();
  }

  // Schedule URL update
  scheduleURLUpdate() {
    if (this.urlUpdateTimer) {
      clearTimeout(this.urlUpdateTimer);
    }

    this.urlUpdateTimer = setTimeout(() => {
      this.updateURL(false);
    }, this.URL_UPDATE_DELAY);
  }

  updateURL(forceUpdate = false) {
    const now = Date.now();

    if (!forceUpdate && (now - this.lastUrlUpdate) < this.URL_UPDATE_DELAY) {
      return;
    }

    const buildData = {
      totalCoins: this.totalCoins,
      totalCredits: this.totalCredits,
      skillLevels: this.skillLevels
    };
    
    BuildManager.updateURL(buildData);
    this.lastUrlUpdate = now;

    if (this.urlUpdateTimer) {
      clearTimeout(this.urlUpdateTimer);
      this.urlUpdateTimer = null;
    }
  }

  loadFromURL() {
    const buildData = BuildManager.loadFromURL();
    
    if (buildData.totalCoins > 0) {
      this.totalCoins = buildData.totalCoins;
      document.getElementById('total-coins').value = this.totalCoins;
    }
    
    if (buildData.totalCredits > 0) {
      this.totalCredits = buildData.totalCredits;
      document.getElementById('total-credits').value = this.totalCredits;
    }

    if (buildData.skillLevels && Object.keys(buildData.skillLevels).length > 0) {
      Object.keys(buildData.skillLevels).forEach(skillName => {
        if (this.skillLevels.hasOwnProperty(skillName)) {
          const level = parseInt(buildData.skillLevels[skillName]) || 0;
          // Apply each level one by one to properly calculate costs
          for (let i = 1; i <= level; i++) {
            this.upgradeSkill(skillName, false);
          }
        }
      });
    }
  }

  resetSkills() {
    Object.keys(this.skillLevels).forEach(skill => {
      this.skillLevels[skill] = 0;
      this.skillSpending[skill] = { credits: 0, coins: 0 };
    });
    this.usedCoins = 0;
    this.usedCredits = 0;
    this.updateDisplay();
    this.updateURL(true);
  }
}