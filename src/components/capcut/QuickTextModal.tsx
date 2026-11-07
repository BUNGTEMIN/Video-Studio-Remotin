import React from 'react';
import {
  Type,
  X,
  Eye,
  EyeOff,
  AlignLeft,
  Sparkles,
  Check,
} from 'lucide-react';
import type { VideoScene } from '../../types/remotion';

interface QuickTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: VideoScene | null;
  sceneIndex: number;
  onUpdateScene: (updatedScene: VideoScene) => void;
}

export const QuickTextModal: React.FC<QuickTextModalProps> = ({
  isOpen,
  onClose,
  scene,
  sceneIndex,
  onUpdateScene,
}) => {
  if (!isOpen || !scene) return null;

  const currentTitle = scene.title || '';
  const currentSubtitle = scene.subtitle || '';
  const isHidden = !!scene.hideText;

  const handleTitleChange = (val: string) => {
    onUpdateScene({
      ...scene,
      title: val,
      hideText: false,
    });
  };

  const handleSubtitleChange = (val: string) => {
    onUpdateScene({
      ...scene,
      subtitle: val,
      hideText: false,
    });
  };

  const handleToggleHide = () => {
    onUpdateScene({
      ...scene,
      hideText: !isHidden,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161822] border border-[#2e334a] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#232638] flex items-center justify-between bg-[#13141f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Edit Teks & Tipografi (T1)
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Scene #{sceneIndex + 1}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Ubah judul kinetik dan kalimat penjelas adegan ini secara langsung.
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
          {/* Live Preview Card */}
          <div className="p-4 rounded-xl bg-[#0f1016] border border-[#232738] flex flex-col justify-center min-h-[90px] relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">
              Pratinjau Tipografi Scene
            </span>
            {isHidden ? (
              <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold py-2">
                <EyeOff className="w-4 h-4" />
                <span>Seluruh teks disembunyikan untuk scene ini</span>
              </div>
            ) : (
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white leading-tight">
                  {currentTitle || '(Belum ada judul utama)'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {currentSubtitle || '(Belum ada subteks)'}
                </p>
              </div>
            )}
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#11131c] border border-[#222533]">
            <div className="flex items-center gap-2.5">
              {isHidden ? (
                <EyeOff className="w-4 h-4 text-slate-500" />
              ) : (
                <Eye className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-xs font-semibold text-slate-200">
                Tampilkan Teks di Adegan Ini
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleHide}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                isHidden
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  : 'bg-amber-500 text-slate-950 shadow-md'
              }`}
            >
              {isHidden ? 'Disembunyikan' : 'Aktif (Muncul)'}
            </button>
          </div>

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Judul Utama (Headline):</span>
              <span className="text-[10px] text-slate-500 font-normal">Animasi Kinetik Spring</span>
            </label>
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ketik judul utama adegan..."
              className="w-full px-3 py-2 rounded-xl bg-[#0d0e14] border border-[#2b3044] text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Subtitle Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Subheadline / Penjelas:</span>
              <span className="text-[10px] text-slate-500 font-normal">Deskripsi pendukung</span>
            </label>
            <textarea
              rows={3}
              value={currentSubtitle}
              onChange={(e) => handleSubtitleChange(e.target.value)}
              placeholder="Ketik kalimat subteks penjelas..."
              className="w-full px-3 py-2 rounded-xl bg-[#0d0e14] border border-[#2b3044] text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#232638] bg-[#12131d] flex items-center justify-between">
          <button
            type="button"
            onClick={handleToggleHide}
            className="text-xs text-slate-400 hover:text-white"
          >
            {isHidden ? 'Tampilkan Kembali Teks' : 'Sembunyikan Teks'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
