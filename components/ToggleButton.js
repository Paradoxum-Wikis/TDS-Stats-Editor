export default class ToggleButton {
    /**
     * @param {HTMLButtonElement} element
     */
    constructor(element, options) {
        options = options ?? {};

        this.element = element;

        this.state = options.state ?? false;
        this.activeClass = options.activeClass ?? 'btn-primary';
        this.inactiveClass = options.inactiveClass ?? 'btn-outline-secondary';

        this.element.addEventListener('click', this.#onClick.bind(this));
        this.#render();
    }

    #displayEnable() {
        this.element.classList.add(this.activeClass);
        this.element.classList.remove(this.inactiveClass);
    }

    #displayDisable() {
        this.element.classList.remove(this.activeClass);
        this.element.classList.add(this.inactiveClass);
    }

    #enable() {
        this.#displayEnable();
        const event = new CustomEvent('enabled');
        this.element.dispatchEvent(event);
    }
    #disable() {
        this.#displayDisable();

        const event = new CustomEvent('disabled');
        this.element.dispatchEvent(event);
    }

    #onClick() {
        this.state = !this.state;
        this.state ? this.#enable() : this.#disable();

        const event = new CustomEvent('toggled');
        this.element.dispatchEvent(event);
    }

    #render() {
        this.state ? this.#displayEnable() : this.#displayDisable();
    }
}
