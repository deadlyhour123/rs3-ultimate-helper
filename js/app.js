// RS3 Ultimate Helper - Main Application (Themed Version)
console.log('RS3 Ultimate Helper loading...');

// Application State
const AppState = {
    completedQuests: new Set(),
    currentFilter: 'all',
    searchQuery: '',
    stats: {},
    lastSaved: null
};

// Load saved progress from localStorage
function loadProgress() {
    try {
        const saved = localStorage.getItem('rs3helper_progress');
        if (saved) {
            const data = JSON.parse(saved);
            AppState.completedQuests = new Set(data.completedQuests || []);
            AppState.stats = data.stats || {};
            AppState.lastSaved = data.lastUpdated || null;
            console.log('Progress loaded:', AppState.completedQuests.size, 'quests completed');
            updateLastSavedDisplay();
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Save progress to localStorage
function saveProgress() {
    try {
        const now = new Date().toISOString();
        const data = {
            completedQuests: Array.from(AppState.completedQuests),
            stats: AppState.stats,
            lastUpdated: now
        };
        localStorage.setItem('rs3helper_progress', JSON.stringify(data));
        AppState.lastSaved = now;
        updateLastSavedDisplay();
        console.log('Progress saved');
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

// Update last saved display
function updateLastSavedDisplay() {
    const lastSavedElement = document.getElementById('lastSaved');
    if (lastSavedElement && AppState.lastSaved) {
        const date = new Date(AppState.lastSaved);
        lastSavedElement.textContent = date.toLocaleString();
    }
}

// Initialize the app
function initApp() {
    console.log('Initializing app...');
    
    // Load saved progress
    loadProgress();
    
    // Set up tab switching
    setupTabs();
    
    // Set up quest list
    setupQuestList();
    
    // Set up search
    setupSearch();
    
    // Set up filters
    setupFilters();
    
    // Set up tracker
    setupTracker();
    
    // Set up settings
    setupSettings();
    
    // Initial render
    renderQuests();
    updateProgress();
    
    // Check if we have API quest data (delayed to let stats.js load)
    setTimeout(checkForAPIQuestData, 2000);
    
    console.log('App initialized successfully!');
}

// Tab Switching
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const tabName = button.getAttribute('data-tab');
            const content = document.getElementById(tabName);
            if (content) {
                content.classList.add('active');
            }
            
            console.log('Switched to tab:', tabName);
        });
    });
}

// Quest List Setup
function setupQuestList() {
    const questList = document.getElementById('questList');
    if (!questList) return;
    
    questList.addEventListener('click', (e) => {
        const questItem = e.target.closest('.quest-item');
        if (questItem) {
            const questId = parseInt(questItem.getAttribute('data-quest-id'));
            toggleQuestCompletion(questId);
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
            renderQuests();
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                renderQuests();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            renderQuests();
        });
    }
}

// Filter Setup
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all filter buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update filter
            AppState.currentFilter = button.getAttribute('data-filter');
            console.log('Filter changed to:', AppState.currentFilter);
            
            // Re-render quests
            renderQuests();
        });
    });
}

// Render Quests
function renderQuests() {
    const questList = document.getElementById('questList');
    const questCount = document.getElementById('questCount');
    if (!questList) return;
    
    // Filter quests
    let filtered = QUESTS.filter(quest => {
        // Apply search filter
        if (AppState.searchQuery) {
            const matchesSearch = quest.name.toLowerCase().includes(AppState.searchQuery) ||
                                 quest.description.toLowerCase().includes(AppState.searchQuery) ||
                                 quest.difficulty.toLowerCase().includes(AppState.searchQuery);
            if (!matchesSearch) return false;
        }
        
        // Apply completion filter
        if (AppState.currentFilter === 'completed') {
            return AppState.completedQuests.has(quest.id);
        } else if (AppState.currentFilter === 'available') {
            return !AppState.completedQuests.has(quest.id);
        }
        
        return true;
    });
    
    // Update quest count
    if (questCount) {
        const filterText = AppState.currentFilter === 'all' ? 'quests' :
                          AppState.currentFilter === 'completed' ? 'completed quests' :
                          'available quests';
        questCount.textContent = `Showing ${filtered.length} ${filterText}`;
    }
    
    // Render quest items
    if (filtered.length === 0) {
        questList.innerHTML = '<div class="loading">No quests found. Try adjusting your filters or search terms.</div>';
        return;
    }
    
    questList.innerHTML = filtered.map(quest => {
        const isCompleted = AppState.completedQuests.has(quest.id);
        const completedClass = isCompleted ? 'completed' : '';
        const completedIcon = isCompleted ? '✓ ' : '';
        
        // Build requirements text
        let reqText = '';
        if (quest.requirements.quests && quest.requirements.quests.length > 0) {
            reqText = `<div class="quest-requirements"><strong>Requires:</strong> ${quest.requirements.quests.join(', ')}</div>`;
        }
        if (quest.requirements.skills && Object.keys(quest.requirements.skills).length > 0) {
            const skillReqs = Object.entries(quest.requirements.skills)
                .map(([skill, level]) => `${skill} ${level}`)
                .join(', ');
            reqText += `<div class="quest-requirements"><strong>Skills:</strong> ${skillReqs}</div>`;
        }
        
        return `
            <div class="quest-item ${completedClass}" data-quest-id="${quest.id}">
                <div class="quest-name">
                    ${completedIcon}${quest.name}
                </div>
                <span class="quest-difficulty difficulty-${quest.difficulty}">
                    ${quest.difficulty}
                </span>
                <div style="margin-top: 8px; color: #c9b896;">${quest.description}</div>
                <div class="quest-requirements">
                    <strong>Quest Points:</strong> ${quest.questPoints} | 
                    <strong>Length:</strong> ${quest.length}
                </div>
                ${reqText}
            </div>
        `;
    }).join('');
    
    console.log('Rendered', filtered.length, 'quests');
}

// Toggle Quest Completion
function toggleQuestCompletion(questId) {
    if (AppState.completedQuests.has(questId)) {
        AppState.completedQuests.delete(questId);
        console.log('Marked quest', questId, 'as incomplete');
    } else {
        AppState.completedQuests.add(questId);
        console.log('Marked quest', questId, 'as complete');
    }
    
    saveProgress();
    renderQuests();
    updateProgress();
}

// Update Progress Stats
function updateProgress() {
    const totalQuests = QUESTS.length;
    const completedCount = AppState.completedQuests.size;
    const totalQP = QUESTS.reduce((sum, q) => sum + q.questPoints, 0);
    const earnedQP = QUESTS
        .filter(q => AppState.completedQuests.has(q.id))
        .reduce((sum, q) => sum + q.questPoints, 0);
    const percentage = Math.round((completedCount / totalQuests) * 100);
    
    // Update displays
    const questProgress = document.getElementById('questProgress');
    const qpProgress = document.getElementById('qpProgress');
    const completionPercent = document.getElementById('completionPercent');
    const progressBarFill = document.getElementById('progressBarFill');
    
    if (questProgress) questProgress.textContent = `${completedCount} / ${totalQuests}`;
    if (qpProgress) qpProgress.textContent = `${earnedQP} / ${totalQP}`;
    if (completionPercent) completionPercent.textContent = `${percentage}%`;
    if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
    
    console.log('Progress updated:', completedCount, 'quests,', earnedQP, 'QP,', percentage + '%');
}

// Tracker Setup
function setupTracker() {
    const syncBtn = document.getElementById('syncProgress');
    const resetBtn = document.getElementById('resetProgress');
    const syncQuestsBtn = document.getElementById('syncQuestsFromAPI');
    const viewQuestListBtn = document.getElementById('viewQuestList');
    
    if (syncBtn) {
        syncBtn.addEventListener('click', () => {
            if (typeof alt1 !== 'undefined') {
                alert('Game sync feature is coming soon! This will automatically detect your completed quests from the game interface.');
            } else {
                alert('Alt1 Toolkit is required for game sync. Please install Alt1 and add this app to use this feature.');
            }
            console.log('Sync requested');
        });
    }
    
    if (syncQuestsBtn) {
        syncQuestsBtn.addEventListener('click', () => {
            syncQuestsFromAPI();
        });
    }
    
    if (viewQuestListBtn) {
        viewQuestListBtn.addEventListener('click', () => {
            toggleAPIQuestList();
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const confirmText = 'Are you sure you want to reset ALL progress?\n\nThis will:\n- Clear all completed quests\n- Reset your Quest Points to 0\n- Delete your save data\n\nThis action CANNOT be undone!';
            
            if (confirm(confirmText)) {
                AppState.completedQuests.clear();
                saveProgress();
                renderQuests();
                updateProgress();
                alert('All progress has been reset!');
                console.log('Progress reset');
            }
        });
    }
    
    // Check if we have quest data from API
    checkForAPIQuestData();
}

// Check if we have quest data from API and show sync button
function checkForAPIQuestData() {
    if (window.RS3Helper && window.RS3Helper.stats) {
        const questList = window.RS3Helper.stats.getQuestList();
        if (questList && questList.length > 0) {
            // Show the sync button
            const syncBtn = document.getElementById('syncQuestsFromAPI');
            const viewBtn = document.getElementById('viewQuestList');
            if (syncBtn) syncBtn.style.display = 'inline-block';
            if (viewBtn) viewBtn.style.display = 'inline-block';
        }
    }
}

// Sync quests from API to local tracking
function syncQuestsFromAPI() {
    if (!window.RS3Helper || !window.RS3Helper.stats) {
        alert('No quest data available. Please refresh your stats first.');
        return;
    }
    
    const questList = window.RS3Helper.stats.getQuestList();
    if (!questList || questList.length === 0) {
        alert('No quest data available. Please refresh your stats first.');
        return;
    }
    
    const completedQuests = questList.filter(q => q.status === 'COMPLETED');
    
    if (!confirm(`This will mark ${completedQuests.length} quests as complete based on your RS3 profile.\n\nNote: This only works for quests that are already in the local database.\n\nContinue?`)) {
        return;
    }
    
    let matched = 0;
    let notFound = 0;
    
    completedQuests.forEach(apiQuest => {
        // Try to find matching quest in local QUESTS array
        const localQuest = QUESTS.find(q => 
            q.name.toLowerCase() === apiQuest.title.toLowerCase() ||
            q.name.toLowerCase().includes(apiQuest.title.toLowerCase()) ||
            apiQuest.title.toLowerCase().includes(q.name.toLowerCase())
        );
        
        if (localQuest) {
            AppState.completedQuests.add(localQuest.id);
            matched++;
        } else {
            notFound++;
            console.log('Quest not found in local database:', apiQuest.title);
        }
    });
    
    saveProgress();
    renderQuests();
    updateProgress();
    
    alert(`Sync complete!\n\n✓ Matched: ${matched} quests\n⚠ Not found: ${notFound} quests\n\nNote: Quests not found in your local database were skipped. Use the Quest Editor to add all 268 RS3 quests for complete matching.`);
}

// Toggle API quest list display
function toggleAPIQuestList() {
    const listDiv = document.getElementById('apiQuestList');
    const contentDiv = document.getElementById('apiQuestListContent');
    
    if (!listDiv || !contentDiv) return;
    
    if (listDiv.style.display === 'none') {
        // Show the list
        const questList = window.RS3Helper.stats.getQuestList();
        if (!questList || questList.length === 0) {
            alert('No quest data available.');
            return;
        }
        
        // Render quest list
        const completed = questList.filter(q => q.status === 'COMPLETED');
        const notStarted = questList.filter(q => q.status === 'NOT_STARTED');
        const started = questList.filter(q => q.status === 'STARTED');
        
        contentDiv.innerHTML = `
            <div style="margin-bottom: 15px;">
                <strong>Completed:</strong> ${completed.length} | 
                <strong>Started:</strong> ${started.length} | 
                <strong>Not Started:</strong> ${notStarted.length} | 
                <strong>Total:</strong> ${questList.length}
            </div>
            
            ${completed.length > 0 ? `
                <h3 style="color: #4a7c59; margin-top: 20px;">✓ Completed Quests (${completed.length})</h3>
                ${completed.map(q => `
                    <div style="padding: 8px; margin: 5px 0; background: rgba(74, 124, 89, 0.2); border-left: 3px solid #4a7c59; border-radius: 4px;">
                        <strong>${q.title}</strong> - ${q.questPoints} QP
                        ${q.difficulty ? ` | Difficulty: ${q.difficulty}` : ''}
                    </div>
                `).join('')}
            ` : ''}
            
            ${started.length > 0 ? `
                <h3 style="color: #c87a28; margin-top: 20px;">⚡ Started Quests (${started.length})</h3>
                ${started.map(q => `
                    <div style="padding: 8px; margin: 5px 0; background: rgba(200, 122, 40, 0.2); border-left: 3px solid #c87a28; border-radius: 4px;">
                        <strong>${q.title}</strong> - ${q.questPoints} QP
                    </div>
                `).join('')}
            ` : ''}
        `;
        
        listDiv.style.display = 'block';
        document.getElementById('viewQuestList').textContent = '✕ Hide Quest List';
    } else {
        // Hide the list
        listDiv.style.display = 'none';
        document.getElementById('viewQuestList').textContent = 'View All Quests from Profile';
    }
}

// Settings Setup
function setupSettings() {
    const exportBtn = document.getElementById('exportData');
    const importBtn = document.getElementById('importData');
    const detectStatsBtn = document.getElementById('detectStats');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const username = window.RS3Helper?.username?.get() || 'Unknown';
            const data = {
                username: username,
                completedQuests: Array.from(AppState.completedQuests),
                stats: AppState.stats,
                exportDate: new Date().toISOString(),
                version: '1.0.2'
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `rs3helper-${username}-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            console.log('Data exported for user:', username);
        });
    }
    
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        
                        // Validate data
                        if (!data.completedQuests) {
                            throw new Error('Invalid save file format');
                        }
                        
                        // Import data
                        AppState.completedQuests = new Set(data.completedQuests || []);
                        AppState.stats = data.stats || {};
                        
                        // If username is in the import, update it
                        if (data.username && window.RS3Helper?.username?.set) {
                            window.RS3Helper.username.set(data.username);
                        }
                        
                        saveProgress();
                        renderQuests();
                        updateProgress();
                        
                        alert(`Progress imported successfully!\n\nQuests Completed: ${AppState.completedQuests.size}\nAccount: ${data.username || 'Unknown'}`);
                        console.log('Data imported successfully');
                    } catch (error) {
                        alert('Error importing data: ' + error.message + '\n\nPlease make sure you selected a valid RS3 Helper save file.');
                        console.error('Import error:', error);
                    }
                };
                
                reader.readAsText(file);
            };
            
            input.click();
        });
    }
    
    if (detectStatsBtn) {
        detectStatsBtn.addEventListener('click', () => {
            if (typeof alt1 !== 'undefined') {
                alert('Stat detection is coming soon! This will automatically read your skill levels from the game.');
            } else {
                alert('Alt1 Toolkit is required for stat detection. Please install Alt1 and add this app to use this feature.');
            }
            console.log('Stat detection requested');
        });
    }
    
    // Checkbox listeners
    const checkboxes = document.querySelectorAll('.setting-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        // Load saved settings
        const savedSetting = localStorage.getItem(`rs3helper_setting_${checkbox.id}`);
        if (savedSetting !== null) {
            checkbox.checked = savedSetting === 'true';
        }
        
        checkbox.addEventListener('change', (e) => {
            console.log('Setting changed:', e.target.id, e.target.checked);
            localStorage.setItem(`rs3helper_setting_${e.target.id}`, e.target.checked);
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

console.log('App script loaded');
