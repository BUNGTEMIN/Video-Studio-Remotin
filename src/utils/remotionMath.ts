import type { VideoFormat, SequenceBlock, VideoScene, SceneTemplateType } from '../types/remotion';

export function secondsToFrames(seconds: number, fps: number = 30): number {
  if (seconds <= 0) return 30; // Minimum 1 second default
  return Math.round(seconds * fps);
}

export function framesToSeconds(frames: number, fps: number = 30): string {
  const sec = frames / fps;
  return sec.toFixed(1);
}

export function getResolutionForFormat(format: VideoFormat): { width: number; height: number; aspectRatio: string } {
  if (format === '9:16') {
    return { width: 1080, height: 1920, aspectRatio: '9/16' };
  }
  return { width: 1920, height: 1080, aspectRatio: '16/9' };
}

export function getTemplateColor(templateType: SceneTemplateType): string {
  switch (templateType) {
    case 'hook-title':
      return '#6366f1'; // Indigo
    case 'cyber-glitch':
      return '#ec4899'; // Pink
    case 'feature-grid':
      return '#06b6d4'; // Cyan
    case 'product-showcase':
      return '#3b82f6'; // Blue
    case 'metric-impact':
      return '#10b981'; // Emerald
    case 'split-comparison':
      return '#f59e0b'; // Amber
    case 'quote-testimonial':
      return '#8b5cf6'; // Purple
    case 'outro-cta':
      return '#14b8a6'; // Teal
    default:
      return '#64748b'; // Slate
  }
}

export function calculateSceneBlocks(scenes: VideoScene[]): SequenceBlock[] {
  let accumulatedFrame = 0;
  return scenes.map((scene, idx) => {
    const startFrame = accumulatedFrame;
    const durationInFrames = Math.max(15, scene.durationInFrames);
    accumulatedFrame += durationInFrames;

    return {
      id: scene.id,
      name: `Scene ${idx + 1}: ${scene.name}`,
      startFrame,
      durationInFrames,
      color: getTemplateColor(scene.templateType),
      description: scene.subtitle || scene.title || scene.name,
      templateType: scene.templateType,
      transitionNext: scene.transitionNext,
      hideText: scene.hideText,
      hideBadge: scene.hideBadge,
    };
  });
}

export function calculateSequenceBlocks(totalFrames: number, scenes?: VideoScene[]): SequenceBlock[] {
  if (scenes && scenes.length > 0) {
    return calculateSceneBlocks(scenes);
  }

  // Canonical 4-act fallback
  const hookDuration = Math.round(totalFrames * 0.20);
  const featureDuration = Math.round(totalFrames * 0.35);
  const metricDuration = Math.round(totalFrames * 0.25);
  const ctaDuration = totalFrames - (hookDuration + featureDuration + metricDuration);

  return [
    {
      id: 'hook',
      name: 'Act 1: Hook & Intro',
      startFrame: 0,
      durationInFrames: hookDuration,
      color: '#6366f1',
      description: 'Animated badge entrance, kinetic headline with spring damping',
      templateType: 'hook-title',
    },
    {
      id: 'showcase',
      name: 'Act 2: Core Showcase',
      startFrame: hookDuration,
      durationInFrames: featureDuration,
      color: '#06b6d4',
      description: 'Staggered feature pill cards, spotlight visuals, and icon pop-in',
      templateType: 'feature-grid',
    },
    {
      id: 'metric',
      name: 'Act 3: Impact & Proof',
      startFrame: hookDuration + featureDuration,
      durationInFrames: metricDuration,
      color: '#8b5cf6',
      description: 'Numeric counter animation via interpolate(), glowing metric card',
      templateType: 'metric-impact',
    },
    {
      id: 'cta',
      name: 'Act 4: Outro & CTA',
      startFrame: hookDuration + featureDuration + metricDuration,
      durationInFrames: ctaDuration,
      color: '#10b981',
      description: 'Action trigger button pulse, branding logo, URL and follow-up prompt',
      templateType: 'outro-cta',
    },
  ];
}

export function getTotalFrames(scenes?: VideoScene[], durationSeconds: number = 10, fps: number = 30): number {
  if (scenes && scenes.length > 0) {
    return scenes.reduce((sum, s) => sum + Math.max(15, s.durationInFrames), 0);
  }
  return secondsToFrames(durationSeconds, fps);
}

export function sampleSpringCurve(steps: number = 20): number[] {
  const result: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const val = 1 - Math.exp(-5 * t) * Math.cos(8 * t);
    result.push(Number(val.toFixed(3)));
  }
  return result;
}

export interface RenderPhaseInfo {
  phase: 'init' | 'stitching' | 'encoding' | 'muxing' | 'completed';
  title: string;
  subtitle: string;
}

export function getRenderPhase(progress: number): RenderPhaseInfo {
  if (progress < 20) {
    return {
      phase: 'init',
      title: 'Meluncurkan Headless Chromium...',
      subtitle: 'Menginisialisasi GPU software canvas & memory buffer frame',
    };
  }
  if (progress < 60) {
    return {
      phase: 'stitching',
      title: 'Menyusun Frame Komposisi React...',
      subtitle: 'Merender graf komponen Remotion per-frame secara deterministik',
    };
  }
  if (progress < 90) {
    return {
      phase: 'encoding',
      title: 'Mengompresi Video Stream (FFmpeg)...',
      subtitle: 'Encoding visual stream H.264 / AAC @ 30 fps (High Profile)',
    };
  }
  if (progress < 100) {
    return {
      phase: 'muxing',
      title: 'Finalisasi Kontainer MP4...',
      subtitle: 'Muxing metadata track video dan mengoptimalkan FastStart streaming',
    };
  }
  return {
    phase: 'completed',
    title: 'Render Video Berhasil!',
    subtitle: 'File MP4 siap diunduh dan diputar di semua platform',
  };
}

export function estimateVideoFileSize(durationSec: number, format: VideoFormat): string {
  const bitrateMbps = format === '9:16' ? 3.8 : 4.5;
  const sizeMb = (durationSec * bitrateMbps) / 8;
  return `${sizeMb.toFixed(1)} MB`;
}
