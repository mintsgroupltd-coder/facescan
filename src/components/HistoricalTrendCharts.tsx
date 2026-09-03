/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, ReferenceLine, CartesianGrid 
} from 'recharts';
import { 
  Heart, Flame, Droplet, Activity, TrendingUp, TrendingDown, 
  Calendar, Clock, Zap, Shield, Sparkles, Filter, ChevronRight,
  BarChart2, Info
} from 'lucide-react';
import { FaceScanResult } from '../types';

export type TimeRangeOption = '7d' | '4w' | '3m' | 'all';
export type MetricFocus = 'all' | 'heartRate' | 'stress' | 'bloodSugar';

interface HistoricalTrendChartsProps {
  history: FaceScanResult[];
  onSelectScan?: (scan: FaceScanResult) => void;
}

export const HistoricalTrendCharts: React.FC<HistoricalTrendChartsProps> = ({
  history,
  onSelectScan,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('7d');
  const [metricFocus, setMetricFocus] = useState<MetricFocus>('all');
  const [showOnlyFasting, setShowOnlyFasting] = useState<boolean>(false);

  // Filter history according to time range
  const filteredData = useMemo(() => {
    if (!history || history.length === 0) return [];

    const now = new Date().getTime();
    let cutoffMs = 0;

    if (timeRange === '7d') {
      cutoffMs = now - 7 * 24 * 60 * 60 * 1000;
    } else if (timeRange === '4w') {
      cutoffMs = now - 28 * 24 * 60 * 60 * 1000;
    } else if (timeRange === '3m') {
      cutoffMs = now - 90 * 24 * 60 * 60 * 1000;
    }

    // Sort chronologically ascending for graphs
    const sorted = [...history]
      .filter((scan) => {
        const scanTime = new Date(scan.timestamp).getTime();
        const matchesTime = cutoffMs === 0 || scanTime >= cutoffMs;
        if (!matchesTime) return false;
        if (showOnlyFasting) {
          return scan.userNotes?.toLowerCase().includes('fasting') || 
                 scan.vitals.bloodSugarRisk.fastingVsPostprandialContext.toLowerCase().includes('fasting');
        }
        return true;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // If timeRange is 3m or 4w and we have lots of points, we can format dates nicely
    return sorted.map((scan) => {
      const d = new Date(scan.timestamp);
      let label = '';
      if (timeRange === '7d') {
        label = d.toLocaleDateString(undefined, { weekday: 'short', hour: 'numeric' });
      } else if (timeRange === '4w') {
        label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } else {
        label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }

      return {
        id: scan.id,
        rawTimestamp: scan.timestamp,
        timestamp: scan.timestamp,
        dateLabel: label,
        fullDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        heartRate: scan.vitals.heartRate.value,
        stress: scan.vitals.stress.score,
        bloodSugar: scan.vitals.bloodSugarRisk.estimatedFastingMgDl,
        hrvRmssd: scan.vitals.hrv.rmssdMs,
        systolic: scan.vitals.bloodPressureEstimate.systolic,
        diastolic: scan.vitals.bloodPressureEstimate.diastolic,
        notes: scan.userNotes || '',
        riskLevel: scan.vitals.bloodSugarRisk.riskLevel,
        stressLevel: scan.vitals.stress.level,
        scanRef: scan,
      };
    });
  }, [history, timeRange, showOnlyFasting]);

  // Aggregate statistics calculations
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        hr: { avg: 0, min: 0, max: 0, delta: 0 },
        stress: { avg: 0, min: 0, max: 0, delta: 0 },
        glucose: { avg: 0, min: 0, max: 0, delta: 0 },
        count: 0,
      };
    }

    const hrVals = filteredData.map((d) => d.heartRate);
    const stressVals = filteredData.map((d) => d.stress);
    const glucoseVals = filteredData.map((d) => d.bloodSugar);

    const calcAvg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const calcMin = (arr: number[]) => Math.min(...arr);
    const calcMax = (arr: number[]) => Math.max(...arr);

    // Delta calculation: compare first half to second half of window
    const mid = Math.floor(filteredData.length / 2);
    const firstHalfHR = mid > 0 ? calcAvg(hrVals.slice(0, mid)) : hrVals[0];
    const secondHalfHR = mid > 0 ? calcAvg(hrVals.slice(mid)) : hrVals[0];
    const hrDelta = secondHalfHR - firstHalfHR;

    const firstHalfStress = mid > 0 ? calcAvg(stressVals.slice(0, mid)) : stressVals[0];
    const secondHalfStress = mid > 0 ? calcAvg(stressVals.slice(mid)) : stressVals[0];
    const stressDelta = secondHalfStress - firstHalfStress;

    const firstHalfGlucose = mid > 0 ? calcAvg(glucoseVals.slice(0, mid)) : glucoseVals[0];
    const secondHalfGlucose = mid > 0 ? calcAvg(glucoseVals.slice(mid)) : glucoseVals[0];
    const glucoseDelta = secondHalfGlucose - firstHalfGlucose;

    return {
      hr: {
        avg: calcAvg(hrVals),
        min: calcMin(hrVals),
        max: calcMax(hrVals),
        delta: hrDelta,
      },
      stress: {
        avg: calcAvg(stressVals),
        min: calcMin(stressVals),
        max: calcMax(stressVals),
        delta: stressDelta,
      },
      glucose: {
        avg: calcAvg(glucoseVals),
        min: calcMin(glucoseVals),
        max: calcMax(glucoseVals),
        delta: glucoseDelta,
      },
      count: filteredData.length,
    };
  }, [filteredData]);

  // Longitudinal clinical insights generator based on computed trends
  const trendAnalysis = useMemo(() => {
    const timeLabel = timeRange === '7d' ? 'past 7 days' : (timeRange === '4w' ? 'past 4 weeks' : (timeRange === '3m' ? 'past 3 months' : 'entire tracked period'));
    
    let hrMessage = `Resting heart rate averaged ${stats.hr.avg} BPM (range: ${stats.hr.min} - ${stats.hr.max} BPM).`;
    if (stats.hr.delta < -1) {
      hrMessage += ` Favorable downward trajectory (-${Math.abs(stats.hr.delta)} BPM) reflects improved cardiovascular recovery tone.`;
    } else if (stats.hr.delta > 2) {
      hrMessage += ` Mild upward elevation (+${stats.hr.delta} BPM) may indicate higher physical fatigue or stimulant intake.`;
    } else {
      hrMessage += ` Stable cardiovascular baseline within optimal aerobic parameters.`;
    }

    let stressMessage = `Autonomic stress score averaged ${stats.stress.avg}/100.`;
    if (stats.stress.avg < 35) {
      stressMessage += ` Parasympathetic dominant profile with robust vagal nerve tone across ${timeLabel}.`;
    } else if (stats.stress.avg < 60) {
      stressMessage += ` Moderate autonomic stress load; responsiveness improves following diaphragmatic breathing intervals.`;
    } else {
      stressMessage += ` Sympathetic overdrive detected; consider scheduling regular biofeedback resets.`;
    }

    let glucoseMessage = `Blood glucose proxy averaged ${stats.glucose.avg} mg/dL.`;
    if (stats.glucose.avg <= 95) {
      glucoseMessage += ` Glycemic control is optimal with tight fasting stability.`;
    } else if (stats.glucose.avg <= 115) {
      glucoseMessage += ` Normal overall range with periodic postprandial carb excursions peaking at ${stats.glucose.max} mg/dL.`;
    } else {
      glucoseMessage += ` Elevated glycemic risk pattern; low-glycemic fiber sequencing recommended.`;
    }

    return { hrMessage, stressMessage, glucoseMessage, timeLabel };
  }, [stats, timeRange]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-2xl border border-slate-700 bg-[#0a0a0a]/95 p-4 shadow-2xl backdrop-blur-md text-xs space-y-2 max-w-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
              {data.fullDate}
            </span>
            <span className="rounded-full bg-[#050505] px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-cyan-400 border border-slate-800">
              Telemetry Log
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5 text-rose-400">
                <Heart className="h-3 w-3" /> Heart Rate:
              </span>
              <span className="font-bold text-slate-100">{data.heartRate} BPM</span>
            </div>

            <div className="flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Flame className="h-3 w-3" /> Stress Score:
              </span>
              <span className="font-bold text-slate-100">{data.stress}/100</span>
            </div>

            <div className="flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Droplet className="h-3 w-3" /> Blood Sugar:
              </span>
              <span className="font-bold text-slate-100">{data.bloodSugar} mg/dL</span>
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
              <span>HRV RMSSD:</span>
              <span className="text-cyan-300">{data.hrvRmssd} ms</span>
            </div>
          </div>

          {data.notes && (
            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 italic">
              "{data.notes}"
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Control Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 shadow-xl">
        
        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-[#050505] p-1 border border-slate-800">
          <button
            onClick={() => setMetricFocus('all')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              metricFocus === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            All Vitals
          </button>
          
          <button
            onClick={() => setMetricFocus('heartRate')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              metricFocus === 'heartRate'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Heart className="h-3.5 w-3.5 text-rose-400" />
            Heart Rate
          </button>

          <button
            onClick={() => setMetricFocus('stress')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              metricFocus === 'stress'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-emerald-400" />
            Stress Level
          </button>

          <button
            onClick={() => setMetricFocus('bloodSugar')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              metricFocus === 'bloodSugar'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Droplet className="h-3.5 w-3.5 text-cyan-400" />
            Blood Sugar
          </button>
        </div>

        {/* Time Range Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-[#050505] p-1 border border-slate-800">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest font-mono transition ${
                timeRange === '7d'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Days (7D)
            </button>
            <button
              onClick={() => setTimeRange('4w')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest font-mono transition ${
                timeRange === '4w'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weeks (4W)
            </button>
            <button
              onClick={() => setTimeRange('3m')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest font-mono transition ${
                timeRange === '3m'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Months (3M)
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest font-mono transition ${
                timeRange === 'all'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
          </div>

          {metricFocus === 'bloodSugar' && (
            <button
              onClick={() => setShowOnlyFasting(!showOnlyFasting)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border transition ${
                showOnlyFasting
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-[#050505] text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Filter className="h-3 w-3" />
              {showOnlyFasting ? 'Fasting Only' : 'All Readings'}
            </button>
          )}
        </div>
      </div>

      {/* Aggregate KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Heart Rate KPI Card */}
        <div 
          onClick={() => setMetricFocus('heartRate')}
          className={`cursor-pointer rounded-3xl border p-5 transition-all ${
            metricFocus === 'heartRate' || metricFocus === 'all'
              ? 'border-slate-800 bg-[#0a0a0a] shadow-lg'
              : 'border-slate-800/60 bg-[#0a0a0a]/60 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              Heart Rate Trend
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono">
              {stats.hr.delta <= 0 ? (
                <span className="text-emerald-400 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-0.5" /> {Math.abs(stats.hr.delta)} BPM
                </span>
              ) : (
                <span className="text-amber-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +{stats.hr.delta} BPM
                </span>
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-light font-mono text-white">
              {stats.hr.avg}
            </span>
            <span className="text-xs font-mono text-rose-400 uppercase">Avg BPM</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
            <span>Range: {stats.hr.min} - {stats.hr.max} BPM</span>
            <span className="text-slate-400">Target: 60-100</span>
          </div>
        </div>

        {/* Stress Level KPI Card */}
        <div 
          onClick={() => setMetricFocus('stress')}
          className={`cursor-pointer rounded-3xl border p-5 transition-all ${
            metricFocus === 'stress' || metricFocus === 'all'
              ? 'border-slate-800 bg-[#0a0a0a] shadow-lg'
              : 'border-slate-800/60 bg-[#0a0a0a]/60 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-emerald-400" />
              Autonomic Stress
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono">
              {stats.stress.delta <= 0 ? (
                <span className="text-emerald-400 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-0.5" /> -{Math.abs(stats.stress.delta)} pts
                </span>
              ) : (
                <span className="text-amber-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +{stats.stress.delta} pts
                </span>
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-light font-mono text-white">
              {stats.stress.avg}
            </span>
            <span className="text-xs font-mono text-emerald-400 uppercase">/100 Score</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
            <span>Range: {stats.stress.min} - {stats.stress.max}</span>
            <span className="text-slate-400">
              {stats.stress.avg < 35 ? 'Relaxed' : (stats.stress.avg < 60 ? 'Moderate' : 'Elevated')}
            </span>
          </div>
        </div>

        {/* Blood Sugar KPI Card */}
        <div 
          onClick={() => setMetricFocus('bloodSugar')}
          className={`cursor-pointer rounded-3xl border p-5 transition-all ${
            metricFocus === 'bloodSugar' || metricFocus === 'all'
              ? 'border-slate-800 bg-[#0a0a0a] shadow-lg'
              : 'border-slate-800/60 bg-[#0a0a0a]/60 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
              <Droplet className="h-3.5 w-3.5 text-cyan-400" />
              Blood Sugar Proxy
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono">
              {stats.glucose.delta <= 0 ? (
                <span className="text-emerald-400 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-0.5" /> {Math.abs(stats.glucose.delta)} mg/dL
                </span>
              ) : (
                <span className="text-cyan-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +{stats.glucose.delta} mg/dL
                </span>
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-light font-mono text-white">
              {stats.glucose.avg}
            </span>
            <span className="text-xs font-mono text-cyan-400 uppercase">mg/dL</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
            <span>Range: {stats.glucose.min} - {stats.glucose.max}</span>
            <span className="text-slate-400">Target Fasting: 70-99</span>
          </div>
        </div>

      </div>

      {/* Main Visual Chart Container */}
      <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Chart Title and Dynamic Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-light uppercase tracking-wide text-white font-serif flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-cyan-400" />
              {metricFocus === 'all' && 'Synchronized Multi-Vital Telemetry Curves'}
              {metricFocus === 'heartRate' && 'Longitudinal Heart Rate & Resting Baseline'}
              {metricFocus === 'stress' && 'Autonomic Stress Index & Vagal Reactivity'}
              {metricFocus === 'bloodSugar' && 'Estimated Blood Sugar & Glycemic Dynamics'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Resolution: {timeRange === '7d' ? 'Hourly / Diurnal Scans' : (timeRange === '4w' ? 'Daily Longitudinal Averages' : 'Multi-Month Rolling Track')} &bull; {filteredData.length} records analyzed
            </p>
          </div>

          {/* Dynamic Legend */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {(metricFocus === 'all' || metricFocus === 'heartRate') && (
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
                <span className="text-slate-300">HR (BPM)</span>
              </div>
            )}
            {(metricFocus === 'all' || metricFocus === 'stress') && (
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                <span className="text-slate-300">Stress (/100)</span>
              </div>
            )}
            {(metricFocus === 'all' || metricFocus === 'bloodSugar') && (
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                <span className="text-slate-300">Glucose (mg/dL)</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-80 w-full">
          {filteredData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              No historical data points in selected window.
            </div>
          ) : metricFocus === 'all' ? (
            /* Multi-Metric Combined Chart */
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  domain={[30, 160]} 
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                
                <Area
                  type="monotone"
                  dataKey="bloodSugar"
                  name="Blood Sugar (mg/dL)"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGlucose)"
                />
                <Area
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (BPM)"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHr)"
                />
                <Area
                  type="monotone"
                  dataKey="stress"
                  name="Stress Level"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStress)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : metricFocus === 'heartRate' ? (
            /* Dedicated Heart Rate Chart */
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  domain={[50, 130]} 
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Clinical Normal Bounds: 60 - 100 BPM */}
                <ReferenceLine y={60} stroke="#334155" strokeDasharray="3 3" label={{ value: '60 BPM (Lower Normal)', fill: '#64748b', fontSize: 9, position: 'insideTopLeft' }} />
                <ReferenceLine y={100} stroke="#334155" strokeDasharray="3 3" label={{ value: '100 BPM (Upper Normal)', fill: '#64748b', fontSize: 9, position: 'insideTopLeft' }} />
                
                <Area
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#hrGrad)"
                  activeDot={{ r: 5, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : metricFocus === 'stress' ? (
            /* Dedicated Autonomic Stress Chart */
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  domain={[0, 100]} 
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Reference Zones */}
                <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label={{ value: '30 (Relaxed Zone)', fill: '#10b981', fontSize: 9, position: 'insideBottomLeft' }} />
                <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '60 (Elevated Stress)', fill: '#f59e0b', fontSize: 9, position: 'insideBottomLeft' }} />
                
                <Area
                  type="monotone"
                  dataKey="stress"
                  name="Stress Level"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#stressGrad)"
                  activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            /* Dedicated Blood Sugar Chart */
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  domain={[60, 180]} 
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Clinical Fasting & Postprandial Reference Thresholds */}
                <ReferenceLine y={99} stroke="#10b981" strokeDasharray="3 3" label={{ value: '99 mg/dL (Optimal Fasting Ceiling)', fill: '#10b981', fontSize: 9, position: 'insideBottomLeft' }} />
                <ReferenceLine y={125} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '125 mg/dL (Pre-diabetic Watch Boundary)', fill: '#f59e0b', fontSize: 9, position: 'insideBottomLeft' }} />
                
                <Area
                  type="monotone"
                  dataKey="bloodSugar"
                  name="Estimated Blood Sugar"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#glucoseGrad)"
                  activeDot={{ r: 5, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* AI & Clinical Longitudinal Insights */}
        <div className="rounded-2xl border border-slate-800 bg-[#050505] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Longitudinal Physiological Findings ({trendAnalysis.timeLabel})
            </span>
            <span className="text-[10px] font-mono text-slate-500">Gemini 3.7 Flash Analysis</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800/60 bg-[#0a0a0a] p-3 space-y-1">
              <span className="font-bold text-rose-400 block text-[10px] uppercase font-mono tracking-wider">
                1. Cardiovascular Stability
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {trendAnalysis.hrMessage}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/60 bg-[#0a0a0a] p-3 space-y-1">
              <span className="font-bold text-emerald-400 block text-[10px] uppercase font-mono tracking-wider">
                2. Autonomic Recovery Tone
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {trendAnalysis.stressMessage}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/60 bg-[#0a0a0a] p-3 space-y-1">
              <span className="font-bold text-cyan-400 block text-[10px] uppercase font-mono tracking-wider">
                3. Glycemic Dynamics
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {trendAnalysis.glucoseMessage}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
