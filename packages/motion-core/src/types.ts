export const VIDEO_TYPES = [
  'product-launch',
  'ui-demo',
  'brand-film',
  'explainer',
  'kinetic-type',
  'data-story',
  'social',
  'presentation',
  'logo-identity',
  'cinematic-3d',
  'experimental',
] as const;

export const STYLES = [
  'premium-minimal',
  'cinematic-product',
  'editorial',
  'tech-minimal',
  'expressive',
  'experimental',
] as const;

export const CAPABILITIES = [
  'creative-direction',
  'shot-design',
  'cinematography',
  'choreography',
  'kinetic-typography',
  'ui-motion',
  'transitions',
  'data-animation',
  'three-d',
  'webgl',
  'sound-design',
  'remotion-engineering',
  'rendering',
  'visual-qa',
] as const;

export type VideoType = (typeof VIDEO_TYPES)[number];
export type MotionStyle = (typeof STYLES)[number];
export type Capability = (typeof CAPABILITIES)[number];
export type Energy = 'restrained' | 'controlled' | 'dynamic' | 'aggressive';
export type Dimensionality = '2d' | '2.5d' | '3d' | 'webgl';
export type CameraMode = 'none' | 'subtle' | 'spatial' | 'cinematic';
export type AudioMode = 'none' | 'music-led' | 'voice-led' | 'sfx-led' | 'mixed';
export type QualityLevel = 'draft' | 'production' | 'hero-film';
export type PrimitiveKind =
  | 'scene'
  | 'shot'
  | 'reveal'
  | 'exit'
  | 'transition'
  | 'camera'
  | 'typography'
  | 'ui'
  | 'data'
  | 'effect'
  | 'audio'
  | 'webgl';

export interface DeliverySpec {
  aspectRatio?: string;
  width?: number;
  height?: number;
  fps?: number;
  durationSeconds?: number;
  platform?: string;
}

export interface MotionBrief {
  raw?: string;
  videoType?: VideoType;
  styles?: MotionStyle[];
  content?: string[];
  energy?: Energy;
  dimensionality?: Dimensionality;
  camera?: CameraMode;
  audio?: AudioMode;
  quality?: QualityLevel;
  delivery?: DeliverySpec;
  constraints?: string[];
}

export interface ProvenanceRef {
  donor: string;
  path: string;
  note?: string;
}

export interface PrimitiveDescriptor {
  id: string;
  kind: PrimitiveKind;
  summary: string;
  capabilities: Capability[];
  videoTypes: VideoType[];
  styles: MotionStyle[];
  energies: Energy[];
  dimensionality: Dimensionality[];
  tags: string[];
  sources: ProvenanceRef[];
  antiPatterns?: string[];
}

export interface RoutePlan {
  brief: Required<Pick<MotionBrief, 'videoType' | 'styles' | 'energy' | 'dimensionality' | 'camera' | 'audio' | 'quality'>> & MotionBrief;
  capabilities: Capability[];
  donors: string[];
  primitives: PrimitiveDescriptor[];
  rationale: string[];
}

export interface StoryboardBeat {
  id: string;
  role: 'hook' | 'establish' | 'feature' | 'proof' | 'payoff' | 'end-card';
  startFrame: number;
  durationInFrames: number;
  primitiveIds: string[];
  intent: string;
}

export interface StoryboardPlan {
  fps: number;
  durationInFrames: number;
  beats: StoryboardBeat[];
}
