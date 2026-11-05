import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { VideoFormat, VisualElementsConfig, VideoScene, SceneTransition } from '../../types/remotion';

export interface LiveCompositionProps extends VisualElementsConfig {
  format: VideoFormat;
  scenes?: VideoScene[];
}

export const LiveRemotionComposition: React.FC<LiveCompositionProps> = ({
  format,
  badgeText,
  headline,
  subheadline,
  accentColor,
  secondaryColor,
  backgroundColor,
  featureList,
  metricNumber,
  metricLabel,
  ctaText,
  brandName,
  scenes,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const isVertical = format === '9:16';

  // Dynamic scenes list or default 4-act fallback
  const sceneList: VideoScene[] =
    scenes && scenes.length > 0
      ? scenes
      : [
          {
            id: 'hook',
            templateType: 'hook-title',
            name: 'Intro Hook',
            durationInFrames: Math.round(durationInFrames * 0.25),
            title: headline,
            subtitle: subheadline,
            badgeText,
            transitionNext: { type: 'slide-left', durationInFrames: 15 },
          },
          {
            id: 'showcase',
            templateType: 'feature-grid',
            name: 'Fitur Utama',
            durationInFrames: Math.round(durationInFrames * 0.35),
            badgeText: 'FITUR UNGGULAN',
            items: featureList,
            transitionNext: { type: 'zoom-in', durationInFrames: 14 },
          },
          {
            id: 'metric',
            templateType: 'metric-impact',
            name: 'Metrik Impact',
            durationInFrames: Math.round(durationInFrames * 0.20),
            metricNumber,
            metricLabel,
            badgeText: 'HASIL RISET',
            transitionNext: { type: 'fade', durationInFrames: 15 },
          },
          {
            id: 'outro',
            templateType: 'outro-cta',
            name: 'Penutup CTA',
            durationInFrames: Math.max(30, durationInFrames - Math.round(durationInFrames * 0.8)),
            brandName,
            ctaText,
            badgeText: 'PENAWARAN SPESIAL',
          },
        ];

  // Background animated ambient rotation
  const bgRotation = interpolate(frame, [0, durationInFrames], [0, 45], {
    extrapolateRight: 'clamp',
  });

  // Calculate starts for all sequences
  let accumulatedFrame = 0;
  const sceneSequenceData = sceneList.map((sc) => {
    const start = accumulatedFrame;
    const dur = Math.max(15, sc.durationInFrames);
    accumulatedFrame += dur;
    return {
      scene: sc,
      from: start,
      durationInFrames: dur,
    };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Background Ambient Glow Spheres */}
      <div
        style={{
          position: 'absolute',
          top: isVertical ? '-10%' : '-20%',
          left: isVertical ? '-20%' : '-10%',
          width: isVertical ? '140vw' : '75vw',
          height: isVertical ? '140vw' : '75vw',
          borderRadius: '9999px',
          background: `radial-gradient(circle, ${accentColor}55 0%, transparent 70%)`,
          filter: 'blur(110px)',
          transform: `rotate(${bgRotation}deg) scale(${1 + Math.sin(frame / 25) * 0.06})`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: isVertical ? '-10%' : '-15%',
          right: isVertical ? '-15%' : '-10%',
          width: isVertical ? '130vw' : '65vw',
          height: isVertical ? '130vw' : '65vw',
          borderRadius: '9999px',
          background: `radial-gradient(circle, ${secondaryColor}44 0%, transparent 70%)`,
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      {/* Grid Pattern Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
          backgroundSize: isVertical ? '48px 48px' : '56px 56px',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />

      {/* Top Persistent Brand Header */}
      <div
        style={{
          position: 'absolute',
          top: isVertical ? '90px' : '48px',
          left: isVertical ? '70px' : '64px',
          right: isVertical ? '70px' : '64px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 60,
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isVertical ? '18px' : '12px' }}>
          <div
            style={{
              width: isVertical ? '48px' : '36px',
              height: isVertical ? '48px' : '36px',
              borderRadius: isVertical ? '14px' : '10px',
              background: `linear-gradient(135deg, ${accentColor}, ${secondaryColor})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: isVertical ? '24px' : '18px',
              boxShadow: `0 8px 20px ${accentColor}66`,
            }}
          >
            {(brandName || 'R').charAt(0)}
          </div>
          <span
            style={{
              fontSize: isVertical ? '32px' : '22px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {brandName}
          </span>
        </div>

        <div
          style={{
            padding: isVertical ? '10px 22px' : '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(10px)',
            fontSize: isVertical ? '24px' : '14px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.85)',
            letterSpacing: '0.04em',
          }}
        >
          {badgeText}
        </div>
      </div>

      {/* Render Dynamic Sequences for each scene */}
      {sceneSequenceData.map(({ scene, from, durationInFrames: seqDur }, index) => {
        return (
          <Sequence key={scene.id || index} from={from} durationInFrames={seqDur}>
            <SceneRenderer
              scene={scene}
              isVertical={isVertical}
              accentColor={scene.accentColor || accentColor}
              secondaryColor={scene.secondaryColor || secondaryColor}
              duration={seqDur}
              transition={scene.transitionNext}
              globalBrandName={brandName}
              globalHeadline={headline}
              globalSubheadline={subheadline}
              globalFeatures={featureList}
              globalMetricNumber={metricNumber}
              globalMetricLabel={metricLabel}
              globalCtaText={ctaText}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Scene Content Renderer with Transition Wrapper
interface SceneRendererProps {
  scene: VideoScene;
  isVertical: boolean;
  accentColor: string;
  secondaryColor: string;
  duration: number;
  transition?: SceneTransition;
  globalBrandName: string;
  globalHeadline: string;
  globalSubheadline: string;
  globalFeatures: string[];
  globalMetricNumber: string;
  globalMetricLabel: string;
  globalCtaText: string;
}

const SceneRenderer: React.FC<SceneRendererProps> = ({
  scene,
  isVertical,
  accentColor,
  secondaryColor,
  duration,
  transition,
  globalBrandName,
  globalHeadline,
  globalSubheadline,
  globalFeatures,
  globalMetricNumber,
  globalMetricLabel,
  globalCtaText,
}) => {
  const frame = useCurrentFrame();
  const transitionFrames = transition?.durationInFrames || 15;
  const transitionType = transition?.type || 'fade';

  // Calculate transition styles at exit
  const isExiting = frame >= duration - transitionFrames;
  let exitOpacity = 1;
  let exitTransform = '';
  let exitFilter = '';

  if (isExiting && transitionType !== 'none') {
    const exitProgress = interpolate(
      frame,
      [duration - transitionFrames, duration],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    switch (transitionType) {
      case 'fade':
        exitOpacity = 1 - exitProgress;
        break;
      case 'slide-left':
        exitTransform = `translateX(-${exitProgress * 100}%)`;
        exitOpacity = 1 - exitProgress * 0.4;
        break;
      case 'slide-right':
        exitTransform = `translateX(${exitProgress * 100}%)`;
        exitOpacity = 1 - exitProgress * 0.4;
        break;
      case 'slide-up':
        exitTransform = `translateY(-${exitProgress * 100}%)`;
        exitOpacity = 1 - exitProgress * 0.4;
        break;
      case 'zoom-in':
        exitTransform = `scale(${1 + exitProgress * 0.35})`;
        exitOpacity = 1 - exitProgress;
        break;
      case 'zoom-out':
        exitTransform = `scale(${1 - exitProgress * 0.25})`;
        exitOpacity = 1 - exitProgress;
        break;
      case 'wipe':
        exitTransform = `translateX(-${exitProgress * 50}px)`;
        exitOpacity = 1 - exitProgress;
        break;
      case 'glitch':
        exitTransform = `skewX(${Math.sin(frame * 5) * 8}deg) scale(${1 + (Math.sin(frame * 7) > 0 ? 0.05 : -0.05)})`;
        exitFilter = `invert(${Math.sin(frame * 9) > 0.5 ? 40 : 0}%)`;
        exitOpacity = 1 - exitProgress * 0.7;
        break;
      case 'blur':
        exitFilter = `blur(${exitProgress * 18}px)`;
        exitOpacity = 1 - exitProgress;
        break;
      default:
        exitOpacity = 1 - exitProgress;
    }
  }

  return (
    <AbsoluteFill
      style={{
        opacity: exitOpacity,
        transform: exitTransform || undefined,
        filter: exitFilter || undefined,
        transition: 'none',
      }}
    >
      {renderSceneTemplate({
        scene,
        isVertical,
        accentColor,
        secondaryColor,
        duration,
        globalBrandName,
        globalHeadline,
        globalSubheadline,
        globalFeatures,
        globalMetricNumber,
        globalMetricLabel,
        globalCtaText,
      })}
    </AbsoluteFill>
  );
};

function renderSceneTemplate(props: {
  scene: VideoScene;
  isVertical: boolean;
  accentColor: string;
  secondaryColor: string;
  duration: number;
  globalBrandName: string;
  globalHeadline: string;
  globalSubheadline: string;
  globalFeatures: string[];
  globalMetricNumber: string;
  globalMetricLabel: string;
  globalCtaText: string;
}) {
  const { scene, isVertical, accentColor, secondaryColor } = props;

  switch (scene.templateType) {
    case 'cyber-glitch':
      return (
        <SceneCyberGlitch
          badgeText={scene.badgeText || 'ALERT #01'}
          headline={scene.title || props.globalHeadline}
          subheadline={scene.subtitle || props.globalSubheadline}
          accentColor={accentColor}
          isVertical={isVertical}
        />
      );

    case 'feature-grid':
      return (
        <SceneFeatureGrid
          title={scene.title || 'Fitur Unggulan Programatik'}
          badgeText={scene.badgeText || 'FITUR UNGGULAN'}
          items={scene.items || props.globalFeatures}
          accentColor={accentColor}
          secondaryColor={secondaryColor}
          isVertical={isVertical}
        />
      );

    case 'product-showcase':
      return (
        <SceneProductShowcase
          title={scene.title || 'Workstation Remotion Pro'}
          subtitle={scene.subtitle || 'Integrasi penuh kode React & CapCut UX'}
          badgeText={scene.badgeText || 'PRODUK TERBARU'}
          items={scene.items || props.globalFeatures}
          accentColor={accentColor}
          isVertical={isVertical}
        />
      );

    case 'metric-impact':
      return (
        <SceneMetricImpact
          metricNumber={scene.metricNumber || props.globalMetricNumber}
          metricLabel={scene.metricLabel || props.globalMetricLabel}
          badgeText={scene.badgeText || 'BUKTI & METRIK'}
          subtitle={scene.subtitle || 'Diverifikasi langsung oleh ribuan pipeline produksi'}
          accentColor={accentColor}
          isVertical={isVertical}
        />
      );

    case 'split-comparison':
      return (
        <SceneSplitComparison
          title={scene.title || 'Perbandingan Efisiensi Kerja'}
          badgeText={scene.badgeText || 'PERBANDINGAN NYATA'}
          beforeText={scene.beforeText || 'Cara Manual: Edit video potong per potong, makan waktu berjam-jam.'}
          afterText={scene.afterText || 'Cara Remotion: Sekali klik kode React, otomatisasi ratusan video MP4!'}
          accentColor={accentColor}
          isVertical={isVertical}
        />
      );

    case 'quote-testimonial':
      return (
        <SceneQuoteTestimonial
          title={scene.title || '"Remotion mengubah total alur kerja video studio kami."'}
          subtitle={scene.subtitle || 'Kualitas render pixel-perfect dan otomatisasi tanpa batas.'}
          badgeText={scene.badgeText || 'TESTIMONI KLIEN'}
          author={scene.author || 'Budi Santoso'}
          authorRole={scene.authorRole || 'Lead Video Engineer'}
          accentColor={accentColor}
          isVertical={isVertical}
        />
      );

    case 'outro-cta':
      return (
        <SceneOutroCta
          brandName={scene.brandName || props.globalBrandName}
          ctaText={scene.ctaText || props.globalCtaText}
          title={scene.title || 'Mulai Rancang Video Remotion Sekarang'}
          subtitle={scene.subtitle || 'Buka Remotion Studio atau salin kode TypeScript langsung'}
          accentColor={accentColor}
          secondaryColor={secondaryColor}
          isVertical={isVertical}
        />
      );

    case 'hook-title':
    default:
      return (
        <SceneHookTitle
          badgeText={scene.badgeText || 'FITUR TERBARU'}
          headline={scene.title || props.globalHeadline}
          subheadline={scene.subtitle || props.globalSubheadline}
          accentColor={accentColor}
          isVertical={isVertical}
        />
      );
  }
}

// ==========================================
// SCENE 1: HOOK & KINETIC HEADLINE
// ==========================================
const SceneHookTitle: React.FC<{
  badgeText: string;
  headline: string;
  subheadline: string;
  accentColor: string;
  isVertical: boolean;
}> = ({ badgeText, headline, subheadline, accentColor, isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 140, mass: 0.6 },
  });

  const titleSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const subSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 15, stiffness: 95 },
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: isVertical ? '0 64px' : '0 140px',
      }}
    >
      <div
        style={{
          transform: `scale(${badgeSpring}) translateY(${(1 - badgeSpring) * 35}px)`,
          opacity: badgeSpring,
          background: `${accentColor}22`,
          border: `2px solid ${accentColor}99`,
          color: accentColor,
          padding: isVertical ? '14px 32px' : '10px 24px',
          borderRadius: '9999px',
          fontSize: isVertical ? '34px' : '22px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: isVertical ? '48px' : '32px',
          boxShadow: `0 0 35px ${accentColor}55`,
        }}
      >
        ✦ {badgeText}
      </div>

      <h1
        style={{
          transform: `translateY(${(1 - titleSpring) * 60}px)`,
          opacity: titleSpring,
          fontSize: isVertical ? '76px' : '64px',
          lineHeight: isVertical ? 1.18 : 1.12,
          fontWeight: 900,
          letterSpacing: '-0.035em',
          maxWidth: isVertical ? '100%' : '1200px',
          marginBottom: isVertical ? '36px' : '28px',
          background: 'linear-gradient(180deg, #FFFFFF 25%, rgba(255, 255, 255, 0.72) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 8px 30px rgba(0,0,0,0.6)',
        }}
      >
        {headline}
      </h1>

      <p
        style={{
          transform: `translateY(${(1 - subSpring) * 40}px)`,
          opacity: subSpring,
          fontSize: isVertical ? '36px' : '28px',
          color: 'rgba(255, 255, 255, 0.75)',
          maxWidth: isVertical ? '100%' : '900px',
          lineHeight: 1.45,
          fontWeight: 450,
        }}
      >
        {subheadline}
      </p>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 2: CYBER GLITCH HOOK
// ==========================================
const SceneCyberGlitch: React.FC<{
  badgeText: string;
  headline: string;
  subheadline: string;
  accentColor: string;
  isVertical: boolean;
}> = ({ badgeText, headline, subheadline, accentColor, isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 9, stiffness: 180 },
  });

  const glitchShift = frame < 20 && frame % 4 === 0 ? 6 : 0;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: isVertical ? '0 64px' : '0 120px',
      }}
    >
      <div
        style={{
          transform: `scale(${entrance})`,
          background: '#ef4444',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: isVertical ? '32px' : '20px',
          letterSpacing: '0.15em',
          padding: isVertical ? '12px 28px' : '8px 20px',
          borderRadius: '8px',
          marginBottom: isVertical ? '40px' : '28px',
          boxShadow: '0 0 30px #ef444499',
          textTransform: 'uppercase',
        }}
      >
        ⚡ {badgeText}
      </div>

      <h1
        style={{
          transform: `scale(${entrance}) translateX(${glitchShift}px)`,
          fontSize: isVertical ? '80px' : '68px',
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          maxWidth: isVertical ? '100%' : '1100px',
          marginBottom: '28px',
          textShadow: `${glitchShift > 0 ? '4px 0 #ef4444, -4px 0 #06b6d4' : '0 10px 40px rgba(0,0,0,0.8)'}`,
        }}
      >
        {headline}
      </h1>

      <p
        style={{
          fontSize: isVertical ? '36px' : '26px',
          color: 'rgba(255, 255, 255, 0.8)',
          maxWidth: isVertical ? '100%' : '850px',
          lineHeight: 1.4,
        }}
      >
        {subheadline}
      </p>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 3: FEATURE GRID
// ==========================================
const SceneFeatureGrid: React.FC<{
  title: string;
  badgeText: string;
  items: string[];
  accentColor: string;
  secondaryColor: string;
  isVertical: boolean;
}> = ({ title, badgeText, items, accentColor, secondaryColor, isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isVertical ? '0 64px' : '0 120px',
      }}
    >
      <div
        style={{
          transform: `translateY(${(1 - headerSpring) * 30}px)`,
          opacity: headerSpring,
          fontSize: isVertical ? '32px' : '20px',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: accentColor,
          marginBottom: isVertical ? '36px' : '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span>///</span>
        <span>{title}</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isVertical ? '1fr' : 'repeat(3, 1fr)',
          gap: isVertical ? '28px' : '32px',
          width: '100%',
          maxWidth: isVertical ? '920px' : '1400px',
        }}
      >
        {items.slice(0, 3).map((feature, idx) => {
          const itemSpring = spring({
            frame: frame - idx * 7,
            fps,
            config: { damping: 13, stiffness: 120 },
          });

          return (
            <div
              key={idx}
              style={{
                transform: `translateY(${(1 - itemSpring) * 60}px) scale(${0.88 + itemSpring * 0.12})`,
                opacity: itemSpring,
                padding: isVertical ? '36px' : '36px 32px',
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              }}
            >
              <div
                style={{
                  width: isVertical ? '60px' : '52px',
                  height: isVertical ? '60px' : '52px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${accentColor}44, ${secondaryColor}44)`,
                  border: `1.5px solid ${accentColor}99`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isVertical ? '28px' : '22px',
                  fontWeight: 900,
                  color: '#ffffff',
                }}
              >
                0{idx + 1}
              </div>
              <div
                style={{
                  fontSize: isVertical ? '34px' : '24px',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.35,
                }}
              >
                {feature}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 4: PRODUCT SHOWCASE
// ==========================================
const SceneProductShowcase: React.FC<{
  title: string;
  subtitle: string;
  badgeText: string;
  items: string[];
  accentColor: string;
  isVertical: boolean;
}> = ({ title, subtitle, badgeText, items, accentColor, isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 110 },
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isVertical ? '0 64px' : '0 120px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          transform: `scale(${entrance})`,
          padding: '8px 20px',
          borderRadius: '9999px',
          background: `${accentColor}22`,
          border: `1.5px solid ${accentColor}88`,
          color: accentColor,
          fontSize: isVertical ? '30px' : '18px',
          fontWeight: 800,
          marginBottom: '24px',
        }}
      >
        ✦ {badgeText}
      </div>

      <h2
        style={{
          fontSize: isVertical ? '68px' : '54px',
          fontWeight: 900,
          marginBottom: '18px',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontSize: isVertical ? '34px' : '24px',
          color: 'rgba(255, 255, 255, 0.75)',
          maxWidth: isVertical ? '100%' : '800px',
          marginBottom: '40px',
        }}
      >
        {subtitle}
      </p>

      {/* Mockup Display Box */}
      <div
        style={{
          transform: `scale(${entrance})`,
          padding: isVertical ? '36px' : '32px 50px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1.5px solid rgba(255, 255, 255, 0.18)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
          maxWidth: isVertical ? '900px' : '1000px',
        }}
      >
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              padding: isVertical ? '14px 28px' : '10px 22px',
              borderRadius: '14px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: `1px solid ${accentColor}66`,
              color: '#ffffff',
              fontSize: isVertical ? '28px' : '18px',
              fontWeight: 700,
            }}
          >
            ✓ {it}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 5: METRIC IMPACT
// ==========================================
const SceneMetricImpact: React.FC<{
  metricNumber: string;
  metricLabel: string;
  badgeText: string;
  subtitle: string;
  accentColor: string;
  isVertical: boolean;
}> = ({ metricNumber, metricLabel, badgeText, subtitle, accentColor, isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 110 },
  });

  const numericVal = parseInt(metricNumber.replace(/[^0-9]/g, ''), 10) || 100;
  const suffix = metricNumber.replace(/[0-9]/g, '');
  const animatedNumber = Math.round(
    interpolate(frame, [0, 24], [0, numericVal], {
      extrapolateRight: 'clamp',
    })
  );

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: isVertical ? '0 64px' : '0 120px',
      }}
    >
      <div
        style={{
          transform: `scale(${scaleSpring})`,
          opacity: scaleSpring,
          padding: isVertical ? '64px 44px' : '64px 90px',
          borderRadius: '36px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: `2px solid ${accentColor}77`,
          boxShadow: `0 25px 70px -10px ${accentColor}55`,
          maxWidth: isVertical ? '880px' : '920px',
          width: '100%',
        }}
      >
        <div
          style={{
            fontSize: isVertical ? '130px' : '110px',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: accentColor,
            marginBottom: '20px',
            textShadow: `0 0 50px ${accentColor}99`,
          }}
        >
          {animatedNumber}
          {suffix}
        </div>
        <div
          style={{
            fontSize: isVertical ? '42px' : '32px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.95)',
            letterSpacing: '-0.01em',
            marginBottom: '12px',
          }}
        >
          {metricLabel}
        </div>
        <div
          style={{
            fontSize: isVertical ? '28px' : '20px',
            color: 'rgba(255, 255, 255, 0.65)',
          }}
        >
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 6: SPLIT COMPARISON (Before vs After)
// ==========================================
const SceneSplitComparison: React.FC<{
  title: string;
  badgeText: string;
  beforeText: string;
  afterText: string;
  accentColor: string;
  isVertical: boolean;
}> = ({ title, badgeText, beforeText, afterText, accentColor, isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isVertical ? '0 64px' : '0 120px',
      }}
    >
      <h2
        style={{
          transform: `scale(${entrance})`,
          fontSize: isVertical ? '64px' : '48px',
          fontWeight: 900,
          textAlign: 'center',
          marginBottom: isVertical ? '44px' : '36px',
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isVertical ? '1fr' : '1fr 1fr',
          gap: isVertical ? '24px' : '32px',
          width: '100%',
          maxWidth: isVertical ? '900px' : '1200px',
        }}
      >
        {/* Before Card */}
        <div
          style={{
            padding: isVertical ? '36px' : '36px',
            borderRadius: '24px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
          }}
        >
          <div
            style={{
              color: '#ef4444',
              fontWeight: 900,
              fontSize: isVertical ? '30px' : '20px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            ✕ CARA LAMA (MANUAL)
          </div>
          <p
            style={{
              fontSize: isVertical ? '32px' : '22px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.45,
            }}
          >
            {beforeText}
          </p>
        </div>

        {/* After Card */}
        <div
          style={{
            padding: isVertical ? '36px' : '36px',
            borderRadius: '24px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '2px solid rgba(16, 185, 129, 0.5)',
            boxShadow: '0 15px 40px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div
            style={{
              color: '#10b981',
              fontWeight: 900,
              fontSize: isVertical ? '30px' : '20px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            ✓ CARA BARU (REMOTION)
          </div>
          <p
            style={{
              fontSize: isVertical ? '32px' : '22px',
              color: '#ffffff',
              lineHeight: 1.45,
              fontWeight: 600,
            }}
          >
            {afterText}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 7: QUOTE & TESTIMONIAL
// ==========================================
const SceneQuoteTestimonial: React.FC<{
  title: string;
  subtitle: string;
  badgeText: string;
  author: string;
  authorRole: string;
  accentColor: string;
  isVertical: boolean;
}> = ({ title, subtitle, badgeText, author, authorRole, accentColor, isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: isVertical ? '0 64px' : '0 120px',
      }}
    >
      <div
        style={{
          transform: `scale(${entrance})`,
          padding: isVertical ? '60px 48px' : '56px 80px',
          borderRadius: '32px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1.5px solid rgba(255, 255, 255, 0.16)',
          maxWidth: isVertical ? '900px' : '1100px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            fontSize: isVertical ? '60px' : '44px',
            color: accentColor,
            marginBottom: '16px',
          }}
        >
          ★★★★★
        </div>

        <p
          style={{
            fontSize: isVertical ? '48px' : '36px',
            fontWeight: 800,
            lineHeight: 1.3,
            color: '#ffffff',
            marginBottom: '32px',
          }}
        >
          {title}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div
            style={{
              width: isVertical ? '64px' : '48px',
              height: isVertical ? '64px' : '48px',
              borderRadius: '9999px',
              background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: isVertical ? '28px' : '22px',
            }}
          >
            {author.charAt(0)}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: isVertical ? '30px' : '22px', fontWeight: 800 }}>
              {author}
            </div>
            <div style={{ fontSize: isVertical ? '24px' : '16px', color: 'rgba(255, 255, 255, 0.65)' }}>
              {authorRole}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 8: OUTRO & CTA
// ==========================================
const SceneOutroCta: React.FC<{
  brandName: string;
  ctaText: string;
  title: string;
  subtitle: string;
  accentColor: string;
  secondaryColor: string;
  isVertical: boolean;
}> = ({ brandName, ctaText, title, subtitle, accentColor, secondaryColor, isVertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ctaSpring = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 130 },
  });

  const pulse = Math.sin(frame / 6) * 0.035;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: isVertical ? '0 64px' : '0 120px',
      }}
    >
      <div
        style={{
          width: isVertical ? '120px' : '100px',
          height: isVertical ? '120px' : '100px',
          borderRadius: '32px',
          background: `linear-gradient(135deg, ${accentColor}, ${secondaryColor})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isVertical ? '60px' : '50px',
          fontWeight: 900,
          boxShadow: `0 20px 50px ${accentColor}77`,
          marginBottom: '32px',
          transform: `scale(${ctaSpring})`,
        }}
      >
        {brandName.charAt(0) || 'R'}
      </div>

      <h2
        style={{
          fontSize: isVertical ? '64px' : '50px',
          fontWeight: 900,
          marginBottom: '18px',
          letterSpacing: '-0.02em',
        }}
      >
        {brandName}
      </h2>

      <p
        style={{
          fontSize: isVertical ? '34px' : '24px',
          color: 'rgba(255, 255, 255, 0.75)',
          maxWidth: isVertical ? '100%' : '800px',
          marginBottom: '40px',
        }}
      >
        {subtitle}
      </p>

      <div
        style={{
          transform: `scale(${ctaSpring + pulse})`,
          opacity: ctaSpring,
          background: `linear-gradient(90deg, ${accentColor}, ${secondaryColor})`,
          color: '#ffffff',
          padding: isVertical ? '28px 70px' : '22px 52px',
          borderRadius: '9999px',
          fontSize: isVertical ? '38px' : '28px',
          fontWeight: 800,
          letterSpacing: '-0.01em',
          boxShadow: `0 14px 45px ${accentColor}88`,
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
        }}
      >
        <span>{ctaText}</span>
        <span style={{ fontSize: '1.2em' }}>→</span>
      </div>
    </AbsoluteFill>
  );
};
