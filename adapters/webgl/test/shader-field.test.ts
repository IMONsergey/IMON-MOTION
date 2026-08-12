import assert from 'node:assert/strict';
import test from 'node:test';
import {SHADER_FIELD_FRAGMENT, SHADER_FIELD_VERTEX, shaderFieldUniforms} from '../src/shader-field';

test('shader sources expose deterministic Remotion-controlled uniforms', () => {
  for (const required of ['uTime', 'uSeed', 'uAmplitude', 'uDetail', 'uResolution']) {
    assert.ok(SHADER_FIELD_FRAGMENT.includes(required), `fragment shader missing ${required}`);
  }
  assert.ok(SHADER_FIELD_VERTEX.includes('vUv'));
  assert.ok(!SHADER_FIELD_FRAGMENT.includes('Math.random'));
});

test('maps frame time and resolution into stable shader uniforms', () => {
  const a = shaderFieldUniforms({frame: 60, fps: 30, width: 1920, height: 1080, config: {speed: 0.5, seed: 4.2}});
  const b = shaderFieldUniforms({frame: 60, fps: 30, width: 1920, height: 1080, config: {speed: 0.5, seed: 4.2}});
  assert.deepEqual(a, b);
  assert.equal(a.uTime, 1);
  assert.equal(a.uSeed, 4.2);
  assert.deepEqual(a.uResolution, [1920, 1080]);
});

test('rejects invalid delivery timing and resolution', () => {
  assert.throws(() => shaderFieldUniforms({frame: 0, fps: 0, width: 1920, height: 1080}), /fps/);
  assert.throws(() => shaderFieldUniforms({frame: 0, fps: 30, width: 0, height: 1080}), /resolution/);
});
