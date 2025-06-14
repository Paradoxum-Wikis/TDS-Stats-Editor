import { skillData } from './skillData.js';
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
    
    Object.keys(skillData).forEach(category => {
      Object.keys(skillData[category]).forEach(skill => {
        this.skillLevels[skill] = 0;
        this.skillSpending[skill] = { credits: 0, coins: 0 };
      });
    });

    this.init();
  }

  init() {
    this.renderSkills();
    this.setupEventListeners();
    this.updateDisplay();
  }

  setupEventListeners() {
    document.getElementById('total-coins').addEventListener('input', (e) => {
      this.totalCoins = parseInt(e.target.value) || 0;
      this.updateDisplay();
    });

    document.getElementById('total-credits').addEventListener('input', (e) => {
      this.totalCredits = parseInt(e.target.value) || 0;
      this.updateDisplay();
    });

    document.getElementById('reset-skills').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all skills?')) {
        this.resetSkills();
      }
    });

    document.getElementById('save-build').addEventListener('click', () => {
      this.saveBuild();
    });

    document.getElementById('load-build').addEventListener('click', () => {
      const modal = new bootstrap.Modal(document.getElementById('load-build-modal'));
      modal.show();
    });

    document.getElementById('import-build').addEventListener('click', () => {
      this.loadBuild();
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
          (name) => this.skillSpending[name] // Pass individual skill spending
        );
        
        const skillDiv = skillElementInstance.createElement();
        this.skillElements.set(skillName, { instance: skillElementInstance, element: skillDiv });

        skillDiv.addEventListener('click', (event) => {
          const targetButton = event.target.closest('button');
          if (!targetButton) return;

          if (targetButton.classList.contains('skill-decrease')) {
            this.decreaseSkill(skillName);
          } else if (targetButton.classList.contains('skill-increase')) {
            this.upgradeSkill(skillName);
          }
        });
        
        container.appendChild(skillDiv);
      });
    });
  }

  canUpgradeSkill(skillName) {
    const skill = this.getSkillData(skillName);
    const currentLevel = this.skillLevels[skillName];
    
    if (currentLevel >= skill.maxLevel) return false;
    
    const nextCost = skill.costs[currentLevel];
    if (!this.canAfford(nextCost)) return false;
    
    return skill.prerequisites.every(prereq => this.skillLevels[prereq] >= 10);
  }

  upgradeSkill(skillName) {
    if (!this.canUpgradeSkill(skillName)) return;
    
    const skill = this.getSkillData(skillName);
    const currentLevel = this.skillLevels[skillName];
    const cost = skill.costs[currentLevel];
    const breakdown = this.calculateCostBreakdown(cost);
    
    this.skillLevels[skillName]++;
    this.usedCredits += breakdown.credits;
    this.usedCoins += breakdown.coins;
    this.skillSpending[skillName].credits += breakdown.credits;
    this.skillSpending[skillName].coins += breakdown.coins;
    
    this.updateSkillDisplay(skillName);
    this.updateDisplay();
  }

  decreaseSkill(skillName) {
    const currentLevel = this.skillLevels[skillName];
    if (currentLevel === 0) return;
    if (this.isSkillRequired(skillName, currentLevel - 1)) {
      alert(`Cannot downgrade ${skillName} below level 10 as other skills depend on it.`);
      return;
    }
    
    const skill = this.getSkillData(skillName);
    const cost = skill.costs[currentLevel - 1];
    
    // Get what was actually spent on this skill so far
    const skillCreditsUsed = this.skillSpending[skillName].credits;
    const skillCoinsUsed = this.skillSpending[skillName].coins;
    
    // Refund proportionally based on what was actually spent on this skill
    const totalSpentOnSkill = skillCreditsUsed + skillCoinsUsed;
    if (totalSpentOnSkill === 0) return; // Safety check
    
    const creditRatio = skillCreditsUsed / totalSpentOnSkill;
    const creditsToRefund = Math.min(cost, Math.floor(cost * creditRatio));
    const coinsToRefund = cost - creditsToRefund;
    
    this.skillLevels[skillName]--;
    this.usedCredits -= creditsToRefund;
    this.usedCoins -= coinsToRefund;
    this.skillSpending[skillName].credits -= creditsToRefund;
    this.skillSpending[skillName].coins -= coinsToRefund;
    
    this.updateSkillDisplay(skillName);
    this.updateDisplay();
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
  }

  resetSkills() {
    Object.keys(this.skillLevels).forEach(skill => {
      this.skillLevels[skill] = 0;
      this.skillSpending[skill] = { credits: 0, coins: 0 };
    });
    this.usedCoins = 0;
    this.usedCredits = 0;
    this.updateDisplay();
  }

  saveBuild() {
    const buildData = {
      totalCoins: this.totalCoins,
      totalCredits: this.totalCredits,
      skillLevels: { ...this.skillLevels },
      usedCoins: this.usedCoins,
      usedCredits: this.usedCredits,
      skillSpending: { ...this.skillSpending },
      timestamp: new Date().toISOString()
    };
    
    BuildManager.saveBuild(buildData);
  }

  loadBuild() {
    const buildDataString = document.getElementById('build-import').value.trim();
    const result = BuildManager.loadBuild(buildDataString);
    
    if (result.success) {
      this.totalCoins = result.data.totalCoins || 0;
      this.totalCredits = result.data.totalCredits || 0;
      this.skillLevels = { ...result.data.skillLevels };
      this.usedCoins = result.data.usedCoins || 0;
      this.usedCredits = result.data.usedCredits || 0;
      this.skillSpending = result.data.skillSpending || {};
      
      document.getElementById('total-coins').value = this.totalCoins;
      document.getElementById('total-credits').value = this.totalCredits;
      this.updateDisplay();
      
      const modal = bootstrap.Modal.getInstance(document.getElementById('load-build-modal'));
      modal.hide();
      document.getElementById('build-import').value = '';
      
      alert('Build loaded successfully!');
    } else {
      alert('Error loading build: ' + result.error);
    }
  }
}