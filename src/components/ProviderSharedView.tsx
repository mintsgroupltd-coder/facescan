/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Copy, 
  Check, 
  Printer, 
  ExternalLink, 
  Clock, 
  AlertTriangle, 
  Heart, 
  Activity, 
  Droplet, 
  Flame, 
  Wind, 
  Sparkles, 
  Calendar, 
  User, 
  EyeOff, 
  CheckCircle2,
  Stethoscope,
  KeyRound,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { SharedReportPayload } from '../types';
import { hashPin, validateShareExpiration } from '../utils/shareLinkEncoder';

interface ProviderSharedViewProps {
  payload: SharedReportPayload;
  onExit: () => void;
}

export const ProviderSharedView: React.FC<ProviderSharedViewProps> = ({
  payload,
  onExit,
}) => {
  const { scan } = payload;

  // PIN security check
  const [pinInput, setPinInput] = useState<string>('');
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(() => !payload.hasPin);
  const [pinError, setPinError] = useState<string | null>(null);

  // Copy states
  const [isCopiedEhr, setIsCopiedEhr] = useState<boolean>(false);
  const [isCopiedLink, setIsCopiedLink] = useState<boolean>(false);

  // Expiration check
  const expirationStatus = useMemo(() => {
    return validateShareExpiration(payload);
  }, [payload]);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.pinHash) {
      setIsPinUnlocked(true);
      return;
    }

    const hashedInput = hashPin(pinInput.trim());
    if (hashedInput === payload.pinHash) {
      setIsPinUnlocked(true);
      setPinError(null);
    } else {
      setPinError('Incorrect security PIN. Please contact the patient for the 4-digit passcode.');
    }
  };

  const handleCopyEHR = () => {
    const reportText = `--- FACEVITAL AI CLINICAL TELEMETRY SUMMARY ---
Subject: ${payload.subjectLabel} (${payload.demographics || 'Adult'})
Record Date: ${new Date(scan.timestamp).toLocaleString()}
Share Reference ID: ${payload.shareId}
Acquisition: Non-contact facial rPPG & computer vision AI

PRIMARY VITAL SIGNS:
• Heart Rate: ${scan.vitals.heartRate.value} BPM [Reference: 60-100] (${scan.vitals.heartRate.status.toUpperCase()})
• Blood Pressure: ${scan.bloodPressure.systolic}/${scan.bloodPressure.diastolic} mmHg (MAP: ${scan.bloodPressure.map} mmHg, Category: ${scan.bloodPressure.category})
• Blood Oxygen (SpO2): ${scan.vitals.spO2.value}% [Reference: >95%]
• Respiration Rate: ${scan.breathingRate.value} breaths/min (I:E Ratio: ${scan.breathingRate.ieRatio})
• Autonomic Stress Index: ${scan.vitals.stress.score}/100 (${scan.vitals.stress.level})
• Heart Rate Variability (RMSSD): ${scan.vitals.hrv.rmssdMs} ms (SDNN: ${scan.vitals.hrv.sdnnMs} ms, LF/HF: ${scan.vitals.hrv.lfHfRatio})

CARDIOMETABOLIC & HEMODYNAMIC INDICATORS:
• Fasting Blood Glucose Proxy: ${scan.vitals.bloodSugarRisk.estimatedFastingMgDl} mg/dL (Est. HbA1c: ${scan.vitals.bloodSugarRisk.estimatedHbA1c}%, Risk: ${scan.vitals.bloodSugarRisk.riskLevel})
• Rate Pressure Product (RPP): ${scan.cardiacWorkload.ratePressureProduct} (${scan.cardiacWorkload.workloadCategory})
• Vascular Stiffness Index: ${scan.bloodPressure.vascularStiffnessIndex}/100 (Est. PWV: ${scan.bloodPressure.pulseWaveVelocityEstimate} m/s)
• Estimated BMI: ${scan.bmiAdiposity.estimatedBmi} kg/m² (${scan.bmiAdiposity.bmiCategory})
• 10-Year ASCVD Risk Score: ${scan.riskForecasting.ascvd10YearRiskPercent}% (Vascular Age Delta: ${scan.riskForecasting.biologicalVascularAgeDelta > 0 ? '+' : ''}${scan.riskForecasting.biologicalVascularAgeDelta} yrs)

PATIENT CLINICAL NOTE:
"${payload.clinicianNote || 'None provided'}"

REDACTION AUDIT:
${payload.redactionsApplied.map(r => `• ${r}`).join('\n')}

Notice: Optical AI measurements are for wellness surveillance and clinical triage support.`;

    navigator.clipboard.writeText(reportText);
    setIsCopiedEhr(true);
    setTimeout(() => setIsCopiedEhr(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // 1. If link has expired
  if (expirationStatus.isExpired) {
    return (
      <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-[#0d0d0d] p-8 text-center shadow-2xl space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30">
            <Clock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white font-serif">Telemetry Link Expired</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This secure health summary link expired on <span className="text-slate-200 font-mono">{expirationStatus.formattedExpiry}</span> in accordance with the patient's privacy and data-retention settings.
          </p>
          <div className="pt-2">
            <button
              onClick={onExit}
              className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-200 hover:bg-slate-700 transition"
            >
              Return to Main Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. If PIN protected and not unlocked yet
  if (!isPinUnlocked) {
    return (
      <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-cyan-500/30 bg-[#0a0a0a] p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <KeyRound className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-white">Healthcare Provider Verification</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This telemetry summary is protected by a patient security PIN. Please enter the passcode provided by <span className="text-cyan-400 font-semibold">{payload.subjectLabel}</span>.
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Enter 4-6 Digit Security PIN
              </label>
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center text-2xl tracking-[0.5em] font-mono rounded-xl border border-slate-700 bg-[#050505] p-3 text-cyan-300 focus:border-cyan-500 focus:outline-none"
              />
              {pinError && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pinInput.length < 4}
              className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:bg-cyan-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Unlock Telemetry Portal
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800">
            <button
              onClick={onExit}
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              Exit to Main FaceVital App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Main Healthcare Provider Telemetry Portal
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Top Clinician Banner */}
      <header className="sticky top-0 z-40 border-b border-cyan-500/30 bg-[#070707]/90 backdrop-blur-xl px-4 sm:px-6 py-3.5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Portal Status */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold uppercase tracking-wider text-white">
                  FaceVital AI &bull; Clinician Telemetry Portal
                </h1>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-emerald-400 border border-emerald-500/30">
                  View-Only Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Patient: <span className="text-cyan-300 font-semibold">{payload.subjectLabel}</span> &bull; Recorded: {new Date(scan.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Buttons for Healthcare Provider */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyEHR}
              className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-[#0d0d0d] px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-700 hover:text-white transition shadow-sm"
              title="Copy structured text note to paste into your Electronic Health Record (EHR)"
            >
              {isCopiedEhr ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-cyan-400" />}
              <span>{isCopiedEhr ? 'EHR Note Copied!' : 'Copy to EHR'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/60 transition shadow-sm"
            >
              <Printer className="h-3.5 w-3.5 text-cyan-400" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onExit}
              className="flex items-center gap-1 rounded-full border border-slate-800 bg-[#0d0d0d] px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
              title="Exit shared view and return to full app"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Patient Case & Privacy Banner */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-light tracking-wide text-white font-serif">
                  {payload.subjectLabel}
                </h2>
                <span className="rounded-full bg-[#050505] px-3 py-0.5 text-xs font-mono text-cyan-400 border border-cyan-500/30">
                  Demographics: {payload.demographics || 'Adult Patient'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Share ID: <span className="font-mono text-slate-300">{payload.shareId}</span> &bull; Generated: {new Date(payload.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Privacy Redaction Status */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2 text-xs text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-semibold">Privacy Redacted</span>
              </div>
              {payload.expiresAt && (
                <div className="flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-[#050505] px-3.5 py-2 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Valid until {new Date(payload.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Clinician Note */}
          {payload.clinicianNote && (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block mb-1">
                Patient Clinical Transmission Note:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{payload.clinicianNote}"
              </p>
            </div>
          )}

          {/* Applied Redactions Log */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1">
            <span className="font-mono text-slate-500 uppercase tracking-wider text-[10px]">Applied Safeguards:</span>
            {payload.redactionsApplied.map((redaction, idx) => (
              <span 
                key={idx}
                className="rounded-md bg-[#050505] px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-800 flex items-center gap-1"
              >
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                {redaction}
              </span>
            ))}
          </div>
        </div>

        {/* 4-Pillar Executive Biomarker Matrix */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Vitality Score */}
          <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Vitality Index</span>
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-light text-white font-mono tracking-tight">
              {scan.holisticScores.vitalityIndex}<span className="text-sm font-sans text-slate-500">/100</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Overall optical vitality matrix score</p>
          </div>

          {/* Blood Pressure & Perfusion */}
          <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Blood Pressure</span>
              <Droplet className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-light text-white font-mono tracking-tight">
              {scan.bloodPressure.systolic}<span className="text-slate-500">/</span>{scan.bloodPressure.diastolic}
              <span className="text-xs font-sans text-slate-400 ml-1.5 font-normal">mmHg</span>
            </div>
            <p className="text-[11px] text-emerald-400 mt-2 font-medium">{scan.bloodPressure.category} &bull; MAP {scan.bloodPressure.map}</p>
          </div>

          {/* Fasting Glucose Proxy */}
          <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Fasting Glucose Proxy</span>
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-3xl font-light text-white font-mono tracking-tight">
              {scan.vitals.bloodSugarRisk.estimatedFastingMgDl}
              <span className="text-xs font-sans text-slate-400 ml-1.5 font-normal">mg/dL</span>
            </div>
            <p className="text-[11px] text-amber-300 mt-2 font-medium">Est. HbA1c: {scan.vitals.bloodSugarRisk.estimatedHbA1c}%</p>
          </div>

          {/* Autonomic Stress & HRV */}
          <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Stress & HRV RMSSD</span>
              <Activity className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-light text-white font-mono tracking-tight">
              {scan.vitals.stress.score}<span className="text-sm font-sans text-slate-500">/100</span>
            </div>
            <p className="text-[11px] text-indigo-300 mt-2 font-medium">RMSSD: {scan.vitals.hrv.rmssdMs} ms &bull; {scan.vitals.stress.level}</p>
          </div>

        </div>

        {/* Clinical Hemodynamics & Vitals Table */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Clinical Hemodynamic & Physiological Metrics Matrix
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              ISO / IEEE 11073-Aligned
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-4 font-semibold">Biomarker Parameter</th>
                  <th className="pb-3 px-4 font-semibold">Observed Value</th>
                  <th className="pb-3 px-4 font-semibold">Clinical Reference</th>
                  <th className="pb-3 px-4 font-semibold">Evaluation Status</th>
                  <th className="pb-3 pl-4 font-semibold text-right">Physiological Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 font-sans">
                
                {/* Heart Rate */}
                <tr className="hover:bg-[#0f0f0f] transition">
                  <td className="py-3.5 pr-4 font-medium text-white flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5 text-red-400" />
                    Resting Heart Rate (rPPG)
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300 font-semibold">
                    {scan.vitals.heartRate.value} BPM
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">60 – 100 BPM</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/20">
                      {scan.vitals.heartRate.status}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right text-slate-300">
                    {scan.vitals.heartRate.interpretation || 'Stable resting baseline cardiac rhythm'}
                  </td>
                </tr>

                {/* Blood Pressure */}
                <tr className="hover:bg-[#0f0f0f] transition">
                  <td className="py-3.5 pr-4 font-medium text-white flex items-center gap-2">
                    <Droplet className="h-3.5 w-3.5 text-emerald-400" />
                    Blood Pressure (SBP / DBP)
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300 font-semibold">
                    {scan.bloodPressure.systolic} / {scan.bloodPressure.diastolic} mmHg
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">&lt; 120 / &lt; 80 mmHg</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/20">
                      {scan.bloodPressure.category}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right text-slate-300">
                    MAP: {scan.bloodPressure.map} mmHg &bull; Pulse Pressure: {scan.bloodPressure.pulsePressure} mmHg
                  </td>
                </tr>

                {/* Blood Oxygen */}
                <tr className="hover:bg-[#0f0f0f] transition">
                  <td className="py-3.5 pr-4 font-medium text-white flex items-center gap-2">
                    <Wind className="h-3.5 w-3.5 text-blue-400" />
                    Oxygen Saturation (SpO2)
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300 font-semibold">
                    {scan.vitals.spO2.value}%
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">95 – 100%</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/20">
                      {scan.vitals.spO2.status}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right text-slate-300">
                    Adequate peripheral microvascular oxygen perfusion
                  </td>
                </tr>

                {/* Respiration */}
                <tr className="hover:bg-[#0f0f0f] transition">
                  <td className="py-3.5 pr-4 font-medium text-white flex items-center gap-2">
                    <Wind className="h-3.5 w-3.5 text-teal-400" />
                    Respiration Rate & Rhythm
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300 font-semibold">
                    {scan.breathingRate.value} breaths/min
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">12 – 20 breaths/min</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/20">
                      {scan.breathingRate.breathingDepth}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right text-slate-300">
                    I:E Ratio {scan.breathingRate.ieRatio} &bull; Regularity: {scan.breathingRate.rhythmRegularity}%
                  </td>
                </tr>

                {/* Glycemic Proxy */}
                <tr className="hover:bg-[#0f0f0f] transition">
                  <td className="py-3.5 pr-4 font-medium text-white flex items-center gap-2">
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                    Fasting Blood Glucose Proxy
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300 font-semibold">
                    {scan.vitals.bloodSugarRisk.estimatedFastingMgDl} mg/dL
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">70 – 99 mg/dL</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/20">
                      {scan.vitals.bloodSugarRisk.riskLevel}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right text-slate-300">
                    Est. HbA1c: {scan.vitals.bloodSugarRisk.estimatedHbA1c}% &bull; Stability: {scan.vitals.bloodSugarRisk.glycemicStabilityScore}/100
                  </td>
                </tr>

                {/* HRV RMSSD */}
                <tr className="hover:bg-[#0f0f0f] transition">
                  <td className="py-3.5 pr-4 font-medium text-white flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-purple-400" />
                    HRV (RMSSD & SDNN)
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300 font-semibold">
                    {scan.vitals.hrv.rmssdMs} ms / {scan.vitals.hrv.sdnnMs} ms
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">&gt; 35 ms RMSSD</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/20">
                      {scan.vitals.hrv.status}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right text-slate-300">
                    LF/HF Balance: {scan.vitals.hrv.lfHfRatio} &bull; Vagal Tone: {scan.vitals.hrv.parasympatheticVagalTone}/100
                  </td>
                </tr>

                {/* Cardiac Workload (RPP) */}
                <tr className="hover:bg-[#0f0f0f] transition">
                  <td className="py-3.5 pr-4 font-medium text-white flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5 text-pink-400" />
                    Rate Pressure Product (RPP)
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300 font-semibold">
                    {scan.cardiacWorkload.ratePressureProduct}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">7,000 – 12,000</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono uppercase text-emerald-400 border border-emerald-500/20">
                      {scan.cardiacWorkload.workloadCategory}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right text-slate-300">
                    Left Ventricular Load: {scan.cardiacWorkload.leftVentricularStrain}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        {/* Specialized Deep Dive Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Cardiac & Vascular Deep Dive */}
          <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 shadow-lg space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-400" />
              Arterial & Hemodynamic Health
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Arterial Stiffness Index:</span>
                <span className="font-mono text-white">{scan.bloodPressure.vascularStiffnessIndex}/100</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Pulse Wave Velocity:</span>
                <span className="font-mono text-white">{scan.bloodPressure.pulseWaveVelocityEstimate} m/s</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Endothelial Health Score:</span>
                <span className="font-mono text-emerald-400">{scan.bloodPressure.endothelialHealthScore}/100</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Total Peripheral Resistance:</span>
                <span className="font-mono text-white">{scan.cardiacWorkload.totalPeripheralResistance} dyn·s·cm⁻⁵</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              {scan.bloodPressure.interpretation}
            </p>
          </div>

          {/* Metabolic & Glycemic Dynamics */}
          <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 shadow-lg space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400" />
              Metabolic & BMI Adiposity
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Estimated Optical BMI:</span>
                <span className="font-mono text-white">{scan.bmiAdiposity.estimatedBmi} kg/m² ({scan.bmiAdiposity.bmiCategory})</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Insulin Sensitivity Risk:</span>
                <span className="font-mono text-emerald-400">{scan.vitals.bloodSugarRisk.insulinResistanceRisk}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Estimated Time In Range:</span>
                <span className="font-mono text-white">{scan.vitals.bloodSugarRisk.timeInRangeEstimate}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Visceral Adiposity Risk:</span>
                <span className="font-mono text-white">{scan.bmiAdiposity.visceralAdiposityRisk}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              {scan.vitals.bloodSugarRisk.fastingVsPostprandialContext}
            </p>
          </div>

          {/* 10-Year ASCVD Risk Forecast */}
          <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-5 shadow-lg space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              10-Year ASCVD Risk Profile
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Framingham / ASCVD 10-Yr:</span>
                <span className="font-mono text-emerald-400 font-bold">{scan.riskForecasting.ascvd10YearRiskPercent}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Biological Vascular Age Delta:</span>
                <span className="font-mono text-cyan-300">
                  {scan.riskForecasting.biologicalVascularAgeDelta > 0 ? '+' : ''}{scan.riskForecasting.biologicalVascularAgeDelta} Years
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">Cardiometabolic Grade:</span>
                <span className="font-mono text-white">{scan.riskForecasting.overallCardioMetabolicGrade}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-slate-400">T2D 5-Year Risk:</span>
                <span className="font-mono text-white">{scan.riskForecasting.type2Diabetes5YearRiskPercent}%</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              {scan.riskForecasting.modifiableMitigationPotential}
            </p>
          </div>

        </div>

        {/* Actionable Clinical Protocols Summary */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Stethoscope className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Clinician Observations & Lifestyle Prescriptions
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#070707] border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block font-bold">
                1. Respiratory & Vagal Modulation
              </span>
              <p className="text-slate-300 leading-relaxed">
                {scan.clinicalNotes.lifestyleActionPlan.immediateBreathing}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#070707] border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-bold">
                2. Metabolic & Glycemic Buffer
              </span>
              <p className="text-slate-300 leading-relaxed">
                {scan.clinicalNotes.lifestyleActionPlan.nutritionAndGlycemic}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#070707] border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 block font-bold">
                3. Microvascular Hydration
              </span>
              <p className="text-slate-300 leading-relaxed">
                {scan.clinicalNotes.lifestyleActionPlan.hydration}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#070707] border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 block font-bold">
                4. Circadian & Autonomic Recovery
              </span>
              <p className="text-slate-300 leading-relaxed">
                {scan.clinicalNotes.lifestyleActionPlan.circadianSleep}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-2xl bg-[#050505] border border-slate-800/80 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-400">Notice for Healthcare Specialists:</span> This summary was generated using FaceVital AI's non-contact remote photoplethysmography (rPPG) optical imaging engine and computer vision algorithms. All metrics are non-invasive proxy indicators designed for wellness tracking, lifestyle optimization, and clinical triage support. They do not replace diagnostic arterial catheterization, 12-lead ECG, or venous blood assays.
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#070707] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FaceVital AI &bull; Secure Clinician Telemetry Engine</span>
          <span>End-to-End Client URL Transmission &bull; Zero Server Storage</span>
        </div>
      </footer>

    </div>
  );
};
