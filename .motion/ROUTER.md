# IMON MOTION Context Router

The router exists to keep a very large motion corpus usable by an LLM without flooding context.

## 1. Classify the brief

Extract, when present:

- `video_type`: product-launch, ui-demo, brand-film, explainer, kinetic-type, data-story, social, presentation, logo/identity, cinematic-3d, experimental.
- `content`: UI, typography, product renders, people, charts/data, maps, illustrations, abstract graphics, mixed.
- `style`: premium-minimal, cinematic-product, editorial, tech-minimal, expressive, experimental.
- `energy`: restrained, controlled, dynamic, aggressive.
- `dimensionality`: 2d, 2.5d, 3d, webgl.
- `camera`: none, subtle, spatial, cinematic.
- `audio`: none, music-led, voice-led, sfx-led, mixed.
- `format`: aspect ratio, resolution, fps, duration, platform.
- `quality`: draft, production, hero-film.

Do not invent constraints that materially alter the brief.

## 2. Pick capability families

Use `.motion/capabilities.yaml`. Select only capabilities needed for the composition.

Typical families:

- creative-direction
- cinematography
- shot-design
- choreography
- kinetic-typography
- ui-motion
- transitions
- data-animation
- 3d
- webgl
- sound-design
- remotion-engineering
- rendering
- visual-qa

## 3. Select donors

Use `.motion/donors.yaml` and the generated `index/catalog.*`.

Default target: **2–6 donor repositories** per task.

Use more only when the brief genuinely spans many disciplines. Never select donors solely because they exist.

## 4. Search before reading

After the upstream corpus is imported, search `index/catalog.json` or repository code for the relevant technique, component, scene, shot, skill, or API. Open exact files rather than entire directories where possible.

Examples:

- Search `orbit`, `camera`, `depth`, `product` for a product hero shot.
- Search `kinetic`, `typography`, `word`, `text` for type-driven sequences.
- Search `chart`, `data`, `graph` for data storytelling.
- Search `three`, `webgl`, `shader`, `glsl` for spatial/generative work.
- Search `render`, `codec`, `ffmpeg` for delivery problems.

## 5. Resolve conflicts

When donor guidance conflicts:

1. explicit user constraints win;
2. IMON MOTION quality rules win over donor defaults;
3. official Remotion engineering guidance wins for Remotion API/runtime correctness;
4. visual-direction donors inform taste and choreography;
5. choose the simpler implementation when quality is equivalent.

## 6. Creative direction before implementation

For a new substantive video, establish:

- core message;
- focal hierarchy;
- visual grammar;
- shot sequence;
- pacing curve;
- transition logic;
- typography behavior;
- camera/depth behavior;
- audio relationship.

Then implement.

## 7. Normalize successful techniques

If a donor technique proves reusable, do not permanently depend on its raw source path. Port or adapt it into:

- `packages/` for reusable code;
- `library/` for curated production primitives/scenes;
- `adapters/` for donor-specific bridges.

Record provenance.

## 8. QA

Apply `.motion/quality-gates.yaml`. Representative frame inspection is mandatory for production and hero-film work.
