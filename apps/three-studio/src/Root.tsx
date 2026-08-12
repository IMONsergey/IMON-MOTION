import {Composition} from 'remotion';
import {ProductOrbit3DPreview} from './ProductOrbit3DPreview';

export const ThreeStudioRoot = () => (
  <>
    <Composition
      id="IMONProductOrbit3D"
      component={ProductOrbit3DPreview}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
