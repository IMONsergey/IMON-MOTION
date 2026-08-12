import assert from 'node:assert/strict';
import test from 'node:test';
import {
  anchorPoint,
  buildCursorCurve,
  cubicBezierPoint,
  cursorPointForElement,
  validateCaptureManifest,
  type CaptureManifest,
} from '../src/index';

const manifest: CaptureManifest = {
  version: 1,
  source: 'fixture://product',
  viewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  privacyReviewed: true,
  states: [
    {
      id: 'dashboard',
      elements: [
        { id: 'create', label: 'Create', role: 'button', safeToShow: true, rect: { x: 1100, y: 90, width: 180, height: 54 } },
        { id: 'secret', safeToShow: false, rect: { x: 120, y: 120, width: 300, height: 80 } },
      ],
    },
  ],
};

test('validates production-safe capture geometry', () => {
  assert.deepEqual(validateCaptureManifest(manifest), []);
  const invalid = { ...manifest, privacyReviewed: false };
  assert.ok(validateCaptureManifest(invalid).some((failure) => failure.includes('privacy-reviewed')));
});

test('resolves exact element anchors for cursor choreography', () => {
  assert.deepEqual(cursorPointForElement({ manifest, stateId: 'dashboard', elementId: 'create' }), { x: 1190, y: 117 });
  assert.deepEqual(anchorPoint({ x: 100, y: 200, width: 80, height: 40 }, 'bottom-right', 5), { x: 175, y: 235 });
  assert.throws(() => cursorPointForElement({ manifest, stateId: 'dashboard', elementId: 'secret' }), /unsafe to show/);
});

test('builds deterministic curved pointer paths', () => {
  const curve = buildCursorCurve({ from: { x: 100, y: 100 }, to: { x: 500, y: 300 }, curvature: 0.12 });
  assert.deepEqual(cubicBezierPoint(curve.start, curve.control1, curve.control2, curve.end, 0), { x: 100, y: 100 });
  assert.deepEqual(cubicBezierPoint(curve.start, curve.control1, curve.control2, curve.end, 1), { x: 500, y: 300 });
  const middle = cubicBezierPoint(curve.start, curve.control1, curve.control2, curve.end, 0.5);
  assert.ok(middle.x > 100 && middle.x < 500);
  assert.ok(middle.y > 100 && middle.y < 300);
});
