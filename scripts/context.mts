import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const brief = process.argv.slice(2).join(' ').trim();
if (!brief) {
  console.error('Usage: npm run context -- "<video brief>"');
  process.exit(1);
}

const root = process.cwd();
const maxBytes = Number(process.env.IMON_CONTEXT_BUDGET_BYTES ?? 768 * 1024);
const maxNormalizedFileBytes = Number(process.env.IMON_CONTEXT_NORMALIZED_FILE_BYTES ?? 64 * 1024);
const maxDonorExcerptBytes = Number(process.env.IMON_CONTEXT_DONOR_FILE_BYTES ?? 28 * 1024);
const excerptRadius = 2200;

if (!Number.isFinite(maxBytes) || maxBytes < 128 * 1024) throw new Error('IMON_CONTEXT_BUDGET_BYTES must be at least 131072');

const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const rawPlan = execFileSync(npmExecutable, ['run', '--silent', 'plan', '--', brief], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
  stdio: ['ignore', 'pipe', 'pipe'],
});
const plan = JSON.parse(rawPlan) as any;

const byteLength = (value: string): number => Buffer.byteLength(value, 'utf8');
const readUtf8 = (relativePath: string): string => fs.readFileSync(path.join(root, relativePath), 'utf8');
const lineAt = (text: string, offset: number): number => text.slice(0, Math.max(0, offset)).split('\n').length;

const mergeRanges = (ranges: Array<[number, number]>, maxLength: number): Array<[number, number]> => {
  const normalized = ranges
    .map(([start, end]) => [Math.max(0, start), Math.min(maxLength, end)] as [number, number])
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const range of normalized) {
    const previous = merged[merged.length - 1];
    if (previous && range[0] <= previous[1] + 180) previous[1] = Math.max(previous[1], range[1]);
    else merged.push([...range]);
  }
  return merged;
};

const trimToBytes = (value: string, limit: number): string => {
  if (byteLength(value) <= limit) return value;
  let low = 0;
  let high = value.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (byteLength(value.slice(0, mid)) <= limit) low = mid;
    else high = mid - 1;
  }
  return value.slice(0, low);
};

const excerptByHits = (text: string, hits: string[], maxFileBytes: number) => {
  if (byteLength(text) <= maxFileBytes) {
    return [{ startLine: 1, endLine: text.split('\n').length, content: text, reason: 'full-small-file' }];
  }

  const lower = text.toLowerCase();
  const ranges: Array<[number, number]> = [];
  for (const hit of hits.slice(0, 8)) {
    const needle = String(hit).toLowerCase();
    if (!needle) continue;
    let cursor = 0;
    for (let occurrence = 0; occurrence < 2; occurrence += 1) {
      const index = lower.indexOf(needle, cursor);
      if (index === -1) break;
      ranges.push([index - excerptRadius, index + needle.length + excerptRadius]);
      cursor = index + needle.length;
    }
  }

  if (!ranges.length) ranges.push([0, Math.min(text.length, 10000)]);
  const merged = mergeRanges(ranges, text.length);
  const excerpts: Array<{ startLine: number; endLine: number; content: string; reason: string }> = [];
  let remaining = maxFileBytes;
  for (const [start, end] of merged) {
    if (remaining <= 512) break;
    const raw = text.slice(start, end);
    const content = trimToBytes(raw, remaining);
    if (!content.trim()) continue;
    const actualEnd = start + content.length;
    excerpts.push({
      startLine: lineAt(text, start),
      endLine: lineAt(text, actualEnd),
      content,
      reason: hits.length ? `content-hit:${hits.slice(0, 5).join(',')}` : 'file-head-fallback',
    });
    remaining -= byteLength(content);
  }
  return excerpts;
};

const mandatoryNormalized = [
  'SKILL.md',
  'core/creative-director/PROTOCOL.md',
  '.motion/video-types.yaml',
  '.motion/techniques.yaml',
  '.motion/runtime-registry.yaml',
  'packages/motion-core/src/catalog.ts',
  'packages/motion-core/src/tokens.ts',
  'packages/motion-core/src/storyboard.ts',
  'packages/motion-core/src/qa.ts',
  'library/registry.yaml',
  'adapters/contracts.yaml',
];
const plannedNormalized = Array.isArray(plan.research?.normalizedContext) ? plan.research.normalizedContext : [];
const normalizedPaths = [...new Set([...mandatoryNormalized, ...plannedNormalized])]
  .filter((relativePath) => fs.existsSync(path.join(root, relativePath)));

let usedBytes = 0;
const normalized: any[] = [];
const donorExcerpts: any[] = [];
const omitted: any[] = [];

for (const relativePath of normalizedPaths) {
  const text = readUtf8(relativePath);
  const remainingGlobal = maxBytes - usedBytes;
  if (remainingGlobal <= 1024) {
    omitted.push({ path: relativePath, reason: 'global-budget-exhausted', source: 'normalized' });
    continue;
  }
  const allocation = Math.min(maxNormalizedFileBytes, remainingGlobal);
  const content = trimToBytes(text, allocation);
  const bytes = byteLength(content);
  normalized.push({
    path: relativePath,
    bytes,
    originalBytes: byteLength(text),
    truncated: bytes < byteLength(text),
    content,
  });
  usedBytes += bytes;
}

const routedDonors = new Set<string>(Array.isArray(plan.donors) ? plan.donors : []);
const researchDonors = Array.isArray(plan.research?.research) ? plan.research.research : [];
for (const donor of researchDonors) {
  if (!routedDonors.has(donor.donor)) {
    omitted.push({ donor: donor.donor, reason: 'not-routed' });
    continue;
  }
  for (const file of Array.isArray(donor.files) ? donor.files : []) {
    const relativePath = String(file.path);
    if (!relativePath.startsWith(`upstream/${donor.donor}/`)) {
      omitted.push({ path: relativePath, reason: 'invalid-donor-path' });
      continue;
    }
    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      omitted.push({ path: relativePath, reason: 'missing-file' });
      continue;
    }
    const remainingGlobal = maxBytes - usedBytes;
    if (remainingGlobal <= 1024) {
      omitted.push({ path: relativePath, reason: 'global-budget-exhausted' });
      continue;
    }
    const text = fs.readFileSync(absolutePath, 'utf8');
    const allocation = Math.min(maxDonorExcerptBytes, remainingGlobal);
    const excerpts = excerptByHits(text, Array.isArray(file.contentHits) ? file.contentHits : [], allocation);
    const bytes = excerpts.reduce((sum, excerpt) => sum + byteLength(excerpt.content), 0);
    if (!bytes) {
      omitted.push({ path: relativePath, reason: 'empty-excerpt' });
      continue;
    }
    donorExcerpts.push({
      donor: donor.donor,
      path: relativePath,
      researchScore: file.score,
      contentHits: file.contentHits ?? [],
      originalBytes: byteLength(text),
      selectedBytes: bytes,
      excerpts,
    });
    usedBytes += bytes;
  }
}

const ignoredDonors = Array.isArray(plan.research?.ignoredDonors) ? plan.research.ignoredDonors : [];
const leakedIgnored = donorExcerpts.filter((entry) => ignoredDonors.includes(entry.donor));
if (leakedIgnored.length) throw new Error(`ignored donor leaked into context pack: ${leakedIgnored.map((entry) => entry.donor).join(', ')}`);
if (usedBytes > maxBytes) throw new Error(`context pack exceeded budget: ${usedBytes} > ${maxBytes}`);

console.log(JSON.stringify({
  version: 1,
  brief,
  classification: plan.classification,
  capabilities: plan.capabilities,
  runtimeSummary: plan.runtimeSummary,
  blockers: plan.blockers,
  storyboard: plan.storyboard,
  qa: plan.qa,
  contextBudget: {
    maxBytes,
    usedBytes,
    remainingBytes: maxBytes - usedBytes,
    utilization: Number((usedBytes / maxBytes).toFixed(4)),
    maxNormalizedFileBytes,
    maxDonorExcerptBytes,
  },
  normalized,
  donorExcerpts,
  ignoredDonors,
  omitted,
  readPolicy: {
    normalizedFirst: true,
    donorFilesAreExcerpts: true,
    openFullDonorFileOnlyIfExcerptIsInsufficient: true,
    neverLoadIgnoredDonorWithoutRerouting: true,
    upstreamReadOnly: true,
  },
}, null, 2));
