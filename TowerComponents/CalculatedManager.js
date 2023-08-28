import SkinData from './SkinData.js';
import UnitManager from './UnitManager.js';

class CalculatedManager {
    constructor() {
        this.unitManager = new UnitManager();
    }

    calculated = {
        LaserDPS: {
            Default: {
                For: ['Accelerator'],
                Requires: ['Damage', 'Cooldown'],
                Value: (level) => level.Damage / level.Cooldown,
            },
        },
        TowerDPS: {
            Default: {
                For: ['Engineer', 'Crook Boss'],
                Requires: ['Damage', 'Cooldown'],
                Value: (level) => level.Damage / level.Cooldown,
            },
        },
        RamDPS: {
            Default: {
                Exclude: ['Engineer'],
                Requires: ['UnitToSend', 'SpawnTime'],
                Value: (level) => {
                    if (!this.unitManager.hasUnit(level.UnitToSend)) return 0;
                    const unit = this.unitManager.unitData[level.UnitToSend];

                    return unit.Health / level.SpawnTime;
                },
            },
        },
        UnitDPS: {
            Default: {
                Requires: ['UnitToSend'],
                Value: (level) => {
                    if (!this.unitManager.hasUnit(level.UnitToSend)) return 0;

                    return (
                        this.unitManager.unitData[level.UnitToSend]?.DPS ?? 0
                    );
                },
            },
            Engineer: {
                For: ['Engineer'],
                Requires: ['UnitToSend', 'MaxUnits'],
                Value: (level) => {
                    if (!this.unitManager.hasUnit(level.UnitToSend)) return 0;

                    const unit = this.unitManager.unitData[level.UnitToSend];

                    return unit.DPS * level.MaxUnits;
                },
            },
            Crook: {
                For: ['Crook Boss'],
                Requires: ['UnitToSend', 'MaxCrooks'],
                Value: (level) => {
                    if (!this.unitManager.hasUnit(level.UnitToSend)) return 0;

                    const unit = this.unitManager.unitData[level.UnitToSend];

                    return unit.DPS * level.MaxCrooks;
                },
            },
        },
        LaserTime: {
            Default: {
                For: ['Accelerator'],
                Requires: ['MaxAmmo', 'LaserDPS'],
                Value: (level) => level.MaxAmmo / level.LaserDPS,
            },
        },

        DPS: {
            Default: {
                Requires: ['Damage', 'Cooldown'],
                Exclude: [
                    'Farm',
                    'DJ Booth',
                    'Elf Camp',
                    'Military Base',
                    'Mecha Base',
                ],
                Value: (level) => level.Damage / level.Cooldown,
            },
            Cowboy: {
                For: ['Cowboy'],
                Value: (level) => ((level.Damage * level.MaxAmmo) / (level.Cooldown * level.MaxAmmo + level.SpinDuration)), // prettier-ignore
            },
            Ace: {
                For: ['Ace Pilot'],
                Value: (level) => {
                    const dps = level.Damage / level.Cooldown;
                    const bombDps = level.BombDropping
                        ? level.ExplosionDamage / level.BombTime
                        : 0;

                    return dps + bombDps;
                },
            },
            Accel: {
                For: ['Accelerator'],
                Requires: ['MaxAmmo', 'ChargeTime', 'Cooldown', 'LaserTime'],
                Value: (level) => {
                    const totalDamage = level.MaxAmmo;

                    const burstCooldown = level.ChargeTime + level.Cooldown;

                    return totalDamage / (level.LaserTime + burstCooldown);
                },
            },
            BurnTower: {
                For: ['Archer, Pyromancer'],
                Requires: ['Damage', 'Cooldown', 'BurnDamage', 'BurnTick'],
                Value: (level) => {
                    const dps = level.Damage / level.Cooldown;
                    const burnDPS = level.BurnDamage / level.BurnTick;

                    return dps + burnDPS;
                },
            },
            MultiHit: {
                For: ['Electroshocker'],
                Requires: ['Damage', 'Cooldown', 'MaxHits'],
                Value: (level) => {
                    const dps = level.Damage / level.Cooldown;

                    return dps * level.MaxHits;
                },
            },
            Missiles: {
                For: ['Pursuit'],
                Requires: [
                    'Damage',
                    'Cooldown',
                    'MissilesEnabled',
                    'ExplosionDamage',
                    'MissileAmount',
                    'MissileCooldown',
                ],
                Value: (level) => {
                    const dps = level.Damage / level.Cooldown;
                    const missileDPS = level.MissilesEnabled
                        ? (level.ExplosionDamage * level.MissileAmount) /
                          level.MissileCooldown
                        : 0;

                    return dps + missileDPS;
                },
            },
            Swarmer: {
                For: ['Swarmer'],
                Value: (level) => {
                    const dps = level.Damage / level.Cooldown;
                    const beeDps = level.BeeDamage / level.TickRate;

                    return dps + beeDps;
                },
            },
            Burst: {
                For: ['Soldier'],
                Value: (level) => {
                    const totalDamage = level.Damage * level.Burst;
                    const totalTime =
                        level.Cooldown * level.Burst + level.BurstCool;

                    return totalDamage / totalTime;
                },
            },
            ToxicGunner: {
                For: ['Toxic Gunner'],
                Value: (level) => {
                    const totalDamage = level.Damage * level.Burst;
                    const totalTime =
                        level.Cooldown * level.Burst + level.ReloadSpeed * 0.12;

                    const burstDPS = totalDamage / totalTime;
                    const poisonDPS = level.PoisonDamage / level.PoisonTick;

                    return burstDPS + poisonDPS;
                },
            },
            WarMachine: {
                For: ['War Machine'],
                Value: (level) => {
                    const dps = level.Damage / level.Cooldown;
                    const missileDPS =
                        level.ExplosionDamage / level.MissileTime;

                    return dps + missileDPS;
                },
            },
            Shotgun: {
                For: ['Shotgunner'],
                Value: (level) => {
                    const dps = level.Damage / level.Cooldown;
                    return dps * level.ShotSize;
                },
            },
            Spawner: {
                For: ['Engineer', 'Crook Boss', 'Military Base', 'Mecha Base'],
                Value: (level) => {
                    const unitDPS = level.UnitDPS ?? 0;
                    const towerDPS = level.TowerDPS ?? 0;
                    const ramDPS = level.RamDPS ?? 0;

                    return unitDPS + towerDPS + ramDPS;
                },
            },
        },
        NetCost: {
            Default: {
                Value: (level) => (level.levels.levels.reduce(
					(total, nextLevel) => nextLevel.Level > level.Level? total: total + nextLevel.Cost, 0)), // prettier-ignore
            },
        },
        CostEfficiency: {
            Default: {
                Requires: ['NetCost', 'DPS'],
                Value: (level) => level.NetCost / level.DPS,
            },
        },
        IncomeFactor: {
            Default: {
                Requires: ['NetCost', 'DPS'],
                For: ['Cowboy'],
                Value: (level) => {
                    const damagePerCylinder = level.Damage * level.MaxAmmo;
                    return (
                        (level.Income + damagePerCylinder) / damagePerCylinder
                    );
                },
            },
        },
        IncomePerSecond: {
            Default: {
                Requires: ['Income', 'MaxAmmo', 'SpinDuration'],
                For: ['Cowboy'],
                Value: (level) =>
                    level.Income /
                    (level.Cooldown * level.MaxAmmo + level.SpinDuration),
            },
        },
        TotalIncomePerSecond: {
            Default: {
                Requires: ['IncomePerSecond', 'DPS'],
                For: ['Cowboy'],
                Value: (level) => level.IncomePerSecond + level.DPS,
            },
        },
        WavesUntilNetProfit: {
            Default: {
                Requires: ['Income', 'NetCost'],
                For: ['Farm'],
                Value: (level) => level.NetCost / level.Income,
            },
        },
        WavesUntilUpgradeProfit: {
            Default: {
                Requires: ['Income', 'NetCost'],
                For: ['Farm'],
                Value: (level) => {
                    const lastLevelIncome =
                        level.Level === 0
                            ? 0
                            : level.levels.levels[level.Level - 1].Income;
                    return level.Cost / (level.Income - lastLevelIncome);
                },
            },
        },
    };

    getValue(calculatedField, skinData) {
        for (let [_, value] of Object.entries(calculatedField)) {
            if (value?.For?.includes(skinData.tower.name)) return value;
        }

        return calculatedField.Default;
    }

    /**
     *
     * @param {SkinData} skinData
     */
    validate(calculatedField, skinData) {
        let valid = true;

        if (calculatedField.Exclude) {
            valid &= !calculatedField.Exclude.includes(skinData.tower.name);
        }
        if (calculatedField.Requires) {
            valid &= calculatedField.Requires.reduce((a, v) => {
                return a && skinData.levels.attributes.includes(v);
            }, true);
        }

        if (calculatedField.For) {
            valid &= calculatedField.For.includes(skinData.tower.name);
        }

        return valid;
    }

    /**
     * @param {SkinData} skinData
     */
    #add(name, skinData) {
        const dpsValue = this.getValue(this.calculated[name], skinData);
        if (this.validate(dpsValue, skinData))
            skinData.levels.addCalculated(name, dpsValue.Value);
    }

    addCalculate(skinData) {
        this.#add('LaserDPS', skinData);
        this.#add('TowerDPS', skinData);
        this.#add('UnitDPS', skinData);
        this.#add('RamDPS', skinData);
        this.#add('LaserTime', skinData);
        this.#add('DPS', skinData);
        this.#add('NetCost', skinData);
        this.#add('CostEfficiency', skinData);
        this.#add('IncomeFactor', skinData);
        this.#add('IncomePerSecond', skinData);
        this.#add('TotalIncomePerSecond', skinData);
        this.#add('WavesUntilNetProfit', skinData);
        this.#add('WavesUntilUpgradeProfit', skinData);
    }
}

export default new CalculatedManager();
