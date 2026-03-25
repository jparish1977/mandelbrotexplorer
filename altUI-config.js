// altUI-config.js
// Configuration constants and field mappings for the alternative UI

/* global MBEUI, setCloudIterationFilterFromPreset,  */
/* global setCloudLengthFilterFromPreset, setDualZMultiplierFromPreset,  */
/* global setEscapingZFromPreset, setInitialZFromPreset,  */
/* global setParticleFilterFromPreset, setParticleSizeFromPreset */
window.MBEUI = window.MBEUI || {};

// Field mappings between original UI and alternative UI
MBEUI.fieldMappings = {
  // Basic parameters
  'maxIterations_2d': { original: 'maxIterations_2d', alt: 'alt-maxIterations_2d' },
  'maxIterations_3d': { original: 'maxIterations_3d', alt: 'alt-maxIterations_3d' },
  'cloudResolution': { original: 'cloudResolution', alt: 'alt-cloudResolution' },
  'randomStepCheckbox': { original: 'randomStepCheckbox', alt: 'alt-randomStepCheckbox' },
  'palette': { original: 'palette', alt: 'alt-palette' },
  'startX': { original: 'startX', alt: 'alt-startX' },
  'endX': { original: 'endX', alt: 'alt-endX' },
  'startY': { original: 'startY', alt: 'alt-startY' },
  'endY': { original: 'endY', alt: 'alt-endY' },
  
  // Rendering controls
  'particleSize': { original: 'particleSize', alt: 'alt-particleSize' },
  'dualZMultiplier': { original: 'dualZMultiplier', alt: 'alt-dualZMultiplier' },
  'dualZEnabled': { original: 'dualZEnabled', alt: 'alt-dualZEnabled' },
  'cloudLengthFilter': { original: 'cloudLengthFilter', alt: 'alt-cloudLengthFilter' },
  'cloudIterationFilter': { original: 'cloudIterationFilter', alt: 'alt-cloudIterationFilter' },
  'colorCycleCheckbox': { original: 'colorCycleCheckbox', alt: 'alt-colorCycleCheckbox' },
  'iterationCycleCheckbox': { original: 'iterationCycleCheckbox', alt: 'alt-iterationCycleCheckbox' },
  'gpuAccelerationCheckbox': { original: 'gpuAccelerationCheckbox', alt: 'alt-gpuAccelerationCheckbox' },
  'iterationCycleTime': { original: 'iterationCycleTime', alt: 'alt-iterationCycleTime' },
  'iterationCycleFrame': { original: 'iterationCycleFrame', alt: 'alt-iterationCycleFrame' },
  'targetFrameRate': { original: 'targetFrameRate', alt: 'alt-targetFrameRate' },
  
  // Presets and filters
  'juliaC': { original: 'juliaC', alt: 'alt-juliaC' },
  'initialZ': { original: 'initialZ', alt: 'alt-initialZ' },
  'escapingZ': { original: 'escapingZ', alt: 'alt-escapingZ' },
  'particleFilter': { original: 'particleFilter', alt: 'alt-particleFilter' },
  
  // Settings
  'hide2d': { original: 'hide2d', alt: 'alt-hide2d' },
  'toggleBackground': { original: 'toggleBackground', alt: 'alt-toggleBackground' },
  
  // Radio button groups
  'shortenedFilter': { original: 'shortenedFilter', alt: 'alt-shortenedFilter', type: 'radio' }
};

// Preset field mappings
MBEUI.presetMappings = {
  'particleSizePresets': { textarea: 'particleSize', altCM: 'alt-particleSize' },
  'dualZMultiplierPresets': { textarea: 'dualZMultiplier', altCM: 'alt-dualZMultiplier' },
  'cloudLengthFilterPresets': { textarea: 'cloudLengthFilter', altCM: 'alt-cloudLengthFilter' },
  'cloudIterationFilterPresets': { textarea: 'cloudIterationFilter', altCM: 'alt-cloudIterationFilter' },
  'initialZPresets': { textarea: 'initialZ', altCM: 'alt-initialZ' },
  'escapingZPresets': { textarea: 'escapingZ', altCM: 'alt-escapingZ' },
  'particleFilterPresets': { textarea: 'particleFilter', altCM: 'alt-particleFilter' }
};

// Preset setter function mappings
MBEUI.presetSetters = {
  'particleSizePresets': setParticleSizeFromPreset,
  'dualZMultiplierPresets': setDualZMultiplierFromPreset,
  'cloudLengthFilterPresets': setCloudLengthFilterFromPreset,
  'cloudIterationFilterPresets': setCloudIterationFilterFromPreset,
  'initialZPresets': setInitialZFromPreset,
  'escapingZPresets': setEscapingZFromPreset,
  'particleFilterPresets': setParticleFilterFromPreset
};

// CodeMirror configuration
MBEUI.codeMirrorConfig = {
  lineNumbers: true,
  mode: 'javascript',
  theme: 'material',
  indentUnit: 2,
  tabSize: 2,
  lineWrapping: true,
  foldGutter: true,
  gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
  extraKeys: {
    'Ctrl-Space': 'autocomplete'
  }
};

// Common variables for autocomplete
MBEUI.commonVars = [
  'pathIndex',
  'iteration', 
  'escapePath',
  'index',
  'iterationParticles',
  'newX',
  'newY', 
  'z'
];

// JavaScript globals for autocomplete
MBEUI.jsGlobals = [
  'console', 'document', 'window', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURI', 'decodeURI',
  'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'Date', 'RegExp', 'Error', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet'
];

// JavaScript keywords for autocomplete
MBEUI.jsKeywords = [
  'function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
  'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'delete',
  'typeof', 'instanceof', 'in', 'with', 'this', 'super', 'class', 'extends', 'static',
  'async', 'await', 'yield', 'import', 'export', 'default', 'from', 'as'
];

// Mandelbrot Explorer specific variables for autocomplete
MBEUI.mandelbrotVars = [
  'mandelbrotExplorer',
  'mandelbrotExplorer.startX',
  'mandelbrotExplorer.startY', 
  'mandelbrotExplorer.endX',
  'mandelbrotExplorer.endY',
  'mandelbrotExplorer.maxIterations_3d',
  'mandelbrotExplorer.cloudResolution',
  'mandelbrotExplorer.getAbsoluteValueOfComplexNumber',
  'mandelbrotExplorer.getJuliaEscapePath'
]; 