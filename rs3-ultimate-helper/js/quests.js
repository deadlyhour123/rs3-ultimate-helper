// RS3 Ultimate Helper - Quest System

// Quest data will be fetched from RuneScape Wiki API
let questDatabase = [];
let selectedQuest = null;

// Initialize Quest System
function initializeQuestList() {
    loadQuestDatabase();
}

// Load quests from Wiki API
async function loadQuestDatabase() {
    console.log('Loading quest database from RuneScape Wiki...');
    
    try {
        // Fetch quest list from Wiki API
        const response = await fetch('https://runescape.wiki/api.php?action=parse&format=json&page=List_of_quests&prop=wikitext&origin=*');
        const data = await response.json();
        
        // Parse the quest data
        questDatabase = await parseQuestData(data);
        
        console.log(`Loaded ${questDatabase.length} quests`);
        updateQuestList();
        
    } catch (error) {
        console.error('Error loading quests:', error);
        // Load fallback data
        loadFallbackQuests();
    }
}

// Parse quest data from Wiki
async function parseQuestData(wikiData) {
    // This would parse the wikitext to extract quest information
    // For now, we'll use a sample dataset
    return getSampleQuests();
}

// Sample quest data (first 20 quests for demo)
function getSampleQuests() {
    return [
        {
            id: 'cooks_assistant',
            name: "Cook's Assistant",
            difficulty: 'Novice',
            length: 'Short',
            members: false,
            questPoints: 1,
            requirements: {},
            rewards: {
                experience: { cooking: 300 },
                items: [],
                unlocks: []
            },
            series: null,
            startLocation: { x: 3207, y: 3214, plane: 0, area: 'Lumbridge Castle' },
            steps: [
                { step: 1, description: 'Talk to the Cook in Lumbridge Castle kitchen', location: { x: 3207, y: 3214, plane: 0 } },
                { step: 2, description: 'Collect an egg from the chicken farm', location: { x: 3226, y: 3297, plane: 0 } },
                { step: 3, description: 'Collect a bucket of milk from dairy cow', location: { x: 3253, y: 3267, plane: 0 } },
                { step: 4, description: 'Collect a pot of flour from the mill', location: { x: 3166, y: 3306, plane: 2 } },
                { step: 5, description: 'Return to the Cook with all items', location: { x: 3207, y: 3214, plane: 0 } }
            ]
        },
        {
            id: 'rune_mysteries',
            name: 'Rune Mysteries',
            difficulty: 'Novice',
            length: 'Short',
            members: false,
            questPoints: 1,
            requirements: {},
            rewards: {
                experience: { runecrafting: 250 },
                items: ['Air talisman'],
                unlocks: ['Runecrafting skill']
            },
            series: 'Ariane',
            startLocation: { x: 3209, y: 3221, plane: 0, area: 'Lumbridge' }
        },
        {
            id: 'demon_slayer',
            name: 'Demon Slayer',
            difficulty: 'Intermediate',
            length: 'Medium',
            members: false,
            questPoints: 3,
            requirements: {},
            rewards: {
                experience: {},
                items: ['Silverlight'],
                unlocks: []
            },
            series: 'Delrith',
            startLocation: { x: 3203, y: 3392, plane: 0, area: 'Varrock' }
        },
        {
            id: 'dragon_slayer',
            name: 'Dragon Slayer',
            difficulty: 'Experienced',
            length: 'Long',
            members: false,
            questPoints: 2,
            requirements: {
                questPoints: 32
            },
            rewards: {
                experience: { strength: 18650, defence: 18650 },
                items: [],
                unlocks: ['Ability to wear rune platebody and green dragonhide body']
            },
            series: null,
            startLocation: { x: 3203, y: 3392, plane: 0, area: 'Champions Guild' }
        },
        {
            id: 'the_restless_ghost',
            name: 'The Restless Ghost',
            difficulty: 'Novice',
            length: 'Short',
            members: false,
            questPoints: 1,
            requirements: {},
            rewards: {
                experience: { prayer: 1125 },
                items: [],
                unlocks: []
            },
            series: null,
            startLocation: { x: 3240, y: 3206, plane: 0, area: 'Lumbridge Chapel' }
        },
        {
            id: 'ernest_the_chicken',
            name: 'Ernest the Chicken',
            difficulty: 'Novice',
            length: 'Short',
            members: false,
            questPoints: 4,
            requirements: {},
            rewards: {
                experience: {},
                items: [],
                unlocks: []
            },
            series: null,
            startLocation: { x: 3109, y: 3336, plane: 0, area: 'Draynor Manor' }
        },
        {
            id: 'waterfall_quest',
            name: 'Waterfall Quest',
            difficulty: 'Intermediate',
            length: 'Medium',
            members: true,
            questPoints: 1,
            requirements: {},
            rewards: {
                experience: { attack: 13750, strength: 13750 },
                items: ['40 gold coins', '2 diamonds'],
                unlocks: []
            },
            series: null,
            startLocation: { x: 2511, y: 3482, plane: 0, area: 'Almera\'s house' }
        },
        {
            id: 'tree_gnome_village',
            name: 'Tree Gnome Village',
            difficulty: 'Intermediate',
            length: 'Medium',
            members: true,
            questPoints: 2,
            requirements: {},
            rewards: {
                experience: { attack: 11450 },
                items: [],
                unlocks: ['Spirit trees']
            },
            series: 'Gnome',
            startLocation: { x: 2542, y: 3170, plane: 0, area: 'Gnome Maze' }
        },
        {
            id: 'plague_city',
            name: 'Plague City',
            difficulty: 'Novice',
            length: 'Short',
            members: true,
            questPoints: 1,
            requirements: {},
            rewards: {
                experience: { mining: 2425 },
                items: [],
                unlocks: []
            },
            series: 'Elf (Prifddinas)',
            startLocation: { x: 2543, y: 3328, plane: 0, area: 'West Ardougne' }
        },
        {
            id: 'the_knights_sword',
            name: "The Knight's Sword",
            difficulty: 'Intermediate',
            length: 'Short',
            members: false,
            questPoints: 1,
            requirements: {
                skills: { mining: 10 }
            },
            rewards: {
                experience: { smithing: 12725 },
                items: [],
                unlocks: []
            },
            series: null,
            startLocation: { x: 2977, y: 3341, plane: 0, area: 'Falador Castle' }
        }
    ];
}

// Load fallback quests if API fails
function loadFallbackQuests() {
    console.log('Loading fallback quest data');
    questDatabase = getSampleQuests();
    updateQuestList();
}

// Setup quest search
function setupQuestSearch() {
    const searchInput = document.getElementById('quest-search');
    const filterSelect = document.getElementById('quest-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterQuests(e.target.value, filterSelect?.value || 'all');
        });
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            filterQuests(searchInput?.value || '', e.target.value);
        });
    }
}

// Filter quests
function filterQuests(searchTerm, filter) {
    const filtered = questDatabase.filter(quest => {
        // Search filter
        if (searchTerm && !quest.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        
        // Category filter
        switch(filter) {
            case 'available':
                return canDoQuest(quest) && !isQuestCompleted(quest.id);
            case 'started':
                return AppState.questsStarted.includes(quest.id);
            case 'completed':
                return isQuestCompleted(quest.id);
            case 'free':
                return !quest.members;
            case 'members':
                return quest.members;
            default:
                return true;
        }
    });
    
    renderQuestList(filtered);
}

// Update quest list
function updateQuestList() {
    filterQuests('', 'all');
}

// Render quest list
function renderQuestList(quests) {
    const container = document.getElementById('quest-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (quests.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #b0b0b0;">No quests found</p>';
        return;
    }
    
    quests.forEach(quest => {
        const item = document.createElement('div');
        item.className = 'quest-item';
        
        // Determine status
        let status = 'locked';
        let statusText = '🔒 Locked';
        
        if (isQuestCompleted(quest.id)) {
            status = 'completed';
            statusText = '✓ Completed';
            item.classList.add('completed');
        } else if (canDoQuest(quest)) {
            status = 'available';
            statusText = '✨ Available';
            item.classList.add('available');
        } else {
            item.classList.add('locked');
        }
        
        item.innerHTML = `
            <div class="quest-info">
                <div class="quest-name">${quest.name}</div>
                <div class="quest-meta">
                    <span>${quest.difficulty}</span>
                    <span>${quest.length}</span>
                    <span>${quest.questPoints} QP</span>
                    <span>${quest.members ? '👑 Members' : '🆓 F2P'}</span>
                </div>
            </div>
            <div class="quest-status ${status}">${statusText}</div>
        `;
        
        item.onclick = () => showQuestDetails(quest);
        container.appendChild(item);
    });
}

// Check if quest can be done
function canDoQuest(quest) {
    // Check requirements
    if (quest.requirements) {
        // Check skill requirements
        if (quest.requirements.skills) {
            for (const [skill, level] of Object.entries(quest.requirements.skills)) {
                if ((AppState.userStats[skill] || 1) < level) {
                    return false;
                }
            }
        }
        
        // Check quest point requirements
        if (quest.requirements.questPoints) {
            const currentQP = calculateQuestPoints(AppState.questsCompleted);
            if (currentQP < quest.requirements.questPoints) {
                return false;
            }
        }
        
        // Check prerequisite quests
        if (quest.requirements.quests) {
            for (const reqQuest of quest.requirements.quests) {
                if (!isQuestCompleted(reqQuest)) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

// Check if quest is completed
function isQuestCompleted(questId) {
    return AppState.questsCompleted.includes(questId);
}

// Show quest details
function showQuestDetails(quest) {
    selectedQuest = quest;
    
    const panel = document.getElementById('quest-details');
    if (!panel) return;
    
    // Populate quest details
    document.getElementById('quest-name').textContent = quest.name;
    document.getElementById('quest-difficulty').textContent = quest.difficulty;
    document.getElementById('quest-length').textContent = quest.length;
    document.getElementById('quest-qp').textContent = `${quest.questPoints} QP`;
    
    // Requirements
    const reqContainer = document.getElementById('quest-requirements');
    reqContainer.innerHTML = renderRequirements(quest);
    
    // Rewards
    const rewardsContainer = document.getElementById('quest-rewards');
    rewardsContainer.innerHTML = renderRewards(quest);
    
    // Steps
    const stepsContainer = document.getElementById('quest-steps');
    stepsContainer.innerHTML = renderQuestSteps(quest);
    
    // Show panel
    panel.classList.remove('hidden');
    panel.classList.add('active');
}

// Close quest details
window.closeQuestDetails = function() {
    const panel = document.getElementById('quest-details');
    if (panel) {
        panel.classList.remove('active');
        setTimeout(() => panel.classList.add('hidden'), 300);
    }
};

// Render requirements
function renderRequirements(quest) {
    if (!quest.requirements || Object.keys(quest.requirements).length === 0) {
        return '<p style="color: #4CAF50;">No requirements! ✓</p>';
    }
    
    let html = '<ul style="list-style: none; padding-left: 0;">';
    
    if (quest.requirements.skills) {
        for (const [skill, level] of Object.entries(quest.requirements.skills)) {
            const userLevel = AppState.userStats[skill] || 1;
            const met = userLevel >= level;
            html += `<li style="color: ${met ? '#4CAF50' : '#e94560'}; margin-bottom: 5px;">
                ${met ? '✓' : '✗'} Level ${level} ${skill.charAt(0).toUpperCase() + skill.slice(1)}
                ${!met ? ` (You have ${userLevel})` : ''}
            </li>`;
        }
    }
    
    if (quest.requirements.questPoints) {
        const currentQP = calculateQuestPoints(AppState.questsCompleted);
        const met = currentQP >= quest.requirements.questPoints;
        html += `<li style="color: ${met ? '#4CAF50' : '#e94560'}; margin-bottom: 5px;">
            ${met ? '✓' : '✗'} ${quest.requirements.questPoints} Quest Points
            ${!met ? ` (You have ${currentQP})` : ''}
        </li>`;
    }
    
    html += '</ul>';
    return html;
}

// Render rewards
function renderRewards(quest) {
    if (!quest.rewards) {
        return '<p>No rewards listed</p>';
    }
    
    let html = '<ul style="list-style: none; padding-left: 0;">';
    
    // Experience rewards
    if (quest.rewards.experience) {
        for (const [skill, xp] of Object.entries(quest.rewards.experience)) {
            html += `<li style="color: #ffd700; margin-bottom: 5px;">
                ✨ ${xp.toLocaleString()} ${skill.charAt(0).toUpperCase() + skill.slice(1)} XP
            </li>`;
        }
    }
    
    // Item rewards
    if (quest.rewards.items && quest.rewards.items.length > 0) {
        quest.rewards.items.forEach(item => {
            html += `<li style="color: #4CAF50; margin-bottom: 5px;">📦 ${item}</li>`;
        });
    }
    
    // Unlocks
    if (quest.rewards.unlocks && quest.rewards.unlocks.length > 0) {
        quest.rewards.unlocks.forEach(unlock => {
            html += `<li style="color: #e94560; margin-bottom: 5px;">🔓 ${unlock}</li>`;
        });
    }
    
    html += '</ul>';
    return html;
}

// Render quest steps
function renderQuestSteps(quest) {
    if (!quest.steps || quest.steps.length === 0) {
        return '<p>Detailed guide will be loaded from RuneScape Wiki...</p>';
    }
    
    let html = '<ol style="padding-left: 20px;">';
    quest.steps.forEach(step => {
        html += `<li style="margin-bottom: 10px; color: #e0e0e0;">${step.description}</li>`;
    });
    html += '</ol>';
    
    return html;
}

// Start quest guide
window.startQuestGuide = function() {
    if (!selectedQuest) return;
    
    AppState.activeQuest = selectedQuest;
    
    // Mark as started
    if (!AppState.questsStarted.includes(selectedQuest.id)) {
        AppState.questsStarted.push(selectedQuest.id);
        saveUserData();
    }
    
    // Switch to map tab with quest objective
    switchTab('map');
    
    // Start navigation
    if (selectedQuest.startLocation) {
        startNavigation(selectedQuest.startLocation, `Start ${selectedQuest.name}`);
    }
    
    // Close details panel
    closeQuestDetails();
    
    // Show arrow overlay
    showArrowOverlay();
};

// Mark quest as complete
function completeQuest(questId) {
    if (!AppState.questsCompleted.includes(questId)) {
        AppState.questsCompleted.push(questId);
    }
    
    // Remove from started
    AppState.questsStarted = AppState.questsStarted.filter(id => id !== questId);
    
    saveUserData();
    updateDashboard();
    updateQuestList();
}
