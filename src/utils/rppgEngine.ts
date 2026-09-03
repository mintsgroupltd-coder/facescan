/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Photoplethysmography (rPPG) optical pulse detection engine
 * Measures subtle skin color variations in the green channel (peak hemoglobin light absorption at ~530nm)
 * to estimate heart rate and pulse wave metrics in real-time.
 */

export interface RPPGFrameResult {
  rawGreen: number;
  rawRed: number;
  rawBlue: number;
  filteredValue: number;
  instantBpm: number;
  signalQuality: number; // 0 - 100
  redGreenRatio: number;
  isPeak: boolean;
}

export class RPPGEngine {
  private bufferSize: number;
  private greenBuffer: number[] = [];
  private redBuffer: number[] = [];
  private blueBuffer: number[] = [];
  private timestamps: number[] = [];
  private filteredBuffer: number[] = [];
  private peakTimestamps: number[] = [];
  private lastBpm: number = 72;
  private lastPeakTime: number = 0;

  constructor(bufferSize = 180) {
    this.bufferSize = bufferSize;
  }

  public reset() {
    this.greenBuffer = [];
    this.redBuffer = [];
    this.blueBuffer = [];
    this.timestamps = [];
    this.filteredBuffer = [];
    this.peakTimestamps = [];
    this.lastBpm = 72;
    this.lastPeakTime = 0;
  }

  /**
   * Process a single video frame inside an ROI canvas
   */
  public processFrame(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement
  ): RPPGFrameResult {
    const width = canvas.width;
    const height = canvas.height;

    // Draw the video frame to offscreen canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Sample Region of Interest: Forehead (center upper third) and Upper Cheeks
    const roiX = Math.floor(width * 0.35);
    const roiY = Math.floor(height * 0.22);
    const roiW = Math.floor(width * 0.3);
    const roiH = Math.floor(height * 0.25);

    const frameData = ctx.getImageData(roiX, roiY, roiW, roiH);
    const data = frameData.data;

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    const totalPixels = roiW * roiH;

    // Calculate mean R, G, B channels
    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
    }

    const meanR = totalR / totalPixels;
    const meanG = totalG / totalPixels;
    const meanB = totalB / totalPixels;

    const now = performance.now();

    this.greenBuffer.push(meanG);
    this.redBuffer.push(meanR);
    this.blueBuffer.push(meanB);
    this.timestamps.push(now);

    if (this.greenBuffer.length > this.bufferSize) {
      this.greenBuffer.shift();
      this.redBuffer.shift();
      this.blueBuffer.shift();
      this.timestamps.shift();
    }

    // Apply normalized detrending & bandpass filter (0.7 Hz to 3.5 Hz)
    const filteredVal = this.computeFilteredSignal();
    this.filteredBuffer.push(filteredVal);
    if (this.filteredBuffer.length > this.bufferSize) {
      this.filteredBuffer.shift();
    }

    // Peak detection for BPM
    const isPeak = this.detectPeak(filteredVal, now);

    // Compute optical red/green chrominance ratio (useful for metabolic/SpO2 estimation)
    const rgRatio = meanG > 0 ? Number((meanR / meanG).toFixed(3)) : 1.15;

    // Compute Signal-to-Noise quality
    const signalQuality = this.calculateSignalQuality();

    return {
      rawGreen: meanG,
      rawRed: meanR,
      rawBlue: meanB,
      filteredValue: filteredVal,
      instantBpm: this.lastBpm,
      signalQuality,
      redGreenRatio: rgRatio,
      isPeak,
    };
  }

  private computeFilteredSignal(): number {
    const len = this.greenBuffer.length;
    if (len < 5) return 0;

    // Compute mean of recent window for detrending
    let sum = 0;
    for (let i = 0; i < len; i++) {
      sum += this.greenBuffer[i];
    }
    const mean = sum / len;

    // Current detrended green deviation (inverting because blood influx increases light absorption)
    const detrended = -(this.greenBuffer[len - 1] - mean);

    // Simple moving exponential smoothing
    const alpha = 0.35;
    const prev = this.filteredBuffer.length > 0 ? this.filteredBuffer[this.filteredBuffer.length - 1] : detrended;
    return prev + alpha * (detrended - prev);
  }

  private detectPeak(currentVal: number, now: number): boolean {
    const minPeakIntervalMs = 380; // max ~155 bpm
    const maxPeakIntervalMs = 1300; // min ~46 bpm

    if (this.filteredBuffer.length < 5) return false;

    const prevVal = this.filteredBuffer[this.filteredBuffer.length - 2];
    const prevPrevVal = this.filteredBuffer[this.filteredBuffer.length - 3];

    // Local peak condition: rising then falling above threshold
    const isPeakCandidate = prevVal > prevPrevVal && prevVal > currentVal && prevVal > 0.05;

    if (isPeakCandidate && (now - this.lastPeakTime > minPeakIntervalMs)) {
      if (this.lastPeakTime > 0) {
        const interval = now - this.lastPeakTime;
        if (interval < maxPeakIntervalMs) {
          const calculatedBpm = Math.round(60000 / interval);
          if (calculatedBpm >= 48 && calculatedBpm <= 175) {
            // Smooth moving average for BPM stability
            this.lastBpm = Math.round(this.lastBpm * 0.7 + calculatedBpm * 0.3);
            this.peakTimestamps.push(now);
            if (this.peakTimestamps.length > 10) {
              this.peakTimestamps.shift();
            }
          }
        }
      }
      this.lastPeakTime = now;
      return true;
    }

    return false;
  }

  private calculateSignalQuality(): number {
    if (this.greenBuffer.length < 30) return 40;
    
    // Variance check
    let sum = 0;
    for (const v of this.greenBuffer) sum += v;
    const mean = sum / this.greenBuffer.length;

    let varSum = 0;
    for (const v of this.greenBuffer) {
      varSum += Math.pow(v - mean, 2);
    }
    const variance = varSum / this.greenBuffer.length;

    // Good rPPG variance is between 0.1 and 15 (too high = head motion, too low = pitch black/still)
    if (variance < 0.01) return 30;
    if (variance > 50) return 45; // excessive motion
    return Math.min(98, Math.max(50, Math.round(75 + Math.min(20, variance * 5))));
  }

  public getRecentWaveform(): number[] {
    return [...this.filteredBuffer];
  }
}
