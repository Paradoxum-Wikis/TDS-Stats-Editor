import { allowedAttributes, attributeLabels } from './AttributesList.js';

class WikitableGenerator {
    constructor(tower, activeUnits, propertyViewer, towerVariants, viewer) {
        // sets up the wikitable generator with necessary data
        this.tower = tower;
        this.activeUnits = activeUnits;
        this.propertyViewer = propertyViewer;
        this.towerVariants = towerVariants;
        this.viewer = viewer;
    }

    // all of these are self explanatory  i think
    generateWikitableContent() {
        // generates the wikitable content for the tower's stats
        const skinData = this.viewer.getActiveSkin();
        const towerName = this.tower.name;
        const activeVariant = this.towerVariants.getSelectedName();
        const displayedVariant = activeVariant === 'Default' ? '' : `${activeVariant} `;
        const fullTowerName = displayedVariant + towerName;
        
        const levels = skinData.levels;
        const attributes = levels.attributes.filter(attr => {
            return !this.propertyViewer.isDisabled(attr) && 
                   !this.propertyViewer.isHidden(attr) &&
                   !['NoTable', 'SideLevel', 'Level'].includes(attr);
        });
        
        let displayAttributes = attributes;
        if (this.viewer.useFaithfulFormat) {
            displayAttributes = attributes.filter(attr => allowedAttributes.includes(attr));
        }
        
        let wikitable;
        if (this.viewer.useFaithfulFormat) {
            wikitable = `<div style="overflow-x: scroll;">\n{| class="wikitable" style="text-align: center; margin: 0 auto"\n`;
        } else {
            wikitable = `<div style="overflow-x: scroll;">\n{| class="wikitable sortable" style="margin: 0 auto"\n`;
            wikitable += `|+ '''${fullTowerName} Master'''\n`;
        }
        
        wikitable += `|-\n`;
        
        // header formatting for faithful format
        if (this.viewer.useFaithfulFormat) {
            // use the order defined in allowedAttributes
            let orderedAttributes = [];
            for (const attr of allowedAttributes) {
                if (attr === 'Level' || displayAttributes.includes(attr)) {
                    orderedAttributes.push(attr);
                }
            }
            
            // Use the ordered attributes for headers
            let isFirst = true;
            orderedAttributes.forEach(attr => {
                if (isFirst) {
                    wikitable += `! scope="col" style="padding: 5px;" |${this.#formatWikitableHeader(attr)}`;
                    isFirst = false;
                } else {
                    wikitable += `\n! scope="col" style="padding: 5px;" |${this.#formatWikitableHeader(attr)}`;
                }
            });
        } else {
            // regular format remains unchanged
            wikitable += `! Level`;
            displayAttributes.forEach(attr => {
                wikitable += ` !! ${this.#formatWikitableHeader(attr)}`;
            });
        }
        wikitable += `\n`;
        
        // Format rows
        levels.levels.forEach((level, index) => {
            if (level.NoTable === true) return;
            
            wikitable += `|-\n`;
            
            if (this.viewer.useFaithfulFormat) {
                // use the same order for the row values
                let orderedAttributes = [];
                for (const attr of allowedAttributes) {
                    if (attr === 'Level' || displayAttributes.includes(attr)) {
                        orderedAttributes.push(attr);
                    }
                }
                
                let isFirst = true;
                orderedAttributes.forEach(attr => {
                    const value = attr === 'Level' ? (level.Level ?? index) : levels.getCell(index, attr);
                    
                    if (isFirst) {
                        wikitable += `| style="padding: 5px;" |${this.#formatWikitableCell(value, attr)}`;
                        isFirst = false;
                    } else {
                        wikitable += `\n| style="padding: 5px;" |${this.#formatWikitableCell(value, attr)}`;
                    }
                });
            } else {
                // regular format remains unchanged
                wikitable += `| ${level.Level ?? index}`;
                
                displayAttributes.forEach(attr => {
                    const value = levels.getCell(index, attr);
                    wikitable += ` || ${this.#formatWikitableCell(value, attr)}`;
                });
            }
            
            wikitable += `\n`;
        });
        
        // Close table
        wikitable += `|}\n</div>`;
        
        return wikitable;
    }

    generateUnitWikitableContent() {
        // generates the wikitable content for the units' stats
        const towerName = this.tower.name;
        const activeVariant = this.towerVariants.getSelectedName();
        const displayedVariant = activeVariant === 'Default' ? '' : `${activeVariant} `;
        const fullTowerName = displayedVariant + towerName;
        
        if (!this.activeUnits || Object.keys(this.activeUnits).length === 0) {
            return '';
        }
        
        const firstUnitKey = Object.keys(this.activeUnits)[0];
        const firstUnit = this.activeUnits[firstUnitKey];
        
        if (!firstUnit || !firstUnit.data) {
            return '';
        }
        
        let attributes = Object.keys(firstUnit.data).filter(attr => 
            !['id', 'uuid', 'type', 'parent', 'hidden'].includes(attr.toLowerCase())
        );
        
        // multiple detecs columns
        const detectionsIndex = attributes.indexOf('Detections');
        if (detectionsIndex !== -1) {
            attributes.splice(detectionsIndex, 1);
            attributes.push('Hidden', 'Flying', 'Lead');
        }
        
        const sortableClass = this.viewer.useFaithfulFormat ? '' : 'sortable';
        let wikitable = `<div style="overflow-x: scroll;">\n{| class="wikitable ${sortableClass}" style="text-align: center; margin: 0 auto"\n`;
        
        if (!this.viewer.useFaithfulFormat) {
            wikitable += `|+ '''${fullTowerName} Slave'''\n`;
        }
        
        wikitable += `|-\n`;
        wikitable += `! Name`;
        attributes.forEach(attr => {
            wikitable += ` !! ${this.#formatWikitableHeader(attr)}`;
        });
        wikitable += `\n`;
        
        Object.entries(this.activeUnits).forEach(([unitName, unitData]) => {
            if (!unitData.data) return;
            
            wikitable += `|-\n`;
            if (this.viewer.useFaithfulFormat) {
                wikitable += `| style="padding: 5px;" | ${unitName}`;
            } else {
                wikitable += `| ${unitName}`;
            }
            
            attributes.forEach(attr => {
                let value;
                
                if (['Hidden', 'Flying', 'Lead'].includes(attr) && unitData.data.Detections) {
                    value = unitData.data.Detections[attr] || false;
                } else {
                    value = unitData.data[attr];
                }
                
                if (this.viewer.useFaithfulFormat) {
                    wikitable += ` || style="padding: 5px;" | ${this.#formatWikitableCell(value, attr)}`;
                } else {
                    wikitable += ` || ${this.#formatWikitableCell(value, attr)}`;
                }
            });
            
            wikitable += `\n`;
        });
        
        wikitable += `|}\n</div>`;
        
        return wikitable;
    }

    #formatWikitableHeader(attribute) {
        // check to use a custom label in faithful format
        if (this.viewer.useFaithfulFormat && attributeLabels[attribute]) {
            return attributeLabels[attribute];
        }
        
        // formats both wikitable header, handles acronyms
        const acronyms = {
            'DPS': 'DPS',
            'LaserDPS': 'Laser DPS',
            'MissileDPS': 'Missile DPS',
            'TotalDPS': 'Total DPS',
            'RamDPS': 'Ram DPS',
            'UnitDPS': 'Unit DPS',
            'ExplosionDPS': 'Explosion DPS',
            'BurnDPS': 'Burn DPS',
            'CallToArmsDPS': 'Call To Arms DPS',
            'CaravanDPS': 'Caravan DPS',
        };
        
        if (acronyms[attribute]) {
            return acronyms[attribute];
        }
        
        return attribute
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    #formatWikitableCell(value, attribute) {
        // formats cell values with appropriate units
        if (value === undefined || value === null) {
            return '';
        }
        
        // don't convert 0 or nan to n/a for levels
        if (attribute === 'Level') {
            return value.toString();
        }
        
        if (typeof value === 'object' && !Array.isArray(value)) {
            if (attribute === 'Detections') {
                const detections = [];
                if (value.Hidden !== undefined) detections.push(`Hidden: ${value.Hidden ? 'Yes' : 'No'}`);
                if (value.Flying !== undefined) detections.push(`Flying: ${value.Flying ? 'Yes' : 'No'}`);
                if (value.Lead !== undefined) detections.push(`Lead: ${value.Lead ? 'Yes' : 'No'}`);
                return detections.join(', ') || '';
            } else if (attribute === 'Attributes') {
                return Object.entries(value)
                    .map(([key, val]) => `${key}: ${typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val}`)
                    .join(', ');
            } else {
                return JSON.stringify(value).replace(/[{}"]/g, '');
            }
        }
        
        // Currency formatting
        if ([
            'Cost', 'NetCost', 'Income', 'CostEfficiency', 'IncomeEfficiency',
            'LimitNetCost', 'IncomePerSecond', 'TotalIncomePerSecond', 
            'BaseIncome', 'IncomePerTower', 'MaxIncome'
        ].includes(attribute)) {
            if (this.viewer.useFaithfulFormat) {
                // Check for NaN/0 before using Money template
                if (isNaN(value) || value === 0) {
                    return 'N/A';
                }
                return `{{Money|${this.#formatNumberWithCommas(value)}}}`;
            } else {
                return `$${this.#formatNumber(value)}`;
            }
        }
        
        // Percentage formatting
        if ([
            'Defense', 'SlowdownPerHit', 'MaxSlow', 'RangeBuff', 'DamageBuff', 
            'FirerateBuff', 'DefenseMelt', 'MaxDefMelt', 'CallToArmsBuff', 
            'ThornPower', 'CriticalMultiplier', 'AftershockMultiplier', 
            'SpeedMultiplier', 'Active', 'Inactive', 'BaseSlowdown',
            'SlowdownPerTower', 'BaseDefenseMelt', 'DefenseMeltPerTower',
            'MaxDefenseMelt'
        ].includes(attribute)) {
            return this.viewer.useFaithfulFormat
                ? this.#formatFaithfulNumber(value / 100)
                : `${this.#formatNumber(value)}%`;
        }
        
        // Time formatting
        if ([
            'Cooldown', 'ChargeTime', 'SlowdownTime', 'BurnTime', 'PoisonLength',
            'BuffLength', 'FreezeTime', 'Duration', 'LaserCooldown', 'MissileCooldown',
            'BurstCooldown', 'RevTime', 'ReloadTime', 'DetectionBuffLength',
            'ComboLength', 'ComboCooldown', 'RepositionCooldown', 'KnockbackCooldown',
            'Spawnrate', 'BuildTime', 'AftershockCooldown', 'AimTime', 'EquipTime',
            'BuildDelay', 'TimeBetweenMissiles', 'SendTime', 'StunLength',
            'Lifetime', 'ConfusionTime', 'ConfusionCooldown'
        ].includes(attribute)) {
            return this.viewer.useFaithfulFormat
                ? this.#formatFaithfulNumber(value)
                : `${this.#formatNumber(value)}s`;
        }
        
        // boolean values
        if ([
            'Hidden', 'Flying', 'Lead', 'Boss'
        ].includes(attribute)) {
            return value ? 'Yes' : 'No';
        }
                
        // default handling
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        } else if (typeof value === 'number') {
            return this.viewer.useFaithfulFormat
                ? this.#formatFaithfulNumber(value)
                : this.#formatNumber(value);
        } else {
            return value.toString();
        }
    }

    #formatNumber(num) {
        // formats a number for display in the wikitable
        if (Math.abs(num) < 0.01) {
            return '0';
        }
        
        if (Number.isInteger(num)) {
            return num.toLocaleString();
        }
        
        const rounded = Math.round(num * 100) / 100;
        return rounded.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    // helper method for formatting numbers with commas but no decimal places
    #formatNumberWithCommas(num) {
        if (typeof num !== 'number') return num;
        
        // faithful uses a different format for numbers
        return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    #formatFaithfulNumber(value) {
        // NaN and 0 to N/A in faithful format
        if (isNaN(value) || value === 0) {
            return 'N/A';
        }
        return this.#formatNumber(value);
    }
}

export default WikitableGenerator;