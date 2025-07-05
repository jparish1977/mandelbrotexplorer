// Mandelbrot Explorer - Vertex Shader
// Simple vertex shader for full-screen quad rendering in GPU computation
attribute vec2 a_position;
void main() {
	gl_Position = vec4(a_position, 0.0, 1.0);
} 