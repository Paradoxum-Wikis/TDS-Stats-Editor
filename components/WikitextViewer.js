class WikitextViewer {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'wikitable-code-container';
        this.container.style.height = '70vh';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        
        // this creates pre/code elements for syntax highlighting
        this.pre = document.createElement('pre');
        this.pre.className = 'text-white mb-3';
        
        this.code = document.createElement('code');
        this.code.className = 'wikitable-code';
        
        this.pre.appendChild(this.code);
        this.container.appendChild(this.pre);
    }
    
    getContainer() {
        return this.container;
    }
    
    showWikitext(wikitext) {
        // force reset everything to avoid conflicts
        this.code.innerHTML = '';
        
        // apply them colors yuppers
        const highlighted = this.highlightWikitext(wikitext);
        this.code.innerHTML = highlighted;
        
        return this;
    }
    
    highlightWikitext(text) {
        // replace special characters before anything else
        text = text.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
        
        // highlight comments before other elements to avoid any interference
        text = text.replace(/(&lt;!--)([\s\S]*?)(&gt;)/g, '<span class="wiki-comment">$1$2$3</span>');
        
        // div tags
        text = text.replace(/(&lt;div.*&gt;)/g, '<span class="wiki-div">$1</span>');
        text = text.replace(/(&lt;\/div&gt;)/g, '<span class="wiki-div">$1</span>');
        
        // table syntax
        text = text.replace(/(\{\||\|\})/g, '<span class="table-delimiter">$1</span>');
        text = text.replace(/(\|-)/g, '<span class="table-row">$1</span>');
        text = text.replace(/(\|\+\s*)('''[^']+''')/g, '<span class="table-caption">$1</span><span class="table-caption-text">$2</span>');
        
        // cell and header delimiters
        text = text.replace(/(!!)/g, '<span class="table-header-delimiter">$1</span>');
        text = text.replace(/(\|\|)/g, '<span class="table-cell-delimiter">$1</span>');
        
        // 1st vertical bars
        text = text.replace(/^(\|)(?!-|\+)/gm, '<span class="table-cell-delimiter">$1</span>');
        
        // headers (must come after !! replacment)
        text = text.replace(/^(!)/gm, '<span class="table-header">$1</span>');
        
        // highlight formatting
        text = text.replace(/(''')(.*?)(''')/g, '<span class="wiki-bold">$1</span><span class="wiki-bold-text">$2</span><span class="wiki-bold">$3</span>');
        
        // add line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
}

export default WikitextViewer;