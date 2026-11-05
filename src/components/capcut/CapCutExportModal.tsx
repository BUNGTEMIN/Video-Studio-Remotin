import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Film,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Settings2,
  FolderDown,
  Terminal,
} from 'lucide-react';
import type { VideoBrief } from '../../types/remotion';
import {
  getResolutionForFormat,
  secondsToFrames,
  estimateVideoFileSize,
  getRenderPhase,
} from '../../utils/remotionMath';

interface CapCutExportModalProps {
  brief: VideoBrief;
  isOpen: boolean;
  onClose: () => void;
}

export const CapCutExportModal: React.FC<CapCutExportModalProps> = ({
  brief,
  isOpen,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resolution = getResolutionForFormat(brief.format);
  const totalFrames = secondsToFrames(brief.durationSeconds, brief.fps);
  const estimatedSize = estimateVideoFileSize(brief.durationSeconds, brief.format);

  const slugName =
    brief.topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'capcut-remotion-video';

  const startExport = () => {
    setIsExporting(true);
    setProgress(0);
    setDownloadUrl(null);

    if (timerRef.current) clearInterval(timerRef.current);

    let cur = 0;
    timerRef.current = setInterval(() => {
      cur += Math.floor(Math.random() * 5) + 3;
      if (cur >= 100) {
        cur = 100;
        setProgress(100);
        setIsExporting(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const dummyContent = `ftypisom\0\0\0\0isomiso2avc1mp41\0\0\0\x08free${brief.topic} CapCut Remotion Engine Output (${resolution.width}x${resolution.height} @ ${brief.fps}fps)`;
        const dummyBlob = new Blob([dummyContent], { type: 'video/mp4' });
        const url = URL.createObjectURL(dummyBlob);
        setDownloadUrl(url);
      } else {
        setProgress(cur);
      }
    }, 85);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  if (!isOpen) return null;

  const currentFrameStitched = Math.round((progress / 100) * totalFrames);
  const phaseInfo = getRenderPhase(progress);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#181a22] border border-[#2e3344] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col gap-5 text-slate-200">
        {/* Header like CapCut Desktop Export Modal */}
        <div className="flex items-center justify-between border-b border-[#292c3a] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-teal-400 flex items-center justify-center text-slate-950 font-bold">
              <Film className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Ekspor Video CapCut Remotion
              </h3>
              <p className="text-[11px] text-slate-400">
                Penyandian MP4 H.264 • Headless Engine
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Settings Summary (Before or During Export) */}
        {!isExporting && progress === 0 && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#121319] border border-[#262836] rounded-xl p-3 space-y-2.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Nama File:</span>
                <span className="font-mono text-cyan-400 font-bold truncate max-w-[200px]">
                  {slugName}.mp4
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Resolusi:</span>
                <span className="font-mono font-semibold text-slate-200">
                  {resolution.width}x{resolution.height} ({brief.format})
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Kecepatan Frame:</span>
                <span className="font-mono font-semibold text-slate-200">
                  {brief.fps} fps
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Format & Codec:</span>
                <span className="font-mono font-semibold text-slate-200">
                  MP4 (H.264 / AAC)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Estimasi Ukuran:</span>
                <span className="font-mono font-bold text-emerald-400">
                  ~{estimatedSize}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#232633] hover:bg-[#2d3142] text-slate-300 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={startExport}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Mulai Ekspor</span>
              </button>
            </div>
          </div>
        )}

        {/* In-Progress or Completed View */}
        {(isExporting || progress > 0) && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#121319] border border-[#262836] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isExporting ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="font-bold text-slate-200">
                    {phaseInfo.title}
                  </span>
                </div>
                <span className="font-mono text-cyan-400 font-extrabold text-sm">
                  {progress}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-[#1e202b] h-3 rounded-full overflow-hidden p-0.5 border border-[#2b2e3e]">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 rounded-full transition-all duration-100 shadow-md shadow-cyan-500/50"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>
                  Frame: <strong className="text-slate-200">{currentFrameStitched}</strong> / {totalFrames}
                </span>
                <span>
                  Durasi: <strong className="text-slate-200">{brief.durationSeconds}s</strong>
                </span>
                <span>
                  Ukuran: <strong className="text-slate-200">{estimatedSize}</strong>
                </span>
              </div>

              <p className="text-[11px] text-slate-400 bg-[#161822] p-2.5 rounded-lg border border-[#252838] leading-relaxed">
                {phaseInfo.subtitle}
              </p>
            </div>

            {/* Completed Output Download Card */}
            {!isExporting && downloadUrl && (
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex flex-col gap-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">
                      {slugName}.mp4
                    </div>
                    <div className="text-[11px] text-emerald-300 font-mono mt-0.5">
                      1080p • {brief.fps} fps • {estimatedSize} • Siap Digunakan
                    </div>
                  </div>

                  <a
                    href={downloadUrl}
                    download={`${slugName}.mp4`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/30 transition-all transform active:scale-95"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Unduh MP4</span>
                  </a>
                </div>

                <div className="pt-2 border-t border-emerald-900/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Remotion CLI Production Command:
                  </span>
                  <code className="block bg-black/60 p-2 rounded text-[11px] font-mono text-cyan-300 select-all overflow-x-auto">
                    npx remotion render src/index.ts {slugName} out/{slugName}.mp4
                  </code>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#292c3a]">
              <button
                type="button"
                onClick={startExport}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#232633] hover:bg-[#2d3142] text-slate-300 text-xs font-semibold disabled:opacity-40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ekspor Ulang</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-[#232633] hover:bg-[#2d3142] text-slate-200 text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
