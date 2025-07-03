var STR_PAD_LEFT = 1;
var STR_PAD_RIGHT = 2;
var STR_PAD_BOTH = 3;

var mandelbrotExplorer = {
	"useRenderer": THREE.WebGLRenderer,
	"rendererOptions": {
		alpha: true, 
		precision: "mediump", 
		antialias: false,
		preserveDrawingBuffer: true 
	},
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
	"renderer": 			null,
	"scene": 				null,
	"camera": 				null,
	"controls": 			null,
	"palette":				palettes.palette2,
	"particleFilter":		null,
	"initialZ":				"return [0,0];", 
	"escapingZ":			"return (\n"
							+ "mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]) - mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1])"
                            + "\n);",
	"nextCycleIteration":	1,
	"iterationCycleTime":	parseInt(1000/30),
	"juliaC":				  "[0,0]",
	"_cloudIterationCyclerId": null,
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
			this.scene.remove(this.particleSystems[index]);
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
            
            
/*
            var allowed = true
            
            if (mandelbrotExplorer.particleFilter) {
                allowed = eval( mandelbrotExplorer.particleFilter );
            }
            
            
            return {
                newX: newX,
                newY: newY,
                particleVector: particleVector,
                allowed: allowed
            };
*/
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
            if( mandelbrotExplorer.renderer == null )	{
                mandelbrotExplorer.renderer = new mandelbrotExplorer.useRenderer(
					{
						canvas: mandelbrotExplorer.canvas_3d,  
						alpha: mandelbrotExplorer.rendererOptions.alpha, 
						precision: mandelbrotExplorer.rendererOptions.precision, 
						antialias: mandelbrotExplorer.rendererOptions.antialias,
						preserveDrawingBuffer: mandelbrotExplorer.rendererOptions.preserveDrawingBuffer
					}
				);
//               mandelbrotExplorer.renderer.xr.enabled  = true;
 
                mandelbrotExplorer.renderer.setClearColor( 0x000001, 0 );	
            }
            
            mandelbrotExplorer.cloudMethods.startScene();
            mandelbrotExplorer.cloudMethods.startCamera();
            mandelbrotExplorer.cloudMethods.startTrackballControls();
        },
        "startScene": function(){
            if( mandelbrotExplorer.scene == null ) {
                mandelbrotExplorer.scene = new THREE.Scene();
            }
            else {
                mandelbrotExplorer.clearMandelbrotCloud();
				mandelbrotExplorer.clearMandelbrotsHair();
            }
        },
        "startCamera": function() {
            if(mandelbrotExplorer.camera == null){
                mandelbrotExplorer.camera = new THREE.PerspectiveCamera( 
                    45, 
                    Math.abs(mandelbrotExplorer.startX - mandelbrotExplorer.endX) / Math.abs(mandelbrotExplorer.startY - mandelbrotExplorer.endY),
                    .1,
                    1000
                );
                mandelbrotExplorer.camera.position.z = 5;
            }
        },
        "startTrackballControls": function() {
            if(mandelbrotExplorer.controls == null){
                mandelbrotExplorer.controls = new THREE.TrackballControls( mandelbrotExplorer.camera, mandelbrotExplorer.renderer.domElement );
            }
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
            mandelbrotExplorer.cloudMethods.startRenderer();
            mandelbrotExplorer.cloudMethods.initialize3DScaling();
            
            
            mandelbrotExplorer.iterationParticles = [];
            mandelbrotExplorer.particleSystems = [];
            mandelbrotExplorer.cloudMethods.functionsFromEval = {};
        },
		"initializeMandelbrotHair": function(){
			mandelbrotExplorer.cloudMethods.startRenderer();
            mandelbrotExplorer.cloudMethods.initialize3DScaling();
            
            
			mandelbrotExplorer.iterationParticles = [];
			mandelbrotExplorer.lines = [];
			mandelbrotExplorer.lineVectors = [];
			
            mandelbrotExplorer.cloudMethods.functionsFromEval = {};
		},
        "generateMandelbrotCloudParticles": function() {
            console.time("drawMandelbrotCloud: Generating particles");
			
			mandelbrotExplorer.scales_3d.forEach(function(useScales){
			
				for( var x = mandelbrotExplorer.startX; x < mandelbrotExplorer.endX; x += (useScales.x) ) {
					for( var y = mandelbrotExplorer.startY; y > mandelbrotExplorer.endY; y -= (useScales.y) ) {
						var c = mandelbrotExplorer.cloudMethods.handleCloudSteppingAdjustments([x,y]);
						
						var escapePath = mandelbrotExplorer.cloudMethods.getEscapePath(c);

						if(
							(mandelbrotExplorer.onlyShortened && !escapePath.shortened) ||
							(mandelbrotExplorer.onlyFull && escapePath.shortened)
						){
							continue;
						}

						var z = mandelbrotExplorer.cloudMethods.evalInitialZ(escapePath);
						var accumulatedZ = 0;
						var averageOfAccumulatedZ = 0;

						escapePath.forEach(function(pathValue, pathIndex, source){
							accumulatedZ += mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]);
							averageOfAccumulatedZ = accumulatedZ / (pathIndex + 1)
							var iteration = pathIndex + 1;
							if (
								!mandelbrotExplorer.cloudMethods.processCloudLengthFilter(pathIndex, iteration, escapePath) ||
								!mandelbrotExplorer.cloudMethods.processCloudIterationFilter(pathIndex, iteration, escapePath)
							){
								return true;
							}

							if( pathIndex != 0 ) {
								// FIX THE FUCK OUT OF THIS!
								z = mandelbrotExplorer.cloudMethods.evalEscapingZ(pathIndex, iteration, escapePath);// eval( mandelbrotExplorer.escapingZ );
							}
							
							var iterationIndex = parseInt(pathIndex);
							
							if( typeof mandelbrotExplorer.iterationParticles[iterationIndex] === "undefined" ) {
								mandelbrotExplorer.iterationParticles[iterationIndex] = {"particles": new THREE.Geometry()};
							}
							var newX = escapePath[pathIndex][0];
							var newY = escapePath[pathIndex][1];
							var particleVector = new THREE.Vector3(newX, newY, z);
							var particleFilterResult = mandelbrotExplorer.cloudMethods.processParticleFilter(newX, newY, particleVector);
							if (!particleFilterResult['allowed']) {
								return true;
							}
							
							mandelbrotExplorer.iterationParticles[iterationIndex].particles.vertices.push(particleFilterResult.particleVector);
							
							// Why was I trying to catch the floating point error?
							if(typeof mandelbrotExplorer.iterationParticles[iterationIndex].fpe === "undefined"){
								mandelbrotExplorer.iterationParticles[iterationIndex].fpe = 0;
							}
							mandelbrotExplorer.iterationParticles[iterationIndex].fpe += pathValue.fpe;
							
							
							if(mandelbrotExplorer.dualZ){
								var newX = particleFilterResult.newX;
								var newY = particleFilterResult.newY;
								var coords = mandelbrotExplorer.cloudMethods.processDualZMultiplier(pathIndex, iteration, escapePath, newX, newY, z);
								var particleVector = new THREE.Vector3(coords[0], coords[1], coords[2]);
								
								mandelbrotExplorer.iterationParticles[iterationIndex].particles.vertices.push(particleVector);
							}
						});
					}
				}
			});
            console.timeEnd("drawMandelbrotCloud: Generating particles");
            
            mandelbrotExplorer.cloudMethods.applyMandelbrotCloudPalette();
            
            mandelbrotExplorer.iterationParticles = null;
        },
        "applyMandelbrotCloudPalette": function() {
            console.time("drawMandelbrotCloud: Applying palette");
            for( var index in mandelbrotExplorer.iterationParticles ) {
                var color = mandelbrotExplorer.palette[ mandelbrotExplorer.getColorIndex(index) ];
                
                var size = mandelbrotExplorer.particleSize ? eval(mandelbrotExplorer.particleSize): 0;//mandelbrotExplorer.xScale_3dmandelbrotExplorer.xScale_3d >= 0.1 ? 0 : mandelbrotExplorer.xScale_3d/2;//mandelbrotExplorer.iterationParticles[index].fpe / mandelbrotExplorer.xScale_3d;
                //var pMaterial = new THREE.ParticleBasicMaterial({
                var pMaterial = new THREE.PointsMaterial({
                    color: new THREE.Color( color.R / 255, color.G / 255, color.B / 255 ),
                    size: size,//0,
                    transparent: false,
                    opacity: color.A/255
                });
                
                //mandelbrotExplorer.particleSystems[index] = new THREE.ParticleSystem(
                mandelbrotExplorer.particleSystems[index] = new THREE.Points(
                    mandelbrotExplorer.iterationParticles[parseInt(index)].particles,
                    pMaterial);
                
                mandelbrotExplorer.iterationParticles[parseInt(index)] = null;
            }
            console.timeEnd("drawMandelbrotCloud: Applying palette");
        },
		"generateMandelbrotHair": function () {
			
			
			// FUCKING FIX THIS
			//var juliaC = mandelbrotExplorer.cloudMethods.evalJuliaC();
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
						//var escapePath = mandelbrotExplorer.getMandelbrotEscapePath( c, mandelbrotExplorer.maxIterations_3d );
						var escapePath;
						if( mandelbrotExplorer.getAbsoluteValueOfComplexNumber( juliaC ) != 0 ){
							escapePath = mandelbrotExplorer.getJuliaEscapePath( juliaC, c, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
						}
						else{
							escapePath = mandelbrotExplorer.getJuliaEscapePath( c, juliaC, mandelbrotExplorer.maxIterations_3d, true, repeatCheck );				
						}
						if((mandelbrotExplorer.onlyShortened && !escapePath.shortened) ||
						   (mandelbrotExplorer.onlyFull && escapePath.shortened)){continue;}
						// FIX THIS STUPID SHIT
						var z = mandelbrotExplorer.cloudMethods.evalInitialZ(escapePath);
						var accumulatedZ = 0;
						var averageOfAccumulatedZ = 0;
						
						var lineVectors = [];
						escapePath.forEach(function(pathValue, pathIndex, source){
							var iteration = pathIndex + 1;
							
							// COME THE FUCK ON, FIX THIS SHIT!
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
								// FIX THE FUCK OUT OF THIS!
								//z = eval( mandelbrotExplorer.escapingZ );
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
								// FIX THE FUCK OUT OF THIS!
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
				
				mandelbrotExplorer.scene.add(coloredLine);
				mandelbrotExplorer.lines.push(coloredLine);
			}
			//console.timeEnd("drawMandelbrotsHair");
		}
    },
	"drawMandelbrotCloud": function( params ) {
		console.time("drawMandelbrotCloud");
		mandelbrotExplorer.assignParams( params );
        
        mandelbrotExplorer.cloudMethods.initializeMandelbrotCloud();
        
		var resumeIterationCycle = mandelbrotExplorer.cloudMethods.discontinueIterationCycle();
        
        mandelbrotExplorer.cloudMethods.generateMandelbrotCloudParticles();
		
		mandelbrotExplorer.displayCloudParticles();
		mandelbrotExplorer.continueIterationCycle = resumeIterationCycle;
		console.timeEnd("drawMandelbrotCloud");
	},
	"clearMandelbrotsHair": function(){
		for( var index = this.lines.length - 1; index >= 0; index-- ){
			if(!this.lines[index]){continue;}
			this.scene.remove(this.lines[index]);
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
		
		if( mandelbrotExplorer.renderer == null )	{
			mandelbrotExplorer.renderer = new mandelbrotExplorer.useRenderer(
				{
					canvas: mandelbrotExplorer.canvas_3d,  
					alpha: mandelbrotExplorer.rendererOptions.alpha, 
					precision: mandelbrotExplorer.rendererOptions.precision, 
					antialias: mandelbrotExplorer.rendererOptions.antialias,
					preserveDrawingBuffer: mandelbrotExplorer.rendererOptions.preserveDrawingBuffer
				}
			);
			mandelbrotExplorer.renderer.setClearColor( 0x000001, 0 );	
		}
		
		if( mandelbrotExplorer.scene == null ) {
			mandelbrotExplorer.scene = new THREE.Scene();
		}
		else {
			mandelbrotExplorer.clearMandelbrotsHair();
		}
		
		if(mandelbrotExplorer.camera == null){
			mandelbrotExplorer.camera = new THREE.PerspectiveCamera( 45, Math.abs(mandelbrotExplorer.startX - mandelbrotExplorer.endX) / Math.abs(mandelbrotExplorer.startY - mandelbrotExplorer.endY), .1, 1000 );
			mandelbrotExplorer.camera.position.z = 5;
		}
		
		if(mandelbrotExplorer.controls == null){
			mandelbrotExplorer.controls = new THREE.TrackballControls( mandelbrotExplorer.camera, mandelbrotExplorer.renderer.domElement );
		}
		
		
		mandelbrotExplorer.xScale_3d = Math.abs( mandelbrotExplorer.startX - mandelbrotExplorer.endX ) / mandelbrotExplorer.cloudResolution;
		mandelbrotExplorer.yScale_3d = Math.abs( mandelbrotExplorer.startY - mandelbrotExplorer.endY ) / mandelbrotExplorer.cloudResolution;
		
		mandelbrotExplorer.iterationParticles = [];
		//mandelbrotExplorer.particleSystems = [];
		mandelbrotExplorer.lines = [];
		mandelbrotExplorer.lineVectors = [];
		
		mandelbrotExplorer.cloudMethods.generateMandelbrotHair();

		console.timeEnd("drawMandelbrotsHair");
	},
	"displayCloudParticles": function() {
		mandelbrotExplorer.particleCount = 0;
		//var vertexCounts = [];
		
		for( var index = this.particleSystems.length - 1; index >= 0; index-- ){
			if(!this.particleSystems[index]){continue;}
			var iteration = index + 1;
			this.scene.remove(this.particleSystems[index]);

			if( mandelbrotExplorer.particleCount + this.particleSystems[index].geometry.vertices.length <= this.particleLimit ){
				mandelbrotExplorer.particleCount += this.particleSystems[index].geometry.vertices.length;
				this.scene.add(this.particleSystems[index]);
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
//		if(escapePath.shortened == 0){
//			return {"B": 255, "R": 255, "G":  255, "A":0}
//		}
//		else{
			return palette[ index ];
//		}
		
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
				this.scene.remove( this.particleSystems[index] );
				var iteration = index + 1;
				// FUCKING FIX IT
				if( this.cloudIterationFilter.length > 0 && eval( this.cloudIterationFilter ) == false ) continue;
				
				if( this.particleSystems[index] && 
					iteration >= this.nextCycleIteration - (this.iterationCycleFrame/2) && 
					iteration <= this.nextCycleIteration + (this.iterationCycleFrame/2) 
				  ){
					foundNext = true;
					particleCount += this.particleSystems[index].geometry.vertices.length;
					this.scene.add( this.particleSystems[index] );
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
		})
		zValues.shortened = fullLength - zValues.length;
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
	
	// LocalStorage settings persistence
	"saveSettings": function() {
		try {
			var settings = {
				startX: this.startX,
				startY: this.startY,
				endX: this.endX,
				endY: this.endY,
				maxIterations_2d: this.maxIterations_2d,
				maxIterations_3d: this.maxIterations_3d,
				cloudResolution: this.cloudResolution,
				randomizeCloudStepping: this.randomizeCloudStepping,
				dualZ: this.dualZ,
				dualZMultiplier: this.dualZMultiplier,
				particleSize: this.particleSize,
				particleFilter: this.particleFilter,
				cloudLengthFilter: this.cloudLengthFilter,
				cloudIterationFilter: this.cloudIterationFilter,
				juliaC: this.juliaC,
				initialZ: this.initialZ,
				escapingZ: this.escapingZ,
				iterationCycleTime: this.iterationCycleTime,
				iterationCycleFrame: this.iterationCycleFrame,
				targetFrameRate: this.targetFrameRate,
				onlyShortened: this.onlyShortened,
				onlyFull: this.onlyFull,
				selectedPalette: this.palette ? this.palette.name || 'palette2' : 'palette2'
			};
			
			localStorage.setItem('mandelbrotExplorer_settings', JSON.stringify(settings));
			console.log('Settings saved to localStorage');
		} catch (e) {
			console.error('Failed to save settings:', e);
		}
	},
	
	"loadSettings": function() {
		try {
			var savedSettings = localStorage.getItem('mandelbrotExplorer_settings');
			if (savedSettings) {
				var settings = JSON.parse(savedSettings);
				
				// Apply saved settings
				for (var key in settings) {
					if (this.hasOwnProperty(key) && settings[key] !== null && settings[key] !== undefined) {
						this[key] = settings[key];
					}
				}
				
				// Handle palette separately since it's an object
				if (settings.selectedPalette && palettes[settings.selectedPalette]) {
					this.palette = palettes[settings.selectedPalette];
				}
				
				console.log('Settings loaded from localStorage');
				return true;
			}
		} catch (e) {
			console.error('Failed to load settings:', e);
		}
		return false;
	},
	
	"clearSettings": function() {
		try {
			localStorage.removeItem('mandelbrotExplorer_settings');
			console.log('Settings cleared from localStorage');
		} catch (e) {
			console.error('Failed to clear settings:', e);
		}
	}
}
