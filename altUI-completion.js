// altUI-completion.js
// CodeMirror autocomplete functionality for Mandelbrot Explorer

/* global CodeMirror, MBEUI */
window.MBEUI = window.MBEUI || {};

// Track CodeMirror instances by field ID
const altUICMInstances = {};

// CodeMirror completion provider for Mandelbrot Explorer
function createMandelbrotCompleter(editorType) {
  return function(cm) {
    const cursor = cm.getCursor();
    const line = cm.getLine(cursor.line);
    const pos = cursor.ch;
    
    // Get tokens from CodeMirror's syntax highlighting
    const tokens = cm.getLineTokens(cursor.line);
    let currentToken = null;
    let tokenStart = 0;
    
    // Find the current token at cursor position
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (pos >= tokenStart && pos <= tokenStart + token.string.length) {
        currentToken = token;
        break;
      }
      tokenStart += token.string.length;
    }
    
    // Find the start of the current word
    let start = pos;
    while (start > 0 && /[\w\.]/.test(line.charAt(start - 1))) {
      start--;
    }
    
    const currentWord = line.slice(start, pos);
    
    // Check if we're typing after a dot (e.g., "xyz.")
    const beforeCursor = line.slice(0, pos);
    const dotMatch = beforeCursor.match(/(\w+(?:\.\w+)*)\.$/);
    let objectPath = null;
    let prefix = '';
    
    if (dotMatch) {
      objectPath = dotMatch[1];
      prefix = objectPath + '.';
    }
    
    // Dynamically get properties based on current context
    const dynamicProps = [];
    
    function addObjectProperties(obj, prefix, maxDepth = 2, currentDepth = 0) {
      if (!obj || typeof obj !== 'object' || currentDepth >= maxDepth) return;
      
      Object.keys(obj).forEach(prop => {
        const value = obj[prop];
        const fullPath = prefix ? `${prefix}.${prop}` : prop;
        
        if (typeof value === 'function') {
          // For functions, create a function call with parameter placeholders
          const funcStr = value.toString();
          const paramMatch = funcStr.match(/function\s*\w*\s*\(([^)]*)\)/);
          if (paramMatch && paramMatch[1].trim()) {
            const params = paramMatch[1].split(',').map(p => p.trim()).filter(p => p);
            const paramPlaceholders = params.map(p => `\${${p}}`).join(', ');
            dynamicProps.push({
              text: `${fullPath}(${paramPlaceholders})`,
              displayText: `${fullPath}(${params.join(', ')})`,
              className: 'cm-function'
            });
          } else {
            dynamicProps.push({
              text: `${fullPath}()`,
              displayText: `${fullPath}()`,
              className: 'cm-function'
            });
          }
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // For objects, add the object itself
          dynamicProps.push({
            text: fullPath,
            displayText: fullPath,
            className: 'cm-object'
          });
        } else {
          // For other values, just add the property
          dynamicProps.push({
            text: fullPath,
            displayText: fullPath,
            className: 'cm-property'
          });
        }
      });
    }
    
    // If we're typing after a dot, explore that specific object
    if (objectPath) {
      const pathParts = objectPath.split('.');
      let currentObj = window;
      
      // Navigate to the object at the path
      for (let i = 0; i < pathParts.length; i++) {
        if (currentObj && typeof currentObj === 'object' && currentObj[pathParts[i]] !== undefined) {
          currentObj = currentObj[pathParts[i]];
        } else {
          currentObj = null;
          break;
        }
      }
      
      if (currentObj && typeof currentObj === 'object') {
        addObjectProperties(currentObj, objectPath, 1, 0);
      }
    } else if (currentWord.length > 0) {
      // Show global variables that start with the current word
      const globalVars = Object.getOwnPropertyNames(window);
      
      // Also check for variables that might not be own properties but are in global scope
      const additionalGlobals = [];
      for (let key in window) {
        if (!globalVars.includes(key)) {
          additionalGlobals.push(key);
        }
      }
      
      const allGlobals = [...globalVars, ...additionalGlobals];
      
      allGlobals.forEach(key => {
        if (key.toLowerCase().startsWith(currentWord.toLowerCase())) {
          try {
            const value = window[key];
            if (typeof value === 'function') {
              const funcStr = value.toString();
              const paramMatch = funcStr.match(/function\s*\w*\s*\(([^)]*)\)/);
              if (paramMatch && paramMatch[1].trim()) {
                const params = paramMatch[1].split(',').map(p => p.trim()).filter(p => p);
                const paramPlaceholders = params.map(p => `\${${p}}`).join(', ');
                dynamicProps.push({
                  text: `${key}(${paramPlaceholders})`,
                  displayText: `${key}(${params.join(', ')})`,
                  className: 'cm-function'
                });
              } else {
                dynamicProps.push({
                  text: `${key}()`,
                  displayText: `${key}()`,
                  className: 'cm-function'
                });
              }
            } else if (typeof value === 'object' && value !== null) {
              dynamicProps.push({
                text: key,
                displayText: key,
                className: 'cm-object'
              });
            } else {
              dynamicProps.push({
                text: key,
                displayText: key,
                className: 'cm-property'
              });
            }
          } catch (e) {
            // Skip properties that can't be accessed
          }
        }
      });
    }

    // Common variables available in different contexts
    const commonVars = MBEUI.commonVars || [
      'pathIndex',
      'iteration', 
      'escapePath',
      'index',
      'iterationParticles',
      'newX',
      'newY', 
      'z'
    ];
    
    // Common JavaScript globals that are often useful
    const jsGlobals = MBEUI.jsGlobals || [
      'console', 'document', 'window', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number',
      'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURI', 'decodeURI',
      'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
      'Date', 'RegExp', 'Error', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet'
    ];
    
    // JavaScript keywords
    const jsKeywords = MBEUI.jsKeywords || [
      'function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
      'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'delete',
      'typeof', 'instanceof', 'in', 'with', 'this', 'super', 'class', 'extends', 'static',
      'async', 'await', 'yield', 'import', 'export', 'default', 'from', 'as'
    ];
    
    // Mandelbrot Explorer specific variables
    const mandelbrotVars = MBEUI.mandelbrotVars || [
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
    
    // Build completion list
    const completions = [];
    
    // Add dynamic properties first
    completions.push(...dynamicProps);
    
    // Add common variables
    commonVars.forEach(varName => {
      if (varName.toLowerCase().startsWith(currentWord.toLowerCase())) {
        completions.push({
          text: varName,
          displayText: varName,
          className: 'cm-variable'
        });
      }
    });
    
    // Add JavaScript globals
    jsGlobals.forEach(globalName => {
      if (globalName.toLowerCase().startsWith(currentWord.toLowerCase())) {
        completions.push({
          text: globalName,
          displayText: globalName,
          className: 'cm-builtin'
        });
      }
    });
    
    // Add JavaScript keywords
    jsKeywords.forEach(keyword => {
      if (keyword.toLowerCase().startsWith(currentWord.toLowerCase())) {
        completions.push({
          text: keyword,
          displayText: keyword,
          className: 'cm-keyword'
        });
      }
    });
    
    // Add Mandelbrot Explorer specific variables
    mandelbrotVars.forEach(varName => {
      if (varName.toLowerCase().startsWith(currentWord.toLowerCase())) {
        completions.push({
          text: varName,
          displayText: varName,
          className: 'cm-variable-2'
        });
      }
    });
    
    // Remove duplicates and sort
    const uniqueCompletions = [];
    const seen = new Set();
    
    completions.forEach(completion => {
      const key = completion.text;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueCompletions.push(completion);
      }
    });
    
    // Sort by relevance (exact matches first, then alphabetical)
    uniqueCompletions.sort((a, b) => {
      const aExact = a.text.toLowerCase() === currentWord.toLowerCase();
      const bExact = b.text.toLowerCase() === currentWord.toLowerCase();
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      return a.text.localeCompare(b.text);
    });
    
    const result = {
      list: uniqueCompletions,
      from: CodeMirror.Pos(cursor.line, start),
      to: CodeMirror.Pos(cursor.line, pos)
    };
    
    return result;
  };
}

// Export for use in other modules
window.createMandelbrotCompleter = createMandelbrotCompleter;
window.altUICMInstances = altUICMInstances; 