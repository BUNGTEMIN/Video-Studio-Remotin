import React from 'react';
import {
  Music,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Sliders,
  Check,
  Disc3,
  Play,
  Square,
} from 'lucide-react';
import type { AudioTrackConfig } from '../../types/remotion';
import { audioEngine } from '../../utils/audioSynth';

export const BGM_TRACKS: Array<{
  id: string;
  name: string;
  bpm: number;
  genre: string;
  description: string;
  energy: 'High' | 'Medium' | 'Chill';
}> = [
  {
    id: 'track-tech-kinetic',
    name: 'Tech Kinetic Drive',
    bpm: 128,
    genre: 'Electronic / Synth',
    description: 'Ritem modern berenergi tinggi untuk video SaaS dan peluncuran produk tech.',
    energy: 'High',
  },
  {
    id: 'track-saas-upbeat',
    name: 'SaaS Launchpad Upbeat',
    bpm: 124,
    genre: 'Future Bass / Pop',
    description: 'Irama cerah, positif, dan optimis untuk demo fitur dan tutorial.',
    energy: 'Medium',
  },
  {
    id: 'track-cyber-synth',
    name: 'Cyberpunk Synthwave',
    bpm: 130,
    genre: 'Dark Synth / Neon',
    description: 'Bass analog menghentak dan aksen neon glitch futuristik.',
    energy: 'High',
  },
  {
    id: 'track-lofi-ambient',
    name: 'Lo-Fi Chill & Focus',
    bpm: 85,
    genre: 'Lo-Fi / Hip-Hop',
    description: 'Ketukan santai, hangat, dan estetis cocok untuk kutipan dan studi kasus.',
    energy: 'Chill',
  },
  {
    id: 'track-epic-cinematic',
    name: 'Epic Impact Trailer',
    bpm: 115,
    genre: 'Cinematic Orchestral',
    description: 'Klimaks dramatis untuk metrik pertumbuhan dan pencapaian bisnis raksasa.',
    energy: 'High',
  },
  {
    id: 'track-muted',
    name: 'Tanpa BGM (Mute / Hening)',
    bpm: 0,
    genre: 'Silent',
    description: 'Video hening tanpa latar suara atau siap diisi voiceover eksternal.',
    energy: 'Chill',
  },
];

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioConfig: AudioTrackConfig;
  onUpdateAudioConfig: (config: AudioTrackConfig) => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  audioConfig,
  onUpdateAudioConfig,
}) => {
  const [isPlayingTest, setIsPlayingTest] = React.useState(false);

  if (!isOpen) return null;

  const handleToggleMute = () => {
    const updated = { ...audioConfig, isMuted: !audioConfig.isMuted };
    onUpdateAudioConfig(updated);
    audioEngine.setConfig(updated);
  };

  const handleVolumeChange = (newVol: number) => {
    const updated = { ...audioConfig, volume: newVol };
    onUpdateAudioConfig(updated);
    audioEngine.setConfig(updated);
  };

  const handleSelectTrack = (track: (typeof BGM_TRACKS)[0]) => {
    const isMuteTrack = track.id === 'track-muted';
    const updated: AudioTrackConfig = {
      ...audioConfig,
      id: track.id,
      name: track.name,
      bpm: track.bpm,
      genre: track.genre,
      isMuted: isMuteTrack ? true : audioConfig.isMuted,
    };
    onUpdateAudioConfig(updated);
    audioEngine.setConfig(updated);
  };

  const handleToggleSfx = () => {
    const updated = { ...audioConfig, sfxTransitions: !audioConfig.sfxTransitions };
    onUpdateAudioConfig(updated);
    audioEngine.setConfig(updated);
  };

  const handleToggleTestPlay = () => {
    if (isPlayingTest) {
      audioEngine.stop();
      setIsPlayingTest(false);
    } else {
      audioEngine.setConfig({
        bpm: audioConfig.bpm || 128,
        volume: audioConfig.volume,
        isMuted: false,
      });
      audioEngine.start();
      setIsPlayingTest(true);
    }
  };

  const handleTestSfxWhoosh = () => {
    audioEngine.playTransitionWhoosh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161822] border border-[#2b2f42] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#232638] flex items-center justify-between bg-[#13141e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Pengaturan Audio & Musik Latar (A1)
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {audioConfig.isMuted ? 'Muted' : `${audioConfig.bpm} BPM`}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pilih BGM, atur volume, dan efek suara transisi (SFX) otomatis.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isPlayingTest) audioEngine.stop();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Audio Controls Bar */}
          <div className="p-4 rounded-xl bg-[#0f1118] border border-[#232738] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Master Volume BGM
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    audioConfig.isMuted
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {audioConfig.isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Audio Muted</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio Aktif</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="flex items-center gap-3">
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                disabled={audioConfig.isMuted}
                value={audioConfig.volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                className="flex-1 h-1.5 bg-[#252838] rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-40"
              />
              <span className="text-xs font-mono font-bold text-slate-200 w-10 text-right">
                {audioConfig.isMuted ? '0%' : `${audioConfig.volume}%`}
              </span>
            </div>

            {/* Test Play button & SFX Whoosh */}
            <div className="pt-2 border-t border-[#1e2230] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleToggleTestPlay}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isPlayingTest
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-[#1e2232] text-slate-200 hover:bg-[#2b3045] border border-white/10'
                }`}
              >
                {isPlayingTest ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>Hentikan Pratinjau Beat</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Uji Dengarkan Beat ({audioConfig.bpm} BPM)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestSfxWhoosh}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/50 flex items-center gap-1"
                title="Putar efek transisi whoosh"
              >
                <Sparkles className="w-3 h-3" />
                <span>Test Whoosh SFX</span>
              </button>
            </div>
          </div>

          {/* SFX Transition Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#11131c] border border-[#232738]">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                SFX Transisi Otomatis
              </div>
              <p className="text-[11px] text-slate-400">
                Bunyikan efek suara whoosh lembut setiap kali video berpindah scene di timeline.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleSfx}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                audioConfig.sfxTransitions ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  audioConfig.sfxTransitions ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* BGM Track Library */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Pilihan Lagu BGM (Background Music)
            </label>
            <div className="space-y-2">
              {BGM_TRACKS.map((track) => {
                const isSelected = audioConfig.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500/80 ring-1 ring-emerald-500/30'
                        : 'bg-[#11131c] border-[#222533] hover:border-slate-600 hover:bg-[#161925]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-[#1e2230] text-slate-400'
                        }`}
                      >
                        <Disc3 className={`w-4 h-4 ${isSelected ? 'animate-spin' : ''}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{track.name}</span>
                          {track.bpm > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-300 border border-white/10">
                              {track.bpm} BPM
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {track.genre}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{track.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#232638] bg-[#12131d] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Audio disinkronkan otomatis pada saat video diekspor ke MP4.
          </span>
          <button
            type="button"
            onClick={() => {
              if (isPlayingTest) audioEngine.stop();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
          >
            Selesai & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
