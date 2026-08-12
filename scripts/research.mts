import fs from 'node:fs';
import path from 'node:path';
import { routeBrief } from '../packages/motion-core/src/index.js';

const brief = process.argv.slice(2).join(' ').trim();
if (!brief) {
  console.error('Usage: npm run research -- "<video brief>"');
  process.exit(1);
}

const route = routeBrief(brief);
const root = process.cwd();
const stopWords = new Set([
  'with', 'from', 'into', 'that', 'this', 'make', 'create', 'video', 'second', 'seconds', 'using', 'have', 'will',
  'для', 'сделай', 'ролик', 'видео', 'который', 'чтобы', 'очень', 'через', 'нужно', 'хочу', 'будет', 'сделать',
]);

const tokenize = (value: string): string[] => {
  const words = value.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [];
  return [...new Set(words.filter((word) => !stopWords.has(word)))];
};

const capabilityCategories: Record<string, string[]> = {
  'creative-direction': ['skills', 'shots-scenes-storyboard', 'examples-templates'],
  'shot-design': ['shots-scenes-storyboard', 'examples-templates'],
  cinematography: ['camera-cinematography', 'shots-scenes-storyboard', '3d-webgl-shaders'],
  choreography: ['transitions', 'ui-motion', 'typography', 'shots-scenes-storyboard'],
  'kinetic-typography': ['typography', 'shots-scenes-storyboard'],
  'ui-motion': ['ui-motion', 'shots-scenes-storyboard', 'examples-templates'],
  transitions: ['transitions', 'shots-scenes-storyboard'],
  'data-animation': ['data-animation', 'examples-templates'],
  'three-d': ['3d-webgl-shaders', 'camera-cinematography', 'examples-templates'],
  webgl: ['3d-webgl-shaders', 'effects', 'examples-templates'],
  'sound-design': ['audio-sound', 'shots-scenes-storyboard'],
  'remotion-engineering': ['remotion', 'skills', 'rendering'],
  rendering: ['rendering', 'remotion', 'skills'],
  'visual-qa': ['tests', 'skills', 'rendering'],
};

const desiredCategories = new Set(
  route.capabilities.flatMap((capability) => capabilityCategories[capability] ?? []),
);
const queryTokens = new Set([
  ...tokenize(brief),
  ...route.capabilities.flatMap(tokenize),
  ...route.primitives.flatMap((primitive) => [primitive.id, ...primitive.tags, primitive.kind]).flatMap(tokenize),
]);

const normalizedContext = [
  'SKILL.md',
  'core/creative-director/PROTOCOL.md',
  '.motion/video-types.yaml',
  '.motion/techniques.yaml',
  'packages/motion-core/src/catalog.ts',
  'packages/motion-core/src/tokens.ts',
  'packages/motion-core/src/storyboard.ts',
];
if (route.capabilities.includes('remotion-engineering') || route.brief.videoType !== 'cinematic-3d') {
  normalizedContext.push('packages/remotion-kit/src/choreography.ts', 'packages/remotion-kit/src/primitives.tsx');
}

const textSearchExtensions = new Set([
  '.md', '.mdx', '.txt', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.yaml', '.yml', '.toml', '.py', '.html', '.css', '.scss', '.glsl', '.vert', '.frag', '[none]',
]);
const maxContentBytes = 384 * 1024;

const countOccurrences = (haystack: string, needle: string, cap = 3): number => {
  let count = 0;
  let cursor = 0;
  while (count < cap) {
    const found = haystack.indexOf(needle, cursor);
    if (found === -1) break;
    count += 1;
    cursor = found + Math.max(needle.length, 1);
  }
  return count;
};

const contentSignals = (
  donor: string,
  file: { path: string; bytes: number; ext: string; binary: boolean },
): { score: number; hits: string[] } => {
  if (file.binary || !textSearchExtensions.has(file.ext) || file.bytes <= 0) return { score: 0, hits: [] };
  const sourcePath = path.join(root, 'upstream', donor, file.path);
  if (!fs.existsSync(sourcePath)) return { score: 0, hits: [] };

  let buffer: Buffer;
  try {
    const fd = fs.openSync(sourcePath, 'r');
    const length = Math.min(file.bytes, maxContentBytes);
    buffer = Buffer.alloc(length);
    fs.readSync(fd, buffer, 0, length, 0);
    fs.closeSync(fd);
  } catch {
    return { score: 0, hits: [] };
  }

  // Some donor archives use an unknown extension. NUL bytes are a cheap binary guard.
  if (buffer.includes(0)) return { score: 0, hits: [] };
  const text = buffer.toString('utf8').toLowerCase();
  const scoredHits: Array<{ token: string; score: number }> = [];
  let score = 0;
  for (const token of queryTokens) {
    if (token.length < 3) continue;
    const occurrences = countOccurrences(text, token, 3);
    if (!occurrences) continue;
    const weight = token.length >= 9 ? 2.4 : token.length >= 6 ? 1.8 : 1.2;
    const hitScore = occurrences * weight;
    score += hitScore;
    scoredHits.push({ token, score: hitScore });
  }

  // Content helps surface neutrally named files, but cannot overpower structure/provenance.
  return {
    score: Math.min(score, 18),
    hits: scoredHits.sort((a, b) => b.score - a.score || a.token.localeCompare(b.token)).slice(0, 8).map(({ token }) => token),
  };
};

const scoreFilePath = (file: { path: string; binary: boolean; categories?: string[]; ext?: string }): number => {
  const lower = file.path.toLowerCase();
  let score = 0;
  for (const category of file.categories ?? []) if (desiredCategories.has(category)) score += 6;
  for (const token of queryTokens) if (lower.includes(token)) score += token.length >= 7 ? 4 : 2;

  if (lower === 'skill.md' || lower.endsWith('/skill.md')) score += 10;
  if (lower === 'readme.md' || lower.endsWith('/readme.md')) score += 4;
  if (lower.includes('/references/')) score += 4;
  if (lower.includes('/lib/')) score += 3;
  if (lower.includes('/src/')) score += 2;
  if (lower.includes('/docs/')) score += 2;
  if (lower.includes('pipeline')) score += 5;
  if (lower.includes('choreograph')) score += 5;
  if (lower.includes('motion')) score += 2;
  if (lower.includes('camera')) score += route.capabilities.includes('cinematography') ? 5 : 1;
  if (lower.includes('render')) score += route.capabilities.includes('rendering') ? 5 : 1;
  if (lower.includes('test') || lower.includes('__snapshots__')) score -= 3;
  if (file.binary) score -= 12;
  if (textSearchExtensions.has(file.ext ?? '')) score += 1;
  return score;
};

const scoreAsset = (file: { path: string; binary: boolean; categories?: string[] }): number => {
  if (!file.binary) return -Infinity;
  const lower = file.path.toLowerCase();
  let score = 0;
  for (const category of file.categories ?? []) if (desiredCategories.has(category)) score += 5;
  for (const token of queryTokens) if (lower.includes(token)) score += 3;
  if (route.capabilities.includes('sound-design') && /\.(mp3|wav|m4a|aac)$/i.test(lower)) score += 6;
  if (/\.(png|jpg|jpeg|webp|gif|mp4|mov|glb|gltf)$/i.test(lower)) score += 2;
  return score;
};

const research = route.donors.map((donor) => {
  const indexPath = path.join(root, 'index', 'donors', `${donor}.json`);
  if (!fs.existsSync(indexPath)) return { donor, files: [], assets: [], warning: 'donor index missing' };
  const data = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as {
    files: Array<{ path: string; bytes: number; ext: string; binary: boolean; categories?: string[] }>;
  };

  const files = data.files
    .filter((file) => !file.binary)
    .map((file) => {
      const content = contentSignals(donor, file);
      const pathScore = scoreFilePath(file);
      return { ...file, score: pathScore + content.score, pathScore, contentScore: content.score, contentHits: content.hits };
    })
    .filter((file) => file.score > 0)
    .sort((a, b) => b.score - a.score || b.contentScore - a.contentScore || a.path.localeCompare(b.path))
    .slice(0, 7)
    .map(({ path: filePath, score, pathScore, contentScore, contentHits, categories, ext }) => ({
      path: `upstream/${donor}/${filePath}`,
      score: Number(score.toFixed(2)),
      pathScore,
      contentScore: Number(contentScore.toFixed(2)),
      contentHits,
      categories: categories ?? [],
      ext,
    }));

  const assets = data.files
    .filter((file) => file.binary)
    .map((file) => ({ ...file, score: scoreAsset(file) }))
    .filter((file) => file.score > 3)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, 4)
    .map(({ path: filePath, score, categories, ext }) => ({
      path: `upstream/${donor}/${filePath}`,
      score,
      categories: categories ?? [],
      ext,
    }));

  return { donor, files, assets };
});

const allDonors = fs.readdirSync(path.join(root, 'index', 'donors'))
  .filter((name) => name.endsWith('.json'))
  .map((name) => name.replace(/\.json$/, ''))
  .sort();
const ignoredDonors = allDonors.filter((donor) => !route.donors.includes(donor));

console.log(JSON.stringify({
  version: 2,
  brief,
  route: {
    videoType: route.brief.videoType,
    styles: route.brief.styles,
    energy: route.brief.energy,
    dimensionality: route.brief.dimensionality,
    quality: route.brief.quality,
    capabilities: route.capabilities,
    primitives: route.primitives.map((primitive) => primitive.id),
    donors: route.donors,
  },
  contextPolicy: {
    normalizedFirst: true,
    maxResearchDonors: 6,
    maxTextFilesPerDonor: 7,
    upstreamReadOnly: true,
    contentAwareWithinRoutedDonors: true,
    maxContentBytesPerFile: maxContentBytes,
  },
  normalizedContext: [...new Set(normalizedContext)],
  research,
  ignoredDonors,
}, null, 2));
