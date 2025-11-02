// RS3 Ultimate Helper - Advanced Pathfinding System

// Pathfinding State
const PathfindingState = {
    currentPath: [],
    destination: null,
    isNavigating: false,
    teleportDatabase: [],
    obstacleMap: new Set()
};

// Teleport Database - All major teleportation methods in RS3
const TELEPORTS = [
    // Lodestones (Free, requires activation)
    { id: 'lode_lumbridge', name: 'Lumbridge Lodestone', x: 3233, y: 3221, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_varrock', name: 'Varrock Lodestone', x: 3214, y: 3376, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_falador', name: 'Falador Lodestone', x: 2967, y: 3403, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_edgeville', name: 'Edgeville Lodestone', x: 3067, y: 3505, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_draynor', name: 'Draynor Village Lodestone', x: 3105, y: 3298, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_alkharid', name: 'Al Kharid Lodestone', x: 3297, y: 3185, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_portSarim', name: 'Port Sarim Lodestone', x: 3011, y: 3215, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_burthorpe', name: 'Burthorpe Lodestone', x: 2899, y: 3544, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_taverley', name: 'Taverley Lodestone', x: 2878, y: 3442, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_ardougne', name: 'Ardougne Lodestone', x: 2634, y: 3348, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_catherby', name: 'Catherby Lodestone', x: 2831, y: 3451, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_seers', name: "Seers' Village Lodestone", x: 2689, y: 3482, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_yanille', name: 'Yanille Lodestone', x: 2529, y: 3094, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_canifis', name: 'Canifis Lodestone', x: 3493, y: 3471, plane: 0, cost: 0, requirements: {}, type: 'lodestone' },
    { id: 'lode_prifddinas', name: 'Prifddinas Lodestone', x: 2207, y: 3354, plane: 1, cost: 0, requirements: { quests: ['plagues_end'] }, type: 'lodestone' },
    
    // Standard Spells
    { id: 'tele_lumbridge', name: 'Lumbridge Teleport', x: 3222, y: 3218, plane: 0, cost: 1, requirements: { magic: 31 }, type: 'spell' },
    { id: 'tele_varrock', name: 'Varrock Teleport', x: 3212, y: 3424, plane: 0, cost: 1, requirements: { magic: 25 }, type: 'spell' },
    { id: 'tele_falador', name: 'Falador Teleport', x: 2964, y: 3379, plane: 0, cost: 1, requirements: { magic: 37 }, type: 'spell' },
    { id: 'tele_camelot', name: 'Camelot Teleport', x: 2757, y: 3477, plane: 0, cost: 5, requirements: { magic: 45 }, type: 'spell' },
    { id: 'tele_ardougne', name: 'Ardougne Teleport', x: 2661, y: 3305, plane: 0, cost: 2, requirements: { magic: 51, quests: ['plague_city'] }, type: 'spell' },
    
    // Items
    { id: 'home_tele', name: 'Home Teleport', x: 3222, y: 3218, plane: 0, cost: 0, requirements: {}, cooldown: 30, type: 'item' },
    
    // Spirit Trees (requires completion of Tree Gnome Village)
    { id: 'spirit_gnome_stronghold', name: 'Spirit Tree (Gnome Stronghold)', x: 2461, y: 3444, plane: 0, cost: 0, requirements: { quests: ['tree_gnome_village'] }, type: 'spirit_tree' },
    { id: 'spirit_tree_gnome_village', name: 'Spirit Tree (Tree Gnome Village)', x: 2542, y: 3169, plane: 0, cost: 0, requirements: { quests: ['tree_gnome_village'] }, type: 'spirit_tree' },
    
    // Fairy Rings (requires starting Fairy Tale II)
    { id: 'fairy_zanaris', name: 'Fairy Ring (Zanaris)', x: 2412, y: 4434, plane: 0, cost: 0, requirements: { quests: ['fairy_tale_ii'] }, type: 'fairy_ring' }
];

// Initialize Pathfinding
function initializePathfinding() {
    console.log('Initializing pathfinding system...');
    PathfindingState.teleportDatabase = TELEPORTS;
    console.log(`Loaded ${TELEPORTS.length} teleport locations`);
}

// Main Navigation Function
function startNavigation(destination, objectiveName = 'Destination') {
    console.log(`Starting navigation to ${objectiveName} at (${destination.x}, ${destination.y}, ${destination.plane})`);
    
    PathfindingState.destination = destination;
    PathfindingState.isNavigating = true;
    
    // Calculate best route
    const route = calculateOptimalRoute(AppState.currentLocation, destination);
    
    if (route) {
        PathfindingState.currentPath = route;
        displayPath(route, objectiveName);
        updateArrowOverlay(route, objectiveName);
    } else {
        console.error('Could not find a route to destination');
    }
}

// Calculate Optimal Route using A* with Teleports
function calculateOptimalRoute(start, end) {
    if (!start || !end) {
        console.error('Invalid start or end location');
        return null;
    }
    
    console.log('Calculating optimal route...');
    
    // Find all possible routes
    const routes = [];
    
    // Route 1: Direct walking
    const walkingRoute = {
        method: 'Walking',
        steps: [
            { type: 'walk', from: start, to: end, distance: calculateDistance(start, end) }
        ],
        totalTime: calculateWalkTime(start, end),
        totalCost: 0
    };
    routes.push(walkingRoute);
    
    // Route 2-N: Teleport + Walking
    const availableTeleports = getAvailableTeleports();
    
    availableTeleports.forEach(teleport => {
        const teleportToEnd = calculateDistance(teleport, end);
        const startToTeleport = calculateDistance(start, { x: teleport.x, y: teleport.y, plane: teleport.plane });
        
        // Only consider if teleport saves time
        if (teleportToEnd < calculateDistance(start, end) * 0.7) {
            const route = {
                method: `${teleport.name} + Walk`,
                steps: [
                    { type: 'teleport', to: teleport, cost: teleport.cost, name: teleport.name },
                    { type: 'walk', from: teleport, to: end, distance: teleportToEnd }
                ],
                totalTime: 3 + calculateWalkTime(teleport, end), // 3 seconds for teleport animation
                totalCost: teleport.cost
            };
            routes.push(route);
        }
    });
    
    // Sort routes by time (or cost if preferCheap is enabled)
    routes.sort((a, b) => {
        if (AppState.settings.preferCheap) {
            return a.totalCost - b.totalCost || a.totalTime - b.totalTime;
        } else {
            return a.totalTime - b.totalTime;
        }
    });
    
    console.log(`Found ${routes.length} possible routes, best route: ${routes[0].method}`);
    
    return routes[0];
}

// Get Available Teleports (based on player requirements)
function getAvailableTeleports() {
    return PathfindingState.teleportDatabase.filter(teleport => {
        // Check magic level
        if (teleport.requirements.magic) {
            const playerMagic = AppState.userStats.magic || 1;
            if (playerMagic < teleport.requirements.magic) return false;
        }
        
        // Check quest requirements
        if (teleport.requirements.quests) {
            for (const questId of teleport.requirements.quests) {
                if (!AppState.questsCompleted.includes(questId)) return false;
            }
        }
        
        return true;
    });
}

// Calculate Distance between two points (Euclidean distance)
function calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = (point2.plane - point1.plane) * 10; // Plane differences are significant
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Calculate Walking Time (roughly 1 tile per second)
function calculateWalkTime(from, to) {
    const distance = calculateDistance(from, to);
    return Math.ceil(distance / 2); // Assuming 2 tiles per second with running
}

// Display Path in UI
function displayPath(route, objectiveName) {
    const container = document.getElementById('path-steps');
    if (!container) return;
    
    let html = `<h4 style="color: #ffd700;">Route to ${objectiveName}</h4>`;
    html += `<p style="color: #4CAF50;">Method: ${route.method}</p>`;
    html += `<p style="color: #b0b0b0;">Estimated time: ~${route.totalTime} seconds</p>`;
    
    if (route.totalCost > 0) {
        html += `<p style="color: #e94560;">Cost: ${route.totalCost} runes/items</p>`;
    } else {
        html += `<p style="color: #4CAF50;">Cost: Free!</p>`;
    }
    
    html += '<ol style="padding-left: 20px; margin-top: 15px;">';
    
    route.steps.forEach((step, index) => {
        if (step.type === 'teleport') {
            html += `<li style="margin-bottom: 8px; color: #ffd700;">
                ✨ Use ${step.name}
            </li>`;
        } else if (step.type === 'walk') {
            const tiles = Math.ceil(step.distance);
            html += `<li style="margin-bottom: 8px; color: #e0e0e0;">
                🚶 Walk ${tiles} tiles (${Math.ceil(calculateWalkTime(step.from, step.to))}s)
            </li>`;
        }
    });
    
    html += '</ol>';
    
    // Add alternative routes
    html += '<button onclick="showAlternativeRoutes()" style="margin-top: 10px; padding: 8px 15px; background: rgba(15, 52, 96, 0.8); border: 2px solid #e94560; border-radius: 6px; color: #ffd700; cursor: pointer;">Show Alternative Routes</button>';
    
    container.innerHTML = html;
}

// Update Arrow Overlay
function updateArrowOverlay(route, objectiveName) {
    const overlay = document.getElementById('arrow-overlay');
    const arrow = document.getElementById('direction-arrow');
    const distanceText = document.getElementById('distance-text');
    const objectiveText = document.getElementById('objective-text');
    
    if (!overlay || !AppState.settings.showArrows) return;
    
    // Show overlay
    overlay.classList.remove('hidden');
    
    // Update objective name
    objectiveText.textContent = objectiveName;
    
    // Calculate direction and distance
    function updatePosition() {
        if (!PathfindingState.isNavigating || !PathfindingState.destination) {
            overlay.classList.add('hidden');
            return;
        }
        
        const current = AppState.currentLocation;
        const dest = PathfindingState.destination;
        
        if (!current) return;
        
        // Calculate angle
        const dx = dest.x - current.x;
        const dy = dest.y - current.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        // Rotate arrow
        arrow.style.transform = `rotate(${angle}deg)`;
        
        // Update distance
        if (AppState.settings.showDistance) {
            const distance = Math.ceil(calculateDistance(current, dest));
            distanceText.textContent = `${distance} tiles away`;
            distanceText.classList.remove('hidden');
        } else {
            distanceText.classList.add('hidden');
        }
        
        // Check if arrived
        if (calculateDistance(current, dest) < 3) {
            onArrivalAtDestination();
        }
    }
    
    // Update every 2 seconds
    updatePosition();
    const intervalId = setInterval(updatePosition, 2000);
    
    // Store interval ID for cleanup
    overlay.dataset.intervalId = intervalId;
}

// Show Arrow Overlay
function showArrowOverlay() {
    const overlay = document.getElementById('arrow-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

// Hide Arrow Overlay
function hideArrowOverlay() {
    const overlay = document.getElementById('arrow-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        
        // Clear interval
        const intervalId = overlay.dataset.intervalId;
        if (intervalId) {
            clearInterval(parseInt(intervalId));
        }
    }
}

// On Arrival at Destination
function onArrivalAtDestination() {
    console.log('Arrived at destination!');
    
    // Show notification
    showNotification('✓ Arrived at destination!', 'success');
    
    // Hide arrow
    hideArrowOverlay();
    
    // Stop navigation
    PathfindingState.isNavigating = false;
    
    // If in a quest, advance to next step
    if (AppState.activeQuest) {
        advanceQuestStep();
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#e94560'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Advance Quest Step
function advanceQuestStep() {
    // This would move to the next step of the active quest
    console.log('Advancing to next quest step...');
}

// Alternative Routes
window.showAlternativeRoutes = function() {
    alert('Alternative routes viewer coming soon!');
};

// Stop Navigation
function stopNavigation() {
    PathfindingState.isNavigating = false;
    PathfindingState.currentPath = [];
    hideArrowOverlay();
}

// Initialize on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializePathfinding);
}
