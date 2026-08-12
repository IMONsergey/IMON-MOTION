import {execFileSync} from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const brief = process.argv.slice(2).join(' ').trim();
if (!brief) {
  console.error('Usage: tsx scripts/production-plan.mts "<video brief>"');
  process.exit(1);
}

const root = process.cwd();
const tsxBinary = process.platform === 'win32'
  ? path.join(root, 'node_modules', '.bin', 'tsx.cmd')
  : path.join(root, 'node_modules', '.bin', 'tsx');

const runJson = (script: string) => {
  const output = execFileSync(tsxBinary, [script, brief], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(output);
};

const base = runJson('scripts/plan.mts');
const shotPlan = runJson('scripts/shot-plan.mts');

const adapterBlockers = new Map((base.blockers ?? []).map((blocker: any) => [blocker.primitiveId, blocker]));
const shotRuntimeWarnings = [];
for (const beat of shotPlan.beats ?? []) {
  for (const primitiveId of beat.primary?.primitives ?? []) {
    const blocker = adapterBlockers.get(primitiveId);
    if (blocker) {
      shotRuntimeWarnings.push({
        beatId: beat.beatId,
        patternId: beat.primary.id,
        primitiveId,
        blocker,
      });
    }
  }
}

const result = {
  ...base,
  version: 2,
  director: {
    shotGrammar: shotPlan,
    runtimeWarnings: shotRuntimeWarnings,
    rule: 'Storyboard beats choose narrative shot patterns before implementation details. Pattern selection does not override runtime blockers.',
  },
};

console.log(JSON.stringify(result, null, 2));
