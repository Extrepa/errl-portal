/**
 * Audio-Reactive Service
 * Handles Web Audio API integration for audio-reactive vibes
 */

export type FrequencyBand = 'bass' | 'mid' | 'treble';

export interface AudioReactiveConfig {
  parameter: string; // e.g., 'pulse.intensity', 'glow.radius'
  frequencyBand: FrequencyBand;
  multiplier: number; // Multiplier for the audio value
  smoothing?: number; // Smoothing factor (0-1), default 0.8
}

export interface AudioReactiveService {
  start: () => Promise<void>;
  stop: () => void;
  getFrequencyData: (band: FrequencyBand) => number;
  isActive: () => boolean;
}

class AudioReactiveServiceImpl implements AudioReactiveService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private smoothedValues: Map<FrequencyBand, number> = new Map([
    ['bass', 0],
    ['mid', 0],
    ['treble', 0],
  ]);

  async start(): Promise<void> {
    try {
      // Get user media (microphone)
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect microphone to analyser
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);

      // Create data array
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Start analysis loop
      this.analyze();
    } catch (error) {
      console.error('Failed to start audio reactive service:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this.smoothedValues.clear();
  }

  private analyze = (): void => {
    if (!this.analyser || !this.dataArray) return;

    const frequencyData = this.dataArray as unknown as Uint8Array<ArrayBuffer>;
    this.analyser.getByteFrequencyData(frequencyData);

    // Extract frequency bands
    const bass = this.extractBand(this.dataArray, 0, 10); // 0-100Hz (approx)
    const mid = this.extractBand(this.dataArray, 10, 50); // 100-500Hz (approx)
    const treble = this.extractBand(this.dataArray, 50, 128); // 500Hz+ (approx)

    // Apply smoothing
    const smoothing = 0.8;
    const currentBass = this.smoothedValues.get('bass') || 0;
    const currentMid = this.smoothedValues.get('mid') || 0;
    const currentTreble = this.smoothedValues.get('treble') || 0;

    this.smoothedValues.set('bass', currentBass * smoothing + bass * (1 - smoothing));
    this.smoothedValues.set('mid', currentMid * smoothing + mid * (1 - smoothing));
    this.smoothedValues.set('treble', currentTreble * smoothing + treble * (1 - smoothing));

    this.animationFrame = requestAnimationFrame(this.analyze);
  };

  private extractBand(data: Uint8Array, start: number, end: number): number {
    let sum = 0;
    let count = 0;
    for (let i = start; i < Math.min(end, data.length); i++) {
      sum += data[i];
      count++;
    }
    return count > 0 ? sum / count / 255 : 0; // Normalize to 0-1
  }

  getFrequencyData(band: FrequencyBand): number {
    return this.smoothedValues.get(band) || 0;
  }

  isActive(): boolean {
    return this.audioContext !== null && this.analyser !== null;
  }
}

// Singleton instance
let audioServiceInstance: AudioReactiveService | null = null;

export const getAudioReactiveService = (): AudioReactiveService => {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioReactiveServiceImpl();
  }
  return audioServiceInstance;
};
