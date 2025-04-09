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
        this.currentHighlightedIndex = -1; // highlight index

        this.textForm.addEventListener('focusin', this.#onFocusIn.bind(this));
        this.textForm.addEventListener('focusout', this.#onFocusOut.bind(this));
        this.textForm.addEventListener('input', this.#onInput.bind(this));
        this.textForm.addEventListener('keydown', this.#onKeyDown.bind(this)); // keybind listener
        this.textForm.parentElement.addEventListener('submit', (e) => {
            e.preventDefault();
        });

        this.#hide();
        this.#clear();
        this.nodes = this.#createOptions();
    }

    setOptions(newOptions) {
        this.options = newOptions;
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
        this.currentHighlightedIndex = -1;
        this.#removeHighlightFromAll();
    }

    #onOptionSelect(option) {
        const event = new CustomEvent('submit', { detail: option });
        this.textForm.dispatchEvent(event);

        if (this.setTextMode) {
            this.textForm.value = option;
        }

        const keepOpen = window.state?.settings?.keepDropdownOpen === true;
        if (!keepOpen) {
            // default behavior: Hide, blur, and reset highlight
            this.#hide();
            this.textForm.blur();
            this.#removeHighlightFromAll(); // Clear visual highlight
        } else {
            // keep open setting: fefilter, but DO NOT reset highlight
            this.#filterOptions();
        }
    }

    #onKeyDown(event) {
        if (!this.dropdown.classList.contains('d-block')) return; // act if dropdown is visible

        const options = Array.from(this.dropdown.querySelectorAll('.dropdown-item:not(.d-none)'));
        if (!options.length && event.key !== 'Escape') return;

        switch(event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.#navigateDropdown(1, options);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.#navigateDropdown(-1, options);
                break;
            case 'Enter':
                if (this.currentHighlightedIndex >= 0 && this.currentHighlightedIndex < options.length) {
                    event.preventDefault();
                    options[this.currentHighlightedIndex].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

                    // Check the setting AFTER the selection logic runs
                    const keepOpen = window.state?.settings?.keepDropdownOpen === true;
                    if (!keepOpen) {
                        this.textForm.blur();
                    }
                }
                break;
            case 'Escape':
                event.preventDefault();
                this.#hide();
                this.textForm.blur();
                this.currentHighlightedIndex = -1;
                this.#removeHighlightFromAll();
                break;
        }
    }

    #navigateDropdown(direction, options) {
        this.#removeHighlightFromAll();

        if (this.currentHighlightedIndex === -1 && direction === -1) {
            // If starting navigation upwards, go to the last item
            this.currentHighlightedIndex = options.length - 1;
        } else {
            this.currentHighlightedIndex += direction;
            // Wrap around
            if (this.currentHighlightedIndex < 0) {
                this.currentHighlightedIndex = options.length - 1;
            } else if (this.currentHighlightedIndex >= options.length) {
                this.currentHighlightedIndex = 0;
            }
        }

        if (this.currentHighlightedIndex >= 0 && this.currentHighlightedIndex < options.length) {
            options[this.currentHighlightedIndex].classList.add('keyboard-highlighted');
            
            options[this.currentHighlightedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    #removeHighlightFromAll() {
        const highlightedItems = this.dropdown.querySelectorAll('.keyboard-highlighted');
        highlightedItems.forEach(item => item.classList.remove('keyboard-highlighted'));
    }
}

export default Dropdown;
