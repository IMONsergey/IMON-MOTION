import {execFileSync, spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const option = (name: string): string | undefined => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const has = (name: string): boolean => args.includes(name);

const entry = option('--entry');
const composition = option('--composition');
const brief = option('--brief');
const outArg = option('--out');
const codec = option('--codec') ?? 'h264';
if (!entry || !composition || !brief || !outArg) {
  console.error('Usage: tsx scripts/render-delivery.mts --entry <entry.ts> --composition <id> --brief "<video brief>" --out <video.mp4> [--codec h264] [--allow-blockers]');
  process.exit(1);
}

const root = process.cwd();
const entryPath = path.resolve(root, entry);
const outPath = path.resolve(root, outArg);
if (!fs.existsSync(entryPath)) throw new Error(`Remotion entry does not exist: ${entry}`);
fs.mkdirSync(path.dirname(outPath), {recursive: true});

const tsxBinary = process.platform === 'win32'
  ? path.join(root, 'node_modules', '.bin', 'tsx.cmd')
  : path.join(root, 'node_modules', '.bin', 'tsx');
const remotionBinary = process.platform === 'win32'
  ? path.join(root, 'node_modules', '.bin', 'remotion.cmd')
  : path.join(root, 'node_modules', '.bin', 'remotion');
if (!fs.existsSync(tsxBinary) || !fs.existsSync(remotionBinary)) throw new Error('Run npm install before delivery rendering.');

const plan = JSON.parse(execFileSync(tsxBinary, ['scripts/production-plan.mts', brief], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
  stdio: ['ignore', 'pipe', 'pipe'],
}));
const blockers = Array.isArray(plan.blockers) ? plan.blockers : [];
if (blockers.length && !has('--allow-blockers')) {
  throw new Error(`Production render blocked by unresolved runtime requirements: ${blockers.map((blocker: any) => `${blocker.primitiveId}:${blocker.status}`).join(', ')}. Use --allow-blockers only for an explicit non-production proof.`);
}

const renderArgs = ['render', entryPath, composition, outPath, `--codec=${codec}`, '--overwrite'];
if (has('--quiet')) renderArgs.push('--log=error');
execFileSync(remotionBinary, renderArgs, {cwd: root, stdio: 'inherit', env: process.env});

if (!fs.existsSync(outPath)) throw new Error(`Render output was not created: ${outPath}`);
const stat = fs.statSync(outPath);
if (stat.size < 1024) throw new Error(`Render output is unexpectedly small: ${stat.size} bytes`);
const sha256 = crypto.createHash('sha256').update(fs.readFileSync(outPath)).digest('hex');

const probe = (() => {
  const availability = spawnSync('ffprobe', ['-version'], {encoding: 'utf8'});
  if (availability.status !== 0) return {available: false};
  const result = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,sample_rate,channels',
    '-of', 'json',
    outPath,
  ], {encoding: 'utf8'});
  if (result.status !== 0) return {available: true, ok: false, error: result.stderr?.trim()};
  try {
    return {available: true, ok: true, data: JSON.parse(result.stdout)};
  } catch (error) {
    return {available: true, ok: false, error: error instanceof Error ? error.message : String(error)};
  }
})();

const expected = plan.classification?.delivery ?? {};
const validation: Array<{id: string; status: 'pass' | 'fail' | 'unknown'; detail: string}> = [];
if (probe.available && (probe as any).ok) {
  const data = (probe as any).data;
  const video = (data.streams ?? []).find((stream: any) => stream.codec_type === 'video');
  const audio = (data.streams ?? []).find((stream: any) => stream.codec_type === 'audio');
  const duration = Number(data.format?.duration);
  if (expected.width && expected.height && video) {
    const pass = Number(video.width) === expected.width && Number(video.height) === expected.height;
    validation.push({id: 'resolution', status: pass ? 'pass' : 'fail', detail: `expected ${expected.width}x${expected.height}; actual ${video.width}x${video.height}`});
  } else validation.push({id: 'resolution', status: 'unknown', detail: 'No explicit expected resolution or no probed video stream.'});

  if (expected.durationSeconds && Number.isFinite(duration)) {
    const tolerance = Math.max(0.12, 2 / (expected.fps ?? 30));
    const pass = Math.abs(duration - expected.durationSeconds) <= tolerance;
    validation.push({id: 'duration', status: pass ? 'pass' : 'fail', detail: `expected ~${expected.durationSeconds}s; actual ${duration}s; tolerance ${tolerance}s`});
  } else validation.push({id: 'duration', status: 'unknown', detail: 'No explicit expected duration or ffprobe duration.'});

  if (expected.fps && video?.avg_frame_rate) {
    const [num, den] = String(video.avg_frame_rate).split('/').map(Number);
    const actualFps = den ? num / den : num;
    const pass = Number.isFinite(actualFps) && Math.abs(actualFps - expected.fps) < 0.01;
    validation.push({id: 'fps', status: pass ? 'pass' : 'fail', detail: `expected ${expected.fps}; actual ${actualFps}`});
  } else validation.push({id: 'fps', status: 'unknown', detail: 'No explicit expected FPS or no probed frame rate.'});

  if (plan.classification?.audio && plan.classification.audio !== 'none') {
    validation.push({id: 'audio-stream', status: audio ? 'pass' : 'fail', detail: audio ? `audio codec ${audio.codec_name}` : 'Brief requested audio but output contains no audio stream.'});
  }
} else {
  validation.push({id: 'ffprobe', status: 'unknown', detail: 'ffprobe unavailable or failed; binary integrity only was validated.'});
}

const failed = validation.filter((check) => check.status === 'fail');
const productionReady = blockers.length === 0 && failed.length === 0;
const manifest = {
  version: 1,
  brief,
  entry: path.relative(root, entryPath),
  composition,
  codec,
  output: path.relative(root, outPath),
  bytes: stat.size,
  sha256,
  expectedDelivery: expected,
  runtimeBlockers: blockers,
  ffprobe: probe,
  validation,
  productionReady,
  allowBlockersUsed: has('--allow-blockers'),
  quality: plan.classification?.quality,
  finalRenderRequired: plan.qa?.finalRenderRequired ?? false,
};
const manifestPath = `${outPath}.manifest.json`;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

if (failed.length && !has('--allow-validation-failures')) {
  throw new Error(`Rendered file failed delivery validation: ${failed.map((check) => `${check.id} (${check.detail})`).join('; ')}`);
}

console.log(JSON.stringify({ok: true, output: outPath, manifest: manifestPath, bytes: stat.size, sha256, productionReady, validation}, null, 2));
