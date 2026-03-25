# Shader Separation

This document describes the separation of GPU shaders from the main JavaScript code into external GLSL files.

## Overview

The GPU acceleration feature in the Mandelbrot Explorer now uses external shader files instead of inline shader strings. This improves code organization, maintainability, and allows for better shader development tools.

## Files Added

### Shader Files
- `shaders/mandelbrot_vertex.glsl` - Vertex shader for GPU computation
- `shaders/mandelbrot_fragment.glsl` - Fragment shader for Mandelbrot iterations

### Loader Utility
- `shaderLoader.js` - Utility for loading and caching shader files

### Test Files
- `test_shader_loading.html` - Test page to verify shader loading works correctly

## Changes Made

### Main Application Files
- `mandelbrotexplorer.js` - Modified `createGPUProgram()` method to load shaders from external files
- `mandelbrotexplorer.htm` - Added shaderLoader.js script include
- `gpu_test.html` - Added shaderLoader.js script include  
- `happy420.html` - Added shaderLoader.js script include

## How It Works

1. **Shader Loading**: The `ShaderLoader` utility uses the Fetch API to load GLSL files asynchronously
2. **Caching**: Loaded shaders are cached to avoid repeated network requests
3. **Fallback**: If shader loading fails, the application falls back to CPU computation
4. **Error Handling**: Comprehensive error handling ensures the application continues to work even if shaders fail to load

## Shader Details

### Vertex Shader (`shaders/mandelbrot_vertex.glsl`)
Simple vertex shader that passes through position data for full-screen quad rendering.

### Fragment Shader (`shaders/mandelbrot_fragment.glsl`)
Complex fragment shader that:
- Computes Mandelbrot/Julia set iterations
- Handles complex number arithmetic
- Stores results efficiently in RGBA channels
- Supports both Mandelbrot and Julia set modes

## Testing

To test the shader separation:

1. Start a local web server: `python -m http.server 8000`
2. Open `test_shader_loading.html` in your browser
3. Check the console for detailed loading information
4. Verify that both shader loading and GPU initialization tests pass

## Benefits

- **Better Organization**: Shaders are now in dedicated files with proper syntax highlighting
- **Easier Development**: Shader files can be edited with specialized GLSL editors
- **Version Control**: Shader changes are tracked separately from JavaScript code
- **Reusability**: Shaders can be easily reused in other projects
- **Maintainability**: Shader code is easier to read and modify

## Compatibility

- No behavior changes: The application works exactly the same as before
- No import statements: Uses standard fetch API for loading
- Fallback support: Gracefully handles shader loading failures
- Browser compatibility: Works with all modern browsers that support WebGL

## File Structure

```
mandelbrotexplorer/
├── shaders/
│   ├── mandelbrot_vertex.glsl
│   └── mandelbrot_fragment.glsl
├── shaderLoader.js
├── test_shader_loading.html
├── mandelbrotexplorer.js (modified)
├── mandelbrotexplorer.htm (modified)
├── gpu_test.html (modified)
└── happy420.html (modified)
``` 