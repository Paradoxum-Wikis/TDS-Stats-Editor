/**
 * TDSWikiSorter.js
 * Handles searching, filtering and sorting of towers in the tower browser
 */

// globals
window.sortState = {
    criteria: 'wiki',
    direction: 'asc'
};
window.originalCardsOrder = [];
window.towerDataCache = window.towerDataCache || {};

// search functionality
function setupSearch() {
    const searchInput = document.querySelector('.form-control[placeholder="Search a Tower"]');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce(function() {
        applyFilters(); // Apply filters directly when search changes
    }, 300));
}

// helper to prevent excessive function calls
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// filters functionality
function setupFilters() {
    const filterCheckboxes = [
        document.getElementById('filterNewTower'),
        document.getElementById('filterTowerRework'),
        document.getElementById('filterTowerRebalance')
    ];
    
    filterCheckboxes.forEach(checkbox => {
        if (checkbox) {
            checkbox.checked = true; // Set checked by default
            checkbox.addEventListener('change', applyFilters);
        }
    });
}

function applyFilters(maintainSort = true) {
    const showNew = document.getElementById('filterNewTower')?.checked ?? true;
    const showRework = document.getElementById('filterTowerRework')?.checked ?? true;
    const showRebalance = document.getElementById('filterTowerRebalance')?.checked ?? true;
    
    // get search query
    const searchInput = document.querySelector('.form-control[placeholder="Search a Tower"]');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    const allTowersContainer = document.getElementById('all-towers');
    const featuredContainer = document.querySelector('.featured-towers')?.closest('.mb-4');
    const headings = document.querySelectorAll('h4.text-white');
    const cards = allTowersContainer.querySelectorAll('.col');
    let matchCount = 0;
    
    document.getElementById('no-filter-results')?.remove();
    document.getElementById('no-search-results')?.remove();
    
    // show/hide featured section
    if (query && featuredContainer) {
        featuredContainer.classList.add('d-none');
        headings.forEach(heading => heading.classList.add('d-none'));
    } else if (featuredContainer) {
        featuredContainer.classList.remove('d-none');
        headings.forEach(heading => heading.classList.remove('d-none'));
    }
    
    // if all filters are off, show no results message
    if (!showNew && !showRework && !showRebalance) {
        const noResults = document.createElement('div');
        noResults.id = 'no-filter-results';
        noResults.className = 'col-12 text-center text-light p-5';
        noResults.innerHTML = `
            <i class="bi bi-filter fs-1"></i>
            <p class="mt-2">No towers shown because all filters are turned off</p>
            <div class="mt-3">
                <button class="btn btn-outline-secondary mt-2" id="enable-all-filters">Clear Filter</button>
            </div>
        `;
        allTowersContainer.appendChild(noResults);
        
        document.getElementById('enable-all-filters').addEventListener('click', () => {
            document.getElementById('filterNewTower').checked = true;
            document.getElementById('filterTowerRework').checked = true;
            document.getElementById('filterTowerRebalance').checked = true;
            applyFilters();
        });
        
        cards.forEach(card => card.classList.add('d-none'));
        return;
    }
    
    document.querySelectorAll('.search-highlight').forEach(el => 
        el.classList.remove('search-highlight'));
    
    cards.forEach(card => {
        const cardElement = card.querySelector('.card');
        const towerName = card.querySelector('.card-title')?.textContent?.toLowerCase() || '';
        const towerDescription = card.querySelector('.card-text')?.textContent?.toLowerCase() || '';
        const towerAuthor = card.querySelector('.card-footer .fw-bold')?.textContent?.toLowerCase() || '';
        const badge = card.querySelector('.badge:not(.bg-gold)');
        const towerTag = badge?.textContent?.trim() || '';
        const tagText = towerTag.toLowerCase();
        
        const matchesSearch = !query || 
            towerName.includes(query) || 
            towerDescription.includes(query) || 
            towerAuthor.includes(query) ||
            tagText.includes(query);
        
        let matchesFilter = false;
        
        if (badge) {
            if ((towerTag === 'New' && showNew) || 
                (towerTag === 'Rework' && showRework) || 
                (towerTag === 'Rebalance' && showRebalance)) {
                matchesFilter = true;
            }
        } else {
            matchesFilter = (showNew || showRework || showRebalance);
        }
        
        if (matchesSearch && matchesFilter) {
            card.classList.remove('d-none');
            matchCount++;
            
            if (query) {
                cardElement.classList.add('search-highlight');
            }
        } else {
            card.classList.add('d-none');
        }
    });
    
    // no results message
    if (matchCount === 0 && query) {
        const noResults = document.createElement('div');
        noResults.id = 'no-search-results';
        noResults.className = 'col-12 text-center text-light p-5';
        noResults.innerHTML = `
            <i class="bi bi-search fs-1"></i>
            <p class="mt-2">No towers found matching "${query}"</p>
            <button class="btn btn-outline-secondary mt-2" id="clear-search">Clear Search</button>
        `;
        allTowersContainer.appendChild(noResults);
        
        document.getElementById('clear-search').addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                applyFilters();
                searchInput.focus();
            }
        });
    }
    
    if (maintainSort && window.sortState.criteria) {
        sortTowers(window.sortState.criteria, window.sortState.direction);
    }
}

// sort functionality
function setupSorting() {
    // reset sort state
    window.sortState = {
        criteria: 'wiki',
        direction: 'asc'
    };
    
    // store original (wiki) order of cards
    const allTowersContainer = document.getElementById('all-towers');
    if (allTowersContainer) {
        window.originalCardsOrder = Array.from(allTowersContainer.querySelectorAll('.col'));
    }
    
    // sort button IDs and event listeners
    const sortLinks = document.querySelectorAll('.sidebar-heading + ul .nav-link');
    const sortIds = ['sort-by-wiki-listing', 'sort-by-tower-name', 'sort-by-user-name', 'sort-by-time'];
    const sortCriteria = ['wiki', 'name', 'author', 'time'];
    
    // clean and set up each sort button
    for (let i = 0; i < Math.min(sortLinks.length, sortIds.length); i++) {
        sortLinks[i].id = sortIds[i];
        
        const newLink = sortLinks[i].cloneNode(true);
        sortLinks[i].parentNode.replaceChild(newLink, sortLinks[i]);
        
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            toggleSort(sortCriteria[i], this);
        });
    }
    
    // wiki sort active by default
    const wikiListingBtn = document.getElementById('sort-by-wiki-listing');
    if (wikiListingBtn) {
        setActiveSortButton(wikiListingBtn);
    }
}

// toggle sort direction
function toggleSort(criteria, button) {
    if (window.sortState.criteria === criteria) {
        // same criteria: toggle direction
        window.sortState.direction = window.sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // new criteria: default to ascending
        window.sortState.criteria = criteria;
        window.sortState.direction = 'asc';
    }
    
    setActiveSortButton(button);
    sortTowers(criteria, window.sortState.direction);
}

// set active sort button and its icon
function setActiveSortButton(activeButton) {
    const sortLinks = document.querySelectorAll('.sidebar-heading + ul .nav-link');
    sortLinks.forEach(link => {
        link.classList.remove('active');
        link.querySelector('.sort-icon')?.remove();
    });
    
    activeButton.classList.add('active');
    
    const sortIcon = document.createElement('span');
    sortIcon.className = 'sort-icon me-2';
    sortIcon.innerHTML = window.sortState.direction === 'asc' 
        ? '<i class="bi bi-sort-down-alt"></i>' 
        : '<i class="bi bi-sort-up-alt"></i>';
    
    // insert icon before the button
    if (activeButton.firstChild) {
        activeButton.insertBefore(sortIcon, activeButton.firstChild);
    } else {
        activeButton.appendChild(sortIcon);
    }
}

// sort functionality
function sortTowers(criteria, direction = 'asc') {
    window.sortState.criteria = criteria;
    window.sortState.direction = direction;
    
    const allTowersContainer = document.getElementById('all-towers');
    if (!allTowersContainer) return;
    
    // get cards to sort
    let cards;
    if (criteria === 'wiki' && window.originalCardsOrder.length > 0) {
        cards = [...window.originalCardsOrder]; // Use original order
        if (direction === 'desc') {
            cards.reverse();
        }
    } else {
        cards = Array.from(allTowersContainer.querySelectorAll('.col'));
        
        if (criteria !== 'wiki') {
            cards.sort((a, b) => {
                let comparison = 0;
                
                if (criteria === 'name') {
                    const nameA = a.querySelector('.card-title')?.textContent.toLowerCase() || '';
                    const nameB = b.querySelector('.card-title')?.textContent.toLowerCase() || '';
                    comparison = nameA.localeCompare(nameB);
                } else if (criteria === 'author') {
                    const authorA = a.querySelector('.card-footer .fw-bold')?.textContent.toLowerCase() || '';
                    const authorB = b.querySelector('.card-footer .fw-bold')?.textContent.toLowerCase() || '';
                    const cleanAuthorA = authorA.replace(/^by\s+/i, '');
                    const cleanAuthorB = authorB.replace(/^by\s+/i, '');
                    comparison = cleanAuthorA.localeCompare(cleanAuthorB);
                } else if (criteria === 'time') {
                    const timeTextA = a.querySelector('.card-footer small:last-child')?.textContent || '';
                    const timeTextB = b.querySelector('.card-footer small:last-child')?.textContent || '';
                    comparison = compareUploadDates(timeTextB, timeTextA);
                    
                    // invert for ascending
                    if (direction === 'asc') {
                        comparison = -comparison;
                    }
                    return comparison;
                }
                
                return direction === 'asc' ? comparison : -comparison;
            });
        }
    }
    
    // append cards in sorted order again
    cards.forEach(card => allTowersContainer.appendChild(card));
    
    // apply any active filters/searches again (without re-sorting)
    applyFilters(false);
}

// time sort functionality
// format: seconds ago, minutes ago, hours ago, days ago
// after days ago, and to a month, it's: Day Month Year, with day and month in numbers, month in full word
function compareUploadDates(dateA, dateB) {
    function getDateValue(dateText) {
        // cleans everything
        dateText = dateText.trim();
        if (!dateText) return 0;
        
        // if it has "ago"
        if (dateText.toLowerCase().includes('ago')) {
            const value = parseInt(dateText) || 0;
            
            if (dateText.includes('second')) {
                return Date.now() - (value * 1000);
            } else if (dateText.includes('minute')) {
                return Date.now() - (value * 60 * 1000);
            } else if (dateText.includes('hour')) {
                return Date.now() - (value * 60 * 60 * 1000);
            } else if (dateText.includes('day')) {
                return Date.now() - (value * 24 * 60 * 60 * 1000);
            } else if (dateText.includes('week')) {
                return Date.now() - (value * 7 * 24 * 60 * 60 * 1000);
            } else if (dateText.includes('month')) {
                return Date.now() - (value * 30 * 24 * 60 * 60 * 1000);
            } else if (dateText.includes('year')) {
                return Date.now() - (value * 365 * 24 * 60 * 60 * 1000);
            }
        }
        
        // if it's above a month
        const months = {
            'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
            'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
        };
        
        const parts = dateText.split(/\s+/);
        if (parts.length >= 3) {
            const day = parseInt(parts[0]);
            const monthLower = parts[1].toLowerCase();
            const year = parseInt(parts[2]);
            
            if (!isNaN(day) && monthLower in months && !isNaN(year)) {
                const month = months[monthLower];
                return new Date(year, month, day).getTime();
            }
        }
    }
    
    return getDateValue(dateA) - getDateValue(dateB);
}

// export functions to global scope
window.setupSearch = setupSearch;
window.setupFilters = setupFilters;
window.setupSorting = setupSorting;
window.applyFilters = applyFilters;