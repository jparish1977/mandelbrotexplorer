# Refactor: Extract shared Cloud/Hair logic, fix issues #1-3

Branch: `refactor-hair-cloud` at `C:\Users\jpari\mandelbrotexplorer`

## Context

`generateMandelbrotCloudParticles` and `generateMandelbrotHair` in `cloudGeneration.js` share ~80% identical code (grid loop, escape paths, filters, Z computation, position building). Hair duplicates this logic inline with raw `eval()` calls instead of using the compiled `cloudMethods` wrappers. Hair is also missing three features that Cloud has: color cycling (#1), iteration cycling (#2), and dualZ (#3).

The fix: extract the shared inner loop into a common `processEscapePath` method, wire both modes to it, and Hair gets the missing features for free.

## Files to modify

- `cloudGeneration.js` — add `processEscapePath`, refactor both generators
- `mandelbrotexplorer.js` — extend `cycleCloudColors` and `cycleCloudIterations` to also operate on `lines`

## Implementation

### Step 1: Add `processEscapePath` to cloudGeneration.js

New method on the Object.assign block, positioned before `generateMandelbrotCloudParticles`. Signature:

```js
"processEscapePath"(escapePath, callbacks)
```

Extracts the shared logic:
- `onlyShortened`/`onlyFull` check
- `evalInitialZ` for initial z
- forEach over escapePath:
  - accumulate z, compute averageOfAccumulatedZ
  - `processCloudLengthFilter`, `processCloudIterationFilter`
  - `evalEscapingZ` for z
  - build `THREE.Vector3(newX, newY, z)`
  - `processParticleFilter`
  - call `callbacks.onParticle(iterationIndex, particleVector, escapePath, pathIndex)`
  - if dualZ: `processDualZMultiplier`, call `callbacks.onDualZParticle(iterationIndex, dualVector)`
- After path: call `callbacks.onPathComplete(escapePath, collectedVectors)` if provided

### Step 2: Refactor Cloud to use it

Replace the inline `processEscapePath` inner function (lines ~270-385) with:

```js
cloudMethods.processEscapePath(escapePath, {
    onParticle(iterationIndex, vector) {
        if (!mandelbrotExplorer.iterationParticles[iterationIndex])
            mandelbrotExplorer.iterationParticles[iterationIndex] = {particles: []};
        mandelbrotExplorer.iterationParticles[iterationIndex].particles.push(vector);
    },
    onDualZParticle(iterationIndex, vector) {
        mandelbrotExplorer.iterationParticles[iterationIndex].particles.push(vector);
    }
});
```

Cache-writing logic stays in the cloud caller wrapping this call. Test cloud thoroughly before proceeding.

### Step 3: Refactor Hair to use shared methods + processEscapePath

Replace the entire inner loop (lines ~534-619) with:

```js
const c = mandelbrotExplorer.cloudMethods.handleCloudSteppingAdjustments([x, y]);
const escapePath = mandelbrotExplorer.cloudMethods.getEscapePath(c);
const lineVectors = [];

cloudMethods.processEscapePath(escapePath, {
    onParticle(iterationIndex, vector) {
        if (!mandelbrotExplorer.iterationParticles[iterationIndex])
            mandelbrotExplorer.iterationParticles[iterationIndex] = {particles: []};
        mandelbrotExplorer.iterationParticles[iterationIndex].particles.push(vector);
        lineVectors.push(vector);
    },
    onDualZParticle(iterationIndex, vector) {
        mandelbrotExplorer.iterationParticles[iterationIndex].particles.push(vector);
        lineVectors.push(vector);  // dual points join the spline
    }
});

if (lineVectors.length > 1) mandelbrotExplorer.lineVectors.push(lineVectors);
```

This eliminates: inline random stepping, inline escape path computation, all raw eval() calls, and adds dualZ (#3) for free.

### Step 4: Color cycling for Hair (#1)

Modify `cycleCloudColors` in `mandelbrotexplorer.js` to also iterate `this.lines`:

```js
// After existing particleSystems loop:
for (const lineIndex in this.lines) {
    if (!this.lines[lineIndex] || !this.lines[lineIndex].material) continue;
    // Same color rotation logic as particleSystems
}
```

### Step 5: Iteration cycling for Hair (#2)

Hair lines span multiple iterations (each line is one escape path). Build `lineIterationRange[lineIndex] = {min, max}` during generation. Modify `cycleCloudIterations` to show/hide lines based on whether the current cycle iteration falls within their range.

### Step 6: DualZ for Hair (#3)

Already handled in Step 3 — `processEscapePath` includes the dualZ block and calls `onDualZParticle`. Hair callback pushes dual vectors into lineVectors, so the CatmullRomCurve3 spline incorporates them.

## Verification

1. Generate Cloud with default settings — compare particle count before/after refactor
2. Generate Hair with default settings — verify splines render identically
3. Enable dualZ, Generate Hair — verify dual points appear in splines
4. Start color cycling with Hair active — verify colors rotate on lines
5. Start iteration cycling with Hair active — verify lines show/hide
6. Run `check.py cloudGeneration.js --tools eslint` — 0 errors
7. Browser test on iteration8.com after deploy
