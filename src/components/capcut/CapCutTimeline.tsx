import React, { useState, useRef } from 'react';
import {
  Scissors,
  Trash2,
  Undo2,
  Redo2,
  Magnet,
  ZoomIn,
  ZoomOut,
  Video,
  Type,
  Sparkles,
  Music,
  Eye,
  Lock,
  Volume2,
  Plus,
  ArrowLeft,
  ArrowRight,
  Copy,
  Clock,
  Layers,
  Edit3,
} from 'lucide-react';
import type { VideoBrief, SequenceBlock, VideoScene, SceneTransition } from '../../types/remotion';
import { calculateSequenceBlocks, getTotalFrames } from '../../utils/remotionMath';
import { TransitionModal } from './TransitionModal';
import { AddTemplateModal } from './AddTemplateModal';

interface CapCutTimelineProps {
  brief: VideoBrief;
  currentFrame: number;
  onSeek: (frame: number) => void;
  onUpdateScenes: (scenes: VideoScene[]) => void;
  activeSceneId?: string;
  onSelectScene?: (sceneId: string) => void;
  timelineHeight: number;
  onResizeTimelineHeight?: (deltaY: number) => void;
  onOpenEditSceneModal?: (sceneId: string) => void;
}

export const CapCutTimeline: React.FC<CapCutTimelineProps> = ({
  brief,
  currentFrame,
  onSeek,
  onUpdateScenes,
  activeSceneId,
  onSelectScene,
  onOpenEditSceneModal,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMagnetActive, setIsMagnetActive] = useState(true);
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [editingTransitionIndex, setEditingTransitionIndex] = useState<number | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);

  const totalFrames = getTotalFrames(brief.scenes, brief.durationSeconds, brief.fps);
  const sequences: SequenceBlock[] = calculateSequenceBlocks(totalFrames, brief.scenes);

  // Active sequence by frame position
  const currentSequence = sequences.find(
    (seq) =>
      currentFrame >= seq.startFrame &&
      currentFrame < seq.startFrame + seq.durationInFrames
  ) || sequences[sequences.length - 1];

  const playheadPercent = (currentFrame / Math.max(1, totalFrames - 1)) * 100;

  // Handle click on timeline to scrub
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetFrame = Math.round(clickPercent * (totalFrames - 1));
    onSeek(targetFrame);
  };

  // Reorder scene earlier
  const handleMoveScene = (index: number, direction: 'left' | 'right') => {
    if (!brief.scenes) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= brief.scenes.length) return;

    const newScenes = [...brief.scenes];
    const temp = newScenes[index];
    newScenes[index] = newScenes[targetIndex];
    newScenes[targetIndex] = temp;
    onUpdateScenes(newScenes);
  };

  // Duplicate scene
  const handleDuplicateScene = (index: number) => {
    if (!brief.scenes) return;
    const source = brief.scenes[index];
    const clone: VideoScene = {
      ...source,
      id: `scene-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${source.name} (Salinan)`,
    };
    const newScenes = [...brief.scenes];
    newScenes.splice(index + 1, 0, clone);
    onUpdateScenes(newScenes);
  };

  // Delete scene
  const handleDeleteScene = (index: number) => {
    if (!brief.scenes || brief.scenes.length <= 1) return;
    const newScenes = brief.scenes.filter((_, idx) => idx !== index);
    onUpdateScenes(newScenes);
  };

  // Adjust duration of a scene
  const handleChangeSceneDuration = (index: number, deltaFrames: number) => {
    if (!brief.scenes) return;
    const newScenes = [...brief.scenes];
    const currentDur = newScenes[index].durationInFrames;
    newScenes[index] = {
      ...newScenes[index],
      durationInFrames: Math.max(30, Math.min(300, currentDur + deltaFrames)),
    };
    onUpdateScenes(newScenes);
  };

  // Apply transition
  const handleApplyTransition = (transition: SceneTransition, applyToAll?: boolean) => {
    if (!brief.scenes) return;

    if (applyToAll) {
      const newScenes = brief.scenes.map((s) => ({
        ...s,
        transitionNext: transition,
      }));
      onUpdateScenes(newScenes);
    } else if (editingTransitionIndex !== null && editingTransitionIndex < brief.scenes.length) {
      const newScenes = [...brief.scenes];
      newScenes[editingTransitionIndex] = {
        ...newScenes[editingTransitionIndex],
        transitionNext: transition,
      };
      onUpdateScenes(newScenes);
    }
  };

  // Add new scene from template
  const handleAddNewScene = (scene: VideoScene) => {
    const currentScenes = brief.scenes || [];
    onUpdateScenes([...currentScenes, scene]);
  };

  // Time ruler marks every 2-5 seconds
  const totalSeconds = totalFrames / brief.fps;
  const rulerTicks = [];
  const stepSeconds = totalSeconds > 15 ? 4 : 2;
  for (let s = 0; s <= totalSeconds; s += stepSeconds) {
    const frameAtS = s * brief.fps;
    const pct = (frameAtS / totalFrames) * 100;
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const label = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    rulerTicks.push({ s, pct, label });
  }

  // Generate simulated audio wave bars for A1 track
  const audioBars = Array.from({ length: 64 }).map((_, i) => {
    const beat = i % 8 === 0 ? 0.95 : 0.25 + (Math.sin(i * 1.4) * 0.35 + 0.3);
    return Math.max(0.15, Math.min(1, beat));
  });

  return (
    <div className="h-full bg-[#121318] border-t border-[#23252d] flex flex-col select-none shrink-0 overflow-hidden">
      {/* CapCut Timeline Top Toolbar */}
      <div className="h-9 bg-[#17181f] border-b border-[#23252d] px-3 sm:px-4 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Add Scene / Template Button */}
          <button
            type="button"
            onClick={() => setIsAddTemplateOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-[11px] shadow-sm shadow-cyan-500/20 active:scale-95 transition-all"
            title="Tambah Scene atau Template Baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Template</span>
          </button>

          <div className="h-3.5 w-px bg-slate-800 mx-0.5" />

          {/* Quick Scene Controls */}
          <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
            Total Scene:{' '}
            <strong className="text-cyan-400">
              {brief.scenes ? brief.scenes.length : sequences.length}
            </strong>
          </span>

          <div className="h-3.5 w-px bg-slate-800 mx-0.5 hidden sm:block" />

          {/* Magnet Snapping */}
          <button
            type="button"
            onClick={() => setIsMagnetActive(!isMagnetActive)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              isMagnetActive
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                : 'text-slate-400 hover:bg-[#252834]'
            }`}
            title="Penyelarasan Magnet Otomatis"
          >
            <Magnet className="w-3 h-3" />
            <span className="hidden md:inline">Magnet</span>
          </button>
        </div>

        {/* Right Timeline Zoom */}
        <div className="flex items-center gap-2 text-slate-400">
          <ZoomOut className="w-3.5 h-3.5" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.5}
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="w-16 sm:w-24 h-1 bg-[#282b36] rounded appearance-none cursor-pointer accent-cyan-400"
            title="Zoom Skala Timeline"
          />
          <ZoomIn className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Timeline Workspace (Left Headers + Right Tracks Canvas) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Track Headers Column (CapCut Track Tags: V1, T1, G1, A1) */}
        <div className="w-24 sm:w-28 bg-[#14151b] border-r border-[#23252d] flex flex-col shrink-0 pt-6 text-[10px] text-slate-400 font-medium">
          {/* Track V1 Header */}
          <div className="h-14 px-2 flex items-center justify-between border-b border-[#1f2129]">
            <div className="flex items-center gap-1.5 text-slate-200">
              <Video className="w-3 h-3 text-cyan-400" />
              <span>V1 Scene</span>
            </div>
            <Eye className="w-3 h-3 text-slate-500 hover:text-white cursor-pointer" />
          </div>

          {/* Track T1 Header (Text) */}
          <div className="h-8 px-2 flex items-center justify-between border-b border-[#1f2129]">
            <div className="flex items-center gap-1.5 text-slate-200">
              <Type className="w-3 h-3 text-amber-400" />
              <span>T1 Teks</span>
            </div>
            <Lock className="w-2.5 h-2.5 text-slate-600" />
          </div>

          {/* Track G1 Header (Graphic / Sticker) */}
          <div className="h-8 px-2 flex items-center justify-between border-b border-[#1f2129]">
            <div className="flex items-center gap-1.5 text-slate-200">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>G1 Badge</span>
            </div>
            <Lock className="w-2.5 h-2.5 text-slate-600" />
          </div>

          {/* Track A1 Header (Audio) */}
          <div className="h-8 px-2 flex items-center justify-between border-b border-[#1f2129]">
            <div className="flex items-center gap-1.5 text-slate-200">
              <Music className="w-3 h-3 text-emerald-400" />
              <span>A1 Audio</span>
            </div>
            <Volume2 className="w-3 h-3 text-slate-500 hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* Right Multi-track Canvas Container */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="flex-1 flex flex-col relative overflow-x-auto overflow-y-hidden cursor-crosshair bg-[#0f1015]"
        >
          {/* Time Ruler Bar */}
          <div className="h-6 bg-[#16171e] border-b border-[#23252d] relative flex items-center shrink-0">
            {rulerTicks.map((tick, i) => (
              <div
                key={i}
                className="absolute flex flex-col items-center pointer-events-none -translate-x-1/2"
                style={{ left: `${tick.pct}%` }}
              >
                <span className="text-[9px] font-mono text-slate-400 font-semibold">
                  {tick.label}
                </span>
                <div className="w-px h-1.5 bg-slate-600 mt-0.5" />
              </div>
            ))}
          </div>

          {/* Red Needle Playhead Line (Spans across all tracks) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-40 pointer-events-none flex flex-col items-center"
            style={{ left: `${playheadPercent}%` }}
          >
            <div className="w-3 h-3 bg-rose-500 rotate-45 -mt-1 shadow-md shadow-rose-500/60" />
            <div className="mt-0.5 bg-rose-600 text-[9px] font-mono font-bold text-white px-1 rounded-sm shadow">
              {currentFrame}f
            </div>
          </div>

          {/* TRACK 1: V1 Video Sequences Lane with Interactive Transition Nodes */}
          <div className="h-14 border-b border-[#1a1c24] p-1 flex items-center gap-0.5 relative bg-[#13141a]">
            {sequences.map((seq, idx) => {
              const widthPct = (seq.durationInFrames / totalFrames) * 100;
              const isActive = (brief.scenes && activeSceneId === seq.id) || currentSequence.id === seq.id;
              const hasTransition = idx < sequences.length - 1;
              const transitionInfo = seq.transitionNext || { type: 'fade', durationInFrames: 15 };

              return (
                <React.Fragment key={seq.id}>
                  {/* Scene Clip Block */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeek(seq.startFrame + Math.min(20, Math.floor(seq.durationInFrames / 2)));
                      if (onSelectScene) onSelectScene(seq.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (onOpenEditSceneModal) onOpenEditSceneModal(seq.id);
                    }}
                    style={{ width: `${widthPct}%` }}
                    className={`h-full rounded-md relative flex flex-col justify-between p-1.5 cursor-pointer transition-all overflow-hidden border ${
                      isActive
                        ? 'border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400 bg-[#1c1f2b]'
                        : 'border-white/10 hover:border-white/40 bg-[#161822] opacity-90 hover:opacity-100'
                    }`}
                  >
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ backgroundColor: seq.color }}
                    />
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: seq.color }}
                    />

                    {/* Top Clip Info */}
                    <div className="relative z-10 flex items-center justify-between text-[10px] font-bold text-white truncate">
                      <span className="truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seq.color }} />
                        {seq.name}
                      </span>
                      <span className="font-mono text-[9px] bg-black/60 px-1 rounded text-slate-300">
                        {seq.durationInFrames}f ({(seq.durationInFrames / 30).toFixed(1)}s)
                      </span>
                    </div>

                    {/* Bottom Clip Action Toolbar on Hover */}
                    <div
                      className="relative z-10 flex items-center justify-between pt-0.5 text-[9px] text-slate-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        {/* Move Left */}
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveScene(idx, 'left')}
                            className="p-0.5 hover:bg-white/20 rounded text-slate-300"
                            title="Geser Scene ke Kiri (Sebelumnya)"
                          >
                            <ArrowLeft className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {/* Move Right */}
                        {idx < sequences.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveScene(idx, 'right')}
                            className="p-0.5 hover:bg-white/20 rounded text-slate-300"
                            title="Geser Scene ke Kanan (Berikutnya)"
                          >
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Edit Content */}
                        {onOpenEditSceneModal && (
                          <button
                            type="button"
                            onClick={() => onOpenEditSceneModal(seq.id)}
                            className="p-0.5 hover:bg-cyan-500 hover:text-black rounded text-cyan-300 transition-colors"
                            title="Edit Teks & Kustomisasi Scene Ini"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {/* Duration -15f */}
                        <button
                          type="button"
                          onClick={() => handleChangeSceneDuration(idx, -15)}
                          className="px-1 py-0.2 hover:bg-white/20 rounded font-mono text-[8px] text-slate-300"
                          title="Perpendek 15 frame (-0.5s)"
                        >
                          -15f
                        </button>
                        {/* Duration +15f */}
                        <button
                          type="button"
                          onClick={() => handleChangeSceneDuration(idx, 15)}
                          className="px-1 py-0.2 hover:bg-white/20 rounded font-mono text-[8px] text-slate-300"
                          title="Perpanjang 15 frame (+0.5s)"
                        >
                          +15f
                        </button>
                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={() => handleDuplicateScene(idx)}
                          className="p-0.5 hover:bg-cyan-500 hover:text-black rounded text-slate-300"
                          title="Duplikasi Scene Ini"
                        >
                          <Copy className="w-2.5 h-2.5" />
                        </button>
                        {/* Delete */}
                        {sequences.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteScene(idx)}
                            className="p-0.5 hover:bg-rose-500 hover:text-white rounded text-slate-400"
                            title="Hapus Scene Ini"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transition Node (CapCut signature white square between clips) */}
                  {hasTransition && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTransitionIndex(idx);
                      }}
                      className="shrink-0 w-4 h-7 -mx-1 z-30 rounded bg-[#202330] hover:bg-cyan-400 border border-white/30 hover:border-white shadow-md flex items-center justify-center text-[8px] text-slate-200 hover:text-slate-950 font-bold transition-all group"
                      title={`Transisi: ${transitionInfo.type} (${transitionInfo.durationInFrames}f). Klik untuk ubah transisi.`}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                    </button>
                  )}
                </React.Fragment>
              );
            })}

            {/* Quick Add Button at end of track */}
            <button
              type="button"
              onClick={() => setIsAddTemplateOpen(true)}
              className="h-full px-3 rounded-md bg-[#191b26] hover:bg-[#252838] border border-dashed border-cyan-500/40 text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px] font-bold shrink-0 transition-colors"
              title="Tambah Scene Baru di Akhir Video"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah</span>
            </button>
          </div>

          {/* TRACK 2: T1 Text Kinetic Layer Lane */}
          <div className="h-8 border-b border-[#1a1c24] p-1 flex gap-1 relative bg-[#121319]">
            {sequences.map((seq, idx) => {
              const widthPct = (seq.durationInFrames / totalFrames) * 100;
              return (
                <div
                  key={idx}
                  style={{ width: `${widthPct}%` }}
                  className="h-full rounded bg-amber-950/40 border border-amber-600/40 px-2 flex items-center justify-between text-[9px] text-amber-300 font-semibold truncate"
                >
                  <span className="truncate">
                    Teks Scene #{idx + 1}: {seq.description}
                  </span>
                </div>
              );
            })}
          </div>

          {/* TRACK 3: G1 Badges & Graphics Lane */}
          <div className="h-8 border-b border-[#1a1c24] p-1 flex gap-1 relative bg-[#121319]">
            {sequences.map((seq, idx) => {
              const widthPct = (seq.durationInFrames / totalFrames) * 100;
              return (
                <div
                  key={idx}
                  style={{ width: `${widthPct}%` }}
                  className="h-full rounded bg-purple-950/40 border border-purple-600/40 px-2 flex items-center text-[9px] text-purple-300 font-semibold truncate"
                >
                  Badge & Grafis: {seq.templateType}
                </div>
              );
            })}
          </div>

          {/* TRACK 4: A1 Audio Track Lane */}
          <div className="h-8 border-b border-[#1a1c24] p-1 flex items-center gap-0.5 relative bg-[#101217] px-2 overflow-hidden">
            <div className="absolute inset-0 bg-emerald-950/20" />
            <div className="text-[9px] text-emerald-400 font-bold uppercase mr-2 shrink-0 z-10 flex items-center gap-1">
              <Music className="w-2.5 h-2.5" />
              <span>BGM (128 BPM Audio Track)</span>
            </div>

            {audioBars.map((heightVal, idx) => (
              <div
                key={idx}
                style={{ height: `${heightVal * 100}%` }}
                className="w-1 bg-emerald-500/60 rounded-full z-10 shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add Template Modal */}
      <AddTemplateModal
        isOpen={isAddTemplateOpen}
        onClose={() => setIsAddTemplateOpen(false)}
        onAddScene={handleAddNewScene}
      />

      {/* Transition Picker Modal */}
      {editingTransitionIndex !== null && brief.scenes && (
        <TransitionModal
          isOpen={true}
          onClose={() => setEditingTransitionIndex(null)}
          sceneName={`Scene ${editingTransitionIndex + 1} (${brief.scenes[editingTransitionIndex]?.name})`}
          currentTransition={brief.scenes[editingTransitionIndex]?.transitionNext}
          onApplyTransition={handleApplyTransition}
        />
      )}
    </div>
  );
};
