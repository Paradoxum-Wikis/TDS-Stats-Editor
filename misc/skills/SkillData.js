export const skillData = {
  Offensive: {
    "Enhanced Optics": {
      description: "Tower range is increased by X%",
      maxLevel: 20,
      costs: [20, 75, 150, 245, 360, 490, 645, 810, 995, 1190, 1405, 1635, 1875, 2135, 2405, 2685, 2985, 3295, 3615, 3955],
      prerequisites: [],
      effect: "0.5% range increase per level"
    },
    "Improved Gunpowder": {
      description: "AOE explosion radius is increased by X%",
      maxLevel: 25,
      costs: [15, 55, 105, 175, 255, 355, 460, 580, 710, 850, 1005, 1165, 1340, 1525, 1715, 1915, 2130, 2350, 2580, 2820, 3065, 3320, 3585, 3860, 4140],
      prerequisites: ["Enhanced Optics"],
      effect: "0.5% explosion radius increase per level"
    },
    "Fight Dirty": {
      description: "Debuff durations applied to enemies are increased by X%",
      maxLevel: 25,
      costs: [15, 60, 120, 200, 300, 410, 540, 685, 845, 1015, 1205, 1405, 1615, 1845, 2085, 2335, 2600, 2875, 3165, 3465, 3780, 4105, 4440, 4785, 5145],
      prerequisites: ["Improved Gunpowder"],
      effect: "1% debuff duration increase per level"
    },
    "Precision": {
      description: "Every X shots, towers deal a critical hit (1.25x damage)",
      maxLevel: 15,
      costs: [50, 215, 490, 880, 1385, 2010, 2750, 3610, 4590, 5685, 6900, 8240, 9695, 11275, 12975],
      prerequisites: ["Fight Dirty"],
      effect: "Critical hit every 29-X shots (decreases by 1 per level)"
    }
  },
  Economy: {
    "Resourcefulness": {
      description: "Selling towers returns X% more money",
      maxLevel: 25,
      costs: [10, 40, 75, 130, 190, 260, 340, 430, 530, 635, 750, 875, 1005, 1145, 1295, 1450, 1610, 1780, 1955, 2140, 2330, 2530, 2730, 2945, 3160],
      prerequisites: [],
      effect: "1.2% sell value increase per level"
    },
    "Bigger Budget": {
      description: "Starting cash is increased by X%",
      maxLevel: 25,
      costs: [10, 45, 90, 155, 235, 325, 430, 550, 680, 825, 980, 1145, 1325, 1520, 1720, 1935, 2165, 2400, 2650, 2910, 3180, 3460, 3750, 4050, 4365],
      prerequisites: ["Resourcefulness"],
      effect: "1% starting cash increase per level"
    },
    "Stonks": {
      description: "Wave rewards are increased by X%",
      maxLevel: 20,
      costs: [30, 110, 225, 375, 560, 775, 1020, 1295, 1595, 1925, 2280, 2660, 3070, 3500, 3960, 4440, 4950, 5480, 6030, 6610],
      prerequisites: ["Bigger Budget"],
      effect: "0.5% wave reward increase per level"
    },
    "Scavenger": {
      description: "Every X enemy kills grant 1.5x rewards from enemies",
      maxLevel: 20,
      costs: [35, 135, 290, 500, 760, 1065, 1420, 1820, 2270, 2760, 3300, 3880, 4505, 5170, 5880, 6635, 7430, 8265, 9140, 10060],
      prerequisites: ["Stonks"],
      effect: "Bonus every 29-X kills (decreases by 1 per level)"
    }
  },
  Strategy: {
    "Accelerator": {
      description: "Reduces cooldowns of active abilities by X%",
      maxLevel: 25,
      costs: [10, 40, 80, 135, 200, 275, 365, 460, 570, 685, 810, 945, 1090, 1240, 1405, 1575, 1750, 1940, 2135, 2335, 2545, 2765, 2990, 3225, 3465],
      prerequisites: [],
      effect: "0.5% cooldown reduction per level"
    },
    "Scholar": {
      description: "Logbook drop rate increases by X",
      maxLevel: 20,
      costs: [20, 65, 140, 240, 360, 505, 670, 855, 1060, 1285, 1530, 1795, 2075, 2380, 2700, 3040, 3395, 3770, 4160, 4570],
      prerequisites: ["Accelerator"],
      effect: "1.01x multiplier increasing by 0.01 per level"
    },
    "Expanded Barracks": {
      description: "Cooldown for spawning units is reduced by X%",
      maxLevel: 20,
      costs: [30, 100, 215, 370, 560, 785, 1045, 1340, 1670, 2030, 2420, 2850, 3305, 3795, 4315, 4865, 5445, 6055, 6695, 7365],
      prerequisites: ["Accelerator"],
      effect: "0.75% spawn cooldown reduction per level"
    },
    "Re-enforcements": {
      description: "Increases the tower placement limit by X",
      maxLevel: 10,
      costs: [1000, 2830, 5195, 8000, 11180, 14695, 18520, 22625, 27000, 31620],
      prerequisites: ["Expanded Barracks"],
      effect: "1 placement limit increase per level (scales with players)"
    }
  },
  Defense: {
    "Fortify": {
      description: "Increases the player's health pool by X",
      maxLevel: 40,
      costs: [5, 10, 20, 30, 45, 55, 70, 85, 100, 115, 135, 150, 170, 185, 205, 225, 245, 265, 285, 310, 330, 350, 375, 400, 420, 445, 470, 495, 520, 545, 570, 595, 620, 650, 675, 700, 730, 755, 785, 815],
      prerequisites: [],
      effect: "5 health increase per level"
    },
    "Over-Heal": {
      description: "Increases how much extra HP can be kept from over-healing by X",
      maxLevel: 25,
      costs: [15, 50, 100, 160, 235, 325, 420, 530, 645, 775, 910, 1055, 1205, 1370, 1540, 1720, 1905, 2100, 2300, 2510, 2730, 2955, 3185, 3425, 3670],
      prerequisites: ["Fortify"],
      effect: "8 over-heal capacity increase per level"
    },
    "Bandages": {
      description: "Regenerates X health at the start of every wave",
      maxLevel: 25,
      costs: [15, 50, 100, 160, 235, 325, 420, 530, 645, 775, 910, 1055, 1205, 1370, 1540, 1720, 1905, 2100, 2300, 2510, 2730, 2955, 3185, 3425, 3670],
      prerequisites: ["Over-Heal"],
      effect: "1 health regeneration per level"
    },
    "Extreme Conditioning": {
      description: "Reduces stun and debuff durations from enemies by X%",
      maxLevel: 25,
      costs: [15, 55, 105, 175, 255, 355, 460, 580, 710, 850, 1005, 1165, 1340, 1525, 1715, 1915, 2130, 2350, 2580, 2820, 3065, 3320, 3585, 3860, 4140],
      prerequisites: ["Bandages"],
      effect: "0.8% debuff duration reduction per level"
    },
    "Beefed Up Minions": {
      description: "Health of summoned units is increased by X%",
      maxLevel: 25,
      costs: [20, 65, 130, 210, 305, 410, 535, 665, 815, 970, 1140, 1320, 1510, 1710, 1920, 2140, 2370, 2605, 2855, 3110, 3375, 3650, 3935, 4225, 4525],
      prerequisites: ["Extreme Conditioning"],
      effect: "0.6% unit health increase per level"
    }
  }
};

export const skillImages = {
  "Enhanced Optics": "EnhancedOpticsSkill.png",
  "Improved Gunpowder": "ImprovedGunpowderSkill.png",
  "Fight Dirty": "FightDirtySkill.png",
  "Precision": "PrecisionSkill.png",
  "Resourcefulness": "ResourcefulnessSkill.png",
  "Bigger Budget": "BiggerBudgetSkill.png",
  "Stonks": "StonksSkill.png",
  "Scavenger": "ScavengerSkill.png",
  "Accelerator": "AcceleratorSkill.png",
  "Scholar": "ScholarSkill.png",
  "Expanded Barracks": "ExpandedBarracksSkill.png",
  "Re-enforcements": "Re-enforcementsSkill.png",
  "Fortify": "FortifySkill.png",
  "Over-Heal": "Over-HealSkill.png",
  "Bandages": "BandagesSkill.png",
  "Extreme Conditioning": "ExtremeConditioningSkill.png",
  "Beefed Up Minions": "BeefedUpMinionsSkill.png"
};