/**
 * TextFormatter.js
 * convert special formatting characters in text to color spans
 */

class TextFormatter {
    constructor() {
        this.formatters = [
            {
                // Generic color: \c<color_value>\text\c\ becomes <span style="color:<color_value>">text</span>
                // <color_value> can be a name (red, blue) or hex (#fff, #ff0000), or etc.
                pattern: /\\c([a-zA-Z]+|#[0-9a-fA-F]{3,6})\\(.*?)\\c\\/g,
                replacement: '<span style="color:$1">$2</span>'
            }
        ];
    }

    /**
     * apply formatting to a string 
     * @param {string} text - Text to format
     * @param {boolean} escapeHtml - Whether to escape HTML entities (default: true)
     * @returns {string} - Formatted HTML
     */
    format(text, escapeHtml = true) {
        if (!text) return '';
        
        let formattedText = text;
        
        // ONLY escape HTML if requested (for user input)
        if (escapeHtml) {
            formattedText = formattedText.replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
        }
        
        this.formatters.forEach(formatter => {
            formattedText = formattedText.replace(formatter.pattern, formatter.replacement);
        });
        
        return formattedText;
    }

    /**
     * formatting for a textarea or input element
     * @param {HTMLElement} element - The element to enable formatting on
     * @param {HTMLElement} previewElement - Optional element to show formatted preview
     */
    initForElement(element, previewElement = null) {
        if (!element) return;
        
        // stores original input handler
        const originalInputHandler = element.oninput;
        
        // our formatting handler
        element.oninput = (e) => {
            // call original handler if it exists
            if (originalInputHandler) originalInputHandler.call(element, e);
            
            // if there's a preview element then update it with formatted content
            if (previewElement) {
                previewElement.innerHTML = this.format(element.value);
            }
        };
        
        // adds the data attribute to mark as formatter enabled
        element.dataset.formatterEnabled = 'true';
    }
}

export default new TextFormatter();