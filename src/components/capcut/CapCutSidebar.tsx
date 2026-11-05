import React, { useState } from 'react';
import {
  FolderOpen,
  Type,
  Palette,
  Sparkles,
  Zap,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  Activity,
  Layers,
  LayoutGrid,
  ExternalLink,
} from 'lucide-react';
import type { VideoBrief, VideoFormat, VideoScene } from '../../types/remotion';
import { VIDEO_PRESETS } from '../../data/presets';
import { SCENE_TEMPLATES_CATALOG, createSceneFromTemplate } from '../../data/sceneTemplates';
import { secondsToFrames, sampleSpringCurve, getTotalFrames } from '../../utils/remotionMath';
import { SceneCustomizer } from './SceneCustomizer';

interface CapCutSidebarProps {
  brief: VideoBrief;
  onUpdateBrief: (newBrief: VideoBrief) => void;
  onOpenAddTemplateModal?: () => void;
  onPopOut?: () => void;
  isFloating?: boolean;
  activeSceneId?: string;
  onSelectSceneId?: (id: string) => void;
  onUpdateScene?: (updatedScene: VideoScene) => void;
}

type SidebarTab = 'template' | 'media' | 'text' | 'color' | 'elements' | 'animation';

export const CapCutSidebar: React.FC<CapCutSidebarProps> = ({
  brief,
  onUpdateBrief,
  onOpenAddTemplateModal,
  onPopOut,
  isFloating = false,
  activeSceneId,
  onSelectSceneId,
  onUpdateScene,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('template');
  const [textSubTab, setTextSubTab] = useState<'scene' | 'global'>('scene');
  const [newFeatureText, setNewFeatureText] = useState('');
  const springSamples = sampleSpringCurve(20);

  const totalFrames = getTotalFrames(brief.scenes, brief.durationSeconds, brief.fps);

  const handlePresetSelect = (preset: VideoBrief) => {
    onUpdateBrief({ ...preset });
  };

  const updateVisual = (field: string, value: any) => {
    onUpdateBrief({
      ...brief,
      visualElements: {
        ...brief.visualElements,
        [field]: value,
      },
    });
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    const currentList = brief.visualElements.featureList || [];
    if (currentList.length >= 4) return;
    updateVisual('featureList', [...currentList, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    const currentList = brief.visualElements.featureList || [];
    updateVisual(
      'featureList',
      currentList.filter((_, i) => i !== index)
    );
  };

  const handleQuickAddTemplate = (type: any) => {
    const newScene = createSceneFromTemplate(type);
    const existing = brief.scenes || [];
    onUpdateBrief({
      ...brief,
      scenes: [...existing, newScene],
    });
  };

  return (
    <aside className="w-full h-full bg-[#16171d] flex flex-row overflow-hidden shrink-0 select-none">
      {/* CapCut Left Slim Tool Rail */}
      <div className="w-16 bg-[#111217] border-r border-[#21232b] flex flex-col items-center py-3 gap-2 shrink-0">
        {/* Template Catalog Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('template')}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'template'
              ? 'bg-[#232733] text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-[#1a1c24]'
          }`}
          title="Template & Scene"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-[9px]">Template</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('media')}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'media'
              ? 'bg-[#232733] text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-[#1a1c24]'
          }`}
          title="Media & Brief"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="text-[9px]">Media</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'text'
              ? 'bg-[#232733] text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-[#1a1c24]'
          }`}
          title="Teks & Tipografi"
        >
          <Type className="w-4 h-4" />
          <span className="text-[9px]">Teks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('color')}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'color'
              ? 'bg-[#232733] text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-[#1a1c24]'
          }`}
          title="Warna & Gaya"
        >
          <Palette className="w-4 h-4" />
          <span className="text-[9px]">Warna</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('elements')}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'elements'
              ? 'bg-[#232733] text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-[#1a1c24]'
          }`}
          title="Elemen & Fitur"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[9px]">Elemen</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('animation')}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'animation'
              ? 'bg-[#232733] text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-[#1a1c24]'
          }`}
          title="Animasi Spring Remotion"
        >
          <Zap className="w-4 h-4" />
          <span className="text-[9px]">Animasi</span>
        </button>
      </div>

      {/* Main Tab Panel Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 gap-4 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Floating pop-out button on top right of panel if available */}
        {onPopOut && !isFloating && (
          <div className="flex items-center justify-between pb-2 border-b border-[#23252d]">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Panel Pengaturan
            </span>
            <button
              type="button"
              onClick={onPopOut}
              className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-[#252838] transition-colors"
              title="Buka sebagai Jendela Melayang / Modal"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Undock Modal</span>
            </button>
          </div>
        )}

        {/* TAB 0: TEMPLATE CATALOG & QUICK ADD */}
        {activeTab === 'template' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Katalog Template Scene
                </h3>
                <p className="text-[11px] text-slate-400">
                  Sisipkan template adegan ke video Anda:
                </p>
              </div>

              {onOpenAddTemplateModal && (
                <button
                  type="button"
                  onClick={onOpenAddTemplateModal}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 hover:bg-cyan-900 text-[10px] font-bold transition-colors"
                >
                  Buka Modal
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {SCENE_TEMPLATES_CATALOG.map((tmpl) => (
                <div
                  key={tmpl.type}
                  className="p-3 rounded-xl bg-[#1b1c25] border border-[#262939] hover:border-cyan-500/50 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tmpl.color }} />
                      <span className="font-bold text-slate-200 text-xs">{tmpl.title}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#252838] text-slate-400 font-mono">
                      {tmpl.defaultDurationInFrames}f
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                    {tmpl.description}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] font-bold text-cyan-400 uppercase">
                      {tmpl.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickAddTemplate(tmpl.type)}
                      className="px-2.5 py-1 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Sisipkan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1: MEDIA & PRESETS */}
        {activeTab === 'media' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Preset Templat CapCut</span>
                <span className="text-[10px] text-cyan-400 font-mono">Remotion v4</span>
              </h3>
              <p className="text-[11px] text-slate-400 mb-2.5">
                Pilih arsitektur komposisi instan untuk video Anda:
              </p>

              <div className="space-y-2">
                {VIDEO_PRESETS.map((p) => {
                  const isSelected = brief.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePresetSelect(p)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#202738] border-cyan-500/80 text-white shadow-md'
                          : 'bg-[#1b1c24] border-[#292c38] text-slate-300 hover:border-slate-600 hover:bg-[#20222d]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase">
                          {p.format} • {p.scenes?.length || 4} Scene
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-slate-400">
                          {p.visualElements.brandName}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-100 truncate text-[11px]">
                        {p.topic}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-[#262833]">
              <label className="block font-bold text-slate-300 mb-1">
                Topik Video / Brief Deskripsi:
              </label>
              <textarea
                rows={3}
                value={brief.topic}
                onChange={(e) => onUpdateBrief({ ...brief, topic: e.target.value })}
                className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none transition-colors text-xs resize-none"
                placeholder="Deskripsikan ide konten video programatik Anda..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Format Video:
                </label>
                <select
                  value={brief.format}
                  onChange={(e) =>
                    onUpdateBrief({ ...brief, format: e.target.value as VideoFormat })
                  }
                  className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2 text-slate-200 focus:outline-none text-xs"
                >
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 Reels/TikTok</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Frame Rate:
                </label>
                <select
                  value={brief.fps}
                  onChange={(e) =>
                    onUpdateBrief({ ...brief, fps: parseInt(e.target.value, 10) })
                  }
                  className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2 text-slate-200 focus:outline-none text-xs"
                >
                  <option value={30}>30 fps (Standar)</option>
                  <option value={60}>60 fps (Smooth)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEKS & TIPOGRAFI */}
        {activeTab === 'text' && (
          <div className="space-y-4 text-xs">
            {/* Sub-tab switcher: Teks Scene vs Teks Global */}
            <div className="flex bg-[#111217] p-1 rounded-xl border border-[#262938]">
              <button
                type="button"
                onClick={() => setTextSubTab('scene')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  textSubTab === 'scene'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Teks Scene Aktif
              </button>
              <button
                type="button"
                onClick={() => setTextSubTab('global')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  textSubTab === 'global'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Teks Brand Global
              </button>
            </div>

            {textSubTab === 'scene' ? (
              <div className="space-y-3">
                {/* Scene selector dropdown */}
                {brief.scenes && brief.scenes.length > 0 && (
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">
                      Pilih Scene yang Diedit:
                    </label>
                    <select
                      value={activeSceneId || brief.scenes[0].id}
                      onChange={(e) => onSelectSceneId && onSelectSceneId(e.target.value)}
                      className="w-full bg-[#111217] border border-[#2b3042] focus:border-cyan-500 rounded-xl p-2.5 text-slate-100 font-bold text-xs focus:outline-none"
                    >
                      {brief.scenes.map((sc, i) => (
                        <option key={sc.id} value={sc.id}>
                          Scene #{i + 1}: {sc.name} ({sc.templateType})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(() => {
                  const currentScene =
                    brief.scenes?.find((s) => s.id === activeSceneId) || brief.scenes?.[0];
                  if (!currentScene || !onUpdateScene) {
                    return (
                      <div className="text-center p-6 text-slate-500">
                        Tidak ada adegan yang dipilih.
                      </div>
                    );
                  }

                  const sceneIndex = brief.scenes?.findIndex((s) => s.id === currentScene.id) ?? 0;

                  return (
                    <SceneCustomizer
                      scene={currentScene}
                      onUpdateScene={onUpdateScene}
                      sceneIndex={sceneIndex}
                      totalScenes={brief.scenes?.length}
                    />
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Teks & Tipografi Global
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Edit nilai default watermark brand dan tombol Call-To-Action penutup:
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Nama Brand / Channel:
                  </label>
                  <input
                    type="text"
                    value={brief.visualElements.brandName}
                    onChange={(e) => updateVisual('brandName', e.target.value)}
                    className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2.5 text-slate-200 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Default Teks Tombol CTA:
                  </label>
                  <input
                    type="text"
                    value={brief.visualElements.ctaText}
                    onChange={(e) => updateVisual('ctaText', e.target.value)}
                    className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2.5 text-slate-200 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Default Badge Header:
                  </label>
                  <input
                    type="text"
                    value={brief.visualElements.badgeText}
                    onChange={(e) => updateVisual('badgeText', e.target.value)}
                    className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2.5 text-slate-200 focus:outline-none text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WARNA & GAYA */}
        {activeTab === 'color' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Palet Warna & Gaya Ambient
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Warna gradient mesh dan glowing orb yang merender secara dinamis:
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Preset Palet Cepat:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Neon Cyber', accent: '#ec4899', sec: '#8b5cf6', bg: '#0c0714' },
                  { name: 'Teal Modern', accent: '#06b6d4', sec: '#6366f1', bg: '#090a10' },
                  { name: 'Emerald AI', accent: '#10b981', sec: '#06b6d4', bg: '#051210' },
                  { name: 'Sunset Flash', accent: '#f59e0b', sec: '#ef4444', bg: '#160b05' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      updateVisual('accentColor', item.accent);
                      updateVisual('secondaryColor', item.sec);
                      updateVisual('backgroundColor', item.bg);
                    }}
                    className="p-2 rounded-xl bg-[#111217] border border-[#262936] hover:border-cyan-500 flex items-center justify-between transition-colors"
                  >
                    <span className="text-[11px] font-semibold text-slate-200">{item.name}</span>
                    <div className="flex gap-1">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.accent }} />
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.sec }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#262833]">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Accent Color:
                </label>
                <div className="flex items-center gap-2 bg-[#111217] border border-[#262936] rounded-xl p-1.5">
                  <input
                    type="color"
                    value={brief.visualElements.accentColor}
                    onChange={(e) => updateVisual('accentColor', e.target.value)}
                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-slate-200">
                    {brief.visualElements.accentColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Secondary Color:
                </label>
                <div className="flex items-center gap-2 bg-[#111217] border border-[#262936] rounded-xl p-1.5">
                  <input
                    type="color"
                    value={brief.visualElements.secondaryColor}
                    onChange={(e) => updateVisual('secondaryColor', e.target.value)}
                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-slate-200">
                    {brief.visualElements.secondaryColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Background Color:
                </label>
                <div className="flex items-center gap-2 bg-[#111217] border border-[#262936] rounded-xl p-1.5">
                  <input
                    type="color"
                    value={brief.visualElements.backgroundColor}
                    onChange={(e) => updateVisual('backgroundColor', e.target.value)}
                    className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-slate-200">
                    {brief.visualElements.backgroundColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ELEMEN & FITUR */}
        {activeTab === 'elements' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Kartu Fitur & Metrik Impak
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Elemen visual yang tampil pada showcase adegan:
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Daftar Fitur Showcase ({brief.visualElements.featureList?.length || 0}/4):
              </label>
              <div className="space-y-1.5 mb-2">
                {brief.visualElements.featureList?.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-[#111217] border border-[#262936] px-3 py-1.5 rounded-lg"
                  >
                    <span className="truncate text-slate-200">
                      <strong className="text-cyan-400 mr-2">0{idx + 1}.</strong>
                      {feat}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {(brief.visualElements.featureList?.length || 0) < 4 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Tambah poin fitur..."
                    className="flex-1 bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 bg-[#252834] hover:bg-[#303444] text-slate-200 rounded-xl transition-colors font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#262833] space-y-2">
              <label className="block font-bold text-slate-300">
                Metrik Angka Impak (Counter Spring):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Angka / Persen:</span>
                  <input
                    type="text"
                    value={brief.visualElements.metricNumber}
                    onChange={(e) => updateVisual('metricNumber', e.target.value)}
                    className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2 text-slate-200 font-mono text-xs focus:outline-none"
                    placeholder="10x, 95%, $10M"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Label Metrik:</span>
                  <input
                    type="text"
                    value={brief.visualElements.metricLabel}
                    onChange={(e) => updateVisual('metricLabel', e.target.value)}
                    className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2 text-slate-200 text-xs focus:outline-none"
                    placeholder="Efisiensi Render"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ANIMASI SPRING */}
        {activeTab === 'animation' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Fisika Animasi Remotion
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Remotion menghitung setiap frame secara matematis melalui hook <code className="text-cyan-400">spring()</code>:
              </p>
            </div>

            <div className="bg-[#111217] border border-[#262936] rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="font-semibold flex items-center gap-1.5 text-cyan-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Kurva Damped Spring</span>
                </span>
                <span className="text-slate-500 font-mono">20 steps</span>
              </div>

              <div className="h-20 flex items-end gap-1 pt-2 border-b border-[#262936] px-1">
                {springSamples.map((val, idx) => {
                  const heightPct = Math.min(100, Math.max(10, val * 75));
                  return (
                    <div
                      key={idx}
                      title={`Step ${idx}: ${val}`}
                      style={{ height: `${heightPct}%` }}
                      className="flex-1 bg-gradient-to-t from-cyan-600 via-teal-400 to-emerald-400 rounded-t-sm"
                    />
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1">
                <span>Start: 0.0 (frame 0)</span>
                <span>Peak: ~1.10 (overshoot)</span>
                <span>Settle: 1.0</span>
              </div>
            </div>

            <div className="bg-[#111217] border border-[#262936] rounded-xl p-3 space-y-2">
              <div className="text-[11px] font-bold text-slate-200">
                Parameter Remotion Spring Resmi:
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc pl-4">
                <li><strong className="text-slate-200">fps:</strong> Diambil otomatis dari <code className="text-cyan-400 font-mono">useVideoConfig()</code></li>
                <li><strong className="text-slate-200">damping:</strong> 12 (mencegah osilasi berlebih)</li>
                <li><strong className="text-slate-200">stiffness:</strong> 120 (kecepatan respon pegas)</li>
                <li><strong className="text-slate-200">mass:</strong> 0.6 (bobot inersia kinetik)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
