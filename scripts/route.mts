import { buildQaPlan, buildStoryboardSkeleton, routeBrief } from '../packages/motion-core/src/index.js';

const brief = process.argv.slice(2).join(' ').trim();
if (!brief) {
  console.error('Usage: npm run route -- "35s premium product launch with 3D orbit and UI"');
  process.exit(1);
}

const route = routeBrief(brief);
const storyboard = buildStoryboardSkeleton(route);
const qa = buildQaPlan(route, storyboard);

console.log(JSON.stringify({
  route: {
    brief: route.brief,
    capabilities: route.capabilities,
    donors: route.donors,
    primitives: route.primitives.map(({ id, kind, summary, sources }) => ({ id, kind, summary, sources })),
    rationale: route.rationale,
  },
  storyboard,
  qa,
}, null, 2));
