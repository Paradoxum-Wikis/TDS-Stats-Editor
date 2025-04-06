import Table from './Table.js';
import TableUnitInput from './TableUnitInput.js';

export default class UnitTable extends Table {
    constructor(root, viewer) {
        super(root);
        this.viewer = viewer;
        
        document.addEventListener('settingsChanged', (e) => {
            if (this.isLoaded && (e.detail.setting === 'showSeconds' || e.detail.setting === 'forceUSNumbers')) {
                this.refresh();
            }
        });
        
        this.isLoaded = false;
    }

    removeTable() {
        document.getElementById('unit-table-buttons').classList.add('d-none');
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
            unitData.attributes.Name = unitName;

            const deltaUnit = this.viewer.unitDeltaManager.unitData[unitName];
            deltaUnit.attributes.Name = unitName;
            const tr = this.createRow();

            this.attributes.forEach((attribute) => {
                const tableInput = new TableUnitInput({
                    unitName: unitName,
                    attribute: attribute,
                    unitData: unitData,
                    deltaData: deltaUnit,
                    viewer: this.viewer,
                });

                tableInput.createInput();

                tr.appendChild(tableInput.base);
            });

            this.body.appendChild(tr);
        });
    }

    #getAttributes(data) {
        const attributes = Object.values(data).reduce(
            (a, unitData) => [...a, ...unitData.attributeNames],
            []
        );

        const allAttributes = ['Name', ...new Set(attributes.filter((v) => v !== 'Name'))];
        
        // filter by both unitDisabled and unitHidden lists
        if (this.viewer && this.viewer.propertyViewer) {
            return allAttributes.filter(attr => {
                // filter out if in unitDisabled OR unitHidden
                return !this.viewer.propertyViewer.unitDisabled.includes(attr) && 
                       !this.viewer.propertyViewer.unitHidden.includes(attr);
            });
        }
        
        return allAttributes;
    }

    refresh() {
        if (!this.isLoaded || !this.data) return;
        
        while (this.body.firstChild) {
            this.body.removeChild(this.body.firstChild);
        }
        
        this.#addBody(this.data);
    }

    /**
     */
    load(data, options) {
        options = options ?? {};
        this.data = data;
        
        this.removeTable();
        if (Object.keys(data).length === 0) {
            this.isLoaded = false;
            return;
        }

        document
            .getElementById('unit-table-buttons')
            .classList.remove('d-none');

        this.attributes = this.#getAttributes(data);
        this.#createBaseTable();

        this.#addHeader(this.attributes);
        this.#addBody(data);
        
        this.isLoaded = true;
    }
}
