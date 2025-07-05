// GPU Test UI
// Contains UI event handlers and display logic

// Check GPU availability
function checkGPU() {
    const statusDiv = document.getElementById('gpu-status');
    const gpuInfo = window.checkGPUAvailability();
    
    if (gpuInfo.available) {
        statusDiv.innerHTML = `
            <div class="success">
                <strong>✅ GPU Available</strong><br>
                Renderer: ${gpuInfo.renderer}<br>
                Version: ${gpuInfo.version}<br>
                Vendor: ${gpuInfo.vendor}
            </div>
        `;
    } else {
        statusDiv.innerHTML = `
            <div class="error">
                <strong>❌ GPU Not Available</strong><br>
                Reason: ${gpuInfo.reason}
            </div>
        `;
    }
}

// Test GPU shader compilation and execution
async function testGPUShader() {
    const resultsDiv = document.getElementById('shader-results');
    resultsDiv.innerHTML = '<p>Testing GPU shader...</p>';
    
    // Check if required functions exist
    if (!mandelbrotExplorer || typeof mandelbrotExplorer.initGPU !== 'function') {
        resultsDiv.innerHTML = `
            <div class="error">
                <strong>❌ Required functions not available</strong><br>
                Please make sure all scripts are loaded properly.
            </div>
        `;
        return;
    }
    
    try {
        // Initialize GPU
        mandelbrotExplorer.useGPU = true;
        mandelbrotExplorer.initGPU();
        
        // Wait for shader loading to complete (shaders are loaded asynchronously)
        let attempts = 0;
        const maxAttempts = 50; // Wait up to 5 seconds
        
        while (attempts < maxAttempts) {
            if (mandelbrotExplorer.gpuContext && mandelbrotExplorer.gpuProgram && mandelbrotExplorer.gpuUniforms) {
                resultsDiv.innerHTML = `
                    <div class="success">
                        <strong>✅ GPU Shader Test Passed</strong><br>
                        WebGL Context: ${mandelbrotExplorer.gpuContext.getParameter(mandelbrotExplorer.gpuContext.VERSION)}<br>
                        Shader Program: Compiled and linked successfully<br>
                        GPU Uniforms: Initialized
                    </div>
                `;
                return;
            }
            
            // Wait 100ms before checking again
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        // If we get here, the shaders didn't load in time
        resultsDiv.innerHTML = `
            <div class="error">
                <strong>❌ GPU Shader Test Failed</strong><br>
                Could not initialize GPU context or compile shaders within 5 seconds<br>
                GPU Context: ${mandelbrotExplorer.gpuContext ? 'Available' : 'Not available'}<br>
                GPU Program: ${mandelbrotExplorer.gpuProgram ? 'Compiled' : 'Not compiled'}<br>
                GPU Uniforms: ${mandelbrotExplorer.gpuUniforms ? 'Initialized' : 'Not initialized'}
            </div>
        `;
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="error">
                <strong>❌ GPU Shader Test Error</strong><br>
                Error: ${error.message}
            </div>
        `;
    }
}

// Run performance test (wrapper for the test runner)
function runPerformanceTest() {
    if (gpuTestRunner) {
        gpuTestRunner.runPerformanceTest();
    } else {
        console.error('GPU Test Runner not available');
        document.getElementById('performance-results').innerHTML = `
            <div class="error">
                <strong>❌ Test Runner Not Available</strong><br>
                Please make sure all scripts are loaded properly.
            </div>
        `;
    }
}

// Initialize the page when loaded
function initializePage() {
    // Wait for all scripts to load and initialize
    setTimeout(function() {
        if (typeof window.checkGPUAvailability === 'function') {
            checkGPU();
        } else {
            document.getElementById('gpu-status').innerHTML = `
                <div class="error">
                    <strong>❌ Scripts not loaded</strong><br>
                    Please refresh the page or check console for errors.
                </div>
            `;
        }
    }, 500);
}

// Auto-initialize on page load
window.addEventListener('load', initializePage); 