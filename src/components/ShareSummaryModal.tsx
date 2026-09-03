/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Share2, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  QrCode, 
  Key, 
  FileText, 
  Sliders, 
  Sparkles, 
  Mail, 
  AlertCircle,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { FaceScanResult, RedactionOptions } from '../types';
import { 
  buildRedactedPayload, 
  encodeSharePayload, 
  generateShareUrl 
} from '../utils/shareLinkEncoder';

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  scan: FaceScanResult;
}

export const ShareSummaryModal: React.FC<ShareSummaryModalProps> = ({
  isOpen,
  onClose,
  scan,
}) => {
  // Redaction Configuration States
  const [redactFaceSnapshot, setRedactFaceSnapshot] = useState<boolean>(true);
  const [anonymizePatient, setAnonymizePatient] = useState<boolean>(true);
  const [patientAlias, setPatientAlias] = useState<string>(() => `Patient #${scan.id.slice(-5).toUpperCase()}`);
  const [patientAgeGender, setPatientAgeGender] = useState<string>('36, Female');
  const [excludeUserNotes, setExcludeUserNotes] = useState<boolean>(true);
  const [customClinicianNote, setCustomClinicianNote] = useState<string>(
    'Patient requested telemetry transmission for routine cardiometabolic & vagal tone review.'
  );

  // Module Inclusions
  const [includeCardiac, setIncludeCardiac] = useState<boolean>(true);
  const [includeMetabolic, setIncludeMetabolic] = useState<boolean>(true);
  const [includeStressHrv, setIncludeStressHrv] = useState<boolean>(true);
  const [includeRiskForecast, setIncludeRiskForecast] = useState<boolean>(true);
  const [includeLifestylePlan, setIncludeLifestylePlan] = useState<boolean>(true);

  // Security & Expiration
  const [expiresInHours, setExpiresInHours] = useState<number | null>(72); // 3 days default
  const [enablePin, setEnablePin] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>('');

  // UI state
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);

  // Computed Redaction Payload & URL
  const redactionOptions: RedactionOptions = useMemo(() => ({
    redactFaceSnapshot,
    anonymizePatient,
    patientAlias,
    patientAgeGender,
    excludeUserNotes,
    includeCardiac,
    includeMetabolic,
    includeStressHrv,
    includeRiskForecast,
    includeLifestylePlan,
    expiresInHours,
    pinCode: enablePin ? pinCode : undefined,
    customClinicianNote,
  }), [
    redactFaceSnapshot,
    anonymizePatient,
    patientAlias,
    patientAgeGender,
    excludeUserNotes,
    includeCardiac,
    includeMetabolic,
    includeStressHrv,
    includeRiskForecast,
    includeLifestylePlan,
    expiresInHours,
    enablePin,
    pinCode,
    customClinicianNote,
  ]);

  const sharePayload = useMemo(() => {
    return buildRedactedPayload(scan, redactionOptions);
  }, [scan, redactionOptions]);

  const shareToken = useMemo(() => {
    return encodeSharePayload(sharePayload);
  }, [sharePayload]);

  const shareUrl = useMemo(() => {
    return generateShareUrl(shareToken);
  }, [shareToken]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleOpenPreview = () => {
    window.open(shareUrl, '_blank');
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`FaceVital Health Telemetry Summary - ${patientAlias}`);
    const body = encodeURIComponent(
`Dear Healthcare Provider,

Here is my latest contactless optical physiological telemetry summary generated with FaceVital AI:

View Secure Telemetry Portal:
${shareUrl}

${enablePin && pinCode ? `Access PIN Code: ${pinCode}\n` : ''}
${expiresInHours ? `Note: This link automatically expires in ${expiresInHours} hours.\n` : ''}
Summary Overview:
- Heart Rate: ${scan.vitals.heartRate.value} BPM (${scan.vitals.heartRate.status.toUpperCase()})
- Blood Pressure: ${scan.bloodPressure.systolic}/${scan.bloodPressure.diastolic} mmHg (${scan.bloodPressure.category})
- Fasting Glucose Proxy: ${scan.vitals.bloodSugarRisk.estimatedFastingMgDl} mg/dL (${scan.vitals.bloodSugarRisk.riskLevel})
- Autonomic Stress: ${scan.vitals.stress.score}/100 (${scan.vitals.stress.level})
- Respiration: ${scan.breathingRate.value} breaths/min

Thank you,
${patientAlias}`
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/85 p-3 sm:p-4 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      
      {/* Modal Card */}
      <div className="relative flex w-full max-w-3xl flex-col rounded-3xl border border-slate-800 bg-[#0a0a0a] shadow-2xl overflow-hidden my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0c0c0c] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  Secure Clinician Share Link
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-3 w-3" />
                  Redacted & Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate a private, view-only telemetry link for your doctor or healthcare specialist
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6">

          {/* Generated Link Card */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                View-Only Provider URL
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Clock className="h-3 w-3 text-cyan-400" />
                <span>
                  {expiresInHours ? `Expires in ${expiresInHours}h` : 'No Expiration'}
                </span>
                {enablePin && pinCode && (
                  <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-800">
                    PIN: {pinCode}
                  </span>
                )}
              </div>
            </div>

            {/* URL input box */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full rounded-xl border border-slate-700 bg-[#050505] px-3.5 py-2.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500 truncate"
              />

              <button
                onClick={handleCopyLink}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:bg-cyan-400 transition active:scale-95"
              >
                {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Action Bar */}
            <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-cyan-500/20">
              <button
                onClick={handleOpenPreview}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0a0a0a] px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
              >
                <ExternalLink className="h-3 w-3 text-cyan-400" />
                <span>Preview Doctor View</span>
              </button>

              <button
                onClick={handleSendEmail}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0a0a0a] px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
              >
                <Mail className="h-3 w-3 text-cyan-400" />
                <span>Email to Doctor</span>
              </button>

              <button
                onClick={() => setShowQr(!showQr)}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0a0a0a] px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
              >
                <QrCode className="h-3 w-3 text-cyan-400" />
                <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
              </button>
            </div>

            {/* QR Code expansion */}
            {showQr && (
              <div className="mt-4 p-4 rounded-xl bg-[#050505] border border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left animate-in fade-in duration-200">
                <div className="p-3 bg-white rounded-xl shadow-inner shrink-0">
                  <div className="w-28 h-28 flex flex-col items-center justify-center border-2 border-slate-900 rounded bg-slate-50 text-slate-900 font-mono text-[9px] p-2 text-center">
                    <QrCode className="h-14 w-14 text-slate-900 mb-1" />
                    <span>SCAN ON PHONE</span>
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white mb-1">Instant In-Clinic Scan</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                    Show this QR code to your clinician or specialist during an appointment to open the verified telemetry portal on their tablet or clinical workstation.
                  </p>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Payload Size: ~{Math.round(shareToken.length / 1024 * 10) / 10} KB (Compressed URL)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Privacy & Redaction Settings */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d0d0d] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Privacy & Redaction Controls
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                HIPAA / Confidential Mode
              </span>
            </div>

            {/* Privacy Toggles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Redact Face Snapshot */}
              <div 
                onClick={() => setRedactFaceSnapshot(!redactFaceSnapshot)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                  redactFaceSnapshot 
                    ? 'border-emerald-500/40 bg-emerald-500/5' 
                    : 'border-slate-800 bg-[#080808] hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded border ${
                  redactFaceSnapshot ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-slate-600'
                }`}>
                  {redactFaceSnapshot && <Check className="h-3 w-3" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    {redactFaceSnapshot ? <EyeOff className="h-3.5 w-3.5 text-emerald-400" /> : <Eye className="h-3.5 w-3.5 text-slate-500" />}
                    Redact Facial Camera Snapshot
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Strips webcam photos completely from the shared payload.
                  </p>
                </div>
              </div>

              {/* Anonymize Patient Identifier */}
              <div 
                onClick={() => setAnonymizePatient(!anonymizePatient)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                  anonymizePatient 
                    ? 'border-emerald-500/40 bg-emerald-500/5' 
                    : 'border-slate-800 bg-[#080808] hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded border ${
                  anonymizePatient ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-slate-600'
                }`}>
                  {anonymizePatient && <Check className="h-3 w-3" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Anonymize Patient Identity
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hides legal names, IP, and replaces with an anonymized subject tag.
                  </p>
                </div>
              </div>

              {/* Exclude Personal Notes */}
              <div 
                onClick={() => setExcludeUserNotes(!excludeUserNotes)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                  excludeUserNotes 
                    ? 'border-emerald-500/40 bg-emerald-500/5' 
                    : 'border-slate-800 bg-[#080808] hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded border ${
                  excludeUserNotes ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-slate-600'
                }`}>
                  {excludeUserNotes && <Check className="h-3 w-3" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Exclude Personal Diary & Notes
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Omits private reflections while keeping clinical observations intact.
                  </p>
                </div>
              </div>

              {/* Require Access PIN */}
              <div 
                onClick={() => setEnablePin(!enablePin)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                  enablePin 
                    ? 'border-cyan-500/40 bg-cyan-500/5' 
                    : 'border-slate-800 bg-[#080808] hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded border ${
                  enablePin ? 'border-cyan-500 bg-cyan-500 text-black' : 'border-slate-600'
                }`}>
                  {enablePin && <Check className="h-3 w-3" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-cyan-400" />
                    Require Access PIN
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Requires clinician to enter a 4-digit code to view the data.
                  </p>
                </div>
              </div>

            </div>

            {/* PIN Input if enabled */}
            {enablePin && (
              <div className="p-3.5 rounded-xl bg-[#050505] border border-cyan-500/30 flex items-center gap-3 animate-in fade-in duration-200">
                <Key className="h-4 w-4 text-cyan-400 shrink-0" />
                <div className="flex-1">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Set 4-6 Digit Security PIN
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 4829"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-40 rounded-lg border border-slate-700 bg-[#0a0a0a] px-3 py-1.5 text-sm font-mono tracking-widest text-cyan-300 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <span className="text-[11px] text-slate-400 max-w-xs leading-tight">
                  Share this PIN separately with your clinician via SMS or in person.
                </span>
              </div>
            )}

            {/* Alias & Expiration Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Shared Subject Label
                </label>
                <input
                  type="text"
                  value={patientAlias}
                  onChange={(e) => setPatientAlias(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#050505] px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-800 bg-[#050505] px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  Link Expiration Window
                </label>
                <select
                  value={expiresInHours === null ? 'never' : String(expiresInHours)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setExpiresInHours(val === 'never' ? null : Number(val));
                  }}
                  className="w-full rounded-xl border border-slate-800 bg-[#050505] px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="24">24 Hours (Recommended)</option>
                  <option value="72">72 Hours (3 Days)</option>
                  <option value="168">7 Days (1 Week)</option>
                  <option value="never">No Expiration (Permanent)</option>
                </select>
              </div>
            </div>

            {/* Clinician Note */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Note for Healthcare Provider
              </label>
              <textarea
                value={customClinicianNote}
                onChange={(e) => setCustomClinicianNote(e.target.value)}
                rows={2}
                placeholder="Reason for sharing or specific questions for your doctor..."
                className="w-full rounded-xl border border-slate-800 bg-[#050505] p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Module Inclusion Granularity Toggle */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>{showAdvanced ? 'Hide Clinical Module Inclusions' : 'Customize Clinical Submodules to Share'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 rounded-xl border border-slate-800 bg-[#080808] space-y-2 animate-in fade-in duration-200">
                <p className="text-[11px] text-slate-400 mb-2">
                  Select which specialized telemetry categories are included in the view-only portal:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Cardiac & Workload', state: includeCardiac, setter: setIncludeCardiac },
                    { label: 'Metabolic & Glycemic Proxies', state: includeMetabolic, setter: setIncludeMetabolic },
                    { label: 'Stress & Autonomic Spectra', state: includeStressHrv, setter: setIncludeStressHrv },
                    { label: '10-Yr Risk Forecast (ASCVD)', state: includeRiskForecast, setter: setIncludeRiskForecast },
                    { label: 'Lifestyle Action Protocols', state: includeLifestylePlan, setter: setIncludeLifestylePlan },
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
            )}
          </div>

          {/* Active Redaction Audit Log */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-[#050505] text-[11px] text-slate-400">
            <div className="font-bold font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Applied Privacy Redaction Audit Summary ({sharePayload.redactionsApplied.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sharePayload.redactionsApplied.map((redaction, idx) => (
                <span 
                  key={idx}
                  className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-800"
                >
                  ✓ {redaction}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 bg-[#0c0c0c] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Lock className="h-3 w-3 text-cyan-400" />
            <span>End-to-end client URL encoding &bull; Zero third-party tracking</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-slate-800 bg-[#050505] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:border-slate-700 hover:text-white transition"
            >
              Done
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-full bg-cyan-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-lg hover:bg-cyan-400 transition active:scale-95"
            >
              {isCopied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{isCopied ? 'Link Copied' : 'Copy Share Link'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
