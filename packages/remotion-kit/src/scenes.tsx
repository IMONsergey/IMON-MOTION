import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { Camera2D, DepthPlane, HeroSettle, KineticWords, MotionScene, PrecisionReveal, ProductFrame } from './primitives.js';

const SYSTEM_FONT = 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export type ProductHeroSceneProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  visual: ReactNode;
  background?: string;
  foreground?: string;
  accentSurface?: string;
  visualAspectRatio?: string;
  style?: CSSProperties;
};

/**
 * Higher-order premium product hero scene.
 * One product surface, one headline, restrained camera depth, deliberate settle.
 * Runtime implementation of catalog primitive `scene.hero-product`.
 */
export const ProductHeroScene = ({
  eyebrow,
  title,
  body,
  visual,
  background = '#080808',
  foreground = '#f5f5f3',
  accentSurface = '#111214',
  visualAspectRatio = '16 / 10',
  style,
}: ProductHeroSceneProps) => (
  <MotionScene background={background} style={{ color: foreground, fontFamily: SYSTEM_FONT, ...style }}>
    <AbsoluteFill
      style={{
        display: 'grid',
        gridTemplateColumns: '0.88fr 1.12fr',
        alignItems: 'center',
        gap: 84,
        padding: '92px 108px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: 660 }}>
        {eyebrow ? (
          <PrecisionReveal delay={3} travelPx={6}>
            <div style={{ fontSize: 17, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.44)', marginBottom: 26 }}>
              {eyebrow}
            </div>
          </PrecisionReveal>
        ) : null}
        <HeroSettle delay={7}>
          <div style={{ fontSize: 82, lineHeight: 0.95, letterSpacing: '-0.06em', fontWeight: 650 }}>
            {title}
          </div>
        </HeroSettle>
        {body ? (
          <PrecisionReveal delay={24}>
            <div style={{ marginTop: 28, maxWidth: 570, fontSize: 26, lineHeight: 1.35, letterSpacing: '-0.025em', color: 'rgba(255,255,255,0.55)' }}>
              {body}
            </div>
          </PrecisionReveal>
        ) : null}
      </div>

      <Camera2D from={{ x: 18, y: 20, scale: 0.965 }} to={{ x: -8, y: -8, scale: 1.025 }}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <DepthPlane depth={-40} parallaxX={-10} parallaxY={5}>
            <div
              style={{
                position: 'absolute',
                width: 980,
                height: 620,
                left: '50%',
                top: '50%',
                marginLeft: -490,
                marginTop: -310,
                borderRadius: 120,
                background: 'radial-gradient(circle, rgba(255,255,255,0.075), transparent 64%)',
                filter: 'blur(20px)',
              }}
            />
          </DepthPlane>
          <DepthPlane depth={0} parallaxX={10} parallaxY={-5}>
            <HeroSettle delay={12}>
              <ProductFrame width={880} aspectRatio={visualAspectRatio} surface={accentSurface}>
                {visual}
              </ProductFrame>
            </HeroSettle>
          </DepthPlane>
        </AbsoluteFill>
      </Camera2D>
    </AbsoluteFill>
  </MotionScene>
);

export type UiFeatureSceneProps = {
  indexLabel?: string;
  title: string;
  body?: string;
  ui: ReactNode;
  proof?: string;
  background?: string;
  style?: CSSProperties;
};

/** Runtime implementation of catalog primitive `scene.ui-feature`. */
export const UiFeatureScene = ({
  indexLabel = 'FEATURE',
  title,
  body,
  ui,
  proof,
  background = '#090a0c',
  style,
}: UiFeatureSceneProps) => (
  <MotionScene background={background} style={{ fontFamily: SYSTEM_FONT, ...style }}>
    <AbsoluteFill style={{ padding: '78px 92px 86px', display: 'grid', gridTemplateRows: 'auto 1fr', gap: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ maxWidth: 980 }}>
          <PrecisionReveal delay={2} travelPx={5}>
            <div style={{ fontSize: 15, letterSpacing: '0.11em', color: 'rgba(255,255,255,0.38)', marginBottom: 18 }}>{indexLabel}</div>
          </PrecisionReveal>
          <HeroSettle delay={6}>
            <div style={{ fontSize: 68, lineHeight: 0.98, letterSpacing: '-0.055em', fontWeight: 630 }}>{title}</div>
          </HeroSettle>
          {body ? (
            <PrecisionReveal delay={20}>
              <div style={{ marginTop: 20, maxWidth: 760, color: 'rgba(255,255,255,0.5)', fontSize: 23, lineHeight: 1.35, letterSpacing: '-0.02em' }}>{body}</div>
            </PrecisionReveal>
          ) : null}
        </div>
        {proof ? (
          <PrecisionReveal delay={28} travelPx={5}>
            <div style={{ border: '1px solid rgba(255,255,255,0.11)', borderRadius: 999, padding: '12px 17px', color: 'rgba(255,255,255,0.62)', fontSize: 15 }}>{proof}</div>
          </PrecisionReveal>
        ) : null}
      </div>

      <Camera2D startFrame={8} from={{ x: 0, y: 12, scale: 0.975 }} to={{ x: -10, y: -4, scale: 1.02 }}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <DepthPlane depth={0} parallaxX={8} parallaxY={-4}>
            <ProductFrame width={1460} aspectRatio="16 / 8.2" radius={24}>
              {ui}
            </ProductFrame>
          </DepthPlane>
        </AbsoluteFill>
      </Camera2D>
    </AbsoluteFill>
  </MotionScene>
);

export type EditorialStatementSceneProps = {
  statement: string;
  kicker?: string;
  footnote?: string;
  background?: string;
  foreground?: string;
  inverted?: boolean;
  style?: CSSProperties;
};

/** Runtime implementation of catalog primitive `scene.editorial-statement`. */
export const EditorialStatementScene = ({
  statement,
  kicker = 'STATEMENT',
  footnote,
  background = '#f2f0eb',
  foreground = '#0a0a0a',
  style,
}: EditorialStatementSceneProps) => (
  <MotionScene background={background} style={{ color: foreground, fontFamily: SYSTEM_FONT, ...style }}>
    <AbsoluteFill style={{ padding: '92px 106px', justifyContent: 'space-between' }}>
      <PrecisionReveal delay={2} travelPx={5}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, letterSpacing: '0.1em', color: 'currentColor', opacity: 0.46 }}>
          <span>{kicker}</span>
          <span>IMON MOTION</span>
        </div>
      </PrecisionReveal>

      <div style={{ maxWidth: 1600 }}>
        <KineticWords
          text={statement}
          delay={8}
          stagger="editorial"
          style={{ fontSize: 112, lineHeight: 0.93, letterSpacing: '-0.067em', fontWeight: 700 }}
          wordStyle={{ whiteSpace: 'nowrap' }}
        />
        {footnote ? (
          <PrecisionReveal delay={38} travelPx={6}>
            <div style={{ marginTop: 34, maxWidth: 900, fontSize: 24, lineHeight: 1.4, letterSpacing: '-0.022em', opacity: 0.52 }}>{footnote}</div>
          </PrecisionReveal>
        ) : null}
      </div>
    </AbsoluteFill>
  </MotionScene>
);
