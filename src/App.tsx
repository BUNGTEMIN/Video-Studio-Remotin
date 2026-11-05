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
import { FloatingPanelModal } from './components/capcut/FloatingPanelModal';
import { VIDEO_PRESETS } from './data/presets';
import type { VideoBrief, VideoFormat, VideoScene } from './types/remotion';
import { generateRemotionCode } from './utils/codeGenerator';
import { Terminal, Check, X, Code2, Sliders, LayoutGrid } from 'lucide-react';

export default function App() {
  const [brief, setBrief] = useState<VideoBrief>(VIDEO_PRESETS[0]);
  const [currentFrame, setCurrentFrame] = useState<number>(20);
  const [activeSceneId, setActiveSceneId] = useState<string>(VIDEO_PRESETS[0].scenes[0]?.id || 'scene-1');
  
  // Panel visibility & floating modal states
  const [showInspector, setShowInspector] = useState<boolean>(true);
  const [isInspectorFloating, setIsInspectorFloating] = useState<boolean>(false);
  const [isSidebarFloating, setIsSidebarFloating] = useState<boolean>(false);
  
  // Modals
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState<boolean>(false);
  const [showEditSceneModal, setShowEditSceneModal] = useState<boolean>(false);

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

  const handleUpdateBrief = (newBrief: VideoBrief) => {
    setBrief(newBrief);
  };

  const handleFormatChange = (format: VideoFormat) => {
    setBrief((prev) => ({
      ...prev,
      format,
    }));
  };

  const handleUpdateScenes = (scenes: VideoScene[]) => {
    setBrief((prev) => ({
      ...prev,
      scenes,
    }));
  };

  const handleUpdateSingleScene = (updatedScene: VideoScene) => {
    setBrief((prev) => ({
      ...prev,
      scenes: prev.scenes.map((s) => (s.id === updatedScene.id ? updatedScene : s)),
    }));
  };

  const handleAddScene = (newScene: VideoScene) => {
    setBrief((prev) => ({
      ...prev,
      scenes: [...(prev.scenes || []), newScene],
    }));
    setActiveSceneId(newScene.id);
  };

  const handleOpenEditSceneModal = (sceneId?: string) => {
    if (sceneId) setActiveSceneId(sceneId);
    setShowEditSceneModal(true);
  };

  const activeSceneObject = brief.scenes?.find((s) => s.id === activeSceneId) || brief.scenes?.[0];
  const activeSceneIndex = brief.scenes?.findIndex((s) => s.id === activeSceneId) ?? 0;

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
      />

      {/* 2. CapCut Middle Workstation (Left Sidebar + Center Monitor + Right Inspector) */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0 relative">
        {/* Left: CapCut Asset & Editing Tool Sidebar (Docked) */}
        {!isSidebarFloating && (
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
          <CapCutPlayer
            brief={brief}
            currentFrame={currentFrame}
            setCurrentFrame={setCurrentFrame}
            onFormatChange={handleFormatChange}
            onOpenEditSceneModal={() => handleOpenEditSceneModal(activeSceneId)}
          />
        </div>

        {/* Right: CapCut Inspector & Remotion Code Tabs (Docked) */}
        {showInspector && !isInspectorFloating && (
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
            />
          </div>
        )}
      </div>

      {/* Draggable Horizontal Splitter Handle for Timeline */}
      <div
        onMouseDown={startResizeTimeline}
        className="h-1.5 bg-[#171821] hover:bg-cyan-500/60 cursor-row-resize z-30 flex items-center justify-center transition-colors shrink-0 group"
        title="Geser untuk mengubah tinggi timeline"
      >
        <div className="h-0.5 w-12 bg-slate-700 group-hover:bg-cyan-400 rounded-full" />
      </div>

      {/* 3. CapCut Multi-Track Timeline (Bottom, Resizable) */}
      <div style={{ height: `${timelineHeight}px` }} className="shrink-0 overflow-hidden">
        <CapCutTimeline
          brief={brief}
          currentFrame={currentFrame}
          onSeek={setCurrentFrame}
          onUpdateScenes={handleUpdateScenes}
          activeSceneId={activeSceneId}
          onSelectScene={setActiveSceneId}
          timelineHeight={timelineHeight}
          onOpenEditSceneModal={handleOpenEditSceneModal}
        />
      </div>

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
      />

      {/* 7. Tambah Template & Scene Modal */}
      <AddTemplateModal
        isOpen={showAddTemplateModal}
        onClose={() => setShowAddTemplateModal(false)}
        onAddScene={handleAddScene}
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
