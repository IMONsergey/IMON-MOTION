import { Composition } from 'remotion';
import { SystemPreview } from './SystemPreview';

export const RemotionRoot = () => (
  <>
    <Composition
      id="IMONSystemPreview"
      component={SystemPreview}
      durationInFrames={360}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
