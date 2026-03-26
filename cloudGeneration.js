/* global mandelbrotExplorer, THREE, palettes, debugLog, perfTime, perfTimeEnd */
/* global RGBA_COMPONENTS, GPU_BATCH_SIZE, CPU_BATCH_SIZE, PROGRESS_LOG_INTERVAL */
/* global PROGRESS_PERCENT, CURVE_POINTS, COLOR_CHANNEL_MAX, TIMEOUT_SHORT */
/* global HEX_BASE, STR_PAD_LEFT, getColoredBufferLine_2, getColoredBufferLine_3 */

// Cloud particle generation and hair rendering
// Extends mandelbrotExplorer.cloudMethods (defined in cloudMethods.js)

Object.assign(mandelbrotExplorer.cloudMethods, {

    /**
     * Shared escape path processing logic used by both Cloud and Hair generators.
     * Iterates through an escape path, applies filters, computes positions,
     * and calls callbacks for each accepted particle.
     *
     * @param {Array} escapePath - The escape path array
     * @param {Object} callbacks - { onParticle, onDualZParticle, onPathComplete }
     */
    "processEscapePathShared"(escapePath, callbacks) {
        if (
            (mandelbrotExplorer.onlyShortened && !escapePath.shortened) ||
            (mandelbrotExplorer.onlyFull && escapePath.shortened)
        ) {
            return;
        }

        // If looping, create a proxy that wraps index access for eval compatibility
        const pathLength = mandelbrotExplorer.getEscapePathLength(escapePath, mandelbrotExplorer.maxIterations_3d);
        const loopedPath = (mandelbrotExplorer.loopRepeaters && escapePath.loopStart !== -1 && escapePath.period > 0)
            ? new Proxy(escapePath, {
                get(target, prop) {
                    const idx = parseInt(prop);
                    if (!isNaN(idx) && idx >= target.length) {
                        return target[target.loopStart + ((idx - target.loopStart) % target.period)];
                    }
                    return target[prop];
                }
            })
            : escapePath;

        let z = mandelbrotExplorer.cloudMethods.evalInitialZ(loopedPath);
        let accumulatedZ = 0;
        const collectedVectors = [];

        for (let pathIndex = 0; pathIndex < pathLength; pathIndex++) {
            const pathValue = loopedPath[pathIndex];
            if (!pathValue) break;

            accumulatedZ += mandelbrotExplorer.getAbsoluteValueOfComplexNumber(pathValue);
            const iteration = pathIndex + 1;

            if (
                !mandelbrotExplorer.cloudMethods.processCloudLengthFilter(pathIndex, iteration, loopedPath) ||
                !mandelbrotExplorer.cloudMethods.processCloudIterationFilter(pathIndex, iteration, loopedPath)
            ) {
                continue;
            }

            if (pathIndex !== 0) {
                z = mandelbrotExplorer.cloudMethods.evalEscapingZ(pathIndex, iteration, loopedPath);
            }

            const iterationIndex = parseInt(pathIndex);
            const newX = pathValue[0];
            const newY = pathValue[1];
            const particleVector = new THREE.Vector3(newX, newY, z);
            const particleFilterResult = mandelbrotExplorer.cloudMethods.processParticleFilter(newX, newY, particleVector);

            if (!particleFilterResult.allowed) {
                continue;
            }

            collectedVectors.push(particleFilterResult.particleVector);

            if (callbacks.onParticle) {
                callbacks.onParticle(iterationIndex, particleFilterResult, pathValue, loopedPath, pathIndex);
            }

            if (mandelbrotExplorer.dualZ && callbacks.onDualZParticle) {
                const coords = mandelbrotExplorer.cloudMethods.processDualZMultiplier(
                    pathIndex, iteration, loopedPath,
                    particleFilterResult.newX, particleFilterResult.newY, z
                );
                const dualVector = new THREE.Vector3(coords[0], coords[1], coords[2]);
                callbacks.onDualZParticle(iterationIndex, dualVector, loopedPath, pathIndex);
            }
        }

        if (callbacks.onPathComplete) {
            callbacks.onPathComplete(escapePath, collectedVectors);
        }
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

                // Delegate to shared processor with cloud-specific callbacks
                mandelbrotExplorer.cloudMethods.processEscapePathShared(escapePath, {
                    onParticle(iterationIndex, particleFilterResult, pathValue) {
                        if (typeof mandelbrotExplorer.iterationParticles[iterationIndex] === "undefined") {
                            mandelbrotExplorer.iterationParticles[iterationIndex] = {"particles": []};
                        }
                        mandelbrotExplorer.iterationParticles[iterationIndex].particles.push(particleFilterResult.particleVector);

                        if (typeof mandelbrotExplorer.iterationParticles[iterationIndex].fpe === "undefined") {
                            mandelbrotExplorer.iterationParticles[iterationIndex].fpe = 0;
                        }
                        mandelbrotExplorer.iterationParticles[iterationIndex].fpe += pathValue.fpe;
                    },
                    onDualZParticle(iterationIndex, dualVector) {
                        mandelbrotExplorer.iterationParticles[iterationIndex].particles.push(dualVector);
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
						const c = mandelbrotExplorer.cloudMethods.handleCloudSteppingAdjustments([x, y]);
						const escapePath = mandelbrotExplorer.cloudMethods.getEscapePath(c);
						const lineVectors = [];

						mandelbrotExplorer.cloudMethods.processEscapePathShared(escapePath, {
							onParticle(iterationIndex, particleFilterResult) {
								if (typeof mandelbrotExplorer.iterationParticles[iterationIndex] === "undefined") {
									mandelbrotExplorer.iterationParticles[iterationIndex] = {"particles": []};
								}
								mandelbrotExplorer.iterationParticles[iterationIndex].particles.push(
									particleFilterResult.particleVector
								);
								lineVectors.push(particleFilterResult.particleVector);
							},
							onDualZParticle(iterationIndex, dualVector) {
								mandelbrotExplorer.iterationParticles[iterationIndex].particles.push(dualVector);
								lineVectors.push(dualVector);
							}
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
				geometry.vertices = curve.getPoints(mandelbrotExplorer.curvePoints || CURVE_POINTS);
				
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
});
