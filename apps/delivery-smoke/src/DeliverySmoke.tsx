import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {HeroSettle, MotionScene, PrecisionReveal} from '@imon-motion/remotion-kit';

export const DeliverySmoke = () => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [22, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <MotionScene background="#090a0d" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
      <AbsoluteFill style={{padding: 48, justifyContent: 'center'}}>
        <PrecisionReveal delay={2} travelPx={5}>
          <div style={{fontSize: 11, letterSpacing: '0.14em', opacity: 0.42}}>IMON MOTION / DELIVERY PROOF</div>
        </PrecisionReveal>
        <HeroSettle delay={7}>
          <div style={{fontSize: 54, lineHeight: 0.94, letterSpacing: '-0.065em', maxWidth: 520, marginTop: 14, fontWeight: 670}}>
            Brief → runtime → render.
          </div>
        </HeroSettle>
        <div style={{marginTop: 26, width: 320, height: 2, background: 'rgba(255,255,255,.12)', overflow: 'hidden'}}>
          <div style={{width: `${line * 100}%`, height: '100%', background: 'rgba(235,240,255,.82)'}} />
        </div>
      </AbsoluteFill>
    </MotionScene>
  );
};
