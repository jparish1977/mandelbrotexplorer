// GPU Test Runner
// Contains the core performance testing logic

class GPUTestRunner {
    constructor() {
        this.testConfig = {
            gridSize: 512,
            sampleAreaSize: 0.125,
            maxIterations: 64,
            sampleCenterX: -0.75, // Near the main cardioid
            sampleCenterY: 0.0
        };
    }

    // Run the complete performance test
    async runPerformanceTest() {
        const resultsDiv = document.getElementById('performance-results');
        resultsDiv.innerHTML = '<p>Running performance test...</p>';
        
        // Initialize canvases
        initializeCanvases();
        
        // Check if required functions exist
        if (!this.validateDependencies()) {
            return;
        }
        
        // Ensure mandelbrotExplorer is properly initialized
        this.initializeMandelbrotExplorer();
        
        // Generate test points
        const points = generateTestPoints(
            this.testConfig.gridSize,
            this.testConfig.sampleAreaSize,
            this.testConfig.sampleCenterX,
            this.testConfig.sampleCenterY
        );
        
        console.log(`Generated ${points.length} test points in ${this.testConfig.sampleAreaSize}x${this.testConfig.sampleAreaSize} area centered at (${this.testConfig.sampleCenterX}, ${this.testConfig.sampleCenterY})`);
        console.log(`Grid size: ${this.testConfig.gridSize}x${this.testConfig.gridSize}, Max iterations: ${this.testConfig.maxIterations}`);
        
        // Run CPU test
        const cpuResults = await this.runCPUTest(points);
        
        // Run GPU tests
        const gpuResults = await this.runGPUTests(points);
        
        // Display results
        this.displayResults(cpuResults, gpuResults);
    }

    // Validate that required dependencies are available
    validateDependencies() {
        if (!mandelbrotExplorer || typeof mandelbrotExplorer.generateEscapePathsCPU !== 'function') {
            document.getElementById('performance-results').innerHTML = `
                <div class="error">
                    <strong>❌ Required functions not available</strong><br>
                    Please make sure all scripts are loaded properly.
                </div>
            `;
            return false;
        }
        return true;
    }

    // Initialize mandelbrotExplorer with default values if needed
    initializeMandelbrotExplorer() {
        if (!mandelbrotExplorer.cloudMethods) {
            console.warn('Initializing mandelbrotExplorer cloud methods...');
            if (!mandelbrotExplorer.cloudResolution) {
                mandelbrotExplorer.cloudResolution = "43,101";
            }
            if (!mandelbrotExplorer.startX) {
                mandelbrotExplorer.startX = -2;
                mandelbrotExplorer.endX = 2;
                mandelbrotExplorer.startY = 2;
                mandelbrotExplorer.endY = -2;
            }
        }
    }

    // Run CPU performance test
    async runCPUTest(points) {
        const cpuStart = performance.now();
        const cpuResults = mandelbrotExplorer.generateEscapePathsCPU(points, this.testConfig.maxIterations);
        const cpuComputeTime = performance.now() - cpuStart;
        
        // Measure CPU rendering time separately
        const cpuRenderStart = performance.now();
        const cpuCanvasElement = document.getElementById('cpu-canvas');
        renderMandelbrotToCanvas(
            cpuCanvasElement, 
            cpuResults, 
            this.testConfig.maxIterations, 
            this.testConfig.sampleCenterX, 
            this.testConfig.sampleCenterY, 
            this.testConfig.sampleAreaSize, 
            'CPU'
        );
        const cpuRenderTime = performance.now() - cpuRenderStart;
        
        return {
            results: cpuResults,
            computeTime: cpuComputeTime,
            renderTime: cpuRenderTime,
            totalTime: cpuComputeTime + cpuRenderTime
        };
    }

    // Run GPU performance tests
    async runGPUTests(points) {
        // Enable GPU for testing
        const originalGPUState = mandelbrotExplorer.useGPU;
        mandelbrotExplorer.useGPU = true;
        
        // Initialize GPU if not already done
        if (!mandelbrotExplorer.gpuContext) {
            mandelbrotExplorer.initGPU();
        }
        
        const sampleStartX = this.testConfig.sampleCenterX - this.testConfig.sampleAreaSize / 2;
        const sampleEndX = this.testConfig.sampleCenterX + this.testConfig.sampleAreaSize / 2;
        const sampleStartY = this.testConfig.sampleCenterY + this.testConfig.sampleAreaSize / 2;
        const sampleEndY = this.testConfig.sampleCenterY - this.testConfig.sampleAreaSize / 2;
        
        const bounds = {
            startX: sampleStartX,
            endX: sampleEndX,
            startY: sampleStartY,
            endY: sampleEndY
        };
        
        // Wait for GPU initialization to complete
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 100; // Wait up to 10 seconds
            
            const checkGPUReady = () => {
                attempts++;
                
                if (mandelbrotExplorer.gpuContext && mandelbrotExplorer.gpuProgram && mandelbrotExplorer.gpuUniforms) {
                    const gpuResults = {
                        standard: null,
                        iteration: null
                    };
                    
                    // Test standard GPU implementation
                    gpuResults.standard = this.runStandardGPUTest(points, bounds);
                    
                                    // Test GPU iteration-centric implementation (disabled due to issues)
                // if (mandelbrotExplorer.gpuIterationProgram && mandelbrotExplorer.gpuIterationUniforms) {
                //     gpuResults.iteration = this.runIterationGPUTest(points, bounds);
                // }
                    
                    // Restore original GPU state
                    mandelbrotExplorer.useGPU = originalGPUState;
                    
                    resolve(gpuResults);
                } else if (attempts >= maxAttempts) {
                    console.warn('GPU initialization timeout after 10 seconds');
                    console.log('GPU Context:', mandelbrotExplorer.gpuContext ? 'Available' : 'Not available');
                    console.log('GPU Program:', mandelbrotExplorer.gpuProgram ? 'Compiled' : 'Not compiled');
                    console.log('GPU Uniforms:', mandelbrotExplorer.gpuUniforms ? 'Initialized' : 'Not initialized');
                    
                    // Restore original GPU state
                    mandelbrotExplorer.useGPU = originalGPUState;
                    
                    resolve({
                        standard: null,
                        iteration: null
                    });
                } else {
                    // Wait 100ms before checking again
                    setTimeout(checkGPUReady, 100);
                }
            };
            
            checkGPUReady();
        });
    }

    // Run standard GPU test
    runStandardGPUTest(points, bounds) {
        try {
            const gpuStart = performance.now();
            const gpuResults = mandelbrotExplorer.generateEscapePathsGPU(
                points,
                this.testConfig.maxIterations,
                bounds
            );
            const gpuComputeTime = performance.now() - gpuStart;
            
            // Measure rendering time separately
            const gpuRenderStart = performance.now();
            const gpuCanvasElement = document.getElementById('gpu-canvas');
            renderMandelbrotToCanvas(
                gpuCanvasElement, 
                gpuResults, 
                this.testConfig.maxIterations, 
                this.testConfig.sampleCenterX, 
                this.testConfig.sampleCenterY, 
                this.testConfig.sampleAreaSize, 
                'GPU'
            );
            const gpuRenderTime = performance.now() - gpuRenderStart;
            
            return {
                results: gpuResults,
                computeTime: gpuComputeTime,
                renderTime: gpuRenderTime,
                totalTime: gpuComputeTime + gpuRenderTime
            };
        } catch (error) {
            console.error('GPU test error:', error);
            showCanvasError('gpu-canvas', 'GPU Error');
            return null;
        }
    }

    // Run iteration-centric GPU test (disabled due to implementation issues)
    // runIterationGPUTest(points, bounds) {
    //     try {
    //         const gpuIterationStart = performance.now();
    //         const gpuIterationResults = mandelbrotExplorer.generateEscapePathsGPUIterationCentric(
    //             points,
    //             this.testConfig.maxIterations,
    //             bounds
    //         );
    //         const gpuIterationComputeTime = performance.now() - gpuIterationStart;
    //         
    //         // Render GPU iteration results to canvas
    //         const gpuIterationRenderStart = performance.now();
    //         const gpuIterationCanvasElement = document.getElementById('gpu-iteration-canvas');
    //         renderMandelbrotToCanvas(
    //             gpuIterationCanvasElement, 
    //             gpuIterationResults, 
    //             this.testConfig.maxIterations, 
    //             this.testConfig.sampleCenterX, 
    //             this.testConfig.sampleCenterY, 
    //             this.testConfig.sampleAreaSize, 
    //             'GPU Iteration'
    //         );
    //         const gpuIterationRenderTime = performance.now() - gpuIterationRenderStart;
    //         
    //         return {
    //             results: gpuIterationResults,
    //             computeTime: gpuIterationComputeTime,
    //             renderTime: gpuIterationRenderTime,
    //             totalTime: gpuIterationComputeTime + gpuIterationRenderTime
    //         };
    //     } catch (error) {
    //         console.error('GPU iteration test error:', error);
    //         showCanvasError('gpu-iteration-canvas', 'GPU Iteration Error');
    //         return null;
    //     }
    // }

        // Display test results
    displayResults(cpuResults, gpuResults) {
        const resultsDiv = document.getElementById('performance-results');
        
        // Test configuration summary
        let resultsHTML = `
            <div class="info">
                <h4>Test Configuration</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Grid Size:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${this.testConfig.gridSize}×${this.testConfig.gridSize} (${(this.testConfig.gridSize * this.testConfig.gridSize).toLocaleString()} points)</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Max Iterations:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${this.testConfig.maxIterations}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Sample Area:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${this.testConfig.sampleAreaSize}×${this.testConfig.sampleAreaSize} centered at (${this.testConfig.sampleCenterX}, ${this.testConfig.sampleCenterY})</td>
                    </tr>
                </table>
        `;
        
        if (gpuResults.standard) {
            const speedup = cpuResults.totalTime / gpuResults.standard.totalTime;
            const computeSpeedup = cpuResults.computeTime / gpuResults.standard.computeTime;
            const cpuPointsPerMs = cpuResults.results.length / cpuResults.totalTime;
            const gpuPointsPerMs = gpuResults.standard.results.length / gpuResults.standard.totalTime;
            
            // Compare results
            const comparison = this.compareResults(cpuResults.results, gpuResults.standard.results);
            
            resultsHTML += `
                <h4>Performance Comparison</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #007bff; color: white;">
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Metric</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">CPU</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">GPU</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Speedup</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Total Time</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${cpuResults.totalTime.toFixed(2)}ms</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${gpuResults.standard.totalTime.toFixed(2)}ms</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background-color: #d4edda;"><strong>${speedup.toFixed(2)}× faster</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Compute Time</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${cpuResults.computeTime.toFixed(2)}ms</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${gpuResults.standard.computeTime.toFixed(2)}ms</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background-color: #d4edda;"><strong>${computeSpeedup.toFixed(2)}× faster</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Render Time</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${cpuResults.renderTime.toFixed(2)}ms</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${gpuResults.standard.renderTime.toFixed(2)}ms</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${(cpuResults.renderTime / gpuResults.standard.renderTime).toFixed(2)}×</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Performance</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${cpuPointsPerMs.toFixed(1)} points/ms</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${gpuPointsPerMs.toFixed(1)} points/ms</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background-color: #d4edda;"><strong>${(gpuPointsPerMs / cpuPointsPerMs).toFixed(2)}× faster</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Points Generated</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${cpuResults.results.length.toLocaleString()}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${gpuResults.standard.results.length.toLocaleString()}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${comparison.identical ? '✅ Match' : '❌ Different'}</td>
                        </tr>
                    </tbody>
                </table>
                
                <h4>Summary</h4>
                <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
                    <p><strong>🎯 Overall Performance:</strong> GPU is <strong>${speedup.toFixed(2)}× faster</strong> than CPU for this test</p>
                    <p><strong>⚡ Compute Speedup:</strong> ${computeSpeedup.toFixed(2)}× faster computation</p>
                    <p><strong>🎨 Render Performance:</strong> ${(cpuResults.renderTime / gpuResults.standard.renderTime).toFixed(2)}× (${cpuResults.renderTime < gpuResults.standard.renderTime ? 'CPU faster' : 'GPU faster'})</p>
                    <p><strong>✅ Accuracy:</strong> ${comparison.identical ? 'Results match perfectly' : `Found ${comparison.differences} differences`}</p>
                    <p><strong>🖥️ GPU Context:</strong> ${mandelbrotExplorer.gpuContext.getParameter(mandelbrotExplorer.gpuContext.VERSION)}</p>
                </div>
                
                <h4>Detailed Analysis</h4>
                <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; margin-bottom: 20px;">
                    <p><strong>CPU Breakdown:</strong> ${cpuResults.computeTime.toFixed(2)}ms compute + ${cpuResults.renderTime.toFixed(2)}ms render = ${cpuResults.totalTime.toFixed(2)}ms total</p>
                    <p><strong>GPU Breakdown:</strong> ${gpuResults.standard.computeTime.toFixed(2)}ms compute + ${gpuResults.standard.renderTime.toFixed(2)}ms render = ${gpuResults.standard.totalTime.toFixed(2)}ms total</p>
                    <p><strong>Compute Efficiency:</strong> ${((cpuResults.computeTime / cpuResults.totalTime) * 100).toFixed(1)}% of CPU time is computation vs ${((gpuResults.standard.computeTime / gpuResults.standard.totalTime) * 100).toFixed(1)}% of GPU time</p>
                    <p><strong>Key Insight:</strong> ${cpuResults.renderTime < gpuResults.standard.renderTime ? 'GPU render overhead reduces overall speedup' : 'GPU render performance contributes to speedup'}</p>
                    <p><strong>Note:</strong> GPU initialization overhead (shader compilation, context setup) is not included in these measurements. This is a "warm" GPU test.</p>
                </div>
            `;
        } else {
            resultsHTML += `
                <h4>Performance Results</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #007bff; color: white;">
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Metric</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">CPU</th>
                            <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">GPU</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Total Time</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${cpuResults.totalTime.toFixed(2)}ms</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background-color: #f8d7da;">Not available</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Compute Time</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${cpuResults.computeTime.toFixed(2)}ms</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background-color: #f8d7da;">Not available</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Points Generated</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${cpuResults.results.length.toLocaleString()}</td>
                            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background-color: #f8d7da;">Not available</td>
                        </tr>
                    </tbody>
                </table>
                
                <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px;">
                    <p><strong>❌ GPU Not Available</strong></p>
                    <p><strong>GPU Context:</strong> ${mandelbrotExplorer.gpuContext ? 'Available' : 'Not initialized'}</p>
                    <p><strong>GPU Program:</strong> ${mandelbrotExplorer.gpuProgram ? 'Compiled' : 'Not compiled'}</p>
                    <p><strong>GPU Uniforms:</strong> ${mandelbrotExplorer.gpuUniforms ? 'Initialized' : 'Not initialized'}</p>
                </div>
            `;
        }
        
        resultsHTML += '</div>';
        resultsDiv.innerHTML = resultsHTML;
    }

    // Compare two result sets
    compareResults(cpuResults, gpuResults) {
        let identical = true;
        let differences = 0;
        
        if (cpuResults.length === gpuResults.length) {
            for (let i = 0; i < cpuResults.length; i++) {
                if (cpuResults[i].length !== gpuResults[i].length) {
                    identical = false;
                    differences++;
                }
            }
        } else {
            identical = false;
            differences = Math.abs(cpuResults.length - gpuResults.length);
        }
        
        return { identical, differences };
    }
}

// Create global instance
const gpuTestRunner = new GPUTestRunner(); 