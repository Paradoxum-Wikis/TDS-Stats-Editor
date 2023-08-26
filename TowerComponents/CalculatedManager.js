import SkinData from './SkinData.js';

class CalculatedManager {
    calculated = {
        DPS: {
            Default: {
                Requires: ['Damage', 'Cooldown'],
                Exclude: ['Farm', 'DJ Booth', 'Elf Camp', 'Military Base'],
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
        this.#add('DPS', skinData);
        this.#add('NetCost', skinData);
        this.#add('CostEfficiency', skinData);
        this.#add('IncomeFactor', skinData);
    }
}

export default new CalculatedManager();
