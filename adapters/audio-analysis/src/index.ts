export type AudioAnalysisConfig = {
  windowSize?: number;
  hopSize?: number;
  smoothingFrames?: number;
  thresholdMultiplier?: number;
  minEventSpacingSeconds?: number;
};

export type EnergyFrame = {
  index: number;
  sampleOffset: number;
  timeSeconds: number;
  rms: number;
  smoothedRms: number;
  novelty: number;
};

export type AudioEvent = {
  timeSeconds: number;
  strength: number;
  sourceFrame: number;
};

export type AudioAnalysis = {
  sampleRate: number;
  durationSeconds: number;
  config: Required<AudioAnalysisConfig>;
  energy: EnergyFrame[];
  events: AudioEvent[];
};

const defaults = (sampleRate: number, config: AudioAnalysisConfig): Required<AudioAnalysisConfig> => ({
  windowSize: config.windowSize ?? 1024,
  hopSize: config.hopSize ?? 512,
  smoothingFrames: config.smoothingFrames ?? 6,
  thresholdMultiplier: config.thresholdMultiplier ?? 2.4,
  minEventSpacingSeconds: config.minEventSpacingSeconds ?? 0.12,
});

const validate = (samples: Float32Array, sampleRate: number, config: Required<AudioAnalysisConfig>) => {
  if (!(samples instanceof Float32Array)) throw new Error('samples must be a Float32Array');
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) throw new Error('sampleRate must be positive');
  if (!Number.isInteger(config.windowSize) || config.windowSize < 32) throw new Error('windowSize must be an integer >= 32');
  if (!Number.isInteger(config.hopSize) || config.hopSize < 1) throw new Error('hopSize must be a positive integer');
  if (!Number.isInteger(config.smoothingFrames) || config.smoothingFrames < 1) throw new Error('smoothingFrames must be positive');
  if (config.thresholdMultiplier <= 0) throw new Error('thresholdMultiplier must be positive');
  if (config.minEventSpacingSeconds < 0) throw new Error('minEventSpacingSeconds cannot be negative');
};

const rms = (samples: Float32Array, start: number, length: number): number => {
  const end = Math.min(samples.length, start + length);
  if (end <= start) return 0;
  let sum = 0;
  for (let index = start; index < end; index += 1) {
    const sample = samples[index];
    sum += sample * sample;
  }
  return Math.sqrt(sum / (end - start));
};

const movingAverage = (values: number[], index: number, radius: number): number => {
  const start = Math.max(0, index - radius);
  const end = Math.min(values.length - 1, index + radius);
  let sum = 0;
  for (let cursor = start; cursor <= end; cursor += 1) sum += values[cursor];
  return sum / Math.max(1, end - start + 1);
};

const localMeanBefore = (values: number[], index: number, frames: number): number => {
  const start = Math.max(0, index - frames);
  if (start === index) return 0;
  let sum = 0;
  for (let cursor = start; cursor < index; cursor += 1) sum += values[cursor];
  return sum / Math.max(1, index - start);
};

const median = (values: number[]): number => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

export const analyzeAudioEnergy = (
  samples: Float32Array,
  sampleRate: number,
  inputConfig: AudioAnalysisConfig = {},
): AudioAnalysis => {
  const config = defaults(sampleRate, inputConfig);
  validate(samples, sampleRate, config);
  if (!samples.length) {
    return {sampleRate, durationSeconds: 0, config, energy: [], events: []};
  }

  const raw: number[] = [];
  const offsets: number[] = [];
  for (let offset = 0; offset < samples.length; offset += config.hopSize) {
    offsets.push(offset);
    raw.push(rms(samples, offset, config.windowSize));
  }

  const smoothed = raw.map((_, index) => movingAverage(raw, index, Math.max(1, Math.floor(config.smoothingFrames / 2))));
  const novelty = raw.map((value, index) => Math.max(0, value - localMeanBefore(smoothed, index, config.smoothingFrames * 2)));
  const positiveNovelty = novelty.filter((value) => value > 0);
  const floor = median(positiveNovelty);
  const deviations = positiveNovelty.map((value) => Math.abs(value - floor));
  const mad = median(deviations);
  const threshold = floor + Math.max(1e-8, mad) * config.thresholdMultiplier;
  const maxNovelty = Math.max(threshold, ...novelty);

  const energy: EnergyFrame[] = raw.map((value, index) => ({
    index,
    sampleOffset: offsets[index],
    timeSeconds: offsets[index] / sampleRate,
    rms: value,
    smoothedRms: smoothed[index],
    novelty: novelty[index],
  }));

  const events: AudioEvent[] = [];
  let lastTime = -Infinity;
  for (let index = 1; index < novelty.length - 1; index += 1) {
    const value = novelty[index];
    const isPeak = value >= novelty[index - 1] && value > novelty[index + 1];
    if (!isPeak || value < threshold) continue;
    const timeSeconds = offsets[index] / sampleRate;
    if (timeSeconds - lastTime < config.minEventSpacingSeconds) {
      const previous = events[events.length - 1];
      if (previous && value / maxNovelty > previous.strength) {
        previous.timeSeconds = timeSeconds;
        previous.strength = Math.min(1, value / maxNovelty);
        previous.sourceFrame = index;
        lastTime = timeSeconds;
      }
      continue;
    }
    events.push({
      timeSeconds,
      strength: Math.min(1, value / maxNovelty),
      sourceFrame: index,
    });
    lastTime = timeSeconds;
  }

  return {
    sampleRate,
    durationSeconds: samples.length / sampleRate,
    config,
    energy,
    events,
  };
};

export const eventsToFrames = (
  events: AudioEvent[],
  fps: number,
): Array<AudioEvent & {frame: number}> => {
  if (!Number.isFinite(fps) || fps <= 0) throw new Error('fps must be positive');
  return events.map((event) => ({...event, frame: Math.max(0, Math.round(event.timeSeconds * fps))}));
};

export const strongestEvents = (events: AudioEvent[], limit = 16): AudioEvent[] => {
  if (!Number.isInteger(limit) || limit < 0) throw new Error('limit must be a non-negative integer');
  return [...events]
    .sort((a, b) => b.strength - a.strength || a.timeSeconds - b.timeSeconds)
    .slice(0, limit)
    .sort((a, b) => a.timeSeconds - b.timeSeconds);
};
