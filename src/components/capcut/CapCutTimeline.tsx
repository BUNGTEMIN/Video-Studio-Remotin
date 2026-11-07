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
  EyeOff,
  Lock,
  Volume2,
  VolumeX,
  Plus,
  ArrowLeft,
  ArrowRight,
  Copy,
  Clock,
  Layers,
  Edit3,
  Split,
  Sliders,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Grid,
  Check,
} from 'lucide-react';
import type {
  VideoBrief,
  SequenceBlock,
  VideoScene,
  SceneTransition,
  AudioTrackConfig,
} from '../../types/remotion';
import { calculateSequenceBlocks, getTotalFrames } from '../../utils/remotionMath';
import { TransitionModal } from './TransitionModal';
import { AddTemplateModal } from './AddTemplateModal';
import { AudioSettingsModal } from './AudioSettingsModal';
import { QuickBadgeModal } from './QuickBadgeModal';
import { QuickTextModal } from './QuickTextModal';
import { audioEngine } from '../../utils/audioSynth';
import { Tooltip } from '../common/Tooltip';

interface CapCutTimelineProps {
  brief: VideoBrief;
  currentFrame: number;
  onSeek: (frame: number) => void;
  onUpdateScenes: (scenes: VideoScene[]) => void;
  onUpdateBrief?: (brief: VideoBrief) => void;
  activeSceneId?: string;
  onSelectScene?: (sceneId: string) => void;
  timelineHeight: number;
  onResizeTimelineHeight?: (deltaY: number) => void;
  onOpenEditSceneModal?: (sceneId: string) => void;
  onOpenTransitionsGallery?: (sceneIndex?: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const CapCutTimeline: React.FC<CapCutTimelineProps> = ({
  brief,
  currentFrame,
  onSeek,
  onUpdateScenes,
  onUpdateBrief,
  activeSceneId,
  onSelectScene,
  onOpenEditSceneModal,
  onOpenTransitionsGallery,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMagnetActive, setIsMagnetActive] = useState(true);
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [editingTransitionIndex, setEditingTransitionIndex] = useState<number | null>(null);

  // Snap to Grid Feature state (5f, 10f, 15f, 30f)
  const [isSnapToGrid, setIsSnapToGrid] = useState<boolean>(true);
  const [snapIncrement, setSnapIncrement] = useState<number>(15);
  const [showSnapMenu, setShowSnapMenu] = useState<boolean>(false);

  // Mode: All Tracks (V1, T1, G1, A1) vs Clean Mode (V1 Scene Only)
  const [isMultiTrackMode, setIsMultiTrackMode] = useState(true);

  // Modals for T1, G1, A1
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [editingBadgeIndex, setEditingBadgeIndex] = useState<number | null>(null);
  const [editingTextIndex, setEditingTextIndex] = useState<number | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);

  const totalFrames = getTotalFrames(brief.scenes, brief.durationSeconds, brief.fps);
  const sequences: SequenceBlock[] = calculateSequenceBlocks(totalFrames, brief.scenes);

  // Snap to Grid helper
  const applySnap = (frame: number): number => {
    if (!isSnapToGrid || snapIncrement <= 0) return frame;
    const snapped = Math.round(frame / snapIncrement) * snapIncrement;
    return Math.max(0, Math.min(totalFrames - 1, snapped));
  };

  // Active sequence by frame position
  const currentSequence =
    sequences.find(
      (seq) =>
        currentFrame >= seq.startFrame &&
        currentFrame < seq.startFrame + seq.durationInFrames
    ) || sequences[sequences.length - 1];

  const playheadPercent = (currentFrame / Math.max(1, totalFrames - 1)) * 100;

  // Audio config with fallback
  const audioConfig: AudioTrackConfig = brief.audioConfig || {
    id: 'track-tech-kinetic',
    name: 'Tech Kinetic Drive',
    bpm: 128,
    genre: 'Electronic / Synth',
    volume: 85,
    isMuted: false,
    sfxTransitions: true,
  };

  const trackVisibility = brief.trackVisibility || {
    video: true,
    text: true,
    graphics: true,
    audio: !audioConfig.isMuted,
  };

  // Handle click on timeline to scrub with snap support
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = Math.max(0, Math.min(1, clickX / rect.width));
    const rawFrame = Math.round(clickPercent * (totalFrames - 1));
    const targetFrame = isSnapToGrid ? applySnap(rawFrame) : rawFrame;
    onSeek(targetFrame);
  };

  // Handle touch on mobile timeline to scrub frames
  const handleTimelineTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !e.touches[0]) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchPercent = Math.max(0, Math.min(1, touchX / rect.width));
    const rawFrame = Math.round(touchPercent * (totalFrames - 1));
    const targetFrame = isSnapToGrid ? applySnap(rawFrame) : rawFrame;
    onSeek(targetFrame);
  };

  // Move scene
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

  // Update a single scene (e.g. from quick modals)
  const handleUpdateSingleScene = (updatedScene: VideoScene) => {
    if (!brief.scenes) return;
    const newScenes = brief.scenes.map((s) => (s.id === updatedScene.id ? updatedScene : s));
    onUpdateScenes(newScenes);
  };

  // Update audio configuration
  const handleUpdateAudioConfig = (newConfig: AudioTrackConfig) => {
    if (onUpdateBrief) {
      onUpdateBrief({
        ...brief,
        audioConfig: newConfig,
        trackVisibility: {
          ...trackVisibility,
          audio: !newConfig.isMuted,
        },
      });
    }
    audioEngine.setConfig(newConfig);
  };

  // Toggle global track visibility (Teks, Grafis, Audio)
  const handleToggleTrackVisibility = (track: 'text' | 'graphics' | 'audio') => {
    if (track === 'audio') {
      const nextMuted = !audioConfig.isMuted;
      const updatedAudio = { ...audioConfig, isMuted: nextMuted };
      handleUpdateAudioConfig(updatedAudio);
      return;
    }

    const nextVis = !trackVisibility[track];
    const updatedVis = {
      ...trackVisibility,
      [track]: nextVis,
    };
    if (onUpdateBrief) {
      onUpdateBrief({
        ...brief,
        trackVisibility: updatedVis,
      });
    }
  };

  // Time ruler marks every 2-5 seconds
  const totalSeconds = totalFrames / brief.fps;
  const rulerTicks = [];
  const stepSeconds = totalSeconds > 15 ? 4 : 2;
  for (let s = 0; s <= totalSeconds; s += stepSeconds) {
    const frameAtS = s * brief.fps;
    rulerTicks.push({
      frame: frameAtS,
      label: `00:${s.toString().padStart(2, '0')}`,
      pct: (frameAtS / totalFrames) * 100,
    });
  }

  // Audio equalizer bars
  const audioBars = [
    0.4, 0.7, 0.9, 0.6, 0.3, 0.5, 0.8, 0.6, 0.4, 0.8, 0.9, 0.5, 0.3, 0.7, 0.6, 0.4, 0.8, 0.5,
    0.7, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.8, 0.9, 0.6, 0.4, 0.8, 0.6, 0.3, 0.5, 0.7, 0.9,
    0.5, 0.8, 0.6, 0.4, 0.7, 0.9, 0.5, 0.3, 0.8, 0.6, 0.7, 0.9, 0.4, 0.6, 0.8, 0.5, 0.7, 0.9,
  ];

  return (
    <div className="h-full bg-[#121318] border-t border-[#232630] flex flex-col select-none text-xs">
      {/* 1. CapCut Timeline Action Toolbar */}
      <div className="h-10 px-3 bg-[#171821] border-b border-[#232530] flex items-center justify-between shrink-0">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Undo / Redo Buttons */}
          <div className="flex items-center bg-[#181a24] rounded-lg border border-[#2b2e3d] p-0.5">
            <Tooltip content="Undo (Ctrl+Z)">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-1.5 rounded-md transition-colors ${
                  canUndo ? 'text-slate-200 hover:text-white hover:bg-[#252838] cursor-pointer' : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Redo (Ctrl+Y)">
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-1.5 rounded-md transition-colors ${
                  canRedo ? 'text-slate-200 hover:text-white hover:bg-[#252838] cursor-pointer' : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>

          <div className="h-4 w-px bg-[#2b2e3b] mx-0.5" />

          {/* Add Template Button */}
          <Tooltip content="Tambah Scene / Template (T)">
            <button
              type="button"
              onClick={() => setIsAddTemplateOpen(true)}
              className="p-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 rounded-lg flex items-center justify-center transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </Tooltip>

          {/* Transitions Gallery Button */}
          {onOpenTransitionsGallery && (
            <Tooltip content="Galeri Transisi Antar Scene">
              <button
                type="button"
                onClick={() => onOpenTransitionsGallery()}
                className="p-1.5 bg-[#1a1c26] hover:bg-[#252838] text-cyan-300 border border-cyan-800/60 rounded-lg flex items-center justify-center transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </button>
            </Tooltip>
          )}

          {/* Track Mode Switcher: Lengkap (V1, T1, G1, A1) vs Ringkas (V1 Scene Saja) */}
          <Tooltip content={isMultiTrackMode ? 'Beralih ke Track Ringkas (V1 Saja)' : 'Beralih ke Multi-Track Lengkap (4 Layer)'}>
            <button
              type="button"
              onClick={() => setIsMultiTrackMode(!isMultiTrackMode)}
              className={`p-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center transition-all border cursor-pointer ${
                isMultiTrackMode
                  ? 'bg-purple-950/60 text-purple-300 border-purple-500/60 shadow-sm'
                  : 'bg-[#1a1c26] text-slate-400 border-slate-700/60 hover:bg-[#252838] hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-400" />
            </button>
          </Tooltip>

          <div className="h-4 w-px bg-[#2b2e3b] mx-0.5" />

          {/* Snap to Grid Feature */}
          <div className="relative">
            <Tooltip content={`Snap to Grid (${isSnapToGrid ? `${snapIncrement}f` : 'Off'}) • Klik opsi`}>
              <button
                type="button"
                onClick={() => setShowSnapMenu(!showSnapMenu)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                  isSnapToGrid
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 shadow-sm'
                    : 'bg-[#181a24] text-slate-400 border-[#2b2e3c] hover:bg-[#252834]'
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-mono font-bold">{isSnapToGrid ? `${snapIncrement}f` : 'Off'}</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>
            </Tooltip>

            {showSnapMenu && (
              <div className="absolute bottom-full mb-1.5 left-0 w-44 bg-[#181a22] border border-[#2d3142] rounded-xl shadow-2xl py-1 z-50 animate-fade-in text-xs">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#252836]">
                  Snap to Grid Frame
                </div>
                {[
                  { frames: 5, label: '5 Frames (0.16s)' },
                  { frames: 10, label: '10 Frames (0.33s)' },
                  { frames: 15, label: '15 Frames (0.50s)' },
                  { frames: 30, label: '30 Frames (1.00s)' },
                ].map((opt) => (
                  <button
                    key={opt.frames}
                    type="button"
                    onClick={() => {
                      setIsSnapToGrid(true);
                      setSnapIncrement(opt.frames);
                      setShowSnapMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#232736] transition-colors cursor-pointer ${
                      isSnapToGrid && snapIncrement === opt.frames
                        ? 'text-cyan-400 font-bold bg-[#1d2230]'
                        : 'text-slate-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSnapToGrid && snapIncrement === opt.frames && (
                      <Check className="w-3 h-3 text-cyan-400" />
                    )}
                  </button>
                ))}
                <div className="h-px bg-[#252836] my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setIsSnapToGrid(false);
                    setShowSnapMenu(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#232736] transition-colors cursor-pointer ${
                    !isSnapToGrid ? 'text-amber-400 font-bold bg-[#1d2230]' : 'text-slate-400'
                  }`}
                >
                  <span>Nonaktifkan Snap</span>
                  {!isSnapToGrid && <Check className="w-3 h-3 text-amber-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Magnet Snapping Toggle */}
          <Tooltip content={isMagnetActive ? 'Magnet Snapping: Aktif' : 'Magnet Snapping: Nonaktif'}>
            <button
              type="button"
              onClick={() => setIsMagnetActive(!isMagnetActive)}
              className={`p-1.5 rounded-lg text-[11px] flex items-center justify-center transition-colors cursor-pointer ${
                isMagnetActive
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                  : 'text-slate-400 hover:bg-[#252834]'
              }`}
            >
              <Magnet className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {/* Right Timeline Zoom */}
        <div className="flex items-center gap-1 sm:gap-2 text-slate-400">
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(1, prev - 0.5))}
            className="p-1 hover:text-white hover:bg-[#252838] rounded transition-colors cursor-pointer"
            title="Perkecil Timeline"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.5}
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="hidden xs:block w-14 sm:w-24 h-1 bg-[#282b36] rounded appearance-none cursor-pointer accent-cyan-400"
          />
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(3, prev + 0.5))}
            className="p-1 hover:text-white hover:bg-[#252838] rounded transition-colors cursor-pointer"
            title="Perbesar Timeline"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Timeline Workspace (Left Headers + Right Tracks Canvas) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Track Headers Column (CapCut Track Tags: V1, T1, G1, A1) */}
        <div className="w-14 sm:w-20 bg-[#14151b] border-r border-[#23252d] flex flex-col shrink-0 pt-6 text-[10px] text-slate-400 font-medium">
          {/* Track V1 Header */}
          <div className="h-14 px-1.5 sm:px-2 flex items-center justify-between border-b border-[#1f2129] bg-[#161720]">
            <Tooltip content="Track Utama Video (V1 Base)" position="right">
              <div className="flex items-center gap-1 text-slate-200 font-bold cursor-default">
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>V1</span>
              </div>
            </Tooltip>
            <Tooltip content="Track Video Aktif" position="top">
              <Eye className="w-3 h-3 text-cyan-400" />
            </Tooltip>
          </div>

          {/* MULTI-TRACK HEADERS (Visible only when isMultiTrackMode is active) */}
          {isMultiTrackMode && (
            <>
              {/* Track T1 Header (Text Layer) */}
              <div className="h-9 px-2 flex items-center justify-between border-b border-[#1f2129] bg-[#13141b]">
                <Tooltip content="Track Overlay Teks (T1)" position="right">
                  <div className="flex items-center gap-1 text-slate-200 font-bold cursor-default">
                    <Type className="w-3.5 h-3.5 text-amber-400" />
                    <span>T1</span>
                  </div>
                </Tooltip>
                <Tooltip content={trackVisibility.text ? 'Teks Aktif (Klik untuk Mute)' : 'Teks Disembunyikan'} position="top">
                  <button
                    type="button"
                    onClick={() => handleToggleTrackVisibility('text')}
                    className={`p-1 rounded hover:bg-white/10 transition-colors cursor-pointer ${
                      trackVisibility.text ? 'text-amber-400' : 'text-slate-600'
                    }`}
                  >
                    {trackVisibility.text ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-rose-400" />
                    )}
                  </button>
                </Tooltip>
              </div>

              {/* Track G1 Header (Graphic / Badge Layer) */}
              <div className="h-9 px-2 flex items-center justify-between border-b border-[#1f2129] bg-[#13141b]">
                <Tooltip content="Track Overlay Badge / Stiker (G1)" position="right">
                  <div className="flex items-center gap-1 text-slate-200 font-bold cursor-default">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>G1</span>
                  </div>
                </Tooltip>
                <Tooltip content={trackVisibility.graphics ? 'Badge Aktif (Klik untuk Mute)' : 'Badge Disembunyikan'} position="top">
                  <button
                    type="button"
                    onClick={() => handleToggleTrackVisibility('graphics')}
                    className={`p-1 rounded hover:bg-white/10 transition-colors cursor-pointer ${
                      trackVisibility.graphics ? 'text-purple-400' : 'text-slate-600'
                    }`}
                  >
                    {trackVisibility.graphics ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-rose-400" />
                    )}
                  </button>
                </Tooltip>
              </div>

              {/* Track A1 Header (Audio Track) */}
              <div className="h-9 px-2 flex items-center justify-between border-b border-[#1f2129] bg-[#12141a]">
                <Tooltip content="Track Audio & Musik (A1) • Klik untuk Setting" position="right">
                  <div
                    onClick={() => setIsAudioSettingsOpen(true)}
                    className="flex items-center gap-1 text-slate-200 cursor-pointer hover:text-emerald-400 transition-colors font-bold"
                  >
                    <Music className="w-3.5 h-3.5 text-emerald-400" />
                    <span>A1</span>
                  </div>
                </Tooltip>
                <Tooltip content={audioConfig.isMuted ? 'Audio Muted' : `Volume: ${audioConfig.volume}%`} position="top">
                  <button
                    type="button"
                    onClick={() => handleToggleTrackVisibility('audio')}
                    className={`p-1 rounded hover:bg-white/10 transition-colors cursor-pointer ${
                      audioConfig.isMuted ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {audioConfig.isMuted ? (
                      <VolumeX className="w-3 h-3" />
                    ) : (
                      <Volume2 className="w-3 h-3" />
                    )}
                  </button>
                </Tooltip>
              </div>
            </>
          )}
        </div>

        {/* Right Multi-track Canvas Container */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          onTouchStart={handleTimelineTouch}
          onTouchMove={handleTimelineTouch}
          className="flex-1 flex flex-col relative overflow-x-auto overflow-y-hidden cursor-crosshair bg-[#0f1015] touch-pan-x"
        >
          {/* Time Ruler Bar */}
          <div className="h-6 bg-[#16171e] border-b border-[#23252d] relative flex items-center shrink-0">
            {rulerTicks.map((tick, i) => (
              <div
                key={i}
                className="absolute flex flex-col items-center pointer-events-none -translate-x-1/2"
                style={{ left: `${tick.pct}%` }}
              >
                <div className="h-2 w-px bg-slate-600 mb-0.5" />
                <span className="text-[9px] font-mono text-slate-400">{tick.label}</span>
              </div>
            ))}
          </div>

          {/* Subtle Grid Snap Guidelines when Snap to Grid is active */}
          {isSnapToGrid && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
              {Array.from({ length: Math.ceil(totalFrames / snapIncrement) }).map((_, i) => {
                const framePos = i * snapIncrement;
                const leftPct = (framePos / Math.max(1, totalFrames - 1)) * 100;
                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-px border-r border-dashed border-cyan-400/40"
                    style={{ left: `${leftPct}%` }}
                  />
                );
              })}
            </div>
          )}

          {/* Red Playhead Line & Cursor Indicator */}
          <div
            className="absolute top-0 bottom-0 z-40 pointer-events-none flex flex-col items-center -translate-x-1/2 transition-none"
            style={{ left: `${playheadPercent}%` }}
          >
            {/* Playhead Badge Indicator */}
            <div className="w-3 h-3.5 bg-rose-500 rounded-b-sm shadow-md flex items-center justify-center -mt-0.5">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
            {/* Vertical Line */}
            <div className="flex-1 w-[1.5px] bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <div className="text-[9px] font-mono font-bold text-rose-400 bg-black/90 px-1 py-0.2 rounded border border-rose-500/40 -mb-1">
              {currentFrame}f
            </div>
          </div>

          {/* ============================================================ */}
          {/* TRACK 1: V1 Video Clips Sequence Lane */}
          {/* ============================================================ */}
          <div className="h-14 border-b border-[#1f212a] p-1 flex items-center gap-1 relative bg-[#13141b] overflow-hidden">
            {sequences.map((seq, idx) => {
              const widthPct = (seq.durationInFrames / totalFrames) * 100;
              const isActive =
                (brief.scenes && activeSceneId === seq.id) || currentSequence.id === seq.id;
              const hasTransition = !!seq.transitionNext && idx < sequences.length - 1;
              const transitionInfo = seq.transitionNext || { type: 'none', durationInFrames: 0 };

              return (
                <React.Fragment key={seq.id}>
                  {/* Scene Clip Block */}
                  <div
                    style={{
                      width: `${widthPct}%`,
                      borderLeftColor: seq.color,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeek(seq.startFrame);
                      if (onSelectScene) onSelectScene(seq.id);
                    }}
                    className={`h-full rounded-md border-l-4 p-1.5 flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden group select-none shrink-0 ${
                      isActive
                        ? 'bg-[#222636] border-t-2 border-r-2 border-b-2 border-cyan-400 shadow-lg shadow-cyan-500/10'
                        : 'bg-[#181a24] hover:bg-[#1e202e] border-t border-r border-b border-white/10'
                    }`}
                  >
                    {/* Top Row: Scene Name & Duration */}
                    <div className="flex items-center justify-between pointer-events-none">
                      <span className="font-bold text-white text-[10px] truncate max-w-[80%] flex items-center gap-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: seq.color }}
                        />
                        {seq.name}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {seq.durationInFrames}f ({(seq.durationInFrames / brief.fps).toFixed(1)}s)
                      </span>
                    </div>

                    {/* Bottom Row: Quick Clip Action Buttons */}
                    <div className="flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Move Scene Left/Right */}
                      <div className="flex items-center gap-0.5">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveScene(idx, 'left');
                            }}
                            className="p-0.5 hover:bg-white/20 rounded text-slate-300 transition-colors"
                            title="Geser Scene ke Kiri (Sebelumnya)"
                          >
                            <ArrowLeft className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {idx < sequences.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveScene(idx, 'right');
                            }}
                            className="p-0.5 hover:bg-white/20 rounded text-slate-300 transition-colors"
                            title="Geser Scene ke Kanan (Berikutnya)"
                          >
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>

                      {/* Right Scene Tools */}
                      <div className="flex items-center gap-1">
                        {/* Edit Content */}
                        {onOpenEditSceneModal && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditSceneModal(seq.id);
                            }}
                            className="p-0.5 hover:bg-cyan-500 hover:text-black rounded text-cyan-300 transition-colors"
                            title="Edit Teks & Kustomisasi Scene Ini"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                          </button>
                        )}
                        {/* Duration -15f */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeSceneDuration(idx, -15);
                          }}
                          className="px-1 py-0.2 hover:bg-white/20 rounded font-mono text-[8px] text-slate-300"
                          title="Perpendek 15 frame (-0.5s)"
                        >
                          -15f
                        </button>
                        {/* Duration +15f */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeSceneDuration(idx, 15);
                          }}
                          className="px-1 py-0.2 hover:bg-white/20 rounded font-mono text-[8px] text-slate-300"
                          title="Perpanjang 15 frame (+0.5s)"
                        >
                          +15f
                        </button>
                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateScene(idx);
                          }}
                          className="p-0.5 hover:bg-cyan-500 hover:text-black rounded text-slate-300"
                          title="Duplikasi Scene Ini"
                        >
                          <Copy className="w-2.5 h-2.5" />
                        </button>
                        {/* Delete */}
                        {sequences.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScene(idx);
                            }}
                            className="p-0.5 hover:bg-rose-500 hover:text-white rounded text-slate-400"
                            title="Hapus Scene Ini"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transition Node (CapCut signature square between clips) */}
                  {hasTransition && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenTransitionsGallery) {
                          onOpenTransitionsGallery(idx);
                        } else {
                          setEditingTransitionIndex(idx);
                        }
                      }}
                      className="shrink-0 w-4 h-7 -mx-1 z-30 rounded bg-[#202330] hover:bg-cyan-400 border border-white/30 hover:border-white shadow-md flex items-center justify-center text-[8px] text-slate-200 hover:text-slate-950 font-bold transition-all group"
                      title={`Transisi: ${transitionInfo.type} (${transitionInfo.durationInFrames}f). Klik untuk buka Galeri Transisi.`}
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

          {/* ============================================================ */}
          {/* MULTI-TRACK INTERACTIVE LANES (T1, G1, A1) */}
          {/* ============================================================ */}
          {isMultiTrackMode && (
            <>
              {/* TRACK 2: T1 Text Kinetic Layer Lane */}
              <div
                className={`h-9 border-b border-[#1a1c24] p-1 flex gap-1 relative transition-colors ${
                  trackVisibility.text ? 'bg-[#121319]' : 'bg-[#0f1014] opacity-50'
                }`}
              >
                {sequences.map((seq, idx) => {
                  const widthPct = (seq.durationInFrames / totalFrames) * 100;
                  const sceneData = brief.scenes?.[idx];
                  const isSceneTextHidden = !trackVisibility.text || !!sceneData?.hideText;
                  const headlineText = sceneData?.title || seq.description || `Teks Scene #${idx + 1}`;

                  return (
                    <div
                      key={seq.id || idx}
                      style={{ width: `${widthPct}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek(seq.startFrame);
                        if (onSelectScene) onSelectScene(seq.id);
                        setEditingTextIndex(idx);
                      }}
                      className={`h-full rounded border px-2 flex items-center justify-between text-[9px] font-semibold truncate cursor-pointer transition-all group ${
                        isSceneTextHidden
                          ? 'bg-slate-900/40 border-slate-700/40 text-slate-500 line-through'
                          : 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-600/40 hover:border-amber-400 text-amber-300'
                      }`}
                      title="Klik untuk Quick Edit Teks Scene Ini (Judul & Subjudul)"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <Type className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        <span className="truncate">
                          #{idx + 1}: {headlineText}
                        </span>
                      </span>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {isSceneTextHidden && (
                          <span className="text-[8px] bg-rose-500/20 text-rose-300 px-1 rounded">
                            Muted
                          </span>
                        )}
                        <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-amber-300 transition-opacity" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TRACK 3: G1 Badges & Graphics Lane */}
              <div
                className={`h-9 border-b border-[#1a1c24] p-1 flex gap-1 relative transition-colors ${
                  trackVisibility.graphics ? 'bg-[#121319]' : 'bg-[#0f1014] opacity-50'
                }`}
              >
                {sequences.map((seq, idx) => {
                  const widthPct = (seq.durationInFrames / totalFrames) * 100;
                  const sceneData = brief.scenes?.[idx];
                  const isSceneBadgeHidden = !trackVisibility.graphics || !!sceneData?.hideBadge;
                  const badgeText = sceneData?.badgeText || 'FITUR TERBARU';

                  return (
                    <div
                      key={seq.id || idx}
                      style={{ width: `${widthPct}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek(seq.startFrame);
                        if (onSelectScene) onSelectScene(seq.id);
                        setEditingBadgeIndex(idx);
                      }}
                      className={`h-full rounded border px-2 flex items-center justify-between text-[9px] font-semibold truncate cursor-pointer transition-all group ${
                        isSceneBadgeHidden
                          ? 'bg-slate-900/40 border-slate-700/40 text-slate-500 line-through'
                          : 'bg-purple-950/30 hover:bg-purple-900/40 border-purple-600/40 hover:border-purple-400 text-purple-300'
                      }`}
                      title="Klik untuk ganti Badge / Grafis Scene Ini"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <Sparkles className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                        <span className="truncate">
                          Badge #{idx + 1}: {badgeText}
                        </span>
                      </span>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {isSceneBadgeHidden && (
                          <span className="text-[8px] bg-rose-500/20 text-rose-300 px-1 rounded">
                            Muted
                          </span>
                        )}
                        <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-purple-300 transition-opacity" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TRACK 4: A1 Audio Track Lane */}
              <div
                onClick={() => setIsAudioSettingsOpen(true)}
                className={`h-9 border-b border-[#1a1c24] p-1 flex items-center gap-0.5 relative px-2 overflow-hidden cursor-pointer group transition-colors ${
                  audioConfig.isMuted
                    ? 'bg-[#101217] opacity-60'
                    : 'bg-[#0e141a] hover:bg-[#131d26]'
                }`}
                title="Klik untuk membuka Pengaturan Musik BGM & Efek Suara (SFX)"
              >
                <div
                  className={`absolute inset-0 ${
                    audioConfig.isMuted ? 'bg-slate-950/30' : 'bg-emerald-950/20'
                  }`}
                />

                <div className="text-[9px] text-emerald-400 font-bold uppercase mr-2 shrink-0 z-10 flex items-center gap-1.5">
                  <Music className="w-3 h-3 text-emerald-400" />
                  <span className="truncate max-w-[200px] sm:max-w-[260px]">
                    🎵 {audioConfig.name} ({audioConfig.bpm} BPM) • {audioConfig.genre}
                  </span>
                  {audioConfig.isMuted ? (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[8px] border border-rose-500/30">
                      MUTED
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[8px] border border-emerald-500/30">
                      VOL: {audioConfig.volume}%
                    </span>
                  )}
                </div>

                {/* Animated Waveform Audio Bars */}
                <div className="flex items-center gap-0.5 flex-1 overflow-hidden z-10">
                  {audioBars.map((heightVal, idx) => (
                    <div
                      key={idx}
                      style={{
                        height: audioConfig.isMuted
                          ? '20%'
                          : `${Math.max(15, heightVal * (audioConfig.volume / 100) * 100)}%`,
                      }}
                      className={`w-1 rounded-full z-10 shrink-0 transition-all ${
                        audioConfig.isMuted ? 'bg-slate-700' : 'bg-emerald-500/60'
                      }`}
                    />
                  ))}
                </div>

                <div className="z-10 ml-2 hidden sm:flex items-center gap-1 text-[9px] text-emerald-400/80 group-hover:text-emerald-300 font-medium">
                  <Sliders className="w-2.5 h-2.5" />
                  <span>Ubah BGM</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODALS: Template, Transition, Audio, Badge, Text */}
      {/* ============================================================ */}

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

      {/* A1: Audio & BGM Settings Modal */}
      <AudioSettingsModal
        isOpen={isAudioSettingsOpen}
        onClose={() => setIsAudioSettingsOpen(false)}
        audioConfig={audioConfig}
        onUpdateAudioConfig={handleUpdateAudioConfig}
      />

      {/* G1: Quick Badge Modal */}
      {editingBadgeIndex !== null && brief.scenes && (
        <QuickBadgeModal
          isOpen={true}
          onClose={() => setEditingBadgeIndex(null)}
          scene={brief.scenes[editingBadgeIndex] || null}
          sceneIndex={editingBadgeIndex}
          onUpdateScene={handleUpdateSingleScene}
        />
      )}

      {/* T1: Quick Text Modal */}
      {editingTextIndex !== null && brief.scenes && (
        <QuickTextModal
          isOpen={true}
          onClose={() => setEditingTextIndex(null)}
          scene={brief.scenes[editingTextIndex] || null}
          sceneIndex={editingTextIndex}
          onUpdateScene={handleUpdateSingleScene}
        />
      )}
    </div>
  );
};
