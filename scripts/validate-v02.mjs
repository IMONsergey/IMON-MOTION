import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const exists = (relative) => fs.existsSync(path.join(root, relative));
const requireFile = (relative) => {
  if (!exists(relative)) failures.push(`missing: ${relative}`);
};

const required = [
  '.agents/README.md',
  '.agents/skills/motion-director/SKILL.md',
  '.agents/skills/product-film/SKILL.md',
  '.agents/skills/ui-product-demo/SKILL.md',
  '.agents/skills/kinetic-typography/SKILL.md',
  '.agents/skills/data-story/SKILL.md',
  '.agents/skills/cinematic-3d/SKILL.md',
  '.agents/skills/motion-qa/SKILL.md',
  'library/shot-patterns.yaml',
  'scripts/shot-plan.mts',
  'scripts/production-plan.mts',
  'scripts/context.mts',
  'scripts/scaffold.mts',
  'scripts/render-qa.mts',
  'scripts/render-delivery.mts',
  'scripts/health-v2.mjs',
  'adapters/product-capture/src/index.ts',
  'apps/capture-runner/src/capture.ts',
  'adapters/remotion-three/src/orbit.ts',
  'apps/three-studio/src/ProductOrbit3DPreview.tsx',
  'adapters/audio-analysis/src/index.ts',
  'adapters/webgl/src/shader-field.ts',
  'apps/webgl-studio/src/ShaderFieldPreview.tsx',
  'apps/delivery-smoke/src/DeliverySmoke.tsx',
  'docs/WORKFLOW.md',
  'docs/CONTEXT-ENGINE.md',
  'docs/READINESS.md',
  'docs/PROVENANCE-LICENSES.md',
];
for (const file of required) requireFile(file);

if (exists('library/shot-patterns.yaml')) {
  const shotGrammar = fs.readFileSync(path.join(root, 'library/shot-patterns.yaml'), 'utf8');
  const ids = [...shotGrammar.matchAll(/^  ([A-Za-z0-9_.-]+):\s*$/gm)].map((match) => match[1]);
  if (ids.length < 20) failures.push(`shot grammar too small: ${ids.length} patterns (<20)`);
  for (const requiredPattern of ['hero-product-settle', 'ui-action-focus', 'chart-causal-build', 'spatial-orbit-reveal', 'shader-atmosphere', 'beat-impact-edit', 'silent-rest-beat', 'logo-end-settle']) {
    if (!ids.includes(requiredPattern)) failures.push(`shot grammar missing ${requiredPattern}`);
  }
}

if (exists('.agents/skills')) {
  const skills = fs.readdirSync(path.join(root, '.agents/skills'), {withFileTypes: true}).filter((entry) => entry.isDirectory());
  if (skills.length < 7) failures.push(`agent skill surface too small: ${skills.length} (<7)`);
  for (const skill of skills) {
    if (!exists(`.agents/skills/${skill.name}/SKILL.md`)) failures.push(`skill directory missing SKILL.md: ${skill.name}`);
  }
}

if (exists('index/catalog.json')) {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'index/catalog.json'), 'utf8'));
  if (catalog.version !== 2) failures.push(`expected donor index v2, got ${catalog.version}`);
  if (Object.keys(catalog.donors ?? {}).length !== 15) failures.push(`expected 15 indexed donors, got ${Object.keys(catalog.donors ?? {}).length}`);
}

for (const [adapter, files] of Object.entries({
  'product-capture': ['adapters/product-capture/test/product-capture.test.ts', 'apps/capture-runner/fixtures/fixture.config.json'],
  'remotion-three': ['adapters/remotion-three/test/orbit.test.ts', 'adapters/remotion-three/contract.yaml'],
  'audio-analysis': ['adapters/audio-analysis/test/audio-analysis.test.ts', 'adapters/audio-analysis/contract.yaml'],
  webgl: ['adapters/webgl/test/shader-field.test.ts', 'adapters/webgl/contract.yaml'],
})) {
  for (const file of files) if (!exists(file)) failures.push(`${adapter} missing contract/test: ${file}`);
}

const workflows = [
  'ci.yml',
  'sync-upstreams.yml',
  'scheduled-upstream-sync.yml',
  'extensions-gate.yml',
  'three-runtime.yml',
  'capture-runtime.yml',
  'audio-runtime.yml',
  'webgl-runtime.yml',
  'qa-runtime.yml',
  'delivery-runtime.yml',
];
for (const workflow of workflows) requireFile(`.github/workflows/${workflow}`);

if (exists('package.json')) {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const desired = ['route', 'research', 'plan', 'context', 'studio', 'typecheck', 'test'];
  for (const script of desired) if (!pkg.scripts?.[script]) failures.push(`package.json missing script: ${script}`);
}

if (failures.length) {
  console.error('IMON MOTION v0.2 integrity validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('IMON MOTION v0.2 integrity OK: full donor corpus, agent skills, shot grammar, context engine, scaffold/delivery/QA tooling and specialized runtime tracks are structurally present.');
