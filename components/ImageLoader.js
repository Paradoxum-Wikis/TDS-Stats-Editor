export default class ImageLoader {
    static cacheName = 'tdse-image-cache-v1';
    static debugMode = false;

    // helper to log when in debug mode
    static log(...args) {
        if (this.debugMode) {
            console.log('[ImageLoader]', ...args);
        }
    }

    static isRobloxAssetId(imageIdStr) {
        return !imageIdStr.startsWith('http') && /^\d+$/.test(imageIdStr);
    }

    static async fetchImage(imageId) {
        const imageIdStr = String(imageId);
        
        if (!imageIdStr) {
            return '';
        }
        
        // only check cache for Roblox asset IDs (not URLs basically)
        if ('caches' in window && this.isRobloxAssetId(imageIdStr)) {
            try {
                const cache = await caches.open(this.cacheName);
                const cacheKey = `image-${imageIdStr}`;
                const cachedResponse = await cache.match(cacheKey);
                
                if (cachedResponse && cachedResponse.ok) {
                    this.log(`Image ${imageIdStr} loaded from Cache API`);
                    const blob = await cachedResponse.blob();
                    return URL.createObjectURL(blob);
                }
            } catch (error) {
                console.warn('Cache API error:', error);
            }
        }

        // not in Cache API = resolve the image URL
        const imageUrl = await this.resolveImageUrl(imageIdStr);

        if (!imageUrl) {
            return '';
        }

        // Only cache Roblox asset IDs, not URLs
        if ('caches' in window && this.isRobloxAssetId(imageIdStr)) {
            try {
                const imageResponse = await fetch(imageUrl, { mode: 'cors' });
                
                if (!imageResponse.ok) {
                    throw new Error(`Image fetch failed: ${imageResponse.status}`);
                }
                
                // store in Cache API
                const cache = await caches.open(this.cacheName);
                const cacheKey = `image-${imageIdStr}`;
                
                // clone the response since we'll use it below
                await cache.put(cacheKey, imageResponse.clone());
                this.log(`Image ${imageIdStr} stored in Cache API`);
                
                // return as object URL
                const blob = await imageResponse.blob();
                return URL.createObjectURL(blob);
            } catch (error) {
                console.error(`Failed to cache image ${imageIdStr}:`, error);
                return imageUrl;
            }
        } else {
            // For URLs, just fetch and return without caching
            try {
                const imageResponse = await fetch(imageUrl, { mode: 'cors' });
                if (!imageResponse.ok) {
                    throw new Error(`Image fetch failed: ${imageResponse.status}`);
                }
                const blob = await imageResponse.blob();
                return URL.createObjectURL(blob);
            } catch (error) {
                console.error(`Failed to fetch image ${imageIdStr}:`, error);
                return imageUrl;
            }
        }
    }

    // legacy method for compatibility with the older cache url system
    static getFromCache() {
        // cache is now handled by Cache API, so this always returns empty
        // i have an idea on why removing it would wreck the site, but i don't care
        // enough to fix it, so just leave it here for now
        return '';
    }

    static async resolveImageUrl(imageIdStr) {
        let url;
        
        if (imageIdStr.startsWith('https')) { // URL handling
            if (imageIdStr.includes('static.wikia.nocookie.net')) {
                url = this.trimFandomUrl(imageIdStr);
            } else {
                url = imageIdStr;
            }
        } else {
            // Roblox asset ID handling
            const roProxyUrl = `https://assetdelivery.roproxy.com/v2/assetId/${imageIdStr}`;
            try {
                const response = await fetch(`https://occulticnine.vercel.app/?url=${encodeURIComponent(roProxyUrl)}`, {
                    method: 'GET',
                    headers: {
                        'Origin': window.location.origin,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                const data = await response.json();
                if (data?.locations?.[0]?.location) {
                    url = data.locations[0].location;
                } else {
                    url = `./htmlassets/Unavailable.png`;
                }
            } catch (error) {
                console.error(`Failed to fetch image ${imageIdStr}:`, error);
                url = '';
            }
        }
        
        return url;
    }

    static trimFandomUrl(fullUrl) {
        // Fandom url chopping
        const match = fullUrl.match(/https:\/\/static\.wikia\.nocookie\.net\/.*?\.(png|jpg|jpeg|gif)/i);
        return match ? match[0] : fullUrl;
    }

    static async clearCacheEntry(imageId) {
        const imageIdStr = String(imageId);
        
        if (!this.isRobloxAssetId(imageIdStr)) {
            return;
        }
        
        // clear from Cache API
        if ('caches' in window) {
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

    // check if an image exists in the Cache API
    static async checkCacheStatus(imageId) {
        const imageIdStr = String(imageId);
        const status = {
            inCacheAPI: false
        };
        
        if (!this.isRobloxAssetId(imageIdStr)) {
            return status;
        }
        
        if ('caches' in window) {
            try {
                const cache = await caches.open(this.cacheName);
                const cachedResponse = await cache.match(`image-${imageIdStr}`);
                status.inCacheAPI = !!cachedResponse;
            } catch (error) {
                console.warn('Failed to check Cache API status:', error);
            }
        }
        
        return status;
    }

    // method to clear all cached images
    static async clearAllCache() {
        if ('caches' in window) {
            try {
                const deleted = await caches.delete(this.cacheName);
                if (deleted) {
                    this.log('All cached images deleted successfully');
                }
            } catch (error) {
                console.error('Failed to clear Cache API:', error);
            }
        }
    }

    static setDebugMode(enabled) {
        this.debugMode = enabled;
    }
}

// settings check for debug mode
if (localStorage.getItem('imageCacheDebug') === 'true') {
    ImageLoader.setDebugMode(true);
}

document.addEventListener('settingsChanged', (event) => {
    if (event.detail.setting === 'imageCacheDebug') {
        ImageLoader.setDebugMode(event.detail.value);
    }
});