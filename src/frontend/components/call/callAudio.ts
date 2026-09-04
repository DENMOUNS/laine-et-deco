// Web Audio API Ringtone Synthesis (100% offline, zero external asset dependencies)

class CallAudioManager {
  private audioCtx: AudioContext | null = null;
  private ringInterval: any = null;

  startRingtone(type: 'incoming' | 'outgoing') {
    try {
      if (typeof window === 'undefined') return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.stopRingtone();

      const audioCtx = new AudioContextClass();
      this.audioCtx = audioCtx;

      const playTone = () => {
        if (!this.audioCtx || this.audioCtx.state === 'closed') return;
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }

        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        if (type === 'incoming') {
          // Double chime C6 & G6
          osc1.frequency.value = 1046.50;
          osc2.frequency.value = 1567.98;

          gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.15, this.audioCtx.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.2);

          osc1.start();
          osc2.start();
          osc1.stop(this.audioCtx.currentTime + 1.2);
          osc2.stop(this.audioCtx.currentTime + 1.2);
        } else {
          // Classic European ringback tone (425Hz)
          osc1.frequency.value = 425;
          gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.1, this.audioCtx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime + 1.0);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.2);

          osc1.start();
          osc1.stop(this.audioCtx.currentTime + 1.5);
        }
      };

      playTone();
      this.ringInterval = setInterval(playTone, type === 'incoming' ? 1800 : 4000);
    } catch (e) {
      console.warn('Web Audio non supporté ou bloqué:', e);
    }
  }

  stopRingtone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

export const callAudio = new CallAudioManager();
