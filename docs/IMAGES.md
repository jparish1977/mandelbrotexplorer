# Image Documentation

## screenshot.png
**Date:** March 2026
**Source:** Mandelbrot Explorer (current version), GitHub Pages deployment
**Description:** The main Mandelbrot Explorer application showing the 3D particle cloud visualization with the alternative UI panel. Default settings, palette2 color scheme.

---

## the-sparse-fill-problem.png
**Date:** March 2026
**Source:** Mandelbrot Explorer, iteration8.com
**Settings:** Iteration 512, Cloud Resolution 43,454 (multi-resolution), default view
**Description:** Demonstrates the sparse point density problem at high iterations with low sample resolution. The green loops show the period-orbit structure but with visible gaps between points. This is the "before" image for the Julia tunnel gap-filling approach — the hypothesis is that Julia sets computed at the midpoint c between two sparse points would fill exactly these gaps, because the Julia set contains all bounded dynamics in that c's neighborhood.

---

## prime-moire.png
**Date:** March 2026
**Source:** Mandelbrot Explorer, iteration8.com
**Settings:** Cloud Resolution 307,359,401,467,541 (five prime-number resolutions), 32 max iterations
**Description:** Shows geometric moiré interference patterns created by overlaying multiple prime-number sampling grids. Because prime resolutions are coprime to each other, their grids never align, producing maximally structured interference patterns. The straight-edged geometric patterns visible in the gaps are the beat frequencies of the prime grids projected through the Mandelbrot iteration map.

---

## 471482986_1602454350402409_596371255765121302_n.jpg
**Date:** Pre-2026 (PHP/GD version era)
**Source:** PHP-based Mandelbrot generator (phpbrot.php, earlier version)
**Settings:** Single resolution (believed 1024x1024), iteration 6, points surviving 512 iterations
**Description:** A density map showing where surviving points are at z_6 after exactly 6 iterations. The visible structure — clean circles around period bulbs, grid texture in the halo, dense center — is the iteration map acting on a uniform sampling grid exactly 6 times. The circles correspond to basins of periodic attractors; points near period-N bulbs are already being pulled toward their N-cycle. The white voids in the main cardioid and period-2 bulb are where bounded points have barely moved, piling on top of each other. The grid texture in the halo is from points about to escape — the uniform grid being sheared by the dynamics with spacing becoming non-uniform.

---

## 471847788_1602454037069107_2722299025150448077_n.jpg
**Date:** Pre-2026 (PHP/GD version era)
**Source:** PHP-based Mandelbrot generator (phpbrot.php, earlier version)
**Settings:** Believed 1024x1024, iteration 2, points surviving 512 iterations
**Description:** Density map at iteration 2 — z_2 = c² + c. The most notable feature is a **ghost minibrot** visible on the right side along the real axis, past where the main Mandelbrot set's antenna ends (~0.25). This minibrot has no business being there — it's not part of the Mandelbrot set. It's a structural artifact of the degree-4 polynomial c² + c, which has its own critical point dynamics that locally mirror z → z² + c. This ghost minibrot reappears periodically — roughly every 3-4 iterations — as the degree-2^N polynomial's fixed point structure creates a Mandelbrot-like copy at that location whenever N hits a multiple of the local period. The diamond/web patterns in the density are the sampling grid after just two applications of the iteration map. The swirl inside the main cardioid shows the grid being rotated by the local multiplier of the fixed point.

---

## 471470444_1602455823735595_4512727761822853615_n.jpg
**Date:** Pre-2026 (PHP/GD version era)
**Source:** PHP-based Mandelbrot generator (phpbrot.php, earlier version)
**Settings:** Every prime from 11 to 811 (~130 primes) individually sampled then combined into a single point set. Points prefiltered to only those surviving 512 iterations. Displayed at iteration 1. Output: 4096x4096 pixels.
**Description:** The clearest image of the prime moiré phenomenon. This is NOT showing iteration dynamics — it is iteration 1 (z_1 = c, which is just the starting position) displayed ONLY for points that are known to survive 512 iterations. The image is therefore a pure density map of prime grid coverage masked by Mandelbrot set membership. The straight white lines cutting through the boundary ring are systematic voids where no prime grid (11 through 811) placed a sample point. These lines are purely arithmetic — they represent gaps in the combined coverage of ~130 coprime sampling grids, with the Mandelbrot set boundary acting as a cookie cutter. The moiré pattern is most visible on the boundary because interior points pile up (full density) and exterior points are filtered out (zero density), leaving the boundary as the only region where sampling density varies. The different angles of moiré lines at each period bulb reflect the local conformal geometry of that hyperbolic component.
