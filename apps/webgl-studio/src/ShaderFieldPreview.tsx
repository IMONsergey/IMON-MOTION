import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Vector2} from 'three';
import {SHADER_FIELD_FRAGMENT, SHADER_FIELD_VERTEX, shaderFieldUniforms} from '../../../adapters/webgl/src/shader-field';

export const ShaderFieldPreview = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const values = shaderFieldUniforms({
    frame,
    fps,
    width,
    height,
    config: {speed: 0.72, seed: 11.4, amplitude: 0.88, detail: 1.1},
  });
  const uniforms = {
    uTime: {value: values.uTime},
    uSeed: {value: values.uSeed},
    uAmplitude: {value: values.uAmplitude},
    uDetail: {value: values.uDetail},
    uResolution: {value: new Vector2(values.uResolution[0], values.uResolution[1])},
  };

  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{fov: 66, position: [0, 0, 1.7], near: 0.1, far: 10}}
    >
      <mesh>
        <planeGeometry args={[3.65, 2.08, 1, 1]} />
        <shaderMaterial
          vertexShader={SHADER_FIELD_VERTEX}
          fragmentShader={SHADER_FIELD_FRAGMENT}
          uniforms={uniforms}
          toneMapped={false}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </ThreeCanvas>
  );
};
