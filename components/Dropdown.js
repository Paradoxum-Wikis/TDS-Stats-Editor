class Dropdown {
    /**
     *
     * @param {HTMLInputElement} textForm
     * @param {HTMLDivElement} dropdown
     * @param {Array<String>} options
     */
    constructor(textForm, dropdown, options) {
        this.textForm = textForm;
        this.dropdown = dropdown;
        this.options = options;

        this.textForm.addEventListener('focusin', this.#onFocusIn.bind(this));
        this.textForm.addEventListener('focusout', this.#onFocusOut.bind(this));
        this.textForm.addEventListener('input', this.#onInput.bind(this));
        this.textForm.parentElement.addEventListener('submit', (e) => {
            e.preventDefault();
        });

        this.#hide();
        this.#clear();
        this.nodes = this.#createOptions();
    }

    #hide() {
        this.dropdown.classList.remove('d-block');
    }

    #show() {
        this.dropdown.classList.add('d-block');
    }

    #clear() {
        this.dropdown.innerHTML = '';
    }

    #clearText() {
        this.textForm.value = '';
    }

    #createOption(text) {
        const option = document.createElement('a');
        option.classList.add('dropdown-item');
        option.classList.add('text-white');
        option.href = '#';
        option.innerText = text;

        option.addEventListener(
            'mousedown',
            ((e) => {
                this.#onOptionSelect(e.target.innerText);
            }).bind(this.detail)
        );

        return option;
    }

    #createOptions() {
        return this.options.map((optionName) => {
            const option = this.#createOption(optionName);
            this.dropdown.appendChild(option);

            return option;
        });
    }

    #getActiveText() {
        return this.textForm.value;
    }

    #filterOptions() {
        const activeText = this.#getActiveText();
        this.nodes.forEach((node) => {
            const nodeValue = node.innerText;
            const showText = new RegExp(`${activeText}`, 'gi').test(nodeValue);

            if (showText) {
                node.classList.remove('d-none');
            } else {
                node.classList.add('d-none');
            }
        });
    }

    #onFocusIn() {
        this.#filterOptions();
        this.#show();
        this.#clearText();
    }

    #onFocusOut() {
        this.#hide();
        this.#clearText();
    }

    #onInput() {
        this.#filterOptions();
    }

    #onOptionSelect(option) {
        const event = new CustomEvent('submit', { detail: option });
        this.textForm.dispatchEvent(event);
    }
}

export default Dropdown;
