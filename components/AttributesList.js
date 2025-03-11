/**
 * config for the Faithful Format wikitable
 * only the attributes listed here will appear in the faithful wikitable
 */

export const allowedAttributes = [
    'Level',
    'NetCost',
    'Damage',
    
    'ExplosionDamage',
    'BombTime',
    'ExplosionRadius',
    'FinalHitDamage',
    'RepositionDamage',
    'ComboLength',

    'Cooldown',
    'KnockbackCooldown',

    'KnockbackForce',
    'ChargeTime',
    'LaserCooldown',
    'MaxAmmo',

    'Range',
    'AssistRange',
    'SpeedMultiplier',

    'DPS',
    'CostEfficiency',

    'Tick',
    'ChargeUp',
    'Overcharge',
    'BurnDamage',
    'BurnTime',
    'SlowdownPerHit',
    'MaxSlow',
    'SlowdownTime',
    'TotalDPS',

    'MissileDPS',
    'TotalPrice',
    'Defense',
    'MaxDefMelt',
    'AttackSpeed',
    'MissileAmount',
    'Health',
    'Income',
    'MaxIncome',
    'DetectionRange',
    'DetectionDuration',
    'FirerateBuff',
    'DamageBuff',
    'RangeBuff',
    'BuffLength',
    
];

// special case handlers cuz some attributes need different labels in faithful format
export const attributeLabels = {
    'NetCost': 'Total Price',
    'Cooldown': 'Firerate',
    'ChargeTime': 'Charge-Up',
    'LaserCooldown': 'Cooldown',
    'MaxAmmo': 'Overcharge',
    'ExplosionDamage': '[[Splash Damage]]',
    'ExplosionRadius': 'Explosion Range',
    'BombTime': 'Bomb Firerate',
    'AssistRange': 'Hidden Det. Range',
    'ComboLength': 'Hit Count',
    'KnockbackCooldown': 'Cooldown',

};