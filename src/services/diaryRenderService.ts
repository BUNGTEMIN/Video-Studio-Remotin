/**
 * Diary & Olip Video Studio Cloud Run Render Engine Integration
 * Connects CapCut Studio to the central headless Remotion render engine
 * deployed on Google Cloud Run Jakarta (asia-southeast2) & Termux Local Daemon.
 */

import type { VideoBrief, VideoScene, DiaryProjectPayload } from '../types/remotion';

export const DIARY_CLOUD_RUN_URL = 'https://diary-studio-280833756345.asia-southeast2.run.app';
export const DIARY_TERMUX_LOCAL_URL = 'http://localhost:8089';

export interface DiaryEngineHealth {
  status: string;
  service: string;
  region: string;
  uptime?: number;
  online: boolean;
}

export interface DiaryRenderResult {
  success: boolean;
  jobId?: string;
  status: 'completed' | 'queued' | 'rendering' | 'error';
  file?: string;
  sizeMb?: number;
  engine?: string;
  downloadUrl?: string;
  message?: string;
}

/**
 * Check health & connectivity to the central Diary Render Engine on Cloud Run
 */
export async function checkDiaryEngineHealth(
  endpointUrl: string = DIARY_CLOUD_RUN_URL
): Promise<DiaryEngineHealth> {
  try {
    const res = await fetch(`${endpointUrl}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      throw new Error(`Health check returned ${res.status}`);
    }

    const data = await res.json();
    return {
      status: data.status || 'running',
      service: data.service || 'Diary & Olip Video Studio Render Engine',
      region: data.region || 'asia-southeast2 (Jakarta)',
      uptime: data.uptime,
      online: true,
    };
  } catch (error) {
    return {
      status: 'offline',
      service: 'Diary & Olip Video Studio Render Engine',
      region: 'asia-southeast2 (Jakarta)',
      online: false,
    };
  }
}

/**
 * Converts a CapCut VideoBrief into the unified Diary Motion project format
 */
export function convertBriefToDiaryProject(brief: VideoBrief): DiaryProjectPayload {
  const currentDateStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const pages = (brief.scenes && brief.scenes.length > 0 ? brief.scenes : []).map((sc, idx) => {
    let quoteText = '';
    if (sc.templateType === 'diary-paper') {
      quoteText = sc.subtitle || sc.title || '';
    } else if (sc.subtitle) {
      quoteText = `${sc.title ? `${sc.title}\n\n` : ''}${sc.subtitle}`;
    } else if (sc.title) {
      quoteText = sc.title;
    } else if (sc.items && sc.items.length > 0) {
      quoteText = sc.items.map((it, i) => `${i + 1}. ${it}`).join('\n');
    } else {
      quoteText = `Adegan Catatan #${idx + 1}`;
    }

    return {
      quote: quoteText,
      sign: sc.authorRole || sc.author || (brief.visualElements.brandName ? `— ${brief.visualElements.brandName}` : ''),
      duration: Math.max(3, Math.round((sc.durationInFrames || 90) / brief.fps)),
      pause_duration: 1.5,
    };
  });

  return {
    title: brief.topic || '🌿 Catatan Video CapCut & Diary Studio',
    date_text: currentDateStr,
    bg_scene: 'meja_kayu',
    paper_style: 'ruled',
    font_name: 'caveat',
    font_size: 50,
    ink_color: brief.visualElements.accentColor || '#1a368a',
    audio_file: 'bgm_motivation_sample.mp3',
    pause_duration: 1.5,
    overlays: {
      stamp: 'catatan_hati',
      tape: 'pink',
      photo: 'none',
      filter: 'warm_leak',
    },
    pages: pages.length > 0 ? pages : [
      {
        quote: brief.topic || 'Satu langkah kecil setiap hari lebih baik daripada menunggu sempurna.',
        sign: '— CapCut & Diary Studio ✨',
        duration: 4,
        pause_duration: 1.5,
      },
    ],
  };
}

/**
 * ============================================================================
 * 1:1 REMOTION NATIVE ENGINE INTEGRATION (OLIP & CAPCUT SYNERGY)
 * Directly renders the actual timeline with Chromium headless on Cloud Run Jakarta.
 * Matches Hook Title, Terminal Hacker, Stat Counter, Top List, Image, etc. 1:1!
 * ============================================================================
 */

export interface OlipSceneData {
  id: string;
  name: string;
  durationInSeconds: number;
  title: string;
  subtitle?: string;
  content: string;
  themeColor?: string;
  transitionToNext?: 'slide_right' | 'slide_left' | 'slide_up' | 'fade' | 'flip' | 'wipe' | 'none';
  sceneType?: string;
  imageUrl?: string;
  characterId?: string;
  avatarPosition?: 'center' | 'bottom' | 'left' | 'right';
}

export interface OlipRemotionProject {
  title: string;
  templateId: string;
  scenes: OlipSceneData[];
  fps?: number;
  audioUrl?: string;
  audioTitle?: string;
  authorName?: string;
  authorHandle?: string;
}

export function mapCapCutTemplateToOlipSceneType(templateType?: string): string {
  switch (templateType) {
    case 'hook-title':
      return 'breaking_news';
    case 'cyber-glitch':
      return 'terminal_hacker';
    case 'image-gallery':
      return 'image';
    case 'feature-grid':
      return 'top_list';
    case 'split-comparison':
      return 'story';
    case 'metric-impact':
      return 'stat_counter';
    case 'quote-testimonial':
      return 'quote_minimal';
    case 'diary-paper':
      return 'diary_paper';
    case 'outro-cta':
      return 'chat_dm';
    default:
      return 'breaking_news';
  }
}

export function mapTransitionType(
  type?: string
): 'slide_right' | 'slide_left' | 'slide_up' | 'fade' | 'flip' | 'wipe' | 'none' {
  switch (type) {
    case 'slide-left':
      return 'slide_left';
    case 'slide-right':
      return 'slide_right';
    case 'slide-up':
      return 'slide_up';
    case 'fade':
      return 'fade';
    case 'wipe':
      return 'wipe';
    case 'flip':
      return 'flip';
    case 'glitch':
    case 'zoom-in':
    case 'zoom-out':
    case 'blur':
      return 'fade';
    default:
      return 'fade';
  }
}

/**
 * Converts the actual CapCut VideoBrief into the 1:1 Olip Remotion Project structure
 */
export function convertBriefToOlipRemotionProject(brief: VideoBrief): OlipRemotionProject {
  const fps = brief.fps || 30;
  const scenes: OlipSceneData[] = (brief.scenes && brief.scenes.length > 0 ? brief.scenes : []).map((sc, idx) => {
    const sceneType = mapCapCutTemplateToOlipSceneType(sc.templateType);
    const durationInSeconds = Math.max(
      2,
      Math.round(((sc.durationInFrames || 90) / fps) * 10) / 10
    );

    let contentText = '';
    if (sc.items && sc.items.length > 0) {
      contentText = sc.items.map((it, i) => `${i + 1}. ${it}`).join('\n');
    } else if (sc.beforeText && sc.afterText) {
      contentText = `Sebelum: ${sc.beforeText}\nSesudah: ${sc.afterText}`;
    } else if (sc.metricNumber) {
      contentText = `${sc.metricNumber} ${sc.metricLabel || ''}\n${sc.subtitle || ''}`;
    } else if (sc.subtitle) {
      contentText = sc.subtitle;
    } else {
      contentText = sc.title || `Adegan #${idx + 1}`;
    }

    return {
      id: sc.id || `scene-${idx + 1}`,
      name: sc.name || `Adegan ${idx + 1}`,
      durationInSeconds,
      title: sc.title || sc.name,
      subtitle: sc.subtitle || sc.badgeText || '',
      content: contentText,
      themeColor: sc.accentColor || brief.visualElements?.accentColor || '#6366f1',
      transitionToNext: mapTransitionType(sc.transitionNext?.type),
      sceneType,
      imageUrl: sc.imageUrl || (sc.galleryImages && sc.galleryImages[0]?.url) || undefined,
    };
  });

  const firstSceneType = scenes[0]?.sceneType || 'breaking_news';

  return {
    title: brief.topic || 'Video Proyek Remotion',
    templateId: firstSceneType,
    scenes,
    fps,
    authorName: brief.visualElements?.brandName || 'Aa Baim',
    authorHandle: '@bungtemin',
  };
}

/**
 * Converts a single template from the Template Editor into a 1-scene 1:1 Remotion Project
 */
export function convertTemplateToOlipRemotionProject(
  templateName: string,
  scene: Partial<VideoScene>,
  format: '16:9' | '9:16' = '9:16'
): OlipRemotionProject {
  const sceneType = mapCapCutTemplateToOlipSceneType(scene.templateType);
  const durationInSeconds = Math.max(
    2.5,
    Math.round(((scene.durationInFrames || 90) / 30) * 10) / 10
  );

  let contentText = '';
  if (scene.items && scene.items.length > 0) {
    contentText = scene.items.map((it: string, idx: number) => `${idx + 1}. ${it}`).join('\n');
  } else if (scene.metricNumber) {
    contentText = `${scene.metricNumber} ${scene.metricLabel || ''}\n${scene.subtitle || ''}`;
  } else if (scene.beforeText && scene.afterText) {
    contentText = `Sebelum: ${scene.beforeText}\nSesudah: ${scene.afterText}`;
  } else if (scene.subtitle) {
    contentText = scene.subtitle;
  } else {
    contentText = scene.title || templateName;
  }

  const singleScene: OlipSceneData = {
    id: `scene-test-${Date.now()}`,
    name: templateName,
    durationInSeconds,
    title: scene.title || templateName,
    subtitle: scene.subtitle || scene.badgeText || '',
    content: contentText,
    themeColor: scene.accentColor || '#6366f1',
    transitionToNext: 'fade',
    sceneType,
    imageUrl: scene.imageUrl || (scene.galleryImages && scene.galleryImages[0]?.url) || undefined,
  };

  return {
    title: `🧪 Test Template: ${templateName}`,
    templateId: sceneType,
    scenes: [singleScene],
    fps: 30,
    authorName: scene.author || 'Aa Baim',
    authorHandle: scene.authorRole || '@bungtemin',
  };
}

/**
 * Dispatches an actual timeline project to Cloud Run Jakarta via /api/render-job
 * (Chromium headless 1:1 High Fidelity Remotion Engine)
 */
export async function requestOlipRemotionRender(
  project: OlipRemotionProject,
  options: {
    endpointUrl?: string;
    sendTelegram?: boolean;
    chatId?: string;
  } = {}
): Promise<DiaryRenderResult> {
  const endpoint = options.endpointUrl || DIARY_CLOUD_RUN_URL;
  const jobId = `capcut_remotion_${Date.now()}`;

  const requestBody = {
    project,
    jobId,
    chatId: options.sendTelegram ? (options.chatId || '560232533') : null,
    stream: false,
  };

  try {
    const res = await fetch(`${endpoint}/api/render-job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        success: false,
        status: 'error',
        message: `Cloud Run HTTP ${res.status}: ${text}`,
      };
    }

    const data = await res.json();
    const filename = data.file || 'output.mp4';
    const downloadUrl = `${endpoint}/out/${filename}`;
    const sizeMb = typeof data.sizeMb === 'string' ? parseFloat(data.sizeMb) : (data.sizeMb || 2.5);

    return {
      success: data.success !== false,
      jobId: data.jobId || jobId,
      status: 'completed',
      file: filename,
      sizeMb: isNaN(sizeMb) ? 2.5 : sizeMb,
      engine: data.engine || 'Remotion Engine (1:1 High Fidelity Actual Timeline)',
      downloadUrl,
      message: data.message || `Video berhasil dirender dengan Remotion Native Engine 1:1 (${filename})!`,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'error',
      message: err.message || 'Gagal menghubungi Remotion Render Engine Cloud Run',
    };
  }
}

/**
 * Converts an individual template or sandbox scene from the Template Editor
 * into a standalone DiaryProjectPayload for quick Cloud Run testing.
 */
export function convertTemplateToDiaryProject(
  templateName: string,
  scene: Partial<VideoScene>,
  format: '16:9' | '9:16' = '9:16'
): DiaryProjectPayload {
  const currentDateStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  let quoteText = '';
  if (scene.subtitle && scene.title) {
    quoteText = `${scene.title}\n\n${scene.subtitle}`;
  } else if (scene.subtitle) {
    quoteText = scene.subtitle;
  } else if (scene.title) {
    quoteText = scene.title;
  } else if (scene.items && scene.items.length > 0) {
    quoteText = `${scene.title ? `${scene.title}\n\n` : ''}${scene.items.map((it: string) => `• ${it}`).join('\n')}`;
  } else {
    quoteText = `Uji Coba Template: ${templateName}`;
  }

  const durationSec = Math.max(4, Math.round((scene.durationInFrames || 90) / 30));

  return {
    title: `🧪 Test Template: ${templateName}`,
    date_text: currentDateStr,
    bg_scene: 'meja_kayu',
    paper_style: 'ruled',
    font_name: 'caveat',
    font_size: 48,
    ink_color: scene.accentColor || '#1a368a',
    audio_file: 'Menepi_di_Savannah_afacb19f.mp3',
    pause_duration: 1.5,
    overlays: {
      stamp: 'catatan_hati',
      tape: 'pink',
      photo: 'none',
      filter: 'warm_leak',
    },
    pages: [
      {
        quote: quoteText,
        sign: scene.authorRole || scene.author || `— ${templateName} (CapCut Engine) ✨`,
        duration: durationSec,
        pause_duration: 1.5,
      },
    ],
  };
}

/**
 * Saves project directly into Diary Studio Database (`diary_projects.db`)
 */
export async function saveProjectToDiaryStudio(
  payload: DiaryProjectPayload,
  endpointUrl: string = DIARY_CLOUD_RUN_URL
): Promise<{ success: boolean; id?: number; message?: string }> {
  try {
    const res = await fetch(`${endpointUrl}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, message: `Server error: ${res.status} ${errText}` };
    }

    const data = await res.json();
    return { success: true, id: data.id || data.project_id, message: data.message };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal menyimpan ke Diary Studio' };
  }
}

/**
 * Dispatches a render job to Cloud Run Jakarta.
 * Intelligently routes between Remotion Native 1:1 Engine (/api/render-job)
 * and Diary Paper Engine (/api/generate-video).
 */
export async function requestDiaryCloudRender(
  payload: DiaryProjectPayload,
  options: {
    endpointUrl?: string;
    sendTelegram?: boolean;
    chatId?: string;
    botToken?: string;
  } = {}
): Promise<DiaryRenderResult> {
  const endpoint = options.endpointUrl || DIARY_CLOUD_RUN_URL;
  const jobId = `capcut_job_${Date.now()}`;

  const requestBody = {
    project: payload,
    jobId,
    chat_id: options.sendTelegram ? (options.chatId || '560232533') : null,
    bot_token: options.botToken || null,
    stream: false,
  };

  try {
    const res = await fetch(`${endpoint}/api/generate-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        success: false,
        status: 'error',
        message: `Cloud Run HTTP ${res.status}: ${text}`,
      };
    }

    const data = await res.json();
    const filename = data.filename || data.file || 'rendered_video.mp4';
    const relativeUrl = data.url || `/out/${filename}`;
    const downloadUrl = relativeUrl.startsWith('http')
      ? relativeUrl
      : `${endpoint}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;

    const sizeMb = data.sizeMb || (data.duration ? Math.round(data.duration * 0.12 * 10) / 10 : 2.5);

    return {
      success: data.status === 'success' || !data.status,
      jobId: data.jobId || jobId,
      status: 'completed',
      file: filename,
      sizeMb: sizeMb,
      engine: data.engine || 'Cloud Run Jakarta (Chromium + FFmpeg)',
      downloadUrl,
      message: data.message || `Video berhasil dirender di Cloud Run Jakarta (${filename}, durasi ${data.duration || '~15'}s)!`,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'error',
      message: err.message || 'Gagal menghubungi pusat render Cloud Run',
    };
  }
}


