import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const lockPath = path.join(root, 'provenance', 'SOURCES.lock.yaml');
const catalogPath = path.join(root, 'index', 'catalog.json');
const outJson = path.join(root, 'provenance', 'LICENSE-STATUS.json');
const outMd = path.join(root, 'provenance', 'LICENSE-STATUS.md');

const lock = fs.readFileSync(lockPath, 'utf8');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const generatedAt = lock.match(/^generated_at:\s*"([^"]+)"/m)?.[1] ?? null;
const sourceBlocks = [...lock.matchAll(/^  ([A-Za-z0-9_.-]+):\n([\s\S]*?)(?=^  [A-Za-z0-9_.-]+:\n|\s*$)/gm)];

const valueFrom = (block, key) => {
  const match = block.match(new RegExp(`^    ${key}:\\s*"([^"]*)"`, 'm'));
  return match?.[1] ?? '';
};

const classifyLicenseText = (text) => {
  const normalized = text.replace(/\r/g, '');
  if (/MIT License/i.test(normalized) && /permission is hereby granted/i.test(normalized)) return 'MIT';
  if (/Apache License/i.test(normalized) && /Version 2\.0/i.test(normalized)) return 'Apache-2.0';
  if (/GNU AFFERO GENERAL PUBLIC LICENSE/i.test(normalized)) return 'AGPL';
  if (/GNU LESSER GENERAL PUBLIC LICENSE/i.test(normalized)) return 'LGPL';
  if (/GNU GENERAL PUBLIC LICENSE/i.test(normalized)) return 'GPL';
  if (/Mozilla Public License/i.test(normalized)) return 'MPL';
  if (/BSD 3-Clause|redistribution and use in source and binary forms/i.test(normalized)) return 'BSD-family';
  if (/ISC License/i.test(normalized)) return 'ISC';
  if (/The Unlicense|This is free and unencumbered software released into the public domain/i.test(normalized)) return 'Unlicense';
  if (/Creative Commons/i.test(normalized)) return 'Creative-Commons';
  return 'unclassified';
};

const assetExtensions = new Set(['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.mp4', '.mov', '.webm', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.glb', '.gltf', '.pdf', '.woff', '.woff2', '.ttf', '.otf']);

const sources = {};
for (const match of sourceBlocks) {
  const donor = match[1];
  const block = match[2];
  const repository = valueFrom(block, 'repository');
  const snapshotPath = valueFrom(block, 'path');
  const licenseField = valueFrom(block, 'license_files');
  const licenseFiles = licenseField.split(',').map((item) => item.trim()).filter(Boolean);

  const detected = [];
  for (const licenseFile of licenseFiles) {
    const full = path.join(root, snapshotPath, licenseFile);
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
      detected.push({ file: licenseFile, exists: false, classification: 'missing' });
      continue;
    }
    const text = fs.readFileSync(full, 'utf8');
    detected.push({ file: licenseFile, exists: true, classification: classifyLicenseText(text) });
  }

  const donorIndexPath = path.join(root, 'index', 'donors', `${donor}.json`);
  let assetFiles = 0;
  let assetBytes = 0;
  const assetTypes = {};
  if (fs.existsSync(donorIndexPath)) {
    const donorIndex = JSON.parse(fs.readFileSync(donorIndexPath, 'utf8'));
    for (const file of donorIndex.files ?? []) {
      if (!assetExtensions.has(String(file.ext).toLowerCase())) continue;
      assetFiles += 1;
      assetBytes += Number(file.bytes ?? 0);
      assetTypes[file.ext] = (assetTypes[file.ext] ?? 0) + 1;
    }
  }

  const hasLicenseFile = detected.some((entry) => entry.exists);
  const recognized = detected.filter((entry) => entry.exists && entry.classification !== 'unclassified').map((entry) => entry.classification);
  const status = !hasLicenseFile
    ? 'review-required-no-license-file-detected'
    : recognized.length
      ? 'license-file-detected'
      : 'review-required-unclassified-license-file';

  sources[donor] = {
    repository,
    snapshotPath,
    status,
    detectedLicenseFiles: detected,
    recognizedClassifications: [...new Set(recognized)],
    assets: {
      files: assetFiles,
      bytes: assetBytes,
      extensions: assetTypes,
      separateRightsReviewRecommended: assetFiles > 0,
    },
    productionPolicy: {
      donorSourceMayInformResearch: true,
      rawRedistributionOrDerivativeUseRequiresLicenseReview: status !== 'license-file-detected',
      bundledAssetsRequireSeparateRightsReview: assetFiles > 0,
    },
  };
}

const missingLicense = Object.entries(sources)
  .filter(([, source]) => source.status === 'review-required-no-license-file-detected')
  .map(([donor]) => donor);
const unclassifiedLicense = Object.entries(sources)
  .filter(([, source]) => source.status === 'review-required-unclassified-license-file')
  .map(([donor]) => donor);
const assetHeavy = Object.entries(sources)
  .filter(([, source]) => source.assets.files > 0)
  .sort((a, b) => b[1].assets.bytes - a[1].assets.bytes)
  .map(([donor, source]) => ({ donor, files: source.assets.files, bytes: source.assets.bytes }));

const report = {
  version: 1,
  sourceGeneratedAt: generatedAt,
  disclaimer: 'Automated provenance signal only. This is not legal advice and does not determine whether a particular use is permitted.',
  policy: {
    missingLicenseFile: 'review-required',
    unclassifiedLicenseFile: 'review-required',
    assets: 'review separately from source-code license before redistribution/commercial production use',
    normalizedImplementations: 'preserve provenance and avoid assuming donor license covers third-party/bundled assets',
  },
  summary: {
    donors: Object.keys(sources).length,
    withDetectedLicenseFile: Object.values(sources).filter((source) => source.status === 'license-file-detected').length,
    missingLicenseFile,
    unclassifiedLicense,
    donorsWithBundledAssets: assetHeavy.length,
  },
  sources,
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + '\n');

const md = [
  '# IMON MOTION License / Asset Status',
  '',
  '> Automated provenance signal only. This is not legal advice and does not determine whether a particular use is permitted.',
  '',
  `Snapshot source timestamp: ${generatedAt ?? 'unknown'}`,
  '',
  '## Summary',
  '',
  `- Donors: **${report.summary.donors}**`,
  `- Donors with a detected license file: **${report.summary.withDetectedLicenseFile}**`,
  `- No license file detected: **${missingLicense.length ? missingLicense.join(', ') : 'none'}**`,
  `- Present but unclassified license file: **${unclassifiedLicense.length ? unclassifiedLicense.join(', ') : 'none'}**`,
  `- Donors containing bundled media/font/3D/PDF assets: **${assetHeavy.length}**`,
  '',
  '## Policy',
  '',
  '- A public GitHub repository is not treated as automatically granting redistribution/derivative rights.',
  '- Missing or unclassified license files are `review-required`.',
  '- Bundled images, audio, video, fonts, 3D models, and PDFs are reviewed separately before redistribution or commercial production use.',
  '- IMON-native normalized implementations keep donor provenance but should not silently copy donor assets.',
  '',
  '## Donors',
  '',
  '| Donor | License status | Detected classification | Bundled assets | Asset bytes |',
  '|---|---|---|---:|---:|',
];
for (const [donor, source] of Object.entries(sources)) {
  md.push(`| \`${donor}\` | ${source.status} | ${source.recognizedClassifications.join(', ') || '—'} | ${source.assets.files} | ${source.assets.bytes} |`);
}
md.push('', 'See `provenance/LICENSE-STATUS.json` for machine-readable details.', '');
fs.writeFileSync(outMd, md.join('\n'));

console.log(`License audit: ${Object.keys(sources).length} donors; ${missingLicense.length} missing license file(s); ${assetHeavy.length} donor(s) with bundled assets.`);
