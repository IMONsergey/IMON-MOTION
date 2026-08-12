import assert from 'node:assert/strict';
import test from 'node:test';
import {analyzeAudioEnergy, eventsToFrames, strongestEvents} from '../src/index';

const syntheticImpulses = ({
  sampleRate = 8000,
  durationSeconds = 3,
  impulseTimes = [0.5, 1.0, 1.5, 2.0, 2.5],
}: {
  sampleRate?: number;
  durationSeconds?: number;
  impulseTimes?: number[];
} = {}) => {
  const samples = new Float32Array(Math.round(sampleRate * durationSeconds));
  for (const time of impulseTimes) {
    const start = Math.round(time * sampleRate);
    for (let index = 0; index < 90 && start + index < samples.length; index += 1) {
      const envelope = Math.exp(-index / 18);
      samples[start + index] += Math.sin((index / sampleRate) * Math.PI * 2 * 220) * envelope;
    }
  }
  return {samples, sampleRate, impulseTimes};
};

test('detects repeated synthetic transients near authored event times', () => {
  const {samples, sampleRate, impulseTimes} = syntheticImpulses();
  const analysis = analyzeAudioEnergy(samples, sampleRate, {
    windowSize: 256,
    hopSize: 64,
    smoothingFrames: 4,
    thresholdMultiplier: 1.4,
    minEventSpacingSeconds: 0.22,
  });

  assert.equal(analysis.durationSeconds, 3);
  assert.ok(analysis.events.length >= impulseTimes.length - 1, `expected >= ${impulseTimes.length - 1} events, got ${analysis.events.length}`);
  for (const authored of impulseTimes) {
    const closest = analysis.events.reduce((best, event) => Math.abs(event.timeSeconds - authored) < Math.abs(best.timeSeconds - authored) ? event : best);
    assert.ok(Math.abs(closest.timeSeconds - authored) < 0.08, `event near ${authored}s was not detected; closest=${closest.timeSeconds}`);
  }
});

test('maps audio events to deterministic Remotion frames', () => {
  const frames = eventsToFrames([
    {timeSeconds: 0.5, strength: 0.8, sourceFrame: 1},
    {timeSeconds: 1.25, strength: 1, sourceFrame: 2},
  ], 60);
  assert.deepEqual(frames.map((event) => event.frame), [30, 75]);
  assert.throws(() => eventsToFrames([], 0), /positive/);
});

test('selects strongest events while returning chronological order', () => {
  const events = [
    {timeSeconds: 1, strength: 0.4, sourceFrame: 1},
    {timeSeconds: 2, strength: 0.95, sourceFrame: 2},
    {timeSeconds: 3, strength: 0.8, sourceFrame: 3},
    {timeSeconds: 4, strength: 0.2, sourceFrame: 4},
  ];
  assert.deepEqual(strongestEvents(events, 2).map((event) => event.timeSeconds), [2, 3]);
});
