// RS3 Stats Fetcher - Pulls data from Adventurer's Log
console.log('Stats fetcher loading...');

// Stats state
const StatsData = {
    username: null,
    totalLevel: 0,
    questsComplete: 0,
    questPoints: 0,
    lastUpdated: null,
    isLoading: false
};

// Validate RuneScape username format
function isValidRSUsername(username) {
    if (!username) return false;
    
    // RS3 username rules:
    // - 1-12 characters
    // - Letters, numbers, spaces, hyphens, underscores
    // - Can't start/end with special chars
    const pattern = /^[a-zA-Z0-9]+([ _-]{0,1}[a-zA-Z0-9]+)*$/;
    
    return username.length >= 1 && 
           username.length <= 12 && 
           pattern.test(username);
}

// Fetch stats from Adventurer's Log
async function fetchAdventurersLog(username) {
    console.log('Fetching stats for:', username);
    
    if (!isValidRSUsername(username)) {
        throw new Error('Invalid RuneScape username format');
    }
    
    StatsData.isLoading = true;
    updateLoadingState(true);
    
    try {
        // Clean username for URL
        const cleanUsername = username.trim().replace(/\s+/g, '+');
        const url = `https://secure.runescape.com/m=adventurers-log/profile?searchName=${cleanUsername}`;
        
        // Use a CORS proxy to fetch the data
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        
        console.log('Fetching from:', proxyUrl);
        
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch profile (${response.status})`);
        }
        
        const html = await response.text();
        
        // Parse the HTML to extract stats
        const stats = parseAdventurersLog(html, username);
        
        if (!stats) {
            throw new Error('Could not find player profile. Please check the username.');
        }
        
        // Update stats data
        StatsData.username = username;
        StatsData.totalLevel = stats.totalLevel;
        StatsData.questsComplete = stats.questsComplete;
        StatsData.questPoints = stats.questPoints;
        StatsData.lastUpdated = new Date().toISOString();
        
        // Save to localStorage
        saveStatsData();
        
        // Update UI
        updateStatsDisplay();
        
        console.log('Stats fetched successfully:', stats);
        
        return stats;
        
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    } finally {
        StatsData.isLoading = false;
        updateLoadingState(false);
    }
}

// Parse HTML from Adventurer's Log
function parseAdventurersLog(html, username) {
    console.log('Parsing Adventurer\'s Log HTML...');
    
    try {
        // Create a DOM parser
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract total level
        let totalLevel = 0;
        const totalLevelElement = doc.querySelector('.stats-total-level, .plog-stats__total-level, [class*="total-level"]');
        if (totalLevelElement) {
            const levelText = totalLevelElement.textContent.trim();
            totalLevel = parseInt(levelText.replace(/\D/g, '')) || 0;
        } else {
            // Try alternate method - look for any element with total level
            const allText = doc.body.textContent;
            const totalLevelMatch = allText.match(/Total Level[:\s]+(\d+)/i) || 
                                   allText.match(/(\d{3,4})\s*Total/i);
            if (totalLevelMatch) {
                totalLevel = parseInt(totalLevelMatch[1]);
            }
        }
        
        // Extract quest points
        let questPoints = 0;
        const questPointsElement = doc.querySelector('.stats-quest-points, .plog-stats__quest-points, [class*="quest-points"]');
        if (questPointsElement) {
            const qpText = questPointsElement.textContent.trim();
            questPoints = parseInt(qpText.replace(/\D/g, '')) || 0;
        } else {
            // Try alternate method
            const allText = doc.body.textContent;
            const qpMatch = allText.match(/Quest Points?[:\s]+(\d+)/i) ||
                           allText.match(/(\d+)\s*Quest Points?/i);
            if (qpMatch) {
                questPoints = parseInt(qpMatch[1]);
            }
        }
        
        // Calculate quests complete (approximate from quest points)
        // Average quest gives ~2-3 QP, so rough estimate
        const questsComplete = Math.floor(questPoints / 2.5);
        
        // Verify we found at least some data
        if (totalLevel === 0 && questPoints === 0) {
            console.warn('Could not extract stats from page');
            return null;
        }
        
        return {
            totalLevel,
            questsComplete,
            questPoints
        };
        
    } catch (error) {
        console.error('Error parsing HTML:', error);
        return null;
    }
}

// Alternative: Try to fetch from RuneMetrics API
async function fetchFromRuneMetrics(username) {
    console.log('Trying RuneMetrics API for:', username);
    
    try {
        // RuneMetrics profile API
        const cleanUsername = username.trim();
        const url = `https://apps.runescape.com/runemetrics/profile/profile?user=${encodeURIComponent(cleanUsername)}&activities=0`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Player not found or profile is private');
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Extract data
        const totalLevel = data.totalskill || 0;
        const questsComplete = data.questscomplete || 0;
        const questPoints = data.questsnotstarted !== undefined ? 
                           (data.questscomplete * 2) : 0; // Estimate if not available
        
        return {
            totalLevel,
            questsComplete,
            questPoints
        };
        
    } catch (error) {
        console.error('RuneMetrics API error:', error);
        throw error;
    }
}

// Fetch stats using best available method
async function fetchPlayerStats(username) {
    console.log('Fetching player stats for:', username);
    
    // Validate username
    if (!isValidRSUsername(username)) {
        alert('Invalid RuneScape username!\n\nRules:\n- 1-12 characters\n- Letters, numbers, spaces, hyphens, underscores only\n- Cannot start/end with special characters');
        return null;
    }
    
    try {
        // Try RuneMetrics first (official API, no CORS issues)
        try {
            const stats = await fetchFromRuneMetrics(username);
            
            StatsData.username = username;
            StatsData.totalLevel = stats.totalLevel;
            StatsData.questsComplete = stats.questsComplete;
            StatsData.questPoints = stats.questPoints;
            StatsData.lastUpdated = new Date().toISOString();
            
            saveStatsData();
            updateStatsDisplay();
            
            return stats;
            
        } catch (runeMetricsError) {
            console.warn('RuneMetrics failed, trying Adventurer\'s Log:', runeMetricsError);
            
            // Fallback to Adventurer's Log
            return await fetchAdventurersLog(username);
        }
        
    } catch (error) {
        console.error('All stat fetching methods failed:', error);
        alert(`Could not fetch stats for "${username}".\n\nReasons:\n- Player not found\n- Profile is private\n- Network error\n\nPlease check the username and try again.`);
        return null;
    }
}

// Save stats data to localStorage
function saveStatsData() {
    try {
        localStorage.setItem('rs3helper_stats', JSON.stringify(StatsData));
    } catch (error) {
        console.error('Error saving stats:', error);
    }
}

// Load stats data from localStorage
function loadStatsData() {
    try {
        const saved = localStorage.getItem('rs3helper_stats');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(StatsData, data);
            updateStatsDisplay();
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update stats display in UI
function updateStatsDisplay() {
    // Update player name
    const playerNameElements = document.querySelectorAll('#playerName, #settingsPlayerName');
    playerNameElements.forEach(el => {
        if (el) el.textContent = StatsData.username || 'Not detected';
    });
    
    // Update stats in dashboard (if elements exist)
    const totalLevelEl = document.getElementById('totalLevel');
    if (totalLevelEl) {
        totalLevelEl.textContent = StatsData.totalLevel || '?';
    }
    
    const questsCompleteEl = document.getElementById('questsCompleteFromAPI');
    if (questsCompleteEl) {
        questsCompleteEl.textContent = StatsData.questsComplete || '?';
    }
    
    const questPointsEl = document.getElementById('questPointsFromAPI');
    if (questPointsEl) {
        questPointsEl.textContent = StatsData.questPoints || '?';
    }
    
    // Update last updated timestamp
    const lastUpdatedEl = document.getElementById('statsLastUpdated');
    if (lastUpdatedEl && StatsData.lastUpdated) {
        const date = new Date(StatsData.lastUpdated);
        lastUpdatedEl.textContent = date.toLocaleString();
    }
}

// Update loading state in UI
function updateLoadingState(isLoading) {
    const playerNameEl = document.getElementById('playerName');
    if (playerNameEl) {
        playerNameEl.textContent = isLoading ? 'Loading...' : (StatsData.username || 'Not detected');
    }
}

// Prompt for username with validation
function promptForUsername() {
    const savedUsername = StatsData.username || localStorage.getItem('rs3helper_username');
    
    const message = savedUsername ? 
        `Current account: ${savedUsername}\n\nEnter a RuneScape username (1-12 characters):` :
        'Enter your RuneScape username (1-12 characters):';
    
    const username = prompt(message, savedUsername || '');
    
    if (username && username.trim()) {
        return username.trim();
    }
    
    return null;
}

// Initialize stats system
async function initStatsSystem() {
    console.log('Initializing stats system...');
    
    // Load saved stats
    loadStatsData();
    
    // Set up refresh button
    const refreshBtn = document.getElementById('refreshName');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            const username = promptForUsername();
            if (username) {
                await fetchPlayerStats(username);
            }
        });
    }
    
    // Auto-fetch if we have a username but no stats
    if (StatsData.username && StatsData.totalLevel === 0) {
        setTimeout(() => {
            fetchPlayerStats(StatsData.username);
        }, 1000);
    } else if (!StatsData.username) {
        // Prompt for username on first load
        setTimeout(() => {
            const username = promptForUsername();
            if (username) {
                fetchPlayerStats(username);
            }
        }, 1000);
    }
}

// Export for use in other scripts
window.RS3Helper = window.RS3Helper || {};
window.RS3Helper.stats = {
    fetch: fetchPlayerStats,
    get: () => StatsData,
    refresh: () => {
        if (StatsData.username) {
            return fetchPlayerStats(StatsData.username);
        } else {
            const username = promptForUsername();
            if (username) {
                return fetchPlayerStats(username);
            }
        }
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStatsSystem);
} else {
    initStatsSystem();
}

console.log('Stats fetcher loaded');
