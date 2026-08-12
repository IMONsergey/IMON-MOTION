import assert from 'node:assert/strict';
import test from 'node:test';
import { buildQaPlan, buildStoryboardSkeleton, routeBrief } from '../src/index.js';

test('routes a premium 3D product launch into cinematic donors, primitives and requested duration', () => {
  const route = routeBrief('Create a 35 second Apple-like premium product launch with a controlled 3D orbit, UI details and cinematic sound.');

  assert.equal(route.brief.videoType, 'product-launch');
  assert.equal(route.brief.dimensionality, '3d');
  assert.equal(route.brief.quality, 'hero-film');
  assert.equal(route.brief.delivery?.durationSeconds, 35);
  assert.ok(route.brief.styles.includes('premium-minimal'));
  assert.ok(route.capabilities.includes('cinematography'));
  assert.ok(route.capabilities.includes('three-d'));
  assert.ok(route.donors.includes('video-shotcraft'));
  assert.ok(route.primitives.some((primitive) => primitive.id === 'camera.product-orbit'));

  const storyboard = buildStoryboardSkeleton(route);
  assert.equal(storyboard.durationInFrames, 35 * 30);
});

test('routes a SaaS interface demo toward UI motion without forcing 3D', () => {
  const route = routeBrief('Make a restrained SaaS UI demo: real interface, cursor interaction, clean zooms, no flashy effects.');

  assert.equal(route.brief.videoType, 'ui-demo');
  assert.equal(route.brief.dimensionality, '2d');
  assert.ok(route.capabilities.includes('ui-motion'));
  assert.ok(route.donors.includes('remotion-cinematic'));
  assert.ok(route.primitives.some((primitive) => primitive.id === 'ui.cursor-focus'));
});

test('extracts vertical 4K delivery constraints from a Russian social-video brief', () => {
  const route = routeBrief('Сделай 24-секундный динамичный ролик для Reels, вертикальный 9:16, 4K, 60 fps, с кинетической типографикой.');

  assert.equal(route.brief.videoType, 'social');
  assert.equal(route.brief.delivery?.durationSeconds, 24);
  assert.equal(route.brief.delivery?.aspectRatio, '9:16');
  assert.equal(route.brief.delivery?.width, 2160);
  assert.equal(route.brief.delivery?.height, 3840);
  assert.equal(route.brief.delivery?.fps, 60);
  assert.equal(route.brief.delivery?.platform, 'Instagram Reels');
  assert.ok(route.capabilities.includes('kinetic-typography'));

  const storyboard = buildStoryboardSkeleton(route);
  assert.equal(storyboard.fps, 60);
  assert.equal(storyboard.durationInFrames, 24 * 60);
});

test('builds a complete storyboard that exactly fills the requested duration', () => {
  const route = routeBrief({
    videoType: 'product-launch',
    styles: ['premium-minimal'],
    energy: 'controlled',
    dimensionality: '2.5d',
    camera: 'spatial',
    audio: 'mixed',
    quality: 'hero-film',
  });
  const storyboard = buildStoryboardSkeleton(route, 30, 30);

  assert.equal(storyboard.durationInFrames, 900);
  assert.equal(storyboard.beats.length, 6);
  assert.equal(storyboard.beats[0].startFrame, 0);
  const total = storyboard.beats.reduce((sum, beat) => sum + beat.durationInFrames, 0);
  assert.equal(total, 900);
  assert.ok(storyboard.beats.every((beat) => beat.primitiveIds.length > 0));
});

test('creates hero-film QA samples and capability-aware required checks', () => {
  const route = routeBrief('Apple-like hero product launch with UI, 3D camera orbit and cinematic sound.');
  const storyboard = buildStoryboardSkeleton(route, 30, 30);
  const qa = buildQaPlan(route, storyboard);

  assert.equal(qa.quality, 'hero-film');
  assert.equal(qa.finalRenderRequired, true);
  assert.equal(qa.sampleFrames.length, storyboard.beats.length * 3);
  assert.ok(qa.checks.some((item) => item.id === 'camera-purpose'));
  assert.ok(qa.checks.some((item) => item.id === 'final-render-validation'));
  assert.ok(qa.checks.some((item) => item.id === 'anti-ai-slop'));
});
