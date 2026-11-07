import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Check,
  Sliders,
  Play,
  RotateCcw,
  Layers,
  ArrowRight,
  Zap,
  Film,
  Split,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import type {
  VideoBrief,
  VideoScene,
  SceneTransition,
  TransitionType,
} from '../../types/remotion';
import { TRANSITION_CATALOG } from '../../data/sceneTemplates';

export interface TransitionsGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  brief: VideoBrief;
  activeSceneId?: string;
  onUpdateBrief: (updatedBrief: VideoBrief) => void;
  onApplyTransition?: (
    transition: SceneTransition,
    sceneId?: string,
    applyToAll?: boolean
  ) => void;
}

type CategoryFilter = 'all' | 'fade' | 'slide' | 'zoom' | 'wipe' | 'special';

interface TransitionCardMeta {
  type: TransitionType;
  name: string;
  category: 'fade' | 'slide' | 'zoom' | 'wipe' | 'special';
  badge: string;
  description: string;
  defaultFrames: number;
  remotionFormula: string;
  iconName: string;
}

const EXTENDED_TRANSITIONS: TransitionCardMeta[] = [
  {
    type: 'fade',
    name: 'Cross Fade & Dissolve',
    category: 'fade',
    badge: 'Klasik & Halus',
    description: 'Peleburan opasitas adegan secara halus dan mulus, standar industri film dan iklan.',
    defaultFrames: 15,
    remotionFormula: 'opacity = 1 - progress',
    iconName: 'Sparkles',
  },
  {
    type: 'slide-left',
    name: 'Slide Kiri (Push Left)',
    category: 'slide',
    badge: 'Dinamis',
    description: 'Adegan aktif terdorong ke arah kiri saat adegan baru masuk dari kanan.',
    defaultFrames: 15,
    remotionFormula: 'translateX(-progress * 100%)',
    iconName: 'ArrowRight',
  },
  {
    type: 'slide-right',
    name: 'Slide Kanan (Push Right)',
    category: 'slide',
    badge: 'Smooth',
    description: 'Adegan bergeser ke arah kanan dengan akselerasi pegas Remotion yang luwes.',
    defaultFrames: 15,
    remotionFormula: 'translateX(progress * 100%)',
    iconName: 'ArrowRight',
  },
  {
    type: 'slide-up',
    name: 'Slide Ke Atas (Reels Up)',
    category: 'slide',
    badge: 'Mobile / TikTok',
    description: 'Pergeseran vertikal ke atas, format paling alami untuk video vertikal 9:16 Shorts & Reels.',
    defaultFrames: 15,
    remotionFormula: 'translateY(-progress * 100%)',
    iconName: 'ArrowRight',
  },
  {
    type: 'zoom-in',
    name: 'Zoom In Punch',
    category: 'zoom',
    badge: 'High Impact',
    description: 'Skala kamera membesar cepat menembus frame, menciptakan transisi dramatis dan fokus tinggi.',
    defaultFrames: 14,
    remotionFormula: 'scale(1 + progress * 0.4)',
    iconName: 'Maximize2',
  },
  {
    type: 'zoom-out',
    name: 'Zoom Out Reveal',
    category: 'zoom',
    badge: 'Cinematic',
    description: 'Efek mundur cepat yang memperkecil adegan untuk menyingkap perspektif baru.',
    defaultFrames: 14,
    remotionFormula: 'scale(1 - progress * 0.4)',
    iconName: 'Maximize2',
  },
  {
    type: 'wipe',
    name: 'Curtain Wipe (Sapuan Tirai)',
    category: 'wipe',
    badge: 'Modern Linear',
    description: 'Penyapuan garis tirai modern dari kiri ke kanan menggunakan interpolasi clip-path.',
    defaultFrames: 16,
    remotionFormula: 'clipPath: inset(0 (progress*100)% 0 0)',
    iconName: 'Split',
  },
  {
    type: 'glitch',
    name: 'Cyberpunk Glitch',
    category: 'special',
    badge: 'High-Tech RGB',
    description: 'Distorsi sinyal digital, pergeseran chromatic horizontal dan getaran frekuensi acak.',
    defaultFrames: 10,
    remotionFormula: 'skewX(deg) + hue-rotate()',
    iconName: 'Zap',
  },
  {
    type: 'blur',
    name: 'Motion Blur Dissolve',
    category: 'special',
    badge: 'Optik Cepat',
    description: 'Pengaburan gerakan optik berkecepatan tinggi saat perpindahan adegan.',
    defaultFrames: 14,
    remotionFormula: 'filter: blur(progress * 16px)',
    iconName: 'Film',
  },
  {
    type: 'none',
    name: 'Potong Langsung (Hard Cut)',
    category: 'special',
    badge: 'Snappy',
    description: 'Tanpa efek transisi; pergantian instan antar frame pada titik potong timeline.',
    defaultFrames: 0,
    remotionFormula: 'none (instant cut)',
    iconName: 'Split',
  },
];

export const TransitionsGallery: React.FC<TransitionsGalleryProps> = ({
  isOpen,
  onClose,
  brief,
  activeSceneId,
  onUpdateBrief,
  onApplyTransition,
}) => {
  // Find current active scene or default to first scene
  const scenes = brief.scenes || [];
  const selectedSceneIndex = Math.max(
    0,
    scenes.findIndex((s) => s.id === activeSceneId)
  );
  const [targetSceneId, setTargetSceneId] = useState<string>(
    activeSceneId || scenes[0]?.id || ''
  );

  // Sync targetSceneId when activeSceneId changes
  React.useEffect(() => {
    if (activeSceneId && scenes.some((s) => s.id === activeSceneId)) {
      setTargetSceneId(activeSceneId);
    } else if (scenes[0]?.id) {
      setTargetSceneId(scenes[0].id);
    }
  }, [activeSceneId, scenes]);

  const targetScene = scenes.find((s) => s.id === targetSceneId) || scenes[0];

  // Active transition in the scene
  const currentTransitionType = targetScene?.transitionNext?.type || 'fade';
  const currentTransitionDuration = targetScene?.transitionNext?.durationInFrames || 15;

  // Local selection state inside the gallery modal
  const [selectedType, setSelectedType] = useState<TransitionType>(currentTransitionType);
  const [durationFrames, setDurationFrames] = useState<number>(currentTransitionDuration);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [applyToAllScenes, setApplyToAllScenes] = useState<boolean>(false);
  const [previewAnimationKey, setPreviewAnimationKey] = useState<number>(0);
  const [successToast, setSuccessToast] = useState<boolean>(false);

  // Filtered transitions list
  const filteredTransitions = useMemo(() => {
    if (selectedCategory === 'all') return EXTENDED_TRANSITIONS;
    return EXTENDED_TRANSITIONS.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  if (!isOpen) return null;

  const handleSelectTransition = (item: TransitionCardMeta) => {
    setSelectedType(item.type);
    if (item.defaultFrames > 0) {
      setDurationFrames(item.defaultFrames);
    }
    setPreviewAnimationKey((k) => k + 1);
  };

  const handleApply = () => {
    const newTransition: SceneTransition = {
      type: selectedType,
      durationInFrames: selectedType === 'none' ? 0 : durationFrames,
    };

    if (onApplyTransition) {
      onApplyTransition(newTransition, targetSceneId, applyToAllScenes);
    } else {
      // Direct update to VideoBrief state
      if (applyToAllScenes) {
        const updatedScenes = scenes.map((s) => ({
          ...s,
          transitionNext: newTransition,
        }));
        onUpdateBrief({
          ...brief,
          scenes: updatedScenes,
        });
      } else {
        const updatedScenes = scenes.map((s) =>
          s.id === targetSceneId
            ? { ...s, transitionNext: newTransition }
            : s
        );
        onUpdateBrief({
          ...brief,
          scenes: updatedScenes,
        });
      }
    }

    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 600);
  };

  const selectedMeta = EXTENDED_TRANSITIONS.find((t) => t.type === selectedType) || EXTENDED_TRANSITIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#13151f] border border-[#272b3d] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-100">
        {/* Modal Top Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#181a26] border-b border-[#252838] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-950 to-blue-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/50 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Galeri Transisi Video
                </h3>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold">
                  Remotion
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Pilih dan terapkan efek transisi sinematik antar scene
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#252838] transition-colors"
            title="Tutup Galeri Transisi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Target Scene Bar & Category Filters */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 bg-[#151722] border-b border-[#222533] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          {/* Target Scene Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Target Scene:
            </span>
            <select
              value={targetSceneId}
              onChange={(e) => setTargetSceneId(e.target.value)}
              disabled={applyToAllScenes}
              className="bg-[#1e212f] border border-[#2e3347] focus:border-cyan-500 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-medium focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              {scenes.map((sc, idx) => (
                <option key={sc.id} value={sc.id}>
                  Scene {idx + 1}: {sc.name} ({sc.durationInFrames}f)
                </option>
              ))}
            </select>

            {targetScene?.transitionNext && (
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded ml-1">
                Saat Ini: {targetScene.transitionNext.type} ({targetScene.transitionNext.durationInFrames}f)
              </span>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#10121a] p-1 rounded-xl border border-[#222533]">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({EXTENDED_TRANSITIONS.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('fade')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'fade'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fade
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('slide')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'slide'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Slide
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('zoom')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'zoom'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Zoom
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('wipe')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'wipe'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Wipe
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('special')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'special'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Special
            </button>
          </div>
        </div>

        {/* Modal Main Content (Gallery Grid + Live Visual Inspector Sidebar) */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Grid: Transition Cards */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredTransitions.map((item) => {
                const isSelected = selectedType === item.type;
                const isCurrent = targetScene?.transitionNext?.type === item.type;

                return (
                  <div
                    key={item.type}
                    onClick={() => handleSelectTransition(item)}
                    className={`group relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                      isSelected
                        ? 'bg-[#182030] border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                        : 'bg-[#161824] border-[#252838] hover:border-[#3a4058] hover:bg-[#1a1c2b]'
                    }`}
                  >
                    {/* Animated Thumbnail Box Preview */}
                    <div className="w-full h-24 rounded-xl bg-[#0c0d13] border border-[#202332] relative overflow-hidden mb-3 flex items-center justify-center">
                      {/* Base Background Scene (Cyan/Teal Scene) */}
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/60 to-slate-900 flex flex-col items-center justify-center text-[10px] font-bold text-cyan-200">
                        <span>Scene B</span>
                        <span className="text-[8px] text-cyan-400/80 font-mono">Next</span>
                      </div>

                      {/* Transition Layer (Violet/Indigo Scene A Exiting) */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br from-indigo-700 to-purple-900 flex flex-col items-center justify-center text-[10px] font-bold text-white transition-all ${
                          item.type === 'fade'
                            ? 'group-hover:opacity-0 duration-700'
                            : item.type === 'slide-left'
                            ? 'group-hover:-translate-x-full duration-700'
                            : item.type === 'slide-right'
                            ? 'group-hover:translate-x-full duration-700'
                            : item.type === 'slide-up'
                            ? 'group-hover:-translate-y-full duration-700'
                            : item.type === 'zoom-in'
                            ? 'group-hover:scale-150 group-hover:opacity-0 duration-700'
                            : item.type === 'zoom-out'
                            ? 'group-hover:scale-50 group-hover:opacity-0 duration-700'
                            : item.type === 'wipe'
                            ? 'group-hover:[clip-path:inset(0_100%_0_0)] duration-700'
                            : item.type === 'glitch'
                            ? 'group-hover:skew-x-12 group-hover:opacity-30 duration-300'
                            : item.type === 'blur'
                            ? 'group-hover:blur-md group-hover:opacity-0 duration-700'
                            : 'group-hover:hidden'
                        }`}
                      >
                        <span>Scene A</span>
                        <span className="text-[8px] text-indigo-300/80 font-mono">Current</span>
                      </div>

                      {/* Mini hover instruction hint */}
                      <div className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-400 bg-black/60 px-1 rounded backdrop-blur-xs">
                        Hover untuk tes
                      </div>

                      {/* Selected check badge */}
                      {isSelected && (
                        <div className="absolute top-1.5 left-1.5 bg-cyan-500 text-slate-950 p-1 rounded-full shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      {/* Currently applied badge */}
                      {isCurrent && !isSelected && (
                        <div className="absolute top-1.5 left-1.5 bg-slate-800 text-cyan-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-cyan-800">
                          Aktif
                        </div>
                      )}
                    </div>

                    {/* Card Meta Content */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {item.name}
                        </h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ml-1 ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-[#222533] text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Selected Transition Customizer & Code Formula */}
          <div className="w-full md:w-80 bg-[#161824] border-t md:border-t-0 md:border-l border-[#242738] p-5 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              {/* Selected Overview Card */}
              <div className="p-3.5 rounded-xl bg-[#11121a] border border-[#222533] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                    Transisi Terpilih
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                    {selectedMeta.category.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">
                  {selectedMeta.name}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedMeta.description}
                </p>
              </div>

              {/* Duration Slider Control (If not hard cut) */}
              {selectedType !== 'none' ? (
                <div className="p-3.5 rounded-xl bg-[#11121a] border border-[#222533] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      Durasi Transisi:
                    </span>
                    <span className="font-mono text-cyan-300 font-bold bg-[#1a1d2c] px-2 py-0.5 rounded border border-cyan-800/50">
                      {durationFrames} frames ({(durationFrames / 30).toFixed(2)}s)
                    </span>
                  </div>

                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={durationFrames}
                    onChange={(e) => setDurationFrames(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[#252838] rounded appearance-none cursor-pointer accent-cyan-400"
                  />

                  {/* Preset quick buttons */}
                  <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setDurationFrames(8)}
                      className={`py-1 rounded font-medium border text-center transition-colors ${
                        durationFrames === 8
                          ? 'bg-cyan-950 border-cyan-600 text-cyan-300'
                          : 'bg-[#171926] border-[#292c3c] text-slate-400 hover:text-white'
                      }`}
                    >
                      Cepat (8f)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDurationFrames(15)}
                      className={`py-1 rounded font-medium border text-center transition-colors ${
                        durationFrames === 15
                          ? 'bg-cyan-950 border-cyan-600 text-cyan-300'
                          : 'bg-[#171926] border-[#292c3c] text-slate-400 hover:text-white'
                      }`}
                    >
                      Standar (15f)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDurationFrames(24)}
                      className={`py-1 rounded font-medium border text-center transition-colors ${
                        durationFrames === 24
                          ? 'bg-cyan-950 border-cyan-600 text-cyan-300'
                          : 'bg-[#171926] border-[#292c3c] text-slate-400 hover:text-white'
                      }`}
                    >
                      Halus (24f)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#11121a] border border-[#222533] text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Hard Cut:</span> Adegan akan langsung berpindah frame tanpa interpolasi opasitas atau pergerakan kamera (0 frame transisi).
                </div>
              )}

              {/* Remotion Math Formula Box */}
              <div className="p-3.5 rounded-xl bg-[#10121b] border border-[#202334] space-y-1.5 font-mono">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  Rumus Interpolasi Remotion:
                </span>
                <div className="text-[11px] text-cyan-400 bg-[#0c0d14] p-2 rounded-lg border border-[#1d2030] overflow-x-auto whitespace-pre">
                  {selectedMeta.remotionFormula}
                </div>
              </div>

              {/* Batch Apply Checkbox */}
              <div className="p-3 rounded-xl bg-[#11121a] border border-[#222533] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="applyAllTransitions"
                    checked={applyToAllScenes}
                    onChange={(e) => setApplyToAllScenes(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <label
                    htmlFor="applyAllTransitions"
                    className="text-xs text-slate-300 font-medium cursor-pointer"
                  >
                    Terapkan ke seluruh scene ({scenes.length} klip)
                  </label>
                </div>
                <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold">
                  Batch
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#252838] space-y-2">
              {successToast && (
                <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 justify-center animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Transisi berhasil diterapkan ke VideoBrief!</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#252838] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Terapkan Transisi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
