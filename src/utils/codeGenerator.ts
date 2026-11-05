import type { VideoBrief, GeneratedCodeBundle, VideoScene } from '../types/remotion';
import { getResolutionForFormat, getTotalFrames, calculateSceneBlocks } from './remotionMath';

export function generateRemotionCode(brief: VideoBrief): GeneratedCodeBundle {
  const { width, height } = getResolutionForFormat(brief.format);
  const totalFrames = getTotalFrames(brief.scenes, brief.durationSeconds, brief.fps);
  const isVertical = brief.format === '9:16';

  const compId = brief.topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'my-remotion-video';

  const pascalName = compId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const scenes: VideoScene[] = brief.scenes && brief.scenes.length > 0
    ? brief.scenes
    : [
        {
          id: 'scene-1',
          templateType: 'hook-title',
          name: 'Intro Hook & Headline',
          durationInFrames: 90,
          title: brief.visualElements.headline,
          subtitle: brief.visualElements.subheadline,
          badgeText: brief.visualElements.badgeText,
          transitionNext: { type: 'slide-left', durationInFrames: 15 },
        },
        {
          id: 'scene-2',
          templateType: 'feature-grid',
          name: 'Fitur Utama',
          durationInFrames: 120,
          title: 'Arsitektur Programatik Remotion',
          badgeText: 'FITUR UNGGULAN',
          items: brief.visualElements.featureList,
          transitionNext: { type: 'zoom-in', durationInFrames: 14 },
        },
        {
          id: 'scene-3',
          templateType: 'metric-impact',
          name: 'Metrik Impact',
          durationInFrames: 90,
          metricNumber: brief.visualElements.metricNumber,
          metricLabel: brief.visualElements.metricLabel,
          badgeText: 'HASIL RISET PRODUKSI',
          transitionNext: { type: 'fade', durationInFrames: 15 },
        },
        {
          id: 'scene-4',
          templateType: 'outro-cta',
          name: 'Penutup CTA',
          durationInFrames: 90,
          title: 'Mulai Rancang Video Remotion Sekarang',
          ctaText: brief.visualElements.ctaText,
          brandName: brief.visualElements.brandName,
        },
      ];

  const sceneBlocks = calculateSceneBlocks(scenes);

  // 1. Schema Code (Zod + TypeScript Interface)
  const schemaCode = `import { z } from 'zod';

export const transitionTypeSchema = z.enum([
  'none',
  'fade',
  'slide-left',
  'slide-right',
  'slide-up',
  'zoom-in',
  'zoom-out',
  'wipe',
  'glitch',
  'blur',
]);

export const sceneTransitionSchema = z.object({
  type: transitionTypeSchema,
  durationInFrames: z.number().min(0).max(60),
});

export const sceneSchema = z.object({
  id: z.string(),
  templateType: z.enum([
    'hook-title',
    'feature-grid',
    'metric-impact',
    'split-comparison',
    'quote-testimonial',
    'product-showcase',
    'cyber-glitch',
    'outro-cta',
  ]),
  name: z.string(),
  durationInFrames: z.number().min(15).max(600),
  transitionNext: sceneTransitionSchema.optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  badgeText: z.string().optional(),
  accentColor: z.string().optional(),
  items: z.array(z.string()).optional(),
  metricNumber: z.string().optional(),
  metricLabel: z.string().optional(),
  ctaText: z.string().optional(),
  brandName: z.string().optional(),
  author: z.string().optional(),
  authorRole: z.string().optional(),
  beforeText: z.string().optional(),
  afterText: z.string().optional(),
});

export const videoPropsSchema = z.object({
  badgeText: z.string(),
  headline: z.string(),
  subheadline: z.string(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  featureList: z.array(z.string()),
  metricNumber: z.string(),
  metricLabel: z.string(),
  ctaText: z.string(),
  brandName: z.string(),
  scenes: z.array(sceneSchema),
});

export type VideoProps = z.infer<typeof videoPropsSchema>;

export const defaultVideoProps: VideoProps = {
  ...${JSON.stringify(brief.visualElements, null, 2)},
  scenes: ${JSON.stringify(scenes, null, 2)},
};
`;

  // 2. Composition Code
  const compositionCode = `import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { VideoProps } from './schema';

/**
 * Komponen Utama: ${pascalName}
 * Format: ${brief.format} (${width}x${height}) @ ${brief.fps} fps
 * Durasi Total: ${totalFrames} frames (${(totalFrames / brief.fps).toFixed(1)}s)
 * Jumlah Scene: ${scenes.length} adegan dengan transisi modular
 */
export const ${pascalName}: React.FC<VideoProps> = ({
  badgeText,
  headline,
  subheadline,
  accentColor,
  secondaryColor,
  backgroundColor,
  brandName,
  scenes,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const isVertical = ${isVertical};

  // Background Ambient Rotation
  const bgRotation = interpolate(frame, [0, durationInFrames], [0, 45], {
    extrapolateRight: 'clamp',
  });

  // Calculate starts for all scene sequences
  let accumulatedFrame = 0;
  const sequenceData = scenes.map((sc) => {
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
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Background Animated Glow Spheres */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '75vw',
          height: '75vw',
          borderRadius: '9999px',
          background: \`radial-gradient(circle, \${accentColor}44 0%, transparent 70%)\`,
          filter: 'blur(100px)',
          transform: \`rotate(\${bgRotation}deg) scale(\${1 + Math.sin(frame / 30) * 0.05})\`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '65vw',
          height: '65vw',
          borderRadius: '9999px',
          background: \`radial-gradient(circle, \${secondaryColor}33 0%, transparent 70%)\`,
          filter: 'blur(90px)',
        }}
      />

      {/* Grid Pattern Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '${isVertical ? '44px 44px' : '52px 52px'}',
          opacity: 0.35,
        }}
      />

      {/* Top Persistent Watermark / Brand Header */}
      <div
        style={{
          position: 'absolute',
          top: ${isVertical ? '80px' : '48px'},
          left: ${isVertical ? '60px' : '64px'},
          right: ${isVertical ? '60px' : '64px'},
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 60,
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: \`linear-gradient(135deg, \${accentColor}, \${secondaryColor})\`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px',
            }}
          >
            {(brandName || 'R').charAt(0)}
          </div>
          <span style={{ fontSize: '${isVertical ? '28px' : '20px'}', fontWeight: 800 }}>
            {brandName}
          </span>
        </div>
        <div
          style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            fontSize: '${isVertical ? '22px' : '14px'}',
            fontWeight: 700,
          }}
        >
          {badgeText}
        </div>
      </div>

      {/* Dynamic Multi-Scene Sequences */}
      {sequenceData.map(({ scene, from, durationInFrames: seqDur }, idx) => (
        <Sequence key={scene.id || idx} from={from} durationInFrames={seqDur}>
          <SceneTransitionWrapper
            scene={scene}
            duration={seqDur}
            accentColor={accentColor}
            secondaryColor={secondaryColor}
            isVertical={isVertical}
            defaultBrandName={brandName}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// Transition and Exit Wrapper
const SceneTransitionWrapper: React.FC<{
  scene: any;
  duration: number;
  accentColor: string;
  secondaryColor: string;
  isVertical: boolean;
  defaultBrandName: string;
}> = ({ scene, duration, accentColor, secondaryColor, isVertical, defaultBrandName }) => {
  const frame = useCurrentFrame();
  const transition = scene.transitionNext;
  const transFrames = transition?.durationInFrames || 15;
  const transType = transition?.type || 'fade';

  let exitOpacity = 1;
  let exitTransform = '';

  if (frame >= duration - transFrames && transType !== 'none') {
    const progress = interpolate(frame, [duration - transFrames, duration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    if (transType === 'slide-left') {
      exitTransform = \`translateX(-\${progress * 100}%)\`;
      exitOpacity = 1 - progress * 0.4;
    } else if (transType === 'slide-right') {
      exitTransform = \`translateX(\${progress * 100}%)\`;
      exitOpacity = 1 - progress * 0.4;
    } else if (transType === 'zoom-in') {
      exitTransform = \`scale(\${1 + progress * 0.35})\`;
      exitOpacity = 1 - progress;
    } else {
      exitOpacity = 1 - progress;
    }
  }

  return (
    <AbsoluteFill style={{ opacity: exitOpacity, transform: exitTransform || undefined }}>
      <SceneTemplateContent
        scene={scene}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
        isVertical={isVertical}
        defaultBrandName={defaultBrandName}
      />
    </AbsoluteFill>
  );
};

// Template Content Renderer
const SceneTemplateContent: React.FC<{
  scene: any;
  accentColor: string;
  secondaryColor: string;
  isVertical: boolean;
  defaultBrandName: string;
}> = ({ scene, accentColor, secondaryColor, isVertical, defaultBrandName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: isVertical ? '0 60px' : '0 120px',
      }}
    >
      {scene.badgeText && (
        <div
          style={{
            transform: \`scale(\${entrance})\`,
            background: \`\${accentColor}22\`,
            border: \`1.5px solid \${accentColor}88\`,
            color: accentColor,
            padding: isVertical ? '12px 28px' : '8px 20px',
            borderRadius: '9999px',
            fontSize: isVertical ? '32px' : '20px',
            fontWeight: 800,
            marginBottom: isVertical ? '36px' : '24px',
          }}
        >
          ✦ {scene.badgeText}
        </div>
      )}

      {scene.title && (
        <h1
          style={{
            transform: \`translateY(\${(1 - entrance) * 40}px)\`,
            fontSize: isVertical ? '72px' : '60px',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: '24px',
            maxWidth: isVertical ? '100%' : '1100px',
          }}
        >
          {scene.title}
        </h1>
      )}

      {scene.subtitle && (
        <p
          style={{
            fontSize: isVertical ? '36px' : '26px',
            color: 'rgba(255, 255, 255, 0.75)',
            maxWidth: isVertical ? '100%' : '850px',
            lineHeight: 1.45,
            marginBottom: '32px',
          }}
        >
          {scene.subtitle}
        </p>
      )}

      {scene.metricNumber && (
        <div
          style={{
            fontSize: isVertical ? '120px' : '100px',
            fontWeight: 900,
            color: accentColor,
            marginBottom: '16px',
          }}
        >
          {scene.metricNumber}
        </div>
      )}

      {scene.items && scene.items.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isVertical ? '1fr' : 'repeat(3, 1fr)',
            gap: isVertical ? '20px' : '24px',
            width: '100%',
            maxWidth: isVertical ? '900px' : '1300px',
          }}
        >
          {scene.items.map((it: string, i: number) => (
            <div
              key={i}
              style={{
                padding: isVertical ? '28px' : '24px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: isVertical ? '32px' : '22px',
                fontWeight: 700,
              }}
            >
              0{i + 1}. {it}
            </div>
          ))}
        </div>
      )}

      {scene.ctaText && (
        <div
          style={{
            transform: \`scale(\${entrance})\`,
            background: \`linear-gradient(90deg, \${accentColor}, \${secondaryColor})\`,
            color: '#ffffff',
            padding: isVertical ? '26px 64px' : '20px 48px',
            borderRadius: '9999px',
            fontSize: isVertical ? '36px' : '26px',
            fontWeight: 800,
            marginTop: '20px',
          }}
        >
          {scene.ctaText} →
        </div>
      )}
    </AbsoluteFill>
  );
};
`;

  // 3. Root Code (Remotion Root Entrypoint)
  const rootCode = `import React from 'react';
import { Composition } from 'remotion';
import { ${pascalName} } from './Composition';
import { videoPropsSchema, defaultVideoProps } from './schema';

/**
 * Root Registrasi Komposisi Remotion
 * Jalankan 'npm run dev' untuk membuka Remotion Studio.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="${compId}"
        component={${pascalName}}
        durationInFrames={${totalFrames}}
        fps={${brief.fps}}
        width={${width}}
        height={${height}}
        schema={videoPropsSchema}
        defaultProps={defaultVideoProps}
      />
    </>
  );
};
`;

  // 4. Instructions Markdown
  const instructionsMd = `# Cara Menjalankan Video Remotion Ini

Proyek ini menggunakan arsitektur multi-scene Remotion resmi (React + TypeScript).

### 1. Inisialisasi Proyek Baru
\`\`\`bash
npx create-video@latest my-video
cd my-video
npm install remotion @remotion/player zod
\`\`\`

### 2. Struktur File Multi-Scene:
\`\`\`text
src/
├── Root.tsx          # Mendaftarkan <Composition id="${compId}">
├── Composition.tsx   # Animasi spring(), multi-sequence adegan, dan transisi
├── schema.ts         # Zod schema array adegan & props
└── index.ts          # registerRoot(RemotionRoot)
\`\`\`

### 3. Jalankan Remotion Studio (Preview Interaktif)
\`\`\`bash
npm run dev
# atau:
npx remotion preview
\`\`\`

### 4. Render Video ke MP4 (CLI)
\`\`\`bash
npx remotion render src/index.ts ${compId} out/${compId}.mp4
\`\`\`

### Parameter Spesifikasi:
- **ID Komposisi**: \`${compId}\`
- **Format**: ${brief.format} (${width}x${height} px)
- **Framerate**: ${brief.fps} fps
- **Jumlah Adegan**: ${scenes.length} scene
- **Durasi Total**: ${totalFrames} frames (${(totalFrames / brief.fps).toFixed(1)} detik)
`;

  return {
    rootCode,
    compositionCode,
    schemaCode,
    instructionsMd,
  };
}
