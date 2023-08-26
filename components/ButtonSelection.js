export default class ButtonSelection {
    /**
     *
     * @param {HTMLDivElement} root
     * @param {Array<string>} buttons
     */
    constructor(root) {
        this.root = root;
        this.buttons = [];

        this.activeClass = 'btn-primary';
        this.inactiveClass = 'btn-outline-secondary';
        this.buttonClasses = ['btn', 'btn-sm'];
    }

    /**
     * @param {String} innerText
     * @returns {HTMLButtonElement}
     */
    createButton(innerText, options) {
        const button = document.createElement('button');

        this.buttonClasses.forEach((className) =>
            button.classList.add(className)
        );
        button.innerText = innerText;

        button.addEventListener(
            'click',
            (() => {
                this.selectButton(button);

                const event = new CustomEvent('submit', { detail: innerText });
                this.root.dispatchEvent(event);
            }).bind(this)
        );

        return button;
    }

    addButton(buttonName) {
        const button = this.createButton(buttonName);
        this.buttons.push(button);
        this.root.appendChild(button);

        return this;
    }

    /**
     *
     * @returns {HTMLButtonElement}
     */
    getSelected() {
        return this.selected;
    }

    getSelectedName() {
        return this.getSelected().innerText;
    }

    selectButton(selectedButton) {
        this.buttons.forEach((button) => {
            if (button === selectedButton) {
                button.classList.add(this.activeClass);
                button.classList.remove(this.inactiveClass);
                this.selected = button;
            } else {
                button.classList.remove(this.activeClass);
                button.classList.add(this.inactiveClass);
            }
        });
    }

    /**
     * @param {Array<String>} buttonNames
     */
    setButtons(buttonNames) {
        this.buttons = [];
        this.root.innerHTML = '';

        buttonNames.forEach(this.addButton.bind(this));
        this.selectButton(this.buttons[0]);

        return this;
    }
}
