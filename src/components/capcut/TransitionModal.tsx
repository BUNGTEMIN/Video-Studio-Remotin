import React, { useState } from 'react';
import { X, Sparkles, Check, Sliders, ArrowRight } from 'lucide-react';
import { TRANSITION_CATALOG } from '../../data/sceneTemplates';
import type { SceneTransition, TransitionType } from '../../types/remotion';

interface TransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTransition?: SceneTransition;
  sceneName?: string;
  onApplyTransition: (transition: SceneTransition, applyToAll?: boolean) => void;
}

export const TransitionModal: React.FC<TransitionModalProps> = ({
  isOpen,
  onClose,
  currentTransition = { type: 'fade', durationInFrames: 15 },
  sceneName = 'Scene',
  onApplyTransition,
}) => {
  const [selectedType, setSelectedType] = useState<TransitionType>(currentTransition.type);
  const [durationFrames, setDurationFrames] = useState<number>(currentTransition.durationInFrames || 15);
  const [applyToAll, setApplyToAll] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyTransition(
      {
        type: selectedType,
        durationInFrames: durationFrames,
      },
      applyToAll
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#14161f] border border-[#2b2f3e] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#252838]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Pengaturan Transisi Adegan
            </h3>
            <p className="text-xs text-slate-400">
              Menghubungkan {sceneName} ke adegan berikutnya secara programatik
            </p>
          </div>
        </div>

        {/* Duration Slider */}
        <div className="p-4 rounded-xl bg-[#191b26] border border-[#262939] mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Durasi Transisi
            </span>
            <span className="font-mono text-cyan-400 font-bold bg-[#111219] px-2 py-0.5 rounded border border-cyan-800/40">
              {durationFrames} frames ({(durationFrames / 30).toFixed(2)} detik)
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
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>5f (Cepat)</span>
            <span>15f (Standar)</span>
            <span>30f (Dramatis)</span>
          </div>
        </div>

        {/* Transition Style Selector Grid */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-semibold text-slate-300">
            Pilih Efek Transisi Remotion:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {TRANSITION_CATALOG.map((item) => {
              const isSelected = selectedType === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    setSelectedType(item.type);
                    if (item.defaultFrames > 0 && durationFrames === 15) {
                      setDurationFrames(item.defaultFrames);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-[#181a24] border-[#262938] text-slate-400 hover:text-white hover:border-[#383d54]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold truncate">{item.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-[#252838] text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[10px] line-clamp-2 leading-tight opacity-75">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Apply To All Toggle */}
        <div className="p-3 rounded-xl bg-[#12131b] border border-[#232635] flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="applyToAll"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="applyToAll" className="text-xs text-slate-300 font-medium cursor-pointer">
              Terapkan transisi ini ke seluruh adegan di timeline
            </label>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Batch Apply</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262939]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#252838] transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Transisi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
