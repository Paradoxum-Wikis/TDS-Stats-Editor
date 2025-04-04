export default class KeyboardNavigation {
    constructor() {
        this.addKeyboardShortcuts();
        this.currentHighlightedIndex = -1;
        this.setupFocusStyles();
        this.setupTabNavigation();
    }

    setupFocusStyles() {
        // add class to focusable elements to highlight them with keyboard css
        this.makeElementsKeyboardAccessible([
            'button', 'a', 'input', 'select', 'textarea',
            '[tabindex]:not([tabindex="-1"])'
        ].join(','));
    }
    
    makeElementsKeyboardAccessible(selector) {
        // track input method
        let usingKeyboard = false;
        
        document.addEventListener('keydown', event => {
            if (event.key === 'Tab') {
                usingKeyboard = true;
            }
        });
        
        document.addEventListener('mousedown', () => {
            usingKeyboard = false;
            // remove highlight from any currently focused element
            document.activeElement?.classList.remove('keyboard-focus-visible');
        });
        
        document.addEventListener('focusin', event => {
            // only add class if focused through keyboard
            if (usingKeyboard && event.target.matches(selector)) {
                event.target.classList.add('keyboard-focus-visible');
            }
        });
        
        document.addEventListener('focusout', event => {
            event.target.classList.remove('keyboard-focus-visible');
        });
        
        // watch for new elements
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.matches(selector) && !node.hasAttribute('tabindex')) {
                                node.setAttribute('tabindex', '0');
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    setupTabNavigation() {
        // make sidebar toggle keyboard-friendly
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.setAttribute('tabindex', '0');
            sidebarToggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    sidebarToggle.click();
                }
            });
        }
        
        this.addComponentKeyboardNavigation();
    }
    
    addComponentKeyboardNavigation() {
        // arrow key navigation for table
        const towerTable = document.getElementById('tower-table');
        if (towerTable) {
            towerTable.addEventListener('keydown', (e) => {
                if (e.target.tagName === 'TD' || e.target.tagName === 'INPUT') {
                    const currentCell = e.target.tagName === 'INPUT' ? e.target.closest('td') : e.target;
                    const currentRow = currentCell.parentElement;
                    const cellIndex = Array.from(currentRow.cells).indexOf(currentCell);
                    
                    switch (e.key) {
                        case 'ArrowUp':
                            if (currentRow.previousElementSibling) {
                                const targetCell = currentRow.previousElementSibling.cells[cellIndex];
                                const input = targetCell.querySelector('input');
                                if (input) input.focus();
                                else targetCell.focus();
                            }
                            break;
                        case 'ArrowDown':
                            if (currentRow.nextElementSibling) {
                                const targetCell = currentRow.nextElementSibling.cells[cellIndex];
                                const input = targetCell.querySelector('input');
                                if (input) input.focus();
                                else targetCell.focus();
                            }
                            break;
                        case 'ArrowLeft':
                            if (currentCell.previousElementSibling) {
                                const input = currentCell.previousElementSibling.querySelector('input');
                                if (input) input.focus();
                                else currentCell.previousElementSibling.focus();
                            }
                            break;
                        case 'ArrowRight':
                            if (currentCell.nextElementSibling) {
                                const input = currentCell.nextElementSibling.querySelector('input');
                                if (input) input.focus();
                                else currentCell.nextElementSibling.focus();
                            }
                            break;
                    }
                }
            });
        }
    }

    addKeyboardShortcuts() {
        // global shortcuts
        document.addEventListener('keydown', (event) => {
            if (document.body.classList.contains('modal-open')) {
                if (event.key !== 'Escape') {
                    return;
                }
            }
            
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                const searchInput = document.querySelector('#Tower-Selector input[type="search"]');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // view mode shortcuts
            if (event.altKey && !event.ctrlKey && !event.shiftKey) {
                const viewButtons = document.querySelector('#table-view')?.querySelectorAll('button');
                if (viewButtons) {
                    if (event.key === '1' && viewButtons.length >= 1) {
                        event.preventDefault();
                        viewButtons[0].click();
                    } else if (event.key === '2' && viewButtons.length >= 2) {
                        event.preventDefault();
                        viewButtons[1].click();
                    } else if (event.key === '3' && viewButtons.length >= 3) {
                        event.preventDefault();
                        viewButtons[2].click();
                    } else if (event.key === '4' && viewButtons.length >= 4) {
                        event.preventDefault();
                        viewButtons[3].click();
                    }
                }
            }
            
            if (event.altKey && event.key.toLowerCase() === 'd') {
                event.preventDefault();
                document.getElementById('button-delta')?.click();
            }
            
            if (event.altKey && event.key.toLowerCase() === 'c') {
                event.preventDefault();
                document.getElementById('toggle-calc-system')?.click();
            }

            if (event.altKey && event.key.toLowerCase() === 'v') {
                event.preventDefault();
                document.getElementById('button-clone')?.click();
            }
            
            if (event.altKey && event.key.toLowerCase() === 's') {
                event.preventDefault();
                document.getElementById('settings-toggle')?.click();
            }
            
            if (event.altKey && event.key.toLowerCase() === 'l') {
                event.preventDefault();
                document.getElementById('sidebar-toggle')?.click();
            }

            if (event.key === 'F1' || (event.altKey && event.key.toLowerCase() === 'h')) {
                event.preventDefault();
                const shortcutsModal = new bootstrap.Modal(document.getElementById('keyboard-shortcuts-modal'));
                shortcutsModal.show();
            }

            if (event.key === 'F2') {
                event.preventDefault();
                window.location.href = 'https://tds.fandom.com/wiki/';
            }
            
            if (event.key === 'F3') {
                event.preventDefault();
                window.location.href = '/db';
            }            
        });
        
        // search input shortcuts
        const searchInput = document.querySelector('#Tower-Selector input[type="search"]');
        if (searchInput) {
            searchInput.addEventListener('keydown', (event) => {
                const dropdown = document.querySelector('#Tower-Selector .dropdown-menu');
                if (!dropdown || !dropdown.classList.contains('d-block')) return;
                
                const options = Array.from(dropdown.querySelectorAll('.dropdown-item:not(.d-none)'));
                if (!options.length) return;
                
                switch(event.key) {
                    case 'ArrowDown':
                        event.preventDefault();
                        this.navigateDropdown(1, options);
                        break;
                    
                    case 'ArrowUp':
                        event.preventDefault();
                        this.navigateDropdown(-1, options);
                        break;
                        
                    case 'Enter':
                        if (this.currentHighlightedIndex >= 0 && this.currentHighlightedIndex < options.length) {
                            event.preventDefault();
                            options[this.currentHighlightedIndex].dispatchEvent(new MouseEvent('mousedown'));
                        }
                        break;
                        
                    case 'Escape':
                        event.preventDefault();
                        searchInput.blur();
                        break;
                }
            });
            
            searchInput.addEventListener('focusout', () => {
                this.currentHighlightedIndex = -1;
            });
            
            searchInput.addEventListener('input', () => {
                this.currentHighlightedIndex = -1;
                this.removeHighlightFromAll();
            });
        }
    }
    
    navigateDropdown(direction, options) {
        this.removeHighlightFromAll();
        
        if (this.currentHighlightedIndex === -1 && direction === -1) {
            this.currentHighlightedIndex = options.length - 1;
        } else {
            this.currentHighlightedIndex += direction;
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
    
    removeHighlightFromAll() {
        const highlightedItems = document.querySelectorAll('#Tower-Selector .dropdown-menu .keyboard-highlighted');
        highlightedItems.forEach(item => item.classList.remove('keyboard-highlighted'));
    }
}