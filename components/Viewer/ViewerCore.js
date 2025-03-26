import TowerTable from '../TowerTable.js';
import UnitTable from '../UnitTable.js';
import ButtonSelection from '../ButtonSelection.js';
import ToggleButton from '../ToggleButton.js';
import TowerManager from '../../TowerComponents/TowerManager.js';
import TableDataManagement from '../TableDataManagement.js';
import PropertyViewer from '../PropertyViewer.js';
import SidePanel from '../SidePanel.js';
import UpgradeViewer from '../UpgradeViewer.js';
import AddAttributeForm from '../AddAttributeForm.js';
import RemoveAttributeForm from '../RemoveAttributeForm.js';
import UnitManager from '../../TowerComponents/UnitManager.js';
import BoostPanel from '../BoostPanel.js';
import CloneTowerForm from '../CloneTowerForm.js';
import LuaViewer from '../LuaConverter/index.js';
import WikitextViewer from '../WikitextViewer.js';
import ViewerUI from './ViewerUI.js';
import ViewerData from './ViewerData.js';
import ViewerTable from './ViewerTable.js';
import ViewerWikitable from './ViewerWikitable.js';
import ViewerUtils from './ViewerUtils.js';

class ViewerCore {
    constructor(app) {
        this.app = app;

        // setting up managers for units and towers
        this.unitManager = new UnitManager('units');
        this.unitDeltaManager = new UnitManager('unitDeltas');
        this.defaultTowerManager = new TowerManager('default');
        this.deltaTowerManager = new TowerManager('delta');

        // Mix in other modules first, before using their methods
        Object.assign(this, ViewerUI.methods);
        Object.assign(this, ViewerData.methods);
        Object.assign(this, ViewerTable.methods);
        Object.assign(this, ViewerWikitable.methods);
        Object.assign(this, ViewerUtils.methods);

        // Now we can use the methods from these modules
        
        // hooking up the property viewer and side panel
        this.propertyViewer = new PropertyViewer(
            this,
            document.getElementById('property-viewer')
        );
        this.sidePanel = new SidePanel();

        this.upgradeViewer = new UpgradeViewer(this);
        this.boostPanel = new BoostPanel(this);

        // grabbing the tower name heading
        this.towerNameH1 = document.querySelector('#tower-name');

        // setting up button selections for variants and views
        this.towerVariants = new ButtonSelection(
            document.querySelector('#tower-variants')
        );

        this.tableView = new ButtonSelection(
            document.querySelector('#table-view')
        ).setButtons(['Table', 'Wikitable', 'JSON']);
        this.tableView.root.addEventListener('submit', () => this.loadBody());

        // toggle button for delta view
        this.buttonDeltaButton = new ToggleButton(
            document.querySelector('#button-delta button'),
            { state: true }
        );

        // reloads when toggle changes
        this.buttonDeltaButton.element.addEventListener('toggled', (() => {this.reload()}).bind(this))

        this.towerViewDropdownButton = document.querySelector(
            '#tower-view-dropdown'
        );

        // setting up tables and viewers
        this.towerTable = new TowerTable(
            document.querySelector('#tower-table'),
            this
        );
        this.unitTable = new UnitTable(
            document.querySelector('#unit-table'),
            this
        );

        this.jsonViewer = new JSONViewer();
        this.luaViewer = new LuaViewer();

        // json copy button setup - now works because onCopyJSON exists
        this.jsonCopy = document.querySelector('#json-copy');
        this.jsonCopy.addEventListener('click', this.onCopyJSON.bind(this));
        
        // toggle for showing combined json
        this.showCombinedJSON = document.querySelector('#show-combined-json');
        if (this.showCombinedJSON) {
            this.showCombinedJSONActive = true; // default to active state
            
            // applies active styling immediately
            this.showCombinedJSON.classList.remove('btn-outline-secondary');
            this.showCombinedJSON.classList.add('btn-primary');
            
            this.showCombinedJSON.addEventListener('click', () => {
                this.showCombinedJSONActive = !this.showCombinedJSONActive; // toggle state
                
                // toggles button appearance
                if (this.showCombinedJSONActive) {
                    this.showCombinedJSON.classList.remove('btn-outline-secondary');
                    this.showCombinedJSON.classList.add('btn-primary');
                } else {
                    this.showCombinedJSON.classList.remove('btn-primary');
                    this.showCombinedJSON.classList.add('btn-outline-secondary');
                }
                this.clearJSON();
                this.loadJSON();
            });
        }

        // Set up faithful format toggle
        this.useFaithfulFormat = false;
        this.useFaithfulFormatButton = document.querySelector('#use-faithful-format');
        if (this.useFaithfulFormatButton) {
            this.useFaithfulFormatButton.addEventListener('click', () => {
                this.useFaithfulFormat = !this.useFaithfulFormat;
                
                if (this.useFaithfulFormat) {
                    this.useFaithfulFormatButton.classList.add('btn-primary');
                    this.useFaithfulFormatButton.classList.remove('btn-outline-secondary');
                } else {
                    this.useFaithfulFormatButton.classList.remove('btn-primary');
                    this.useFaithfulFormatButton.classList.add('btn-outline-secondary');
                }
                
                if (this.tableView.getSelectedName() === 'Wikitable') {
                    this.loadWikitableContent();
                }
            });
        }

        // import button setup
        this.importButtonOpen = document.querySelector('#json-import');
        this.importButtonOpen.addEventListener(
            'click',
            (() => {
                document.querySelector('#json-import-text').value = '';
            }).bind(this)
        );

        // import submit button
        this.importButtonSubmit = document.querySelector('#json-import-submit');
        this.importButtonSubmit.addEventListener(
            'click',
            (() => {
                this.import(
                    document.querySelector('#json-import-text').value,
                    true
                );
            }).bind(this)
        );

        // export button
        this.exportButton = document.querySelector('#json-export');
        this.exportButton.addEventListener(
            'click',
            (() => {
                if (this.showCombinedJSON && this.showCombinedJSONActive) {
                    this.exportTowerWithUnits();
                } else {
                    this.export(JSON.stringify(this.tower.json));
                }
            }).bind(this)
        );
        
        // export with units button
        this.exportWithUnitsButton = document.querySelector('#json-export-with-units');
        if (this.exportWithUnitsButton) {
            this.exportWithUnitsButton.addEventListener(
                'click',
                this.exportTowerWithUnits.bind(this)
            );
        }

        // setting up more management stuff
        this.tableManagement = new TableDataManagement(this);
        new AddAttributeForm(this);
        new CloneTowerForm(this);
        this.removeAttributeForm = new RemoveAttributeForm(this);

        // starts wikitable setup
        this.wikitablePanel = document.querySelector('#wikitable-panel');
        this.wikitableContent = document.querySelector('#wikitable');
        this.wikitableCopy = document.querySelector('#wikitable-copy');
        this.wikitableCopy.addEventListener('click', this.onCopyWikitable.bind(this));
        
        this.wikitableExport = document.querySelector('#wikitable-export');
        this.wikitableExport.addEventListener('click', this.exportWikitable.bind(this));

        // Create wikitable viewer instance
        this.wikitextViewer = new WikitextViewer();
        
        // wikitable events
        if (this.setupWikitableEventListeners) {
            this.setupWikitableEventListeners();
        } else if (ViewerWikitable.init) {
            ViewerWikitable.init.call(this);
        }
    }

    // loads up a tower to show
    load(tower) {
        this.tower = tower;
        this.deltaTower = this.deltaTowerManager.towers[this.tower.name];

        this.setVariantButtons();
        this.unitManager.load();
        this.unitDeltaManager.load();

        this.loadBody();
    }

    // refreshes everything
    reload() {
        this.unitManager.load();
        this.unitDeltaManager.load();

        this.loadBody();
    }

    // gets the current skin being viewed
    getActiveSkin() {
        return this.tower.skins[this.towerVariants.getSelectedName()];
    }
}

export default ViewerCore;
