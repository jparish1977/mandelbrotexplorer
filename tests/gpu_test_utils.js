// GPU Test Utilities
// Contains rendering and helper functions for GPU performance testing

// Function to render Mandelbrot output to canvas
function renderMandelbrotToCanvas(canvas, points, maxIterations, centerX, centerY, areaSize, method) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    
    // Create image data for pixel manipulation
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    // Calculate grid size (assuming square grid)
    const gridSize = Math.sqrt(points.length);
    if (gridSize * gridSize !== points.length) {
        console.error('Points array is not a perfect square grid');
        return;
    }
    
    // Create a simple palette for visualization
    const palette = [];
    for (let i = 0; i < 256; i++) {
        const hue = (i * 137.5) % 360; // Golden angle for good color distribution
        const saturation = 80;
        const lightness = i < 255 ? 50 : 0; // Black for points that don't escape
        palette.push(hue, saturation, lightness);
    }
    
    // Render each point
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const pointIndex = y * gridSize + x;
            const point = points[pointIndex];
            
            if (!point || !point.length) continue;
            
            // Calculate iterations from escape path length
            const iterations = point.length - 1; // -1 because first point is the starting point
            
            // Map grid coordinates to canvas coordinates
            const canvasX = Math.floor((x / (gridSize - 1)) * width);
            const canvasY = Math.floor((y / (gridSize - 1)) * height);
            
            if (canvasX >= 0 && canvasX < width && canvasY >= 0 && canvasY < height) {
                const pixelIndex = (canvasY * width + canvasX) * 4;
                
                if (iterations < maxIterations) {
                    // Point escaped - color based on iterations
                    const colorIndex = iterations % 256;
                    const hue = palette[colorIndex * 3];
                    const sat = palette[colorIndex * 3 + 1];
                    const light = palette[colorIndex * 3 + 2];
                    
                    // Convert HSL to RGB (simplified)
                    const rgb = hslToRgb(hue / 360, sat / 100, light / 100);
                    data[pixelIndex] = rgb[0];     // R
                    data[pixelIndex + 1] = rgb[1]; // G
                    data[pixelIndex + 2] = rgb[2]; // B
                    data[pixelIndex + 3] = 255;    // A
                } else {
                    // Point didn't escape - black
                    data[pixelIndex] = 0;     // R
                    data[pixelIndex + 1] = 0; // G
                    data[pixelIndex + 2] = 0; // B
                    data[pixelIndex + 3] = 255; // A
                }
            }
        }
    }
    
    // Put the image data back to canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Add method label
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(method, 5, 15);
}

// Helper function to convert HSL to RGB
function hslToRgb(h, s, l) {
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Generate test points for performance testing
function generateTestPoints(gridSize, sampleAreaSize, sampleCenterX, sampleCenterY) {
    const points = [];
    const halfSize = sampleAreaSize / 2;
    
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const xCoord = sampleCenterX - halfSize + (x / (gridSize - 1)) * sampleAreaSize;
            const yCoord = sampleCenterY - halfSize + (y / (gridSize - 1)) * sampleAreaSize;
            points.push([xCoord, yCoord]);
        }
    }
    
    return points;
}

// Clear and initialize canvases
function initializeCanvases() {
    const canvases = ['cpu-canvas', 'gpu-canvas'];
    
    canvases.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            // Clear canvas
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add processing label
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText('Processing...', 5, 15);
        }
    });
}

// Show error on canvas
function showCanvasError(canvasId, errorMessage) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(errorMessage, 5, 15);
} 