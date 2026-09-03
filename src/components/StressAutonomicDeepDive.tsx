/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Wind, Activity, Zap, ShieldCheck, Heart, AlertCircle, Sparkles } from 'lucide-react';
import { StressData } from '../types';

interface StressDeepDiveProps {
  stress: StressData;
  hrvRmssd: number;
  heartRate: number;
  onOpenBreathing: () => void;
}

export const StressAutonomicDeepDive: React.FC<StressDeepDiveProps> = ({
  stress,
  hrvRmssd,
  heartRate,
  onOpenBreathing,
}) => {
  const sympatheticPct = Math.round(stress.sympatheticToneRatio * 100);
  const parasympatheticPct = 100 - sympatheticPct;

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-light tracking-wide uppercase text-white font-serif">
                Autonomic Stress & Nervous System Tone
              </h2>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-mono text-emerald-400 border border-emerald-500/30">
                HRV + Micro-Expression
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Balancing Sympathetic (Fight / Flight) and Parasympathetic (Rest / Digest) Vagal Tone
            </p>
          </div>
        </div>

        <button
          onClick={onOpenBreathing}
          className="flex items-center justify-center gap-2 rounded-full bg-white text-black px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-cyan-400 transition-colors active:scale-95"
        >
          <Wind className="h-4 w-4" />
          <span>Launch 4-7-8 Biofeedback</span>
        </button>
      </div>

      {/* Autonomic Balance Scale */}
      <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Autonomic Division Balance
          </span>
          <span className="text-xs font-mono text-slate-500">
            HRV RMSSD: <strong className="text-cyan-400">{hrvRmssd} ms</strong>
          </span>
        </div>

        {/* Dual Bar */}
        <div className="space-y-3">
          <div className="h-2.5 w-full rounded-full bg-[#0a0a0a] overflow-hidden flex border border-slate-800">
            <div
              className="bg-emerald-400 shadow-[0_0_8px_#10b981] h-full transition-all duration-500"
              style={{ width: `${parasympatheticPct}%` }}
              title={`Parasympathetic: ${parasympatheticPct}%`}
            />
            <div
              className="bg-amber-400 shadow-[0_0_8px_#f59e0b] h-full transition-all duration-500"
              style={{ width: `${sympatheticPct}%` }}
              title={`Sympathetic: ${sympatheticPct}%`}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between text-xs font-mono gap-1">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              Parasympathetic (Rest / Digest): {parasympatheticPct}%
            </span>
            <span className="text-amber-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
              Sympathetic (Fight / Flight): {sympatheticPct}%
            </span>
          </div>
        </div>
      </div>

      {/* 3 Metric Sub-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Stress Score */}
        <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em]">Stress Intensity</span>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-5xl font-light text-white font-serif">
              {stress.score}
            </span>
            <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">/ 100</span>
          </div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest font-mono">
            {stress.level}
          </span>
        </div>

        {/* Recovery Capacity */}
        <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em]">Recovery Capacity</span>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-5xl font-light text-cyan-400 font-serif">
              {stress.recoveryCapacity}
            </span>
          </div>
          <span className="text-xs text-slate-400 leading-relaxed block">
            {stress.recoveryCapacity === 'High' ? 'High vagal adaptability to acute stress' : 'Rest and diaphragmatic breathwork advised'}
          </span>
        </div>

        {/* Resting Cardiac Strain */}
        <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em]">Cardiovascular Load</span>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-5xl font-light text-white font-serif">
              {heartRate}
            </span>
            <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">BPM</span>
          </div>
          <span className="text-xs text-slate-400 leading-relaxed block">
            {heartRate > 85 ? 'Elevated cardiac rate under sympathetic drive' : 'Optimal resting cardiac tempo'}
          </span>
        </div>

      </div>

      {/* Facial Tension Mapping Indicators */}
      <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          Detected Facial Muscle & Micro-Tension Indicators
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stress.tensionIndicators.map((indicator, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#0a0a0a] p-4 text-xs text-slate-300">
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              <span>{indicator}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
