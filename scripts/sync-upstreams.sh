#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UPSTREAM_ROOT="$ROOT/upstream"
PROVENANCE_ROOT="$ROOT/provenance"
LOCK_FILE="$PROVENANCE_ROOT/SOURCES.lock.yaml"
ERROR_FILE="$PROVENANCE_ROOT/IMPORT_ERRORS.md"
TMP_ROOT="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_ROOT"
}
trap cleanup EXIT

mkdir -p "$UPSTREAM_ROOT" "$PROVENANCE_ROOT"
rm -f "$ERROR_FILE"

# name|repository|clone-url
DONORS=(
  "video-shotcraft|Vincentwei1021/video-shotcraft|https://github.com/Vincentwei1021/video-shotcraft.git"
  "onda|degueba/onda|https://github.com/degueba/onda.git"
  "motion-skills|iart-ai/motion-skills|https://github.com/iart-ai/motion-skills.git"
  "motion-design-skill|LottieFiles/motion-design-skill|https://github.com/LottieFiles/motion-design-skill.git"
  "emilkowalski-skills|emilkowalski/skills|https://github.com/emilkowalski/skills.git"
  "claude-remotion-skill|haidrrrry/claude-remotion-skill|https://github.com/haidrrrry/claude-remotion-skill.git"
  "remotion-skills|remotion-dev/skills|https://github.com/remotion-dev/skills.git"
  "product-launch-video-skill|memex-lab/product-launch-video-skill|https://github.com/memex-lab/product-launch-video-skill.git"
  "remotion-cinematic|codeverbojan/remotion-cinematic|https://github.com/codeverbojan/remotion-cinematic.git"
  "chuk-motion|IBM/chuk-motion|https://github.com/IBM/chuk-motion.git"
  "skill-remotion-geist|vercel-labs/skill-remotion-geist|https://github.com/vercel-labs/skill-remotion-geist.git"
  "remotion-scenes|lifeprompt-team/remotion-scenes|https://github.com/lifeprompt-team/remotion-scenes.git"
  "remotion-templates|reactvideoeditor/remotion-templates|https://github.com/reactvideoeditor/remotion-templates.git"
  "motion-canvas-examples|motion-canvas/examples|https://github.com/motion-canvas/examples.git"
  "theatre|theatre-js/theatre|https://github.com/theatre-js/theatre.git"
)

LOCK_TMP="$TMP_ROOT/SOURCES.lock.yaml"
{
  echo "version: 1"
  echo "generated_at: \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\""
  echo "sources:"
} > "$LOCK_TMP"

FAILURES=()

for donor in "${DONORS[@]}"; do
  IFS='|' read -r name repo url <<< "$donor"
  clone_dir="$TMP_ROOT/$name"
  dest="$UPSTREAM_ROOT/$name"

  echo "::group::Sync $name ($repo)"

  if ! git clone --depth 1 --recurse-submodules --shallow-submodules "$url" "$clone_dir"; then
    echo "Failed to clone $repo" >&2
    FAILURES+=("$name|$repo|clone failed")
    echo "::endgroup::"
    continue
  fi

  sha="$(git -C "$clone_dir" rev-parse HEAD)"
  branch="$(git -C "$clone_dir" symbolic-ref --quiet --short HEAD || printf 'detached')"
  commit_date="$(git -C "$clone_dir" show -s --format=%cI HEAD)"

  # LFS is normally smudged during clone. Explicit pull covers runners/configs where it is not.
  if command -v git-lfs >/dev/null 2>&1; then
    git -C "$clone_dir" lfs pull || true
  fi

  # Remove Git metadata from the vendored snapshot, including submodule .git files.
  rm -rf "$clone_dir/.git"
  find "$clone_dir" -mindepth 2 -name .git -exec rm -rf {} + 2>/dev/null || true

  mkdir -p "$dest"
  rsync -a --delete "$clone_dir/" "$dest/"

  file_count="$(find "$dest" -type f | wc -l | tr -d ' ')"
  size_kb="$(du -sk "$dest" | awk '{print $1}')"

  license_files="$(find "$dest" -maxdepth 2 -type f \( -iname 'LICENSE' -o -iname 'LICENSE.*' -o -iname 'COPYING' -o -iname 'COPYING.*' -o -iname 'NOTICE' -o -iname 'NOTICE.*' \) -printf '%P\n' 2>/dev/null | sort | paste -sd ',' -)"

  {
    echo "  $name:"
    echo "    repository: \"$repo\""
    echo "    url: \"$url\""
    echo "    commit: \"$sha\""
    echo "    branch: \"$branch\""
    echo "    upstream_commit_date: \"$commit_date\""
    echo "    path: \"upstream/$name\""
    echo "    files: $file_count"
    echo "    size_kb: $size_kb"
    if [[ -n "$license_files" ]]; then
      echo "    license_files: \"$license_files\""
    else
      echo "    license_files: \"\""
    fi
  } >> "$LOCK_TMP"

  echo "Imported $repo @ $sha ($file_count files, ${size_kb}KB)"
  echo "::endgroup::"
done

mv "$LOCK_TMP" "$LOCK_FILE"

if ((${#FAILURES[@]} > 0)); then
  {
    echo "# Upstream import errors"
    echo
    echo "The following donors could not be imported during this sync:"
    echo
    for failure in "${FAILURES[@]}"; do
      IFS='|' read -r name repo reason <<< "$failure"
      echo "- **$name** — \`$repo\`: $reason"
    done
  } > "$ERROR_FILE"

  echo "One or more upstream donors failed to import." >&2
  printf ' - %s\n' "${FAILURES[@]}" >&2
  exit 1
fi

# GitHub rejects normal Git objects above 100 MiB. Detect before the workflow attempts a push.
mapfile -t TOO_LARGE < <(find "$UPSTREAM_ROOT" -type f -size +95M -print)
if ((${#TOO_LARGE[@]} > 0)); then
  {
    echo "# Oversized upstream files"
    echo
    echo "Files larger than 95 MiB require an explicit storage decision before they can be committed to GitHub:"
    echo
    printf -- '- `%s`\n' "${TOO_LARGE[@]#$ROOT/}"
  } > "$ERROR_FILE"
  printf 'Oversized files detected:\n%s\n' "${TOO_LARGE[*]}" >&2
  exit 2
fi

echo "All ${#DONORS[@]} upstream donors synchronized successfully."
