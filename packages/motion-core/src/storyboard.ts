import type { RoutePlan, StoryboardBeat, StoryboardPlan, VideoType } from './types.js';

const STRUCTURES: Record<VideoType, Array<{ role: StoryboardBeat['role']; share: number; intent: string }>> = {
  'product-launch': [
    { role: 'hook', share: 0.16, intent: 'Establish one memorable product promise or visual question.' },
    { role: 'establish', share: 0.19, intent: 'Reveal the product identity and visual system without feature overload.' },
    { role: 'feature', share: 0.28, intent: 'Demonstrate the strongest differentiating behavior with real product evidence.' },
    { role: 'proof', share: 0.20, intent: 'Add one proof point, metric, workflow payoff, or material detail.' },
    { role: 'payoff', share: 0.12, intent: 'Return to the hero promise with increased confidence and reduced motion.' },
    { role: 'end-card', share: 0.05, intent: 'Hold brand/product identity long enough to register.' },
  ],
  'ui-demo': [
    { role: 'hook', share: 0.10, intent: 'Frame the user problem or target outcome.' },
    { role: 'establish', share: 0.12, intent: 'Orient the viewer in the real interface.' },
    { role: 'feature', share: 0.38, intent: 'Show the primary workflow as one readable interaction chain.' },
    { role: 'proof', share: 0.22, intent: 'Show the resulting state, output, or measurable advantage.' },
    { role: 'payoff', share: 0.13, intent: 'Summarize the workflow outcome with reduced UI density.' },
    { role: 'end-card', share: 0.05, intent: 'Resolve on product identity and CTA if required.' },
  ],
  'brand-film': [
    { role: 'hook', share: 0.18, intent: 'Open with a distinctive visual or verbal thesis.' },
    { role: 'establish', share: 0.18, intent: 'Establish the brand world, material language, and rhythm.' },
    { role: 'feature', share: 0.24, intent: 'Develop the central idea through images, type, or product evidence.' },
    { role: 'proof', share: 0.17, intent: 'Ground the thesis in a concrete behavior, statement, or proof point.' },
    { role: 'payoff', share: 0.18, intent: 'Deliver the emotional or conceptual resolution.' },
    { role: 'end-card', share: 0.05, intent: 'Leave a quiet identity hold.' },
  ],
  explainer: [
    { role: 'hook', share: 0.10, intent: 'State the question or problem clearly.' },
    { role: 'establish', share: 0.15, intent: 'Define the system and its key entities.' },
    { role: 'feature', share: 0.35, intent: 'Explain the mechanism in progressive, causal order.' },
    { role: 'proof', share: 0.20, intent: 'Show evidence, example, or result.' },
    { role: 'payoff', share: 0.15, intent: 'Compress the explanation into one memorable conclusion.' },
    { role: 'end-card', share: 0.05, intent: 'Resolve title/source/brand.' },
  ],
  'kinetic-type': [
    { role: 'hook', share: 0.15, intent: 'Land the first phrase with immediate typographic authority.' },
    { role: 'establish', share: 0.15, intent: 'Establish the type scale, grid, and motion grammar.' },
    { role: 'feature', share: 0.30, intent: 'Develop the statement through controlled typographic variation.' },
    { role: 'proof', share: 0.15, intent: 'Use contrast, number, quote, or secondary phrase as evidence.' },
    { role: 'payoff', share: 0.20, intent: 'Deliver the strongest final statement and let it breathe.' },
    { role: 'end-card', share: 0.05, intent: 'Resolve identity without introducing a new motion idea.' },
  ],
  'data-story': [
    { role: 'hook', share: 0.10, intent: 'State the surprising number, tension, or question.' },
    { role: 'establish', share: 0.15, intent: 'Define baseline and comparison context.' },
    { role: 'feature', share: 0.32, intent: 'Build the main visualization progressively.' },
    { role: 'proof', share: 0.23, intent: 'Focus on the decisive comparison or annotation.' },
    { role: 'payoff', share: 0.15, intent: 'Translate data into one clear conclusion.' },
    { role: 'end-card', share: 0.05, intent: 'Hold source/title/identity.' },
  ],
  social: [
    { role: 'hook', share: 0.20, intent: 'Win attention immediately with the strongest claim or image.' },
    { role: 'establish', share: 0.12, intent: 'Clarify what the viewer is looking at.' },
    { role: 'feature', share: 0.30, intent: 'Deliver the core demonstration with no redundant setup.' },
    { role: 'proof', share: 0.18, intent: 'Add one reason to believe.' },
    { role: 'payoff', share: 0.15, intent: 'Resolve the hook.' },
    { role: 'end-card', share: 0.05, intent: 'CTA/identity hold sized for the platform.' },
  ],
  presentation: [
    { role: 'hook', share: 0.10, intent: 'Establish section or thesis.' },
    { role: 'establish', share: 0.18, intent: 'Orient the viewer in the content hierarchy.' },
    { role: 'feature', share: 0.30, intent: 'Move through the primary argument or visual system.' },
    { role: 'proof', share: 0.22, intent: 'Surface supporting evidence without dashboard overload.' },
    { role: 'payoff', share: 0.15, intent: 'Summarize the takeaway.' },
    { role: 'end-card', share: 0.05, intent: 'Resolve section/deck identity.' },
  ],
  'logo-identity': [
    { role: 'hook', share: 0.20, intent: 'Introduce the core shape, material, or motion premise.' },
    { role: 'establish', share: 0.15, intent: 'Reveal enough structure for recognition.' },
    { role: 'feature', share: 0.25, intent: 'Complete the identity transformation.' },
    { role: 'proof', share: 0.10, intent: 'Optional micro-detail or lockup articulation.' },
    { role: 'payoff', share: 0.20, intent: 'Land the final mark with minimal residual motion.' },
    { role: 'end-card', share: 0.10, intent: 'Hold the completed identity.' },
  ],
  'cinematic-3d': [
    { role: 'hook', share: 0.18, intent: 'Reveal form or material through light/camera before full identification.' },
    { role: 'establish', share: 0.17, intent: 'Establish the hero object and spatial rules.' },
    { role: 'feature', share: 0.28, intent: 'Use one or two camera behaviors to expose meaningful details.' },
    { role: 'proof', share: 0.17, intent: 'Show functional/material evidence without breaking spatial continuity.' },
    { role: 'payoff', share: 0.15, intent: 'Return to a strong hero composition.' },
    { role: 'end-card', share: 0.05, intent: 'Quiet identity hold.' },
  ],
  experimental: [
    { role: 'hook', share: 0.18, intent: 'Declare the novel motion/material rule quickly.' },
    { role: 'establish', share: 0.17, intent: 'Make the experimental system legible before increasing complexity.' },
    { role: 'feature', share: 0.30, intent: 'Explore the rule with controlled variation.' },
    { role: 'proof', share: 0.15, intent: 'Connect the experiment to message, product, or identity.' },
    { role: 'payoff', share: 0.15, intent: 'Collapse complexity into a memorable final state.' },
    { role: 'end-card', share: 0.05, intent: 'Resolve cleanly.' },
  ],
};

const primitiveIdsForRole = (route: RoutePlan, role: StoryboardBeat['role']): string[] => {
  const preferredKinds: Record<StoryboardBeat['role'], string[]> = {
    hook: ['scene', 'shot', 'typography', 'camera'],
    establish: ['scene', 'reveal', 'ui', 'camera'],
    feature: ['ui', 'camera', 'data', 'typography', 'shot'],
    proof: ['data', 'typography', 'ui', 'effect'],
    payoff: ['scene', 'camera', 'reveal', 'typography'],
    'end-card': ['typography', 'reveal'],
  };
  const ranked = route.primitives.filter((primitive) => preferredKinds[role].includes(primitive.kind));
  return (ranked.length ? ranked : route.primitives).slice(0, role === 'feature' ? 3 : 2).map((primitive) => primitive.id);
};

export const buildStoryboardSkeleton = (
  route: RoutePlan,
  durationSeconds = route.brief.delivery?.durationSeconds ?? 30,
  fps = route.brief.delivery?.fps ?? 30,
): StoryboardPlan => {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) throw new Error('durationSeconds must be positive');
  if (!Number.isFinite(fps) || fps <= 0) throw new Error('fps must be positive');

  const durationInFrames = Math.max(1, Math.round(durationSeconds * fps));
  const structure = STRUCTURES[route.brief.videoType];
  let cursor = 0;
  const beats = structure.map((item, index) => {
    const isLast = index === structure.length - 1;
    const nominal = Math.round(durationInFrames * item.share);
    const duration = isLast ? durationInFrames - cursor : nominal;
    const beat: StoryboardBeat = {
      id: `${String(index + 1).padStart(2, '0')}-${item.role}`,
      role: item.role,
      startFrame: cursor,
      durationInFrames: Math.max(1, duration),
      primitiveIds: primitiveIdsForRole(route, item.role),
      intent: item.intent,
    };
    cursor += beat.durationInFrames;
    return beat;
  });

  const overflow = cursor - durationInFrames;
  if (overflow !== 0) beats[beats.length - 1].durationInFrames = Math.max(1, beats[beats.length - 1].durationInFrames - overflow);

  return { fps, durationInFrames, beats };
};
