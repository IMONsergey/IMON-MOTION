---
name: imon-cinematic-3d
description: Route and implement spatial product motion, Three.js camera work, WebGL/3D scenes and cinematic depth without pretending planned adapters are production-ready.
---

# Cinematic 3D

Run `npm run plan -- "<brief>"` and inspect `runtimeSummary.adapterRequired` before implementation.

Current spatial layers:
- 2.5D production fallback: `Camera2D + DepthPlane` / `camera.parallax-2_5d`.
- true orbit math: `adapters/remotion-three/src/orbit.ts`.
- true 3D proof composition: `apps/three-studio` / `IMONProductOrbit3D`.
- WebGL shader/particle adapters remain separate readiness tracks.

Research the routed subset of `remotion-skills`, `theatre`, `video-shotcraft`, `motion-canvas-examples`, `motion-skills`.

Rules:
- true 3D needs deterministic frame state;
- camera follows a subject or reveals information;
- avoid continuous orbit as ambient decoration;
- keep a 2.5D fallback when specialized runtime is unavailable;
- do not upgrade a spatial primitive to `implemented` until its bundle/render gate passes.
