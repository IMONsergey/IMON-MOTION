import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { MOTION_TOKENS, framesAtFps } from '@imon-motion/core/tokens';
import { cameraProgress, heroSettle, precisionReveal, wordDelay } from './choreography';

export type MotionSceneProps = {
  children: ReactNode;
  background?: string;
  style?: CSSProperties;
};

export const MotionScene = ({ children, background = '#0a0a0a', style }: MotionSceneProps) => (
  <AbsoluteFill
    style={{
      background,
      color: '#f5f5f5',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

export const PrecisionReveal = ({
  children,
  delay = 0,
  travelPx,
  style,
}: {
  children: ReactNode;
  delay?: number;
  travelPx?: number;
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const motion = precisionReveal({ frame, fps, delay, travelPx });
  return <div style={{ ...style, ...motion }}>{children}</div>;
};

export const HeroSettle = ({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const motion = heroSettle({ frame, fps, delay });
  return <div style={{ ...style, ...motion }}>{children}</div>;
};

export const KineticWords = ({
  text,
  delay = 0,
  stagger = 'standard',
  style,
  wordStyle,
}: {
  text: string;
  delay?: number;
  stagger?: keyof typeof MOTION_TOKENS.stagger30;
  style?: CSSProperties;
  wordStyle?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.trim().split(/\s+/).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '0.28em', rowGap: '0.08em', ...style }}>
      {words.map((word, index) => {
        const motion = precisionReveal({
          frame,
          fps,
          delay: delay + wordDelay(index, fps, stagger),
          travelPx: MOTION_TOKENS.travelPx.micro,
        });
        return (
          <span key={`${word}-${index}`} style={{ display: 'inline-block', ...wordStyle, ...motion }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const Camera2D = ({
  children,
  startFrame = 0,
  durationFrames30 = MOTION_TOKENS.duration30.hero,
  from = { x: 0, y: 0, scale: 1 },
  to = { x: 0, y: 0, scale: 1.06 },
  perspective = 1400,
  style,
}: {
  children: ReactNode;
  startFrame?: number;
  durationFrames30?: number;
  from?: { x: number; y: number; scale: number };
  to?: { x: number; y: number; scale: number };
  perspective?: number;
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = cameraProgress({ frame, fps, startFrame, durationFrames30 });
  const x = interpolate(progress, [0, 1], [from.x, to.x]);
  const y = interpolate(progress, [0, 1], [from.y, to.y]);
  const scale = interpolate(progress, [0, 1], [from.scale, to.scale]);
  return (
    <div style={{ width: '100%', height: '100%', perspective, overflow: 'visible', ...style }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          transformOrigin: '50% 50%',
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const DepthPlane = ({
  children,
  depth = 0,
  parallaxX = 0,
  parallaxY = 0,
  startFrame = 0,
  durationFrames30 = MOTION_TOKENS.duration30.hero,
  style,
}: {
  children: ReactNode;
  depth?: number;
  parallaxX?: number;
  parallaxY?: number;
  startFrame?: number;
  durationFrames30?: number;
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = cameraProgress({ frame, fps, startFrame, durationFrames30 });
  const x = parallaxX * progress;
  const y = parallaxY * progress;
  return (
    <div
      style={{
        transformStyle: 'preserve-3d',
        transform: `translate3d(${x}px, ${y}px, ${depth}px)`,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const ProductFrame = ({
  children,
  width = 1280,
  aspectRatio = '16 / 10',
  radius = 28,
  surface = '#111214',
  border = 'rgba(255,255,255,0.10)',
  shadow = '0 40px 120px rgba(0,0,0,0.42)',
  style,
}: {
  children: ReactNode;
  width?: number | string;
  aspectRatio?: string;
  radius?: number;
  surface?: string;
  border?: string;
  shadow?: string;
  style?: CSSProperties;
}) => (
  <div
    style={{
      width,
      aspectRatio,
      overflow: 'hidden',
      borderRadius: radius,
      background: surface,
      border: `1px solid ${border}`,
      boxShadow: shadow,
      position: 'relative',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Hold = ({ children, fromFrame = 0, durationFrames30 = MOTION_TOKENS.duration30.settleHold }: {
  children: ReactNode;
  fromFrame?: number;
  durationFrames30?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = framesAtFps(durationFrames30, fps);
  const visible = frame >= fromFrame && frame < fromFrame + duration;
  return <div style={{ visibility: visible ? 'visible' : 'hidden' }}>{children}</div>;
};
