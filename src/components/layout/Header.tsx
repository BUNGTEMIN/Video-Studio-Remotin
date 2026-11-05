import React, { useState } from 'react';
import { Video, Sparkles, BookOpen, Layers, Terminal, X, Check } from 'lucide-react';

export const Header: React.FC = () => {
  const [showDocsModal, setShowDocsModal] = useState(false);

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">
                  Remotion Architect Studio
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v4.0 Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Arsitek Video Programmer React • Programmatic Video Generation
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowDocsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Standar Arsitektur Remotion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Standar Arsitektur Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowDocsModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Prinsip Arsitektur Video Programmer Remotion
                </h3>
                <p className="text-xs text-slate-400">
                  Pedoman teknis pembuatan video berbasis React + Remotion
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-indigo-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  1. Animasi Sinkron Frame (`useCurrentFrame` & `spring`)
                </h4>
                <p className="text-slate-400">
                  Hindari CSS keyframes atau transition manual karena Remotion merender frame per frame secara deterministik (headless Chromium). Gunakan hook <code className="text-indigo-300">useCurrentFrame()</code>, <code className="text-indigo-300">interpolate()</code>, dan <code className="text-indigo-300">spring()</code> dari paket resmi <code className="text-indigo-300">remotion</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-indigo-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  2. Struktur Komposisi Modular & Presisi Frame
                </h4>
                <p className="text-slate-400">
                  Bagi alur cerita video menggunakan komponen <code className="text-indigo-300">&lt;Sequence from=&#123;start&#125; durationInFrames=&#123;dur&#125;&gt;</code>. Tentukan resolusi (1920x1080 horizontal atau 1080x1920 9:16 vertikal) serta frame rate (30 fps) yang konsisten.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-indigo-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  3. Skema Props Validasi Zod
                </h4>
                <p className="text-slate-400">
                  Gunakan skema Zod pada <code className="text-indigo-300">&lt;Composition schema=&#123;videoPropsSchema&#125;&gt;</code> untuk memastikan setiap props (teks, warna hex, metrik, daftar fitur) aman divalidasi baik saat preview di Remotion Studio maupun saat batch render melalui CLI.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-indigo-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  4. CLI Rendering & CI/CD Cloud
                </h4>
                <p className="text-slate-400">
                  Remotion dapat di-render langsung ke file MP4 melalui CLI:
                  <br />
                  <code className="text-emerald-400 font-mono text-[11px] block mt-1 bg-black/60 p-2 rounded">
                    npx remotion render src/index.ts my-video out/video.mp4
                  </code>
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
