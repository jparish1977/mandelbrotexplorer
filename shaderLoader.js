// Shader loader utility for loading GLSL shader files
var ShaderLoader = {
	// Cache for loaded shaders
	shaderCache: {},
	
	// Load a shader file and return its content as a string
	loadShader: function(shaderPath) {
		return new Promise((resolve, reject) => {
			// Check cache first
			if (this.shaderCache[shaderPath]) {
				resolve(this.shaderCache[shaderPath]);
				return;
			}
			
			// Load the shader file
			fetch(shaderPath)
				.then(response => {
					if (!response.ok) {
						throw new Error(`Failed to load shader: ${response.status} ${response.statusText}`);
					}
					return response.text();
				})
				.then(shaderSource => {
					// Cache the loaded shader
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