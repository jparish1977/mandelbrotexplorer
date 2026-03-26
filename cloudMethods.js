/* global mandelbrotExplorer, debugLog */
/* global BYTES_PER_ESCAPE_PATH, BYTES_PER_MB */
/* global MIN_CACHE_SIZE_MB, MAX_CACHE_SIZE_MB, CACHE_SIZE_MULTIPLIER */
/* global MIN_CACHE_ENTRIES, MAX_CACHE_ENTRIES, CACHE_BUDGET_MB */
/* global DEFAULT_SOS_RES, TIMEOUT_SHORT, TIMEOUT_MEDIUM, COLOR_CHANNEL_MAX */

// Cloud methods: eval wrappers, scene setup, and cache management
// Extracted from cloudGeneration.js for maintainability

Object.assign(mandelbrotExplorer, {
"cloudMethods": {
    "functionsFromEval": {},
    "evalInitialZ"(escapePath) {
        if( typeof mandelbrotExplorer.cloudMethods.functionsFromEval.initialZ === 'undefined' ) {
            if (mandelbrotExplorer.initialZ) {
                 
                 
                // eslint-disable-next-line no-eval -- user-defined expression
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
                // eslint-disable-next-line no-eval -- user-defined expression
                eval(`mandelbrotExplorer.cloudMethods.functionsFromEval.particleFilter = ${  functionDefinition  };`);
            } else {
                let functionDefinition = "function (newX, newY, particleVector){\n" 
                        + "var allowed = true;\n"
                        + "return {newX: newX, newY: newY, particleVector: particleVector, allowed: allowed};\n"
                    + "}";
                 
                 
                // eslint-disable-next-line no-eval -- user-defined expression
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
        // eslint-disable-next-line no-eval -- user-defined expression
        let dualZMultiplier = eval(mandelbrotExplorer.dualZMultiplier);
        
        return [newX, newY, newZ];
    },
    "evalJuliaC"(c) {
         
         
        // eslint-disable-next-line no-eval -- user-defined expression
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
			mandelbrotExplorer.clearMandelbrotHair();

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
}
});
