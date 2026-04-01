# Mandelbrot Explorer — Roadmap

## Background

This project started in 2014. After a health scare that landed me in the ER with a heart rate of 210 and a stutter that lasted a year, I picked up *Chaos* by James Gleick and decided to write a fractal generator to see if I could still write code. That decision pulled me back into professional software development and has been a through-line in my work ever since. The first commits on GitHub date to 2017; it went online as iteration8.com in 2020 so friends could play with it. In March 2026, a major cleanup and modernization effort brought the codebase up to professional standards, and a proof-of-concept GPU rendering engine demonstrated that the entire rendering pipeline can run orders of magnitude faster using pure WebGL vertex shaders.

The iteration viewers (iteration-viewer.html, iteration-viewer-3d.html) proved that millions of points can be iterated, positioned, and rendered in a single GPU pass — no Three.js, no CPU per-point processing, no JavaScript geometry construction. This roadmap describes the path from that POC to a fully GPU-native Mandelbrot/Julia set explorer.

## Phase 1: Quick Wins (Days)

### Julia Set Mode for Iteration Viewers — [#18](https://github.com/jparish1977/mandelbrotexplorer/issues/18)
A uniform toggle in the vertex shader. Mandelbrot mode: z starts at origin, c varies per point. Julia mode: c is fixed, z starts at the point position. Minimal code change, doubles the visual capability.

### Query String Parameters — [#6](https://github.com/jparish1977/mandelbrotexplorer/issues/6)
Encode view state (center, zoom, iteration, camera angles, Julia C) in the URL. Makes it trivial to share specific views — a link IS the visualization.

### Capture & Export — [#5](https://github.com/jparish1977/mandelbrotexplorer/issues/5)
Screenshot + state export. Download a zip containing the rendered image, the parameters that produced it, and a link that reproduces the exact view.

## Phase 2: v2 Rendering Engine (Weeks)

### Replace Three.js with Pure WebGL — [#15](https://github.com/jparish1977/mandelbrotexplorer/issues/15)
Extract the iteration-viewer-3d WebGL code into a reusable rendering module. The POC already handles:
- Point cloud rendering via vertex shader iteration
- Orbit camera with lookAt matrix math
- Perspective projection
- Prefiltered point sampling

What's needed:
- Abstract into a class/module with a clean API
- Support multiple render modes (2D top-down, 3D orbit, side view)
- Integrate with existing UI and preset system
- Keep Three.js as an optional fallback during transition

### GLSL Filter Expressions — [#16](https://github.com/jparish1977/mandelbrotexplorer/issues/16)
The current eval-based filter system runs on CPU and is the primary performance bottleneck. Replace with a two-tier system:

**Safe tier (GLSL):** User expressions compiled into shader source. The shader recompiles on change (~5ms). Expressions have access to `z`, `c`, `iteration`, `magnitude`, `prevZ` — everything the current JS filters use, but running on GPU across millions of points simultaneously.

**Power tier (JS eval):** Preserved for expressions that genuinely need full JavaScript access (engine introspection, dynamic function construction). Acknowledged and documented, not hidden.

### Adaptive Point Sampling — [#17](https://github.com/jparish1977/mandelbrotexplorer/issues/17)
Current prefilter is a uniform grid with a survival threshold. Improvements:
- Boundary-aware density: more points near the set boundary, fewer in interior/exterior
- Progressive refinement: start coarse, refine while idle
- Zoom-level caching: don't resample when zooming out to a previously computed level
- Resolution auto-scaling: match point density to screen pixel density

## Phase 3: New Capabilities (Months)

### Period Detection & Orbit Visualization — [#20](https://github.com/jparish1977/mandelbrotexplorer/issues/20)
Detect periodic orbits in the vertex shader. Color points by their period (period-2, period-4, etc.). Visualize the period-doubling cascade that converges at the Feigenbaum point. Optionally render individual orbit paths as lines.

This would be the first real-time visualization of Mandelbrot set periodicity at this scale. The iteration viewer already makes it visible — this makes it explicit and interactive.

### Julia Tunnel Integration
Bring the Julia tunnel concept into the v2 GPU engine. See [docs/JULIA_TUNNEL_LINEAGE.md](docs/JULIA_TUNNEL_LINEAGE.md) for full lineage (5 versions, from 2018 fountain through 2026 triplane). Current POCs:
- `julia-tunnel.html` — multi-seed escape path walking, Julia set rendering per step, feedback loop
- `julia-tunnel-volume.html` — "the block," dense volumetric rendering, prime-resolution sampling, infinite iterations
- `julia-tunnel-sampler.html` — adaptive compute engine, Julia probe uncertainty, auto-densify, zoom-to-populate
- `julia-tunnel-triplane.html` — four displacement modes (magnitude, determinant, angular, sine), iteration frame window with per-iteration draw calls, period detection, settled-point culling

### Legacy Feature Parity
Ensure the v2 engine supports everything the Three.js version does:
- Color cycling ([#1](https://github.com/jparish1977/mandelbrotexplorer/issues/1)) — becomes a uniform change in the fragment shader, essentially free
- Iteration cycling ([#2](https://github.com/jparish1977/mandelbrotexplorer/issues/2)) — already works (the play button)
- Dual Z ([#3](https://github.com/jparish1977/mandelbrotexplorer/issues/3)) — GLSL expression in vertex shader
- Repeater handling ([#8](https://github.com/jparish1977/mandelbrotexplorer/issues/8)) — see period detection above

### Automated Deploy Pipeline — [#19](https://github.com/jparish1977/mandelbrotexplorer/issues/19)
CI/CD from merge to production:
- GitHub Actions deploys to S3 on push to master
- Automatic gh-pages sync
- CloudFront cache invalidation
- Only after CI checks pass

## Architecture Direction

```
Current (v1):                          Target (v2):
CPU iterates escape paths              GPU vertex shader iterates z = z² + c
  → JS eval filters each point           → GLSL expressions filter in shader
  → Build THREE.Geometry per iteration    → Single gl.drawArrays(POINTS) call
  → Three.js scene.add() per system      → Hand-rolled projection matrices
  → Three.js renders per draw call        → One pass, millions of points
  = Minutes for complex renders           = Real-time at any iteration
```

## Performance Comparison

| Metric | v1 (Three.js + CPU) | v2 POC (Pure WebGL) |
|---|---|---|
| Time to first frame | 30-120 seconds | < 1 second |
| Points rendered | ~100K (practical limit) | 2M+ (viewport resolution) |
| Per-frame cost | Multiple draw calls + JS overhead | Single draw call |
| Filter evaluation | CPU eval per point | GPU per-vertex |
| Iteration scrubbing | Not possible (recompute all) | Real-time slider |

## Live Demos

- **v1 (current):** [iteration8.com](http://iteration8.com)
- **v2 2D POC:** [iteration8.com/iteration-viewer.html](http://iteration8.com/iteration-viewer.html)
- **v2 3D POC:** [iteration8.com/iteration-viewer-3d.html](http://iteration8.com/iteration-viewer-3d.html)
