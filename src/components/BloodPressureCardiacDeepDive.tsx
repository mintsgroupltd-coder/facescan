/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Heart, Activity, AlertTriangle, Info, CheckCircle, Flame, ArrowUpRight, Sparkles, Gauge, Stethoscope, ChevronRight } from 'lucide-react';
import { BloodPressureData, CardiacWorkloadData, HypertensionMonitoringData } from '../types';

interface BloodPressureCardiacDeepDiveProps {
  bloodPressure: BloodPressureData;
  cardiacWorkload: CardiacWorkloadData;
  hypertension: HypertensionMonitoringData;
  heartRate: number;
}

export const BloodPressureCardiacDeepDive: React.FC<BloodPressureCardiacDeepDiveProps> = ({
  bloodPressure,
  cardiacWorkload,
  hypertension,
  heartRate,
}) => {
  const [activeTab, setActiveTab] = useState<'hemodynamics' | 'hypertension' | 'workload' | 'dash'>('hemodynamics');

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Normal':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Elevated':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Stage 1 Hypertension':
        return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'Stage 2 Hypertension':
      case 'Hypertensive Crisis':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      default:
        return 'text-slate-300 border-slate-700 bg-slate-800';
    }
  };

  const getStrainBadge = (strain: string) => {
    switch (strain) {
      case 'Optimal':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Mild Load':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'Moderate Demand':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Elevated Strain':
      case 'Excessive Strain':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-light tracking-wide uppercase text-white font-serif">
                Hemodynamics & Cardiac Workload
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-mono border ${getStageColor(bloodPressure.category)}`}>
                {bloodPressure.category}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Arterial stiffness, pulse wave velocity, myocardial oxygen demand & AHA/ACC staging
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center overflow-x-auto rounded-full bg-[#050505] p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('hemodynamics')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'hemodynamics'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Blood Pressure
          </button>
          <button
            onClick={() => setActiveTab('workload')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'workload'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Cardiac Workload
          </button>
          <button
            onClick={() => setActiveTab('hypertension')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'hypertension'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            AHA/ACC Staging
          </button>
          <button
            onClick={() => setActiveTab('dash')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'dash'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            DASH Protocol
          </button>
        </div>
      </div>

      {/* 1. HEMODYNAMICS TAB */}
      {activeTab === 'hemodynamics' && (
        <div className="space-y-6">
          
          {/* Top Big Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* SBP / DBP Card */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                Systolic / Diastolic
              </span>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-5xl font-light text-white font-serif">
                  {bloodPressure.systolic}
                </span>
                <span className="text-3xl text-slate-500 font-light font-serif">/</span>
                <span className="text-4xl font-light text-slate-300 font-serif">
                  {bloodPressure.diastolic}
                </span>
                <span className="text-xs font-mono uppercase text-slate-500 tracking-widest ml-1">mmHg</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <span>Mean Arterial Pressure (MAP): <strong className="text-indigo-300 font-mono">{bloodPressure.map} mmHg</strong></span>
                <span className="font-mono text-[11px] text-slate-500">PP: {bloodPressure.pulsePressure} mmHg</span>
              </div>
            </div>

            {/* Arterial Stiffness Index (ASI) */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                Arterial Stiffness Index
              </span>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-5xl font-light text-cyan-400 font-serif">
                  {bloodPressure.vascularStiffnessIndex}
                </span>
                <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">/ 100</span>
              </div>
              <div className="space-y-1.5">
                <div className="w-full bg-[#0a0a0a] h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-cyan-400 shadow-[0_0_8px_#22d3ee] h-full rounded-full"
                    style={{ width: `${bloodPressure.vascularStiffnessIndex}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Flexible Elastic (&lt;35)</span>
                  <span>Rigid (&gt;65)</span>
                </div>
              </div>
            </div>

            {/* Pulse Wave Velocity (PWV) & Endothelial Health */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-emerald-400" />
                Pulse Wave Velocity (PWV)
              </span>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-5xl font-light text-emerald-400 font-serif">
                  {bloodPressure.pulseWaveVelocityEstimate}
                </span>
                <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">m/s</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <span>Endothelial Score: <strong className="text-emerald-400 font-mono">{bloodPressure.endothelialHealthScore}/100</strong></span>
                <span className="font-mono text-[11px] text-slate-500">Normal: 5.5-7.5 m/s</span>
              </div>
            </div>

          </div>

          {/* Clinical Interpretation Card */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 flex items-start gap-3.5">
            <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-indigo-300 block mb-1 uppercase tracking-wider font-mono text-[11px]">Hemodynamic Physiological Context:</strong>
              {bloodPressure.interpretation} Mean Arterial Pressure (MAP: {bloodPressure.map} mmHg) indicates the steady continuous perfusion pressure delivered to vital organs across each cardiac cycle. Pulse Pressure ({bloodPressure.pulsePressure} mmHg) reflects stroke volume pulsatility and large artery compliance.
            </div>
          </div>

        </div>
      )}

      {/* 2. CARDIAC WORKLOAD TAB */}
      {activeTab === 'workload' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Rate Pressure Product (RPP) */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-orange-400" />
                Rate Pressure Product (RPP)
              </span>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-5xl font-light text-white font-serif">
                  {cardiacWorkload.ratePressureProduct}
                </span>
                <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">(HR &times; SBP)/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border ${getStrainBadge(cardiacWorkload.workloadCategory)}`}>
                  {cardiacWorkload.workloadCategory}
                </span>
                <span className="text-[11px] font-mono text-slate-500">Normal: 70-110</span>
              </div>
            </div>

            {/* Myocardial Oxygen Demand (MVO2) */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                Myocardial O₂ Demand (MVO₂)
              </span>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-5xl font-light text-cyan-400 font-serif">
                  {cardiacWorkload.mvo2Index}
                </span>
                <span className="text-xs font-mono uppercase text-slate-500 tracking-widest">mL/100g/min</span>
              </div>
              <p className="text-xs text-slate-400">
                Direct proxy of coronary oxygen consumption required by heart muscle fibers.
              </p>
            </div>

            {/* Stroke Volume & Cardiac Output */}
            <div className="rounded-3xl border border-slate-800 bg-[#050505] p-6 shadow-lg flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-400" />
                Cardiac Output & Stroke Vol
              </span>
              <div className="my-3 flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-light text-white font-serif">{cardiacWorkload.cardiacOutputLMin} <span className="text-xs font-mono text-slate-500">L/min</span></div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Cardiac Output</span>
                </div>
                <div>
                  <div className="text-3xl font-light text-slate-300 font-serif">{cardiacWorkload.strokeVolumeMl} <span className="text-xs font-mono text-slate-500">mL</span></div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Stroke Volume</span>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-xs text-slate-400">
                <span>LV Strain: <strong className="text-slate-200">{cardiacWorkload.leftVentricularStrain}</strong></span>
                <span className="font-mono text-slate-500">TPR: {cardiacWorkload.totalPeripheralResistance} dyn</span>
              </div>
            </div>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Clinical Workload Breakdown
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {cardiacWorkload.interpretation} Rate-Pressure Product is calculated by multiplying heart rate ({heartRate} BPM) by systolic blood pressure ({bloodPressure.systolic} mmHg). When RPP is low at rest, the myocardium consumes minimal energy and preserves coronary reserve.
            </p>
          </div>

        </div>
      )}

      {/* 3. AHA/ACC HYPERTENSION STAGING */}
      {activeTab === 'hypertension' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className={`rounded-2xl border p-4 ${hypertension.currentStage === 'Normal' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-800 bg-[#050505] opacity-50'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">1. Normal</span>
              <div className="text-base font-light text-white my-1 font-serif">&lt; 120 / &lt; 80</div>
              <p className="text-[11px] text-slate-400">Ideal vascular compliance and normotensive pressure.</p>
            </div>

            <div className={`rounded-2xl border p-4 ${hypertension.currentStage === 'Elevated' ? 'border-amber-500/50 bg-amber-500/10' : 'border-slate-800 bg-[#050505] opacity-50'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">2. Elevated</span>
              <div className="text-base font-light text-white my-1 font-serif">120-129 / &lt; 80</div>
              <p className="text-[11px] text-slate-400">Pre-hypertensive arterial tone, prompt lifestyle adjustment.</p>
            </div>

            <div className={`rounded-2xl border p-4 ${hypertension.currentStage === 'Stage 1 Hypertension' ? 'border-orange-500/50 bg-orange-500/10' : 'border-slate-800 bg-[#050505] opacity-50'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">3. Stage 1 HTN</span>
              <div className="text-base font-light text-white my-1 font-serif">130-139 / 80-89</div>
              <p className="text-[11px] text-slate-400">Elevated afterload and peripheral vascular resistance.</p>
            </div>

            <div className={`rounded-2xl border p-4 ${hypertension.currentStage === 'Stage 2 Hypertension' ? 'border-rose-500/50 bg-rose-500/10' : 'border-slate-800 bg-[#050505] opacity-50'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">4. Stage 2 HTN</span>
              <div className="text-base font-light text-white my-1 font-serif">&ge; 140 / &ge; 90</div>
              <p className="text-[11px] text-slate-400">Clinical hypertension requiring physician consultation.</p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Nocturnal Non-Dipping Risk</span>
              <div className="text-xl font-light text-white my-1 font-serif">{hypertension.nocturnalNonDippingRisk}</div>
              <p className="text-xs text-slate-400">Indicates whether blood pressure appropriately drops during restorative sleep.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Baroreflex Sensitivity</span>
              <div className="text-xl font-light text-cyan-400 my-1 font-serif">{hypertension.baroreflexSensitivity} <span className="text-xs text-slate-500 font-mono">ms/mmHg</span></div>
              <p className="text-xs text-slate-400">Capacity of autonomic baroreceptors to buffer acute blood pressure swings.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Clinical Alert Level</span>
              <div className="text-xl font-light text-white my-1 font-serif uppercase">{hypertension.alertLevel}</div>
              <p className="text-xs text-slate-400">{hypertension.clinicalProtocolAdvice}</p>
            </div>
          </div>

        </div>
      )}

      {/* 4. DASH DIET PROTOCOL */}
      {activeTab === 'dash' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
            <h3 className="text-sm font-light uppercase tracking-wider text-white mb-2 font-serif flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-emerald-400" />
              DASH (Dietary Approaches to Stop Hypertension) Evidence Guidelines
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Clinically proven nutritional strategies that reduce systolic blood pressure by up to 11 mmHg within 2 weeks.
            </p>

            <div className="space-y-3">
              {hypertension.dashDietComplianceGuidance.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-[#0a0a0a] p-4 text-xs text-slate-300">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
