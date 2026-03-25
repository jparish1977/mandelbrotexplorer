// UI Logic for Mandelbrot Explorer
// Extracted from mandelbrotexplorer.htm

// Global variables
/* global mandelbrotExplorer, cancelTimeout, THREE, ThreeJSRenderer, Stats, SettingsManager,  */
/* global palettes, buildAlternativeUI, cancelAnimationFrame, URLSearchParams */
/* global toggleGPUAcceleration, clearSelectOptions, loadFilterOptions */
let tjStats = null;
let animationFrameId;
let restoreContextTimer = null;
let originalHomeState = null;

// Screen capture functionality
function openScreenCap(){
    const newWindow = window.open("");
    
    const img = document.getElementById("screen_cap").cloneNode(false);
    img.removeAttribute('height');
    img.removeAttribute('onclick');
    
    newWindow.document.write(img.outerHTML);
}

function getScreenCap(){
    const dataUrl = mandelbrotExplorer.threeRenderer.renderer.domElement.toDataURL();
    
    let img = document.getElementById("screen_cap");
    if( !img ) {
        const table = document.getElementById("controls_table");
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        img = document.createElement('img');
        img.id = 'screen_cap'
        
        cell.appendChild(img);
        row.appendChild(cell);
        table.appendChild(row);
    }
    
    img.src = dataUrl;
    img.height = 240;
}

// Utility functions
function dumpBrot(){
    const values =[];
    const tries = [];
    for(let i = 0; i < 1000; i++){
    
        for(let i2 = 0;i2 < 2; i2++){
            let useX = Math.random() * 2;
            let useY = Math.random() * 2;
            while(tries.indexOf(`${useX  },${  useY}`) > -1){
                useX = Math.random() * 2;
                useY = Math.random() * 2;
            }
            
            tries.push(`${useX  },${  useY}`);
            tries.push(`${-useX  },${  -useY}`);
            
            const escapePaths = getSymetricalEscapePaths(useX, useY, 1024);
            if(escapePaths[0].length === 1024){
                values.push(`${useX  },${  useY}`);
            }
            
            if(escapePaths[1].length === 1024){
                values.push(`${-useX  },${  -useY}`);
            }
        }
    }
    
    console.log(`[${  values.length  }]\n${  values.join('\n')}`);
}

function getSymetricalEscapePaths(x, y, maxIterations){
    const result = [];
    
    result.push(mandelbrotExplorer.getJuliaEscapePath([x,y], [0,0], maxIterations));
    result.push(mandelbrotExplorer.getJuliaEscapePath([-x,-y], [0,0], maxIterations));
    
    return result;
}

// Filter functions
function setShortenedFilter(){
    switch(document.querySelector("input[name='shortenedFilter']:checked").value){
        case "both":
            mandelbrotExplorer.onlyFull = false;
            mandelbrotExplorer.onlyShortened = false;
            break;
        case "shortened":
            mandelbrotExplorer.onlyFull = false;
            mandelbrotExplorer.onlyShortened = true;
            break;
        case "full":
            mandelbrotExplorer.onlyFull = true;
            mandelbrotExplorer.onlyShortened = false;
            break;
    }
}

// Window and canvas resize functions
function onWindowResize( event ) {
    mandelbrotExplorer.canvas_2d.width = window.innerWidth / 2;
    mandelbrotExplorer.canvas_2d.height = window.innerHeight;

    if(document.getElementById("hide2d").checked){
        mandelbrotExplorer.canvas_3d.style.left = 0;
        mandelbrotExplorer.canvas_3d.width = window.innerWidth;
        mandelbrotExplorer.canvas_3d.height = window.innerHeight;
    }
    else{
        mandelbrotExplorer.canvas_3d.style.left = `${window.innerWidth / 2  }px`;
        mandelbrotExplorer.canvas_3d.width = window.innerWidth / 2;
        mandelbrotExplorer.canvas_3d.height = window.innerHeight;
        
        mandelbrotExplorer.drawMandelbrot();
    }
    resizeCloud();
}

function resizeCloud(){
    cancelAnimationFrame(animationFrameId); 
    
    if (mandelbrotExplorer.threeRenderer && mandelbrotExplorer.threeRenderer.renderer) {
        mandelbrotExplorer.threeRenderer.renderer.setSize( mandelbrotExplorer.canvas_3d.width, mandelbrotExplorer.canvas_3d.height );
    }

    if (mandelbrotExplorer.threeRenderer && mandelbrotExplorer.threeRenderer.camera) {
        mandelbrotExplorer.threeRenderer.camera.aspect = mandelbrotExplorer.canvas_3d.width / mandelbrotExplorer.canvas_3d.height;
        mandelbrotExplorer.threeRenderer.camera.updateProjectionMatrix();
    }

    animate();
}

// Zoom and interaction functions
function zoomToDblClick( sender, evt ){
    cancelAnimationFrame(animationFrameId); 
    let horizontalRange = Math.abs( mandelbrotExplorer.startX - mandelbrotExplorer.endX );
    const horizontalRangeOffset = horizontalRange * mandelbrotExplorer.zoomFactor;
    let verticalRange = Math.abs( mandelbrotExplorer.startY - mandelbrotExplorer.endY );
    const verticalRangeOffset = verticalRange * mandelbrotExplorer.zoomFactor;
    
    if( evt.ctrlKey ){
        // zoom out
        horizontalRange += horizontalRangeOffset;
        verticalRange += verticalRangeOffset;
    }
    else if(!evt.altKey && !evt.shiftKey){
        // zoom in
        horizontalRange -= horizontalRangeOffset;
        verticalRange -= verticalRangeOffset;
    }
    
    const canvasX = evt.pageX - sender.offsetLeft;
    const canvasY = evt.pageY - sender.offsetTop;

    const selectedC = [(( canvasX - mandelbrotExplorer.xOffset ) * mandelbrotExplorer.xScale_2d ), (( mandelbrotExplorer.yOffset - canvasY ) * mandelbrotExplorer.yScale_2d )];
    const startX = (( canvasX - mandelbrotExplorer.xOffset ) * mandelbrotExplorer.xScale_2d ) - (horizontalRange / 2);
    const startY = (( mandelbrotExplorer.yOffset - canvasY ) * mandelbrotExplorer.yScale_2d ) + (verticalRange / 2);
    
    if(evt.shiftKey){
        mandelbrotExplorer.juliaC = `[${ selectedC[0]  },${  selectedC[1] }]`;
        document.getElementById("juliaC").value = mandelbrotExplorer.juliaC;
    }
    else{
        mandelbrotExplorer.startX = startX;
        mandelbrotExplorer.endX = startX + horizontalRange;
        mandelbrotExplorer.startY = startY;
        mandelbrotExplorer.endY = startY - verticalRange;
    }
    mandelbrotExplorer.drawMandelbrot(); 
    mandelbrotExplorer.drawMandelbrotCloud();
    
    loadParameterValues();
    animate();
}

// Parameter update functions

// Toggle functions

// Control visibility functions
function highliteControls(){
    document.getElementById("controls").style.opacity = 1;
    document.getElementById("controls_minimized").style.opacity = 1;
    document.getElementById("controls_maximized").style.opacity = 1;
}

function dimControls(){
    document.getElementById("controls").style.opacity = 0.5;
    document.getElementById("controls_minimized").style.opacity = 0.5;
    if( document.getElementById("controls_maximized").style.display === "none" ){
        document.getElementById("controls_minimized").style.opacity = 0.25;
    }
    document.getElementById("controls_maximized").style.opacity = 0.5;
}

// Display functions
function hide2D(forceHide){
    if(forceHide || document.getElementById("hide2d").checked){
        document.getElementById("hide2d").checked = true;
        mandelbrotExplorer.canvas_2d.style.display = "none";
        mandelbrotExplorer.canvas_3d.style.left = 0;
        mandelbrotExplorer.canvas_3d.width = window.innerWidth;
        mandelbrotExplorer.canvas_3d.height = window.innerHeight;
    }
    else{
        mandelbrotExplorer.canvas_2d.style.display = "";
        mandelbrotExplorer.canvas_3d.style.left = `${window.innerWidth / 2  }px`;
        mandelbrotExplorer.canvas_3d.width = window.innerWidth / 2;
        mandelbrotExplorer.canvas_3d.height = window.innerHeight;
        mandelbrotExplorer.drawMandelbrot();
    }
    
    resizeCloud();
}

function drawPlanes(){
    const width = 4;
    const height = 4;
    const widthSegments = 32;
    const heightSegments = 32;

    const geometry = new THREE.PlaneGeometry( width, height, widthSegments, heightSegments );
    const material = new THREE.MeshBasicMaterial( {color: {"R": 255, "G": 0, "B": 0, "A": 0.25}, side: THREE.DoubleSide} );
    const plane1 = new THREE.Mesh( geometry, material );
    const plane2 = new THREE.Mesh( geometry, material );
    plane2.rotation.x = Math.PI / 2;
    const plane3 = new THREE.Mesh( geometry, material );
    plane3.rotation.y = Math.PI / 2;
    if (mandelbrotExplorer.threeRenderer && mandelbrotExplorer.threeRenderer.scene) {
        mandelbrotExplorer.threeRenderer.scene.add( plane1 );
        mandelbrotExplorer.threeRenderer.scene.add( plane2 );
        mandelbrotExplorer.threeRenderer.scene.add( plane3 );
    }
}

// Load and setup functions
function loadParameterValues(){
    document.getElementById("startX").value = mandelbrotExplorer.startX;
    document.getElementById("startY").value = mandelbrotExplorer.startY;
    
    document.getElementById("maxIterations_2d").value = mandelbrotExplorer.maxIterations_2d;
    document.getElementById("maxIterations_3d").value = mandelbrotExplorer.maxIterations_3d;
    document.getElementById("cloudResolution").value = mandelbrotExplorer.cloudResolution;
    document.getElementById("randomStepCheckbox").checked = mandelbrotExplorer.randomizeCloudStepping;
    // Set GPU checkbox without triggering the onchange event
    const gpuCheckbox = document.getElementById("gpuAccelerationCheckbox");
    if (gpuCheckbox) {
      gpuCheckbox.onchange = null; // Temporarily disable event handler
      gpuCheckbox.checked = mandelbrotExplorer.useGPU;
      gpuCheckbox.onchange = toggleGPUAcceleration; // Re-enable event handler
    }
    document.getElementById("initialZ").value = mandelbrotExplorer.initialZ;
    document.getElementById("escapingZ").value = mandelbrotExplorer.escapingZ;
    document.getElementById("iterationCycleTime").value = mandelbrotExplorer.iterationCycleTime;
    document.getElementById("iterationCycleFrame").value = mandelbrotExplorer.iterationCycleFrame;
    document.getElementById("targetFrameRate").value = mandelbrotExplorer.targetFrameRate;
    document.getElementById("cloudLengthFilter").value = mandelbrotExplorer.cloudLengthFilter;
    document.getElementById("cloudIterationFilter").value = mandelbrotExplorer.cloudIterationFilter;
    document.getElementById("juliaC").value = mandelbrotExplorer.juliaC;
    
    document.getElementById("shortenedFilter_shortened").checked = false;
    document.getElementById("shortenedFilter_both").checked = false;
    document.getElementById("shortenedFilter_full").checked = false;
    if(mandelbrotExplorer.onlyShortened){
        document.getElementById("shortenedFilter_shortened").checked = true;
    }
    else if(mandelbrotExplorer.onlyFull){
        document.getElementById("shortenedFilter_full").checked = true;
    }
    else{
        document.getElementById("shortenedFilter_both").checked = true;
    }
    
    document.getElementById("dualZEnabled").checked = mandelbrotExplorer.dualZ;
    document.getElementById("dualZMultiplier").value = mandelbrotExplorer.dualZMultiplier;
    document.getElementById("particleSize").value = mandelbrotExplorer.particleSize;
    document.getElementById("particleFilter").value = mandelbrotExplorer.particleFilter;
}

function loadQueryStringParams(){
    const params = new URLSearchParams(window.location.search);
    
    const useAntialiasing = params.get('antialias') === '1' ? 
        true 
        : params.get('antialias') === '0' ? 
            false : 
            ThreeJSRenderer.rendererOptions.antialias;
    
    const precisionValues = [
        'highp', 
        'mediump', 
        'lowp'
    ];
    const requestedPrecision = params.get('precision');
    const usePrecision = precisionValues.includes(requestedPrecision) ? 
        requestedPrecision 
        : ThreeJSRenderer.rendererOptions.precision;
    
    const show2d = params.get('show2d') === '1' ? true : false;
    
    return {
        antialias: useAntialiasing,
        precision: usePrecision,
        show2d
    }
}

function loadPaletteOptions()
{
    clearSelectOptions(document.getElementById("palette"));
    for( const name in palettes )
    {
        if( Array.isArray(palettes[name]) )
        {
            const option = document.createElement("option");
            option.text = name;
            option.value = name;
            if( palettes[name] === mandelbrotExplorer.palette )
            {
                option.selected = true;
            }
            document.getElementById("palette").add(option);
        }
    }
}



// Store the original home state for the camera and controls
function saveOriginalHomeState() {
    const controls = mandelbrotExplorer.threeRenderer.controls;
    if (controls && !originalHomeState) {
        originalHomeState = {
            position: controls.position0.clone(),
            target: controls.target0.clone()
        };
    }
}

function restoreCameraAndControlsFromStorage() {
    const settings = JSON.parse(localStorage.getItem(SettingsManager.storageKey));
    const controls = mandelbrotExplorer.threeRenderer.controls;
    if (controls) controls.enabled = false; // Disable controls during restore
    if (settings && settings.cameraState) {
        SettingsManager.restoreCameraState(mandelbrotExplorer, settings.cameraState);
    }
    if (settings && settings.controlsState && controls) {
        if (settings.controlsState.target) {
            controls.target.set(
                settings.controlsState.target.x,
                settings.controlsState.target.y,
                settings.controlsState.target.z
            );
        }
        if (settings.controlsState.object && settings.controlsState.object.position) {
            controls.object.position.set(
                settings.controlsState.object.position.x,
                settings.controlsState.object.position.y,
                settings.controlsState.object.position.z
            );
        }
        controls.update();
    }
    if (mandelbrotExplorer.threeRenderer.render) {
        mandelbrotExplorer.threeRenderer.render();
    }
    if (controls) controls.enabled = true; // Re-enable controls after restore
}

// Add a function to reset to the original home state
function resetCameraToOriginalHome() {
    const controls = mandelbrotExplorer.threeRenderer.controls;
    if (controls && originalHomeState) {
        controls.target0.copy(originalHomeState.target);
        controls.position0.copy(originalHomeState.position);
        controls.reset();
        if (mandelbrotExplorer.threeRenderer.render) {
            mandelbrotExplorer.threeRenderer.render();
        }
    }
}

function loadSettingsFromStorage(){
    if (mandelbrotExplorer.loadSettings()) {
        loadParameterValues();
        loadPaletteOptions(); // Refresh palette dropdown
        // Regenerate the current view with loaded settings
        if (mandelbrotExplorer.threeRenderer && mandelbrotExplorer.threeRenderer.scene) {
            generateCloud();
        }
        showToast('Settings loaded successfully!');
    } else {
        showToast('No saved settings found.');

        loadParameterValues();
        loadPaletteOptions(); // Refresh palette dropdown
        // Generate cloud with default values even when no settings are found
        if (mandelbrotExplorer.threeRenderer && mandelbrotExplorer.threeRenderer.scene) {
            generateCloud();
        }
    }
}

function showToast(message, duration = 2500) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast show";
    setTimeout(function() {
        toast.className = toast.className.replace("show", "");
    }, duration);
}

// Generation functions
function generateHair(){
    if(!confirm("Hair takes some time to grow...are you sure?")){
        return false;
    }
    if(!mandelbrotExplorer.canvas_3d){
        mandelbrotExplorer.canvas_3d = document.getElementById("mandelbrotCanvas3d");
    }
    
    const aspect = mandelbrotExplorer.canvas_3d.height / mandelbrotExplorer.canvas_3d.width;
    const startX = mandelbrotExplorer.startX === null ? -2 : mandelbrotExplorer.startX;
    const endX = mandelbrotExplorer.endX === null ? 2 : mandelbrotExplorer.endX;
    const horizontalRange = Math.abs( startX - endX );
    const verticalRange = horizontalRange * aspect;
    
    const startY = mandelbrotExplorer.startY === null ? (verticalRange / 2) : mandelbrotExplorer.startY;
    const endY = mandelbrotExplorer.endY === null ? (verticalRange / -2) : mandelbrotExplorer.endY;

    mandelbrotExplorer.drawMandelbrotsHair({
        "startX": mandelbrotExplorer.startX,
        "endX": mandelbrotExplorer.endX,
        "startY": mandelbrotExplorer.startY,
        "endY": mandelbrotExplorer.endY,
        "maxIterations_3d": mandelbrotExplorer.maxIterations_3d,
        "cloudResolution": mandelbrotExplorer.cloudResolution
    });
    if(mandelbrotExplorer.threeRenderer && mandelbrotExplorer.threeRenderer.renderer){
        mandelbrotExplorer.threeRenderer.renderer.context.canvas.addEventListener("webglcontextlost", function(event) {
            event.preventDefault();
            cancelAnimationFrame(animationFrameId); 
        }, false);

        mandelbrotExplorer.threeRenderer.renderer.context.canvas.addEventListener("webglcontextrestored", function(event) {
            if(restoreContextTimer !== null){
                cancelTimeout(restoreContextTimer);
            }
            restoreContextTimer = setTimeout(function(){restoreContext();animate();}, 500)
        }, false);            
    }
    animate();
}

function generateCloud(){
    //debugger;
    if(!mandelbrotExplorer.canvas_3d){
        mandelbrotExplorer.canvas_3d = document.getElementById("mandelbrotCanvas3d");
    }
    
    const aspect = mandelbrotExplorer.canvas_3d.height / mandelbrotExplorer.canvas_3d.width;
    const startX = mandelbrotExplorer.startX === null ? -2 : mandelbrotExplorer.startX;
    const endX = mandelbrotExplorer.endX === null ? 2 : mandelbrotExplorer.endX;
    const horizontalRange = Math.abs( startX - endX );
    const verticalRange = horizontalRange * aspect;
    
    const startY = mandelbrotExplorer.startY === null ? (verticalRange / 2) : mandelbrotExplorer.startY;
    const endY = mandelbrotExplorer.endY === null ? (verticalRange / -2) : mandelbrotExplorer.endY;

    mandelbrotExplorer.drawMandelbrotCloud({
        "startX": mandelbrotExplorer.startX,
        "endX": mandelbrotExplorer.endX,
        "startY": mandelbrotExplorer.startY,
        "endY": mandelbrotExplorer.endY,
        "maxIterations_3d": mandelbrotExplorer.maxIterations_3d,
        "cloudResolution": mandelbrotExplorer.cloudResolution
    });
    if(mandelbrotExplorer.threeRenderer && mandelbrotExplorer.threeRenderer.renderer){
        mandelbrotExplorer.threeRenderer.renderer.context.canvas.addEventListener("webglcontextlost", function(event) {
            event.preventDefault();
            cancelAnimationFrame(animationFrameId); 
        }, false);

        mandelbrotExplorer.threeRenderer.renderer.context.canvas.addEventListener("webglcontextrestored", function(event) {
            if(restoreContextTimer !== null){
                cancelTimeout(restoreContextTimer);
            }
            restoreContextTimer = setTimeout(function(){restoreContext();animate();}, 500)
        }, false);            
    }
    animate();
}

// Context restoration
function restoreContext(){
    mandelbrotExplorer.restoringContext = true;
    mandelbrotExplorer.canvas_3d =  document.getElementById("mandelbrotCanvas3d");
    
    // Reinitialize the ThreeJSRenderer
    mandelbrotExplorer.threeRenderer.init(mandelbrotExplorer.canvas_3d, {
        startX: mandelbrotExplorer.startX,
        endX: mandelbrotExplorer.endX,
        startY: mandelbrotExplorer.startY,
        endY: mandelbrotExplorer.endY
    });
    
    // Recreate particle systems
    for( const systemIndex in mandelbrotExplorer.particleSystems ){
        let colorIndex = systemIndex;
        while( colorIndex >= mandelbrotExplorer.palette.length  ) {
            colorIndex -= mandelbrotExplorer.palette.length;
        }
        const color = mandelbrotExplorer.palette[ colorIndex ];
        
        const pMaterial = mandelbrotExplorer.threeRenderer.createParticleMaterial(color, 0);
        
        mandelbrotExplorer.particleSystems[systemIndex] = mandelbrotExplorer.threeRenderer.addParticleSystem(
            mandelbrotExplorer.particleSystems[parseInt(systemIndex)].geometry,
            pMaterial
        );
    }
    
    mandelbrotExplorer.displayCloudParticles();
    // Always restore camera/controls state after context restore
    //restoreCameraAndControlsFromStorage();
    //setTimeout(restoreCameraAndControlsFromStorage, 50); // Try restoring again after a short delay
    mandelbrotExplorer.restoringContext = false;
}

// Animation and rendering
let lastFrameTime = 0;

function animate() {
    animationFrameId = requestAnimationFrame( animate );
    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;
    const frameInterval = 1000 / mandelbrotExplorer.targetFrameRate; // Time between frames in milliseconds
    // Only render if enough time has passed since last frame
    if (deltaTime >= frameInterval) {
        tjStats.update();
        mandelbrotExplorer.threeRenderer.update();
        render();
        lastFrameTime = currentTime;
    }
}

function render() {
    mandelbrotExplorer.threeRenderer.render();
}

// Initialization
function init()
{
    tjStats = new Stats();
    tjStats.domElement.style.position = 'fixed';
    tjStats.domElement.style.bottom = '0.5em';
    tjStats.domElement.style.right = '0.5em';
    tjStats.domElement.style.left = '';
    tjStats.domElement.style.top = '';
    tjStats.domElement.style.zIndex = '2000';
    document.body.appendChild( tjStats.domElement );
    const params = loadQueryStringParams();
    
    dimControls();
    loadPaletteOptions();
    loadFilterOptions();
                
    const canvas_2d = document.getElementById("mandelbrotCanvas2d");
    canvas_2d.width = window.innerWidth / 2;
    canvas_2d.height = window.innerHeight;
    const aspect = canvas_2d.height / canvas_2d.width;
    const startX = -2;
    const endX = 2;
    const horizontalRange = Math.abs( startX - endX );
    const verticalRange = horizontalRange * aspect;
    
    mandelbrotExplorer.palette = palettes[ document.getElementById("palette").value ];
    mandelbrotExplorer.canvas_2d = canvas_2d;

    mandelbrotExplorer.canvas_3d =  document.getElementById("mandelbrotCanvas3d");
    mandelbrotExplorer.canvas_3d.style.left = `${window.innerWidth / 2  }px`;
    mandelbrotExplorer.canvas_3d.width = window.innerWidth / 2;
    mandelbrotExplorer.canvas_3d.height = window.innerHeight;

    // Initialize ThreeJSRenderer
    mandelbrotExplorer.init(mandelbrotExplorer.canvas_3d, params);

    // Check GPU availability and provide feedback
    const gpuInfo = window.checkGPUAvailability();
    if (gpuInfo.available) {
        	// debugLog('gpu', 'GPU available:', gpuInfo.renderer, gpuInfo.version);
        showToast(`GPU detected: ${gpuInfo.renderer}`, 3000);
    } else {
        console.warn('GPU not available:', gpuInfo.reason);
        showToast(`GPU acceleration not available: ${gpuInfo.reason}`, 4000);
        // Disable GPU checkbox if not available
        document.getElementById("gpuAccelerationCheckbox").disabled = true;
    }

    // Load saved settings after renderer/camera/controls are initialized
    loadSettingsFromStorage();
    
    // Load parameter values after settings are loaded
    loadParameterValues();
    
    // generateCloud(); // Removed redundant call
    if(!params.show2d){
        hide2D(true);
    } else {
        mandelbrotExplorer.drawMandelbrot();
    }
    window.onresize = onWindowResize;
    
    // Setup alternate UI event listeners
    if (window.MBEUI && typeof window.MBEUI.setupAltUIEventListeners === 'function') {
        window.MBEUI.setupAltUIEventListeners();
    }
} 

// ── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    init();
    setTimeout(function() {
        try {
            if (window.buildAlternativeUI) {
                buildAlternativeUI();
                document.getElementById('controls').style.display = 'none';
                document.getElementById('alternativeUI').style.display = '';
            } else {
                console.warn('Alternative UI not available, keeping classic UI');
            }
        } catch (error) {
            console.error('Error loading alternative UI:', error);
        }
    }, 500);
});