import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Palette,
  Film,
  Plus,
  Trash2,
  Layers,
  Wand2,
  CheckCircle2,
} from 'lucide-react';
import type { VideoBrief, VideoFormat } from '../../types/remotion';
import { VIDEO_PRESETS } from '../../data/presets';
import { secondsToFrames } from '../../utils/remotionMath';

interface VideoBriefFormProps {
  brief: VideoBrief;
  onUpdateBrief: (newBrief: VideoBrief) => void;
  onGenerateCode: () => void;
}

export const VideoBriefForm: React.FC<VideoBriefFormProps> = ({
  brief,
  onUpdateBrief,
  onGenerateCode,
}) => {
  const [activeTab, setActiveTab] = useState<'brief' | 'elements'>('brief');
  const [newFeatureText, setNewFeatureText] = useState('');
  const [isSynced, setIsSynced] = useState(false);

  const totalFrames = secondsToFrames(brief.durationSeconds, brief.fps);

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

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-5">
      {/* Header & Presets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">
              Arsitek Video Remotion
            </h2>
          </div>
          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Auto-Sync Player
          </span>
        </div>

        {/* Quick Presets Bar */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">
            Preset Arsitektur Siap Pakai:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {VIDEO_PRESETS.map((p) => {
              const isSelected = brief.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold truncate text-[11px] text-indigo-300">
                      {p.format} • {p.durationSeconds}s
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {p.visualElements.brandName}
                    </span>
                  </div>
                  <div className="truncate text-slate-200">{p.topic}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('brief')}
          className={`pb-2.5 text-xs font-semibold px-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'brief'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Spesifikasi Brief</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('elements')}
          className={`pb-2.5 text-xs font-semibold px-2 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'elements'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Elemen Visual & Konten</span>
        </button>
      </div>

      {/* Form Content */}
      {activeTab === 'brief' ? (
        <div className="space-y-4 text-xs">
          {/* Topik Video */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Topik Video / Deskripsi Konten:
            </label>
            <textarea
              rows={2}
              value={brief.topic}
              onChange={(e) => onUpdateBrief({ ...brief, topic: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none transition-colors resize-none leading-relaxed"
              placeholder="Contoh: Peluncuran Fitur AI Generatif SaaS 2026..."
            />
          </div>

          {/* Format Video & FPS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Format Rasio Video:
              </label>
              <select
                value={brief.format}
                onChange={(e) =>
                  onUpdateBrief({ ...brief, format: e.target.value as VideoFormat })
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-slate-100 focus:outline-none transition-colors"
              >
                <option value="16:9">16:9 Horizontal (1920x1080)</option>
                <option value="9:16">9:16 Vertikal (1080x1920 Reels/TikTok)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Frame Rate (FPS):
              </label>
              <select
                value={brief.fps}
                onChange={(e) =>
                  onUpdateBrief({ ...brief, fps: parseInt(e.target.value, 10) })
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-slate-100 focus:outline-none transition-colors"
              >
                <option value={30}>30 fps (Standar Web & Video)</option>
                <option value={60}>60 fps (Ultra Smooth Motion)</option>
              </select>
            </div>
          </div>

          {/* Durasi Video Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-300">
                Durasi Video:
              </label>
              <span className="font-mono text-indigo-400 font-bold bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/60">
                {brief.durationSeconds} Detik ({totalFrames} frame)
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={brief.durationSeconds}
              aria-label="Durasi Video"
              onChange={(e) =>
                onUpdateBrief({
                  ...brief,
                  durationSeconds: parseInt(e.target.value, 10),
                })
              }
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>5s (Short Hook)</span>
              <span>15s (Standard Promo)</span>
              <span>30s (Long Explainer)</span>
            </div>
          </div>

          {/* Brand Name & CTA */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Nama Brand:
              </label>
              <input
                type="text"
                value={brief.visualElements.brandName}
                onChange={(e) => updateVisual('brandName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Call to Action (CTA):
              </label>
              <input
                type="text"
                value={brief.visualElements.ctaText}
                onChange={(e) => updateVisual('ctaText', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Badge & Headlines */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Teks Badge / Kategori:
            </label>
            <input
              type="text"
              value={brief.visualElements.badgeText}
              onChange={(e) => updateVisual('badgeText', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-slate-100 focus:outline-none"
              placeholder="Contoh: FITUR TERBARU 2026"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Judul Utama (Kinetic Headline):
            </label>
            <input
              type="text"
              value={brief.visualElements.headline}
              onChange={(e) => updateVisual('headline', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Subheadline:
            </label>
            <input
              type="text"
              value={brief.visualElements.subheadline}
              onChange={(e) => updateVisual('subheadline', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-slate-100 focus:outline-none"
            />
          </div>

          {/* Color Palettes */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Accent
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                <input
                  type="color"
                  value={brief.visualElements.accentColor}
                  onChange={(e) => updateVisual('accentColor', e.target.value)}
                  className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[11px] text-slate-300">
                  {brief.visualElements.accentColor}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Secondary
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                <input
                  type="color"
                  value={brief.visualElements.secondaryColor}
                  onChange={(e) => updateVisual('secondaryColor', e.target.value)}
                  className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[11px] text-slate-300">
                  {brief.visualElements.secondaryColor}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Background
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                <input
                  type="color"
                  value={brief.visualElements.backgroundColor}
                  onChange={(e) => updateVisual('backgroundColor', e.target.value)}
                  className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[11px] text-slate-300 truncate">
                  {brief.visualElements.backgroundColor}
                </span>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Daftar Fitur Programatik ({brief.visualElements.featureList?.length || 0}/4):
            </label>
            <div className="space-y-1.5 mb-2">
              {brief.visualElements.featureList?.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg"
                >
                  <span className="truncate text-slate-200">
                    <strong className="text-indigo-400 mr-2">0{idx + 1}.</strong>
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
                  placeholder="Tambah fitur baru..."
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>
            )}
          </div>

          {/* Metric / Impact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Angka Metrik (Counter):
              </label>
              <input
                type="text"
                value={brief.visualElements.metricNumber}
                onChange={(e) => updateVisual('metricNumber', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-slate-100 font-mono focus:outline-none"
                placeholder="misal: 10x, 95%, $10M"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Label Metrik:
              </label>
              <input
                type="text"
                value={brief.visualElements.metricLabel}
                onChange={(e) => updateVisual('metricLabel', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                placeholder="misal: Efisiensi Render"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            setIsSynced(true);
            onGenerateCode();
            setTimeout(() => setIsSynced(false), 2000);
          }}
          className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
            isSynced
              ? 'bg-emerald-600 shadow-emerald-950/50'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-indigo-600/30'
          }`}
        >
          {isSynced ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Kode Remotion & Player Tersinkronisasi!</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Hasilkan Struktur Kode Remotion (Sync)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
