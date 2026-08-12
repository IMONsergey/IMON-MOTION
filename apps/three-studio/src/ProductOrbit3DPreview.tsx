import {useLayoutEffect} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {Color, PerspectiveCamera} from 'three';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {productOrbitPoseAtFrame} from '../../../adapters/remotion-three/src/orbit';

const CameraRig = ({durationInFrames}: {durationInFrames: number}) => {
  const frame = useCurrentFrame();
  const {camera} = useThree();
  const pose = productOrbitPoseAtFrame({
    frame,
    durationInFrames,
    config: {
      center: {x: 0, y: 0, z: 0},
      radius: 5.1,
      height: 0.05,
      startAzimuth: -0.62,
      endAzimuth: 0.46,
      startElevation: 0.12,
      endElevation: 0.20,
      startRadiusScale: 1.06,
      endRadiusScale: 0.94,
      fov: 34,
      easing: 'cinematic',
    },
  });

  useLayoutEffect(() => {
    camera.position.set(pose.position.x, pose.position.y, pose.position.z);
    camera.up.set(pose.up.x, pose.up.y, pose.up.z);
    camera.lookAt(pose.target.x, pose.target.y, pose.target.z);
    if (camera instanceof PerspectiveCamera) {
      camera.fov = pose.fov;
      camera.near = 0.1;
      camera.far = 100;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld();
  }, [camera, pose.fov, pose.position.x, pose.position.y, pose.position.z, pose.target.x, pose.target.y, pose.target.z, pose.up.x, pose.up.y, pose.up.z]);

  return null;
};

const Device = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const settle = interpolate(frame, [0, 30, durationInFrames - 1], [-0.035, 0, 0.018], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glow = interpolate(frame, [0, 55, durationInFrames - 1], [0.15, 0.48, 0.24], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <group rotation={[0.025, settle, -0.015]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.65, 2.25, 0.20]} />
        <meshStandardMaterial color={new Color('#161719')} metalness={0.78} roughness={0.28} />
      </mesh>

      <mesh position={[0, 0, 0.108]}>
        <planeGeometry args={[3.34, 1.93]} />
        <meshStandardMaterial color={new Color('#090b10')} emissive={new Color('#141c34')} emissiveIntensity={glow} roughness={0.22} />
      </mesh>

      <mesh position={[-1.20, 0.69, 0.12]}>
        <boxGeometry args={[0.52, 0.08, 0.035]} />
        <meshStandardMaterial color={new Color('#e8ebf4')} emissive={new Color('#e8ebf4')} emissiveIntensity={0.22} />
      </mesh>

      <mesh position={[-0.83, 0.37, 0.12]}>
        <boxGeometry args={[1.26, 0.055, 0.03]} />
        <meshStandardMaterial color={new Color('#5e6576')} />
      </mesh>
      <mesh position={[-0.94, 0.18, 0.12]}>
        <boxGeometry args={[1.04, 0.04, 0.03]} />
        <meshStandardMaterial color={new Color('#343a47')} />
      </mesh>

      {[0, 1, 2].map((index) => (
        <group key={index} position={[0.58 + index * 0.56, -0.34 + index * 0.13, 0.12]}>
          <mesh>
            <boxGeometry args={[0.43, 0.43, 0.035]} />
            <meshStandardMaterial
              color={new Color(index === 1 ? '#c9d5ff' : '#242a35')}
              emissive={new Color(index === 1 ? '#6680e8' : '#10131a')}
              emissiveIntensity={index === 1 ? 0.42 : 0.08}
              roughness={0.35}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[0, -1.26, -0.02]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 5]} />
        <shadowMaterial opacity={0.24} />
      </mesh>
    </group>
  );
};

export const ProductOrbit3DPreview = () => {
  const {width, height, durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: '#07080a'}}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{fov: 34, position: [0, 0, 5.3], near: 0.1, far: 100}}
        shadows
      >
        <color attach="background" args={['#07080a']} />
        <ambientLight intensity={0.32} />
        <directionalLight
          castShadow
          position={[-3.5, 5.5, 4.5]}
          intensity={3.2}
          color="#eef2ff"
        />
        <pointLight position={[4.0, 1.6, 2.8]} intensity={18} distance={12} color="#6e86ff" />
        <pointLight position={[-4.2, -1.0, 1.8]} intensity={8} distance={10} color="#b6c4ff" />
        <CameraRig durationInFrames={durationInFrames} />
        <Device />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
