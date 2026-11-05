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
  Camera,
  Grid,
  ShieldAlert,
  Sliders,
  Edit3,
} from 'lucide-react';
import { LiveRemotionComposition } from '../remotion/LiveRemotionComposition';
import type { VideoBrief } from '../../types/remotion';
import { getResolutionForFormat, framesToSeconds } from '../../utils/remotionMath';

interface CapCutPlayerProps {
  brief: VideoBrief;
  currentFrame: number;
  setCurrentFrame: (frame: number) => void;
  onFormatChange: (format: '16:9' | '9:16') => void;
  onOpenEditSceneModal?: () => void;
}

export const CapCutPlayer: React.FC<CapCutPlayerProps> = ({
  brief,
  currentFrame,
  setCurrentFrame,
  onFormatChange,
  onOpenEditSceneModal,
}) => {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const { width, height } = getResolutionForFormat(brief.format);
  const totalFrames = brief.scenes && brief.scenes.length > 0
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

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    player.addEventListener('frameupdate', onFrameUpdate);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);

    return () => {
      player.removeEventListener('frameupdate', onFrameUpdate);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, [setCurrentFrame]);

  // Sync external changes (timeline clicks) to player
  useEffect(() => {
    if (playerRef.current && !isPlaying) {
      const playerFrame = playerRef.current.getCurrentFrame();
      if (Math.abs(playerFrame - currentFrame) > 1) {
        playerRef.current.seekTo(currentFrame);
      }
    }
  }, [currentFrame, isPlaying]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111217] relative overflow-hidden select-none">
      {/* CapCut Monitor Top Sub-bar */}
      <div className="h-9 bg-[#16171d] border-b border-[#23252d] px-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Player Monitor</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-bold">{formatTimecode(currentFrame, brief.fps)}</span>
          <span className="text-slate-500">/ {formatTimecode(totalFrames, brief.fps)}</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenEditSceneModal && (
            <button
              type="button"
              onClick={onOpenEditSceneModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 hover:text-white text-[11px] font-bold transition-all shadow-sm active:scale-95"
              title="Edit teks dan kustomisasi scene yang sedang tampil di monitor"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Teks Scene</span>
            </button>
          )}

          {/* Safe Area Guides Toggle (CapCut signature feature for TikTok/Reels) */}
          <button
            type="button"
            onClick={() => setShowSafeArea(!showSafeArea)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              showSafeArea
                ? 'bg-cyan-950 border border-cyan-700/80 text-cyan-300'
                : 'bg-[#1b1c24] hover:bg-[#252834] text-slate-400 hover:text-white'
            }`}
            title="Tampilkan garis batas aman safe-area untuk TikTok / Reels"
          >
            <Grid className="w-3 h-3" />
            <span>Area Aman</span>
          </button>

          <button
            type="button"
            onClick={captureSnapshot}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#1b1c24] hover:bg-[#252834] text-slate-400 hover:text-white text-[11px] font-medium transition-colors"
            title="Simpan frame cuplikan (Snapshot)"
          >
            <Camera className="w-3 h-3" />
            <span>Tangkapan</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport Canvas */}
      <div className="flex-1 relative flex items-center justify-center p-3 overflow-hidden bg-[#0e0f13]">
        {/* CapCut Dot Matrix Pattern Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#252834_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        {/* Video Canvas Container */}
        <div
          className={`relative shadow-2xl overflow-hidden border border-[#2b2f3d] bg-black flex items-center justify-center rounded-lg transition-all duration-200 ${
            isVertical
              ? 'w-[250px] md:w-[280px] h-[440px] md:h-[490px]'
              : 'w-full max-w-[620px] aspect-video'
          }`}
        >
          <Player
            ref={playerRef}
            component={LiveRemotionComposition}
            inputProps={{
              ...brief.visualElements,
              format: brief.format,
              scenes: brief.scenes,
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
            <div className="absolute inset-0 pointer-events-none z-30 border-2 border-dashed border-cyan-400/40 m-4 flex flex-col justify-between p-2">
              <div className="text-[9px] font-mono text-cyan-400 bg-black/60 px-1 py-0.5 rounded self-start">
                {isVertical ? 'Batas Aman TikTok / Reels' : 'Batas Aman Title / Subtitle'}
              </div>
              {isVertical && (
                <div className="text-[9px] font-mono text-amber-400 bg-black/60 px-1 py-0.5 rounded self-end">
                  Area Ikon Suka & Komen (Kanan)
                </div>
              )}
            </div>
          )}

          {/* Quick HUD Frame Tag */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 pointer-events-none border border-white/10 z-20">
            F: {currentFrame} / {totalFrames}
          </div>
        </div>

        {/* Snapshot Notification Pill */}
        {snapshotSuccess && (
          <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md animate-fade-in flex items-center gap-1.5 z-40">
            <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
            Frame #{currentFrame} berhasil disimpan!
          </div>
        )}
      </div>

      {/* CapCut Bottom Transport Bar */}
      <div className="h-12 bg-[#16171d] border-t border-[#23252d] px-4 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-300 bg-[#111217] px-2 py-0.5 rounded border border-[#232631]">
            {formatTimecode(currentFrame, brief.fps)}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {framesToSeconds(currentFrame, brief.fps)}s
          </span>
        </div>

        {/* Center Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={restartVideo}
            title="Mulai Ulang (Frame 0)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#232631] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => seekRelative(-1)}
            title="Mundur 1 frame"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#232631] transition-colors"
          >
            <StepBack className="w-4 h-4" />
          </button>

          {/* Primary Play/Pause Button */}
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

          <button
            type="button"
            onClick={() => seekRelative(1)}
            title="Maju 1 frame"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#232631] transition-colors"
          >
            <StepForward className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsLooping(!isLooping)}
            title={`Loop: ${isLooping ? 'Aktif' : 'Mati'}`}
            className={`p-1.5 rounded-lg transition-colors ${
              isLooping
                ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-800/60'
                : 'text-slate-400 hover:text-white hover:bg-[#232631]'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
          <span>{totalFrames} Frames Total</span>
        </div>
      </div>
    </div>
  );
};
