# IMON MOTION Context Engine

IMON MOTION intentionally stores more motion knowledge than an agent should read at once. The context engine exists to preserve the full donor corpus while keeping each video task narrow, relevant, and reproducible.

## Preferred command

```bash
npm run plan -- "<video brief>"
```

`plan` is the machine-readable brief-to-production plan. It combines:

- delivery parsing (duration, aspect ratio, resolution, fps, platform when stated);
- video type/style/energy/dimensionality classification;
- capability selection;
- normalized primitive ranking;
- runtime readiness (`implemented`, `recipe`, `adapter-required`, `research-only`);
- explicit adapter blockers;
- bounded donor selection;
- exact-file research;
- storyboard skeleton;
- capability-aware QA.

For model-context preparation, use:

```bash
npm run context -- "<video brief>"
```

## Context pack guarantees

The context builder runs the production planner first and then materializes a byte-budgeted context pack.

Default limits:

- global context payload: 768 KiB;
- normalized IMON file allocation: 64 KiB/file;
- donor excerpt allocation: 28 KiB/file;
- only routed donors may contribute donor excerpts.

Override the budget when the execution environment requires it:

```bash
IMON_CONTEXT_BUDGET_BYTES=524288 npm run context -- "<video brief>"
```

Optional limits:

- `IMON_CONTEXT_NORMALIZED_FILE_BYTES`
- `IMON_CONTEXT_DONOR_FILE_BYTES`

## Retrieval hierarchy

1. IMON rules and Creative Director protocol.
2. Video-type / technique / runtime-readiness registries.
3. Normalized primitive catalog and execution layer.
4. Reusable candidate/approved library patterns.
5. Adapter contracts.
6. Query-specific excerpts from routed upstream donors.
7. Full donor file only when the excerpt is insufficient for an implementation question.

The agent must reroute before opening a donor listed in `ignoredDonors`.

## Why excerpts instead of full donor files

Large files often contain many unrelated examples and implementation details. The research planner stores `contentHits`; the context builder uses those signals to select ranges around relevant matches. It preserves path, donor, research score, original file size, selected byte count, and line ranges.

Small useful files may be included whole. Large files are clipped to the configured per-file budget.

## Runtime awareness

Context selection is not purely stylistic. When the route selects a semantic primitive such as `camera.product-orbit`, the context pack also carries its runtime status. An `adapter-required` primitive cannot be silently treated as already implemented.

This lets the agent distinguish:

- what should be done creatively;
- what is already executable;
- what can be composed as a recipe;
- what requires specialized runtime work;
- what donor material is relevant research.

## Isolation rules

- Never load all 15 donors into one task context.
- Never import raw `upstream/**` files as implicit production dependencies.
- Never let `ignoredDonors` leak into the generated context pack.
- Never substitute broad donor recall for the exact research plan when `npm run research`/`context` is available.
- Preserve provenance when donor research informs a normalized implementation.
