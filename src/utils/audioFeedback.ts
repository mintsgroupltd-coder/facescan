/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioFeedbackController {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Play a clean, soft pulse beep corresponding to cardiac systole
   */
  public playHeartbeatBeep() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // Ignore audio failure
    }
  }

  /**
   * Play a peaceful two-tone chime upon scan completion
   */
  public playScanCompleteChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = now + idx * 0.12;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.65);
      });
    } catch (e) {
      // Ignore audio failure
    }
  }

  /**
   * Play a gentle breathing tone (inhale / hold / exhale)
   */
  public playBreathingTone(phase: 'inhale' | 'hold' | 'exhale') {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const now = this.ctx.currentTime;

      if (phase === 'inhale') {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(330, now + 3.8);
      } else if (phase === 'hold') {
        osc.frequency.setValueAtTime(330, now);
      } else {
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.linearRampToValueAtTime(196, now + 7.8);
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.001, now + (phase === 'exhale' ? 7.8 : phase === 'hold' ? 6.8 : 3.8));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (phase === 'exhale' ? 8 : phase === 'hold' ? 7 : 4));
    } catch (e) {
      // Ignore
    }
  }
}

export const audioController = new AudioFeedbackController();
