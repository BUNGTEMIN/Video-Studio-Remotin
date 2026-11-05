import React, { useState } from 'react';
import { Layers, Activity, ChevronRight, Info } from 'lucide-react';
import type { VideoBrief, SequenceBlock } from '../../types/remotion';
import { calculateSequenceBlocks, sampleSpringCurve } from '../../utils/remotionMath';

interface SequenceTimelineProps {
  brief: VideoBrief;
  currentFrame: number;
  onSeek: (frame: number) => void;
}

export const SequenceTimeline: React.FC<SequenceTimelineProps> = ({
  brief,
  currentFrame,
  onSeek,
}) => {
  const [showSpringGraph, setShowSpringGraph] = useState(false);
  const totalFrames = Math.round(brief.durationSeconds * brief.fps);
  const sequences = calculateSequenceBlocks(totalFrames);
  const springSamples = sampleSpringCurve(24);

  // Find active sequence
  const activeSequence = sequences.find(
    (seq) =>
      currentFrame >= seq.startFrame &&
      currentFrame < seq.startFrame + seq.durationInFrames
  ) || sequences[sequences.length - 1];

  const playheadPercent = (currentFrame / Math.max(1, totalFrames - 1)) * 100;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Remotion Sequence Inspector & Timeline
          </h3>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
            {sequences.length} Sequences • {totalFrames} Frames
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowSpringGraph(!showSpringGraph)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
            showSpringGraph
              ? 'bg-indigo-950 border-indigo-700 text-indigo-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Spring Curve Visualizer</span>
        </button>
      </div>

      {/* Interactive Sequence Track Bar */}
      <div className="relative pt-6 pb-2">
        {/* Playhead marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none transition-all duration-75 flex flex-col items-center"
          style={{ left: `${playheadPercent}%` }}
        >
          <div className="w-3 h-3 bg-rose-500 rotate-45 -mt-1 shadow-md shadow-rose-500/50" />
          <div className="mt-auto mb-0 bg-rose-500 text-[10px] font-mono text-white px-1 rounded-sm shadow">
            {currentFrame}f
          </div>
        </div>

        {/* Sequence Blocks Container */}
        <div className="flex h-14 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-1 gap-1 relative">
          {sequences.map((seq) => {
            const widthPct = (seq.durationInFrames / totalFrames) * 100;
            const isActive = activeSequence.id === seq.id;

            return (
              <button
                key={seq.id}
                type="button"
                onClick={() => {
                  // Jump slightly into the sequence so the spring animation is fully visible
                  const targetFrame = seq.startFrame + Math.min(20, Math.floor(seq.durationInFrames / 2));
                  onSeek(targetFrame);
                }}
                title={`Click to jump to ${seq.name}`}
                style={{ width: `${widthPct}%` }}
                className={`relative h-full rounded-lg transition-all text-left p-2 flex flex-col justify-between overflow-hidden cursor-pointer group ${
                  isActive
                    ? 'ring-2 ring-white/80 shadow-lg scale-[1.01] z-10'
                    : 'opacity-75 hover:opacity-100 hover:scale-[1.005]'
                }`}
              >
                {/* Background color tint */}
                <div
                  className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{ backgroundColor: seq.color }}
                />
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: seq.color }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white truncate pr-1">
                    {seq.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-300 bg-black/40 px-1 rounded">
                    {seq.durationInFrames}f
                  </span>
                </div>

                <div className="relative z-10 text-[9px] font-mono text-slate-400">
                  [{seq.startFrame} .. {seq.startFrame + seq.durationInFrames}]
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Sequence Details Card */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: activeSequence.color }}
          />
          <div>
            <span className="font-semibold text-slate-200">
              Active: {activeSequence.name}
            </span>
            <span className="text-slate-400 ml-2">
              — {activeSequence.description}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span>
            Start: <strong className="text-slate-200">{activeSequence.startFrame}f</strong>
          </span>
          <span>•</span>
          <span>
            Duration:{' '}
            <strong className="text-slate-200">
              {activeSequence.durationInFrames}f ({(activeSequence.durationInFrames / brief.fps).toFixed(1)}s)
            </strong>
          </span>
        </div>
      </div>

      {/* Spring Curve Visualizer Drawer */}
      {showSpringGraph && (
        <div className="bg-slate-950 border border-indigo-950/80 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-indigo-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Remotion Hook: <code className="bg-indigo-900/50 px-1 py-0.5 rounded text-indigo-200">spring(&#123; frame, fps, config: &#123; damping: 12, stiffness: 120 &#125; &#125;)</code>
            </span>
            <span className="text-slate-400">Harmonic oscillation curve</span>
          </div>

          <div className="h-16 flex items-end gap-1 pt-2 border-b border-slate-800 px-2">
            {springSamples.map((val, idx) => {
              const heightPct = Math.min(100, Math.max(10, val * 70));
              return (
                <div
                  key={idx}
                  title={`Step ${idx}: ${val}`}
                  style={{ height: `${heightPct}%` }}
                  className="flex-1 bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-sm hover:brightness-125 transition-all"
                />
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Animasi Remotion dibangun di atas fungsi matematika deterministik per-frame. Nilai spring selalu identik di frame yang sama, memastikan hasil render video 100% konsisten antar thread CPU/GPU.
          </p>
        </div>
      )}
    </div>
  );
};
