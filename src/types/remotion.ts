export type VideoFormat = '16:9' | '9:16';

export type TransitionType =
  | 'none'
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'zoom-in'
  | 'zoom-out'
  | 'wipe'
  | 'glitch'
  | 'blur';

export interface SceneTransition {
  type: TransitionType;
  durationInFrames: number;
}

export type SceneTemplateType =
  | 'hook-title'
  | 'feature-grid'
  | 'metric-impact'
  | 'split-comparison'
  | 'quote-testimonial'
  | 'product-showcase'
  | 'cyber-glitch'
  | 'outro-cta';

export interface VideoScene {
  id: string;
  templateType: SceneTemplateType;
  name: string;
  durationInFrames: number;
  transitionNext?: SceneTransition;
  
  // Dynamic scene content
  title?: string;
  subtitle?: string;
  badgeText?: string;
  accentColor?: string;
  secondaryColor?: string;
  items?: string[];
  metricNumber?: string;
  metricLabel?: string;
  ctaText?: string;
  brandName?: string;
  author?: string;
  authorRole?: string;
  beforeText?: string;
  afterText?: string;
}

export interface VisualElementsConfig {
  badgeText: string;
  headline: string;
  subheadline: string;
  accentColor: string;
  secondaryColor: string;
  backgroundColor: string;
  featureList: string[];
  metricNumber: string;
  metricLabel: string;
  ctaText: string;
  brandName: string;
  animationStyle: 'spring-smooth' | 'spring-bouncy' | 'tech-snappy';
  backgroundStyle: 'gradient-mesh' | 'dark-cyber' | 'clean-minimal' | 'aurora';
}

export interface VideoBrief {
  id: string;
  topic: string;
  format: VideoFormat;
  durationSeconds: number;
  fps: number;
  visualElements: VisualElementsConfig;
  scenes: VideoScene[];
}

export interface SequenceBlock {
  id: string;
  name: string;
  startFrame: number;
  durationInFrames: number;
  color: string;
  description: string;
  templateType: SceneTemplateType;
  transitionNext?: SceneTransition;
}

export interface GeneratedCodeBundle {
  rootCode: string;
  compositionCode: string;
  schemaCode: string;
  instructionsMd: string;
}
