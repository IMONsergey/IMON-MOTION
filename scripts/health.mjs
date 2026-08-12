import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = process.cwd();
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const exists = (relative) => fs.existsSync(path.join(root, relative));

const currentHead = (() => {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
  } catch {
    return null;
  }
})();

const changedSince = (sha) => {
  if (!sha || !currentHead) return [];
  try {
    return execFileSync('git', ['diff', '--name-only', `${sha}..${currentHead}`], {cwd: root, encoding: 'utf8'})
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
};

const proofSpecs = {
  core: {
    file: 'status/core-ci.json',
    relevant: [
      'package.json', 'tsconfig.json', '.motion/', 'packages/', 'apps/studio/',
      'scripts/route.mts', 'scripts/research.mts', 'scripts/plan.mts', 'scripts/context.mts',
      'scripts/license-audit.mjs', 'scripts/validate-system.mjs', 'index/', 'provenance/SOURCES.lock.yaml',
      '.github/workflows/ci.yml',
    ],
  },
  three: {
    file: 'status/three-runtime.json',
    relevant: ['package.json', 'tsconfig.json', 'apps/three-studio/', 'adapters/remotion-three/', '.github/workflows/three-runtime.yml'],
  },
  capture: {
    file: 'status/capture-runtime.json',
    relevant: ['package.json', 'tsconfig.json', 'apps/capture-runner/', 'adapters/product-capture/', '.github/workflows/capture-runtime.yml'],
  },
  qa: {
    file: 'status/qa-runtime.json',
    relevant: ['package.json', 'tsconfig.json', 'scripts/render-qa.mts', 'packages/motion-core/src/qa.ts', 'packages/motion-core/src/storyboard.ts', 'apps/studio/', '.github/workflows/qa-runtime.yml'],
  },
  audio: {
    file: 'status/audio-runtime.json',
    relevant: ['package.json', 'tsconfig.json', 'adapters/audio-analysis/', '.github/workflows/audio-runtime.yml'],
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
    status: relevantChanges.length === 0 ? 'proven-current' : 'proven-stale',
    proof,
    relevantChangesSinceProof: relevantChanges,
  };
}

const catalog = readJson('index/catalog.json');
const license = exists('provenance/LICENSE-STATUS.json') ? readJson('provenance/LICENSE-STATUS.json') : null;

const adapterContracts = [
  ['product-capture', 'adapters/product-capture', 'experimental'],
  ['remotion-three', 'adapters/remotion-three', 'experimental'],
  ['audio-analysis', 'adapters/audio-analysis', 'experimental'],
  ['webgl', 'adapters/webgl', 'planned'],
].map(([id, directory, fallbackStatus]) => ({
  id,
  directory,
  implementedDirectory: exists(directory),
  declaredStatus: fallbackStatus,
}));

const summary = {
  currentHead,
  corpus: {
    indexedDonors: Object.keys(catalog.donors ?? {}).length,
    indexVersion: catalog.version,
    fullDonorSnapshotsPresent: exists('upstream') && fs.readdirSync(path.join(root, 'upstream'), {withFileTypes: true}).filter((entry) => entry.isDirectory()).length,
  },
  proofs,
  license: license ? {
    donors: license.summary?.donors,
    withDetectedLicenseFile: license.summary?.withDetectedLicenseFile,
    missingLicenseFile: license.summary?.missingLicenseFile ?? [],
    unclassifiedLicense: license.summary?.unclassifiedLicense ?? [],
    donorsWithBundledAssets: license.summary?.donorsWithBundledAssets,
  } : {status: 'missing'},
  adapters: adapterContracts,
  policy: {
    proofStatusMeaning: {
      'proven-current': 'The runtime proof exists and no tracked relevant file changed since the tested SHA.',
      'proven-stale': 'The runtime passed previously, but relevant files changed afterwards; rerun its gate before claiming current readiness.',
      'unproven': 'No successful proof has been committed yet.',
    },
    neverPromoteFromSourcePresenceAlone: true,
  },
};

console.log(JSON.stringify(summary, null, 2));
