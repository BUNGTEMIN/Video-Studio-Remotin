import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Film,
  CheckCircle2,
  RotateCcw,
  Cloud,
  Send,
  Database,
  ExternalLink,
  Cpu,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { VideoBrief } from '../../types/remotion';
import {
  getResolutionForFormat,
  secondsToFrames,
  estimateVideoFileSize,
  getRenderPhase,
} from '../../utils/remotionMath';
import {
  checkDiaryEngineHealth,
  convertBriefToDiaryProject,
  convertBriefToOlipRemotionProject,
  saveProjectToDiaryStudio,
  requestDiaryCloudRender,
  requestOlipRemotionRender,
  DIARY_CLOUD_RUN_URL,
  type DiaryEngineHealth,
  type DiaryRenderResult,
} from '../../services/diaryRenderService';
import { Tooltip } from '../common/Tooltip';

interface CapCutExportModalProps {
  brief: VideoBrief;
  isOpen: boolean;
  onClose: () => void;
}

type ExportMode = 'cloud-run' | 'browser-sim';

export const CapCutExportModal: React.FC<CapCutExportModalProps> = ({
  brief,
  isOpen,
  onClose,
}) => {
  const [exportMode, setExportMode] = useState<ExportMode>('cloud-run');
  const [engineHealth, setEngineHealth] = useState<DiaryEngineHealth | null>(null);
  const [sendTelegram, setSendTelegram] = useState(true);
  const [saveToDiaryDb, setSaveToDiaryDb] = useState(true);

  // Browser simulation state
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cloud Run state
  const [cloudEngineType, setCloudEngineType] = useState<'remotion-1to1' | 'diary-paper'>('remotion-1to1');
  const [isCloudRendering, setIsCloudRendering] = useState(false);
  const [cloudResult, setCloudResult] = useState<DiaryRenderResult | null>(null);
  const [dbSavedStatus, setDbSavedStatus] = useState<string | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);

  const resolution = getResolutionForFormat(brief.format);
  const totalFrames = secondsToFrames(brief.durationSeconds, brief.fps);
  const estimatedSize = estimateVideoFileSize(brief.durationSeconds, brief.format);

  const slugName =
    brief.topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'capcut-remotion-video';

  // Check Cloud Run health on modal open
  useEffect(() => {
    if (isOpen) {
      checkDiaryEngineHealth().then((health) => setEngineHealth(health));
    }
  }, [isOpen]);

  // Clean up
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (downloadUrl && downloadUrl.startsWith('blob:')) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const startBrowserSimExport = () => {
    setIsExporting(true);
    setProgress(0);
    setDownloadUrl(null);

    if (timerRef.current) clearInterval(timerRef.current);

    let cur = 0;
    timerRef.current = setInterval(() => {
      cur += Math.floor(Math.random() * 6) + 4;
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
    }, 80);
  };

  const handleStartCloudRender = async () => {
    setIsCloudRendering(true);
    setCloudError(null);
    setCloudResult(null);
    setDbSavedStatus(null);

    // 1. Optionally save to Diary projects database
    if (saveToDiaryDb) {
      try {
        const diaryPayload = convertBriefToDiaryProject(brief);
        const dbRes = await saveProjectToDiaryStudio(diaryPayload);
        if (dbRes.success) {
          setDbSavedStatus(`Tersimpan di database Diary (ID #${dbRes.id})`);
        }
      } catch (e: any) {
        console.warn('Gagal sinkron database diary:', e);
      }
    }

    // 2. Dispatch render request to Cloud Run Jakarta (1:1 Remotion Native vs Diary)
    try {
      let renderRes: DiaryRenderResult;
      if (cloudEngineType === 'remotion-1to1') {
        const remotionProject = convertBriefToOlipRemotionProject(brief);
        renderRes = await requestOlipRemotionRender(remotionProject, {
          sendTelegram,
          chatId: '560232533', // Aa Baim Telegram ID
        });
      } else {
        const diaryPayload = convertBriefToDiaryProject(brief);
        renderRes = await requestDiaryCloudRender(diaryPayload, {
          sendTelegram,
          chatId: '560232533',
        });
      }

      setCloudResult(renderRes);
      if (!renderRes.success) {
        setCloudError(renderRes.message || 'Render gagal di Cloud Run');
      }
    } catch (e: any) {
      setCloudError(e.message || 'Koneksi ke Cloud Run Jakarta terputus');
    } finally {
      setIsCloudRendering(false);
    }
  };

  if (!isOpen) return null;

  const currentFrameStitched = Math.round((progress / 100) * totalFrames);
  const phaseInfo = getRenderPhase(progress);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#161720] border border-[#2b2f3d] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative flex flex-col gap-3.5 sm:gap-4 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252834] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-teal-400 to-indigo-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
              <Film className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Ekspor Video Remotion</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  CapCut • Olip • Diary
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Pusat Render Headless Remotion & FFmpeg
              </p>
            </div>
          </div>

          <Tooltip content="Tutup Jendela Ekspor">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#202330] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>

        {/* Engine Mode Tabs Switcher */}
        <div className="flex bg-[#111218] p-1 rounded-xl border border-[#262836]">
          <button
            type="button"
            onClick={() => setExportMode('cloud-run')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              exportMode === 'cloud-run'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Pusat Render Cloud Run (Jakarta)</span>
          </button>

          <button
            type="button"
            onClick={() => setExportMode('browser-sim')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              exportMode === 'browser-sim'
                ? 'bg-[#222634] text-cyan-400 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Simulasi Render Browser</span>
          </button>
        </div>

        {/* TAB 1: PUSAT RENDER CLOUD RUN JAKARTA */}
        {exportMode === 'cloud-run' && (
          <div className="space-y-3.5 text-xs">
            {/* Live Cloud Run Status Pill */}
            <div className="p-3 rounded-xl bg-[#12131b] border border-[#262a39] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    engineHealth?.online ? 'bg-emerald-400 shadow-md shadow-emerald-400/80 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>Google Cloud Run Render Engine</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-normal">
                      (asia-southeast2)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {engineHealth?.online
                      ? 'Layanan Siap • Free Tier Scale-to-Zero • Chromium + FFmpeg'
                      : 'Memeriksa koneksi ke server Cloud Run...'}
                  </div>
                </div>
              </div>

              <Tooltip content="Buka Link Server Live Cloud Run">
                <a
                  href={DIARY_CLOUD_RUN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Tooltip>
            </div>

            {/* Engine Type Selector (Remotion 1:1 vs Diary Paper) */}
            <div className="bg-[#10121a] p-1.5 rounded-xl border border-[#262a39] space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Pilih Mesin Render Cloud Run:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setCloudEngineType('remotion-1to1')}
                  className={`p-2 rounded-lg text-left transition-all border ${
                    cloudEngineType === 'remotion-1to1'
                      ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-sm'
                      : 'bg-[#151722] border-[#252838] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-[11px] flex items-center gap-1.5 text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Remotion Native 1:1</span>
                    <span className="text-[9px] bg-cyan-900/80 px-1 py-0.2 rounded text-cyan-200">Aktual Timeline</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    Render persis 1:1 sesuai adegan timeline (Hook, Metrik, Fitur, Glitch, Galeri, dll.)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCloudEngineType('diary-paper')}
                  className={`p-2 rounded-lg text-left transition-all border ${
                    cloudEngineType === 'diary-paper'
                      ? 'bg-amber-950/70 border-amber-400 text-white shadow-sm'
                      : 'bg-[#151722] border-[#252838] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-[11px] flex items-center gap-1.5 text-amber-300">
                    <Film className="w-3.5 h-3.5" />
                    <span>Catatan Diary Kertas</span>
                    <span className="text-[9px] bg-amber-900/80 px-1 py-0.2 rounded text-amber-200">Buku Catatan</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    Render tulisan tangan animasi di atas kertas bergaris meja kayu.
                  </p>
                </button>
              </div>
            </div>

            {/* Specifications Card */}
            <div className="grid grid-cols-2 gap-2 bg-[#12131b] border border-[#262a39] rounded-xl p-3 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Judul Proyek:</span>
                <span className="font-bold text-slate-200 truncate block">{brief.topic}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Resolusi & FPS:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {resolution.width}x{resolution.height} • {brief.fps} fps
                </span>
              </div>
              <div className="col-span-2 bg-[#161824] p-2 rounded-lg border border-[#262939]">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Urutan Adegan Actual Timeline ({brief.scenes?.length || 0} Scene):</span>
                  <span className="font-bold text-cyan-400">{brief.durationSeconds} Detik Total</span>
                </div>
                <div className="text-[10px] text-slate-300 font-mono truncate">
                  {brief.scenes && brief.scenes.length > 0
                    ? brief.scenes
                        .map((s, i) => `${i + 1}. ${s.name} (${Math.round((s.durationInFrames || 90) / brief.fps)}s)`)
                        .join(' ➔ ')
                    : '1. Default Scene'}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Pusat Render Aktif:</span>
                <span className="font-semibold text-emerald-400">
                  {cloudEngineType === 'remotion-1to1'
                    ? 'Remotion Native (Olip / Cloud Run)'
                    : 'Python PIL Diary Motion'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Fidelity:</span>
                <span className="font-semibold text-cyan-400">
                  {cloudEngineType === 'remotion-1to1' ? '1:1 Pixel-Accurate' : 'Handwritten Journal'}
                </span>
              </div>
            </div>

            {/* Synergy Checkboxes */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-[#14151f] border border-[#242735] hover:border-cyan-500/40 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendTelegram}
                  onChange={(e) => setSendTelegram(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-400 bg-slate-900 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Send className="w-3 h-3 text-cyan-400" />
                    <span>Kirim Video MP4 Hasil Render ke Telegram Aa Baim</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Otomatis dikirim via Bot Telegram Diary Motion Studio setelah render selesai.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-[#14151f] border border-[#242735] hover:border-cyan-500/40 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToDiaryDb}
                  onChange={(e) => setSaveToDiaryDb(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-400 bg-slate-900 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span>Simpan ke Database Diary Studio (diary_projects.db)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Proyek ini akan muncul di dashboard Diary & Olip Video Studio untuk diedit kembali.
                  </div>
                </div>
              </label>
            </div>

            {/* Notification & Status Messages */}
            {dbSavedStatus && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{dbSavedStatus}</span>
              </div>
            )}

            {cloudError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-700/60 text-rose-300 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>{cloudError}</span>
              </div>
            )}

            {cloudResult && cloudResult.success && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border border-emerald-600/70 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Video Sukses Dirender di Cloud Run Jakarta!</span>
                  </div>
                  {cloudResult.downloadUrl && (
                    <a
                      href={cloudResult.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={cloudResult.file || 'video.mp4'}
                      className="px-3 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      <Download className="w-3 h-3" />
                      <span>Unduh MP4</span>
                    </a>
                  )}
                </div>

                {/* Inline Video Player Preview */}
                {cloudResult.downloadUrl && (
                  <div className="rounded-lg overflow-hidden border border-emerald-700/50 bg-black/80 flex flex-col items-center justify-center">
                    <video
                      src={cloudResult.downloadUrl}
                      controls
                      autoPlay={false}
                      className="max-h-[220px] w-auto max-w-full rounded shadow-lg"
                    />
                    <div className="w-full bg-[#0d0e14] px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-emerald-900/40">
                      <span>Stream: Cloud Run Headless Engine</span>
                      <a
                        href={cloudResult.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>Buka Tab Baru</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-300">
                  {cloudResult.message}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400 pt-1 border-t border-emerald-900/40">
                  {cloudResult.file && (
                    <span>
                      File: <strong className="text-cyan-300">{cloudResult.file}</strong>
                    </span>
                  )}
                  <span>
                    Ukuran: <strong className="text-emerald-300">~{cloudResult.sizeMb || '3.0'} MB</strong>
                  </span>
                  {sendTelegram && (
                    <span className="text-cyan-400 font-sans flex items-center gap-1">
                      <Send className="w-2.5 h-2.5" /> Terkirim ke Telegram Aa Baim
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#252834]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#232633] hover:bg-[#2d3142] text-slate-300 text-xs font-semibold transition-colors"
              >
                Tutup
              </button>

              <button
                type="button"
                disabled={isCloudRendering}
                onClick={handleStartCloudRender}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCloudRendering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Sedang Merender di Cloud Run...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>Kirim & Render di Cloud Run</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SIMULASI RENDER BROWSER */}
        {exportMode === 'browser-sim' && (
          <div className="space-y-4 text-xs">
            {!isExporting && progress === 0 && (
              <div className="space-y-3.5">
                <div className="bg-[#121319] border border-[#262836] rounded-xl p-3.5 space-y-2">
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
                    <span className="text-slate-400">Frame Rate:</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {brief.fps} fps
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
                    onClick={startBrowserSimExport}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Mulai Simulasi Render</span>
                  </button>
                </div>
              </div>
            )}

            {(isExporting || progress > 0) && (
              <div className="space-y-4">
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

                {!isExporting && downloadUrl && (
                  <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex flex-col gap-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-xs">
                          {slugName}.mp4
                        </div>
                        <div className="text-[11px] text-emerald-300 font-mono mt-0.5">
                          1080p • {brief.fps} fps • {estimatedSize}
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
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#292c3a]">
                  <button
                    type="button"
                    onClick={startBrowserSimExport}
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
        )}
      </div>
    </div>
  );
};
