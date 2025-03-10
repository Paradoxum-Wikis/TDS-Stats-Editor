import Alert from '../Alert.js';
import WikitableGenerator from '../WikitableGenerator.js';

const ViewerWikitable = {
    methods: {
        loadWikitableContent() {
            // wipe the content first
            this.wikitableContent.innerHTML = '';
            
            // set up a responsive div for the table
            const responsiveDiv = document.createElement('div');
            responsiveDiv.className = 'table-responsive';
            
            // add the wikitext viewer's container to the responsive div
            responsiveDiv.appendChild(this.wikitextViewer.getContainer());
            
            // attach the responsive div to the wikitable content
            this.wikitableContent.appendChild(responsiveDiv);
            
            // make sure we have loaded the unit data
            this.activeUnits = this.populateActiveUnits();
            
            // create a WikitableGenerator instance
            this.wikitableGenerator = new WikitableGenerator(
                this.tower,
                this.activeUnits,
                this.propertyViewer,
                this.towerVariants,
                this 
            );
            
            // generates the wikitable content
            this.currentWikitableContent = this.wikitableGenerator.generateWikitableContent();
            
            // add unit table if units exist
            if (this.activeUnits && Object.keys(this.activeUnits).length > 0) {
                this.currentWikitableContent += "\n\n" + this.wikitableGenerator.generateUnitWikitableContent();
            }
            
            // add notice at the very end
            this.currentWikitableContent += `\n<!-- Generated using the TDS Stats Editor (v1.1) on ${new Date().toUTCString()} -->\n`;
            
            // show the wikitextViewer with syntax highlighting
            this.wikitextViewer.showWikitext(this.currentWikitableContent);
        },

        // handles copying wikitable to clipboard
        onCopyWikitable() {
            navigator.clipboard.writeText(this.currentWikitableContent);
            const alert = new Alert('Wikitable Copied!', {
                alertStyle: 'alert-success',
            });
            alert.fire();
        },

        // exports wikitable to a file
        exportWikitable() {
            const towerName = this.tower.name;
            const activeVariant = this.towerVariants.getSelectedName();
            const displayedVariant = activeVariant === 'Default' ? '' : `${activeVariant}-`;
            const filename = `${displayedVariant}${towerName}-wikitable.txt`;
            this.downloadFile(this.currentWikitableContent, filename, 'text/plain');
        }
    }
};

export default ViewerWikitable;
