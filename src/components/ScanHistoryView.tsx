/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  History, Heart, Droplet, Flame, Download, Trash2, ArrowUpRight, 
  FileText, Calendar, Sparkles, Plus, Search, Filter, RefreshCw,
  TrendingUp, CheckCircle2, AlertTriangle, Eye, Shield, Share2
} from 'lucide-react';
import { FaceScanResult } from '../types';
import { HistoricalTrendCharts } from './HistoricalTrendCharts';
import { AddManualLogModal } from './AddManualLogModal';
import { exportHistoryCSV } from '../utils/historyStorage';

interface ScanHistoryViewProps {
  history: FaceScanResult[];
  onSelectScan: (scan: FaceScanResult) => void;
  onClearHistory: () => void;
  onSeedHistory: (days: number) => void;
  onAddLog: (scan: FaceScanResult) => void;
  onDeleteScan?: (id: string) => void;
  onOpenHealthReport?: (scan?: FaceScanResult) => void;
  onOpenShareSummary?: (scan?: FaceScanResult) => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  history,
  onSelectScan,
  onClearHistory,
  onSeedHistory,
  onAddLog,
  onDeleteScan,
  onOpenHealthReport,
  onOpenShareSummary,
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'logs'>('trends');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'optimal' | 'elevated'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'live_webcam' | 'sample_profile'>('all');

  // Filter logs according to search query and filters
  const filteredLogs = useMemo(() => {
    return history.filter((scan) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDate = new Date(scan.timestamp).toLocaleDateString().toLowerCase().includes(q);
        const matchesNotes = (scan.userNotes || '').toLowerCase().includes(q);
        const matchesRisk = scan.vitals.bloodSugarRisk.riskLevel.toLowerCase().includes(q);
        const matchesStress = scan.vitals.stress.level.toLowerCase().includes(q);
        if (!matchesDate && !matchesNotes && !matchesRisk && !matchesStress) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === 'optimal') {
        if (scan.vitals.stress.score >= 50 || scan.vitals.bloodSugarRisk.estimatedFastingMgDl > 105) {
          return false;
        }
      } else if (statusFilter === 'elevated') {
        if (scan.vitals.stress.score < 50 && scan.vitals.bloodSugarRisk.estimatedFastingMgDl <= 105) {
          return false;
        }
      }

      // Source filter
      if (sourceFilter !== 'all' && scan.sourceMode !== sourceFilter) {
        return false;
      }

      return true;
    });
  }, [history, searchQuery, statusFilter, sourceFilter]);

  const exportHistoryJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `facevital_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Sub-Nav Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-light tracking-wide uppercase text-white font-serif">
              Vital Signs History & Longitudinal Trends
            </h2>
            <p className="text-xs text-slate-500">
              Longitudinal tracking of resting heart rate, stress levels, and estimated blood sugar over days, weeks, and months
            </p>
          </div>
        </div>

        {/* View Mode Switcher + Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Trends vs Logs Sub-Tabs */}
          <div className="flex items-center rounded-full bg-[#050505] p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === 'trends'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Trend Graphs
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === 'logs'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Telemetry Logs ({history.length})
            </button>
          </div>

          {/* Download CSV Dataset Button */}
          {history.length > 0 && (
            <button
              onClick={() => exportHistoryCSV(history)}
              className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition shadow-sm"
              title="Download entire vital signs dataset as CSV for external analysis (Excel, Python, R, EHR)"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Download CSV</span>
            </button>
          )}

          {/* Generate Report Button */}
          {onOpenHealthReport && history.length > 0 && (
            <button
              onClick={() => onOpenHealthReport(history[0])}
              className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition shadow-sm"
              title="Generate printable PDF Health Report from latest telemetry"
            >
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              <span>Health Report</span>
            </button>
          )}

          {/* Share Summary Button */}
          {onOpenShareSummary && history.length > 0 && (
            <button
              onClick={() => onOpenShareSummary(history[0])}
              className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-[#070707] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300 transition shadow-sm"
              title="Create a redacted, view-only web link for your doctor"
            >
              <Share2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Share Link</span>
            </button>
          )}

          {/* Add Manual Record CTA */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-cyan-400 transition shadow-md"
          >
            <Plus className="h-3.5 w-3.5" /> Log Vital
          </button>
        </div>
      </div>

      {/* Manual Entry Modal */}
      <AddManualLogModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLog={onAddLog}
      />

      {/* Main Content Area */}
      {history.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-12 text-center shadow-2xl space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <History className="h-7 w-7" />
          </div>
          <h3 className="text-base font-light uppercase tracking-wide text-white font-serif">No Saved Scans Yet</h3>
          <p className="max-w-md mx-auto text-xs text-slate-500">
            Complete a live contactless face scan or populate realistic longitudinal historical telemetry to explore days, weeks, and months tracking trends.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSeedHistory(30)}
              className="flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-cyan-400 transition"
            >
              <Sparkles className="h-3.5 w-3.5" /> Load 30-Day History
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Trend Graphs Tab */}
          {activeTab === 'trends' && (
            <HistoricalTrendCharts
              history={history}
              onSelectScan={onSelectScan}
            />
          )}

          {/* Logs Table Tab */}
          {activeTab === 'logs' && (
            <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl space-y-6">
              
              {/* Filter Controls & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs by date, notes, or status..."
                    className="w-full bg-[#050505] border border-slate-800 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Filter Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center rounded-full bg-[#050505] p-1 border border-slate-800 text-[11px] font-mono">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1 rounded-full uppercase transition ${
                        statusFilter === 'all' ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStatusFilter('optimal')}
                      className={`px-3 py-1 rounded-full uppercase transition ${
                        statusFilter === 'optimal' ? 'bg-emerald-400 text-black font-bold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Optimal
                    </button>
                    <button
                      onClick={() => setStatusFilter('elevated')}
                      className={`px-3 py-1 rounded-full uppercase transition ${
                        statusFilter === 'elevated' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Elevated
                    </button>
                  </div>

                  {/* Export Actions */}
                  <button
                    onClick={() => exportHistoryCSV(history)}
                    title="Export all historical vital signs as a structured CSV spreadsheet"
                    className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={exportHistoryJSON}
                    title="Export raw JSON dataset"
                    className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-[#050505] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition"
                  >
                    <Download className="h-3.5 w-3.5 text-cyan-400" /> JSON
                  </button>
                  <button
                    onClick={onClearHistory}
                    className="flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-rose-400 hover:bg-rose-500/20 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear
                  </button>
                </div>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#050505] text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Timestamp / Context</th>
                      <th className="px-4 py-3">Heart Rate</th>
                      <th className="px-4 py-3">Stress Score</th>
                      <th className="px-4 py-3">Blood Sugar</th>
                      <th className="px-4 py-3">HRV & BP</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredLogs.map((scan) => {
                      const date = new Date(scan.timestamp);
                      const formattedDate = date.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                      const formattedTime = date.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      const isFasting = scan.userNotes?.toLowerCase().includes('fasting');

                      return (
                        <tr
                          key={scan.id}
                          className="hover:bg-[#050505] transition cursor-pointer"
                          onClick={() => onSelectScan(scan)}
                        >
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-200">{formattedDate} <span className="font-mono text-slate-500 text-[11px]">({formattedTime})</span></div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                {scan.sourceMode === 'live_webcam' ? 'Live Camera' : (scan.id.startsWith('manual_') ? 'Manual Log' : 'Clinical Preset')}
                              </span>
                              {scan.userNotes && (
                                <span className="text-[10px] text-cyan-400/80 font-sans italic truncate max-w-[140px]">
                                  &bull; {scan.userNotes}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 font-mono">
                            <span className="inline-flex items-center gap-1.5 text-rose-400 font-semibold">
                              <Heart className="h-3 w-3" />
                              {scan.vitals.heartRate.value} BPM
                            </span>
                          </td>

                          <td className="px-4 py-3.5 font-mono">
                            <span className={`inline-flex items-center gap-1.5 font-semibold ${
                              scan.vitals.stress.score < 35 
                                ? 'text-emerald-400' 
                                : (scan.vitals.stress.score < 60 ? 'text-cyan-300' : 'text-amber-400')
                            }`}>
                              <Flame className="h-3 w-3" />
                              {scan.vitals.stress.score}/100
                            </span>
                            <div className="text-[10px] text-slate-500 uppercase">
                              {scan.vitals.stress.level}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 font-mono">
                            <div className="text-cyan-300 font-semibold">
                              {scan.vitals.bloodSugarRisk.estimatedFastingMgDl} mg/dL
                            </div>
                            <span className={`text-[10px] uppercase tracking-wider font-mono ${
                              scan.vitals.bloodSugarRisk.riskLevel === 'Optimal' 
                                ? 'text-emerald-400' 
                                : (scan.vitals.bloodSugarRisk.riskLevel === 'Normal' ? 'text-slate-400' : 'text-amber-400')
                            }`}>
                              {scan.vitals.bloodSugarRisk.riskLevel}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 font-mono text-slate-400">
                            <div>HRV: <span className="text-cyan-400">{scan.vitals.hrv.rmssdMs} ms</span></div>
                            <div className="text-[11px] text-slate-500">
                              BP: {scan.vitals.bloodPressureEstimate.systolic}/{scan.vitals.bloodPressureEstimate.diastolic}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {onOpenHealthReport && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenHealthReport(scan);
                                  }}
                                  title="Generate PDF Health Report for this session"
                                  className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-[#050505] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition"
                                >
                                  <FileText className="h-3 w-3 text-cyan-400" />
                                  <span className="hidden sm:inline">PDF</span>
                                </button>
                              )}
                              {onOpenShareSummary && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenShareSummary(scan);
                                  }}
                                  title="Share redacted summary link with doctor"
                                  className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-[#050505] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition"
                                >
                                  <Share2 className="h-3 w-3 text-cyan-400" />
                                  <span className="hidden sm:inline">Share</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectScan(scan);
                                }}
                                title="Open full telemetry report"
                                className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-[#050505] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
                              >
                                <span>View</span>
                                <ArrowUpRight className="h-3 w-3" />
                              </button>
                              {onDeleteScan && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteScan(scan.id);
                                  }}
                                  title="Delete log"
                                  className="p-1 rounded-full text-slate-600 hover:text-rose-400 transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Data Seeding & Maintenance Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>All telemetry records are securely stored locally on this device.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSeedHistory(30)}
                    className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-wider text-[11px]"
                  >
                    <RefreshCw className="h-3 w-3" /> Populate 30-Day Sample Set
                  </button>
                  <span className="text-slate-700">&bull;</span>
                  <button
                    onClick={() => onSeedHistory(90)}
                    className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-wider text-[11px]"
                  >
                    <RefreshCw className="h-3 w-3" /> Populate 90-Day Set
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
