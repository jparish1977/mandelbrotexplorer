// mandelbrotexplorer.js
// Mandelbrot Explorer - GPU-accelerated fractal visualization

/* global THREE, ShaderLoader, ThreeJSRenderer, SettingsManager */
/* global palettes, mandelbrotExplorerPresets, DEBUG_CONFIG */
/* global getColoredBufferLine_2, getColoredBufferLine_3, showCacheStatus */

// Debug configuration - control console logging levels
window.DEBUG_CONFIG = {
    // Set to false to disable all debug logging
    enabled: false,
    
    // Individual log categories
    gpu: false,           // GPU initialization and processing logs
    cache: false,         // Cache status and operations
    generation: false,    // Cloud generation progress
    particles: false,     // Particle system creation
    escapePaths: false,   // Escape path processing details
    performance: true,    // Performance timing (keep this for useful info)
    errors: true,         // Error messages (keep this for debugging)
    warnings: true        // Warning messages (keep this for debugging)
};

// Debug logging utility
function debugLog(category, ...args) {
    if (DEBUG_CONFIG.enabled && DEBUG_CONFIG[category]) {
        console.log(...args);
    }
}

// Performance logging utility (always enabled when debug is on)
function perfLog(...args) {
    if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.performance) {
        console.log(...args);
    }
}

// Performance timing utility
const perfTimers = {};
function perfTime(label) {
    if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.performance) {
        perfTimers[label] = performance.now();
    }
}

function perfTimeEnd(label) {
    if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.performance && perfTimers[label]) {
        const duration = performance.now() - perfTimers[label];
        console.log(`${label}: ${duration.toFixed(2)} ms`);
        delete perfTimers[label];
    }
}

// Error logging utility (always enabled)
function errorLog(...args) {
    if (DEBUG_CONFIG.errors) {
        console.error(...args);
    }
}

// Warning logging utility (always enabled)
function warningLog(...args) {
    if (DEBUG_CONFIG.warnings) {
        console.warn(...args);
    }
}

// ── Constants ────────────────────────────────────────────────────────────────
const STR_PAD_LEFT = 1;
const STR_PAD_RIGHT = 2;
const STR_PAD_BOTH = 3;

// WebGL / GPU
const GL_QUAD_VERTICES = 4;              // vertices in a triangle strip quad
const RGBA_COMPONENTS = 4;               // floats per pixel in RGBA
const RGB_COMPONENTS = 3;                // components per vertex color

// Fractal math
const ESCAPE_RADIUS = 2.0;              // |z| threshold for escape detection
const SHADER_MAX_LOOP = 1000;           // max loop iterations in GLSL (hard limit)
const DEFAULT_MAX_ITERATIONS = 1024;     // default iteration cap for calculations

// Color
const COLOR_CHANNEL_MAX = 255;           // 8-bit color channel max
const HEX_BASE = 16;                    // base for hex string conversion
const HEX_PAD_LENGTH = 2;               // pad hex strings to 2 chars

// Cache management
const BYTES_PER_ESCAPE_PATH = 16;       // approximate bytes per cached escape path entry
const BYTES_PER_MB = 1024 * 1024;       // bytes in a megabyte
const MIN_CACHE_SIZE_MB = 500;          // minimum escape path cache size
const MAX_CACHE_SIZE_MB = 9000;         // maximum escape path cache size
const CACHE_SIZE_MULTIPLIER = 1.5;      // headroom multiplier for estimated cache
const MIN_CACHE_ENTRIES = 3;            // minimum number of cache entries
const MAX_CACHE_ENTRIES = 5;            // maximum number of cache entries
const CACHE_BUDGET_MB = 1000;           // budget per entry for calculating max entries

// Cloud generation
const GPU_BATCH_SIZE = 1000;            // points per batch in GPU mode
const CPU_BATCH_SIZE = 50;              // points per batch in CPU mode
const PROGRESS_LOG_INTERVAL = 1000;     // log every N points during generation
const PROGRESS_PERCENT = 100;           // percentage scale factor

// Rendering
const CURVE_POINTS = 50;                // points per CatmullRom curve
const TIMEOUT_SHORT = 100;              // short setTimeout delay (ms)
const TIMEOUT_MEDIUM = 500;             // medium setTimeout delay (ms)
const ITERATION_CYCLE_FPS = 30;         // frames per second for iteration cycling
const DEFAULT_SOS_RES = 43;             // default SOS resolution

const mandelbrotExplorer = {
	// Mathematical properties
	"targetFrameRate": 60, // Target frame rate for animation loop
	"onlyShortened": true,
	"onlyFull": false,
	"loopRepeaters": false,
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
	"cloudLengthFilter":	"escapePath.length > 8",//"escapePath.length === mandelbrotExplorer.maxIterations_3d - 1",//"escapePath.length > 8",
	"cloudIterationFilter":	"iteration > 8",//"iteration > 8",//"iteration === mandelbrotExplorer.maxIterations_3d",//"iteration < 9",
	"particleSystems": 		[],//[iterationIndex][THREE.ParticleSystem]
	"lines": 		[],//[iterationIndex][THREE.]
	"iterationParticles": [],//[iterationIndex]{particles: THREE.Geometry}      
	"presets": mandelbrotExplorerPresets, // Reference to external presets
	"particleCoords":	[],//[iterationIndex][X1,Y1,Z1,X2,Y2,Y3,...]
	// Captures stored in IndexedDB via CaptureDB (see ui.js)
	"particleLimit": 		100000000,
	"cycleTime": 			10,
	"continueColorCycle": 	false,
	"continueIterationCycle": false,
	"iterationCycleFrame":  10,
	"curvePoints":          50,
	"palette":				palettes.palette2,
	"threeRenderer": null, // Three.js renderer reference
	"particleFilter":		null,
	"initialZ":				"return [0,0];", 
	"escapingZ":			"return (\n"
							+ "mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex]) - mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex-1])"
                            + "\n);",
	"nextCycleIteration":	1,
	"iterationCycleTime":	parseInt(SHADER_MAX_LOOP / ITERATION_CYCLE_FPS),
	"juliaC":				  "[0,0]",
	"_cloudIterationCyclerId": null,
	"useGPU": true, // GPU acceleration toggle
	"gpuContext": null, // WebGL context for GPU computation
	"gpuProgram": null, // GPU shader program
	"gpuBuffers": {}, // GPU buffers for data transfer
	
	/**
	 * Initialize the Mandelbrot explorer with Three.js renderer
	 */
	"init"(canvas_3d, options) {
		this.canvas_3d = canvas_3d;
		this.threeRenderer = ThreeJSRenderer;
		this.threeRenderer.init(canvas_3d, {
			startX: this.startX,
			endX: this.endX,
			startY: this.startY,
			endY: this.endY,
			...options
		});
		
		// Initialize GPU context if GPU is enabled
		if (this.useGPU) {
			this.initGPU();
		}
	},
	
	"drawMandelbrot"(params) {
		this.assignParams( params );
		const canvasContext = this.canvas_2d.getContext("2d", { willReadFrequently: true });
		const canvasImageData = canvasContext.getImageData(0, 0, this.canvas_2d.width, this.canvas_2d.height);
		this.xScale_2d = Math.abs( this.startX - this.endX ) / this.canvas_2d.width;
		this.yScale_2d = Math.abs( this.startY - this.endY ) / this.canvas_2d.height;
		this.xOffset = 0 - ( this.startX / this.xScale_2d );
		this.yOffset = this.startY / this.yScale_2d;
		// FIX THIS
		const repeatCheck = function(zValues, z, lastZ){
			const test = zValues.filter(function(testZ){
				return z[0] !== testZ[0] && z[1] !== testZ[1];
			});
			return zValues.length !== test.length;
		};

		//var juliaC = eval(this.juliaC);
		for( let xValue = this.startX, imageX = 0; imageX < this.canvas_2d.width; xValue += this.xScale_2d, imageX++ ){
			for( let yValue = this.startY, imageY = 0; imageY < this.canvas_2d.height; yValue -= this.yScale_2d, imageY++ ){
				let c = [xValue, yValue];
				 
				 
				// eslint-disable-next-line no-eval -- user-defined expression
				// eslint-disable-next-line no-eval -- user-defined expression
				let juliaC = eval(this.juliaC);
				let color;
				if( this.getAbsoluteValueOfComplexNumber( juliaC ) !== 0 ){
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
	"clearMandelbrotCloud"(){
		for( let index = mandelbrotExplorer.particleSystems.length - 1; index >= 0; index-- ){
			if(!mandelbrotExplorer.particleSystems[index]){continue;}
			mandelbrotExplorer.threeRenderer.removeObject(mandelbrotExplorer.particleSystems[index]);
			mandelbrotExplorer.particleSystems[index] = null;
			delete mandelbrotExplorer.particleSystems[index];
		}

		mandelbrotExplorer.particleSystems = [];
	},
	"clearMandelbrotHair"(){
		for( let index = mandelbrotExplorer.lines.length - 1; index >= 0; index-- ){
			if(!mandelbrotExplorer.lines[index]){continue;}
			mandelbrotExplorer.threeRenderer.removeObject(mandelbrotExplorer.lines[index]);
			mandelbrotExplorer.lines[index] = null;
			delete mandelbrotExplorer.lines[index];
		}
		mandelbrotExplorer.lines = [];
		mandelbrotExplorer.lineVectors = [];
	},
	
	"drawMandelbrotCloud"( params ) {
		perfTime("drawMandelbrotCloud");
		mandelbrotExplorer.assignParams( params );
        
        mandelbrotExplorer.cloudMethods.initializeMandelbrotCloud();
        
		const resumeIterationCycle = mandelbrotExplorer.cloudMethods.discontinueIterationCycle();
        
        // Start async particle generation
        mandelbrotExplorer.cloudMethods.generateMandelbrotCloudParticles();
        
        // Set up a completion handler that will be called when generation finishes
        mandelbrotExplorer.cloudMethods.onCloudGenerationComplete = function() {
            mandelbrotExplorer.displayCloudParticles();
            mandelbrotExplorer.continueIterationCycle = resumeIterationCycle;
            
            // Update cache status after generation
            setTimeout(showCacheStatus, TIMEOUT_SHORT);
            
            		perfTimeEnd("drawMandelbrotCloud");
        };
	},
	"clearMandelbrotsHair"(){
		for( let index = this.lines.length - 1; index >= 0; index-- ){
			if(!this.lines[index]){continue;}
			this.threeRenderer.removeObject(this.lines[index]);
			this.lines[index] = null;
			delete this.lines[index];
		}
		
		this.lines = [];
	},
	"drawMandelbrotsHair"( params ) {
		perfTime("drawMandelbrotsHair");
		mandelbrotExplorer.assignParams( params );
        
        mandelbrotExplorer.cloudMethods.initializeMandelbrotHair();
        const resumeIterationCycle = mandelbrotExplorer.cloudMethods.discontinueIterationCycle();
		
		mandelbrotExplorer.cloudMethods.generateMandelbrotHair();

		perfTimeEnd("drawMandelbrotsHair");
	},
	"displayCloudParticles"() {
		mandelbrotExplorer.particleCount = 0;
		
		// Only iterate over particle systems that actually exist
		for( const index in this.particleSystems ){
			if(!this.particleSystems[index]){
				continue;
			}
			const iteration = parseInt(index) + 1;
			this.threeRenderer.removeObject(this.particleSystems[index]);

			if( mandelbrotExplorer.particleCount + this.particleSystems[index].geometry.vertices.length <= this.particleLimit ){
				mandelbrotExplorer.particleCount += this.particleSystems[index].geometry.vertices.length;
				this.threeRenderer.scene.add(this.particleSystems[index]);
			}
		}
	},
	"getMandelbrotEscapePathLengthColor"(c, maxIterations, palette){
		if( typeof( palette ) === "undefined" || !palette ){
			palette = this.palette;
		}
		const escapePath = this.getMandelbrotEscapePath(c, maxIterations);
		const index = escapePath.length % palette.length;
		
		return palette[ index ];
	},
	"getJuliaEscapePathLengthColor"(c, z, maxIterations, palette, bailOnRepeat, repeatCheck){
		if( typeof( palette ) === "undefined" || !palette ){
			palette = this.palette;
		}
		const escapePath = this.getJuliaEscapePath(c, z, maxIterations, bailOnRepeat, repeatCheck);
		const index = escapePath.length % palette.length;

		return palette[ index ];	
	},
	"assignParams"(params) {
		for( const property in params ){
			this[ property ] = params[ property ];
		}
	},
	"setPixel"( imageData, x, y, c ){
		const i = ((y * imageData.width) + x) * RGBA_COMPONENTS;
		if( i + 3 < (imageData.width * imageData.height * RGBA_COMPONENTS) ){
			imageData.data[i]=c.R;
			imageData.data[i+1]=c.G;
			imageData.data[i+2]=c.B;
			imageData.data[i+3]=c.A;
		}
	},
	"cycle2dColors"(){
		const startTime = new Date();
		
		const canvasContext = this.canvas_2d.getContext("2d", { willReadFrequently: true });
		const canvasImageData = canvasContext.getImageData(0, 0, this.canvas_2d.width, this.canvas_2d.height);

		let index, currentColor, currentColorIndex, nextColorIndex, nextColor;
		for( let pixel = 0; pixel < ( canvasImageData.height * canvasImageData.width ); pixel++ ){
			index = pixel * RGBA_COMPONENTS;
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
	"cycleCloudColors"(){
        const startTime = new Date();
        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
        var index;
        let currentColor;
        let currentColorIndex;
        let nextColorIndex;
        let nextColor;

         
         
        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
        for( var index in this.particleSystems )
		{
			if(!this.particleSystems[index] || !this.particleSystems[index].material){ continue; };
			const materialColor = this.particleSystems[index].material.color;
			
			currentColor = {
				"R": materialColor.r * COLOR_CHANNEL_MAX,
				"G": materialColor.g * COLOR_CHANNEL_MAX,
				"B": materialColor.b * COLOR_CHANNEL_MAX,
				"A": 255
			};
			
			currentColorIndex =  palettes.getColorIndex(this.palette, currentColor);// this.palette.indexOf( currentColor );
			nextColorIndex = currentColorIndex + 1;
			while( nextColorIndex >= this.palette.length )
			{
				nextColorIndex -= this.palette.length;
			}
			nextColor = this.palette[nextColorIndex];
			
			this.particleSystems[index].material.color.setHex(parseInt( `0x${  this.padString( nextColor.R.toString(HEX_BASE), 2, "0", STR_PAD_LEFT )
									   }${this.padString( nextColor.G.toString(HEX_BASE), 2, "0", STR_PAD_LEFT )
									   }${this.padString( nextColor.B.toString(HEX_BASE), 2, "0", STR_PAD_LEFT )}`
								, 16));
		}

        // Also cycle colors on hair lines
        for( const lineIndex in this.lines ) {
            if(!this.lines[lineIndex] || !this.lines[lineIndex].material){ continue; }
            const lineMaterial = this.lines[lineIndex].material;
            if (!lineMaterial.color) { continue; }
            const lineColor = {
                "R": lineMaterial.color.r * COLOR_CHANNEL_MAX,
                "G": lineMaterial.color.g * COLOR_CHANNEL_MAX,
                "B": lineMaterial.color.b * COLOR_CHANNEL_MAX,
                "A": 255
            };
            const lineColorIndex = palettes.getColorIndex(this.palette, lineColor);
            let nextLineColorIndex = lineColorIndex + 1;
            while( nextLineColorIndex >= this.palette.length ) {
                nextLineColorIndex -= this.palette.length;
            }
            const nextLineColor = this.palette[nextLineColorIndex];
            lineMaterial.color.setHex(parseInt( `0x${  this.padString( nextLineColor.R.toString(HEX_BASE), 2, "0", STR_PAD_LEFT )
                }${this.padString( nextLineColor.G.toString(HEX_BASE), 2, "0", STR_PAD_LEFT )
                }${this.padString( nextLineColor.B.toString(HEX_BASE), 2, "0", STR_PAD_LEFT )}`
            , 16));
        }

        this.cycleTime = (new Date()) - startTime;
        if( this.continueColorCycle )
		{
			setTimeout( function(){mandelbrotExplorer.cycleCloudColors();}, this.iterationCycleTime )
		}
    },
	"cycleCloudIterations"() {
		let particleCount = 0;
		let foundNext = false;
		const particleSystemsLength = Object.keys(this.particleSystems).length;
		let cycleDirection = 1;
		while( particleSystemsLength > 0 && foundNext === false ){
			for( const index in this.particleSystems ){
				this.threeRenderer.removeObject( this.particleSystems[index] );
				let iteration = parseInt(index) + 1;
				 
				 
				// eslint-disable-next-line no-eval -- user-defined expression
				// eslint-disable-next-line no-eval -- user-defined expression
				if( this.cloudIterationFilter.length > 0 && eval( this.cloudIterationFilter ) === false ) continue;
				
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
			
			if(this.nextCycleIteration > particleSystemsLength || this.nextCycleIteration < 0){
				cycleDirection *= -1;
			}
			
			while( this.nextCycleIteration > particleSystemsLength )
			{
				this.nextCycleIteration -= particleSystemsLength;
			}
		}
		
		// Grow hair lines to current iteration — use drawRange to truncate
		if(this.lines.length > 0) {
			let maxLineLength = 0;
			for( const lineIndex in this.lineVectors ) {
				if(this.lineVectors[lineIndex] && this.lineVectors[lineIndex].length > maxLineLength) {
					maxLineLength = this.lineVectors[lineIndex].length;
				}
			}

			// If no particle systems, advance nextCycleIteration for hair
			if(particleSystemsLength === 0 && maxLineLength > 0) {
				this.nextCycleIteration++;
				if(this.nextCycleIteration > maxLineLength) {
					this.nextCycleIteration = 1;
				}
			}

			for( const lineIndex in this.lines ) {
				if(!this.lines[lineIndex] || !this.lines[lineIndex].geometry){ continue; }
				const geo = this.lines[lineIndex].geometry;
				const totalVerts = geo.attributes.position ? geo.attributes.position.count : 0;
				if(totalVerts === 0){ continue; }

				// 0 = grow from root, >0 = sliding window
				const pathLen = this.lineVectors[lineIndex] ? this.lineVectors[lineIndex].length : 1;
				let startVert = 0;
				let drawCount;

				if(this.iterationCycleFrame <= 0) {
					// Grow from root
					const fraction = Math.min(this.nextCycleIteration / pathLen, 1);
					drawCount = Math.max(2, Math.floor(fraction * totalVerts));
				} else {
					// Sliding window
					const halfFrame = this.iterationCycleFrame / 2;
					const startIter = Math.max(0, this.nextCycleIteration - halfFrame);
					const endIter = Math.min(pathLen, this.nextCycleIteration + halfFrame);
					startVert = Math.floor((startIter / pathLen) * totalVerts);
					const endVert = Math.floor((endIter / pathLen) * totalVerts);
					drawCount = Math.max(2, endVert - startVert);
				}

				geo.setDrawRange(startVert, drawCount);

				if(!this.lines[lineIndex].parent){
					this.threeRenderer.scene.add( this.lines[lineIndex] );
				}
			}
		}

		if( this.continueIterationCycle ){
			this._cloudIterationCyclerId = setTimeout( function(){mandelbrotExplorer.cycleCloudIterations();}, this.iterationCycleTime )
		}
		
	},
	"setPalette"( newPalette ) {
        const canvasContext = this.canvas_2d.getContext("2d", { willReadFrequently: true });
        const canvasImageData = canvasContext.getImageData(0, 0, this.canvas_2d.width, this.canvas_2d.height);

        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
        var index;
        let currentColor;
        let currentColorIndex;
        let nextColorIndex;
        let nextColor;
        for( let pixel = 0; pixel < ( canvasImageData.height * canvasImageData.width ); pixel++ )
		{
			index = pixel * RGBA_COMPONENTS;
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

         
         
        // eslint-disable-next-line no-redeclare -- var re-declaration in shared scope
        for( var index in this.particleSystems ){
			if(!this.particleSystems[index]){continue;}
			const materialColor = this.particleSystems[index].material.color;
			
			currentColor = {
				"R": materialColor.r * COLOR_CHANNEL_MAX,
				"G": materialColor.g * COLOR_CHANNEL_MAX,
				"B": materialColor.b * COLOR_CHANNEL_MAX,
				"A": this.particleSystems[index].material.opacity * COLOR_CHANNEL_MAX
			};
			
			currentColorIndex =  palettes.getColorIndex(this.palette, currentColor);
			nextColorIndex = currentColorIndex + 1;
			while( nextColorIndex >= newPalette.length ){
				nextColorIndex -= newPalette.length;
			}
			nextColor = newPalette[nextColorIndex];
			
			this.particleSystems[index].material.color.setHex(parseInt( `0x${  this.padString( nextColor.R.toString(HEX_BASE), 2, "0", STR_PAD_LEFT )
									   }${this.padString( nextColor.G.toString(HEX_BASE), 2, "0", STR_PAD_LEFT )
									   }${this.padString( nextColor.B.toString(HEX_BASE), 2, "0", STR_PAD_LEFT )}`
								, 16));
		}

        this.palette = newPalette;
    },
	"getPixel"(imageData,x,y){
		const i = ((y * imageData.width) + x) * RGBA_COMPONENTS;
		if( i + 3 < imageData.width * imageData.height ){
			return {R:imageData.data[i],
				  G:imageData.data[i+1],
				  B:imageData.data[i+2],
				  A:imageData.data[i+3]}
		}

		return false;
	},
	"getMandelbrotEscapePath"( c, maxIterations, bailOnRepeat ){
		if(typeof(bailOnRepeat) === "undefined"){
			bailOnRepeat = true;
		}
		
		return this.getJuliaEscapePath( c, [0,0], maxIterations, bailOnRepeat );
	},
	"getJuliaEscapePath"( c, z, maxIterations, bailOnRepeat, repeatCheck ){
		if(typeof(bailOnRepeat) === "undefined"){
			bailOnRepeat = true;
		}
		
		if(typeof(repeatCheck) === "undefined"){
			repeatCheck = function(zValues, z, lastZ){
				return z[0] === lastZ[0] && z[1] === lastZ[1];
			};
		}
		
		let iterations = 0;
		let zValues = Array();
		if( this.getAbsoluteValueOfComplexNumber(z) !== 0 ){
			zValues.push(z);
		}
		
		let lastZ = [null, null];
		const limit = 2;
		while( this.getAbsoluteValueOfComplexNumber(z) < limit && iterations < maxIterations ){
			iterations++;
			const zX = Math.pow(z[0], 2) - Math.pow(z[1], 2) + c[0];
			const zY = (2*z[0]*z[1]) + c[1];
			z = [zX, zY];

			
			z.fpe = Math.abs((z[0] - Math.sqrt(Math.pow(z[0], 2))) + (z[1] - Math.sqrt(Math.pow(z[1], 2))));
			
			zValues.push(z);
			
			lastZ = z;
		}

		// Detect repeating orbit: find first duplicate z value
		let loopStart = -1;
		let period = 0;
		for (let i = 1; i < zValues.length && loopStart === -1; i++) {
			for (let j = 0; j < i; j++) {
				if (zValues[i][0] === zValues[j][0] && zValues[i][1] === zValues[j][1]) {
					loopStart = j;
					period = i - j;
					break;
				}
			}
		}

		zValues.shortened = loopStart !== -1;
		zValues.loopStart = loopStart;
		zValues.period = period;
		zValues.fullLength = zValues.length;

		// If looping enabled and we found a repeat, keep only up to the first repeat
		// The accessor getLoopedPoint handles virtual extension
		if (loopStart !== -1) {
			zValues.length = loopStart + period;
		}

		return zValues;
	},
    "getEscapePathPoint"(escapePath, index) {
        if (index < escapePath.length) return escapePath[index];
        if (!mandelbrotExplorer.loopRepeaters || escapePath.loopStart === -1 || escapePath.period === 0) return null;
        return escapePath[escapePath.loopStart + ((index - escapePath.loopStart) % escapePath.period)];
    },
    "getEscapePathLength"(escapePath, maxIterations) {
        if (!mandelbrotExplorer.loopRepeaters || escapePath.loopStart === -1) return escapePath.length;
        return maxIterations;
    },
    "getColorIndex"(index) {
        let colorIndex = index;
        while( colorIndex >= mandelbrotExplorer.palette.length  ) {
            colorIndex -= mandelbrotExplorer.palette.length;
        }
        return colorIndex;
    },
	"getJuliaEscapePath_orig"( c, z, maxIterations, bailOnRepeat, repeatCheck ){
		if(typeof(bailOnRepeat) === "undefined"){
			bailOnRepeat = true;
		}
		
		if(typeof(repeatCheck) === "undefined"){
			repeatCheck = function(zValues, z, lastZ){
				return z[0] === lastZ[0] && z[1] === lastZ[1];
			};
		}
		
		let iterations = 0;
		const zValues = Array();
		if( this.getAbsoluteValueOfComplexNumber(z) !== 0 ){
			zValues.push(z);
		}
		
		let lastZ = [null, null];
		const limit = 2;
		while( this.getAbsoluteValueOfComplexNumber(z) < limit && iterations < maxIterations ){
			iterations++;
			const zX = Math.pow(z[0], 2) - Math.pow(z[1], 2) + c[0];
			const zY = (2*z[0]*z[1]) + c[1];
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
	"runJuliaCalc"( c, z, maxIterations, verbose ){
		if(verbose){perfTime("runJuliaCalc");}

		let iterations = 0;
		while( this.getAbsoluteValueOfComplexNumber(z) < 2 && iterations < maxIterations ){
			iterations++;
			const zX = Math.pow(z[0], 2) - Math.pow(z[1], 2) + c[0];
			const zY = (2*z[0]*z[1]) + c[1];
			z = [zX, zY];
		}
		
		if(verbose){perfTimeEnd("runJuliaCalc");}
	},
	"getAbsoluteValueOfComplexNumber"( c ){
		return Math.sqrt( Math.abs( Math.pow(c[0], 2) + Math.pow(c[1],2) ) );
	},
	"padString" (str, len, pad, dir) {
		if (typeof(len) === "undefined") { len = 0; }
		if (typeof(pad) === "undefined") { pad = ' '; }
		if (typeof(dir) === "undefined") { dir = STR_PAD_RIGHT; }

		if (len + 1 >= str.length) {
			switch (dir){
				case STR_PAD_LEFT:
					str = Array(len + 1 - str.length).join(pad) + str;
					break;

				case STR_PAD_BOTH:
					var padlen = len - str.length;  
					const right = Math.ceil(padlen / 2);
					const left = padlen - right;
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
	"saveSettings"() {
		SettingsManager.saveSettings(this);
	},
	
	"loadSettings"() {
		return SettingsManager.loadSettings(this);
	},
	
	"clearSettings"() {
		SettingsManager.clearSettings();
	}
};

// Global functions for external access
window.generateCloud = function() {
    mandelbrotExplorer.drawMandelbrotCloud();
};

window.generateHair = function() {
    mandelbrotExplorer.drawMandelbrotsHair();
};

window.clearCloudCache = function() {
    mandelbrotExplorer.cloudMethods.clearCacheAndLog();
};

window.getCloudCacheStatus = function() {
    return mandelbrotExplorer.cloudMethods.getCacheStatus();
};

window.showCacheStatus = function() {
    const status = mandelbrotExplorer.cloudMethods.getCacheStatus();
    const statusText = `Cache: ${status.entries} entries, ${status.size} MB`;
    
    // Update classic UI
    const cacheStatus = document.getElementById('cacheStatus');
    if (cacheStatus) {
        cacheStatus.textContent = statusText;
    }
    
    // Update new UI
    const altCacheStatus = document.getElementById('alt-cacheStatus');
    if (altCacheStatus) {
        altCacheStatus.textContent = statusText;
    }
    
    		debugLog('cache', 'Cache Status:', statusText);
    return status;
};

window.checkGPUAvailability = function() {
    // Test WebGL availability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
        return {
            available: false,
            reason: 'WebGL not supported by browser'
        };
    }
    
    // Test shader compilation
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, 'attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0.0, 1.0); }');
    gl.compileShader(vertexShader);
    
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        return {
            available: false,
            reason: 'Shader compilation failed'
        };
    }
    
    return {
        available: true,
        version: gl.getParameter(gl.VERSION),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER)
    };
};

// Initialize cache status display when page loads
window.addEventListener('load', function() {
    setTimeout(showCacheStatus, TIMEOUT_MEDIUM);
});

// Debug logging control functions
window.enableDebugLogging = function(category = 'all') {
    if (category === 'all') {
        DEBUG_CONFIG.enabled = true;
        DEBUG_CONFIG.gpu = true;
        DEBUG_CONFIG.cache = true;
        DEBUG_CONFIG.generation = true;
        DEBUG_CONFIG.particles = true;
        DEBUG_CONFIG.escapePaths = true;
        DEBUG_CONFIG.performance = true;
    } else if (DEBUG_CONFIG.hasOwnProperty(category)) {
        DEBUG_CONFIG.enabled = true;
        DEBUG_CONFIG[category] = true;
    }
    console.log('Debug logging enabled for:', category);
};

window.disableDebugLogging = function(category = 'all') {
    if (category === 'all') {
        DEBUG_CONFIG.enabled = false;
        DEBUG_CONFIG.gpu = false;
        DEBUG_CONFIG.cache = false;
        DEBUG_CONFIG.generation = false;
        DEBUG_CONFIG.particles = false;
        DEBUG_CONFIG.escapePaths = false;
        DEBUG_CONFIG.performance = false;
    } else if (DEBUG_CONFIG.hasOwnProperty(category)) {
        DEBUG_CONFIG[category] = false;
    }
    console.log('Debug logging disabled for:', category);
};

window.showDebugStatus = function() {
    console.log('Debug logging status:', DEBUG_CONFIG);
};
