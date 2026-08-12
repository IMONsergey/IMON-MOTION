import assert from 'node:assert/strict';
import test from 'node:test';
import {routeBrief} from '../src/index.js';

test('respects explicit no-audio and no-3D constraints', () => {
  const route = routeBrief('8 second production UI demo, real interface, 1920x1080, 30 fps, no 3D, no audio, restrained motion.');
  assert.equal(route.brief.videoType, 'ui-demo');
  assert.equal(route.brief.dimensionality, '2d');
  assert.equal(route.brief.audio, 'none');
  assert.ok(!route.capabilities.includes('three-d'));
  assert.ok(!route.capabilities.includes('webgl'));
});

test('respects Russian negative spatial and sound constraints', () => {
  const route = routeBrief('Сделай 10-секундное демо интерфейса без 3D и без музыки, спокойно и чисто.');
  assert.equal(route.brief.dimensionality, '2d');
  assert.equal(route.brief.audio, 'none');
});

test('does not let negated WebGL override an otherwise 2D brief', () => {
  const route = routeBrief('Editorial typography film, without WebGL or shaders, 12 seconds, no sound.');
  assert.notEqual(route.brief.dimensionality, 'webgl');
  assert.equal(route.brief.audio, 'none');
});
