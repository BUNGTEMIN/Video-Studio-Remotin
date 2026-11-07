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
  Split,
  Palette,
  Cloud,
  MoreVertical,
  Sliders,
  Layers,
} from 'lucide-react';
import type { VideoBrief, VideoFormat } from '../../types/remotion';
import { Tooltip } from '../common/Tooltip';

interface CapCutHeaderProps {
  brief: VideoBrief;
  onFormatChange: (format: VideoFormat) => void;
  onOpenExportModal: () => void;
  onToggleCodeInspector: () => void;
  showCodeInspector: boolean;
  onOpenDocsModal: () => void;
  onOpenAddTemplateModal?: () => void;
  onOpenTransitionsGallery?: () => void;
  currentWorkspace?: 'timeline' | 'template-editor';
  onChangeWorkspace?: (workspace: 'timeline' | 'template-editor') => void;
}

export const CapCutHeader: React.FC<CapCutHeaderProps> = ({
  brief,
  onFormatChange,
  onOpenExportModal,
  onToggleCodeInspector,
  showCodeInspector,
  onOpenDocsModal,
  onOpenAddTemplateModal,
  onOpenTransitionsGallery,
  currentWorkspace = 'timeline',
  onChangeWorkspace,
}) => {
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isVertical = brief.format === '9:16';
  const sceneCount = brief.scenes?.length || 4;

  return (
    <header className="h-12 bg-[#111217] border-b border-[#23252d] px-2.5 sm:px-3.5 flex items-center justify-between select-none z-40 shrink-0">
      {/* Left: CapCut Brand & Project Topic */}
      <div className="flex items-center gap-2">
        <Tooltip content="CapCut Remotion Pro Studio" position="bottom">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-teal-400 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-black cursor-pointer">
            <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[2.5]" />
          </div>
        </Tooltip>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold text-white tracking-wide">
            CapCut <span className="text-cyan-400 font-extrabold">Studio</span>
          </span>
          <div className="hidden sm:block h-3 w-px bg-slate-800" />
          <Tooltip content={`Topik Video: ${brief.topic}`} position="bottom">
            <span className="hidden sm:inline-block text-[11px] text-slate-400 max-w-[130px] md:max-w-[170px] truncate cursor-default">
              {brief.topic}
            </span>
          </Tooltip>
          <Tooltip content="Penyimpanan otomatis aktif" position="bottom">
            <span className="hidden xs:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 cursor-default" />
          </Tooltip>
        </div>
      </div>

      {/* Center: Workspace Switcher & Canvas Controls (Hidden on very narrow mobile, compact elsewhere) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {onChangeWorkspace && (
          <div className="hidden sm:flex items-center rounded-lg bg-[#181a24] border border-[#2b2f3d] p-0.5 shadow-inner">
            <Tooltip content="Workspace: Studio Timeline" position="bottom">
              <button
                type="button"
                onClick={() => onChangeWorkspace('timeline')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  currentWorkspace === 'timeline'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#202330]'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Workspace: Template Editor (V1 Engine)" position="bottom">
              <button
                type="button"
                onClick={() => onChangeWorkspace('template-editor')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  currentWorkspace === 'template-editor'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#202330]'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-purple-400" />
              </button>
            </Tooltip>
          </div>
        )}

        <div className="hidden sm:block h-3.5 w-px bg-slate-800 mx-0.5" />

        {/* Ratio Selector */}
        <div className="relative">
          <Tooltip content={`Format: ${isVertical ? '9:16 Vertikal (TikTok/Reels)' : '16:9 Landscape (YouTube)'}`} position="bottom">
            <button
              type="button"
              onClick={() => setShowRatioMenu(!showRatioMenu)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-[#181a22] hover:bg-[#232733] border border-[#2a2e3c] text-[11px] sm:text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <Ratio className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
              <span>{isVertical ? '9:16' : '16:9'}</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </button>
          </Tooltip>

          {showRatioMenu && (
            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-44 bg-[#181a20] border border-[#2b2f3d] rounded-xl shadow-2xl py-1 z-50 animate-fade-in text-xs">
              <button
                type="button"
                onClick={() => {
                  onFormatChange('16:9');
                  setShowRatioMenu(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#232733] transition-colors cursor-pointer ${
                  !isVertical ? 'text-cyan-400 font-bold bg-[#1d222e]' : 'text-slate-300'
                }`}
              >
                <span>16:9 Landscape (YT)</span>
                {!isVertical && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  onFormatChange('9:16');
                  setShowRatioMenu(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#232733] transition-colors cursor-pointer ${
                  isVertical ? 'text-cyan-400 font-bold bg-[#1d222e]' : 'text-slate-300'
                }`}
              >
                <span>9:16 Vertikal (TikTok)</span>
                {isVertical && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Video specs pill (desktop only) */}
        <Tooltip content={`${isVertical ? '1080x1920 Vertikal' : '1920x1080 Landscape'} • ${brief.fps} FPS • ${sceneCount} Scene`} position="bottom">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-[#151720] px-2 py-1 rounded-md border border-[#232736] cursor-default">
            <span>{brief.fps}fps</span>
            <span>•</span>
            <span className="text-cyan-400 font-bold">{sceneCount}s</span>
          </div>
        </Tooltip>

        {/* Shared Cloud Run Engine Indicator Pill (large desktop only) */}
        <Tooltip content="Pusat Render Terhubung: Google Cloud Run Jakarta (asia-southeast2)" position="bottom">
          <div className="hidden xl:flex items-center gap-1.5 text-[10px] font-mono text-slate-300 bg-[#161824] px-2 py-1 rounded-md border border-cyan-800/40 cursor-default">
            <Cloud className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">Render:</span>
            <span className="text-cyan-300 font-bold">Cloud Run JKT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse" />
          </div>
        </Tooltip>

        {onOpenAddTemplateModal && (
          <Tooltip content="Katalog & Tambah Template Scene" position="bottom">
            <button
              type="button"
              onClick={onOpenAddTemplateModal}
              className="hidden sm:flex p-1.5 rounded-md bg-[#181a24] hover:bg-[#232735] border border-cyan-500/30 text-cyan-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </Tooltip>
        )}

        {onOpenTransitionsGallery && (
          <Tooltip content="Galeri Transisi Video (Fade, Slide, Zoom, Wipe)" position="bottom">
            <button
              type="button"
              onClick={onOpenTransitionsGallery}
              className="hidden sm:flex p-1.5 rounded-md bg-[#181a24] hover:bg-[#232735] border border-cyan-500/30 text-cyan-300 transition-colors cursor-pointer"
            >
              <Split className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Right: Code Inspector Toggle, Docs & CapCut "Ekspor" Button */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <Tooltip content="Panduan Standar Multi-Scene Remotion" position="bottom">
          <button
            type="button"
            onClick={onOpenDocsModal}
            className="hidden sm:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1a1c25] transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Lihat Kode React Remotion & Zod Schema" position="bottom">
          <button
            type="button"
            onClick={onToggleCodeInspector}
            className={`hidden sm:flex p-1.5 rounded-lg border transition-all cursor-pointer ${
              showCodeInspector
                ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-300'
                : 'bg-[#181a24] hover:bg-[#232733] border-[#2c303c] text-slate-300 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
          </button>
        </Tooltip>

        {/* Famous CapCut "Ekspor" Button */}
        <Tooltip content="Simulasi Render & Unduh Video MP4" position="bottom">
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-[11px] sm:text-xs font-extrabold tracking-wide uppercase shadow-md shadow-cyan-500/25 transition-all transform active:scale-95 cursor-pointer min-h-[36px]"
          >
            <Download className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            <span>Ekspor</span>
          </button>
        </Tooltip>

        {/* Mobile Dropdown Menu Button */}
        <div className="relative sm:hidden">
          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-1.5 rounded-lg bg-[#181a24] border border-[#2b2f3d] text-slate-300 hover:text-white min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            aria-label="Menu Opsi"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMobileMenu && (
            <div className="absolute top-full right-0 mt-1.5 w-52 bg-[#181a22] border border-[#2b2f3d] rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in text-xs">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#252836]">
                Opsi & Fitur Studio
              </div>

              {onChangeWorkspace && (
                <button
                  type="button"
                  onClick={() => {
                    onChangeWorkspace(currentWorkspace === 'timeline' ? 'template-editor' : 'timeline');
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#232736] text-slate-200"
                >
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  <span>
                    {currentWorkspace === 'timeline' ? 'Buka Template Editor' : 'Kembali ke Timeline'}
                  </span>
                </button>
              )}

              {onOpenAddTemplateModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAddTemplateModal();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#232736] text-slate-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+ Tambah Template Scene</span>
                </button>
              )}

              {onOpenTransitionsGallery && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenTransitionsGallery();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#232736] text-slate-200"
                >
                  <Split className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Galeri Transisi Scene</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onToggleCodeInspector();
                  setShowMobileMenu(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#232736] text-slate-200"
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lihat Kode Remotion TSX</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenDocsModal();
                  setShowMobileMenu(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#232736] text-slate-200"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Dokumentasi Standar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

