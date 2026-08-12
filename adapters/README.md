# IMON MOTION Adapters

`adapters/` contains explicit bridges between the normalized IMON MOTION model and specialized runtimes or donor-derived implementation techniques that do not belong in the core Remotion layer.

Adapters exist so `@imon-motion/core` remains stable while spatial, WebGL, capture, audio-analysis, or other specialized systems evolve independently.

## Planned adapter families

- `theatre-three` — Theatre.js + Three.js sequencing for true 3D camera/object animation.
- `remotion-three` — Remotion-compatible Three.js composition bridge.
- `webgl` — shader/generative graphics integration.
- `motion-canvas` — technique translation/reference bridge where Motion Canvas math is useful but Remotion remains delivery runtime.
- `product-capture` — stable UI capture/geometry metadata for cursor/camera choreography.
- `audio-analysis` — beat/transient metadata used by edit/choreography systems.

## Adapter contract

Every adapter must:

1. declare the capabilities and primitive IDs it implements;
2. expose deterministic inputs/outputs suitable for a frame-based render pipeline;
3. keep external/runtime-specific state outside `motion-core`;
4. document browser/render requirements and fallbacks;
5. preserve provenance for donor-informed techniques;
6. declare asset/licensing constraints;
7. define a graceful fallback when the specialized runtime is unavailable, where feasible;
8. pass its own smoke test before its status becomes `ready`.

See `adapters/contracts.yaml` for the machine-readable registry.

`upstream/**` must never be imported as an implicit runtime dependency. An adapter may research donor code, but the production implementation lives here or in a normalized package.
