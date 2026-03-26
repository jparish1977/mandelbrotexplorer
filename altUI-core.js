// altUI-core.js
// Core alternative UI functionality - building, populating, and managing the UI

/* global MBEUI, MutationObserver, mandelbrotExplorer, palettes,  */
/* global initAltUICodeMirror5, refreshVisibleAltUICM, setupAltUICMModal,  */
/* global setupAltUIEventListeners */
window.MBEUI = window.MBEUI || {};

// Build the alternative UI
function buildAlternativeUI() {
    // debugLog('ui', 'buildAlternativeUI called');
    const altUI = document.getElementById('alternativeUI');
    if (!altUI || altUI.dataset.built) return;
    
    // Check if all required functions are available
    if (typeof populateAltUIFields === 'undefined' || 
        typeof setupAltUIEventListeners === 'undefined' || 
        typeof setupAltUITabs === 'undefined' ||
        typeof initAltUICodeMirror5 === 'undefined') {
        console.warn('Alternative UI dependencies not loaded yet, retrying...');
        setTimeout(buildAlternativeUI, 100);
        return;
    }
    
    // Check if mandelbrotExplorer is available
    if (typeof mandelbrotExplorer === 'undefined') {
        console.warn('mandelbrotExplorer not available yet, retrying...');
        setTimeout(buildAlternativeUI, 100);
        return;
    }
    
    // debugLog('ui', 'Building alternative UI...');
    altUI.dataset.built = 'true';
    altUI.innerHTML = `
      <div class="alt-ui-container">
        <header class="alt-ui-header" id="alt-ui-header">
          <button id="alt-collapseBtn" class="alt-ui-collapse" title="Collapse">v</button>
          <h2 id="alt-ui-title" style="display:inline-block;margin-left:0.5em;">Mandelbrot Explorer</h2>
          <button id="switchBackBtn" class="alt-ui-back">Back to Classic UI</button>
        </header>
        <div class="alt-ui-actions">
          <button onclick="mandelbrotExplorer.threeRenderer.controls.reset()">Reset Camera</button>
          <button onclick="syncAltUIToModel(); generateHair();">Generate Hair</button>
          <button onclick="syncAltUIToModel(); generateCloud();">Generate Cloud</button>
          <button onclick="mandelbrotExplorer.clearMandelbrotHair();">Clear Hair</button>
          <button onclick="mandelbrotExplorer.clearMandelbrotCloud();">Clear Cloud</button>
        </div>
        <nav class="alt-ui-tabs">
          <button class="alt-ui-tab active" data-tab="parameters">Parameters</button>
          <button class="alt-ui-tab" data-tab="rendering">Rendering</button>
          <button class="alt-ui-tab" data-tab="presets">Presets & Filters</button>
          <button class="alt-ui-tab" data-tab="settings">Settings</button>
        </nav>
        <main class="alt-ui-main">
          <section class="alt-ui-section alt-ui-tabpanel" data-tabpanel="parameters" style="display:block;">
            <h3>Parameters</h3>
            <div class="alt-ui-fields" id="alt-ui-fields">
              <label for="alt-maxIterations_2d">Max Iterations (2d)</label>
              <input type="number" id="alt-maxIterations_2d" min="1" />
              <label for="alt-maxIterations_3d">Max Iterations (3d)</label>
              <input type="number" id="alt-maxIterations_3d" min="1" />
              <label for="alt-cloudResolution">Cloud Resolution</label>
              <input type="text" id="alt-cloudResolution" style="width:10em;" />
              <label for="alt-randomStepCheckbox">Random Step</label>
              <input type="checkbox" id="alt-randomStepCheckbox" />
              <label for="alt-palette">Palette</label>
              <select id="alt-palette"></select>
              <label>startX</label>
              <input type="text" id="alt-startX" readonly />
              <label>endX</label>
              <input type="text" id="alt-endX" readonly />
              <label>startY</label>
              <input type="text" id="alt-startY" readonly />
              <label>endY</label>
              <input type="text" id="alt-endY" readonly />
              <label>Shortened Escape Paths</label>
              <div id="alt-shortenedFilter" style="display:flex;gap:0.5em;">
                <label><input type="radio" name="alt-shortenedFilter" value="both">Both</label>
                <label><input type="radio" name="alt-shortenedFilter" value="shortened">Shortened</label>
                <label><input type="radio" name="alt-shortenedFilter" value="full">Full</label>
              </div>
            </div>
          </section>
          <section class="alt-ui-section alt-ui-tabpanel" data-tabpanel="rendering" style="display:none;">
            <h3>Rendering</h3>
            <div class="alt-ui-render-controls" id="alt-ui-render-controls">
              <div class="alt-ui-fieldgroup">
                <div class="alt-ui-fieldrow">
                  <label for="alt-particleSize">Particle Size</label>
                  <select id="alt-particleSizePresets">
                    <option value="">----</option>
                  </select>
                  <button class="alt-ui-cm-popout" onclick="openAltUICM('alt-particleSize')" title="Open in popup editor">⤢</button>
                </div>
                <textarea id="alt-particleSize"></textarea>
              </div>
              <div class="alt-ui-fieldgroup">
                <div class="alt-ui-fieldrow">
                  <label for="alt-dualZMultiplier">Dual Z Multiplier</label>
                  <select id="alt-dualZMultiplierPresets">
                    <option value="">----</option>
                  </select>
                  <label style="margin-left:1em;"><input type="checkbox" id="alt-dualZEnabled" /> Dual Z Enabled</label>
                  <button class="alt-ui-cm-popout" onclick="openAltUICM('alt-dualZMultiplier')" title="Open in popup editor">⤢</button>
                </div>
                <textarea id="alt-dualZMultiplier"></textarea>
              </div>
              <div class="alt-ui-fieldgroup">
                <div class="alt-ui-fieldrow">
                  <label for="alt-cloudLengthFilter">Cloud Length Filter</label>
                  <select id="alt-cloudLengthFilterPresets">
                    <option value="">----</option>
                  </select>
                  <button class="alt-ui-cm-popout" onclick="openAltUICM('alt-cloudLengthFilter')" title="Open in popup editor">⤢</button>
                </div>
                <textarea id="alt-cloudLengthFilter"></textarea>
              </div>
              <div class="alt-ui-fieldgroup">
                <div class="alt-ui-fieldrow">
                  <label for="alt-cloudIterationFilter">Cloud Iteration Filter</label>
                  <select id="alt-cloudIterationFilterPresets">
                    <option value="">----</option>
                  </select>
                  <button class="alt-ui-cm-popout" onclick="openAltUICM('alt-cloudIterationFilter')" title="Open in popup editor">⤢</button>
                </div>
                <textarea id="alt-cloudIterationFilter"></textarea>
              </div>
              <div class="alt-ui-fieldgroup">
                <div class="alt-ui-fieldrow">
                  <label for="alt-colorCycleCheckbox">Color Cycle</label>
                  <input type="checkbox" id="alt-colorCycleCheckbox" />
                  <label for="alt-iterationCycleCheckbox" style="margin-left:1.5em;">Iteration Cycle</label>
                  <input type="checkbox" id="alt-iterationCycleCheckbox" />
                  <label for="alt-gpuAccelerationCheckbox" style="margin-left:1.5em;">GPU Acceleration</label>
                  <input type="checkbox" id="alt-gpuAccelerationCheckbox" />
                </div>
                <div class="alt-ui-fieldrow">
                  <label for="alt-iterationCycleTime">Cycle Time</label>
                  <input type="text" id="alt-iterationCycleTime" style="width:3em;" />
                  <label for="alt-iterationCycleFrame" style="margin-left:1.5em;">Cycle Frame</label>
                  <input type="text" id="alt-iterationCycleFrame" style="width:3em;" />
                  <label for="alt-targetFrameRate" style="margin-left:1.5em;">Target FPS:</label>
                  <input type="text" id="alt-targetFrameRate" style="width:3em;" />
                </div>
                <div class="alt-ui-fieldrow">
                  <label for="alt-curvePoints">Curve Pts:</label>
                  <input type="text" id="alt-curvePoints" style="width:3em;" />
                </div>
                <div class="alt-ui-fieldrow">
                  <button id="alt-captureBtn" type="button">Capture</button>
                </div>
                <div id="alt-capture-gallery" style="display:flex;flex-wrap:wrap;gap:4px;padding:4px;max-height:200px;overflow-y:auto;">
                </div>
              </div>
            </div>
          </section>
          <section class="alt-ui-section alt-ui-tabpanel" data-tabpanel="presets" style="display:none;">
            <h3>Presets & Filters</h3>
            <div class="alt-ui-presets" id="alt-ui-presets">
              <div class="alt-ui-fieldgroup">
                <div class="alt-ui-fieldrow">
                  <label for="alt-juliaC">Julia C</label>
                  <button class="alt-ui-cm-popout" onclick="openAltUICM('alt-juliaC')" title="Open in popup editor">⤢</button>
                </div>
                <textarea id="alt-juliaC"></textarea>
              </div>
              <div class="alt-ui-fieldgroup">
                <div class="alt-ui-fieldrow">
                  <label for="alt-initialZ">Initial Z</label>
                  <select id="alt-initialZPresets">
                    <option value="">----</option>
                  </select>
                  <button class="alt-ui-cm-popout" onclick="openAltUICM('alt-initialZ')" title="Open in popup editor">⤢</button>
                </div>
                <textarea id="alt-initialZ"></textarea>
              </div>
              <div class="alt-ui-fieldgroup">
                <div class="alt-ui-fieldrow">
                  <label for="alt-escapingZ">Escaping Z</label>
                  <select id="alt-escapingZPresets">
                    <option value="">----</option>
                  </select>
                  <button class="alt-ui-cm-popout" onclick="openAltUICM('alt-escapingZ')" title="Open in popup editor">⤢</button>
                </div>
                <textarea id="alt-escapingZ"></textarea>
              </div>
              <div class="alt-ui-fieldgroup">
                <div class="alt-ui-fieldrow">
                  <label for="alt-particleFilter">Particle Filter</label>
                  <select id="alt-particleFilterPresets">
                    <option value="">----</option>
                  </select>
                  <button class="alt-ui-cm-popout" onclick="openAltUICM('alt-particleFilter')" title="Open in popup editor">⤢</button>
                </div>
                <textarea id="alt-particleFilter"></textarea>
              </div>
            </div>
          </section>
          <section class="alt-ui-section alt-ui-tabpanel" data-tabpanel="settings" style="display:none;">
            <h3>Settings</h3>
            <div class="alt-ui-settings" id="alt-ui-settings">
              <label><input type="checkbox" id="alt-hide2d" /> Hide 2D</label>
              <label><input type="checkbox" id="alt-toggleBackground" /> Toggle Background</label>
              <br><br>
              <button onclick="mandelbrotExplorer.saveSettings()">Save Settings</button>
              <button onclick="loadSettingsFromStorage()">Load Settings</button>
              <button onclick="mandelbrotExplorer.clearSettings()">Clear Settings</button>
              <br><br>
              <div class="alt-ui-fieldgroup">
                <h4>Cache Management</h4>
                <div class="alt-ui-fieldrow">
                  <button onclick="clearCloudCache();">Clear Cloud Cache</button>
                  <button onclick="showCacheStatus();">Show Cache Status</button>
                </div>
                <div id="alt-cacheStatus" style="margin-top: 0.5em; font-size: 0.9em; color: #666;"></div>
              </div>
            </div>
          </section>
        </main>
        <footer class="alt-ui-footer">
          <span id="alt-ui-toast"></span>
        </footer>
      </div>
      
      <!-- CodeMirror Modal -->
      <div id="alt-ui-cm-modal" style="display: none;">
        <div class="alt-ui-cm-modal-backdrop"></div>
        <div class="alt-ui-cm-modal-dialog">
          <div class="alt-ui-cm-modal-header">
            <h3 id="alt-ui-cm-modal-title">Edit Code</h3>
            <button id="alt-ui-cm-modal-close">×</button>
          </div>
          <textarea id="alt-ui-cm-modal-textarea"></textarea>
          <div class="alt-ui-cm-modal-actions">
            <button id="alt-ui-cm-modal-save">Save</button>
            <button id="alt-ui-cm-modal-cancel">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    // Collapse button logic
    const container = altUI.querySelector('.alt-ui-container');
    const header = altUI.querySelector('.alt-ui-header');
    const collapseBtn = altUI.querySelector('#alt-collapseBtn');
    if (collapseBtn && container && header) {
      collapseBtn.addEventListener('click', function() {
        container.classList.toggle('collapsed');
        header.classList.toggle('collapsed');
      });
    }
    
    // Initialize the UI components after the DOM is built
    setTimeout(() => {
      try {
        // Populate fields with current values (from MBE/state) when switching to altUI
        if (typeof populateAltUIFields === 'function') {
          populateAltUIFields();
        } else {
          console.warn('populateAltUIFields not available');
        }
        
        // Attach event listeners for altUI fields (these update MBE and classic UI as needed)
        if (typeof setupAltUIEventListeners === 'function') {
          setupAltUIEventListeners();
        } else {
          console.warn('setupAltUIEventListeners not available');
        }
        
        // Setup tab switching
        if (typeof setupAltUITabs === 'function') {
          setupAltUITabs();
        } else {
          console.warn('setupAltUITabs not available');
        }
        
        // Initialize CodeMirror
        if (typeof initAltUICodeMirror5 === 'function') {
          initAltUICodeMirror5();
        } else {
          console.warn('initAltUICodeMirror5 not available');
        }
        
        // Setup modal functionality
        if (typeof setupAltUICMModal === 'function') {
          setupAltUICMModal();
        } else {
          console.warn('setupAltUICMModal not available');
        }
        
        // Populate fields with current values
        populateAltUIFields();
        
        // Set up a mutation observer to detect when the alternative UI becomes visible
        const altUI = document.getElementById('alternativeUI');
        if (altUI) {
          const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                if (altUI.style.display !== 'none') {
                  populateAltUIFields();
                }
              }
            });
          });
          observer.observe(altUI, { attributes: true, attributeFilter: ['style'] });
        }
        
        // debugLog('ui', 'Alternative UI initialization completed successfully');
      } catch (error) {
        console.error('Error initializing Alternative UI:', error);
      }
    }, 100);
}

// Populate alternative UI fields with current values from model
function populateAltUIFields() {
  // Check if mandelbrotExplorer is available
  if (typeof mandelbrotExplorer === 'undefined') {
    console.warn('mandelbrotExplorer not available, retrying in 100ms...');
    setTimeout(populateAltUIFields, 100);
    return;
  }
  
  // Populate basic fields from model properties
  Object.keys(MBEUI.fieldMappings).forEach(fieldKey => {
    const mapping = MBEUI.fieldMappings[fieldKey];
    const altElement = document.getElementById(mapping.alt);
    
    if (altElement) {
      if (mapping.type === 'radio') {
        // Handle radio buttons from model state
        let selectedValue = 'both'; // default
        if (mandelbrotExplorer.onlyFull && !mandelbrotExplorer.onlyShortened) {
          selectedValue = 'full';
        } else if (!mandelbrotExplorer.onlyFull && mandelbrotExplorer.onlyShortened) {
          selectedValue = 'shortened';
        } else {
          selectedValue = 'both';
        }
        
        const altRadio = document.querySelector(`input[name="${mapping.alt}"][value="${selectedValue}"]`);
        if (altRadio) {
          altRadio.checked = true;
        }
      } else if (altElement.type === 'checkbox') {
        // Handle checkboxes from model properties
        const modelProperty = getModelPropertyForField(fieldKey);
        if (modelProperty !== null) {
          altElement.checked = modelProperty;
        }
      } else {
        // Handle text/number inputs from model properties
        const modelProperty = getModelPropertyForField(fieldKey);
        if (modelProperty !== null) {
          altElement.value = modelProperty;
        }
      }
    }
  });
  
  // Helper function to get model property for a field
  function getModelPropertyForField(fieldKey) {
    switch (fieldKey) {
      case 'maxIterations_2d':
        return mandelbrotExplorer.maxIterations_2d;
      case 'maxIterations_3d':
        return mandelbrotExplorer.maxIterations_3d;
      case 'cloudResolution':
        return mandelbrotExplorer.cloudResolution;
      case 'randomStepCheckbox':
        return mandelbrotExplorer.randomizeCloudStepping;
      case 'palette':
        // Palette is handled separately since it's an index
        return null;
      case 'startX':
        return mandelbrotExplorer.startX;
      case 'endX':
        return mandelbrotExplorer.endX;
      case 'startY':
        return mandelbrotExplorer.startY;
      case 'endY':
        return mandelbrotExplorer.endY;
      case 'particleSize':
        return mandelbrotExplorer.particleSize;
      case 'dualZMultiplier':
        return mandelbrotExplorer.dualZMultiplier;
      case 'dualZEnabled':
        return mandelbrotExplorer.dualZ;
      case 'cloudLengthFilter':
        return mandelbrotExplorer.cloudLengthFilter;
      case 'cloudIterationFilter':
        return mandelbrotExplorer.cloudIterationFilter;
      case 'colorCycleCheckbox':
        return mandelbrotExplorer.continueColorCycle;
      case 'iterationCycleCheckbox':
        return mandelbrotExplorer.continueIterationCycle;
      case 'gpuAccelerationCheckbox':
        return mandelbrotExplorer.useGPU;
      case 'iterationCycleTime':
        return mandelbrotExplorer.iterationCycleTime;
      case 'iterationCycleFrame':
        return mandelbrotExplorer.iterationCycleFrame;
      case 'curvePoints':
        return mandelbrotExplorer.curvePoints;
      case 'targetFrameRate':
        return mandelbrotExplorer.targetFrameRate;
      case 'juliaC':
        return mandelbrotExplorer.juliaC;
      case 'initialZ':
        return mandelbrotExplorer.initialZ;
      case 'escapingZ':
        return mandelbrotExplorer.escapingZ;
      case 'particleFilter':
        return mandelbrotExplorer.particleFilter;
      case 'hide2d':
        return document.getElementById("hide2d") ? document.getElementById("hide2d").checked : false;
      case 'toggleBackground':
        return document.getElementById("toggleBackground") ? document.getElementById("toggleBackground").checked : false;
      default:
        console.warn(`No model property mapping for field: ${fieldKey}`);
        return null;
    }
  }
  
  // Populate preset dropdowns directly from preset data
  if (typeof mandelbrotExplorer !== 'undefined' && mandelbrotExplorer.presets) {
    
    // Check if presets are actually loaded
    const hasPresets = mandelbrotExplorer.presets.particleSize && 
                      Object.keys(mandelbrotExplorer.presets.particleSize).length > 0;
    
    if (!hasPresets) {
      console.warn('Presets not loaded yet, retrying in 100ms...');
      setTimeout(populateAltUIFields, 100);
      return;
    }
    // Particle Size Presets
    const particleSizeSelect = document.getElementById('alt-particleSizePresets');
    if (particleSizeSelect && mandelbrotExplorer.presets.particleSize) {
      particleSizeSelect.innerHTML = '<option value="">----</option>';
      Object.keys(mandelbrotExplorer.presets.particleSize).forEach(presetName => {
        const option = document.createElement('option');
        option.value = presetName;
        option.text = presetName;
        particleSizeSelect.add(option);
      });
    }
    
    // Dual Z Multiplier Presets
    const dualZSelect = document.getElementById('alt-dualZMultiplierPresets');
    if (dualZSelect && mandelbrotExplorer.presets.dualZMultiplier) {
      dualZSelect.innerHTML = '<option value="">----</option>';
      Object.keys(mandelbrotExplorer.presets.dualZMultiplier).forEach(presetName => {
        const option = document.createElement('option');
        option.value = presetName;
        option.text = presetName;
        dualZSelect.add(option);
      });
    }
    
    // Cloud Length Filter Presets
    const cloudLengthSelect = document.getElementById('alt-cloudLengthFilterPresets');
    if (cloudLengthSelect && mandelbrotExplorer.presets.cloudLengthFilter) {
      cloudLengthSelect.innerHTML = '<option value="">----</option>';
      Object.keys(mandelbrotExplorer.presets.cloudLengthFilter).forEach(presetName => {
        const option = document.createElement('option');
        option.value = presetName;
        option.text = presetName;
        cloudLengthSelect.add(option);
      });
    }
    
    // Cloud Iteration Filter Presets
    const cloudIterationSelect = document.getElementById('alt-cloudIterationFilterPresets');
    if (cloudIterationSelect && mandelbrotExplorer.presets.cloudIterationFilter) {
      cloudIterationSelect.innerHTML = '<option value="">----</option>';
      Object.keys(mandelbrotExplorer.presets.cloudIterationFilter).forEach(presetName => {
        const option = document.createElement('option');
        option.value = presetName;
        option.text = presetName;
        cloudIterationSelect.add(option);
      });
    }
    
    // Initial Z Presets
    const initialZSelect = document.getElementById('alt-initialZPresets');
    if (initialZSelect && mandelbrotExplorer.presets.initialZ) {
      initialZSelect.innerHTML = '<option value="">----</option>';
      Object.keys(mandelbrotExplorer.presets.initialZ).forEach(presetName => {
        const option = document.createElement('option');
        option.value = presetName;
        option.text = presetName;
        initialZSelect.add(option);
      });
    }
    
    // Escaping Z Presets
    const escapingZSelect = document.getElementById('alt-escapingZPresets');
    if (escapingZSelect && mandelbrotExplorer.presets.mandelbrot && mandelbrotExplorer.presets.mandelbrot.escapingZ) {
      escapingZSelect.innerHTML = '<option value="">----</option>';
      Object.keys(mandelbrotExplorer.presets.mandelbrot.escapingZ).forEach(presetName => {
        const option = document.createElement('option');
        option.value = presetName;
        option.text = presetName;
        escapingZSelect.add(option);
      });
    }
    
    // Particle Filter Presets
    const particleFilterSelect = document.getElementById('alt-particleFilterPresets');
    if (particleFilterSelect && mandelbrotExplorer.presets.particleFilter) {
      particleFilterSelect.innerHTML = '<option value="">----</option>';
      Object.keys(mandelbrotExplorer.presets.particleFilter).forEach(presetName => {
        const option = document.createElement('option');
        option.value = presetName;
        option.text = presetName;
        particleFilterSelect.add(option);
      });
    }
  }
  
  // Populate palette dropdown
  const altPalette = document.getElementById('alt-palette');
  if (altPalette) {
    // Populate palette options
    altPalette.innerHTML = '';
    Object.keys(palettes).forEach((paletteName, index) => {
      const option = document.createElement('option');
      option.value = paletteName;
      option.text = paletteName;
      altPalette.add(option);
    });
    
    // Set current palette (this would need to be tracked in the model)
    // For now, we'll use the original UI element as fallback
    const originalPalette = document.getElementById('palette');
    if (originalPalette) {
      altPalette.value = originalPalette.value;
    }
  }
}

// Setup tab switching functionality
function setupAltUITabs() {
  const tabs = document.querySelectorAll('.alt-ui-tab');
  const tabPanels = document.querySelectorAll('.alt-ui-tabpanel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show target panel, hide others
      tabPanels.forEach(panel => {
        if (panel.getAttribute('data-tabpanel') === targetTab) {
          panel.style.display = 'block';
        } else {
          panel.style.display = 'none';
        }
      });
      
      // Refresh CodeMirror instances when switching tabs
      setTimeout(refreshVisibleAltUICM, 100);
    });
  });
}

// Sync alternative UI values to mandelbrotExplorer model before generation
function syncAltUIToModel() {
  if (typeof mandelbrotExplorer === 'undefined') {
    console.warn('mandelbrotExplorer not available for sync');
    return;
  }
  
  // Sync all field values from alternative UI to model
  Object.keys(MBEUI.fieldMappings).forEach(fieldKey => {
    const mapping = MBEUI.fieldMappings[fieldKey];
    const altElement = document.getElementById(mapping.alt);
    
    if (altElement) {
      if (mapping.type === 'radio') {
        // Handle radio buttons
        if (fieldKey === 'shortenedFilter') {
          const checkedRadio = document.querySelector(`input[name="${mapping.alt}"]:checked`);
          if (checkedRadio) {
            if (checkedRadio.value === 'full') {
              mandelbrotExplorer.onlyFull = true;
              mandelbrotExplorer.onlyShortened = false;
            } else if (checkedRadio.value === 'shortened') {
              mandelbrotExplorer.onlyFull = false;
              mandelbrotExplorer.onlyShortened = true;
            } else {
              mandelbrotExplorer.onlyFull = false;
              mandelbrotExplorer.onlyShortened = false;
            }
          }
        }
      } else if (altElement.type === 'checkbox') {
        // Handle checkboxes
        const modelProperty = getModelPropertyNameForSync(fieldKey);
        if (modelProperty && mandelbrotExplorer.hasOwnProperty(modelProperty)) {
          mandelbrotExplorer[modelProperty] = altElement.checked;
        }
      } else if (altElement.tagName === 'TEXTAREA') {
        // Handle textareas (CodeMirror instances)
        const modelProperty = getModelPropertyNameForSync(fieldKey);
        if (modelProperty && mandelbrotExplorer.hasOwnProperty(modelProperty)) {
          // Check if this is a CodeMirror instance
          if (window.altUICMInstances && window.altUICMInstances[mapping.alt]) {
            mandelbrotExplorer[modelProperty] = window.altUICMInstances[mapping.alt].getValue();
          } else {
            mandelbrotExplorer[modelProperty] = altElement.value;
          }
        }
      } else {
        // Handle text/number inputs
        const modelProperty = getModelPropertyNameForSync(fieldKey);
        if (modelProperty && mandelbrotExplorer.hasOwnProperty(modelProperty)) {
          // Convert numeric fields to numbers
          if (['startX', 'endX', 'startY', 'endY', 'maxIterations_2d', 'maxIterations_3d', 'iterationCycleTime', 'iterationCycleFrame', 'curvePoints', 'targetFrameRate'].includes(fieldKey)) {
            mandelbrotExplorer[modelProperty] = parseFloat(altElement.value);
          } else {
            mandelbrotExplorer[modelProperty] = altElement.value;
          }
        }
      }
    }
  });
  
  // Helper function to get model property name for sync
  function getModelPropertyNameForSync(fieldKey) {
    switch (fieldKey) {
      case 'maxIterations_2d': return 'maxIterations_2d';
      case 'maxIterations_3d': return 'maxIterations_3d';
      case 'cloudResolution': return 'cloudResolution';
      case 'randomStepCheckbox': return 'randomizeCloudStepping';
      case 'startX': return 'startX';
      case 'endX': return 'endX';
      case 'startY': return 'startY';
      case 'endY': return 'endY';
      case 'particleSize': return 'particleSize';
      case 'dualZMultiplier': return 'dualZMultiplier';
      case 'dualZEnabled': return 'dualZ';
      case 'cloudLengthFilter': return 'cloudLengthFilter';
      case 'cloudIterationFilter': return 'cloudIterationFilter';
      case 'colorCycleCheckbox': return 'continueColorCycle';
      case 'iterationCycleCheckbox': return 'continueIterationCycle';
      case 'gpuAccelerationCheckbox': return 'useGPU';
      case 'iterationCycleTime': return 'iterationCycleTime';
      case 'iterationCycleFrame': return 'iterationCycleFrame';
      case 'curvePoints': return 'curvePoints';
      case 'targetFrameRate': return 'targetFrameRate';
      case 'juliaC': return 'juliaC';
      case 'initialZ': return 'initialZ';
      case 'escapingZ': return 'escapingZ';
      case 'particleFilter': return 'particleFilter';
      default: return null;
    }
  }
}

// Export functions for use in other modules
window.buildAlternativeUI = buildAlternativeUI;
window.populateAltUIFields = populateAltUIFields;
window.setupAltUITabs = setupAltUITabs;
window.syncAltUIToModel = syncAltUIToModel;

