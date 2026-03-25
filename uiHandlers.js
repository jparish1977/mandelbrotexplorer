/* global mandelbrotExplorer, palettes, cancelAnimationFrame, animationFrameId, animate */
/* global mandelbrotExplorerPresets, showToast, THREE */
/* eslint-disable no-unused-vars */

// UI event handlers: update, toggle, and preset setter functions
// Extracted from ui.js for maintainability

// ── Update handlers (DOM → model) ────────────────────────────────────────
function update2dIterations(){
    mandelbrotExplorer.maxIterations_2d = parseInt(document.getElementById("maxIterations_2d").value);
    mandelbrotExplorer.drawMandelbrot();
}

function update3dIterations(){
    mandelbrotExplorer.maxIterations_3d = parseInt(document.getElementById("maxIterations_3d").value);
    mandelbrotExplorer.cloudMethods.clearCloudCache();
}

function updateCloudResolution(){
    mandelbrotExplorer.cloudResolution = document.getElementById("cloudResolution").value;
    mandelbrotExplorer.cloudMethods.clearCloudCache();
}

function updatePalette(){
    cancelAnimationFrame(animationFrameId);
    mandelbrotExplorer.setPalette( palettes[ document.getElementById("palette").value ] );
    animate();
}

function updateCloudLengthFilter()
{
    mandelbrotExplorer.cloudLengthFilter = document.getElementById("cloudLengthFilter").value;
    // No need to clear cache - filters are applied to cached escape paths
}

function updateCloudIterationFilter(){
    mandelbrotExplorer.cloudIterationFilter = document.getElementById("cloudIterationFilter").value;
    cancelAnimationFrame(animationFrameId);
    mandelbrotExplorer.displayCloudParticles();
    animate();
}

function updateInitialZ(){
    mandelbrotExplorer.initialZ = document.getElementById("initialZ").value;
    mandelbrotExplorer.cloudMethods.clearCloudCache();
}

function updateEscapingZ(){
    mandelbrotExplorer.escapingZ = document.getElementById("escapingZ").value;
    mandelbrotExplorer.cloudMethods.clearCloudCache();
}

function updateIterationCycleTime(){
     
    // eslint-disable-next-line no-eval -- user-defined expression
    // eslint-disable-next-line no-eval -- user-defined expression
    mandelbrotExplorer.iterationCycleTime = parseInt( eval( document.getElementById("iterationCycleTime").value ) );
}

function updateIterationCycleFrame(){
     
    // eslint-disable-next-line no-eval -- user-defined expression
    // eslint-disable-next-line no-eval -- user-defined expression
    mandelbrotExplorer.iterationCycleFrame = parseInt( eval( document.getElementById("iterationCycleFrame").value ) );
}

function updateTargetFrameRate(){
    mandelbrotExplorer.targetFrameRate = parseInt(document.getElementById("targetFrameRate").value);
    // Ensure the frame rate is reasonable (between 1 and 120)
    if (mandelbrotExplorer.targetFrameRate < 1) mandelbrotExplorer.targetFrameRate = 1;
    if (mandelbrotExplorer.targetFrameRate > 120) mandelbrotExplorer.targetFrameRate = 120;
    document.getElementById("targetFrameRate").value = mandelbrotExplorer.targetFrameRate;
}

function updateJuliaC(){
    mandelbrotExplorer.juliaC = document.getElementById("juliaC").value;
    mandelbrotExplorer.cloudMethods.clearCloudCache();
}

function updateStartX(){
    mandelbrotExplorer.startX = document.getElementById("startX").value;
    mandelbrotExplorer.cloudMethods.clearCloudCache();
    mandelbrotExplorer.drawMandelbrot(); 
    mandelbrotExplorer.drawMandelbrotCloud();
}

function updateStartY(){
    mandelbrotExplorer.startY = document.getElementById("startY").value;
    mandelbrotExplorer.cloudMethods.clearCloudCache();
    mandelbrotExplorer.drawMandelbrot(); 
    mandelbrotExplorer.drawMandelbrotCloud();
}

function updateParticleSize(){
    mandelbrotExplorer.particleSize = document.getElementById("particleSize").value;
}

function updateDualZEnabled(){
    mandelbrotExplorer.dualZ = document.getElementById("dualZEnabled").checked;
}

function updateDualZMultiplier(){
    mandelbrotExplorer.dualZMultiplier = document.getElementById("dualZMultiplier").value;
}

function updateParticleFilter(){
    mandelbrotExplorer.particleFilter = document.getElementById("particleFilter").value;
}

// ── Toggle handlers ──────────────────────────────────────────────────────
function toggleColorCycle()
{
    mandelbrotExplorer.continueColorCycle = document.getElementById("colorCycleCheckbox").checked ? true : false;
    if( mandelbrotExplorer.continueColorCycle )
    {
        mandelbrotExplorer.cycle2dColors();
        mandelbrotExplorer.cycleCloudColors();
    }
}

function toggleIterationCycle(){
    cancelAnimationFrame(animationFrameId);
    mandelbrotExplorer.continueIterationCycle = document.getElementById("iterationCycleCheckbox").checked ? true : false;
    if( mandelbrotExplorer.continueIterationCycle ){
        mandelbrotExplorer.cycleCloudIterations();
    }
    else{
        clearTimeout(mandelbrotExplorer._cloudIterationCyclerId);
        mandelbrotExplorer.displayCloudParticles();
    }
    animate();
}

function toggleControls(){
    if( document.getElementById("controls_maximized").style.display === "none" ){
        document.getElementById("controls_maximized").style.display = "";
        document.getElementById("controls_minimized").style.opacity = document.getElementById("controls").style.opacity;
        document.getElementById("controls_minimized").style["border-bottom-right-radius"] = "0em";
        document.getElementById("controls_minimized").style["border-bottom-left-radius"] = "0em";
    }
    else{
        document.getElementById("controls_maximized").style.display = "none";
        document.getElementById("controls_minimized").style.opacity = .25;
        document.getElementById("controls_minimized").style["border-bottom-right-radius"] = "1em";
        document.getElementById("controls_minimized").style["border-bottom-left-radius"] = "1em";
    }
}

function toggleBackground(){
    let color = new THREE.Color( 0x000000 );
    document.body.style.backgroundColor = 'rgb(0, 0, 0)';
    if(document.getElementById("toggleBackground").checked) {
        color = new THREE.Color( 0xFFFFFF );
        document.body.style.backgroundColor = 'rgb(255, 255, 255)';
    }
    
    if (mandelbrotExplorer.threeRenderer && mandelbrotExplorer.threeRenderer.scene) {
        mandelbrotExplorer.threeRenderer.scene.background = color;
    }
}

function toggleRandomStepping(){
    mandelbrotExplorer.randomizeCloudStepping = document.getElementById("randomStepCheckbox").checked;
    mandelbrotExplorer.cloudMethods.clearCloudCache();
}

function toggleGPUAcceleration(){
    mandelbrotExplorer.useGPU = document.getElementById("gpuAccelerationCheckbox").checked;
    
    if (mandelbrotExplorer.useGPU) {
        // Initialize GPU if not already done
        if (!mandelbrotExplorer.gpuContext) {
            mandelbrotExplorer.initGPU();
        }
        
        if (mandelbrotExplorer.gpuContext) {
            showToast('GPU acceleration enabled', 2000);
        } else {
            showToast('GPU acceleration failed to initialize, falling back to CPU', 3000);
            document.getElementById("gpuAccelerationCheckbox").checked = false;
            mandelbrotExplorer.useGPU = false;
        }
    } else {
        showToast('GPU acceleration disabled', 2000);
    }
    
    // Clear cache when switching between GPU/CPU
    mandelbrotExplorer.cloudMethods.clearCloudCache();
}

// ── Filter option loaders ────────────────────────────────────────────────
function loadFilterOptions()
{
    clearSelectOptions(document.getElementById("cloudLengthFilterPresets"));
    
    let lengthOption = document.createElement("option");
    lengthOption.text = "----";
    lengthOption.value = "";
        
    document.getElementById("cloudLengthFilterPresets").add(lengthOption);
    
    for( var presetName in mandelbrotExplorer.presets.cloudLengthFilter )
    {
        lengthOption = document.createElement("option");
        lengthOption.text = presetName;
        lengthOption.value = presetName;
        
        document.getElementById("cloudLengthFilterPresets").add(lengthOption);
    }
    
    // Load escapingZ presets
    clearSelectOptions(document.getElementById("escapingZPresets"));
    
    let escapingZOption = document.createElement("option");
    escapingZOption.text = "----";
    escapingZOption.value = "";
    document.getElementById("escapingZPresets").add(escapingZOption);
    
     
    // eslint-disable-next-line no-redeclare -- var re-declaration in for-in loop
    for( var presetName in mandelbrotExplorer.presets.mandelbrot.escapingZ )
    {
        escapingZOption = document.createElement("option");
        escapingZOption.text = presetName;
        escapingZOption.value = presetName;
        
        document.getElementById("escapingZPresets").add(escapingZOption);
    }
    
    // Load particle filter presets
    clearSelectOptions(document.getElementById("particleFilterPresets"));
    
    let particleFilterOption = document.createElement("option");
    particleFilterOption.text = "----";
    particleFilterOption.value = "";
    document.getElementById("particleFilterPresets").add(particleFilterOption);
    
     
    // eslint-disable-next-line no-redeclare -- var re-declaration in for-in loop
    for( var presetName in mandelbrotExplorer.presets.particleFilter )
    {
        particleFilterOption = document.createElement("option");
        particleFilterOption.text = presetName;
        particleFilterOption.value = presetName;
        
        document.getElementById("particleFilterPresets").add(particleFilterOption);
    }
    
    // Load dualZ multiplier presets
    clearSelectOptions(document.getElementById("dualZMultiplierPresets"));
    
    let dualZMultiplierOption = document.createElement("option");
    dualZMultiplierOption.text = "----";
    dualZMultiplierOption.value = "";
    document.getElementById("dualZMultiplierPresets").add(dualZMultiplierOption);
    
     
    // eslint-disable-next-line no-redeclare -- var re-declaration in for-in loop
    for( var presetName in mandelbrotExplorer.presets.dualZMultiplier )
    {
        dualZMultiplierOption = document.createElement("option");
        dualZMultiplierOption.text = presetName;
        dualZMultiplierOption.value = presetName;
        
        document.getElementById("dualZMultiplierPresets").add(dualZMultiplierOption);
    }
    
    // Load particle size presets
    clearSelectOptions(document.getElementById("particleSizePresets"));
    
    let particleSizeOption = document.createElement("option");
    particleSizeOption.text = "----";
    particleSizeOption.value = "";
    document.getElementById("particleSizePresets").add(particleSizeOption);
    
     
    // eslint-disable-next-line no-redeclare -- var re-declaration in for-in loop
    for( var presetName in mandelbrotExplorer.presets.particleSize )
    {
        particleSizeOption = document.createElement("option");
        particleSizeOption.text = presetName;
        particleSizeOption.value = presetName;
        
        document.getElementById("particleSizePresets").add(particleSizeOption);
    }
    
    // Load cloud iteration filter presets
    clearSelectOptions(document.getElementById("cloudIterationFilterPresets"));
    
    let cloudIterationFilterOption = document.createElement("option");
    cloudIterationFilterOption.text = "----";
    cloudIterationFilterOption.value = "";
    document.getElementById("cloudIterationFilterPresets").add(cloudIterationFilterOption);
    
     
    // eslint-disable-next-line no-redeclare -- var re-declaration in for-in loop
    for( var presetName in mandelbrotExplorer.presets.cloudIterationFilter )
    {
        cloudIterationFilterOption = document.createElement("option");
        cloudIterationFilterOption.text = presetName;
        cloudIterationFilterOption.value = presetName;
        
        document.getElementById("cloudIterationFilterPresets").add(cloudIterationFilterOption);
    }
    
    // Load initialZ presets
    clearSelectOptions(document.getElementById("initialZPresets"));
    
    let initialZOption = document.createElement("option");
    initialZOption.text = "----";
    initialZOption.value = "";
    document.getElementById("initialZPresets").add(initialZOption);
    
     
    // eslint-disable-next-line no-redeclare -- var re-declaration in for-in loop
    for( var presetName in mandelbrotExplorer.presets.initialZ )
    {
        initialZOption = document.createElement("option");
        initialZOption.text = presetName;
        initialZOption.value = presetName;
        
        document.getElementById("initialZPresets").add(initialZOption);
    }
}

function clearSelectOptions( selectObj )
{
    let i;
    for(i=selectObj.options.length-1;i>=0;i--)
    {
        selectObj.remove(i);
    }
}

// ── Preset setters ───────────────────────────────────────────────────────
function setCloudLengthFilterFromPreset(){
    const selectedPreset = document.getElementById("cloudLengthFilterPresets").value;
    if (selectedPreset && mandelbrotExplorer.presets.cloudLengthFilter[selectedPreset]) {
        const preset = mandelbrotExplorer.presets.cloudLengthFilter[selectedPreset];
        if (typeof preset === 'object' && preset.getCodeString) {
            // For object presets with getCodeString method
            const samplePathIndex = 1;
            const sampleIteration = 2;
            const sampleEscapePath = [[0,0], [1,1], [2,2]];
            mandelbrotExplorer.cloudLengthFilter = preset.getCodeString(samplePathIndex, sampleIteration, sampleEscapePath);
        } else if (typeof preset === 'string') {
            // For string presets, use directly
            mandelbrotExplorer.cloudLengthFilter = preset;
        }
        document.getElementById("cloudLengthFilter").value = mandelbrotExplorer.cloudLengthFilter;
        updateCloudLengthFilter();
    }
}

function setEscapingZFromPreset(){
    const selectedPreset = document.getElementById("escapingZPresets").value;
    if (selectedPreset && mandelbrotExplorer.presets.mandelbrot.escapingZ[selectedPreset]) {
        const preset = mandelbrotExplorer.presets.mandelbrot.escapingZ[selectedPreset];
        if (typeof preset === 'object' && preset.getCodeString) {
            // For object presets with getCodeString method
            const sampleEscapePath = [[0,0], [1,1], [2,2]];
            const samplePathIndex = 1;
            mandelbrotExplorer.escapingZ = preset.getCodeString(sampleEscapePath, samplePathIndex);
        } else if (typeof preset === 'string') {
            // For string presets, use directly
            mandelbrotExplorer.escapingZ = preset;
        }
        document.getElementById("escapingZ").value = mandelbrotExplorer.escapingZ;
    }
}

function setParticleFilterFromPreset(){
    const selectedPreset = document.getElementById("particleFilterPresets").value;
    if (selectedPreset && mandelbrotExplorer.presets.particleFilter[selectedPreset]) {
        const preset = mandelbrotExplorer.presets.particleFilter[selectedPreset];
        if (typeof preset === 'object' && preset.getCodeString) {
            // For object presets with getCodeString method
            const sampleNewX = 0.25;
            const sampleNewY = 0.25;
            const sampleParticleVector = new THREE.Vector3(0.25, 0.25, 0);
            mandelbrotExplorer.particleFilter = preset.getCodeString(sampleNewX, sampleNewY, sampleParticleVector);
        } else if (typeof preset === 'string') {
            // For string presets, use directly
            mandelbrotExplorer.particleFilter = preset;
        }
        document.getElementById("particleFilter").value = mandelbrotExplorer.particleFilter;
    }
}

function setDualZMultiplierFromPreset(){
    const selectedPreset = document.getElementById("dualZMultiplierPresets").value;
    if (selectedPreset && mandelbrotExplorer.presets.dualZMultiplier[selectedPreset]) {
        const preset = mandelbrotExplorer.presets.dualZMultiplier[selectedPreset];
        if (typeof preset === 'object' && preset.getCodeString) {
            // For object presets with getCodeString method
            const samplePathIndex = 1;
            const sampleIteration = 2;
            const sampleEscapePath = [[0,0], [1,1], [2,2]];
            const sampleNewX = 1;
            const sampleNewY = 1;
            const sampleZ = 0.5;
            mandelbrotExplorer.dualZMultiplier = preset.getCodeString(samplePathIndex, sampleIteration, sampleEscapePath, sampleNewX, sampleNewY, sampleZ);
        } else if (typeof preset === 'string') {
            // For string presets, use directly
            mandelbrotExplorer.dualZMultiplier = preset;
        }
        document.getElementById("dualZMultiplier").value = mandelbrotExplorer.dualZMultiplier;
    }
}

function setParticleSizeFromPreset(){
    const selectedPreset = document.getElementById("particleSizePresets").value;
    if (selectedPreset && mandelbrotExplorer.presets.particleSize[selectedPreset]) {
        const preset = mandelbrotExplorer.presets.particleSize[selectedPreset];
        if (typeof preset === 'object' && preset.getCodeString) {
            // For object presets with getCodeString method
            const sampleIndex = 0;
            const sampleIterationParticles = [];
            mandelbrotExplorer.particleSize = preset.getCodeString(sampleIndex, sampleIterationParticles);
        } else if (typeof preset === 'string') {
            // For string presets, use directly
            mandelbrotExplorer.particleSize = preset;
        }
        document.getElementById("particleSize").value = mandelbrotExplorer.particleSize;
    }
}

function setCloudIterationFilterFromPreset(){
    const selectedPreset = document.getElementById("cloudIterationFilterPresets").value;
    if (selectedPreset && mandelbrotExplorer.presets.cloudIterationFilter[selectedPreset]) {
        const preset = mandelbrotExplorer.presets.cloudIterationFilter[selectedPreset];
        if (typeof preset === 'object' && preset.getCodeString) {
            // For object presets with getCodeString method
            const samplePathIndex = 1;
            const sampleIteration = 2;
            const sampleEscapePath = [[0,0], [1,1], [2,2]];
            mandelbrotExplorer.cloudIterationFilter = preset.getCodeString(samplePathIndex, sampleIteration, sampleEscapePath);
        } else if (typeof preset === 'string') {
            // For string presets, use directly
            mandelbrotExplorer.cloudIterationFilter = preset;
        }
        document.getElementById("cloudIterationFilter").value = mandelbrotExplorer.cloudIterationFilter;
        updateCloudIterationFilter();
    }
}

function setInitialZFromPreset(){
    const selectedPreset = document.getElementById("initialZPresets").value;
    if (selectedPreset && mandelbrotExplorer.presets.initialZ[selectedPreset]) {
        const preset = mandelbrotExplorer.presets.initialZ[selectedPreset];
        if (typeof preset === 'object' && preset.getCodeString) {
            // For object presets with getCodeString method
            const sampleEscapePath = [[0,0], [1,1], [2,2]];
            mandelbrotExplorer.initialZ = preset.getCodeString(sampleEscapePath);
        } else if (typeof preset === 'string') {
            // For string presets, use directly
            mandelbrotExplorer.initialZ = preset;
        }
        document.getElementById("initialZ").value = mandelbrotExplorer.initialZ;
        updateInitialZ();
    }
}
