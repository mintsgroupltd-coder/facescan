/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, X, Sun, Flame, Cookie, Activity, Moon, ArrowRight, Heart, Droplet } from 'lucide-react';
import { SAMPLE_PROFILES } from '../data/sampleProfiles';
import { FaceScanResult, SampleProfile } from '../types';

interface SampleProfileSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProfile: (profileData: FaceScanResult) => void;
}

export const SampleProfileSelector: React.FC<SampleProfileSelectorProps> = ({
  isOpen,
  onClose,
  onSelectProfile,
}) => {
  if (!isOpen) return null;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className="h-5 w-5 text-amber-400" />;
      case 'Flame':
        return <Flame className="h-5 w-5 text-rose-400" />;
      case 'Cookie':
        return <Cookie className="h-5 w-5 text-cyan-400" />;
      case 'Activity':
        return <Activity className="h-5 w-5 text-emerald-400" />;
      case 'Moon':
        return <Moon className="h-5 w-5 text-indigo-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-teal-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/95 p-4 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#0a0a0a] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-[#050505]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                Clinical Biomarker Profiles
              </h3>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">
                Simulate physiological and metabolic scenarios
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

        {/* Profile List */}
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-3">
          {SAMPLE_PROFILES.map((profile) => {
            const vitals = profile.previewData.vitals;

            return (
              <div
                key={profile.id}
                onClick={() => {
                  onSelectProfile(profile.previewData);
                  onClose();
                }}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#050505] p-4 transition-all hover:border-cyan-500/40 hover:bg-[#080808] cursor-pointer shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0a0a0a] border border-slate-800 group-hover:border-cyan-500/30 transition">
                    {renderIcon(profile.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition">
                        {profile.name}
                      </h4>
                      <span className="rounded-full bg-[#0a0a0a] px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-mono text-slate-400 border border-slate-800">
                        {profile.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {profile.description}
                    </p>
                  </div>
                </div>

                {/* Telemetry Pills */}
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <div className="flex items-center gap-1 text-xs font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    <Heart className="h-3 w-3" />
                    <span>{vitals.heartRate.value} BPM</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    <Droplet className="h-3 w-3" />
                    <span>{vitals.bloodSugarRisk.estimatedFastingMgDl} mg/dL</span>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a] text-slate-400 border border-slate-800 group-hover:bg-cyan-400 group-hover:text-black group-hover:border-cyan-400 transition">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-[#050505] px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-full bg-[#0a0a0a] border border-slate-800 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
