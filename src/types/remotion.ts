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
  | 'image-gallery'
  | 'metric-impact'
  | 'split-comparison'
  | 'quote-testimonial'
  | 'product-showcase'
  | 'cyber-glitch'
  | 'diary-paper'
  | 'outro-cta';

export interface DiaryProjectPayload {
  title: string;
  date_text?: string;
  bg_scene?: string;
  paper_style?: string;
  font_name?: string;
  font_size?: number;
  ink_color?: string;
  audio_file?: string;
  pause_duration?: number;
  overlays?: {
    stamp?: string;
    tape?: string;
    photo?: string;
    filter?: string;
  };
  pages: {
    quote: string;
    sign?: string;
    duration?: number;
    pause_duration?: number;
  }[];
}

export interface GalleryImageItem {
  id: string;
  url: string;
  title: string;
  subtitle?: string;
  tag?: string;
}

export interface VideoScene {
  id: string;
  templateType: SceneTemplateType;
  name: string;
  durationInFrames: number;
  transitionNext?: SceneTransition;
  
  // Layer visibility toggles (Decoupled overlay system)
  hideText?: boolean;
  hideBadge?: boolean;

  // Dynamic scene content & V1 Visual Engine Parameters
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

  // Specific to image-gallery template
  imageUrl?: string;
  galleryImages?: GalleryImageItem[];
  layoutVariant?: 'carousel' | 'stack' | 'polaroid';
}

export interface CustomTemplate {
  id: string;
  name: string;
  templateType: SceneTemplateType;
  category: 'Intro' | 'Galeri' | 'Fitur' | 'Data' | 'Komparasi' | 'Outro';
  description: string;
  badge: string;
  defaultDurationInFrames: number;
  iconName: string;
  accentColor: string;
  secondaryColor: string;
  previewGradient: string;
  isCustom?: boolean;
  content: Partial<VideoScene>;
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

export interface AudioTrackConfig {
  id: string;
  name: string;
  bpm: number;
  genre: string;
  volume: number; // 0 - 100
  isMuted: boolean;
  sfxTransitions: boolean;
}

export interface TrackVisibilityConfig {
  video: boolean;
  text: boolean;
  graphics: boolean;
  audio: boolean;
}

export interface VideoBrief {
  id: string;
  topic: string;
  format: VideoFormat;
  durationSeconds: number;
  fps: number;
  visualElements: VisualElementsConfig;
  scenes: VideoScene[];
  audioConfig?: AudioTrackConfig;
  trackVisibility?: TrackVisibilityConfig;
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
  hideText?: boolean;
  hideBadge?: boolean;
}

export interface GeneratedCodeBundle {
  rootCode: string;
  compositionCode: string;
  schemaCode: string;
  instructionsMd: string;
}

