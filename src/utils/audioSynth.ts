/**
 * Web Audio Synthesizer for CapCut Remotion Studio
 * Provides real-time synthesized beats and transition sound effects during video preview.
 */

class RemotionAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private intervalId: number | null = null;
  private bpm: number = 128;
  private volume: number = 0.85;
  private isMuted: boolean = false;
  private beatStep: number = 0;
  private sfxEnabled: boolean = true;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setConfig(config: { bpm?: number; volume?: number; isMuted?: boolean; sfxTransitions?: boolean }) {
    if (config.bpm !== undefined) this.bpm = Math.max(60, Math.min(180, config.bpm));
    if (config.volume !== undefined) this.volume = Math.max(0, Math.min(1, config.volume / 100));
    if (config.isMuted !== undefined) this.isMuted = config.isMuted;
    if (config.sfxTransitions !== undefined) this.sfxEnabled = config.sfxTransitions;
  }

  public start() {
    if (this.isRunning) return;
    this.initContext();
    this.isRunning = true;

    const msPerBeat = (60 / this.bpm) * 1000 * 0.5; // Eighth note pulse
    this.intervalId = window.setInterval(() => {
      if (this.isMuted || this.volume <= 0) return;
      this.playSynthBeat(this.beatStep);
      this.beatStep = (this.beatStep + 1) % 16;
    }, msPerBeat);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.beatStep = 0;
  }

  private playSynthBeat(step: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.22, now);
    masterGain.connect(this.ctx.destination);

    // Kick on steps 0, 4, 8, 12 (4-on-the-floor)
    if (step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.15);
    }

    // Hi-hat / Snap on offbeats (2, 6, 10, 14)
    if (step % 2 === 1) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(3200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
    }

    // Gentle chord pluck on bar starts
    if (step === 0 || step === 8) {
      const chords = step === 0 ? [220, 277.18, 329.63] : [196, 246.94, 293.66];
      chords.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.36);
      });
    }
  }

  public playTransitionWhoosh() {
    if (this.isMuted || !this.sfxEnabled || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.28);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(2500, now + 0.14);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.3);

    gain.gain.setValueAtTime(this.volume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }
}

export const audioEngine = new RemotionAudioEngine();
