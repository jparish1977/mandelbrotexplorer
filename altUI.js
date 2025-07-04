// altUI.js
// Extracted alternate UI logic from ui.js

window.MBEUI = window.MBEUI || {};

// Track CodeMirror instances by field ID
const altUICMInstances = {};

function buildAlternativeUI() {
    const altUI = document.getElementById('alternativeUI');
    if (!altUI || altUI.dataset.built) return;
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
          <button onclick="generateHair()">Generate Hair</button>
          <button onclick="generateCloud()">Generate Cloud</button>
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
              <label>startY</label>
              <input type="text" id="alt-startY" readonly />
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
              <label for="alt-particleSize">Particle Size</label>
              <textarea id="alt-particleSize"></textarea>
              <select id="alt-particleSizePresets">
                <option value="">----</option>
              </select>
              
              <label for="alt-dualZEnabled">Dual Z Enabled</label>
              <input type="checkbox" id="alt-dualZEnabled" />
              
              <label for="alt-dualZMultiplier">Dual Z Multiplier</label>
              <textarea id="alt-dualZMultiplier"></textarea>
              <select id="alt-dualZMultiplierPresets">
                <option value="">----</option>
              </select>
              
              <label for="alt-cloudLengthFilter">Cloud Length Filter</label>
              <textarea id="alt-cloudLengthFilter"></textarea>
              <select id="alt-cloudLengthFilterPresets">
                <option value="">----</option>
              </select>
              
              <label for="alt-cloudIterationFilter">Cloud Iteration Filter</label>
              <textarea id="alt-cloudIterationFilter"></textarea>
              <select id="alt-cloudIterationFilterPresets">
                <option value="">----</option>
              </select>
            </div>
          </section>
          <section class="alt-ui-section alt-ui-tabpanel" data-tabpanel="presets" style="display:none;">
            <h3>Presets & Filters</h3>
            <div class="alt-ui-presets" id="alt-ui-presets">
              <label for="alt-juliaC">Julia C</label>
              <textarea id="alt-juliaC"></textarea>
              
              <label for="alt-initialZ">Initial Z</label>
              <textarea id="alt-initialZ"></textarea>
              <select id="alt-initialZPresets">
                <option value="">----</option>
              </select>
              
              <label for="alt-escapingZ">Escaping Z</label>
              <textarea id="alt-escapingZ"></textarea>
              <select id="alt-escapingZPresets">
                <option value="">----</option>
              </select>
              
              <label for="alt-particleFilter">Particle Filter</label>
              <textarea id="alt-particleFilter"></textarea>
              <select id="alt-particleFilterPresets">
                <option value="">----</option>
              </select>
            </div>
          </section>
          <section class="alt-ui-section alt-ui-tabpanel" data-tabpanel="settings" style="display:none;">
            <h3>Settings</h3>
            <div class="alt-ui-settings" id="alt-ui-settings">
              <button onclick="mandelbrotExplorer.threeRenderer.controls.reset()">Reset Camera</button>
              <label><input type="checkbox" id="alt-hide2d" /> Hide 2D</label>
              <label><input type="checkbox" id="alt-toggleBackground" /> Toggle Background</label>
              <br><br>
              <button onclick="generateHair()">Generate Hair</button>
              <button onclick="generateCloud()">Generate Cloud</button>
              <br><br>
              <button onclick="mandelbrotExplorer.saveSettings()">Save Settings</button>
              <button onclick="loadSettingsFromStorage()">Load Settings</button>
              <button onclick="mandelbrotExplorer.clearSettings()">Clear Settings</button>
            </div>
          </section>
        </main>
        <footer class="alt-ui-footer">
          <span id="alt-ui-toast"></span>
        </footer>
      </div>
    `;
    
    // Populate fields with current values
    populateAltUIFields();
    
    // Attach event listeners
    attachAltUIEventListeners();
    
    // Setup tab switching
    setupAltUITabs();
    
    // Initialize CodeMirror for text areas
    setTimeout(initAltUICodeMirror5, 0);
}

function populateAltUIFields() {
    // Basic parameters
    const maxIter2d = document.getElementById('maxIterations_2d');
    const maxIter3d = document.getElementById('maxIterations_3d');
    const cloudRes = document.getElementById('cloudResolution');
    const randomStep = document.getElementById('randomStepCheckbox');
    const palette = document.getElementById('palette');
    const startX = document.getElementById('startX');
    const startY = document.getElementById('startY');
    
    if (maxIter2d) {
        const altMaxIter2d = document.getElementById('alt-maxIterations_2d');
        if (altMaxIter2d) altMaxIter2d.value = maxIter2d.value;
    }
    
    if (maxIter3d) {
        const altMaxIter3d = document.getElementById('alt-maxIterations_3d');
        if (altMaxIter3d) altMaxIter3d.value = maxIter3d.value;
    }
    
    if (cloudRes) {
        const altCloudRes = document.getElementById('alt-cloudResolution');
        if (altCloudRes) altCloudRes.value = cloudRes.value;
    }
    
    if (randomStep) {
        const altRandomStep = document.getElementById('alt-randomStepCheckbox');
        if (altRandomStep) altRandomStep.checked = randomStep.checked;
    }
    
    if (startX) {
        const altStartX = document.getElementById('alt-startX');
        if (altStartX) altStartX.value = startX.value;
    }
    
    if (startY) {
        const altStartY = document.getElementById('alt-startY');
        if (altStartY) altStartY.value = startY.value;
    }
    
    // Copy palette options
    if (palette) {
        const altPalette = document.getElementById('alt-palette');
        if (altPalette) {
            altPalette.innerHTML = palette.innerHTML;
            altPalette.value = palette.value;
        }
    }
    
    // Copy shortened filter selection
    const shortenedFilter = document.querySelector('input[name="shortenedFilter"]:checked');
    if (shortenedFilter) {
        const altShortenedFilter = document.querySelector(`input[name="alt-shortenedFilter"][value="${shortenedFilter.value}"]`);
        if (altShortenedFilter) altShortenedFilter.checked = true;
    }
    
    // Copy other fields
    const fields = [
        'particleSize', 'dualZMultiplier', 'cloudLengthFilter', 'cloudIterationFilter',
        'juliaC', 'initialZ', 'escapingZ', 'particleFilter'
    ];
    
    fields.forEach(fieldId => {
        const originalField = document.getElementById(fieldId);
        const altField = document.getElementById(`alt-${fieldId}`);
        if (originalField && altField) {
            altField.value = originalField.value;
        }
    });
    
    // Copy checkbox states
    const dualZEnabled = document.getElementById('dualZEnabled');
    if (dualZEnabled) {
        const altDualZEnabled = document.getElementById('alt-dualZEnabled');
        if (altDualZEnabled) altDualZEnabled.checked = dualZEnabled.checked;
    }
    
    const hide2d = document.getElementById('hide2d');
    if (hide2d) {
        const altHide2d = document.getElementById('alt-hide2d');
        if (altHide2d) altHide2d.checked = hide2d.checked;
    }
    
    const toggleBackground = document.getElementById('toggleBackground');
    if (toggleBackground) {
        const altToggleBackground = document.getElementById('alt-toggleBackground');
        if (altToggleBackground) altToggleBackground.checked = toggleBackground.checked;
    }
    
    // Copy preset options
    const presetFields = [
        'particleSizePresets', 'dualZMultiplierPresets', 'cloudLengthFilterPresets',
        'cloudIterationFilterPresets', 'initialZPresets', 'escapingZPresets', 'particleFilterPresets'
    ];
    
    presetFields.forEach(presetId => {
        const originalPreset = document.getElementById(presetId);
        const altPreset = document.getElementById(`alt-${presetId}`);
        if (originalPreset && altPreset) {
            altPreset.innerHTML = originalPreset.innerHTML;
        }
    });
}

function attachAltUIEventListeners() {
    // Basic parameter events
    const altMaxIter2d = document.getElementById('alt-maxIterations_2d');
    if (altMaxIter2d) {
        altMaxIter2d.addEventListener('change', function() {
            const originalField = document.getElementById('maxIterations_2d');
            if (originalField) {
                originalField.value = this.value;
                update2dIterations();
            }
        });
    }
    
    const altMaxIter3d = document.getElementById('alt-maxIterations_3d');
    if (altMaxIter3d) {
        altMaxIter3d.addEventListener('change', function() {
            const originalField = document.getElementById('maxIterations_3d');
            if (originalField) {
                originalField.value = this.value;
                update3dIterations();
            }
        });
    }
    
    const altCloudRes = document.getElementById('alt-cloudResolution');
    if (altCloudRes) {
        altCloudRes.addEventListener('change', function() {
            const originalField = document.getElementById('cloudResolution');
            if (originalField) {
                originalField.value = this.value;
                updateCloudResolution();
            }
        });
    }
    
    const altRandomStep = document.getElementById('alt-randomStepCheckbox');
    if (altRandomStep) {
        altRandomStep.addEventListener('change', function() {
            const originalField = document.getElementById('randomStepCheckbox');
            if (originalField) {
                originalField.checked = this.checked;
                toggleRandomStepping();
            }
        });
    }
    
    const altPalette = document.getElementById('alt-palette');
    if (altPalette) {
        altPalette.addEventListener('change', function() {
            const originalField = document.getElementById('palette');
            if (originalField) {
                originalField.value = this.value;
                updatePalette();
            }
        });
    }
    
    // Shortened filter events
    document.querySelectorAll('input[name="alt-shortenedFilter"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const originalRadio = document.querySelector(`input[name="shortenedFilter"][value="${this.value}"]`);
            if (originalRadio) {
                originalRadio.checked = true;
                setShortenedFilter();
            }
        });
    });
    
    // Checkbox events
    const altDualZEnabled = document.getElementById('alt-dualZEnabled');
    if (altDualZEnabled) {
        altDualZEnabled.addEventListener('change', function() {
            const originalField = document.getElementById('dualZEnabled');
            if (originalField) {
                originalField.checked = this.checked;
                updateDualZEnabled();
            }
        });
    }
    
    const altHide2d = document.getElementById('alt-hide2d');
    if (altHide2d) {
        altHide2d.addEventListener('change', function() {
            const originalField = document.getElementById('hide2d');
            if (originalField) {
                originalField.checked = this.checked;
                hide2D();
            }
        });
    }
    
    const altToggleBackground = document.getElementById('alt-toggleBackground');
    if (altToggleBackground) {
        altToggleBackground.addEventListener('change', function() {
            const originalField = document.getElementById('toggleBackground');
            if (originalField) {
                originalField.checked = this.checked;
                toggleBackground();
            }
        });
    }
    
    // Preset events
    const presetFields = [
        'particleSizePresets', 'dualZMultiplierPresets', 'cloudLengthFilterPresets',
        'cloudIterationFilterPresets', 'initialZPresets', 'escapingZPresets', 'particleFilterPresets'
    ];
    
    presetFields.forEach(presetId => {
        const altPreset = document.getElementById(`alt-${presetId}`);
        if (altPreset) {
            altPreset.addEventListener('change', function() {
                const originalPreset = document.getElementById(presetId);
                if (originalPreset) {
                    originalPreset.value = this.value;
                    // Trigger the original preset function
                    const presetFunctions = {
                        'particleSizePresets': setParticleSizeFromPreset,
                        'dualZMultiplierPresets': setDualZMultiplierFromPreset,
                        'cloudLengthFilterPresets': setCloudLengthFilterFromPreset,
                        'cloudIterationFilterPresets': setCloudIterationFilterFromPreset,
                        'initialZPresets': setInitialZFromPreset,
                        'escapingZPresets': setEscapingZFromPreset,
                        'particleFilterPresets': setParticleFilterFromPreset
                    };
                    if (presetFunctions[presetId]) {
                        presetFunctions[presetId]();
                    }
                }
            });
        }
    });
}

function setupAltUITabs() {
    const tabs = document.querySelectorAll('.alt-ui-tab');
    const tabPanels = document.querySelectorAll('.alt-ui-tabpanel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remove active class from all tabs and hide all panels
            tabs.forEach(t => t.classList.remove('active'));
            tabPanels.forEach(p => p.style.display = 'none');
            
            // Add active class to clicked tab and show target panel
            this.classList.add('active');
            const targetPanel = document.querySelector(`[data-tabpanel="${targetTab}"]`);
            if (targetPanel) {
                targetPanel.style.display = 'block';
            }
            
            // Refresh CodeMirror instances in the newly visible panel
            setTimeout(refreshVisibleAltUICM, 0);
        });
    });
}

function showAltToast(msg, duration = 2500) {
    var toast = document.getElementById('alt-ui-toast');
    toast.textContent = msg;
    toast.className = 'toast show';
    setTimeout(function() {
      toast.className = toast.className.replace('show', '');
    }, duration);
}

function initAltUICodeMirror5() {
    if (!window.CodeMirror) return;
    function makeCM(textareaId, onChange) {
      const textarea = document.getElementById(textareaId);
      if (!textarea) return null;
      textarea.style.display = 'none';
      const cm = CodeMirror.fromTextArea(textarea, {
        mode: 'javascript',
        theme: 'material',
        lineNumbers: true,
        lineWrapping: true,
        viewportMargin: 4,
        tabSize: 2,
        indentUnit: 2,
        matchBrackets: true,
        autoCloseBrackets: true,
        height: 'auto'
      });
      cm.getWrapperElement().style.height = '4em';
      cm.getScrollerElement().style.maxHeight = '4em';
      cm.refresh();
      altUICMInstances[textareaId] = cm;
      cm.on('change', function(editor) {
        const newVal = editor.getValue();
        textarea.value = newVal;
        if (onChange) onChange(newVal);
      });
      textarea.addEventListener('change', function() {
        if (cm.getValue() !== textarea.value) {
          cm.setValue(textarea.value);
        }
      });
      return cm;
    }
    // List of fields to convert
    const cmFields = [
      {id: 'alt-cloudLengthFilter', onChange: v => { document.getElementById('cloudLengthFilter').value = v; updateCloudLengthFilter(); }},
      {id: 'alt-cloudIterationFilter', onChange: v => { document.getElementById('cloudIterationFilter').value = v; updateCloudIterationFilter(); }},
      {id: 'alt-juliaC', onChange: v => { document.getElementById('juliaC').value = v; updateJuliaC(); }},
      {id: 'alt-initialZ', onChange: v => { document.getElementById('initialZ').value = v; updateInitialZ(); }},
      {id: 'alt-escapingZ', onChange: v => { document.getElementById('escapingZ').value = v; updateEscapingZ(); }},
      {id: 'alt-particleFilter', onChange: v => { document.getElementById('particleFilter').value = v; updateParticleFilter(); }},
      {id: 'alt-particleSize', onChange: v => { document.getElementById('particleSize').value = v; updateParticleSize(); }},
      {id: 'alt-dualZMultiplier', onChange: v => { document.getElementById('dualZMultiplier').value = v; updateDualZMultiplier(); }}
    ];
    cmFields.forEach(f => makeCM(f.id, f.onChange));
}

function refreshVisibleAltUICM() {
    for (const id in altUICMInstances) {
      const cm = altUICMInstances[id];
      if (cm && cm.getWrapperElement().offsetParent !== null) {
        cm.refresh();
      }
    }
}

function syncAltUICMWithPreset(textareaId, value) {
    if (altUICMInstances[textareaId]) {
      altUICMInstances[textareaId].setValue(value);
    }
}

// Function to sync alternative UI when original UI changes
function syncAltUIFromOriginal() {
    if (!document.getElementById('alternativeUI') || document.getElementById('alternativeUI').style.display === 'none') {
        return; // Alternative UI not visible
    }
    
    // Sync basic fields
    const fields = [
        {original: 'maxIterations_2d', alt: 'alt-maxIterations_2d'},
        {original: 'maxIterations_3d', alt: 'alt-maxIterations_3d'},
        {original: 'cloudResolution', alt: 'alt-cloudResolution'},
        {original: 'startX', alt: 'alt-startX'},
        {original: 'startY', alt: 'alt-startY'},
        {original: 'particleSize', alt: 'alt-particleSize'},
        {original: 'dualZMultiplier', alt: 'alt-dualZMultiplier'},
        {original: 'cloudLengthFilter', alt: 'alt-cloudLengthFilter'},
        {original: 'cloudIterationFilter', alt: 'alt-cloudIterationFilter'},
        {original: 'juliaC', alt: 'alt-juliaC'},
        {original: 'initialZ', alt: 'alt-initialZ'},
        {original: 'escapingZ', alt: 'alt-escapingZ'},
        {original: 'particleFilter', alt: 'alt-particleFilter'}
    ];
    
    fields.forEach(field => {
        const originalField = document.getElementById(field.original);
        const altField = document.getElementById(field.alt);
        if (originalField && altField) {
            if (altField.type === 'checkbox') {
                altField.checked = originalField.checked;
            } else {
                altField.value = originalField.value;
            }
        }
    });
    
    // Sync checkboxes
    const checkboxes = [
        {original: 'randomStepCheckbox', alt: 'alt-randomStepCheckbox'},
        {original: 'dualZEnabled', alt: 'alt-dualZEnabled'},
        {original: 'hide2d', alt: 'alt-hide2d'},
        {original: 'toggleBackground', alt: 'alt-toggleBackground'}
    ];
    
    checkboxes.forEach(checkbox => {
        const originalCheckbox = document.getElementById(checkbox.original);
        const altCheckbox = document.getElementById(checkbox.alt);
        if (originalCheckbox && altCheckbox) {
            altCheckbox.checked = originalCheckbox.checked;
        }
    });
    
    // Sync palette
    const originalPalette = document.getElementById('palette');
    const altPalette = document.getElementById('alt-palette');
    if (originalPalette && altPalette) {
        altPalette.value = originalPalette.value;
    }
    
    // Sync shortened filter
    const shortenedFilter = document.querySelector('input[name="shortenedFilter"]:checked');
    if (shortenedFilter) {
        const altShortenedFilter = document.querySelector(`input[name="alt-shortenedFilter"][value="${shortenedFilter.value}"]`);
        if (altShortenedFilter) altShortenedFilter.checked = true;
    }
    
    // Refresh CodeMirror instances
    setTimeout(refreshVisibleAltUICM, 0);
}

function setupAltUIEventListeners() {
    function attachHandlers() {
        var toggleBtn = document.getElementById('uiToggleBtn');
        if (!toggleBtn) return;
        var controls = document.getElementById('controls');
        var newUI = document.getElementById('alternativeUI');
        toggleBtn.addEventListener('click', function() {
            if (controls.style.display !== 'none') {
                controls.style.display = 'none';
                buildAlternativeUI();
                newUI.style.display = '';
            } else {
                controls.style.display = '';
                newUI.style.display = 'none';
            }
        });
        newUI.addEventListener('click', function(e) {
            if (e.target && e.target.id === 'switchBackBtn') {
                controls.style.display = '';
                newUI.style.display = 'none';
            }
        });
        // Ensure alternative UI is visible and styled
        const altUI = document.getElementById('alternativeUI');
        altUI.style.display = '';
        altUI.style.position = 'fixed';
        altUI.style.right = '10px';
        altUI.style.zIndex = '1001';
        altUI.style.maxHeight = '90vh';
        altUI.style.overflowY = 'auto';
        
        // Set up periodic sync from original UI
        setInterval(syncAltUIFromOriginal, 1000);
    }
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', attachHandlers);
    } else {
        attachHandlers();
    }
}
window.MBEUI.setupAltUIEventListeners = setupAltUIEventListeners; 