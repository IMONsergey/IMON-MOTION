import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = process.cwd();
const exists = (relative) => fs.existsSync(path.join(root, relative));
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));

const git = (...args) => {
  try {
    return execFileSync('git', args, {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim();
  } catch {
    return '';
  }
};

const currentHead = git('rev-parse', 'HEAD') || null;
const changedSince = (sha) => {
  if (!sha || !currentHead) return [];
  const output = git('diff', '--name-only', `${sha}..${currentHead}`);
  return output ? output.split(/\r?\n/).map((value) => value.trim()).filter(Boolean) : [];
};

const proofSpecs = {
  core: {
    file: 'status/core-ci.json',
    relevant: ['package.json', 'package-lock.json', 'tsconfig.json', '.motion/', '.agents/', 'packages/', 'apps/studio/', 'scripts/route.mts', 'scripts/research.mts', 'scripts/plan.mts', 'scripts/production-plan.mts', 'scripts/shot-plan.mts', 'scripts/context.mts', 'scripts/license-audit.mjs', 'scripts/validate-system.mjs', 'index/', 'provenance/SOURCES.lock.yaml', '.github/workflows/ci.yml'],
  },
  three: {
    file: 'status/three-runtime.json',
    relevant: ['package.json', 'package-lock.json', 'tsconfig.json', 'apps/three-studio/', 'adapters/remotion-three/', '.github/workflows/three-runtime.yml'],
  },
  capture: {
    file: 'status/capture-runtime.json',
    relevant: ['package.json', 'package-lock.json', 'tsconfig.json', 'apps/capture-runner/', 'adapters/product-capture/', '.github/workflows/capture-runtime.yml'],
  },
  qa: {
    file: 'status/qa-runtime.json',
    relevant: ['package.json', 'package-lock.json', 'tsconfig.json', 'scripts/render-qa.mts', 'packages/motion-core/src/qa.ts', 'packages/motion-core/src/storyboard.ts', 'apps/studio/', '.github/workflows/qa-runtime.yml'],
  },
  audio: {
    file: 'status/audio-runtime.json',
    relevant: ['package.json', 'package-lock.json', 'tsconfig.json', 'adapters/audio-analysis/', '.github/workflows/audio-runtime.yml'],
  },
  webgl: {
    file: 'status/webgl-runtime.json',
    relevant: ['package.json', 'package-lock.json', 'tsconfig.json', 'apps/webgl-studio/', 'adapters/webgl/', '.github/workflows/webgl-runtime.yml'],
  },
  delivery: {
    file: 'status/delivery-runtime.json',
    relevant: ['package.json', 'package-lock.json', 'tsconfig.json', 'scripts/render-delivery.mts', 'scripts/production-plan.mts', 'scripts/shot-plan.mts', 'apps/delivery-smoke/', '.github/workflows/delivery-runtime.yml'],
  },
};

const proofs = {};
for (const [id, spec] of Object.entries(proofSpecs)) {
  if (!exists(spec.file)) {
    proofs[id] = {status: 'unproven', proof: null, relevantChangesSinceProof: []};
    continue;
  }
  const proof = readJson(spec.file);
  const changed = changedSince(proof.tested_head_sha);
  const relevantChanges = changed.filter((file) => spec.relevant.some((prefix) => file === prefix || file.startsWith(prefix)));
  proofs[id] = {
    status: relevantChanges.length ? 'proven-stale' : 'proven-current',
    proof,
    relevantChangesSinceProof: relevantChanges,
  };
}

const catalog = exists('index/catalog.json') ? readJson('index/catalog.json') : {version: null, donors: {}};
const license = exists('provenance/LICENSE-STATUS.json') ? readJson('provenance/LICENSE-STATUS.json') : null;
const donorDirs = exists('upstream')
  ? fs.readdirSync(path.join(root, 'upstream'), {withFileTypes: true}).filter((entry) => entry.isDirectory()).length
  : 0;

const adapterProofMap = {
  'remotion-three': 'three',
  'product-capture': 'capture',
  'audio-analysis': 'audio',
  webgl: 'webgl',
};
const adapterSourceMap = {
  'remotion-three': 'adapters/remotion-three',
  'product-capture': 'adapters/product-capture',
  'audio-analysis': 'adapters/audio-analysis',
  webgl: 'adapters/webgl',
  'theatre-three': 'adapters/theatre-three',
  'motion-canvas': 'adapters/motion-canvas',
};
const adapters = Object.entries(adapterSourceMap).map(([id, source]) => {
  const proofId = adapterProofMap[id];
  const proofState = proofId ? proofs[proofId]?.status ?? 'unproven' : 'unproven';
  return {
    id,
    sourcePresent: exists(source),
    proofTrack: proofId ?? null,
    runtimeProof: proofState,
    effectiveStatus: proofState === 'proven-current'
      ? 'runtime-proven'
      : proofState === 'proven-stale'
        ? 'runtime-proof-stale'
        : exists(source)
          ? 'implemented-unproven-or-partial'
          : 'planned-or-absent',
  };
});

const semanticReadiness = {
  'camera.product-orbit': {
    adapter: 'remotion-three',
    effective: proofs.three.status === 'proven-current' ? 'executable-via-proven-adapter' : 'adapter-required',
    fallback: 'camera.parallax-2_5d',
  },
  'webgl.shader-field': {
    adapter: 'webgl',
    effective: proofs.webgl.status === 'proven-current' ? 'executable-via-proven-adapter' : 'adapter-required',
    fallback: 'static-or-css-material',
  },
  'effect.particle-accent': {
    adapter: 'webgl',
    effective: 'adapter-required',
    reason: 'Shader-field proof does not prove a particle system implementation.',
  },
  'ui.cursor-focus': {
    adapter: 'product-capture',
    effective: proofs.capture.status === 'proven-current' ? 'recipe-with-proven-capture-runtime' : 'recipe-with-capture-runtime-unproven',
  },
  'audio.beat-map': {
    adapter: 'audio-analysis',
    effective: proofs.audio.status === 'proven-current' ? 'recipe-with-proven-onset-analysis' : 'recipe-with-manual-review-required',
    caveat: 'Onset analysis is not authoritative musical beat/tempo truth.',
  },
};

const health = {
  version: 2,
  generatedAt: new Date().toISOString(),
  currentHead,
  corpus: {
    expectedDonors: 15,
    snapshotDirectories: donorDirs,
    indexVersion: catalog.version,
    indexedDonors: Object.keys(catalog.donors ?? {}).length,
    healthy: donorDirs === 15 && catalog.version === 2 && Object.keys(catalog.donors ?? {}).length === 15,
  },
  proofs,
  adapters,
  semanticReadiness,
  license: license ? {
    donors: license.summary?.donors,
    withDetectedLicenseFile: license.summary?.withDetectedLicenseFile,
    missingLicenseFile: license.summary?.missingLicenseFile ?? [],
    unclassifiedLicense: license.summary?.unclassifiedLicense ?? [],
    donorsWithBundledAssets: license.summary?.donorsWithBundledAssets,
  } : {status: 'missing'},
  agentSurface: {
    skillFiles: exists('.agents/skills')
      ? fs.readdirSync(path.join(root, '.agents/skills'), {withFileTypes: true}).filter((entry) => entry.isDirectory()).length
      : 0,
    shotGrammar: exists('library/shot-patterns.yaml'),
    productionPlanner: exists('scripts/production-plan.mts'),
    contextBuilder: exists('scripts/context.mts'),
    scaffold: exists('scripts/scaffold.mts'),
    deliveryRenderer: exists('scripts/render-delivery.mts'),
    qaRenderer: exists('scripts/render-qa.mts'),
  },
  policy: {
    sourcePresenceIsNotRuntimeProof: true,
    proofStatuses: {
      'proven-current': 'Successful proof exists and no tracked relevant file changed after its tested SHA.',
      'proven-stale': 'Successful proof exists, but relevant implementation/config changed later.',
      unproven: 'No successful committed proof exists.',
    },
    semanticReadinessMayUpgradeOnlyFromCurrentProof: true,
  },
};

console.log(JSON.stringify(health, null, 2));
