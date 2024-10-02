import SkinData from './SkinData.js';
import UnitManager from './UnitManager.js';

class CalculatedManager {
    constructor(unitKey) {
        this.unitManager = new UnitManager(unitKey);
        this.unitManager.load();
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
                For: ['Engineer'],
                Requires: ['Damage', 'Cooldown'],
                Value: (level) => level.Damage / level.Cooldown,
            },
            Crook: {
                For: ['Crook Boss'],
                Requires: [
                    'Damage',
                    'Cooldown',
                    'PistolCrookSpawnTime',
                    'TommyCrookSpawnTime',
                    'BackupCallTime',
                ],
                Value: (level) => {
                    const pistolDelayPerMinute =
                        level.PistolCrookSpawnTime > 0
                            ? level.BackupCallTime *
                              (60 / level.PistolCrookSpawnTime)
                            : 0;
                    const tommyDelayPerMinute =
                        level.TommyCrookSpawnTime > 0
                            ? level.BackupCallTime *
                              (60 / level.TommyCrookSpawnTime)
                            : 0;

                    const dpm =
                        (level.Damage *
                            (60 - pistolDelayPerMinute - tommyDelayPerMinute)) /
                        level.Cooldown;

                    return dpm / 60;
                },
            },
        },
        RamDPS: {
            Default: {
                Exclude: ['Engineer'],
                Requires: ['UnitToSend', 'SpawnTime'],
                Value: (level) => {
                    this.unitManager.load();

                    if (!this.unitManager.hasUnit(level.UnitToSend)) return 0;
                    const unit = this.unitManager.unitData[level.UnitToSend];

                    return unit.attributes.Health / level.SpawnTime;
                },
            },
            Crook: {
                For: ['Crook Boss'],
                Requires: [
                    'PistolCrookSpawnTime',
                    'DoublePistolCrooks',
                    'TommyCrookSpawnTime',
                    'TommyDrum',
                ],
                Value: (level) => {
                    const skin = level.levels.skinData.name;
                    this.unitManager.load();

                    const goldText = skin == 'Golden' ? 'Golden' : '';
                    const goon1 = this.unitManager.unitData[`${goldText}Goon1`];
                    const goon2 = this.unitManager.unitData[`${goldText}Goon2`];
                    const goon3 = this.unitManager.unitData[`${goldText}Goon3`];

                    let goon1Ram =
                        level.PistolCrookSpawnTime &&
                        goon1.attributes.Health / level.PistolCrookSpawnTime;
                    if (level.DoublePistolCrooks) goon1Ram *= 2;

                    let goon2Ram =
                        level.TommyCrookSpawnTime &&
                        goon2.attributes.Health / level.TommyCrookSpawnTime;
                    if (level.TommyDrum)
                        goon2Ram =
                            goon3.attributes.Health / level.TommyCrookSpawnTime;

                    return goon1Ram + goon2Ram;
                },
            },
        },
        UnitDPS: {
            Default: {
                Requires: ['UnitToSend'],
                Value: (level) => {
                    this.unitManager.load();

                    const unitName = level.UnitToSend;
                    if (!this.unitManager.hasUnit(unitName)) return 0;

                    const unitData = this.unitManager.unitData[unitName];

                    return unitData.attributes.DPS;
                },
            },
            Engineer: {
                For: ['Engineer'],
                Requires: ['UnitToSend', 'MaxUnits'],
                Value: (level) => {
                    this.unitManager.load();
                    if (!this.unitManager.hasUnit(level.UnitToSend)) return 0;

                    const unit = this.unitManager.unitData[level.UnitToSend];

                    return unit.attributes.DPS * level.MaxUnits;
                },
            },
            Crook: {
                For: ['Crook Boss'],
                Requires: [
                    'PistolCrookSpawnTime',
                    'DoublePistolCrooks',
                    'TommyCrookSpawnTime',
                    'TommyDrum',
                ],
                Value: (level) => {
                    const skin = level.levels.skinData.name;
                    this.unitManager.load();

                    const goldText = skin == 'Golden' ? 'Golden' : '';
                    const goon1 = this.unitManager.unitData[`${goldText}Goon1`];
                    const goon2 = this.unitManager.unitData[`${goldText}Goon2`];
                    const goon3 = this.unitManager.unitData[`${goldText}Goon3`];

                    let goon1DPS =
                        level.PistolCrookSpawnTime && goon1.attributes.DPS;
                    if (level.DoublePistolCrooks) goon1DPS *= 2;

                    let goon2DPS =
                        level.TommyCrookSpawnTime && goon2.attributes.DPS;
                    if (level.TommyDrum) goon2DPS = goon3.attributes.DPS;

                    return goon1DPS + goon2DPS;
                },
            },
        },
        AggregateUnitDPS: {
            Default: {
                Requires: ['UnitDPS', 'SpawnTime'],
                Value: (level) => {
                    let damage = 0;
                    let remainingTime = 60;

                    if (level.SpawnTime <= 0.1) {
                        return Infinity;
                    }

                    while (remainingTime > 0) {
                        damage += level.UnitDPS * remainingTime;

                        remainingTime -= level.SpawnTime;
                    }

                    return damage / 60;
                },
            },
            Crook: {
                For: ['Crook Boss'],
                Requires: [
                    'PistolCrookSpawnTime',
                    'TommyCrookSpawnTime',
                    'DoublePistolCrooks',
                    'TommyDrum',
                ],
                Value: (level) => {
                    const skin = level.levels.skinData.name;
                    this.unitManager.load();

                    const goldText = skin == 'Golden' ? 'Golden' : '';
                    const goon1 = this.unitManager.unitData[`${goldText}Goon1`];
                    const goon2 = this.unitManager.unitData[`${goldText}Goon2`];
                    const goon3 = this.unitManager.unitData[`${goldText}Goon3`];

                    let goon1DPS =
                        level.PistolCrookSpawnTime && goon1.attributes.DPS;
                    if (level.DoublePistolCrooks) goon1DPS *= 2;

                    let goon2DPS =
                        level.TommyCrookSpawnTime && goon2.attributes.DPS;
                    if (level.TommyDrum) goon2DPS = goon3.attributes.DPS;

                    let damage = 0;
                    let remainingTime = 60;

                    if (level.PistolCrookSpawnTime > 0.1) {
                        while (remainingTime > 0) {
                            damage += goon1DPS * remainingTime;

                            remainingTime -= level.PistolCrookSpawnTime;
                        }
                    }

                    remainingTime = 60;

                    if (level.TommyCrookSpawnTime > 0.1) {
                        while (remainingTime > 0) {
                            damage += goon2DPS * remainingTime;

                            remainingTime -= level.TommyCrookSpawnTime;
                        }
                    }

                    return damage / 60;
                },
            },
        },
        SpikeDPS: {
            Default: {
                For: ['Trapper'],

                Value: (level) => {
                    const damage =
                        level.levels.getCell(
                            level.Level,
                            'Traps.Spike.Damage'
                        ) ?? 0;

                    const cooldown = level.levels.getCell(
                        level.Level,
                        'Traps.Spike.Cooldown'
                    );

                    return damage / cooldown;
                },
            },
        },
        SpikeMaxPileDamage: {
            Default: {
                For: ['Trapper'],

                Value: (level) => {
                    const damage = level.levels.getCell(
                        level.Level,
                        'Traps.Spike.Damage'
                    );

                    return damage * level.MaxTraps;
                },
            },
        },
        LandmineDPS: {
            Default: {
                For: ['Trapper'],

                Value: (level) => {
                    const damage = level.levels.getCell(
                        level.Level,
                        'Traps.Landmine.Damage'
                    );

                    const burnDamage = level.levels.getCell(
                        level.Level,
                        'Traps.Landmine.BurnDamage'
                    );

                    const burnTime = level.levels.getCell(
                        level.Level,
                        'Traps.Landmine.BurnTime'
                    );

                    const burnTick = level.levels.getCell(
                        level.Level,
                        'Traps.Landmine.BurnTick'
                    );

                    const cooldown = level.levels.getCell(
                        level.Level,
                        'Traps.Landmine.Cooldown'
                    );

                    const burnDPS = (burnTick * burnDamage) / burnTime;
                    const actualBurnDPS = isFinite(burnDPS) ? burnDPS : 0;
                    const explosionDPS = damage / cooldown;
                    const actualExplosionDPS = isFinite(explosionDPS)
                        ? explosionDPS
                        : 0;
                    return actualBurnDPS + actualExplosionDPS;
                },
            },
        },
        LandmineMaxPileDamage: {
            Default: {
                For: ['Trapper'],

                Value: (level) => {
                    const damage = level.levels.getCell(
                        level.Level,
                        'Traps.Landmine.Damage'
                    );

                    return damage * level.MaxTraps;
                },
            },
        },
        BearTrapDPS: {
            Default: {
                For: ['Trapper'],

                Value: (level) => {
                    const damage = level.levels.getCell(
                        level.Level,
                        'Traps.BearTrap.Damage'
                    );

                    const cooldown = level.levels.getCell(
                        level.Level,
                        'Traps.BearTrap.Cooldown'
                    );

                    const dps = damage / cooldown;
                    return isFinite(dps) ? dps : 0;
                },
            },
        },
        BearTrapMaxPileDamage: {
            Default: {
                For: ['Trapper'],

                Value: (level) => {
                    const damage = level.levels.getCell(
                        level.Level,
                        'Traps.BearTrap.Damage'
                    );

                    return damage * level.MaxTraps;
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
        FireTime: {
            Default: {
                For: ['Gatling Gun'],
                Requires: ['Ammo', 'Cooldown'],
                Value: (level) => level.Ammo * level.Cooldown,
            },
        },

        BeeDps: {
            Default: {
                For: ['Swarmer'],
                Requires: ['StingTime', 'BeeDamage', 'TickRate'],
                Value: (level) => level.BeeDamage / level.TickRate,
            },
        },
        TotalStingDamage: {
            Default: {
                For: ['Swarmer'],
                Requires: ['StingTime', 'BeeDamage', 'TickRate'],
                Value: (level) =>
                    (level.StingTime * level.BeeDamage) / level.TickRate,
            },
        },
        KnifeSingleDPS: {
            Default: {
                For: ['Slasher'],
                Requires: ['KnifeCooldown', 'Damage'],
                Value: (level) => {
                    const knifeMultiplier = level?.KnifeMultiplier ?? 1;
                    const knives = level?.Knives ?? 1;

                    return (
                        knives *
                        knifeMultiplier *
                        (level.Damage / level.KnifeCooldown)
                    );
                },
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
            Ranger: {
                For: ['Ranger'],
                Value: (level) =>
                    (level.Damage + level.ExplosionDamage * level.MaxHits) /
                    level.Cooldown,
            },
            Cowboy: {
                For: ['Cowboy'],
                Value: (level) => ((level.Damage * level.MaxAmmo) / (level.Cooldown * level.MaxAmmo + level.SpinDuration)), // prettier-ignore
            },
            Slasher: {
                For: ['Slasher'],
                Value: (level) =>
                    level.Damage / level.Cooldown + level?.KnifeSingleDPS ?? 0,
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

                    const burstCooldown =
                        level.ChargeTime + level.LaserCooldown;

                    return totalDamage / (level.LaserTime + burstCooldown);
                },
            },
            Brawler: {
                For: ['Brawler'],
                Value: (level) => {
                    if (level.ComboLength == 1) {
                        return level.Damage / level.Cooldown;
                    }

                    const totalNormalHits = level.ComboLength - 1;
                    const totalDamage =
                        totalNormalHits * level.Damage + level.FinalHitDamage;

                    const comboLength =
                        totalNormalHits * level.Cooldown + level.ComboCooldown;

                    return totalDamage / comboLength;
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
            AmmoTower: {
                For: ['Gatling Gun'],
                Requires: [
                    'Damage',
                    'Cooldown',
                    'FireTime',
                    'ReloadTime',
                    'WindUpTime',
                ],
                Value: (level) => {
                    const totalDamage =
                        (level.Damage / level.Cooldown) * level.FireTime;
                    const totalTime =
                        level.FireTime + level.ReloadTime + level.WindUpTime;

                    return totalDamage / totalTime;
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
                Requires: ['TotalStingDamage', 'Cooldown'],
                Value: (level) => level.TotalStingDamage / level.Cooldown,
            },
            Burst: {
                For: ['Freezer'],
                Requires: ['Damage', 'Cooldown', 'Burst', 'ReloadTime'],
                Value: (level) => {
                    const totalDamage = level.Damage * level.Burst;
                    const totalTime =
                        level.Cooldown * level.Burst + level.ReloadTime;

                    return totalDamage / totalTime;
                },
            },
            Cryomancer: {
                For: ['Cryomancer'],
                Value: (level) => {
                    const magDamage = level.Damage * level.MaxAmmo;
                    const magTime =
                        level.Cooldown * level.MaxAmmo + level.ReloadTime;

                    const gunDPS = magDamage / magTime;
                    const dotDPS = level.DebuffDamage / level.TickRate;

                    return gunDPS + dotDPS;
                },
            },
            SoldierBurst: {
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
            Trapper: {
                For: ['Trapper'],
                Value: (level) => {
                    const spikeDPS = level.SpikeDPS;
                    const landmineDPS = level.LandmineDPS;
                    const bearTrapDPS = level.BearTrapDPS;

                    return Math.max(spikeDPS, landmineDPS, bearTrapDPS);
                },
            },
        },
        LimitDPS: {
            Default: {
                Requires: ['DPS', 'Limit'],

                Value: (level) => level.DPS * level.Limit,
            },
        },
        NetCost: {
            Default: {
                Value: (level) => (level.levels.levels.reduce(
					(total, nextLevel) => nextLevel.Level > level.Level ? total : total + nextLevel.Cost, 0)), // prettier-ignore
            },
        },
        LimitNetCost: {
            Default: {
                Requires: ['NetCost', 'Limit'],
                Value: (level) => level.NetCost * level.Limit,
            },
        },
        CostEfficiency: {
            Default: {
                Requires: ['NetCost', 'DPS'],
                Value: (level) => level.NetCost / level.DPS,
            },
        },
        Coverage: {
            Default: {
                Requires: ['Range'],
                Value: (level) => {
                    let x = level.Range;
                    const a = -0.00229008361916565;
                    const b = 0.165383660474954;
                    const c = 0.234910819904625;
                    const d = 2.62040766713282;

                    if (x > 45) {
                        x = 45;
                    }

                    return a * x ** 3 + b * x ** 2 + c * x + d;
                },
            },
        },
        BossPotential: {
            Default: {
                Requires: ['Coverage', 'DPS'],
                Value: (level) => level.Coverage * level.DPS,
            },
        },
        LimitBossPotential: {
            Default: {
                Requires: ['BossPotential', 'Limit'],
                Value: (level) => level.BossPotential * level.Limit,
            },
        },
        BossValue: {
            Default: {
                Requires: ['BossPotential', 'NetCost'],
                Value: (level) => (60 * level.BossPotential) / level.NetCost,
            },
        },
        Value: {
            Default: {
                Requires: ['NetCost', 'DPS', 'Range'],
                Value: (level) =>
                    (1000 * level.DPS * level.Range ** 0.4) / level.NetCost,
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
        Cooldown: {
            Type: 'Override',

            Default: {
                Requires: ['Cooldown'],
                Value: (cooldown) => {
                    const { extraCooldown, firerateBuff } = window.state.boosts.tower; // prettier-ignore

                    return cooldown / (firerateBuff + 1) + extraCooldown;
                },
            },
        },
        Damage: {
            Type: 'Override',

            Default: {
                Requires: ['Damage'],
                Value: (damage) => {
                    const { damageBuff } = window.state.boosts.tower; // prettier-ignore

                    return damage * (damageBuff + 1);
                },
            },
        },
        Range: {
            Type: 'Override',

            Default: {
                Requires: ['Range'],
                Value: (range) => {
                    const { rangeBuff } = window.state.boosts.tower; // prettier-ignore

                    return range * (rangeBuff + 1);
                },
            },
        },
        Cost: {
            Type: 'Override',

            Default: {
                Requires: ['Cost'],
                Value: (cost, level) => {
                    const { discount } = window.state.boosts.tower; // prettier-ignore

                    return level.Level == 0 && discount > 0
                        ? cost
                        : cost * (-discount + 1);
                },
            },
        },
        SpawnTime: {
            Type: 'Override',

            Default: {
                Requires: ['SpawnTime'],
                Value: (spawnTime) => {
                    const { spawnrateBuff } = window.state.boosts.unit; // prettier-ignore

                    return spawnTime / (spawnrateBuff + 1);
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
        this.unitManager.load();

        this.#add('Cooldown', skinData);
        this.#add('Damage', skinData);
        this.#add('Range', skinData);
        this.#add('Cost', skinData);
        this.#add('SpawnTime', skinData);
        this.#add('LaserDPS', skinData);
        this.#add('KnifeSingleDPS', skinData);
        this.#add('SpikeDPS', skinData);
        this.#add('LandmineDPS', skinData);
        this.#add('BearTrapDPS', skinData);
        this.#add('FireTime', skinData);
        this.#add('SpikeMaxPileDamage', skinData);
        this.#add('LandmineMaxPileDamage', skinData);
        this.#add('BearTrapMaxPileDamage', skinData);
        this.#add('TowerDPS', skinData);
        this.#add('UnitDPS', skinData);
        this.#add('AggregateUnitDPS', skinData);
        this.#add('RamDPS', skinData);
        this.#add('LaserTime', skinData);
        this.#add('BeeDps', skinData);
        this.#add('TotalStingDamage', skinData);
        this.#add('DPS', skinData);
        this.#add('LimitDPS', skinData);
        this.#add('NetCost', skinData);
        this.#add('LimitNetCost', skinData);
        this.#add('CostEfficiency', skinData);
        this.#add('Coverage', skinData);
        this.#add('BossPotential', skinData);
        this.#add('LimitBossPotential', skinData);
        this.#add('BossValue', skinData);
        this.#add('Value', skinData);
        this.#add('IncomeFactor', skinData);
        this.#add('IncomePerSecond', skinData);
        this.#add('TotalIncomePerSecond', skinData);
        this.#add('WavesUntilNetProfit', skinData);
        this.#add('WavesUntilUpgradeProfit', skinData);
    }
}

export default CalculatedManager;
