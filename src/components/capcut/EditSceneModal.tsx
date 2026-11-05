import React from 'react';
import { X, Sparkles, Sliders, Check } from 'lucide-react';
import type { VideoScene } from '../../types/remotion';
import { SceneCustomizer } from './SceneCustomizer';

interface EditSceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene?: VideoScene;
  onUpdateScene: (updatedScene: VideoScene) => void;
  sceneIndex?: number;
  totalScenes?: number;
}

export const EditSceneModal: React.FC<EditSceneModalProps> = ({
  isOpen,
  onClose,
  scene,
  onUpdateScene,
  sceneIndex,
  totalScenes,
}) => {
  if (!isOpen || !scene) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#141620] border border-[#2d3244] rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#242735] flex items-center justify-between shrink-0 bg-[#181a24]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Kustomisasi Teks & Template Scene
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Edit judul, subheadline, kartu fitur, atau metrik untuk {scene.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#252838] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-800">
          <SceneCustomizer
            scene={scene}
            onUpdateScene={onUpdateScene}
            sceneIndex={sceneIndex}
            totalScenes={totalScenes}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#242735] bg-[#141620] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Perubahan langsung tersimpan dan di-render secara <em>real-time</em>.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Selesai & Simpan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
