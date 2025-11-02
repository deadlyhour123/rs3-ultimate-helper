// RS3 Quest Editor - Manage Quest Database
console.log('Quest Editor loading...');

// Quest database
let quests = [];
let editingIndex = -1;
let nextId = 1;

// Load quests from localStorage
function loadQuests() {
    try {
        const saved = localStorage.getItem('rs3_quest_editor_data');
        if (saved) {
            const data = JSON.parse(saved);
            quests = data.quests || [];
            nextId = data.nextId || quests.length + 1;
            console.log('Loaded', quests.length, 'quests');
        } else {
            // Load default quests if none saved
            loadDefaultQuests();
        }
    } catch (error) {
        console.error('Error loading quests:', error);
        loadDefaultQuests();
    }
    
    renderQuestList();
    updateStats();
}

// Save quests to localStorage
function saveQuests() {
    try {
        const data = {
            quests: quests,
            nextId: nextId,
            lastModified: new Date().toISOString()
        };
        localStorage.setItem('rs3_quest_editor_data', JSON.stringify(data));
        updateStats();
        console.log('Saved', quests.length, 'quests');
    } catch (error) {
        console.error('Error saving quests:', error);
        alert('Error saving quests: ' + error.message);
    }
}

// Load default quest set
function loadDefaultQuests() {
    quests = [
        {
            id: 1,
            name: "Cook's Assistant",
            difficulty: "novice",
            questPoints: 1,
            requirements: { skills: {}, quests: [] },
            length: "Short",
            description: "Help the cook in Lumbridge Castle prepare for a banquet.",
            rewards: ["300 Cooking XP", "Access to the Lumbridge Castle kitchen"],
            series: "None"
        }
    ];
    nextId = 2;
}

// Render quest list
function renderQuestList() {
    const listEl = document.getElementById('questList');
    if (!listEl) return;
    
    if (quests.length === 0) {
        listEl.innerHTML = '<div style="text-align: center; padding: 40px; color: #9a8a6a;">No quests added yet. Click "Add New Quest" to get started!</div>';
        return;
    }
    
    // Sort quests by name
    const sortedQuests = [...quests].sort((a, b) => a.name.localeCompare(b.name));
    
    listEl.innerHTML = sortedQuests.map((quest, index) => `
        <div class="quest-item">
            <div class="quest-info">
                <div class="quest-name">
                    ${quest.name}
                    <span class="difficulty-badge difficulty-${quest.difficulty}">${quest.difficulty}</span>
                </div>
                <div class="quest-meta">
                    QP: ${quest.questPoints} | Length: ${quest.length} | Series: ${quest.series || 'None'}
                </div>
            </div>
            <div class="quest-actions">
                <button class="btn btn-primary btn-small" onclick="editQuest(${quest.id})">✏️ Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteQuest(${quest.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    const totalQuests = quests.length;
    const totalQP = quests.reduce((sum, q) => sum + (parseInt(q.questPoints) || 0), 0);
    
    const totalQuestsEl = document.getElementById('totalQuests');
    const totalQPEl = document.getElementById('totalQP');
    const lastModifiedEl = document.getElementById('lastModified');
    
    if (totalQuestsEl) totalQuestsEl.textContent = totalQuests;
    if (totalQPEl) totalQPEl.textContent = totalQP;
    
    if (lastModifiedEl) {
        const data = localStorage.getItem('rs3_quest_editor_data');
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed.lastModified) {
                const date = new Date(parsed.lastModified);
                lastModifiedEl.textContent = date.toLocaleDateString();
            }
        }
    }
}

// Show add quest form
function showAddForm() {
    editingIndex = -1;
    document.getElementById('questForm').style.display = 'block';
    document.querySelector('#questForm h2').textContent = 'Add New Quest';
    clearForm();
    window.scrollTo(0, document.getElementById('questForm').offsetTop - 20);
}

// Clear form
function clearForm() {
    document.getElementById('questName').value = '';
    document.getElementById('questDifficulty').value = 'novice';
    document.getElementById('questPoints').value = '1';
    document.getElementById('questLength').value = 'Short';
    document.getElementById('questDescription').value = '';
    document.getElementById('questRequirements').value = '';
    document.getElementById('questSkillReqs').value = '';
    document.getElementById('questRewards').value = '';
    document.getElementById('questSeries').value = '';
}

// Cancel editing
function cancelEdit() {
    document.getElementById('questForm').style.display = 'none';
    editingIndex = -1;
    clearForm();
}

// Save quest
function saveQuest() {
    const name = document.getElementById('questName').value.trim();
    const difficulty = document.getElementById('questDifficulty').value;
    const questPoints = parseInt(document.getElementById('questPoints').value) || 1;
    const length = document.getElementById('questLength').value;
    const description = document.getElementById('questDescription').value.trim();
    const series = document.getElementById('questSeries').value.trim() || 'None';
    
    if (!name) {
        alert('Please enter a quest name!');
        return;
    }
    
    // Parse requirements
    const reqText = document.getElementById('questRequirements').value.trim();
    const questReqs = reqText ? reqText.split(',').map(q => q.trim()).filter(q => q) : [];
    
    // Parse skill requirements
    const skillReqText = document.getElementById('questSkillReqs').value.trim();
    const skillReqs = {};
    if (skillReqText) {
        skillReqText.split(',').forEach(req => {
            const parts = req.split(':');
            if (parts.length === 2) {
                const skill = parts[0].trim();
                const level = parseInt(parts[1].trim());
                if (skill && !isNaN(level)) {
                    skillReqs[skill] = level;
                }
            }
        });
    }
    
    // Parse rewards
    const rewardsText = document.getElementById('questRewards').value.trim();
    const rewards = rewardsText ? rewardsText.split(',').map(r => r.trim()).filter(r => r) : [];
    
    const quest = {
        id: editingIndex >= 0 ? quests[editingIndex].id : nextId++,
        name,
        difficulty,
        questPoints,
        requirements: {
            skills: skillReqs,
            quests: questReqs
        },
        length,
        description: description || `Complete the ${name} quest.`,
        rewards,
        series
    };
    
    if (editingIndex >= 0) {
        quests[editingIndex] = quest;
    } else {
        quests.push(quest);
    }
    
    saveQuests();
    renderQuestList();
    cancelEdit();
    
    alert(`Quest "${name}" saved successfully!`);
}

// Edit quest
function editQuest(id) {
    const index = quests.findIndex(q => q.id === id);
    if (index === -1) return;
    
    const quest = quests[index];
    editingIndex = index;
    
    document.getElementById('questName').value = quest.name;
    document.getElementById('questDifficulty').value = quest.difficulty;
    document.getElementById('questPoints').value = quest.questPoints;
    document.getElementById('questLength').value = quest.length;
    document.getElementById('questDescription').value = quest.description;
    document.getElementById('questSeries').value = quest.series === 'None' ? '' : quest.series;
    
    // Set requirements
    if (quest.requirements.quests && quest.requirements.quests.length > 0) {
        document.getElementById('questRequirements').value = quest.requirements.quests.join(', ');
    }
    
    // Set skill requirements
    if (quest.requirements.skills && Object.keys(quest.requirements.skills).length > 0) {
        const skillReqs = Object.entries(quest.requirements.skills)
            .map(([skill, level]) => `${skill}:${level}`)
            .join(', ');
        document.getElementById('questSkillReqs').value = skillReqs;
    }
    
    // Set rewards
    if (quest.rewards && quest.rewards.length > 0) {
        document.getElementById('questRewards').value = quest.rewards.join(', ');
    }
    
    document.querySelector('#questForm h2').textContent = `Edit Quest: ${quest.name}`;
    document.getElementById('questForm').style.display = 'block';
    window.scrollTo(0, document.getElementById('questForm').offsetTop - 20);
}

// Delete quest
function deleteQuest(id) {
    const quest = quests.find(q => q.id === id);
    if (!quest) return;
    
    if (!confirm(`Are you sure you want to delete "${quest.name}"?`)) {
        return;
    }
    
    quests = quests.filter(q => q.id !== id);
    saveQuests();
    renderQuestList();
}

// Export to file
function exportToFile() {
    const jsCode = generateQuestsJS();
    document.getElementById('exportText').value = jsCode;
    document.getElementById('exportBox').style.display = 'block';
    window.scrollTo(0, document.getElementById('exportBox').offsetTop - 20);
}

// Generate quests.js file content
function generateQuestsJS() {
    const questsJSON = JSON.stringify(quests, null, 4);
    
    return `// RS3 Quest Database - Generated by Quest Editor
// Last updated: ${new Date().toISOString()}
// Total quests: ${quests.length}
// Total quest points: ${quests.reduce((sum, q) => sum + q.questPoints, 0)}

const QUESTS = ${questsJSON};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QUESTS;
}
`;
}

// Close export box
function closeExport() {
    document.getElementById('exportBox').style.display = 'none';
}

// Copy to clipboard
function copyToClipboard() {
    const textarea = document.getElementById('exportText');
    textarea.select();
    document.execCommand('copy');
    alert('Copied to clipboard! Now paste this into a file called quests.js');
}

// Download file
function downloadFile() {
    const content = document.getElementById('exportText').value;
    const blob = new Blob([content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quests.js';
    a.click();
    
    URL.revokeObjectURL(url);
    alert('Downloaded! Upload this file to your GitHub repository in the js/ folder.');
}

// Import from file
function importFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (Array.isArray(data)) {
                    quests = data;
                } else if (data.quests && Array.isArray(data.quests)) {
                    quests = data.quests;
                } else {
                    throw new Error('Invalid format');
                }
                
                // Update IDs
                nextId = Math.max(...quests.map(q => q.id || 0)) + 1;
                
                saveQuests();
                renderQuestList();
                alert(`Imported ${quests.length} quests successfully!`);
            } catch (error) {
                alert('Error importing: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Load all quests from Wiki
async function loadFromWiki() {
    if (!confirm('This will attempt to load ALL RS3 quests from the RuneScape Wiki. This may take a while. Continue?')) {
        return;
    }
    
    alert('Wiki import feature coming soon! For now, please add quests manually or import from a JSON file.');
    
    // TODO: Implement Wiki API scraping
    // Would use: https://runescape.wiki/api.php
}

// Clear all quests
function clearAll() {
    if (!confirm('Are you sure you want to DELETE ALL QUESTS? This cannot be undone!')) {
        return;
    }
    
    if (!confirm('Really? ALL quests will be deleted!')) {
        return;
    }
    
    quests = [];
    nextId = 1;
    saveQuests();
    renderQuestList();
    alert('All quests deleted.');
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    console.log('Quest Editor initialized');
    loadQuests();
});
