import React, { useState } from 'react';
import {
  X,
  Plus,
  Flame,
  Zap,
  LayoutGrid,
  Layers,
  TrendingUp,
  Columns,
  Quote,
  Sparkles,
  Check,
} from 'lucide-react';
import { SCENE_TEMPLATES_CATALOG, createSceneFromTemplate } from '../../data/sceneTemplates';
import type { SceneTemplateType, VideoScene } from '../../types/remotion';

interface AddTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddScene: (newScene: VideoScene) => void;
}

const CATEGORIES = ['Semua', 'Intro', 'Fitur', 'Data', 'Komparasi', 'Outro'] as const;

export const AddTemplateModal: React.FC<AddTemplateModalProps> = ({
  isOpen,
  onClose,
  onAddScene,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [addedTemplateType, setAddedTemplateType] = useState<SceneTemplateType | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = SCENE_TEMPLATES_CATALOG.filter((template) => {
    if (selectedCategory === 'Semua') return true;
    return template.category === selectedCategory;
  });

  const handleSelectTemplate = (type: SceneTemplateType) => {
    const scene = createSceneFromTemplate(type);
    onAddScene(scene);
    setAddedTemplateType(type);
    setTimeout(() => {
      setAddedTemplateType(null);
      onClose();
    }, 600);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-indigo-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-pink-400" />;
      case 'LayoutGrid':
        return <LayoutGrid className="w-5 h-5 text-cyan-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-blue-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'Columns':
        return <Columns className="w-5 h-5 text-amber-400" />;
      case 'Quote':
        return <Quote className="w-5 h-5 text-purple-400" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#14161f] border border-[#2b2f3e] rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#242735] flex items-center justify-between shrink-0 bg-[#171923]">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">
                Katalog Template & Tambah Scene
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih template visual adegan untuk disisipkan ke timeline Remotion Anda
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#252838] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-6 py-3 border-b border-[#212431] flex items-center gap-2 overflow-x-auto shrink-0 bg-[#12131b]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md font-bold'
                  : 'bg-[#1b1d28] text-slate-400 hover:text-white hover:bg-[#252837]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => {
            const isJustAdded = addedTemplateType === template.type;

            return (
              <div
                key={template.type}
                className="group p-4 rounded-xl bg-[#181a24] border border-[#262938] hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#202332] border border-[#2f3346]">
                        {getIcon(template.iconName)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {template.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-[#252838] text-slate-300">
                            {template.category}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400 font-medium">
                            {template.defaultDurationInFrames} frames ({(template.defaultDurationInFrames / 30).toFixed(1)}s)
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {template.badge}
                    </span>
                  </div>

                  {/* Visual Card Mini Preview Bar */}
                  <div
                    className={`h-16 w-full rounded-lg bg-gradient-to-r ${template.previewGradient} border border-white/10 p-2.5 flex flex-col justify-center mb-3`}
                  >
                    <div className="text-[11px] font-bold text-white truncate">
                      {template.defaultContent.title || template.defaultContent.metricLabel || template.defaultContent.badgeText}
                    </div>
                    <div className="text-[9px] text-slate-300 line-clamp-1 mt-0.5">
                      {template.defaultContent.subtitle || template.defaultContent.beforeText || 'Animasi Remotion spring() presisi'}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {template.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#232635] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Auto Transisi: <strong className="text-slate-200">Fade (15f)</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSelectTemplate(template.type)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isJustAdded
                        ? 'bg-emerald-500 text-slate-950 scale-95'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow hover:shadow-cyan-500/20 active:scale-95'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersisip!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Sisipkan ke Timeline</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
