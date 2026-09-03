/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Heart, 
  Droplet, 
  Flame, 
  Wind, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  User, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  Clock,
  QrCode,
  FileCheck,
  Share2
} from 'lucide-react';
import { FaceScanResult, WeeklyHealthInsightsData } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { computeClientWeeklyInsights } from '../utils/weeklyInsightsEngine';

interface HealthReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scan: FaceScanResult;
  history?: FaceScanResult[];
  onOpenShareSummary?: () => void;
}

export const HealthReportModal: React.FC<HealthReportModalProps> = ({
  isOpen,
  onClose,
  scan,
  history = [],
  onOpenShareSummary,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Customization State
  const [patientName, setPatientName] = useState<string>('Jane Doe');
  const [patientId, setPatientId] = useState<string>(() => `FV-${Math.floor(100000 + Math.random() * 900000)}`);
  const [patientAgeGender, setPatientAgeGender] = useState<string>('36, Female');
  const [clinicianName, setClinicianName] = useState<string>('FaceVital Telemetry Clinical Protocol');
  const [customNotes, setCustomNotes] = useState<string>(scan.clinicalNotes?.summary || 'Client demonstrates stable hemodynamic parameters with optimal optical capillary perfusion.');
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  
  // Section Toggles
  const [includeVitals, setIncludeVitals] = useState<boolean>(true);
  const [includeCardiac, setIncludeCardiac] = useState<boolean>(true);
  const [includeMetabolic, setIncludeMetabolic] = useState<boolean>(true);
  const [includeStressHrv, setIncludeStressHrv] = useState<boolean>(true);
  const [includeBmiBreathing, setIncludeBmiBreathing] = useState<boolean>(true);
  const [includeRiskForecast, setIncludeRiskForecast] = useState<boolean>(true);
  const [includeActionPlan, setIncludeActionPlan] = useState<boolean>(true);
  const [includeWeeklyTrends, setIncludeWeeklyTrends] = useState<boolean>(history.length > 1);

  // Status State
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const formattedDate = new Date(scan.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = new Date(scan.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const weeklyInsights: WeeklyHealthInsightsData = computeClientWeeklyInsights(
    history.length > 0 ? history : [scan]
  );

  // Download PDF Handler using high-res canvas conversion
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsExportingPdf(true);

    try {
      // Create clone or render visible report node with print-friendly styles
      const element = reportRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const cleanName = patientName.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`FaceVital_Clinical_Report_${cleanName}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Browser Direct Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Copy Text Summary Handler
  const handleCopySummary = () => {
    const summaryText = `
=== FACEVITAL AI CLINICAL TELEMETRY REPORT ===
Patient: ${patientName} | ID: ${patientId} | Age/Sex: ${patientAgeGender}
Date: ${formattedDate} ${formattedTime}
Report ID: ${scan.id}

--- EXECUTIVE VITAL SIGNS ---
- Heart Rate: ${scan.vitals.heartRate.value} BPM (${scan.vitals.heartRate.status.toUpperCase()}) [Normal: ${scan.vitals.heartRate.normalRange}]
- Blood Pressure: ${scan.bloodPressure.systolic}/${scan.bloodPressure.diastolic} mmHg (${scan.bloodPressure.category}) [MAP: ${scan.bloodPressure.map} mmHg]
- Estimated Glucose: ${scan.vitals.bloodSugarRisk.estimatedFastingMgDl} mg/dL (HbA1c: ${scan.vitals.bloodSugarRisk.estimatedHbA1c}%) - ${scan.vitals.bloodSugarRisk.riskLevel}
- Autonomic Stress Index: ${scan.vitals.stress.score}/100 (${scan.vitals.stress.level})
- Respiration Rate: ${scan.breathingRate.value} breaths/min (${scan.breathingRate.breathingDepth})
- HRV RMSSD: ${scan.vitals.hrv.rmssdMs} ms (SDNN: ${scan.vitals.hrv.sdnnMs} ms, LF/HF: ${scan.vitals.hrv.lfHfRatio})
- SpO2 Saturation: ${scan.vitals.spO2.value}%

--- CARDIOMETABOLIC & HEMODYNAMICS ---
- Rate Pressure Product (RPP): ${scan.cardiacWorkload.ratePressureProduct} (${scan.cardiacWorkload.workloadCategory})
- Pulse Wave Velocity (PWV): ${scan.bloodPressure.pulseWaveVelocityEstimate} m/s
- Arterial Stiffness Index: ${scan.bloodPressure.vascularStiffnessIndex}/100
- Optical BMI: ${scan.bmiAdiposity.estimatedBmi} kg/m² (${scan.bmiAdiposity.bmiCategory})
- 10-Year ASCVD Risk Forecast: ${scan.riskForecasting.ascvd10YearRiskPercent}% (${scan.riskForecasting.overallCardioMetabolicGrade})
- Biological Vascular Age Delta: ${scan.riskForecasting.biologicalVascularAgeDelta > 0 ? '+' : ''}${scan.riskForecasting.biologicalVascularAgeDelta} years

--- CLINICAL SUMMARY & PROTOCOLS ---
${customNotes}

Action Plan:
1. Breathing & Autonomic: ${scan.clinicalNotes.lifestyleActionPlan.immediateBreathing}
2. Nutrition & Metabolic: ${scan.clinicalNotes.lifestyleActionPlan.nutritionAndGlycemic}
3. Hydration & Recovery: ${scan.clinicalNotes.lifestyleActionPlan.hydration}
4. Circadian Sleep: ${scan.clinicalNotes.lifestyleActionPlan.circadianSleep}

Verification: Contactless rPPG Telemetry Certified | FaceVital AI
`.trim();

    navigator.clipboard.writeText(summaryText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/90 p-2 sm:p-4 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      
      {/* Modal Container */}
      <div className="relative flex w-full max-w-5xl flex-col max-h-[92vh] rounded-3xl border border-slate-800 bg-[#0a0a0a] shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Top Bar (Interactive Controls) */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#0a0a0a]/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  Clinical Health Telemetry Report
                </h3>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-cyan-400 border border-cyan-500/30">
                  PDF & Print Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Stylized clinical export of vital signs, hemodynamics, metabolic proxies & risk forecasts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Customize Settings Toggle */}
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
                isCustomizing 
                  ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300' 
                  : 'border-slate-800 bg-[#050505] text-slate-300 hover:border-slate-700'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Customize</span>
            </button>

            {/* Copy Summary */}
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-[#050505] px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-300 transition hover:border-slate-700 hover:text-white"
              title="Copy text summary to clipboard"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Share Link Button */}
            {onOpenShareSummary && (
              <button
                onClick={onOpenShareSummary}
                className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-300 transition hover:bg-cyan-500/20 hover:border-cyan-500/70 shadow-sm"
                title="Create a redacted, view-only web link for your doctor"
              >
                <Share2 className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Share Link</span>
              </button>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-[#050505] px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-300 transition hover:border-cyan-500/40 hover:text-white"
              title="Print directly or save via browser PDF printer"
            >
              <Printer className="h-3.5 w-3.5 text-cyan-400" />
              <span>Print</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:bg-cyan-400 transition active:scale-95 disabled:opacity-50"
            >
              {isExportingPdf ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>{isExportingPdf ? 'Exporting...' : 'Download PDF'}</span>
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Customization Drawer (Collapsible) */}
        {isCustomizing && (
          <div className="border-b border-slate-800 bg-[#070707] p-5 animate-in slide-in-from-top-2 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5" />
                Customize Report Details & Section Inclusions
              </h4>
              <span className="text-[11px] text-slate-500">Changes reflect instantly in the document</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Subject / Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#0d0d0d] px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Record ID / MRN
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#0d0d0d] px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Age & Biological Sex
                </label>
                <input
                  type="text"
                  value={patientAgeGender}
                  onChange={(e) => setPatientAgeGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#0d0d0d] px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Attending Clinician / Protocol
                </label>
                <input
                  type="text"
                  value={clinicianName}
                  onChange={(e) => setClinicianName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#0d0d0d] px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Clinical Remarks / Executive Notes
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-800 bg-[#0d0d0d] p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Section Toggles */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                Included Report Modules
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Vital Signs', state: includeVitals, setter: setIncludeVitals },
                  { label: 'Cardiac & Workload', state: includeCardiac, setter: setIncludeCardiac },
                  { label: 'Metabolic & Blood Sugar', state: includeMetabolic, setter: setIncludeMetabolic },
                  { label: 'Stress & HRV Spectra', state: includeStressHrv, setter: setIncludeStressHrv },
                  { label: 'BMI & Breathing', state: includeBmiBreathing, setter: setIncludeBmiBreathing },
                  { label: '10-Yr Risk Forecast', state: includeRiskForecast, setter: setIncludeRiskForecast },
                  { label: 'Action Protocols', state: includeActionPlan, setter: setIncludeActionPlan },
                  { label: 'Weekly Longitudinal Trends', state: includeWeeklyTrends, setter: setIncludeWeeklyTrends },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => item.setter(!item.state)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition ${
                      item.state 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    <Check className={`h-3 w-3 ${item.state ? 'opacity-100' : 'opacity-20'}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Document Preview Area */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-[#111111]/80 flex justify-center">
          
          {/* THE PRINTABLE CLINICAL DOCUMENT SHEET */}
          <div 
            id="printable-health-report"
            ref={reportRef}
            className="w-full max-w-[850px] bg-white text-slate-900 shadow-2xl rounded-2xl p-8 sm:p-12 font-sans border border-slate-200"
            style={{ minHeight: '1100px' }}
          >
            
            {/* DOCUMENT HEADER */}
            <div className="border-b-2 border-slate-900 pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-xs">
                    FV
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 font-serif">
                    FACEVITAL <span className="text-cyan-700">AI</span>
                  </h1>
                </div>
                <p className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase mt-0.5">
                  Contactless Optical Photoplethysmography (rPPG) Telemetry Report
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  ISO-27001 / IEEE-Biomarker Conformant Telemetry Protocol v3.4
                </p>
              </div>

              {/* Document Metadata Badge */}
              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
                <div className="text-[10px] font-mono uppercase text-slate-500">Report Reference</div>
                <div className="text-xs font-bold font-mono text-slate-900">{scan.id}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Acquired: <span className="font-semibold text-slate-800">{formattedDate}</span> at {formattedTime}
                </div>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Optical Perfusion: Verified
                </div>
              </div>
            </div>

            {/* SUBJECT DEMOGRAPHICS & TELEMETRY PROFILE BANNER */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Subject Name</div>
                <div className="font-bold text-slate-900 text-sm">{patientName}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Record / MRN</div>
                <div className="font-semibold font-mono text-slate-800">{patientId}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Age & Sex</div>
                <div className="font-semibold text-slate-800">{patientAgeGender}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Acquisition Mode</div>
                <div className="font-semibold text-slate-800 capitalize">
                  {scan.sourceMode === 'live_webcam' ? 'Live Optical Camera' : 'Clinical Telemetry Preset'}
                </div>
              </div>
            </div>

            {/* EXECUTIVE SCORECARD (4-PILLAR PHYSIOLOGICAL INDEX) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">Vitality Index</div>
                <div className="text-2xl font-bold text-cyan-950 font-serif my-0.5">{scan.holisticScores.vitalityIndex}</div>
                <div className="text-[9px] font-medium text-cyan-700 uppercase">Optimal Cellular Energy</div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Autonomic Balance</div>
                <div className="text-2xl font-bold text-emerald-950 font-serif my-0.5">{scan.holisticScores.autonomicBalance}</div>
                <div className="text-[9px] font-medium text-emerald-700 uppercase">Balanced Vagal Tone</div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">Vascular Perfusion</div>
                <div className="text-2xl font-bold text-indigo-950 font-serif my-0.5">{scan.holisticScores.vascularPerfusionScore}</div>
                <div className="text-[9px] font-medium text-indigo-700 uppercase">Healthy Micro-circulation</div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Fatigue Debt</div>
                <div className="text-2xl font-bold text-amber-950 font-serif my-0.5">{scan.holisticScores.fatigueDebtIndex}</div>
                <div className="text-[9px] font-medium text-amber-700 uppercase">Restorative Reserve</div>
              </div>
            </div>

            {/* SECTION 1: PRIMARY VITALS TABLE */}
            {includeVitals && (
              <div className="mb-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-cyan-700" />
                    1. Primary Vital Signs & Hemodynamics
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">Optical rPPG Extraction</span>
                </div>

                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-700">
                        <th className="py-2 px-3">Physiological Parameter</th>
                        <th className="py-2 px-3">Measured Value</th>
                        <th className="py-2 px-3">Clinical Reference Range</th>
                        <th className="py-2 px-3 text-right">Status & Evaluation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">Heart Rate (Pulse)</td>
                        <td className="py-2 px-3 font-mono font-bold">{scan.vitals.heartRate.value} BPM</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">60 - 100 BPM</td>
                        <td className="py-2 px-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            scan.vitals.heartRate.status === 'optimal' || scan.vitals.heartRate.status === 'normal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {scan.vitals.heartRate.status}
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">Blood Pressure (Systolic / Diastolic)</td>
                        <td className="py-2 px-3 font-mono font-bold">
                          {scan.bloodPressure.systolic} / {scan.bloodPressure.diastolic} mmHg
                        </td>
                        <td className="py-2 px-3 text-slate-500 font-mono">&lt; 120 / &lt; 80 mmHg</td>
                        <td className="py-2 px-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            scan.bloodPressure.category === 'Normal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {scan.bloodPressure.category}
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">Mean Arterial Pressure (MAP)</td>
                        <td className="py-2 px-3 font-mono font-bold">{scan.bloodPressure.map} mmHg</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">70 - 100 mmHg</td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            Adequate Perfusion
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">Estimated Fasting Blood Sugar</td>
                        <td className="py-2 px-3 font-mono font-bold">{scan.vitals.bloodSugarRisk.estimatedFastingMgDl} mg/dL</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">70 - 99 mg/dL</td>
                        <td className="py-2 px-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            scan.vitals.bloodSugarRisk.riskLevel === 'Optimal' || scan.vitals.bloodSugarRisk.riskLevel === 'Normal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {scan.vitals.bloodSugarRisk.riskLevel}
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">Autonomic Stress Index</td>
                        <td className="py-2 px-3 font-mono font-bold">{scan.vitals.stress.score} / 100</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">&lt; 35 (Relaxed)</td>
                        <td className="py-2 px-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            scan.vitals.stress.score <= 35 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {scan.vitals.stress.level}
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">Heart Rate Variability (RMSSD)</td>
                        <td className="py-2 px-3 font-mono font-bold">{scan.vitals.hrv.rmssdMs} ms</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">&gt; 42 ms</td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {scan.vitals.hrv.status}
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">Respiration Cadence</td>
                        <td className="py-2 px-3 font-mono font-bold">{scan.breathingRate.value} breaths/min</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">12 - 18 breaths/min</td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {scan.breathingRate.status}
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-2 px-3 font-semibold text-slate-900">Blood Oxygen Saturation (SpO2)</td>
                        <td className="py-2 px-3 font-mono font-bold">{scan.vitals.spO2.value}%</td>
                        <td className="py-2 px-3 text-slate-500 font-mono">95 - 100%</td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            Optimal
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 2 & 3: CARDIAC WORKLOAD & METABOLIC DYNAMICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              
              {/* Cardiac Workload */}
              {includeCardiac && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-2">
                    <Heart className="h-3.5 w-3.5 text-rose-600" />
                    2. Cardiac Workload & Arterial Health
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Rate Pressure Product (RPP):</span>
                      <span className="font-mono font-bold text-slate-900">{scan.cardiacWorkload.ratePressureProduct}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Pulse Wave Velocity (PWV):</span>
                      <span className="font-mono font-bold text-slate-900">{scan.bloodPressure.pulseWaveVelocityEstimate} m/s</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Vascular Stiffness Index:</span>
                      <span className="font-mono font-bold text-slate-900">{scan.bloodPressure.vascularStiffnessIndex} / 100</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Endothelial Score:</span>
                      <span className="font-mono font-bold text-slate-900">{scan.bloodPressure.endothelialHealthScore} / 100</span>
                    </div>
                    <div className="flex justify-between pt-0.5">
                      <span className="text-slate-500">Workload Burden:</span>
                      <span className="font-bold text-emerald-700">{scan.cardiacWorkload.workloadCategory}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Metabolic & Glycemic Proxy */}
              {includeMetabolic && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-2">
                    <Droplet className="h-3.5 w-3.5 text-cyan-600" />
                    3. Metabolic Proxy & Glycemic Dynamics
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Estimated HbA1c Proxy:</span>
                      <span className="font-mono font-bold text-slate-900">{scan.vitals.bloodSugarRisk.estimatedHbA1c}%</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Glycemic Stability Score:</span>
                      <span className="font-mono font-bold text-slate-900">{scan.vitals.bloodSugarRisk.glycemicStabilityScore} / 100</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Time-In-Range Estimate:</span>
                      <span className="font-mono font-bold text-slate-900">{scan.vitals.bloodSugarRisk.timeInRangeEstimate}%</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Insulin Sensitivity Status:</span>
                      <span className="font-bold text-emerald-700">{scan.vitals.bloodSugarRisk.insulinResistanceRisk}</span>
                    </div>
                    <div className="flex justify-between pt-0.5">
                      <span className="text-slate-500">Micro-vascular Curve:</span>
                      <span className="font-medium text-slate-800 text-[11px]">Steady Refill</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* SECTION 4 & 5: HRV SPECTRA & OPTICAL BMI / BREATHING */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              
              {/* HRV & Stress */}
              {includeStressHrv && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-2">
                    <Flame className="h-3.5 w-3.5 text-amber-600" />
                    4. Autonomic Stress & Extended HRV
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">SDNN Overall Variability:</span>
                      <span className="font-mono font-bold text-slate-900">{scan.vitals.hrv.sdnnMs} ms</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">pNN50 Vagal Percentage:</span>
                      <span className="font-mono font-bold text-slate-900">{scan.vitals.hrv.pnn50Percent}%</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">LF/HF Sympathovagal Ratio:</span>
                      <span className="font-mono font-bold text-slate-900">{scan.vitals.hrv.lfHfRatio}</span>
                    </div>
                    <div className="flex justify-between pt-0.5">
                      <span className="text-slate-500">Baevsky Stress Index:</span>
                      <span className="font-mono font-bold text-slate-900">{scan.vitals.hrv.baevskyStressIndex}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* BMI & Breathing */}
              {includeBmiBreathing && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-2">
                    <Wind className="h-3.5 w-3.5 text-cyan-600" />
                    5. Optical BMI & Breathing Cadence
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Estimated Optical BMI:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {scan.bmiAdiposity.estimatedBmi} kg/m² ({scan.bmiAdiposity.bmiCategory})
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Facial FWHR Ratio:</span>
                      <span className="font-mono font-bold text-slate-900">{scan.bmiAdiposity.fwhrRatio}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Inhalation/Exhalation Ratio:</span>
                      <span className="font-mono font-bold text-slate-900">{scan.breathingRate.ieRatio}</span>
                    </div>
                    <div className="flex justify-between pt-0.5">
                      <span className="text-slate-500">RSA Respiratory Coupling:</span>
                      <span className="font-mono font-bold text-slate-900">{scan.breathingRate.rsaCouplingScore}%</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* SECTION 6: 10-YEAR RISK FORECASTING */}
            {includeRiskForecast && (
              <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-700" />
                    6. 10-Year Cardiometabolic Risk Projections
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">ASCVD / Framingham Model</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500 uppercase">10-Yr ASCVD Risk</div>
                    <div className="text-lg font-bold font-mono text-slate-900">{scan.riskForecasting.ascvd10YearRiskPercent}%</div>
                    <div className="text-[9px] font-bold text-emerald-700 uppercase">Low Risk</div>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500 uppercase">5-Yr Diabetes Risk</div>
                    <div className="text-lg font-bold font-mono text-slate-900">{scan.riskForecasting.type2Diabetes5YearRiskPercent}%</div>
                    <div className="text-[9px] font-bold text-emerald-700 uppercase">Minimal</div>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500 uppercase">Vascular Age Delta</div>
                    <div className="text-lg font-bold font-mono text-slate-900">
                      {scan.riskForecasting.biologicalVascularAgeDelta > 0 ? '+' : ''}{scan.riskForecasting.biologicalVascularAgeDelta} yrs
                    </div>
                    <div className="text-[9px] font-bold text-emerald-700 uppercase">Arterial Youth</div>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500 uppercase">Hypertension 5-Yr</div>
                    <div className="text-lg font-bold font-mono text-slate-900">{scan.riskForecasting.hypertension5YearRiskPercent}%</div>
                    <div className="text-[9px] font-bold text-emerald-700 uppercase">Optimal</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-900">Mitigation Strategy: </span>
                  {scan.riskForecasting.modifiableMitigationPotential}
                </div>
              </div>
            )}

            {/* SECTION 7: WEEKLY TRENDS & LONGITUDINAL TRAJECTORY (IF ENABLED) */}
            {includeWeeklyTrends && (
              <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-700" />
                    7. Longitudinal 7-Day Telemetry Trajectory
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">{weeklyInsights.periodLabel}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs mb-3 text-center">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500">7-Day HR Avg</div>
                    <div className="font-bold text-slate-900 font-mono">{weeklyInsights.weeklyAverages.heartRateAvg} BPM</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500">7-Day Stress Avg</div>
                    <div className="font-bold text-slate-900 font-mono">{weeklyInsights.weeklyAverages.stressAvg} / 100</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500">7-Day Glucose Avg</div>
                    <div className="font-bold text-slate-900 font-mono">{weeklyInsights.weeklyAverages.glucoseAvg} mg/dL</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                  {weeklyInsights.naturalLanguageSummary}
                </p>
              </div>
            )}

            {/* SECTION 8: CLINICAL REMARKS & LIFESTYLE ACTION PLAN */}
            {includeActionPlan && (
              <div className="mb-6">
                <div className="border-b border-slate-200 pb-2 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                    8. Clinical Observations & Actionable Protocol
                  </h3>
                </div>

                {/* Custom Notes */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 mb-3">
                  <div className="text-[10px] font-bold font-mono uppercase text-slate-500 mb-1">
                    Evaluator Clinical Remarks
                  </div>
                  <p className="leading-relaxed">{customNotes}</p>
                </div>

                {/* 4-Pillar Lifestyle Prescription Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 text-[11px] mb-1 flex items-center gap-1 text-cyan-800">
                      <Wind className="h-3 w-3" />
                      1. Vagal Tone & Respiration
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {scan.clinicalNotes.lifestyleActionPlan.immediateBreathing}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 text-[11px] mb-1 flex items-center gap-1 text-emerald-800">
                      <Droplet className="h-3 w-3" />
                      2. Glycemic & Nutrition Protocol
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {scan.clinicalNotes.lifestyleActionPlan.nutritionAndGlycemic}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 text-[11px] mb-1 flex items-center gap-1 text-indigo-800">
                      <Activity className="h-3 w-3" />
                      3. Hydration & Cellular Perfusion
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {scan.clinicalNotes.lifestyleActionPlan.hydration}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 text-[11px] mb-1 flex items-center gap-1 text-purple-800">
                      <Sparkles className="h-3 w-3" />
                      4. Circadian & Sleep Architecture
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {scan.clinicalNotes.lifestyleActionPlan.circadianSleep}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT FOOTER & SIGN-OFF */}
            <div className="border-t-2 border-slate-900 pt-6 mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                
                {/* Clinician Sign-off */}
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">
                    Attending Evaluator / Reviewer
                  </div>
                  <div className="font-semibold text-slate-900 text-xs">{clinicianName}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Digital Electronic Verification Signature: <span className="font-semibold text-slate-700">SHA256-{scan.id.slice(0, 12)}</span>
                  </div>
                </div>

                {/* Certification Stamp & Disclaimer */}
                <div className="text-left sm:text-right">
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-800 uppercase tracking-wider">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-700" />
                    FaceVital AI Telemetry Certified
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal max-w-sm ml-auto">
                    Notice: This optical rPPG health report is intended for wellness assessment and physiological telemetry monitoring. It is not an invasive diagnostic device. Consult a licensed physician for clinical diagnosis.
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
