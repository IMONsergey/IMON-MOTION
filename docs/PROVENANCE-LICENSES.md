# IMON MOTION Provenance and License Status

IMON MOTION preserves complete donor snapshots for research and reproducibility. A repository being publicly readable on GitHub is not treated as automatic permission for every form of redistribution, derivative use, or commercial asset use.

## Generated audit

```bash
npm run license:audit
```

The audit reads:

- `provenance/SOURCES.lock.yaml`
- the content-aware donor indexes
- license files recorded for each snapshot
- bundled media/font/3D/PDF file inventory.

It generates:

- `provenance/LICENSE-STATUS.json`
- `provenance/LICENSE-STATUS.md`

This is an automated provenance signal, **not legal advice**.

## Status meanings

- `license-file-detected` — a recorded license file exists and its text matched a known classification signal.
- `review-required-no-license-file-detected` — the sync metadata did not find a top-level license file; do not assume rights from repository visibility.
- `review-required-unclassified-license-file` — a license file exists but the automated classifier did not confidently categorize it.

The machine report preserves exact donor/repository/snapshot references so a human review can go back to the source.

## Bundled assets

Source-code licensing and bundled asset licensing are separate questions. Images, video, audio, fonts, 3D models, PDFs, and similar files are inventoried separately.

If a donor contains bundled assets, the audit marks `bundledAssetsRequireSeparateRightsReview: true`. Production agents should prefer:

1. user-provided or user-owned assets;
2. assets with known production rights;
3. generated assets where appropriate;
4. donor assets only after the required rights review.

Do not assume a repository's code license automatically covers third-party music, SFX, screenshots, fonts, stock imagery, or embedded media.

## Normalized implementations

IMON MOTION keeps donor provenance in the semantic primitive/library/adaptor registries while production implementations live outside `upstream/**`.

This separation serves two purposes:

- donor updates can be synchronized without overwriting IMON-native code;
- agents can research a technique without silently turning the raw donor implementation or bundled asset into a production dependency.

## Sync behavior

The upstream GitHub Actions workflow regenerates the donor index and license/asset audit after synchronization. The main CI also reruns the audit before structural validation so stale or malformed provenance is treated as a build failure.
