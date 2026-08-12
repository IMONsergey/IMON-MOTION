import assert from 'node:assert/strict';
import test from 'node:test';
import { cinematicEase, distanceToTarget, frameProgress, productOrbitPose, productOrbitPoseAtFrame } from '../src/orbit';

test('cinematic orbit easing is clamped, monotonic at key samples and settles at both ends', () => {
  assert.equal(cinematicEase(-1), 0);
  assert.equal(cinematicEase(0), 0);
  assert.equal(cinematicEase(1), 1);
  assert.equal(cinematicEase(2), 1);
  const samples = [0, 0.2, 0.4, 0.6, 0.8, 1].map(cinematicEase);
  for (let index = 1; index < samples.length; index += 1) assert.ok(samples[index] >= samples[index - 1]);
});

test('product orbit is deterministic and maintains a valid camera distance', () => {
  const config = { radius: 5, startAzimuth: -0.5, endAzimuth: 0.5, startRadiusScale: 1, endRadiusScale: 1 } as const;
  const a = productOrbitPose(0.5, config);
  const b = productOrbitPose(0.5, config);
  assert.deepEqual(a, b);
  assert.ok(Math.abs(distanceToTarget(a) - 5) < 1e-9);
  assert.deepEqual(a.target, { x: 0, y: 0, z: 0 });
});

test('frame binding clamps before and after the authored camera move', () => {
  assert.equal(frameProgress({ frame: 0, startFrame: 30, durationInFrames: 60 }), 0);
  assert.equal(frameProgress({ frame: 60, startFrame: 30, durationInFrames: 60 }), 0.5);
  assert.equal(frameProgress({ frame: 120, startFrame: 30, durationInFrames: 60 }), 1);
  assert.throws(() => frameProgress({ frame: 0, startFrame: 0, durationInFrames: 0 }), /positive/);

  const before = productOrbitPoseAtFrame({ frame: 0, startFrame: 30, durationInFrames: 60 });
  const start = productOrbitPoseAtFrame({ frame: 30, startFrame: 30, durationInFrames: 60 });
  assert.deepEqual(before, start);
});
