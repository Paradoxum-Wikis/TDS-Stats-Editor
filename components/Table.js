export default class Table {
    /**
     * @param {HTMLTableElement} root
     */
    constructor(root) {
        this.root = root;
    }

    /**
     * @param {String} value
     * @returns {HTMLTableCellElement}
     */
    createHeaderCell(value) {
        const th = document.createElement('th');

        const headerText = this.#formatHeader(value);

        th.innerText = headerText;

        th.classList.add('table-header-cell');

        return th;
    }

    #formatHeader(value) {
        const camelRegex = /([a-z])([A-Z])/g.exec(value);

        if (camelRegex) {
            value =
                value.slice(0, camelRegex.index + 1) +
                ' ' +
                value.slice(camelRegex.index + 1);

            return this.#formatHeader(value);
        }

        return value;
    }

    /**
     * @param {String} value
     * @returns {HTMLTableCellElement}
     */
    createCell(value) {
        const td = document.createElement('td');
        td.classList.add('table-cell');

        const input = document.createElement('input');
        input.classList.add('table-cell-input');
        if (value.length > 10) {
            input.classList.add('table-cell-input-lg');
        } else if (value.length > 5) {
            input.classList.add('table-cell-input-md');
        }

        input.value = value;

        td.appendChild(input);
        return td;
    }

    /**
     * @returns {HTMLTableRowElement}
     */
    createRow() {
        const tr = document.createElement('tr');

        return tr;
    }

    /**
     * @returns {HTMLTableSectionElement}
     */
    createHeader() {
        const thead = document.createElement('thead');

        return thead;
    }

    /**
     * @returns {HTMLTableSectionElement}
     */
    createBody() {
        const tbody = document.createElement('tbody');

        return tbody;
    }

    removeTable() {
        this.root.innerHTML = '';
    }
}
