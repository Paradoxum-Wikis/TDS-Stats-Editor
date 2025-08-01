class ModeFetcher {
  constructor() {
    this.modesJsonUrl = "/modes.json";
  }

  async fetchModes() {
    try {
      const response = await fetch(this.modesJsonUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const modesData = await response.json();

      return modesData;
    } catch (error) {
      console.error("Error fetching or parsing mode data:", error);
      return [];
    }
  }
}

export default ModeFetcher;
