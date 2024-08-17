import UnitData from './UnitData.js';
import Locator from './Locator.js';

import Unit from './Unit.js';

const calculated = {
    Health: (health) => health * (window.state.boosts.unit.healthBuff + 1),
    Damage: (damage) => damage * (window.state.boosts.unit.damageBuff + 1),
    Cooldown: (cooldown) => {
        const { extraCooldown, firerateBuff } = window.state.boosts.unit; // prettier-ignore

        return cooldown / (firerateBuff + 1) + extraCooldown;
    },
    Range: (range) => range * (window.state.boosts.unit.rangeBuff + 1),
    DPS: (unit) => {
        switch (unit.Name) {
            case 'Rifleman1':
            case 'Rifleman2':
            case 'Rifleman3':
                return (() => {
                    const damage = unit.Damage;
                    const burstAmount = unit.BurstAmount;

                    const cooldown = unit.Cooldown;
                    const burstCooldown = unit.BurstCooldown;

                    const totalDamage = damage * burstAmount;
                    const totalTime = cooldown * burstAmount + burstCooldown;
                    return totalDamage / totalTime;
                })();

            default:
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
        }
    },
    DPSRampPerMinute: (unit) => {},
};

const register = {
    Necromancer: {
        Default: [
            'Sword Skeleton',
            'Skeleton Knight',
            'Hallow Guard',
            'Executioner Skeleton',
        ],
    },
    'Crook Boss': {
        Golden: ['GoldenGoon1', 'GoldenGoon2', 'GoldenGoon3'],
        Default: ['Goon1', 'Goon2', 'Goon3'],
    },
    'Mercenary Base': {
        Default: [
            'Rifleman1',
            'Rifleman2',
            'Rifleman3',
            'Grenadier1',
            'Grenadier2',
            'Grenadier3',
            'RiotGuard1',
            'RiotGuard2',
            'FieldMedic1',
            'FieldMedic2',
        ],
    },
};

export default class UnitManager {
    constructor(dataKey) {
        this.dataKey = dataKey;
        this.locator = new Locator();

        this.load();
    }

    flattenStats(statObject, unitStats) {
        for (const [statName, statValue] of Object.entries(unitStats)) {
            if (statValue instanceof Object) {
                this.flattenStats(statObject, statValue);
            } else {
                statObject[statName] = statValue;
            }
        }

        return statObject;
    }

    flatten(unitData) {
        const newUnitData = {};

        for (const [unitName, unitStats] of Object.entries(unitData)) {
            newUnitData[unitName] = this.flattenStats({}, unitStats);
        }

        return newUnitData;
    }

    load() {
        this.baseData = this.getData();

        this.unitData = Object.entries(this.baseData).reduce(
            (unitData, [unitName, unitValue]) => {
                unitData[unitName] = new Unit(unitName, unitValue);
                return unitData;
            },
            {}
        );
    }

    getData() {
        const localData = this.getLocalData();

        if (!localData) return this.getDefault();

        return this.loadLocalData(localData);
    }

    getLocalData() {
        if (!this.dataKey) return;

        const localData = localStorage.getItem(this.dataKey);
        if (!localData) return;

        return JSON.parse(localData);
    }

    getDefault() {
        return JSON.parse(JSON.stringify(UnitData));
    }

    loadLocalData(data) {
        const loadedLocal = JSON.parse(JSON.stringify(data));
        const loadedStatic = this.getDefault();

        for (let [key, value] of Object.entries(loadedStatic)) {
            if (key in loadedLocal) continue;

            loadedLocal[key] = value;
        }

        return loadedLocal;
    }

    findPropertyData(unitData, attributeName) {
        for (let [key, value] of Object.entries(unitData)) {
            if (typeof value === 'object') {
                const propertyData = this.findPropertyData(
                    value,
                    attributeName
                );

                if (propertyData) return propertyData;
            }

            if (key === attributeName) return unitData;
        }
    }

    set(unitName, attribute, value) {
        if (this.baseData[unitName] === undefined) return;

        const propertyData = this.findPropertyData(
            this.baseData[unitName],
            attribute
        );

        if (propertyData?.[attribute] === undefined) return;

        propertyData[attribute] = value;
        this.save();
    }

    get unitNames() {
        return Object.keys(this.unitData);
    }

    hasUnit(unitName) {
        return this.unitData[unitName];
    }

    populate(towerName, towerSkin) {
        const output = {};
        const unitNames = register?.[towerName]?.[towerSkin];

        if (unitNames == null) return output;

        for (const unitName of unitNames) {
            const unitData = this.unitData[unitName];

            output[unitName] = unitData;
        }
        return output;
    }

    save() {
        if (!this.dataKey) return;

        localStorage.setItem(this.dataKey, JSON.stringify(this.baseData));
        window.state.cache.unitData = this.baseData;
    }

    clear() {
        if (!this.dataKey) return;

        localStorage.removeItem(this.dataKey);
        delete window.state.cache.unitData;
    }
}
