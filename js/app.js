// RS3 Ultimate Helper - Main Application
console.log('RS3 Ultimate Helper loading...');

// Application State
const AppState = {
    completedQuests: new Set(),
    currentFilter: 'all',
    searchQuery: '',
    stats: {}
};

// Load saved progress from localStorage
function loadProgress() {
    try {
        const saved = localStorage.getItem('rs3helper_progress');
        if (saved) {
            const data = JSON.parse(saved);
            AppState.completedQuests = new Set(data.completedQuests || []);
            AppState.stats = data.stats || {};
            console.log('Progress loaded:', AppState.completedQuests.size, 'quests completed');
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Save progress to localStorage
function saveProgress() {
    try {
        const data = {
            completedQuests: Array.from(AppState.completedQuests),
            stats: AppState.stats,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('rs3helper_progress', JSON.stringify(data));
        console.log('Progress saved');
    } catch (error) {
        console.error('Error saving progress:', error);
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
    if (!questList) return;
    
    // Filter quests
    let filtered = QUESTS.filter(quest => {
        // Apply search filter
        if (AppState.searchQuery) {
            const matchesSearch = quest.name.toLowerCase().includes(AppState.searchQuery) ||
                                 quest.description.toLowerCase().includes(AppState.searchQuery);
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
    
    // Render quest items
    if (filtered.length === 0) {
        questList.innerHTML = '<p class="loading">No quests found. Try adjusting your filters.</p>';
        return;
    }
    
    questList.innerHTML = filtered.map(quest => {
        const isCompleted = AppState.completedQuests.has(quest.id);
        const completedClass = isCompleted ? 'completed' : '';
        
        return `
            <div class="quest-item ${completedClass}" data-quest-id="${quest.id}">
                <div class="quest-name">
                    ${isCompleted ? '✅ ' : ''}${quest.name}
                </div>
                <span class="quest-difficulty difficulty-${quest.difficulty}">
                    ${quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
                </span>
                <div>${quest.description}</div>
                <div class="quest-requirements">
                    <strong>Quest Points:</strong> ${quest.questPoints} | 
                    <strong>Length:</strong> ${quest.length}
                </div>
                ${quest.requirements.quests && quest.requirements.quests.length > 0 ? 
                    `<div class="quest-requirements"><strong>Requires:</strong> ${quest.requirements.quests.join(', ')}</div>` : ''}
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
    
    if (questProgress) questProgress.textContent = `${completedCount} / ${totalQuests}`;
    if (qpProgress) qpProgress.textContent = `${earnedQP} / ${totalQP}`;
    if (completionPercent) completionPercent.textContent = `${percentage}%`;
    
    console.log('Progress updated:', completedCount, 'quests,', earnedQP, 'QP');
}

// Tracker Setup
function setupTracker() {
    const syncBtn = document.getElementById('syncProgress');
    const resetBtn = document.getElementById('resetProgress');
    
    if (syncBtn) {
        syncBtn.addEventListener('click', () => {
            alert('Game sync is not yet implemented. This feature requires Alt1 integration.');
            console.log('Sync requested');
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
                AppState.completedQuests.clear();
                saveProgress();
                renderQuests();
                updateProgress();
                alert('Progress reset successfully!');
                console.log('Progress reset');
            }
        });
    }
}

// Settings Setup
function setupSettings() {
    const exportBtn = document.getElementById('exportData');
    const importBtn = document.getElementById('importData');
    const detectStatsBtn = document.getElementById('detectStats');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = {
                completedQuests: Array.from(AppState.completedQuests),
                stats: AppState.stats,
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'rs3helper-progress.json';
            a.click();
            
            console.log('Data exported');
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
                        AppState.completedQuests = new Set(data.completedQuests || []);
                        AppState.stats = data.stats || {};
                        saveProgress();
                        renderQuests();
                        updateProgress();
                        alert('Progress imported successfully!');
                        console.log('Data imported');
                    } catch (error) {
                        alert('Error importing data: ' + error.message);
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
            alert('Stat detection requires Alt1 integration. This feature is coming soon!');
            console.log('Stat detection requested');
        });
    }
    
    // Checkbox listeners
    const checkboxes = document.querySelectorAll('.setting-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            console.log('Setting changed:', e.target.id, e.target.checked);
            // Save settings to localStorage if needed
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
