# IMON MOTION Agent Skills

The `.agents/skills` directory is a thin routing surface over one shared IMON MOTION system. Skills do not carry independent copies of donor knowledge.

## Always start here for substantive new motion work

- `motion-director` — brief → plan → bounded context → creative direction → storyboard → implementation → QA.

## Specialized task skills

- `product-film` — flagship/product-launch/brand-product films.
- `ui-product-demo` — real SaaS/UI capture, cursor focus and product truth.
- `kinetic-typography` — editorial/expressive type motion.
- `data-story` — charts, metrics and evidence sequences.
- `cinematic-3d` — true spatial/Three.js/WebGL routing with explicit runtime readiness.
- `motion-qa` — generated frame samples, motion review and delivery gates.

## Shared machine interfaces

Use repository commands rather than independently reconstructing the system from donor files:

```bash
npm run route -- "<brief>"
npm run research -- "<brief>"
npm run plan -- "<brief>"
npm run context -- "<brief>"
```

For current runtime health:

```bash
node scripts/health.mjs
```

The full donor corpus is a research backend. `upstream/**` is never the primary agent entry point.
