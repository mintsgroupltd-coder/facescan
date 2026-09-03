/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, Heart, Sparkles, Volume2, VolumeX, History, Sliders, ShieldCheck, FileText, Share2, Smartphone } from 'lucide-react';
import { audioController } from '../utils/audioFeedback';

interface NavbarProps {
  onOpenScanner: () => void;
  onOpenHistory: () => void;
  onOpenSamples: () => void;
  onOpenHealthReport?: () => void;
  onOpenShareSummary?: () => void;
  onOpenMobileApp?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  hasScanResult: boolean;
  activeTab: 'scan' | 'dashboard' | 'history';
  setActiveTab: (tab: 'scan' | 'dashboard' | 'history') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenScanner,
  onOpenHistory,
  onOpenSamples,
  onOpenHealthReport,
  onOpenShareSummary,
  onOpenMobileApp,
  isMuted,
  onToggleMute,
  hasScanResult,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-500/50">
            <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-light tracking-[0.2em] uppercase text-white">
                FaceVital <span className="text-cyan-400 font-semibold">AI</span>
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[10px] text-cyan-400 uppercase tracking-widest font-mono">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_6px_#22d3ee]"></div>
                Clinical rPPG
              </div>
            </div>
            <p className="hidden text-[11px] text-slate-500 uppercase tracking-wider sm:block">
              Photoplethysmography & Metabolic Proxy
            </p>
          </div>
        </div>

        {/* Center Navigation if scan results present */}
        {hasScanResult && (
          <nav className="hidden md:flex items-center rounded-full bg-[#050505] p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Heart className="h-3.5 w-3.5" />
              Telemetry
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                activeTab === 'history'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              Logs & Trends
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Audio Feedback Mute Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute vital sounds' : 'Mute vital sounds'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-[#050505] text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-slate-600" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
          </button>

          {/* Sample Profiles Picker */}
          <button
            onClick={onOpenSamples}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-800 bg-[#050505] px-3.5 py-2 text-xs font-medium tracking-wider uppercase text-slate-300 transition hover:border-cyan-500/40 hover:text-white"
          >
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            Presets
          </button>

          {/* Generate Health Report CTA */}
          {hasScanResult && onOpenHealthReport && (
            <button
              onClick={onOpenHealthReport}
              title="Generate printable PDF Health Report"
              className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold tracking-wider uppercase text-cyan-300 transition hover:bg-cyan-500/20 hover:border-cyan-500/60 shadow-[0_0_10px_rgba(34,211,238,0.15)] active:scale-95"
            >
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden md:inline">Health Report</span>
              <span className="md:hidden">PDF</span>
            </button>
          )}

          {/* Share Telemetry CTA */}
          {hasScanResult && onOpenShareSummary && (
            <button
              onClick={onOpenShareSummary}
              title="Share redacted telemetry summary link with healthcare provider"
              className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-[#070707] px-3.5 py-2 text-xs font-semibold tracking-wider uppercase text-slate-200 transition hover:border-cyan-500/50 hover:text-cyan-300 shadow-sm active:scale-95"
            >
              <Share2 className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Share Summary</span>
              <span className="lg:hidden">Share</span>
            </button>
          )}

          {/* Mobile & App Store Compilation Suite */}
          {onOpenMobileApp && (
            <button
              onClick={onOpenMobileApp}
              title="Compile and package for Apple iOS (App Store) or Google Android"
              className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold tracking-wider uppercase text-cyan-300 transition hover:bg-cyan-500/20 hover:border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)] active:scale-95"
            >
              <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Mobile App</span>
            </button>
          )}

          {/* New Scan CTA */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-cyan-400 transition-colors active:scale-95"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Scan Face</span>
          </button>
        </div>

      </div>
    </header>
  );
};
