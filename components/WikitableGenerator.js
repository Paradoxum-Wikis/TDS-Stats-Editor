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
        
        let wikitable = `<div style="overflow-x: scroll;">\n{| class="wikitable sortable" style="margin: 0 auto"\n`; // prettier-ignore
        wikitable += `|+ '''${fullTowerName} Master'''\n`;
        
        wikitable += `|-\n`;
        wikitable += `! Level`;
        attributes.forEach(attr => {
            wikitable += ` !! ${this.#formatWikitableHeader(attr)}`;
        });
        wikitable += `\n`;
        
        levels.levels.forEach((level, index) => {
            if (level.NoTable === true) return;
            
            wikitable += `|-\n`;
            wikitable += `| ${level.Level ?? index}`;
            
            attributes.forEach(attr => {
                const value = levels.getCell(index, attr);
                wikitable += ` || ${this.#formatWikitableCell(value, attr)}`;
            });
            
            wikitable += `\n`;
        });
        
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
        
        // Split Detections into separate columns
        const detectionsIndex = attributes.indexOf('Detections');
        if (detectionsIndex !== -1) {
            // Remove Detections and add individual detection attributes
            attributes.splice(detectionsIndex, 1);
            attributes.push('Hidden', 'Flying', 'Lead');
        }
        
        let wikitable = `<div style="overflow-x: scroll">\n{| class="wikitable sortable" style="margin: 0 auto"\n`; // prettier-ignore
        wikitable += `|+ '''${fullTowerName} Slave'''\n`;
        
        wikitable += `|-\n`;
        wikitable += `! Name`;
        attributes.forEach(attr => {
            wikitable += ` !! ${this.#formatWikitableHeader(attr)}`;
        });
        wikitable += `\n`;
        
        Object.entries(this.activeUnits).forEach(([unitName, unitData]) => {
            if (!unitData.data) return;
            
            wikitable += `|-\n`;
            wikitable += `| ${unitName}`;
            
            attributes.forEach(attr => {
                let value;
                
                // Handle detection attributes separately
                if (['Hidden', 'Flying', 'Lead'].includes(attr) && unitData.data.Detections) {
                    value = unitData.data.Detections[attr] || false;
                } else {
                    value = unitData.data[attr];
                }
                
                wikitable += ` || ${this.#formatWikitableCell(value, attr)}`;
            });
            
            wikitable += `\n`;
        });
        
        wikitable += `|}\n</div>`;
        
        return wikitable;
    }

    #formatWikitableHeader(attribute) {
        // formats the wikitable header, handles acronyms
        const acronyms = {
            'DPS': 'DPS',
            'LaserDPS': 'Laser DPS',
            'MissileDPS': 'Missile DPS',
            'TotalDPS': 'Total DPS',
            'RamDPS': 'Ram DPS',
            'UnitDPS': 'Unit DPS',
            'ExplosionDPS': 'Explosion DPS',
            'BurnDPS': 'Burn DPS',
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
        
        // currency formatting
        if ([
            'Cost', 'NetCost', 'Income', 'CostEfficiency', 'IncomeEfficiency',
            'LimitNetCost', 'IncomePerSecond', 'TotalIncomePerSecond', 
            'BaseIncome', 'IncomePerTower', 'MaxIncome'
        ].includes(attribute)) {
            return `$${this.#formatNumber(value)}`;
        }
        
        // percentage formatting
        if ([
            'Defense', 'SlowdownPerHit', 'MaxSlow', 'RangeBuff', 'DamageBuff', 
            'FirerateBuff', 'DefenseMelt', 'MaxDefMelt', 'CallToArmsBuff', 
            'ThornPower', 'CriticalMultiplier', 'AftershockMultiplier', 
            'SpeedMultiplier', 'Active', 'Inactive', 'BaseSlowdown',
            'SlowdownPerTower', 'BaseDefenseMelt', 'DefenseMeltPerTower',
            'MaxDefenseMelt'
        ].includes(attribute)) {
            return `${this.#formatNumber(value)}%`;
        }
        
        // time formatting
        if ([
            'Cooldown', 'ChargeTime', 'SlowdownTime', 'BurnTime', 'PoisonLength',
            'BuffLength', 'FreezeTime', 'Duration', 'LaserCooldown', 'MissileCooldown',
            'BurstCooldown', 'RevTime', 'ReloadTime', 'DetectionBuffLength',
            'ComboLength', 'ComboCooldown', 'RepositionCooldown', 'Knockback Cooldown',
            'Spawnrate', 'BuildTime', 'AftershockCooldown', 'AimTime', 'EquipTime',
            'BuildDelay', 'TimeBetweenMissiles', 'SendTime', 'StunLength',
            'Lifetime', 'ConfusionTime', 'ConfusionCooldown'
        ].includes(attribute)) {
            return `${this.#formatNumber(value)}s`;
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
            return this.#formatNumber(value);
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
}

export default WikitableGenerator;