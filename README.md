# IMON MOTION

**IMON MOTION** is an AI-native motion production system built around Remotion, a Creative Director protocol, deterministic context routing, normalized motion primitives, automated QA, and a preserved upstream knowledge corpus.

The core rule is simple: **store the full source corpus, but load and execute only what the current video actually needs.**

## Current release — v0.2

v0.2 adds the first executable IMON-native layer above the 15 imported donor repositories:

- typed motion brief / delivery model;
- canonical motion tokens;
- normalized primitive catalog with provenance;
- deterministic brief classifier and donor ranker;
- narrative storyboard skeleton generation;
- reusable Remotion choreography and React primitives;
- Creative Director production protocol;
- video-type and technique profiles;
- structural validator, unit tests, route CLI, and GitHub Actions CI.

## Architecture

### Agent / direction layer

- `SKILL.md` — entry point for GPT/Codex/agents.
- `core/creative-director/PROTOCOL.md` — production decision protocol before implementation.
- `.motion/ROUTER.md` — context routing rules.
- `.motion/video-types.yaml` — production profiles by video type.
- `.motion/techniques.yaml` — normalized technique families and selection rules.
- `.motion/capabilities.yaml` — capability → donor research map.
- `.motion/styles.yaml` — visual-language principles.
- `.motion/quality-gates.yaml` — compile/frame/motion/render QA gates.

### Normalized runtime

- `packages/motion-core/` — brief types, house tokens, primitive registry, routing, donor ranking, storyboard model.
- `packages/remotion-kit/` — normalized Remotion choreography and reusable React primitives.
- `library/` — curated higher-order scenes/patterns promoted after successful reuse.
- `adapters/` — bridges for donor-specific or non-Remotion systems such as Theatre/WebGL/Motion Canvas.

### Research corpus

- `upstream/` — immutable snapshots of all 15 donor repositories.
- `index/` — generated searchable catalog and per-donor file/capability indexes.
- `provenance/SOURCES.lock.yaml` — exact upstream repository, commit SHA, branch, import date, file count, size, and license discovery.

`upstream/**` is research material. Production code should not depend directly on raw donor paths when a normalized primitive can express the behavior.

## Context flow

```text
USER BRIEF
   ↓
SKILL.md
   ↓
CREATIVE DIRECTOR
   ↓
routeBrief()
   ↓
VIDEO TYPE + STYLE + CAPABILITIES
   ↓
NORMALIZED PRIMITIVES
   ↓
BOUNDED DONOR RESEARCH (normally 2–6)
   ↓
STORYBOARD
   ↓
REMOTION KIT / LIBRARY / ADAPTERS
   ↓
RENDER → INSPECT → FIX → RENDER
```

The model should never open all donor repositories for a single task.

## Normalized primitives

The first catalog already covers:

- restrained and hero reveals;
- exits and state swaps;
- kinetic typography and numeric proof points;
- geometry-aware UI focus patterns;
- 2.5D parallax and product camera language;
- depth/mask/match-move transitions;
- chart/data storytelling patterns;
- restrained light and particle accents;
- WebGL shader direction;
- beat mapping and impact sound structure;
- hero product, UI feature, and editorial scene grammar.

See `packages/motion-core/src/catalog.ts` for the machine-readable registry and provenance.

## Remotion kit

`@imon-motion/remotion-kit` currently exposes foundational primitives including:

- `MotionScene`
- `PrecisionReveal`
- `HeroSettle`
- `KineticWords`
- `Camera2D`
- `DepthPlane`
- `ProductFrame`

These are building blocks, not a visual template. Art direction remains brief-specific.

## Route a brief

```bash
npm install
npm run route -- "35 second premium product launch with controlled 3D orbit, UI detail and cinematic sound"
```

The command returns normalized brief classification, capabilities, bounded donor set, selected primitives with provenance, and a storyboard skeleton.

## Verification

```bash
npm run system:validate
npm run typecheck
npm test
```

or run the complete local gate:

```bash
npm run ci
```

GitHub Actions runs the same architecture validation, TypeScript checks, routing tests, and a real route smoke test.

## Upstream sync

```bash
npm run upstream:sync
npm run index:build
```

The automated sync keeps the full donor working trees in `upstream/`, regenerates indexes, and records exact upstream SHAs. Do not manually edit donor snapshots.

## Production rules

1. Route before reading upstream.
2. Creative direction before implementation for substantive new videos.
3. Prefer normalized primitives over donor copy/paste.
4. Real product/UI capture is preferred when reproducing a real product state.
5. One scene should have one dominant motion idea.
6. Camera movement must reveal/follow something meaningful.
7. Effects and large impacts are scarce emphasis devices.
8. Production/hero work requires representative-frame and motion review.
9. Hero films require final render validation.
10. Preserve provenance and upstream licenses.

## Upstream policy

Each imported project keeps its original license files where present. Exact source metadata is recorded in `provenance/SOURCES.lock.yaml`. Review source and asset licensing before redistributing or commercializing donor-derived material.
