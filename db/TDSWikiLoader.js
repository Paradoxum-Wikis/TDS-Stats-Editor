/**
 * TDSWikiLoader.js
 * Loads the content it got from the fetcher
 */

document.addEventListener('DOMContentLoaded', function () {
    const savedView = localStorage.getItem('towerViewPreference') || 'grid';
    
    // start in grid view by default
    const allTowers = document.getElementById('all-towers');
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    
    // remove ALL responsive grid classes (bootstrap bug with this site)
    function removeAllGridClasses(element) {
        element.classList.remove(
            'row-cols-1',
            'row-cols-sm-1',
            'row-cols-md-2',
            'row-cols-lg-3',
            'row-cols-lg-5',
            'row-cols-xl-4',
            'row-cols-xxl-5'
        );
    }
    
    if (savedView === 'list') {
        removeAllGridClasses(allTowers);
        allTowers.classList.add('row-cols-1');
        
        listViewBtn.classList.add('active', 'btn-primary');
        listViewBtn.classList.remove('btn-outline-primary');
        gridViewBtn.classList.remove('active', 'btn-primary');
        gridViewBtn.classList.add('btn-outline-primary');
        
    } else {
        removeAllGridClasses(allTowers);
        allTowers.classList.add(
            'row-cols-sm-1', 
            'row-cols-md-2', 
            'row-cols-lg-3', 
            'row-cols-xl-4', 
            'row-cols-xxl-5'
        );
        
        gridViewBtn.classList.add('active', 'btn-primary');
        gridViewBtn.classList.remove('btn-outline-primary');
        listViewBtn.classList.remove('active', 'btn-primary');
        listViewBtn.classList.add('btn-outline-primary');
    }
    
    // toggle GridScale.css
    function toggleGridStylesheet(enabled) {
        const gridStyleLink = document.querySelector('link[href="GridScale.css"]');
        if (gridStyleLink) {
            gridStyleLink.disabled = !enabled;
        }
    }
    
    toggleGridStylesheet(savedView === 'grid');
    
    // open upload modal
    document.getElementById('upload-tower-btn').addEventListener('click', function () {
        const uploadModal = new bootstrap.Modal(document.getElementById('uploadTowerModal'));
        uploadModal.show();
    });

    // switch to grid view
    document.getElementById('grid-view-btn').addEventListener('click', function () {
        allTowers.classList.add('row-cols-1', 'row-cols-sm-1', 'row-cols-md-2', 'row-cols-lg-3', 'row-cols-xl-4', 'row-cols-xxl-5');
        allTowers.classList.remove('row-cols-1');
        
        gridViewBtn.classList.add('active', 'btn-primary');
        gridViewBtn.classList.remove('btn-outline-primary');
        listViewBtn.classList.remove('active', 'btn-primary');
        listViewBtn.classList.add('btn-outline-primary');
        
        // enable the grid stylesheet
        toggleGridStylesheet(true);
        
        // apply grid view to cards and also move badges
        document.querySelectorAll('#all-towers .card').forEach(card => {
            card.classList.remove('list-view-card');
            
            const listBadgesContainer = card.querySelector('.card-body > .mt-2');
            if (listBadgesContainer && listBadgesContainer.innerHTML.trim()) {
                const absoluteContainer = document.createElement('div');
                absoluteContainer.className = 'position-absolute top-0 end-0 p-2';
                absoluteContainer.innerHTML = listBadgesContainer.innerHTML;

                card.insertBefore(absoluteContainer, card.firstChild);
                listBadgesContainer.remove();
            }
        });
        
        // Save preference
        localStorage.setItem('towerViewPreference', 'grid');
        
        // make sure buttons are visible
        document.querySelectorAll('#all-towers .card-body').forEach(body => {
            const towerId = body.querySelector('[data-tower-id]')?.dataset.towerId;
            if (towerId && window.towerDataCache[towerId]) {
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'd-flex gap-2 mt-3';
                buttonContainer.innerHTML = `
                    <button class="btn btn-sm btn-outline-info copy-json" data-tower-id="${towerId}">
                        <i class="bi bi-clipboard me-2"></i>Copy JSON
                    </button>
                    <button class="btn btn-sm btn-outline-primary download-json" data-tower-id="${towerId}">
                        <i class="bi bi-download me-2"></i>Download
                    </button>
                `;
                const existingButtons = body.querySelector('.d-flex.gap-2.mt-3');
                if (existingButtons) {
                    existingButtons.remove();
                }
                body.appendChild(buttonContainer);
            }
        });
    });

    // switch to list view
    document.getElementById('list-view-btn').addEventListener('click', function () {
        allTowers.classList.remove(
            'row-cols-sm-1',
            'row-cols-md-2',
            'row-cols-lg-3',
            'row-cols-xl-4',
            'row-cols-xxl-5'
        );
        
        allTowers.classList.add('row-cols-1');
        
        listViewBtn.classList.add('active', 'btn-primary');
        listViewBtn.classList.remove('btn-outline-primary');
        gridViewBtn.classList.remove('active', 'btn-primary');
        gridViewBtn.classList.add('btn-outline-primary');
        
        // disable grid stylesheet
        toggleGridStylesheet(false);
        
        document.querySelectorAll('#all-towers .card').forEach(card => {
            card.classList.add('list-view-card');

            const absoluteBadgesContainer = card.querySelector('.position-absolute.top-0.end-0');
            if (absoluteBadgesContainer && absoluteBadgesContainer.innerHTML.trim()) {
                const cardBody = card.querySelector('.card-body');
                if (cardBody) {
                    const listContainer = document.createElement('div');
                    listContainer.className = 'mt-2';
                    listContainer.innerHTML = absoluteBadgesContainer.innerHTML;
                    
                    // add badge after the description
                    cardBody.appendChild(listContainer);
                    absoluteBadgesContainer.remove();
                }
            }
        });
        
        localStorage.setItem('towerViewPreference', 'list');
    });

    const wikiFetcher = new TDSWikiFetcher();

    // render a tower card
    function renderTowerCard(tower, container) {
        const col = document.createElement('div');
        col.className = 'col';
        
        // Create unique id
        const towerId = `tower-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        
        // Save tower data in cache
        if (!window.towerDataCache) window.towerDataCache = {};
        if (tower.data) window.towerDataCache[towerId] = tower.data;

        // Set badge color based on tag
        let tagClass = 'bg-secondary';
        if (tower.tag === 'New') {
            tagClass = 'bg-success';
        } else if (tower.tag === 'Rework') {
            tagClass = 'bg-danger';
        } else if (tower.tag === 'Rebalance') {
            tagClass = 'bg-info';
        }

        // Check if we're in list view
        const isListView = container.id === 'all-towers' && container.classList.contains('row-cols-1');
        
        // Create buttons HTML based on tower type
        let buttonsHTML = '';
        
        if (tower.isLink && tower.linkedTower) {
            // For linked towers
            buttonsHTML = `<a href="${tower.linkedTower}" target="_blank" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-box-arrow-up-right me-2"></i>Visit Blog
            </a>`;
        } else if (tower.data) {
            // For towers with JSON data
            buttonsHTML = `<button class="btn btn-sm btn-outline-info copy-json me-2" data-tower-id="${towerId}">
                <i class="bi bi-clipboard me-2"></i>Copy JSON
            </button>
            <button class="btn btn-sm btn-outline-primary download-json" data-tower-id="${towerId}">
                <i class="bi bi-download me-2"></i>Download
            </button>`;
        }

        // Format author name as a link
        const authorLink = `<a href="https://tds.fandom.com/wiki/User:${encodeURIComponent(tower.author)}" 
                              target="_blank" 
                              class="author-link" 
                              title="View ${tower.author}'s profile">
                              ${tower.author}
                           </a>`;

        // Create badges HTML
        const badgesHtml = `
            ${tower.featured ? '<span class="badge bg-gold me-1">Featured</span>' : ''}
            ${tower.grandfathered ? '<span class="badge bg-dark me-1" data-grandfathered="true">Grandfathered</span>' : ''}
            ${tower.unverified ? '<span class="badge bg-secondary me-1" data-unverified="true">Unverified</span>' : ''}
            ${tower.tag ? `<span class="badge ${tagClass}">${tower.tag}</span>` : ''}
        `;

        col.innerHTML = `
            <div class="card h-100 bg-dark bg-gradient text-white ${tower.featured ? 'border-gold' : ''} ${isListView ? 'list-view-card' : ''}">
                ${!isListView ? `
                    <div class="position-absolute top-0 end-0 p-2">
                        ${badgesHtml}
                    </div>
                ` : ''}
                <img src="${tower.image}" class="card-img-top" loading="lazy" alt="${tower.name}" 
                     onerror="this.src='https://static.wikia.nocookie.net/tower-defense-sim/images/4/4a/Site-favicon.ico'; this.classList.add('img-error');">
                <div class="card-body">
                    <h5 class="card-title">${tower.name}</h5>
                    <p class="card-text" style="margin-bottom: -3px;">${tower.description || 'No description available.'}</p>
                    ${isListView ? `<div class="mt-2">${badgesHtml}</div>` : ''}
                </div>
                <div class="card-footer ${tower.featured ? 'gold' : ''} pb-2">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <small class="fw-bold me-1">By ${authorLink}</small>
                        ${tower.uploadDate ? `<small class="text-end"><i class="bi bi-clock text-info me-1"></i>${tower.uploadDate}</small>` : ''}
                    </div>
                    ${buttonsHTML ? `<div class="d-flex justify-content-center mt-2">${buttonsHTML}</div>` : ''}
                </div>
            </div>
        `;

        container.appendChild(col);
        
        // Hide unverified towers by default
        if (tower.unverified && container.id === 'all-towers') {
            col.classList.add('d-none');
        }
    }

    // load towers from wiki
    async function loadTowersFromWiki(forceRefresh = false) {
        // disable the refresh button while loading
        const refreshButton = document.getElementById('refresh-towers-btn');
        refreshButton.disabled = true;
        refreshButton.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i>Refreshing...';
        
        try {
            // reset the stored original cards to prevent duplicates when using the refresh button
            window.originalCardsOrder = [];
            
            if (!forceRefresh) {
                const cachedData = localStorage.getItem('towerDataCache');
                const cacheTimestamp = localStorage.getItem('towerDataTimestamp');
                
                // use cache if it exists
                if (cachedData && cacheTimestamp) {
                    const cacheAge = Date.now() - parseInt(cacheTimestamp);
                    const cacheMaxAge = 8 * 60 * 60 * 1000; // 8 hours (modify the first number only)
                    
                    if (cacheAge < cacheMaxAge) {
                        try {
                            const towers = JSON.parse(cachedData);
                            console.log(`Using cached tower data (${Math.round(cacheAge/3600000)}h old)`);
                            renderAllTowers(towers);
                            return;
                        } catch (e) {
                            console.warn('Cache parsing failed, fetching fresh data');
                        }
                    }
                }
            }
            
            // show loading spinners
            document.getElementById('featured-towers').innerHTML = 
                '<div class="col-12 text-center text-light p-5"><div class="spinner-border" role="status"></div><p class="mt-2">Getting featured data...</p></div>';
            
            document.getElementById('all-towers').innerHTML = 
                '<div class="col-12 text-center text-light p-5"><div class="spinner-border" role="status"></div><p class="mt-2">Loading towers from the TDS Wiki...</p></div>';

            const towers = await wikiFetcher.fetchTowers();
            
            // Save to cache
            localStorage.setItem('towerDataCache', JSON.stringify(towers));
            localStorage.setItem('towerDataTimestamp', Date.now().toString());
            
            renderAllTowers(towers);
        } catch (error) {
            console.error('Failed to load towers:', error);
            document.getElementById('all-towers').innerHTML = '<div class="col-12 text-center text-danger p-5"><i class="bi bi-exclamation-triangle-fill fs-1"></i><p class="mt-2">Failed to load towers from the wiki. Please try again later.</p></div>';
        } finally {
            // Re-enable refresh button when done (whether successful or not)
            refreshButton.disabled = false;
            refreshButton.innerHTML = '<i class="bi bi-arrow-clockwise me-2"></i>Refresh';
        }
    }

    // cards renderer
    function renderAllTowers(towers) {
        // clear containers
        const featuredContainer = document.querySelector('.featured-towers');
        const allTowersContainer = document.getElementById('all-towers');

        featuredContainer.innerHTML = '';
        allTowersContainer.innerHTML = '';

        // show featured towers
        const featuredTowers = towers.filter(tower => tower.featured);
        
        if (featuredTowers.length === 0) {
            featuredContainer.innerHTML = '<div class="col-12 text-center text-light p-3">No featured towers at this time.</div>';
        } else {
            featuredTowers.forEach(tower => renderTowerCard(tower, featuredContainer));
        }

        // show all towers
        towers.forEach(tower => renderTowerCard(tower, allTowersContainer));
        
        if (window.setupSearch) window.setupSearch();
        if (window.applyFilters) window.applyFilters();
        if (window.setupSorting) window.setupSorting();
    }

    // load towers on page load
    loadTowersFromWiki();

    // add event listener for refresh button
    document.getElementById('refresh-towers-btn').addEventListener('click', () => loadTowersFromWiki(true));

    // Set 3 filter checkboxes to checked by default
    document.getElementById('filterNewTower').checked = true;
    document.getElementById('filterTowerRework').checked = true;
    document.getElementById('filterTowerRebalance').checked = true;
    
    if (window.setupFilters) window.setupFilters();
    if (window.setupSorting) window.setupSorting();
});

// handle json buttons
document.addEventListener('click', function(event) {
    // copy json to clipboard
    if (event.target.closest('.copy-json')) {
        const button = event.target.closest('.copy-json');
        const towerId = button.dataset.towerId;
        const towerData = window.towerDataCache[towerId];
        
        if (towerData) {
            navigator.clipboard.writeText(JSON.stringify(towerData, null, 2))
                .then(() => {
                    showAlert('JSON copied to clipboard!', 'success');
                })
                .catch(err => {
                    console.error('Failed to copy JSON:', err);
                    showAlert('Failed to copy JSON', 'danger');
                });
        } else {
            showAlert('No JSON data available', 'warning');
        }
    }
    
    // download json as file
    if (event.target.closest('.download-json')) {
        const button = event.target.closest('.download-json');
        const towerId = button.dataset.towerId;
        const towerData = window.towerDataCache[towerId];
        
        if (towerData) {
            // get name for filename
            const card = button.closest('.card');
            const towerName = card.querySelector('.card-title').textContent;
            
            // get author name
            const authorElement = card.querySelector('.card-footer .fw-bold');
            let authorName = 'Unknown';
            
            if (authorElement) {
                const authorText = authorElement.textContent;
                authorName = authorText.replace('By ', '').trim();
            }
            
            const fileName = `${towerName.replace(/\s+/g, '_')}-${authorName.replace(/\s+/g, '_')}.json`;
            
            const jsonString = JSON.stringify(towerData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            
            // cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
        } else {
            showAlert('No JSON data available', 'warning');
        }
    }
});

// show alert with animation
function showAlert(message, type) {
    const alertPlaceholder = document.createElement('div');
    alertPlaceholder.className = 'position-fixed bottom-0 end-0 p-3';
    alertPlaceholder.style.zIndex = '5';
    
    const wrapper = document.createElement('div');
    wrapper.className = `alert alert-${type} alert-dismissible fade`;
    wrapper.innerHTML = `
        <div>${message}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertPlaceholder.appendChild(wrapper);
    document.body.appendChild(alertPlaceholder);
    
    wrapper.offsetHeight;
    
    setTimeout(() => {
        wrapper.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        wrapper.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(alertPlaceholder);
        }, 300);
    }, 3000);
}