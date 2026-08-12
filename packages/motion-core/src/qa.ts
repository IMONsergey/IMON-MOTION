import type { Capability, QualityLevel, RoutePlan, StoryboardPlan } from './types.js';

export type QaCheck = {
  id: string;
  severity: 'required' | 'recommended';
  category: 'structure' | 'visual' | 'motion' | 'content' | 'audio' | 'render';
  instruction: string;
};

export type QaSample = {
  frame: number;
  beatId: string;
  purpose: 'entry' | 'read' | 'exit';
};

export type QaPlan = {
  quality: QualityLevel;
  sampleFrames: QaSample[];
  checks: QaCheck[];
  finalRenderRequired: boolean;
};

const check = (
  id: string,
  category: QaCheck['category'],
  instruction: string,
  severity: QaCheck['severity'] = 'required',
): QaCheck => ({ id, category, instruction, severity });

const CAPABILITY_CHECKS: Partial<Record<Capability, QaCheck[]>> = {
  'ui-motion': [
    check('ui-product-truth', 'content', 'Verify UI states are real/approved or explicitly conceptual; no accidental product misrepresentation.'),
    check('ui-focus-continuity', 'motion', 'Verify cursor, camera, and highlight focus move continuously toward meaningful targets.'),
    check('ui-read-hold', 'motion', 'Verify important resulting UI states remain settled long enough to read.'),
  ],
  cinematography: [
    check('camera-purpose', 'motion', 'Every camera move must follow a subject, reveal information, or bridge spatial continuity.'),
    check('camera-continuity', 'motion', 'Check cuts for incompatible scale, direction, horizon, or depth changes.'),
  ],
  'kinetic-typography': [
    check('type-legibility', 'visual', 'Inspect word/line reveals at entry, settled, and exit states for legibility and hierarchy.'),
    check('type-rhythm', 'motion', 'Check that stagger supports syntax and emphasis rather than applying uniform decoration.'),
  ],
  'data-animation': [
    check('data-truth', 'content', 'Verify values, axes, labels, ordering, and annotations remain analytically truthful throughout animation.'),
    check('data-causality', 'motion', 'Reveal data in explanatory order; reject simultaneous mark animation without narrative purpose.'),
  ],
  'three-d': [
    check('depth-collision', 'visual', 'Inspect 3D/depth planes for clipping, z-fighting, intersections, and implausible perspective.'),
    check('hero-camera-scarcity', 'motion', 'Confirm large orbit/dolly moves are reserved for focal moments rather than running continuously.'),
  ],
  webgl: [
    check('webgl-message', 'visual', 'Confirm generative/shader behavior supports material, identity, atmosphere, or information rather than generic spectacle.'),
    check('webgl-cost', 'render', 'Check render complexity, deterministic output, and memory usage before final quality render.'),
  ],
  'sound-design': [
    check('audio-purpose', 'audio', 'Reserve strong impacts for major state changes; reject an impact on every cut.'),
    check('audio-sync', 'audio', 'Check beat/foley/impact timing against the actual visual event, including post-event breathing room.'),
  ],
  transitions: [
    check('transition-purpose', 'motion', 'Each transition must preserve meaning, direction, object identity, depth, or rhythm.'),
  ],
};

const BASE_CHECKS: QaCheck[] = [
  check('compile', 'structure', 'Typecheck and bundle the composition without runtime errors.'),
  check('timeline-coverage', 'structure', 'Verify intended duration has no accidental gaps, overlaps, or unbounded layers.'),
  check('safe-area', 'visual', 'Inspect frame edges and platform safe areas for cropped text, controls, logos, and critical imagery.'),
  check('hierarchy', 'visual', 'At every sampled frame, one focal subject should be obvious within a short glance.'),
  check('typography', 'visual', 'Check line breaks, tracking, font fallback, contrast, and minimum readable size.'),
  check('settled-states', 'motion', 'Verify comprehension-critical information reaches a stable readable state after motion.'),
  check('one-dominant-idea', 'motion', 'Reject scenes containing multiple unrelated hero motion ideas competing simultaneously.'),
  check('anti-ai-slop', 'visual', 'Reject repeated glow, arbitrary float, excessive particles, random easing, gratuitous glass, and motion without narrative purpose.'),
];

const QUALITY_CHECKS: Record<QualityLevel, QaCheck[]> = {
  draft: [
    check('draft-sanity', 'structure', 'Confirm representative frames and timing are coherent enough for creative review.', 'recommended'),
  ],
  production: [
    check('representative-stills', 'visual', 'Inspect representative stills from every narrative beat before delivery.'),
    check('motion-review', 'motion', 'Review the full timeline at speed for pacing, continuity, and readable holds.'),
    check('delivery-spec', 'render', 'Validate expected resolution, fps, duration, codec/container requirements, and audio presence.'),
  ],
  'hero-film': [
    check('representative-stills', 'visual', 'Inspect representative stills from every narrative beat before final render.'),
    check('motion-review', 'motion', 'Review the complete film for pacing, continuity, camera discipline, and intentional silence/rest.'),
    check('frame-polish', 'visual', 'Inspect hero frames at full resolution for typography, aliasing, gradients, shadows, masks, and material quality.'),
    check('delivery-spec', 'render', 'Validate exact target resolution, fps, duration, codec/container requirements, color expectations, and audio presence.'),
    check('final-render-validation', 'render', 'A successful final render must be validated before hero-film completion.'),
  ],
};

const uniqueChecks = (checks: QaCheck[]): QaCheck[] => {
  const seen = new Set<string>();
  return checks.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export const buildQaPlan = (route: RoutePlan, storyboard: StoryboardPlan): QaPlan => {
  const sampleFrames: QaSample[] = [];
  for (const beat of storyboard.beats) {
    const entry = Math.min(storyboard.durationInFrames - 1, beat.startFrame + Math.min(2, Math.max(0, beat.durationInFrames - 1)));
    const read = Math.min(storyboard.durationInFrames - 1, beat.startFrame + Math.max(0, Math.floor(beat.durationInFrames * 0.62)));
    const exit = Math.min(storyboard.durationInFrames - 1, beat.startFrame + Math.max(0, beat.durationInFrames - 2));
    sampleFrames.push(
      { frame: entry, beatId: beat.id, purpose: 'entry' },
      { frame: read, beatId: beat.id, purpose: 'read' },
      { frame: exit, beatId: beat.id, purpose: 'exit' },
    );
  }

  const capabilityChecks = route.capabilities.flatMap((capability) => CAPABILITY_CHECKS[capability] ?? []);
  const checks = uniqueChecks([...BASE_CHECKS, ...capabilityChecks, ...QUALITY_CHECKS[route.brief.quality]]);

  return {
    quality: route.brief.quality,
    sampleFrames,
    checks,
    finalRenderRequired: route.brief.quality === 'hero-film',
  };
};
