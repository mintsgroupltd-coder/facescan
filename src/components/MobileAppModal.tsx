/**
 * MobileAppModal.tsx
 * Comprehensive compilation studio and packaging handbook for Apple iOS and Google Android
 */

import React, { useState } from 'react';
import { 
  Smartphone, Apple, Play, Download, Copy, Check, Terminal, 
  ShieldCheck, Camera, Sparkles, X, ExternalLink, QrCode, 
  Layers, Settings, Info, Cpu, CheckCircle2, ChevronRight, FileCode
} from 'lucide-react';
import { MOBILE_FILES, README_MOBILE_GUIDE, downloadFile } from '../utils/mobileExportHelper';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'pwa' | 'files' | 'simulator'>('ios');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [simulatorDevice, setSimulatorDevice] = useState<'iphone' | 'android'>('iphone');

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const iosCommands = [
    { label: '1. Build optimized web bundle', cmd: 'npm run build' },
    { label: '2. Add iOS native platform (one-time)', cmd: 'npx cap add ios' },
    { label: '3. Sync web code to native iOS', cmd: 'npm run cap:build' },
    { label: '4. Launch in Apple Xcode', cmd: 'npx cap open ios' }
  ];

  const androidCommands = [
    { label: '1. Build optimized web bundle', cmd: 'npm run build' },
    { label: '2. Add Android native platform (one-time)', cmd: 'npx cap add android' },
    { label: '3. Sync web code to native Android', cmd: 'npm run cap:build' },
    { label: '4. Launch in Android Studio', cmd: 'npx cap open android' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl rounded-2xl border border-slate-800 bg-[#080808] text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-[#0c0c0e]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Apple iOS & Android App Compilation</h2>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">
                  Capacitor 8 Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Turn FaceVital AI into a native App Store (.ipa) and Google Play (.apk / .aab) binary with camera rPPG support.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 bg-[#0a0a0c] px-6 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'ios'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Apple className="h-4 w-4" />
            <span>Apple iOS (Xcode)</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'android'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="h-4 w-4 rotate-90 text-emerald-400" />
            <span>Android (Google Play)</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'pwa'
                ? 'border-purple-400 text-purple-300 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>1-Tap PWA Install</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'files'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="h-4 w-4" />
            <span>Native Manifests & Configs</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'simulator'
                ? 'border-blue-400 text-blue-300 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Mobile Device Simulator</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: APPLE IOS */}
          {activeTab === 'ios' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-[#0d0d10] p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Platform</div>
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    <Apple className="h-4 w-4 text-cyan-400" />
                    iOS 15.0+ / iPadOS
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">iPhone 11 through iPhone 16 Pro Max, iPad Pro, iPad Air.</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0d0d10] p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bundle Identifier</div>
                  <div className="text-base font-mono font-bold text-cyan-300">com.facevital.health</div>
                  <p className="text-[11px] text-slate-400 mt-1">Configured in capacitor.config.json</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0d0d10] p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Camera Authorization</div>
                  <div className="text-base font-semibold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    NSCameraUsageDescription
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Pre-configured in Info.plist for optical rPPG.</p>
                </div>
              </div>

              {/* Build Commands */}
              <div className="rounded-xl border border-slate-800 bg-[#0d0d10] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Apple iOS Compilation CLI</h3>
                  </div>
                  <button
                    onClick={() => handleCopy(iosCommands.map(c => c.cmd).join('\n'), 'all-ios')}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-200 hover:text-white transition"
                  >
                    {copiedKey === 'all-ios' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'all-ios' ? 'Copied All Commands' : 'Copy All Steps'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {iosCommands.map((item, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-800/80 bg-[#050507] p-3">
                      <div className="text-xs font-medium text-slate-400 mb-1.5">{item.label}</div>
                      <div className="flex items-center justify-between font-mono text-xs bg-black/60 rounded px-3 py-2 text-cyan-300 border border-slate-800">
                        <span>{item.cmd}</span>
                        <button
                          onClick={() => handleCopy(item.cmd, `ios-${idx}`)}
                          className="text-slate-400 hover:text-cyan-300 transition ml-2"
                          title="Copy command"
                        >
                          {copiedKey === `ios-${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Xcode Deployment Guide */}
              <div className="rounded-xl border border-slate-800 bg-[#0d0d10] p-5 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Apple className="h-4 w-4 text-cyan-400" />
                  Inside Xcode: Creating .IPA or TestFlight Build
                </h3>
                <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                  <li>In Xcode project settings, navigate to <strong className="text-white">Signing & Capabilities</strong> and select your Apple Developer Team.</li>
                  <li>Verify that <strong className="text-white">Camera Permission</strong> is enabled under Info tab (<code className="text-cyan-300">Privacy - Camera Usage Description</code>).</li>
                  <li>Plug in your iPhone via USB or select an iOS Simulator from the device dropdown.</li>
                  <li>Press <strong className="text-white">Cmd + R</strong> to test the native rPPG optical vital scanning directly on your iPhone.</li>
                  <li>To release on App Store or TestFlight: Go to <strong className="text-white">Product &rarr; Archive</strong>, then click <strong className="text-white">Distribute App</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID */}
          {activeTab === 'android' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-[#0d0d10] p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Platform</div>
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    <Play className="h-4 w-4 rotate-90 text-emerald-400" />
                    Android 8.0+ (API 26-35)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Samsung Galaxy, Google Pixel, Xiaomi, OnePlus phones & tablets.</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0d0d10] p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Package Name</div>
                  <div className="text-base font-mono font-bold text-emerald-300">com.facevital.health</div>
                  <p className="text-[11px] text-slate-400 mt-1">Configured in AndroidManifest & Capacitor</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0d0d10] p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Hardware Features</div>
                  <div className="text-base font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Camera className="h-4 w-4" />
                    Front Camera Required
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Auto-prompts user for camera grant on first launch.</p>
                </div>
              </div>

              {/* Android CLI Commands */}
              <div className="rounded-xl border border-slate-800 bg-[#0d0d10] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Google Android Compilation CLI</h3>
                  </div>
                  <button
                    onClick={() => handleCopy(androidCommands.map(c => c.cmd).join('\n'), 'all-android')}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-200 hover:text-white transition"
                  >
                    {copiedKey === 'all-android' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'all-android' ? 'Copied All Commands' : 'Copy All Steps'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {androidCommands.map((item, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-800/80 bg-[#050507] p-3">
                      <div className="text-xs font-medium text-slate-400 mb-1.5">{item.label}</div>
                      <div className="flex items-center justify-between font-mono text-xs bg-black/60 rounded px-3 py-2 text-emerald-300 border border-slate-800">
                        <span>{item.cmd}</span>
                        <button
                          onClick={() => handleCopy(item.cmd, `android-${idx}`)}
                          className="text-slate-400 hover:text-emerald-300 transition ml-2"
                          title="Copy command"
                        >
                          {copiedKey === `android-${idx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Android Studio Deployment Guide */}
              <div className="rounded-xl border border-slate-800 bg-[#0d0d10] p-5 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Play className="h-4 w-4 rotate-90 text-emerald-400" />
                  Inside Android Studio: Generating APK / AAB
                </h3>
                <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                  <li>Open the <code className="text-emerald-300">android</code> folder inside Android Studio.</li>
                  <li>Allow Gradle to finish syncing required dependencies (<code className="text-slate-400">capacitor-android</code>).</li>
                  <li>Click <strong className="text-white">Run 'app'</strong> (Shift + F10) to test on an Android emulator or connected device via ADB.</li>
                  <li>For Direct APK testing: Go to <strong className="text-white">Build &rarr; Build Bundle(s) / APK(s) &rarr; Build APK(s)</strong>.</li>
                  <li>For Google Play Store submission: Go to <strong className="text-white">Build &rarr; Generate Signed Bundle / APK</strong>, choose <strong className="text-white">Android App Bundle (.aab)</strong>, and sign with your release keystore.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: PWA 1-TAP INSTALL */}
          {activeTab === 'pwa' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Direct Mobile Web App (PWA) Installation</h3>
                    <p className="text-xs text-purple-200">
                      FaceVital AI includes a Web App Manifest and Service Worker. It can be installed instantly on any iPhone or Android without using Xcode or Android Studio.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* iOS Safari Guide */}
                <div className="rounded-xl border border-slate-800 bg-[#0d0d10] p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Apple className="h-5 w-5 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">Apple iPhone & iPad (Safari)</h4>
                  </div>
                  <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                    <li>Open this URL in <strong className="text-white">Apple Safari</strong> on your iPhone.</li>
                    <li>Tap the <strong className="text-cyan-300">Share icon</strong> (the square with an arrow pointing up at the bottom).</li>
                    <li>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.</li>
                    <li>Confirm by tapping <strong className="text-cyan-400">"Add"</strong> in the top right corner.</li>
                    <li>Launch <strong className="text-white">FaceVital AI</strong> from your home screen. It will open in full-screen standalone mode with native camera access.</li>
                  </ol>
                </div>

                {/* Android Chrome Guide */}
                <div className="rounded-xl border border-slate-800 bg-[#0d0d10] p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Play className="h-5 w-5 rotate-90 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Google Android (Chrome / Brave / Edge)</h4>
                  </div>
                  <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                    <li>Open this URL in <strong className="text-white">Google Chrome</strong> on your Android phone.</li>
                    <li>Tap the <strong className="text-emerald-300">three dots menu</strong> (⋮) in the top right.</li>
                    <li>Tap <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.</li>
                    <li>Follow the prompt to install the native standalone package.</li>
                    <li>Launch the app from your app drawer. Enjoy full 60 FPS rPPG camera scanning with zero browser chrome!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NATIVE MANIFESTS & FILES */}
          {activeTab === 'files' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Ready-to-Use Native Configuration Files
                  </span>
                </div>
                <button
                  onClick={() => {
                    const currentFile = MOBILE_FILES[selectedFileIdx];
                    downloadFile(currentFile.filename.split(' ')[0], currentFile.content);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download {MOBILE_FILES[selectedFileIdx].filename.split(' ')[0]}</span>
                </button>
              </div>

              {/* File Selector Pills */}
              <div className="flex flex-wrap gap-2">
                {MOBILE_FILES.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedFileIdx(idx)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-mono transition ${
                      selectedFileIdx === idx
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-semibold'
                        : 'border-slate-800 bg-[#0d0d10] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {file.filename}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400 italic">
                {MOBILE_FILES[selectedFileIdx].description}
              </div>

              {/* Code Viewer */}
              <div className="relative rounded-xl border border-slate-800 bg-[#040406] overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#0a0a0d] px-4 py-2 text-xs font-mono text-slate-400">
                  <span>{MOBILE_FILES[selectedFileIdx].filename}</span>
                  <button
                    onClick={() => handleCopy(MOBILE_FILES[selectedFileIdx].content, `file-${selectedFileIdx}`)}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition"
                  >
                    {copiedKey === `file-${selectedFileIdx}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === `file-${selectedFileIdx}` ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
                  {MOBILE_FILES[selectedFileIdx].content}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: MOBILE DEVICE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-4 animate-in fade-in flex flex-col items-center">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Select Device Frame:</span>
                <div className="inline-flex rounded-lg border border-slate-800 bg-[#0d0d10] p-1">
                  <button
                    onClick={() => setSimulatorDevice('iphone')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition ${
                      simulatorDevice === 'iphone'
                        ? 'bg-cyan-500 text-black shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Apple className="h-3.5 w-3.5" />
                    <span>iPhone 16 Pro</span>
                  </button>
                  <button
                    onClick={() => setSimulatorDevice('android')}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition ${
                      simulatorDevice === 'android'
                        ? 'bg-emerald-500 text-black shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Play className="h-3.5 w-3.5 rotate-90" />
                    <span>Galaxy S24 Ultra</span>
                  </button>
                </div>
              </div>

              {/* Phone Mockup Frame */}
              <div className="relative w-full max-w-sm rounded-[42px] border-[10px] border-slate-800 bg-[#050505] p-3 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
                {/* Dynamic Island / Camera Punch Hole */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                  {simulatorDevice === 'iphone' ? (
                    <div className="h-5 w-24 rounded-full bg-black border border-slate-800/80 flex items-center justify-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-900 border border-slate-700" />
                    </div>
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full bg-black border border-slate-700" />
                  )}
                </div>

                {/* Simulated Screen Content */}
                <div className="h-[520px] w-full rounded-[30px] bg-[#070709] border border-slate-800/60 overflow-y-auto p-4 pt-8 text-slate-100 flex flex-col justify-between">
                  <div>
                    {/* Simulated Mobile Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-xs font-bold text-white font-mono tracking-wider">FaceVital AI</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        OPTICAL rPPG READY
                      </span>
                    </div>

                    {/* Camera Feed Simulated Area */}
                    <div className="relative h-44 rounded-xl border border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-black overflow-hidden flex flex-col items-center justify-center p-3 text-center mb-3">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1)_0,transparent_70%)]" />
                      <div className="h-20 w-16 rounded-full border-2 border-dashed border-cyan-400/60 flex items-center justify-center mb-2 animate-pulse">
                        <Camera className="h-6 w-6 text-cyan-300" />
                      </div>
                      <div className="text-[11px] font-semibold text-cyan-200">Face Scanner Active</div>
                      <div className="text-[9px] text-slate-400">Position face within oval reticle</div>
                    </div>

                    {/* Quick Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-lg border border-slate-800 bg-[#0c0c0e] p-2">
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">Pulse / HR</div>
                        <div className="text-sm font-bold text-cyan-300 font-mono">72 <span className="text-[9px] font-normal text-slate-400">BPM</span></div>
                      </div>
                      <div className="rounded-lg border border-slate-800 bg-[#0c0c0e] p-2">
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">Blood Pressure</div>
                        <div className="text-sm font-bold text-emerald-300 font-mono">118/76 <span className="text-[9px] font-normal text-slate-400">mmHg</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Mobile Action Button */}
                  <button className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-black uppercase tracking-wider shadow-lg active:scale-95 transition">
                    Start 30s Face Vital Scan
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/80 bg-[#0a0a0c] px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>Capacitor bridges the React web app directly into native Swift (iOS) and Kotlin/Java (Android) codebases.</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => downloadFile('FaceVital-Mobile-Guide.md', README_MOBILE_GUIDE)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#121216] px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-600 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Guide (.md)</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-cyan-400 transition"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
