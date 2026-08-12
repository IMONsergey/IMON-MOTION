# IMON MOTION Agent Rules

## Source of truth

This repository is the source of truth for IMON MOTION architecture, normalized components, routing rules, and upstream provenance.

## Read order

For motion/video tasks:

1. `SKILL.md`
2. `.motion/ROUTER.md`
3. Relevant maps in `.motion/`
4. `index/catalog.md` after it is generated
5. Only then inspect targeted upstream donor files

## Upstream immutability

Never manually modify `upstream/**`. Upstream projects are vendored snapshots. Adaptations belong in `adapters/**`; reusable production code belongs in `packages/**` or `library/**`.

## Context discipline

Do not read all upstream repositories into context. Select the smallest set that covers the brief. Prefer deep inspection of a few relevant implementations over shallow ingestion of everything.

## Production discipline

For substantive video creation:

- establish intent and audience;
- define visual language;
- define shot/storyboard structure;
- define motion choreography and timing;
- implement;
- render representative frames;
- inspect hierarchy, clipping, typography, collisions, timing, continuity, easing, and visual coherence;
- fix and rerender when needed.

## Reuse discipline

Do not blindly copy donor code. Understand the technique, preserve attribution/license requirements, and normalize reusable behavior behind IMON MOTION APIs.

## Quality principle

Avoid generic AI-motion signatures: unnecessary floating, excessive blur/glow, arbitrary gradients, random stagger, constant scale pulses, gratuitous overshoot, uniform transitions, weak typography, and motion without narrative purpose.
