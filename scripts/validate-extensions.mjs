import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const exists = (relative) => fs.existsSync(path.join(root, relative));

const required = [
  'adapters/remotion-three/src/orbit.ts',
  'adapters/remotion-three/test/orbit.test.ts',
  'adapters/remotion-three/README.md',
  'adapters/remotion-three/contract.yaml',
  'scripts/license-audit.mjs',
  'docs/PROVENANCE-LICENSES.md',
  'docs/CONTEXT-ENGINE.md',
];
for (const file of required) if (!exists(file)) failures.push(`missing extension file: ${file}`);

const threeContract = fs.readFileSync(path.join(root, 'adapters/remotion-three/contract.yaml'), 'utf8');
if (!/^status:\s*experimental$/m.test(threeContract)) failures.push('remotion-three must remain experimental');
if (!threeContract.includes('primitive_ids: [camera.product-orbit]')) failures.push('remotion-three contract does not own camera.product-orbit');
if (!threeContract.includes('render-level 3D smoke test')) failures.push('remotion-three readiness gap is not documented');
if (!threeContract.includes('camera.parallax-2_5d')) failures.push('remotion-three fallback is missing');

const runtimeRegistry = fs.readFileSync(path.join(root, '.motion/runtime-registry.yaml'), 'utf8');
const orbitBlock = runtimeRegistry.match(/  camera\.product-orbit:\n([\s\S]*?)(?=^  [A-Za-z0-9_.-]+:\n|\s*$)/m)?.[1] ?? '';
if (!/status:\s*adapter-required/.test(orbitBlock)) failures.push('camera.product-orbit must remain adapter-required until render smoke passes');

const index = JSON.parse(fs.readFileSync(path.join(root, 'index/catalog.json'), 'utf8'));
if (index.version !== 2) failures.push(`expected index v2, got ${index.version}`);
if (Object.keys(index.donors ?? {}).length !== 15) failures.push(`expected 15 indexed donors, got ${Object.keys(index.donors ?? {}).length}`);

if (exists('provenance/LICENSE-STATUS.json')) {
  const report = JSON.parse(fs.readFileSync(path.join(root, 'provenance/LICENSE-STATUS.json'), 'utf8'));
  if (report.version !== 1) failures.push(`unexpected license report version: ${report.version}`);
  if (report.summary?.donors !== 15) failures.push(`license report donor count mismatch: ${report.summary?.donors}`);
  const allowed = new Set(['license-file-detected', 'review-required-no-license-file-detected', 'review-required-unclassified-license-file']);
  for (const [donor, source] of Object.entries(report.sources ?? {})) {
    if (!allowed.has(source.status)) failures.push(`invalid license status for ${donor}: ${source.status}`);
    if (source.assets?.files > 0 && !source.productionPolicy?.bundledAssetsRequireSeparateRightsReview) {
      failures.push(`bundled asset rights gate missing for ${donor}`);
    }
  }
} else {
  failures.push('license report is missing; run npm run license:audit');
}

if (!exists('provenance/LICENSE-STATUS.md')) failures.push('human-readable license report is missing');

if (failures.length) {
  console.error('IMON MOTION extension validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('IMON MOTION extension validation OK: experimental 3D orbit adapter, index v2, license/asset audit and readiness honesty are intact.');
