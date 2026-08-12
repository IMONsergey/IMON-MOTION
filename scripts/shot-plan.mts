import fs from 'node:fs';
import path from 'node:path';
import {buildStoryboardSkeleton, routeBrief} from '../packages/motion-core/src/index.js';

const brief = process.argv.slice(2).join(' ').trim();
if (!brief) {
  console.error('Usage: tsx scripts/shot-plan.mts "<video brief>"');
  process.exit(1);
}

type Pattern = {
  id: string;
  status: string;
  purpose: string;
  video_types: string[];
  styles: string[];
  capabilities: string[];
  primitives: string[];
  adapters: string[];
  research: string[];
  duration_seconds: number[];
  rule: string;
  avoid: string[];
};

const parseInlineArray = (raw: string): string[] => {
  const value = raw.trim();
  if (!value.startsWith('[') || !value.endsWith(']')) return [];
  return value.slice(1, -1).split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
};

const parseScalar = (raw: string): string => raw.trim().replace(/^['"]|['"]$/g, '');

const parsePatterns = (text: string): Pattern[] => {
  const patterns: Pattern[] = [];
  let inPatterns = false;
  let current: Pattern | null = null;

  for (const line of text.split(/\r?\n/)) {
    if (/^patterns:\s*$/.test(line)) {
      inPatterns = true;
      continue;
    }
    if (!inPatterns) continue;

    const idMatch = line.match(/^  ([A-Za-z0-9_.-]+):\s*$/);
    if (idMatch) {
      current = {
        id: idMatch[1], status: 'recipe', purpose: '', video_types: [], styles: [], capabilities: [],
        primitives: [], adapters: [], research: [], duration_seconds: [], rule: '', avoid: [],
      };
      patterns.push(current);
      continue;
    }
    if (!current) continue;
    const property = line.match(/^    ([A-Za-z0-9_-]+):\s*(.*?)\s*$/);
    if (!property) continue;
    const [, key, raw] = property;
    if (['video_types', 'styles', 'capabilities', 'primitives', 'adapters', 'research', 'avoid'].includes(key)) {
      (current as any)[key] = parseInlineArray(raw);
    } else if (key === 'duration_seconds') {
      current.duration_seconds = parseInlineArray(raw).map(Number).filter(Number.isFinite);
    } else {
      (current as any)[key] = parseScalar(raw);
    }
  }
  return patterns;
};

const root = process.cwd();
const patternFile = path.join(root, 'library', 'shot-patterns.yaml');
if (!fs.existsSync(patternFile)) throw new Error('library/shot-patterns.yaml is missing');
const patterns = parsePatterns(fs.readFileSync(patternFile, 'utf8'));
if (patterns.length < 20) throw new Error(`shot grammar unexpectedly small: ${patterns.length}`);

const route = routeBrief(brief);
const storyboard = buildStoryboardSkeleton(route);
const routeCapabilities = new Set(route.capabilities);
const routeStyles = new Set(route.brief.styles);

const beatAffinity: Record<string, string[]> = {
  hook: ['social-hook-snap', 'editorial-statement-hit', 'hero-product-settle', 'shader-atmosphere', 'sound-led-reveal'],
  establish: ['hero-product-settle', 'layered-parallax-reveal', 'interface-depth-stack', 'editorial-statement-hit', 'silent-rest-beat'],
  'feature-1': ['ui-action-focus', 'macro-detail-push', 'chart-causal-build', 'line-by-line-manifesto', 'spatial-orbit-reveal', 'interface-depth-stack'],
  'feature-2': ['ui-before-after-state', 'cursor-path-demo', 'comparison-lockup', 'metric-proof', 'macro-detail-push', 'layered-parallax-reveal'],
  proof: ['metric-proof', 'chart-causal-build', 'comparison-lockup', 'ui-before-after-state', 'proof-to-payoff'],
  payoff: ['proof-to-payoff', 'spatial-orbit-reveal', 'sound-led-reveal', 'hero-product-settle', 'shader-atmosphere', 'light-surface-pass'],
  'end-card': ['logo-end-settle', 'editorial-statement-hit', 'silent-rest-beat'],
};

const videoDefaults: Record<string, string[]> = {
  'product-launch': ['hero-product-settle', 'macro-detail-push', 'spatial-orbit-reveal', 'proof-to-payoff', 'logo-end-settle'],
  'ui-demo': ['ui-action-focus', 'cursor-path-demo', 'ui-before-after-state', 'interface-depth-stack', 'logo-end-settle'],
  'brand-film': ['editorial-statement-hit', 'hero-product-settle', 'sound-led-reveal', 'light-surface-pass', 'logo-end-settle'],
  explainer: ['ui-action-focus', 'chart-causal-build', 'metric-proof', 'line-by-line-manifesto', 'comparison-lockup'],
  'kinetic-type': ['editorial-statement-hit', 'line-by-line-manifesto', 'social-hook-snap', 'logo-end-settle'],
  'data-story': ['chart-causal-build', 'metric-proof', 'comparison-lockup', 'editorial-statement-hit'],
  social: ['social-hook-snap', 'editorial-statement-hit', 'ui-action-focus', 'beat-impact-edit', 'logo-end-settle'],
  presentation: ['editorial-statement-hit', 'metric-proof', 'chart-causal-build', 'comparison-lockup', 'logo-end-settle'],
  'logo-identity': ['sound-led-reveal', 'light-surface-pass', 'logo-end-settle'],
  'cinematic-3d': ['spatial-orbit-reveal', 'macro-detail-push', 'hero-product-settle', 'light-surface-pass'],
  experimental: ['shader-atmosphere', 'particle-accent-hit', 'editorial-statement-hit', 'beat-impact-edit'],
};

const statusScore: Record<string, number> = {
  candidate: 5,
  recipe: 3,
  experimental: 1,
  'adapter-required': 0,
};

const scorePattern = (pattern: Pattern, beatId: string): number => {
  let score = statusScore[pattern.status] ?? 0;
  if (pattern.video_types.includes(route.brief.videoType)) score += 10;
  for (const style of pattern.styles) if (routeStyles.has(style as any)) score += 4;
  for (const capability of pattern.capabilities) if (routeCapabilities.has(capability as any)) score += 2;
  if ((beatAffinity[beatId] ?? []).includes(pattern.id)) score += 12;
  if ((videoDefaults[route.brief.videoType] ?? []).includes(pattern.id)) score += 6;

  const dimensionality = route.brief.dimensionality;
  if (pattern.id === 'spatial-orbit-reveal' && dimensionality !== '3d') score -= 8;
  if (pattern.id === 'shader-atmosphere' && dimensionality !== 'webgl' && route.brief.videoType !== 'experimental') score -= 7;
  if (pattern.id === 'particle-accent-hit' && !routeCapabilities.has('webgl')) score -= 8;
  if (pattern.capabilities.includes('ui-motion') && !routeCapabilities.has('ui-motion')) score -= 5;
  if (pattern.capabilities.includes('data-animation') && !routeCapabilities.has('data-animation')) score -= 5;
  if (pattern.capabilities.includes('kinetic-typography') && !routeCapabilities.has('kinetic-typography')) score -= 2;

  return score;
};

const transitions = patterns.filter((pattern) => ['depth-cut-transition', 'mask-object-bridge', 'match-motion-bridge'].includes(pattern.id));
const restPattern = patterns.find((pattern) => pattern.id === 'silent-rest-beat');

const beats = storyboard.beats.map((beat, index) => {
  const ranked = patterns
    .filter((pattern) => !transitions.includes(pattern) && pattern.id !== 'silent-rest-beat')
    .map((pattern) => ({pattern, score: scorePattern(pattern, beat.id)}))
    .sort((a, b) => b.score - a.score || a.pattern.id.localeCompare(b.pattern.id));
  const primary = ranked[0];
  const alternative = ranked.find((entry) => entry.pattern.id !== primary.pattern.id && entry.score >= primary.score - 5);
  const nextBeat = storyboard.beats[index + 1];
  const transition = nextBeat
    ? transitions
        .map((pattern) => ({pattern, score: scorePattern(pattern, beat.id)}))
        .sort((a, b) => b.score - a.score || a.pattern.id.localeCompare(b.pattern.id))[0]
    : null;

  const seconds = beat.durationInFrames / storyboard.fps;
  const durationFit = primary.pattern.duration_seconds.length === 2
    ? seconds >= primary.pattern.duration_seconds[0] * 0.65 && seconds <= primary.pattern.duration_seconds[1] * 1.6
    : true;

  return {
    beatId: beat.id,
    label: beat.label,
    narrativePurpose: beat.purpose,
    durationSeconds: Number(seconds.toFixed(3)),
    primary: {
      id: primary.pattern.id,
      score: primary.score,
      status: primary.pattern.status,
      purpose: primary.pattern.purpose,
      primitives: primary.pattern.primitives,
      adapters: primary.pattern.adapters,
      research: primary.pattern.research,
      rule: primary.pattern.rule,
      avoid: primary.pattern.avoid,
      authoredDurationRangeSeconds: primary.pattern.duration_seconds,
      durationFit,
    },
    alternative: alternative ? {
      id: alternative.pattern.id,
      score: alternative.score,
      purpose: alternative.pattern.purpose,
      status: alternative.pattern.status,
    } : null,
    transitionToNext: transition && transition.score > 3 ? {
      id: transition.pattern.id,
      score: transition.score,
      rule: transition.pattern.rule,
      avoid: transition.pattern.avoid,
    } : null,
    restRecommendation: index > 0 && index < storyboard.beats.length - 1 && seconds >= 3.2 && restPattern
      ? {id: restPattern.id, rule: restPattern.rule, optionalSeconds: restPattern.duration_seconds}
      : null,
  };
});

const usedPatterns = [...new Set(beats.flatMap((beat) => [beat.primary.id, beat.alternative?.id, beat.transitionToNext?.id].filter(Boolean)))];
const requiredAdapters = [...new Set(beats.flatMap((beat) => beat.primary.adapters))];
const researchDonors = [...new Set(beats.flatMap((beat) => beat.primary.research))];

console.log(JSON.stringify({
  version: 1,
  brief,
  videoType: route.brief.videoType,
  styles: route.brief.styles,
  dimensionality: route.brief.dimensionality,
  delivery: route.brief.delivery,
  grammarSize: patterns.length,
  usedPatterns,
  requiredAdapters,
  researchDonors,
  beats,
  policy: {
    narrativePurposeFirst: true,
    oneDominantShotIdeaPerBeat: true,
    patternStatusIsNotRuntimeProof: true,
    rerouteWhenBriefChanges: true,
  },
}, null, 2));
