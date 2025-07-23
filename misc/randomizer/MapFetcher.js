import ImageLoader from '../../components/ImageLoader.js';

class MapFetcher {
  constructor() {
    this.wikiApiUrl = 'https://api.tds-editor.com/randomizer?type=maps';
  }

  async fetchMaps() {
    try {
      console.log("[MapFetcher] Fetching raw map data from:", this.wikiApiUrl);
      const response = await fetch(
        this.wikiApiUrl,
        {
          method: "GET",
          headers: {
            Origin: window.location.origin,
            "X-Requested-With": "XMLHttpRequest",
          },
        },
      );
      if (!response.ok) {
        console.error("[MapFetcher] HTTP error response:", response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawContent = await response.text();
      console.log("[MapFetcher] Raw content received (truncated to 1337 chars):", rawContent.substring(0, 1337));

      const maps = [];
      const tableRegex = /\{\|class="light-table[^]*?\|\}/gs;
      let tableMatch;
      let tableCount = 0;

      while ((tableMatch = tableRegex.exec(rawContent)) !== null) {
        tableCount++;
        // console.log(`[MapFetcher] Found table #${tableCount}`);
        const tableContent = tableMatch[0];
        const lines = tableContent.split('\n').map(line => line.trim());
        // console.log(`[MapFetcher] Table #${tableCount} has ${lines.length} lines.`);

        let currentDataRowType = null; // 'image', 'name', 'difficulty', 'enemiesBeta'
        const extractedRows = {
          image: [],
          name: [],
          difficulty: [],
          enemiesBeta: []
        };

        for (const line of lines) {
          if (line.startsWith('! style="padding: 5px;" |')) {
            if (line.includes('Map')) {
              currentDataRowType = 'name';
            } else if (line.includes('Difficulty')) {
              currentDataRowType = 'difficulty';
            } else if (line.includes('Enemies Beta?')) {
              currentDataRowType = 'enemiesBeta';
            } else {
              currentDataRowType = 'image';
            }
          } else if (line.startsWith('| style="padding: 5px;" |') && currentDataRowType) {
            const cells = line.split(/\| style="padding: 5px;" \|/).slice(1);
            extractedRows[currentDataRowType].push(...cells);
          }
        }
        // console.log(`[MapFetcher] Extracted rows for table #${tableCount}:`, extractedRows);


        const numMapsInTable = Math.min(
          extractedRows.image.length,
          extractedRows.name.length,
          extractedRows.difficulty.length,
          extractedRows.enemiesBeta.length
        );
        // console.log(`[MapFetcher] Number of maps to process in table #${tableCount}: ${numMapsInTable}`);


        for (let i = 0; i < numMapsInTable; i++) {
          const map = {};
          map.tableNumber = tableCount;

          const imageCell = extractedRows.image[i];
          const imageMatch = imageCell.match(/\[\[File:(.*?)\|/);
          if (imageMatch && imageMatch[1]) {
            map.imageFile = imageMatch[1];
            map.imageUrl = ImageLoader.convertFileToFandomUrl(map.imageFile); 
            // console.log(`[MapFetcher] Map ${i} image: ${map.imageFile}, URL: ${map.imageUrl}`);
          } else {
            map.imageFile = 'Unavailable.png';
            map.imageUrl = './htmlassets/Unavailable.png';
            console.warn(`[MapFetcher] Map ${i} image not found for cell: "${imageCell}", using fallback.`);
          }

          const nameCell = extractedRows.name[i];
          const nameMatch = nameCell.match(/\[\[(?:[^|]*\|)?(.*?)]]/); 
          if (nameMatch && nameMatch[1]) {
            map.name = nameMatch[1];
            // console.log(`[MapFetcher] Extracted Map Name: ${map.name} (Table: ${map.tableNumber})`);
          } else {
            map.name = 'Unknown Map';
            console.warn(`[MapFetcher] Map ${i} name not found for cell: "${nameCell}", using fallback.`);
          }

          // Extract difficulty
          const difficultyCell = extractedRows.difficulty[i];
          const difficultyMatch = difficultyCell.match(/\{\{Colour\|(.*?)\}\}/);
          if (difficultyMatch && difficultyMatch[1]) {
            map.difficulty = difficultyMatch[1];
            // console.log(`[MapFetcher] Map ${i} difficulty: ${map.difficulty}`);
          } else {
            map.difficulty = 'Unknown';
            console.warn(`[MapFetcher] Map ${i} difficulty not found for cell: "${difficultyCell}", using fallback.`);
          }

          // Extract "Enemies Beta?" status
          map.enemiesBeta = extractedRows.enemiesBeta[i].trim();
          // console.log(`[MapFetcher] Map ${i} enemiesBeta: ${map.enemiesBeta}`);

          maps.push(map);
        }
      }
      // console.log(`[MapFetcher] Total tables found: ${tableCount}`);
      // console.log(`[MapFetcher] Total maps extracted: ${maps.length}`);
      return maps;

    } catch (error) {
      console.error("[MapFetcher] Error fetching or parsing map data:", error);
      return [];
    }
  }
}

export default MapFetcher;