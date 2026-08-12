# IMON MOTION Creative Director Protocol

This protocol is the decision layer between a user brief and implementation. It exists to prevent immediate template selection or premature React coding.

## Operating rule

A strong motion piece is a sequence of intentional visual decisions. The agent should be able to explain why a shot, transition, camera move, type behavior, or sound cue exists. If it cannot, remove or simplify it.

## Stage 1 — Read the brief as a director

Extract:

- audience and viewing context;
- single primary message;
- evidence available: real UI, product renders, footage, data, copy, identity assets;
- desired emotional state;
- required duration / aspect ratio / fps / resolution;
- constraints: brand rules, legal, privacy, product accuracy, delivery deadline;
- explicit references and the principles the user actually wants from them.

Do not interpret a named brand as permission to clone its graphics. Translate references into principles: restraint, pacing, hierarchy, materiality, camera language, typography, density, contrast, sound discipline.

## Stage 2 — Route before browsing upstream

Run or mentally reproduce `routeBrief()` from `@imon-motion/core`.

Use the result in this order:

1. normalized video type and styles;
2. capability families;
3. normalized primitive candidates;
4. bounded donor set;
5. exact upstream files only when normalized primitives do not answer the implementation question.

Raw `upstream/**` is research material, never the first implementation dependency.

## Stage 3 — Build the visual thesis

Write a compact internal design spec:

- **focal rule** — what may own the frame at each moment;
- **grid rule** — dominant alignment, margins, safe areas, density;
- **type rule** — families, scale relationship, case, line length, tracking;
- **surface rule** — background, panels, device/browser treatment, border/radius/material;
- **motion rule** — default entrance, default exit, house spring/ease, stagger policy;
- **camera rule** — static/subtle/spatial/cinematic; maximum number of hero moves;
- **transition rule** — why scenes connect;
- **audio rule** — music-led, voice-led, SFX-led, silence, beat map;
- **rest rule** — minimum settled holds around comprehension-critical content.

Prefer one strong grammar over many isolated tricks.

## Stage 4 — Storyboard by narrative function

Use `buildStoryboardSkeleton()` as a starting structure, not a rigid template.

Every beat must have:

- narrative role;
- one primary focal subject;
- one dominant motion idea;
- exact source asset or generation requirement;
- primitive IDs or a reason to introduce a new primitive;
- transition intention;
- audio intention;
- planned hold after information lands.

Delete redundant scenes. A scene that says the same thing with a different animation is not variety; it is noise.

## Stage 5 — Asset truth

For product/UI work, prefer real product capture when reproducing a real product state. Fake UI is acceptable for abstract, conceptual, or intentionally redesigned sequences, but must not silently misrepresent the product.

Before capture:

- freeze demo data;
- remove secrets and personal/customer information;
- define the exact viewport and DPR;
- capture stable states;
- record element geometry where camera/cursor choreography depends on it.

## Stage 6 — Implementation hierarchy

Use this order:

1. `@imon-motion/core` — decisions, tokens, routing, storyboard types;
2. `@imon-motion/remotion-kit` — normalized Remotion choreography/primitives;
3. `library/` — approved higher-order scenes and production patterns;
4. `adapters/` — Theatre/WebGL/Motion Canvas or donor-specific bridges;
5. `upstream/**` — research and provenance-backed source references.

If raw donor code must be adapted, create a normalized implementation outside `upstream/` and record provenance.

## Stage 7 — Motion discipline

Default rules:

- entrances may settle; exits should normally clear faster;
- repeated siblings share stagger vocabulary;
- travel distances stay bounded unless the physical metaphor demands more;
- overshoot is exceptional, not default personality;
- hero motion is scarce;
- camera motion follows a subject or reveals information;
- transitions preserve meaning, direction, object identity, or rhythm;
- after dense movement, provide a readable rest;
- one scene should have one dominant motion idea.

## Stage 8 — Audio discipline

Sound is structural, not garnish.

- Cut to beats only when music is genuinely driving the edit.
- Do not put an impact on every transition.
- Reserve large impacts for major narrative or visual state changes.
- Prefer small UI/foley detail for interaction proof.
- Leave silence or low-density regions when visual comprehension needs room.
- When music licensing is uncertain, keep the timeline capable of rendering without BGM.

## Stage 9 — QA loop

For `production` and `hero-film`:

1. typecheck / compile;
2. render representative stills;
3. inspect typography, crop, hierarchy, collisions, depth, and brand coherence;
4. render a low-cost review video when practical;
5. inspect pacing, transition purpose, camera continuity, holds, and audio alignment;
6. reject anti-AI-slop patterns from `.motion/quality-gates.yaml`;
7. fix and repeat.

For `hero-film`, final render validation is mandatory.

## Adding a new primitive

A new normalized primitive is justified when at least one is true:

- an existing primitive cannot express the behavior without repeated local hacks;
- the behavior has been reused successfully across multiple scenes;
- a donor contains a strong technique that fills a genuine gap;
- the user asks for a repeatable motion language that needs a named unit.

Every primitive must define:

- stable ID;
- kind;
- summary and intended use;
- capabilities;
- compatible video types/styles/energy/dimensionality;
- tags;
- provenance source(s);
- anti-patterns when misuse is likely.

Do not add a primitive merely to rename a one-off CSS animation.
