/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Droplet, 
  Wind, 
  Utensils, 
  Heart, 
  Moon, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Zap, 
  Clock, 
  Info, 
  Check, 
  Play, 
  Footprints, 
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FaceScanResult, HealthRecommendation, RecommendationCategory } from '../types';
import { fetchPersonalizedRecommendations, computeClientRecommendations } from '../utils/recommendationEngine';

interface PersonalizedRecommendationsCardProps {
  scan: FaceScanResult;
  onOpenBreathing: () => void;
}

export const PersonalizedRecommendationsCard: React.FC<PersonalizedRecommendationsCardProps> = ({
  scan,
  onOpenBreathing,
}) => {
  const [recommendations, setRecommendations] = useState<HealthRecommendation[]>(() => {
    return computeClientRecommendations(scan);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | RecommendationCategory>('all');
  const [expandedRationaleIds, setExpandedRationaleIds] = useState<Record<string, boolean>>({});
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});
  const [activeWalkTimer, setActiveWalkTimer] = useState<{ active: boolean; secondsLeft: number } | null>(null);

  // Re-generate recommendations when the scan ID changes
  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPersonalizedRecommendations(scan);
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecommendations(computeClientRecommendations(scan));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [scan.id]);

  // Walk countdown timer ticker
  useEffect(() => {
    let interval: any = null;
    if (activeWalkTimer?.active && activeWalkTimer.secondsLeft > 0) {
      interval = setInterval(() => {
        setActiveWalkTimer((prev) => {
          if (!prev || prev.secondsLeft <= 1) {
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
            return null;
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeWalkTimer?.active, activeWalkTimer?.secondsLeft]);

  const toggleRationale = (id: string) => {
    setExpandedRationaleIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleCompleted = (id: string) => {
    const isNowCompleted = !completedIds[id];
    setCompletedIds((prev) => ({
      ...prev,
      [id]: isNowCompleted,
    }));

    if (isNowCompleted) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#22d3ee', '#10b981', '#ffffff'],
      });
    }
  };

  const filteredRecs = selectedCategory === 'all'
    ? recommendations
    : recommendations.filter((r) => r.category === selectedCategory);

  const completedCount = Object.values(completedIds).filter(Boolean).length;
  const progressPercent = recommendations.length > 0
    ? Math.round((completedCount / recommendations.length) * 100)
    : 0;

  const getCategoryIcon = (category: RecommendationCategory) => {
    switch (category) {
      case 'hydration':
        return <Droplet className="h-4 w-4 text-cyan-400" />;
      case 'relaxation':
        return <Wind className="h-4 w-4 text-emerald-400" />;
      case 'nutrition':
        return <Utensils className="h-4 w-4 text-amber-400" />;
      case 'cardiovascular':
        return <Heart className="h-4 w-4 text-rose-400" />;
      case 'circadian':
        return <Moon className="h-4 w-4 text-indigo-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Immediate Priority
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
            High Impact
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            Daily Routine
          </span>
        );
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 h-56 w-56 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header & Biometric Drivers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-base font-light tracking-wide uppercase text-white font-serif">
              Personalized Recommendation Engine
            </h3>
            <span className="rounded-full bg-[#050505] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-cyan-400 border border-cyan-500/30">
              Adaptive
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Calibrated to: <strong className="text-slate-300 font-mono">HR {scan.vitals.heartRate.value} BPM</strong> &bull; <strong className="text-slate-300 font-mono">Stress {scan.vitals.stress.score}%</strong> &bull; <strong className="text-slate-300 font-mono">Est. Glucose {scan.vitals.bloodSugarRisk.estimatedFastingMgDl} mg/dL</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Completion pill */}
          <div className="rounded-full border border-slate-800 bg-[#050505] px-3 py-1 text-xs text-slate-400 flex items-center gap-2">
            <span>Actions: <strong className="text-cyan-400">{completedCount}/{recommendations.length}</strong></span>
            <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <button
            onClick={loadRecommendations}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-[#050505] px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition disabled:opacity-50"
            title="Recalculate AI Health Tips"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        </div>
      </div>

      {/* Walk timer banner if active */}
      {activeWalkTimer && (
        <div className="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <Footprints className="h-5 w-5 text-cyan-400" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Post-Meal Stroll in Progress</h4>
              <p className="text-[11px] text-cyan-300">Activating muscle GLUT4 receptors to clear glucose</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono font-bold text-cyan-300">
              {Math.floor(activeWalkTimer.secondsLeft / 60)}:{(activeWalkTimer.secondsLeft % 60).toString().padStart(2, '0')}
            </span>
            <button
              onClick={() => setActiveWalkTimer(null)}
              className="text-[10px] text-slate-400 hover:text-white uppercase font-mono px-2 py-1 bg-black/40 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <span>All Tips</span>
          <span className="text-[10px] opacity-70 font-mono">({recommendations.length})</span>
        </button>

        <button
          onClick={() => setSelectedCategory('hydration')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition shrink-0 ${
            selectedCategory === 'hydration'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Droplet className="h-3 w-3" />
          <span>Hydration</span>
        </button>

        <button
          onClick={() => setSelectedCategory('relaxation')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition shrink-0 ${
            selectedCategory === 'relaxation'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Wind className="h-3 w-3" />
          <span>Relaxation & Vagus</span>
        </button>

        <button
          onClick={() => setSelectedCategory('nutrition')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition shrink-0 ${
            selectedCategory === 'nutrition'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Utensils className="h-3 w-3" />
          <span>Nutrition & Glycemic</span>
        </button>

        <button
          onClick={() => setSelectedCategory('cardiovascular')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition shrink-0 ${
            selectedCategory === 'cardiovascular'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Heart className="h-3 w-3" />
          <span>Cardio Movement</span>
        </button>

        <button
          onClick={() => setSelectedCategory('circadian')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition shrink-0 ${
            selectedCategory === 'circadian'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Moon className="h-3 w-3" />
          <span>Circadian Sleep</span>
        </button>
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => {
          const isExpanded = Boolean(expandedRationaleIds[rec.id]);
          const isDone = Boolean(completedIds[rec.id]);

          return (
            <div
              key={rec.id}
              className={`rounded-2xl border transition-all duration-300 p-5 ${
                isDone
                  ? 'border-emerald-500/30 bg-[#07130e]/60 opacity-80'
                  : 'border-slate-800/80 bg-[#050505] hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="p-1.5 rounded-lg bg-[#0a0a0a] border border-slate-800">
                    {getCategoryIcon(rec.category)}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-slate-400">
                    {rec.category}
                  </span>
                  {getPriorityBadge(rec.priority)}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                    {rec.impactBadge}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-[11px] font-mono">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>{rec.timeframe}</span>
                </div>
              </div>

              {/* Title & Action Step */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h4 className={`text-sm font-semibold tracking-wide ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                    {rec.title}
                  </h4>
                  <button
                    onClick={() => toggleCompleted(rec.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                      isDone
                        ? 'bg-emerald-500 text-black shadow-[0_0_10px_#10b981]'
                        : 'border border-slate-700 bg-[#0a0a0a] text-slate-300 hover:text-white hover:border-cyan-500'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-3.5 w-3.5" />
                        <span>Mark Done</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {rec.actionText}
                </p>
              </div>

              {/* Action Buttons & Expandable Scientific Rationale */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Specific action trigger */}
                <div className="flex items-center gap-2">
                  {rec.actionType === 'breathing' && (
                    <button
                      onClick={onOpenBreathing}
                      className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/30 transition"
                    >
                      <Play className="h-3 w-3 fill-emerald-400" />
                      <span>Start Biofeedback</span>
                    </button>
                  )}

                  {rec.actionType === 'hydration_log' && (
                    <button
                      onClick={() => toggleCompleted(rec.id)}
                      className="flex items-center gap-1.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-cyan-500/30 transition"
                    >
                      <Droplet className="h-3 w-3" />
                      <span>Log +500ml Water</span>
                    </button>
                  )}

                  {rec.actionType === 'walk_timer' && (
                    <button
                      onClick={() => setActiveWalkTimer({ active: true, secondsLeft: 600 })}
                      className="flex items-center gap-1.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-rose-500/30 transition"
                    >
                      <Timer className="h-3 w-3" />
                      <span>Start 10m Walk Timer</span>
                    </button>
                  )}
                </div>

                {/* Rationale Toggle */}
                <button
                  onClick={() => toggleRationale(rec.id)}
                  className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-wider font-mono self-start sm:self-auto"
                >
                  <Info className="h-3 w-3 text-cyan-400" />
                  <span>Physiological Rationale</span>
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>

              {/* Collapsible Rationale Explanation */}
              {isExpanded && (
                <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-xs text-cyan-200 leading-relaxed font-sans animate-in fade-in duration-200">
                  <strong className="block text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1">
                    Bio-Physiological Mechanism:
                  </strong>
                  {rec.rationale}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
