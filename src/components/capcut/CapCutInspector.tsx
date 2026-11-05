import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Maximize2,
  ExternalLink,
  Clock,
  Palette,
  Sliders,
} from 'lucide-react';
import type { VideoBrief, GeneratedCodeBundle, VideoScene } from '../../types/remotion';
import { calculateSequenceBlocks, getTotalFrames, getResolutionForFormat } from '../../utils/remotionMath';
import { SceneCustomizer } from './SceneCustomizer';

interface CapCutInspectorProps {
  brief: VideoBrief;
  currentFrame: number;
  bundle: GeneratedCodeBundle;
  isOpen: boolean;
  onClose: () => void;
  activeSceneId?: string;
  onUpdateScene?: (updatedScene: VideoScene) => void;
  onPopOut?: () => void;
  isFloating?: boolean;
}

type TabType = 'properties' | 'code';
type CodeTabKey = 'composition' | 'root' | 'schema' | 'guide';

export const CapCutInspector: React.FC<CapCutInspectorProps> = ({
  brief,
  currentFrame,
  bundle,
  isOpen,
  onClose,
  activeSceneId,
  onUpdateScene,
  onPopOut,
  isFloating = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('properties');
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTabKey>('composition');
  const [copied, setCopied] = useState(false);

  const totalFrames = getTotalFrames(brief.scenes, brief.durationSeconds, brief.fps);
  const sequences = calculateSequenceBlocks(totalFrames, brief.scenes);
  const resolution = getResolutionForFormat(brief.format);

  // Active scene determination
  const activeSceneIndex = brief.scenes?.findIndex((s) => s.id === activeSceneId);
  const activeScene: VideoScene | undefined =
    activeSceneIndex !== undefined && activeSceneIndex >= 0 && brief.scenes
      ? brief.scenes[activeSceneIndex]
      : brief.scenes?.[0];

  const activeSequence = sequences.find((seq) =>
    activeSceneId ? seq.id === activeSceneId : (currentFrame >= seq.startFrame && currentFrame < seq.startFrame + seq.durationInFrames)
  ) || sequences[0];

  const getActiveCode = (): { code: string; filename: string } => {
    switch (activeCodeTab) {
      case 'composition':
        return { code: bundle.compositionCode, filename: 'src/Composition.tsx' };
      case 'root':
        return { code: bundle.rootCode, filename: 'src/Root.tsx' };
      case 'schema':
        return { code: bundle.schemaCode, filename: 'src/schema.ts' };
      case 'guide':
        return { code: bundle.instructionsMd, filename: 'PANDUAN_REMOTION.md' };
    }
  };

  const currentCodeObj = getActiveCode();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCodeObj.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentCodeObj.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentCodeObj.filename.split('/').pop() || 'file.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = currentCodeObj.code.split('\n');

  if (!isOpen) return null;

  return (
    <div className="w-full h-full bg-[#16171e] flex flex-col shrink-0 select-none overflow-hidden">
      {/* Inspector Top Tabs Header */}
      <div className="h-10 bg-[#14151b] border-b border-[#23252d] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('properties')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'properties'
                ? 'bg-[#252834] text-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kustomisasi Scene
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'code'
                ? 'bg-[#252834] text-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kode Remotion
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Pop out to floating modal toggle */}
          {onPopOut && !isFloating && (
            <button
              type="button"
              onClick={onPopOut}
              className="text-slate-400 hover:text-cyan-400 p-1 rounded hover:bg-[#252838] transition-colors"
              title="Buka sebagai Jendela Melayang / Modal (Undock)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {!isFloating && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-white p-1 text-xs"
              title="Tutup Inspector"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Tab View */}
      {activeTab === 'properties' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
          {activeScene && onUpdateScene ? (
            <SceneCustomizer
              scene={activeScene}
              onUpdateScene={onUpdateScene}
              sceneIndex={activeSceneIndex}
              totalScenes={brief.scenes?.length}
            />
          ) : (
            <div className="text-center p-6 text-slate-500">
              Pilih salah satu klip di timeline untuk mengedit teks dan template.
            </div>
          )}

          {/* Transform & Layout Specs */}
          <div className="bg-[#111217] border border-[#262936] rounded-xl p-3.5 space-y-3">
            <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Spesifikasi Remotion</span>
              <span className="text-[10px] font-mono text-cyan-400 font-normal">Deterministic</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#161820] p-2 rounded-lg border border-[#242735]">
                <span className="text-slate-400 block text-[10px]">Resolusi Komposisi:</span>
                <span className="font-mono font-bold text-slate-200">{resolution.width}x{resolution.height}</span>
              </div>
              <div className="bg-[#161820] p-2 rounded-lg border border-[#242735]">
                <span className="text-slate-400 block text-[10px]">Frame Rate:</span>
                <span className="font-mono font-bold text-slate-200">{brief.fps} fps</span>
              </div>
              <div className="bg-[#161820] p-2 rounded-lg border border-[#242735]">
                <span className="text-slate-400 block text-[10px]">Rentang Frame:</span>
                <span className="font-mono font-bold text-cyan-400">
                  [{activeSequence?.startFrame || 0} .. {(activeSequence?.startFrame || 0) + (activeSequence?.durationInFrames || 90)}]
                </span>
              </div>
              <div className="bg-[#161820] p-2 rounded-lg border border-[#242735]">
                <span className="text-slate-400 block text-[10px]">Transisi Keluar:</span>
                <span className="font-mono font-bold text-emerald-400 uppercase">
                  {activeScene?.transitionNext?.type || 'Fade'} ({activeScene?.transitionNext?.durationInFrames || 15}f)
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: REMOTION CODE VIEWER */
        <div className="flex-1 flex flex-col overflow-hidden p-3 gap-2.5">
          {/* Subtabs for Code Files */}
          <div className="flex items-center gap-1 bg-[#111217] p-1 rounded-lg border border-[#262936] overflow-x-auto text-[11px] shrink-0">
            <button
              type="button"
              onClick={() => setActiveCodeTab('composition')}
              className={`px-2 py-1 rounded font-medium transition-all shrink-0 ${
                activeCodeTab === 'composition' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Composition.tsx
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('root')}
              className={`px-2 py-1 rounded font-medium transition-all shrink-0 ${
                activeCodeTab === 'root' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Root.tsx
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('schema')}
              className={`px-2 py-1 rounded font-medium transition-all shrink-0 ${
                activeCodeTab === 'schema' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              schema.ts
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('guide')}
              className={`px-2 py-1 rounded font-medium transition-all shrink-0 ${
                activeCodeTab === 'guide' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              CLI
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between text-xs shrink-0">
            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">
              {currentCodeObj.filename}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#232733] hover:bg-[#2e3344] text-slate-200 text-[11px] font-semibold transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadFile}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#232733] hover:bg-[#2e3344] text-slate-200 text-[11px] font-semibold transition-colors"
                title="Unduh File"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="flex-1 rounded-xl border border-[#262936] bg-[#0e0f14] overflow-auto font-mono text-[11px] p-3 text-slate-200 select-text scrollbar-thin scrollbar-thumb-slate-800">
            <pre className="leading-relaxed">
              {lines.map((l, i) => (
                <div key={i} className="flex hover:bg-[#1a1c26]/60">
                  <span className="w-7 text-slate-600 text-right pr-2 select-none shrink-0 font-mono text-[10px]">
                    {i + 1}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap break-all">{l || ' '}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
