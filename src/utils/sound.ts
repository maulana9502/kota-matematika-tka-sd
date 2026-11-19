// Web Audio API synthesizer + ambient classroom backsound with Auto-Ducking + Indonesian SpeechSynthesis voice reader

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private muted: boolean = false;
  private musicEnabled: boolean = true;
  private musicTimer: number | null = null;
  private musicStep: number = 0;
  private unlocked: boolean = false;
  private ducked: boolean = false;

  constructor() {
    try {
      if (localStorage.getItem('kota_matematika_muted') === 'true') this.muted = true;
      if (localStorage.getItem('kota_matematika_music') === 'false') this.musicEnabled = false;
    } catch {
      // Ignore storage errors
    }
  }

  public unlock() {
    if (this.unlocked && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.ducked ? 0.2 : 1.0;
      this.musicGain.connect(this.ctx.destination);
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.unlocked = true;
    } catch {
      // Web Audio unavailable
    }
  }

  public setDucking(active: boolean) {
    this.ducked = active;
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const target = active ? 0.18 : 1.0;
    try {
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(target, now + (active ? 0.18 : 0.4));
    } catch {
      this.musicGain.gain.value = target;
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(m: boolean) {
    this.muted = m;
    try {
      localStorage.setItem('kota_matematika_muted', String(m));
    } catch {
      // Ignore
    }
    if (m) {
      this.stopMusic();
      voice.stop();
    }
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    try {
      localStorage.setItem('kota_matematika_music', String(enabled));
    } catch {
      // Ignore
    }
    if (!enabled) {
      this.stopMusic();
    } else if (!this.muted) {
      this.startMusic();
    }
  }

  public isMusicPlaying(): boolean {
    return this.musicTimer !== null;
  }

  public startMusic() {
    if (this.muted || !this.musicEnabled) return;
    this.unlock();
    if (!this.ctx || this.musicTimer !== null) return;

    // Calm & cheerful adventure instrumental marimba/kalimba melody in C major pentatonic
    const melody = [
      523.25, 659.25, 783.99, 659.25,
      587.33, 659.25, 523.25, 392.0,
      440.0, 523.25, 659.25, 523.25,
      587.33, 440.0, 392.0, 523.25
    ];
    const bass = [261.63, 261.63, 196.0, 196.0, 220.0, 220.0, 196.0, 261.63];

    const tick = () => {
      if (this.muted || !this.musicEnabled || !this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const idx = this.musicStep % melody.length;
      const freq = melody[idx];
      this.playMusicTone(freq, 0.42, 'sine', 0.03, 0);
      this.playMusicTone(freq * 2, 0.2, 'triangle', 0.007, 0.01);

      if (idx % 2 === 0) {
        const bFreq = bass[(idx / 2) % bass.length];
        this.playMusicTone(bFreq, 0.6, 'sine', 0.024, 0);
      }
      this.musicStep++;
    };

    tick();
    this.musicTimer = window.setInterval(tick, 480);
  }

  public stopMusic() {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playMusicTone(freq: number, duration: number, type: OscillatorType, volume: number, delay: number) {
    if (this.muted || !this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.14, delay = 0) {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public click() {
    this.playTone(540, 0.07, 'triangle', 0.1);
  }

  public pop() {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.09);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public ding() {
    this.playTone(880, 0.45, 'sine', 0.16, 0);
    this.playTone(1318.5, 0.55, 'sine', 0.1, 0.04);
    this.playTone(1760, 0.65, 'triangle', 0.06, 0.08);
  }

  public softWrong() {
    this.playTone(310, 0.16, 'sine', 0.1, 0);
    this.playTone(255, 0.24, 'sine', 0.09, 0.11);
  }

  public tear() {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.14;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 1.6;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  public clap() {
    this.playTone(523.25, 0.18, 'triangle', 0.12, 0);
    this.playTone(659.25, 0.18, 'triangle', 0.12, 0.08);
    this.playTone(783.99, 0.22, 'triangle', 0.12, 0.16);
    this.playTone(1046.5, 0.45, 'sine', 0.14, 0.24);

    if (this.muted || !this.ctx) return;
    for (let c = 0; c < 4; c++) {
      const delay = 0.06 * c;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.07);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1200 + c * 180;
      const g = this.ctx.createGain();
      g.gain.value = 0.08;
      src.connect(bp);
      bp.connect(g);
      g.connect(this.ctx.destination);
      src.start(this.ctx.currentTime + delay);
    }
  }

  public giggle() {
    this.playTone(520, 0.08, 'sine', 0.1, 0);
    this.playTone(680, 0.08, 'sine', 0.1, 0.08);
    this.playTone(820, 0.12, 'sine', 0.11, 0.16);
  }
}

class VoiceEngine {
  private enabled: boolean = true;
  private rate: number = 0.98;
  private duckTimeout: number | null = null;

  constructor() {
    try {
      if (localStorage.getItem('kota_matematika_voice') === 'false') this.enabled = false;
    } catch {
      // Ignore
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(v: boolean) {
    this.enabled = v;
    try {
      localStorage.setItem('kota_matematika_voice', String(v));
    } catch {
      // Ignore
    }
    if (!v) this.stop();
  }

  public getRate(): number {
    return this.rate;
  }

  public setRate(r: number) {
    this.rate = r;
  }

  public stop() {
    if (this.duckTimeout !== null) {
      window.clearTimeout(this.duckTimeout);
      this.duckTimeout = null;
    }
    sound.setDucking(false);
    if (!this.isSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }

  private cleanMathText(raw: string): string {
    return raw
      .replace(/Rp(\d+)\.(\d+),00/g, '$1 ribu $2 rupiah')
      .replace(/°/g, ' derajat')
      .replace(/×/g, ' kali ')
      .replace(/÷/g, ' dibagi ')
      .replace(/−/g, ' dikurangi ')
      .replace(/\+/g, ' ditambah ')
      .replace(/=/g, ' sama dengan ')
      .replace(/cm³/g, ' sentimeter kubik')
      .replace(/m³/g, ' meter kubik')
      .replace(/m²/g, ' meter persegi')
      .replace(/(\d+)\/(\d+)/g, '$1 per $2');
  }

  public speak(text: string, force = false) {
    if (!this.isSupported() || sound.isMuted()) return;
    if (!force && !this.enabled) return;
    try {
      if (this.duckTimeout !== null) {
        window.clearTimeout(this.duckTimeout);
        this.duckTimeout = null;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(this.cleanMathText(text));
      utter.lang = 'id-ID';
      utter.rate = this.rate;
      utter.pitch = 1.04;
      const voices = window.speechSynthesis.getVoices();
      const idVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('id')) ||
        voices.find((v) => v.lang.toLowerCase().includes('ind'));
      if (idVoice) utter.voice = idVoice;

      utter.onstart = () => {
        sound.setDucking(true);
      };
      utter.onend = () => {
        sound.setDucking(false);
      };
      utter.onerror = () => {
        sound.setDucking(false);
      };

      sound.setDucking(true);
      window.speechSynthesis.speak(utter);

      // Fallback safety release in case browser omits onend
      const estMs = Math.min(24000, Math.max(3000, text.length * 75));
      this.duckTimeout = window.setTimeout(() => {
        sound.setDucking(false);
      }, estMs);
    } catch {
      sound.setDucking(false);
    }
  }
}

export const sound = new SoundEngine();
export const voice = new VoiceEngine();

export function formatAngkaID(val: number, maxDecimals = 2): string {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: maxDecimals
  }).format(val);
}
