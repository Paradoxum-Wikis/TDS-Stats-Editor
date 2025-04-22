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
    const towerEntryRegex = /\["([^"]+)"\]\s*=\s*{\s*file\s*=\s*"([^"]+)",\s*category\s*=\s*"([^"]+)"[^}]*}/g;
    const dataMatch = luaContent.match(towerDataRegex);
    if (dataMatch && dataMatch[1]) {
        const towerSection = dataMatch[1];
        let match;
        while ((match = towerEntryRegex.exec(towerSection)) !== null) {
            const [_, name, file, category] = match;
            towerData[name] = { file, category };
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
    gallery.innerHTML = '';
    const towerNames = Object.keys(towerData).sort();
    towerNames.forEach(name => {
        const tower = document.createElement('div');
        tower.className = `tower-item tier-item m-1 p-1 bg-dark border border-secondary category-${towerData[name].category || ''}`;
        tower.style.width = '70px';
        tower.style.height = '70px';
        tower.setAttribute('data-tower', name);
        tower.setAttribute('data-tooltip', name);
        const img = document.createElement('img');
        img.src = getImageUrl(towerData[name].file);
        img.className = 'img-fluid';
        img.alt = name;
        tower.appendChild(img);
        gallery.appendChild(tower);
        tower.addEventListener('click', () => {
            const selectedTier = document.getElementById('tier-select').value;
            addTowerToTier(name, selectedTier);
            showAddedIndicator(tower, selectedTier);
        });
    });
}

// show animation when tower is added to tier list
function showAddedIndicator(element, tierName) {
    const indicator = document.createElement('div');
    indicator.className = 'added-indicator';
    indicator.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
    
    // style the indicator
    Object.assign(indicator.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: getTierColor(tierName),
        fontSize: '2rem',
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '100',
        transition: 'all 0.5s ease'
    });
    
    // add to element
    element.style.position = 'relative';
    element.appendChild(indicator);
    setTimeout(() => { indicator.style.opacity = '1'; }, 10);
    
    // add tier letter
    const tierIndicator = document.createElement('div');
    tierIndicator.className = 'tier-indicator';
    tierIndicator.textContent = tierName;
    Object.assign(tierIndicator.style, {
        position: 'absolute',
        top: '70%',
        left: '50%',
        transform: 'translate(-50%, 0)',
        color: getTierColor(tierName),
        background: 'rgba(0,0,0,0.7)',
        borderRadius: '3px',
        padding: '0 4px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '100',
        transition: 'all 0.5s ease'
    });
    element.appendChild(tierIndicator);
    setTimeout(() => { tierIndicator.style.opacity = '1'; }, 10);
    
    // remove after anim
    setTimeout(() => {
        indicator.style.opacity = '0';
        tierIndicator.style.opacity = '0';
        setTimeout(() => {
            if (element.contains(indicator)) element.removeChild(indicator);
            if (element.contains(tierIndicator)) element.removeChild(tierIndicator);
        }, 500);
    }, 1000);
}

// get color for tier indicator
function getTierColor(tier) {
    const tierColors = {
        'S': '#FF5252',
        'A': '#FF9800',
        'B': '#FFEB3B',
        'C': '#8BC34A',
        'D': '#03A9F4',
        'E': '#9C27B0',
        'F': '#757575'
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
    // check if already in this tier
    const alreadyInTier = tierListData[tier].some(t => t.toLowerCase() === finalTowerName.toLowerCase());
    if (!alreadyInTier) {
        // remove from any other tier
        Object.keys(tierListData).forEach(t => {
            const index = tierListData[t].findIndex(name => name.toLowerCase() === finalTowerName.toLowerCase());
            if (index !== -1) {
                tierListData[t].splice(index, 1);
            }
        });
        tierListData[tier].push(finalTowerName);
        renderTierList();
    }
}

function removeTowerFromTier(towerName, tier) {
    const index = tierListData[tier].indexOf(towerName);
    if (index !== -1) {
        tierListData[tier].splice(index, 1);
        renderTierList();
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
    // wait for all images to load
    const allImages = tierlist.querySelectorAll('img');
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
            return html2canvas(tierlist, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: 'null',
                scale: 2,
                logging: false
            });
        })
        .then(canvas => {
            const link = document.createElement('a');
            link.download = 'tds-tierlist.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        })
        .catch(error => {
            console.error('Error exporting tier list:', error);
            alert('Failed to export tier list image. Check console for details.');
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
    // click to remove tower from tier
    document.querySelectorAll('.tier-item[data-tier]').forEach(item => {
        item.addEventListener('click', function() {
            const tower = this.getAttribute('data-tower');
            const tier = this.getAttribute('data-tier');
            removeTowerFromTier(tower, tier);
        });
    });
}