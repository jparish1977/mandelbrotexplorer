# GPU Acceleration Tests

This folder contains various test files for GPU acceleration and performance testing of the Mandelbrot Explorer.

## Test Files

### Main Test Files
- **`gpu_test.html`** - Comprehensive GPU performance test with side-by-side CPU vs GPU comparison
- **`gpu_test_simplified.html`** - Modular version of the GPU test using separate JavaScript modules
- **`gpu_test_debug.html`** - Step-by-step GPU initialization diagnostics

### Test Modules
- **`gpu_test_utils.js`** - Utility functions for rendering and test point generation
- **`gpu_test_runner.js`** - Test execution logic and performance measurement
- **`gpu_test_ui.js`** - UI event handlers and display functions

### Assets
- **`shaderTest.png`** - Test image for shader validation

## Usage

1. **Run the main GPU test**: Open `gpu_test.html` in a web browser
2. **Run the simplified test**: Open `gpu_test_simplified.html` for modular testing
3. **Debug GPU issues**: Use `gpu_test_debug.html` for step-by-step diagnostics

## Test Features

- **Performance Comparison**: CPU vs GPU escape path generation
- **Visual Output**: Side-by-side canvas rendering of results
- **Detailed Metrics**: Compute time, render time, and performance analysis
- **Error Handling**: Graceful fallback to CPU when GPU fails
- **GPU Readiness Check**: Waits for GPU initialization before testing

## Notes

- All test files reference the main application files from the parent directory (`../`)
- Tests require a WebGL-capable browser
- GPU acceleration must be enabled in the main application
- Test results are displayed in real-time with detailed performance metrics 