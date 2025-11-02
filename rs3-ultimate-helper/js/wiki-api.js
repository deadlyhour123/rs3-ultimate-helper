// RS3 Ultimate Helper - RuneScape Wiki API Integration

const WIKI_API_BASE = 'https://runescape.wiki/api.php';
const WIKI_BASE = 'https://runescape.wiki/w/';

// Fetch quest data from Wiki
async function fetchQuestFromWiki(questName) {
    try {
        const url = `${WIKI_API_BASE}?action=parse&format=json&page=${encodeURIComponent(questName)}&prop=wikitext&origin=*`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.parse && data.parse.wikitext) {
            return parseQuestWikitext(data.parse.wikitext['*']);
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching quest from wiki:', error);
        return null;
    }
}

// Parse quest wikitext
function parseQuestWikitext(wikitext) {
    // This would parse the wikitext format to extract quest information
    // For a full implementation, you'd use a wikitext parser
    const quest = {
        steps: [],
        requirements: {},
        rewards: {}
    };
    
    // Extract basic information using regex patterns
    // This is a simplified version - full implementation would be more robust
    
    return quest;
}

// Fetch all quests list
async function fetchAllQuestsFromWiki() {
    try {
        const url = `${WIKI_API_BASE}?action=parse&format=json&page=List_of_quests&prop=text&origin=*`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.parse && data.parse.text) {
            return parseQuestList(data.parse.text['*']);
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching quest list from wiki:', error);
        return [];
    }
}

// Parse quest list HTML
function parseQuestList(html) {
    // Create temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const quests = [];
    const rows = doc.querySelectorAll('table.wikitable tr');
    
    rows.forEach((row, index) => {
        if (index === 0) return; // Skip header
        
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) return;
        
        const questName = cells[0].textContent.trim();
        const difficulty = cells[1]?.textContent.trim() || 'Unknown';
        const length = cells[2]?.textContent.trim() || 'Unknown';
        
        quests.push({
            name: questName,
            difficulty: difficulty,
            length: length
        });
    });
    
    return quests;
}

// Fetch item information
async function fetchItemInfo(itemName) {
    try {
        const url = `${WIKI_API_BASE}?action=parse&format=json&page=${encodeURIComponent(itemName)}&prop=wikitext&origin=*`;
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching item info:', error);
        return null;
    }
}

// Fetch location coordinates from wiki
async function fetchLocationCoordinates(locationName) {
    try {
        // Query the wiki for location information
        const url = `${WIKI_API_BASE}?action=query&format=json&list=search&srsearch=${encodeURIComponent(locationName)}&origin=*`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.query && data.query.search && data.query.search.length > 0) {
            const pageName = data.query.search[0].title;
            
            // Fetch the page content
            return await fetchPageCoordinates(pageName);
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching location:', error);
        return null;
    }
}

// Fetch coordinates from a wiki page
async function fetchPageCoordinates(pageName) {
    try {
        const url = `${WIKI_API_BASE}?action=parse&format=json&page=${encodeURIComponent(pageName)}&prop=wikitext&origin=*`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.parse && data.parse.wikitext) {
            // Extract coordinates from wikitext
            // Coordinates are often in format like: {{coords|x|y|z|...}}
            const coordRegex = /\{\{coords\|(\d+)\|(\d+)\|(\d+)/;
            const match = data.parse.wikitext['*'].match(coordRegex);
            
            if (match) {
                return {
                    x: parseInt(match[1]),
                    y: parseInt(match[2]),
                    plane: parseInt(match[3])
                };
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching page coordinates:', error);
        return null;
    }
}

// Search wiki
async function searchWiki(query) {
    try {
        const url = `${WIKI_API_BASE}?action=opensearch&format=json&search=${encodeURIComponent(query)}&limit=10&origin=*`;
        const response = await fetch(url);
        const data = await response.json();
        
        // OpenSearch returns: [query, [titles], [descriptions], [urls]]
        if (data && data.length >= 2) {
            return data[1].map((title, index) => ({
                title: title,
                url: data[3] ? data[3][index] : `${WIKI_BASE}${encodeURIComponent(title)}`
            }));
        }
        
        return [];
    } catch (error) {
        console.error('Error searching wiki:', error);
        return [];
    }
}

// Get wiki page URL
function getWikiUrl(pageName) {
    return `${WIKI_BASE}${encodeURIComponent(pageName.replace(/ /g, '_'))}`;
}

// Cache system for Wiki API calls
const wikiCache = new Map();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

async function cachedWikiRequest(key, fetchFunction) {
    const cached = wikiCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    
    const data = await fetchFunction();
    wikiCache.set(key, {
        data: data,
        timestamp: Date.now()
    });
    
    return data;
}

// Export functions for use in other modules
window.WikiAPI = {
    fetchQuestFromWiki,
    fetchAllQuestsFromWiki,
    fetchItemInfo,
    fetchLocationCoordinates,
    searchWiki,
    getWikiUrl
};
