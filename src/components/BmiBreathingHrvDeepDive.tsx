/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wind, Activity, User, Sparkles, ShieldCheck, Heart, Info, CheckCircle2, ChevronRight, Gauge } from 'lucide-react';
import { BmiAdiposityData, BreathingData, HRVExtendedData } from '../types';

interface BmiBreathingHrvDeepDiveProps {
  bmi: BmiAdiposityData;
  breathing: BreathingData;
  hrv: HRVExtendedData;
  heartRate: number;
}

export const BmiBreathingHrvDeepDive: React.FC<BmiBreathingHrvDeepDiveProps> = ({
  bmi,
  breathing,
  hrv,
  heartRate,
}) => {
  const [activeTab, setActiveTab] = useState<'bmi' | 'breathing' | 'hrv'>('bmi');

  const getBmiBadge = (cat: string) => {
    switch (cat) {
      case 'Normal / Healthy':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Overweight':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Class 1 Obese':
      case 'Class 2 Obese':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      default:
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-light tracking-wide uppercase text-white font-serif">
                Morphometrics, Breathing & HRV
              </h2>
              <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-mono text-teal-400 border border-teal-500/30">
                Optical Mesh AI
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Facial adiposity & FWHR, respiratory sinus arrhythmia (RSA), and autonomous HRV spectra
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center rounded-full bg-[#050505] p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('bmi')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'bmi'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-[0_0_10px_rgba(20,184,166,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            BMI & Adiposity
          </button>
          <button
            onClick={() => setActiveTab('breathing')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'breathing'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-[0_0_10px_rgba(20,184,166,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Breathing & RSA
          </button>
          <button
            onClick={() => setActiveTab('hrv')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'hrv'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-[0_0_10px_rgba(20,184,166,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Extended HRV
          </button>
        </div>
      </div>

      {/* 1. BMI & ADIPOSITY */}
      {activeTab === 'bmi' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Estimated BMI */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-teal-400" />
                Optical BMI Estimate
              </span>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-5xl font-light text-white font-serif">
                  {bmi.estimatedBmi}
                </span>
                <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">kg/m²</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border ${getBmiBadge(bmi.bmiCategory)}`}>
                  {bmi.bmiCategory}
                </span>
                <span className="text-[11px] font-mono text-slate-500">Normal: 18.5 - 24.9</span>
              </div>
            </div>

            {/* Facial Width-to-Height Ratio (FWHR) */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                Facial Width-to-Height (FWHR)
              </span>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-5xl font-light text-cyan-400 font-serif">
                  {bmi.fwhrRatio}
                </span>
                <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">Ratio</span>
              </div>
              <p className="text-xs text-slate-400">
                Bizygomatic to upper facial height geometric morphometry proxy.
              </p>
            </div>

            {/* Facial Adiposity & Visceral Risk */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Facial Adiposity Score
              </span>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-5xl font-light text-emerald-400 font-serif">
                  {bmi.facialAdiposityScore}
                </span>
                <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">/ 100</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-xs text-slate-400">
                <span>Visceral Risk: <strong className="text-slate-200">{bmi.visceralAdiposityRisk}</strong></span>
                <span className="text-teal-400 font-mono text-[11px]">{bmi.metabolicPhenotype}</span>
              </div>
            </div>

          </div>

          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5 flex items-start gap-3.5">
            <Info className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-teal-300 block mb-1 uppercase tracking-wider font-mono text-[11px]">Facial Morphometric Phenotyping:</strong>
              {bmi.interpretation} Optical facial mesh mapping analyzes jaw contour taper, cheek volume curvature, and submental tissue thickness to forecast body composition and metabolic phenotype.
            </div>
          </div>

        </div>
      )}

      {/* 2. BREATHING RATE & RSA */}
      {activeTab === 'breathing' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Respiration Rate */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Wind className="h-3.5 w-3.5 text-cyan-400" />
                Breathing Cadence
              </span>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-5xl font-light text-white font-serif">
                  {breathing.value}
                </span>
                <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">Breaths / min</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <span>Status: <strong className="text-cyan-400">{breathing.status}</strong></span>
                <span className="font-mono text-slate-500">{breathing.normalRange}</span>
              </div>
            </div>

            {/* RSA Coupling Score */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-emerald-400" />
                RSA Cardiorespiratory Coupling
              </span>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-5xl font-light text-emerald-400 font-serif">
                  {breathing.rsaCouplingScore}
                </span>
                <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">/ 100</span>
              </div>
              <div className="space-y-1.5">
                <div className="w-full bg-[#0a0a0a] h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-400 shadow-[0_0_8px_#10b981] h-full rounded-full"
                    style={{ width: `${breathing.rsaCouplingScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Desynchronized</span>
                  <span>High Vagal RSA</span>
                </div>
              </div>
            </div>

            {/* Inhale:Exhale Ratio & Depth */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                I : E Ratio & Depth
              </span>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-4xl font-light text-white font-serif">
                  {breathing.ieRatio}
                </span>
                <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">Inhale : Exhale</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-xs text-slate-400">
                <span>Depth: <strong className="text-cyan-300">{breathing.breathingDepth}</strong></span>
                <span className="font-mono text-slate-500">Regularity: {breathing.rhythmRegularity}%</span>
              </div>
            </div>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Respiratory Sinus Arrhythmia (RSA) Context
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {breathing.interpretation} Respiratory Sinus Arrhythmia is the physiological phenomenon where heart rate increases during inhalation and slows down during exhalation, reflecting direct parasympathetic vagus nerve brake control.
            </p>
          </div>

        </div>
      )}

      {/* 3. EXTENDED HRV SPECTRUM */}
      {activeTab === 'hrv' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* RMSSD */}
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">HRV RMSSD</span>
              <div className="text-3xl font-light text-white my-1 font-serif">{hrv.rmssdMs} <span className="text-xs font-mono text-slate-500">ms</span></div>
              <span className="text-[10px] text-emerald-400 uppercase font-mono">Short-term Vagal</span>
            </div>

            {/* SDNN */}
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">SDNN Index</span>
              <div className="text-3xl font-light text-cyan-400 my-1 font-serif">{hrv.sdnnMs || Math.round(hrv.rmssdMs * 1.35)} <span className="text-xs font-mono text-slate-500">ms</span></div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Total Autonomic Power</span>
            </div>

            {/* LF / HF Ratio */}
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">LF / HF Ratio</span>
              <div className="text-3xl font-light text-amber-400 my-1 font-serif">{hrv.lfHfRatio || 1.15}</div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Sympathovagal Balance</span>
            </div>

            {/* Parasympathetic Vagal Tone */}
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Vagal Tone</span>
              <div className="text-3xl font-light text-emerald-400 my-1 font-serif">{hrv.parasympatheticVagalTone || 85} <span className="text-xs font-mono text-slate-500">/ 100</span></div>
              <span className="text-[10px] text-emerald-400 uppercase font-mono">Recovery Drive</span>
            </div>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5 flex items-start justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Baevsky Stress Index
              </h4>
              <div className="text-2xl font-light text-white font-serif">{hrv.baevskyStressIndex || 55} <span className="text-xs font-mono text-slate-500">units</span></div>
              <p className="text-xs text-slate-400 mt-1">
                Mathematical index of autonomic regulation centralization. Lower values (&lt;90) represent healthy cardiovascular reserve.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Status</span>
              <div className="text-sm font-semibold uppercase text-emerald-400 mt-1">{hrv.status}</div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
