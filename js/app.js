// RS3 Ultimate Helper - Enhanced with Alt1 Detection & Quest Log
console.log('RS3 Ultimate Helper Enhanced loading...');

// Application State - Now uses only API data, no local tracking
const AppState = {
    username: null,
    apiQuests: [], // All quests from API
    currentFilter: 'all',
    searchQuery: '',
    stats: {},
    lastSaved: null,
    selectedQuest: null,
    inventoryItems: []
};

// Alt1 Detection
const Alt1 = {
    available: typeof alt1 !== 'undefined',
    
    // Detect items in inventory
    async detectInventory() {
        if (!this.available) return [];
        
        try {
            // Use Alt1 to read inventory
            const inv = await alt1.inventory.find();
            return inv.map(item => item.name);
        } catch (error) {
            console.error('Inventory detection error:', error);
            return [];
        }
    },
    
    // Check if player has required items
    async checkRequiredItems(requiredItems) {
        const inventory = await this.detectInventory();
        const missing = [];
        const have = [];
        
        requiredItems.forEach(item => {
            if (inventory.includes(item)) {
                have.push(item);
            } else {
                missing.push(item);
            }
        });
        
        return { have, missing, inventory };
    }
};

// Initialize the app
function initApp() {
    console.log('Initializing enhanced app...');
    
    // Set up tab switching
    setupTabs();
    
    // Set up quest log
    setupQuestLog();
    
    // Set up search
    setupSearch();
    
    // Set up filters
    setupFilters();
    
    // Listen for stats updates
    window.addEventListener('rs3helper_stats_updated', handleStatsUpdate);
    
    // Check for Alt1
    if (Alt1.available) {
        console.log('✅ Alt1 Toolkit detected! Item detection enabled.');
        showNotification('Alt1 detected! Item checking enabled.', 'success');
    } else {
        console.log('⚠️ Alt1 not detected. Item detection disabled.');
    }
    
    console.log('App initialized successfully!');
}

// Handle stats update - Load quest data from API
function handleStatsUpdate(event) {
    console.log('Stats updated, loading quest data...');
    
    if (window.RS3Helper && window.RS3Helper.stats) {
        const questList = window.RS3Helper.stats.getQuestList();
        if (questList && questList.length > 0) {
            AppState.apiQuests = questList;
            AppState.username = event.detail.username;
            renderQuestLog();
            updateStats();
            showNotification(`Loaded ${questList.length} quests from your profile`, 'success');
        }
    }
}

// Tab Switching
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            
            const tabName = button.getAttribute('data-tab');
            const content = document.getElementById(tabName);
            if (content) {
                content.classList.add('active');
            }
            
            console.log('Switched to tab:', tabName);
        });
    });
}

// Quest Log Setup
function setupQuestLog() {
    const questLog = document.getElementById('questLog');
    if (!questLog) return;
    
    questLog.addEventListener('click', async (e) => {
        const questItem = e.target.closest('.quest-item');
        if (questItem) {
            const questTitle = questItem.getAttribute('data-quest-title');
            const quest = AppState.apiQuests.find(q => q.title === questTitle);
            if (quest) {
                await showQuestDetails(quest);
            }
        }
    });
}

// Search Setup
function setupSearch() {
    const searchInput = document.getElementById('questSearch');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            AppState.searchQuery = e.target.value.toLowerCase();
            renderQuestLog();
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                renderQuestLog();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            renderQuestLog();
        });
    }
}

// Filter Setup
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            AppState.currentFilter = button.getAttribute('data-filter');
            console.log('Filter changed to:', AppState.currentFilter);
            
            renderQuestLog();
        });
    });
}

// Generate wiki link
function getWikiLink(questName) {
    const wikiName = questName.replace(/\s+/g, '_').replace(/'/g, '%27');
    return `https://runescape.wiki/w/${wikiName}/Quick_guide`;
}

// Get teleport methods for common locations
function getTeleportMethods(location) {
    const teleports = {
        'Lumbridge': ['Lumbridge Home Teleport', 'Lumbridge lodestone'],
        'Varrock': ['Varrock Teleport', 'Varrock lodestone'],
        'Falador': ['Falador Teleport', 'Falador lodestone'],
        'Draynor': ['Draynor lodestone', 'Amulet of glory to Draynor'],
        'Al Kharid': ['Al Kharid lodestone', 'Lumbridge → East'],
        'Wizards\' Tower': ['Draynor lodestone → South'],
        'Ardougne': ['Ardougne lodestone', 'Ardougne Teleport'],
        'Port Sarim': ['Port Sarim lodestone', 'Explorer\'s ring to Cabbage patch'],
        'Karamja': ['Karamja lodestone', 'Amulet of glory to Musa Point'],
        'Crandor': ['Boat from Port Sarim after quest']
    };
    
    // Try to match location
    for (const [key, methods] of Object.entries(teleports)) {
        if (location.toLowerCase().includes(key.toLowerCase())) {
            return methods;
        }
    }
    
    return ['Check wiki for teleport methods'];
}

// Render Quest Log
function renderQuestLog() {
    const questLog = document.getElementById('questLog');
    const questCount = document.getElementById('questCount');
    if (!questLog) return;
    
    if (AppState.apiQuests.length === 0) {
        questLog.innerHTML = `
            <div class="loading">
                <p>📡 No quest data loaded yet.</p>
                <p>Please enter your RuneScape username in the header to load your quest data.</p>
            </div>
        `;
        return;
    }
    
    // Filter quests
    let filtered = AppState.apiQuests.filter(quest => {
        // Apply search filter
        if (AppState.searchQuery) {
            const matchesSearch = quest.title.toLowerCase().includes(AppState.searchQuery) ||
                                 (quest.difficulty && quest.difficulty.toLowerCase().includes(AppState.searchQuery));
            if (!matchesSearch) return false;
        }
        
        // Apply completion filter
        if (AppState.currentFilter === 'completed') {
            return quest.status === 'COMPLETED';
        } else if (AppState.currentFilter === 'available') {
            return quest.status === 'NOT_STARTED';
        } else if (AppState.currentFilter === 'started') {
            return quest.status === 'STARTED';
        }
        
        return true;
    });
    
    // Update quest count
    if (questCount) {
        const filterText = AppState.currentFilter === 'all' ? 'quests' :
                          AppState.currentFilter === 'completed' ? 'completed quests' :
                          AppState.currentFilter === 'started' ? 'in-progress quests' :
                          'available quests';
        questCount.textContent = `Showing ${filtered.length} ${filterText}`;
    }
    
    // Render quest items
    if (filtered.length === 0) {
        questLog.innerHTML = '<div class="loading">No quests found. Try adjusting your filters or search terms.</div>';
        return;
    }
    
    questLog.innerHTML = filtered.map(quest => {
        const statusIcon = quest.status === 'COMPLETED' ? '✓' : 
                          quest.status === 'STARTED' ? '⚡' : '○';
        const statusClass = quest.status === 'COMPLETED' ? 'completed' : 
                           quest.status === 'STARTED' ? 'started' : 'not-started';
        const wikiLink = getWikiLink(quest.title);
        
        return `
            <div class="quest-item ${statusClass}" data-quest-title="${quest.title}">
                <div class="quest-header">
                    <div class="quest-name">
                        ${statusIcon} ${quest.title}
                    </div>
                    <div class="quest-badges">
                        ${quest.difficulty ? `<span class="quest-difficulty difficulty-${quest.difficulty.toLowerCase()}">${quest.difficulty}</span>` : ''}
                        <span class="quest-points">${quest.questPoints} QP</span>
                    </div>
                </div>
                <div class="quest-meta">
                    <span>Status: <strong>${quest.status.replace('_', ' ')}</strong></span>
                    ${quest.userEligible !== undefined ? `| Eligible: ${quest.userEligible ? '✓' : '✗'}` : ''}
                </div>
                <div class="quest-actions">
                    <button class="btn-wiki" onclick="window.open('${wikiLink}', '_blank')">📖 Quick Guide</button>
                    <button class="btn-details">📍 Show Details</button>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('Rendered', filtered.length, 'quests from API');
}

// Show quest details with location, teleports, and item requirements
async function showQuestDetails(quest) {
    AppState.selectedQuest = quest;
    
    const modal = document.createElement('div');
    modal.className = 'quest-modal';
    modal.id = 'questModal';
    
    const wikiLink = getWikiLink(quest.title);
    
    // Get location from local database if available
    const localQuest = QUESTS.find(q => 
        q.name.toLowerCase() === quest.title.toLowerCase() ||
        q.name.toLowerCase().includes(quest.title.toLowerCase())
    );
    
    const location = localQuest?.location || 'See wiki for location';
    const teleportMethods = getTeleportMethods(location);
    const requiredItems = localQuest?.requirements?.items || [];
    
    // Check inventory if Alt1 available
    let inventoryCheck = '';
    if (Alt1.available && requiredItems.length > 0) {
        const result = await Alt1.checkRequiredItems(requiredItems);
        inventoryCheck = `
            <div class="inventory-check">
                <h4>🎒 Inventory Check (Alt1)</h4>
                ${result.have.length > 0 ? `<p class="have-items">✓ You have: ${result.have.join(', ')}</p>` : ''}
                ${result.missing.length > 0 ? `<p class="missing-items">✗ Missing: ${result.missing.join(', ')}</p>` : ''}
            </div>
        `;
    } else if (requiredItems.length > 0) {
        inventoryCheck = `
            <div class="inventory-check">
                <h4>📦 Required Items</h4>
                <p>${requiredItems.join(', ')}</p>
                <p class="note">Install Alt1 Toolkit for automatic item detection!</p>
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="quest-modal-content">
            <span class="close-modal" onclick="closeQuestModal()">&times;</span>
            
            <h2>${quest.title}</h2>
            
            <div class="quest-status-bar">
                <span class="status-badge ${quest.status.toLowerCase()}">${quest.status.replace('_', ' ')}</span>
                <span class="qp-badge">${quest.questPoints} Quest Points</span>
                ${quest.difficulty ? `<span class="diff-badge">${quest.difficulty}</span>` : ''}
            </div>
            
            <div class="quest-location-section">
                <h3>📍 Where to Start</h3>
                <div class="location-box">
                    <strong>Location:</strong> ${location}
                </div>
                
                <h4>🚀 Teleport Methods</h4>
                <ul class="teleport-list">
                    ${teleportMethods.map(method => `<li>• ${method}</li>`).join('')}
                </ul>
            </div>
            
            ${inventoryCheck}
            
            <div class="quest-requirements">
                ${localQuest?.requirements?.skills && Object.keys(localQuest.requirements.skills).length > 0 ? `
                    <h4>⚔️ Skill Requirements</h4>
                    <ul>
                        ${Object.entries(localQuest.requirements.skills).map(([skill, level]) => 
                            `<li>${skill}: ${level}</li>`
                        ).join('')}
                    </ul>
                ` : ''}
                
                ${localQuest?.requirements?.quests && localQuest.requirements.quests.length > 0 ? `
                    <h4>📜 Quest Requirements</h4>
                    <ul>
                        ${localQuest.requirements.quests.map(q => `<li>${q}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
            
            <div class="quest-guide-section">
                <h3>📖 Quick Guide</h3>
                <iframe src="${wikiLink}" class="wiki-iframe"></iframe>
                <a href="${wikiLink}" target="_blank" class="btn-primary">Open in New Tab</a>
            </div>
            
            <button onclick="closeQuestModal()" class="btn-secondary">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Close quest modal
window.closeQuestModal = function() {
    const modal = document.getElementById('questModal');
    if (modal) {
        modal.remove();
    }
};

// Update statistics display
function updateStats() {
    if (AppState.apiQuests.length === 0) return;
    
    const completed = AppState.apiQuests.filter(q => q.status === 'COMPLETED').length;
    const started = AppState.apiQuests.filter(q => q.status === 'STARTED').length;
    const notStarted = AppState.apiQuests.filter(q => q.status === 'NOT_STARTED').length;
    const totalQP = AppState.apiQuests
        .filter(q => q.status === 'COMPLETED')
        .reduce((sum, q) => sum + q.questPoints, 0);
    const totalPossibleQP = AppState.apiQuests.reduce((sum, q) => sum + q.questPoints, 0);
    const percentage = Math.round((completed / AppState.apiQuests.length) * 100);
    
    // Update progress displays
    const questProgress = document.getElementById('questProgress');
    const qpProgress = document.getElementById('qpProgress');
    const completionPercent = document.getElementById('completionPercent');
    const progressBarFill = document.getElementById('progressBarFill');
    
    if (questProgress) questProgress.textContent = `${completed} / ${AppState.apiQuests.length}`;
    if (qpProgress) qpProgress.textContent = `${totalQP} / ${totalPossibleQP}`;
    if (completionPercent) completionPercent.textContent = `${percentage}%`;
    if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
    
    console.log('Stats updated:', completed, 'completed,', totalQP, 'QP,', percentage + '%');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4a7c59' : type === 'error' ? '#b84a4a' : '#5a7fb8'};
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        border: 2px solid ${type === 'success' ? '#5a8c69' : type === 'error' ? '#c85a5a' : '#6a8fc8'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS
const style = document.createElement('style');
style.textContent = `
    .quest-modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        overflow-y: auto;
    }
    
    .quest-modal-content {
        background: linear-gradient(135deg, #2a1f1a 0%, #1f1810 100%);
        margin: 50px auto;
        padding: 30px;
        border: 3px solid #4a3820;
        border-radius: 8px;
        max-width: 800px;
        color: #e6d5b8;
    }
    
    .close-modal {
        color: #d4af37;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
    }
    
    .close-modal:hover {
        color: #f4e4c1;
    }
    
    .quest-status-bar {
        display: flex;
        gap: 10px;
        margin: 15px 0;
        flex-wrap: wrap;
    }
    
    .status-badge, .qp-badge, .diff-badge {
        padding: 5px 12px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.9em;
    }
    
    .status-badge.completed { background: #4a7c59; color: white; }
    .status-badge.started { background: #c87a28; color: white; }
    .status-badge.not_started { background: #5a4428; color: #e6d5b8; }
    
    .qp-badge { background: #d4af37; color: #1a1410; }
    
    .quest-location-section {
        background: rgba(90, 68, 40, 0.2);
        border: 2px solid #5a4428;
        border-radius: 6px;
        padding: 15px;
        margin: 20px 0;
    }
    
    .location-box {
        background: rgba(0, 0, 0, 0.3);
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
        font-size: 1.1em;
    }
    
    .teleport-list {
        list-style: none;
        padding: 0;
        margin: 10px 0;
    }
    
    .teleport-list li {
        background: rgba(0, 0, 0, 0.2);
        padding: 8px;
        margin: 5px 0;
        border-radius: 4px;
        border-left: 3px solid #d4af37;
    }
    
    .inventory-check {
        background: rgba(74, 124, 89, 0.2);
        border: 2px solid #4a7c59;
        border-radius: 6px;
        padding: 15px;
        margin: 20px 0;
    }
    
    .have-items {
        color: #7fba9f;
        margin: 5px 0;
    }
    
    .missing-items {
        color: #d88a88;
        margin: 5px 0;
    }
    
    .wiki-iframe {
        width: 100%;
        height: 400px;
        border: 2px solid #5a4428;
        border-radius: 6px;
        margin: 10px 0;
    }
    
    .quest-item {
        cursor: pointer;
    }
    
    .quest-item:hover {
        transform: translateX(5px);
    }
    
    .quest-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .quest-badges {
        display: flex;
        gap: 10px;
    }
    
    .quest-actions {
        margin-top: 10px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .btn-wiki, .btn-details {
        padding: 6px 12px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .btn-wiki {
        background: linear-gradient(135deg, #d4af37 0%, #aa8a1f 100%);
        color: #1a1410;
    }
    
    .btn-details {
        background: linear-gradient(135deg, #5a7fb8 0%, #4a6fa8 100%);
        color: white;
    }
    
    .btn-wiki:hover, .btn-details:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    }
    
    .quest-item.started {
        border-color: #c87a28;
        background: linear-gradient(135deg, rgba(200, 122, 40, 0.2) 0%, rgba(184, 106, 24, 0.2) 100%);
    }
    
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

console.log('Enhanced app script loaded');
