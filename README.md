# IMON MOTION

**IMON MOTION** is an AI-native motion production monorepo built around Remotion, a context router, reusable motion primitives, production workflows, and a preserved upstream knowledge base.

The repository is designed around one rule: **store the full source corpus, but load only the context needed for the current video request.**

## Architecture

- `SKILL.md` — entry point for GPT/Codex/agents.
- `.motion/` — context router, donor registry, capability map, style map, and quality gates.
- `upstream/` — immutable snapshots of external donor repositories.
- `index/` — generated searchable catalog of upstream files and capabilities.
- `core/` — IMON MOTION creative-director and production architecture.
- `packages/` — normalized reusable Remotion/motion primitives.
- `library/` — curated shots, scenes, transitions, typography, cameras, effects, 3D, audio.
- `adapters/` — integration layer between donor implementations and IMON MOTION.
- `scripts/` — upstream sync and indexing tooling.

## Upstream policy

`upstream/**` is treated as vendored source material and must not be edited manually. Improvements and adaptations belong in `packages/`, `library/`, or `adapters/`.

Each imported project keeps its original license files. The exact source repository and imported commit are recorded in `provenance/SOURCES.lock.yaml`.

## Context policy

Agents must not indiscriminately ingest all donor repositories. Start from `SKILL.md`, classify the request, consult `.motion/ROUTER.md` and the generated index, then open only the relevant donor files.

## Status

Initial architecture and automated upstream ingestion are being bootstrapped.
