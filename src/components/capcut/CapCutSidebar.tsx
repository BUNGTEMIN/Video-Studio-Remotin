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
  Split,
} from 'lucide-react';
import type { VideoBrief, VideoFormat, VideoScene } from '../../types/remotion';
import { VIDEO_PRESETS } from '../../data/presets';
import { SCENE_TEMPLATES_CATALOG, createSceneFromTemplate } from '../../data/sceneTemplates';
import { secondsToFrames, sampleSpringCurve, getTotalFrames } from '../../utils/remotionMath';
import { SceneCustomizer } from './SceneCustomizer';
import { Tooltip } from '../common/Tooltip';

interface CapCutSidebarProps {
  brief: VideoBrief;
  onUpdateBrief: (newBrief: VideoBrief) => void;
  onOpenAddTemplateModal?: () => void;
  onPopOut?: () => void;
  isFloating?: boolean;
  activeSceneId?: string;
  onSelectSceneId?: (id: string) => void;
  onUpdateScene?: (updatedScene: VideoScene) => void;
  onOpenTransitionsGallery?: () => void;
  onOpenTemplateEditor?: () => void;
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
  onOpenTransitionsGallery,
  onOpenTemplateEditor,
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
      {/* CapCut Left Slim Tool Rail (Icon-Only + Floating Tooltip) */}
      <div className="w-12 bg-[#111217] border-r border-[#21232b] flex flex-col items-center py-3 gap-2 shrink-0">
        <Tooltip content="Katalog Template Scene" position="right">
          <button
            type="button"
            onClick={() => setActiveTab('template')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'template'
                ? 'bg-[#232733] text-cyan-400 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1a1c24]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Media & Brief Video" position="right">
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'media'
                ? 'bg-[#232733] text-cyan-400 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1a1c24]'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Teks & Tipografi" position="right">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'text'
                ? 'bg-[#232733] text-cyan-400 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1a1c24]'
            }`}
          >
            <Type className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Warna & Gaya Ambient" position="right">
          <button
            type="button"
            onClick={() => setActiveTab('color')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'color'
                ? 'bg-[#232733] text-cyan-400 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1a1c24]'
            }`}
          >
            <Palette className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Elemen & Metrik" position="right">
          <button
            type="button"
            onClick={() => setActiveTab('elements')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'elements'
                ? 'bg-[#232733] text-cyan-400 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1a1c24]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Animasi Spring Physics" position="right">
          <button
            type="button"
            onClick={() => setActiveTab('animation')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'animation'
                ? 'bg-[#232733] text-cyan-400 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-[#1a1c24]'
            }`}
          >
            <Zap className="w-4 h-4" />
          </button>
        </Tooltip>

        {onOpenTransitionsGallery && (
          <Tooltip content="Galeri Transisi Video" position="right">
            <button
              type="button"
              onClick={onOpenTransitionsGallery}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all text-cyan-400 hover:text-cyan-300 hover:bg-[#1a1c24]"
            >
              <Split className="w-4 h-4" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Main Tab Panel Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 gap-4 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Floating pop-out button on top right of panel if available */}
        {onPopOut && !isFloating && (
          <div className="flex items-center justify-between pb-2 border-b border-[#23252d]">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Panel Pengaturan
            </span>
            <Tooltip content="Buka sebagai Jendela Melayang (Modal)">
              <button
                type="button"
                onClick={onPopOut}
                className="text-slate-400 hover:text-cyan-400 p-1 rounded hover:bg-[#252838] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        )}

        {/* TAB 0: TEMPLATE CATALOG & QUICK ADD */}
        {activeTab === 'template' && (
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Katalog Template
              </h3>

              {onOpenAddTemplateModal && (
                <Tooltip content="Buka Galeri Modal Lengkap">
                  <button
                    type="button"
                    onClick={onOpenAddTemplateModal}
                    className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 hover:bg-cyan-900 transition-colors"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              )}
            </div>

            {/* Banner Link to New Dedicated Template Editor Page */}
            {onOpenTemplateEditor && (
              <button
                type="button"
                onClick={onOpenTemplateEditor}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-purple-950/80 via-[#221c38] to-indigo-950/80 hover:from-purple-900/90 hover:to-indigo-900/90 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-md group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-600/40 border border-purple-400/30 flex items-center justify-center text-purple-300">
                    <Palette className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] font-extrabold text-white">
                      Template Editor (V1)
                    </span>
                    <span className="block text-[9px] text-purple-300/80">
                      Edit & Duplikat Visual
                    </span>
                  </div>
                </div>
                <Tooltip content="Buka Template Visual Editor di Halaman Penuh">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-300 border border-purple-700/60 font-semibold group-hover:scale-105 transition-transform">
                    Buka →
                  </span>
                </Tooltip>
              </button>
            )}

            <div className="space-y-2">
              {SCENE_TEMPLATES_CATALOG.map((tmpl) => (
                <div
                  key={tmpl.type}
                  className="px-3 py-2.5 rounded-xl bg-[#1b1c25] border border-[#262939] hover:border-cyan-500/50 transition-all flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: tmpl.color }}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-200 text-xs truncate">
                        {tmpl.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold text-cyan-400 uppercase">
                          {tmpl.category}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {tmpl.defaultDurationInFrames}f
                        </span>
                      </div>
                    </div>
                  </div>

                  <Tooltip content={`Sisipkan ${tmpl.title}: ${tmpl.description}`}>
                    <button
                      type="button"
                      onClick={() => handleQuickAddTemplate(tmpl.type)}
                      className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1: MEDIA & PRESETS */}
        {activeTab === 'media' && (
          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Preset Komposisi
                </h3>
                <span className="text-[10px] text-cyan-400 font-mono">Remotion v4</span>
              </div>

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
                Topik Video:
              </label>
              <textarea
                rows={2}
                value={brief.topic}
                onChange={(e) => onUpdateBrief({ ...brief, topic: e.target.value })}
                className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none transition-colors text-xs resize-none"
                placeholder="Deskripsikan ide konten..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Format:
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
                  FPS:
                </label>
                <select
                  value={brief.fps}
                  onChange={(e) =>
                    onUpdateBrief({ ...brief, fps: parseInt(e.target.value, 10) })
                  }
                  className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2 text-slate-200 focus:outline-none text-xs"
                >
                  <option value={30}>30 fps</option>
                  <option value={60}>60 fps</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEKS & TIPOGRAFI */}
        {activeTab === 'text' && (
          <div className="space-y-3.5 text-xs">
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
                Teks Scene
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
                Teks Global
              </button>
            </div>

            {textSubTab === 'scene' ? (
              <div className="space-y-3">
                {/* Scene selector dropdown */}
                {brief.scenes && brief.scenes.length > 0 && (
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">
                      Pilih Scene:
                    </label>
                    <select
                      value={activeSceneId || brief.scenes[0].id}
                      onChange={(e) => onSelectSceneId && onSelectSceneId(e.target.value)}
                      className="w-full bg-[#111217] border border-[#2b3042] focus:border-cyan-500 rounded-xl p-2 text-slate-100 font-bold text-xs focus:outline-none"
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
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Brand & CTA Global
                </h3>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Nama Brand:
                  </label>
                  <input
                    type="text"
                    value={brief.visualElements.brandName}
                    onChange={(e) => updateVisual('brandName', e.target.value)}
                    className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2 text-slate-200 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Teks Tombol CTA:
                  </label>
                  <input
                    type="text"
                    value={brief.visualElements.ctaText}
                    onChange={(e) => updateVisual('ctaText', e.target.value)}
                    className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2 text-slate-200 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Badge Header:
                  </label>
                  <input
                    type="text"
                    value={brief.visualElements.badgeText}
                    onChange={(e) => updateVisual('badgeText', e.target.value)}
                    className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2 text-slate-200 focus:outline-none text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WARNA & GAYA */}
        {activeTab === 'color' && (
          <div className="space-y-3 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Palet Warna
            </h3>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Preset Cepat:
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
                  Accent:
                </label>
                <div className="flex items-center gap-2 bg-[#111217] border border-[#262936] rounded-xl p-1.5">
                  <input
                    type="color"
                    value={brief.visualElements.accentColor}
                    onChange={(e) => updateVisual('accentColor', e.target.value)}
                    className="w-6 h-6 rounded border-none cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-slate-200">
                    {brief.visualElements.accentColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Secondary:
                </label>
                <div className="flex items-center gap-2 bg-[#111217] border border-[#262936] rounded-xl p-1.5">
                  <input
                    type="color"
                    value={brief.visualElements.secondaryColor}
                    onChange={(e) => updateVisual('secondaryColor', e.target.value)}
                    className="w-6 h-6 rounded border-none cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-xs text-slate-200">
                    {brief.visualElements.secondaryColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Background:
                </label>
                <div className="flex items-center gap-2 bg-[#111217] border border-[#262936] rounded-xl p-1.5">
                  <input
                    type="color"
                    value={brief.visualElements.backgroundColor}
                    onChange={(e) => updateVisual('backgroundColor', e.target.value)}
                    className="w-6 h-6 rounded border-none cursor-pointer bg-transparent"
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
          <div className="space-y-3 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Fitur & Metrik
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-300">
                  Poin Fitur ({brief.visualElements.featureList?.length || 0}/4):
                </label>
              </div>

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
                    <Tooltip content="Hapus Fitur">
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
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
                    placeholder="Tambah poin..."
                    className="flex-1 bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
                  />
                  <Tooltip content="Tambah Poin Fitur">
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="p-2 bg-[#252834] hover:bg-[#303444] text-slate-200 rounded-xl transition-colors font-bold flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#262833] space-y-2">
              <label className="block font-bold text-slate-300">
                Metrik Angka Impak:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Nilai:</span>
                  <input
                    type="text"
                    value={brief.visualElements.metricNumber}
                    onChange={(e) => updateVisual('metricNumber', e.target.value)}
                    className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2 text-slate-200 font-mono text-xs focus:outline-none"
                    placeholder="10x, 95%"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Label:</span>
                  <input
                    type="text"
                    value={brief.visualElements.metricLabel}
                    onChange={(e) => updateVisual('metricLabel', e.target.value)}
                    className="w-full bg-[#111217] border border-[#262936] focus:border-cyan-500 rounded-xl p-2 text-slate-200 text-xs focus:outline-none"
                    placeholder="Efisiensi"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ANIMASI SPRING */}
        {activeTab === 'animation' && (
          <div className="space-y-3.5 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Fisika Animasi Spring
            </h3>

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
                <span>Start: 0.0</span>
                <span>Peak: ~1.10</span>
                <span>Settle: 1.0</span>
              </div>
            </div>

            <div className="bg-[#111217] border border-[#262936] rounded-xl p-3 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-200 mb-1">
                Konfigurasi Spring Remotion:
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="bg-[#171922] p-1.5 rounded border border-[#272a39] text-slate-300">
                  damping: <span className="text-cyan-400 font-bold">12</span>
                </div>
                <div className="bg-[#171922] p-1.5 rounded border border-[#272a39] text-slate-300">
                  stiffness: <span className="text-cyan-400 font-bold">120</span>
                </div>
                <div className="bg-[#171922] p-1.5 rounded border border-[#272a39] text-slate-300">
                  mass: <span className="text-cyan-400 font-bold">0.6</span>
                </div>
                <div className="bg-[#171922] p-1.5 rounded border border-[#272a39] text-slate-300">
                  overshootClamping: <span className="text-slate-400 font-bold">false</span>
                </div>
              </div>
            </div>

            {onOpenTransitionsGallery && (
              <button
                type="button"
                onClick={onOpenTransitionsGallery}
                className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buka Galeri Transisi</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
