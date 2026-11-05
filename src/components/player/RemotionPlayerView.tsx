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
  Sparkles,
  Camera,
  Layers,
} from 'lucide-react';
import { LiveRemotionComposition } from '../remotion/LiveRemotionComposition';
import type { VideoBrief } from '../../types/remotion';
import { getResolutionForFormat, framesToSeconds } from '../../utils/remotionMath';

interface RemotionPlayerViewProps {
  brief: VideoBrief;
  currentFrame: number;
  setCurrentFrame: (frame: number) => void;
  onFormatChange: (format: '16:9' | '9:16') => void;
}

export const RemotionPlayerView: React.FC<RemotionPlayerViewProps> = ({
  brief,
  currentFrame,
  setCurrentFrame,
  onFormatChange,
}) => {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const { width, height } = getResolutionForFormat(brief.format);
  const totalFrames = Math.round(brief.durationSeconds * brief.fps);
  const isVertical = brief.format === '9:16';

  // Listen to frame changes from player
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

  // Sync external currentFrame changes (e.g. from timeline or presets) to player
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
    // Flash snapshot animation
    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Top Player Toolbar */}
      <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Live Remotion Player
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onFormatChange('16:9')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                !isVertical
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              16:9 Landscape
            </button>
            <button
              type="button"
              onClick={() => onFormatChange('9:16')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                isVertical
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              9:16 Reels/TikTok
            </button>
          </div>
        </div>

        {/* Resolution & Specs Indicator */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {width}x{height}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {brief.fps} fps
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-400 font-semibold font-mono">
            {brief.durationSeconds}s ({totalFrames}f)
          </span>
        </div>
      </div>

      {/* Video Viewport Canvas */}
      <div className="relative flex-1 bg-slate-950/80 flex items-center justify-center p-4 min-h-[360px] max-h-[560px] overflow-hidden">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

        {/* Remotion Player Container */}
        <div
          className={`relative transition-all duration-300 shadow-2xl rounded-xl overflow-hidden border border-slate-700/60 bg-black flex items-center justify-center ${
            isVertical ? 'w-[270px] h-[480px]' : 'w-full max-w-[680px] aspect-video'
          }`}
        >
          <Player
            ref={playerRef}
            component={LiveRemotionComposition}
            inputProps={{
              ...brief.visualElements,
              format: brief.format,
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

          {/* Quick HUD Frame Overlay */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300 pointer-events-none border border-white/10">
            F: {currentFrame} / {totalFrames} • {framesToSeconds(currentFrame, brief.fps)}s
          </div>
        </div>

        {/* Snapshot flash notice */}
        {snapshotSuccess && (
          <div className="absolute top-6 right-6 bg-emerald-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-md animate-fade-in flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            Frame #{currentFrame} captured!
          </div>
        )}
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex flex-col gap-2">
        {/* Scrubber Range Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 w-12 text-right">
            {framesToSeconds(currentFrame, brief.fps)}s
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={totalFrames - 1}
              value={currentFrame}
              aria-label="Video Frame Scrubber"
              onChange={(e) => {
                const f = parseInt(e.target.value, 10);
                setCurrentFrame(f);
                if (playerRef.current) {
                  playerRef.current.seekTo(f);
                }
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
            />
          </div>
          <span className="text-xs font-mono text-slate-400 w-12">
            {brief.durationSeconds}.0s
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={restartVideo}
              title="Restart from beginning"
              aria-label="Restart video"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => seekRelative(-brief.fps)}
              title="Step back 1 sec"
              aria-label="Step back 1 second"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <StepBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Primary */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => seekRelative(brief.fps)}
              title="Step forward 1 sec"
              aria-label="Step forward 1 second"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <StepForward className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              title={`Loop: ${isLooping ? 'On' : 'Off'}`}
              aria-label="Toggle loop"
              className={`p-1.5 rounded-lg transition-colors ${
                isLooping
                  ? 'text-indigo-400 bg-indigo-950/60 border border-indigo-800/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={captureSnapshot}
              title="Capture Current Frame"
              aria-label="Capture snapshot"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Snapshot</span>
            </button>

            <div className="text-xs font-mono text-slate-400 px-2 py-1 bg-slate-900 border border-slate-800 rounded-md">
              Frame <strong className="text-indigo-400 font-bold">{currentFrame}</strong> /{' '}
              {totalFrames}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
