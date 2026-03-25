// altUI-codeMirror.js
// CodeMirror setup and management for the alternative UI

window.MBEUI = window.MBEUI || {};

// Initialize CodeMirror for the alternative UI
function initAltUICodeMirror5() {
  // Make CodeMirror instances for textareas
  function makeCM(textareaId, onChange) {
    const textarea = document.getElementById(textareaId);
    if (!textarea) return null;
    
    // Create CodeMirror instance
    const cm = CodeMirror.fromTextArea(textarea, {
      ...MBEUI.codeMirrorConfig,
      hint: CodeMirror.hint.any
    });
    
    // Add custom hint function
    cm.on('keyup', function(cm, event) {
      // Don't show hint if user is typing a word
      if (!cm.state.completionActive && 
          event.keyCode !== 13 && // Enter
          event.keyCode !== 27 && // Escape
          event.keyCode !== 9 &&  // Tab
          event.keyCode !== 8 &&  // Backspace
          event.keyCode !== 46) { // Delete
        CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
      }
    });
    
    // Add custom completion
    cm.on('keyup', function(cm, event) {
      if (event.keyCode === 190 || event.keyCode === 46) { // dot or delete
        CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
      }
    });
    
    // Add custom hint function
    const originalHint = CodeMirror.hint.any;
    CodeMirror.hint.any = function(cm) {
      const result = createMandelbrotCompleter()(cm);
      if (result && result.list && result.list.length > 0) {
        return result;
      }
      return originalHint(cm);
    };
    
    // Handle changes
    cm.on('change', function() {
      const value = cm.getValue();
      if (onChange) {
        onChange(value);
      }
    });
    
    // Store instance
    altUICMInstances[textareaId] = cm;
    
    return cm;
  }
  
  // Create CodeMirror instances for all textareas
  const cmInstances = [
    {id: 'alt-particleSize', onChange: v => { document.getElementById('particleSize').value = v; updateParticleSize(); }},
    {id: 'alt-dualZMultiplier', onChange: v => { document.getElementById('dualZMultiplier').value = v; updateDualZMultiplier(); }},
    {id: 'alt-cloudLengthFilter', onChange: v => { document.getElementById('cloudLengthFilter').value = v; updateCloudLengthFilter(); }},
    {id: 'alt-cloudIterationFilter', onChange: v => { document.getElementById('cloudIterationFilter').value = v; updateCloudIterationFilter(); }},
    {id: 'alt-juliaC', onChange: v => { document.getElementById('juliaC').value = v; updateJuliaC(); }},
    {id: 'alt-initialZ', onChange: v => { document.getElementById('initialZ').value = v; updateInitialZ(); }},
    {id: 'alt-escapingZ', onChange: v => { document.getElementById('escapingZ').value = v; updateEscapingZ(); }},
    {id: 'alt-particleFilter', onChange: v => { document.getElementById('particleFilter').value = v; updateParticleFilter(); }}
  ];
  
  cmInstances.forEach(instance => {
    makeCM(instance.id, instance.onChange);
  });
}

// Refresh visible CodeMirror instances
function refreshVisibleAltUICM() {
  Object.keys(altUICMInstances).forEach(id => {
    const cm = altUICMInstances[id];
    if (cm) {
      cm.refresh();
    }
  });
}

// Sync CodeMirror with preset value
function syncAltUICMWithPreset(textareaId, value) {
  const cm = altUICMInstances[textareaId];
  if (cm) {
    cm.setValue(value || '');
  }
}

// Modal CodeMirror functionality
let modalCM = null;
let currentModalTextareaId = null;

function openAltUICM(textareaId) {
  const textarea = document.getElementById(textareaId);
  const modal = document.getElementById('alt-ui-cm-modal');
  const modalTextarea = document.getElementById('alt-ui-cm-modal-textarea');
  const modalTitle = document.getElementById('alt-ui-cm-modal-title');
  
  if (!textarea || !modal || !modalTextarea) {
    console.error('Modal elements not found');
    return;
  }
  
  currentModalTextareaId = textareaId;
  modalTitle.textContent = `Edit ${textareaId.replace('alt-', '').replace(/([A-Z])/g, ' $1').trim()}`;
  modalTextarea.value = textarea.value;
  
  // Create CodeMirror instance for modal
  if (modalCM) {
    modalCM.toTextArea();
  }
  
  modalCM = CodeMirror.fromTextArea(modalTextarea, {
    ...MBEUI.codeMirrorConfig,
    hint: CodeMirror.hint.any,
    height: '300px'
  });
  
  // Add custom hint function
  const originalHint = CodeMirror.hint.any;
  CodeMirror.hint.any = function(cm) {
    const result = createMandelbrotCompleter()(cm);
    if (result && result.list && result.list.length > 0) {
      return result;
    }
    return originalHint(cm);
  };
  
  modal.style.display = 'flex';
  modalCM.focus();
  modalCM.refresh();
}

function closeAltUICM() {
  const modal = document.getElementById('alt-ui-cm-modal');
  if (modal) {
    modal.style.display = 'none';
  }
  if (modalCM) {
    modalCM.toTextArea();
    modalCM = null;
  }
  currentModalTextareaId = null;
}

function saveAltUICM() {
  if (modalCM && currentModalTextareaId) {
    const value = modalCM.getValue();
    const textarea = document.getElementById(currentModalTextareaId);
    if (textarea) {
      textarea.value = value;
      // Trigger the corresponding update function
      const fieldName = currentModalTextareaId.replace('alt-', '');
      const updateFunction = window[`update${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`];
      if (updateFunction) {
        updateFunction();
      }
      // Update the CodeMirror instance if it exists
      const cm = altUICMInstances[currentModalTextareaId];
      if (cm) {
        cm.setValue(value);
      }
    }
  }
  closeAltUICM();
}

// Setup modal event listeners
function setupAltUICMModal() {
  const modal = document.getElementById('alt-ui-cm-modal');
  const closeBtn = document.getElementById('alt-ui-cm-modal-close');
  const saveBtn = document.getElementById('alt-ui-cm-modal-save');
  const cancelBtn = document.getElementById('alt-ui-cm-modal-cancel');
  const backdrop = modal?.querySelector('.alt-ui-cm-modal-backdrop');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAltUICM);
  }
  if (saveBtn) {
    saveBtn.addEventListener('click', saveAltUICM);
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeAltUICM);
  }
  if (backdrop) {
    backdrop.addEventListener('click', closeAltUICM);
  }
  
  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      closeAltUICM();
    }
  });
}

// Export functions for use in other modules
window.initAltUICodeMirror5 = initAltUICodeMirror5;
window.refreshVisibleAltUICM = refreshVisibleAltUICM;
window.syncAltUICMWithPreset = syncAltUICMWithPreset;
window.openAltUICM = openAltUICM;
window.closeAltUICM = closeAltUICM;
window.saveAltUICM = saveAltUICM;
window.setupAltUICMModal = setupAltUICMModal; 