import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Copy,
  Trash2,
  Check,
  Sparkles,
  Image as ImageIcon,
  LayoutGrid,
  Flame,
  Zap,
  TrendingUp,
  Columns,
  Quote,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ArrowLeft,
  Ratio,
  Eye,
  EyeOff,
  Film,
  Palette,
  Wand2,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  Cloud,
  Download,
  Send,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import type {
  VideoBrief,
  VideoFormat,
  VideoScene,
  SceneTemplateType,
  CustomTemplate,
  GalleryImageItem,
} from '../../types/remotion';
import { SCENE_TEMPLATES_CATALOG, createSceneFromTemplate } from '../../data/sceneTemplates';
import { LiveRemotionComposition } from '../remotion/LiveRemotionComposition';
import { Player } from '@remotion/player';
import {
  convertTemplateToDiaryProject,
  convertTemplateToOlipRemotionProject,
  requestDiaryCloudRender,
  requestOlipRemotionRender,
  saveProjectToDiaryStudio,
  checkDiaryEngineHealth,
  DIARY_CLOUD_RUN_URL,
  type DiaryRenderResult,
  type DiaryEngineHealth,
} from '../../services/diaryRenderService';


interface TemplateEditorPageProps {
  brief: VideoBrief;
  onUpdateBrief: (brief: VideoBrief) => void;
  onBackToTimeline: () => void;
  activeSceneId?: string;
  onSelectSceneId?: (id: string) => void;
}

// Initial default templates constructed from catalog
const INITIAL_TEMPLATES: CustomTemplate[] = SCENE_TEMPLATES_CATALOG.map((cat, idx) => ({
  id: `tmpl-${cat.type}-${idx}`,
  name: cat.title,
  templateType: cat.type,
  category: cat.category,
  description: cat.description,
  badge: cat.badge,
  defaultDurationInFrames: cat.defaultDurationInFrames,
  iconName: cat.iconName,
  accentColor: cat.color,
  secondaryColor: cat.type === 'cyber-glitch' ? '#ec4899' : '#3b82f6',
  previewGradient: cat.previewGradient,
  isCustom: false,
  content: {
    ...cat.defaultContent,
    templateType: cat.type,
    name: cat.title,
    durationInFrames: cat.defaultDurationInFrames,
  },
}));

export const TemplateEditorPage: React.FC<TemplateEditorPageProps> = ({
  brief,
  onUpdateBrief,
  onBackToTimeline,
  activeSceneId,
  onSelectSceneId,
}) => {
  // Library of templates
  const [templates, setTemplates] = useState<CustomTemplate[]>(INITIAL_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    INITIAL_TEMPLATES.find((t) => t.templateType === 'image-gallery')?.id || INITIAL_TEMPLATES[0].id
  );

  // Category filter
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  // Sandbox player states
  const [sandboxFormat, setSandboxFormat] = useState<VideoFormat>(brief.format || '16:9');
  const [sandboxFrame, setSandboxFrame] = useState<number>(25);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showOverlaysInSandbox, setShowOverlaysInSandbox] = useState<boolean>(true);

  // Active tab in parameter editor
  const [editorTab, setEditorTab] = useState<'visual' | 'media' | 'overlays'>('visual');

  // Mobile responsive section switcher: 'catalog' | 'preview' | 'params'
  const [mobileSection, setMobileSection] = useState<'catalog' | 'preview' | 'params'>('preview');

  // Toast / feedback message
  const [notification, setNotification] = useState<string | null>(null);

  // Cloud Run Template Testing State
  const [isCloudTestModalOpen, setIsCloudTestModalOpen] = useState<boolean>(false);
  const [isTestingCloudRender, setIsTestingCloudRender] = useState<boolean>(false);
  const [cloudTestResult, setCloudTestResult] = useState<DiaryRenderResult | null>(null);
  const [cloudTestError, setCloudTestError] = useState<string | null>(null);
  const [testSendTelegram, setTestSendTelegram] = useState<boolean>(true);
  const [testSaveDb, setTestSaveDb] = useState<boolean>(true);
  const [engineHealth, setEngineHealth] = useState<DiaryEngineHealth | null>(null);
  const [testDurationSec, setTestDurationSec] = useState<number>(6);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenCloudTestModal = () => {
    setIsCloudTestModalOpen(true);
    setCloudTestError(null);
    setCloudTestResult(null);
    checkDiaryEngineHealth().then(setEngineHealth);
  };

  const handleStartTemplateCloudRender = async () => {
    setIsTestingCloudRender(true);
    setCloudTestError(null);
    setCloudTestResult(null);

    // Save to Diary Studio DB for persistence
    if (testSaveDb) {
      try {
        const diaryPayload = convertTemplateToDiaryProject(
          selectedTemplate.name,
          {
            ...selectedTemplate.content,
            title: selectedTemplate.content.title || selectedTemplate.name,
            subtitle: selectedTemplate.content.subtitle || selectedTemplate.description,
            badgeText: selectedTemplate.content.badgeText,
            accentColor: selectedTemplate.accentColor,
            durationInFrames: testDurationSec * 30,
          },
          sandboxFormat
        );
        await saveProjectToDiaryStudio(diaryPayload);
      } catch (e) {
        console.warn('Gagal simpan ke DB:', e);
      }
    }

    try {
      let result: DiaryRenderResult;
      // If diary-paper template is chosen, use diary renderer; otherwise use 1:1 Remotion native
      if (selectedTemplate.templateType === 'diary-paper') {
        const diaryPayload = convertTemplateToDiaryProject(
          selectedTemplate.name,
          {
            ...selectedTemplate.content,
            title: selectedTemplate.content.title || selectedTemplate.name,
            subtitle: selectedTemplate.content.subtitle || selectedTemplate.description,
            badgeText: selectedTemplate.content.badgeText,
            accentColor: selectedTemplate.accentColor,
            durationInFrames: testDurationSec * 30,
          },
          sandboxFormat
        );
        result = await requestDiaryCloudRender(diaryPayload, {
          sendTelegram: testSendTelegram,
          chatId: '560232533', // Aa Baim Telegram ID
        });
      } else {
        const remotionProject = convertTemplateToOlipRemotionProject(
          selectedTemplate.name,
          {
            ...selectedTemplate.content,
            title: selectedTemplate.content.title || selectedTemplate.name,
            subtitle: selectedTemplate.content.subtitle || selectedTemplate.description,
            badgeText: selectedTemplate.content.badgeText,
            accentColor: selectedTemplate.accentColor,
            durationInFrames: testDurationSec * 30,
          },
          sandboxFormat
        );
        result = await requestOlipRemotionRender(remotionProject, {
          sendTelegram: testSendTelegram,
          chatId: '560232533',
        });
      }

      setCloudTestResult(result);
      if (!result.success) {
        setCloudTestError(result.message || 'Gagal merender template di Cloud Run');
      } else {
        showNotification(`🎉 Template "${selectedTemplate.name}" berhasil dirender persis 1:1 di Cloud Run!`);
      }
    } catch (e: any) {
      setCloudTestError(e.message || 'Koneksi ke Cloud Run Jakarta terputus');
    } finally {
      setIsTestingCloudRender(false);
    }
  };


  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  // Categories list
  const categories = ['Semua', 'Galeri', 'Intro', 'Fitur', 'Data', 'Komparasi', 'Outro'];

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'Semua') return templates;
    return templates.filter((t) => t.category === activeCategory);
  }, [templates, activeCategory]);

  // Handle live editing of selected template properties
  const handleUpdateSelectedTemplate = (patch: Partial<CustomTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedTemplateId ? { ...t, ...patch } : t))
    );
  };

  const handleUpdateSelectedContent = (contentPatch: Partial<VideoScene>) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedTemplateId
          ? {
              ...t,
              content: { ...t.content, ...contentPatch },
            }
          : t
      )
    );
  };

  // Duplicate template action
  const handleDuplicateTemplate = (template: CustomTemplate, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newId = `custom-${Date.now()}`;
    const duplicated: CustomTemplate = {
      ...template,
      id: newId,
      name: `${template.name} (Salinan)`,
      badge: 'Kustom V1',
      isCustom: true,
      content: {
        ...template.content,
        id: `scene-${Date.now()}`,
        name: `${template.name} (Salinan)`,
      },
    };
    setTemplates((prev) => [duplicated, ...prev]);
    setSelectedTemplateId(newId);
    showNotification(`Template "${duplicated.name}" berhasil diduplikat!`);
  };

  // Add new blank template
  const handleAddNewTemplate = () => {
    const newId = `custom-new-${Date.now()}`;
    const newTemplate: CustomTemplate = {
      id: newId,
      name: 'Template Kustom Baru',
      templateType: 'image-gallery',
      category: 'Galeri',
      description: 'Template kustom baru buatan Anda dengan tata letak visual dinamis.',
      badge: 'Baru Dibuat',
      defaultDurationInFrames: 120,
      iconName: 'Image',
      accentColor: '#8b5cf6',
      secondaryColor: '#ec4899',
      previewGradient: 'from-purple-600/30 to-pink-600/20',
      isCustom: true,
      content: {
        templateType: 'image-gallery',
        name: 'Template Kustom Baru',
        durationInFrames: 120,
        title: 'Koleksi Foto & Media Visual',
        subtitle: 'Tata letak media kinetik V1 dengan transisi spring',
        badgeText: 'GALERI FOTO',
        galleryImages: [
          {
            id: 'n-1',
            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
            title: 'Design Innovation',
            subtitle: 'Visual Kinetik 2026',
            tag: 'FEATURED',
          },
          {
            id: 'n-2',
            url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
            title: 'High Tech Engine',
            subtitle: 'Remotion React Cloud',
            tag: 'TECH',
          },
        ],
      },
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    setSelectedTemplateId(newId);
    showNotification('Template kustom baru berhasil dibuat!');
  };

  // Delete custom template
  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (templates.length <= 1) return;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selectedTemplateId === id) {
      setSelectedTemplateId(templates.find((t) => t.id !== id)?.id || templates[0].id);
    }
    showNotification('Template telah dihapus.');
  };

  // Apply template to active scene on Timeline (Replace V1 visual template)
  const handleApplyToActiveScene = () => {
    if (!brief.scenes || brief.scenes.length === 0) return;
    const targetSceneId = activeSceneId || brief.scenes[0].id;

    const updatedScenes = brief.scenes.map((sc) => {
      if (sc.id === targetSceneId) {
        return {
          ...sc,
          templateType: selectedTemplate.templateType,
          name: selectedTemplate.name,
          durationInFrames: selectedTemplate.defaultDurationInFrames,
          accentColor: selectedTemplate.accentColor,
          secondaryColor: selectedTemplate.secondaryColor,
          galleryImages: selectedTemplate.content.galleryImages,
          layoutVariant: selectedTemplate.content.layoutVariant,
          items: selectedTemplate.content.items,
          metricNumber: selectedTemplate.content.metricNumber,
          metricLabel: selectedTemplate.content.metricLabel,
          beforeText: selectedTemplate.content.beforeText,
          afterText: selectedTemplate.content.afterText,
          // Preserving or applying text & badge overlays
          title: sc.title || selectedTemplate.content.title,
          subtitle: sc.subtitle || selectedTemplate.content.subtitle,
          badgeText: sc.badgeText || selectedTemplate.content.badgeText,
        };
      }
      return sc;
    });

    onUpdateBrief({
      ...brief,
      scenes: updatedScenes,
    });

    showNotification(
      `Template "${selectedTemplate.name}" berhasil diterapkan ke V1 Scene "${brief.scenes.find((s) => s.id === targetSceneId)?.name}"!`
    );
  };

  // Insert as new scene into V1 Timeline
  const handleInsertAsNewScene = () => {
    const newScene: VideoScene = {
      id: `scene-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      templateType: selectedTemplate.templateType,
      name: selectedTemplate.name,
      durationInFrames: selectedTemplate.defaultDurationInFrames,
      accentColor: selectedTemplate.accentColor,
      secondaryColor: selectedTemplate.secondaryColor,
      transitionNext: { type: 'fade', durationInFrames: 15 },
      title: selectedTemplate.content.title,
      subtitle: selectedTemplate.content.subtitle,
      badgeText: selectedTemplate.content.badgeText,
      galleryImages: selectedTemplate.content.galleryImages,
      layoutVariant: selectedTemplate.content.layoutVariant,
      items: selectedTemplate.content.items,
      metricNumber: selectedTemplate.content.metricNumber,
      metricLabel: selectedTemplate.content.metricLabel,
      beforeText: selectedTemplate.content.beforeText,
      afterText: selectedTemplate.content.afterText,
      ctaText: selectedTemplate.content.ctaText,
      brandName: selectedTemplate.content.brandName,
      author: selectedTemplate.content.author,
      authorRole: selectedTemplate.content.authorRole,
    };

    const newScenes = [...(brief.scenes || []), newScene];
    onUpdateBrief({
      ...brief,
      scenes: newScenes,
    });
    if (onSelectSceneId) {
      onSelectSceneId(newScene.id);
    }
    showNotification(`Scene baru "${newScene.name}" ditambahkan ke V1 Timeline!`);
  };

  // Construct sandbox brief for isolated player monitor
  const sandboxScene: VideoScene = {
    id: 'sandbox-scene',
    templateType: selectedTemplate.templateType,
    name: selectedTemplate.name,
    durationInFrames: selectedTemplate.defaultDurationInFrames,
    accentColor: selectedTemplate.accentColor,
    secondaryColor: selectedTemplate.secondaryColor,
    hideText: !showOverlaysInSandbox,
    hideBadge: !showOverlaysInSandbox,
    title: selectedTemplate.content.title,
    subtitle: selectedTemplate.content.subtitle,
    badgeText: selectedTemplate.content.badgeText,
    galleryImages: selectedTemplate.content.galleryImages,
    layoutVariant: selectedTemplate.content.layoutVariant,
    items: selectedTemplate.content.items,
    metricNumber: selectedTemplate.content.metricNumber,
    metricLabel: selectedTemplate.content.metricLabel,
    beforeText: selectedTemplate.content.beforeText,
    afterText: selectedTemplate.content.afterText,
    ctaText: selectedTemplate.content.ctaText,
    brandName: selectedTemplate.content.brandName,
    author: selectedTemplate.content.author,
    authorRole: selectedTemplate.content.authorRole,
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Galeri':
        return <ImageIcon className="w-4 h-4 text-purple-400" />;
      case 'Intro':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'Fitur':
        return <LayoutGrid className="w-4 h-4 text-cyan-400" />;
      case 'Data':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'Komparasi':
        return <Columns className="w-4 h-4 text-yellow-400" />;
      case 'Outro':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0d0e12] text-slate-100 flex flex-col overflow-hidden select-none font-sans antialiased">
      {/* 1. Template Editor Header Bar */}
      {/* 1. Header Toolbar */}
      <header className="h-auto min-h-[48px] sm:h-14 bg-[#111217] border-b border-[#23252d] px-3 sm:px-5 py-2 sm:py-0 flex flex-wrap sm:flex-nowrap items-center justify-between shrink-0 z-40 gap-2">
        <div className="flex items-center gap-2 sm:gap-3.5">
          <button
            type="button"
            onClick={onBackToTimeline}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1a1c24] hover:bg-[#252936] text-slate-300 hover:text-white border border-[#2b2f3d] text-xs font-semibold transition-all cursor-pointer shadow-sm group min-h-[36px]"
            title="Kembali ke Workstation Studio Timeline"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden xs:inline">Kembali ke Studio</span>
            <span className="xs:hidden">Kembali</span>
          </button>

          <div className="hidden sm:block h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/25 shrink-0">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                <span>V1 Template Engine</span>
                <span className="hidden md:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60">
                  Decoupled V1
                </span>
              </h1>
              <p className="hidden md:block text-[11px] text-slate-400">
                Kustomisasi, tambah, dan duplikat template visual V1 tanpa terikat teks overlay T1/G1
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {notification && (
            <div className="hidden sm:flex text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-950/90 text-emerald-300 border border-emerald-800/70 items-center gap-1.5 animate-fade-in shadow-lg">
              <Check className="w-3.5 h-3.5" />
              <span>{notification}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenCloudTestModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1c2233] border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-sm min-h-[36px]"
            title="Buka panel render & uji coba template di Google Cloud Run (Jakarta)"
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>Test Cloud</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>

          <button
            type="button"
            onClick={handleAddNewTemplate}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 active:scale-95 transition-all cursor-pointer min-h-[36px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Buat Template Baru</span>
            <span className="sm:hidden">+ Baru</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Selector (Katalog | Preview Sandbox | Parameter) */}
      <div className="lg:hidden flex items-center bg-[#141622] border-b border-[#232738] p-1.5 gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setMobileSection('catalog')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[38px] ${
            mobileSection === 'catalog'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-[#191c28]'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Katalog ({templates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileSection('preview')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[38px] ${
            mobileSection === 'preview'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-[#191c28]'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Preview</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileSection('params')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all min-h-[38px] ${
            mobileSection === 'params'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-white bg-[#191c28]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Parameter</span>
        </button>
      </div>

      {/* 2. Main Multi-Column Workstation */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0">
        {/* Left Column: Template Catalog & Filter Library */}
        <div className={`${mobileSection === 'catalog' ? 'flex w-full' : 'hidden'} lg:flex lg:w-[350px] xl:w-[390px] h-full bg-[#11131a] border-r border-[#20232c] flex-col shrink-0 overflow-hidden`}>
          {/* Category Tabs */}
          <div className="p-3 border-b border-[#20232c] space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                <span>Katalog Template V1 ({templates.length})</span>
              </span>
              <span className="text-[10px] text-slate-500">Pilih untuk mengedit</span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-[#181a24] hover:bg-[#222533] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid / List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredTemplates.map((t) => {
              const isSelected = t.id === selectedTemplateId;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplateId(t.id);
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setMobileSection('preview');
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-[#1b1c28] border-purple-500/80 shadow-lg shadow-purple-500/10'
                      : 'bg-[#14161f] hover:bg-[#181a24] border-[#252834]'
                  }`}
                >
                  {/* Top Row: Icon, Title, Category Badge */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
                        style={{ backgroundColor: `${t.accentColor}25` }}
                      >
                        {getCategoryIcon(t.category)}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white line-clamp-1">{t.name}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="text-purple-400 font-medium">{t.templateType}</span>
                          <span>•</span>
                          <span>{t.defaultDurationInFrames}f ({(t.defaultDurationInFrames / 30).toFixed(1)}s)</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 shrink-0">
                      {t.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {t.description}
                  </p>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#232635] text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleDuplicateTemplate(t, e)}
                        className="px-2 py-1 rounded bg-[#1e202c] hover:bg-[#292c3d] text-slate-300 hover:text-white flex items-center gap-1 text-[10px] font-semibold transition-colors"
                        title="Duplikat template ini"
                      >
                        <Copy className="w-3 h-3 text-cyan-400" />
                        <span>Duplikat</span>
                      </button>

                      {t.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTemplate(t.id, e)}
                          className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 flex items-center gap-1 text-[10px] font-semibold transition-colors"
                          title="Hapus template kustom"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplateId(t.id);
                        handleApplyToActiveScene();
                      }}
                      className="px-2.5 py-1 rounded bg-purple-950/90 hover:bg-purple-900 text-purple-300 border border-purple-800/70 text-[10px] font-bold transition-colors"
                      title="Terapkan ke V1 Scene terpilih"
                    >
                      Pilih ke V1
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center / Right: Live Sandbox & Parameter Customizer */}
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#0c0d11]">
          {/* Center: Live Remotion Sandbox Viewport */}
          <div className={`${mobileSection === 'preview' ? 'flex flex-1' : 'hidden'} lg:flex flex-1 flex-col h-full border-r border-[#20232c] min-w-0 overflow-hidden`}>
            {/* Sandbox Toolbar */}
            <div className="h-11 bg-[#12141c] border-b border-[#20232c] px-3 sm:px-4 flex items-center justify-between shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-purple-400" />
                  <span>Sandbox Live Remotion V1</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono">
                  {selectedTemplate.templateType} • {selectedTemplate.defaultDurationInFrames}f
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 16:9 vs 9:16 toggle in sandbox */}
                <div className="flex items-center rounded-lg bg-[#1a1c25] border border-[#272b38] p-0.5">
                  <button
                    type="button"
                    onClick={() => setSandboxFormat('16:9')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                      sandboxFormat === '16:9'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    16:9
                  </button>
                  <button
                    type="button"
                    onClick={() => setSandboxFormat('9:16')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                      sandboxFormat === '9:16'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    9:16
                  </button>
                </div>

                {/* Toggle Overlay in Sandbox */}
                <button
                  type="button"
                  onClick={() => setShowOverlaysInSandbox(!showOverlaysInSandbox)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-colors ${
                    showOverlaysInSandbox
                      ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300'
                      : 'bg-[#181a24] border-[#292c3a] text-slate-400'
                  }`}
                  title="Tampilkan / Sembunyikan Teks & Badge Overlay di Sandbox"
                >
                  {showOverlaysInSandbox ? (
                    <Eye className="w-3 h-3 text-cyan-400" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-slate-400" />
                  )}
                  <span className="hidden xs:inline">Overlay {showOverlaysInSandbox ? 'Aktif' : 'Mati'}</span>
                </button>
              </div>
            </div>

            {/* Sandbox Monitor Player Canvas */}
            <div className="flex-1 bg-black/85 flex items-center justify-center p-2 sm:p-4 min-h-0 relative overflow-hidden">
              <div
                className="relative shadow-2xl rounded-xl overflow-hidden border border-[#2b2f3d] bg-[#0c0d11]"
                style={{
                  width: sandboxFormat === '9:16' ? '300px' : '560px',
                  height: sandboxFormat === '9:16' ? '533px' : '315px',
                  maxWidth: '92%',
                  maxHeight: '92%',
                }}
              >
                <Player
                  component={LiveRemotionComposition}
                  inputProps={{
                    format: sandboxFormat,
                    badgeText: sandboxScene.badgeText || '',
                    headline: sandboxScene.title || '',
                    subheadline: sandboxScene.subtitle || '',
                    accentColor: selectedTemplate.accentColor,
                    secondaryColor: selectedTemplate.secondaryColor,
                    backgroundColor: '#0c0d14',
                    featureList: selectedTemplate.content.items || ['Fitur 1', 'Fitur 2', 'Fitur 3'],
                    metricNumber: selectedTemplate.content.metricNumber || '10x',
                    metricLabel: selectedTemplate.content.metricLabel || 'Performa Kinetik',
                    ctaText: selectedTemplate.content.ctaText || 'Coba Sekarang',
                    brandName: selectedTemplate.content.brandName || 'CloudVideo AI',
                    animationStyle: 'spring-smooth' as const,
                    backgroundStyle: 'gradient-mesh' as const,
                    scenes: [sandboxScene],
                    trackVisibility: {
                      video: true,
                      text: showOverlaysInSandbox,
                      graphics: showOverlaysInSandbox,
                      audio: false,
                    },
                  }}
                  durationInFrames={selectedTemplate.defaultDurationInFrames}
                  fps={30}
                  compositionWidth={sandboxFormat === '9:16' ? 1080 : 1920}
                  compositionHeight={sandboxFormat === '9:16' ? 1920 : 1080}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  controls={false}
                  loop
                  autoPlay={false}
                />
              </div>
            </div>

            {/* Sandbox Bottom Controls (Play, Slider, Quick Apply) */}
            <div className="h-auto min-h-[52px] py-2 sm:py-0 bg-[#12141c] border-t border-[#20232c] px-3 sm:px-4 flex flex-wrap items-center justify-between shrink-0 gap-2">
              <div className="flex items-center gap-2">
                <div className="text-[11px] font-mono text-slate-400 bg-[#191b26] px-2.5 py-1 rounded-md border border-[#272b3b]">
                  <span className="text-purple-400 font-bold">{selectedTemplate.name}</span>
                </div>
              </div>

              {/* Bottom Quick Insertion Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handleOpenCloudTestModal}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 hover:from-teal-300 hover:to-cyan-300 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer min-h-[36px]"
                  title="Render & uji coba template ini langsung di Google Cloud Run (Jakarta)"
                >
                  <Cloud className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Test Render</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyToActiveScene}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 active:scale-95 transition-all cursor-pointer min-h-[36px]"
                  title="Gantikan template visual pada Scene V1 yang sedang aktif di timeline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Terapkan ke V1</span>
                </button>

                <button
                  type="button"
                  onClick={handleInsertAsNewScene}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#202330] hover:bg-[#2b3042] text-cyan-300 border border-cyan-500/40 text-xs font-bold active:scale-95 transition-all cursor-pointer min-h-[36px]"
                  title="Sisipkan template ini sebagai scene baru di akhir V1 timeline"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+ Tambah V1</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Template Parameter Editor */}
          <div className={`${mobileSection === 'params' ? 'flex w-full' : 'hidden'} lg:flex lg:w-[350px] xl:w-[390px] h-full bg-[#11131a] flex-col shrink-0 overflow-hidden`}>
            {/* Editor Tabs: Visual Engine vs Konten V1 vs Overlays */}
            <div className="h-11 bg-[#151722] border-b border-[#20232c] px-3 flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setEditorTab('visual')}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                  editorTab === 'visual'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2231]'
                }`}
              >
                1. Visual V1
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('media')}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                  editorTab === 'media'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2231]'
                }`}
              >
                2. Aset & Media
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('overlays')}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                  editorTab === 'overlays'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1f2231]'
                }`}
              >
                3. Overlays (T1/G1)
              </button>
            </div>

            {/* Tab 1: Visual V1 Engine */}
            {editorTab === 'visual' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Nama Template
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.name}
                    onChange={(e) => handleUpdateSelectedTemplate({ name: e.target.value })}
                    className="w-full bg-[#181a24] border border-[#2b2f3d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Tipe Layout Template
                  </label>
                  <select
                    value={selectedTemplate.templateType}
                    onChange={(e) => {
                      const newType = e.target.value as SceneTemplateType;
                      handleUpdateSelectedTemplate({
                        templateType: newType,
                        content: { ...selectedTemplate.content, templateType: newType },
                      });
                    }}
                    className="w-full bg-[#181a24] border border-[#2b2f3d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="image-gallery">Galeri Gambar & Media Carousel</option>
                    <option value="feature-grid">3-Card Feature Glass Grid</option>
                    <option value="product-showcase">Product Mockup & Spec Display</option>
                    <option value="metric-impact">Big Metric Impact Counter</option>
                    <option value="hook-title">Kinetic Headline & Hook</option>
                    <option value="cyber-glitch">Cyberpunk Glitch Hook</option>
                    <option value="split-comparison">Split Comparison (Before / After)</option>
                    <option value="quote-testimonial">Customer Quote & Review</option>
                    <option value="outro-cta">Outro & Call-to-Action</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-slate-300 uppercase tracking-wider">
                      Durasi Frame V1
                    </span>
                    <span className="text-purple-400 font-mono font-bold">
                      {selectedTemplate.defaultDurationInFrames} Frames (
                      {(selectedTemplate.defaultDurationInFrames / 30).toFixed(1)}s)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    step="15"
                    value={selectedTemplate.defaultDurationInFrames}
                    onChange={(e) => {
                      const frames = Number(e.target.value);
                      handleUpdateSelectedTemplate({
                        defaultDurationInFrames: frames,
                        content: { ...selectedTemplate.content, durationInFrames: frames },
                      });
                    }}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300">Warna Aksen V1</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedTemplate.accentColor}
                        onChange={(e) => handleUpdateSelectedTemplate({ accentColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedTemplate.accentColor}
                        onChange={(e) => handleUpdateSelectedTemplate({ accentColor: e.target.value })}
                        className="flex-1 bg-[#181a24] border border-[#2b2f3d] rounded px-2 py-1 text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300">Warna Sekunder V1</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedTemplate.secondaryColor}
                        onChange={(e) =>
                          handleUpdateSelectedTemplate({ secondaryColor: e.target.value })
                        }
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedTemplate.secondaryColor}
                        onChange={(e) =>
                          handleUpdateSelectedTemplate({ secondaryColor: e.target.value })
                        }
                        className="flex-1 bg-[#181a24] border border-[#2b2f3d] rounded px-2 py-1 text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Swatch Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Preset Palet Warna V1:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { acc: '#8b5cf6', sec: '#ec4899', name: 'Cyber Purple' },
                      { acc: '#06b6d4', sec: '#3b82f6', name: 'Neon Cyan' },
                      { acc: '#10b981', sec: '#059669', name: 'Emerald' },
                      { acc: '#f59e0b', sec: '#ef4444', name: 'Amber Glow' },
                      { acc: '#ec4899', sec: '#f43f5e', name: 'Rose Sunset' },
                    ].map((sw) => (
                      <button
                        key={sw.name}
                        type="button"
                        onClick={() =>
                          handleUpdateSelectedTemplate({
                            accentColor: sw.acc,
                            secondaryColor: sw.sec,
                          })
                        }
                        className="px-2 py-1 rounded bg-[#191b26] hover:bg-[#25283a] border border-[#2b2f3e] text-[10px] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: sw.acc }}
                        />
                        <span>{sw.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Aset & Media (Image Gallery / Cards) */}
            {editorTab === 'media' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
                {selectedTemplate.templateType === 'image-gallery' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                        <span>Koleksi Foto Galeri V1</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentImages = selectedTemplate.content.galleryImages || [];
                          const newItem: GalleryImageItem = {
                            id: `img-${Date.now()}`,
                            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
                            title: 'Foto Baru Kinetik',
                            subtitle: 'Koleksi Studio 2026',
                            tag: 'NEW',
                          };
                          handleUpdateSelectedContent({
                            galleryImages: [...currentImages, newItem],
                          });
                        }}
                        className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/70 text-purple-300 text-[10px] font-bold hover:bg-purple-900 transition-colors"
                      >
                        + Tambah Foto
                      </button>
                    </div>

                    {/* Gallery Images List */}
                    <div className="space-y-2.5">
                      {(selectedTemplate.content.galleryImages || []).map((img, idx) => (
                        <div
                          key={img.id || idx}
                          className="p-2.5 rounded-lg bg-[#181a24] border border-[#282b3a] space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-purple-400">
                              Kartu Foto #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const current = selectedTemplate.content.galleryImages || [];
                                handleUpdateSelectedContent({
                                  galleryImages: current.filter((_, i) => i !== idx),
                                });
                              }}
                              className="text-slate-500 hover:text-rose-400 p-0.5"
                              title="Hapus foto ini"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={img.title}
                              onChange={(e) => {
                                const current = [...(selectedTemplate.content.galleryImages || [])];
                                current[idx] = { ...current[idx], title: e.target.value };
                                handleUpdateSelectedContent({ galleryImages: current });
                              }}
                              placeholder="Judul Foto..."
                              className="w-full bg-[#11131c] border border-[#232636] rounded px-2.5 py-1 text-xs text-white"
                            />
                            <input
                              type="text"
                              value={img.subtitle || ''}
                              onChange={(e) => {
                                const current = [...(selectedTemplate.content.galleryImages || [])];
                                current[idx] = { ...current[idx], subtitle: e.target.value };
                                handleUpdateSelectedContent({ galleryImages: current });
                              }}
                              placeholder="Keterangan singkat..."
                              className="w-full bg-[#11131c] border border-[#232636] rounded px-2.5 py-1 text-xs text-slate-300"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={img.tag || ''}
                                onChange={(e) => {
                                  const current = [...(selectedTemplate.content.galleryImages || [])];
                                  current[idx] = { ...current[idx], tag: e.target.value };
                                  handleUpdateSelectedContent({ galleryImages: current });
                                }}
                                placeholder="Tag (misal: TECH)"
                                className="w-24 bg-[#11131c] border border-[#232636] rounded px-2 py-1 text-[11px] font-mono text-purple-300"
                              />
                              <input
                                type="text"
                                value={img.url}
                                onChange={(e) => {
                                  const current = [...(selectedTemplate.content.galleryImages || [])];
                                  current[idx] = { ...current[idx], url: e.target.value };
                                  handleUpdateSelectedContent({ galleryImages: current });
                                }}
                                placeholder="URL Gambar..."
                                className="flex-1 bg-[#11131c] border border-[#232636] rounded px-2 py-1 text-[10px] font-mono text-slate-400"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedTemplate.templateType === 'feature-grid' ? (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Daftar 3 Pilar Fitur
                    </label>
                    {(selectedTemplate.content.items || ['Fitur 1', 'Fitur 2', 'Fitur 3']).map(
                      (item, idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const current = [...(selectedTemplate.content.items || [])];
                            current[idx] = e.target.value;
                            handleUpdateSelectedContent({ items: current });
                          }}
                          className="w-full bg-[#181a24] border border-[#2b2f3d] rounded px-3 py-1.5 text-xs text-white"
                        />
                      )
                    )}
                  </div>
                ) : selectedTemplate.templateType === 'metric-impact' ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Angka Metrik Raksasa</label>
                      <input
                        type="text"
                        value={selectedTemplate.content.metricNumber || '10x'}
                        onChange={(e) =>
                          handleUpdateSelectedContent({ metricNumber: e.target.value })
                        }
                        className="w-full bg-[#181a24] border border-[#2b2f3d] rounded px-3 py-1.5 text-sm font-bold text-emerald-400 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Label Keterangan Metrik</label>
                      <input
                        type="text"
                        value={selectedTemplate.content.metricLabel || ''}
                        onChange={(e) =>
                          handleUpdateSelectedContent({ metricLabel: e.target.value })
                        }
                        className="w-full bg-[#181a24] border border-[#2b2f3d] rounded px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#151722] border border-[#242736] text-center space-y-1.5">
                    <p className="text-xs text-slate-300 font-semibold">
                      Aset & layout V1 untuk template ini dikontrol otomatis oleh mesin Remotion.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Anda dapat menyesuaikan warna, durasi frame, dan overlays di tab lainnya.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Overlays (T1 & G1) */}
            {editorTab === 'overlays' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-1">
                  <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Konsep True Decoupled Overlays</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Teks (T1) dan Badge (G1) adalah layer overlay non-destruktif. Mengubah teks di sini
                    tidak merusak struktur visual dasar template V1 Anda.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Judul Overlay (Headline T1)
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.content.title || ''}
                    onChange={(e) => handleUpdateSelectedContent({ title: e.target.value })}
                    placeholder="Judul teks..."
                    className="w-full bg-[#181a24] border border-[#2b2f3d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Subjudul Overlay (Subheadline T1)
                  </label>
                  <textarea
                    rows={2}
                    value={selectedTemplate.content.subtitle || ''}
                    onChange={(e) => handleUpdateSelectedContent({ subtitle: e.target.value })}
                    placeholder="Subjudul..."
                    className="w-full bg-[#181a24] border border-[#2b2f3d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Badge / Stiker Teks (G1)
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.content.badgeText || ''}
                    onChange={(e) => handleUpdateSelectedContent({ badgeText: e.target.value })}
                    placeholder="Contoh: TEKNOLOGI TERBARU"
                    className="w-full bg-[#181a24] border border-[#2b2f3d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Bottom Actions for Parameter Editor */}
            <div className="p-3 bg-[#13151e] border-t border-[#20232c] flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDuplicateTemplate(selectedTemplate)}
                className="flex-1 py-2 rounded-lg bg-[#1a1c25] hover:bg-[#252834] text-slate-300 border border-[#292c3a] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Duplikat Varian</span>
              </button>

              <button
                type="button"
                onClick={handleApplyToActiveScene}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Simpan ke V1</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Modal Uji Coba Render Template ke Cloud Run */}
      {isCloudTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
          <div className="bg-[#151722] border border-[#2b2f42] rounded-2xl max-w-xl w-full p-5 shadow-2xl relative flex flex-col gap-3 text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#252834] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-teal-400 to-indigo-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
                  <Cloud className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Uji Coba Render Template Cloud Run</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Jakarta asia-southeast2
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Kirim template {selectedTemplate.name} langsung ke mesin render headless
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCloudTestModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#202330] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cloud Run Server Health Pill */}
            <div className="p-2.5 rounded-xl bg-[#10121a] border border-[#232737] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    engineHealth?.online
                      ? 'bg-emerald-400 shadow-md shadow-emerald-400/80 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                <div>
                  <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                    <span>Server: Google Cloud Run Jakarta</span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {engineHealth?.online ? '(Status 200 OK)' : '(Mengecek koneksi...)'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Free Tier Scale-to-Zero • Headless Remotion & FFmpeg
                  </div>
                </div>
              </div>

              <a
                href={DIARY_CLOUD_RUN_URL}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                title="Buka endpoint server"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Template Info Card */}
            <div className="p-3 bg-[#11131c] border border-[#242738] rounded-xl grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Nama Template:</span>
                <span className="font-bold text-cyan-300 truncate block">{selectedTemplate.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Kategori & Format:</span>
                <span className="font-semibold text-slate-200">
                  {selectedTemplate.category} • {sandboxFormat} ({sandboxFormat === '9:16' ? '1080x1920' : '1920x1080'})
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px]">Cuplikan Teks Scene:</span>
                <p className="text-slate-300 italic truncate text-[11px]">
                  "{selectedTemplate.content.title || selectedTemplate.name}" — {selectedTemplate.content.subtitle || selectedTemplate.description}
                </p>
              </div>
            </div>

            {/* Test Duration & Settings */}
            <div className="space-y-2 pt-1">
              <div>
                <span className="text-[11px] font-bold text-slate-300 block mb-1">
                  Pilih Durasi Render Uji Coba:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[4, 6, 10, 15].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setTestDurationSec(dur)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        testDurationSec === dur
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                          : 'bg-[#12141d] border-[#252838] text-slate-400 hover:text-white'
                      }`}
                    >
                      {dur} Detik
                    </button>
                  ))}
                </div>
              </div>

              {/* Telegram & DB Checkboxes */}
              <label className="flex items-center gap-2 p-2 rounded-xl bg-[#12141d] border border-[#232635] hover:border-cyan-500/40 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={testSendTelegram}
                  onChange={(e) => setTestSendTelegram(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-400 bg-slate-900 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Send className="w-3 h-3 text-cyan-400" />
                    <span>Kirim Video Hasil Render ke Telegram Aa Baim</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Otomatis dikirim via Bot Telegram setelah Cloud Run selesai merender.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-[#12141d] border border-[#232635] hover:border-cyan-500/40 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={testSaveDb}
                  onChange={(e) => setTestSaveDb(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-400 bg-slate-900 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span>Simpan ke Database Diary Studio (diary_projects.db)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Menyimpan metadata proyek ini di Cloud Run untuk riwayat render.
                  </div>
                </div>
              </label>
            </div>

            {/* Error Message */}
            {cloudTestError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-700/60 text-rose-300 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>{cloudTestError}</span>
              </div>
            )}

            {/* Success & Inline Video Player */}
            {cloudTestResult && cloudTestResult.success && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border border-emerald-600/70 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Template Sukses Dirender di Cloud Run!</span>
                  </div>
                  {cloudTestResult.downloadUrl && (
                    <a
                      href={cloudTestResult.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={cloudTestResult.file || 'test_template.mp4'}
                      className="px-3 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      <Download className="w-3 h-3" />
                      <span>Unduh MP4</span>
                    </a>
                  )}
                </div>

                {/* Inline Video Player Preview */}
                {cloudTestResult.downloadUrl && (
                  <div className="rounded-lg overflow-hidden border border-emerald-700/50 bg-black/85 flex flex-col items-center justify-center">
                    <video
                      src={cloudTestResult.downloadUrl}
                      controls
                      autoPlay={false}
                      className="max-h-[200px] w-auto max-w-full rounded shadow-lg"
                    />
                    <div className="w-full bg-[#0d0e14] px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-emerald-900/40">
                      <span>Stream: {cloudTestResult.file}</span>
                      <a
                        href={cloudTestResult.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>Buka Tab Baru</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400 pt-1 border-t border-emerald-900/40">
                  {cloudTestResult.file && (
                    <span>
                      File: <strong className="text-cyan-300">{cloudTestResult.file}</strong>
                    </span>
                  )}
                  <span>
                    Ukuran: <strong className="text-emerald-300">~{cloudTestResult.sizeMb || '2.5'} MB</strong>
                  </span>
                  {testSendTelegram && (
                    <span className="text-cyan-400 font-sans flex items-center gap-1">
                      <Send className="w-2.5 h-2.5" /> Terkirim ke Telegram Aa Baim
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#252834]">
              <button
                type="button"
                onClick={() => setIsCloudTestModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#232633] hover:bg-[#2d3142] text-slate-300 text-xs font-semibold transition-colors"
              >
                Tutup
              </button>

              <button
                type="button"
                disabled={isTestingCloudRender}
                onClick={handleStartTemplateCloudRender}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isTestingCloudRender ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Merender di Cloud Run ({testDurationSec}s)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>Mulai Render di Cloud Run</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

