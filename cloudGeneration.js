/* global mandelbrotExplorer, THREE, palettes, debugLog, perfTime, perfTimeEnd */
/* global RGBA_COMPONENTS, GPU_BATCH_SIZE, CPU_BATCH_SIZE, PROGRESS_LOG_INTERVAL */
/* global PROGRESS_PERCENT, CURVE_POINTS, TIMEOUT_SHORT, COLOR_CHANNEL_MAX */
/* global HEX_BASE, STR_PAD_LEFT, getColoredBufferLine_2, getColoredBufferLine_3 */
/* global DEFAULT_SOS_RES, BYTES_PER_ESCAPE_PATH, BYTES_PER_MB */
/* global MIN_CACHE_SIZE_MB, MAX_CACHE_SIZE_MB, CACHE_SIZE_MULTIPLIER */
/* global MIN_CACHE_ENTRIES, MAX_CACHE_ENTRIES, CACHE_BUDGET_MB */

// Cloud generation, caching, hair rendering, and eval-based filter methods
// Extracted from mandelbrotexplorer.js for maintainability

Object.assign(mandelbrotExplorer, {
"cloudMethods": {
    "functionsFromEval": {},
    "evalInitialZ"(escapePath) {
        if( typeof mandelbrotExplorer.cloudMethods.functionsFromEval.initialZ === 'undefined' ) {
            if (mandelbrotExplorer.initialZ) {
                 
                 
                // eslint-disable-next-line no-eval -- user-defined expression
                // eslint-disable-next-line no-eval -- user-defined expression
                eval(`mandelbrotExplorer.cloudMethods.functionsFromEval.initialZ = function (escapePath){\n ${  mandelbrotExplorer.initialZ  }\n}`);
            } else {
                mandelbrotExplorer.cloudMethods.functionsFromEval.initialZ = function(escapePath){
                    return 0;
                };
            }
        }
        
        return mandelbrotExplorer.cloudMethods.functionsFromEval.initialZ(escapePath);
    },
    "processCloudLengthFilter"(pathIndex, iteration, escapePath){
        if( typeof mandelbrotExplorer.cloudMethods.functionsFromEval.cloudLengthFilter === 'undefined' ) {
            if (mandelbrotExplorer.cloudLengthFilter) {
                let functionDefinition = `function (pathIndex, iteration, escapePath){\nreturn ${  mandelbrotExplorer.cloudLengthFilter  };\n}`;
                 
                 
                // eslint-disable-next-line no-eval -- user-defined expression
                // eslint-disable-next-line no-eval -- user-defined expression
                eval(`mandelbrotExplorer.cloudMethods.functionsFromEval.cloudLengthFilter = ${  functionDefinition  };`);
            } else {
                mandelbrotExplorer.cloudMethods.functionsFromEval.cloudLengthFilter = function(){
                    return true;
                };
            }
        }
        
        return mandelbrotExplorer.cloudMethods.functionsFromEval.cloudLengthFilter(pathIndex, iteration, escapePath);
    },
    "processCloudIterationFilter"(pathIndex, iteration, escapePath) {
        if( typeof mandelbrotExplorer.cloudMethods.functionsFromEval.cloudIterationFilter === 'undefined' ) {
            if (mandelbrotExplorer.cloudIterationFilter) {
                let functionDefinition = `function (pathIndex, iteration, escapePath){\nreturn ${  mandelbrotExplorer.cloudIterationFilter  };\n}`;
                 
                 
                // eslint-disable-next-line no-eval -- user-defined expression
                // eslint-disable-next-line no-eval -- user-defined expression
                eval(`mandelbrotExplorer.cloudMethods.functionsFromEval.cloudIterationFilter = ${  functionDefinition  };`);
            } else {
                mandelbrotExplorer.cloudMethods.functionsFromEval.cloudIterationFilter = function(){
                    return true;
                };
            }
        }
        
        return mandelbrotExplorer.cloudMethods.functionsFromEval.cloudIterationFilter(pathIndex, iteration, escapePath);
    },
    "evalEscapingZ" (pathIndex, iteration, escapePath) {
        if( typeof mandelbrotExplorer.cloudMethods.functionsFromEval.escapingZ === 'undefined' ) {
            if (mandelbrotExplorer.escapingZ) {
                let functionDefinition = `function (pathIndex, iteration, escapePath){\n${ 
                         mandelbrotExplorer.escapingZ 
                     };\n}`;
                 
                 
                // eslint-disable-next-line no-eval -- user-defined expression
                // eslint-disable-next-line no-eval -- user-defined expression
                eval(`mandelbrotExplorer.cloudMethods.functionsFromEval.escapingZ = ${  functionDefinition  };`);
            } else {
                mandelbrotExplorer.cloudMethods.functionsFromEval.escapingZ = function(){
                    return 0;
                };
            }
        }
        
        return mandelbrotExplorer.cloudMethods.functionsFromEval.escapingZ(pathIndex, iteration, escapePath);
    },
    "processParticleFilter" (newX, newY, particleVector) {
        if( typeof mandelbrotExplorer.cloudMethods.functionsFromEval.particleFilter === 'undefined' ) {
            if (mandelbrotExplorer.particleFilter) {
                let functionDefinition = `function (newX, newY, particleVector){\n` 
                        + `var allowed = ${  mandelbrotExplorer.particleFilter  };\n`
                        + `return {newX: newX, newY: newY, particleVector: particleVector, allowed: allowed};\n`
                    + `}`;
                 
                 
                // eslint-disable-next-line no-eval -- user-defined expression
                // eslint-disable-next-line no-eval -- user-defined expression
                eval(`mandelbrotExplorer.cloudMethods.functionsFromEval.particleFilter = ${  functionDefinition  };`);
            } else {
                let functionDefinition = "function (newX, newY, particleVector){\n" 
                        + "var allowed = true;\n"
                        + "return {newX: newX, newY: newY, particleVector: particleVector, allowed: allowed};\n"
                    + "}";
                 
                 
                // eslint-disable-next-line no-eval -- user-defined expression
                // eslint-disable-next-line no-eval -- user-defined expression
                eval(`mandelbrotExplorer.cloudMethods.functionsFromEval.particleFilter = ${  functionDefinition  };`);
            }
        }
        
        return mandelbrotExplorer.cloudMethods.functionsFromEval.particleFilter(newX, newY, particleVector);
    },
    "processDualZMultiplier"(pathIndex, iteration, escapePath, newX, newY, z) {
			let newZ = z;
         
         
        // eslint-disable-next-line no-eval -- user-defined expression
        // eslint-disable-next-line no-eval -- user-defined expression
        let dualZMultiplier = eval(mandelbrotExplorer.dualZMultiplier);
        
        return [newX, newY, newZ];
    },
    "evalJuliaC"(c) {
         
         
        // eslint-disable-next-line no-eval -- user-defined expression
        // eslint-disable-next-line no-eval -- user-defined expression
        return eval(mandelbrotExplorer.juliaC);
    },
    "handleCloudSteppingAdjustments"(c){
        if(mandelbrotExplorer.randomizeCloudStepping){
            const getRandomArbitrary = function(min, max) {
              return Math.random() * (max - min) + min;
            };
            
            c[0] = getRandomArbitrary(c[0] - mandelbrotExplorer.xScale_3d, c[0] + mandelbrotExplorer.xScale_3d);
            c[1] = getRandomArbitrary(c[1] - mandelbrotExplorer.yScale_3d, c[1] + mandelbrotExplorer.yScale_3d);
        }
        
        return c;
    },
    "getEscapePath"(c) {
        const juliaC = mandelbrotExplorer.cloudMethods.evalJuliaC(c);
        const repeatCheck = function(zValues, z, lastZ){
            const test = zValues.filter(function(testZ){
                return z[0] !== testZ[0] && z[1] !== testZ[1];
            });
            return zValues.length !== test.length;
        };

        let escapePath;
        if( mandelbrotExplorer.getAbsoluteValueOfComplexNumber( juliaC ) !== 0 ){
            escapePath = mandelbrotExplorer.getJuliaEscapePath( juliaC, c, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
        }
        else{
            escapePath = mandelbrotExplorer.getJuliaEscapePath( c, juliaC, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
        }
        
        return escapePath;
    },
    "discontinueIterationCycle"() {
        const result = mandelbrotExplorer.continueIterationCycle;
        mandelbrotExplorer.continueIterationCycle = false;
        return result;
    },
    "startRenderer"() {
        // This method is now handled by ThreeJSRenderer.init()
        // No longer needed as initialization is done in mandelbrotExplorer.init()
    },
    "startScene"(){
        // This method is now handled by ThreeJSRenderer
        // No longer needed as scene management is done by ThreeJSRenderer
    },
    "startCamera"() {
        // This method is now handled by ThreeJSRenderer
        // No longer needed as camera management is done by ThreeJSRenderer
    },
    "startTrackballControls"() {
        // This method is now handled by ThreeJSRenderer
        // No longer needed as controls management is done by ThreeJSRenderer
    },
    "initialize3DScaling"() {
			let cloudResolutions = [];
			if(mandelbrotExplorer.cloudResolution.toString().indexOf(",") !== -1){
				cloudResolutions = mandelbrotExplorer.cloudResolution.split(",").map(function(val) { return parseFloat(val.trim()); });
			}
			else{
				cloudResolutions.push(parseFloat(mandelbrotExplorer.cloudResolution));
			}

			const minRes = Math.min.apply(null, cloudResolutions);
			const maxRes = Math.max.apply(null, cloudResolutions);
			
			mandelbrotExplorer.scales_3d = [];
			
			let sosRes = 0;
			cloudResolutions.forEach(
				function(useResolution) {
					sosRes += (useResolution * useResolution);
					mandelbrotExplorer.scales_3d.push({
						x: Math.abs( mandelbrotExplorer.startX - mandelbrotExplorer.endX ) / useResolution, 
						y: Math.abs( mandelbrotExplorer.startY - mandelbrotExplorer.endY ) / useResolution
					});
				}
			)
			
			if(sosRes === 0) {
				sosRes = DEFAULT_SOS_RES;
			}

			// TODO: I want to allow for multiple scales in the same render...
        mandelbrotExplorer.xScale_3d = Math.abs( mandelbrotExplorer.startX - mandelbrotExplorer.endX ) / Math.sqrt(sosRes);
        mandelbrotExplorer.yScale_3d = Math.abs( mandelbrotExplorer.startY - mandelbrotExplorer.endY ) / Math.sqrt(sosRes);
			
    },
    "initializeMandelbrotCloud"(){
        mandelbrotExplorer.clearMandelbrotCloud();
        mandelbrotExplorer.cloudMethods.initialize3DScaling();
        
        mandelbrotExplorer.iterationParticles = [];
        mandelbrotExplorer.particleSystems = [];
        mandelbrotExplorer.cloudMethods.functionsFromEval = {};
    },
		"initializeMandelbrotHair"(){
        mandelbrotExplorer.cloudMethods.initialize3DScaling();
        
			mandelbrotExplorer.iterationParticles = [];
			mandelbrotExplorer.lines = [];
			mandelbrotExplorer.lineVectors = [];
			
        mandelbrotExplorer.cloudMethods.functionsFromEval = {};
		},
    "generateCacheKey"() {
        // Generate a unique cache key based on parameters that affect point generation
        const params = [
            mandelbrotExplorer.startX,
            mandelbrotExplorer.startY,
            mandelbrotExplorer.endX,
            mandelbrotExplorer.endY,
            mandelbrotExplorer.maxIterations_3d,
            mandelbrotExplorer.cloudResolution,
            mandelbrotExplorer.randomizeCloudStepping,
            mandelbrotExplorer.juliaC,
            mandelbrotExplorer.initialZ,
            mandelbrotExplorer.escapingZ
        ];
        return params.join('|');
    },
    "getCacheSize"() {
        		// Calculate approximate memory usage of escape path cache in MB
		if (!mandelbrotExplorer.cloudCache) return 0;
		
		let totalSize = 0;
		
		for (const key in mandelbrotExplorer.cloudCache) {
			const entry = mandelbrotExplorer.cloudCache[key];
			if (entry.escapePaths) {
				// Avoid circular references by only counting the array length
				totalSize += entry.escapePaths.length * BYTES_PER_ESCAPE_PATH; // Approximate bytes per escape path
			}
		}
        
        return Math.round(totalSize / BYTES_PER_MB); // Convert to MB
    },

    
    "clearCloudCache"() {
        // Clear the cloud cache when parameters change
        if (mandelbrotExplorer.cloudCache) {
            mandelbrotExplorer.cloudCache = {};
            		debugLog('cache', 'Cloud cache cleared');
        }
    },

    "limitCacheSize"() {
        // Limit cache size to prevent excessive memory usage
        // Calculate realistic cache size based on current parameters
        const currentResolutions = mandelbrotExplorer.cloudResolution.toString().split(',').map(r => parseInt(r.trim()));
        const maxResolution = Math.max(...currentResolutions);
        const maxIterations = mandelbrotExplorer.maxIterations_3d;
        
        // Estimate cache size: resolution² × iterations × 16 bytes per coordinate pair
        const estimatedCacheSizeMB = (maxResolution * maxResolution * maxIterations * BYTES_PER_ESCAPE_PATH) / BYTES_PER_MB;
        
        // Set limits based on estimated size, with reasonable bounds
        const MAX_ESCAPE_PATH_CACHE_SIZE_MB = Math.max(MIN_CACHE_SIZE_MB, Math.min(MAX_CACHE_SIZE_MB, estimatedCacheSizeMB * CACHE_SIZE_MULTIPLIER)); // 500MB-9GB range
        const maxCacheEntries = Math.max(MIN_CACHE_ENTRIES, Math.min(MAX_CACHE_ENTRIES, Math.floor(CACHE_BUDGET_MB / estimatedCacheSizeMB))); // Fewer entries for larger data
        
        		debugLog('cache', 'Cache size estimation:', {
            maxResolution,
            maxIterations, 
            estimatedSizeMB: Math.round(estimatedCacheSizeMB),
            cacheLimitMB: Math.round(MAX_ESCAPE_PATH_CACHE_SIZE_MB),
            maxEntries: maxCacheEntries
        });

        // Warn if cache size would be very large
        if (estimatedCacheSizeMB > CACHE_BUDGET_MB) {
            console.warn('⚠️ Large cache size detected:', Math.round(estimatedCacheSizeMB), 'MB. Consider reducing resolution or iterations for better performance.');

            // Suggest specific optimizations
            const suggestedRes = Math.floor(Math.sqrt(estimatedCacheSizeMB * BYTES_PER_MB / (maxIterations * BYTES_PER_ESCAPE_PATH)));
            		debugLog('cache', '💡 Suggestions:');
		debugLog('cache', '   - Reduce resolution to ~', suggestedRes, 'for ~1GB cache');
		debugLog('cache', '   - Or reduce iterations to ~', Math.floor(COLOR_CHANNEL_MAX + 1), 'for current resolution');
		debugLog('cache', '   - Or disable caching for this render (will be slower but use less memory)');
        }

        if (!mandelbrotExplorer.cloudCache) return;

        const cacheKeys = Object.keys(mandelbrotExplorer.cloudCache);

        // If we have too many entries, remove oldest ones
        if (cacheKeys.length > maxCacheEntries) {
            const keysToRemove = cacheKeys.slice(0, cacheKeys.length - maxCacheEntries);
            keysToRemove.forEach(key => {
                delete mandelbrotExplorer.cloudCache[key];
            });
            		debugLog('cache', 'Removed', keysToRemove.length, 'old cache entries');
        }
        
        			// Check escape path cache memory usage
			let escapePathCacheSize = 0;
			for (const key in mandelbrotExplorer.cloudCache) {
				const entry = mandelbrotExplorer.cloudCache[key];
				if (entry.escapePaths) {
					// Avoid circular references by only counting the array length
					escapePathCacheSize += entry.escapePaths.length * BYTES_PER_ESCAPE_PATH; // Approximate bytes per escape path
				}
			}
			escapePathCacheSize = Math.round(escapePathCacheSize / BYTES_PER_MB); // Convert to MB
        
        if (escapePathCacheSize > MAX_ESCAPE_PATH_CACHE_SIZE_MB) {
            		debugLog('cache', `Escape path cache size limit exceeded (${  escapePathCacheSize  }MB), clearing cache`);
            this.clearCloudCache();
        }
    },
    "getCacheStatus"() {
        if (!mandelbrotExplorer.cloudCache) {
            return { entries: 0, size: 0 };
        }
        
        const cacheKeys = Object.keys(mandelbrotExplorer.cloudCache);
        
        return {
            entries: cacheKeys.length,
            size: this.getCacheSize()
        };
    },
    "clearCacheAndLog"() {
        const status = this.getCacheStatus();
        this.clearCloudCache();
        		debugLog('cache', 'Cache cleared. Previous status:', status.entries, 'entries,', status.size, 'MB');
    },
    
    "generateMandelbrotCloudParticles"() {
        		perfTime("drawMandelbrotCloud: Generating particles");
        
        // Create a progress indicator
        const progressDiv = document.createElement('div');
        progressDiv.id = 'cloud-generation-progress';
        progressDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            text-align: center;
            min-width: 200px;
        `;
        progressDiv.innerHTML = `
            <div>Generating Cloud...</div>
            <div id="progress-text">0%</div>
            <div style="width: 200px; height: 10px; background: #333; border-radius: 5px; margin-top: 10px;">
                <div id="progress-bar" style="width: 0%; height: 100%; background: #4CAF50; border-radius: 5px; transition: width 0.3s;"></div>
            </div>
            <button id="cancel-generation" style="margin-top: 10px; padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">Cancel</button>
        `;
        document.body.appendChild(progressDiv);
        
        // Check if we have a valid cache for current parameters
        const cacheKey = this.generateCacheKey();
        let cachedEscapePaths = null;
        
        if (mandelbrotExplorer.cloudCache && mandelbrotExplorer.cloudCache[cacheKey]) {
            const cacheEntry = mandelbrotExplorer.cloudCache[cacheKey];
            
            if (cacheEntry.escapePaths) {
                cachedEscapePaths = cacheEntry.escapePaths;
                		debugLog('cache', 'Using cached escape paths:', cachedEscapePaths.length, 'paths');
                document.getElementById('progress-text').textContent = 'Using cached escape paths...';
            }
        }
        
        // Log cache status
        const cacheStatus = this.getCacheStatus();
        		debugLog('cache', 'Cache status:', cacheStatus.entries, 'entries,', cacheStatus.size, 'MB');
        if (cacheStatus.size > 0) {
            		debugLog('cache', 'Cache efficiency: ~', Math.round(cacheStatus.size / cacheStatus.entries), 'KB per entry');
        }
        
        if (!cachedEscapePaths) {
            const gpuStatus = mandelbrotExplorer.useGPU ? 'GPU' : 'CPU';
            		debugLog('generation', 'No cache found, generating new escape paths using', gpuStatus, '...');
            		debugLog('gpu', 'GPU enabled:', mandelbrotExplorer.useGPU);
		debugLog('gpu', 'GPU context available:', !!mandelbrotExplorer.gpuContext);
            document.getElementById('progress-text').textContent = `Generating escape paths (${gpuStatus})...`;
            
            // If GPU is enabled but not ready, wait for it to be ready
            if (mandelbrotExplorer.useGPU && !mandelbrotExplorer.isGPUReady()) {
                		debugLog('gpu', 'GPU not ready, waiting for initialization...');
                document.getElementById('progress-text').textContent = 'Waiting for GPU initialization...';
                
                // Wait for GPU to be ready with a timeout
                let gpuWaitAttempts = 0;
                const maxGPUWaitAttempts = 50; // 5 seconds max wait
                
                function waitForGPU() {
                    if (mandelbrotExplorer.isGPUReady()) {
                        		debugLog('gpu', 'GPU is now ready, proceeding with generation');
                        document.getElementById('progress-text').textContent = 'GPU ready, generating escape paths...';
                        startGeneration();
                    } else if (gpuWaitAttempts < maxGPUWaitAttempts) {
                        gpuWaitAttempts++;
                        		debugLog('gpu', `GPU not ready yet, attempt ${gpuWaitAttempts}/${maxGPUWaitAttempts}`);
                        setTimeout(waitForGPU, TIMEOUT_SHORT);
                    } else {
                        		debugLog('gpu', 'GPU initialization timeout, falling back to CPU');
                        document.getElementById('progress-text').textContent = 'GPU timeout, using CPU...';
                        startGeneration();
                    }
                }
                
                waitForGPU();
                return; // Exit early, will continue in waitForGPU callback
            }
        }
        
        // Start the actual generation process
        startGeneration();
        
        function startGeneration() {
        
        // Calculate total work
        let totalPoints = 0;
        mandelbrotExplorer.scales_3d.forEach(function(useScales) {
            const xPoints = Math.ceil((mandelbrotExplorer.endX - mandelbrotExplorer.startX) / useScales.x);
            const yPoints = Math.ceil((mandelbrotExplorer.startY - mandelbrotExplorer.endY) / useScales.y);
            totalPoints += xPoints * yPoints;
        });
        
        let processedPoints = 0;
        let isCancelled = false;
        
        // Cancel button handler
        document.getElementById('cancel-generation').addEventListener('click', function() {
            isCancelled = true;
            progressDiv.remove();
            		debugLog('generation', 'Cloud generation cancelled');
        });
        
        // Create a flat array of all points to process
        const allPoints = [];
        mandelbrotExplorer.scales_3d.forEach(function(useScales) {
            for (let x = mandelbrotExplorer.startX; x < mandelbrotExplorer.endX; x += useScales.x) {
                for (let y = mandelbrotExplorer.startY; y > mandelbrotExplorer.endY; y -= useScales.y) {
                    allPoints.push({x, y, scale: useScales});
                }
            }
        });
        
        let currentPointIndex = 0;
        const BATCH_SIZE = mandelbrotExplorer.useGPU ? GPU_BATCH_SIZE : CPU_BATCH_SIZE; // Larger batches for GPU


        
        function processBatch() {
            if (isCancelled) {
                return;
            }
            
            const endIndex = Math.min(currentPointIndex + BATCH_SIZE, allPoints.length);
            
            // Process batch using GPU or CPU
            if (mandelbrotExplorer.useGPU && mandelbrotExplorer.isGPUReady() && !cachedEscapePaths && currentPointIndex === 0) {
                // GPU processes the entire grid at once
                		debugLog('gpu', 'GPU processing entire grid of', allPoints.length, 'points');
                
                // Update progress to show GPU processing
                const progressText = document.getElementById('progress-text');
                if (progressText) {
                    progressText.textContent = 'GPU processing...';
                }
                
                try {
                    const allEscapePaths = mandelbrotExplorer.generateEscapePathsGPU(allPoints.map(p => [p.x, p.y]), mandelbrotExplorer.maxIterations_3d);
                    
                    // Update progress to show processing results
                    if (progressText) {
                        progressText.textContent = 'Processing GPU results...';
                    }
                    
                    // Process all GPU results with progress updates
                    for (let i = 0; i < allEscapePaths.length; i++) {
                        const point = allPoints[i];
                        const escapePath = allEscapePaths[i];
                        processEscapePath(point, escapePath, true, i);
                        processedPoints++;
                        
                        // Update progress every 1000 points for GPU processing
                        if (i % PROGRESS_LOG_INTERVAL === 0) {
                            const progress = Math.min(100, (processedPoints / totalPoints) * PROGRESS_PERCENT);
                            const progressBar = document.getElementById('progress-bar');
                            if (progressText && progressBar) {
                                progressText.textContent = `Processing GPU results... ${Math.round(progress)}%`;
                                progressBar.style.width = `${progress  }%`;
                            }
                        }
                    }
                    
                    // Skip to the end since we processed everything
                    currentPointIndex = allPoints.length;
                } catch (error) {
                    console.error('GPU processing failed, falling back to CPU:', error);
                    // Fall back to CPU processing for this batch
                    for (let i = currentPointIndex; i < endIndex; i++) {
                        const point = allPoints[i];
                        
                        let escapePath;
                        let shouldCache = false;
                        
                        if (cachedEscapePaths && cachedEscapePaths[i]) {
                            // Use cached escape path
                            escapePath = cachedEscapePaths[i];
                        } else {
                            // Generate new escape path
                            // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                            // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                            var c = mandelbrotExplorer.cloudMethods.handleCloudSteppingAdjustments([point.x, point.y]);
                            escapePath = mandelbrotExplorer.cloudMethods.getEscapePath(c);
                            shouldCache = true;
                        }
                        
                        processEscapePath(point, escapePath, shouldCache, i);
                        processedPoints++;
                    }
                }
            } else if (mandelbrotExplorer.useGPU && !mandelbrotExplorer.isGPUReady() && !cachedEscapePaths && currentPointIndex === 0) {
                		debugLog('gpu', 'GPU enabled but not ready, falling back to CPU processing');
		debugLog('gpu', 'GPU Status:', {
                    context: !!mandelbrotExplorer.gpuContext,
                    program: !!mandelbrotExplorer.gpuProgram,
                    uniforms: !!mandelbrotExplorer.gpuUniforms,
                    ready: mandelbrotExplorer.isGPUReady()
                });
                
                // Fall back to CPU processing for this batch
                for (let i = currentPointIndex; i < endIndex; i++) {
                    const point = allPoints[i];
                    
                    let escapePath;
                    let shouldCache = false;
                    
                    if (cachedEscapePaths && cachedEscapePaths[i]) {
                        // Use cached escape path
                        escapePath = cachedEscapePaths[i];
                    } else {
                        // Generate new escape path
                         
                         
                        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                        var c = mandelbrotExplorer.cloudMethods.handleCloudSteppingAdjustments([point.x, point.y]);
                        escapePath = mandelbrotExplorer.cloudMethods.getEscapePath(c);
                        shouldCache = true;
                    }
                    
                    processEscapePath(point, escapePath, shouldCache, i);
                    processedPoints++;
                }
            } else {
                // CPU processing (original method)
                for (let i = currentPointIndex; i < endIndex; i++) {
                    const point = allPoints[i];
                    
                    let escapePath;
                    let shouldCache = false;
                    
                    if (cachedEscapePaths && cachedEscapePaths[i]) {
                        // Use cached escape path
                        escapePath = cachedEscapePaths[i];
                    } else {
                        // Generate new escape path
                         
                         
                        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                        var c = mandelbrotExplorer.cloudMethods.handleCloudSteppingAdjustments([point.x, point.y]);
                        escapePath = mandelbrotExplorer.cloudMethods.getEscapePath(c);
                        shouldCache = true;
                    }
                    
                    processEscapePath(point, escapePath, shouldCache, i);
                    processedPoints++;
                }
            }
            
            function processEscapePath(point, escapePath, shouldCache, pointIndex) {
                		// Debug: log first few escape paths
		if (pointIndex < 5) {
			debugLog('escapePaths', 'Processing escape path', pointIndex, ':', {
				point: [point.x, point.y],
				escapePathLength: escapePath.length,
				shortened: escapePath.shortened,
				firstPoint: escapePath[0],
				lastPoint: escapePath[escapePath.length - 1]
			});
		}
                
                if (
                    (mandelbrotExplorer.onlyShortened && !escapePath.shortened) ||
                    (mandelbrotExplorer.onlyFull && escapePath.shortened)
                ) {
                    return;
                }

                let z = mandelbrotExplorer.cloudMethods.evalInitialZ(escapePath);
                let accumulatedZ = 0;
                let averageOfAccumulatedZ = 0;

                escapePath.forEach(function(pathValue, pathIndex, source) {
                    accumulatedZ += mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
                    averageOfAccumulatedZ = accumulatedZ / (pathIndex + 1)
                    const iteration = pathIndex + 1;
                    

                    
                    if (
                        !mandelbrotExplorer.cloudMethods.processCloudLengthFilter(pathIndex, iteration, escapePath) ||
                        !mandelbrotExplorer.cloudMethods.processCloudIterationFilter(pathIndex, iteration, escapePath)
                    ) {

                        return true;
                    }

                    if (pathIndex !== 0) {
                        z = mandelbrotExplorer.cloudMethods.evalEscapingZ(pathIndex, iteration, escapePath);
                    }
                    
                    const iterationIndex = parseInt(pathIndex);
                    
                    if (typeof mandelbrotExplorer.iterationParticles[iterationIndex] === "undefined") {
                        mandelbrotExplorer.iterationParticles[iterationIndex] = {"particles": []};
                    }
                    // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                    // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                    var newX = escapePath[pathIndex][0];
                    // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                    // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                    var newY = escapePath[pathIndex][1];
                    // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                    // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                    var particleVector = new THREE.Vector3(newX, newY, z);
                    const particleFilterResult = mandelbrotExplorer.cloudMethods.processParticleFilter(newX, newY, particleVector);
                    if (!particleFilterResult['allowed']) {
                        return true;
                    }
                    
                    mandelbrotExplorer.iterationParticles[iterationIndex].particles.push(particleFilterResult.particleVector);
                    
                    if (typeof mandelbrotExplorer.iterationParticles[iterationIndex].fpe === "undefined") {
                        mandelbrotExplorer.iterationParticles[iterationIndex].fpe = 0;
                    }
                    mandelbrotExplorer.iterationParticles[iterationIndex].fpe += pathValue.fpe;
                    

                    
                    if (mandelbrotExplorer.dualZ) {
                         
                         
                        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                        var newX = particleFilterResult.newX;
                         
                         
                        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                        var newY = particleFilterResult.newY;
                        const coords = mandelbrotExplorer.cloudMethods.processDualZMultiplier(pathIndex, iteration, escapePath, newX, newY, z);
                         
                         
                        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
                        var particleVector = new THREE.Vector3(coords[0], coords[1], coords[2]);
                        
                        mandelbrotExplorer.iterationParticles[iterationIndex].particles.push(particleVector);
                    }
                });
                
                // Cache the escape path data if we generated it
                if (shouldCache && !cachedEscapePaths) {
                    if (!mandelbrotExplorer.cloudCache) {
                        mandelbrotExplorer.cloudCache = {};
                    }
                    if (!mandelbrotExplorer.cloudCache[cacheKey]) {
                        mandelbrotExplorer.cloudCache[cacheKey] = [];
                    }
                    
                    // Store the escape path for future use
                    mandelbrotExplorer.cloudCache[cacheKey][pointIndex] = escapePath;
                }
                
                // Limit cache size periodically during generation
                if (processedPoints % PROGRESS_LOG_INTERVAL === 0) {
                    mandelbrotExplorer.cloudMethods.limitCacheSize();
                }
            }
            
            currentPointIndex = endIndex;
            
            // Update progress
            const progress = Math.min(100, (processedPoints / totalPoints) * PROGRESS_PERCENT);
            const progressText = document.getElementById('progress-text');
            const progressBar = document.getElementById('progress-bar');
            if (progressText && progressBar) {
                progressText.textContent = `${Math.round(progress)  }%`;
                progressBar.style.width = `${progress  }%`;
            }
            
            // Continue processing or finish
            if (currentPointIndex < allPoints.length && !isCancelled) {
                setTimeout(processBatch, 0);
            } else {
                // Generation complete - don't remove progress div yet, it will be removed after particle system creation
                		perfTimeEnd("drawMandelbrotCloud: Generating particles");
                
                if (!isCancelled) {
                    // Log total points generated
                    let totalPointsGenerated = 0;
                    for (const key in mandelbrotExplorer.iterationParticles) {
                        if (mandelbrotExplorer.iterationParticles[key] && 
                            mandelbrotExplorer.iterationParticles[key].particles) {
                            totalPointsGenerated += mandelbrotExplorer.iterationParticles[key].particles.length;
                        }
                    }
                    		debugLog('particles', 'Total points generated:', totalPointsGenerated);
		debugLog('particles', 'Total iterationParticles keys:', Object.keys(mandelbrotExplorer.iterationParticles).length);
		debugLog('particles', 'Creating particle systems...');
                    
                    // Cache the escape paths if we generated them
                    if (!isCancelled) {
                        if (!mandelbrotExplorer.cloudCache) {
                            mandelbrotExplorer.cloudCache = {};
                        }
                        if (!mandelbrotExplorer.cloudCache[cacheKey]) {
                            mandelbrotExplorer.cloudCache[cacheKey] = {};
                        }
                        
                        							// Store the escape paths (they were already collected during generation)
							// Don't create circular reference - escapePaths are already stored in the array
                        
                        // Limit cache size after adding new data
                        mandelbrotExplorer.cloudMethods.limitCacheSize();
                    }
                    
                    mandelbrotExplorer.cloudMethods.applyMandelbrotCloudPalette();
                    // Don't set iterationParticles to null here - let applyMandelbrotCloudPalette handle cleanup
                }
            }
        }
        

        
        // Start processing
        processBatch();
        } // Close startGeneration function
    },
    "applyMandelbrotCloudPalette"() {
        		perfTime("drawMandelbrotCloud: Creating particle systems");
        
        // Update progress text to show particle system creation
        const progressDivUpdate = document.getElementById('cloud-generation-progress');
        if (progressDivUpdate) {
            document.getElementById('progress-text').textContent = 'Creating particle systems...';
            // Reset progress bar for particle system creation
            const progressBar = document.getElementById('progress-bar');
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }
        
        const indices = Object.keys(mandelbrotExplorer.iterationParticles);
        		debugLog('particles', 'Creating particle systems for indices:', indices.slice(0, 20), '... (total:', indices.length, ')');
        
        // Process all particle systems in one go (no batching needed since this is fast)
        for (let i = 0; i < indices.length; i++) {
            let index = indices[i];
            
            // Get the particles data
            let particlesData = mandelbrotExplorer.iterationParticles[index];
            if (!particlesData || !particlesData.particles || 
                !Array.isArray(particlesData.particles) ||
                particlesData.particles.length === 0) {
                continue;
            }
            
            let color = mandelbrotExplorer.palette[ mandelbrotExplorer.getColorIndex(index) ];
             
             
            // eslint-disable-next-line no-eval -- user-defined expression
            // eslint-disable-next-line no-eval -- user-defined expression
            let size = mandelbrotExplorer.particleSize ? eval(mandelbrotExplorer.particleSize): 0;
            
            let pMaterial = mandelbrotExplorer.threeRenderer.createParticleMaterial(color, size);
            
            // Convert array of vectors to geometry for rendering
            let geometry = new THREE.Geometry();
            
            particlesData.particles.forEach(function(vector) {
                if (vector && vector.x !== undefined && vector.y !== undefined && vector.z !== undefined) {
                    geometry.vertices.push(vector);
                }
            });
            
            let points = mandelbrotExplorer.threeRenderer.addParticleSystem(
                geometry,
                pMaterial
            );
            
            mandelbrotExplorer.particleSystems[index] = points;
            
            // Update progress for particle system creation
            if (i % 10 === 0 || i === indices.length - 1) {
                let progress = Math.min(100, (i / indices.length) * PROGRESS_PERCENT);
                let progressText = document.getElementById('progress-text');
                let progressBar = document.getElementById('progress-bar');
                if (progressText && progressBar) {
                    progressText.textContent = `Creating particle systems... ${Math.round(progress)}%`;
                    progressBar.style.width = `${progress  }%`;
                }
            }
        }
        
        // Clean up iterationParticles after particle system creation is complete
        mandelbrotExplorer.iterationParticles = null;
        
        		perfTimeEnd("drawMandelbrotCloud: Creating particle systems");
        
        // Remove progress div after everything is complete
        const progressDivFinal = document.getElementById('cloud-generation-progress');
        if (progressDivFinal) {
            progressDivFinal.remove();
        }
        
        // Call completion handler if it exists
        if (mandelbrotExplorer.cloudMethods.onCloudGenerationComplete) {
            mandelbrotExplorer.cloudMethods.onCloudGenerationComplete();
        }
    },
		"generateMandelbrotHair" () {
			perfTime("drawMandelbrotsHair: Generating line vectors");
			mandelbrotExplorer.scales_3d.forEach(function(useScales){
				for( let x = mandelbrotExplorer.startX; x < mandelbrotExplorer.endX; x += useScales.x ) {
					for( let y = mandelbrotExplorer.startY; y > mandelbrotExplorer.endY; y -= useScales.y ) {
						const c = [x,y];
						const juliaC = mandelbrotExplorer.cloudMethods.evalJuliaC();
						if(mandelbrotExplorer.randomizeCloudStepping){
							const getRandomArbitrary = function(min, max) {
							  return Math.random() * (max - min) + min;
							};
							
							c[0] = getRandomArbitrary(x - mandelbrotExplorer.xScale_3d, x + mandelbrotExplorer.xScale_3d);
							c[1] = getRandomArbitrary(y - mandelbrotExplorer.xScale_3d, y + mandelbrotExplorer.xScale_3d);
						}
						const repeatCheck = function(zValues, z, lastZ){
							const test = zValues.filter(function(testZ){
								return z[0] !== testZ[0] && z[1] !== testZ[1];
							});
							return zValues.length !== test.length;
						};
						let escapePath;
						if( mandelbrotExplorer.getAbsoluteValueOfComplexNumber( juliaC ) !== 0 ){
							escapePath = mandelbrotExplorer.getJuliaEscapePath( juliaC, c, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
						}
						else{
							escapePath = mandelbrotExplorer.getJuliaEscapePath( c, juliaC, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
						}
						if((mandelbrotExplorer.onlyShortened && !escapePath.shortened) ||
						   (mandelbrotExplorer.onlyFull && escapePath.shortened)){continue;}

						let z = mandelbrotExplorer.cloudMethods.evalInitialZ(escapePath);
						const accumulatedZ = 0;
						const averageOfAccumulatedZ = 0;
						
						const lineVectors = [];
						escapePath.forEach(function(pathValue, pathIndex, source){
							let iteration = pathIndex + 1;
							
							 
							 
							// eslint-disable-next-line no-eval -- user-defined expression
							// eslint-disable-next-line no-eval -- user-defined expression
							if( mandelbrotExplorer.cloudLengthFilter.length > 0 && eval( mandelbrotExplorer.cloudLengthFilter ) === false ) return true;
							 
							 
							// eslint-disable-next-line no-eval -- user-defined expression
							// eslint-disable-next-line no-eval -- user-defined expression
							if( mandelbrotExplorer.cloudIterationFilter.length > 0 && eval( mandelbrotExplorer.cloudIterationFilter ) === false ) return true;
							let direction = [1,1];
							if(pathIndex > 0){
								direction[0] = escapePath[pathIndex][0] > escapePath[pathIndex-1][0] ? -1 : 1;
								direction[1] = escapePath[pathIndex][1] > escapePath[pathIndex-1][1] ? -1 : 1;
							}
							// this isn't right.... zDirection...
							let zDirection = direction[0] * direction[1];
							
							if( pathIndex !== 0 ) {
								// eslint-disable-next-line no-eval -- user-defined expression
								// eslint-disable-next-line no-eval -- user-defined expression
								z = mandelbrotExplorer.cloudMethods.evalEscapingZ(pathIndex, iteration, escapePath);// eval( mandelbrotExplorer.escapingZ );
							}
							
							let iterationIndex = parseInt(pathIndex);
							
							if( typeof mandelbrotExplorer.iterationParticles[iterationIndex] === "undefined" ) {
								mandelbrotExplorer.iterationParticles[iterationIndex] = {"particles": new THREE.Geometry()};
							}
							let newX = escapePath[pathIndex][0];
							let newY = escapePath[pathIndex][1];
							let particleVector = new THREE.Vector3(newX, newY, z);
							if(mandelbrotExplorer.particleFilter){
								 
								 
								// eslint-disable-next-line no-eval -- user-defined expression
								// eslint-disable-next-line no-eval -- user-defined expression
								let allowed = eval( mandelbrotExplorer.particleFilter );
								if( !allowed ){
									return true;
								}
							}
							lineVectors.push(particleVector);
						});
						if(lineVectors.length > 1){
							mandelbrotExplorer.lineVectors.push(lineVectors);
						}
					}
				}
			});
			perfTimeEnd("drawMandelbrotsHair: Generating line vectors");
			for(const lineIndex in mandelbrotExplorer.lineVectors){
				const currentLine = mandelbrotExplorer.lineVectors[lineIndex];
				
				const color = mandelbrotExplorer.palette[ mandelbrotExplorer.getColorIndex(lineIndex) ];

				const geometry = new THREE.Geometry();
				const curve = new THREE.CatmullRomCurve3(currentLine, false, 'chordal' );
				geometry.vertices = curve.getPoints(CURVE_POINTS);
				
				//gradientline.js
				const steps = 0.2;
				const phase = 1.5;
				//Create the final object to add to the scene
				let coloredLine = getColoredBufferLine_2( steps, phase, geometry, color );
				coloredLine = getColoredBufferLine_3(geometry, mandelbrotExplorer.palette );
				
				mandelbrotExplorer.threeRenderer.scene.add(coloredLine);
				mandelbrotExplorer.lines.push(coloredLine);
			}
		}
},
});
