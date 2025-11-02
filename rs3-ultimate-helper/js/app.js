// RS3 Ultimate Helper - Main App Controller

// Initialize Alt1 API
const alt1 = window.alt1;

// App State
const AppState = {
    currentTab: 'dashboard',
    questsCompleted: [],
    questsStarted: [],
    userStats: {},
    currentLocation: null,
    activeQuest: null,
    settings: {
        showArrows: true,
        showDistance: true,
        autoTeleport: true,
        preferCheap: false,
        compactMode: false,
        darkTheme: true
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('RS3 Ultimate Helper initializing...');
    
    // Check if Alt1 is available
    if (!alt1) {
        console.warn('Alt1 not detected, running in browser mode');
    } else {
        console.log('Alt1 detected successfully!');
        initializeAlt1Features();
    }
    
    // Load saved data
    loadUserData();
    
    // Setup event listeners
    setupTabNavigation();
    setupQuestSearch();
    setupSettings();
    
    // Initialize modules
    initializeDashboard();
    initializeQuestList();
    initializeMap();
    
    console.log('RS3 Ultimate Helper ready!');
});

// Alt1 Specific Features
function initializeAlt1Features() {
    if (!alt1) return;
    
    // Request permissions
    if (alt1.permissionPixel) {
        console.log('Screen reading permission granted');
        startLocationDetection();
    }
    
    if (alt1.permissionOverlay) {
        console.log('Overlay permission granted');
    }
    
    if (alt1.permissionGameState) {
        console.log('Game state permission granted');
    }
}

// Tab Navigation
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
    
    AppState.currentTab = tabName;
    
    // Load tab-specific content
    loadTabContent(tabName);
}

function loadTabContent(tabName) {
    switch(tabName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'quests':
            updateQuestList();
            break;
        case 'map':
            updateMap();
            break;
        case 'tasks':
            updateTaskList();
            break;
        case 'comp':
            updateCompRequirements();
            break;
    }
}

// Dashboard Functions
function initializeDashboard() {
    updateDashboard();
}

function updateDashboard() {
    // Update quest progress
    const totalQuests = 268;
    const completedQuests = AppState.questsCompleted.length;
    const qpEarned = calculateQuestPoints(AppState.questsCompleted);
    const totalQP = 445;
    
    document.getElementById('quest-progress').textContent = `${completedQuests}/${totalQuests} Quests`;
    document.getElementById('qp-text').textContent = `${qpEarned} / ${totalQP} QP`;
    
    const qpProgress = (qpEarned / totalQP) * 100;
    document.getElementById('qp-progress').style.width = `${qpProgress}%`;
    
    // Update comp progress
    const compProgress = calculateCompProgress();
    document.getElementById('comp-progress').textContent = `${compProgress}% Comp`;
    
    // Generate recommendations
    generateRecommendations();
}

function generateRecommendations() {
    const container = document.getElementById('recommendations');
    container.innerHTML = '';
    
    const recommendations = getSmartRecommendations();
    
    recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
            <div class="title">${rec.icon} ${rec.title}</div>
            <div class="description">${rec.description}</div>
        `;
        item.onclick = () => handleRecommendationClick(rec);
        container.appendChild(item);
    });
}

function getSmartRecommendations() {
    const recs = [];
    
    // Check for available quests
    const availableQuests = getAvailableQuests();
    if (availableQuests.length > 0) {
        recs.push({
            icon: '🎯',
            title: `${availableQuests.length} quests available`,
            description: `You can now complete: ${availableQuests.slice(0, 3).map(q => q.name).join(', ')}`,
            type: 'quest',
            data: availableQuests
        });
    }
    
    // Check for skill training opportunities
    const skillSuggestions = getSkillSuggestions();
    if (skillSuggestions.length > 0) {
        recs.push({
            icon: '📈',
            title: 'Train skills for more quests',
            description: skillSuggestions[0],
            type: 'skill'
        });
    }
    
    // Check for comp cape progress
    const compRemaining = getCompRequirementsRemaining();
    if (compRemaining.length > 0) {
        recs.push({
            icon: '🏆',
            title: 'Work towards Comp Cape',
            description: `${compRemaining.length} requirements remaining`,
            type: 'comp'
        });
    }
    
    return recs;
}

function handleRecommendationClick(rec) {
    switch(rec.type) {
        case 'quest':
            switchTab('quests');
            break;
        case 'comp':
            switchTab('comp');
            break;
        case 'skill':
            // Could open skill calculator or suggestions
            break;
    }
}

// Location Detection
function startLocationDetection() {
    if (!alt1 || !alt1.permissionPixel) return;
    
    setInterval(() => {
        detectPlayerLocation();
    }, 5000); // Check every 5 seconds
}

function detectPlayerLocation() {
    // This would use Alt1's screen reading to detect location
    // For now, placeholder
    const location = {
        name: 'Lumbridge',
        x: 3222,
        y: 3218,
        plane: 0
    };
    
    AppState.currentLocation = location;
    updateLocationDisplay(location);
}

function updateLocationDisplay(location) {
    const container = document.getElementById('location-info');
    if (container && location) {
        container.innerHTML = `
            <strong>📍 ${location.name}</strong><br>
            Coordinates: ${location.x}, ${location.y}, ${location.plane}
        `;
    }
}

// Helper Functions
function calculateQuestPoints(completedQuests) {
    // This would sum up QP from completed quests
    // Placeholder for now
    return completedQuests.length * 2; // Rough average
}

function calculateCompProgress() {
    // Calculate percentage of comp requirements completed
    return 0; // Placeholder
}

function getAvailableQuests() {
    // Returns quests that player can now do based on their stats
    return []; // Placeholder
}

function getSkillSuggestions() {
    // Returns suggestions for skills to train
    return ['Train Mining to 40 to unlock 5 more quests'];
}

function getCompRequirementsRemaining() {
    // Returns list of incomplete comp requirements
    return [];
}

// Data Management
function loadUserData() {
    try {
        const saved = localStorage.getItem('rs3-ultimate-helper-data');
        if (saved) {
            const data = JSON.parse(saved);
            AppState.questsCompleted = data.questsCompleted || [];
            AppState.questsStarted = data.questsStarted || [];
            AppState.userStats = data.userStats || {};
            AppState.settings = {...AppState.settings, ...data.settings};
            console.log('User data loaded');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function saveUserData() {
    try {
        const data = {
            questsCompleted: AppState.questsCompleted,
            questsStarted: AppState.questsStarted,
            userStats: AppState.userStats,
            settings: AppState.settings,
            lastSaved: Date.now()
        };
        localStorage.setItem('rs3-ultimate-helper-data', JSON.stringify(data));
        console.log('User data saved');
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

// Settings
function setupSettings() {
    // Load settings into UI
    Object.keys(AppState.settings).forEach(key => {
        const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
        if (element && element.type === 'checkbox') {
            element.checked = AppState.settings[key];
            element.addEventListener('change', () => {
                AppState.settings[key] = element.checked;
                saveUserData();
            });
        }
    });
}

// Export Functions
window.exportProgress = function() {
    const data = JSON.stringify({
        questsCompleted: AppState.questsCompleted,
        questsStarted: AppState.questsStarted,
        userStats: AppState.userStats,
        exportDate: new Date().toISOString()
    }, null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rs3-helper-progress.json';
    a.click();
};

window.importProgress = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                AppState.questsCompleted = data.questsCompleted || [];
                AppState.questsStarted = data.questsStarted || [];
                AppState.userStats = data.userStats || {};
                saveUserData();
                updateDashboard();
                alert('Progress imported successfully!');
            } catch (error) {
                alert('Error importing progress: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
};

window.resetProgress = function() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
        AppState.questsCompleted = [];
        AppState.questsStarted = [];
        AppState.userStats = {};
        saveUserData();
        updateDashboard();
        alert('Progress reset successfully!');
    }
};

window.checkForUpdates = function() {
    alert('You are running the latest version (1.0.0)');
};

// Auto-save every 5 minutes
setInterval(saveUserData, 5 * 60 * 1000);
