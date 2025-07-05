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
	"useGPU": true, // GPU acceleration toggle
	"gpuContext": null, // WebGL context for GPU computation
	"gpuProgram": null, // GPU shader program
	"gpuBuffers": {}, // GPU buffers for data transfer
	
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
		
		// Initialize GPU context if GPU is enabled
		if (this.useGPU) {
			this.initGPU();
		}
	},
	
	"drawMandelbrot": function(params) {
		this.assignParams( params );
		var canvasContext = this.canvas_2d.getContext("2d", { willReadFrequently: true });
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
	
	// GPU acceleration methods
	"initGPU": function() {
		try {
			// Create a hidden canvas for GPU computation
			const gpuCanvas = document.createElement('canvas');
			gpuCanvas.width = 1;
			gpuCanvas.height = 1;
			gpuCanvas.style.display = 'none';
			document.body.appendChild(gpuCanvas);
			
			// Try WebGL 2 first, then fall back to WebGL 1
			this.gpuContext = gpuCanvas.getContext('webgl2') || gpuCanvas.getContext('webgl');
			if (!this.gpuContext) {
				console.warn('WebGL not available, falling back to CPU');
				this.useGPU = false;
				return;
			}
			
			// Log WebGL version for debugging
			const version = this.gpuContext.getParameter(this.gpuContext.VERSION);
			const renderer = this.gpuContext.getParameter(this.gpuContext.RENDERER);
			console.log('WebGL initialized:', version, 'on', renderer);
			
			// Create and compile shader programs
			this.createGPUProgram();
			this.createGPUIterationProgram();
			console.log('GPU acceleration initialized successfully');
		} catch (error) {
			console.error('Failed to initialize GPU acceleration:', error);
			this.useGPU = false;
		}
	},
	
	"createGPUProgram": function() {
		const gl = this.gpuContext;
		
		// Determine correct shader path based on current location
		const shaderPath = this.getShaderPath();
		
		// Load shaders from external files
		ShaderLoader.loadShaders(shaderPath + 'mandelbrot_vertex.glsl', shaderPath + 'mandelbrot_fragment.glsl')
			.then(shaders => {
				// Create shaders
				const vertexShader = this.createShader(gl.VERTEX_SHADER, shaders.vertex);
				const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, shaders.fragment);
		
				// Check if shaders compiled successfully
				if (!vertexShader || !fragmentShader) {
					console.error('Failed to compile shaders');
					this.useGPU = false;
					return;
				}
				
				// Create program
				this.gpuProgram = gl.createProgram();
				gl.attachShader(this.gpuProgram, vertexShader);
				gl.attachShader(this.gpuProgram, fragmentShader);
				gl.linkProgram(this.gpuProgram);
				
				if (!gl.getProgramParameter(this.gpuProgram, gl.LINK_STATUS)) {
					console.error('GPU program link error:', gl.getProgramInfoLog(this.gpuProgram));
					this.useGPU = false;
					return;
				}
				
				// Get uniform locations
				this.gpuUniforms = {
					resolution: gl.getUniformLocation(this.gpuProgram, 'u_resolution'),
					startX: gl.getUniformLocation(this.gpuProgram, 'u_startX'),
					startY: gl.getUniformLocation(this.gpuProgram, 'u_startY'),
					endX: gl.getUniformLocation(this.gpuProgram, 'u_endX'),
					endY: gl.getUniformLocation(this.gpuProgram, 'u_endY'),
					maxIterations: gl.getUniformLocation(this.gpuProgram, 'u_maxIterations'),
					juliaC: gl.getUniformLocation(this.gpuProgram, 'u_juliaC'),
					isJulia: gl.getUniformLocation(this.gpuProgram, 'u_isJulia')
				};
				
				console.log('GPU shaders loaded and compiled successfully');
			})
			.catch(error => {
				console.error('Failed to load shaders:', error);
				this.useGPU = false;
			});
	},
	
	"createGPUIterationProgram": function() {
		const gl = this.gpuContext;
		
		// Determine correct shader path based on current location
		const shaderPath = this.getShaderPath();
		
		// Load iteration-centric shaders
		ShaderLoader.loadShaders(shaderPath + 'mandelbrot_vertex.glsl', shaderPath + 'mandelbrot_iteration_fragment.glsl')
			.then(shaders => {
				// Create shaders
				const vertexShader = this.createShader(gl.VERTEX_SHADER, shaders.vertex);
				const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, shaders.fragment);
		
				// Check if shaders compiled successfully
				if (!vertexShader || !fragmentShader) {
					console.error('Failed to compile iteration-centric shaders');
					this.useGPU = false;
					return;
				}
				
				// Create program
				this.gpuIterationProgram = gl.createProgram();
				gl.attachShader(this.gpuIterationProgram, vertexShader);
				gl.attachShader(this.gpuIterationProgram, fragmentShader);
				gl.linkProgram(this.gpuIterationProgram);
				
				if (!gl.getProgramParameter(this.gpuIterationProgram, gl.LINK_STATUS)) {
					console.error('GPU iteration program link error:', gl.getProgramInfoLog(this.gpuIterationProgram));
					this.useGPU = false;
					return;
				}
				
				// Get uniform locations for iteration-centric program
				this.gpuIterationUniforms = {
					resolution: gl.getUniformLocation(this.gpuIterationProgram, 'u_resolution'),
					startX: gl.getUniformLocation(this.gpuIterationProgram, 'u_startX'),
					startY: gl.getUniformLocation(this.gpuIterationProgram, 'u_startY'),
					endX: gl.getUniformLocation(this.gpuIterationProgram, 'u_endX'),
					endY: gl.getUniformLocation(this.gpuIterationProgram, 'u_endY'),
					maxIterations: gl.getUniformLocation(this.gpuIterationProgram, 'u_maxIterations'),
					juliaC: gl.getUniformLocation(this.gpuIterationProgram, 'u_juliaC'),
					isJulia: gl.getUniformLocation(this.gpuIterationProgram, 'u_isJulia'),
					currentIteration: gl.getUniformLocation(this.gpuIterationProgram, 'u_currentIteration'),
					previousIteration: gl.getUniformLocation(this.gpuIterationProgram, 'u_previousIteration')
				};
				
				console.log('GPU iteration-centric shaders loaded and compiled successfully');
			})
			.catch(error => {
				console.error('Failed to load iteration-centric shaders:', error);
				this.useGPU = false;
			});
	},
	
	"createShader": function(type, source) {
		const gl = this.gpuContext;
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error('Shader compile error:', gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		
		return shader;
	},
	
	// Get the correct shader path based on current location
	"getShaderPath": function() {
		// Check if we're running from the tests folder
		const currentPath = window.location.pathname;
		if (currentPath.includes('/tests/')) {
			return '../shaders/';
		}
		return 'shaders/';
	},
	
	// Check if GPU is fully ready for use
	"isGPUReady": function() {
		if (!this.gpuContext || !this.gpuProgram || !this.gpuUniforms) {
			return false;
		}
		
		// Check that all required uniforms are available
		const requiredUniforms = ['resolution', 'startX', 'startY', 'endX', 'endY', 'maxIterations', 'juliaC', 'isJulia'];
		return requiredUniforms.every(uniform => this.gpuUniforms[uniform] !== null);
	},
	
		"generateEscapePathsGPUIterationCentric": function(points, maxIterations, area) {
		if (!this.gpuContext || !this.gpuIterationProgram) {
			console.warn('GPU iteration program not available, falling back to CPU');
			return this.generateEscapePathsCPU(points, maxIterations);
		}
		
		// Ensure GPU program is fully initialized
		if (!this.gpuIterationUniforms) {
			console.warn('GPU iteration uniforms not initialized, falling back to CPU');
			return this.generateEscapePathsCPU(points, maxIterations);
		}
		
		const gl = this.gpuContext;
		const results = [];
		
		// Use area if provided, otherwise fall back to this.startX, etc.
		const startX = area && area.startX !== undefined ? area.startX : this.startX;
		const endX   = area && area.endX   !== undefined ? area.endX   : this.endX;
		const startY = area && area.startY !== undefined ? area.startY : this.startY;
		const endY   = area && area.endY   !== undefined ? area.endY   : this.endY;
		
		// Calculate grid dimensions from points array
		const gridSize = Math.sqrt(points.length);
		const xPoints = gridSize;
		const yPoints = maxIterations; // Each row represents one iteration
		
		console.log('GPU iteration-centric processing:', xPoints, 'points x', yPoints, 'iterations');
		
		// Create framebuffers for ping-pong rendering
		const framebuffer1 = gl.createFramebuffer();
		const framebuffer2 = gl.createFramebuffer();
		
		// Create textures for ping-pong
		const texture1 = gl.createTexture();
		const texture2 = gl.createTexture();
		
		gl.bindTexture(gl.TEXTURE_2D, texture1);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, xPoints, yPoints, 0, gl.RGBA, gl.FLOAT, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		
		gl.bindTexture(gl.TEXTURE_2D, texture2);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, xPoints, yPoints, 0, gl.RGBA, gl.FLOAT, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		
		// Set up viewport
		gl.viewport(0, 0, xPoints, yPoints);
		
		// Use shader program
		gl.useProgram(this.gpuProgram);
		
		// Set uniforms
		const juliaC = eval(this.juliaC);
		gl.uniform2f(this.gpuUniforms.resolution, xPoints, yPoints);
		gl.uniform1f(this.gpuUniforms.startX, startX);
		gl.uniform1f(this.gpuUniforms.startY, startY);
		gl.uniform1f(this.gpuUniforms.endX, endX);
		gl.uniform1f(this.gpuUniforms.endY, endY);
		gl.uniform1i(this.gpuUniforms.maxIterations, maxIterations);
		gl.uniform2f(this.gpuUniforms.juliaC, juliaC[0], juliaC[1]);
		gl.uniform1i(this.gpuUniforms.isJulia, this.getAbsoluteValueOfComplexNumber(juliaC) !== 0 ? 1 : 0);
		
		// Create vertex buffer for full-screen quad
		const vertices = new Float32Array([
			-1, -1,
			1, -1,
			-1, 1,
			1, 1
		]);
		
		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		
		// Set up vertex attributes
		const positionLocation = gl.getAttribLocation(this.gpuIterationProgram, 'a_position');
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
		
		// Render each iteration
		for (let iteration = 0; iteration < maxIterations; iteration++) {
			// Bind appropriate framebuffer
			const currentFramebuffer = (iteration % 2 === 0) ? framebuffer1 : framebuffer2;
			const currentTexture = (iteration % 2 === 0) ? texture1 : texture2;
			const previousTexture = (iteration % 2 === 0) ? texture2 : texture1;
			
			gl.bindFramebuffer(gl.FRAMEBUFFER, currentFramebuffer);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, currentTexture, 0);
			
			// Set iteration uniform
			gl.uniform1i(this.gpuIterationUniforms.currentIteration, iteration);
			
			// Bind previous iteration texture
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, previousTexture);
			gl.uniform1i(this.gpuIterationUniforms.previousIteration, 0);
			
			// Render
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}
		
		// Read back final results
		const pixels = new Float32Array(xPoints * yPoints * 4);
		gl.readPixels(0, 0, xPoints, yPoints, gl.RGBA, gl.FLOAT, pixels);
		
		// Convert results back to escape paths
		for (let pointIndex = 0; pointIndex < xPoints; pointIndex++) {
			const escapePath = [];
			let escaped = false;
			let escapeIteration = maxIterations;
			
			// Find when this point escaped
			for (let iteration = 0; iteration < maxIterations; iteration++) {
				const pixelIndex = (iteration * xPoints + pointIndex) * 4;
				const escapeFlag = pixels[pixelIndex + 3];
				
				if (escapeFlag > 0.5 && !escaped) {
					escaped = true;
					escapeIteration = iteration;
				}
				
				// Add point to escape path
				const x = pixels[pixelIndex];
				const y = pixels[pixelIndex + 1];
				escapePath.push([x, y]);
			}
			
			// Truncate to escape iteration
			if (escaped) {
				escapePath.length = escapeIteration + 1;
			}
			
			results.push(escapePath);
		}
		
		// Clean up
		gl.deleteTexture(texture1);
		gl.deleteTexture(texture2);
		gl.deleteFramebuffer(framebuffer1);
		gl.deleteFramebuffer(framebuffer2);
		gl.deleteBuffer(vertexBuffer);
		
		console.log('GPU iteration-centric generated', results.length, 'escape paths');
		return results;
	},
	
	"generateEscapePathsGPU": function(points, maxIterations, area) {
		if (!this.gpuContext || !this.gpuProgram) {
			console.warn('GPU not available, falling back to CPU');
			return this.generateEscapePathsCPU(points, maxIterations);
		}
		
		// Ensure GPU program is fully initialized
		if (!this.gpuUniforms) {
			console.warn('GPU uniforms not initialized, falling back to CPU');
			return this.generateEscapePathsCPU(points, maxIterations);
		}
		
		// Additional check: ensure all required uniforms are available
		const requiredUniforms = ['resolution', 'startX', 'startY', 'endX', 'endY', 'maxIterations', 'juliaC', 'isJulia'];
		const missingUniforms = requiredUniforms.filter(uniform => !this.gpuUniforms[uniform]);
		if (missingUniforms.length > 0) {
			console.warn('GPU uniforms not fully initialized, missing:', missingUniforms.join(', '), 'falling back to CPU');
			return this.generateEscapePathsCPU(points, maxIterations);
		}
		
		const gl = this.gpuContext;
		const results = [];
		
		// Use area if provided, otherwise fall back to this.startX, etc.
		const startX = area && area.startX !== undefined ? area.startX : this.startX;
		const endX   = area && area.endX   !== undefined ? area.endX   : this.endX;
		const startY = area && area.startY !== undefined ? area.startY : this.startY;
		const endY   = area && area.endY   !== undefined ? area.endY   : this.endY;
		
		// Calculate grid dimensions from points array
		// Use actual points length instead of assuming perfect square
		const totalPoints = points.length;
		console.log('GPU processing', totalPoints, 'points');
		
		// For GPU rendering, we need a rectangular grid
		// Since points come from multiple scales, we'll use the largest possible square that fits
		const gridSize = Math.ceil(Math.sqrt(totalPoints));
		const xPoints = gridSize;
		const yPoints = gridSize;
		
		// Ensure we don't exceed the points array bounds
		const maxPoints = Math.min(xPoints * yPoints, totalPoints);
		console.log('GPU grid size:', xPoints, 'x', yPoints, '=', xPoints * yPoints, 'pixels, processing', maxPoints, 'points');
		
		// For GPU rendering, we need to map the grid to the sample area
		// The GPU will render a grid of xPoints x yPoints pixels
		// Each pixel corresponds to one point in the sample area
		console.log('GPU grid:', xPoints, 'x', yPoints, 'points for area', startX, 'to', endX, 'x', startY, 'to', endY);
		console.log('GPU coordinate mapping: using normalized coordinates with area bounds');
		
		// Create framebuffer for output
		const framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		
		// Create output texture - use actual grid size
		const outputTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, outputTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, xPoints, yPoints, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);
		
		// Set up viewport
		gl.viewport(0, 0, xPoints, yPoints);
		
		// Use shader program
		gl.useProgram(this.gpuProgram);
		
		// Set uniforms
		const juliaC = eval(this.juliaC);
		gl.uniform2f(this.gpuUniforms.resolution, xPoints, yPoints);
		gl.uniform1f(this.gpuUniforms.startX, startX);
		gl.uniform1f(this.gpuUniforms.startY, startY);
		gl.uniform1f(this.gpuUniforms.endX, endX);
		gl.uniform1f(this.gpuUniforms.endY, endY);
		gl.uniform1i(this.gpuUniforms.maxIterations, maxIterations);
		gl.uniform2f(this.gpuUniforms.juliaC, juliaC[0], juliaC[1]);
		gl.uniform1i(this.gpuUniforms.isJulia, this.getAbsoluteValueOfComplexNumber(juliaC) !== 0 ? 1 : 0);
		
		// Create vertex buffer for full-screen quad
		const vertices = new Float32Array([
			-1, -1,
			1, -1,
			-1, 1,
			1, 1
		]);
		
		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		
		// Set up vertex attributes
		const positionLocation = gl.getAttribLocation(this.gpuProgram, 'a_position');
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
		
		// Single efficient render pass
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		
		// Read back results
		const pixels = new Uint8Array(xPoints * yPoints * 4);
		gl.readPixels(0, 0, xPoints, yPoints, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		
		// Convert GPU results back to escape paths
		let validResults = 0;
		let escapedPoints = [];
		
		for (let i = 0; i < maxPoints; i++) {
			const pixelIndex = i * 4;
			const iterations = pixels[pixelIndex + 2];
			
			// Use the original points array to avoid coordinate reconstruction errors
			const originalPoint = points[i];
			if (!originalPoint) {
				console.warn('GPU: Point', i, 'is undefined, skipping');
				continue;
			}
			const x = originalPoint[0];
			const y = originalPoint[1];
			
			// Debug: log first few results
			if (i < 5) {
				console.log('GPU point', i, ':', {
					x: x.toFixed(3), y: y.toFixed(3),
					iterations: iterations
				});
			}
			
			// Create escape path - always generate full path to match CPU behavior
			const c = [x, y];
			let escapePath;
			
			// Use the same logic as CPU to determine Julia vs Mandelbrot
			if (this.getAbsoluteValueOfComplexNumber(juliaC) !== 0) {
				escapePath = this.getJuliaEscapePath(juliaC, c, maxIterations, true);
			} else {
				escapePath = this.getJuliaEscapePath(c, juliaC, maxIterations, true);
			}
			
			// Debug: log first few escape paths
			if (i < 3) {
				console.log('GPU generating escape path for point', i, ':', {
					originalPoint: [x, y],
					gpuIterations: iterations,
					cpuPathLength: escapePath.length,
					fullPathShortened: escapePath.shortened,
					firstPoint: escapePath[0],
					lastPoint: escapePath[escapePath.length - 1]
				});
			}
			
			// Count valid results (points that escaped)
			if (iterations > 0 && iterations < maxIterations) {
				validResults++;
			}
			
			results.push(escapePath);
		}
		
		console.log('GPU generated', validResults, 'valid escape paths out of', maxPoints, 'total points');
		
		// Clean up
		gl.deleteTexture(outputTexture);
		gl.deleteFramebuffer(framebuffer);
		gl.deleteBuffer(vertexBuffer);
		
		console.log('GPU generated', results.length, 'escape paths');
		return results;
	},
	
	"generateEscapePathsCPU": function(points, maxIterations) {
		// Original CPU implementation
		const results = [];
		for (let i = 0; i < points.length; i++) {
			const c = points[i];
			const juliaC = eval(mandelbrotExplorer.juliaC);
			
			let escapePath;
			if (mandelbrotExplorer.getAbsoluteValueOfComplexNumber(juliaC) !== 0) {
				escapePath = mandelbrotExplorer.getJuliaEscapePath(juliaC, c, maxIterations, true);
			} else {
				escapePath = mandelbrotExplorer.getJuliaEscapePath(c, juliaC, maxIterations, true);
			}
			
			results.push(escapePath);
		}
		return results;
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
        "generateCacheKey": function() {
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
        "getCacheSize": function() {
            		// Calculate approximate memory usage of escape path cache in MB
		if (!mandelbrotExplorer.cloudCache) return 0;
		
		let totalSize = 0;
		
		for (let key in mandelbrotExplorer.cloudCache) {
			const entry = mandelbrotExplorer.cloudCache[key];
			if (entry.escapePaths) {
				// Avoid circular references by only counting the array length
				totalSize += entry.escapePaths.length * 16; // Approximate bytes per escape path
			}
		}
            
            return Math.round(totalSize / (1024 * 1024)); // Convert to MB
        },

        
        "clearCloudCache": function() {
            // Clear the cloud cache when parameters change
            if (mandelbrotExplorer.cloudCache) {
                mandelbrotExplorer.cloudCache = {};
                console.log('Cloud cache cleared');
            }
        },

        "limitCacheSize": function() {
            // Limit cache size to prevent excessive memory usage
            // Calculate realistic cache size based on current parameters
            const currentResolutions = mandelbrotExplorer.cloudResolution.toString().split(',').map(r => parseInt(r.trim()));
            const maxResolution = Math.max(...currentResolutions);
            const maxIterations = mandelbrotExplorer.maxIterations_3d;
            
            // Estimate cache size: resolution² × iterations × 16 bytes per coordinate pair
            const estimatedCacheSizeMB = (maxResolution * maxResolution * maxIterations * 16) / (1024 * 1024);
            
            // Set limits based on estimated size, with reasonable bounds
            const MAX_ESCAPE_PATH_CACHE_SIZE_MB = Math.max(500, Math.min(9000, estimatedCacheSizeMB * 1.5)); // 500MB-9GB range
            const MAX_CACHE_ENTRIES = Math.max(3, Math.min(5, Math.floor(1000 / estimatedCacheSizeMB))); // Fewer entries for larger data
            
            console.log('Cache size estimation:', {
                maxResolution,
                maxIterations, 
                estimatedSizeMB: Math.round(estimatedCacheSizeMB),
                cacheLimitMB: Math.round(MAX_ESCAPE_PATH_CACHE_SIZE_MB),
                maxEntries: MAX_CACHE_ENTRIES
            });
            
            // Warn if cache size would be very large
            if (estimatedCacheSizeMB > 1000) {
                console.warn('⚠️ Large cache size detected:', Math.round(estimatedCacheSizeMB), 'MB. Consider reducing resolution or iterations for better performance.');
                
                // Suggest specific optimizations
                const suggestedRes = Math.floor(Math.sqrt(estimatedCacheSizeMB * 1024 * 1024 / (maxIterations * 16)));
                console.log('💡 Suggestions:');
                console.log('   - Reduce resolution to ~', suggestedRes, 'for ~1GB cache');
                console.log('   - Or reduce iterations to ~', Math.floor(256), 'for current resolution');
                console.log('   - Or disable caching for this render (will be slower but use less memory)');
            }
            
            if (!mandelbrotExplorer.cloudCache) return;
            
            const cacheKeys = Object.keys(mandelbrotExplorer.cloudCache);
            
            // If we have too many entries, remove oldest ones
            if (cacheKeys.length > MAX_CACHE_ENTRIES) {
                const keysToRemove = cacheKeys.slice(0, cacheKeys.length - MAX_CACHE_ENTRIES);
                keysToRemove.forEach(key => {
                    delete mandelbrotExplorer.cloudCache[key];
                });
                console.log('Removed', keysToRemove.length, 'old cache entries');
            }
            
            			// Check escape path cache memory usage
			let escapePathCacheSize = 0;
			for (let key in mandelbrotExplorer.cloudCache) {
				const entry = mandelbrotExplorer.cloudCache[key];
				if (entry.escapePaths) {
					// Avoid circular references by only counting the array length
					escapePathCacheSize += entry.escapePaths.length * 16; // Approximate bytes per escape path
				}
			}
			escapePathCacheSize = Math.round(escapePathCacheSize / (1024 * 1024)); // Convert to MB
            
            if (escapePathCacheSize > MAX_ESCAPE_PATH_CACHE_SIZE_MB) {
                console.log('Escape path cache size limit exceeded (' + escapePathCacheSize + 'MB), clearing cache');
                this.clearCloudCache();
            }
        },
        "getCacheStatus": function() {
            if (!mandelbrotExplorer.cloudCache) {
                return { entries: 0, size: 0 };
            }
            
            const cacheKeys = Object.keys(mandelbrotExplorer.cloudCache);
            
            return {
                entries: cacheKeys.length,
                size: this.getCacheSize()
            };
        },
        "clearCacheAndLog": function() {
            const status = this.getCacheStatus();
            this.clearCloudCache();
            console.log('Cache cleared. Previous status:', status.entries, 'entries,', status.size, 'MB');
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
            
            // Check if we have a valid cache for current parameters
            const cacheKey = this.generateCacheKey();
            let cachedEscapePaths = null;
            
            if (mandelbrotExplorer.cloudCache && mandelbrotExplorer.cloudCache[cacheKey]) {
                const cacheEntry = mandelbrotExplorer.cloudCache[cacheKey];
                
                if (cacheEntry.escapePaths) {
                    cachedEscapePaths = cacheEntry.escapePaths;
                    console.log('Using cached escape paths:', cachedEscapePaths.length, 'paths');
                    document.getElementById('progress-text').textContent = 'Using cached escape paths...';
                }
            }
            
            // Log cache status
            const cacheStatus = this.getCacheStatus();
            console.log('Cache status:', cacheStatus.entries, 'entries,', cacheStatus.size, 'MB');
            if (cacheStatus.size > 0) {
                console.log('Cache efficiency: ~', Math.round(cacheStatus.size / cacheStatus.entries), 'KB per entry');
            }
            
            if (!cachedEscapePaths) {
                const gpuStatus = mandelbrotExplorer.useGPU ? 'GPU' : 'CPU';
                console.log('No cache found, generating new escape paths using', gpuStatus, '...');
                console.log('GPU enabled:', mandelbrotExplorer.useGPU);
                console.log('GPU context available:', !!mandelbrotExplorer.gpuContext);
                document.getElementById('progress-text').textContent = `Generating escape paths (${gpuStatus})...`;
                
                // If GPU is enabled but not ready, wait for it to be ready
                if (mandelbrotExplorer.useGPU && !mandelbrotExplorer.isGPUReady()) {
                    console.log('GPU not ready, waiting for initialization...');
                    document.getElementById('progress-text').textContent = 'Waiting for GPU initialization...';
                    
                    // Wait for GPU to be ready with a timeout
                    let gpuWaitAttempts = 0;
                    const maxGPUWaitAttempts = 50; // 5 seconds max wait
                    
                    function waitForGPU() {
                        if (mandelbrotExplorer.isGPUReady()) {
                            console.log('GPU is now ready, proceeding with generation');
                            document.getElementById('progress-text').textContent = 'GPU ready, generating escape paths...';
                            startGeneration();
                        } else if (gpuWaitAttempts < maxGPUWaitAttempts) {
                            gpuWaitAttempts++;
                            console.log(`GPU not ready yet, attempt ${gpuWaitAttempts}/${maxGPUWaitAttempts}`);
                            setTimeout(waitForGPU, 100);
                        } else {
                            console.log('GPU initialization timeout, falling back to CPU');
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
            const BATCH_SIZE = mandelbrotExplorer.useGPU ? 1000 : 50; // Larger batches for GPU


            
            function processBatch() {
                if (isCancelled) {
                    return;
                }
                
                const endIndex = Math.min(currentPointIndex + BATCH_SIZE, allPoints.length);
                
                // Process batch using GPU or CPU
                if (mandelbrotExplorer.useGPU && mandelbrotExplorer.isGPUReady() && !cachedEscapePaths && currentPointIndex === 0) {
                    // GPU processes the entire grid at once
                    console.log('GPU processing entire grid of', allPoints.length, 'points');
                    try {
                        const allEscapePaths = mandelbrotExplorer.generateEscapePathsGPU(allPoints.map(p => [p.x, p.y]), mandelbrotExplorer.maxIterations_3d);
                        
                        // Process all GPU results
                        for (let i = 0; i < allEscapePaths.length; i++) {
                            const point = allPoints[i];
                            const escapePath = allEscapePaths[i];
                            processEscapePath(point, escapePath, true, i);
                            processedPoints++;
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
                                var c = mandelbrotExplorer.cloudMethods.handleCloudSteppingAdjustments([point.x, point.y]);
                                escapePath = mandelbrotExplorer.cloudMethods.getEscapePath(c);
                                shouldCache = true;
                            }
                            
                            processEscapePath(point, escapePath, shouldCache, i);
                            processedPoints++;
                        }
                    }
                } else if (mandelbrotExplorer.useGPU && !mandelbrotExplorer.isGPUReady() && !cachedEscapePaths && currentPointIndex === 0) {
                    console.log('GPU enabled but not ready, falling back to CPU processing');
                    console.log('GPU Status:', {
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
                        console.log('Processing escape path', pointIndex, ':', {
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
                    if (processedPoints % 1000 === 0) {
                        mandelbrotExplorer.cloudMethods.limitCacheSize();
                    }
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
                        console.log('Creating particle systems...');
                        
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
        "applyMandelbrotCloudPalette": function() {
            console.time("drawMandelbrotCloud: Creating particle systems");
            
            // Update progress text to show particle system creation
            const progressDiv = document.getElementById('cloud-generation-progress');
            if (progressDiv) {
                document.getElementById('progress-text').textContent = 'Creating particle systems...';
            }
            
            const indices = Object.keys(mandelbrotExplorer.iterationParticles);
            console.log('Creating particle systems for indices:', indices.slice(0, 20), '... (total:', indices.length, ')');
            
            // Process all particle systems in one go (no batching needed since this is fast)
            for (let i = 0; i < indices.length; i++) {
                const index = indices[i];
                
                // Get the particles data
                const particlesData = mandelbrotExplorer.iterationParticles[index];
                if (!particlesData || !particlesData.particles || 
                    !Array.isArray(particlesData.particles) ||
                    particlesData.particles.length === 0) {
                    continue;
                }
                
                var color = mandelbrotExplorer.palette[ mandelbrotExplorer.getColorIndex(index) ];
                var size = mandelbrotExplorer.particleSize ? eval(mandelbrotExplorer.particleSize): 0;
                
                var pMaterial = mandelbrotExplorer.threeRenderer.createParticleMaterial(color, size);
                
                // Convert array of vectors to geometry for rendering
                var geometry = new THREE.Geometry();
                
                particlesData.particles.forEach(function(vector) {
                    if (vector && vector.x !== undefined && vector.y !== undefined && vector.z !== undefined) {
                        geometry.vertices.push(vector);
                    }
                });
                
                var points = mandelbrotExplorer.threeRenderer.addParticleSystem(
                    geometry,
                    pMaterial
                );
                
                mandelbrotExplorer.particleSystems[index] = points;
            }
            
            // Clean up iterationParticles after particle system creation is complete
            mandelbrotExplorer.iterationParticles = null;
            
            console.timeEnd("drawMandelbrotCloud: Creating particle systems");
            
            // Call completion handler if it exists
            if (mandelbrotExplorer.cloudMethods.onCloudGenerationComplete) {
                mandelbrotExplorer.cloudMethods.onCloudGenerationComplete();
            }
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
            
            // Update cache status after generation
            setTimeout(showCacheStatus, 100);
            
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
		
		// Only iterate over particle systems that actually exist
		for( var index in this.particleSystems ){
			if(!this.particleSystems[index]){
				continue;
			}
			var iteration = parseInt(index) + 1;
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
		
		var canvasContext = this.canvas_2d.getContext("2d", { willReadFrequently: true });
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
				
		for( var index in this.particleSystems )
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
		var particleSystemsLength = Object.keys(this.particleSystems).length;
		var cycleDirection = 1;
		while( particleSystemsLength > 0 && foundNext == false ){
			for( var index in this.particleSystems ){
				this.threeRenderer.removeObject( this.particleSystems[index] );
				var iteration = parseInt(index) + 1;
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
			
			if(this.nextCycleIteration > particleSystemsLength || this.nextCycleIteration < 0){
				cycleDirection *= -1;
			}
			
			while( this.nextCycleIteration > particleSystemsLength )
			{
				this.nextCycleIteration -= particleSystemsLength;
			}
		}
		
		if( this.continueIterationCycle ){
			this._cloudIterationCyclerId = setTimeout( function(){mandelbrotExplorer.cycleCloudIterations();}, this.iterationCycleTime )
		}
		
	},
	"setPalette": function( newPalette ) {
		var canvasContext = this.canvas_2d.getContext("2d", { willReadFrequently: true });
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
		
		for( var index in this.particleSystems ){
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
    
    console.log('Cache Status:', statusText);
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
    setTimeout(showCacheStatus, 500);
});
