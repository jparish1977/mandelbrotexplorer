// altUI.js
// Wrapper file for the modular alternative UI system
// This file maintains backward compatibility while using the new modular structure

// The actual functionality is now split across:
// - altUI-config.js: Configuration constants and field mappings
// - altUI-completion.js: CodeMirror autocomplete functionality
// - altUI-codeMirror.js: CodeMirror setup and management
// - altUI-events.js: Event handling and synchronization
// - altUI-core.js: Core UI building and management

// This file ensures all modules are loaded and provides a single entry point
// All functions are now available through the global scope via the individual modules

// debugLog('ui', 'Alternative UI loaded - using modular structure'); 