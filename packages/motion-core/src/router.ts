import { PRIMITIVES } from './catalog.js';
import type {
  Capability,
  Dimensionality,
  Energy,
  MotionBrief,
  MotionStyle,
  PrimitiveDescriptor,
  QualityLevel,
  RoutePlan,
  VideoType,
} from './types.js';

const VIDEO_TYPE_TERMS: Record<VideoType, string[]> = {
  'product-launch': ['launch', 'launch film', 'promo', 'product film', 'product reveal', 'промо', 'запуск', 'продуктовый ролик'],
  'ui-demo': ['ui demo', 'product demo', 'interface demo', 'saas demo', 'screen recording', 'интерфейс', 'демо продукта', 'демо интерфейса'],
  'brand-film': ['brand film', 'manifesto', 'brand video', 'бренд ролик', 'манифест', 'имиджевый'],
  explainer: ['explainer', 'explain', 'tutorial', 'how it works', 'объяснить', 'как работает', 'обучающий'],
  'kinetic-type': ['kinetic type', 'kinetic typography', 'typography video', 'типографика', 'кинетическая типографика'],
  'data-story': ['data story', 'charts', 'dashboard story', 'statistics', 'данные', 'график', 'статистика', 'метрики'],
  social: ['reel', 'reels', 'tiktok', 'shorts', 'social ad', 'сторис', 'рилс', 'соцсети'],
  presentation: ['presentation video', 'deck', 'slide', 'презентация', 'слайды'],
  'logo-identity': ['logo animation', 'ident', 'identity reveal', 'логотип', 'айдентика', 'заставка'],
  'cinematic-3d': ['3d film', '3d product', 'cinematic 3d', '3d render', '3d ролик', '3d продукт'],
  experimental: ['experimental', 'generative', 'abstract motion', 'эксперимент', 'генеративный', 'абстрактный'],
};

const STYLE_TERMS: Record<MotionStyle, string[]> = {
  'premium-minimal': ['apple', 'premium', 'minimal', 'luxury', 'clean', 'air', 'премиально', 'минимализм', 'чисто', 'воздушно'],
  'cinematic-product': ['cinematic', 'film', 'dramatic product', 'camera', 'кинематографично', 'киношно', 'камера'],
  editorial: ['editorial', 'magazine', 'fashion', 'swiss', 'типографический', 'редакционный', 'журнальный'],
  'tech-minimal': ['vercel', 'linear', 'saas', 'developer tool', 'tech minimal', 'технологичный', 'saas'],
  expressive: ['bold', 'energetic', 'loud', 'dynamic type', 'ярко', 'энергично', 'дерзко', 'динамично'],
  experimental: ['experimental', 'generative', 'glitch', 'shader', 'webgl', 'эксперимент', 'шейдер', 'генеративный'],
};

const CAPABILITY_TERMS: Record<Capability, string[]> = {
  'creative-direction': ['concept', 'direction', 'story', 'message', 'идея', 'концепция', 'история'],
  'shot-design': ['shot', 'scene', 'storyboard', 'кадр', 'сцена', 'раскадровка'],
  cinematography: ['camera', 'orbit', 'dolly', 'parallax', 'macro', 'камера', 'пролет', 'орбита', 'параллакс'],
  choreography: ['timing', 'easing', 'stagger', 'rhythm', 'тайминг', 'ритм', 'стаггер'],
  'kinetic-typography': ['type', 'text', 'headline', 'kinetic', 'типографика', 'текст', 'заголовок'],
  'ui-motion': ['ui', 'interface', 'cursor', 'screen', 'product demo', 'интерфейс', 'курсор', 'экран'],
  transitions: ['transition', 'cut', 'wipe', 'переход', 'склейка'],
  'data-animation': ['data', 'chart', 'graph', 'metric', 'counter', 'данные', 'график', 'метрика', 'счетчик'],
  'three-d': ['3d', 'three.js', 'threejs', 'orbit', 'depth', 'объем', '3д'],
  webgl: ['webgl', 'shader', 'glsl', 'particles', 'шейдер', 'частицы'],
  'sound-design': ['sound', 'sfx', 'music', 'beat', 'audio', 'звук', 'музыка', 'бит'],
  'remotion-engineering': ['remotion', 'react video', 'composition', 'render code', 'код', 'композиция'],
  rendering: ['render', 'codec', 'mp4', 'prores', '4k', 'рендер', 'кодек'],
  'visual-qa': ['qa', 'review', 'inspect', 'quality', 'проверка', 'контроль качества'],
};

const VIDEO_CAPABILITIES: Record<VideoType, Capability[]> = {
  'product-launch': ['creative-direction', 'shot-design', 'cinematography', 'choreography', 'transitions', 'sound-design', 'remotion-engineering', 'visual-qa'],
  'ui-demo': ['creative-direction', 'shot-design', 'ui-motion', 'cinematography', 'choreography', 'transitions', 'remotion-engineering', 'visual-qa'],
  'brand-film': ['creative-direction', 'shot-design', 'cinematography', 'choreography', 'kinetic-typography', 'transitions', 'sound-design', 'visual-qa'],
  explainer: ['creative-direction', 'shot-design', 'choreography', 'kinetic-typography', 'ui-motion', 'data-animation', 'remotion-engineering', 'visual-qa'],
  'kinetic-type': ['creative-direction', 'kinetic-typography', 'choreography', 'transitions', 'sound-design', 'remotion-engineering', 'visual-qa'],
  'data-story': ['creative-direction', 'data-animation', 'kinetic-typography', 'choreography', 'remotion-engineering', 'visual-qa'],
  social: ['creative-direction', 'shot-design', 'kinetic-typography', 'choreography', 'transitions', 'sound-design', 'remotion-engineering', 'visual-qa'],
  presentation: ['creative-direction', 'kinetic-typography', 'data-animation', 'choreography', 'remotion-engineering', 'visual-qa'],
  'logo-identity': ['creative-direction', 'choreography', 'shot-design', 'sound-design', 'remotion-engineering', 'visual-qa'],
  'cinematic-3d': ['creative-direction', 'shot-design', 'cinematography', 'three-d', 'choreography', 'sound-design', 'rendering', 'visual-qa'],
  experimental: ['creative-direction', 'shot-design', 'choreography', 'webgl', 'three-d', 'sound-design', 'rendering', 'visual-qa'],
};

const DONOR_PRIORITY: Record<string, number> = {
  'remotion-skills': 4,
  'video-shotcraft': 4,
  onda: 4,
  'motion-design-skill': 4,
  'remotion-cinematic': 3,
  'product-launch-video-skill': 3,
  'motion-skills': 3,
  'emilkowalski-skills': 2,
  'chuk-motion': 2,
  'theatre': 2,
  'motion-canvas-examples': 2,
  'remotion-scenes': 1,
  'remotion-templates': 1,
  'skill-remotion-geist': 2,
  'claude-remotion-skill': 2,
};

const normalize = (value: string): string => value.toLowerCase().replace(/ё/g, 'е');

const termScore = (text: string, terms: string[]): number =>
  terms.reduce((score, term) => score + (text.includes(term) ? Math.max(1, term.split(' ').length) : 0), 0);

const bestKey = <T extends string>(text: string, dictionary: Record<T, string[]>, fallback: T): T => {
  let best = fallback;
  let bestScore = 0;
  for (const [key, terms] of Object.entries(dictionary) as [T, string[]][]) {
    const score = termScore(text, terms);
    if (score > bestScore) {
      best = key;
      bestScore = score;
    }
  }
  return best;
};

const inferStyles = (text: string): MotionStyle[] => {
  const scored = (Object.entries(STYLE_TERMS) as [MotionStyle, string[]][])
    .map(([style, terms]) => ({ style, score: termScore(text, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ style }) => style);
  return scored.length > 0 ? scored : ['premium-minimal'];
};

const inferEnergy = (text: string): Energy => {
  if (/aggressive|chaotic|brutal|очень динамич|агрессив|хаос/.test(text)) return 'aggressive';
  if (/dynamic|energetic|fast|bold|динамич|энергич|быстр/.test(text)) return 'dynamic';
  if (/restrained|calm|slow|quiet|сдержан|спокой|медлен/.test(text)) return 'restrained';
  return 'controlled';
};

const inferDimensionality = (text: string): Dimensionality => {
  if (/webgl|shader|glsl|шейдер/.test(text)) return 'webgl';
  if (/(^|\W)(3d|3д)(\W|$)|three\.js|threejs/.test(text)) return '3d';
  if (/2\.5d|parallax|depth|параллакс|глубин/.test(text)) return '2.5d';
  return '2d';
};

const inferQuality = (text: string): QualityLevel => {
  if (/hero|apple|campaign|flagship|award|awwwards|флагман|главный ролик|премиум/.test(text)) return 'hero-film';
  if (/draft|rough|test|черновик|тест/.test(text)) return 'draft';
  return 'production';
};

const unique = <T>(items: T[]): T[] => [...new Set(items)];

export const classifyBrief = (input: string | MotionBrief): MotionBrief => {
  if (typeof input !== 'string') return { ...input };
  const text = normalize(input);
  const videoType = bestKey(text, VIDEO_TYPE_TERMS, 'product-launch');
  const styles = inferStyles(text);
  const dimensionality = inferDimensionality(text);
  return {
    raw: input,
    videoType,
    styles,
    energy: inferEnergy(text),
    dimensionality,
    camera: dimensionality === '3d' || dimensionality === 'webgl' ? 'cinematic' : /camera|zoom|orbit|камера|пролет/.test(text) ? 'spatial' : 'subtle',
    audio: /voice|voiceover|озвуч|диктор/.test(text) ? 'voice-led' : /music|sound|sfx|audio|музык|звук/.test(text) ? 'mixed' : 'none',
    quality: inferQuality(text),
  };
};

const inferCapabilities = (brief: MotionBrief): Capability[] => {
  const base = VIDEO_CAPABILITIES[brief.videoType ?? 'product-launch'];
  const text = normalize(brief.raw ?? '');
  const explicit = (Object.entries(CAPABILITY_TERMS) as [Capability, string[]][])
    .filter(([, terms]) => termScore(text, terms) > 0)
    .map(([capability]) => capability);
  const dimensional = brief.dimensionality === '3d' ? ['three-d' as Capability] : brief.dimensionality === 'webgl' ? ['webgl' as Capability, 'three-d' as Capability] : [];
  return unique([...base, ...explicit, ...dimensional]);
};

const primitiveScore = (primitive: PrimitiveDescriptor, brief: MotionBrief, capabilities: Capability[]): number => {
  let score = 0;
  if (brief.videoType && primitive.videoTypes.includes(brief.videoType)) score += 7;
  for (const style of brief.styles ?? []) if (primitive.styles.includes(style)) score += 4;
  if (brief.energy && primitive.energies.includes(brief.energy)) score += 2;
  if (brief.dimensionality && primitive.dimensionality.includes(brief.dimensionality)) score += 5;
  for (const capability of capabilities) if (primitive.capabilities.includes(capability)) score += 2;
  const text = normalize(brief.raw ?? '');
  for (const tag of primitive.tags) if (text.includes(normalize(tag))) score += 2;
  return score;
};

const selectPrimitives = (brief: MotionBrief, capabilities: Capability[]): PrimitiveDescriptor[] => {
  return PRIMITIVES
    .map((primitive) => ({ primitive, score: primitiveScore(primitive, brief, capabilities) }))
    .filter(({ score }) => score >= 8)
    .sort((a, b) => b.score - a.score || a.primitive.id.localeCompare(b.primitive.id))
    .slice(0, 12)
    .map(({ primitive }) => primitive);
};

const selectDonors = (primitives: PrimitiveDescriptor[], capabilities: Capability[]): string[] => {
  const scores = new Map<string, number>();
  for (const primitive of primitives) {
    for (const source of primitive.sources) {
      scores.set(source.donor, (scores.get(source.donor) ?? 0) + 3 + (DONOR_PRIORITY[source.donor] ?? 0));
    }
  }
  if (capabilities.includes('remotion-engineering')) scores.set('remotion-skills', (scores.get('remotion-skills') ?? 0) + 8);
  if (capabilities.includes('visual-qa')) scores.set('motion-design-skill', (scores.get('motion-design-skill') ?? 0) + 4);
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([donor]) => donor);
};

export const routeBrief = (input: string | MotionBrief): RoutePlan => {
  const classified = classifyBrief(input);
  const brief: RoutePlan['brief'] = {
    ...classified,
    videoType: classified.videoType ?? 'product-launch',
    styles: classified.styles?.length ? classified.styles : ['premium-minimal'],
    energy: classified.energy ?? 'controlled',
    dimensionality: classified.dimensionality ?? '2d',
    camera: classified.camera ?? 'subtle',
    audio: classified.audio ?? 'none',
    quality: classified.quality ?? 'production',
  };
  const capabilities = inferCapabilities(brief);
  const primitives = selectPrimitives(brief, capabilities);
  const donors = selectDonors(primitives, capabilities);
  return {
    brief,
    capabilities,
    donors,
    primitives,
    rationale: [
      `video-type:${brief.videoType}`,
      `styles:${brief.styles.join(',')}`,
      `dimensionality:${brief.dimensionality}`,
      `selected ${primitives.length} normalized primitives before opening raw donor files`,
      `selected ${donors.length} donors as bounded context`,
    ],
  };
};
