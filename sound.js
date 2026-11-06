/**
 * Jass ❤️ — Romantic Ambient Audio Synthesizer
 * Uses Web Audio API to create gentle, soothing romantic chimes and warm pad chords.
 * 100% self-contained: No external audio files or network requests required.
 */

class RomanticSynthesizer {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timer = null;
    this.step = 0;

    // Romantic chord progression in C/Am (Gentle & Emotional)
    // Frequencies for Cmaj7, Am7, Fmaj7, G6
    this.chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
      [220.00, 261.63, 329.63, 392.00], // Am7   (A3, C4, E4, G4)
      [174.61, 261.63, 329.63, 349.23], // Fmaj7 (F3, C4, E4, F4)
      [196.00, 246.94, 293.66, 392.00]  // G6    (G3, B3, D4, G4)
    ];

    // Delicate bell chime notes (high octave arpeggio)
    this.chimes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, duration, type = 'sine', gainVal = 0.08, attack = 0.1, decay = 1.8) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    // Warm soft lowpass filter for romantic mellow tone
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + duration);

    // Gentle ADSR Envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  }

  playChord(chordIndex) {
    const chord = this.chords[chordIndex % this.chords.length];
    chord.forEach((freq, idx) => {
      // Slight delay between notes for strum effect
      setTimeout(() => {
        if (!this.isPlaying) return;
        this.playTone(freq, 4.0, 'sine', 0.045, 0.4, 3.5);
      }, idx * 60);
    });

    // Random chime twinkle
    if (Math.random() > 0.3) {
      setTimeout(() => {
        if (!this.isPlaying) return;
        const chimeFreq = this.chimes[Math.floor(Math.random() * this.chimes.length)];
        this.playTone(chimeFreq, 2.8, 'triangle', 0.035, 0.05, 2.5);
      }, 900 + Math.random() * 800);
    }
  }

  start() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.step = 0;

    this.playChord(this.step);
    this.timer = setInterval(() => {
      if (!this.isPlaying) return;
      this.step = (this.step + 1) % this.chords.length;
      this.playChord(this.step);
    }, 3800);
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }
}

window.romanticSynthesizer = new RomanticSynthesizer();

