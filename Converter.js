function fetchTowerInfo(towerData) {
    const towerInfo = {};

    const regex = {
        title1: /title1\s*=\s*([^\n]*)/,
        basecost: /basecost\s*=\s*([^\n]*)/,
        placement_limit: /placement_limit\s*=\s*([^\n]*)/,
        basedamage: /basedamage\s*=\s*([^\n]*)/,
        basefirerate: /basefirerate\s*=\s*([^\n]*)/,
        baserange: /baserange\s*=\s*([^\n]*)/,
        hidden_detection: /hidden_detection\s*=\s*([^\n]*)/,
        flying_detection: /flying_detection\s*=\s*([^\n]*)/,
        lead_detection: /lead_detection\s*=\s*([^\n]*)/,
        statsTable: /\{\|[\s\S]*?\|-([\s\S]*?)\|\}/g
    };

    towerInfo.title1 = (towerData.match(regex.title1) || [])[1]?.trim() || 'N/A';
    towerInfo.basecost = (towerData.match(regex.basecost) || [])[1]?.trim() || 'N/A';
    towerInfo.placement_limit = (towerData.match(regex.placement_limit) || [])[1]?.trim() || 'N/A';
    towerInfo.basedamage = (towerData.match(regex.basedamage) || [])[1]?.trim() || 'N/A';
    towerInfo.basefirerate = (towerData.match(regex.basefirerate) || [])[1]?.trim() || 'N/A';
    towerInfo.baserange = (towerData.match(regex.baserange) || [])[1]?.trim() || 'N/A';
    towerInfo.hidden_detection = (towerData.match(regex.hidden_detection) || [])[1]?.trim() || 'N/A';
    towerInfo.flying_detection = (towerData.match(regex.flying_detection) || [])[1]?.trim() || 'N/A';
    towerInfo.lead_detection = (towerData.match(regex.lead_detection) || [])[1]?.trim() || 'N/A';

    const statsTableWikitext = (towerData.match(regex.statsTable) || [])[0]?.trim() || 'No stats table found';

    towerInfo.statsTable = parseStatsTable(statsTableWikitext);

    return towerInfo;
}

function parseStatsTable(statsTableWikitext) {
    const stats = {};
    const rowRegex = /\|-([\s\S]*?)(?=\n\|-|\|\})/g; // Matches rows, starting with '|-'
    const cellRegex = /\|\s*([^|\n]+)/g; // Matches cells, separated by '|'

    let rowIndex = 0;
    let rowMatch;

    console.log('Stats Table Wikitext:', statsTableWikitext); // Console log for debug and shit

    // Loop through each row in the stats table
    while ((rowMatch = rowRegex.exec(statsTableWikitext)) !== null) {
        const rowData = rowMatch[1].trim();
        const cells = [...rowData.matchAll(cellRegex)];

        console.log(`Row ${rowIndex}:`, rowData);
    
        if (rowIndex === 0) {
            rowIndex++;
            continue;
        }

        if (cells.length >= 9) {
            stats[`totalprice${rowIndex - 1}`] = cleanText(cells[1][1]);
            stats[`damage${rowIndex - 1}`] = cleanText(cells[2][1]);
            stats[`tick${rowIndex - 1}`] = cleanText(cells[3][1]);
            stats[`chargeup${rowIndex - 1}`] = cleanText(cells[4][1]);
            stats[`cooldown${rowIndex - 1}`] = cleanText(cells[5][1]);
            stats[`overcharge${rowIndex - 1}`] = cleanText(cells[6][1]);
            stats[`range${rowIndex - 1}`] = cleanText(cells[7][1]);
            stats[`dps${rowIndex - 1}`] = cleanText(cells[8][1]);
            stats[`costefficiency${rowIndex - 1}`] = cleanText(cells[9][1]);

            rowIndex++;
        } else {
            console.warn(`Row ${rowIndex} skipped due to insufficient columns.`);
        }
    }

    console.log('Parsed Stats:', stats);
    return stats;
}


function cleanText(value) {
    let cleanedValue = value.replace(/style="[^"]*"/g, '').trim();

    if (cleanedValue.includes('{{Money|')) {
        cleanedValue = cleanedValue.replace(/\{\{Money\|([^\}]+)\}\}/, '$1').trim();
    }

    cleanedValue = cleanedValue.replace(/\{\{[^\}]+\}\}/g, '');
    cleanedValue = cleanedValue.replace(/\[\[[^\]]+\]\]/g, '');

    const numericValue = parseFloat(cleanedValue.replace(/[^\d.-]/g, ''));

    return isNaN(numericValue) ? cleanedValue : numericValue;
}

document.getElementById('towerForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const towerData = document.getElementById('towerData').value;

    const towerDetails = fetchTowerInfo(towerData);

    document.getElementById('output').textContent = JSON.stringify(towerDetails, null, 2);
});