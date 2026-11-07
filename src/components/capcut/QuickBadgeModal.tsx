import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Eye,
  EyeOff,
  Palette,
  Check,
  Tag,
  Zap,
  Flame,
  Award,
} from 'lucide-react';
import type { VideoScene } from '../../types/remotion';

const BADGE_PRESETS = [
  { label: '✦ FITUR TERBARU 2026', icon: Sparkles, color: '#6366f1' },
  { label: '🔥 PROMO SPESIAL 50%', icon: Flame, color: '#f43f5e' },
  { label: '⚡ 10X LEBIH CEPAT', icon: Zap, color: '#eab308' },
  { label: '🚀 NEW UPDATE RELEASE', icon: Sparkles, color: '#06b6d4' },
  { label: '⭐ RATING 4.9 / 5.0', icon: Award, color: '#10b981' },
  { label: '💡 TIPS & TRIK SAAS', icon: Tag, color: '#8b5cf6' },
  { label: '🏆 TERBUKTI OTOMATIS', icon: Award, color: '#f97316' },
  { label: '🔒 100% AMAN & DETERMINISTIK', icon: Tag, color: '#14b8a6' },
];

interface QuickBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: VideoScene | null;
  sceneIndex: number;
  onUpdateScene: (updatedScene: VideoScene) => void;
}

export const QuickBadgeModal: React.FC<QuickBadgeModalProps> = ({
  isOpen,
  onClose,
  scene,
  sceneIndex,
  onUpdateScene,
}) => {
  if (!isOpen || !scene) return null;

  const currentBadgeText = scene.badgeText || 'FITUR TERBARU 2026';
  const isHidden = !!scene.hideBadge;

  const handleTextChange = (text: string) => {
    onUpdateScene({
      ...scene,
      badgeText: text,
      hideBadge: false, // un-hide when user edits
    });
  };

  const handleToggleHide = () => {
    onUpdateScene({
      ...scene,
      hideBadge: !isHidden,
    });
  };

  const handleSelectPreset = (preset: (typeof BADGE_PRESETS)[0]) => {
    onUpdateScene({
      ...scene,
      badgeText: preset.label,
      hideBadge: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161822] border border-[#2e334a] rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#232638] flex items-center justify-between bg-[#13141f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Kustomisasi Badge Grafis (G1)
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Scene #{sceneIndex + 1}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pill badge penarik perhatian di atas judul adegan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Live Preview of Badge */}
          <div className="p-4 rounded-xl bg-[#0f1016] border border-[#232738] flex flex-col items-center justify-center min-h-[90px] relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-500 absolute top-2 left-3">
              Pratinjau Badge Scene
            </span>
            {isHidden ? (
              <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold mt-3">
                <EyeOff className="w-4 h-4" />
                <span>Badge disembunyikan untuk scene ini</span>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(147, 51, 234, 0.2)',
                  borderColor: 'rgba(168, 85, 247, 0.7)',
                  color: '#c084fc',
                }}
                className="mt-3 px-4 py-1.5 rounded-full border-2 text-xs font-black tracking-wider uppercase shadow-lg shadow-purple-500/20 animate-pulse"
              >
                {currentBadgeText || 'BADGE TEKS'}
              </div>
            )}
          </div>

          {/* Visibility Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#11131c] border border-[#222533]">
            <div className="flex items-center gap-2.5">
              {isHidden ? (
                <EyeOff className="w-4 h-4 text-slate-500" />
              ) : (
                <Eye className="w-4 h-4 text-purple-400" />
              )}
              <span className="text-xs font-semibold text-slate-200">
                Tampilkan Badge di Adegan Ini
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleHide}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                isHidden
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  : 'bg-purple-600 text-white shadow-md'
              }`}
            >
              {isHidden ? 'Disembunyikan' : 'Aktif (Muncul)'}
            </button>
          </div>

          {/* Input Text Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Teks Badge / Tag:
            </label>
            <input
              type="text"
              value={currentBadgeText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Contoh: FITUR TERBARU 2026, DISKON 50%..."
              className="w-full px-3 py-2 rounded-xl bg-[#0d0e14] border border-[#2b3044] text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Pilihan Preset Badge Populer (1-Klik):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BADGE_PRESETS.map((preset, idx) => {
                const IconComponent = preset.icon;
                const isSelected = currentBadgeText === preset.label && !isHidden;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-lg border text-left text-[11px] font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-purple-200 ring-1 ring-purple-500/40'
                        : 'bg-[#10121a] border-[#222533] text-slate-300 hover:border-slate-500 hover:bg-[#151824]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <IconComponent className="w-3 h-3 text-purple-400 shrink-0" />
                      <span className="truncate">{preset.label}</span>
                    </span>
                    {isSelected && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#232638] bg-[#12131d] flex items-center justify-between">
          <button
            type="button"
            onClick={handleToggleHide}
            className="text-xs text-slate-400 hover:text-white"
          >
            {isHidden ? 'Tampilkan Kembali' : 'Sembunyikan Badge'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
