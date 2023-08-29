import ButtonSelection from './ButtonSelection.js';

export default class SidePanel {
    constructor() {
        this.sideViewPanel = document.getElementById('property-viewer-section');
        this.levelViewPanel = document.getElementById('level-view');
        this.boostsViewPanel = document.getElementById('boost-view');

        this.buttonSelection = new ButtonSelection(
            document.getElementById('side-selection-radio')
        );
        this.buttons = ['Upgrades', 'Views', 'Boosts'];
        this.buttonSelection.setButtons(this.buttons);
        this.buttonSelection.root.addEventListener(
            'submit',
            ((e) => {
                this.showPanel(e.detail);
            }).bind(this)
        );

        this.showPanel(this.buttons[0]);
    }

    showPanel(panelName) {
        this.hideAll();
        switch (panelName) {
            case 'Views':
                this.sideViewPanel.classList.remove('d-none');
                break;
            case 'Upgrades':
                this.levelViewPanel.classList.remove('d-none');
                break;
            case 'Boosts':
                this.boostsViewPanel.classList.remove('d-none');
                break;
        }
    }

    hideAll() {
        this.sideViewPanel.classList.add('d-none');
        this.levelViewPanel.classList.add('d-none');
        this.boostsViewPanel.classList.add('d-none');
    }

    onUpdate() {
        this.showPanel(this.buttonSelection.getSelectedName());
    }
}
