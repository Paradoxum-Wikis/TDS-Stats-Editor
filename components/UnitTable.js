import Table from './Table.js';

import TableUnitInput from './TableUnitInput.js';

export default class UnitTable extends Table {
    constructor(root, viewer) {
        super(root);
        this.viewer = viewer;
    }

    removeTable() {
        super.removeTable();
    }

    #createBaseTable() {
        this.header = this.createHeader();
        this.body = this.createBody();

        this.root.appendChild(this.header);
        this.root.appendChild(this.body);
    }

    #addHeader(elements) {
        const headerRow = this.createRow();
        elements.forEach((element) => {
            const headerCell = this.createHeaderCell(element);
            headerRow.appendChild(headerCell);
        });
        this.header.appendChild(headerRow);
    }

    #addBody(data) {
        Object.entries(data).forEach(([unitName, unitData]) => {
            unitData.Name = unitName;
            const tr = this.createRow();

            this.attributes.forEach((attribute) => {
                const tableInput = new TableUnitInput({
                    unitName: unitName,
                    attribute: attribute,
                    unitData: unitData,
                    viewer: this.viewer,
                });

                tableInput.createInput();

                tr.appendChild(tableInput.base);
            });

            this.body.appendChild(tr);
        });
    }

    #getAttributes(data, attributes) {
        attributes = Object.keys(data).reduce(
            (a, k) => [...a, ...attributes[k]],
            []
        );

        return ['Name', ...new Set(attributes.filter((v) => v !== 'Name'))];
    }

    /**
     */
    load(data, options) {
        options = options ?? {};

        this.removeTable();
        if (Object.keys(data).length === 0) return;

        this.attributes = this.#getAttributes(
            data,
            this.viewer.unitManager.unitAttributes
        );
        this.#createBaseTable();

        this.#addHeader(this.attributes);
        this.#addBody(data);
    }
}
