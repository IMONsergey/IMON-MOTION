import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {buildQaPlan, buildStoryboardSkeleton, routeBrief} from '../packages/motion-core/src/index.js';

const args = process.argv.slice(2);
const option = (name: string): string | undefined => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const has = (name: string): boolean => args.includes(name);

const entry = option('--entry');
const composition = option('--composition');
const brief = option('--brief');
const outDirArg = option('--out') ?? 'qa-output';
const sampleMode = option('--samples') ?? 'auto';

if (!entry || !composition || !brief) {
  console.error('Usage: tsx scripts/render-qa.mts --entry <remotion-entry.ts> --composition <id> --brief "<video brief>" [--out qa-output] [--samples auto|read|all]');
  process.exit(1);
}
if (!['auto', 'read', 'all'].includes(sampleMode)) throw new Error(`Unsupported --samples mode: ${sampleMode}`);

const root = process.cwd();
const entryPath = path.resolve(root, entry);
if (!fs.existsSync(entryPath)) throw new Error(`Remotion entry does not exist: ${entry}`);

const route = routeBrief(brief);
const storyboard = buildStoryboardSkeleton(route);
const qa = buildQaPlan(route, storyboard);
const outDir = path.resolve(root, outDirArg);
fs.mkdirSync(outDir, {recursive: true});

const desiredPurposes = sampleMode === 'all'
  ? new Set(['entry', 'read', 'exit'])
  : sampleMode === 'read'
    ? new Set(['read'])
    : route.brief.quality === 'hero-film'
      ? new Set(['entry', 'read', 'exit'])
      : new Set(['read']);

const selected = qa.sampleFrames.filter((sample) => desiredPurposes.has(sample.purpose));
const uniqueByFrame = [...new Map(selected.map((sample) => [sample.frame, sample])).values()].sort((a, b) => a.frame - b.frame);
if (!uniqueByFrame.length) throw new Error('QA plan produced no sample frames.');

const remotionBinary = process.platform === 'win32'
  ? path.join(root, 'node_modules', '.bin', 'remotion.cmd')
  : path.join(root, 'node_modules', '.bin', 'remotion');
if (!fs.existsSync(remotionBinary)) throw new Error('Remotion CLI is not installed. Run npm install first.');

const renders: Array<{
  frame: number;
  beatId: string;
  purpose: string;
  file: string;
  bytes: number;
  sha256: string;
}> = [];

for (const sample of uniqueByFrame) {
  const file = `frame-${String(sample.frame).padStart(6, '0')}-${sample.beatId}-${sample.purpose}.png`;
  const target = path.join(outDir, file);
  execFileSync(remotionBinary, [
    'still',
    entryPath,
    composition,
    target,
    `--frame=${sample.frame}`,
    '--overwrite',
  ], {
    cwd: root,
    stdio: has('--quiet') ? ['ignore', 'ignore', 'inherit'] : 'inherit',
    env: process.env,
  });
  const bytes = fs.statSync(target).size;
  const sha256 = crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
  renders.push({frame: sample.frame, beatId: sample.beatId, purpose: sample.purpose, file, bytes, sha256});
}

const manifest = {
  version: 1,
  brief,
  entry: path.relative(root, entryPath),
  composition,
  classification: route.brief,
  storyboard: {
    fps: storyboard.fps,
    durationInFrames: storyboard.durationInFrames,
    beats: storyboard.beats,
  },
  qa: {
    quality: qa.quality,
    checks: qa.checks,
    finalRenderRequired: qa.finalRenderRequired,
  },
  sampling: {
    mode: sampleMode,
    purposes: [...desiredPurposes],
    selectedFrames: renders.length,
  },
  renders,
};

const manifestPath = path.join(outDir, 'qa.manifest.json');
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ok: true, outDir, manifest: manifestPath, renderedFrames: renders.length, quality: qa.quality}, null, 2));
