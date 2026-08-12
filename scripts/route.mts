import { buildQaPlan, buildStoryboardSkeleton, routeBrief } from '../packages/motion-core/src/index.js';
import { runtimeForPrimitiveIds, summarizeRuntimeReadiness } from './lib/runtime-registry.mts';

const brief = process.argv.slice(2).join(' ').trim();
if (!brief) {
  console.error('Usage: npm run route -- "35s premium product launch with 3D orbit and UI"');
  process.exit(1);
}

const route = routeBrief(brief);
const storyboard = buildStoryboardSkeleton(route);
const qa = buildQaPlan(route, storyboard);
const runtime = runtimeForPrimitiveIds(route.primitives.map((primitive) => primitive.id));

console.log(JSON.stringify({
  route: {
    brief: route.brief,
    capabilities: route.capabilities,
    donors: route.donors,
    primitives: route.primitives.map(({ id, kind, summary, sources }) => {
      const readiness = runtime.find((entry) => entry.id === id);
      return { id, kind, summary, sources, runtime: readiness };
    }),
    runtimeSummary: summarizeRuntimeReadiness(runtime),
    rationale: route.rationale,
  },
  storyboard,
  qa,
}, null, 2));
