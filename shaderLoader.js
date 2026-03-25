// Shader loader utility for loading GLSL shader files
var ShaderLoader = {
	// Cache for loaded shaders
	shaderCache: {},

	// Embedded shaders for file:// protocol (fetch blocked by CORS)
	embeddedShaders: {
		'shaders/mandelbrot_vertex.glsl':
			'// Mandelbrot Explorer - Vertex Shader\n' +
			'attribute vec2 a_position;\n' +
			'void main() {\n' +
			'\tgl_Position = vec4(a_position, 0.0, 1.0);\n' +
			'}',

		'shaders/mandelbrot_fragment.glsl':
			'precision highp float;\n' +
			'uniform vec2 u_resolution;\n' +
			'uniform float u_startX;\n' +
			'uniform float u_startY;\n' +
			'uniform float u_endX;\n' +
			'uniform float u_endY;\n' +
			'uniform int u_maxIterations;\n' +
			'uniform vec2 u_juliaC;\n' +
			'uniform bool u_isJulia;\n' +
			'vec2 complexMul(vec2 a, vec2 b) {\n' +
			'\treturn vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);\n' +
			'}\n' +
			'float complexMag(vec2 z) {\n' +
			'\treturn sqrt(z.x * z.x + z.y * z.y);\n' +
			'}\n' +
			'vec2 mandelbrotIteration(vec2 z, vec2 c) {\n' +
			'\treturn complexMul(z, z) + c;\n' +
			'}\n' +
			'void main() {\n' +
			'\tvec2 coord = gl_FragCoord.xy;\n' +
			'\tvec2 normalizedCoord = coord / u_resolution;\n' +
			'\tfloat x = u_startX + normalizedCoord.x * (u_endX - u_startX);\n' +
			'\tfloat y = u_startY - normalizedCoord.y * (u_startY - u_endY);\n' +
			'\tif (x >= u_endX || y <= u_endY) {\n' +
			'\t\tgl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);\n' +
			'\t\treturn;\n' +
			'\t}\n' +
			'\tvec2 c = vec2(x, y);\n' +
			'\tvec2 z = vec2(0.0, 0.0);\n' +
			'\tvec2 juliaC = u_juliaC;\n' +
			'\tif (u_isJulia) {\n' +
			'\t\tz = c;\n' +
			'\t\tc = juliaC;\n' +
			'\t}\n' +
			'\tint iterations = 0;\n' +
			'\tfloat mag = 0.0;\n' +
			'\tvec2 lastZ = z;\n' +
			'\tfor (int i = 0; i < 1000; i++) {\n' +
			'\t\tif (i >= u_maxIterations) break;\n' +
			'\t\tz = mandelbrotIteration(z, c);\n' +
			'\t\tmag = complexMag(z);\n' +
			'\t\tif (mag > 2.0) {\n' +
			'\t\t\titerations = i;\n' +
			'\t\t\tbreak;\n' +
			'\t\t}\n' +
			'\t\tlastZ = z;\n' +
			'\t}\n' +
			'\tfloat xNorm = (c.x - u_startX) / (u_endX - u_startX);\n' +
			'\tfloat yNorm = (u_startY - c.y) / (u_startY - u_endY);\n' +
			'\tfloat magNorm = min(mag / 4.0, 1.0);\n' +
			'\tgl_FragColor = vec4(xNorm * 255.0, yNorm * 255.0, float(iterations), magNorm * 255.0);\n' +
			'}',

		'shaders/mandelbrot_iteration_fragment.glsl':
			'precision highp float;\n' +
			'uniform vec2 u_resolution;\n' +
			'uniform float u_startX;\n' +
			'uniform float u_startY;\n' +
			'uniform float u_endX;\n' +
			'uniform float u_endY;\n' +
			'uniform int u_maxIterations;\n' +
			'uniform vec2 u_juliaC;\n' +
			'uniform bool u_isJulia;\n' +
			'uniform int u_currentIteration;\n' +
			'uniform sampler2D u_previousIteration;\n' +
			'vec2 complexMul(vec2 a, vec2 b) {\n' +
			'    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);\n' +
			'}\n' +
			'float complexMag(vec2 z) {\n' +
			'    return sqrt(z.x * z.x + z.y * z.y);\n' +
			'}\n' +
			'vec2 mandelbrotIteration(vec2 z, vec2 c) {\n' +
			'    return complexMul(z, z) + c;\n' +
			'}\n' +
			'void main() {\n' +
			'    vec2 coord = gl_FragCoord.xy;\n' +
			'    int pointIndex = int(coord.x);\n' +
			'    int iteration = int(coord.y);\n' +
			'    vec2 normalizedCoord = vec2(coord.x / u_resolution.x, coord.y / u_resolution.y);\n' +
			'    float x = u_startX + normalizedCoord.x * (u_endX - u_startX);\n' +
			'    float y = u_startY - normalizedCoord.y * (u_startY - u_endY);\n' +
			'    vec2 c = vec2(x, y);\n' +
			'    vec2 z;\n' +
			'    if (u_isJulia) {\n' +
			'        z = c;\n' +
			'        c = u_juliaC;\n' +
			'    } else {\n' +
			'        z = vec2(0.0, 0.0);\n' +
			'    }\n' +
			'    if (iteration == 0) {\n' +
			'        gl_FragColor = vec4(z.x, z.y, 0.0, 1.0);\n' +
			'        return;\n' +
			'    }\n' +
			'    vec2 prevZ;\n' +
			'    if (iteration > 0) {\n' +
			'        vec2 texCoord = vec2(coord.x / u_resolution.x, (coord.y - 1.0) / u_resolution.y);\n' +
			'        vec4 prevResult = texture2D(u_previousIteration, texCoord);\n' +
			'        prevZ = vec2(prevResult.x, prevResult.y);\n' +
			'    } else {\n' +
			'        prevZ = z;\n' +
			'    }\n' +
			'    vec2 newZ = mandelbrotIteration(prevZ, c);\n' +
			'    float mag = complexMag(newZ);\n' +
			'    float escapeFlag = (mag > 2.0) ? 1.0 : 0.0;\n' +
			'    gl_FragColor = vec4(newZ.x, newZ.y, float(iteration), escapeFlag);\n' +
			'}'
	},

	// Load a shader file and return its content as a string
	loadShader: function(shaderPath) {
		return new Promise((resolve, reject) => {
			// Check cache first
			if (this.shaderCache[shaderPath]) {
				resolve(this.shaderCache[shaderPath]);
				return;
			}

			// On file:// protocol, use embedded shaders (fetch is blocked by CORS)
			if (location.protocol === 'file:') {
				var embedded = this.embeddedShaders[shaderPath];
				if (embedded) {
					this.shaderCache[shaderPath] = embedded;
					resolve(embedded);
				} else {
					reject(new Error('No embedded shader for: ' + shaderPath));
				}
				return;
			}

			// Load the shader file via fetch (works on http/https)
			fetch(shaderPath)
				.then(response => {
					if (!response.ok) {
						throw new Error('Failed to load shader: ' + response.status + ' ' + response.statusText);
					}
					return response.text();
				})
				.then(shaderSource => {
					this.shaderCache[shaderPath] = shaderSource;
					resolve(shaderSource);
				})
				.catch(error => {
					console.error('Error loading shader:', error);
					reject(error);
				});
		});
	},

	// Load both vertex and fragment shaders
	loadShaders: function(vertexPath, fragmentPath) {
		return Promise.all([
			this.loadShader(vertexPath),
			this.loadShader(fragmentPath)
		]).then(([vertexSource, fragmentSource]) => {
			return {
				vertex: vertexSource,
				fragment: fragmentSource
			};
		});
	},

	// Clear the shader cache
	clearCache: function() {
		this.shaderCache = {};
	}
};
