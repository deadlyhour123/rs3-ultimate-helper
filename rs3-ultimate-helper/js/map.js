// RS3 Ultimate Helper - Map System

let mapCanvas, mapContext;
let mapZoom = 1;
let mapOffsetX = 0;
let mapOffsetY = 0;

// Initialize Map
function initializeMap() {
    mapCanvas = document.getElementById('map-canvas');
    if (!mapCanvas) return;
    
    mapContext = mapCanvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Setup map controls
    setupMapControls();
    
    // Draw initial map
    drawMap();
    
    console.log('Map system initialized');
}

function resizeCanvas() {
    if (!mapCanvas) return;
    
    const container = mapCanvas.parentElement;
    mapCanvas.width = container.clientWidth;
    mapCanvas.height = container.clientHeight;
    
    drawMap();
}

// Setup Map Controls
function setupMapControls() {
    document.getElementById('center-player')?.addEventListener('click', centerOnPlayer);
    document.getElementById('show-teleports')?.addEventListener('click', toggleTeleports);
    document.getElementById('toggle-path')?.addEventListener('click', togglePathDisplay);
    
    // Mouse controls
    if (mapCanvas) {
        mapCanvas.addEventListener('wheel', handleZoom);
        mapCanvas.addEventListener('mousedown', handlePanStart);
        mapCanvas.addEventListener('mousemove', handlePan);
        mapCanvas.addEventListener('mouseup', handlePanEnd);
    }
}

// Draw Map
function drawMap() {
    if (!mapContext || !mapCanvas) return;
    
    const ctx = mapContext;
    const width = mapCanvas.width;
    const height = mapCanvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    drawGrid(ctx, width, height);
    
    // Draw teleport locations
    drawTeleports(ctx);
    
    // Draw current path
    if (PathfindingState.currentPath && PathfindingState.currentPath.steps) {
        drawPath(ctx, PathfindingState.currentPath);
    }
    
    // Draw player location
    if (AppState.currentLocation) {
        drawPlayer(ctx, AppState.currentLocation);
    }
    
    // Draw destination
    if (PathfindingState.destination) {
        drawDestination(ctx, PathfindingState.destination);
    }
}

// Draw Grid
function drawGrid(ctx, width, height) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    const gridSize = 50 * mapZoom;
    
    // Vertical lines
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

// World Coordinates to Canvas Coordinates
function worldToCanvas(worldX, worldY) {
    const centerX = mapCanvas.width / 2;
    const centerY = mapCanvas.height / 2;
    
    // Normalize world coordinates (RS world is huge, scale it down)
    const scale = 0.1 * mapZoom;
    
    const canvasX = centerX + (worldX - mapOffsetX) * scale;
    const canvasY = centerY - (worldY - mapOffsetY) * scale; // Y is inverted in canvas
    
    return { x: canvasX, y: canvasY };
}

// Draw Teleports
function drawTeleports(ctx) {
    const teleports = PathfindingState.teleportDatabase;
    
    teleports.forEach(teleport => {
        const pos = worldToCanvas(teleport.x, teleport.y);
        
        // Draw teleport marker
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw teleport icon
        ctx.font = '14px Arial';
        ctx.fillText('✨', pos.x - 7, pos.y - 8);
    });
}

// Draw Path
function drawPath(ctx, route) {
    if (!route || !route.steps) return;
    
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    
    route.steps.forEach((step, index) => {
        if (step.type === 'walk' && step.from && step.to) {
            const from = worldToCanvas(step.from.x, step.from.y);
            const to = worldToCanvas(step.to.x, step.to.y);
            
            if (index === 0) {
                ctx.moveTo(from.x, from.y);
            }
            ctx.lineTo(to.x, to.y);
        }
    });
    
    ctx.stroke();
    ctx.setLineDash([]);
}

// Draw Player
function drawPlayer(ctx, location) {
    const pos = worldToCanvas(location.x, location.y);
    
    // Draw player marker
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw player icon
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('👤', pos.x - 8, pos.y - 10);
    
    // Draw label
    ctx.font = '12px Arial';
    ctx.fillText('You', pos.x - 12, pos.y + 20);
}

// Draw Destination
function drawDestination(ctx, location) {
    const pos = worldToCanvas(location.x, location.y);
    
    // Draw pulsing circle
    const pulseSize = 15 + Math.sin(Date.now() / 500) * 5;
    
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, pulseSize, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw destination icon
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#e94560';
    ctx.fillText('🎯', pos.x - 10, pos.y + 8);
}

// Center on Player
function centerOnPlayer() {
    if (AppState.currentLocation) {
        mapOffsetX = AppState.currentLocation.x;
        mapOffsetY = AppState.currentLocation.y;
        drawMap();
    }
}

// Toggle Teleports
let showTeleports = true;
function toggleTeleports() {
    showTeleports = !showTeleports;
    drawMap();
}

// Toggle Path Display
let showPath = true;
function togglePathDisplay() {
    showPath = !showPath;
    drawMap();
}

// Zoom Handling
function handleZoom(e) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    mapZoom = Math.max(0.1, Math.min(5, mapZoom * delta));
    
    drawMap();
}

// Pan Handling
let isPanning = false;
let panStartX, panStartY;

function handlePanStart(e) {
    isPanning = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
}

function handlePan(e) {
    if (!isPanning) return;
    
    const dx = e.clientX - panStartX;
    const dy = e.clientY - panStartY;
    
    mapOffsetX -= dx / (0.1 * mapZoom);
    mapOffsetY += dy / (0.1 * mapZoom);
    
    panStartX = e.clientX;
    panStartY = e.clientY;
    
    drawMap();
}

function handlePanEnd() {
    isPanning = false;
}

// Update Map Tab
function updateMap() {
    drawMap();
    
    // If navigating, center on path
    if (PathfindingState.isNavigating && PathfindingState.destination) {
        // Center between player and destination
        if (AppState.currentLocation) {
            const avgX = (AppState.currentLocation.x + PathfindingState.destination.x) / 2;
            const avgY = (AppState.currentLocation.y + PathfindingState.destination.y) / 2;
            mapOffsetX = avgX;
            mapOffsetY = avgY;
        }
    }
    
    drawMap();
}

// Animate Map (for pulsing effects)
function animateMap() {
    if (document.getElementById('map-tab')?.classList.contains('active')) {
        drawMap();
    }
    requestAnimationFrame(animateMap);
}

// Start animation loop
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeMap, 100);
        animateMap();
    });
}

// Task List Functions
function updateTaskList() {
    const container = document.getElementById('task-list');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align: center; color: #b0b0b0;">Task system coming soon! This will include all achievement diaries, daily tasks, and weekly activities.</p>';
}

// Comp Requirements Functions
function updateCompRequirements() {
    const container = document.getElementById('comp-requirements');
    if (!container) return;
    
    const requirements = [
        { name: 'Complete all quests', completed: false, progress: `${AppState.questsCompleted.length}/268` },
        { name: 'Achieve level 99 in all skills', completed: false, progress: '0/27' },
        { name: 'Unlock all music tracks', completed: false, progress: '0/1400+' },
        { name: 'Complete all achievement diaries', completed: false, progress: '0/45' },
        { name: 'Defeat each God Wars Dungeon boss', completed: false, progress: '0/12' },
    ];
    
    let html = '';
    requirements.forEach(req => {
        html += `
            <div class="task-item ${req.completed ? 'completed' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${req.completed ? '✓' : '○'} ${req.name}</span>
                    <span style="color: #b0b0b0;">${req.progress}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}
