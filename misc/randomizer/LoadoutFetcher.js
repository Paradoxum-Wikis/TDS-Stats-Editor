import ImageLoader from '../../components/ImageLoader.js';

class LoadoutFetcher {
  constructor() {
    this.wikiApiUrl = 'https://api.tds-editor.com/randomizer?type=towers';
  }

  async fetchTowers() {
    try {
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
        console.error("[LoadoutFetcher] HTTP error! status:", response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawContent = await response.text();

      const towers = [];
      const tableRegex = /\{\|\s*class="light-table[^]*?\|\}/gs; 
      let tableMatch;
      let tableCount = 0;

      while ((tableMatch = tableRegex.exec(rawContent)) !== null) {
        tableCount++;
        const tableContent = tableMatch[0];
        const lines = tableContent.split('\n').map(line => line.trim());

        let isImageRow = false;
        const imageAndLinkCells = [];

        for (const line of lines) {
          if (line.startsWith('! style="padding: 5px;" |')) {
            if (!line.includes('Tower') && !line.includes('Unlock Method')) {
              isImageRow = true;
            } else {
              isImageRow = false;
            }
          } else if (line.startsWith('| style="padding: 5px;" |') && isImageRow) {
            const cells = line.split(/\| style="padding: 5px;" \|/).slice(1);
            imageAndLinkCells.push(...cells);
          }
        }

        for (const cellContent of imageAndLinkCells) {
          const tower = {};
          const match = cellContent.match(/\[\[File:(.*?)\|.*?link=(.*?)]]/);

          if (match && match[1] && match[2]) {
            tower.imageFile = match[1];
            tower.imageUrl = ImageLoader.convertFileToFandomUrl(tower.imageFile); 
            tower.name = match[2];
            towers.push(tower);
          } else {
            console.warn("[LoadoutFetcher] Tower image/link not found for cell:", cellContent);
          }
        }
      }
      return towers;

    } catch (error) {
      console.error("[LoadoutFetcher] Error fetching or parsing tower data:", error);
      return [];
    }
  }
}

export default LoadoutFetcher;