import { Easing, interpolate, spring } from 'remotion';
import { MOTION_TOKENS, framesAtFps, staggerFrames } from '@imon-motion/core';

export type MotionStyle = {
  opacity?: number;
  transform?: string;
  filter?: string;
};

const clampOptions = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

export const precisionReveal = ({
  frame,
  fps,
  delay = 0,
  travelPx = MOTION_TOKENS.travelPx.standard,
}: {
  frame: number;
  fps: number;
  delay?: number;
  travelPx?: number;
}): MotionStyle => {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: MOTION_TOKENS.spring.precision,
    durationInFrames: framesAtFps(MOTION_TOKENS.duration30.standard, fps),
  });
  const opacity = interpolate(progress, [0, 0.72, 1], [0, 0.94, 1], clampOptions);
  const y = interpolate(progress, [0, 1], [travelPx, 0], clampOptions);
  return { opacity, transform: `translate3d(0, ${y}px, 0)` };
};

export const cleanExit = ({
  frame,
  fps,
  startFrame,
  travelPx = MOTION_TOKENS.travelPx.micro,
}: {
  frame: number;
  fps: number;
  startFrame: number;
  travelPx?: number;
}): MotionStyle => {
  const duration = framesAtFps(MOTION_TOKENS.duration30.quick, fps);
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    ...clampOptions,
    easing: Easing.bezier(0.55, 0, 1, 0.45),
  });
  return {
    opacity: 1 - progress,
    transform: `translate3d(0, ${progress * travelPx}px, 0)`,
  };
};

export const heroSettle = ({
  frame,
  fps,
  delay = 0,
}: {
  frame: number;
  fps: number;
  delay?: number;
}): MotionStyle => {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: MOTION_TOKENS.spring.cinematic,
    durationInFrames: framesAtFps(MOTION_TOKENS.duration30.hero, fps),
  });
  const scale = interpolate(progress, [0, 0.78, 1], [MOTION_TOKENS.scale.heroIn, MOTION_TOKENS.scale.emphasis, 1], clampOptions);
  const y = interpolate(progress, [0, 1], [MOTION_TOKENS.travelPx.strong, 0], clampOptions);
  const opacity = interpolate(progress, [0, 0.28, 1], [0, 0.88, 1], clampOptions);
  return { opacity, transform: `translate3d(0, ${y}px, 0) scale(${scale})` };
};

export const stateSwap = ({
  frame,
  fps,
  atFrame,
}: {
  frame: number;
  fps: number;
  atFrame: number;
}): { outgoing: MotionStyle; incoming: MotionStyle } => {
  const duration = framesAtFps(MOTION_TOKENS.duration30.quick, fps);
  const t = interpolate(frame, [atFrame, atFrame + duration], [0, 1], {
    ...clampOptions,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  return {
    outgoing: { opacity: 1 - t, transform: `translate3d(0, ${-6 * t}px, 0)` },
    incoming: { opacity: t, transform: `translate3d(0, ${6 * (1 - t)}px, 0)` },
  };
};

export const wordDelay = (
  index: number,
  fps: number,
  mode: keyof typeof MOTION_TOKENS.stagger30 = 'standard',
): number => staggerFrames(index, fps, mode);

export const cameraProgress = ({
  frame,
  fps,
  startFrame,
  durationFrames30 = MOTION_TOKENS.duration30.hero,
}: {
  frame: number;
  fps: number;
  startFrame: number;
  durationFrames30?: number;
}): number => {
  const duration = framesAtFps(durationFrames30, fps);
  return interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    ...clampOptions,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
};
