/**
 * config for the Faithful Format wikitable
 * only the attributes listed here will appear in the faithful wikitable
 */

export const allowedAttributes = [
  "Level",
  "NetCost",
  "Damage",

  "ExplosionDamage",
  "BombTime",
  "ExplosionRadius",
  "FinalHitDamage",
  "RepositionDamage",
  "ComboLength",

  "Cooldown",
  "KnockbackCooldown",

  "KnockbackForce",
  "RevTime",
  "ChargeTime",
  "LaserCooldown",
  "MaxAmmo",

  "Range",
  "AssistRange",
  "SpeedMultiplier",

  "DPS",
  "CostEfficiency",

  "Tick",
  "ChargeUp",
  "Overcharge",
  "BurnDamage",
  "BurnTime",
  "SlowdownPerHit",
  "MaxSlow",
  "SlowdownTime",
  "TotalDPS",

  "MissileDPS",
  "TotalPrice",
  "Defense",
  "MaxDefMelt",
  "AttackSpeed",
  "MissileAmount",
  "Health",
  "Income",
  "MaxIncome",
  "DetectionRange",
  "DetectionDuration",
  "FirerateBuff",
  "DamageBuff",
  "RangeBuff",
  "BuffLength",
];

// special case handlers cuz some attributes need different labels in faithful format
export const attributeLabels = {
  NetCost: "Total Price",
  Cooldown: "Firerate",
  ChargeTime: "Charge-Up",
  LaserCooldown: "Cooldown",
  ExplosionDamage: "[[Splash Damage]]",
  ExplosionRadius: "Explosion Range",
  BombTime: "Bomb Firerate",
  AssistRange: "Hidden Det. Range",
  ComboLength: "Hit Count",
  KnockbackCooldown: "Cooldown",
  RevTime: "Rev-Up Time",
};

/**
 * Tower specific attribute labels, basically, special, special cases for some towers
 * @param {string} attribute - The attribute name
 * @param {string} towerName - The tower name
 * @returns {string|null} - The custom label
 */
export function getTowerSpecificLabel(attribute, towerName) {
  const towerNameLower = towerName.toLowerCase();

  // MaxAmmo special cases
  if (attribute === "MaxAmmo") {
    if (towerNameLower.includes("accelerator")) {
      return "Overcharge";
    } else if (towerNameLower.includes("cowboy")) {
      return "Cash Shot";
    }
  }

  // Add more tower specific attribute mappings here
  // Example:
  // if (attribute === 'SomeAttribute' && towerNameLower.includes('specificTower')) {
  //     return 'Custom Label';
  // }

  return null; // No custom label for this tower+attribute combination
}
