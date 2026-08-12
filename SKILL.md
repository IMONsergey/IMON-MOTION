---
name: imon-motion
description: AI-native Creative Director, context router, normalized motion system and production entry point for IMON MOTION. Use for any request to design, create, animate, render, critique, or improve video/motion work in this repository.
---

# IMON MOTION — Agent Entry Point

IMON MOTION is a motion-production system, not a template pack. The repository contains a large preserved upstream corpus plus a smaller normalized runtime. **Do not load the whole corpus into context and do not begin by copying donor code. Route first, use normalized primitives first, research upstream only for gaps.**

## Required flow

1. Read `.motion/ROUTER.md` and `core/creative-director/PROTOCOL.md`.
2. Classify the request by video type, visual language, dominant content, motion intensity, dimensionality, audio needs, quality level, and delivery format.
3. Use `@imon-motion/core` routing logic when executable context is available (`npm run route -- "<brief>"`), otherwise reproduce the same decision model from `.motion/` files.
4. Read `.motion/video-types.yaml` and `.motion/techniques.yaml` for the selected task families.
5. Select normalized primitives from `packages/motion-core/src/catalog.ts` before opening raw donor implementations.
6. Select the smallest useful donor research set, normally 2–6 donors.
7. Consult `index/catalog.md` / per-donor indexes and open exact upstream files only when implementation/detail research is needed.
8. Create creative direction and storyboard before implementation unless the request is a narrow code-only edit.
9. Implement with `@imon-motion/remotion-kit`, `library/`, and `adapters/` before creating new one-off animation logic.
10. Treat `upstream/**` as immutable source material.
11. Render and perform visual QA before declaring substantive video work complete.

## Normalized runtime

### `@imon-motion/core`

Provides:

- typed motion brief and delivery model;
- house motion tokens;
- normalized primitive catalog with provenance;
- deterministic brief classification and donor ranking;
- storyboard skeleton generation.

Primary source files:

- `packages/motion-core/src/types.ts`
- `packages/motion-core/src/tokens.ts`
- `packages/motion-core/src/catalog.ts`
- `packages/motion-core/src/router.ts`
- `packages/motion-core/src/storyboard.ts`

### `@imon-motion/remotion-kit`

Provides the first normalized Remotion execution layer:

- `MotionScene`
- `PrecisionReveal`
- `HeroSettle`
- `KineticWords`
- `Camera2D`
- `DepthPlane`
- `ProductFrame`
- canonical choreography helpers

Use these as building blocks, not as a fixed visual template.

## Routing priorities

- Product launch / premium product film: normalized hero/camera/transition/audio primitives; research `video-shotcraft`, `onda`, `motion-design-skill`, `product-launch-video-skill`, `remotion-skills` as needed.
- UI / SaaS product demo: normalized UI/camera primitives; research `remotion-cinematic`, `video-shotcraft`, `onda`, `remotion-skills`.
- Kinetic typography / editorial: normalized type/choreography primitives; research `motion-skills`, `motion-design-skill`, `onda`, `emilkowalski-skills`.
- Data / charts / explanatory systems: normalized data/type primitives; research `chuk-motion`, `motion-skills`, `remotion-skills`, `motion-canvas-examples`.
- 3D / WebGL / cinematic spatial motion: normalized camera/effect vocabulary; research `theatre`, `motion-canvas-examples`, `motion-skills`, `video-shotcraft`, `remotion-skills`.
- Vercel-like minimal technology aesthetic: use `tech-minimal` principles; research `skill-remotion-geist`, `onda`, `remotion-skills` when necessary.
- Broad Remotion API/runtime/rendering questions: official `remotion-skills` is the engineering authority.

These are defaults, not hard presets. Route by the actual brief.

## Conflict order

When guidance conflicts:

1. explicit user constraints;
2. product/content truth and privacy;
3. IMON MOTION Creative Director and quality rules;
4. official Remotion engineering guidance for runtime/API correctness;
5. normalized IMON MOTION primitive semantics;
6. donor visual/implementation guidance.

## Creative rule

Do not imitate a named brand literally. Extract principles such as restraint, hierarchy, physicality, pacing, typography, camera language, depth, materiality, sound discipline, and polish, then produce an original system appropriate to the brief.

## Primitive rule

Do not create a new animation helper if an existing normalized primitive expresses the same behavior. Introduce a new primitive only when it fills a reusable gap and record donor provenance when external research informed it.

## Completion gate

A generated composition is not complete merely because TypeScript compiles.

- `draft`: compile/typecheck and basic timeline sanity.
- `production`: representative-frame inspection + motion review + anti-AI-slop gate.
- `hero-film`: production gates + successful final render validation for expected duration, resolution, fps, and audio requirements.

Apply `.motion/quality-gates.yaml` and repeat render → inspect → fix until the required gate passes.
