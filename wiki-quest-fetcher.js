// RS3 Quest Wiki Fetcher - Fetch ALL quests from RuneScape Wiki
// This script helps populate your quest database from the wiki

console.log('RS3 Quest Wiki Fetcher initialized');

/**
 * Fetch all quests from RuneScape Wiki API
 * Uses the MediaWiki API to get quest data
 */
async function fetchAllQuestsFromWiki() {
    console.log('🌐 Fetching all quests from RuneScape Wiki...');
    
    try {
        // Use RuneScape Wiki API to get all quests
        const apiUrl = 'https://runescape.wiki/api.php';
        
        // Get all pages in Category:Quests
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            list: 'categorymembers',
            cmtitle: 'Category:Quests',
            cmlimit: '500',
            origin: '*'
        });
        
        const response = await fetch(`${apiUrl}?${params}`);
        const data = await response.json();
        
        if (data.query && data.query.categorymembers) {
            const quests = data.query.categorymembers;
            console.log(`✅ Found ${quests.length} quests`);
            
            // Filter out non-quest pages
            const filteredQuests = quests.filter(q => 
                !q.title.includes('Category:') &&
                !q.title.includes('Template:') &&
                !q.title.includes('Quick guide')
            );
            
            console.log(`📋 Filtered to ${filteredQuests.length} actual quests`);
            
            return filteredQuests.map((quest, index) => ({
                id: index + 1,
                name: quest.title,
                wikiTitle: quest.title,
                pageid: quest.pageid
            }));
        }
        
        throw new Error('No quest data found');
        
    } catch (error) {
        console.error('❌ Error fetching quests:', error);
        throw error;
    }
}

/**
 * Fetch detailed quest information from wiki page
 */
async function fetchQuestDetails(questName) {
    console.log(`📖 Fetching details for: ${questName}`);
    
    try {
        const apiUrl = 'https://runescape.wiki/api.php';
        
        // Parse the quest infobox
        const params = new URLSearchParams({
            action: 'parse',
            format: 'json',
            page: questName,
            prop: 'text',
            origin: '*'
        });
        
        const response = await fetch(`${apiUrl}?${params}`);
        const data = await response.json();
        
        if (data.parse && data.parse.text) {
            const html = data.parse.text['*'];
            return parseQuestInfobox(html, questName);
        }
        
        throw new Error('Could not parse quest page');
        
    } catch (error) {
        console.error(`❌ Error fetching ${questName}:`, error);
        return null;
    }
}

/**
 * Parse quest infobox from HTML
 */
function parseQuestInfobox(html, questName) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Try to find quest infobox
    const infobox = doc.querySelector('.infobox-quest, .infobox');
    
    if (!infobox) {
        console.warn(`⚠️ No infobox found for ${questName}`);
        return null;
    }
    
    // Extract quest data
    const quest = {
        name: questName,
        difficulty: 'Intermediate',
        questPoints: 1,
        length: 'Medium',
        description: '',
        requirements: {
            skills: {},
            quests: []
        },
        rewards: [],
        series: 'None',
        location: ''
    };
    
    // Parse infobox rows
    const rows = infobox.querySelectorAll('tr');
    rows.forEach(row => {
        const header = row.querySelector('th');
        const data = row.querySelector('td');
        
        if (!header || !data) return;
        
        const headerText = header.textContent.trim().toLowerCase();
        const dataText = data.textContent.trim();
        
        // Match fields
        if (headerText.includes('difficulty')) {
            quest.difficulty = dataText.toLowerCase();
        } else if (headerText.includes('quest points') || headerText.includes('qp')) {
            quest.questPoints = parseInt(dataText) || 1;
        } else if (headerText.includes('length')) {
            quest.length = dataText;
        } else if (headerText.includes('description')) {
            quest.description = dataText;
        } else if (headerText.includes('start point') || headerText.includes('location')) {
            quest.location = dataText;
        } else if (headerText.includes('series')) {
            quest.series = dataText || 'None';
        }
    });
    
    return quest;
}

/**
 * Generate quests.js file content from fetched data
 */
function generateQuestsFile(quests) {
    const questsJSON = JSON.stringify(quests, null, 4);
    
    return `// RS3 Quest Database - Auto-generated from RuneScape Wiki
// Generated: ${new Date().toISOString()}
// Total quests: ${quests.length}
// Source: https://runescape.wiki

const QUESTS = ${questsJSON};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QUESTS;
}
`;
}

/**
 * Main function - Fetch all quests with details
 */
async function fetchAllQuestsDetailed() {
    console.log('🚀 Starting full quest database fetch...');
    console.log('⚠️ This may take several minutes...');
    
    try {
        // Step 1: Get all quest names
        const questList = await fetchAllQuestsFromWiki();
        console.log(`\n📋 Found ${questList.length} quests to process\n`);
        
        // Step 2: Fetch details for each quest (with delay to avoid rate limiting)
        const detailedQuests = [];
        
        for (let i = 0; i < questList.length; i++) {
            const quest = questList[i];
            console.log(`[${i+1}/${questList.length}] Processing: ${quest.name}`);
            
            const details = await fetchQuestDetails(quest.name);
            
            if (details) {
                detailedQuests.push({
                    id: i + 1,
                    ...details
                });
            } else {
                // Use basic data if details fetch failed
                detailedQuests.push({
                    id: i + 1,
                    name: quest.name,
                    difficulty: 'Intermediate',
                    questPoints: 1,
                    requirements: { skills: {}, quests: [] },
                    length: 'Medium',
                    description: `Complete the ${quest.name} quest.`,
                    rewards: [],
                    series: 'None',
                    location: 'Unknown'
                });
            }
            
            // Delay to avoid rate limiting (1 second between requests)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`\n✅ Successfully fetched ${detailedQuests.length} quests!`);
        
        return detailedQuests;
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        throw error;
    }
}

/**
 * Export quests to file
 */
async function exportQuestsToFile() {
    try {
        const quests = await fetchAllQuestsDetailed();
        const fileContent = generateQuestsFile(quests);
        
        // Create download
        const blob = new Blob([fileContent], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quests_from_wiki.js';
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('\n✅ Quest database exported!');
        console.log('📁 File: quests_from_wiki.js');
        console.log(`📊 Total quests: ${quests.length}`);
        
    } catch (error) {
        console.error('❌ Export failed:', error);
    }
}

/**
 * Quick test - Fetch just a few quests
 */
async function testFetch() {
    console.log('🧪 Testing wiki fetch...');
    
    const testQuests = [
        "Cook's Assistant",
        "Demon Slayer",
        "Dragon Slayer"
    ];
    
    for (const questName of testQuests) {
        const details = await fetchQuestDetails(questName);
        console.log('\n📋 Quest:', questName);
        console.log(details);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✅ Test complete!');
}

// Export functions
window.WikiQuestFetcher = {
    fetchAll: fetchAllQuestsFromWiki,
    fetchDetails: fetchQuestDetails,
    fetchAllDetailed: fetchAllQuestsDetailed,
    export: exportQuestsToFile,
    test: testFetch
};

console.log('✅ Wiki Quest Fetcher loaded');
console.log('📖 Usage:');
console.log('  WikiQuestFetcher.test()           - Test with 3 quests');
console.log('  WikiQuestFetcher.fetchAll()       - Get all quest names');
console.log('  WikiQuestFetcher.export()         - Fetch all & export to file');
console.log('');
console.log('⚠️ Warning: Fetching all quests takes ~5-10 minutes');
console.log('⚠️ Be patient and don\'t refresh the page!');
