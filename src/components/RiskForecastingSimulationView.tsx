/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, ShieldAlert, Sparkles, Sliders, ArrowRight, CheckCircle2, RotateCcw, Activity, Heart, Moon, Zap, Stethoscope } from 'lucide-react';
import { RiskForecastingData, FaceScanResult } from '../types';

interface RiskForecastingSimulationViewProps {
  scan: FaceScanResult;
}

export const RiskForecastingSimulationView: React.FC<RiskForecastingSimulationViewProps> = ({ scan }) => {
  const { riskForecasting, bloodPressure, vitals } = scan;

  // Simulator Sliders State
  const [bpReduction, setBpReduction] = useState<number>(8); // mmHg reduction
  const [stressReduction, setStressReduction] = useState<number>(25); // % stress offloading
  const [exerciseDays, setExerciseDays] = useState<number>(4); // days/wk zone 2
  const [sleepHours, setSleepHours] = useState<number>(8); // hours restorative sleep
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Simulated output state
  const [simResults, setSimResults] = useState<{
    postAscvd: number;
    postMetS: number;
    postT2D: number;
    postHTN: number;
    relativeReduction: number;
    rejuvenationYears: number;
  }>({
    postAscvd: Math.max(0.5, Number((riskForecasting.ascvd10YearRiskPercent * 0.65).toFixed(1))),
    postMetS: Math.max(0.8, Number((riskForecasting.metabolicSyndrome5YearRiskPercent * 0.60).toFixed(1))),
    postT2D: Math.max(0.6, Number((riskForecasting.type2Diabetes5YearRiskPercent * 0.58).toFixed(1))),
    postHTN: Math.max(1.0, Number((riskForecasting.hypertension5YearRiskPercent * 0.55).toFixed(1))),
    relativeReduction: 38,
    rejuvenationYears: 3,
  });

  // Recalculate simulation either via backend API or instant local physiological formula
  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const response = await fetch('/api/simulate-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMetrics: scan,
          adjustments: {
            bpReductionMmHg: bpReduction,
            stressReductionPercent: stressReduction,
            activeDaysPerWeek: exerciseDays,
            sleepHoursNight: sleepHours,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSimResults({
          postAscvd: data.postSimulationAscvdRisk,
          postMetS: data.postSimulationMetabolicRisk,
          postT2D: data.postSimulationT2DRisk,
          postHTN: data.postSimulationHtnRisk,
          relativeReduction: data.relativeRiskReductionPercent,
          rejuvenationYears: data.vascularAgeRejuvenationYears,
        });
      } else {
        throw new Error('API fallback');
      }
    } catch (e) {
      // Local physiological calculation fallback
      const baseAscvd = riskForecasting.ascvd10YearRiskPercent;
      const bpImpact = (bpReduction / 10) * 0.18;
      const stressImpact = (stressReduction / 100) * 0.22;
      const exerciseImpact = (exerciseDays - 2) * 0.06;
      const sleepImpact = sleepHours >= 7.5 ? 0.12 : (sleepHours < 6 ? -0.15 : 0);

      const totalFactor = Math.max(0.1, Math.min(0.65, bpImpact + stressImpact + exerciseImpact + sleepImpact));
      const postAscvd = Number((baseAscvd * (1 - totalFactor)).toFixed(1));
      const postMetS = Number((riskForecasting.metabolicSyndrome5YearRiskPercent * (1 - totalFactor * 1.2)).toFixed(1));
      const postT2D = Number((riskForecasting.type2Diabetes5YearRiskPercent * (1 - totalFactor * 1.1)).toFixed(1));
      const postHTN = Number((riskForecasting.hypertension5YearRiskPercent * (1 - (bpReduction / 15) * 0.4)).toFixed(1));

      setSimResults({
        postAscvd: Math.max(0.4, postAscvd),
        postMetS: Math.max(0.6, postMetS),
        postT2D: Math.max(0.5, postT2D),
        postHTN: Math.max(0.9, postHTN),
        relativeReduction: Math.round(totalFactor * 100),
        rejuvenationYears: Math.max(1, Math.round(totalFactor * 6)),
      });
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [bpReduction, stressReduction, exerciseDays, sleepHours]);

  const handleReset = () => {
    setBpReduction(8);
    setStressReduction(25);
    setExerciseDays(4);
    setSleepHours(8);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Top Card */}
      <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-light tracking-wide uppercase text-white font-serif">
                  Cardiometabolic Risk Forecasting
                </h2>
                <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-mono text-cyan-400 border border-cyan-500/30">
                  Grade: {riskForecasting.overallCardioMetabolicGrade}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                10-year ASCVD & 5-year metabolic progression forecasting calibrated to optical biomarkers
              </p>
            </div>
          </div>
        </div>

        {/* 4 Risk Forecast Matrices */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 10-Yr ASCVD */}
          <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
              10-Year ASCVD Risk
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-4xl font-light text-white font-serif">
                {riskForecasting.ascvd10YearRiskPercent}%
              </span>
            </div>
            <span className="inline-block text-[10px] uppercase tracking-widest font-mono text-cyan-400">
              {riskForecasting.ascvd10YearRiskPercent < 5 ? 'Optimal Low Risk' : 'Borderline Watch'}
            </span>
          </div>

          {/* 5-Yr Metabolic Syndrome */}
          <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
              5-Yr MetS Progression
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-4xl font-light text-cyan-400 font-serif">
                {riskForecasting.metabolicSyndrome5YearRiskPercent}%
              </span>
            </div>
            <span className="inline-block text-[10px] uppercase tracking-widest font-mono text-slate-400">
              Metabolic Index
            </span>
          </div>

          {/* 5-Yr Type 2 Diabetes */}
          <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
              5-Yr T2D Risk
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className="text-4xl font-light text-amber-400 font-serif">
                {riskForecasting.type2Diabetes5YearRiskPercent}%
              </span>
            </div>
            <span className="inline-block text-[10px] uppercase tracking-widest font-mono text-amber-400">
              Glycemic Trajectory
            </span>
          </div>

          {/* Biological Vascular Age Delta */}
          <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
              Vascular Age Delta
            </div>
            <div className="flex items-baseline gap-1.5 my-2">
              <span className={`text-4xl font-light font-serif ${riskForecasting.biologicalVascularAgeDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {riskForecasting.biologicalVascularAgeDelta > 0 ? `+${riskForecasting.biologicalVascularAgeDelta}` : riskForecasting.biologicalVascularAgeDelta}
              </span>
              <span className="text-xs font-mono uppercase text-slate-500">Years</span>
            </div>
            <span className={`inline-block text-[10px] uppercase tracking-widest font-mono ${riskForecasting.biologicalVascularAgeDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {riskForecasting.biologicalVascularAgeDelta <= 0 ? 'Youthful Arteries' : 'Accelerated Stiffness'}
            </span>
          </div>

        </div>

        {/* Primary Risk Drivers & Modifiable Potential */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Primary Biomarker Drivers
            </h4>
            <div className="space-y-2">
              {riskForecasting.primaryRiskDrivers.map((driver, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              Modifiable Risk Reversal Potential
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {riskForecasting.modifiableMitigationPotential}
            </p>
          </div>
        </div>

      </div>

      {/* Interactive Lifestyle Risk Reduction Simulator */}
      <div className="rounded-3xl border border-cyan-500/30 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-light tracking-wide uppercase text-white font-serif">
                  Interactive Risk Simulation Sandbox
                </h3>
                <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-mono text-cyan-300 border border-cyan-500/40">
                  Live Predictive Model
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Adjust lifestyle levers to preview projected risk reduction and vascular rejuvenation
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 bg-[#050505] text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <RotateCcw className="h-3 w-3" /> Reset Levers
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sliders Column */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Slider 1: Systolic BP Target Reduction */}
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Blood Pressure Reduction (DASH / Cardio)
                </span>
                <span className="font-mono text-cyan-400 font-bold">-{bpReduction} mmHg</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={bpReduction}
                onChange={(e) => setBpReduction(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 mmHg (Current: {bloodPressure.systolic})</span>
                <span>-25 mmHg (Target: {Math.max(100, bloodPressure.systolic - 25)})</span>
              </div>
            </div>

            {/* Slider 2: Stress & Cortisol Offloading */}
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  Autonomic Stress Offloading
                </span>
                <span className="font-mono text-emerald-400 font-bold">-{stressReduction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={stressReduction}
                onChange={(e) => setStressReduction(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0%</span>
                <span>-50% Sympathetic Relief</span>
              </div>
            </div>

            {/* Slider 3: Zone-2 Aerobic Exercise */}
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Active Exercise Frequency
                </span>
                <span className="font-mono text-cyan-400 font-bold">{exerciseDays} days / week</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={exerciseDays}
                onChange={(e) => setExerciseDays(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1 day/wk</span>
                <span>7 days/wk</span>
              </div>
            </div>

            {/* Slider 4: Sleep Duration */}
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-400" />
                  Sleep Duration & Restoration
                </span>
                <span className="font-mono text-indigo-400 font-bold">{sleepHours} hrs / night</span>
              </div>
              <input
                type="range"
                min="5"
                max="9.5"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>5 hrs (Sleep Debt)</span>
                <span>9.5 hrs (Optimal)</span>
              </div>
            </div>

          </div>

          {/* Simulated Impact Output Column */}
          <div className="lg:col-span-5 rounded-3xl border border-cyan-500/40 bg-[#050505] p-6 flex flex-col justify-between shadow-[0_0_25px_rgba(6,182,212,0.1)]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-[0.2em]">
                  Projected Outcomes
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  -{simResults.relativeReduction}% Risk
                </span>
              </div>

              <div className="space-y-4">
                
                <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">10-Yr ASCVD</span>
                    <div className="text-lg font-light text-slate-400 line-through font-serif">
                      {riskForecasting.ascvd10YearRiskPercent}%
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-cyan-400" />
                  <div className="text-right">
                    <span className="text-xs text-cyan-400 font-semibold">Simulated</span>
                    <div className="text-2xl font-light text-emerald-400 font-serif">
                      {simResults.postAscvd}%
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">5-Yr MetS Risk</span>
                    <div className="text-lg font-light text-slate-400 line-through font-serif">
                      {riskForecasting.metabolicSyndrome5YearRiskPercent}%
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-cyan-400" />
                  <div className="text-right">
                    <span className="text-xs text-cyan-400 font-semibold">Simulated</span>
                    <div className="text-2xl font-light text-emerald-400 font-serif">
                      {simResults.postMetS}%
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0a0a0a] p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">5-Yr Diabetes Risk</span>
                    <div className="text-lg font-light text-slate-400 line-through font-serif">
                      {riskForecasting.type2Diabetes5YearRiskPercent}%
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-cyan-400" />
                  <div className="text-right">
                    <span className="text-xs text-cyan-400 font-semibold">Simulated</span>
                    <div className="text-2xl font-light text-emerald-400 font-serif">
                      {simResults.postT2D}%
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Projected Vascular Rejuvenation:</span>
              <span className="text-3xl font-light text-emerald-400 font-serif">
                -{simResults.rejuvenationYears} Biological Years
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
