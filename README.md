# Mandelbrot Explorer

An interactive web-based Mandelbrot set and Julia set explorer with 2D and 3D visualization capabilities. This project allows you to explore the fascinating world of fractals through an intuitive web interface with both classic and modern UI options. The system provides comprehensive mathematical exploration, visualizing both points inside the set and their escape dynamics.

## 🚀 **New: GPU Acceleration**

The Mandelbrot Explorer now features **WebGL GPU acceleration** for escape path generation, providing significant performance improvements for complex calculations while maintaining full mathematical accuracy and exploration capabilities.

### **GPU Features**
- **WebGL 2/1 Support**: Automatic fallback to WebGL 1 if WebGL 2 is unavailable
- **External Shader Files**: Modular shader architecture with separate vertex and fragment shaders
- **Performance Testing**: Built-in CPU vs GPU performance comparison tool
- **Mathematical Accuracy**: GPU results match CPU calculations exactly
- **Comprehensive Exploration**: Preserves all exploration capabilities including escape path visualization

## Features

### 🎨 **Dual Visualization Modes**
- **2D Mode**: Traditional top-down view of the Mandelbrot/Julia sets
- **3D Mode**: Interactive 3D particle visualization using Three.js
- Toggle between modes or view both simultaneously

### 🔍 **Interactive Exploration**
- **Zoom**: Double-click anywhere on the 2D canvas to zoom in
- **Camera Controls**: Full 3D camera controls with trackball navigation
- **Real-time Updates**: Adjust parameters and see changes instantly

### 🎛️ **Advanced Controls**
- **Iteration Settings**: Separate iteration limits for 2D and 3D modes
- **Cloud Resolution**: Control the density of 3D particle clouds
- **Palette Selection**: Choose from multiple color schemes
- **Particle Size**: Dynamic particle sizing based on iteration depth

### 🌈 **Color & Visual Effects**
- **Multiple Palettes**: Built-in color schemes including rainbow, fire, and custom gradients
- **Color Cycling**: Animated color transitions
- **Iteration Cycling**: Dynamic iteration count changes
- **Background Toggle**: Show/hide background elements

### 🔧 **Advanced Features**
- **Julia Set Mode**: Explore Julia sets with custom C values
- **Dual Z Mode**: Advanced mathematical transformations
- **Escape Path Visualization**: See how points escape the set and their complete trajectories
- **Comprehensive Exploration**: Visualize both points inside the set (full iteration sequences) and escaping points (escape paths)
- **Custom Filters**: Filter particles by iteration count and path length
- **Screen Capture**: Save your discoveries as images

### 🆕 **New: Alternative UI with CodeMirror Integration**
- **Modern Tabbed Interface**: Organized into Parameters, Rendering, Presets & Filters, and Settings
- **CodeMirror Code Editors**: Advanced syntax highlighting and code editing for all JavaScript expressions
- **Smart Autocomplete**: Context-aware suggestions with Ctrl+Space
- **Expandable Editors**: Click the 🗖 button to open larger editing windows
- **Real-time Validation**: Immediate feedback on code syntax and errors
- **Preset Integration**: Seamless integration with existing preset system

### 🔬 **Mathematical Exploration**
The Mandelbrot Explorer is designed for comprehensive mathematical visualization, not just simple set membership testing:

- **Inside the Set**: Points that don't escape get their complete iteration sequence (up to maxIterations), revealing the complex dynamics within the set
- **Escape Dynamics**: Points that escape get their full escape path, showing the trajectory and behavior as they leave the set
- **Boundary Exploration**: The system excels at exploring the complex boundary regions where escape behavior becomes intricate
- **3D Visualization**: Transform mathematical data into 3D particle clouds and "hair" effects for deeper insight

## Getting Started

### Prerequisites
- A modern web browser with WebGL support
- No additional software installation required

### Running the Application
1. Clone or download this repository
2. Open `mandelbrotexplorer.htm` in your web browser
3. The application will load with the new Alternative UI by default
4. Use the "Back to Classic UI" button to switch to the original interface

### GPU Performance Testing
Test the GPU acceleration capabilities:
1. Open `gpu_test.html` in your browser
2. Click "Run Performance Test" to compare CPU vs GPU performance
3. View side-by-side visualizations of CPU and GPU results
4. Check performance metrics including speedup and accuracy verification

### Basic Usage
1. **Start Exploring**: The default view shows the classic Mandelbrot set
2. **Zoom In**: Double-click on interesting areas to zoom in
3. **Switch to 3D**: Use the controls to enable 3D visualization
4. **Adjust Settings**: Modify iterations, palettes, and other parameters
5. **Experiment**: Try different Julia C values and custom filters
6. **Use CodeMirror**: Press Ctrl+Space in any code field for autocomplete suggestions

## UI Options

### 🆕 **Alternative UI (Default)**
The new Alternative UI provides a modern, tabbed interface with enhanced code editing capabilities:

#### **Tabbed Organization**
- **Parameters**: Basic settings like iterations, resolution, and palette
- **Rendering**: Advanced rendering controls and filters
- **Presets & Filters**: Mathematical parameters and custom expressions
- **Settings**: Display options and settings management

#### **CodeMirror Features**
- **Syntax Highlighting**: JavaScript code with proper syntax coloring
- **Smart Autocomplete**: Press Ctrl+Space for context-aware suggestions
- **Expandable Editing**: Click 🗖 to open larger editing windows
- **Real-time Updates**: Changes apply immediately as you type
- **Error Detection**: Visual feedback for syntax errors

#### **Context-Aware Autocomplete**
The autocomplete system provides intelligent suggestions based on:
- **Field Type**: Different suggestions for filters vs. mathematical expressions
- **Available Variables**: Shows relevant variables like `pathIndex`, `escapePath`, `iteration`
- **Built-in Functions**: Suggests Math functions and Mandelbrot Explorer methods
- **Common Patterns**: Offers frequently used expressions and patterns

### **Classic UI**
The original interface is still available for users who prefer the traditional layout:
- **Compact Design**: All controls in a single panel
- **Familiar Layout**: Traditional form-based interface
- **Quick Access**: All parameters visible at once

## Controls Reference

### Main Controls Panel
- **Max Iterations (2D/3D)**: Control the detail level of calculations
- **Cloud Resolution**: Set the density of 3D particles
- **Palette**: Choose from available color schemes
- **Random Step**: Enable random particle stepping for varied effects

### Advanced Settings
- **Shortened Escape Paths**: Filter between full and shortened escape paths
- **Particle Size**: Customize 3D particle dimensions
- **Dual Z Mode**: Enable advanced mathematical transformations
- **Cloud Length Filter**: Filter particles by escape path length
- **Cloud Iteration Filter**: Filter by iteration count

### Mathematical Parameters
- **Julia C**: Set the C value for Julia set exploration
- **Initial Z**: Define starting Z values
- **Escaping Z**: Customize escape condition calculations

### Animation Controls
- **Color Cycle**: Enable animated color transitions
- **Iteration Cycle**: Dynamic iteration count changes
- **Cycle Time**: Control animation speed
- **Cycle Frame**: Set animation frame position

### Camera Controls & Reset

- **3D Navigation**: Use your mouse to rotate, zoom, and pan the 3D view with TrackballControls.
- **Reset Camera**: The "Reset Camera" button always returns the camera to its original home position and orientation from when the app first loaded.
- **Load Settings**: Loading saved settings will snap the camera and controls to the saved state, but will NOT change the "home" position for reset.
- **Reset vs. Load**: "Reset" always returns to the original home state, while "Load" snaps to the saved state for exploration.

## 🆕 **CodeMirror Autocomplete Guide**

### **Using Autocomplete**
1. **Activate**: Press `Ctrl+Space` in any code editor field
2. **Navigate**: Use arrow keys to select suggestions
3. **Complete**: Press Enter or Tab to insert the selected suggestion
4. **Filter**: Start typing to filter suggestions

### **Available Variables**
The autocomplete system provides context-aware suggestions including:

#### **Common Variables**
- `pathIndex`: Current position in escape path (0-based)
- `iteration`: Current iteration number (1-based)
- `escapePath`: Array of all Z values in the path
- `index`: Particle index
- `newX`, `newY`: Current particle coordinates
- `z`: Current Z value

#### **Built-in Objects**
- `mandelbrotExplorer`: Main application object
- `Math`: JavaScript Math functions
- `console`: Browser console for debugging

#### **Type-Specific Suggestions**
Different fields show different suggestions:
- **Filters**: Boolean expressions and comparison operators
- **Mathematical**: Math functions and numerical expressions
- **Coordinates**: Position and transformation functions

### **Common Patterns**
The autocomplete includes frequently used patterns:
```javascript
// Filter patterns
"escapePath.length > 8"
"iteration % 2 == 0"
"pathIndex > 5"

// Mathematical patterns
"mandelbrotExplorer.xScale_3d / mandelbrotExplorer.maxIterations_3d"
"Math.sin(pathIndex) * 10"
"escapePath[pathIndex][0] * -1"
```

## Settings Persistence

- **Save Settings**: Saves all current parameters, including camera position and controls, to your browser's localStorage.
- **Load Settings**: Restores all parameters, including camera and controls, to the saved state.
- **Reset Camera**: Always returns to the original home state, not the last loaded state.

## Technical Details (Camera/Controls)

- **Camera State**: The application uses Three.js TrackballControls for 3D navigation. The "reset" function always returns to the initial camera state from when the controls were first created.
- **Settings Restore**: When loading settings, the camera and controls are set directly to the saved state, but the reset "home" state is not changed.

## Troubleshooting

### Camera/Controls Not Resetting as Expected?
- If you load settings and then use "Reset Camera," it will always return to the original home state from the start of your session, not the last loaded state.
- If you want to change the "home" state, reload the page with your desired view as the default.

### CodeMirror Issues?
- **Autocomplete not working**: Make sure you're pressing `Ctrl+Space` (not just `Space`)
- **Syntax errors**: Check the browser console for detailed error messages
- **Editor not responding**: Try refreshing the page or switching between UI modes

### GPU Acceleration Issues?
- **GPU not available**: The system automatically falls back to CPU if WebGL is not supported
- **Performance not improved**: Check the GPU test page to verify your browser's WebGL capabilities
- **Results don't match**: GPU and CPU results should be identical - if not, check browser console for errors

## Detailed Controls Guide

### 🎛️ **Core Parameters**

#### **Max Iterations (2D/3D)**
- **What it does**: Sets the maximum number of iterations for the Mandelbrot calculation
- **2D Mode**: Controls detail in the traditional top-down view (typically 32-256)
- **3D Mode**: Controls detail in the particle cloud (typically 100-1000+)
- **Higher values**: More detail but slower performance
- **Lower values**: Faster rendering but less detail
- **Tip**: Start with lower values for exploration, increase for final renders

#### **Cloud Resolution**
- **What it does**: Controls the density of particles in 3D visualization
- **Single value**: Uniform grid (e.g., `100`)
- **Multiple values**: Overlapping grids (e.g., `"43,101"`)
- **Higher values**: More particles, more detail, slower performance
- **Lower values**: Fewer particles, faster rendering, less detail
- **Default**: `"43,101"` (two-level detail system)

#### **Palette Selection**
- **What it does**: Changes the color scheme for both 2D and 3D visualizations
- **Built-in palettes**: Rainbow, fire, custom gradients, and more
- **Dynamic**: Changes apply immediately to both views
- **Tip**: Different palettes reveal different aspects of the fractal structure

#### **Random Step**
- **What it does**: Adds random variation to particle positions
- **Effect**: Creates more organic, less grid-like particle distributions
- **Use case**: When you want more natural-looking particle clouds
- **Performance**: Minimal impact on rendering speed

### 🔧 **Advanced Mathematical Controls**

#### **Julia C**
- **What it does**: Sets the C parameter for Julia set exploration
- **Format**: Complex number as `"[real, imaginary]"` (e.g., `"[-0.7, 0.27]"`)
- **Mandelbrot mode**: Use `"[0,0]"` for classic Mandelbrot set
- **Julia mode**: Any other value creates a Julia set
- **Presets**: Built-in values for famous Julia sets
- **Examples**:
  - `"[-0.7, 0.27]"` - Classic Julia set
  - `"[-0.835, -0.2321]"` - Another interesting pattern
  - `"[0.285, 0]"` - Symmetrical Julia set

#### **Initial Z**
- **What it does**: Sets the starting value for the Z iteration
- **Default**: `"0"` (standard Mandelbrot/Julia calculation)
- **Custom values**: Can use complex expressions
- **Effect**: Changes the mathematical starting point
- **Use case**: Exploring variations of the standard algorithm

#### **Escaping Z**
- **What it does**: Defines how the Z value is calculated for 3D particle positioning
- **Default**: Uses the magnitude of the current Z value
- **Custom expressions**: Can use complex mathematical formulas
- **Variables available**:
  - `pathIndex`: Current iteration index
  - `escapePath`: Array of all Z values in the escape path
  - `iteration`: Current iteration number
- **Examples**:
  - `"mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex])"` - Current Z magnitude
  - `"pathIndex"` - Use iteration count as Z value
  - `"escapePath.length"` - Use total path length

### 🎨 **Visual and Filtering Controls**

#### **Shortened Escape Paths**
- **What it does**: Filters which escape paths to display
- **Options**:
  - **Both**: Show all escape paths
  - **Shortened**: Only show paths that escape early (more interesting patterns)
  - **Full**: Only show paths that reach maximum iterations
- **Effect**: Changes which particles appear in the 3D visualization
- **Tip**: "Shortened" often shows the most interesting boundary regions

#### **Particle Size**
- **What it does**: Controls the size of 3D particles
- **Format**: JavaScript expression that evaluates to a number
- **Variables available**:
  - `mandelbrotExplorer.xScale_3d`: Current X scale
  - `mandelbrotExplorer.maxIterations_3d`: Maximum iterations
  - `index`: Particle index
- **Examples**:
  - `"0"` - Invisible particles (shows only positions)
  - `"mandelbrotExplorer.xScale_3d/mandelbrotExplorer.maxIterations_3d"` - Scale-based sizing
  - `"index/mandelbrotExplorer.iterationParticles.length"` - Index-based sizing

#### **Dual Z Mode**
- **What it does**: Enables advanced mathematical transformations
- **Effect**: Creates additional particles with modified coordinates
- **Multiplier**: JavaScript code that transforms particle positions
- **Use case**: Creating complex geometric patterns and effects
- **Performance**: Increases particle count (may slow rendering)

#### **Cloud Length Filter**
- **What it does**: Filters particles based on escape path length
- **Format**: JavaScript expression that returns true/false
- **Variables**: `escapePath.length`, `pathIndex`, `iteration`
- **Examples**:
  - `"escapePath.length > 8"` - Only paths longer than 8 iterations
  - `"escapePath.length == mandelbrotExplorer.maxIterations_3d"` - Only maximum length paths
  - `"escapePath.length % 10 == 0"` - Only paths with lengths divisible by 10

#### **Cloud Iteration Filter**
- **What it does**: Filters particles based on iteration count
- **Format**: JavaScript expression that returns true/false
- **Variables**: `iteration`, `pathIndex`, `escapePath`
- **Examples**:
  - `"iteration > 8"` - Only particles from iterations after 8
  - `"iteration == mandelbrotExplorer.maxIterations_3d"` - Only final iteration particles
  - `"iteration % 5 == 0"` - Only every 5th iteration

### 🎬 **Animation Controls**

#### **Color Cycle**
- **What it does**: Animates color transitions over time
- **Effect**: Colors shift through the palette continuously
- **Use case**: Creating dynamic, living visualizations
- **Performance**: Minimal impact on rendering

#### **Iteration Cycle**
- **What it does**: Dynamically changes the iteration count
- **Effect**: Particles appear and disappear as iteration count changes
- **Use case**: Exploring how detail changes with iteration count
- **Performance**: Requires recalculation (may be slow)

#### **Cycle Time**
- **What it does**: Controls the speed of iteration cycling
- **Format**: Number in milliseconds
- **Lower values**: Faster cycling
- **Higher values**: Slower cycling
- **Default**: 10ms

#### **Cycle Frame**
- **What it does**: Controls the width of the visible iteration window during cycling
- **Format**: Number (iteration count range)
- **Effect**: Determines how many iterations are visible at once during animation
- **Default**: 10 (shows ±5 iterations around the current cycle position)
- **Example**: With cycle frame 10, if current iteration is 50, shows iterations 45-55

### 🎮 **Display Controls**

#### **Reset Camera**
- **What it does**: Returns the 3D camera to its default position
- **Use case**: When you've lost your orientation in 3D space
- **Effect**: Resets zoom, rotation, and position

#### **Hide 2D**
- **What it does**: Toggles the 2D canvas visibility
- **Effect**: Gives more screen space to the 3D view
- **Use case**: When focusing on 3D exploration

#### **Toggle Background**
- **What it does**: Switches between black and white backgrounds
- **Effect**: Changes the 3D scene background color
- **Use case**: Better visibility depending on your palette choice

### 📸 **Capture and Generation**

#### **Generate Cloud**
- **What it does**: Creates a new 3D particle cloud
- **Use case**: After changing parameters that affect particle generation
- **Effect**: Recalculates all particles with current settings
- **Performance**: May take time depending on resolution and iterations

#### **Generate Hair**
- **What it does**: Creates line-based visualization instead of particles
- **Effect**: Shows escape paths as connected lines
- **Use case**: Seeing the actual paths points take as they escape
- **Performance**: Generally faster than particle clouds

#### **Capture**
- **What it does**: Takes a screenshot of the current view
- **Effect**: Saves the current visualization as an image
- **Use case**: Saving interesting discoveries
- **Format**: Click the captured image to open it in full size

## ⚠️ **JavaScript eval() Usage**

Several fields in the Mandelbrot Explorer use JavaScript's `eval()` function to execute user-provided code. This allows for powerful customization but also requires caution.

### 🔒 **Security Note**
- **Local Use Only**: This application is designed for local use only
- **No Network Access**: The eval() calls cannot access external resources
- **Sandboxed**: Code runs in the browser's JavaScript environment only
- **User Responsibility**: Only run this application with code you trust

### 📝 **Fields That Use eval()**

#### **🔄 Evaluated on Every Change**
These fields are evaluated immediately when you modify them:

- **Julia C**: `eval(this.juliaC)` - Converts string to complex number
- **Initial Z**: `eval("function() { " + value + " }")` - Creates function wrapper
- **Escaping Z**: `eval("function() { " + value + " }")` - Creates function wrapper
- **Cloud Length Filter**: `eval(value)` - Evaluates filter condition
- **Cloud Iteration Filter**: `eval(value)` - Evaluates filter condition
- **Dual Z Multiplier**: `eval(value)` - Executes transformation code
- **Particle Size**: `eval(value)` - Calculates particle dimensions
- **Cycle Time**: `eval(value)` - Converts to number for animation timing
- **Cycle Frame**: `eval(value)` - Converts to number for animation position

#### **🎯 Evaluated During Rendering**
These fields are evaluated during particle generation:

- **Cloud Length Filter**: `eval(cloudLengthFilter)` - Filters particles by path length
- **Cloud Iteration Filter**: `eval(cloudIterationFilter)` - Filters particles by iteration
- **Particle Size**: `eval(particleSize)` - Calculates size for each particle
- **Escaping Z**: `eval(escapingZ)` - Calculates Z value for each particle
- **Dual Z Multiplier**: `eval(dualZMultiplier)` - Applies transformations

### 💡 **Safe Usage Guidelines**

1. **Test Small**: Start with simple expressions before complex ones
2. **Use Built-in Variables**: Stick to the documented variables (pathIndex, escapePath, etc.)
3. **Avoid Side Effects**: Don't modify global variables or call external functions
4. **Validate Input**: Check your expressions work before applying to large datasets
5. **Backup Settings**: Save working configurations before experimenting

### 🛠️ **Common eval() Patterns**

#### **Safe Mathematical Expressions**
```javascript
// ✅ Safe - simple math
"pathIndex * 2"
"escapePath.length > 10"
"mandelbrotExplorer.xScale_3d / 2"

// ✅ Safe - using built-in functions
"mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex])"
"Math.sin(pathIndex) * 10"
```

#### **Avoid These Patterns**
```javascript
// ❌ Avoid - potential security issues
"alert('test')"
"window.location = 'http://example.com'"
"document.cookie = 'test'"

// ❌ Avoid - modifying globals
"window.globalVar = 123"
"mandelbrotExplorer.unauthorizedProperty = 'value'"
```

### 🔧 **When eval() Happens**

1. **Immediate Evaluation**: When you change a field and press Enter or click away
2. **Function Creation**: Complex fields create JavaScript functions for later use
3. **Rendering Time**: During particle generation for each point in the cloud
4. **Animation**: During color and iteration cycling

### 📊 **Performance Impact**

- **Simple expressions**: Minimal performance impact
- **Complex calculations**: May slow down particle generation
- **Function creation**: One-time cost when field is changed
- **Rendering evaluation**: Applied to every particle (can be expensive)

### 🎯 **Best Practices**

1. **Keep expressions simple** for better performance
2. **Use the documented variables** for predictable results
3. **Test expressions** with small datasets first
4. **Monitor performance** - complex expressions can slow rendering
5. **Document your custom expressions** for future reference

## 🔧 **Function Calling Patterns**

When you provide custom expressions in certain fields, the system creates JavaScript functions that are called at specific times during rendering. Here's exactly when and how each function is called:

### 📝 **Function Creation and Caching**

- **When created**: Functions are created when you change a field and press Enter or click away
- **Cached**: Functions are stored and reused until you change the field again
- **Performance**: This avoids recreating functions on every particle

### 🎯 **Function Calling Details**

#### **Initial Z Function**
```javascript
// Created from: Initial Z field
function() {
    // Your expression here
    return 0; // or your custom value
}

// Called: Once per escape path, before iteration begins
// Arguments: None
// Return: Number (starting Z value)
// Example: "0" or "Math.random() * 10"
```

#### **Cloud Length Filter Function**
```javascript
// Created from: Cloud Length Filter field
function(pathIndex, iteration, escapePath) {
    return /* your expression */;
}

// Called: For each iteration in each escape path
// Arguments:
//   - pathIndex: Current position in escape path (0-based)
//   - iteration: Current iteration number (1-based)
//   - escapePath: Array of all Z values in the path
// Return: Boolean (true = show particle, false = hide particle)
// Example: "escapePath.length > 8"
```

#### **Cloud Iteration Filter Function**
```javascript
// Created from: Cloud Iteration Filter field
function(pathIndex, iteration, escapePath) {
    return /* your expression */;
}

// Called: For each iteration in each escape path
// Arguments:
//   - pathIndex: Current position in escape path (0-based)
//   - iteration: Current iteration number (1-based)
//   - escapePath: Array of all Z values in the path
// Return: Boolean (true = show particle, false = hide particle)
// Example: "iteration > 8"
```

#### **Escaping Z Function**
```javascript
// Created from: Escaping Z field
function(pathIndex, iteration, escapePath) {
    // Your expression here
    return z; // or your calculated value
}

// Called: For each iteration in each escape path (except first)
// Arguments:
//   - pathIndex: Current position in escape path (0-based)
//   - iteration: Current iteration number (1-based)
//   - escapePath: Array of all Z values in the path
// Return: Number (Z coordinate for 3D positioning)
// Example: "mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex])"
```

#### **Particle Filter Function**
```javascript
// Created from: Particle Filter field (if it exists)
function(newX, newY, particleVector) {
    var allowed = /* your expression */;
    return {
        newX: newX,
        newY: newY,
        particleVector: particleVector,
        allowed: allowed
    };
}

// Called: For each particle before it's added to the scene
// Arguments:
//   - newX: X coordinate of the particle
//   - newY: Y coordinate of the particle
//   - particleVector: THREE.Vector3 object with position
// Return: Object with allowed (boolean) and modified coordinates
// Example: "newX > 0 && newY > 0"
```

#### **Dual Z Multiplier**
```javascript
// Created from: Dual Z Multiplier field
// Note: This is NOT wrapped in a function - executed directly with eval()

// Called: For each particle when Dual Z mode is enabled
// Context: Variables available in scope:
//   - pathIndex: Current position in escape path (0-based)
//   - iteration: Current iteration number (1-based)
//   - escapePath: Array of all Z values in the path
//   - newX: Current X coordinate (can be modified)
//   - newY: Current Y coordinate (can be modified)
//   - z: Current Z value (can be modified)
//   - newZ: Variable to set the new Z value
// Return: None (modifies newX, newY, newZ variables directly)
// Example: "newX = escapePath[pathIndex][0]; newY = escapePath[pathIndex][1]; newZ = z * -1;"
```

### ⏰ **Calling Frequency**

| Function | Frequency | Per Particle | Total Calls |
|----------|-----------|--------------|-------------|
| **Initial Z** | Once per escape path | No | ~1 per path |
| **Cloud Length Filter** | Every iteration | Yes | ~1000s per cloud |
| **Cloud Iteration Filter** | Every iteration | Yes | ~1000s per cloud |
| **Escaping Z** | Every iteration (except first) | Yes | ~1000s per cloud |
| **Particle Filter** | Every particle | Yes | ~1000s per cloud |
| **Dual Z Multiplier** | Every particle (when enabled) | Yes | ~1000s per cloud |

### 🚀 **Performance Considerations**

- **High-frequency functions** (filters, escaping Z) are called thousands of times
- **Keep expressions simple** for better performance
- **Avoid complex calculations** in frequently-called functions
- **Use built-in variables** instead of recalculating values
- **Test with low resolution** before using high resolution

### 💡 **Optimization Tips**

```javascript
// ❌ Slow - complex calculation every time
"Math.sin(pathIndex) * Math.cos(iteration) * Math.tan(escapePath.length)"

// ✅ Fast - use built-in values
"pathIndex * 2"
"escapePath.length > 10"
"mandelbrotExplorer.getAbsoluteValueOfComplexNumber(escapePath[pathIndex])"

// ✅ Fast - simple boolean logic
"iteration > 8 && iteration < 100"
"escapePath.length % 5 == 0"
```

### 🔍 **Debugging Functions**

If your functions aren't working as expected:

1. **Check return types**: Filters need boolean, others need numbers
2. **Verify variables**: Make sure you're using the correct variable names
3. **Test simple expressions**: Start with basic math before complex logic
4. **Check for errors**: Look at browser console for JavaScript errors
5. **Use console.log**: Add logging to see what values you're getting

## Understanding Cloud Resolution

The **cloud resolution** is one of the most important parameters for 3D visualization. It controls the **density and spacing** of particles in the 3D Mandelbrot cloud.

### 🎯 **What It Does**
Cloud resolution determines how many points are sampled across the complex plane to generate 3D particles. Think of it as the "grid density" for the 3D visualization.

### 📐 **How It Works**

#### **Single Resolution Mode**
- Enter a single number (e.g., `100`)
- Creates a uniform grid across the viewing area
- Spacing = `(endX - startX) / resolution`
- Example: Viewing from -2 to 2 with resolution 100 = spacing of 0.04

#### **Multiple Resolution Mode**
- Enter comma-separated values (e.g., `"43,101"`)
- Creates **multiple overlapping grids** at different densities
- Each resolution generates its own set of particles
- Final scale uses: `√(resolution1² + resolution2² + ...)`

### 🌟 **Practical Examples**

| Resolution | Effect | Use Case |
|------------|--------|----------|
| `10` | Very sparse, fast rendering | Quick overview |
| `50` | Medium density, good performance | General exploration |
| `100` | Good detail, balanced performance | Default exploration |
| `"43,101"` | Two-level detail system | Rich visualization |
| `"10,50,200"` | Three-level detail system | Maximum detail |
| `500` | Very dense, slow rendering | High-detail analysis |

### ⚡ **Performance Impact**

The cloud resolution directly affects:
- **Calculation count**: More resolution = more Mandelbrot iterations
- **Memory usage**: More particles = more 3D objects to store
- **Rendering speed**: More particles = slower frame rates

### 🎨 **Visual Effects**

- **Low resolution** (10-50): Shows overall structure, misses fine details
- **Medium resolution** (100-200): Good balance of detail and performance
- **High resolution** (500+): Shows intricate details, may be slow
- **Multiple resolutions**: Combines structure from low res with details from high res

### 💡 **Tips for Using Cloud Resolution**

1. **Start Low**: Begin with 50-100 for initial exploration
2. **Increase Gradually**: Find the sweet spot between detail and performance
3. **Use Multiple Values**: Try `"50,150"` for balanced detail
4. **Consider Your Hardware**: Higher resolutions need more GPU power
5. **Match to Zoom Level**: Zoomed-in areas can use higher resolution
6. **Experiment**: Try different combinations to see what works best

### 🔧 **Technical Implementation**

The system creates a grid of points and calculates the Mandelbrot iteration for each:
```javascript
// Simplified version of what happens internally
for( var x = startX; x < endX; x += spacing ) {
    for( var y = startY; y > endY; y -= spacing ) {
        // Calculate Mandelbrot iterations for this point
        // Create 3D particle based on escape path
    }
}
```

The cloud resolution is essentially your "sampling rate" for the 3D Mandelbrot visualization - it determines how finely you're sampling the mathematical space to create the particle cloud!

## File Structure

```
mandelbrotexplorer/
├── mandelbrotexplorer.htm    # Main HTML file
├── mandelbrotexplorer.js     # Core Mandelbrot calculation engine
├── ui.js                     # Classic user interface logic
├── altUI.js                  # 🆕 Alternative UI with CodeMirror integration
├── palettes.js               # Color palette definitions
├── presets.js                # Preset configurations
├── settingsManager.js        # Settings persistence
├── styles.css                # Visual styling (includes CodeMirror themes)
├── three.js                  # 3D graphics library
├── threeRenderer.js          # 3D rendering engine
├── TrackballControls.js      # 3D camera controls
├── Stats.js                  # Performance monitoring
├── gradientline.js           # Gradient utilities
├── canvasrenderer.js         # Canvas rendering utilities
├── projector.js              # 3D projection utilities
├── VRButton.js               # VR support (if applicable)
├── omggif.js                 # GIF creation utilities
└── fonts/                    # Custom fonts
    └── optimer_regular.typeface.json
```

## Technical Details

### Core Algorithm
The application implements the standard Mandelbrot set algorithm:
- For each point c in the complex plane
- Iterate z = z² + c starting with z = 0
- Count iterations until |z| > 2 (escape condition)
- Color based on iteration count

### 3D Visualization
- Uses Three.js for WebGL-based 3D rendering
- Particles represent escape paths in 3D space
- Z-axis typically represents iteration depth
- Supports custom particle sizing and filtering

### 🆕 **UI Architecture**
- **Dual Interface System**: Classic UI (ui.js) and Alternative UI (altUI.js)
- **CodeMirror Integration**: Advanced code editing with syntax highlighting
- **Context-Aware Autocomplete**: Smart suggestions based on field type and available variables
- **Real-time Synchronization**: Changes in one UI immediately reflect in the other
- **Modal Editing**: Expandable code editors for complex expressions

### Performance Features
- WebGL acceleration for smooth 3D rendering
- Configurable iteration limits for performance tuning
- Particle limit controls to prevent memory issues
- Real-time parameter updates
- CodeMirror optimization for large expressions

## Browser Compatibility

- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Internet Explorer**: Limited support (WebGL required)

## Tips for Exploration

1. **Start Simple**: Begin with the default Mandelbrot view
2. **Find Interesting Areas**: Look for the boundary regions where the set meets the escape area
3. **Experiment with Julia Sets**: Try different C values for unique patterns
4. **Use 3D Mode**: Switch to 3D to see escape paths in a new dimension
5. **Adjust Iterations**: Higher iteration counts reveal more detail but are slower
6. **Try Different Palettes**: Each palette reveals different aspects of the fractal
7. **Capture Discoveries**: Use the screen capture feature to save interesting finds

## Contributing

This is an open exploration project. Feel free to:
- Experiment with new mathematical transformations
- Add new color palettes
- Improve the user interface
- Optimize performance
- Add new visualization modes

## License

This project is open source. Feel free to use, modify, and distribute as you see fit.

---

**Happy Fractal Exploring!** 🌟

*Discover the infinite complexity hidden in simple mathematical formulas.*
