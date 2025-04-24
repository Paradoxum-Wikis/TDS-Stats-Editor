export function renderTowerShorthands(towerAliases) {
    const container = document.getElementById('tower-shorthands-list');
    if (!container) return;
    container.innerHTML = '';

    const entries = Object.entries(towerAliases)
        .filter(([alias, name]) => alias !== name.toLowerCase()) // skip self aliases
        .sort((a, b) => a[0].localeCompare(b[0]));

    if (entries.length === 0) {
        container.innerHTML = '<div class="text-muted">No shorthands available.</div>';
        return;
    }

    entries.forEach(([alias, name]) => {
        const div = document.createElement('div');
        div.className = 'col d-flex align-items-center mb-1';
        div.innerHTML = `<kbd class="me-1">${alias}</kbd><span class="text-white">→ <strong>${name}</strong></span>`;
        container.appendChild(div);
    });
}