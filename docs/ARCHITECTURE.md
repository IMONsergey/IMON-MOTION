# IMON MOTION Architecture

## Goal

Build a single, large, AI-native motion production repository that preserves the full useful corpus of selected open-source donors while keeping agent context selective, explainable, and production-oriented.

## Layers

### 1. Upstream corpus — `upstream/`

Full vendored working-tree snapshots of donor repositories. This layer is immutable and reproducible. Exact source commit metadata is stored in `provenance/SOURCES.lock.yaml`.

### 2. Routing metadata — `.motion/`

Small human/agent-readable files describing donor strengths, capabilities, styles, and QA requirements. These files should be read before the large corpus.

### 3. Generated index — `index/`

Path-level file inventory generated from the imported corpus. It allows an agent to narrow a request to relevant donor files without enumerating every source tree in context.

### 4. Normalized production layer — `packages/`, `library/`, `adapters/`

The long-term product layer. Useful donor techniques are understood, adapted, attributed where required, and exposed through coherent IMON MOTION APIs instead of being copied ad hoc into every composition.

Suggested package families:

- `motion-core`
- `motion-layout`
- `motion-typography`
- `motion-shots`
- `motion-transitions`
- `motion-camera`
- `motion-ui`
- `motion-data`
- `motion-3d`
- `motion-webgl`
- `motion-audio`
- `motion-effects`

### 5. Creative Director

Before implementing a substantial new video, the agent should determine message, audience, visual grammar, hierarchy, shot structure, pacing, transition logic, type behavior, camera/depth behavior, and audio relationship.

### 6. Render QA

Production work must not be accepted based only on code validity. Representative frames and motion behavior must be checked against `.motion/quality-gates.yaml`.

## Context selection algorithm

1. Read the request.
2. Classify video type/style/content/dimensionality/audio/format/quality.
3. Map the request to capability families.
4. Use donor metadata to select 2–6 likely donors.
5. Consult only those donors' generated indexes.
6. Open exact relevant source/docs/examples.
7. Synthesize an original production approach.
8. Prefer normalized IMON components when available.

## Provenance

The project keeps donor code physically separated from first-party code. Upstream licenses remain with their imported trees. New normalized code must keep required notices and must not erase origin information.

## Update model

`scripts/sync-upstreams.sh` creates fresh shallow snapshots from donor default branches, records exact imported SHAs, and replaces only `upstream/<donor>` trees. The generated index is rebuilt after a successful sync.

Long term, updates should be reviewed as source changes rather than blindly merged into normalized production packages.
