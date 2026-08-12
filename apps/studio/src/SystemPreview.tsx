import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  Camera2D,
  DepthPlane,
  HeroSettle,
  KineticWords,
  MotionScene,
  PrecisionReveal,
  ProductFrame,
} from '@imon-motion/remotion-kit';

const FONT = 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const sceneOpacity = (frame: number, duration: number): number =>
  interpolate(frame, [0, 8, duration - 10, duration - 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const PreviewScene = ({ children, background = '#070707', duration = 90 }: {
  children: ReactNode;
  background?: string;
  duration?: number;
}) => {
  const frame = useCurrentFrame();
  return (
    <MotionScene
      background={background}
      style={{
        opacity: sceneOpacity(frame, duration),
        fontFamily: FONT,
      }}
    >
      {children}
    </MotionScene>
  );
};

const Badge = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 38,
      padding: '0 16px',
      borderRadius: 999,
      border: '1px solid rgba(255,255,255,0.14)',
      background: 'rgba(255,255,255,0.055)',
      color: 'rgba(255,255,255,0.72)',
      fontSize: 18,
      letterSpacing: '-0.01em',
    }}
  >
    {children}
  </div>
);

const HeroScene = () => (
  <PreviewScene>
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle at 50% 44%, rgba(255,255,255,0.075), transparent 34%)',
      }}
    >
      <div style={{ width: 1420, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <PrecisionReveal delay={3} travelPx={8}>
          <Badge>IMON MOTION / SYSTEM PREVIEW</Badge>
        </PrecisionReveal>
        <HeroSettle delay={8}>
          <div
            style={{
              fontSize: 126,
              lineHeight: 0.92,
              letterSpacing: '-0.065em',
              fontWeight: 620,
              textAlign: 'center',
            }}
          >
            Motion is a system.
          </div>
        </HeroSettle>
        <PrecisionReveal delay={24}>
          <div
            style={{
              width: 880,
              color: 'rgba(255,255,255,0.58)',
              fontSize: 30,
              lineHeight: 1.35,
              letterSpacing: '-0.025em',
              textAlign: 'center',
            }}
          >
            Route the brief. Choose the grammar. Build with normalized primitives. Inspect the result.
          </div>
        </PrecisionReveal>
      </div>
    </AbsoluteFill>
  </PreviewScene>
);

const Dot = ({ active = false }: { active?: boolean }) => (
  <div
    style={{
      width: 9,
      height: 9,
      borderRadius: 999,
      background: active ? '#f6f6f6' : 'rgba(255,255,255,0.17)',
    }}
  />
);

const UiScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pointer = interpolate(frame, [18, 56], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pointerX = interpolate(pointer, [0, 1], [1210, 1430]);
  const pointerY = interpolate(pointer, [0, 1], [690, 510]);
  const selected = frame >= Math.round(1.75 * fps);

  return (
    <PreviewScene background="#090a0c">
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Camera2D
          startFrame={0}
          from={{ x: 0, y: 18, scale: 0.965 }}
          to={{ x: -18, y: -6, scale: 1.025 }}
        >
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <DepthPlane depth={-30} parallaxX={-12} parallaxY={5}>
              <div
                style={{
                  position: 'absolute',
                  width: 1220,
                  height: 650,
                  left: '50%',
                  top: '50%',
                  marginLeft: -610,
                  marginTop: -325,
                  borderRadius: 72,
                  background: 'radial-gradient(circle at 50% 40%, rgba(108,132,255,0.13), transparent 62%)',
                  filter: 'blur(26px)',
                }}
              />
            </DepthPlane>

            <DepthPlane depth={0} parallaxX={8} parallaxY={-4}>
              <ProductFrame width={1320} aspectRatio="16 / 9" radius={24} surface="#101115">
                <div style={{ height: 66, display: 'flex', alignItems: 'center', gap: 9, padding: '0 23px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <Dot />
                  <Dot />
                  <Dot active />
                  <div style={{ marginLeft: 22, color: 'rgba(255,255,255,0.34)', fontSize: 15 }}>imon.motion / creative-director</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '245px 1fr', height: 'calc(100% - 66px)' }}>
                  <div style={{ borderRight: '1px solid rgba(255,255,255,0.07)', padding: '30px 22px' }}>
                    {['Brief', 'Direction', 'Storyboard', 'Primitives', 'Research', 'QA'].map((item, index) => (
                      <div
                        key={item}
                        style={{
                          height: 48,
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 15px',
                          borderRadius: 11,
                          color: index === 3 ? '#fff' : 'rgba(255,255,255,0.42)',
                          background: index === 3 ? 'rgba(255,255,255,0.075)' : 'transparent',
                          fontSize: 17,
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '48px 54px', display: 'flex', flexDirection: 'column', gap: 30 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 16, marginBottom: 10 }}>NORMALIZED MOTION LAYER</div>
                        <div style={{ fontSize: 48, letterSpacing: '-0.045em', fontWeight: 610 }}>Choose by intent, not by effect.</div>
                      </div>
                      <Badge>24+ primitives</Badge>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
                      {[
                        ['CAMERA', 'Product orbit', 'cinematography / 3D'],
                        ['UI', 'Cursor focus', 'interaction / proof'],
                        ['TYPE', 'Word stagger', 'hierarchy / rhythm'],
                        ['DATA', 'Metric proof', 'comparison / evidence'],
                        ['CUT', 'Depth bridge', 'continuity / space'],
                        ['SOUND', 'Impact stack', 'attention / payoff'],
                      ].map(([label, title, meta], index) => {
                        const isSelected = selected && index === 1;
                        return (
                          <div
                            key={title}
                            style={{
                              minHeight: 150,
                              padding: '22px 22px 20px',
                              borderRadius: 17,
                              border: `1px solid ${isSelected ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.075)'}`,
                              background: isSelected ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.025)',
                            }}
                          >
                            <div style={{ color: 'rgba(255,255,255,0.34)', fontSize: 13, letterSpacing: '0.08em' }}>{label}</div>
                            <div style={{ marginTop: 28, fontSize: 23, fontWeight: 560, letterSpacing: '-0.025em' }}>{title}</div>
                            <div style={{ marginTop: 7, color: 'rgba(255,255,255,0.36)', fontSize: 14 }}>{meta}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ProductFrame>
            </DepthPlane>

            <DepthPlane depth={55} parallaxX={20} parallaxY={-10}>
              <div
                style={{
                  position: 'absolute',
                  left: pointerX,
                  top: pointerY,
                  width: 24,
                  height: 30,
                  clipPath: 'polygon(0 0, 0 100%, 28% 72%, 46% 100%, 62% 91%, 45% 64%, 78% 62%)',
                  background: '#fff',
                  filter: 'drop-shadow(0 3px 7px rgba(0,0,0,0.45))',
                }}
              />
            </DepthPlane>
          </AbsoluteFill>
        </Camera2D>
      </AbsoluteFill>
    </PreviewScene>
  );
};

const TypeScene = () => {
  const frame = useCurrentFrame();
  const ruleWidth = interpolate(frame, [10, 62], [0, 1220], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <PreviewScene background="#f2f0eb">
      <AbsoluteFill style={{ padding: '112px 122px', color: '#0a0a0a', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(0,0,0,0.42)', fontSize: 17, letterSpacing: '0.08em' }}>
          <span>03 / TYPOGRAPHY</span>
          <span>ONE DOMINANT MOTION IDEA</span>
        </div>

        <div style={{ width: 1500 }}>
          <KineticWords
            text="ROUTE. DIRECT. BUILD. VERIFY."
            delay={8}
            stagger="editorial"
            style={{ fontSize: 118, lineHeight: 0.94, letterSpacing: '-0.07em', fontWeight: 700 }}
            wordStyle={{ whiteSpace: 'nowrap' }}
          />
          <div style={{ width: ruleWidth, height: 2, background: '#0a0a0a', marginTop: 42 }} />
          <PrecisionReveal delay={42} travelPx={7}>
            <div style={{ marginTop: 28, width: 850, fontSize: 27, lineHeight: 1.35, letterSpacing: '-0.025em', color: 'rgba(0,0,0,0.55)' }}>
              The system narrows thousands of donor files into a small, purposeful production context.
            </div>
          </PrecisionReveal>
        </div>
      </AbsoluteFill>
    </PreviewScene>
  );
};

const EndScene = () => (
  <PreviewScene>
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
        <HeroSettle delay={6}>
          <div style={{ fontSize: 144, lineHeight: 0.9, fontWeight: 680, letterSpacing: '-0.075em' }}>IMON MOTION</div>
        </HeroSettle>
        <PrecisionReveal delay={24} travelPx={6}>
          <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: 22, letterSpacing: '0.08em' }}>
            CONTEXT → DIRECTION → MOTION → QA
          </div>
        </PrecisionReveal>
      </div>
    </AbsoluteFill>
  </PreviewScene>
);

export const SystemPreview = () => (
  <AbsoluteFill style={{ background: '#070707' } as CSSProperties}>
    <Sequence from={0} durationInFrames={90}>
      <HeroScene />
    </Sequence>
    <Sequence from={90} durationInFrames={90}>
      <UiScene />
    </Sequence>
    <Sequence from={180} durationInFrames={90}>
      <TypeScene />
    </Sequence>
    <Sequence from={270} durationInFrames={90}>
      <EndScene />
    </Sequence>
  </AbsoluteFill>
);
