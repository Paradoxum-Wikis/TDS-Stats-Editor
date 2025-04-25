import UnitData from './UnitData.js';
import Locator from './Locator.js';

import Unit from './Unit.js';

const calculated = {
    Health: (health) => health * (window.state.boosts.unit.healthBuff + 1),
    Damage: (damage) => damage * (window.state.boosts.unit.damageBuff + 1),
    Cooldown: (cooldown) => {
        const { extraCooldown, firerateBuff, RateOfFireBug } = window.state.boosts.unit; // prettier-ignore

        return cooldown / (firerateBuff + 1) + extraCooldown + RateOfFireBug;
    },
    Range: (range) => range * (window.state.boosts.unit.rangeBuff + 1),
    DPS: (unit) => {
        switch (unit.Name) {
            case 'Rifleman 0':
            case 'Rifleman 1':
            case 'Rifleman 2':
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
            'Skeleton',
            'Sword Skeleton',
            'Giant Skeleton',
            'Skeleton Knight',
            'Hallow Guard',
            'Executioner Skeleton',
        ],
    },
    'Crook Boss': {
        Golden: ['Golden Pistol Goon', 'Golden Tommy Goon 1', 'Golden Tommy Goon 2'],
        Default: ['Pistol Goon', 'Tommy Goon 1', 'Tommy Goon 2'],
    },
    'Mercenary Base': {
        Default: [
            'Rifleman 0',
            'Rifleman 1',
            'Rifleman 2',
            'Grenadier 0',
            'Grenadier 1',
            'Grenadier 2',
            'Riot Guard 0',
            'Riot Guard 1',
            'Field Medic 0',
            'Field Medic 1',
        ],
    },
    Harvester: {
        Default: [
            'Thorns 0',
            'Thorns 1',
            'Thorns 2',
            'Thorns 3',
            'Thorns 4',
            'Thorns 5',
        ],
    },
    'Elementalist': {
        Fire: [
            'Heatwave 2',
            'Heatwave 3',
            'Heatwave 4',
        ],
        Frost: [
            'Ice Turret 2',
            'Ice Turret 3',
            'Ice Turret 4',
        ],
    },
    Pursuit: {
        Default: [
            'Top 4',
            'Top 5',
            'Bottom 4',
            'Bottom 5',
        ],
    },
    Commander: {
        Default: [
            'Gunner APC',
            'Missile APC',
        ],
    },

    Trapper: {
        Default: [
            'Spike 0',
            'Spike 1',
            'Spike 2',
            'Spike 3',
            'Spike 4',
            'Landmine 2',
            'Landmine 3',
            'Landmine 4',
            'Bear Trap 4',
        ],
    },

    Commando: {
        Default: [
            'Missile 1',
            'Missile 2',
        ],
    },

    Jester: {
        Default: [
            'Fire Bomb 0',
            'Fire Bomb 1',
            'Fire Bomb 2',
            'Fire Bomb 3',
            'Fire Bomb 4',
            'Ice Bomb 2',
            'Ice Bomb 3',
            'Ice Bomb 4',
            'Poison Bomb 3',
            'Poison Bomb 4',
            'Confusion Bomb 4',
        ],
    },

    'DJ Booth': {
        Default: [
        'Purple Track 0',
        'Purple Track 1',
        'Purple Track 2',
        'Purple Track 3',
        'Purple Track 4',
        'Purple Track 5',
        'Green Track 0',
        'Green Track 1',
        'Green Track 2',
        'Green Track 3',
        'Green Track 4',
        'Green Track 5',
        'Red Track 2',
        'Red Track 3',
        'Red Track 4',
        'Red Track 5',
        ],
    },

    "Archer": {
        Default: [
            'Arrow 0',
            'Arrow 1',
            'Arrow 2',
            'Flame Arrow 3',
            'Flame Arrow 4',
            'Flame Arrow 5',
            'Shock Arrow 4',
            'Shock Arrow 5',
            'Explosive Arrow 5',
        ],
    },

    "Elf Camp": {
        Default: [
            'Elf 0',
            'Elf 1',
            'Snowball Elf',
            'Bomber Elf',
            'Cannoneer Elf',
            'Guardian Elf',
            'Gunner Elf',
            'Gift Bomber',
            'Ripped Elf',
        ],
    },

    "Mecha Base": {
        Default: [
            'Mark1',
            'Mark1Rocket',
            'Mark2',
            'Mark3',
            'Mark4',
            'Mark5',
            ],
    },

    "Military Base": {
        Default: [
            'Humvee',
            'Humvee 2',
            'Humvee 3',
            'Tank',
            'Railgun Tank',
            ],
    },

    "Biologist": {
        Default: [
            'Sunflower 0',
            'Sunflower 1',
            'Sunflower 2',
            'Sunflower 3',
            'Sunflower 4',
            'Ivy 1',
            'Ivy 2',
            'Ivy 3',
            'Ivy 4',
            'Nightshade 3',
            'Nightshade 4',
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
