import {Composition} from 'remotion';
import {DeliverySmoke} from './DeliverySmoke';

export const DeliveryRoot = () => (
  <Composition
    id="IMONDeliverySmoke"
    component={DeliverySmoke}
    durationInFrames={90}
    fps={30}
    width={640}
    height={360}
  />
);
