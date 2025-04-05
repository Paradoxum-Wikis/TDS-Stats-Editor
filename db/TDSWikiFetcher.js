/**
 * TDSWikiFetcher.js
 * gets tower data from the TDS wiki
 */

class TDSWikiFetcher {
    constructor() {
        this.wikiBaseUrl = 'https://tds.fandom.com';
        this.categoryUrl = '/wiki/Special:CategoryTree?target=Category%3ATDSDatabase&mode=pages&namespaces=500';
        
        // backup proxies in case one fails
        this.corsProxies = [
            'https://occulticnine.vercel.app/',
            'https://api.cors.lol/?url=',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://api.allorigins.win/raw?url=',
        ];
        this.currentProxyIndex = 0;
        
        // get featured towers
        this.featuredTowers = window.featuredTowers || [];
    }

    /**
     * gets current proxy
     */
    getCurrentProxy() {
        return this.corsProxies[this.currentProxyIndex];
    }

    /**
     * tries next proxy if current one fails
     */
    switchToNextProxy() {
        if (this.currentProxyIndex < this.corsProxies.length - 1) {
            this.currentProxyIndex++;
            console.log(`switching to backup proxy: ${this.getCurrentProxy()}`);
            return true;
        }
        console.warn("all proxies failed");
        return false;
    }

    /**
     * tries to fetch with fallbacks
     */
    async fetchWithFallback(url) {
        let attempts = 0;
        const maxAttempts = this.corsProxies.length;
        
        while (attempts < maxAttempts) {
            try {
                const proxy = this.getCurrentProxy();
                console.log(`trying proxy ${this.currentProxyIndex + 1}/${maxAttempts}: ${proxy}`);
                
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                
                // Use different URL structures depending on the proxy
                let requestUrl;
                if (proxy === 'https://occulticnine.vercel.app/') {
                    // For O;N, use the existing format
                    requestUrl = `${proxy}api?url=${encodeURIComponent(url)}`;
                } else {
                    // For all other proxies, use encodeURIComponent
                    requestUrl = `${proxy}${encodeURIComponent(url)}`;
                }
                
                const response = await fetch(requestUrl, {
                    headers: {
                        'Origin': window.location.origin,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`http error! status: ${response.status}`);
                }
                
                return response;
            } catch (error) {
                console.warn(`proxy ${this.currentProxyIndex + 1} failed:`, error);
                attempts++;
                
                if (!this.switchToNextProxy()) {
                    throw new Error("all proxies failed");
                }
            }
        }
        
        throw new Error("all proxies failed after max attempts");
    }

    /**
     * gets towers from wiki
     */
    async fetchTowers() {
        try {
            console.log("fetching towers from wiki...");
            
            const url = `${this.wikiBaseUrl}${this.categoryUrl}`;
            const response = await this.fetchWithFallback(url);
            const html = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const towerElements = doc.querySelectorAll('.CategoryTreeItem');
            console.log(`found ${towerElements.length} towers on wiki`);
            
            if (towerElements.length === 0) {
                console.warn("no towers found, using defaults");
                return this.getFallbackTowers();
            }
            
            const towers = Array.from(towerElements)
                .filter(element => element.querySelector('a')?.href.includes('User_blog:'))
                .map(element => {
                    const link = element.querySelector('a');
                    let fullText = link?.textContent?.trim() || 'Unknown Tower';
                    
                    // Handle the new format "User blog:Username/TowerName"
                    if (fullText.startsWith('User blog:')) {
                        fullText = fullText.replace('User blog:', '');
                    }
                    
                    // get tower name from path
                    const towerName = fullText.includes('/') ? fullText.split('/').pop() : fullText;
                    
                    return {
                        name: towerName,
                        url: link?.getAttribute('href') || '#',
                        image: 'https://static.wikia.nocookie.net/tower-defense-sim/images/4/4a/Site-favicon.ico',
                        author: fullText.includes('/') ? fullText.split('/')[0] : 'Wiki Contributor',
                        featured: this.featuredTowers.includes(fullText),
                        verified: window.approvedTowers ? window.approvedTowers.includes(fullText) : false,
                        unverified: window.approvedTowers ? !window.approvedTowers.includes(fullText) : true,
                        grandfathered: window.grandfatheredTowers ? window.grandfatheredTowers.includes(fullText) : false
                    };
                });
            
            if (towers.length === 0) {
                console.warn("no towers found, using defaults");
                return this.getFallbackTowers();
            }
            
            console.log(`loading details for ${towers.length} towers...`);
            const enrichmentPromises = towers.map(tower => 
                this.enrichTowerData(tower).catch(err => 
                    console.warn(`failed to get details for ${tower.name}:`, err))
            );
            
            await Promise.allSettled(enrichmentPromises);
            return towers;
        } catch (error) {
            console.error('failed to get towers from wiki:', error);
            return this.getFallbackTowers();
        }
    }
    
    /**
     * gets more info for a tower
     */
    async enrichTowerData(tower) {
        try {
            console.log(`getting data for tower: ${tower.name}`);
            const url = `${this.wikiBaseUrl}${tower.url}`;

            const response = await this.fetchWithFallback(url);
            const html = await response.text();

            // parse html
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            let contentElement = null;

            // check for the desc id
            const descElement = doc.querySelector('#desc');
            if (descElement) {
                tower.description = descElement.textContent.trim();
                contentElement =
                    doc.querySelector('.mw-parser-output') ||
                    doc.querySelector('.page-content') ||
                    doc.querySelector('#mw-content-text') ||
                    doc.querySelector('.wds-tab__content');
            } else {
                // old method for backwards compatibility
                contentElement =
                    doc.querySelector('.mw-parser-output') ||
                    doc.querySelector('.page-content') ||
                    doc.querySelector('#mw-content-text') ||
                    doc.querySelector('.wds-tab__content');

                if (contentElement) {
                    // get description with old method
                    const paragraphs = contentElement.querySelectorAll('p');
                    if (paragraphs.length > 0) {
                        tower.description = paragraphs[0].textContent.trim();
                    } else {
                        // try text nodes if no paragraphs
                        const textNodes = Array.from(contentElement.childNodes)
                            .filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());

                        if (textNodes.length > 0) {
                            tower.description = textNodes[0].textContent.trim();
                        }
                    }
                }
            }

            if (contentElement) {
                const images = Array.from(contentElement.querySelectorAll('img'))
                    .filter(img => !img.closest('pre')); // no pre tags allowed smh, yet

                if (images.length > 0) {
                    // Use the first image that isn't a favicon or icon
                    for (const img of images) {
                        const imgSrc = img.getAttribute('src') || '';
                        if (imgSrc && !imgSrc.includes('favicon') && !imgSrc.includes('icon')) {
                            tower.image = imgSrc;
                            break; // Found a suitable image, stop looking
                        }
                    }
                }

                // check for RobloxID
                if (!tower.image || tower.image.includes('Site-favicon.ico')) {
                    const contentText = contentElement.textContent;
                    const robloxIdMatch = contentText.match(/RobloxID(\d+)/i);

                    if (robloxIdMatch) {
                        const robloxId = robloxIdMatch[1];
                        try {
                            const roProxyUrl = `https://assetdelivery.roproxy.com/v2/assetId/${robloxId}`;
                            const robloxResponse = await fetch(`https://occulticnine.vercel.app/?url=${encodeURIComponent(roProxyUrl)}`, {
                                method: 'GET',
                                headers: {
                                    'Origin': window.location.origin,
                                    'X-Requested-With': 'XMLHttpRequest'
                                }
                            });

                            const data = await robloxResponse.json();
                            if (data?.locations?.[0]?.location) {
                                tower.image = data.locations[0].location;
                            } else {
                                tower.image = `./../htmlassets/Unavailable.png`;
                            }
                        } catch (error) {
                            console.warn(`failed to get roblox image ${robloxId}:`, error);
                        }
                    } else {
                        // As a last resort, find image URLs in text OUTSIDE of pre tags
                        const mainContent = Array.from(contentElement.childNodes)
                            .filter(node => node.nodeName !== 'PRE')
                            .map(node => node.textContent || '')
                            .join(' ');

                        const imgUrlRegex = /https?:\/\/[^\s"'<>()]+(\.png|\.jpg|\.jpeg|\.gif)(?:\?[^\s"'<>()]*)?/i;
                        const match = mainContent.match(imgUrlRegex);

                        if (match) {
                            tower.image = match[0];
                        }
                    }
                }

                // get tower tag
                const allTextContent = contentElement.textContent;
                const tagMatch = allTextContent.match(/\b(New|Rework|Rebalance)\b/);
                if (tagMatch) {
                    tower.tag = tagMatch[0];
                }

                // get json data
                const preElement = doc.querySelector('pre#towerdata') ||
                                  doc.querySelector('pre[id="towerdata"]') ||
                                  doc.querySelector('pre');

                if (preElement) {
                    const preContent = preElement.innerHTML.trim();
                    const linkMatch = preContent.match(/<a\s+href="(https?:\/\/tds\.fandom\.com\/wiki\/User_blog:.+\/.+)".*?>.*?<\/a>/i) ||
                                     preContent.match(/(https?:\/\/tds\.fandom\.com\/wiki\/User_blog:.+\/.+)/i);

                    if (linkMatch) {
                        tower.linkedTower = linkMatch[1];
                        tower.isLink = true;
                    } else {
                        try {
                            const jsonData = JSON.parse(preContent);
                            tower.data = jsonData;

                            // get tower name from json
                            const firstKey = Object.keys(jsonData)[0];
                            if (firstKey && typeof firstKey === 'string') {
                                tower.jsonName = firstKey;
                            }
                        } catch (jsonError) {
                            console.warn(`bad json for ${tower.name}:`, jsonError);
                        }
                    }
                }
            }

            // get date posted
            const dateElement = doc.querySelector('.page-header__blog-post-details');
            if (dateElement) {
                const dateText = Array.from(dateElement.childNodes)
                    .filter(node => node.nodeType === Node.TEXT_NODE)
                    .map(node => node.textContent.trim())
                    .filter(text => text && !text.includes('•'))
                    .shift();

                if (dateText) {
                    tower.uploadDate = dateText;
                }
            } else {
                // look for date elsewhere
                const timeElement = doc.querySelector('time');
                if (timeElement) {
                    tower.uploadDate = timeElement.textContent.trim();
                }
            }

            // use default if no date found
            if (!tower.uploadDate) {
                tower.uploadDate = 'Recently';
            }
        } catch (error) {
            console.warn(`failed to get info for ${tower.name}:`, error);
        }
    }
    
    /**
     * fallback towers if wiki fails (placeholder data for testing mostly tbh)
     */
    getFallbackTowers() {
        console.log("using fallback towers");
        return [
            {
                name: "GAIA",
                description: "GAIA is an Earth Simulator developed by the GAI Computer Corporation.",
                image: "https://static.wikia.nocookie.net/tower-defense-sim/images/2/23/SlasherReworkUpgrade4.png",
                author: "Nishijou",
            },
            {
                name: "Noah II",
                description: "Noah II is a second-generation artificial Gigalomaniac device developed by N.O.Z.O.M.I.",
                image: "https://static.wikia.nocookie.net/tower-defense-sim/images/a/ab/MiniLevel4.png",
                author: "Takumi",
            },
            {
                name: "Pyro Mage",
                description: "Deals fire damage over time to enemies in a wide area.",
                image: "https://static.wikia.nocookie.net/tower-defense-sim/images/9/92/MinigunnerUpgradeLevel3.png",
                author: "Takuru",
            },
            {
                name: "Shadow Assassin",
                description: "Stealthy tower with high critical damage and hidden detection.",
                image: "https://static.wikia.nocookie.net/tower-defense-sim/images/c/c4/MinigunnerUpgradeLevel2.png",
                author: "Miyashiro",
            }
        ];
    }
}