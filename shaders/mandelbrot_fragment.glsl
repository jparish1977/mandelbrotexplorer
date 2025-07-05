// Mandelbrot Explorer - Fragment Shader
// Computes Mandelbrot/Julia set iterations on GPU for escape path generation
// Supports both Mandelbrot and Julia set modes with complex number arithmetic
precision highp float;

uniform vec2 u_resolution;
uniform float u_startX;
uniform float u_startY;
uniform float u_endX;
uniform float u_endY;
uniform int u_maxIterations;
uniform vec2 u_juliaC;
uniform bool u_isJulia;

vec2 complexMul(vec2 a, vec2 b) {
	return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

float complexMag(vec2 z) {
	return sqrt(z.x * z.x + z.y * z.y);
}

vec2 mandelbrotIteration(vec2 z, vec2 c) {
	return complexMul(z, z) + c;
}

void main() {
	vec2 coord = gl_FragCoord.xy;
	
	// Normalize pixel coordinates to 0-1 range
	vec2 normalizedCoord = coord / u_resolution;
	
	// Map normalized coordinates to the complex plane using the area bounds
	float x = u_startX + normalizedCoord.x * (u_endX - u_startX);
	float y = u_startY - normalizedCoord.y * (u_startY - u_endY);
	
	// Check bounds
	if (x >= u_endX || y <= u_endY) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
		return;
	}
	
	vec2 c = vec2(x, y);
	vec2 z = vec2(0.0, 0.0);
	vec2 juliaC = u_juliaC;
	
	if (u_isJulia) {
		z = c;
		c = juliaC;
	}
	
	// Compute Mandelbrot iterations
	int iterations = 0;
	float mag = 0.0;
	vec2 lastZ = z;
	
	for (int i = 0; i < 1000; i++) {
		if (i >= u_maxIterations) break;
		
		z = mandelbrotIteration(z, c);
		mag = complexMag(z);
		
		if (mag > 2.0) {
			iterations = i;
			break;
		}
		lastZ = z;
	}
	
	// Store results efficiently:
	// R: normalized x coordinate (0-255)
	// G: normalized y coordinate (0-255) 
	// B: iteration count (0-255)
	// A: escape magnitude (0-255, scaled)
	float xNorm = (c.x - u_startX) / (u_endX - u_startX);
	float yNorm = (u_startY - c.y) / (u_startY - u_endY);
	float magNorm = min(mag / 4.0, 1.0); // Normalize magnitude to 0-1
	
	gl_FragColor = vec4(
		xNorm * 255.0, 
		yNorm * 255.0, 
		float(iterations), 
		magNorm * 255.0
	);
} 