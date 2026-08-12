import {Composition} from 'remotion';
import {ShaderFieldPreview} from './ShaderFieldPreview';

export const WebGLStudioRoot = () => (
  <>
    <Composition
      id="IMONShaderField"
      component={ShaderFieldPreview}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
