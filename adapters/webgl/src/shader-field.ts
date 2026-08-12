export type ShaderFieldConfig = {
  speed?: number;
  seed?: number;
  amplitude?: number;
  detail?: number;
};

export const SHADER_FIELD_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const SHADER_FIELD_FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uSeed;
uniform float uAmplitude;
uniform float uDetail;
uniform vec2 uResolution;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32 + uSeed);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float weight = 0.52;
  for (int i = 0; i < 5; i++) {
    value += noise2(p) * weight;
    p = p * (1.87 + uDetail * 0.08) + vec2(17.13, 9.27);
    weight *= 0.48;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  vec2 centered = (uv - 0.5) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  float t = uTime;

  vec2 flow = centered * 2.25;
  flow.x += sin(centered.y * 2.4 + t * 0.55) * 0.22 * uAmplitude;
  flow.y += cos(centered.x * 2.1 - t * 0.42) * 0.18 * uAmplitude;
  float fieldA = fbm(flow + vec2(t * 0.08, -t * 0.05));
  float fieldB = fbm(flow * 1.32 + vec2(-t * 0.06, t * 0.04) + 8.0);
  float ridge = smoothstep(0.36, 0.82, fieldA * 0.67 + fieldB * 0.48);

  float radial = exp(-dot(centered, centered) * 1.22);
  vec3 base = vec3(0.018, 0.022, 0.033);
  vec3 cool = vec3(0.20, 0.32, 0.78);
  vec3 light = vec3(0.72, 0.80, 1.0);
  vec3 color = base;
  color += cool * ridge * 0.48;
  color += light * pow(max(0.0, ridge * radial), 2.2) * 0.72;
  color += vec3(0.04, 0.05, 0.09) * fieldB;

  float vignette = smoothstep(1.15, 0.22, length(centered));
  color *= 0.70 + vignette * 0.40;
  gl_FragColor = vec4(color, 1.0);
}
`;

const finite = (value: number, fallback: number) => Number.isFinite(value) ? value : fallback;

export const shaderFieldUniforms = ({
  frame,
  fps,
  width,
  height,
  config = {},
}: {
  frame: number;
  fps: number;
  width: number;
  height: number;
  config?: ShaderFieldConfig;
}) => {
  if (!Number.isFinite(fps) || fps <= 0) throw new Error('fps must be positive');
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) throw new Error('resolution must be positive');
  const speed = Math.max(0, finite(config.speed ?? 1, 1));
  return {
    uTime: Math.max(0, frame) / fps * speed,
    uSeed: finite(config.seed ?? 7.31, 7.31),
    uAmplitude: Math.max(0, finite(config.amplitude ?? 1, 1)),
    uDetail: Math.max(0, finite(config.detail ?? 1, 1)),
    uResolution: [width, height] as const,
  };
};
