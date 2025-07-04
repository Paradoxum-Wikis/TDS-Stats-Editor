import Unit from "./Unit.js";
import TowerData from "./TowerData.js";
import UpgradeViewer from "../components/UpgradeViewer.js";
import UnitData from "./UnitData.js";
import { towerRegistry, TowerRegistry } from "./TowerRegistry.js";

class UnitCalculations {
  constructor(upgradeViewer) {
    this.upgradeViewer = upgradeViewer;
    document.addEventListener("towerDataChanged", () => {
      this.refreshCalculations();
    });
  }

  refreshCalculations() {
    // this will be called when tower data changes
    TowerRegistry.log("Refreshing unit calculations due to tower data change");

    // if there's a viewerInstance with a unitTable, reload it
    if (window.viewerInstance && window.viewerInstance.unitTable) {
      TowerRegistry.log("Reloading unit table");
      window.viewerInstance.unitTable.loadTable();
    }
  }

  getTowerCostForLevel(towerName, level) {
    TowerRegistry.log(
      `getTowerCostForLevel called for ${towerName}, level ${level}`,
    );

    // get data from the registry
    const registryPrice = towerRegistry.getTowerCostForLevel(towerName, level);
    if (registryPrice !== null) {
      TowerRegistry.log(`Found tower in registry, price: ${registryPrice}`);
      return registryPrice;
    }

    const towerData = TowerData[towerName];
    if (!towerData) {
      TowerRegistry.log(`No tower data found for ${towerName}`);
      return null;
    }

    let price = towerData.Default.Defaults.Price;
    TowerRegistry.log(`Using ${towerName} base price: ${price}`);

    // add costs for upgrades up to the level
    for (let i = 0; i < level && i < towerData.Default.Upgrades.length; i++) {
      price += towerData.Default.Upgrades[i].Cost;
      TowerRegistry.log(
        `After adding ${towerName} level ${i + 1} cost: ${price}`,
      );
    }

    return price;
  }

  calculated = {
    DPS: {
      Default: {
        Requires: ["Damage", "Cooldown"],
        Exclude: [],
        Value: (level) => {
          const DPS = level.Damage / level.Cooldown;
          return DPS === 0 ? NaN : DPS;
        },
      },

      Thorns: {
        For: [
          "Thorns 0",
          "Thorns 1",
          "Thorns 2",
          "Thorns 3",
          "Thorns 4",
          "Thorns 5",
        ],
        Value: (level) => level.Damage / level.TickRate,
      },

      Heatwave: {
        For: ["Heatwave 2", "Heatwave 3", "Heatwave 4"],
        Value: (level) => {
          const cooldown = this.upgradeViewer.getAbilityCooldownValue(0);
          return level.Damage / cooldown + level.BurnDamage / level.TickRate;
        },
      },

      Commando: {
        For: ["Missile 1", "Missile 2"],
        Value: (level) => {
          const missileLevel = parseInt(level.Name.split(" ")[1]) - 1;
          const cooldown =
            this.upgradeViewer.getAbilityCooldownValue(missileLevel);
          return level.ExplosionDamage / cooldown;
        },
      },

      PursuitMissiles: {
        For: ["Top 4", "Top 5", "Bottom 4", "Bottom 5"],
        Value: (level) => {
          return (
            (level.Damage * level.Ammo) /
            (level.ReloadTime + level.Cooldown * level.Ammo)
          );
        },
      },

      APC: {
        For: ["Missile APC"],
        Value: (level) => (level.Damage * level.MissileAmount) / level.Cooldown,
      },

      Spike: {
        For: ["Spike 0", "Spike 1", "Spike 2", "Spike 3", "Spike 4", "Spike 5"],
        Value: (level) => level.Health / level.Cooldown,
      },

      Landmind: {
        For: ["Landmine 2", "Landmine 3", "Landmine 4", "Landmine 5"],
        Value: (level) => {
          const normalDPS = level.Damage / level.Cooldown;
          const burnDPS =
            level.BurnDuration <= 1
              ? level.BurnDamage / level.Cooldown
              : level.BurnDamage / level.TickRate;

          return normalDPS + burnDPS;
        },
      },

      ExecutionerSkeleton: {
        For: ["Executioner Skeleton"],
        Value: (level) => level.Damage / level.TickRate / level.Cooldown,
      },

      Rocket: {
        For: ["War Machine Sentry"],
        Requires: ["Damage", "Cooldown"],
        Value: (unit) => {
          const damage = unit?.Damage ?? 0;
          const cooldown = unit?.Cooldown ?? 0;
          const baseDPS = cooldown > 0 ? damage / cooldown : 0;

          const missileAmount = unit?.MissileAmount ?? 1;
          const missileCooldown = unit?.TimeBetweenMissiles ?? 0;
          const missileDamage = unit?.ExplosionDamage ?? 0;

          const missileDPS =
            missileCooldown > 0
              ? (missileAmount * missileDamage) / missileCooldown
              : 0;

          return baseDPS + missileDPS;
        },
      },

      Burst: {
        For: ["Rifleman 0", "Rifleman 1", "Rifleman 2", "Gunner Elf"],
        Requires: ["Damage", "Cooldown", "Burst", "BurstCooldown"],
        Value: (level) => {
          const totalDamage = level.Damage * level.Burst;
          const aimTime = level.AimTime || 0;
          const totalTime =
            level.BurstCooldown + aimTime + level.Burst * level.Cooldown;

          return totalDamage / totalTime;
        },
      },

      PoisonBomb: {
        For: ["Poison Bomb 3", "Poison Bomb 4"],
        Value: (level) => level.Damage / level.TickRate,
      },

      FireBomb: {
        For: [
          "Fire Bomb 0",
          "Fire Bomb 1",
          "Fire Bomb 2",
          "Fire Bomb 3",
          "Fire Bomb 4",
        ],
        Value: (level) =>
          level.Damage / level.Cooldown + level.BurnDamage / level.TickRate,
      },

      Ivy: {
        For: ["Ivy 1", "Ivy 2", "Ivy 3", "Ivy 4"],
        Requires: ["Damage", "Cooldown", "PoisonDamage", "TickRate"],
        Value: (level) => {
          const directDPS = level.Damage / level.Cooldown;
          const poisonDPS =
            level.PoisonDamage && level.TickRate > 0
              ? level.PoisonDamage / level.TickRate
              : 0;
          return directDPS + poisonDPS;
        },
      },
    },

    TotalElapsedDamage: {
      Default: {
        Requires: ["BurnDamage", "BurnTime", "TickRate"],
        Value: (level) => (level.BurnDamage * level.BurnTime) / level.TickRate,
      },
    },

    AggregateDPS: {
      Default: {
        Requires: ["DPS", "Spawnrate"],
        Value: (level) => {
          let damage = 0;
          let remainingTime = 60;

          if (level.Spawnrate <= 0.1) {
            return Infinity;
          }

          while (remainingTime > 0) {
            damage += level.DPS * remainingTime;

            remainingTime -= level.Spawnrate;
          }

          return damage / 60;
        },
      },
    },
    RamDPS: {
      Default: {
        Exclude: [
          "Sunflower 0",
          "Sunflower 1",
          "Sunflower 2",
          "Sunflower 3",
          "Sunflower 4",
          "Ivy 1",
          "Ivy 2",
          "Ivy 3",
          "Ivy 4",
          "Nightshade 3",
          "Nightshade 4",
        ],
        Requires: ["Health", "Spawnrate"],
        Value: (level) => {
          return level.Health / level.Spawnrate;
        },
      },
    },

    // boosts
    Cooldown: {
      Type: "Override",

      Default: {
        Requires: ["Cooldown"],
        Value: (cooldown) => {
          const { extraCooldown, firerateBuff, RateOfFireBug } =
            window.state.boosts.unit;

          return cooldown / (firerateBuff + 1) + extraCooldown + RateOfFireBug;
        },
      },
    },
    Damage: {
      Type: "Override",

      Default: {
        Requires: ["Damage"],
        Value: (damage) => {
          const { damageBuff } = window?.state?.boosts?.unit ?? 0;

          return damage * (damageBuff + 1);
        },
      },
    },
    ExplosionDamage: {
      Type: "Override",

      Default: {
        Requires: ["ExplosionDamage"],
        Value: (explosionDamage) => {
          const { damageBuff } = window.state.boosts.unit;

          return explosionDamage * (damageBuff + 1);
        },
      },
    },
    Range: {
      Type: "Override",

      Default: {
        Requires: ["Range"],
        Value: (range) => {
          const { rangeBuff } = window?.state?.boosts?.unit ?? 0;

          return range * (rangeBuff + 1);
        },
      },
    },
    Health: {
      Type: "Override",

      Default: {
        Requires: ["Health"],
        Value: (health) => {
          const { healthBuff } = window?.state?.boosts?.unit ?? 0;

          return health / (healthBuff + 1);
        },
      },
    },

    NetCost: {
      Pursuit: {
        For: ["Top 4", "Top 5", "Bottom 4", "Bottom 5"],
        Value: (level) => {
          // 'level' here is the Unit object for 'Top 4', 'Top 5', etc.
          TowerRegistry.log(`Calculating NetCost for Pursuit ${level.Name}`);

          // parse the path and level from the Unit name
          const [path, levelStr] = level.Name.split(" ");
          const pathLevel = parseInt(levelStr);
          TowerRegistry.log(`Path: ${path}, Level: ${pathLevel}`);

          // get cumulative cost for base tower (up to level 3)
          const baseCost = this.getTowerCostForLevel("Pursuit", 3);
          if (baseCost === null) {
            console.error(
              `Could not determine base cost for Pursuit up to level 3.`,
            );
            return NaN;
          }
          TowerRegistry.log(`Using base cost (level 3): ${baseCost}`);
          let totalCost = baseCost;

          // get the cost of the current path level upgrade (e.g., Cost of 'Top 4' unit)
          const currentPathLevelCost = level.Cost || 0;
          TowerRegistry.log(
            `Cost of current path level (${level.Name}): ${currentPathLevelCost}`,
          );

          if (pathLevel === 4) {
            // for level 4, add its own cost to the base cost
            totalCost += currentPathLevelCost;
            TowerRegistry.log(
              `Added level 4 path cost: ${currentPathLevelCost}`,
            );
          } else if (pathLevel === 5) {
            // for level 5, we need the cost of level 4 path + cost of level 5 path
            const level4PathName = `${path} 4`;

            // get the cost of the level 4 path upgrade from UnitData
            const level4PathCost = UnitData[level4PathName]?.Cost || 0;
            if (level4PathCost === 0) {
              console.warn(
                `[WARN] Could not find cost for prerequisite path level: ${level4PathName}`,
              );
            }
            TowerRegistry.log(
              `Cost of prerequisite path level (${level4PathName}): ${level4PathCost}`,
            );

            // add both level 4 and level 5 path costs to the base cost
            totalCost += level4PathCost + currentPathLevelCost;
            TowerRegistry.log(
              `Added level 4 path cost (${level4PathCost}) and level 5 path cost (${currentPathLevelCost})`,
            );
          }

          TowerRegistry.log(`Final NetCost for ${level.Name}: ${totalCost}`);
          return totalCost;
        },
      },

      Hacker: {
        For: ["5T", "5B"],
        Value: (level) => {
          TowerRegistry.log(`Calculating NetCost for Hacker ${level.Name}`);

          const baseCost = this.getTowerCostForLevel("Hacker", 4);
          if (baseCost === null) {
            console.error(
              `Could not determine base cost for Hacker up to level 4.`,
            );
            return NaN;
          }
          TowerRegistry.log(`Using base cost (level 4): ${baseCost}`);

          const currentPathLevelCost = level.Cost || 0;
          TowerRegistry.log(
            `Cost of current path level (${level.Name}): ${currentPathLevelCost}`,
          );

          const totalCost = baseCost + currentPathLevelCost;
          TowerRegistry.log(`Final NetCost for ${level.Name}: ${totalCost}`);
          return totalCost;
        },
      },
    },

    MissileDPS: {
      Default: {
        Requires: ["ExplosionDamage", "Cooldown"],
        Value: (level) => {
          if (level.Cooldown === 0) {
            return NaN;
          }
          return level.ExplosionDamage / level.TimeBetweenMissiles;
        },
      },
      Pursuit: {
        For: ["Top 4", "Top 5", "Bottom 4", "Bottom 5"],
        Requires: [
          "ExplosionDamage",
          "MissileCooldown",
          "MissileAmount",
          "TimeBetweenMissiles",
        ],
        Value: (level) =>
          (level.ExplosionDamage * level.MissileAmount) /
          (level.MissileCooldown +
            level.TimeBetweenMissiles * level.MissileAmount),
      },
      WarMachineSentry: {
        For: ["War Machine Sentry"],
        Value: (level) =>
          (level.ExplosionDamage * level.MissileAmount) / level.BurstCooldown,
      },
    },

    CostEfficiency: {
      Default: {
        Requires: ["NetCost", "DPS"],
        Value: (level) => {
          const efficiency = level.NetCost / level.DPS;
          return isFinite(efficiency) ? efficiency : NaN;
        },
      },

      Pursuit: {
        For: ["Top 4", "Top 5", "Bottom 4", "Bottom 5"],
        Requires: ["NetCost", "TotalDPS"],
        Value: (level) => {
          const efficiency = level.NetCost / level.TotalDPS;
          return isFinite(efficiency) ? efficiency : NaN;
        },
      },

      Harvester: {
        For: [
          "Thorns 0",
          "Thorns 1",
          "Thorns 2",
          "Thorns 3",
          "Thorns 4",
          "Thorns 5",
        ],
        Value: (level) => {
          const levelNum = parseInt(level.Name.split(" ")[1]);
          TowerRegistry.log(
            `Calculating CostEfficiency for Harvester level ${levelNum}`,
          );

          const harvesterNetCost = this.getTowerCostForLevel(
            "Harvester",
            levelNum,
          );
          TowerRegistry.log(`Harvester cost: ${harvesterNetCost}`);

          const efficiency = harvesterNetCost / level.DPS;
          TowerRegistry.log(
            `Calculated efficiency: ${efficiency} (Cost: ${harvesterNetCost}, DPS: ${level.DPS})`,
          );
          return isFinite(efficiency) ? efficiency : NaN;
        },
      },

      Biologist: {
        For: [
          "Sunflower 0",
          "Sunflower 1",
          "Sunflower 2",
          "Sunflower 3",
          "Sunflower 4",
          "Ivy 1",
          "Ivy 2",
          "Ivy 3",
          "Ivy 4",
          "Nightshade 3",
          "Nightshade 4",
        ],
        Requires: ["DPS"],
        Value: (level) => {
          const match = level.Name.match(/(\d+)$/);
          const towerLevelNum = match ? parseInt(match[1]) : 0;
          TowerRegistry.log(
            `Calculating CostEfficiency for Biologist unit ${level.Name}`,
          );

          const biologistNetCost = this.getTowerCostForLevel(
            "Biologist",
            towerLevelNum,
          );
          if (biologistNetCost === null) {
            console.error(`Could not determine NetCost for ${level.Name}`);
            return NaN;
          }

          const efficiency = biologistNetCost / level.DPS;
          TowerRegistry.log(
            `Calculated efficiency: ${efficiency} for ${level.Name}`,
          );
          return isFinite(efficiency) ? efficiency : NaN;
        },
      },

      Trapper: {
        For: [
          "Spike 0",
          "Spike 1",
          "Spike 2",
          "Spike 3",
          "Spike 4",
          "Spike 5",
          "Landmine 2",
          "Landmine 3",
          "Landmine 4",
          "Landmine 5",
          "Bear Trap 4",
          "Bear Trap 5",
        ],
        Value: (level) => {
          // get level number (regex for bear trap)
          const match = level.Name.match(/(\d+)$/);
          const trapperLevel = match ? parseInt(match[1]) : 0;

          // Get trapper cost
          const trapperNetCost = this.getTowerCostForLevel(
            "Trapper",
            trapperLevel,
          );

          const efficiency = trapperNetCost / level.DPS;
          return isFinite(efficiency) ? efficiency : NaN;
        },
      },
    },

    MaxCostEfficiency: {
      Biologist: {
        For: [
          "Sunflower 0",
          "Sunflower 1",
          "Sunflower 2",
          "Sunflower 3",
          "Sunflower 4",
          "Ivy 1",
          "Ivy 2",
          "Ivy 3",
          "Ivy 4",
          "Nightshade 3",
          "Nightshade 4",
        ],
        Requires: ["CostEfficiency"],
        Value: (level) => {
          if (isNaN(level.CostEfficiency)) return NaN;

          const match = level.Name.match(/(\d+)$/);
          const towerLevelNum = match ? parseInt(match[1]) : 0;
          const biologistData =
            towerRegistry.getTower("Biologist") || TowerData.Biologist;
          if (!biologistData?.Biologist?.Default) return level.CostEfficiency;

          let source = null;

          // for levels 1-5, check the specific upgrade attributes
          if (towerLevelNum > 0) {
            const upgrade =
              biologistData.Biologist.Default.Upgrades?.[towerLevelNum - 1];
            if (upgrade?.Stats?.Attributes) {
              source = upgrade.Stats.Attributes;
            }
          }

          // count queues
          let queueCount = 0;
          if (source) {
            if (source.Queue1 && source.Queue1 !== "NaN") queueCount++;
            if (source.Queue2 && source.Queue2 !== "NaN") queueCount++;
            if (source.Queue3 && source.Queue3 !== "NaN") queueCount++;
          }

          if (queueCount > 0) {
            TowerRegistry.log(
              `${level.Name}: ${queueCount} queues found, efficiency divided by ${queueCount}`,
            );
            return level.CostEfficiency / queueCount;
          }

          return level.CostEfficiency;
        },
      },
    },

    HealPS: {
      Default: {
        Requires: ["Heal", "Cooldown"],
        Value: (level) => {
          const healdps = level.Heal / level.Cooldown;
          return healdps === 0 ? NaN : healdps;
        },
      },
    },

    TotalDPS: {
      Default: {
        Requires: ["DPS", "MissileDPS"],
        Value: (level) => {
          const unitDPS = level.DPS;
          const missileDPS = isNaN(level.MissileDPS) ? 0 : level.MissileDPS;
          return unitDPS + missileDPS;
        },
      },
    },
  };

  /**
   *
   * @param {Unit} unitData
   */
  validate(calculatedField, unitData) {
    let valid = true;

    if (calculatedField.Exclude) {
      valid &= !calculatedField.Exclude.includes(unitData.name);
    }
    if (calculatedField.Requires) {
      valid &= calculatedField.Requires.reduce((a, v) => {
        return a && unitData.attributeNames.includes(v);
      }, true);
    }

    if (calculatedField.For) {
      valid &= calculatedField.For.includes(unitData.name);
    }

    return valid;
  }

  /**
   * @param {Unit} unitData
   */
  getValue(calculatedField, unitData) {
    if (!calculatedField) return null;
    for (let [_, value] of Object.entries(calculatedField)) {
      if (value?.For?.includes(unitData.name)) return value;
    }
    return calculatedField.Default ?? null;
  }

  /**
   * @param {Unit} unitData
   */
  #add(name, unitData) {
    const calculated = this.getValue(this.calculated[name], unitData);
    if (calculated && this.validate(calculated, unitData)) {
      unitData.addCalculated(name, calculated.Value);
    }
  }

  addCalculate(unitData) {
    this.#add("TotalElapsedDamage", unitData);
    this.#add("MissileDPS", unitData);
    this.#add("DPS", unitData);
    this.#add("TotalDPS", unitData);

    this.#add("AggregateDPS", unitData);
    this.#add("HealPS", unitData);
    this.#add("RamDPS", unitData);

    this.#add("Health", unitData);
    this.#add("Damage", unitData);
    this.#add("Cooldown", unitData);
    this.#add("Range", unitData);
    this.#add("ExplosionDamage", unitData);

    this.#add("NetCost", unitData);
    this.#add("CostEfficiency", unitData);
    this.#add("MaxCostEfficiency", unitData);
  }
}

const unitCalculations = new UnitCalculations(new UpgradeViewer());
export default unitCalculations;
