import UnitData from './UnitData.js';

const calculated = {
    Health: (health) => health * (window.state.boosts.unit.healthBuff + 1),
    Damage: (damage) => damage * (window.state.boosts.unit.damageBuff + 1),
    Cooldown: (cooldown) => {
        const { extraCooldown, firerateBuff } = window.state.boosts.unit; // prettier-ignore

        return cooldown / (firerateBuff + 1) + extraCooldown;
    },
    Range: (range) => range * (window.state.boosts.unit.rangeBuff + 1),
    DPS: (unit) => {
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
};

export default class UnitManager {
    constructor(dataKey) {
        this.dataKey = dataKey;

        this.load();
    }

    load() {
        this.baseData = this.getData();
        this.unitData = JSON.parse(JSON.stringify(this.baseData));

        this.unitAttributes = {};

        Object.keys(this.unitData).forEach((unitName) => {
            this.unitAttributes[unitName] = Object.keys(
                this.unitData[unitName]
            );
        });

        Object.keys(this.unitData).forEach(
            ((unitName) => {
                this.#override(unitName, 'Health');
                this.#override(unitName, 'Damage');
                this.#override(unitName, 'Cooldown');
                this.#override(unitName, 'Range');

                this.#addCalculated(unitName, 'DPS');
            }).bind(this)
        );
    }

    getData() {
        const localData = this.getLocalData();

        if (!localData) return this.getDefault();

        return this.loadLocalData(localData);
    }

    getLocalData() {
        if (!this.dataKey) return;

        if (window.state && window.state.cache.unitData !== undefined) {
            return window.state.cache.unitData;
        }

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

    set(unitName, attribute, value) {
        if (this.baseData[unitName] === undefined) return;
        if (this.baseData[unitName][attribute] === undefined) return;

        this.baseData[unitName][attribute] = value;
        this.save();
    }

    #override(unitName, propertyName) {
        if (this.unitData[unitName][propertyName] == undefined) return;

        const propertyDescriptor = Object.getOwnPropertyDescriptor(
            this.unitData[unitName],
            propertyName
        );
        if (propertyDescriptor.get !== undefined) return;

        const originalCooldown = this.unitData[unitName][propertyName];

        Object.defineProperty(this.unitData[unitName], propertyName, {
            get() {
                return calculated[propertyName](originalCooldown);
            },
        });
    }

    #addCalculated(unitName, propertyName) {
        this.unitAttributes[unitName].push(propertyName);
        if (
            Object.getOwnPropertyNames(this.unitData[unitName]).includes(
                propertyName
            )
        )
            return;

        Object.defineProperty(this.unitData[unitName], propertyName, {
            get() {
                return calculated[propertyName](this);
            },
        });
    }

    get unitNames() {
        return Object.keys(this.unitData);
    }

    hasUnit(unitName) {
        return this.unitData[unitName];
    }

    populate(towerName, towerSkin) {
        const output = {};
        const units = register?.[towerName]?.[towerSkin];
        if (units == null) return output;

        for (const unit of units) {
            output[unit] = this.unitData[unit];
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
