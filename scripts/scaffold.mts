import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const option = (name: string): string | undefined => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const has = (name: string) => args.includes(name);

const brief = option('--brief');
const name = option('--name');
const outRootArg = option('--out-root') ?? 'projects';
if (!brief || !name) {
  console.error('Usage: tsx scripts/scaffold.mts --name <project-slug> --brief "<video brief>" [--out-root projects] [--force]');
  process.exit(1);
}

const slug = name.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
if (!slug || !/^[a-z0-9][a-z0-9._-]*$/.test(slug)) throw new Error(`Invalid project slug: ${name}`);

const root = process.cwd();
const tsxBinary = process.platform === 'win32'
  ? path.join(root, 'node_modules', '.bin', 'tsx.cmd')
  : path.join(root, 'node_modules', '.bin', 'tsx');
const plan = JSON.parse(execFileSync(tsxBinary, ['scripts/production-plan.mts', brief], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
  stdio: ['ignore', 'pipe', 'pipe'],
}));

const projectDir = path.resolve(root, outRootArg, slug);
if (fs.existsSync(projectDir) && !has('--force')) throw new Error(`Project already exists: ${path.relative(root, projectDir)}. Use --force to replace generated scaffold files.`);
fs.mkdirSync(path.join(projectDir, 'src'), {recursive: true});
fs.mkdirSync(path.join(projectDir, 'public', 'assets'), {recursive: true});
fs.mkdirSync(path.join(projectDir, 'captures'), {recursive: true});
fs.mkdirSync(path.join(projectDir, 'renders'), {recursive: true});
fs.mkdirSync(path.join(projectDir, 'qa'), {recursive: true});

const delivery = plan.classification?.delivery ?? {};
const aspect = delivery.aspectRatio ?? '16:9';
const defaults = aspect === '9:16'
  ? {width: 1080, height: 1920}
  : aspect === '1:1'
    ? {width: 1080, height: 1080}
    : {width: 1920, height: 1080};
const width = delivery.width ?? defaults.width;
const height = delivery.height ?? defaults.height;
const fps = delivery.fps ?? 30;
const durationSeconds = delivery.durationSeconds ?? 30;
const durationInFrames = Math.max(1, Math.round(durationSeconds * fps));
const compositionId = `IMON_${slug.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'MotionProject'}`;
const videoType = plan.classification?.videoType ?? 'product-launch';

const escapeTs = (value: string) => JSON.stringify(value);
const titleFromBrief = brief.length > 66 ? `${brief.slice(0, 63).trim()}…` : brief;

const visualByType: Record<string, string> = {
  'product-launch': `
    <ProductHeroScene
      eyebrow="IMON MOTION / PRODUCT"
      title=${escapeTs(titleFromBrief)}
      body="Replace this scaffold copy and visual with the routed product story."
      visual={<div style={{width:'100%',height:'100%',display:'grid',placeItems:'center',background:'linear-gradient(135deg,#11141c,#202942)'}}><div style={{fontSize:34,letterSpacing:'-0.04em',opacity:.72}}>PRODUCT VISUAL</div></div>}
    />`,
  'ui-demo': `
    <UiFeatureScene
      indexLabel="PRODUCT / FEATURE"
      title=${escapeTs(titleFromBrief)}
      body="Use approved capture states and geometry-aware choreography."
      proof="SCaffold"
      ui={<div style={{width:'100%',height:'100%',display:'grid',placeItems:'center',background:'#11141a'}}><div style={{fontSize:30,opacity:.65}}>APPROVED UI STATE</div></div>}
    />`,
  'kinetic-type': `
    <EditorialStatementScene
      statement=${escapeTs(titleFromBrief)}
      kicker="IMON MOTION / TYPE"
      footnote="Rewrite the statement after creative direction and preserve a readable final state."
    />`,
  'data-story': `
    <MotionScene background="#090a0d" style={{fontFamily:'Inter,system-ui,sans-serif'}}>
      <AbsoluteFill style={{padding:96,justifyContent:'center'}}>
        <PrecisionReveal><div style={{fontSize:18,opacity:.45,letterSpacing:'0.1em'}}>DATA STORY</div></PrecisionReveal>
        <HeroSettle delay={8}><div style={{fontSize:82,lineHeight:.96,letterSpacing:'-0.06em',maxWidth:1400,marginTop:22}}>${titleFromBrief.replace(/[&<>]/g, '')}</div></HeroSettle>
      </AbsoluteFill>
    </MotionScene>`,
};
const mainVisual = visualByType[videoType] ?? visualByType['product-launch'];

const imports = videoType === 'data-story'
  ? `import {AbsoluteFill} from 'remotion';\nimport {HeroSettle, MotionScene, PrecisionReveal} from '@imon-motion/remotion-kit';`
  : `import {ProductHeroScene, UiFeatureScene, EditorialStatementScene} from '@imon-motion/remotion-kit';`;

fs.writeFileSync(path.join(projectDir, 'src', 'Main.tsx'), `${imports}

export const Main = () => (
  ${mainVisual}
);
`);

fs.writeFileSync(path.join(projectDir, 'src', 'Root.tsx'), `import {Composition} from 'remotion';
import {Main} from './Main';

export const Root = () => (
  <Composition
    id=${escapeTs(compositionId)}
    component={Main}
    durationInFrames={${durationInFrames}}
    fps={${fps}}
    width={${width}}
    height={${height}}
  />
);
`);

fs.writeFileSync(path.join(projectDir, 'src', 'index.ts'), `import {registerRoot} from 'remotion';
import {Root} from './Root';

registerRoot(Root);
`);

const manifest = {
  version: 1,
  slug,
  compositionId,
  brief,
  videoType,
  createdAt: new Date().toISOString(),
  delivery: {width, height, fps, durationSeconds, durationInFrames, aspectRatio: aspect, platform: delivery.platform ?? null},
  runtimeSummary: plan.runtimeSummary,
  blockers: plan.blockers ?? [],
  donors: plan.donors ?? [],
  shotPatterns: plan.director?.shotGrammar?.beats?.map((beat: any) => ({beatId: beat.beatId, pattern: beat.primary?.id, transition: beat.transitionToNext?.id ?? null})) ?? [],
  files: {
    entry: 'src/index.ts',
    composition: compositionId,
    plan: 'plan.json',
    creativeDirection: 'creative-direction.md',
    storyboard: 'storyboard.json',
    qa: 'qa.json',
  },
};
fs.writeFileSync(path.join(projectDir, 'project.json'), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(projectDir, 'plan.json'), `${JSON.stringify(plan, null, 2)}\n`);
fs.writeFileSync(path.join(projectDir, 'storyboard.json'), `${JSON.stringify({storyboard: plan.storyboard, shotGrammar: plan.director?.shotGrammar}, null, 2)}\n`);
fs.writeFileSync(path.join(projectDir, 'qa.json'), `${JSON.stringify(plan.qa, null, 2)}\n`);

const primaryRules = [
  `Primary message: ${titleFromBrief}`,
  `Video type: ${videoType}`,
  `Styles: ${(plan.classification?.styles ?? []).join(', ') || 'unset'}`,
  `Energy: ${plan.classification?.energy ?? 'controlled'}`,
  `Dimensionality: ${plan.classification?.dimensionality ?? '2d'}`,
  `Camera: ${plan.classification?.camera ?? 'subtle'}`,
  `Audio: ${plan.classification?.audio ?? 'none'}`,
  `Quality: ${plan.classification?.quality ?? 'production'}`,
];
fs.writeFileSync(path.join(projectDir, 'creative-direction.md'), `# Creative Direction — ${slug}

This file is intentionally a scaffold. Final creative direction must be authored from the actual brief before substantive implementation.

## Routed starting point

${primaryRules.map((rule) => `- ${rule}`).join('\n')}

## Required decisions

- Focal rule:
- Grid / safe-area rule:
- Typography rule:
- Surface / material rule:
- Motion grammar:
- Camera rule:
- Transition rule:
- Sound rule:
- Rest / hold rule:

## Runtime blockers

${(plan.blockers ?? []).length ? (plan.blockers ?? []).map((blocker: any) => `- ${blocker.primitiveId}: ${blocker.status} (${(blocker.adapters ?? []).join(', ') || 'no adapter listed'})`).join('\n') : '- None surfaced by the current plan.'}
`);

fs.writeFileSync(path.join(projectDir, 'README.md'), `# ${slug}

Generated by IMON MOTION from a routed video brief.

## Composition

- ID: \`${compositionId}\`
- ${width}×${height}
- ${fps} fps
- ${durationSeconds}s / ${durationInFrames} frames
- type: ${videoType}

## Work order

1. Finalize \`creative-direction.md\`.
2. Review \`storyboard.json\` and shot grammar.
3. Resolve blockers in \`project.json\` before relying on specialized runtime behavior.
4. Replace scaffold content in \`src/Main.tsx\` with normalized/library/adapter implementation.
5. Use approved assets/captures under \`public/assets\` / \`captures\`.
6. Render QA samples into \`qa/\`.
7. Render delivery into \`renders/\`.

Do not copy raw donor code or assets into this project without the relevant provenance/license review.
`);

console.log(JSON.stringify({
  ok: true,
  projectDir,
  slug,
  compositionId,
  delivery: manifest.delivery,
  blockers: manifest.blockers,
  donors: manifest.donors,
  shotPatterns: manifest.shotPatterns,
}, null, 2));
