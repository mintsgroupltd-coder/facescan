/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Wind, X, Play, Pause, RefreshCw, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { audioController } from '../utils/audioFeedback';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreathingBiofeedbackModal: React.FC<BreathingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [technique, setTechnique] = useState<'4-7-8' | 'box'>('4-7-8');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'hold-empty'>('inhale');
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup breathing cycle parameters
  useEffect(() => {
    if (!isOpen || !isActive) {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
      return;
    }

    let currentPhase: 'inhale' | 'hold' | 'exhale' | 'hold-empty' = 'inhale';
    let currentDuration = technique === '4-7-8' ? 4 : 4;
    setPhase('inhale');
    setSecondsLeft(currentDuration);
    audioController.playBreathingTone('inhale');

    phaseTimerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Advance phase
        if (technique === '4-7-8') {
          if (currentPhase === 'inhale') {
            currentPhase = 'hold';
            currentDuration = 7;
            audioController.playBreathingTone('hold');
          } else if (currentPhase === 'hold') {
            currentPhase = 'exhale';
            currentDuration = 8;
            audioController.playBreathingTone('exhale');
          } else {
            currentPhase = 'inhale';
            currentDuration = 4;
            setCompletedCycles((c) => c + 1);
            audioController.playBreathingTone('inhale');
          }
        } else {
          // Box breathing (4-4-4-4)
          if (currentPhase === 'inhale') {
            currentPhase = 'hold';
            currentDuration = 4;
            audioController.playBreathingTone('hold');
          } else if (currentPhase === 'hold') {
            currentPhase = 'exhale';
            currentDuration = 4;
            audioController.playBreathingTone('exhale');
          } else if (currentPhase === 'exhale') {
            currentPhase = 'hold-empty';
            currentDuration = 4;
            audioController.playBreathingTone('hold');
          } else {
            currentPhase = 'inhale';
            currentDuration = 4;
            setCompletedCycles((c) => c + 1);
            audioController.playBreathingTone('inhale');
          }
        }

        setPhase(currentPhase);
        return currentDuration;
      });
    }, 1000);

    return () => {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    };
  }, [isOpen, isActive, technique]);

  if (!isOpen) return null;

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Inhale deeply through your nose...';
      case 'hold':
        return 'Hold gently, relax your shoulders...';
      case 'exhale':
        return 'Exhale slowly through your mouth...';
      case 'hold-empty':
        return 'Rest at empty lungs...';
    }
  };

  const getCircleScale = () => {
    if (phase === 'inhale') return 'scale-125 duration-[4000ms]';
    if (phase === 'hold') return 'scale-125 duration-[7000ms]';
    if (phase === 'exhale') return 'scale-90 duration-[8000ms]';
    return 'scale-90 duration-[4000ms]';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/90 p-4 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#0a0a0a] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
              <Wind className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                Vagal Biofeedback Loop
              </h3>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">
                Real-time parasympathetic resonance training
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

        {/* Technique Selector */}
        <div className="px-6 pt-5 flex items-center justify-center gap-2">
          <button
            onClick={() => { setTechnique('4-7-8'); setCompletedCycles(0); }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              technique === '4-7-8'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                : 'bg-[#050505] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            4-7-8 Relaxing Breath
          </button>
          <button
            onClick={() => { setTechnique('box'); setCompletedCycles(0); }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              technique === 'box'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                : 'bg-[#050505] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Box Breathing (4-4-4-4)
          </button>
        </div>

        {/* Breathing Animation Canvas Area */}
        <div className="relative flex flex-col items-center justify-center py-12 px-6">
          
          {/* Animated Expanding Orb */}
          <div className="relative flex h-52 w-52 items-center justify-center">
            
            {/* Outer soft glow ring */}
            <div
              className={`absolute inset-0 rounded-full bg-cyan-500/15 blur-2xl transition-transform ease-in-out ${getCircleScale()}`}
            />

            {/* Middle pulsating border */}
            <div
              className={`absolute inset-4 rounded-full border border-cyan-400/40 transition-transform ease-in-out ${getCircleScale()}`}
            />

            {/* Center Core Circle */}
            <div
              className={`relative flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#050505] border border-cyan-400/60 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-transform ease-in-out ${getCircleScale()}`}
            >
              <span className="text-4xl font-light font-serif tracking-tight text-cyan-400">
                {secondsLeft}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1 font-mono">
                {phase}
              </span>
            </div>

          </div>

          {/* Phase Guidance Text */}
          <p className="mt-8 text-sm font-medium text-slate-300 text-center font-serif italic tracking-wide">
            "{getPhaseInstruction()}"
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Completed Cycles: <strong className="text-cyan-400 font-bold">{completedCycles}</strong></span>
          </div>

        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-[#050505] px-6 py-4">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2 rounded-full border border-slate-800 bg-[#0a0a0a] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white transition"
          >
            {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-cyan-400" />}
            <span>{isActive ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-full bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-cyan-400 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
