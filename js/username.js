// Username Detection for Alt1
console.log('Username detector loading...');

// Store detected username
let detectedUsername = null;

// Check if Alt1 is available
function isAlt1Available() {
    return typeof alt1 !== 'undefined' && alt1.currentWorld !== undefined;
}

// Detect username from game
async function detectUsername() {
    console.log('Attempting to detect username...');
    
    if (!isAlt1Available()) {
        console.warn('Alt1 not detected - running in browser mode');
        return promptForUsername();
    }
    
    try {
        // Try to read the username from the game interface
        // This uses Alt1's screen reading capabilities
        
        // Method 1: Try to detect from the right-click menu or chat
        const username = await tryDetectFromGame();
        
        if (username) {
            detectedUsername = username;
            updateUsernameDisplay(username);
            saveUsername(username);
            console.log('Username detected:', username);
            return username;
        } else {
            console.log('Could not auto-detect username');
            return promptForUsername();
        }
    } catch (error) {
        console.error('Error detecting username:', error);
        return promptForUsername();
    }
}

// Try to detect username from game
async function tryDetectFromGame() {
    // Alt1 screen reading approach
    // This is a simplified version - full implementation would use OCR
    
    if (typeof alt1 !== 'undefined' && alt1.currentWorld) {
        // Try to get username from Alt1's game state
        // Note: This requires the user to have certain game interfaces open
        
        // For now, we'll use a placeholder that prompts the user
        // A full implementation would use alt1.bindGetRegion() to read screen areas
        return null;
    }
    
    return null;
}

// Prompt user to enter username manually
function promptForUsername() {
    // Check if we have a saved username first
    const saved = getSavedUsername();
    if (saved) {
        detectedUsername = saved;
        updateUsernameDisplay(saved);
        return saved;
    }
    
    // Prompt for username
    const username = prompt('Enter your RuneScape username to track progress:');
    if (username && username.trim()) {
        const cleanUsername = username.trim();
        detectedUsername = cleanUsername;
        updateUsernameDisplay(cleanUsername);
        saveUsername(cleanUsername);
        return cleanUsername;
    } else {
        updateUsernameDisplay('Not Set');
        return null;
    }
}

// Update the username display in the UI
function updateUsernameDisplay(username) {
    const playerNameElement = document.getElementById('playerName');
    const settingsPlayerName = document.getElementById('settingsPlayerName');
    
    if (playerNameElement) {
        playerNameElement.textContent = username || 'Not detected';
    }
    
    if (settingsPlayerName) {
        settingsPlayerName.textContent = username || 'Not detected';
    }
}

// Save username to localStorage
function saveUsername(username) {
    try {
        localStorage.setItem('rs3helper_username', username);
    } catch (error) {
        console.error('Error saving username:', error);
    }
}

// Get saved username from localStorage
function getSavedUsername() {
    try {
        return localStorage.getItem('rs3helper_username');
    } catch (error) {
        console.error('Error loading username:', error);
        return null;
    }
}

// Initialize username detection
function initUsername() {
    console.log('Initializing username detection...');
    
    // Try to load saved username first
    const saved = getSavedUsername();
    if (saved) {
        detectedUsername = saved;
        updateUsernameDisplay(saved);
    } else {
        // Attempt auto-detection
        setTimeout(() => {
            detectUsername();
        }, 1000);
    }
    
    // Set up refresh button
    const refreshBtn = document.getElementById('refreshName');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('Manual username refresh requested');
            detectUsername();
        });
    }
}

// Export for use in other scripts
window.RS3Helper = window.RS3Helper || {};
window.RS3Helper.username = {
    detect: detectUsername,
    get: () => detectedUsername,
    set: (username) => {
        detectedUsername = username;
        updateUsernameDisplay(username);
        saveUsername(username);
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUsername);
} else {
    initUsername();
}
