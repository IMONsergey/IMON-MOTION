# IMON MOTION Library

`library/` is the promotion layer between low-level normalized primitives and project-specific video code.

A library item is a **reusable production pattern that has already proved useful**, not an arbitrary demo or a copied donor component.

## What belongs here

- higher-order shot recipes;
- reusable product/UI scene patterns;
- approved transition compositions;
- typography systems;
- data-storytelling assemblies;
- camera choreography recipes;
- sound cue structures;
- QA-tested combinations of normalized primitives.

## What does not belong here

- raw files from `upstream/**`;
- one-off client scenes that have no reuse value;
- duplicate wrappers around an existing primitive;
- unlicensed donor assets;
- stylistic copies of a named brand;
- experimental code that has not passed at least production-level QA.

## Promotion gate

Before promoting an item into the library:

1. The behavior must solve a recurring production problem.
2. It must be expressible in terms of normalized IMON MOTION primitives/adapters or explicitly justify a new primitive.
3. Any donor research must be recorded as provenance, while the implementation remains IMON-native.
4. Inputs/outputs and supported video types must be documented.
5. Misuse/anti-pattern guidance must be documented when relevant.
6. The item must pass representative-frame and motion review.
7. It must be registered in `library/registry.yaml`.

## Stability levels

- `experimental` — promising, still changing.
- `candidate` — reused successfully; API may still change.
- `approved` — stable enough for agents to prefer in normal production.
- `deprecated` — retained for compatibility/provenance but should not be selected for new work.

Agents should prefer `approved`, then `candidate`; `experimental` is opt-in when the brief needs it.
