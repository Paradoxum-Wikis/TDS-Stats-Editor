class MobileNavigation {
    constructor() {
        this.mobileSidebar = document.querySelector('.mobile-sidebar');
        this.mobileSidebarContent = document.querySelector('.mobile-sidebar-content');
        this.mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
        this.activeSection = null;
        
        // elements we'll clone for the sidebar
        this.controlsSection = document.getElementById('tier-list-controls');
        this.filtersSection = document.getElementById('tower-filters');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        
        // check if url wants a specific section open
        const urlHash = window.location.hash.substring(1);
        if (urlHash === 'controls' || urlHash === 'filters' || urlHash === 'navigation') {
            this.openSection(urlHash);
        }
    }
    
    setupEventListeners() {
        // handle nav button clicks
        this.mobileNavBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionName = btn.getAttribute('data-mobile-section');
                
                // toggle off if already open
                if (this.activeSection === sectionName && this.isSidebarOpen()) {
                    this.closeSidebar();
                    return;
                }
                
                this.openSection(sectionName);
            });
        });
        
        // close when clicking backdrop
        if (this.mobileSidebar) {
            this.mobileSidebar.addEventListener('click', (e) => {
                if (e.target === this.mobileSidebar) {
                    this.closeSidebar();
                }
            });
        }
        
        // close on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.isSidebarOpen()) {
                this.closeSidebar();
            }
        });
        
        // close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isSidebarOpen()) {
                this.closeSidebar();
            }
        });
    }
    
    openSection(sectionName) {
        if (!sectionName) return;
        
        // about section opens a modal instead
        if (sectionName === 'about') {
            this.closeSidebar();
            const aboutModal = document.getElementById('discord-modal');
            if (aboutModal) {
                const bsModal = new bootstrap.Modal(aboutModal);
                bsModal.show();
            }
            return;
        }
        
        this.populateSidebar(sectionName);
        this.updateActiveButton(sectionName);
        this.openSidebar();
        this.activeSection = sectionName;
    }
    
    updateActiveButton(sectionName) {
        this.mobileNavBtns.forEach(btn => {
            const btnSection = btn.getAttribute('data-mobile-section');
            
            btn.classList.toggle('active', btnSection === sectionName);
            
            const iconElement = btn.querySelector('i');
            if (!iconElement) return;
            
            if (btnSection === sectionName) {
                // save original icon
                if (!iconElement.dataset.originalClass) {
                    iconElement.dataset.originalClass = iconElement.className;
                }
                iconElement.className = 'bi bi-x-lg';
            } else if (iconElement.dataset.originalClass) {
                // restore original icon
                iconElement.className = iconElement.dataset.originalClass;
            }
        });
    }
    
    populateSidebar(sectionName) {
        if (!this.mobileSidebarContent) return;
        
        this.mobileSidebarContent.innerHTML = '';
        
        let contentElement = null;
        
        switch (sectionName) {
            case 'controls':
                contentElement = this.controlsSection?.cloneNode(true);
                break;
                
            case 'filters':
                contentElement = this.filtersSection?.cloneNode(true);
                break;
                
            case 'navigation':
                contentElement = this.createNavigationMenu();
                break;
                
            default:
                const message = document.createElement('p');
                message.className = 'text-white';
                message.textContent = 'Unknown section selected.';
                this.mobileSidebarContent.appendChild(message);
                return;
        }
        
        if (contentElement) {
            this.mobileSidebarContent.appendChild(contentElement);
            this.reattachEventListeners(sectionName);
        }
    }
    
    createNavigationMenu() {
        const navContainer = document.createElement('div');
        navContainer.className = 'navigation-links d-grid gap-3 p-3';
        
        const navigationItems = [
            {
                name: 'TDS Wiki',
                url: 'https://tds.fandom.com/wiki/',
                icon: 'bi-journal-text',
                description: 'The Tower Defense Simulator Wiki itself'
            },
            {
                name: 'TDS Statistics Editor',
                url: '../',
                icon: 'bi-bar-chart-fill',
                description: 'Of course, the Statistics Editor'
            },
            {
                name: 'TDS Database',
                url: '../db',
                icon: 'bi-database-fill',
                description: 'The Database housing custom towers made by people like you!'
            },
            {
                name: 'Paradoxum Game Resources',
                url: 'https://resources.tds-editor.live/',
                icon: 'bi-file-image-fill',
                description: 'Resources of ALTER EGO and TDS game pages'
            }
        ];
        
        navigationItems.forEach(item => {
            const button = document.createElement('a');
            button.href = item.url;
            button.className = 'btn btn-outline-primary p-3 d-flex flex-column align-items-center';
            
            const icon = document.createElement('i');
            icon.className = `bi ${item.icon} fs-2 mb-2`;
            
            const name = document.createElement('div');
            name.className = 'fw-bold';
            name.textContent = item.name;
            
            const desc = document.createElement('div');
            desc.className = 'small text-white-50';
            desc.textContent = item.description;
            
            button.appendChild(icon);
            button.appendChild(name);
            button.appendChild(desc);
            
            navContainer.appendChild(button);
        });
        
        return navContainer;
    }
    
    reattachEventListeners(sectionName) {
        switch (sectionName) {
            case 'controls':
                const tierSelect = this.mobileSidebarContent.querySelector('#tier-select');
                const towerInput = this.mobileSidebarContent.querySelector('#tower-input');
                const addTowerBtn = this.mobileSidebarContent.querySelector('#add-tower-btn');
                const resetBtn = this.mobileSidebarContent.querySelector('#reset-tierlist');
                const exportBtn = this.mobileSidebarContent.querySelector('#export-image');
                const copyBtn = this.mobileSidebarContent.querySelector('#copy-tierlist');
                
                if (addTowerBtn) {
                    addTowerBtn.addEventListener('click', () => {
                        const selectedTier = tierSelect?.value || 'S';
                        if (towerInput && towerInput.value) {
                            const towers = towerInput.value.split(',');
                            towers.forEach(tower => {
                                const trimmedName = tower.trim();
                                if (trimmedName) {
                                    window.addTowerToTier(trimmedName, selectedTier);
                                }
                            });
                            towerInput.value = '';
                        }
                    });
                }
                
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        if (confirm('Are you sure you want to reset your tier list?')) {
                            window.resetTierList();
                        }
                    });
                }
                
                if (exportBtn) {
                    exportBtn.addEventListener('click', () => {
                        window.exportTierListImage();
                        this.closeSidebar();
                    });
                }
                
                if (copyBtn) {
                    copyBtn.addEventListener('click', () => {
                        window.copyTierListCode();
                        this.closeSidebar();
                    });
                }
                break;
                
            case 'filters':
                const filterCheckboxes = this.mobileSidebarContent.querySelectorAll('.filter-category');
                filterCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        window.filterTowerGallery();
                    });
                });
                break;
        }
    }
    
    openSidebar() {
        if (this.mobileSidebar) {
            this.mobileSidebar.classList.add('active');
            document.body.classList.add('sidebar-open');
        }
    }
    
    closeSidebar() {
        if (this.mobileSidebar) {
            this.mobileSidebar.classList.remove('active');
            document.body.classList.remove('sidebar-open');
            
            // reset button icons
            this.mobileNavBtns.forEach(btn => {
                btn.classList.remove('active');
                const iconElement = btn.querySelector('i');
                if (iconElement && iconElement.dataset.originalClass) {
                    iconElement.className = iconElement.dataset.originalClass;
                }
            });
            
            this.activeSection = null;
        }
    }
    
    isSidebarOpen() {
        return this.mobileSidebar?.classList.contains('active');
    }
}

// init when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('load', () => {
        window.mobileNav = new MobileNavigation();
        
        window.openMobileSection = (section) => {
            window.mobileNav.openSection(section);
        };
        
        window.closeMobileSidebar = () => {
            window.mobileNav.closeSidebar();
        };
    });
});