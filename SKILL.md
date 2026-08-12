---
name: imon-motion
description: Context router and production entry point for IMON MOTION. Use for any request to design, create, animate, render, critique, or improve video/motion work in this repository.
---

# IMON MOTION — Agent Entry Point

IMON MOTION is a motion-production system, not a template pack. The repository intentionally contains a large upstream corpus. **Do not load the whole corpus into context. Route first.**

## Required flow

1. Read `.motion/ROUTER.md`.
2. Classify the request by video type, visual language, dominant content, motion intensity, dimensionality, audio needs, and delivery format.
3. Read `.motion/capabilities.yaml`, `.motion/styles.yaml`, and `.motion/donors.yaml` only as needed.
4. Consult `index/catalog.md` / `index/catalog.json` after the upstream index exists.
5. Select the smallest useful donor set, normally 2–6 donors.
6. Inspect only the relevant files in those donors.
7. Create the creative direction and storyboard before implementation unless the request is a narrow code-only edit.
8. Prefer normalized IMON components in `packages/`, `library/`, and `adapters/` over copying donor code directly.
9. Treat `upstream/**` as read-only source material.
10. Render and perform visual QA before declaring video work complete.

## Routing priorities

- Product launch / premium product film: `video-shotcraft`, `onda`, `motion-design-skill`, `product-launch-video-skill`, `remotion-skills`.
- UI / SaaS product demo: `video-shotcraft`, `remotion-cinematic`, `onda`, `remotion-skills`.
- Kinetic typography / editorial: `motion-skills`, `motion-design-skill`, `onda`, `emilkowalski-skills`.
- Data / charts / explanatory systems: `motion-skills`, `chuk-motion`, `remotion-skills`.
- 3D / WebGL / cinematic spatial motion: `theatre`, `motion-canvas-examples`, `motion-skills`, `video-shotcraft`, `remotion-skills`.
- Vercel-like minimal technology aesthetic: `skill-remotion-geist`, `onda`, `remotion-skills`.
- Broad Remotion implementation or rendering questions: start with `remotion-skills`.

These are defaults, not hard presets. Route by the actual brief.

## Creative rule

Do not imitate a named brand literally. Extract principles such as restraint, hierarchy, physicality, pacing, typography, camera language, depth, and polish, then produce an original system appropriate to the brief.

## Completion gate

A generated composition is not complete merely because TypeScript compiles. For substantive video work, completion requires representative-frame inspection and, where practical, a rendered output review against `.motion/quality-gates.yaml`.
