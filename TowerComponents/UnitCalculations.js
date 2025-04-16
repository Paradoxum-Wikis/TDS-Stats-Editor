import Unit from './Unit.js';
import TowerData from './TowerData.js';
import UpgradeViewer from '../components/UpgradeViewer.js';

// probably will rework most of these "dynamic" calculations
let storedNetCosts = {
    base: TowerData.Pursuit.Default.Defaults.Price + 
          TowerData.Pursuit.Default.Upgrades.slice(0, 3).reduce((sum, upgrade) => sum + upgrade.Cost, 0),
    'Top 4': 0,
    'Top 5': 0,
    'Bottom 4': 0,
    'Bottom 5': 0,
};

class UnitCalculations {
    constructor(upgradeViewer) {
        this.upgradeViewer = upgradeViewer;
    }

    calculated = {
        DPS: {
            Default: {
                Requires: ['Damage', 'Cooldown'],
                Exclude: [],
                Value: (level) => {
                    const DPS = level.Damage / level.Cooldown;
                    return DPS === 0 ? NaN : DPS;
                },
            },

            Thorns: {
                For: ['Thorns 0', 'Thorns 1', 'Thorns 2', 'Thorns 3', 'Thorns 4', 'Thorns 5'],
                Value: (level) => level.Damage / level.TickRate,
            },

            Heatwave: {
                For: ['Heatwave 2', 'Heatwave 3', 'Heatwave 4'],
                Value: (level) => {
                    const cooldown = this.upgradeViewer.getAbilityCooldownValue(0); // extract cooldown from UpgradeViewer
                    return (level.Damage / cooldown) + (level.BurnDamage / level.TickRate);
                },
            },

            Commando: {
                For: ['Missile 1', 'Missile 2'],
                Value: (level) => {
                    const missileLevel = parseInt(level.Name.split(' ')[1]) - 1;
                    const cooldown = this.upgradeViewer.getAbilityCooldownValue(missileLevel);
                    return level.ExplosionDamage / cooldown;
                },
            },
            
            PursuitMissiles: {
                For: ['Top 4', 'Top 5', 'Bottom 4', 'Bottom 5'],
                Value: (level) => {
                    return (level.Damage * level.Ammo) / (level.ReloadTime + (level.Cooldown * level.Ammo));
                },
            },

            APC: {
                For: ['Missile APC'],
                Value: (level) => level.Damage * level.MissileAmount / level.Cooldown,
            },

            Spike: {
                For: ['Spike 0', 'Spike 1', 'Spike 2', 'Spike 3', 'Spike 4', 'Spike 5'],
                Value: (level) => level.Health / level.Cooldown,
            },

            Landmind: {
                For: ['Landmine 2', 'Landmine 3', 'Landmine 4', 'Landmine 5'],
                Value: (level) => {
                    const normalDPS = level.Damage / level.Cooldown;
                    const burnDPS = level.BurnDuration <= 1 
                        ? level.BurnDamage / level.Cooldown 
                        : level.BurnDamage / level.TickRate;

                    return normalDPS + burnDPS;
                },
            },
            
            ExecutionerSkeleton: {
                For: ['Executioner Skeleton' ],
                Value: (level) => level.Damage / level.TickRate / level.Cooldown,
            },

            Rocket: {
                For: ['War Machine Sentry'],
                Requires: ['Damage', 'Cooldown'],
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
                For: ['Rifleman1', 'Rifleman2', 'Rifleman3', 'Gunner Elf'],
                Requires: ['Damage', 'Cooldown', 'Burst', 'BurstCooldown'],
                Value: (level) => {
                    const totalDamage = level.Damage * level.Burst;
                    const aimTime = level.AimTime || 0;
                    const totalTime = (level.BurstCooldown + aimTime + (level.Burst * level.Cooldown));
            
                    return totalDamage / totalTime;
                },
            },

            PoisonBomb: {
                For: ['Poison Bomb 3', 'Poison Bomb 4'],
                Value: (level) => level.Damage / level.TickRate,
            },

            FireBomb: {
                For: ['Fire Bomb 0' , 'Fire Bomb 1', 'Fire Bomb 2', 'Fire Bomb 3', 'Fire Bomb 4'],
                Value: (level) => level.Damage / level.Cooldown + level.BurnDamage / level.TickRate,
            },

            Ivy: {
                For: ['Ivy 1', 'Ivy 2', 'Ivy 3', 'Ivy 4'],
                Requires: ['Damage', 'Cooldown', 'PoisonDamage'],
                Value: (level) => {
                    const directDPS = level.Damage / level.Cooldown;
                    const poisonDPS = (level.Attributes?.PoisonDamage && level.Attributes?.TickRate > 0)
                                      ? level.Attributes.PoisonDamage / level.Attributes.TickRate
                                      : 0;
                    return directDPS + poisonDPS;
                },
            },
        },

        TotalElapsedDamage: {
            Default: {
                Requires: ['BurnDamage', 'BurnTime', 'TickRate' ],
                Value: (level) => level.BurnDamage * level.BurnTime / level.TickRate,
            },
        },

        AggregateDPS: {
            Default: {
                Requires: ['DPS', 'Spawnrate'],
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
                Requires: ['Health', 'Spawnrate'],
                Value: (level) => {
                    return level.Health / level.Spawnrate;
                },
            },
        },

        // boosts
        Cooldown: {
            Type: 'Override',

            Default: {
                Requires: ['Cooldown'],
                Value: (cooldown) => {
                    const { extraCooldown, firerateBuff, RateOfFireBug } = window.state.boosts.unit; // prettier-ignore

                    return cooldown / (firerateBuff + 1) + extraCooldown + RateOfFireBug;
                },
            },
        },
        Damage: {
            Type: 'Override',

            Default: {
                Requires: ['Damage'],
                Value: (damage) => {
                    const { damageBuff } = window?.state?.boosts?.unit ?? 0; // prettier-ignore

                    return damage * (damageBuff + 1);
                },
            },
        },
        ExplosionDamage: {
            Type: 'Override',

            Default: {
                Requires: ['ExplosionDamage'],
                Value: (explosionDamage) => {
                    const { damageBuff } = window.state.boosts.unit; // prettier-ignore

                    return explosionDamage * (damageBuff + 1);
                },
            },
        },
        Range: {
            Type: 'Override',

            Default: {
                Requires: ['Range'],
                Value: (range) => {
                    const { rangeBuff } = window?.state?.boosts?.unit ?? 0; // prettier-ignore

                    return range * (rangeBuff + 1);
                },
            },
        },
        Health: {
            Type: 'Override',

            Default: {
                Requires: ['Health'],
                Value: (health) => {
                    const { healthBuff } = window?.state?.boosts?.unit ?? 0 // prettier-ignore

                    return health / (healthBuff + 1);
                },
            },
        },

        NetCost: {
            Pursuit: {
                For: ['Top 4', 'Top 5', 'Bottom 4', 'Bottom 5'],
                Value: (level) => {
                    let pursuitNetCost = TowerData.Pursuit.Default.Defaults.Price;

                    if (level === undefined) {
                        return pursuitNetCost + TowerData.Pursuit.Default.Upgrades.reduce((sum, upgrade) => sum + upgrade.Cost, 0);
                    }

                    const levelNum = parseInt(level.Name.split(' ')[1]) - 1;
                    
                    for (let i = 0; i < levelNum && i < TowerData.Pursuit.Default.Upgrades.length; i++) {
                        pursuitNetCost += TowerData.Pursuit.Default.Upgrades[i].Cost;
                    }
                    
                    switch (level.Name) {
                      case 'Top 4': {
                        storedNetCosts['Top 4'] = storedNetCosts.base + level.Cost;
                        return storedNetCosts['Top 4'];
                      }
                
                      case 'Top 5': {
                        storedNetCosts['Top 5'] = storedNetCosts['Top 4'] + level.Cost;
                        return storedNetCosts['Top 5'];
                      }
                
                      case 'Bottom 4': {
                        storedNetCosts['Bottom 4'] = storedNetCosts.base + level.Cost;
                        return storedNetCosts['Bottom 4'];
                      }
                
                      case 'Bottom 5': {
                        storedNetCosts['Bottom 5'] = storedNetCosts['Bottom 4'] + level.Cost;
                        return storedNetCosts['Bottom 5'];
                      }
                
                      default: {
                        return storedNetCosts.base + level.Cost;
                      }
                    }
                },
            },
        },

        MissileDPS: {
            Default: {
                Requires: ['ExplosionDamage', 'Cooldown'],
                Value: (level) => {
                    if (level.Cooldown === 0) {
                        return NaN;
                    }
                    return level.ExplosionDamage / level.TimeBetweenMissiles;
                },
            },
            Pursuit: {
                For: ['Top 4', 'Top 5', 'Bottom 4', 'Bottom 5'],
                Requires: ['ExplosionDamage', 'MissileCooldown', 'MissileAmount', 'TimeBetweenMissiles'],
                Value: (level) => (level.ExplosionDamage * level.MissileAmount) / (level.MissileCooldown + level.TimeBetweenMissiles * level.MissileAmount)
            },
            WarMachineSentry: {
                For: ['War Machine Sentry'],
                Value: (level) => level.ExplosionDamage * level.MissileAmount / level.BurstCooldown,
            }
        },

        CostEfficiency: {
            Pursuit: {
                For: ['Top 4', 'Top 5', 'Bottom 4', 'Bottom 5'],
                Requires: ['NetCost', 'DPS'],
                Value: (level) => {
                    const efficiency = level.NetCost / level.DPS;
                    return isFinite(efficiency) ? efficiency : NaN;
                },
            },

            Harvester: {
                For: ['Thorns 0', 'Thorns 1', 'Thorns 2', 'Thorns 3', 'Thorns 4', 'Thorns 5'],
                Value: (level) => {
                    // Extract the level number from the string
                    const levelNum = parseInt(level.Name.split(' ')[1]);
                    
                    // Base cost for level 0
                    let harvesterNetCost = TowerData.Harvester.Default.Defaults.Price;
                    
                    // Add costs for each upgrade up to the current level
                    for (let i = 0; i < levelNum; i++) {
                        harvesterNetCost += TowerData.Harvester.Default.Upgrades[i].Cost;
                    }
                    
                    const efficiency = harvesterNetCost / level.DPS;
                    return isFinite(efficiency) ? efficiency : NaN;
                },
            },

            Trapper: {
                For: ['Spike 0', 'Spike 1', 'Spike 2', 'Spike 3', 'Spike 4', 'Spike 5', 
                      'Landmine 2', 'Landmine 3', 'Landmine 4', 'Landmine 5',
                      'Bear Trap 4', 'Bear Trap 5'],
                Value: (level) => {
                    // get level number (regex for bear trap)
                    const match = level.Name.match(/(\d+)$/);
                    const trapperLevel = match ? parseInt(match[1]) : 0;
                    
                    let trapperNetCost = TowerData.Trapper.Default.Defaults.Price;
                    
                    for (let i = 0; i < trapperLevel && i < TowerData.Trapper.Default.Upgrades.length; i++) {
                        trapperNetCost += TowerData.Trapper.Default.Upgrades[i].Cost;
                    }
                    
                    const efficiency = trapperNetCost / level.DPS;
                    return isFinite(efficiency) ? efficiency : NaN;
                },
            },
        },

        HealPS: {
            Default: {
                Requires: ['Heal', 'Cooldown'],
                Value: (level) => {
                    const healdps = level.Heal / level.Cooldown;
                    return healdps === 0 ? NaN : healdps;
                },
        },
        },

        TotalDPS: {
            Default: {
                Requires: ['DPS', 'MissileDPS'],
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
        this.#add('TotalElapsedDamage', unitData);
        this.#add('MissileDPS', unitData);
        this.#add('DPS', unitData);
        this.#add('TotalDPS', unitData);

        this.#add('AggregateDPS', unitData);
        this.#add('HealPS', unitData);
        this.#add('RamDPS', unitData);

        this.#add('Health', unitData);
        this.#add('Damage', unitData);
        this.#add('Cooldown', unitData);
        this.#add('Range', unitData);
        this.#add('ExplosionDamage', unitData);
        
        this.#add('NetCost', unitData);
        this.#add('CostEfficiency', unitData);
    }
}

export default new UnitCalculations(new UpgradeViewer());