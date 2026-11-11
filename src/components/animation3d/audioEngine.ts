/**
 * Procedural Web Audio synthesizer for cinematic sound effects
 * Zero external mp3 dependencies - generated purely via Web Audio API oscillators
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(enable?: boolean): boolean {
    this.enabled = enable !== undefined ? enable : !this.enabled;
    if (this.enabled) {
      this.init();
      this.playChirp(880, 0.08);
    }
    return this.enabled;
  }

  // Chapter transition whoosh / sonic sweep
  public playWhoosh(speed = 1.0) {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.3 / speed);
      filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.7 / speed);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.25 / speed);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.7 / speed);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.75 / speed);
    } catch {
      // Audio safety fallback
    }
  }

  // Futuristic digital telemetry pulse / cyber click
  public playDataPulse() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200 + Math.random() * 800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch {
      // Audio safety fallback
    }
  }

  // Sub-bass impact / cinematic thud on scene entrance
  public playSubBass() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(42, this.ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.25);
    } catch {
      // Audio safety fallback
    }
  }

  // Grand Logo Reveal futuristic chord swell
  public playFinaleChime() {
    if (!this.enabled || !this.ctx) return;
    try {
      const freqs = [130.81, 196.00, 261.63, 392.00, 523.25]; // C3, G3, C4, G4, C5 cinematic harmony
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq * 0.98, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq, this.ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08 / (idx + 1), this.ctx.currentTime + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.05);
        osc.stop(this.ctx.currentTime + 3.2);
      });
    } catch {
      // Audio safety fallback
    }
  }

  private playChirp(freq: number, duration: number) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio safety fallback
    }
  }
}

export const soundFx = new AudioEngine();
