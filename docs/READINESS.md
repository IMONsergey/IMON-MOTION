# IMON MOTION Runtime Readiness

Source files are not proof of production readiness. IMON MOTION keeps independent runtime gates and proof files for systems that have materially different failure modes.

## Read current health

```bash
node scripts/health.mjs
```

The report distinguishes:

- `proven-current` — a successful runtime proof exists and no tracked relevant file changed after the tested SHA;
- `proven-stale` — the runtime passed previously but relevant code/config changed later;
- `unproven` — no successful committed proof exists.

## Runtime proof tracks

### Core

Proof: `status/core-ci.json`

Covers system validation, license/provenance audit, TypeScript, normalized tests, routing, delivery parsing, runtime readiness, bounded research, production planning, context isolation and the base Remotion Studio composition.

### True 3D

Proof: `status/three-runtime.json`

Covers deterministic orbit math, Remotion Three composition discovery and two rendered PNG frames from different camera positions.

The existence of `adapters/remotion-three/src/orbit.ts` alone does not make true 3D ready.

### Product capture

Proof: `status/capture-runtime.json`

Covers Chromium execution, interaction, screenshot export, privacy-reviewed manifest, unsafe-element handling and DOM geometry export.

### QA rendering

Proof: `status/qa-runtime.json`

Covers brief-derived representative-frame rendering, manifest generation and visual diversity checks.

### Audio analysis

Proof: `status/audio-runtime.json`

Covers deterministic transient detection and event → Remotion frame mapping. It remains an experimental onset heuristic rather than authoritative musical beat/tempo analysis.

## Honesty rule

An adapter may be implemented but still remain `experimental`. A semantic primitive may remain `adapter-required` until the relevant execution/render proof exists. Agents must not infer readiness from file presence, donor claims, or successful typechecking alone.
