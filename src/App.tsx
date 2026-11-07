/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CapCutHeader } from './components/capcut/CapCutHeader';
import { CapCutSidebar } from './components/capcut/CapCutSidebar';
import { CapCutPlayer } from './components/capcut/CapCutPlayer';
import { CapCutTimeline } from './components/capcut/CapCutTimeline';
import { CapCutInspector } from './components/capcut/CapCutInspector';
import { CapCutExportModal } from './components/capcut/CapCutExportModal';
import { AddTemplateModal } from './components/capcut/AddTemplateModal';
import { EditSceneModal } from './components/capcut/EditSceneModal';
import { TransitionsGallery } from './components/capcut/TransitionsGallery';
import { FloatingPanelModal } from './components/capcut/FloatingPanelModal';
import { TemplateEditorPage } from './components/templateEditor/TemplateEditorPage';
import { VIDEO_PRESETS } from './data/presets';
import type { VideoBrief, VideoFormat, VideoScene, SceneTransition } from './types/remotion';
import { generateRemotionCode } from './utils/codeGenerator';
import { getTotalFrames } from './utils/remotionMath';
import { useIsMobile } from './hooks/useIsMobile';
import { Terminal, Check, X, Code2, Sliders, LayoutGrid, Video, Palette, Film, Download, ArrowLeft } from 'lucide-react';

export default function App() {
  const isMobile = useIsMobile(768);
  const [mobileTab, setMobileTab] = useState<'timeline' | 'inspector' | 'sidebar' | 'code'>('timeline');

  const [brief, setBrief] = useState<VideoBrief>(VIDEO_PRESETS[0]);
  const [currentFrame, setCurrentFrame] = useState<number>(20);
  const [activeSceneId, setActiveSceneId] = useState<string>(VIDEO_PRESETS[0].scenes[0]?.id || 'scene-1');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<VideoBrief[]>([VIDEO_PRESETS[0]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  
  // Workspace Switcher: 'timeline' (CapCut multi-track workstation) vs 'template-editor' (V1 Template Engine)
  const [activeWorkspace, setActiveWorkspace] = useState<'timeline' | 'template-editor'>('timeline');
  
  // Panel visibility & floating modal states
  const [showInspector, setShowInspector] = useState<boolean>(true);
  const [isInspectorFloating, setIsInspectorFloating] = useState<boolean>(false);
  const [isSidebarFloating, setIsSidebarFloating] = useState<boolean>(false);
  const [isPlayerFloating, setIsPlayerFloating] = useState<boolean>(false);
  const [isFullHeightView, setIsFullHeightView] = useState<boolean>(false);
  
  // Modals
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState<boolean>(false);
  const [showEditSceneModal, setShowEditSceneModal] = useState<boolean>(false);
  const [showTransitionsGalleryModal, setShowTransitionsGalleryModal] = useState<boolean>(false);

  // Resizable panel dimensions
  const [sidebarWidth, setSidebarWidth] = useState<number>(340);
  const [inspectorWidth, setInspectorWidth] = useState<number>(340);
  const [timelineHeight, setTimelineHeight] = useState<number>(260);

  // Resizing drag refs
  const isResizingSidebar = useRef<boolean>(false);
  const isResizingInspector = useRef<boolean>(false);
  const isResizingTimeline = useRef<boolean>(false);
  const resizeStartX = useRef<number>(0);
  const resizeStartY = useRef<number>(0);
  const initialDimension = useRef<number>(0);

  // Generate code bundle reactively based on current brief and scenes
  const codeBundle = useMemo(() => {
    return generateRemotionCode(brief);
  }, [brief]);

  // Handle panel resize drag mouse movements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar.current) {
        const delta = e.clientX - resizeStartX.current;
        const newW = Math.max(260, Math.min(500, initialDimension.current + delta));
        setSidebarWidth(newW);
      } else if (isResizingInspector.current) {
        const delta = resizeStartX.current - e.clientX;
        const newW = Math.max(260, Math.min(520, initialDimension.current + delta));
        setInspectorWidth(newW);
      } else if (isResizingTimeline.current) {
        const delta = resizeStartY.current - e.clientY;
        const newH = Math.max(180, Math.min(420, initialDimension.current + delta));
        setTimelineHeight(newH);
      }
    };

    const handleMouseUp = () => {
      isResizingSidebar.current = false;
      isResizingInspector.current = false;
      isResizingTimeline.current = false;
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResizeSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingSidebar.current = true;
    resizeStartX.current = e.clientX;
    initialDimension.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
  };

  const startResizeInspector = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingInspector.current = true;
    resizeStartX.current = e.clientX;
    initialDimension.current = inspectorWidth;
    document.body.style.cursor = 'col-resize';
  };

  const startResizeTimeline = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingTimeline.current = true;
    resizeStartY.current = e.clientY;
    initialDimension.current = timelineHeight;
    document.body.style.cursor = 'row-resize';
  };

  const totalFrames = useMemo(() => {
    return getTotalFrames(brief.scenes, brief.durationSeconds, brief.fps);
  }, [brief]);

  const pushHistory = (newBrief: VideoBrief) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, newBrief].slice(-40);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 39));
  };

  const handleUpdateBrief = (newBrief: VideoBrief) => {
    pushHistory(newBrief);
    setBrief(newBrief);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setBrief(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setBrief(history[nextIdx]);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Global Keyboard Shortcuts (Spacebar, Arrows, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // 1. Spacebar: Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
        return;
      }

      // 2. Left Arrow: Frame backward (1 frame or 10 frames with Shift)
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setCurrentFrame((prev) => Math.max(0, prev - step));
        return;
      }

      // 3. Right Arrow: Frame forward (1 frame or 10 frames with Shift)
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setCurrentFrame((prev) => Math.min(totalFrames - 1, prev + step));
        return;
      }

      // 4. Ctrl+Z / Cmd+Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // 5. Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z: Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyZ')
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalFrames, historyIndex, history]);

  const handleFormatChange = (format: VideoFormat) => {
    const updated = {
      ...brief,
      format,
    };
    pushHistory(updated);
    setBrief(updated);
  };

  const handleUpdateScenes = (scenes: VideoScene[]) => {
    const updated = {
      ...brief,
      scenes,
    };
    pushHistory(updated);
    setBrief(updated);
  };

  const handleUpdateSingleScene = (updatedScene: VideoScene) => {
    const updated = {
      ...brief,
      scenes: brief.scenes.map((s) => (s.id === updatedScene.id ? updatedScene : s)),
    };
    pushHistory(updated);
    setBrief(updated);
  };

  const handleAddScene = (newScene: VideoScene) => {
    const updated = {
      ...brief,
      scenes: [...(brief.scenes || []), newScene],
    };
    pushHistory(updated);
    setBrief(updated);
    setActiveSceneId(newScene.id);
  };

  const handleOpenEditSceneModal = (sceneId?: string) => {
    if (sceneId) setActiveSceneId(sceneId);
    setShowEditSceneModal(true);
  };

  const handleOpenTransitionsGallery = (sceneIdOrIndex?: string | number) => {
    if (typeof sceneIdOrIndex === 'string') {
      setActiveSceneId(sceneIdOrIndex);
    } else if (typeof sceneIdOrIndex === 'number' && brief.scenes?.[sceneIdOrIndex]) {
      setActiveSceneId(brief.scenes[sceneIdOrIndex].id);
    }
    setShowTransitionsGalleryModal(true);
  };

  const handleApplyTransition = (
    transition: SceneTransition,
    sceneId?: string,
    applyToAll?: boolean
  ) => {
    if (!brief.scenes) return;
    if (applyToAll) {
      const updatedScenes = brief.scenes.map((s) => ({
        ...s,
        transitionNext: transition,
      }));
      setBrief((prev) => ({ ...prev, scenes: updatedScenes }));
    } else {
      const targetId = sceneId || activeSceneId;
      const updatedScenes = brief.scenes.map((s) =>
        s.id === targetId ? { ...s, transitionNext: transition } : s
      );
      setBrief((prev) => ({ ...prev, scenes: updatedScenes }));
    }
  };

  const activeSceneObject = brief.scenes?.find((s) => s.id === activeSceneId) || brief.scenes?.[0];
  const activeSceneIndex = brief.scenes?.findIndex((s) => s.id === activeSceneId) ?? 0;

  if (activeWorkspace === 'template-editor') {
    return (
      <TemplateEditorPage
        brief={brief}
        onUpdateBrief={handleUpdateBrief}
        onBackToTimeline={() => setActiveWorkspace('timeline')}
        activeSceneId={activeSceneId}
        onSelectSceneId={setActiveSceneId}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0e0f13] text-slate-100 flex flex-col overflow-hidden select-none font-sans antialiased">
      {/* 1. CapCut Pro Top Navigation Header */}
      <CapCutHeader
        brief={brief}
        onFormatChange={handleFormatChange}
        onOpenExportModal={() => setShowExportModal(true)}
        onToggleCodeInspector={() => {
          if (isInspectorFloating) {
            setIsInspectorFloating(false);
            setShowInspector(true);
          } else {
            setShowInspector(!showInspector);
          }
        }}
        showCodeInspector={showInspector || isInspectorFloating}
        onOpenDocsModal={() => setShowDocsModal(true)}
        onOpenAddTemplateModal={() => setShowAddTemplateModal(true)}
        onOpenTransitionsGallery={() => handleOpenTransitionsGallery()}
        currentWorkspace={activeWorkspace}
        onChangeWorkspace={setActiveWorkspace}
      />

      {/* 2. CapCut Workstation (Mobile Layout vs Desktop 3-Column Workstation) */}
      {isMobile ? (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative bg-[#0e0f13]">
          {/* Tab 1: Timeline Mode (Top Player Monitor + Bottom Multi-Track Timeline) */}
          {mobileTab === 'timeline' && (
            <>
              {/* Top: Mobile Video Monitor */}
              <div className="h-[38vh] min-h-[200px] max-h-[44vh] shrink-0 border-b border-[#23252d] overflow-hidden relative">
                <CapCutPlayer
                  brief={brief}
                  currentFrame={currentFrame}
                  setCurrentFrame={setCurrentFrame}
                  onFormatChange={handleFormatChange}
                  onOpenEditSceneModal={() => handleOpenEditSceneModal(activeSceneId)}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying((prev) => !prev)}
                />
              </div>

              {/* Bottom: Mobile Multi-Track Timeline */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <CapCutTimeline
                  brief={brief}
                  currentFrame={currentFrame}
                  onSeek={setCurrentFrame}
                  onUpdateScenes={handleUpdateScenes}
                  onUpdateBrief={handleUpdateBrief}
                  activeSceneId={activeSceneId}
                  onSelectScene={setActiveSceneId}
                  timelineHeight={260}
                  onOpenEditSceneModal={handleOpenEditSceneModal}
                  onOpenTransitionsGallery={(idx) => handleOpenTransitionsGallery(idx)}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                />
              </div>
            </>
          )}

          {/* Tab 2: Mobile Scene Inspector */}
          {mobileTab === 'inspector' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#111217]">
              <div className="h-10 bg-[#161720] border-b border-[#23252d] px-3 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileTab('timeline')}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold hover:text-cyan-300 min-h-[36px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Timeline</span>
                </button>
                <span className="text-[11px] font-mono text-slate-400 truncate max-w-[170px]">
                  {brief.scenes.find((s) => s.id === activeSceneId)?.name || 'Scene Aktif'}
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <CapCutInspector
                  brief={brief}
                  currentFrame={currentFrame}
                  bundle={codeBundle}
                  isOpen={true}
                  onClose={() => setMobileTab('timeline')}
                  activeSceneId={activeSceneId}
                  onUpdateScene={handleUpdateSingleScene}
                  isFloating={false}
                  onOpenTransitionsGallery={() => handleOpenTransitionsGallery()}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Mobile Sidebar Assets & Presets */}
          {mobileTab === 'sidebar' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#111217]">
              <div className="h-10 bg-[#161720] border-b border-[#23252d] px-3 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileTab('timeline')}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold hover:text-cyan-300 min-h-[36px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Timeline</span>
                </button>
                <span className="text-[11px] font-mono text-slate-400">
                  Aset & Preset Video
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <CapCutSidebar
                  brief={brief}
                  onUpdateBrief={handleUpdateBrief}
                  onOpenAddTemplateModal={() => setShowAddTemplateModal(true)}
                  isFloating={false}
                  activeSceneId={activeSceneId}
                  onSelectSceneId={setActiveSceneId}
                  onUpdateScene={handleUpdateSingleScene}
                  onOpenTransitionsGallery={() => handleOpenTransitionsGallery()}
                  onOpenTemplateEditor={() => setActiveWorkspace('template-editor')}
                />
              </div>
            </div>
          )}

          {/* Tab 4: Mobile Remotion TSX Code Viewer */}
          {mobileTab === 'code' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#111217]">
              <div className="h-10 bg-[#161720] border-b border-[#23252d] px-3 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileTab('timeline')}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold hover:text-cyan-300 min-h-[36px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Timeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(codeBundle.compositionCode);
                    alert('Kode Remotion TSX berhasil disalin!');
                  }}
                  className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 text-xs font-bold hover:bg-cyan-900 transition-colors"
                >
                  Salin Kode
                </button>
              </div>
              <div className="flex-1 p-3 overflow-auto bg-[#0a0b10] font-mono text-xs text-slate-300">
                <pre className="whitespace-pre-wrap">{codeBundle.compositionCode}</pre>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Workstation: 3-Column Docked Layout with Resizable Dividers */
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
          <div className="flex-1 flex flex-row overflow-hidden min-h-0 relative">
            {/* Left: CapCut Asset & Editing Tool Sidebar (Docked) */}
            {!isSidebarFloating && !isFullHeightView && (
              <div style={{ width: `${sidebarWidth}px` }} className="h-full flex shrink-0 relative">
                <CapCutSidebar
                  brief={brief}
                  onUpdateBrief={handleUpdateBrief}
                  onOpenAddTemplateModal={() => setShowAddTemplateModal(true)}
                  onPopOut={() => setIsSidebarFloating(true)}
                  isFloating={false}
                  activeSceneId={activeSceneId}
                  onSelectSceneId={setActiveSceneId}
                  onUpdateScene={handleUpdateSingleScene}
                  onOpenTransitionsGallery={() => handleOpenTransitionsGallery()}
                  onOpenTemplateEditor={() => setActiveWorkspace('template-editor')}
                />

                {/* Draggable Vertical Splitter Handle for Left Sidebar */}
                <div
                  onMouseDown={startResizeSidebar}
                  className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-cyan-500/60 z-30 transition-colors flex items-center justify-center group"
                  title="Geser untuk mengubah lebar sidebar"
                >
                  <div className="w-0.5 h-8 bg-slate-700 group-hover:bg-cyan-400 rounded-full" />
                </div>
              </div>
            )}

            {/* Center: CapCut Video Monitor Viewport */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
              {!isPlayerFloating ? (
                <CapCutPlayer
                  brief={brief}
                  currentFrame={currentFrame}
                  setCurrentFrame={setCurrentFrame}
                  onFormatChange={handleFormatChange}
                  onOpenEditSceneModal={() => handleOpenEditSceneModal(activeSceneId)}
                  onPopOut={() => setIsPlayerFloating(true)}
                  isFloating={false}
                  onToggleFullHeight={() => setIsFullHeightView(!isFullHeightView)}
                  isFullHeight={isFullHeightView}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying((prev) => !prev)}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0e0f13] text-center space-y-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-[#181a24] border border-[#2b2f3d] flex items-center justify-center text-cyan-400 shadow-2xl">
                    <Video className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Player Monitor Sedang Melayang</h4>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                      Video monitor sedang terbuka dalam jendela floating terpisah yang dapat digeser dan diubah ukurannya bebas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPlayerFloating(false)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Kembalikan Player ke Dock
                  </button>
                </div>
              )}
            </div>

            {/* Right: CapCut Inspector & Remotion Code Tabs (Docked) */}
            {showInspector && !isInspectorFloating && !isFullHeightView && (
              <div style={{ width: `${inspectorWidth}px` }} className="h-full flex shrink-0 relative">
                {/* Draggable Vertical Splitter Handle for Inspector */}
                <div
                  onMouseDown={startResizeInspector}
                  className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-cyan-500/60 z-30 transition-colors flex items-center justify-center group"
                  title="Geser untuk mengubah lebar inspector"
                >
                  <div className="w-0.5 h-8 bg-slate-700 group-hover:bg-cyan-400 rounded-full" />
                </div>

                <CapCutInspector
                  brief={brief}
                  currentFrame={currentFrame}
                  bundle={codeBundle}
                  isOpen={showInspector}
                  onClose={() => setShowInspector(false)}
                  activeSceneId={activeSceneId}
                  onUpdateScene={handleUpdateSingleScene}
                  onPopOut={() => setIsInspectorFloating(true)}
                  isFloating={false}
                  onOpenTransitionsGallery={() => handleOpenTransitionsGallery()}
                />
              </div>
            )}
          </div>

          {/* Draggable Horizontal Splitter Handle for Timeline (Hidden in full-height view) */}
          {!isFullHeightView && (
            <div
              onMouseDown={startResizeTimeline}
              className="h-1.5 bg-[#171821] hover:bg-cyan-500/60 cursor-row-resize z-30 flex items-center justify-center transition-colors shrink-0 group"
              title="Geser untuk mengubah tinggi timeline"
            >
              <div className="h-0.5 w-12 bg-slate-700 group-hover:bg-cyan-400 rounded-full" />
            </div>
          )}

          {/* 3. CapCut Multi-Track Timeline (Bottom, Resizable, Hidden in full-height view) */}
          {!isFullHeightView && (
            <div style={{ height: `${timelineHeight}px` }} className="shrink-0 overflow-hidden">
              <CapCutTimeline
                brief={brief}
                currentFrame={currentFrame}
                onSeek={setCurrentFrame}
                onUpdateScenes={handleUpdateScenes}
                onUpdateBrief={handleUpdateBrief}
                activeSceneId={activeSceneId}
                onSelectScene={setActiveSceneId}
                timelineHeight={timelineHeight}
                onOpenEditSceneModal={handleOpenEditSceneModal}
                onOpenTransitionsGallery={(idx) => handleOpenTransitionsGallery(idx)}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
              />
            </div>
          )}
        </div>
      )}

      {/* 3. Mobile Bottom Navigation Bar (CapCut Mobile Style) */}
      {isMobile && (
        <nav className="h-14 bg-[#11131a] border-t border-[#232738] flex items-center justify-around px-1 shrink-0 z-30 select-none shadow-2xl">
          <button
            type="button"
            onClick={() => setMobileTab('timeline')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[44px] transition-colors cursor-pointer ${
              mobileTab === 'timeline' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('inspector')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[44px] transition-colors cursor-pointer ${
              mobileTab === 'inspector' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Edit Scene</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('sidebar')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[44px] transition-colors cursor-pointer ${
              mobileTab === 'sidebar' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Aset & Gaya</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('code')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[44px] transition-colors cursor-pointer ${
              mobileTab === 'code' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Kode TSX</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 min-h-[44px] text-emerald-400 hover:text-emerald-300 transition-colors font-bold cursor-pointer"
          >
            <Download className="w-4 h-4 mb-0.5 stroke-[2.5]" />
            <span className="text-[10px]">Ekspor</span>
          </button>
        </nav>
      )}

      {/* 4. Floating / Modal Window for Remotion Code Inspector (If popped out) */}
      {isInspectorFloating && (
        <FloatingPanelModal
          title="Inspector & Kode Remotion"
          icon={<Code2 className="w-3.5 h-3.5 text-cyan-400" />}
          isOpen={isInspectorFloating}
          onClose={() => setIsInspectorFloating(false)}
          onDockBack={() => {
            setIsInspectorFloating(false);
            setShowInspector(true);
          }}
          initialWidth={580}
          initialHeight={620}
          initialX={window.innerWidth > 900 ? window.innerWidth - 620 : 40}
          initialY={60}
        >
          <CapCutInspector
            brief={brief}
            currentFrame={currentFrame}
            bundle={codeBundle}
            isOpen={true}
            onClose={() => setIsInspectorFloating(false)}
            activeSceneId={activeSceneId}
            onUpdateScene={handleUpdateSingleScene}
            isFloating={true}
            onOpenTransitionsGallery={() => handleOpenTransitionsGallery()}
          />
        </FloatingPanelModal>
      )}

      {/* 5. Floating / Modal Window for Sidebar Aset & Template (If popped out) */}
      {isSidebarFloating && (
        <FloatingPanelModal
          title="Aset & Template Studio"
          icon={<LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />}
          isOpen={isSidebarFloating}
          onClose={() => setIsSidebarFloating(false)}
          onDockBack={() => setIsSidebarFloating(false)}
          initialWidth={480}
          initialHeight={580}
          initialX={60}
          initialY={70}
        >
          <CapCutSidebar
            brief={brief}
            onUpdateBrief={handleUpdateBrief}
            onOpenAddTemplateModal={() => setShowAddTemplateModal(true)}
            isFloating={true}
            onOpenTransitionsGallery={() => handleOpenTransitionsGallery()}
            onOpenTemplateEditor={() => {
              setIsSidebarFloating(false);
              setActiveWorkspace('template-editor');
            }}
          />
        </FloatingPanelModal>
      )}

      {/* 6. Floating / Modal Window for Player Monitor (If popped out) */}
      {isPlayerFloating && (
        <FloatingPanelModal
          title={`Player Monitor (${brief.format === '9:16' ? '9:16 Vertikal' : '16:9 Landscape'})`}
          icon={<Video className="w-3.5 h-3.5 text-cyan-400" />}
          isOpen={isPlayerFloating}
          onClose={() => setIsPlayerFloating(false)}
          onDockBack={() => setIsPlayerFloating(false)}
          initialWidth={brief.format === '9:16' ? 440 : 660}
          initialHeight={brief.format === '9:16' ? 700 : 520}
          initialX={brief.format === '9:16' ? 120 : 80}
          initialY={60}
        >
          <CapCutPlayer
            brief={brief}
            currentFrame={currentFrame}
            setCurrentFrame={setCurrentFrame}
            onFormatChange={handleFormatChange}
            onOpenEditSceneModal={() => handleOpenEditSceneModal(activeSceneId)}
            onPopOut={() => setIsPlayerFloating(false)}
            isFloating={true}
            onToggleFullHeight={() => setIsFullHeightView(!isFullHeightView)}
            isFullHeight={isFullHeightView}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((prev) => !prev)}
          />
        </FloatingPanelModal>
      )}

      {/* 6. Edit Teks & Kustomisasi Scene Modal */}
      <EditSceneModal
        isOpen={showEditSceneModal}
        onClose={() => setShowEditSceneModal(false)}
        scene={activeSceneObject}
        onUpdateScene={handleUpdateSingleScene}
        sceneIndex={activeSceneIndex}
        totalScenes={brief.scenes?.length}
        onOpenTransitionsGallery={() => handleOpenTransitionsGallery(activeSceneId)}
      />

      {/* 7. Tambah Template & Scene Modal */}
      <AddTemplateModal
        isOpen={showAddTemplateModal}
        onClose={() => setShowAddTemplateModal(false)}
        onAddScene={handleAddScene}
      />

      {/* 8. Galeri Transisi Video Modal (Fade, Slide, Zoom, Wipe) */}
      <TransitionsGallery
        isOpen={showTransitionsGalleryModal}
        onClose={() => setShowTransitionsGalleryModal(false)}
        brief={brief}
        activeSceneId={activeSceneId}
        onUpdateBrief={handleUpdateBrief}
        onApplyTransition={handleApplyTransition}
      />

      {/* 8. CapCut Export Modal (Progress Bar & Dummy MP4 Download) */}
      <CapCutExportModal
        brief={brief}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* 8. Remotion Architecture Standards Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#181a22] border border-[#2e3344] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-200">
            <button
              type="button"
              onClick={() => setShowDocsModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Standar Arsitektur Multi-Scene Remotion
                </h3>
                <p className="text-xs text-slate-400">
                  Pedoman pembuatan video programatik multi-adegan berbasis React + TypeScript
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-[#121319] border border-[#262836] space-y-1">
                <h4 className="font-bold text-cyan-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  1. Multi-Scene Sequences Modular
                </h4>
                <p className="text-slate-400">
                  Setiap template adegan dirender dalam blok <code className="text-cyan-400 font-mono">&lt;Sequence from=&#123;...&#125; durationInFrames=&#123;...&#125;&gt;</code> independen dengan akumulasi frame dinamis.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#121319] border border-[#262836] space-y-1">
                <h4 className="font-bold text-cyan-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  2. Transisi Antar Adegan
                </h4>
                <p className="text-slate-400">
                  Transisi (Fade, Slide, Zoom, Wipe, Glitch, Blur) diinterpolasi pada frame akhir tiap adegan menggunakan <code className="text-cyan-400 font-mono">interpolate(frame, ...)</code>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#121319] border border-[#262836] space-y-1">
                <h4 className="font-bold text-cyan-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  3. Tata Letak Fleksibel & Resizable
                </h4>
                <p className="text-slate-400">
                  Panel sidebar, inspector, dan timeline dapat digeser (drag & resize) sesuai kenyamanan atau dibuka sebagai jendela melayang (undocked modal).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#121319] border border-[#262836] space-y-1">
                <h4 className="font-bold text-cyan-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  4. Ekspor Video via Remotion CLI
                </h4>
                <p className="text-slate-400">
                  Render ke format MP4 di terminal lokal:
                  <code className="text-emerald-300 font-mono text-[11px] block mt-1 bg-black/60 p-2 rounded">
                    npx remotion render src/index.ts my-video out/my-video.mp4
                  </code>
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#292c3a] flex justify-end">
              <button
                type="button"
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
