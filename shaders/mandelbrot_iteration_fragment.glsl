// Mandelbrot Explorer - Iteration-Centric Fragment Shader
// Computes all points for a given iteration in parallel
// This approach is much more GPU-efficient than point-centric computation
precision highp float;

uniform vec2 u_resolution;
uniform float u_startX;
uniform float u_startY;
uniform float u_endX;
uniform float u_endY;
uniform int u_maxIterations;
uniform vec2 u_juliaC;
uniform bool u_isJulia;
uniform int u_currentIteration;
uniform sampler2D u_previousIteration; // Texture containing previous iteration results

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
    
    // X coordinate represents the point index
    // Y coordinate represents the iteration number
    int pointIndex = int(coord.x);
    int iteration = int(coord.y);
    
    // Calculate the complex coordinate for this point
    vec2 normalizedCoord = vec2(coord.x / u_resolution.x, coord.y / u_resolution.y);
    float x = u_startX + normalizedCoord.x * (u_endX - u_startX);
    float y = u_startY - normalizedCoord.y * (u_startY - u_endY);
    
    vec2 c = vec2(x, y);
    vec2 z;
    
    // Determine if this is Julia or Mandelbrot
    if (u_isJulia) {
        // Julia set: c is fixed, z starts at the point
        z = c;
        c = u_juliaC;
    } else {
        // Mandelbrot set: c is the point, z starts at origin
        z = vec2(0.0, 0.0);
    }
    
    // If this is iteration 0, just output the initial z value
    if (iteration == 0) {
        gl_FragColor = vec4(z.x, z.y, 0.0, 1.0);
        return;
    }
    
    // For subsequent iterations, read the previous z value from texture
    vec2 prevZ;
    if (iteration > 0) {
        vec2 texCoord = vec2(coord.x / u_resolution.x, (coord.y - 1.0) / u_resolution.y);
        vec4 prevResult = texture2D(u_previousIteration, texCoord);
        prevZ = vec2(prevResult.x, prevResult.y);
    } else {
        prevZ = z;
    }
    
    // Perform one iteration
    vec2 newZ = mandelbrotIteration(prevZ, c);
    
    // Check if escaped
    float mag = complexMag(newZ);
    float escapeFlag = (mag > 2.0) ? 1.0 : 0.0;
    
    // Output: (z.x, z.y, iteration_count, escape_flag)
    gl_FragColor = vec4(newZ.x, newZ.y, float(iteration), escapeFlag);
} 