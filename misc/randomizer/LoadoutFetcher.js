import ImageLoader from "../../components/ImageLoader.js";

class LoadoutFetcher {
  constructor() {
    this.wikiApiUrl = "https://api.tds-editor.com/randomizer?type=towers";
  }

  async fetchTowers() {
    try {
      console.log("[LoadoutFetcher] Fetching raw tower data from:", this.wikiApiUrl);
      const response = await fetch(this.wikiApiUrl, {
        method: "GET",
        headers: {
          Origin: window.location.origin,
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      if (!response.ok) {
        console.error(
          "[LoadoutFetcher] HTTP error! status:",
          response.status,
          response.statusText,
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawContent = await response.text();
      console.log(
        "[LoadoutFetcher] Raw content received (truncated to 1337 chars):",
        rawContent.substring(0, 1337),
      );
      console.log("[LoadoutFetcher] Full content length:", rawContent.length);

      const towers = [];
      const tableRegex = /\{\|\s*class="light-table[^]*?\|\}/gs;
      console.log("[LoadoutFetcher] Starting table search with regex:", tableRegex);
      let tableMatch;
      let tableCount = 0;

      while ((tableMatch = tableRegex.exec(rawContent)) !== null) {
        tableCount++;
        console.log(`[LoadoutFetcher] Found table #${tableCount}`);
        console.log(`[LoadoutFetcher] Table content preview:`, tableMatch[0].substring(0, 500));
        
        const tableContent = tableMatch[0];
        const lines = tableContent.split("\n").map((line) => line.trim());
        console.log(`[LoadoutFetcher] Table #${tableCount} has ${lines.length} lines.`);
        console.log(`[LoadoutFetcher] First 10 lines of table #${tableCount}:`, lines.slice(0, 10));

        let isImageRow = false;
        const imageAndLinkCells = [];

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex];
          console.log(`[LoadoutFetcher] Processing line ${lineIndex}: "${line}"`);

          if (line.startsWith('!') && !line.startsWith('|-')) {
            console.log(`[LoadoutFetcher] Found header line: ${line}`);
            if (line.includes("Tower") || line.includes("Unlock Method") || line.includes("Level Required") || line.includes("Unlock Cost")) {
              isImageRow = false;
              console.log(`[LoadoutFetcher] Setting isImageRow = false (text header)`);
            } else {
              isImageRow = true;
              console.log(`[LoadoutFetcher] Setting isImageRow = true (image header)`);
            }
          } else if (line.startsWith('|') && !line.startsWith('|-') && isImageRow) {
            console.log(`[LoadoutFetcher] Found image row data line: ${line}`);
            const cellContent = line.substring(1).trim();
            console.log(`[LoadoutFetcher] Processing cell content: "${cellContent}"`);
            
            if (cellContent) {
              imageAndLinkCells.push(cellContent);
              console.log(`[LoadoutFetcher] imageAndLinkCells now has ${imageAndLinkCells.length} entries`);
            }
          } else {
            console.log(`[LoadoutFetcher] Skipping line: "${line}"`);
          }
        }

        console.log(`[LoadoutFetcher] Total imageAndLinkCells for table #${tableCount}:`, imageAndLinkCells.length);
        console.log(`[LoadoutFetcher] imageAndLinkCells content:`, imageAndLinkCells);

        for (let i = 0; i < imageAndLinkCells.length; i++) {
          const cellContent = imageAndLinkCells[i];
          console.log(`[LoadoutFetcher] Processing cell ${i}: "${cellContent}"`);
          
          const tower = {};
          const match = cellContent.match(/\[\[File:(.*?)\|.*?link=(.*?)]]/);
          console.log(`[LoadoutFetcher] Regex match result:`, match);
          
          if (match && match[1] && match[2]) {
            tower.imageFile = match[1];
            tower.imageUrl = ImageLoader.convertFileToFandomUrl(
              tower.imageFile,
            );
            tower.name = match[2];
            tower.isExclusive = tableCount === 6;
            tower.isGolden = tableCount === 5;
            tower.isRemoved = tableCount === 7;
            console.log(`[LoadoutFetcher] Successfully parsed tower:`, tower);
            towers.push(tower);
          } else {
            console.warn(
              "[LoadoutFetcher] Tower image/link not found for cell:",
              cellContent,
            );
          }
        }
      }
      
      console.log(`[LoadoutFetcher] Total tables found: ${tableCount}`);
      console.log(`[LoadoutFetcher] Total towers extracted: ${towers.length}`);
      console.log(`[LoadoutFetcher] All extracted towers:`, towers);
      
      if (towers.length === 0) {
        console.error(`[LoadoutFetcher] No towers were extracted! Raw content sample:`, rawContent.substring(0, 2000));
      }
      
      return towers;
    } catch (error) {
      console.error(
        "[LoadoutFetcher] Error fetching or parsing tower data:",
        error,
      );
      console.error("[LoadoutFetcher] Error stack:", error.stack);
      return [];
    }
  }
}

export default LoadoutFetcher;
