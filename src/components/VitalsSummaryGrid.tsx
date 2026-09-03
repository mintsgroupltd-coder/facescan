/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Activity, Flame, Droplet, Wind, ShieldCheck, TrendingUp, AlertTriangle, Sparkles, Gauge, BatteryCharging, User, Sliders, ChevronRight, FileText, Share2 } from 'lucide-react';
import { FaceScanResult } from '../types';

interface VitalsSummaryGridProps {
  scan: FaceScanResult;
  onOpenBreathing: () => void;
  onSelectTab: (tab: 'overview' | 'bp-cardiac' | 'risk-forecast' | 'metabolic' | 'biometrics' | 'stress' | 'insights' | 'recommendations' | 'coach') => void;
  onOpenHealthReport?: () => void;
  onOpenShareSummary?: () => void;
}

export const VitalsSummaryGrid: React.FC<VitalsSummaryGridProps> = ({
  scan,
  onOpenBreathing,
  onSelectTab,
  onOpenHealthReport,
  onOpenShareSummary,
}) => {
  const { vitals, bloodPressure, cardiacWorkload, bmiAdiposity, breathingRate, riskForecasting, hypertensionMonitoring, holisticScores } = scan;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'normal':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'moderate':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'elevated':
      case 'high':
      case 'attention':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getSugarBadge = (risk: string) => {
    switch (risk) {
      case 'Optimal':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Normal':
        return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
      case 'Pre-diabetic Watch':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Elevated Glycemic Risk':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getBpBadge = (category: string) => {
    switch (category) {
      case 'Normal':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Elevated':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Stage 1 Hypertension':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'Stage 2 Hypertension':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Core Vital Cards: Blood Pressure, Blood Sugar, Heart Rate, Autonomic Stress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. BLOOD PRESSURE & HEMODYNAMICS */}
        <div className="bg-[#0a0a0a] border border-slate-800 p-6 rounded-3xl flex flex-col justify-between hover:border-indigo-500/40 transition shadow-2xl">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              Blood Pressure
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full tracking-wider uppercase border ${getBpBadge(bloodPressure.category)}`}>
              {bloodPressure.category}
            </span>
          </div>

          <div className="my-4 flex items-baseline gap-1">
            <span className="text-5xl font-light text-white font-serif tracking-tight">
              {bloodPressure.systolic}
            </span>
            <span className="text-2xl text-slate-500 font-light font-serif">/</span>
            <span className="text-4xl font-light text-slate-300 font-serif">
              {bloodPressure.diastolic}
            </span>
            <span className="text-slate-500 uppercase text-xs tracking-widest font-mono ml-1.5">mmHg</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>MAP: <strong className="text-indigo-300 font-mono">{bloodPressure.map} mmHg</strong></span>
              <span>PWV: <strong className="text-slate-200 font-mono">{bloodPressure.pulseWaveVelocityEstimate} m/s</strong></span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Arterial Stiffness Index:</span>
              <span className="font-mono text-cyan-400 font-semibold">{bloodPressure.vascularStiffnessIndex}/100</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Endothelial: <strong className="text-emerald-400 font-mono">{bloodPressure.endothelialHealthScore}%</strong></span>
            <button
              onClick={() => onSelectTab('bp-cardiac')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-wider transition"
            >
              <span>Hemodynamics</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* 2. BLOOD SUGAR & GLYCEMIC RISK */}
        <div className="bg-[#0a0a0a] border border-slate-800 p-6 rounded-3xl flex flex-col justify-between hover:border-amber-500/40 transition shadow-2xl">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold flex items-center gap-1.5">
              <Droplet className="h-3.5 w-3.5 text-amber-400" />
              Blood Sugar
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full tracking-wider uppercase border ${getSugarBadge(vitals.bloodSugarRisk.riskLevel)}`}>
              {vitals.bloodSugarRisk.riskLevel}
            </span>
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span className="text-5xl font-light text-white font-serif tracking-tight">
              {vitals.bloodSugarRisk.estimatedFastingMgDl}
            </span>
            <span className="text-slate-500 uppercase text-xs tracking-widest font-mono">mg/dL</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>HbA1c Est: <strong className="text-amber-300 font-mono">{vitals.bloodSugarRisk.estimatedHbA1c || 5.2}%</strong></span>
              <span>TIR: <strong className="text-emerald-400 font-mono">{vitals.bloodSugarRisk.timeInRangeEstimate || 94}%</strong></span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Insulin Sensitivity:</span>
              <span className="font-mono text-teal-400">{vitals.bloodSugarRisk.insulinResistanceRisk || 'Optimal'}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Stability: <strong className="text-cyan-400 font-mono">{vitals.bloodSugarRisk.glycemicStabilityScore}/100</strong></span>
            <button
              onClick={() => onSelectTab('metabolic')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 uppercase tracking-wider transition"
            >
              <span>Metabolic</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* 3. HEART RATE & RHYTHM */}
        <div className="bg-[#0a0a0a] border border-slate-800 p-6 rounded-3xl flex flex-col justify-between hover:border-rose-500/40 transition shadow-2xl">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              Heart Rate
            </span>
            <span className="text-rose-400 text-xs font-semibold px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/30 rounded-full tracking-wider uppercase">
              {vitals.heartRate.status}
            </span>
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span className="text-5xl font-light text-white font-serif tracking-tight">
              {vitals.heartRate.value}
            </span>
            <span className="text-slate-500 uppercase text-xs tracking-widest font-mono">bpm</span>
          </div>

          {/* Micro Telemetry Amplitude Pulse Bars */}
          <div className="h-7 w-full flex items-end gap-1.5 opacity-60 my-1">
            <div className="w-full h-[25%] bg-rose-500 rounded-t-sm"></div>
            <div className="w-full h-[45%] bg-rose-500 rounded-t-sm"></div>
            <div className="w-full h-[35%] bg-rose-500 rounded-t-sm"></div>
            <div className="w-full h-[85%] bg-rose-500 rounded-t-sm shadow-[0_0_8px_#f43f5e]"></div>
            <div className="w-full h-[95%] bg-rose-500 rounded-t-sm shadow-[0_0_8px_#f43f5e]"></div>
            <div className="w-full h-[55%] bg-rose-500 rounded-t-sm"></div>
            <div className="w-full h-[75%] bg-rose-500 rounded-t-sm"></div>
            <div className="w-full h-[30%] bg-rose-500 rounded-t-sm"></div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Resting: <strong className="text-slate-300 font-mono">{vitals.heartRate.normalRange || '60-100 BPM'}</strong></span>
            <span className="font-mono text-rose-400 text-[11px]">rPPG Wave</span>
          </div>
        </div>

        {/* 4. AUTONOMIC STRESS INDEX */}
        <div className="bg-[#0a0a0a] border border-slate-800 p-6 rounded-3xl flex flex-col justify-between hover:border-emerald-500/40 transition shadow-2xl">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-emerald-400" />
              Stress Index
            </span>
            <span className="text-emerald-400 text-xs font-semibold px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full tracking-wider uppercase">
              {vitals.stress.level}
            </span>
          </div>

          <div className="my-4 flex items-baseline gap-2">
            <span className="text-5xl font-light text-white font-serif tracking-tight">
              {vitals.stress.score}
            </span>
            <span className="text-slate-500 uppercase text-xs tracking-widest font-mono">%</span>
          </div>

          <div className="my-1">
            <div className="w-full bg-[#050505] h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-emerald-400 shadow-[0_0_10px_#10b981] transition-all duration-500"
                style={{ width: `${vitals.stress.score}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Recovery: <strong className="text-slate-300">{vitals.stress.recoveryCapacity}</strong></span>
            <button
              onClick={onOpenBreathing}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-wider transition"
            >
              <Wind className="h-3 w-3" /> Calm
            </button>
          </div>
        </div>

      </div>

      {/* Secondary Row: Cardiac Workload, Extended HRV, BMI Adiposity, Respiration & RSA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Cardiac Workload (RPP & MVO2) */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Cardiac Workload (RPP)</span>
            <Activity className="h-3.5 w-3.5 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl font-light text-white font-serif">
              {cardiacWorkload.ratePressureProduct}
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-mono">rpp</span>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between border-t border-slate-800/80 pt-2 mt-2">
            <span>LV Strain: <strong className="text-slate-200">{cardiacWorkload.leftVentricularStrain}</strong></span>
            <span className="text-orange-400 font-mono">MVO₂: {cardiacWorkload.mvo2Index}</span>
          </div>
        </div>

        {/* Extended HRV & Vagal Tone */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">HRV (RMSSD / SDNN)</span>
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl font-light text-white font-serif">
              {vitals.hrv.rmssdMs}
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-mono">ms</span>
            <span className="text-xs text-slate-400 font-mono ml-2">SDNN: {vitals.hrv.sdnnMs || Math.round(vitals.hrv.rmssdMs * 1.35)}ms</span>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between border-t border-slate-800/80 pt-2 mt-2">
            <span>Vagal Tone: <strong className="text-emerald-400 font-mono">{vitals.hrv.parasympatheticVagalTone || 88}%</strong></span>
            <span className="text-slate-500 font-mono">LF/HF: {vitals.hrv.lfHfRatio || 1.1}</span>
          </div>
        </div>

        {/* BMI & Morphological Adiposity */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Optical BMI & Adiposity</span>
            <User className="h-3.5 w-3.5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl font-light text-white font-serif">
              {bmiAdiposity.estimatedBmi}
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-mono">kg/m²</span>
            <span className="text-[10px] text-teal-400 font-mono ml-2 uppercase">({bmiAdiposity.bmiCategory})</span>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between border-t border-slate-800/80 pt-2 mt-2">
            <span>FWHR: <strong className="text-slate-200 font-mono">{bmiAdiposity.fwhrRatio}</strong></span>
            <span className="text-slate-500">Visceral: {bmiAdiposity.visceralAdiposityRisk}</span>
          </div>
        </div>

        {/* Breathing Rate & RSA Coupling */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Breathing Rate & RSA</span>
            <Wind className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl font-light text-white font-serif">
              {breathingRate.value}
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-mono">rpm</span>
            <span className="text-[10px] text-cyan-400 font-mono ml-2">RSA: {breathingRate.rsaCouplingScore}%</span>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between border-t border-slate-800/80 pt-2 mt-2">
            <span>I:E: <strong className="text-slate-200 font-mono">{breathingRate.ieRatio}</strong></span>
            <span className="text-cyan-400">{breathingRate.breathingDepth}</span>
          </div>
        </div>

      </div>

      {/* Cardiometabolic Risk Forecast Banner */}
      <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
              10-Year Cardiometabolic Risk Forecasting
            </h3>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-mono uppercase text-cyan-400 border border-cyan-500/30">
              Grade: {riskForecasting.overallCardioMetabolicGrade}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Projected 10-Yr ASCVD Risk: <strong className="text-white font-mono">{riskForecasting.ascvd10YearRiskPercent}%</strong> &bull; 5-Yr MetS Risk: <strong className="text-cyan-300 font-mono">{riskForecasting.metabolicSyndrome5YearRiskPercent}%</strong> &bull; Vascular Age Delta: <strong className={`font-mono ${riskForecasting.biologicalVascularAgeDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{riskForecasting.biologicalVascularAgeDelta > 0 ? `+${riskForecasting.biologicalVascularAgeDelta}` : riskForecasting.biologicalVascularAgeDelta} Years</strong>
          </p>
        </div>

        <button
          onClick={() => onSelectTab('risk-forecast')}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/40 bg-cyan-500/15 text-xs font-semibold uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/25 transition shadow-[0_0_12px_rgba(34,211,238,0.15)] shrink-0"
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Interactive Risk Sandbox</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Holistic Wellness Indices */}
      <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Physiological Biomarker Indices
          </h3>
          <div className="flex items-center gap-2.5">
            {onOpenHealthReport && (
              <button
                onClick={onOpenHealthReport}
                className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition shadow-sm"
              >
                <FileText className="h-3 w-3 text-cyan-400" />
                <span>Export Report</span>
              </button>
            )}
            {onOpenShareSummary && (
              <button
                onClick={onOpenShareSummary}
                className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-[#070707] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300 transition shadow-sm"
                title="Create a redacted, view-only web link for your doctor"
              >
                <Share2 className="h-3 w-3 text-cyan-400" />
                <span>Share Summary</span>
              </button>
            )}
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              AURA-V4.2 Optical Matrix
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 tracking-wider text-[11px] uppercase">Vitality Index</span>
              <span className="font-semibold text-cyan-400 font-mono">{holisticScores.vitalityIndex}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#050505] overflow-hidden border border-slate-800">
              <div className="h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] rounded-full" style={{ width: `${holisticScores.vitalityIndex}%` }} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 tracking-wider text-[11px] uppercase">Autonomic Balance</span>
              <span className="font-semibold text-emerald-400 font-mono">{holisticScores.autonomicBalance}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#050505] overflow-hidden border border-slate-800">
              <div className="h-full bg-emerald-400 shadow-[0_0_8px_#10b981] rounded-full" style={{ width: `${holisticScores.autonomicBalance}%` }} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 tracking-wider text-[11px] uppercase">Vascular Perfusion</span>
              <span className="font-semibold text-cyan-400 font-mono">{holisticScores.vascularPerfusionScore}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#050505] overflow-hidden border border-slate-800">
              <div className="h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] rounded-full" style={{ width: `${holisticScores.vascularPerfusionScore}%` }} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 tracking-wider text-[11px] uppercase">Fatigue Debt</span>
              <span className="font-semibold text-amber-400 font-mono">{holisticScores.fatigueDebtIndex}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#050505] overflow-hidden border border-slate-800">
              <div className="h-full bg-amber-400 shadow-[0_0_8px_#f59e0b] rounded-full" style={{ width: `${holisticScores.fatigueDebtIndex}%` }} />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
