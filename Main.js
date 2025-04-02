import TowerManager from './TowerComponents/TowerManager.js';
import Dropdown from './components/Dropdown.js';
import Viewer from './components/Viewer/index.js';
import UpdateLog from './components/UpdateLog.js';
import SidebarToggle from './components/SidebarToggle.js';
import MobileNav from './components/MobileNav.js';
import Alert from './components/Alert.js';

const TDSVersion = '1.58.1';

class App {
    constructor() {
        this.towerManager = new TowerManager('New');

        window.state = {
            boosts: {
                tower: {
                    RateOfFireBug: 0,
                    extraCooldown: 0,
                    firerateBuff: 0,
                    damageBuff: 0,
                    rangeBuff: 0,
                    discount: 0,
                },
                unit: {
                    RateOfFireBug: 0,
                    extraCooldown: 0,
                    firerateBuff: 0,
                    damageBuff: 0,
                    rangeBuff: 0,
                    healthBuff: 0,
                    spawnrateBuff: 0,
                },
            },
            cache: {},
        };

        this.towerToSelect = null;
        this.viewer = null;

        // checks tower parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('tower')) {
            this.towerToSelect = urlParams.get('tower');
        }
    }

    addTowerOption(name) {
        this.dropdown.options.push(name);

        this.dropdown.setOptions(this.dropdown.options);

        if (window.setupSearch) {
            window.setupSearch();
        }
    }

    start() {
        this.dropdown = new Dropdown(
            document.querySelector('#Tower-Selector input'),
            document.querySelector('#Tower-Selector .dropdown-menu'),
            this.towerManager.towerNames
        );

        this.viewer = new Viewer(this);

        // attach event listener
        this.dropdown.textForm.addEventListener('submit', (e) => {
            const towerName = e.detail || e.target?.value;

            if (towerName) {
                // update url with the selected tower for shareable links
                const url = new URL(window.location);
                url.searchParams.set('tower', towerName);
                window.history.replaceState({}, '', url);

                loadTower(this.towerManager.towers[towerName], this.viewer);
            }
        });

        if (this.towerToSelect) {
            const towerName = this.findClosestTowerName(this.towerToSelect);
            if (towerName) {
                const event = new CustomEvent('submit', {
                    detail: towerName
                });
                this.dropdown.textForm.dispatchEvent(event);

                // clear the search box after tower is selected
                setTimeout(() => {
                    this.dropdown.textForm.value = '';
                }, 10);
            } else {
                // clear URL parameters and show landing page
                clearUrlAndShowLanding();
            }
        } else {
            // show landing page by default instead of loading first tower (accel)
            loadTower(null, this.viewer);
        }
    }

    // find closest tower name match (case insensitive)
    findClosestTowerName(searchName) {
        searchName = searchName.toLowerCase();

        // try exact match
        const exactMatch = this.towerManager.towerNames.find(name =>
            name.toLowerCase() === searchName
        );

        if (exactMatch) return exactMatch;

        // try starts with
        const startsWithMatch = this.towerManager.towerNames.find(name =>
            name.toLowerCase().startsWith(searchName)
        );

        if (startsWithMatch) return startsWithMatch;

        // check if any tower contains the search term
        const containsMatch = this.towerManager.towerNames.find(name =>
            name.toLowerCase().includes(searchName)
        );

        return containsMatch || null;
    }
}

// loadTower function to work with the Viewer class
function loadTower(tower, viewer) {
    if (tower) {
        // hide landing page
        document.getElementById('landing-page').classList.add('d-none');

        if (viewer) {
            viewer.load(tower);
        }
    } else {
        // show landing page
        document.getElementById('landing-page').classList.remove('d-none');

        document.querySelector('.table-responsive').classList.add('d-none');
        document.getElementById('json-panel').classList.add('d-none');
        document.getElementById('wikitable-panel').classList.add('d-none');
        document.getElementById('lua-panel').classList.add('d-none');

        const allSpinners = document.querySelectorAll('.spinner-border');
        allSpinners.forEach(spinner => {
            spinner.style.display = 'none';
        });
    }
}

function clearUrlAndShowLanding() {
    // clear URL parameters without refreshing the page
    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, '', url);

    loadTower(null);
}

// version number html
function setVersionNumber() {
    const versionElements = document.querySelectorAll('.tdsversion');
    versionElements.forEach(element => {
        element.textContent = TDSVersion;
    });
}

function loadUpdateLog() {
    fetch('updatelog.json')
        .then(response => response.json())
        .then(data => {
            const updateLogModal = document.getElementById('update-log-content');
            const updateLogLanding = document.getElementById('landing-update-log');

            const updateHtml = generateUpdateLogHtml(data);

            if (updateLogModal) updateLogModal.innerHTML = updateHtml;
            if (updateLogLanding) {
                updateLogLanding.innerHTML = generateUpdateLogHtml(data);
            }
        })
        .catch(error => {
            console.error('Error loading update log:', error);
            const errorHtml = '<div class="alert alert-danger">Failed to load update log.</div>';

            const updateLogModal = document.getElementById('update-log-content');
            const updateLogLanding = document.getElementById('landing-update-log');

            if (updateLogModal) updateLogModal.innerHTML = errorHtml;
            if (updateLogLanding) updateLogLanding.innerHTML = errorHtml;
        });
}

function generateUpdateLogHtml(updates) {
    return updates.map(update => `
        <div class="update-item mb-3">
            <h5>${update.version} <small class="text-muted">${update.date}</small></h5>
            <ul class="ps-3">
                ${update.changes.map(change => `<li>${change}</li>`).join('')}
                <li>Various changes</li>
            </ul>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', loadUpdateLog);

window.addEventListener('DOMContentLoaded', () => {
    const mobileNav = new MobileNav();
    window.mobileNav = mobileNav;
});

window.clearUrlAndShowLanding = clearUrlAndShowLanding;

const app = new App();
app.start();

document.addEventListener('DOMContentLoaded', () => {
    new UpdateLog();
    setVersionNumber();
    new SidebarToggle();
    
    // Listen for calculation system changes
    document.addEventListener('calculationSystemChanged', (e) => {
        if (app.viewer && e.detail.tower) {
            // Reload the tower to apply the new calculation system
            app.viewer.reload();
        }
    });
});

// calculation system toggle and draggable func
document.addEventListener('DOMContentLoaded', function() {
    const calcSystemToggle = document.getElementById('toggle-calc-system');
    const calcSystemSection = document.getElementById('calc-system-section');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mainContainer = document.querySelector('.container-main');
    
    if (calcSystemToggle && calcSystemSection) {
        if (localStorage.getItem('showCalcSystem') === 'true') {
            calcSystemSection.classList.remove('d-none');
            calcSystemSection.classList.add('animate-fade-in');
            calcSystemToggle.classList.remove('btn-outline-secondary');
            calcSystemToggle.classList.add('btn-primary');
        }
        
        calcSystemToggle.addEventListener('click', function() {
            const currentlyVisible = localStorage.getItem('showCalcSystem') === 'true';
            const newVisibility = !currentlyVisible;
            localStorage.setItem('showCalcSystem', newVisibility);
            
            calcSystemToggle.classList.toggle('btn-outline-secondary');
            calcSystemToggle.classList.toggle('btn-primary');
            
            // visibility on sidebar state
            const isSidebarCollapsed = mainContainer.classList.contains('sidebar-collapsed');
            
            if (isSidebarCollapsed) {
                if (newVisibility) {
                    floatingCalcSystem.innerHTML = calcSystemSection.innerHTML;
                    floatingCalcSystem.classList.remove('d-none');
                    setTimeout(() => {
                        floatingCalcSystem.style.opacity = '1';
                    }, 50);
                    
                    // readd event listeners to the select in floating panel
                    const newSelect = floatingCalcSystem.querySelector('select');
                    if (newSelect) {
                        const originalSelect = document.getElementById('calculation-system-select');
                        if (originalSelect) {
                            newSelect.value = originalSelect.value;
                            newSelect.addEventListener('change', function() {
                                originalSelect.value = this.value;
                                originalSelect.dispatchEvent(new Event('change'));
                            });
                        }
                    }
                } else {
                    // hide floating panel
                    floatingCalcSystem.style.opacity = '0';
                    setTimeout(() => {
                        floatingCalcSystem.classList.add('d-none');
                    }, 300);
                }
            } else {
                // when sidebar is expanded, toggle sidebar panel
                calcSystemSection.classList.toggle('d-none');
                if (!calcSystemSection.classList.contains('d-none')) {
                    calcSystemSection.classList.add('animate-fade-in');
                } else {
                    calcSystemSection.classList.remove('animate-fade-in');
                }
            }
        });
        
        const floatingCalcSystem = document.createElement('div');
        floatingCalcSystem.id = 'floating-calc-system';
        floatingCalcSystem.className = 'd-none position-fixed bg-dark text-white border border-secondary rounded shadow-sm';
        floatingCalcSystem.style.cssText = 'left: 65px; top: 10px; z-index: 1030; width: 280px; opacity: 0;';
        document.body.appendChild(floatingCalcSystem);
        
        function updateFloatingPanel() {
            const isCalcSystemVisible = localStorage.getItem('showCalcSystem') === 'true';
            const isSidebarCollapsed = mainContainer.classList.contains('sidebar-collapsed');
            const isMobileView = window.innerWidth <= 768; // Check for mobile view
            
            // don't show floating panel on mobile devices
            if (isMobileView) {
                floatingCalcSystem.style.opacity = '0';
                setTimeout(() => {
                    floatingCalcSystem.classList.add('d-none');
                }, 50);
                return;
            }
            
            if (isSidebarCollapsed && isCalcSystemVisible) {
                floatingCalcSystem.innerHTML = calcSystemSection.innerHTML;
                floatingCalcSystem.classList.remove('d-none');
                
                setTimeout(() => {
                    floatingCalcSystem.style.opacity = '1';
                    floatingCalcSystem.style.transition = 'opacity 0.3s ease-in-out';
                }, 50);
                
                const newSelect = floatingCalcSystem.querySelector('select');
                if (newSelect) {
                    const originalSelect = document.getElementById('calculation-system-select');
                    if (originalSelect) {
                        newSelect.value = originalSelect.value;
                        
                        newSelect.addEventListener('change', function() {
                            originalSelect.value = this.value;
                            originalSelect.dispatchEvent(new Event('change'));
                        });
                    }
                }
                
                // fix duplicate panel bug
                calcSystemSection.classList.add('d-none');
            } else if (!isSidebarCollapsed && isCalcSystemVisible) {
                calcSystemSection.classList.remove('d-none');
                
                floatingCalcSystem.style.opacity = '0';
                setTimeout(() => {
                    floatingCalcSystem.classList.add('d-none');
                }, 300);
            } else {
                calcSystemSection.classList.add('d-none');
                floatingCalcSystem.style.opacity = '0';
                setTimeout(() => {
                    floatingCalcSystem.classList.add('d-none');
                }, 300);
            }
        }
        
        let isDragging = false;
        let offsetX, offsetY;
        
        // dragging functionality
        floatingCalcSystem.addEventListener('mousedown', function(e) {
            // only allow dragging from the header
            if (e.target.closest('.card-header')) {
                isDragging = true;
                
                const rect = floatingCalcSystem.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                
                floatingCalcSystem.classList.add('dragging');
                
                e.preventDefault();
            }
        });
        
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                const x = e.clientX - offsetX;
                const y = e.clientY - offsetY;
                
                const maxX = window.innerWidth - floatingCalcSystem.offsetWidth;
                const maxY = window.innerHeight - floatingCalcSystem.offsetHeight;
                
                const newX = Math.max(0, Math.min(x, maxX));
                const newY = Math.max(0, Math.min(y, maxY));
                
                floatingCalcSystem.style.left = newX + 'px';
                floatingCalcSystem.style.top = newY + 'px';
            }
        });
        
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                floatingCalcSystem.classList.remove('dragging');
            }
        });
        
        sidebarToggle.addEventListener('click', updateFloatingPanel);
        setTimeout(updateFloatingPanel, 100);
    }
});

// localStorage reset functionality
document.addEventListener('DOMContentLoaded', function() {
    const resetLocalStorageBtn = document.getElementById('reset-localstorage');
    const settingsModal = document.getElementById('settings-modal');
    
    if (resetLocalStorageBtn) {
        resetLocalStorageBtn.addEventListener('click', function() {
            const confirmReset = confirm('This will delete ALL saved data and reset the website to its default state. This action cannot be undone. Are you sure you want to continue?');
            
            if (confirmReset) {
                localStorage.clear();
                
                const alert = new Alert('All data cleared successfully. Reloading page...', {
                    alertStyle: 'alert-success',
                });
                alert.fire();

                if (settingsModal) {
                    const modal = bootstrap.Modal.getInstance(settingsModal);
                    if (modal) {
                        modal.hide();
                    }
                }

                setTimeout(() => {
                    window.location.reload();
                }, 1690);
            }
        });
    }
});