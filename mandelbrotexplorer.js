var STR_PAD_LEFT = 1;
var STR_PAD_RIGHT = 2;
var STR_PAD_BOTH = 3;

var mandelbrotExplorer = {
	// Mathematical properties
	"targetFrameRate": 60, // Target frame rate for animation loop
	"onlyShortened": true,
	"onlyFull": false,
	"startX": 				-2,
	"endX": 				2,
	"startY": 				2,
	"endY": 				-2,
	"maxIterations_2d": 	32,
	"maxIterations_3d": 	512,
	"zoomFactor": 			0.15,
	"xOffset": 				null,
	"yOffset": 				null,
	"canvas_2d": 			null,
	"xScale_2d": 			null,
	"yScale_2d": 			null,
	"canvas_3d": 			null,
	"xScale_3d": 			null,
	"yScale_3d": 			null,
	"scales_3d":			[],
	"randomizeCloudStepping": false,
	"cloudResolution":		"43,101",//774,
	"dualZ": true,
	"dualZMultiplier":      "newX = escapePath[pathIndex][0];\nnewY = escapePath[pathIndex][1];\nnewZ = z * -1;",
	"particleSize":         "mandelbrotExplorer.xScale_3d/mandelbrotExplorer.maxIterations_3d",
	"cloudLengthFilter":	"escapePath.length > 8",//"escapePath.length == mandelbrotExplorer.maxIterations_3d - 1",//"escapePath.length > 8",
	"cloudIterationFilter":	"iteration > 8",//"iteration > 8",//"iteration == mandelbrotExplorer.maxIterations_3d",//"iteration < 9",
	"particleSystems": 		[],//[iterationIndex][THREE.ParticleSystem]
	"lines": 		[],//[iterationIndex][THREE.]
	"iterationParticles": [],//[iterationIndex]{particles: THREE.Geometry}      
	"presets": mandelbrotExplorerPresets, // Reference to external presets
	"particleCoords":	[],//[iterationIndex][X1,Y1,Z1,X2,Y2,Y3,...]
	"particleLimit": 		100000000,
	"cycleTime": 			10,
	"continueColorCycle": 	false,
	"continueIterationCycle": false,
	"iterationCycleFrame":  10,
	"palette":				palettes.palette2,
	"threeRenderer": null, // Three.js renderer reference
	"particleFilter":		null,
	"initialZ":				"return [0,0];", 
	"escapingZ":			"return (\n"
							+ "mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]) - mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1])"
                            + "\n);",
	"nextCycleIteration":	1,
	"iterationCycleTime":	parseInt(1000/30),
	"juliaC":				  "[0,0]",
	"_cloudIterationCyclerId": null,
	
	/**
	 * Initialize the Mandelbrot explorer with Three.js renderer
	 */
	"init": function(canvas_3d, options) {
		this.canvas_3d = canvas_3d;
		this.threeRenderer = ThreeJSRenderer;
		this.threeRenderer.init(canvas_3d, {
			startX: this.startX,
			endX: this.endX,
			startY: this.startY,
			endY: this.endY,
			...options
		});
	},
	
	"drawMandelbrot": function(params) {
		this.assignParams( params );
		var canvasContext = this.canvas_2d.getContext("2d");
		var canvasImageData = canvasContext.getImageData(0, 0, this.canvas_2d.width, this.canvas_2d.height);
		this.xScale_2d = Math.abs( this.startX - this.endX ) / this.canvas_2d.width;
		this.yScale_2d = Math.abs( this.startY - this.endY ) / this.canvas_2d.height;
		this.xOffset = 0 - ( this.startX / this.xScale_2d );
		this.yOffset = this.startY / this.yScale_2d;
		// FIX THIS
		var repeatCheck = function(zValues, z, lastZ){
			var test = zValues.filter(function(testZ){
				return z[0] != testZ[0] && z[1] != testZ[1];
			});
			return zValues.length != test.length;
		};

		//var juliaC = eval(this.juliaC);
		for( var xValue = this.startX, imageX = 0; imageX < this.canvas_2d.width; xValue += this.xScale_2d, imageX++ ){
			for( var yValue = this.startY, imageY = 0; imageY < this.canvas_2d.height; yValue -= this.yScale_2d, imageY++ ){
				var c = [xValue, yValue];
				var juliaC = eval(this.juliaC);
				var color;
				if( this.getAbsoluteValueOfComplexNumber( juliaC ) != 0 ){
					color = this.getJuliaEscapePathLengthColor( juliaC, c, this.maxIterations_2d, null, true, repeatCheck );				
				}
				else{
					color = this.getJuliaEscapePathLengthColor( c, juliaC, this.maxIterations_2d, null, true, repeatCheck );				
				}
				this.setPixel( canvasImageData, imageX, imageY, color );
			}
		}
		canvasContext.putImageData(canvasImageData,0,0);
	},
	"clearMandelbrotCloud": function(){
		for( var index = this.particleSystems.length - 1; index >= 0; index-- ){
			if(!this.particleSystems[index]){continue;}
			this.threeRenderer.removeObject(this.particleSystems[index]);
			this.particleSystems[index] = null;
			delete this.particleSystems[index];
		}
		
		this.particleSystems = [];
	},
    "cloudMethods": {
        "functionsFromEval": {},
        "evalInitialZ": function(escapePath) {
            if( typeof mandelbrotExplorer.cloudMethods.functionsFromEval.initialZ === 'undefined' ) {
                if (mandelbrotExplorer.initialZ) {
                    eval("mandelbrotExplorer.cloudMethods.functionsFromEval.initialZ = function (escapePath){\n " + mandelbrotExplorer.initialZ + "\n}");
                } else {
                    mandelbrotExplorer.cloudMethods.functionsFromEval.initialZ = function(escapePath){
                        return 0;
                    };
                }
            }
            
            return mandelbrotExplorer.cloudMethods.functionsFromEval.initialZ(escapePath);
        },
        "processCloudLengthFilter": function(pathIndex, iteration, escapePath){
            if( typeof mandelbrotExplorer.cloudMethods.functionsFromEval.cloudLengthFilter === 'undefined' ) {
                if (mandelbrotExplorer.cloudLengthFilter) {
                    let functionDefinition = "function (pathIndex, iteration, escapePath){\nreturn " + mandelbrotExplorer.cloudLengthFilter + ";\n}";
                    eval('mandelbrotExplorer.cloudMethods.functionsFromEval.cloudLengthFilter = ' + functionDefinition + ';');
                } else {
                    mandelbrotExplorer.cloudMethods.functionsFromEval.cloudLengthFilter = function(){
                        return true;
                    };
                }
            }
            
            return mandelbrotExplorer.cloudMethods.functionsFromEval.cloudLengthFilter(pathIndex, iteration, escapePath);
        },
        "processCloudIterationFilter": function(pathIndex, iteration, escapePath) {
            if( typeof mandelbrotExplorer.cloudMethods.functionsFromEval.cloudIterationFilter === 'undefined' ) {
                if (mandelbrotExplorer.cloudIterationFilter) {
                    let functionDefinition = "function (pathIndex, iteration, escapePath){\nreturn " + mandelbrotExplorer.cloudIterationFilter + ";\n}";
                    eval('mandelbrotExplorer.cloudMethods.functionsFromEval.cloudIterationFilter = ' + functionDefinition + ';');
                } else {
                    mandelbrotExplorer.cloudMethods.functionsFromEval.cloudIterationFilter = function(){
                        return true;
                    };
                }
            }
            
            return mandelbrotExplorer.cloudMethods.functionsFromEval.cloudIterationFilter(pathIndex, iteration, escapePath);
        },
        "evalEscapingZ": function (pathIndex, iteration, escapePath) {
            if( typeof mandelbrotExplorer.cloudMethods.functionsFromEval.escapingZ === 'undefined' ) {
                if (mandelbrotExplorer.escapingZ) {
                    let functionDefinition = "function (pathIndex, iteration, escapePath){\n" 
                            + mandelbrotExplorer.escapingZ 
                        + ";\n}";
                    eval('mandelbrotExplorer.cloudMethods.functionsFromEval.escapingZ = ' + functionDefinition + ';');
                } else {
                    mandelbrotExplorer.cloudMethods.functionsFromEval.escapingZ = function(){
                        return 0;
                    };
                }
            }
            
            return mandelbrotExplorer.cloudMethods.functionsFromEval.escapingZ(pathIndex, iteration, escapePath);
        },
        "processParticleFilter": function (newX, newY, particleVector) {
            if( typeof mandelbrotExplorer.cloudMethods.functionsFromEval.particleFilter === 'undefined' ) {
                if (mandelbrotExplorer.particleFilter) {
                    let functionDefinition = "function (newX, newY, particleVector){\n" 
                            + "var allowed = " + mandelbrotExplorer.particleFilter + ";\n"
                            + "return {newX: newX, newY: newY, particleVector: particleVector, allowed: allowed};\n"
                        + "}";
                    eval('mandelbrotExplorer.cloudMethods.functionsFromEval.particleFilter = ' + functionDefinition + ';');
                } else {
                    let functionDefinition = "function (newX, newY, particleVector){\n" 
                            + "var allowed = true;\n"
                            + "return {newX: newX, newY: newY, particleVector: particleVector, allowed: allowed};\n"
                        + "}";
                    eval('mandelbrotExplorer.cloudMethods.functionsFromEval.particleFilter = ' + functionDefinition + ';');
                }
            }
            
            return mandelbrotExplorer.cloudMethods.functionsFromEval.particleFilter(newX, newY, particleVector);
        },
        "processDualZMultiplier": function(pathIndex, iteration, escapePath, newX, newY, z) {
			var newZ = z;
            var dualZMultiplier = eval(mandelbrotExplorer.dualZMultiplier);
            
            return [newX, newY, newZ];
        },
        "evalJuliaC": function(c) {
            return eval(mandelbrotExplorer.juliaC);
        },
        "handleCloudSteppingAdjustments": function(c){
            if(mandelbrotExplorer.randomizeCloudStepping){
                var getRandomArbitrary = function(min, max) {
                  return Math.random() * (max - min) + min;
                }
                
                c[0] = getRandomArbitrary(c[0] - mandelbrotExplorer.xScale_3d, c[0] + mandelbrotExplorer.xScale_3d);
                c[1] = getRandomArbitrary(c[1] - mandelbrotExplorer.yScale_3d, c[1] + mandelbrotExplorer.yScale_3d);
            }
            
            return c;
        },
        "getEscapePath": function(c) {
            var juliaC = mandelbrotExplorer.cloudMethods.evalJuliaC(c);
            var repeatCheck = function(zValues, z, lastZ){
                var test = zValues.filter(function(testZ){
                    return z[0] != testZ[0] && z[1] != testZ[1];
                });
                return zValues.length != test.length;
            };

            var escapePath;
            if( mandelbrotExplorer.getAbsoluteValueOfComplexNumber( juliaC ) != 0 ){
                escapePath = mandelbrotExplorer.getJuliaEscapePath( juliaC, c, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
            }
            else{
                escapePath = mandelbrotExplorer.getJuliaEscapePath( c, juliaC, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
            }
            
            return escapePath;
        },
        "discontinueIterationCycle": function() {
            var result = mandelbrotExplorer.continueIterationCycle;
            mandelbrotExplorer.continueIterationCycle = false;
            return result;
        },
        "startRenderer": function() {
            // This method is now handled by ThreeJSRenderer.init()
            // No longer needed as initialization is done in mandelbrotExplorer.init()
        },
        "startScene": function(){
            // This method is now handled by ThreeJSRenderer
            // No longer needed as scene management is done by ThreeJSRenderer
        },
        "startCamera": function() {
            // This method is now handled by ThreeJSRenderer
            // No longer needed as camera management is done by ThreeJSRenderer
        },
        "startTrackballControls": function() {
            // This method is now handled by ThreeJSRenderer
            // No longer needed as controls management is done by ThreeJSRenderer
        },
        "initialize3DScaling": function() {
			var cloudResolutions = [];
			if(mandelbrotExplorer.cloudResolution.toString().indexOf(",") !== -1){
				cloudResolutions = mandelbrotExplorer.cloudResolution.split(",");
			}
			else{
				cloudResolutions.push(mandelbrotExplorer.cloudResolution);
			}

			var minRes = Math.min.apply(null, cloudResolutions);
			var maxRes = Math.max.apply(null, cloudResolutions);
			
			mandelbrotExplorer.scales_3d = [];
			
			var sosRes = 0;
			cloudResolutions.forEach(
				function(useResolution) {
					sosRes += (useResolution * useResolution);
					mandelbrotExplorer.scales_3d.push({
						x: Math.abs( mandelbrotExplorer.startX - mandelbrotExplorer.endX ) / useResolution, 
						y: Math.abs( mandelbrotExplorer.startY - mandelbrotExplorer.endY ) / useResolution
					});
				}
			)
			
			if(sosRes == 0) {
				sosRes = 43;
			}

			// TODO: I want to allow for multiple scales in the same render...
            mandelbrotExplorer.xScale_3d = Math.abs( mandelbrotExplorer.startX - mandelbrotExplorer.endX ) / Math.sqrt(sosRes);
            mandelbrotExplorer.yScale_3d = Math.abs( mandelbrotExplorer.startY - mandelbrotExplorer.endY ) / Math.sqrt(sosRes);
			
        },
        "initializeMandelbrotCloud": function(){
            mandelbrotExplorer.clearMandelbrotCloud();
            mandelbrotExplorer.cloudMethods.initialize3DScaling();
            
            mandelbrotExplorer.iterationParticles = [];
            mandelbrotExplorer.particleSystems = [];
            mandelbrotExplorer.cloudMethods.functionsFromEval = {};
        },
		"initializeMandelbrotHair": function(){
            mandelbrotExplorer.cloudMethods.initialize3DScaling();
            
			mandelbrotExplorer.iterationParticles = [];
			mandelbrotExplorer.lines = [];
			mandelbrotExplorer.lineVectors = [];
			
            mandelbrotExplorer.cloudMethods.functionsFromEval = {};
		},
        "generateMandelbrotCloudParticles": function() {
            console.time("drawMandelbrotCloud: Generating particles");
            
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
                console.log('Cloud generation cancelled');
            });
            
            // Create a flat array of all points to process
            let allPoints = [];
            mandelbrotExplorer.scales_3d.forEach(function(useScales) {
                for (var x = mandelbrotExplorer.startX; x < mandelbrotExplorer.endX; x += useScales.x) {
                    for (var y = mandelbrotExplorer.startY; y > mandelbrotExplorer.endY; y -= useScales.y) {
                        allPoints.push({x: x, y: y, scale: useScales});
                    }
                }
            });
            
            let currentPointIndex = 0;
            const BATCH_SIZE = 50; // Process 50 points per batch


            
            function processBatch() {
                if (isCancelled) {
                    return;
                }
                
                const endIndex = Math.min(currentPointIndex + BATCH_SIZE, allPoints.length);
                
                for (let i = currentPointIndex; i < endIndex; i++) {
                    const point = allPoints[i];
                    var c = mandelbrotExplorer.cloudMethods.handleCloudSteppingAdjustments([point.x, point.y]);
                    var escapePath = mandelbrotExplorer.cloudMethods.getEscapePath(c);
                    
                    if (
                        (mandelbrotExplorer.onlyShortened && !escapePath.shortened) ||
                        (mandelbrotExplorer.onlyFull && escapePath.shortened)
                    ) {
                        processedPoints++;
                        continue;
                    }

                    var z = mandelbrotExplorer.cloudMethods.evalInitialZ(escapePath);
                    var accumulatedZ = 0;
                    var averageOfAccumulatedZ = 0;

                    escapePath.forEach(function(pathValue, pathIndex, source) {
                        accumulatedZ += mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
                        averageOfAccumulatedZ = accumulatedZ / (pathIndex + 1)
                        var iteration = pathIndex + 1;
                        if (
                            !mandelbrotExplorer.cloudMethods.processCloudLengthFilter(pathIndex, iteration, escapePath) ||
                            !mandelbrotExplorer.cloudMethods.processCloudIterationFilter(pathIndex, iteration, escapePath)
                        ) {
                            return true;
                        }

                        if (pathIndex != 0) {
                            z = mandelbrotExplorer.cloudMethods.evalEscapingZ(pathIndex, iteration, escapePath);
                        }
                        
                        var iterationIndex = parseInt(pathIndex);
                        
                        if (typeof mandelbrotExplorer.iterationParticles[iterationIndex] === "undefined") {
                            mandelbrotExplorer.iterationParticles[iterationIndex] = {"particles": []};
                        }
                        var newX = escapePath[pathIndex][0];
                        var newY = escapePath[pathIndex][1];
                        var particleVector = new THREE.Vector3(newX, newY, z);
                        var particleFilterResult = mandelbrotExplorer.cloudMethods.processParticleFilter(newX, newY, particleVector);
                        if (!particleFilterResult['allowed']) {
                            return true;
                        }
                        
                        mandelbrotExplorer.iterationParticles[iterationIndex].particles.push(particleFilterResult.particleVector);
                        
                        if (typeof mandelbrotExplorer.iterationParticles[iterationIndex].fpe === "undefined") {
                            mandelbrotExplorer.iterationParticles[iterationIndex].fpe = 0;
                        }
                        mandelbrotExplorer.iterationParticles[iterationIndex].fpe += pathValue.fpe;
                        
                        if (mandelbrotExplorer.dualZ) {
                            var newX = particleFilterResult.newX;
                            var newY = particleFilterResult.newY;
                            var coords = mandelbrotExplorer.cloudMethods.processDualZMultiplier(pathIndex, iteration, escapePath, newX, newY, z);
                            var particleVector = new THREE.Vector3(coords[0], coords[1], coords[2]);
                            
                            mandelbrotExplorer.iterationParticles[iterationIndex].particles.push(particleVector);
                        }
                    });
                    
                    processedPoints++;
                }
                
                currentPointIndex = endIndex;
                
                // Update progress
                const progress = Math.min(100, (processedPoints / totalPoints) * 100);
                const progressText = document.getElementById('progress-text');
                const progressBar = document.getElementById('progress-bar');
                if (progressText && progressBar) {
                    progressText.textContent = Math.round(progress) + '%';
                    progressBar.style.width = progress + '%';
                }
                
                // Continue processing or finish
                if (currentPointIndex < allPoints.length && !isCancelled) {
                    setTimeout(processBatch, 0);
                } else {
                    // Generation complete
                    progressDiv.remove();
                    console.timeEnd("drawMandelbrotCloud: Generating particles");
                    
                    if (!isCancelled) {
                        // Log total points generated
                        let totalPointsGenerated = 0;
                        for (let key in mandelbrotExplorer.iterationParticles) {
                            if (mandelbrotExplorer.iterationParticles[key] && 
                                mandelbrotExplorer.iterationParticles[key].particles) {
                                totalPointsGenerated += mandelbrotExplorer.iterationParticles[key].particles.length;
                            }
                        }
                        console.log('Total points generated:', totalPointsGenerated);
                        console.log('Total iterationParticles keys:', Object.keys(mandelbrotExplorer.iterationParticles).length);
                        
                        mandelbrotExplorer.cloudMethods.applyMandelbrotCloudPalette();
                        // Don't set iterationParticles to null here - let applyMandelbrotCloudPalette handle cleanup
                    }
                }
            }
            
            // Start processing
            processBatch();
        },
        "applyMandelbrotCloudPalette": function() {
            console.time("drawMandelbrotCloud: Applying palette");
            
            // Update progress text to show palette application
            const progressDiv = document.getElementById('cloud-generation-progress');
            if (progressDiv) {
                document.getElementById('progress-text').textContent = 'Applying palette...';
            }
            
            const indices = Object.keys(mandelbrotExplorer.iterationParticles);
            console.log('Processing indices:', indices.slice(0, 20), '... (total:', indices.length, ')');
            let currentIndex = 0;
            const BATCH_SIZE = 10; // Process 10 particle systems per batch
            
            function processPaletteBatch() {
                const endIndex = Math.min(currentIndex + BATCH_SIZE, indices.length);
                
                for (let i = currentIndex; i < endIndex; i++) {
                    const index = indices[i];
                    
                    // Get the particles data safely - copy it to avoid race conditions
                    const particlesData = mandelbrotExplorer.iterationParticles[index];
                    if (!particlesData) {
                        console.warn('Missing iterationParticles at index', index);
                        continue;
                    }
                    

                    
                    if (!particlesData.particles || 
                        !Array.isArray(particlesData.particles) ||
                        particlesData.particles.length === 0) {
                        console.warn('Empty or invalid particles array at index', index);
                        continue;
                    }
                    
                    // Copy the particles array to avoid race conditions
                    const particlesCopy = particlesData.particles.slice();
                    
                    // Additional safety check for the copy
                    if (!particlesCopy || !Array.isArray(particlesCopy)) {
                        console.warn('Failed to copy particles array at index', index);
                        continue;
                    }
                    
                    var color = mandelbrotExplorer.palette[ mandelbrotExplorer.getColorIndex(index) ];
                    var size = mandelbrotExplorer.particleSize ? eval(mandelbrotExplorer.particleSize): 0;
                    
                    var pMaterial = mandelbrotExplorer.threeRenderer.createParticleMaterial(color, size);
                    
                    // Convert array of vectors to geometry for rendering
                    var geometry = new THREE.Geometry();
                    
                    particlesCopy.forEach(function(vector) {
                        if (vector && vector.x !== undefined && vector.y !== undefined && vector.z !== undefined) {
                            geometry.vertices.push(vector);
                        }
                    });
                    
                    var points = mandelbrotExplorer.threeRenderer.addParticleSystem(
                        geometry,
                        pMaterial
                    );
                    
                    mandelbrotExplorer.particleSystems[index] = points;
                    mandelbrotExplorer.iterationParticles[index] = null;
                }
                
                currentIndex = endIndex;
                
                if (currentIndex < indices.length) {
                    setTimeout(processPaletteBatch, 0);
                } else {
                    console.timeEnd("drawMandelbrotCloud: Applying palette");
                    
                    // Clean up iterationParticles after palette application is complete
                    mandelbrotExplorer.iterationParticles = null;
                    
                    // Call completion handler if it exists
                    if (mandelbrotExplorer.cloudMethods.onCloudGenerationComplete) {
                        mandelbrotExplorer.cloudMethods.onCloudGenerationComplete();
                    }
                }
            }
            
            processPaletteBatch();
        },
		"generateMandelbrotHair": function () {
			console.time("drawMandelbrotsHair: Generating line vectors");
			mandelbrotExplorer.scales_3d.forEach(function(useScales){
				for( var x = mandelbrotExplorer.startX; x < mandelbrotExplorer.endX; x += useScales.x ) {
					for( var y = mandelbrotExplorer.startY; y > mandelbrotExplorer.endY; y -= useScales.y ) {
						var c = [x,y];
						var juliaC = mandelbrotExplorer.cloudMethods.evalJuliaC();
						if(mandelbrotExplorer.randomizeCloudStepping){
							var getRandomArbitrary = function(min, max) {
							  return Math.random() * (max - min) + min;
							}
							
							c[0] = getRandomArbitrary(x - mandelbrotExplorer.xScale_3d, x + mandelbrotExplorer.xScale_3d);
							c[1] = getRandomArbitrary(y - mandelbrotExplorer.xScale_3d, y + mandelbrotExplorer.xScale_3d);
						}
						var repeatCheck = function(zValues, z, lastZ){
							var test = zValues.filter(function(testZ){
								return z[0] != testZ[0] && z[1] != testZ[1];
							});
							return zValues.length != test.length;
						};
						var escapePath;
						if( mandelbrotExplorer.getAbsoluteValueOfComplexNumber( juliaC ) != 0 ){
							escapePath = mandelbrotExplorer.getJuliaEscapePath( juliaC, c, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
						}
						else{
							escapePath = mandelbrotExplorer.getJuliaEscapePath( c, juliaC, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
						}
						if((mandelbrotExplorer.onlyShortened && !escapePath.shortened) ||
						   (mandelbrotExplorer.onlyFull && escapePath.shortened)){continue;}

						var z = mandelbrotExplorer.cloudMethods.evalInitialZ(escapePath);
						var accumulatedZ = 0;
						var averageOfAccumulatedZ = 0;
						
						var lineVectors = [];
						escapePath.forEach(function(pathValue, pathIndex, source){
							var iteration = pathIndex + 1;
							
							if( mandelbrotExplorer.cloudLengthFilter.length > 0 && eval( mandelbrotExplorer.cloudLengthFilter ) == false ) return true;
							if( mandelbrotExplorer.cloudIterationFilter.length > 0 && eval( mandelbrotExplorer.cloudIterationFilter ) == false ) return true;
							var direction = [1,1];
							if(pathIndex > 0){
								direction[0] = escapePath[pathIndex][0] > escapePath[pathIndex-1][0] ? -1 : 1;
								direction[1] = escapePath[pathIndex][1] > escapePath[pathIndex-1][1] ? -1 : 1;
							}
							// this isn't right.... zDirection...
							var zDirection = direction[0] * direction[1];
							
							if( pathIndex != 0 ) {
								z = mandelbrotExplorer.cloudMethods.evalEscapingZ(pathIndex, iteration, escapePath);// eval( mandelbrotExplorer.escapingZ );
							}
							
							var iterationIndex = parseInt(pathIndex);
							
							if( typeof mandelbrotExplorer.iterationParticles[iterationIndex] === "undefined" ) {
								mandelbrotExplorer.iterationParticles[iterationIndex] = {"particles": new THREE.Geometry()};
							}
							var newX = escapePath[pathIndex][0];
							var newY = escapePath[pathIndex][1];
							var particleVector = new THREE.Vector3(newX, newY, z);
							if(mandelbrotExplorer.particleFilter){
								var allowed = eval( mandelbrotExplorer.particleFilter );
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
			console.timeEnd("drawMandelbrotsHair: Generating line vectors");
			for(var lineIndex in mandelbrotExplorer.lineVectors){
				var currentLine = mandelbrotExplorer.lineVectors[lineIndex];
				
				var color = mandelbrotExplorer.palette[ mandelbrotExplorer.getColorIndex(lineIndex) ];

				var geometry = new THREE.Geometry();
				var curve = new THREE.CatmullRomCurve3(currentLine, false, 'chordal' );
				geometry.vertices = curve.getPoints(50);
				
				//gradientline.js
				var steps = 0.2;
				var phase = 1.5;
				//Create the final object to add to the scene
				var coloredLine = getColoredBufferLine_2( steps, phase, geometry, color );
				var coloredLine = getColoredBufferLine_3(geometry, mandelbrotExplorer.palette );
				
				mandelbrotExplorer.threeRenderer.scene.add(coloredLine);
				mandelbrotExplorer.lines.push(coloredLine);
			}
		}
    },
	"drawMandelbrotCloud": function( params ) {
		console.time("drawMandelbrotCloud");
		mandelbrotExplorer.assignParams( params );
        
        mandelbrotExplorer.cloudMethods.initializeMandelbrotCloud();
        
		var resumeIterationCycle = mandelbrotExplorer.cloudMethods.discontinueIterationCycle();
        
        // Start async particle generation
        mandelbrotExplorer.cloudMethods.generateMandelbrotCloudParticles();
        
        // Set up a completion handler that will be called when generation finishes
        mandelbrotExplorer.cloudMethods.onCloudGenerationComplete = function() {
            mandelbrotExplorer.displayCloudParticles();
            mandelbrotExplorer.continueIterationCycle = resumeIterationCycle;
            console.timeEnd("drawMandelbrotCloud");
        };
	},
	"clearMandelbrotsHair": function(){
		for( var index = this.lines.length - 1; index >= 0; index-- ){
			if(!this.lines[index]){continue;}
			this.threeRenderer.removeObject(this.lines[index]);
			this.lines[index] = null;
			delete this.lines[index];
		}
		
		this.lines = [];
	},
	"drawMandelbrotsHair": function( params ) {
		console.time("drawMandelbrotsHair");
		mandelbrotExplorer.assignParams( params );
        
        mandelbrotExplorer.cloudMethods.initializeMandelbrotHair();
        var resumeIterationCycle = mandelbrotExplorer.cloudMethods.discontinueIterationCycle();
		
		mandelbrotExplorer.cloudMethods.generateMandelbrotHair();

		console.timeEnd("drawMandelbrotsHair");
	},
	"displayCloudParticles": function() {
		mandelbrotExplorer.particleCount = 0;
		
		for( var index = this.particleSystems.length - 1; index >= 0; index-- ){
			if(!this.particleSystems[index]){
				console.warn('Missing particleSystem at index', index);
				continue;
			}
			var iteration = index + 1;
			this.threeRenderer.removeObject(this.particleSystems[index]);

			if( mandelbrotExplorer.particleCount + this.particleSystems[index].geometry.vertices.length <= this.particleLimit ){
				mandelbrotExplorer.particleCount += this.particleSystems[index].geometry.vertices.length;
				this.threeRenderer.scene.add(this.particleSystems[index]);
			}
		}
	},
	"getMandelbrotEscapePathLengthColor": function(c, maxIterations, palette){
		if( typeof( palette ) == "undefined" || !palette ){
			palette = this.palette;
		}
		var escapePath = this.getMandelbrotEscapePath(c, maxIterations);
		var index = escapePath.length % palette.length;
		
		return palette[ index ];
	},
	"getJuliaEscapePathLengthColor": function(c, z, maxIterations, palette, bailOnRepeat, repeatCheck){
		if( typeof( palette ) == "undefined" || !palette ){
			palette = this.palette;
		}
		var escapePath = this.getJuliaEscapePath(c, z, maxIterations, bailOnRepeat, repeatCheck);
		var index = escapePath.length % palette.length;

		return palette[ index ];	
	},
	"assignParams": function(params) {
		for( var property in params ){
			this[ property ] = params[ property ];
		}
	},
	"setPixel": function( imageData, x, y, c ){
		var i = ((y * imageData.width) + x) * 4;
		if( i + 3 < (imageData.width * imageData.height * 4) ){
			imageData.data[i]=c.R;
			imageData.data[i+1]=c.G;
			imageData.data[i+2]=c.B;
			imageData.data[i+3]=c.A;
		}
	},
	"cycle2dColors": function(){
		var startTime = new Date();
		
		var canvasContext = this.canvas_2d.getContext("2d");
		var canvasImageData = canvasContext.getImageData(0, 0, this.canvas_2d.width, this.canvas_2d.height);

		var index, currentColor, currentColorIndex, nextColorIndex, nextColor
		for( var pixel = 0; pixel < ( canvasImageData.height * canvasImageData.width ); pixel++ ){
			index = pixel * 4;
			currentColor = {
				"R": canvasImageData.data[ index ],
				"G": canvasImageData.data[ index + 1 ],
				"B": canvasImageData.data[ index + 2 ],
				"A": canvasImageData.data[ index + 3 ]
			};
			
			currentColorIndex =  palettes.getColorIndex(this.palette, currentColor);// this.palette.indexOf( currentColor );
			nextColorIndex = currentColorIndex + 1;
			while( nextColorIndex >= this.palette.length ){
				nextColorIndex -= this.palette.length;
			}
			nextColor = this.palette[nextColorIndex];
			
			canvasImageData.data[ index ] = nextColor.R;
			canvasImageData.data[ index + 1 ] = nextColor.G;
			canvasImageData.data[ index + 2 ] = nextColor.B;
			canvasImageData.data[ index + 3 ] = nextColor.A;
		}

		canvasContext.putImageData(canvasImageData,0,0);
		
		this.cycleTime = (new Date()) - startTime;
		if( this.continueColorCycle ){
			setTimeout( function(){mandelbrotExplorer.cycle2dColors();}, this.iterationCycleTime )
		}
	},
	"cycleCloudColors": function(){
		var startTime = new Date();
		var index, currentColor, currentColorIndex, nextColorIndex, nextColor
				
		for( var index = 0; index < this.particleSystems.length; index++ )
		{
			if(!this.particleSystems[index] || !this.particleSystems[index].material){ continue; };
			var materialColor = this.particleSystems[index].material.color;
			
			currentColor = {
				"R": materialColor.r * 255,
				"G": materialColor.g * 255,
				"B": materialColor.b * 255,
				"A": 255
			};
			
			currentColorIndex =  palettes.getColorIndex(this.palette, currentColor);// this.palette.indexOf( currentColor );
			nextColorIndex = currentColorIndex + 1;
			while( nextColorIndex >= this.palette.length )
			{
				nextColorIndex -= this.palette.length;
			}
			nextColor = this.palette[nextColorIndex];
			
			this.particleSystems[index].material.color.setHex(parseInt( "0x" + this.padString( nextColor.R.toString(16), 2, "0", STR_PAD_LEFT )
									  + this.padString( nextColor.G.toString(16), 2, "0", STR_PAD_LEFT )
									  + this.padString( nextColor.B.toString(16), 2, "0", STR_PAD_LEFT )
								, 16));
		}
		
		this.cycleTime = (new Date()) - startTime;
		if( this.continueColorCycle )
		{
			setTimeout( function(){mandelbrotExplorer.cycleCloudColors();}, this.iterationCycleTime )
		}
	},
	"cycleCloudIterations": function() {
		var particleCount = 0;
		var foundNext = false;
		var particleSystemsLength = this.particleSystems.length;
		var cycleDirection = 1;
		while( particleSystemsLength > 0 && foundNext == false ){
			for( var index = 0; index < particleSystemsLength; index++ ){
				this.threeRenderer.removeObject( this.particleSystems[index] );
				var iteration = index + 1;
				if( this.cloudIterationFilter.length > 0 && eval( this.cloudIterationFilter ) == false ) continue;
				
				if( this.particleSystems[index] && 
					iteration >= this.nextCycleIteration - (this.iterationCycleFrame/2) && 
					iteration <= this.nextCycleIteration + (this.iterationCycleFrame/2) 
				){
					foundNext = true;
					particleCount += this.particleSystems[index].geometry.vertices.length;
					this.threeRenderer.scene.add( this.particleSystems[index] );
				}
			}
			this.nextCycleIteration += cycleDirection;
			
			if(this.nextCycleIteration > this.particleSystems.length || this.nextCycleIteration < 0){
				cycleDirection *= -1;
			}
			
			while( this.nextCycleIteration > this.particleSystems.length )
			{
				this.nextCycleIteration -= this.particleSystems.length;
			}
		}
		
		if( this.continueIterationCycle ){
			this._cloudIterationCyclerId = setTimeout( function(){mandelbrotExplorer.cycleCloudIterations();}, this.iterationCycleTime )
		}
		
	},
	"setPalette": function( newPalette ) {
		var canvasContext = this.canvas_2d.getContext("2d");
		var canvasImageData = canvasContext.getImageData(0, 0, this.canvas_2d.width, this.canvas_2d.height);

		var index, currentColor, currentColorIndex, nextColorIndex, nextColor
		for( var pixel = 0; pixel < ( canvasImageData.height * canvasImageData.width ); pixel++ )
		{
			index = pixel * 4;
			currentColor = {
				"R": canvasImageData.data[ index ],
				"G": canvasImageData.data[ index + 1 ],
				"B": canvasImageData.data[ index + 2 ],
				"A": canvasImageData.data[ index + 3 ]
			};
			
			currentColorIndex =  palettes.getColorIndex(this.palette, currentColor);// this.palette.indexOf( currentColor );
			nextColorIndex = currentColorIndex + 1;
			while( nextColorIndex >= newPalette.length )
			{
				nextColorIndex -= newPalette.length;
			}
			nextColor = newPalette[nextColorIndex];
			
			canvasImageData.data[ index ] = nextColor.R;
			canvasImageData.data[ index + 1 ] = nextColor.G;
			canvasImageData.data[ index + 2 ] = nextColor.B;
			canvasImageData.data[ index + 3 ] = nextColor.A;
		}

		canvasContext.putImageData(canvasImageData,0,0);
		
		for( var index = 0; index < this.particleSystems.length; index++ ){
			if(!this.particleSystems[index]){continue;}
			var materialColor = this.particleSystems[index].material.color;
			
			currentColor = {
				"R": materialColor.r * 255,
				"G": materialColor.g * 255,
				"B": materialColor.b * 255,
				"A": this.particleSystems[index].material.opacity * 255
			};
			
			currentColorIndex =  palettes.getColorIndex(this.palette, currentColor);
			nextColorIndex = currentColorIndex + 1;
			while( nextColorIndex >= newPalette.length ){
				nextColorIndex -= newPalette.length;
			}
			nextColor = newPalette[nextColorIndex];
			
			this.particleSystems[index].material.color.setHex(parseInt( "0x" + this.padString( nextColor.R.toString(16), 2, "0", STR_PAD_LEFT )
									  + this.padString( nextColor.G.toString(16), 2, "0", STR_PAD_LEFT )
									  + this.padString( nextColor.B.toString(16), 2, "0", STR_PAD_LEFT )
								, 16));
		}
		
		this.palette = newPalette;
	},
	"getPixel": function(imageData,x,y){
		var i = ((y * imageData.width) + x) * 4;
		if( i + 3 < imageData.width * imageData.height ){
			return {R:imageData.data[i],
				  G:imageData.data[i+1],
				  B:imageData.data[i+2],
				  A:imageData.data[i+3]}
		}

		return false;
	},
	"getMandelbrotEscapePath": function( c, maxIterations, bailOnRepeat ){
		if(typeof(bailOnRepeat) == "undefined"){
			bailOnRepeat = true;
		}
		
		return this.getJuliaEscapePath( c, [0,0], maxIterations, bailOnRepeat );
	},
	"getJuliaEscapePath": function( c, z, maxIterations, bailOnRepeat, repeatCheck ){
		if(typeof(bailOnRepeat) === "undefined"){
			bailOnRepeat = true;
		}
		
		if(typeof(repeatCheck) === "undefined"){
			repeatCheck = function(zValues, z, lastZ){
				return z[0] == lastZ[0] && z[1] == lastZ[1];
			};
		}
		
		var iterations = 0;
		var zValues = Array();
		if( this.getAbsoluteValueOfComplexNumber(z) != 0 ){
			zValues.push(z);
		}
		
		var lastZ = [null, null];
		var limit = 2;
		while( this.getAbsoluteValueOfComplexNumber(z) < limit && iterations < maxIterations ){
			iterations++;
			var zX = Math.pow(z[0], 2) - Math.pow(z[1], 2) + c[0];
			var zY = (2*z[0]*z[1]) + c[1];
			z = [zX, zY];

			
			z.fpe = Math.abs((z[0] - Math.sqrt(Math.pow(z[0], 2))) + (z[1] - Math.sqrt(Math.pow(z[1], 2))));
			
			zValues.push(z);
			
			lastZ = z;
		}

		var fullLength = zValues.length;
		zValues = zValues.filter(function(teztZ, testZIndex, testZValues){
			for ( var zi = 0; zi < testZIndex; zi++ ){
				if(teztZ[0] == testZValues[zi][0] && teztZ[1] == testZValues[zi][1]){
					return false;
				}
			}
			return true;
		});
		zValues.shortened = (fullLength > zValues.length) ? true : false;
		return zValues;
	},
    "getColorIndex": function(index) {
        var colorIndex = index;
        while( colorIndex >= mandelbrotExplorer.palette.length  ) {
            colorIndex -= mandelbrotExplorer.palette.length;
        }
        return colorIndex;
    },
	"getJuliaEscapePath_orig": function( c, z, maxIterations, bailOnRepeat, repeatCheck ){
		if(typeof(bailOnRepeat) === "undefined"){
			bailOnRepeat = true;
		}
		
		if(typeof(repeatCheck) === "undefined"){
			repeatCheck = function(zValues, z, lastZ){
				return z[0] == lastZ[0] && z[1] == lastZ[1];
			};
		}
		
		var iterations = 0;
		var zValues = Array();
		if( this.getAbsoluteValueOfComplexNumber(z) != 0 ){
			zValues.push(z);
		}
		
		var lastZ = [null, null];
		var limit = 2;
		while( this.getAbsoluteValueOfComplexNumber(z) < limit && iterations < maxIterations ){
			iterations++;
			var zX = Math.pow(z[0], 2) - Math.pow(z[1], 2) + c[0];
			var zY = (2*z[0]*z[1]) + c[1];
			z = [zX, zY];

			/* This isn't right, but it is fun, do something about finding repeating patterns */
			if(bailOnRepeat && repeatCheck(zValues, z, lastZ)){
				iterations = maxIterations;
			}
			else{
				zValues.push(z);
			}
			
			lastZ = z;
		}
		
		return zValues;
	},
	"runJuliaCalc": function( c, z, maxIterations, verbose ){
		if(verbose){console.time("runJuliaCalc");}

		var iterations = 0;
		while( this.getAbsoluteValueOfComplexNumber(z) < 2 && iterations < maxIterations ){
			iterations++;
			var zX = Math.pow(z[0], 2) - Math.pow(z[1], 2) + c[0];
			var zY = (2*z[0]*z[1]) + c[1];
			z = [zX, zY];
		}
		
		if(verbose){console.timeEnd("runJuliaCalc");}
	},
	"getAbsoluteValueOfComplexNumber": function( c ){
		return Math.sqrt( Math.abs( Math.pow(c[0], 2) + Math.pow(c[1],2) ) );
	},
	"padString": function (str, len, pad, dir) {
		if (typeof(len) == "undefined") { var len = 0; }
		if (typeof(pad) == "undefined") { var pad = ' '; }
		if (typeof(dir) == "undefined") { var dir = STR_PAD_RIGHT; }

		if (len + 1 >= str.length) {
			switch (dir){
				case STR_PAD_LEFT:
					str = Array(len + 1 - str.length).join(pad) + str;
					break;

				case STR_PAD_BOTH:
					var right = Math.ceil((padlen = len - str.length) / 2);
					var left = padlen - right;
					str = Array(left+1).join(pad) + str + Array(right+1).join(pad);
					break;

				default:
					str = str + Array(len + 1 - str.length).join(pad);
					break;
			}

		}
		
		return str;
	},
	
	// Settings persistence wrapper methods
	"saveSettings": function() {
		SettingsManager.saveSettings(this);
	},
	
	"loadSettings": function() {
		return SettingsManager.loadSettings(this);
	},
	
	"clearSettings": function() {
		SettingsManager.clearSettings();
	}
}
