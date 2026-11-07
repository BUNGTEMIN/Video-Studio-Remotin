import React, { useRef, useState, useEffect } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import {
  Play,
  Pause,
  RotateCcw,
  StepBack,
  StepForward,
  Repeat,
  Maximize2,
  Minimize2,
  Camera,
  Grid,
  ShieldAlert,
  Sliders,
  Edit3,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Check,
  ExternalLink,
  Expand,
  Shrink,
} from 'lucide-react';
import { LiveRemotionComposition } from '../remotion/LiveRemotionComposition';
import type { VideoBrief } from '../../types/remotion';
import { getResolutionForFormat, framesToSeconds } from '../../utils/remotionMath';
import { audioEngine } from '../../utils/audioSynth';
import { Tooltip } from '../common/Tooltip';

export type MonitorZoomLevel = 'fit' | '25%' | '50%' | '75%' | '100%' | '125%' | '150%';

interface CapCutPlayerProps {
  brief: VideoBrief;
  currentFrame: number;
  setCurrentFrame: (frame: number) => void;
  onFormatChange: (format: '16:9' | '9:16') => void;
  onOpenEditSceneModal?: () => void;
  onPopOut?: () => void;
  isFloating?: boolean;
  onToggleFullHeight?: () => void;
  isFullHeight?: boolean;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

const ZOOM_STEPS: MonitorZoomLevel[] = ['25%', '50%', '75%', 'fit', '100%', '125%', '150%'];

export const CapCutPlayer: React.FC<CapCutPlayerProps> = ({
  brief,
  currentFrame,
  setCurrentFrame,
  onFormatChange,
  onOpenEditSceneModal,
  onPopOut,
  isFloating = false,
  onToggleFullHeight,
  isFullHeight = false,
  isPlaying: externalIsPlaying,
  onTogglePlay,
}) => {
  const playerRef = useRef<PlayerRef>(null);
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;
  const [isLooping, setIsLooping] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<MonitorZoomLevel>('fit');
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  const { width, height } = getResolutionForFormat(brief.format);
  const totalFrames =
    brief.scenes && brief.scenes.length > 0
      ? brief.scenes.reduce((sum, s) => sum + Math.max(15, s.durationInFrames), 0)
      : Math.round(brief.durationSeconds * brief.fps);
  const isVertical = brief.format === '9:16';

  // Format frame to CapCut-style timecode (MM:SS:FF)
  const formatTimecode = (frame: number, fps: number) => {
    const totalSecs = Math.floor(frame / fps);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const remainderFrames = frame % fps;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(mins)}:${pad(secs)}:${pad(remainderFrames)}`;
  };

  // Sync player events
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate = (e: { detail: { frame: number } }) => {
      setCurrentFrame(e.detail.frame);
    };

    const onPlay = () => {
      setInternalIsPlaying(true);
      if (externalIsPlaying === false && onTogglePlay) {
        onTogglePlay();
      }
    };
    const onPause = () => {
      setInternalIsPlaying(false);
      if (externalIsPlaying === true && onTogglePlay) {
        onTogglePlay();
      }
    };

    player.addEventListener('frameupdate', onFrameUpdate);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);

    return () => {
      player.removeEventListener('frameupdate', onFrameUpdate);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, [setCurrentFrame, externalIsPlaying, onTogglePlay]);

  // Sync external isPlaying commands from keyboard shortcuts / App state
  useEffect(() => {
    if (!playerRef.current || externalIsPlaying === undefined) return;
    if (externalIsPlaying && !playerRef.current.isPlaying()) {
      playerRef.current.play();
    } else if (!externalIsPlaying && playerRef.current.isPlaying()) {
      playerRef.current.pause();
    }
  }, [externalIsPlaying]);

  // Sync external changes (timeline clicks) to player
  useEffect(() => {
    if (playerRef.current && !isPlaying) {
      const playerFrame = playerRef.current.getCurrentFrame();
      if (Math.abs(playerFrame - currentFrame) > 1) {
        playerRef.current.seekTo(currentFrame);
      }
    }
  }, [currentFrame, isPlaying]);

  // Sync Web Audio Synthesizer with Video Playback & Settings
  useEffect(() => {
    if (isPlaying) {
      const audioConf = brief.audioConfig;
      audioEngine.setConfig({
        bpm: audioConf?.bpm || 128,
        volume: audioConf?.volume ?? 85,
        isMuted: audioConf?.isMuted ?? false,
        sfxTransitions: audioConf?.sfxTransitions ?? true,
      });
      audioEngine.start();
    } else {
      audioEngine.stop();
    }
    return () => {
      audioEngine.stop();
    };
  }, [isPlaying, brief.audioConfig]);

  const togglePlay = () => {
    if (onTogglePlay) {
      onTogglePlay();
    } else if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  };

  const seekRelative = (deltaFrames: number) => {
    if (!playerRef.current) return;
    const target = Math.max(0, Math.min(totalFrames - 1, currentFrame + deltaFrames));
    playerRef.current.seekTo(target);
  };

  const restartVideo = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
    playerRef.current.play();
  };

  const captureSnapshot = () => {
    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 2000);
  };

  // Zoom In / Zoom Out step controls
  const handleZoomIn = () => {
    const currentIndex = ZOOM_STEPS.indexOf(zoomLevel);
    if (currentIndex < ZOOM_STEPS.length - 1) {
      setZoomLevel(ZOOM_STEPS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_STEPS.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(ZOOM_STEPS[currentIndex - 1]);
    }
  };

  const getZoomMultiplier = () => {
    switch (zoomLevel) {
      case '25%':
        return 0.35;
      case '50%':
        return 0.6;
      case '75%':
        return 0.8;
      case '100%':
        return 1.0;
      case '125%':
        return 1.25;
      case '150%':
        return 1.5;
      case 'fit':
      default:
        return 1.0;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111217] relative overflow-hidden select-none">
      {/* CapCut Monitor Top Sub-bar */}
      <div className="h-9 bg-[#16171d] border-b border-[#23252d] px-3 sm:px-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-200 hidden sm:inline">Player Monitor</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-cyan-400 font-bold">{formatTimecode(currentFrame, brief.fps)}</span>
          <span className="text-slate-500 hidden md:inline">/ {formatTimecode(totalFrames, brief.fps)}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2029] text-cyan-300 font-semibold border border-cyan-800/40">
            {isVertical ? '9:16 Reels' : '16:9'}
          </span>
        </div>

        {/* Monitor Header Right: Zoom Controls, Edit Teks, Safe Area, Full-Height & Floating Window */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Zoom In/Out & Presets Dropdown */}
          <div className="flex items-center bg-[#191b24] border border-[#2b2f3d] rounded-lg p-0.5">
            <Tooltip content="Perkecil Skala (Zoom Out)">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel === '25%'}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-[#252838] transition-colors"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
            </Tooltip>

            {/* Dropdown Menu */}
            <div className="relative">
              <Tooltip content="Pilih Skala Zoom Monitor">
                <button
                  type="button"
                  onClick={() => setShowZoomMenu(!showZoomMenu)}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>{zoomLevel === 'fit' ? 'Pas' : zoomLevel}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>
              </Tooltip>

              {showZoomMenu && (
                <div className="absolute top-full right-0 mt-1 w-32 bg-[#181a24] border border-[#2d3246] rounded-xl shadow-2xl py-1 z-50 text-[11px] font-mono animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setZoomLevel('fit');
                      setShowZoomMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#252838] ${
                      zoomLevel === 'fit' ? 'text-cyan-400 font-bold bg-[#1d2232]' : 'text-slate-300'
                    }`}
                  >
                    <span>Pas (Fit)</span>
                    {zoomLevel === 'fit' && <Check className="w-3 h-3 text-cyan-400" />}
                  </button>
                  <div className="h-px bg-[#262a3a] my-1" />
                  {(['25%', '50%', '75%', '100%', '125%', '150%'] as MonitorZoomLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setZoomLevel(lvl);
                        setShowZoomMenu(false);
                      }}
                      className={`w-full px-3 py-1 text-left flex items-center justify-between hover:bg-[#252838] ${
                        zoomLevel === lvl ? 'text-cyan-400 font-bold bg-[#1d2232]' : 'text-slate-300'
                      }`}
                    >
                      <span>{lvl}</span>
                      {zoomLevel === lvl && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Tooltip content="Perbesar Skala (Zoom In)">
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel === '150%'}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-[#252838] transition-colors"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </Tooltip>
          </div>

          {/* Quick Edit Scene Text Button */}
          {onOpenEditSceneModal && (
            <Tooltip content="Edit Teks & Kustomisasi Scene Aktif">
              <button
                type="button"
                onClick={onOpenEditSceneModal}
                className="p-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 hover:text-white transition-all shadow-sm active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}

          {/* Safe Area Guides Toggle */}
          <Tooltip content="Batas Aman (Safe Area TikTok / Reels)">
            <button
              type="button"
              onClick={() => setShowSafeArea(!showSafeArea)}
              className={`p-1.5 rounded-lg transition-colors border ${
                showSafeArea
                  ? 'bg-cyan-950 border-cyan-700/80 text-cyan-300'
                  : 'bg-[#1b1c24] hover:bg-[#252834] text-slate-400 hover:text-white border-[#2b2f3d]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {/* Full-Height / Focus Mode Toggle */}
          {onToggleFullHeight && !isFloating && (
            <Tooltip content={isFullHeight ? 'Keluar Mode Layar Penuh' : 'Mode Monitor Tinggi Penuh'}>
              <button
                type="button"
                onClick={onToggleFullHeight}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isFullHeight
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-[#1b1c24] hover:bg-[#252834] text-slate-400 hover:text-white border-[#2b2f3d]'
                }`}
              >
                {isFullHeight ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
              </button>
            </Tooltip>
          )}

          {/* Floating Window (Undock Player) Button */}
          {onPopOut && (
            <Tooltip content={isFloating ? 'Kembalikan Player ke Dock' : 'Buka Player sebagai Jendela Melayang'}>
              <button
                type="button"
                onClick={onPopOut}
                className={`p-1.5 rounded-lg transition-colors border ${
                  isFloating
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                    : 'bg-[#1b1c24] hover:bg-[#252834] text-slate-400 hover:text-white border-[#2b2f3d]'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </Tooltip>
          )}

          <Tooltip content="Simpan Frame Cuplikan (Snapshot)">
            <button
              type="button"
              onClick={captureSnapshot}
              className="p-1.5 rounded-lg bg-[#1b1c24] hover:bg-[#252834] text-slate-400 hover:text-white transition-colors border border-[#2b2f3d]"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Video Viewport Canvas */}
      <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4 overflow-auto bg-[#0e0f13] min-h-0">
        {/* CapCut Dot Matrix Pattern Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#252834_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        {/* Video Canvas Container with Automatic Letterboxing & Responsive Containment */}
        <div
          style={{
            transform: zoomLevel !== 'fit' ? `scale(${getZoomMultiplier()})` : undefined,
            transformOrigin: 'center center',
          }}
          className={`relative shadow-2xl overflow-hidden border border-[#2b2f3d] bg-black flex items-center justify-center rounded-xl transition-all duration-200 shrink-0 ${
            isVertical
              ? 'h-full max-h-[calc(100%-8px)] aspect-[9/16] w-auto max-w-full'
              : 'h-full max-h-[calc(100%-8px)] aspect-video w-auto max-w-[calc(100%-20px)]'
          }`}
        >
          <Player
            ref={playerRef}
            component={LiveRemotionComposition}
            inputProps={{
              ...brief.visualElements,
              format: brief.format,
              scenes: brief.scenes,
              trackVisibility: brief.trackVisibility,
            }}
            durationInFrames={totalFrames}
            compositionWidth={width}
            compositionHeight={height}
            fps={brief.fps}
            loop={isLooping}
            initialFrame={20}
            acknowledgeRemotionLicense
            style={{
              width: '100%',
              height: '100%',
            }}
            controls={false}
          />

          {/* Optional CapCut Safe Area Overlay */}
          {showSafeArea && (
            <div className="absolute inset-0 pointer-events-none z-30 border-2 border-dashed border-cyan-400/50 m-3 flex flex-col justify-between p-2">
              <div className="text-[9px] font-mono text-cyan-300 bg-black/75 px-1.5 py-0.5 rounded self-start border border-cyan-800/40">
                {isVertical ? 'Batas Aman TikTok / Reels 9:16' : 'Batas Aman 16:9'}
              </div>
              {isVertical && (
                <div className="text-[9px] font-mono text-amber-300 bg-black/75 px-1.5 py-0.5 rounded self-end border border-amber-800/40">
                  Area Ikon Like, Komen, Share
                </div>
              )}
            </div>
          )}

          {/* Quick HUD Frame Tag */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 pointer-events-none border border-white/10 z-20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>F: {currentFrame} / {totalFrames}</span>
          </div>

          {/* Zoom Level Watermark Pill if not in fit mode */}
          {zoomLevel !== 'fit' && (
            <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 pointer-events-none border border-cyan-700/50 z-20">
              Zoom: {zoomLevel}
            </div>
          )}
        </div>

        {/* Snapshot Notification Pill */}
        {snapshotSuccess && (
          <div className="absolute top-4 bg-emerald-950/90 border border-emerald-600 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xl flex items-center gap-1.5 z-40 animate-fade-in">
            <span>Cuplikan frame berhasil disimpan!</span>
          </div>
        )}

        {/* Full-Height Mode Floating Exit Button Overlay */}
        {isFullHeight && !isFloating && (
          <div className="absolute bottom-16 right-4 z-40">
            <button
              type="button"
              onClick={onToggleFullHeight}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1c1f2b]/90 hover:bg-[#252a3b] border border-cyan-500/50 text-cyan-300 font-bold text-xs shadow-2xl backdrop-blur-md transition-all active:scale-95"
            >
              <Shrink className="w-3.5 h-3.5" />
              <span>Keluar Tinggi Penuh (Tampilkan Timeline)</span>
            </button>
          </div>
        )}
      </div>

      {/* CapCut Monitor Bottom Controls Bar */}
      <div className="h-10 bg-[#16171d] border-t border-[#23252d] px-4 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>{formatTimecode(currentFrame, brief.fps)}</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-bold">
            {framesToSeconds(currentFrame, brief.fps)}s
          </span>
        </div>

        {/* Center Playback Controls */}
        <div className="flex items-center gap-1.5">
          <Tooltip content="Mulai Ulang (Frame 0)">
            <button
              type="button"
              onClick={restartVideo}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#232631] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Mundur 1 Frame (Panah Kiri)">
            <button
              type="button"
              onClick={() => seekRelative(-1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#232631] transition-colors"
            >
              <StepBack className="w-4 h-4" />
            </button>
          </Tooltip>

          {/* Primary Play/Pause Button */}
          <Tooltip content={isPlaying ? 'Jeda Video (Spasi)' : 'Putar Video (Spasi)'}>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-8 h-8 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold flex items-center justify-center shadow-md shadow-cyan-400/30 transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>
          </Tooltip>

          <Tooltip content="Maju 1 Frame (Panah Kanan)">
            <button
              type="button"
              onClick={() => seekRelative(1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#232631] transition-colors"
            >
              <StepForward className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip content={isLooping ? 'Putar Berulang: Aktif' : 'Putar Berulang: Mati'}>
            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded-lg transition-colors ${
                isLooping
                  ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-800/60'
                  : 'text-slate-400 hover:text-white hover:bg-[#232631]'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
          <span>{totalFrames} Frames Total</span>
        </div>
      </div>
    </div>
  );
};
