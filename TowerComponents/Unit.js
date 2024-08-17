import Locator from './Locator.js';
import UnitCalculations from './UnitCalculations.js';

export default class Unit {
    constructor(name, data) {
        this.name = name;
        this.data = data;
        this.attributes = {};
        this.attributeNames = [];

        this.createData();
    }

    createData() {
        this.locator = new Locator();
        this.processData(this.data, []);
        UnitCalculations.addCalculate(this);
    }

    processData(currentObject, propertyChain) {
        for (const [statName, statValue] of Object.entries(currentObject)) {
            if (statValue instanceof Object) {
                this.processData(statValue, [...propertyChain, statName]);
            } else {
                this.addAttribute(statName, propertyChain);
            }
        }
    }

    addAttribute(name, location) {
        const value = this.locator.locate(this.data, name, location);
        if (value === undefined) return;

        this.locator.addLocation(name, location);
        this.addAttributeValue(name, value);
    }

    addAttributeValue(name, value) {
        this.attributeNames.push(name);
        this.attributes[name] = value;
    }

    addCalculated(name, getter) {
        if (this.attributeNames.includes(name))
            return this.addOverride(name, getter);

        this.attributeNames.push(name);

        Object.defineProperty(this.attributes, name, {
            get() {
                return getter(this);
            },
        });
    }

    addOverride(name, getter) {
        const propertyDescriptor = Object.getOwnPropertyDescriptor(
            this.attributes,
            name
        );
        if (propertyDescriptor.get !== undefined)
            return console.log(
                `Potential duplicate property on ${name} for ${this.name}`
            );

        const originalValue = this.attributes[name];

        Object.defineProperty(this.attributes, name, {
            get() {
                return getter(originalValue, this);
            },
        });
    }

    set(attributeName, value) {
        if (this.locator.hasLocation(attributeName)) {
            const targetData = this.locator.getOrCreateTargetData(
                this.data,
                this.locator.getLocation(attributeName)
            );

            targetData[attributeName] = value;
        }
    }
}
