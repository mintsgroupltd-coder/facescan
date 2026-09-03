/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Activity, Heart, Droplet, Flame, Wind, Sparkles, Shield, Camera, 
  Bot, History, FileText, CheckCircle2, AlertTriangle, ArrowRight, 
  RotateCcw, Sliders, Volume2, VolumeX, Eye, TrendingUp, Share2, Smartphone 
} from 'lucide-react';

import { Navbar } from './components/Navbar';
import { ScannerHUD } from './components/ScannerHUD';
import { VitalsSummaryGrid } from './components/VitalsSummaryGrid';
import { MetabolicBloodSugarDeepDive } from './components/MetabolicBloodSugarDeepDive';
import { StressAutonomicDeepDive } from './components/StressAutonomicDeepDive';
import { BreathingBiofeedbackModal } from './components/BreathingBiofeedbackModal';
import { AIHealthCoachChat } from './components/AIHealthCoachChat';
import { SampleProfileSelector } from './components/SampleProfileSelector';
import { ScanHistoryView } from './components/ScanHistoryView';
import { WeeklyHealthInsightsCard } from './components/WeeklyHealthInsightsCard';
import { PersonalizedRecommendationsCard } from './components/PersonalizedRecommendationsCard';
import { HistoricalTrendCharts } from './components/HistoricalTrendCharts';
import { BloodPressureCardiacDeepDive } from './components/BloodPressureCardiacDeepDive';
import { RiskForecastingSimulationView } from './components/RiskForecastingSimulationView';
import { BmiBreathingHrvDeepDive } from './components/BmiBreathingHrvDeepDive';
import { HealthReportModal } from './components/HealthReportModal';
import { ShareSummaryModal } from './components/ShareSummaryModal';
import { ProviderSharedView } from './components/ProviderSharedView';
import { MobileAppModal } from './components/MobileAppModal';

import { SAMPLE_PROFILES } from './data/sampleProfiles';
import { audioController } from './utils/audioFeedback';
import { loadVitalHistory, saveVitalHistory, generateRealisticHistoricalData } from './utils/historyStorage';
import { extractShareTokenFromUrl, decodeSharePayload } from './utils/shareLinkEncoder';
import { FaceScanResult, SharedReportPayload } from './types';

export default function App() {
  // Primary App States
  const [currentScan, setCurrentScan] = useState<FaceScanResult>(SAMPLE_PROFILES[0].previewData);
  const [history, setHistory] = useState<FaceScanResult[]>(() => {
    return loadVitalHistory();
  });

  const [activeNavTab, setActiveNavTab] = useState<'scan' | 'dashboard' | 'history'>('dashboard');
  const [activeDashboardTab, setActiveDashboardTab] = useState<'overview' | 'bp-cardiac' | 'risk-forecast' | 'metabolic' | 'biometrics' | 'stress' | 'insights' | 'recommendations' | 'coach'>('overview');
  
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isSamplePickerOpen, setIsSamplePickerOpen] = useState<boolean>(false);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState<boolean>(false);
  const [isHealthReportOpen, setIsHealthReportOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isMobileAppModalOpen, setIsMobileAppModalOpen] = useState<boolean>(false);
  const [scanToShare, setScanToShare] = useState<FaceScanResult | null>(null);
  const [sharedPayload, setSharedPayload] = useState<SharedReportPayload | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Parse share payload from URL hash or query params
  useEffect(() => {
    const checkUrlForShare = () => {
      const token = extractShareTokenFromUrl();
      if (token) {
        const decoded = decodeSharePayload(token);
        if (decoded) {
          setSharedPayload(decoded);
          return;
        }
      }
      setSharedPayload(null);
    };

    checkUrlForShare();
    window.addEventListener('hashchange', checkUrlForShare);
    window.addEventListener('popstate', checkUrlForShare);
    return () => {
      window.removeEventListener('hashchange', checkUrlForShare);
      window.removeEventListener('popstate', checkUrlForShare);
    };
  }, []);

  // Sync history to localStorage
  useEffect(() => {
    saveVitalHistory(history);
  }, [history]);

  const handleExitSharedView = () => {
    setSharedPayload(null);
    try {
      if (window.history && window.history.pushState) {
        const cleanUrl = window.location.pathname + window.location.search.replace(/[?&]share=[^&]*/, '');
        window.history.pushState('', document.title, cleanUrl || '/');
      } else {
        window.location.hash = '';
      }
    } catch (e) {
      window.location.hash = '';
    }
  };

  const handleOpenShareModal = (scan?: FaceScanResult) => {
    setScanToShare(scan || currentScan);
    setIsShareModalOpen(true);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioController.isMuted = nextMute;
  };

  const handleScanComplete = (result: FaceScanResult) => {
    setCurrentScan(result);
    setHistory((prev) => [result, ...prev]);
    setIsScannerOpen(false);
    setActiveNavTab('dashboard');
    setActiveDashboardTab('overview');

    // Trigger celebratory particle effect
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2dd4bf', '#06b6d4', '#10b981'],
      });
    } catch (e) {
      // Ignore
    }
  };

  const handleSelectSample = (sampleData: FaceScanResult) => {
    setCurrentScan(sampleData);
    setHistory((prev) => [sampleData, ...prev]);
    setIsSamplePickerOpen(false);
    setIsScannerOpen(false);
    setActiveNavTab('dashboard');
    setActiveDashboardTab('overview');
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('facevital_scan_history');
    } catch (e) {
      // Ignore
    }
  };

  const handleSeedHistory = (days: number) => {
    const syntheticData = generateRealisticHistoricalData(days);
    if (currentScan) {
      syntheticData.unshift(currentScan);
    }
    setHistory(syntheticData);
    saveVitalHistory(syntheticData);
  };

  const handleAddLog = (newScan: FaceScanResult) => {
    setHistory((prev) => [newScan, ...prev]);
    setCurrentScan(newScan);
  };

  const handleDeleteScan = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // If a shared telemetry payload is present in the URL, render the recipient Provider Shared View
  if (sharedPayload) {
    return (
      <ProviderSharedView
        payload={sharedPayload}
        onExit={handleExitSharedView}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navigation */}
      <Navbar
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenHistory={() => setActiveNavTab('history')}
        onOpenSamples={() => setIsSamplePickerOpen(true)}
        onOpenHealthReport={() => setIsHealthReportOpen(true)}
        onOpenShareSummary={() => handleOpenShareModal(currentScan)}
        onOpenMobileApp={() => setIsMobileAppModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        hasScanResult={Boolean(currentScan)}
        activeTab={activeNavTab}
        setActiveTab={setActiveNavTab}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Scanner HUD Modal */}
        {isScannerOpen && (
          <ScannerHUD
            onScanComplete={handleScanComplete}
            onCancel={() => setIsScannerOpen(false)}
            onSelectSample={() => {
              setIsScannerOpen(false);
              setIsSamplePickerOpen(true);
            }}
          />
        )}

        {/* Clinical Sample Presets Picker Modal */}
        <SampleProfileSelector
          isOpen={isSamplePickerOpen}
          onClose={() => setIsSamplePickerOpen(false)}
          onSelectProfile={handleSelectSample}
        />

        {/* Breathing Biofeedback Trainer Modal */}
        <BreathingBiofeedbackModal
          isOpen={isBreathingModalOpen}
          onClose={() => setIsBreathingModalOpen(false)}
        />

        {/* Printable Health Report Modal */}
        <HealthReportModal
          isOpen={isHealthReportOpen}
          onClose={() => setIsHealthReportOpen(false)}
          scan={currentScan}
          history={history}
          onOpenShareSummary={() => handleOpenShareModal(currentScan)}
        />

        {/* Secure Provider Share Summary Modal */}
        <ShareSummaryModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          scan={scanToShare || currentScan}
        />

        {/* Apple iOS & Google Android Mobile Compilation Studio Modal */}
        <MobileAppModal
          isOpen={isMobileAppModalOpen}
          onClose={() => setIsMobileAppModalOpen(false)}
        />

        {/* Active View Router */}
        {activeNavTab === 'history' ? (
          <ScanHistoryView
            history={history}
            onSelectScan={(scan) => {
              setCurrentScan(scan);
              setActiveNavTab('dashboard');
              setActiveDashboardTab('overview');
            }}
            onClearHistory={handleClearHistory}
            onSeedHistory={handleSeedHistory}
            onAddLog={handleAddLog}
            onDeleteScan={handleDeleteScan}
            onOpenHealthReport={(scan) => {
              if (scan) setCurrentScan(scan);
              setIsHealthReportOpen(true);
            }}
            onOpenShareSummary={(scan) => {
              handleOpenShareModal(scan || history[0]);
            }}
          />
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Scan Context Bar & Sub-Tabs */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3.5">
                <div className="flex items-center gap-3.5">
                  {currentScan.rawSnapshotDataUrl ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-cyan-500/40">
                      <img
                        src={currentScan.rawSnapshotDataUrl}
                        alt="Facial snapshot"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      <Activity className="h-6 w-6" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-light tracking-wide uppercase text-white font-serif">
                        Physiological Telemetry
                      </h2>
                      <span className="rounded-full bg-[#050505] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-slate-400 border border-slate-800">
                        {currentScan.sourceMode === 'live_webcam' ? 'Live Optical Scan' : 'Clinical Preset'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Recorded {new Date(currentScan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; rPPG Micro-vascular Hemoglobin & Vision AI
                    </p>
                  </div>
                </div>

                {/* Direct Action Buttons: Mobile App, Share Summary & Generate Health Report */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsMobileAppModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition shadow-sm active:scale-95 shrink-0"
                    title="Package for Apple iOS App Store or Google Android"
                  >
                    <Smartphone className="h-4 w-4 text-cyan-400" />
                    <span>Mobile App</span>
                  </button>

                  <button
                    onClick={() => handleOpenShareModal(currentScan)}
                    className="flex items-center gap-2 rounded-full border border-slate-700 bg-[#070707] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300 transition shadow-sm active:scale-95 shrink-0"
                    title="Share a secure, redacted telemetry link with healthcare provider"
                  >
                    <Share2 className="h-4 w-4 text-cyan-400" />
                    <span>Share Summary</span>
                  </button>

                  <button
                    onClick={() => setIsHealthReportOpen(true)}
                    className="flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/70 transition shadow-[0_0_12px_rgba(34,211,238,0.15)] active:scale-95 shrink-0"
                    title="Generate printable PDF Health Report for this session"
                  >
                    <FileText className="h-4 w-4 text-cyan-400" />
                    <span>Health Report</span>
                  </button>
                </div>
              </div>

              {/* Dashboard Sub-Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-[#050505] p-1 border border-slate-800">
                <button
                  onClick={() => setActiveDashboardTab('overview')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                    activeDashboardTab === 'overview'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveDashboardTab('bp-cardiac')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                    activeDashboardTab === 'bp-cardiac'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Heart className="h-3.5 w-3.5" />
                  BP & Cardiac
                </button>
                <button
                  onClick={() => setActiveDashboardTab('risk-forecast')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                    activeDashboardTab === 'risk-forecast'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Risk Sandbox
                </button>
                <button
                  onClick={() => setActiveDashboardTab('metabolic')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                    activeDashboardTab === 'metabolic'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Droplet className="h-3.5 w-3.5" />
                  Blood Sugar
                </button>
                <button
                  onClick={() => setActiveDashboardTab('biometrics')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                    activeDashboardTab === 'biometrics'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Wind className="h-3.5 w-3.5" />
                  BMI & Breathing
                </button>
                <button
                  onClick={() => setActiveDashboardTab('stress')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                    activeDashboardTab === 'stress'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Flame className="h-3.5 w-3.5" />
                  Stress & HRV
                </button>
                <button
                  onClick={() => setActiveDashboardTab('insights')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                    activeDashboardTab === 'insights'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Trends
                </button>
                <button
                  onClick={() => setActiveDashboardTab('recommendations')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                    activeDashboardTab === 'recommendations'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Protocols
                </button>
                <button
                  onClick={() => setActiveDashboardTab('coach')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                    activeDashboardTab === 'coach'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Bot className="h-3.5 w-3.5" />
                  AI Coach
                </button>
              </div>
            </div>

            {/* Sub-Tab View Rendering */}
            {activeDashboardTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Primary Vitals Summary Cards */}
                <VitalsSummaryGrid
                  scan={currentScan}
                  onOpenBreathing={() => setIsBreathingModalOpen(true)}
                  onSelectTab={setActiveDashboardTab}
                  onOpenHealthReport={() => setIsHealthReportOpen(true)}
                  onOpenShareSummary={() => handleOpenShareModal(currentScan)}
                />

                {/* Weekly Health Insights Summary Card */}
                <WeeklyHealthInsightsCard
                  history={history}
                  onViewHistory={() => setActiveNavTab('history')}
                />

                {/* Personalized Health Recommendation Engine Card */}
                <PersonalizedRecommendationsCard
                  scan={currentScan}
                  onOpenBreathing={() => setIsBreathingModalOpen(true)}
                />

                {/* Clinical Notes & Lifestyle Action Plan */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left 2 Cols: Clinical Observation */}
                  <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-light uppercase tracking-[0.2em] text-white flex items-center gap-2 font-serif">
                        <FileText className="h-4 w-4 text-cyan-400" />
                        AI Physiological Assessment & Observations
                      </h3>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Gemini 3.7 Flash</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {currentScan.clinicalNotes.summary}
                    </p>

                    <div className="space-y-2 pt-2">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        Key Biometric Markers:
                      </h4>
                      <ul className="space-y-2">
                        {currentScan.clinicalNotes.keyObservations.map((obs, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{obs}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right 1 Col: Lifestyle Recommendations Action Plan */}
                  <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-light uppercase tracking-[0.2em] text-white flex items-center gap-2 font-serif">
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                        Targeted Action Protocol
                      </h3>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="rounded-2xl border border-slate-800 bg-[#050505] p-3.5">
                        <span className="font-bold text-cyan-300 block mb-1 uppercase tracking-wider text-[10px] font-mono">1. Vagal Reset:</span>
                        <p className="text-slate-400 leading-relaxed">{currentScan.clinicalNotes.lifestyleActionPlan.immediateBreathing}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-[#050505] p-3.5">
                        <span className="font-bold text-cyan-300 block mb-1 uppercase tracking-wider text-[10px] font-mono">2. Glycemic Stabilization:</span>
                        <p className="text-slate-400 leading-relaxed">{currentScan.clinicalNotes.lifestyleActionPlan.nutritionAndGlycemic}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-[#050505] p-3.5">
                        <span className="font-bold text-cyan-300 block mb-1 uppercase tracking-wider text-[10px] font-mono">3. Hydration & Perfusion:</span>
                        <p className="text-slate-400 leading-relaxed">{currentScan.clinicalNotes.lifestyleActionPlan.hydration}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsBreathingModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-white text-black py-2.5 text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-cyan-400 transition-colors"
                    >
                      <Wind className="h-4 w-4" /> Start Biofeedback
                    </button>
                  </div>

                </div>

              </div>
            )}

            {activeDashboardTab === 'bp-cardiac' && (
              <BloodPressureCardiacDeepDive
                bloodPressure={currentScan.bloodPressure}
                cardiacWorkload={currentScan.cardiacWorkload}
                hypertension={currentScan.hypertensionMonitoring}
                heartRate={currentScan.vitals.heartRate.value}
              />
            )}

            {activeDashboardTab === 'risk-forecast' && (
              <RiskForecastingSimulationView
                scan={currentScan}
              />
            )}

            {activeDashboardTab === 'biometrics' && (
              <BmiBreathingHrvDeepDive
                bmi={currentScan.bmiAdiposity}
                breathing={currentScan.breathingRate}
                hrv={currentScan.vitals.hrv}
                heartRate={currentScan.vitals.heartRate.value}
              />
            )}

            {activeDashboardTab === 'insights' && (
              <div className="space-y-6">
                <WeeklyHealthInsightsCard
                  history={history}
                  onViewHistory={() => setActiveNavTab('history')}
                />
                <HistoricalTrendCharts
                  history={history}
                  onSelectScan={(scan) => {
                    setCurrentScan(scan);
                  }}
                />
              </div>
            )}

            {activeDashboardTab === 'recommendations' && (
              <div className="space-y-6">
                <PersonalizedRecommendationsCard
                  scan={currentScan}
                  onOpenBreathing={() => setIsBreathingModalOpen(true)}
                />
              </div>
            )}

            {activeDashboardTab === 'metabolic' && (
              <MetabolicBloodSugarDeepDive
                data={currentScan.vitals.bloodSugarRisk}
                heartRate={currentScan.vitals.heartRate.value}
                stressScore={currentScan.vitals.stress.score}
              />
            )}

            {activeDashboardTab === 'stress' && (
              <StressAutonomicDeepDive
                stress={currentScan.vitals.stress}
                hrvRmssd={currentScan.vitals.hrv.rmssdMs}
                heartRate={currentScan.vitals.heartRate.value}
                onOpenBreathing={() => setIsBreathingModalOpen(true)}
              />
            )}

            {activeDashboardTab === 'coach' && (
              <AIHealthCoachChat scan={currentScan} />
            )}

          </div>
        )}

        {/* Clinical Disclaimer Footer Banner */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 text-[11px] text-slate-500 flex items-start gap-3.5">
          <Shield className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-300 block mb-1 uppercase tracking-wider font-mono text-[10px]">Medical & Wellness Disclaimer:</strong>
            FaceVital AI utilizes experimental computer vision and facial photoplethysmography (rPPG) optical telemetry for health and wellness tracking purposes only. It is not an FDA/CE-cleared medical diagnostic device, ECG, or laboratory blood test. Always seek the advice of a physician or qualified healthcare provider regarding medical conditions, blood glucose concerns, or cardiac symptoms.
          </div>
        </div>

      </main>
    </div>
  );
}
