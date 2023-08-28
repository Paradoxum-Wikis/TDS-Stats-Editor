import UnitData from './UnitData.js';

const dps = (unit) => {
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
};

export default class UnitManager {
    constructor() {
        this.unitData = UnitData;
        this.unitAttributes = {};

        Object.keys(this.unitData).forEach((unitName) => {
            this.unitAttributes[unitName] = Object.keys(
                this.unitData[unitName]
            );
        });

        Object.keys(this.unitData).forEach((unitName) => {
            this.unitAttributes[unitName].push('DPS');
            if (
                Object.getOwnPropertyNames(this.unitData[unitName]).includes(
                    'DPS'
                )
            )
                return;

            Object.defineProperty(this.unitData[unitName], 'DPS', {
                get() {
                    return dps(this);
                },
            });
        });
    }

    get unitNames() {
        return Object.keys(this.unitData);
    }

    hasUnit(unitName) {
        return this.unitData[unitName];
    }
}
