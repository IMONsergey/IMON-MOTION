import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const upstreamRoot = path.join(ROOT, 'upstream');
const indexRoot = path.join(ROOT, 'index');
const donorIndexRoot = path.join(indexRoot, 'donors');

const skipDirs = new Set(['.git', 'node_modules', '.next', '.cache', 'coverage']);
const binaryExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.mp4', '.mov', '.webm', '.mp3', '.wav', '.ogg', '.m4a', '.woff', '.woff2', '.ttf', '.otf', '.zip', '.gz', '.pdf', '.wasm']);

const rules = [
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
    const searchText = rel.toLowerCase();
    const categories = rules.filter(([, regex]) => regex.test(searchText)).map(([name]) => name);
    acc.push({
      path: rel,
      bytes: stat.size,
      ext,
      binary: binaryExts.has(ext),
      categories,
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
  version: 1,
  generatedAt: new Date().toISOString(),
  purpose: 'Path-level routing index. Agents should use this to narrow context before opening donor files.',
  donors: {},
};

for (const donor of donorNames) {
  const donorRoot = path.join(upstreamRoot, donor);
  const files = [];
  walk(donorRoot, donorRoot, files);

  const extensions = {};
  const categoryCounts = {};
  let totalBytes = 0;
  let textFiles = 0;
  let binaryFiles = 0;

  for (const file of files) {
    totalBytes += file.bytes;
    extensions[file.ext] = (extensions[file.ext] ?? 0) + 1;
    if (file.binary) binaryFiles += 1; else textFiles += 1;
    for (const category of file.categories) {
      categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
    }
  }

  const summary = {
    fileCount: files.length,
    totalBytes,
    textFiles,
    binaryFiles,
    topExtensions: Object.fromEntries(topEntries(extensions)),
    categoryCounts: Object.fromEntries(topEntries(categoryCounts, 32)),
  };

  catalog.donors[donor] = summary;
  fs.writeFileSync(
    path.join(donorIndexRoot, `${donor}.json`),
    JSON.stringify({version: 1, donor, summary, files}, null, 2) + '\n',
  );
}

fs.writeFileSync(path.join(indexRoot, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');

const lines = [
  '# IMON MOTION Upstream Catalog',
  '',
  'Generated automatically. Use this summary to choose donors; open `index/donors/<name>.json` only after selecting a donor.',
  '',
  '| Donor | Files | Size | Dominant indexed capabilities |',
  '|---|---:|---:|---|',
];

for (const [donor, summary] of Object.entries(catalog.donors)) {
  const sizeMB = (summary.totalBytes / 1024 / 1024).toFixed(1);
  const capabilities = Object.entries(summary.categoryCounts).slice(0, 6).map(([name, count]) => `${name} (${count})`).join(', ');
  lines.push(`| \`${donor}\` | ${summary.fileCount} | ${sizeMB} MB | ${capabilities || 'unclassified'} |`);
}

lines.push('', '## Routing rule', '', 'Do not load every donor index. Select a donor set from `SKILL.md`, `.motion/ROUTER.md`, and `.motion/capabilities.yaml`, then inspect only the corresponding per-donor indexes and source files.', '');
fs.writeFileSync(path.join(indexRoot, 'catalog.md'), lines.join('\n'));

console.log(`Indexed ${donorNames.length} donors into ${path.relative(ROOT, indexRoot)}/`);
