import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const expectedDonors = [
  'video-shotcraft',
  'onda',
  'motion-skills',
  'motion-design-skill',
  'emilkowalski-skills',
  'claude-remotion-skill',
  'remotion-skills',
  'product-launch-video-skill',
  'remotion-cinematic',
  'chuk-motion',
  'skill-remotion-geist',
  'remotion-scenes',
  'remotion-templates',
  'motion-canvas-examples',
  'theatre',
];

const requiredFiles = [
  'SKILL.md',
  'AGENTS.md',
  '.motion/ROUTER.md',
  '.motion/capabilities.yaml',
  '.motion/styles.yaml',
  '.motion/video-types.yaml',
  '.motion/techniques.yaml',
  '.motion/runtime-registry.yaml',
  '.motion/quality-gates.yaml',
  'core/creative-director/PROTOCOL.md',
  'packages/motion-core/src/types.ts',
  'packages/motion-core/src/tokens.ts',
  'packages/motion-core/src/catalog.ts',
  'packages/motion-core/src/router.ts',
  'packages/motion-core/src/storyboard.ts',
  'packages/motion-core/src/qa.ts',
  'packages/remotion-kit/src/choreography.ts',
  'packages/remotion-kit/src/primitives.tsx',
  'packages/remotion-kit/src/scenes.tsx',
  'apps/studio/package.json',
  'apps/studio/src/index.ts',
  'apps/studio/src/Root.tsx',
  'apps/studio/src/SystemPreview.tsx',
  'scripts/route.mts',
  'scripts/research.mts',
  'library/README.md',
  'library/registry.yaml',
  'adapters/README.md',
  'adapters/contracts.yaml',
  'provenance/SOURCES.lock.yaml',
  'index/catalog.json',
];

const failures = [];
const exists = (relative) => fs.existsSync(path.join(root, relative));

for (const file of requiredFiles) {
  if (!exists(file)) failures.push(`missing required file: ${file}`);
}

const lockPath = path.join(root, 'provenance/SOURCES.lock.yaml');
const lock = fs.readFileSync(lockPath, 'utf8');
for (const donor of expectedDonors) {
  if (!exists(`upstream/${donor}`)) failures.push(`missing donor directory: upstream/${donor}`);
  if (!exists(`index/donors/${donor}.json`)) failures.push(`missing donor index: index/donors/${donor}.json`);
  if (!new RegExp(`^  ${donor}:`, 'm').test(lock)) failures.push(`missing provenance entry: ${donor}`);
}

const donorCatalog = JSON.parse(fs.readFileSync(path.join(root, 'index/catalog.json'), 'utf8'));
if (donorCatalog.version !== 2) failures.push(`expected routed donor index v2, got ${donorCatalog.version}`);
if (Object.keys(donorCatalog.donors ?? {}).length !== expectedDonors.length) {
  failures.push(`expected ${expectedDonors.length} indexed donors, got ${Object.keys(donorCatalog.donors ?? {}).length}`);
}

const catalogPath = path.join(root, 'packages/motion-core/src/catalog.ts');
const catalog = fs.readFileSync(catalogPath, 'utf8');
const primitiveIds = [...catalog.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]);
const duplicateIds = primitiveIds.filter((id, index) => primitiveIds.indexOf(id) !== index);
if (primitiveIds.length < 20) failures.push(`normalized primitive catalog too small: ${primitiveIds.length} (<20)`);
if (duplicateIds.length) failures.push(`duplicate primitive ids: ${[...new Set(duplicateIds)].join(', ')}`);

const runtimeRegistry = fs.readFileSync(path.join(root, '.motion/runtime-registry.yaml'), 'utf8');
for (const primitiveId of primitiveIds) {
  if (!runtimeRegistry.includes(`  ${primitiveId}:`)) failures.push(`runtime registry missing primitive: ${primitiveId}`);
}
for (const status of ['implemented', 'recipe', 'adapter-required']) {
  if (!runtimeRegistry.includes(`status: ${status}`)) failures.push(`runtime registry has no ${status} entries`);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (packageJson.version !== '0.2.0') failures.push(`expected root version 0.2.0, got ${packageJson.version}`);
if (!Array.isArray(packageJson.workspaces) || !packageJson.workspaces.includes('packages/*')) failures.push('root package.json must include packages/* workspace');
if (!Array.isArray(packageJson.workspaces) || !packageJson.workspaces.includes('apps/*')) failures.push('root package.json must include apps/* workspace');
for (const script of ['route', 'research', 'studio', 'studio:compositions', 'system:validate', 'typecheck', 'test']) {
  if (!packageJson.scripts?.[script]) failures.push(`missing root npm script: ${script}`);
}

const studioPackage = JSON.parse(fs.readFileSync(path.join(root, 'apps/studio/package.json'), 'utf8'));
if (studioPackage.name !== '@imon-motion/studio') failures.push(`unexpected Studio package name: ${studioPackage.name}`);
if (!studioPackage.dependencies?.['@imon-motion/core']) failures.push('Studio must depend on @imon-motion/core');
if (!studioPackage.dependencies?.['@imon-motion/remotion-kit']) failures.push('Studio must depend on @imon-motion/remotion-kit');

if (failures.length) {
  console.error('IMON MOTION system validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`IMON MOTION validation OK: ${expectedDonors.length} donors, content-aware index v${donorCatalog.version}, ${primitiveIds.length} normalized primitives, runtime readiness registry, routed research, library/adapters contracts and Studio architecture present.`);
