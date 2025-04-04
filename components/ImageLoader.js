export default class ImageLoader {
    static imageCache = {};

    static async fetchImage(imageId) {
        let url;
        // convert to imageid to string to safely use string methods
        const imageIdStr = String(imageId);
    
        if (imageIdStr.startsWith('https')) { // check if its a url
            if (imageIdStr.includes('static.wikia.nocookie.net')) {
                url = this.trimFandomUrl(imageIdStr);
            } else {
                url = imageIdStr; // use the url as is
            }
        } else {
            // assume that it's a Roblox asset id
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
                url = ''; // Fallback to empty string
            }
        }
    
        if (url) {
            this.imageCache[imageId] = url; // cache using original imageid
        }
        return url;
    }

    static trimFandomUrl(fullUrl) {
        // Fandom url chopping
        const match = fullUrl.match(/https:\/\/static\.wikia\.nocookie\.net\/.*?\.(png|jpg|jpeg|gif)/i);
        return match ? match[0] : fullUrl;
    }

    static getFromCache(imageId) {
        return this.imageCache[imageId];
    }
}