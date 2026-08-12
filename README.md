# IMON MOTION

**AI-native motion production system built around Remotion, selective context routing, reusable motion grammar, runtime adapters and a preserved 15-repository research corpus.**

IMON MOTION is deliberately not a template pack. It stores a large motion-design knowledge base while forcing agents to use a small, query-specific production context.

## Core idea

```text
VIDEO BRIEF
    ↓
ROUTE + DELIVERY PARSING
    ↓
NORMALIZED MOTION PRIMITIVES
    ↓
RUNTIME READINESS
    ↓
2–6 RELEVANT DONORS
    ↓
EXACT FILE RESEARCH
    ↓
BYTE-BUDGETED CONTEXT PACK
    ↓
CREATIVE DIRECTION + STORYBOARD
    ↓
REMOTION / ADAPTER IMPLEMENTATION
    ↓
REPRESENTATIVE-FRAME + MOTION QA
    ↓
DELIVERY
```

The rule is simple: **preserve the full corpus, never dump the full corpus into the model context.**

## What is in the repository

### Full donor corpus

`upstream/` preserves complete working-tree snapshots of 15 motion/design/runtime donors. Exact upstream repository, commit SHA, branch, snapshot date, file count, size and detected license files are stored in `provenance/SOURCES.lock.yaml`.

Donor source is immutable research material. Production code lives outside `upstream/**`.

### Content-aware index

`index/` is a v2 routing index built from paths plus bounded file content. It records categories and technical signals such as camera/orbit/parallax, spring/interpolate/sequence, kinetic type, shader/Three.js, chart/data, audio/beat, tokens, masks and particles.

### Normalized runtime

`@imon-motion/core` contains typed briefs, house motion tokens, semantic primitive catalog, deterministic routing, storyboard generation and capability-aware QA.

`@imon-motion/remotion-kit` contains reusable Remotion execution primitives and higher-order scenes including precision reveals, hero settles, kinetic words, 2.5D camera/depth layers, product frames, product hero scenes, UI feature scenes and editorial statement scenes.

### Specialized adapters

`adapters/` keeps specialized runtimes isolated from core:

- product capture / DOM geometry / cursor paths;
- true 3D product-orbit camera path;
- deterministic WebGL shader field;
- audio transient → Remotion frame mapping;
- planned Theatre/Motion Canvas bridges.

Adapter source presence is not treated as readiness. Each runtime has an independent proof workflow and remains `experimental` until its execution/render gates pass.

### Agent skills

`.agents/skills/` provides focused entry points for product films, UI demos, kinetic typography, data stories, cinematic 3D and motion QA. They route through one shared system rather than duplicating donor knowledge.

## Primary commands

```bash
npm install

# Classify a brief and get primitives/donors/storyboard/QA/runtime readiness
npm run route -- "35 second premium product launch with 3D orbit and UI"

# Exact-file bounded donor research
npm run research -- "35 second premium product launch with 3D orbit and UI"

# One JSON production plan
npm run plan -- "35 second premium product launch with 3D orbit and UI"

# Materialize a byte-budgeted model context pack
npm run context -- "35 second premium product launch with 3D orbit and UI"

# Read current proof-aware runtime state
npm run health

# Main Remotion normalized-runtime Studio
npm run studio
```

## Delivery parsing

The router understands duration, FPS, explicit resolution, aspect ratio and common platform intent from English/Russian briefs. A brief such as `24-секундный Reels, 9:16, 4K, 60 fps` is planned as a 24-second vertical 2160×3840 / 60fps delivery rather than falling back to generic 1080p/30fps.

## Context isolation

The normal agent flow is:

`SKILL.md → plan → context → normalized runtime → exact donor excerpts`.

`npm run context` has a global byte budget and per-file limits. Large donor files become excerpts around content hits; ignored donors are not allowed into the context pack unless the brief is rerouted.

## Runtime proof model

Separate workflows validate failure domains independently:

- core routing/context/Remotion Studio;
- Three.js product orbit;
- Playwright product capture;
- representative-frame QA rendering;
- audio analysis;
- WebGL shader rendering.

Successful gates write proof files under `status/`. `node scripts/health.mjs` distinguishes proven/current, stale and unproven runtime paths.

**Do not infer production readiness from a TypeScript file merely existing.**

## QA

QA is generated from the brief. It samples entry/read/exit states per storyboard beat and checks baseline plus capability-specific rules: hierarchy, typography, safe areas, settled states, UI truth, camera continuity, type rhythm, data truth, 3D depth, WebGL cost/purpose, sound sync, transition purpose and an explicit anti-AI-slop gate.

`scripts/render-qa.mts` can materialize representative frames as PNGs with SHA-256 and a QA manifest.

## Provenance / licensing

`npm run license:audit` regenerates `provenance/LICENSE-STATUS.json/.md` from the synchronized snapshots. Missing/unclassified license files are `review-required`; bundled media/fonts/3D/PDF assets receive a separate rights-review flag. The automated report is a provenance signal, not legal advice.

## Repository map

```text
.agents/                specialized agent skills
.motion/                routing, video types, techniques, runtime readiness, quality gates
adapters/               capture / Three / WebGL / audio and future specialized runtimes
apps/                   normalized, Three, WebGL and capture test/Studio workspaces
core/creative-director/ creative direction protocol
index/                  content-aware donor index
library/                reusable promoted production patterns
packages/motion-core/   semantic system, routing, storyboard, QA
packages/remotion-kit/  normalized Remotion execution layer
provenance/             exact donor snapshots + license/asset status
scripts/                sync, plan, research, context, QA and health tooling
status/                 successful runtime proof records
upstream/               full immutable donor snapshots
```

## Development rules

1. Route before donor browsing.
2. Normalized runtime before donor implementation.
3. Never edit `upstream/**` manually.
4. Promote recurring patterns into `library/`, `remotion-kit` or `adapters/`.
5. Named brand references are translated into principles, not copied branded graphics.
6. Preserve product truth/privacy in UI capture.
7. Keep runtime blockers explicit.
8. A hero film is not complete because TypeScript compiles.

See `docs/WORKFLOW.md`, `docs/CONTEXT-ENGINE.md`, `docs/READINESS.md` and `docs/PROVENANCE-LICENSES.md`.
