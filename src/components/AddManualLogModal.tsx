/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Heart, Droplet, Flame, FileText, CheckCircle2 } from 'lucide-react';
import { FaceScanResult } from '../types';
import { createSyntheticScan } from '../utils/historyStorage';

interface AddManualLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLog: (scan: FaceScanResult) => void;
}

export const AddManualLogModal: React.FC<AddManualLogModalProps> = ({
  isOpen,
  onClose,
  onAddLog,
}) => {
  const [heartRate, setHeartRate] = useState<number>(72);
  const [stressScore, setStressScore] = useState<number>(35);
  const [bloodSugar, setBloodSugar] = useState<number>(92);
  const [hrvRmssd, setHrvRmssd] = useState<number>(55);
  const [systolic, setSystolic] = useState<number>(118);
  const [diastolic, setDiastolic] = useState<number>(76);
  const [notes, setNotes] = useState<string>('');
  const [contextType, setContextType] = useState<'fasting' | 'post_meal' | 'resting' | 'post_workout'>('resting');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const glucoseRisk = bloodSugar <= 99 ? 'Optimal' : (bloodSugar <= 125 ? 'Pre-diabetic Watch' : 'Elevated Glycemic Risk');

    const manualScan = createSyntheticScan({
      id: `manual_${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceMode: 'sample_profile',
      userNotes: notes || `Manual log (${contextType.replace('_', ' ')})`,
      hr: heartRate,
      stress: stressScore,
      glucose: bloodSugar,
      glucoseLevel: glucoseRisk,
      hrv: hrvRmssd,
      systolic,
      diastolic,
      spO2: 98,
      respiration: 15,
    });

    onAddLog(manualScan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 p-4 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#0a0a0a] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-[#050505]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                Log Vital Sign Record
              </h3>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">
                Add manual clinical or device readings to history
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-[#050505] hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Context Selector */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-1.5">
              Reading Context
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'fasting', label: 'Fasting' },
                { id: 'post_meal', label: 'Post-Meal' },
                { id: 'resting', label: 'Resting' },
                { id: 'post_workout', label: 'Workout' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setContextType(item.id as any)}
                  className={`py-2 px-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition border ${
                    contextType === item.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                      : 'bg-[#050505] text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Heart Rate */}
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Heart className="h-3 w-3 text-rose-400" /> HR (BPM)
                </span>
                <span className="text-xs font-mono font-bold text-rose-400">{heartRate}</span>
              </div>
              <input
                type="range"
                min="45"
                max="160"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Stress Level */}
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Flame className="h-3 w-3 text-emerald-400" /> Stress (0-100)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">{stressScore}</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={stressScore}
                onChange={(e) => setStressScore(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Blood Sugar */}
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Droplet className="h-3 w-3 text-cyan-400" /> Glucose (mg/dL)
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">{bloodSugar}</span>
              </div>
              <input
                type="range"
                min="65"
                max="190"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>
          </div>

          {/* Secondary Vitals */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-3 space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                HRV RMSSD (ms)
              </label>
              <input
                type="number"
                min="15"
                max="140"
                value={hrvRmssd}
                onChange={(e) => setHrvRmssd(Number(e.target.value))}
                className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="rounded-2xl border border-slate-800 bg-[#050505] p-3 space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                Blood Pressure (mmHg)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="80"
                  max="190"
                  value={systolic}
                  onChange={(e) => setSystolic(Number(e.target.value))}
                  placeholder="Sys"
                  className="w-1/2 bg-[#0a0a0a] border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono text-center focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-slate-600">/</span>
                <input
                  type="number"
                  min="50"
                  max="120"
                  value={diastolic}
                  onChange={(e) => setDiastolic(Number(e.target.value))}
                  placeholder="Dia"
                  className="w-1/2 bg-[#0a0a0a] border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono text-center focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
              User Notes / Activity Context
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 10 hours fasting, slept well, feeling energetic"
              className="w-full bg-[#050505] border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#050505] border border-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-cyan-400 transition-colors"
            >
              Save Vital Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
