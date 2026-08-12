---
name: imon-motion-qa
description: Validate IMON MOTION compositions at draft, production or hero-film quality using generated sample frames, motion review, delivery constraints and anti-AI-slop gates.
---

# Motion QA

Use the QA object returned by `npm run plan -- "<brief>"` / `npm run route -- "<brief>"`.

Baseline review:
- compile/bundle and timeline coverage;
- safe areas/crops;
- focal hierarchy;
- typography and final reading states;
- one dominant motion idea per scene;
- anti-AI-slop gate.

Capability-specific review adds UI truth, camera continuity, type rhythm, data truth, 3D depth, WebGL cost/purpose, sound synchronization and transition purpose.

Quality:
- `draft`: sanity + representative review;
- `production`: stills + full motion review + delivery spec;
- `hero-film`: production gate + full-resolution polish + validated final render.

Never claim hero-film completion from TypeScript success alone.
