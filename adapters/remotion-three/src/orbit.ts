export type Vec3 = { x: number; y: number; z: number };

export type OrbitPose = {
  position: Vec3;
  target: Vec3;
  up: Vec3;
  fov: number;
};

export type ProductOrbitConfig = {
  center?: Vec3;
  radius?: number;
  height?: number;
  startAzimuth?: number;
  endAzimuth?: number;
  startElevation?: number;
  endElevation?: number;
  startRadiusScale?: number;
  endRadiusScale?: number;
  fov?: number;
  easing?: 'linear' | 'cinematic';
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Smooth, monotonic ease with zero velocity at both ends. */
export const cinematicEase = (value: number): number => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export const productOrbitPose = (progress: number, config: ProductOrbitConfig = {}): OrbitPose => {
  const raw = clamp01(progress);
  const t = config.easing === 'linear' ? raw : cinematicEase(raw);
  const center = config.center ?? { x: 0, y: 0, z: 0 };
  const radius = Math.max(0.001, config.radius ?? 5.2);
  const height = config.height ?? 0;
  const startAzimuth = config.startAzimuth ?? -0.55;
  const endAzimuth = config.endAzimuth ?? 0.42;
  const startElevation = config.startElevation ?? 0.10;
  const endElevation = config.endElevation ?? 0.20;
  const startRadiusScale = Math.max(0.05, config.startRadiusScale ?? 1.08);
  const endRadiusScale = Math.max(0.05, config.endRadiusScale ?? 0.92);
  const fov = Math.max(5, Math.min(150, config.fov ?? 34));

  const azimuth = lerp(startAzimuth, endAzimuth, t);
  const elevation = lerp(startElevation, endElevation, t);
  const distance = radius * lerp(startRadiusScale, endRadiusScale, t);
  const horizontal = distance * Math.cos(elevation);

  return {
    position: {
      x: center.x + horizontal * Math.sin(azimuth),
      y: center.y + height + distance * Math.sin(elevation),
      z: center.z + horizontal * Math.cos(azimuth),
    },
    target: { ...center },
    up: { x: 0, y: 1, z: 0 },
    fov,
  };
};

export const frameProgress = ({
  frame,
  startFrame,
  durationInFrames,
}: {
  frame: number;
  startFrame: number;
  durationInFrames: number;
}): number => {
  if (!Number.isFinite(durationInFrames) || durationInFrames <= 0) throw new Error('durationInFrames must be positive');
  return clamp01((frame - startFrame) / durationInFrames);
};

export const productOrbitPoseAtFrame = ({
  frame,
  startFrame = 0,
  durationInFrames,
  config,
}: {
  frame: number;
  startFrame?: number;
  durationInFrames: number;
  config?: ProductOrbitConfig;
}): OrbitPose => productOrbitPose(frameProgress({ frame, startFrame, durationInFrames }), config);

export const distanceToTarget = (pose: OrbitPose): number => {
  const dx = pose.position.x - pose.target.x;
  const dy = pose.position.y - pose.target.y;
  const dz = pose.position.z - pose.target.z;
  return Math.hypot(dx, dy, dz);
};
