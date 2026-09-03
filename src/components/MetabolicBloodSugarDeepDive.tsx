/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Droplet, TrendingUp, Info, CheckCircle, AlertTriangle, Apple, Footprints, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { BloodSugarRiskData } from '../types';

interface MetabolicDeepDiveProps {
  data: BloodSugarRiskData;
  heartRate: number;
  stressScore: number;
}

export const MetabolicBloodSugarDeepDive: React.FC<MetabolicDeepDiveProps> = ({
  data,
  heartRate,
  stressScore,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'nutrition' | 'science'>('overview');

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Optimal':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Normal':
        return 'text-teal-400 border-teal-500/30 bg-teal-500/10';
      case 'Pre-diabetic Watch':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Elevated Glycemic Risk':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      default:
        return 'text-slate-300 border-slate-700 bg-slate-800';
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Droplet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-light tracking-wide uppercase text-white font-serif">
                Metabolic & Glycemic Telemetry
              </h2>
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-mono text-cyan-400 border border-cyan-500/30">
                Optical Proxy
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Facial micro-vascular reflectance, skin turgor & autonomic glucose response
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center rounded-full bg-[#050505] p-1 border border-slate-800">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              activeSubTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSubTab('nutrition')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              activeSubTab === 'nutrition'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Protocol
          </button>
          <button
            onClick={() => setActiveSubTab('science')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              activeSubTab === 'science'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Methodology
          </button>
        </div>
      </div>

      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Main Key Metric Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Estimated Fasting Blood Glucose */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 flex flex-col justify-between shadow-lg">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                Estimated Fasting Glucose
              </span>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-5xl font-light text-white font-serif">
                  {data.estimatedFastingMgDl}
                </span>
                <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">mg/dL</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border ${getRiskColor(data.riskLevel)}`}>
                  {data.riskLevel}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Ideal: 70-99
                </span>
              </div>
            </div>

            {/* Glycemic Stability Score */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 flex flex-col justify-between shadow-lg">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                Glycemic Stability Index
              </span>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-5xl font-light text-cyan-400 font-serif">
                  {data.glycemicStabilityScore}
                </span>
                <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">/ 100</span>
              </div>
              <div className="w-full bg-[#0a0a0a] h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-cyan-400 shadow-[0_0_8px_#22d3ee] h-full rounded-full"
                  style={{ width: `${data.glycemicStabilityScore}%` }}
                />
              </div>
            </div>

            {/* Glucose-Autonomic Correlation */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 flex flex-col justify-between shadow-lg">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                Autonomic Metabolic Index
              </span>
              <div className="my-3">
                <div className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                  {stressScore > 65 ? 'Adrenal Activation' : 'Balanced Hepatic Output'}
                </div>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {stressScore > 65
                    ? 'Elevated catecholamines and cortisol accelerate gluconeogenesis.'
                    : 'Low sympathetic tone facilitates optimal peripheral insulin sensitivity.'}
                </p>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
                Cardiac Rhythm: {heartRate} BPM
              </span>
            </div>

          </div>

          {/* Secondary Clinical Row: HbA1c, Time-in-Range, Insulin Sensitivity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Estimated HbA1c Proxy</span>
              <div className="text-3xl font-light text-amber-300 my-1 font-serif">
                {data.estimatedHbA1c || 5.2}%
              </div>
              <p className="text-xs text-slate-400">Normal glycemic binding fraction (&lt;5.7% is optimal non-diabetic range).</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Estimated Time-in-Range (TIR)</span>
              <div className="text-3xl font-light text-emerald-400 my-1 font-serif">
                {data.timeInRangeEstimate || 95}%
              </div>
              <p className="text-xs text-slate-400">Estimated percentage of 24h cycle within 70-140 mg/dL target window.</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Insulin Resistance Risk</span>
              <div className="text-2xl font-light text-white my-1 font-serif">
                {data.insulinResistanceRisk || 'Low / Optimal'}
              </div>
              <p className="text-xs text-slate-400">Derived from facial microvascular perfusion dynamics and autonomic stability.</p>
            </div>
          </div>

          {/* Observed Facial Micro-Vascular Signs */}
          <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Detected Facial Optical Biomarkers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.metabolicSigns.map((sign, idx) => (
                <div key={idx} className="flex items-start gap-2.5 rounded-2xl border border-slate-800 bg-[#0a0a0a] p-4 text-xs text-slate-300">
                  <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{sign}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Context Banner */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 flex items-start gap-3.5">
            <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-cyan-300 block mb-1 uppercase tracking-wider font-mono text-[11px]">Physiological Optical Correlation:</strong>
              {data.fastingVsPostprandialContext}
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'nutrition' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 font-display">
              <Apple className="h-4 w-4 text-emerald-400" />
              Science-Backed Glycemic Stability Rules
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Simple behavioral and nutritional sequences to blunt blood glucose spikes and prevent metabolic fatigue.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <span className="inline-block rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-400 mb-2">
                  1. MEAL SEQUENCING
                </span>
                <h4 className="text-xs font-bold text-slate-200 mb-1">
                  Fiber &rarr; Protein &rarr; Carbs
                </h4>
                <p className="text-xs text-slate-400">
                  Eating fibrous vegetables first creates a viscous mesh in the small intestine, slowing carbohydrate absorption by up to 70%.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <span className="inline-block rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 mb-2">
                  2. POST-MEAL MOVEMENT
                </span>
                <h4 className="text-xs font-bold text-slate-200 mb-1">
                  10-Minute Stroll
                </h4>
                <p className="text-xs text-slate-400">
                  Light walking triggers GLUT4 glucose transporter translocation into muscle cells without needing extra insulin.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <span className="inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 mb-2">
                  3. ACETIC ACID HACK
                </span>
                <h4 className="text-xs font-bold text-slate-200 mb-1">
                  Apple Cider Vinegar
                </h4>
                <p className="text-xs text-slate-400">
                  1 tablespoon of vinegar in water before starch-heavy meals temporarily deactivates alpha-amylase, smoothing glucose curves.
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Action Steps Recommended For Your Scan:
            </h3>
            <ul className="space-y-2">
              {data.dietaryGuidance.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Footprints className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeSubTab === 'science' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-cyan-400" />
            How Can Face Scanning Estimate Glycemic & Metabolic Indicators?
          </h3>
          
          <p>
            Contactless facial screening leverages <strong>remote Photoplethysmography (rPPG)</strong> combined with computer vision micro-vascular color analysis. When light reflects off facial tissue:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
              <strong className="text-cyan-300 block mb-1">1. Micro-Capillary Compliance</strong>
              <p className="text-slate-400">
                Blood glucose concentration influences blood rheology (viscosity) and dermal micro-perfusion reflectance curves at 530nm (green) and 660nm (red).
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
              <strong className="text-teal-300 block mb-1">2. Autonomic Adrenal Reflex</strong>
              <p className="text-slate-400">
                Glucose fluctuations directly correlate with autonomic vasomotor tone (pupillary tension, peripheral vasoconstriction, and heart rate variability).
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3 mt-4">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-slate-300">
              <strong className="text-amber-300 block mb-0.5">Clinical Disclaimer</strong>
              FaceVital AI is a wellness and physiological screening tool. It does NOT provide clinical diagnostic blood sugar numbers. For clinical diagnosis of diabetes, hypoglycemia, or metabolic syndrome, always use standard venous HbA1c tests or FDA/CE-cleared capillary blood glucometers.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
