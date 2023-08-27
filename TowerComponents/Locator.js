export default class Locator {
    constructor() {
        this.locations = {};
        this.detections = {};
    }

    addLocation(attribute, location) {
        this.locations[attribute] = location ?? [];
    }

    getLocation(attribute) {
        return this.locations[attribute];
    }

    hasLocation(attribute) {
        return this.locations[attribute] !== undefined;
    }

    hasDetection(name) {
        return Boolean(this.detections[name]);
    }

    addDetection(name) {
        this.detections[name] = true;
    }

    getTargetData(data, location) {
        return location.reduce((target, next) => target?.[next], data);
    }

    getOrCreateTargetData(data, location) {
        return location.reduce((target, next) => {
            if (target[next] === undefined) {
                target[next] = {};
            }
            return target[next];
        }, data);
    }

    locate(data, attribute, location) {
        location = location ?? [];

        const targetData = this.getTargetData(data, location);

        return targetData?.[attribute];
    }
}
