import Unit from './Unit.js';

class UnitCalculations {
    constructor() {}

    calculated = {
        DPS: {
            Default: {
                Requires: ['Damage', 'Cooldown'],
                Exclude: [],
                Value: (level) => level.Damage / level.Cooldown,
            },

            Rocket: {
                For: ['Sentry4', 'Tank', 'RailgunTank'],
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
                    const { extraCooldown, firerateBuff } = window.state.boosts.unit; // prettier-ignore

                    return cooldown / (firerateBuff + 1) + extraCooldown;
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
        for (let [_, value] of Object.entries(calculatedField)) {
            if (value?.For?.includes(unitData.name)) return value;
        }

        return calculatedField.Default;
    }

    /**
     * @param {Unit} unitData
     */
    #add(name, unitData) {
        const calculated = this.getValue(this.calculated[name], unitData);
        if (this.validate(calculated, unitData))
            unitData.addCalculated(name, calculated.Value);
    }

    addCalculate(unitData) {
        this.#add('DPS', unitData);
        this.#add('AggregateDPS', unitData);
        this.#add('RamDPS', unitData);

        this.#add('Health', unitData);
        this.#add('Damage', unitData);
        this.#add('Cooldown', unitData);
        this.#add('Range', unitData);
    }
}

export default new UnitCalculations();
