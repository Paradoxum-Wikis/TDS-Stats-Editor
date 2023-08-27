class Dropdown {
    /**
     *
     * @param {HTMLInputElement} textForm
     * @param {HTMLDivElement} dropdown
     * @param {Array<String>} options
     * @param {{
     * 		setTextMode: Boolean
     * }} config
     */
    constructor(textForm, dropdown, options, config) {
        config = config ?? {};

        this.textForm = textForm;
        this.dropdown = dropdown;
        this.options = options;
        this.setTextMode = config.setTextMode ?? false;

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
        this.#show();

        this.#clearText();
        this.#filterOptions();
    }

    #onFocusOut() {
        this.#hide();
        if (this.setTextMode) return;
        this.#clearText();
    }

    #onInput() {
        this.#filterOptions();
    }

    #onOptionSelect(option) {
        const event = new CustomEvent('submit', { detail: option });
        this.textForm.dispatchEvent(event);

        if (this.setTextMode) {
            this.textForm.value = option;
        }
    }
}

export default Dropdown;
