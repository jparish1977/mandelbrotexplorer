/* global mandelbrotExplorer, ShaderLoader, debugLog, perfTime, perfTimeEnd */
/* global RGBA_COMPONENTS, RGB_COMPONENTS, GL_QUAD_VERTICES, BYTES_PER_ESCAPE_PATH */
/* global BYTES_PER_MB, MIN_CACHE_SIZE_MB, MAX_CACHE_SIZE_MB, CACHE_SIZE_MULTIPLIER */
/* global MIN_CACHE_ENTRIES, MAX_CACHE_ENTRIES, CACHE_BUDGET_MB, COLOR_CHANNEL_MAX */
/* global TIMEOUT_SHORT, TIMEOUT_MEDIUM */

// GPU acceleration and escape path methods for mandelbrotExplorer
// Extracted from mandelbrotexplorer.js for maintainability

Object.assign(mandelbrotExplorer, {
"initGPU"() {
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
		debugLog('gpu', 'WebGL initialized:', version, 'on', renderer);
		
		// Create and compile shader programs
		this.createGPUProgram();
		this.createGPUIterationProgram();
		debugLog('gpu', 'GPU acceleration initialized successfully');
	} catch (error) {
		console.error('Failed to initialize GPU acceleration:', error);
		this.useGPU = false;
	}
},

"createGPUProgram"() {
	const gl = this.gpuContext;
	
	// Determine correct shader path based on current location
	const shaderPath = this.getShaderPath();
	
	// Load shaders from external files
	ShaderLoader.loadShaders(`${shaderPath  }mandelbrot_vertex.glsl`, `${shaderPath  }mandelbrot_fragment.glsl`)
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
			
			debugLog('gpu', 'GPU shaders loaded and compiled successfully');
		})
		.catch(error => {
			console.error('Failed to load shaders:', error);
			this.useGPU = false;
		});
},

"createGPUIterationProgram"() {
	const gl = this.gpuContext;
	
	// Determine correct shader path based on current location
	const shaderPath = this.getShaderPath();
	
	// Load iteration-centric shaders
	ShaderLoader.loadShaders(`${shaderPath  }mandelbrot_vertex.glsl`, `${shaderPath  }mandelbrot_iteration_fragment.glsl`)
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
			
			debugLog('gpu', 'GPU iteration-centric shaders loaded and compiled successfully');
		})
		.catch(error => {
			console.error('Failed to load iteration-centric shaders:', error);
			this.useGPU = false;
		});
},

"createShader"(type, source) {
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
"getShaderPath"() {
	// Check if we're running from the tests folder
	const currentPath = window.location.pathname;
	if (currentPath.includes('/tests/')) {
		return '../shaders/';
	}
	return 'shaders/';
},

// Check if GPU is fully ready for use
"isGPUReady"() {
	if (!this.gpuContext || !this.gpuProgram || !this.gpuUniforms) {
		return false;
	}
	
	// Check that all required uniforms are available
	const requiredUniforms = ['resolution', 'startX', 'startY', 'endX', 'endY', 'maxIterations', 'juliaC', 'isJulia'];
	return requiredUniforms.every(uniform => this.gpuUniforms[uniform] !== null);
},

	"generateEscapePathsGPUIterationCentric"(points, maxIterations, area) {
	if (!this.gpuContext || !this.gpuIterationProgram) {
		console.warn('GPU iteration program not available, falling back to CPU');
		return this.generateEscapePathsCPU(points, maxIterations);
	}
	
	// Ensure GPU program is fully initialized
	if (!this.gpuIterationUniforms) {
		console.warn('GPU iteration uniforms not initialized, falling back to CPU');
		return this.generateEscapePathsCPU(points, maxIterations);
	}
	
	let gl = this.gpuContext;
	let results = [];
	
	// Use area if provided, otherwise fall back to this.startX, etc.
	let startX = area && area.startX !== undefined ? area.startX : this.startX;
	let endX   = area && area.endX   !== undefined ? area.endX   : this.endX;
	let startY = area && area.startY !== undefined ? area.startY : this.startY;
	let endY   = area && area.endY   !== undefined ? area.endY   : this.endY;
	
	// Calculate grid dimensions from points array
	let gridSize = Math.sqrt(points.length);
	let xPoints = gridSize;
	let yPoints = maxIterations; // Each row represents one iteration
	
	debugLog('gpu', 'GPU iteration-centric processing:', xPoints, 'points x', yPoints, 'iterations');
	
	// Create framebuffers for ping-pong rendering
	let framebuffer1 = gl.createFramebuffer();
	let framebuffer2 = gl.createFramebuffer();
	
	// Create textures for ping-pong
	let texture1 = gl.createTexture();
	let texture2 = gl.createTexture();
	
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
	 
	 
	// eslint-disable-next-line no-eval -- user-defined expression
	// eslint-disable-next-line no-eval -- user-defined expression
	let juliaC = eval(this.juliaC);
	gl.uniform2f(this.gpuUniforms.resolution, xPoints, yPoints);
	gl.uniform1f(this.gpuUniforms.startX, startX);
	gl.uniform1f(this.gpuUniforms.startY, startY);
	gl.uniform1f(this.gpuUniforms.endX, endX);
	gl.uniform1f(this.gpuUniforms.endY, endY);
	gl.uniform1i(this.gpuUniforms.maxIterations, maxIterations);
	gl.uniform2f(this.gpuUniforms.juliaC, juliaC[0], juliaC[1]);
	gl.uniform1i(this.gpuUniforms.isJulia, this.getAbsoluteValueOfComplexNumber(juliaC) !== 0 ? 1 : 0);
	
	// Create vertex buffer for full-screen quad
	let vertices = new Float32Array([
		-1, -1,
		1, -1,
		-1, 1,
		1, 1
	]);
	
	let vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	
	// Set up vertex attributes
	let positionLocation = gl.getAttribLocation(this.gpuIterationProgram, 'a_position');
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	
	// Render each iteration
	for (let iteration = 0; iteration < maxIterations; iteration++) {
		// Bind appropriate framebuffer
		let currentFramebuffer = (iteration % 2 === 0) ? framebuffer1 : framebuffer2;
		let currentTexture = (iteration % 2 === 0) ? texture1 : texture2;
		let previousTexture = (iteration % 2 === 0) ? texture2 : texture1;
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, currentFramebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, currentTexture, 0);
		
		// Set iteration uniform
		gl.uniform1i(this.gpuIterationUniforms.currentIteration, iteration);
		
		// Bind previous iteration texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, previousTexture);
		gl.uniform1i(this.gpuIterationUniforms.previousIteration, 0);
		
		// Render
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, GL_QUAD_VERTICES);
	}
	
	// Read back final results
	let pixels = new Float32Array(xPoints * yPoints * RGBA_COMPONENTS);
	gl.readPixels(0, 0, xPoints, yPoints, gl.RGBA, gl.FLOAT, pixels);
	
	// Convert results back to escape paths
	for (let pointIndex = 0; pointIndex < xPoints; pointIndex++) {
		let escapePath = [];
		let escaped = false;
		let escapeIteration = maxIterations;
		
		// Find when this point escaped
		for (let iteration = 0; iteration < maxIterations; iteration++) {
			let pixelIndex = (iteration * xPoints + pointIndex) * RGBA_COMPONENTS;
			let escapeFlag = pixels[pixelIndex + RGB_COMPONENTS];
			
			if (escapeFlag > 0.5 && !escaped) {
				escaped = true;
				escapeIteration = iteration;
			}
			
			// Add point to escape path
			let x = pixels[pixelIndex];
			let y = pixels[pixelIndex + 1];
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
	
	debugLog('gpu', 'GPU iteration-centric generated', results.length, 'escape paths');
	return results;
},

"generateEscapePathsGPU"(points, maxIterations, area) {
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
	let requiredUniforms = ['resolution', 'startX', 'startY', 'endX', 'endY', 'maxIterations', 'juliaC', 'isJulia'];
	let missingUniforms = requiredUniforms.filter(uniform => !this.gpuUniforms[uniform]);
	if (missingUniforms.length > 0) {
		console.warn('GPU uniforms not fully initialized, missing:', missingUniforms.join(', '), 'falling back to CPU');
		return this.generateEscapePathsCPU(points, maxIterations);
	}
	
	let gl = this.gpuContext;
	let results = [];
	
	// Use area if provided, otherwise fall back to this.startX, etc.
	let startX = area && area.startX !== undefined ? area.startX : this.startX;
	let endX   = area && area.endX   !== undefined ? area.endX   : this.endX;
	let startY = area && area.startY !== undefined ? area.startY : this.startY;
	let endY   = area && area.endY   !== undefined ? area.endY   : this.endY;
	
	// Calculate grid dimensions from points array
	// Use actual points length instead of assuming perfect square
	let totalPoints = points.length;
	debugLog('gpu', 'GPU processing', totalPoints, 'points');
	
	// For GPU rendering, we need a rectangular grid
	// Since points come from multiple scales, we'll use the largest possible square that fits
	let gridSize = Math.ceil(Math.sqrt(totalPoints));
	let xPoints = gridSize;
	let yPoints = gridSize;
	
	// Ensure we don't exceed the points array bounds
	let maxPoints = Math.min(xPoints * yPoints, totalPoints);
	debugLog('gpu', 'GPU grid size:', xPoints, 'x', yPoints, '=', xPoints * yPoints, 'pixels, processing', maxPoints, 'points');
	
	// For GPU rendering, we need to map the grid to the sample area
	// The GPU will render a grid of xPoints x yPoints pixels
	// Each pixel corresponds to one point in the sample area
	debugLog('gpu', 'GPU grid:', xPoints, 'x', yPoints, 'points for area', startX, 'to', endX, 'x', startY, 'to', endY);
	debugLog('gpu', 'GPU coordinate mapping: using normalized coordinates with area bounds');
	
	// Create framebuffer for output
	let framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	
	// Create output texture - use actual grid size
	let outputTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, outputTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, xPoints, yPoints, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);
	
	// Set up viewport
	gl.viewport(0, 0, xPoints, yPoints);
	
	// Use shader program
	gl.useProgram(this.gpuProgram);
	
	// Set uniforms
	 
	 
	// eslint-disable-next-line no-eval -- user-defined expression
	// eslint-disable-next-line no-eval -- user-defined expression
	let juliaC = eval(this.juliaC);
	gl.uniform2f(this.gpuUniforms.resolution, xPoints, yPoints);
	gl.uniform1f(this.gpuUniforms.startX, startX);
	gl.uniform1f(this.gpuUniforms.startY, startY);
	gl.uniform1f(this.gpuUniforms.endX, endX);
	gl.uniform1f(this.gpuUniforms.endY, endY);
	gl.uniform1i(this.gpuUniforms.maxIterations, maxIterations);
	gl.uniform2f(this.gpuUniforms.juliaC, juliaC[0], juliaC[1]);
	gl.uniform1i(this.gpuUniforms.isJulia, this.getAbsoluteValueOfComplexNumber(juliaC) !== 0 ? 1 : 0);
	
	// Create vertex buffer for full-screen quad
	let vertices = new Float32Array([
		-1, -1,
		1, -1,
		-1, 1,
		1, 1
	]);
	
	let vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	
	// Set up vertex attributes
	let positionLocation = gl.getAttribLocation(this.gpuProgram, 'a_position');
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	
	// Single efficient render pass
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, GL_QUAD_VERTICES);
	
	// Read back results
	let pixels = new Uint8Array(xPoints * yPoints * RGBA_COMPONENTS);
	gl.readPixels(0, 0, xPoints, yPoints, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	
	// Convert GPU results back to escape paths
	let validResults = 0;
	let escapedPoints = [];
	
	for (let i = 0; i < maxPoints; i++) {
		let pixelIndex = i * RGBA_COMPONENTS;
		let iterations = pixels[pixelIndex + 2];
		
		// Use the original points array to avoid coordinate reconstruction errors
		let originalPoint = points[i];
		if (!originalPoint) {
			console.warn('GPU: Point', i, 'is undefined, skipping');
			continue;
		}
		let x = originalPoint[0];
		let y = originalPoint[1];
		
		// Debug: log first few results
		if (i < 5) {
			debugLog('escapePaths', 'GPU point', i, ':', {
				x: x.toFixed(3), y: y.toFixed(3),
				iterations
			});
		}
		
		// Create escape path - always generate full path to match CPU behavior
		let c = [x, y];
		let escapePath;
		
		// Use the same logic as CPU to determine Julia vs Mandelbrot
		if (this.getAbsoluteValueOfComplexNumber(juliaC) !== 0) {
			escapePath = this.getJuliaEscapePath(juliaC, c, maxIterations, true);
		} else {
			escapePath = this.getJuliaEscapePath(c, juliaC, maxIterations, true);
		}
		
		// Debug: log first few escape paths
		if (i < 3) {
			debugLog('escapePaths', 'GPU generating escape path for point', i, ':', {
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
	
	debugLog('gpu', 'GPU generated', validResults, 'valid escape paths out of', maxPoints, 'total points');
	
	// Clean up
	gl.deleteTexture(outputTexture);
	gl.deleteFramebuffer(framebuffer);
	gl.deleteBuffer(vertexBuffer);
	
	debugLog('gpu', 'GPU generated', results.length, 'escape paths');
	return results;
},

"generateEscapePathsCPU"(points, maxIterations) {
	// Original CPU implementation
	const results = [];
	for (let i = 0; i < points.length; i++) {
		let c = points[i];
		 
		 
		// eslint-disable-next-line no-eval -- user-defined expression
		// eslint-disable-next-line no-eval -- user-defined expression
		let juliaC = eval(mandelbrotExplorer.juliaC);
		
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
});
