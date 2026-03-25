// altUI-events.js
// Event handling and synchronization for the alternative UI

/* global MBEUI, mandelbrotExplorer, getScreenCap, populateAltUIFields,  */
/* global refreshVisibleAltUICM, showToast, syncAltUICMWithPreset,  */
/* global toggleBackground, toggleColorCycle, toggleGPUAcceleration,  */
/* global toggleIterationCycle, updateDualZEnabled, hide2D */
window.MBEUI = window.MBEUI || {};

// Sync alternative UI from model values
function syncAltUIFromOriginal() {
  // This function is now redundant since we're reading from the model
  // But we'll keep it for backward compatibility and call populateAltUIFields
  if (typeof populateAltUIFields === 'function') {
    populateAltUIFields();
  }
  
  // Refresh CodeMirror instances
  if (typeof refreshVisibleAltUICM === 'function') {
    refreshVisibleAltUICM();
  }
}

// Setup event listeners for the alternative UI
function setupAltUIEventListeners() {
  function attachHandlers() {
    // Handle all mapped fields from the configuration
    Object.keys(MBEUI.fieldMappings).forEach(fieldKey => {
      const mapping = MBEUI.fieldMappings[fieldKey];
      const altElement = document.getElementById(mapping.alt);
      
      if (altElement) {
        if (mapping.type === 'radio') {
          // Radio buttons are handled separately below
          return;
        }
        
        if (altElement.type === 'checkbox') {
          altElement.addEventListener('change', function() {
            // Update model directly
            const modelProperty = getModelPropertyName(fieldKey);
            if (modelProperty && mandelbrotExplorer) {
              mandelbrotExplorer[modelProperty] = this.checked;
              // Trigger the original update function to apply changes
              if (fieldKey === 'gpuAccelerationCheckbox') {
                // Special handling for GPU checkbox - use alternative UI checkbox
                const altCheckbox = document.getElementById('alt-gpuAccelerationCheckbox');
                if (altCheckbox) {
                  mandelbrotExplorer.useGPU = altCheckbox.checked;
                  
                  if (mandelbrotExplorer.useGPU) {
                    // Initialize GPU if not already done
                    if (!mandelbrotExplorer.gpuContext) {
                      mandelbrotExplorer.initGPU();
                    }
                    
                    if (mandelbrotExplorer.gpuContext) {
                      showToast('GPU acceleration enabled', 2000);
                    } else {
                      showToast('GPU acceleration failed to initialize, falling back to CPU', 3000);
                      altCheckbox.checked = false;
                      mandelbrotExplorer.useGPU = false;
                    }
                  } else {
                    showToast('GPU acceleration disabled', 2000);
                  }
                }
              } else {
                const updateFunction = window[`update${fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}`];
                if (updateFunction) {
                  updateFunction();
                }
              }
            }
          });
        } else {
          altElement.addEventListener('change', function() {
            // Update model directly
            const modelProperty = getModelPropertyName(fieldKey);
            if (modelProperty && mandelbrotExplorer) {
              mandelbrotExplorer[modelProperty] = this.value;
              // Trigger the original update function to apply changes
              const updateFunction = window[`update${fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}`];
              if (updateFunction) {
                updateFunction();
              }
            }
          });
        }
      }
    });
    
    // Radio button groups from field mappings
    Object.keys(MBEUI.fieldMappings).forEach(fieldKey => {
      const mapping = MBEUI.fieldMappings[fieldKey];
      if (mapping.type === 'radio') {
        const radios = document.querySelectorAll(`input[name="${mapping.alt}"]`);
        radios.forEach(radio => {
          radio.addEventListener('change', function() {
            if (this.checked) {
              // Update model directly
              if (fieldKey === 'shortenedFilter' && mandelbrotExplorer) {
                if (this.value === 'full') {
                  mandelbrotExplorer.onlyFull = true;
                  mandelbrotExplorer.onlyShortened = false;
                } else if (this.value === 'shortened') {
                  mandelbrotExplorer.onlyFull = false;
                  mandelbrotExplorer.onlyShortened = true;
                } else {
                  mandelbrotExplorer.onlyFull = false;
                  mandelbrotExplorer.onlyShortened = false;
                }
                // Don't call setShortenedFilter() as it reads from original UI radio buttons
              }
            }
          });
        });
      }
    });
    
    // Preset dropdowns
    Object.keys(MBEUI.presetMappings).forEach(presetKey => {
      const altSelectId = `alt-${presetKey}`;
      const altSelect = document.getElementById(altSelectId);
      if (altSelect) {
        altSelect.addEventListener('change', function() {
          const originalSelect = document.getElementById(presetKey);
          if (originalSelect) {
            originalSelect.value = this.value;
            // Trigger the original preset setter
            const setterFunction = MBEUI.presetSetters[presetKey];
            if (setterFunction) {
              setterFunction();
              // Update the alternative UI CodeMirror instance
              const mapping = MBEUI.presetMappings[presetKey];
              if (mapping && mapping.altCM) {
                const originalTextarea = document.getElementById(mapping.textarea);
                if (originalTextarea && typeof syncAltUICMWithPreset === 'function') {
                  syncAltUICMWithPreset(mapping.altCM, originalTextarea.value);
                }
              }
            }
          }
        });
      }
    });
    
    // Helper function to get model property name for a field
    function getModelPropertyName(fieldKey) {
      switch (fieldKey) {
        case 'maxIterations_2d': return 'maxIterations_2d';
        case 'maxIterations_3d': return 'maxIterations_3d';
        case 'cloudResolution': return 'cloudResolution';
        case 'randomStepCheckbox': return 'randomizeCloudStepping';
        case 'startX': return 'startX';
        case 'startY': return 'startY';
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
        case 'targetFrameRate': return 'targetFrameRate';
        case 'juliaC': return 'juliaC';
        case 'initialZ': return 'initialZ';
        case 'escapingZ': return 'escapingZ';
        case 'particleFilter': return 'particleFilter';
        default: return null;
      }
    }

    // Special handlers for specific fields that need custom update functions
    const specialHandlers = {
      'alt-dualZEnabled': function() {
        if (mandelbrotExplorer) {
          mandelbrotExplorer.dualZ = this.checked;
          updateDualZEnabled();
        }
      },
      'alt-colorCycleCheckbox': function() {
        if (mandelbrotExplorer) {
          mandelbrotExplorer.continueColorCycle = this.checked;
          toggleColorCycle();
        }
      },
      'alt-iterationCycleCheckbox': function() {
        if (mandelbrotExplorer) {
          mandelbrotExplorer.continueIterationCycle = this.checked;
          toggleIterationCycle();
        }
      },
      'alt-gpuAccelerationCheckbox': function() {
        if (mandelbrotExplorer) {
          mandelbrotExplorer.useGPU = this.checked;
          toggleGPUAcceleration();
        }
      },
      'alt-hide2d': function() {
        if (mandelbrotExplorer) {
          mandelbrotExplorer.hide2d = this.checked;
          hide2D();
        }
      },
      'alt-toggleBackground': function() {
        if (mandelbrotExplorer) {
          mandelbrotExplorer.toggleBackground = this.checked;
          toggleBackground();
        }
      },
      'alt-captureBtn': function() {
        getScreenCap();
      }
    };
    
    // Apply special handlers (these override the generic handlers above)
    Object.keys(specialHandlers).forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        // Remove any existing event listeners
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        
        if (newElement.type === 'button') {
          newElement.addEventListener('click', specialHandlers[fieldId]);
        } else {
          newElement.addEventListener('change', specialHandlers[fieldId]);
        }
      }
    });
    
    // Switch back button
    const switchBackBtn = document.getElementById('switchBackBtn');
    if (switchBackBtn) {
      switchBackBtn.addEventListener('click', function() {
        // Sync any changes from alternative UI back to original UI
        syncAltUIFromOriginal();
        document.getElementById('controls').style.display = '';
        document.getElementById('alternativeUI').style.display = 'none';
      });
    }
  }
  
  // Attach handlers after a short delay to ensure DOM is ready
  setTimeout(attachHandlers, 100);
}

// Show toast message in alternative UI
function showAltToast(msg, duration = 2500) {
  const toast = document.getElementById('alt-ui-toast');
  if (toast) {
    toast.textContent = msg;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    
    setTimeout(function() {
      toast.style.opacity = '0';
      setTimeout(function() {
        toast.style.display = 'none';
      }, 300);
    }, duration);
  }
}

// Export functions for use in other modules
window.syncAltUIFromOriginal = syncAltUIFromOriginal;
window.setupAltUIEventListeners = setupAltUIEventListeners;
window.showAltToast = showAltToast; 