# Julia Tunnel — Concept Lineage

The Julia tunnel is a recurring idea across MBE's history: use the mathematical relationship between the Mandelbrot set and Julia sets as a feedback loop for visualization and, eventually, predictive sampling. The concept has been independently developed three times across different codebases.

## Version 1: "Julia Fountain" (~2018)

**Location:** XPS 420 copy — `mandelbrotexplorer/juliafountain.txt`  
**Also recovered to:** `~/saved/from-xps420/mandelbrotexplorer/juliafountain.txt`

**Approach:** For points that reach max iterations (didn't escape), take a single point from the Mandelbrot escape path, compute one Julia escape path from it, and plot the trajectory as Three.js particles spraying outward.

**Key code:**
```javascript
var juliaFountain = mandelbrotExplorer.getJuliaEscapePath(
  escapePath[pathIndex], [newX, newY]
);
```

**What it answers:** "Where does this one point go in Julia space?"

**Visual result:** Sparse particle sprays — individual Julia trajectories radiating from Mandelbrot escape path points.

## Version 2: "Julia Tunnel" (T7600 / iteration8 sandbox, ~2020)

**Location:** `~/saved/from-t7600/sandbox/public/mandelbrotexplorer.js` lines 1014–1063  
**Key config:** `juliaTunnel: false`, `juliaTunnelFrame: 0`, `skipMandelbrotParticles`

**Approach:** For *every* sampled point in the Mandelbrot cloud that passes the filter, compute the full Julia escape path and add every step as a Three.js particle. Combined with `theMeat` filter (middle 80% of iterations) and `dualZ` transforms, this produces enormous particle counts.

**Key code:**
```javascript
// Called for every cloud point that passes filters
addJuliaTunnelParticles(x, y, escapePath[0], iteration);

// Inside: computes full Julia escape path, adds every step as a particle
let jep = mandelbrotExplorer.getJuliaEscapePath([x, y], c, n);
jep.forEach(function(jepPathValue, jepPathIndex, source) {
    // ... filter, then:
    mandelbrotExplorer.iterationParticles[jepPathIndex].particles.vertices.push(particleVector);
});
```

**What it answers:** "What do ALL the Julia escape paths look like across the entire sample region?"

**Visual result:** Dense, solid-looking 3D structures — the full volume of Julia-space dynamics for the sampled region. This was the "solid block of stuff" visualization.

**Features lost and worth recovering:**
- `juliaTunnelFrame` — frame-by-frame depth control into the tunnel
- `skipMandelbrotParticles` — render ONLY the Julia tunnel, hiding the Mandelbrot cloud
- Integration with `dualZ` multiplier for doubled/mirrored geometry
- Integration with `theMeat` and other particle filters
- Seed persistence — `keepSeeds` for re-rendering without resampling

## Version 3: "Julia Tunnel" (Current MBE v2, 2026)

**Location:** `julia-tunnel.html` in project root

**Approach:** Clean standalone WebGL visualizer. Multiple seed points on the Mandelbrot boundary each generate an escape path. Each step of each escape path becomes a Julia C value. At each step, an entire Julia set (full sample grid) is rendered via vertex shader. Stacks in 3D as you advance the iteration slider.

**Key features:**
- Pure WebGL — no Three.js dependency
- Path texture: escape paths packed into a float texture, sampled in the vertex shader
- Up to 10 simultaneous seed points with distinct color hues
- **Feedback toggle:** Julia endpoint fed back as Mandelbrot C for a second iteration pass
- GPU-computed — entire Julia set per slice rendered in a single draw call
- Interactive: camera orbit, iteration depth slider, play/animate through depths

**What it answers:** "What does the entire Julia set look like at each step of the escape path, and what happens when Julia feeds back into Mandelbrot?"

**Visual result:** Stacked cross-sections of successive Julia sets — a tunnel through Julia-space along the Mandelbrot escape trajectory.

## Comparison

| | Fountain (2018) | T7600 Tunnel (~2020) | Current Tunnel (2026) |
|---|---|---|---|
| **Scope per point** | One Julia path | One Julia path | Full Julia set |
| **Points processed** | Max-iteration only | Every cloud sample | Multiple seeds |
| **Particle density** | Sparse | Massive / solid | Medium per slice |
| **Feedback** | None | None | Julia → Mandelbrot → Julia |
| **Renderer** | Three.js particles | Three.js particles | Pure WebGL shader |
| **Performance** | Fast (few particles) | Slow (millions of particles) | Real-time (GPU) |
| **3D depth axis** | \|z\| | Escaping Z formula | Δ\|z\| (signed) |

## Future Direction: Predictive Sampling

The Julia tunnel concept connects directly to the planned adaptive sampling work (ROADMAP Phase 2, [#17](https://github.com/jparish1977/mandelbrotexplorer/issues/17)):

- **Gap filling:** Instead of brute-force computing every point at every iteration depth, use Julia set structure to predict which points are still iterating at depth N and only compute those.
- **Spatial prediction:** For panned/zoomed viewports with uncomputed regions, use Julia correspondences from neighboring computed points to predict escape iterations — prioritizing computation where prediction uncertainty is highest.
- **Feedback as a probe:** The v3 feedback mode (Julia endpoint → Mandelbrot C → iterate) tests the dynamics of a region from the inside. Points that survive feedback indicate deep structure worth computing.

The existing JSON metadata (coordinates, zoom, iteration depth) paired with the 19,000+ render library on the ThinkCentre/iteration8 provides a training dataset for a model that could learn the relationship between complex-plane location, iteration depth, and visual morphology — enabling intelligent sampling rather than exhaustive grid computation.

## Version 4: "The Sampler" (2026, in progress)

**Location:** `julia-tunnel-sampler.html` in project root  
**Also:** `julia-tunnel-volume.html` (the block visualization that informed this)

**The insight:** The Julia tunnel isn't just a visualization — it's a computational uncertainty map. Points "barely holding on" in z-space are the ones worth computing at the next iteration depth. Points that escaped or settled are resolved. The tunnel shows you where your compute budget should go.

### Architecture

The sampler combines two targeting strategies:

1. **Iteration-depth targeting (Julia probe):** At each step, run a short Julia iteration using the current z as C. The LHS spread (escapingZ variance) of the Julia path measures uncertainty. High uncertainty = frontier = compute this point. Low uncertainty = skip it.

2. **Spatial targeting (prime-resolution grid):** Non-uniform sampling using consecutive primes (2, 3, 5, 7, ...) summing to a target (~1250). Each prime subdivides the range, unique positions collected. This puts density where the structure is, not where a uniform grid would.

### The Pipeline

```
Phase 1: Brute force (iterations 1–50)
  Full prime grid, every point computed every step.
  No predictions — everything is still in flux.

Phase 2: Adaptive (iterations 50+)
  Julia probe classifies each point:
    - ESCAPED: resolved, stop computing (let fly off for 8 steps visually)
    - BOUNDED: probe says deep interior, skip
    - FRONTIER: high uncertainty, keep computing
    - UNDECIDED: moderate uncertainty, keep computing

Phase 3: Auto-densify
  When frontier count stabilizes (<1% change over 5 consecutive steps):
    - Drop a fine prime grid around every frontier point
    - Fast-forward new points to current iteration
    - Resume adaptive iteration on the expanded set
    - Repeat — each pass narrows the frontier and increases local density

Phase 4: Zoom-to-populate
  On scroll zoom: viewport narrows in the complex plane.
  New prime-sampled points generated covering visible region.
  Fast-forwarded to current iteration, added to the cloud.
  The classic Mandelbrot zoom, but populating a 3D point cloud.
```

### The Fourth Insight: Z-space → C-space Feedback

Dense clumps in z-space (where iterated points cluster) trace back to specific neighborhoods in c-space (their original c values). Those c-space neighborhoods are where the Mandelbrot set is producing the most interesting structure at that iteration depth.

**The feedback loop:**
1. Identify dense clumps in z-space
2. Map them back to their c-space origins
3. Densify those c neighborhoods with new prime samples
4. The new samples produce new z-space structure
5. That structure reveals new c neighborhoods to sample
6. Repeat

This is the Julia tunnel concept applied as a sampling strategy: z-space dynamics point back at c-space regions that matter. The fountain sprays outward, the tunnel walks forward, and the sampler uses both to decide where to compute next.

### Key Formulas

**EscapingZ (the LHS):** `sign(|z| - |c|) * sqrt(abs(|z| - |c|))` — sign-preserved square root of the difference between current z magnitude and original c magnitude. This is the Z-axis depth in 3D and the core signal for the sampler.

**NOT** `|z_i| - |z_{i-1}|` (successive iteration difference). The LHS measures displacement from the origin point, not step-to-step delta.

**Determinant LHS (confirmed):** `sign(det) * sqrt(abs(det))` where `det = zRe * cIm - cRe * zIm`

The cross-product / determinant of z and c as 2D vectors — the signed area of the parallelogram they form. Zero when z and c are parallel, maximum when perpendicular. No denominator — the division by `(zIm * cIm)` creates unnatural stacking artifacts. The pure determinant is correct.

This measures **orthogonality** between the iteration and its origin. Points iterating parallel to c stay flat, points rotating perpendicular spike.

Four confirmed escapingZ modes:
1. **Magnitude LHS**: `sign(|z|-|c|) * sqrt(abs(|z|-|c|))` — radial energy
2. **Determinant LHS**: `sign(det) * sqrt(abs(det))` where `det = zRe*cIm - cRe*zIm` — orthogonality (the "fraction" approach — pure cross-product, no denominator; dividing by `zIm*cIm` causes stacking artifacts)
3. **Angular LHS**: `sign(Δθ) * sqrt(abs(Δθ))` where `Δθ = atan2(zIm,zRe) - atan2(cIm,cRe)` — rotational displacement
4. **Sine LHS**: `signSqrt(det / (|z| * |c|))` — the reduced fraction; normalizing the determinant by the magnitude product gives the sine of the angle between z and c, bounded [-1,1], no real-axis blowup. This is the "proper reduction" of the fraction subtraction.

Additional displacement mode ideas (not yet implemented):
- **Displacement magnitude**: `signSqrt(|z - c|)` — pure distance between z and c, how far z has traveled from its start
- **Displacement fraction**: `signSqrt((zRe-cRe) / (zIm-cIm))` — the fraction of the displacement vector itself
- **Displacement determinant**: `signSqrt((zRe-cRe)*cIm - cRe*(zIm-cIm))` — how perpendicular the displacement is to c

### POC Results (2026-03-31)

**Sampler (`julia-tunnel-sampler.html`):**
- At prime resolution ~1250, ~2.8M sample points
- Iteration 62: 91.6% compute saved, 1,686 frontier points out of 2.8M
- Brute force mode confirms the sampler misses some fine detail — the Julia probe is too aggressive at predicting "bounded" for borderline points
- Hybrid approach (brute force → adaptive) is the correct strategy
- Asymmetric resolution between -/+ imaginary half-planes observed — likely floating-point edge cases in the probe's bounded prediction, not in the set itself. Interior (main cardioid) resolves symmetrically.

**Triplane (`julia-tunnel-triplane.html`):**
- Four displacement modes overlaid on the same XY plane, each pushing Z differently
- Iteration frame window: N separate draw calls (one per iteration in the frame), each showing ALL points at that iteration depth — escaped points hidden (they're gone), settled interior optionally culled via Brent's cycle detection for early bail
- At primes 1300, iteration 1637, frame 37: revealed 3D filament structure connecting the antenna to ghost minibrots — architecture invisible in 2D renders
- Sharp 90-degree turn under the period-2 bulb ("hummingbird beak") — the geometry of the period-1 to period-2 dynamical transition rendered as physical structure
- Positive-real escape trajectories ("everything reaching into positive land") — escape direction information that 2D coloring discards
- Period detection via extended iteration: colors interior by orbital period (period-1, 2, 3... each distinct hue)
- Settled interior culling using Brent's cycle detection inside the main iteration loop — early bail saves the full remaining iteration + period detection cost

## Version 5: The Triplane Discovery (2026-03-31)

The triplane POC revealed that the four displacement modes aren't just different views — they expose fundamentally different aspects of the dynamics:

1. **Magnitude** — radial energy, how far z has moved from c
2. **Determinant** — orthogonality, the signed area between z and c vectors. The "fraction subtraction" simplified: just the cross-product, no denominator (division by zIm*cIm causes stacking artifacts)
3. **Angular** — rotational displacement, how much z has turned relative to c
4. **Sine** — the properly reduced fraction: determinant normalized by magnitude product, bounded [-1,1]

**Key discovery:** The fraction approach (treating z and c components as fractions: zRe/zIm - cRe/cIm) led to the determinant as the natural displacement. The denominator (LCD = zIm*cIm) creates artifacts. Attempted sign-preservation on the denominator also stacked. The pure numerator (the cross-product/determinant) produces the most natural geometry.

**Iteration frame architecture:** Each iteration in the cycle frame is a SEPARATE draw call showing ALL points at that depth. Not one shader filtering a window — N shaders, one per iteration. This is how the original MBE particle systems work: each iteration is its own geometry, the cycle frame selects which N to render simultaneously. Points position at their z-values after that many iterations. Escaped points are gone. This is the correct architecture.

### TODO
- [ ] Toggle c-space vs z-space positioning (show where clumps originated)
- [ ] "Densify at origin" — trace z-space clumps to c-space, densify those neighborhoods
- [ ] Brute force → adaptive auto-switch at configurable iteration threshold
- [ ] GPU-accelerated fast-forward for densify (WebGPU or Web Workers)
- [ ] Conjugate symmetry enforcement to prevent asymmetric prediction artifacts
- [ ] Amplify interior point orbital motion (multiply delta between iterations)
- [ ] Per-iteration color shading within each displacement mode (distinguish layers in frame)
- [ ] Additional displacement modes: displacement magnitude |z-c|, displacement fraction (zRe-cRe)/(zIm-cIm), displacement determinant
- [ ] Integrate triplane displacement modes into the sampler
- [ ] Investigate the filament structure connecting antenna to ghost minibrots
- [ ] Investigate the period-2 transition geometry ("hummingbird beak" / 90-degree turn)
