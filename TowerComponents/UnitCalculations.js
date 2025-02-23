import Unit from './Unit.js';
import TowerData from './TowerData.js';
import UpgradeViewer from '../components/UpgradeViewer.js';

class UnitCalculations {
    constructor(upgradeViewer) {
        this.upgradeViewer = upgradeViewer;
    }

    calculated = {
        DPS: {
            Default: {
                Requires: ['Damage', 'Cooldown'],
                Exclude: [],
                Value: (level) => level.Damage / level.Cooldown,
            },

            Thorns: {
                For: ['Thorns 0', 'Thorns 1', 'Thorns 2', 'Thorns 3', 'Thorns 4', 'Thorns 5'],
                Value: (level) => level.Damage / level.TickRate,
            },

            Heatwave: {
                For: ['Heatwave 2', 'Heatwave 3', 'Heatwave 4'],
                Value: (level) => {
                    const cooldown = this.upgradeViewer.cdTitleInput.value; // extract cooldown from UpgradeViewer
                    return (level.Damage / cooldown) + (level.BurnDamage / level.TickRate);
                },
            },
            
            Missiles: {
                For: ['Top 4', 'Top 5', 'Bottom 4', 'Bottom 5'],
                Value: (level) => {
                    let baseDamage = (level.Damage * level.Ammo) / (level.ReloadTime + (level.Cooldown * level.Ammo));
                    let explosionDamage = (level.ExplosionDamage && (level.MissileCooldown + level.BurstCooldown * level.MissileAmount) > 0)
                        ? ((level.ExplosionDamage * level.MissileAmount) / (level.MissileCooldown + level.BurstCooldown * level.MissileAmount))
                        : 0;
                    return baseDamage + explosionDamage;
                }
            },     

            ExecutionerSkeleton: {
                For: ['Executioner Skeleton' ],
                Value: (level) => level.Damage / level.TickRate / level.Cooldown,
            },

            Rocket: {
                For: ['War Machine Sentry', 'Tank', 'RailgunTank'],
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
                For: ['Rifleman1', 'Rifleman2', 'Rifleman3'],
                Requires: ['Damage', 'Cooldown', 'BurstAmount'],
                Value: (unit) => {
                    const damage = unit.Damage;
                    const burstAmount = unit.BurstAmount;

                    const cooldown = unit.Cooldown;
                    const burstCooldown = unit.BurstCooldown;

                    const totalDamage = damage * burstAmount;
                    const totalTime = cooldown * burstAmount + burstCooldown;
                    return totalDamage / totalTime;
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

                    const levelNum = parseInt(level.Name.split(' ')[1]) - 1; // Adjust for 0-based indexing
                    
                    for (let i = 0; i < levelNum && i < TowerData.Pursuit.Default.Upgrades.length; i++) {
                        pursuitNetCost += TowerData.Pursuit.Default.Upgrades[i].Cost;
                    }
                    
                    return pursuitNetCost + level.Cost;
                },
            },
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
        this.#add('DPS', unitData);
        this.#add('AggregateDPS', unitData);
        this.#add('RamDPS', unitData);

        this.#add('Health', unitData);
        this.#add('Damage', unitData);
        this.#add('Cooldown', unitData);
        this.#add('Range', unitData);
        
        this.#add('NetCost', unitData);
        this.#add('CostEfficiency', unitData);
    }
}

export default new UnitCalculations(new UpgradeViewer());