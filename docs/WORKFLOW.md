# IMON MOTION Production Workflow

This is the operational workflow for agents and humans producing motion work with IMON MOTION.

## 1. Start from the brief, not from donor code

The repository contains a complete donor corpus, but donor code is research material. The production path begins with the normalized system.

```bash
npm run route -- "<video brief>"
```

The route result contains:

- normalized video type;
- styles / energy / dimensionality / quality level;
- capability families;
- ranked normalized primitives;
- runtime readiness for every selected primitive;
- bounded donor set;
- storyboard skeleton;
- capability-aware QA plan.

### Runtime statuses

- `implemented` — use the normalized IMON MOTION runtime directly.
- `recipe` — compose the behavior from existing normalized primitives and documented technique guidance.
- `adapter-required` — use/build the named adapter instead of faking the capability in ordinary CSS/2D code.
- `research-only` — knowledge/reference only; no production runtime contract exists yet.

A selected primitive does **not** imply it is already executable. Read its runtime status.

## 2. Create the creative direction

Before writing a substantive new composition, define:

- one primary message;
- audience / viewing context;
- focal rule;
- grid and safe-area rule;
- typography rule;
- surface/material rule;
- house motion grammar for the piece;
- camera rule;
- transition rule;
- sound rule;
- deliberate rest/hold rule.

Use `core/creative-director/PROTOCOL.md`.

References such as Apple, Linear, Stripe, Vercel, fashion/editorial studios, or film titles are translated into principles. Do not clone their branded graphics.

## 3. Build bounded research context

```bash
npm run research -- "<video brief>"
```

The research planner:

1. reuses the same routed donor set;
2. reads only indexes for those donors;
3. scores file path/category signals;
4. performs a deeper content scan only inside routed donors;
5. returns at most seven text files per donor plus a small asset candidate set;
6. lists ignored donors explicitly.

This is the normal way to access the 15-repository corpus. Do not manually dump the entire `upstream/` tree into model context.

## 4. Research in this order

1. `SKILL.md`
2. `core/creative-director/PROTOCOL.md`
3. `.motion/video-types.yaml`
4. `.motion/techniques.yaml`
5. `.motion/runtime-registry.yaml`
6. `packages/motion-core/src/catalog.ts`
7. relevant normalized runtime (`packages/remotion-kit/**`)
8. `library/registry.yaml`
9. relevant adapter contract
10. exact upstream files emitted by `npm run research`

The normalized system is always read before donor source.

## 5. Storyboard before implementation

Use the generated storyboard skeleton as an initial narrative structure, then revise it based on the actual brief.

Each beat should have:

- narrative purpose;
- one primary focal subject;
- one dominant motion idea;
- source asset / capture requirement;
- selected primitive IDs;
- transition intention;
- audio intention;
- settled/readable state.

Delete redundant beats. Different animations do not justify repeated information.

## 6. Asset truth and privacy

For real product/UI demonstrations:

- prefer real approved product states;
- freeze demo data;
- scrub secrets, personal information, customer information, and private workspace content;
- define viewport/DPR before capture;
- store geometry metadata when cursor/camera choreography depends on it.

A concept UI must be treated as conceptual rather than silently presented as an exact product state.

## 7. Implementation hierarchy

Use the lowest necessary level:

1. `@imon-motion/core` — brief, tokens, routing semantics, storyboard/QA models.
2. `@imon-motion/remotion-kit` — normalized executable Remotion primitives/scenes.
3. `library/` — approved reusable higher-order patterns.
4. `adapters/` — specialized spatial/WebGL/capture/audio-analysis bridges.
5. new normalized primitive — only for a real reusable gap.
6. `upstream/**` — research/provenance only.

Never edit `upstream/**` manually.

## 8. Promote instead of duplicating

If the same local implementation appears more than once, decide whether it belongs in:

- `remotion-kit` as a low-level reusable primitive;
- `library/` as a higher-order production pattern;
- `adapters/` as a specialized runtime bridge.

Promotion requires provenance and QA. See `library/README.md` and `adapters/README.md`.

## 9. Use the Studio sandbox

```bash
npm run studio
```

The repository includes `apps/studio` and composition `IMONSystemPreview` to prove the normalized runtime can be bundled by Remotion and to provide a safe development surface.

For non-interactive verification:

```bash
npm run studio:compositions
```

The CI gate requires Remotion CLI to discover `IMONSystemPreview` successfully.

## 10. QA is generated from the brief

`npm run route` returns a QA plan with representative frames and checks based on capabilities and quality level.

Baseline checks include:

- compile/bundle;
- timeline coverage;
- safe areas / clipping;
- visual hierarchy;
- typography;
- settled/readable states;
- one dominant motion idea per scene;
- anti-AI-slop review.

Capability-specific checks include UI truth, camera continuity, type rhythm, data truth, 3D depth, WebGL cost/message, audio synchronization, and transition purpose.

### Quality levels

- `draft` — code/timeline sanity and basic representative review.
- `production` — representative still review + full motion review + delivery-spec validation.
- `hero-film` — production gates + full-resolution polish + successful final render validation.

Do not claim hero-film completion without a validated final render when rendering is part of the task.

## 11. System verification

```bash
npm run system:validate
npm run typecheck
npm test
npm run studio:compositions
```

The GitHub CI additionally smoke-tests a routed product brief and the bounded research planner.

## 12. Updating donors

Donors are synchronized by GitHub Actions. The sync process:

- imports complete working-tree snapshots;
- preserves licenses where found;
- records upstream SHA/branch/date/size/file count;
- rebuilds the content-aware v2 index;
- rebases before pushing so concurrent main development is not overwritten.

Do not manually overwrite provenance or donor snapshots.

## Completion definition

A production task is complete only when:

1. the brief has been routed;
2. context was bounded rather than corpus-dumped;
3. selected primitives have known runtime readiness;
4. storyboard/creative direction are coherent;
5. production code uses normalized/library/adapter layers rather than raw donor imports;
6. required QA checks pass;
7. the expected Remotion/runtime delivery path works;
8. final render validation passes when required by the quality level/task.
