import Dropdown from './Dropdown.js';
import Alert from './Alert.js';

export default class RemoveAttributeForm {
    constructor(viewer) {
        this.viewer = viewer;

        this.nameInput = document.getElementById('remove-attribute-name');
        this.nameOptions = document.getElementById('remove-attribute-name-options'); // prettier-ignore
        this.removeAttributeSubmit = document.getElementById('remove-attribute-submit') // prettier-ignore

        this.removeAttributeSubmit.addEventListener(
            'click',
            ((e) => {
                this.#onSubmit(this.nameInput.value);
            }).bind(this)
        );
    }

    load() {
        this.attributes = this.viewer.getActiveSkin().attributes;

        new Dropdown(this.nameInput, this.nameOptions, this.attributes, {
            setTextMode: true,
        });

        this.nameInput.value = '';
    }

    #onSubmit(attributeName) {
        const didRemove = this.viewer
            .getActiveSkin()
            .removeAttribute(attributeName);

        if (didRemove) {
            const alert = new Alert(
                `${attributeName} was removed from ${this.viewer.tower.name}`,
                { alertStyle: 'alert-success' }
            );
            alert.alertTimeInSeconds = 1;
            alert.fire();
        }

        this.viewer.import(JSON.stringify(this.viewer.tower.json));
    }
}
