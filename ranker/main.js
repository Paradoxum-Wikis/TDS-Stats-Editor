import ImageLoader from '../components/ImageLoader.js';

// main tier list data
const tierListData = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: []
};

// tower data and aliases loaded from lua
let towerData = {};
let towerAliases = {};

document.addEventListener('DOMContentLoaded', async function() {
    await loadTierlistData();
    renderTierList();
    populateTowerGallery();
    setupEventListeners();
});

async function loadTierlistData() {
    try {
        const response = await fetch('tierlist.lua');
        if (!response.ok) {
            throw new Error(`Failed to load tierlist.lua: ${response.status}`);
        }
        const luaContent = await response.text();
        parseTowerData(luaContent);
        parseTowerAliases(luaContent);
        console.log('Tower data loaded:', Object.keys(towerData).length, 'towers');
        console.log('Tower aliases loaded:', Object.keys(towerAliases).length, 'aliases');
        if (Object.keys(towerData).length === 0) {
            throw new Error('No tower data was extracted from tierlist.lua');
        }
        console.log('Successfully loaded data from tierlist.lua');
    } catch (error) {
        console.error('Error loading tierlist data:', error);
        alert('Failed to load tower data. Check console for details.');
    }
}

function parseTowerData(luaContent) {
    // grab tower info from lua
    const towerDataRegex = /keywordMap\s*=\s*{\s*([\s\S]*?)(?=}\s*(?:local|return|\n\n))/;
    const towerEntryRegex = /\["([^"]+)"\]\s*=\s*{\s*file\s*=\s*"([^"]+)",\s*category\s*=\s*"([^"]+)"([^}]*)}/g;
    const dataMatch = luaContent.match(towerDataRegex);
    if (dataMatch && dataMatch[1]) {
        const towerSection = dataMatch[1];
        let match;
        while ((match = towerEntryRegex.exec(towerSection)) !== null) {
            const [_, name, file, category, extraData] = match;
            towerData[name] = { file, category };
            
            const categories = [category];
            const additionalCategoriesMatch = extraData.match(/"([^"]+)"/g);
            if (additionalCategoriesMatch) {
                additionalCategoriesMatch.forEach(catMatch => {
                    const cat = catMatch.replace(/"/g, '');
                    categories.push(cat);
                });
            }
            
            towerData[name].categories = categories;
        }
    } else {
        console.error('Failed to find tower data section in the Lua file');
        console.log('Lua file content preview:', luaContent.substring(0, 500) + '...');
    }
}

function parseTowerAliases(luaContent) {
    // grab aliases from lua
    const aliasesRegex = /keywordAlias\s*=\s*{\s*([\s\S]*?)(?=}\s*(?:local|return|\n\n))/;
    const aliasEntryRegex = /\["([^"]+)"\]\s*=\s*"([^"]+)"/g;
    const aliasesMatch = luaContent.match(aliasesRegex);
    if (aliasesMatch && aliasesMatch[1]) {
        const aliasesSection = aliasesMatch[1];
        let match;
        while ((match = aliasEntryRegex.exec(aliasesSection)) !== null) {
            const [_, alias, fullName] = match;
            towerAliases[alias.toLowerCase()] = fullName;
        }
    } else {
        console.warn('Aliases section not found. The app will work without aliases.');
    }
}

// find tower name, ignore case
function findTowerCaseInsensitive(name) {
    if (towerData[name]) {
        return name;
    }
    const lowerName = name.toLowerCase();
    for (const towerName in towerData) {
        if (towerName.toLowerCase() === lowerName) {
            return towerName;
        }
    }
    return name;
}

function getImageUrl(filename) {
    return ImageLoader.convertFileToFandomUrl(filename);
}

function renderTierList() {
    const preview = document.getElementById('tierlist-preview');
    let html = '<div class="tier-list">';
    const tiers = ["S", "A", "B", "C", "D", "E", "F"];
    tiers.forEach(tier => {
        html += `<div class="tier-row ${tier.toLowerCase()}-tier">`;
        html += `<div class="tier-label">${tier}</div>`;
        html += '<div class="tier-content">';
        tierListData[tier].forEach(towerName => {
            const normalizedName = towerAliases[towerName] || towerName;
            const towerInfo = towerData[normalizedName];
            if (towerInfo) {
                const imageUrl = getImageUrl(towerInfo.file);
                html += `<span class="tier-item category-${towerInfo.category}" data-tooltip="${normalizedName}" data-tower="${normalizedName}" data-tier="${tier}">`;
                html += `<img src="${imageUrl}" alt="${normalizedName}">`;
                html += '</span>';
            } else {
                html += `<span class="tier-item" data-tooltip="Unknown tower: ${towerName}" data-tower="${normalizedName}" data-tier="${tier}">`;
                html += `<div class="bg-danger text-white d-flex align-items-center justify-content-center w-100 h-100">${towerName.charAt(0)}</div>`;
                html += '</span>';
            }
        });
        html += '</div></div>';
    });
    html += '</div>';
    preview.innerHTML = html;
    addTierItemListeners();
}

function populateTowerGallery() {
    const gallery = document.getElementById('tower-gallery');
    const scrollPosition = gallery.scrollTop;
    gallery.innerHTML = '';

    const sections = {
        'towers': {
            title: 'Towers',
            items: []
        },
        'golden': {
            title: 'Golden Towers',
            items: []
        },
        'skins': {
            title: 'Skins',
            items: []
        }
    };

    // sort towers into appropriate sections
    const towerNames = Object.keys(towerData).sort();
    towerNames.forEach(name => {
        const towerInfo = towerData[name];
        const isTower = Array.isArray(towerInfo.categories) 
                      ? towerInfo.categories.includes("tower") 
                      : towerInfo.category === "tower" || (towerInfo.category && towerInfo.category.includes("tower"));
                      
        const isGolden = towerInfo.category === "golden";
        const isInTier = Object.values(tierListData).some(tierArr =>
            tierArr.some(t => t.toLowerCase() === name.toLowerCase())
        );

        const tower = document.createElement('div');
        tower.className = `tower-item tier-item m-1 p-1 bg-dark border border-secondary category-${towerInfo.category || ''}`;
        tower.setAttribute('data-tower', name);
        tower.setAttribute('data-tooltip', name);

        if (isInTier) {
            tower.classList.add('added');
        } else {
            tower.addEventListener('click', () => {
                const selectedTier = document.getElementById('tier-select').value;

                addTowerToTier(name, selectedTier);
                showAddedIndicator(tower, selectedTier);
            });
        }

        const img = document.createElement('img');
        img.src = getImageUrl(towerInfo.file);
        img.className = 'img-fluid';
        img.alt = name;
        
        tower.appendChild(img);
        
        if (isTower) {
            sections.towers.items.push(tower);
        } else if (isGolden) {
            sections.golden.items.push(tower);
        } else {
            sections.skins.items.push(tower);
        }
    });
    
    for (const [key, section] of Object.entries(sections)) {
        if (section.items.length > 0) {
            const header = document.createElement('h5');
            header.className = 'text-white text-center my-2';
            header.textContent = section.title;
            gallery.appendChild(header);
            
            const container = document.createElement('div');
            container.className = 'd-flex flex-wrap justify-content-center w-100';
            container.setAttribute('data-section', key);
            
            section.items.forEach(tower => {
                container.appendChild(tower);
            });
            
            gallery.appendChild(container);
        }
    }

    gallery.scrollTop = scrollPosition;
}

// show animation when tower is added to tier list
function showAddedIndicator(element, tierName) {
    // prevent adding indicator if already greyed out (already added)
    if (element.classList.contains('added')) return;

    const indicator = document.createElement('div');
    indicator.className = 'added-indicator';
    indicator.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
    indicator.style.color = getTierColor(tierName);

    element.appendChild(indicator);
    setTimeout(() => { indicator.style.opacity = '1'; }, 10);

    // add tier letter
    const tierIndicator = document.createElement('div');
    tierIndicator.className = 'tier-indicator';
    tierIndicator.textContent = tierName;
    tierIndicator.style.color = getTierColor(tierName);

    element.appendChild(tierIndicator);
    setTimeout(() => { tierIndicator.style.opacity = '1'; }, 10);

    // remove after anim and THEN update gallery
    setTimeout(() => {
        indicator.style.opacity = '0';
        tierIndicator.style.opacity = '0';
        setTimeout(() => {
            if (element.contains(indicator)) element.removeChild(indicator);
            if (element.contains(tierIndicator)) element.removeChild(tierIndicator);
            // Update the gallery AFTER the animation finishes and indicators are removed
            populateTowerGallery();
        }, 500);
    }, 1000);
}

// get color for tier indicator
function getTierColor(tier) {
    const tierColors = {
        'S': '#d33b3b',
        'A': '#d58639',
        'B': '#d7c73f',
        'C': '#3ad54f',
        'D': '#5197dd',
        'E': '#885dcb',
        'F': '#b55bb5',
    };
    return tierColors[tier] || '#FFFFFF';
}

function setupEventListeners() {
    document.getElementById('add-tower-btn').addEventListener('click', () => {
        const input = document.getElementById('tower-input');
        const selectedTier = document.getElementById('tier-select').value;
        const towers = input.value.split(',');
        towers.forEach(tower => {
            const trimmedName = tower.trim();
            if (trimmedName) {
                addTowerToTier(trimmedName, selectedTier);
            }
        });
        input.value = '';
    });

    document.getElementById('reset-tierlist').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset your tier list?')) {
            resetTierList();
        }
    });

    document.getElementById('export-image').addEventListener('click', () => {
        exportTierListImage();
    });

    document.getElementById('copy-tierlist').addEventListener('click', () => {
        copyTierListCode();
    });

    document.getElementById('import-btn').addEventListener('click', () => {
        importTierList();
    });

    document.querySelectorAll('.filter-category').forEach(checkbox => {
        checkbox.addEventListener('change', filterTowerGallery);
    });

    document.querySelector('#Tower-Search input').addEventListener('input', filterTowerGallery);

    // Prevent form submission on Enter in search bar
    const searchForm = document.getElementById('Tower-Search');
    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
        });
    }
}

function addTowerToTier(towerName, tier) {
    // normalize tower name using aliases
    const lowerTowerName = towerName.toLowerCase();
    const normalizedName = towerAliases[lowerTowerName] || towerName;
    const correctCaseTowerName = findTowerCaseInsensitive(normalizedName);
    if (!towerData[correctCaseTowerName] && !towerData[normalizedName]) {
        console.warn(`Adding unknown tower: ${towerName}`);
    }
    const finalTowerName = towerData[correctCaseTowerName] ? correctCaseTowerName : normalizedName;

    // check if already in ANY tier
    const alreadyInAnyTier = Object.values(tierListData).some(tierArr =>
        tierArr.some(t => t.toLowerCase() === finalTowerName.toLowerCase())
    );

    if (!alreadyInAnyTier) {
        tierListData[tier].push(finalTowerName);
        renderTierList();
    } else {
        console.log(`Tower ${finalTowerName} is already in a tier. Moving to ${tier}.`);
        // remove from existing tier first
        Object.keys(tierListData).forEach(t => {
            const index = tierListData[t].findIndex(name => name.toLowerCase() === finalTowerName.toLowerCase());
            if (index !== -1) {
                tierListData[t].splice(index, 1);
            }
        });
        tierListData[tier].push(finalTowerName);
        renderTierList();
        populateTowerGallery();
    }
}

function removeTowerFromTier(towerName, tier) {
    const index = tierListData[tier].findIndex(t => t.toLowerCase() === towerName.toLowerCase());
    if (index !== -1) {
        tierListData[tier].splice(index, 1);
        renderTierList();
        populateTowerGallery();
    }
}

function resetTierList() {
    Object.keys(tierListData).forEach(tier => {
        tierListData[tier] = [];
    });
    renderTierList();
}

function exportTierListImage() {
    const tierlist = document.querySelector('.tier-list');
    if (!tierlist) {
        alert('No tier list to export!');
        return;
    }
    const exportBtn = document.getElementById('export-image');
    const originalHTML = exportBtn.innerHTML;
    const resetButtonState = () => {
        exportBtn.innerHTML = originalHTML;
        exportBtn.disabled = false;
    };
    exportBtn.innerHTML = 'Exporting...';
    exportBtn.disabled = true;
    
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = tierlist.offsetWidth + 'px';
    wrapper.style.height = tierlist.offsetHeight + 'px';
    
    // clone the tierlist to avoid modifying the original
    const tierlistClone = tierlist.cloneNode(true);
    wrapper.appendChild(tierlistClone);
    
    const logo = document.createElement('img');
    logo.src = '../htmlassets/tdsrankerlogo.png';
    logo.style.position = 'absolute';
    logo.style.right = '10px';
    logo.style.bottom = '10px';
    logo.style.height = '50px';
    logo.style.opacity = '0.55';
    logo.style.zIndex = '100';
    wrapper.appendChild(logo);
    
    wrapper.style.position = 'absolute';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '-9999px';
    document.body.appendChild(wrapper);
    
    // wait for all images to load
    const allImages = wrapper.querySelectorAll('img');
    const imagePromises = Array.from(allImages).map(img => {
        if (img.complete) {
            return Promise.resolve();
        } else {
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        }
    });
    
    Promise.all(imagePromises)
        .then(() => {
            return html2canvas(wrapper, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: 'null',
                scale: 2,
                logging: false
            });
        })
        .then(canvas => {
            const link = document.createElement('a');
            link.download = 'adachi-tds-tierlist.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            document.body.removeChild(wrapper);
        })
        .catch(error => {
            console.error('Error exporting tier list:', error);
            alert('Failed to export tier list image. Check console for details.');
            
            // clean up even when there's an error
            if (document.body.contains(wrapper)) {
                document.body.removeChild(wrapper);
            }
        })
        .finally(() => {
            resetButtonState();
        });
}

function copyTierListCode() {
    let code = '{{Tierlist';
    Object.keys(tierListData).forEach(tier => {
        if (tierListData[tier].length > 0) {
            code += ` | ${tier} = ${tierListData[tier].join(', ')}`;
        }
    });
    code += '}}';
    navigator.clipboard.writeText(code).then(() => {
        alert('Tier list code copied to clipboard, have fun showcasing it on the wiki!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard.');
        // fallback: use textarea
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy'); // for older browsers, ignore the strikethrough
            alert('Tier list code copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert('Failed to copy. Here is your code:\n\n' + code);
        }
        document.body.removeChild(textarea);
    });
}

function importTierList() {
    const importCode = document.getElementById('import-code').value.trim();
    // check if code looks right
    const tierlistRegex = /{{Tierlist\s*(\|[^}]+)*}}/i;
    if (!tierlistRegex.test(importCode)) {
        alert('Invalid tier list code format. It should look like:\n{{Tierlist | S = Tower1, Tower2 | A = Tower3}}');
        return;
    }
    resetTierList();
    // grab tier data from code
    const tierRegex = /\|\s*([A-Z])\s*=\s*([^|]+)(?=\||}})/g;
    let match;
    while ((match = tierRegex.exec(importCode)) !== null) {
        const tier = match[1];
        const towers = match[2].split(',').map(t => t.trim()).filter(t => t !== '');
        if (tierListData[tier]) {
            towers.forEach(tower => {
                addTowerToTier(tower, tier);
            });
        }
    }
    document.getElementById('import-code').value = '';
}

function filterTowerGallery() {
    const searchTerm = document.querySelector('#Tower-Search input').value.toLowerCase();
    const enabledCategories = Array.from(document.querySelectorAll('.filter-category:checked'))
        .map(cb => cb.value);
    const towers = document.querySelectorAll('#tower-gallery .tower-item');
    towers.forEach(tower => {
        const towerName = tower.getAttribute('data-tower').toLowerCase();
        const category = towerData[tower.getAttribute('data-tower')]?.category || '';
        const matchesSearch = searchTerm === '' || towerName.includes(searchTerm);
        const matchesCategory = category === '' || enabledCategories.includes(category);
        tower.style.display = (matchesSearch && matchesCategory) ? '' : 'none';
    });
}

function addTierItemListeners() {
    const preview = document.getElementById('tierlist-preview');
    preview.addEventListener('click', function(event) {
        // finds the closest ancestor that is a tier item with a tier attribute
        const item = event.target.closest('.tier-item[data-tier]');
        if (item) {
            const tower = item.getAttribute('data-tower');
            const tier = item.getAttribute('data-tier');
            if (tower && tier) {
                removeTowerFromTier(tower, tier);
            }
        }
    });
}

window.addTowerToTier = addTowerToTier;
window.resetTierList = resetTierList;
window.exportTierListImage = exportTierListImage;
window.copyTierListCode = copyTierListCode;
window.filterTowerGallery = filterTowerGallery;