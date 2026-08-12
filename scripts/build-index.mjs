import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const upstreamRoot = path.join(ROOT, 'upstream');
const indexRoot = path.join(ROOT, 'index');
const donorIndexRoot = path.join(indexRoot, 'donors');

const skipDirs = new Set(['.git', 'node_modules', '.next', '.cache', 'coverage']);
const binaryExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.mp4', '.mov', '.webm', '.mp3', '.wav', '.ogg', '.m4a', '.woff', '.woff2', '.ttf', '.otf', '.zip', '.gz', '.pdf', '.wasm', '.glb', '.gltf']);
const maxContentScanBytes = 128 * 1024;

const pathRules = [
  ['skills', /(skill|agent|prompt|instruction)/i],
  ['remotion', /(remotion|composition|usecurrentframe|interpolate|spring)/i],
  ['shots-scenes-storyboard', /(shot|scene|storyboard|sequence)/i],
  ['camera-cinematography', /(camera|cinema|orbit|dolly|parallax|depth)/i],
  ['transitions', /(transition|wipe|reveal|mask|cut)/i],
  ['typography', /(typograph|font|kinetic|text|title|headline)/i],
  ['ui-motion', /(cursor|interface|dashboard|browser|device|ui|product-demo)/i],
  ['3d-webgl-shaders', /(three|3d|webgl|shader|glsl|fragment|vertex)/i],
  ['data-animation', /(chart|graph|data|diagram|plot|visualization)/i],
  ['audio-sound', /(audio|sound|sfx|music|beat|voice)/i],
  ['rendering', /(render|ffmpeg|codec|video|export)/i],
  ['effects', /(particle|blur|glow|noise|gradient|effect)/i],
  ['design-system', /(token|theme|design-system|spacing|palette)/i],
  ['examples-templates', /(example|template|demo|sample)/i],
  ['tests', /(test|spec|e2e|playwright|vitest|jest)/i],
];

const contentRules = [
  ['skills', /\b(skill|agent|system prompt|instructions?)\b/i],
  ['remotion', /(from\s+['"]remotion['"]|useCurrentFrame|useVideoConfig|interpolate\s*\(|spring\s*\(|<Composition\b)/i],
  ['shots-scenes-storyboard', /\b(storyboard|shot card|shot type|shot sequence|scene sequence|scene structure)\b/i],
  ['camera-cinematography', /\b(camera|orbit|dolly|parallax|focal length|perspective|camera rig|depth plane)\b/i],
  ['transitions', /\b(transition|match cut|wipe|mask reveal|scene bridge|crossfade)\b/i],
  ['typography', /\b(typography|kinetic type|kinetic typography|font family|font size|text reveal|headline)\b/i],
  ['ui-motion', /\b(cursor|interface|dashboard|browser frame|product demo|ui motion|screen capture)\b/i],
  ['3d-webgl-shaders', /(@react-three|three\.js|threejs|\bwebgl\b|\bglsl\b|fragmentShader|vertexShader|\bshader\b)/i],
  ['data-animation', /\b(chart|graph|data visualization|data visualisation|plot|axis|series|metric counter)\b/i],
  ['audio-sound', /(<Audio\b|@remotion\/media|sound design|\bsfx\b|beat sync|beat map|voiceover|music track)/i],
  ['rendering', /(renderMedia|selectComposition|\bffmpeg\b|\bcodec\b|\bprores\b|\bh264\b|render pipeline|rendering)/i],
  ['effects', /\b(particle|motion blur|glow|film grain|noise field|light sweep|gradient|blur)\b/i],
  ['design-system', /\b(design token|motion token|theme|spacing scale|palette|spring config|duration scale)\b/i],
  ['tests', /(describe\s*\(|it\s*\(|test\s*\(|expect\s*\()/i],
];

const signalRules = [
  ['spring', /\bspring\s*\(/i],
  ['interpolate', /\binterpolate\s*\(/i],
  ['sequence', /<Sequence\b|\bSequence\s*\(/i],
  ['camera', /\bcamera\b|cameraRig|camera rig/i],
  ['orbit', /\borbit\b/i],
  ['parallax', /\bparallax\b/i],
  ['cursor', /\bcursor\b/i],
  ['kinetic-type', /kinetic (type|typography)/i],
  ['storyboard', /\bstoryboard\b/i],
  ['shot-card', /shot card/i],
  ['shader', /\b(shader|glsl|fragmentShader|vertexShader)\b/i],
  ['threejs', /three\.js|threejs|@react-three/i],
  ['chart', /\b(chart|graph|plot)\b/i],
  ['sound-design', /sound design|\bsfx\b/i],
  ['beat-sync', /beat sync|beat map/i],
  ['render', /renderMedia|\brendering\b|\bffmpeg\b/i],
  ['tokens', /design token|motion token|duration scale|spacing scale/i],
  ['mask', /\bmask\b|clipPath/i],
  ['motion-blur', /motion blur/i],
  ['particles', /\bparticles?\b/i],
];

function sniffBinary(full, ext, size) {
  if (binaryExts.has(ext)) return true;
  if (size === 0) return false;
  let fd;
  try {
    fd = fs.openSync(full, 'r');
    const length = Math.min(size, 4096);
    const buffer = Buffer.alloc(length);
    fs.readSync(fd, buffer, 0, length, 0);
    if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) return true;
    if (buffer.includes(0)) return true;
    let control = 0;
    for (const byte of buffer) {
      if (byte < 9 || (byte > 13 && byte < 32)) control += 1;
    }
    return buffer.length > 0 && control / buffer.length > 0.12;
  } catch {
    return false;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

function readSearchText(full, size) {
  if (size <= 0) return '';
  let fd;
  try {
    fd = fs.openSync(full, 'r');
    const length = Math.min(size, maxContentScanBytes);
    const buffer = Buffer.alloc(length);
    fs.readSync(fd, buffer, 0, length, 0);
    return buffer.toString('utf8');
  } catch {
    return '';
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

function walk(dir, baseDir, acc) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.isDirectory() && skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, baseDir, acc);
      continue;
    }
    if (!entry.isFile() && !entry.isSymbolicLink()) continue;
    const rel = path.relative(baseDir, full).split(path.sep).join('/');
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    const ext = path.extname(entry.name).toLowerCase() || '[none]';
    const binary = sniffBinary(full, ext, stat.size);
    const pathCategories = pathRules.filter(([, regex]) => regex.test(rel)).map(([name]) => name);
    const content = binary ? '' : readSearchText(full, stat.size);
    const contentCategories = contentRules.filter(([, regex]) => regex.test(content)).map(([name]) => name);
    const categories = [...new Set([...pathCategories, ...contentCategories])];
    const signals = content ? signalRules.filter(([, regex]) => regex.test(content)).map(([name]) => name) : [];

    acc.push({
      path: rel,
      bytes: stat.size,
      ext,
      binary,
      categories,
      contentCategories,
      signals,
      indexedContentBytes: binary ? 0 : Math.min(stat.size, maxContentScanBytes),
    });
  }
}

function topEntries(obj, limit = 16) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

if (!fs.existsSync(upstreamRoot)) {
  console.error('upstream/ does not exist. Run scripts/sync-upstreams.sh first.');
  process.exit(1);
}

fs.mkdirSync(donorIndexRoot, {recursive: true});

const donorNames = fs.readdirSync(upstreamRoot, {withFileTypes: true})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const catalog = {
  version: 2,
  generatedAt: new Date().toISOString(),
  purpose: 'Path + bounded-content routing index. Agents should choose donors first, then exact files; raw corpus-wide loading is prohibited.',
  indexedContentBytesPerFile: maxContentScanBytes,
  donors: {},
};

for (const donor of donorNames) {
  const donorRoot = path.join(upstreamRoot, donor);
  const files = [];
  walk(donorRoot, donorRoot, files);

  const extensions = {};
  const categoryCounts = {};
  const contentCategoryCounts = {};
  const signalCounts = {};
  let totalBytes = 0;
  let indexedContentBytes = 0;
  let textFiles = 0;
  let binaryFiles = 0;

  for (const file of files) {
    totalBytes += file.bytes;
    indexedContentBytes += file.indexedContentBytes;
    extensions[file.ext] = (extensions[file.ext] ?? 0) + 1;
    if (file.binary) binaryFiles += 1; else textFiles += 1;
    for (const category of file.categories) categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
    for (const category of file.contentCategories) contentCategoryCounts[category] = (contentCategoryCounts[category] ?? 0) + 1;
    for (const signal of file.signals) signalCounts[signal] = (signalCounts[signal] ?? 0) + 1;
  }

  const summary = {
    fileCount: files.length,
    totalBytes,
    indexedContentBytes,
    textFiles,
    binaryFiles,
    topExtensions: Object.fromEntries(topEntries(extensions)),
    categoryCounts: Object.fromEntries(topEntries(categoryCounts, 32)),
    contentCategoryCounts: Object.fromEntries(topEntries(contentCategoryCounts, 32)),
    signalCounts: Object.fromEntries(topEntries(signalCounts, 32)),
  };

  catalog.donors[donor] = summary;
  fs.writeFileSync(
    path.join(donorIndexRoot, `${donor}.json`),
    JSON.stringify({version: 2, donor, summary, files}, null, 2) + '\n',
  );
}

fs.writeFileSync(path.join(indexRoot, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');

const lines = [
  '# IMON MOTION Upstream Catalog',
  '',
  'Generated automatically from file paths plus a bounded content scan. Use this summary to choose donors; inspect only routed donor indexes/files.',
  '',
  '| Donor | Files | Size | Dominant capabilities | Content signals |',
  '|---|---:|---:|---|---|',
];

for (const [donor, summary] of Object.entries(catalog.donors)) {
  const sizeMB = (summary.totalBytes / 1024 / 1024).toFixed(1);
  const capabilities = Object.entries(summary.categoryCounts).slice(0, 5).map(([name, count]) => `${name} (${count})`).join(', ');
  const signals = Object.entries(summary.signalCounts).slice(0, 5).map(([name, count]) => `${name} (${count})`).join(', ');
  lines.push(`| \`${donor}\` | ${summary.fileCount} | ${sizeMB} MB | ${capabilities || 'unclassified'} | ${signals || 'none'} |`);
}

lines.push(
  '',
  '## Routing rule',
  '',
  'Do not load every donor index. Route the brief first. Use `npm run research -- "<brief>"` to combine normalized primitives, bounded donor selection, this content-aware index, and a deeper content scan inside only the selected donors.',
  '',
);
fs.writeFileSync(path.join(indexRoot, 'catalog.md'), lines.join('\n'));

console.log(`Indexed ${donorNames.length} donors into ${path.relative(ROOT, indexRoot)}/ using path + bounded content signals`);
