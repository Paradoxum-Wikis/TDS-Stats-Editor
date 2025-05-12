export default class ImageLoader {
  static cacheName = "tdse-image-cache-v1";
  static debugMode = false;

  // helper to log when in debug mode
  static log(...args) {
    if (this.debugMode) {
      console.log("[ImageLoader]", ...args);
    }
  }

  static isRobloxAssetId(imageIdStr) {
    return !imageIdStr.startsWith("http") && /^\d+$/.test(imageIdStr);
  }

  static async fetchImage(imageId) {
    const imageIdStr = String(imageId);

    if (!imageIdStr) {
      return "";
    }

    const isRobloxId = this.isRobloxAssetId(imageIdStr);
    const canUseCache = "caches" in window && isRobloxId;
    const cacheKey = `image-${imageIdStr}`;

    // only check cache for Roblox asset IDs (not URLs basically)
    if (canUseCache) {
      try {
        const cache = await caches.open(this.cacheName);
        const cachedResponse = await cache.match(cacheKey);

        if (cachedResponse && cachedResponse.ok) {
          this.log(`Image ${imageIdStr} loaded from Cache API`);
          const blob = await cachedResponse.blob();
          return URL.createObjectURL(blob);
        }
      } catch (error) {
        console.warn("Cache API error:", error);
        // continue to fetch if cache fails
      }
    }

    // get the url for the image
    const imageUrl = await this.resolveImageUrl(imageIdStr);
    if (!imageUrl) {
      return "";
    }

    // fetch the image
    try {
      const imageResponse = await fetch(imageUrl, { mode: "cors" });

      if (!imageResponse.ok) {
        throw new Error(`Image fetch failed: ${imageResponse.status}`);
      }

      // cache the response if it's a Roblox ID
      if (canUseCache) {
        try {
          const cache = await caches.open(this.cacheName);
          await cache.put(cacheKey, imageResponse.clone());
          this.log(`Image ${imageIdStr} stored in Cache API`);
        } catch (cacheError) {
          console.error(`Failed to cache image ${imageIdStr}:`, cacheError);
          // continue even if caching fails
        }
      }

      // return as object URL
      const blob = await imageResponse.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`Failed to fetch image ${imageIdStr}:`, error);
      return imageUrl;
    }
  }

  // legacy method for compatibility with the older cache url system
  static getFromCache() {
    // cache is now handled by Cache API, so this always returns empty
    // i have an idea on why removing it would wreck the site, but i don't care
    // enough to fix it, so just leave it here for now
    return "";
  }

  static async resolveImageUrl(imageIdStr) {
    let url;

    // "File:" syntax for tdsw images
    if (imageIdStr.startsWith("File:")) {
      const filename = imageIdStr.substring(5); // Remove "File:" prefix
      url = this.convertFileToFandomUrl(filename);
      this.log(`Converted File: syntax to URL: ${url}`);
    } else if (imageIdStr.startsWith("https")) {
      // url handling
      if (imageIdStr.startsWith("https://static.wikia.nocookie.net/")) {
        url = this.trimFandomUrl(imageIdStr);
      } else {
        url = imageIdStr;
      }
    } else {
      // Roblox asset ID handling
      const roProxyUrl = `https://assetdelivery.roproxy.com/v2/assetId/${imageIdStr}`;
      try {
        const response = await fetch(
          `https://api.tds-editor.com/?url=${encodeURIComponent(roProxyUrl)}`,
          {
            method: "GET",
            headers: {
              Origin: window.location.origin,
              "X-Requested-With": "XMLHttpRequest",
            },
          },
        );

        const data = await response.json();
        if (data?.locations?.[0]?.location) {
          url = data.locations[0].location;
        } else {
          url = `./htmlassets/Unavailable.png`;
        }
      } catch (error) {
        console.error(`Failed to fetch image ${imageIdStr}:`, error);
        url = "";
      }
    }

    return url;
  }

  // file: syntax to fandom url converter
  static convertFileToFandomUrl(filename) {
    const md5Hash = CryptoJS.MD5(filename).toString();

    // get first character and first two characters for the path
    const firstChar = md5Hash.charAt(0);
    const firstTwoChars = md5Hash.substring(0, 2);

    // construct the tdsw image url
    return `https://static.wikia.nocookie.net/tower-defense-sim/images/${firstChar}/${firstTwoChars}/${encodeURIComponent(filename)}`;
  }

  static trimFandomUrl(fullUrl) {
    // Fandom url chopping
    const match = fullUrl.match(
      /https:\/\/static\.wikia\.nocookie\.net\/.*?\.(png|jpg|jpeg|gif)/i,
    );
    return match ? match[0] : fullUrl;
  }

  static async clearCacheEntry(imageId) {
    const imageIdStr = String(imageId);

    if (!this.isRobloxAssetId(imageIdStr)) {
      return;
    }

    // clear from Cache API
    if ("caches" in window) {
      try {
        const cache = await caches.open(this.cacheName);
        const deleted = await cache.delete(`image-${imageIdStr}`);
        if (deleted) {
          this.log(`Cached image ${imageIdStr} deleted successfully`);
        }
      } catch (error) {
        console.error(`Failed to delete cached image ${imageIdStr}:`, error);
      }
    }
  }

  // method to clear all cached images
  static async clearAllCache() {
    if ("caches" in window) {
      try {
        const deleted = await caches.delete(this.cacheName);
        if (deleted) {
          this.log("All cached images deleted successfully");
        }
      } catch (error) {
        console.error("Failed to clear Cache API:", error);
      }
    }
  }

  static setDebugMode(enabled) {
    this.debugMode = enabled;
  }
}

// settings check for debug mode
if (localStorage.getItem("imageCacheDebug") === "true") {
  ImageLoader.setDebugMode(true);
}

document.addEventListener("settingsChanged", (event) => {
  if (event.detail.setting === "imageCacheDebug") {
    ImageLoader.setDebugMode(event.detail.value);
  }
});
