export const BASE_FPS = 30;

export const MOTION_TOKENS = {
  duration30: {
    micro: 5,
    quick: 9,
    standard: 17,
    deliberate: 24,
    hero: 30,
    settleHold: 36,
    brandHold: 45,
  },
  stagger30: {
    tight: 2,
    standard: 4,
    editorial: 6,
    cinematic: 8,
  },
  spring: {
    precision: { damping: 190, stiffness: 120, mass: 1 },
    decisive: { damping: 135, stiffness: 190, mass: 1 },
    cinematic: { damping: 165, stiffness: 90, mass: 1.15 },
  },
  travelPx: {
    micro: 6,
    standard: 14,
    strong: 28,
  },
  scale: {
    subtleIn: 0.96,
    heroIn: 0.9,
    emphasis: 1.025,
  },
  shutter: {
    angle: 180,
    samples: 10,
  },
} as const;

export const framesAtFps = (framesAt30: number, fps: number): number => {
  if (!Number.isFinite(fps) || fps <= 0) throw new Error('fps must be a positive finite number');
  return Math.max(1, Math.round((framesAt30 * fps) / BASE_FPS));
};

export const staggerFrames = (
  index: number,
  fps: number,
  mode: keyof typeof MOTION_TOKENS.stagger30 = 'standard',
): number => {
  return Math.max(0, index) * framesAtFps(MOTION_TOKENS.stagger30[mode], fps);
};
