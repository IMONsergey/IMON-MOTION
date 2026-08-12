export type CaptureViewport = {
  width: number;
  height: number;
  deviceScaleFactor: number;
};

export type CaptureRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CaptureAnchor = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type CaptureElement = {
  id: string;
  rect: CaptureRect;
  label?: string;
  role?: string;
  safeToShow?: boolean;
};

export type CaptureState = {
  id: string;
  image?: string;
  timestampMs?: number;
  elements: CaptureElement[];
};

export type CaptureManifest = {
  version: 1;
  source: string;
  viewport: CaptureViewport;
  states: CaptureState[];
  privacyReviewed: boolean;
  notes?: string[];
};

export type Point = { x: number; y: number };

export const validateCaptureManifest = (manifest: CaptureManifest): string[] => {
  const failures: string[] = [];
  if (manifest.version !== 1) failures.push(`unsupported manifest version: ${manifest.version}`);
  if (!manifest.source.trim()) failures.push('capture source is required');
  if (manifest.viewport.width <= 0 || manifest.viewport.height <= 0) failures.push('viewport dimensions must be positive');
  if (manifest.viewport.deviceScaleFactor <= 0) failures.push('deviceScaleFactor must be positive');
  if (!manifest.privacyReviewed) failures.push('capture manifest must be privacy-reviewed before production use');

  const stateIds = new Set<string>();
  for (const state of manifest.states) {
    if (stateIds.has(state.id)) failures.push(`duplicate state id: ${state.id}`);
    stateIds.add(state.id);
    const elementIds = new Set<string>();
    for (const element of state.elements) {
      if (elementIds.has(element.id)) failures.push(`duplicate element id in ${state.id}: ${element.id}`);
      elementIds.add(element.id);
      if (element.rect.width <= 0 || element.rect.height <= 0) failures.push(`invalid rect for ${state.id}/${element.id}`);
      if (element.rect.x < 0 || element.rect.y < 0) failures.push(`negative rect origin for ${state.id}/${element.id}`);
      if (element.rect.x + element.rect.width > manifest.viewport.width + 0.5) failures.push(`element exceeds viewport width: ${state.id}/${element.id}`);
      if (element.rect.y + element.rect.height > manifest.viewport.height + 0.5) failures.push(`element exceeds viewport height: ${state.id}/${element.id}`);
    }
  }
  return failures;
};

export const findElement = (manifest: CaptureManifest, stateId: string, elementId: string): CaptureElement => {
  const state = manifest.states.find((candidate) => candidate.id === stateId);
  if (!state) throw new Error(`capture state not found: ${stateId}`);
  const element = state.elements.find((candidate) => candidate.id === elementId);
  if (!element) throw new Error(`capture element not found: ${stateId}/${elementId}`);
  if (element.safeToShow === false) throw new Error(`capture element is explicitly unsafe to show: ${stateId}/${elementId}`);
  return element;
};

export const anchorPoint = (rect: CaptureRect, anchor: CaptureAnchor = 'center', inset = 0): Point => {
  const left = rect.x + inset;
  const right = rect.x + rect.width - inset;
  const top = rect.y + inset;
  const bottom = rect.y + rect.height - inset;
  if (right < left || bottom < top) throw new Error('anchor inset exceeds element dimensions');

  switch (anchor) {
    case 'top-left': return { x: left, y: top };
    case 'top-right': return { x: right, y: top };
    case 'bottom-left': return { x: left, y: bottom };
    case 'bottom-right': return { x: right, y: bottom };
    case 'center':
    default: return { x: (left + right) / 2, y: (top + bottom) / 2 };
  }
};

export const normalizedPoint = (point: Point, viewport: CaptureViewport): Point => ({
  x: point.x / viewport.width,
  y: point.y / viewport.height,
});

export const viewportPoint = (point: Point, viewport: CaptureViewport): Point => ({
  x: point.x * viewport.width,
  y: point.y * viewport.height,
});

export const cubicBezierPoint = (start: Point, control1: Point, control2: Point, end: Point, progress: number): Point => {
  const t = Math.min(1, Math.max(0, progress));
  const inv = 1 - t;
  return {
    x: inv ** 3 * start.x + 3 * inv ** 2 * t * control1.x + 3 * inv * t ** 2 * control2.x + t ** 3 * end.x,
    y: inv ** 3 * start.y + 3 * inv ** 2 * t * control1.y + 3 * inv * t ** 2 * control2.y + t ** 3 * end.y,
  };
};

export const buildCursorCurve = ({
  from,
  to,
  curvature = 0.16,
}: {
  from: Point;
  to: Point;
  curvature?: number;
}) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return { start: from, control1: from, control2: to, end: to };
  const normal = { x: -dy / distance, y: dx / distance };
  const bend = distance * Math.max(-0.5, Math.min(0.5, curvature));
  return {
    start: from,
    control1: { x: from.x + dx * 0.34 + normal.x * bend, y: from.y + dy * 0.34 + normal.y * bend },
    control2: { x: from.x + dx * 0.72 + normal.x * bend * 0.55, y: from.y + dy * 0.72 + normal.y * bend * 0.55 },
    end: to,
  };
};

export const cursorPointForElement = ({
  manifest,
  stateId,
  elementId,
  anchor = 'center',
  inset = 0,
}: {
  manifest: CaptureManifest;
  stateId: string;
  elementId: string;
  anchor?: CaptureAnchor;
  inset?: number;
}): Point => anchorPoint(findElement(manifest, stateId, elementId).rect, anchor, inset);
