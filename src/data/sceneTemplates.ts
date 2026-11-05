import type { SceneTemplateType, TransitionType, VideoScene, SceneTransition } from '../types/remotion';

export interface SceneTemplateMeta {
  type: SceneTemplateType;
  title: string;
  category: 'Intro' | 'Fitur' | 'Data' | 'Komparasi' | 'Outro';
  description: string;
  badge: string;
  defaultDurationInFrames: number;
  iconName: string;
  color: string;
  previewGradient: string;
  defaultContent: Partial<VideoScene>;
}

export const TRANSITION_CATALOG: {
  type: TransitionType;
  name: string;
  description: string;
  defaultFrames: number;
  badge: string;
}[] = [
  {
    type: 'fade',
    name: 'Fade / Dissolve',
    description: 'Transisi silang lembut dengan interpolasi opasitas halus.',
    defaultFrames: 15,
    badge: 'Populer',
  },
  {
    type: 'slide-left',
    name: 'Slide Kiri',
    description: 'Adegan bergeser ke kiri dengan pegas Remotion snappier.',
    defaultFrames: 15,
    badge: 'Dinamis',
  },
  {
    type: 'slide-right',
    name: 'Slide Kanan',
    description: 'Adegan bergeser ke arah kanan dengan akselerasi mulus.',
    defaultFrames: 15,
    badge: 'Smooth',
  },
  {
    type: 'slide-up',
    name: 'Slide Ke Atas',
    description: 'Transisi vertikal naik, ideal untuk transisi Reels/TikTok.',
    defaultFrames: 15,
    badge: 'Mobile',
  },
  {
    type: 'zoom-in',
    name: 'Zoom In Punch',
    description: 'Efek pembesaran skala kamera mendalam saat berganti adegan.',
    defaultFrames: 14,
    badge: 'Impact',
  },
  {
    type: 'zoom-out',
    name: 'Zoom Out Reveal',
    description: 'Efek mundur cepat memperlihatkan adegan berikutnya.',
    defaultFrames: 14,
    badge: 'Cinematic',
  },
  {
    type: 'wipe',
    name: 'Curtain Wipe',
    description: 'Penyapuan tirai linier modern dari kiri ke kanan.',
    defaultFrames: 16,
    badge: 'Pro',
  },
  {
    type: 'glitch',
    name: 'Cyber Glitch',
    description: 'Kilatan RGB chromatic aberration dan distorsi frame digital.',
    defaultFrames: 10,
    badge: 'High-Tech',
  },
  {
    type: 'blur',
    name: 'Motion Blur Dissolve',
    description: 'Pengaburan gerakan optik saat perpindahan adegan.',
    defaultFrames: 14,
    badge: 'Modern',
  },
  {
    type: 'none',
    name: 'Potong Langsung (Hard Cut)',
    description: 'Perpindahan langsung instan antar frame tanpa jeda.',
    defaultFrames: 0,
    badge: 'Instant',
  },
];

export const SCENE_TEMPLATES_CATALOG: SceneTemplateMeta[] = [
  {
    type: 'hook-title',
    title: 'Kinetic Hook & Headline',
    category: 'Intro',
    description: 'Judul kinetik berukuran besar dengan badge glow pembuka perhatian audiens dalam 3 detik pertama.',
    badge: '3 Detik Awal',
    defaultDurationInFrames: 90,
    iconName: 'Flame',
    color: '#6366f1',
    previewGradient: 'from-indigo-600/30 to-cyan-500/20',
    defaultContent: {
      title: 'Solusi Tercanggih Video Generatif 2026',
      subtitle: 'Tingkatkan produktivitas pembuatan video hingga 10x lipat dengan kode React Remotion',
      badgeText: 'TEKNOLOGI TERBARU',
    },
  },
  {
    type: 'cyber-glitch',
    title: 'Cyberpunk Glitch Hook',
    category: 'Intro',
    description: 'Teks berenergi tinggi dengan aksen neon glitch, badge peringatan, dan tipografi tegas.',
    badge: 'Energi Tinggi',
    defaultDurationInFrames: 75,
    iconName: 'Zap',
    color: '#ec4899',
    previewGradient: 'from-pink-600/30 to-purple-600/20',
    defaultContent: {
      title: 'JANGAN EDIT VIDEO MANUAL LAGI!',
      subtitle: 'Otomatisasi seluruh alur kerja video Anda dengan sekali klik',
      badgeText: 'ALERT SISTEM #01',
    },
  },
  {
    type: 'feature-grid',
    title: '3-Card Feature Grid',
    category: 'Fitur',
    description: 'Tiga kartu kaca (glassmorphism) interaktif dengan nomor langkah dan efek spring berurutan.',
    badge: 'Kartu Showcase',
    defaultDurationInFrames: 120,
    iconName: 'LayoutGrid',
    color: '#06b6d4',
    previewGradient: 'from-cyan-600/30 to-blue-600/20',
    defaultContent: {
      title: 'Tiga Pilar Keunggulan Utama',
      subtitle: 'Dibangun khusus untuk performa tinggi dan skalabilitas tanpa batas',
      badgeText: 'FITUR UNGGULAN',
      items: [
        'Animasi Fisika Spring Remotion Presisi',
        'Skema Tipe Valid Zod & TypeScript',
        'Render Headless Chromium di Cloud',
      ],
    },
  },
  {
    type: 'product-showcase',
    title: 'Product & Mockup Showcase',
    category: 'Fitur',
    description: 'Frame perangkat mockup dengan highlight spesifikasi produk dan kartu melayang.',
    badge: 'Display Produk',
    defaultDurationInFrames: 105,
    iconName: 'Layers',
    color: '#3b82f6',
    previewGradient: 'from-blue-600/30 to-indigo-600/20',
    defaultContent: {
      title: 'Workstation CapCut Remotion Pro',
      subtitle: 'Integrasi penuh antara fleksibilitas kode dan visual editor modern',
      badgeText: 'EDISI SPESIAL',
      items: ['Multi-track Timeline', 'Live Safe-Area Guide', 'Ekspor MP4 Instan'],
    },
  },
  {
    type: 'metric-impact',
    title: 'Big Metric & Impact Counter',
    category: 'Data',
    description: 'Penghitung angka raksasa animasi interpolasi dengan efek glow radial untuk bukti performa.',
    badge: 'Bukti & Metrik',
    defaultDurationInFrames: 90,
    iconName: 'TrendingUp',
    color: '#10b981',
    previewGradient: 'from-emerald-600/30 to-teal-600/20',
    defaultContent: {
      metricNumber: '10x',
      metricLabel: 'Peningkatan Kecepatan Rendering Video',
      badgeText: 'HASIL RISET',
      subtitle: 'Teruji di ribuan pipeline render skala produksi',
    },
  },
  {
    type: 'split-comparison',
    title: 'Before vs After (Masalah vs Solusi)',
    category: 'Komparasi',
    description: 'Perbandingan visual terbelah: cara lama yang lambat vs cara baru yang instan dan otomatis.',
    badge: 'Komparasi Jelas',
    defaultDurationInFrames: 110,
    iconName: 'Columns',
    color: '#f59e0b',
    previewGradient: 'from-amber-600/30 to-rose-600/20',
    defaultContent: {
      title: 'Perbandingan Efisiensi Kerja',
      badgeText: 'PERBANDINGAN NYATA',
      beforeText: 'Cara Lama: Edit manual frame-by-frame, makan waktu berjam-jam dan rentan salah.',
      afterText: 'Cara Baru: Cukup tulis skrip kode, render ratusan variasi video secara otomatis!',
    },
  },
  {
    type: 'quote-testimonial',
    title: 'Customer Testimonial & Quote',
    category: 'Data',
    description: 'Kutipan testimoni klien dengan rating 5 bintang, nama pembicara, dan jabatan kredibel.',
    badge: 'Social Proof',
    defaultDurationInFrames: 95,
    iconName: 'Quote',
    color: '#8b5cf6',
    previewGradient: 'from-purple-600/30 to-pink-600/20',
    defaultContent: {
      title: '"Remotion mengubah total cara tim kami memproduksi konten video harian!"',
      subtitle: 'Kualitas video konsisten dan proses render berjalan otomatis di background.',
      badgeText: 'TESTIMONI KLIEN',
      author: 'Budi Santoso',
      authorRole: 'Head of Growth Marketing',
    },
  },
  {
    type: 'outro-cta',
    title: 'Outro & Call to Action (CTA)',
    category: 'Outro',
    description: 'Adegan penutup dengan logo brand berdenyut, tombol ajakan bertindak (CTA), dan handle media.',
    badge: 'Konversi Penutup',
    defaultDurationInFrames: 90,
    iconName: 'Sparkles',
    color: '#06b6d4',
    previewGradient: 'from-cyan-600/30 to-indigo-600/20',
    defaultContent: {
      title: 'Mulai Rancang Video Remotion Sekarang',
      subtitle: 'Buka Remotion Studio atau salin kode TypeScript langsung ke proyek Anda.',
      ctaText: 'Coba Sekarang Gratis',
      brandName: 'CloudVideo AI',
      badgeText: 'PENAWARAN TERBATAS',
    },
  },
];

export function createSceneFromTemplate(
  templateType: SceneTemplateType,
  overrides?: Partial<VideoScene>
): VideoScene {
  const meta = SCENE_TEMPLATES_CATALOG.find((t) => t.type === templateType) || SCENE_TEMPLATES_CATALOG[0];
  const uniqueId = `scene-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  return {
    id: uniqueId,
    templateType,
    name: meta.title,
    durationInFrames: meta.defaultDurationInFrames,
    transitionNext: {
      type: 'fade',
      durationInFrames: 15,
    },
    ...meta.defaultContent,
    ...overrides,
  };
}
