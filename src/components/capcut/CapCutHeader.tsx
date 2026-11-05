import React, { useState } from 'react';
import {
  Video,
  Download,
  Code2,
  Ratio,
  Maximize2,
  Sparkles,
  BookOpen,
  ChevronDown,
  Check,
  FolderOpen,
  Film,
} from 'lucide-react';
import type { VideoBrief, VideoFormat } from '../../types/remotion';

interface CapCutHeaderProps {
  brief: VideoBrief;
  onFormatChange: (format: VideoFormat) => void;
  onOpenExportModal: () => void;
  onToggleCodeInspector: () => void;
  showCodeInspector: boolean;
  onOpenDocsModal: () => void;
  onOpenAddTemplateModal?: () => void;
}

export const CapCutHeader: React.FC<CapCutHeaderProps> = ({
  brief,
  onFormatChange,
  onOpenExportModal,
  onToggleCodeInspector,
  showCodeInspector,
  onOpenDocsModal,
  onOpenAddTemplateModal,
}) => {
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const isVertical = brief.format === '9:16';
  const sceneCount = brief.scenes?.length || 4;

  return (
    <header className="h-13 bg-[#111217] border-b border-[#23252d] px-4 flex items-center justify-between select-none z-40 shrink-0">
      {/* Left: CapCut Brand & Project Info */}
      <div className="flex items-center gap-3">
        {/* CapCut-style Logo Icon */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-teal-400 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-black">
          <Film className="w-4 h-4 text-black stroke-[2.5]" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white tracking-wide">
            CapCut <span className="text-cyan-400 font-extrabold">Remotion Studio</span>
          </span>
          <div className="h-3.5 w-px bg-slate-800 mx-1" />
          <span className="text-[11px] text-slate-400 max-w-[220px] truncate" title={brief.topic}>
            {brief.topic}
          </span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 ml-1">
            Auto-saved
          </span>
        </div>
      </div>

      {/* Center: Ratio Selector & Canvas Settings */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRatioMenu(!showRatioMenu)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1a1c23] hover:bg-[#252833] border border-[#2c303c] text-xs font-medium text-slate-200 transition-colors"
          >
            <Ratio className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isVertical ? '9:16 (TikTok/Reels)' : '16:9 (Landscape)'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {showRatioMenu && (
            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-48 bg-[#181a20] border border-[#2b2f3d] rounded-xl shadow-2xl py-1 z-50 animate-fade-in text-xs">
              <button
                type="button"
                onClick={() => {
                  onFormatChange('16:9');
                  setShowRatioMenu(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#232733] transition-colors ${
                  !isVertical ? 'text-cyan-400 font-bold bg-[#1d222e]' : 'text-slate-300'
                }`}
              >
                <span>16:9 Landscape (YouTube)</span>
                {!isVertical && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  onFormatChange('9:16');
                  setShowRatioMenu(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#232733] transition-colors ${
                  isVertical ? 'text-cyan-400 font-bold bg-[#1d222e]' : 'text-slate-300'
                }`}
              >
                <span>9:16 Vertikal (TikTok/Reels)</span>
                {isVertical && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center text-[11px] font-mono text-slate-400 bg-[#16181f] px-2.5 py-1 rounded-md border border-[#252936]">
          <span>{isVertical ? '1080x1920' : '1920x1080'}</span>
          <span className="mx-1.5 text-slate-600">•</span>
          <span>{brief.fps} fps</span>
          <span className="mx-1.5 text-slate-600">•</span>
          <span className="text-cyan-400 font-bold">{sceneCount} Scene</span>
        </div>

        {onOpenAddTemplateModal && (
          <button
            type="button"
            onClick={onOpenAddTemplateModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1f2330] hover:bg-[#2b3042] border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
            title="Katalog & Tambah Template Scene"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Tambah Template</span>
          </button>
        )}
      </div>

      {/* Right: Code Inspector Toggle, Docs & Prominent CapCut "Ekspor" Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenDocsModal}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-[#1f222b] transition-colors"
          title="Standar Arsitektur Remotion"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Panduan</span>
        </button>

        <button
          type="button"
          onClick={onToggleCodeInspector}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            showCodeInspector
              ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-300'
              : 'bg-[#1a1c23] hover:bg-[#232733] border-[#2c303c] text-slate-300 hover:text-white'
          }`}
          title="Buka panel kode React Remotion & Zod Schema"
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kode Remotion</span>
        </button>

        {/* Famous CapCut "Ekspor" Button */}
        <button
          type="button"
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs font-extrabold tracking-wide uppercase shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
          <span>Ekspor</span>
        </button>
      </div>
    </header>
  );
};
