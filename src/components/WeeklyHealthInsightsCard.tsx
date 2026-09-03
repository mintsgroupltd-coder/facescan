/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  Flame, 
  Droplet, 
  RefreshCw, 
  Calendar, 
  CheckCircle2, 
  Heart, 
  ShieldCheck, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { FaceScanResult, WeeklyHealthInsightsData } from '../types';
import { fetchWeeklyHealthInsights, computeClientWeeklyInsights } from '../utils/weeklyInsightsEngine';

interface WeeklyHealthInsightsCardProps {
  history: FaceScanResult[];
  onViewHistory?: () => void;
}

export const WeeklyHealthInsightsCard: React.FC<WeeklyHealthInsightsCardProps> = ({
  history,
  onViewHistory,
}) => {
  const [insights, setInsights] = useState<WeeklyHealthInsightsData | null>(() => {
    return computeClientWeeklyInsights(history);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'breakdown' | 'takeaways'>('summary');

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWeeklyHealthInsights(history);
      setInsights(data);
    } catch (error) {
      console.error('Error fetching weekly health insights:', error);
      setInsights(computeClientWeeklyInsights(history));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [history.length]);

  if (!insights) return null;

  const { weeklyAverages } = insights;

  const getTrajectoryBadge = (trajectory: string) => {
    switch (trajectory) {
      case 'improving':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="h-3.5 w-3.5" />
            Improving Trajectory
          </span>
        );
      case 'declining':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <TrendingDown className="h-3.5 w-3.5" />
            Watch Pattern
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Minus className="h-3.5 w-3.5" />
            Stable Baseline
          </span>
        );
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-base font-light tracking-wide uppercase text-white font-serif">
              Weekly Health Insights
            </h3>
            <span className="rounded-full bg-[#050505] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-cyan-400 border border-cyan-500/30">
              Gemini 3.7 AI
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span>{insights.periodLabel} &bull; {weeklyAverages.scansCount} scans analyzed</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadInsights}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-[#050505] px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition disabled:opacity-50"
            title="Re-run 7-Day AI Synthesis"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Refresh Insights</span>
          </button>
          {onViewHistory && (
            <button
              onClick={onViewHistory}
              className="flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3.5 py-1.5 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 transition"
            >
              <span>Full Logs</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Top Banner: Status Headline & Vitality Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
        <div className="lg:col-span-3 rounded-2xl border border-slate-800/80 bg-[#050505] p-5 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            {getTrajectoryBadge(insights.vitalityTrajectory)}
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              7-Day Trajectory
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white tracking-wide">
            {insights.statusHeadline}
          </h4>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-[#050505] p-5 flex items-center justify-between lg:flex-col lg:items-start lg:justify-center">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
              Vitality Index
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-light text-white font-serif">
                {insights.overallVitalityScore}
              </span>
              <span className="text-xs font-mono text-cyan-400">/ 100</span>
            </div>
          </div>
          <div className="w-20 lg:w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-cyan-400 h-full rounded-full shadow-[0_0_8px_#22d3ee]"
              style={{ width: `${insights.overallVitalityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Comparative 7-Day KPI Metric Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Heart Rate */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#050505] p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold flex items-center gap-1.5">
              <Heart className="h-3 w-3 text-rose-500" />
              7-Day Avg Heart Rate
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-light text-white font-serif">
                {weeklyAverages.heartRateAvg}
              </span>
              <span className="text-[11px] font-mono text-slate-500">BPM</span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold flex items-center gap-1 ${
            weeklyAverages.heartRateDelta <= 0
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {weeklyAverages.heartRateDelta <= 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
            <span>{weeklyAverages.heartRateDelta > 0 ? `+${weeklyAverages.heartRateDelta}` : weeklyAverages.heartRateDelta} bpm</span>
          </div>
        </div>

        {/* Stress Level */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#050505] p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold flex items-center gap-1.5">
              <Flame className="h-3 w-3 text-emerald-400" />
              7-Day Avg Stress
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-light text-white font-serif">
                {weeklyAverages.stressAvg}
              </span>
              <span className="text-[11px] font-mono text-slate-500">%</span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold flex items-center gap-1 ${
            weeklyAverages.stressDelta <= 0
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {weeklyAverages.stressDelta <= 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
            <span>{weeklyAverages.stressDelta > 0 ? `+${weeklyAverages.stressDelta}` : weeklyAverages.stressDelta}%</span>
          </div>
        </div>

        {/* Blood Sugar Proxy */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#050505] p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold flex items-center gap-1.5">
              <Droplet className="h-3 w-3 text-amber-400" />
              7-Day Fasting Glucose
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-light text-white font-serif">
                {weeklyAverages.glucoseAvg}
              </span>
              <span className="text-[11px] font-mono text-slate-500">mg/dL</span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold flex items-center gap-1 ${
            weeklyAverages.glucoseDelta <= 0
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {weeklyAverages.glucoseDelta <= 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
            <span>{weeklyAverages.glucoseDelta > 0 ? `+${weeklyAverages.glucoseDelta}` : weeklyAverages.glucoseDelta} mg/dL</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: AI Narrative Summary vs Sectional Breakdown vs Key Takeaways */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveSubTab('summary')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
            activeSubTab === 'summary'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          AI Narrative Summary
        </button>
        <button
          onClick={() => setActiveSubTab('breakdown')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
            activeSubTab === 'breakdown'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          Organ System Breakdown
        </button>
        <button
          onClick={() => setActiveSubTab('takeaways')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
            activeSubTab === 'takeaways'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          Key Actionable Takeaways
        </button>
      </div>

      {/* Active Tab Content */}
      {activeSubTab === 'summary' && (
        <div className="rounded-2xl border border-slate-800/80 bg-[#050505] p-5 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {insights.naturalLanguageSummary}
          </p>
        </div>
      )}

      {activeSubTab === 'breakdown' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800/80 bg-[#050505] p-4 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-rose-400 flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              Cardiovascular Dynamics
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {insights.cardiovascularInsight}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-[#050505] p-4 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5" />
              Autonomic Recovery
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {insights.stressRecoveryInsight}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-[#050505] p-4 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-400 flex items-center gap-1.5">
              <Droplet className="h-3.5 w-3.5" />
              Glycemic Stability
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {insights.glycemicMetabolicInsight}
            </p>
          </div>
        </div>
      )}

      {activeSubTab === 'takeaways' && (
        <div className="space-y-3">
          {insights.keyWeeklyTakeaways.map((takeaway, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800/80 bg-[#050505] p-4 flex items-start gap-3"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mt-0.5 text-[10px] font-mono font-bold">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {takeaway}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
