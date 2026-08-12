import { execFileSync } from 'node:child_process';
import { buildQaPlan, buildStoryboardSkeleton, routeBrief } from '../packages/motion-core/src/index.js';
import { runtimeForPrimitiveIds, summarizeRuntimeReadiness } from './lib/runtime-registry';

const brief = process.argv.slice(2).join(' ').trim();
if (!brief) {
  console.error('Usage: npm run plan -- "<video brief>"');
  process.exit(1);
}

const route = routeBrief(brief);
const storyboard = buildStoryboardSkeleton(route);
const qa = buildQaPlan(route, storyboard);
const runtimeEntries = runtimeForPrimitiveIds(route.primitives.map((primitive) => primitive.id));
const runtimeSummary = summarizeRuntimeReadiness(runtimeEntries);

const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let research: Record<string, unknown>;
try {
  const raw = execFileSync(npmExecutable, ['run', '--silent', 'research', '--', brief], {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  research = JSON.parse(raw) as Record<string, unknown>;
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  throw new Error(`failed to build bounded research plan: ${message}`);
}

const primitiveRuntime = route.primitives.map((primitive) => ({
  id: primitive.id,
  kind: primitive.kind,
  summary: primitive.summary,
  sources: primitive.sources,
  runtime: runtimeEntries.find((entry) => entry.id === primitive.id) ?? { id: primitive.id, status: 'unknown' },
}));

const blockers = runtimeEntries
  .filter((entry) => entry.status === 'adapter-required' || entry.status === 'unknown')
  .map((entry) => ({
    primitiveId: entry.id,
    status: entry.status,
    adapters: entry.adapters ?? [],
    research: entry.research ?? [],
    action: entry.status === 'adapter-required'
      ? 'Use an existing ready adapter or implement/validate the declared adapter before claiming this behavior is production-ready.'
      : 'Runtime readiness is unknown; resolve the registry gap before implementation.',
  }));

const plan = {
  version: 1,
  brief,
  classification: route.brief,
  capabilities: route.capabilities,
  primitives: primitiveRuntime,
  runtimeSummary,
  blockers,
  donors: route.donors,
  storyboard,
  research,
  qa,
  implementationOrder: [
    'core/creative-director/PROTOCOL.md',
    '.motion/video-types.yaml',
    '.motion/techniques.yaml',
    '.motion/runtime-registry.yaml',
    'packages/motion-core/src/catalog.ts',
    'packages/remotion-kit/',
    'library/registry.yaml',
    'adapters/contracts.yaml',
    'exact upstream files from research.research[]',
  ],
  invariants: [
    'Do not load all donors into context.',
    'Do not edit or directly depend on upstream/** in production code.',
    'Use normalized implemented primitives before recipes, adapters, or new one-off logic.',
    'Resolve adapter-required blockers explicitly.',
    'Preserve real product/content truth and privacy.',
    'Run the generated QA plan before completion.',
  ],
};

console.log(JSON.stringify(plan, null, 2));
