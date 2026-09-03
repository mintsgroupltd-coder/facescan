/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw, MessageSquare, Lightbulb, Shield } from 'lucide-react';
import { FaceScanResult, ChatMessage } from '../types';

interface AIHealthCoachProps {
  scan: FaceScanResult;
}

export const AIHealthCoachChat: React.FC<AIHealthCoachProps> = ({ scan }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      text: `Hello! I've reviewed your latest facial biometric scan. Your resting heart rate is **${scan.vitals.heartRate.value} BPM**, stress index is **${scan.vitals.stress.score}/100**, and estimated glycemic risk status is **${scan.vitals.bloodSugarRisk.riskLevel}** (est. **${scan.vitals.bloodSugarRisk.estimatedFastingMgDl} mg/dL**).\n\nWhat would you like to explore regarding your vitals, autonomic recovery, or blood sugar stabilization today?`,
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickQuestions = [
    'How can I lower my stress & heart rate right now?',
    'What meal sequence prevents blood sugar spikes?',
    'Why does cortisol raise blood glucose levels?',
    'What does my HRV score mean for recovery?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputPrompt.trim();
    if (!messageText || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      text: messageText,
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated,
          currentVitals: scan,
        }),
      });

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: 'msg_' + Date.now() + 1,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: data.reply || "I'm analyzing your vital trends. Maintain regular hydration and balanced breathing for steady metabolic control.",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat coach error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          text: 'To optimize your vitals, focus on deep 4-7-8 breathing and consuming protein before carbohydrates to sustain stable blood glucose.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0a0a0a] shadow-2xl overflow-hidden flex flex-col h-[560px]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#050505] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                Biometric & Metabolic Intelligence
              </h3>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] uppercase tracking-widest font-mono text-cyan-400 border border-cyan-500/30">
                Gemini 3.7 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Personalized insights on optical vitals, autonomic recovery, and glycemic balance
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              }`}
            >
              {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>

            <div
              className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-white text-black font-medium shadow-md'
                  : 'bg-[#050505] border border-slate-800 text-slate-200 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-2xl bg-[#050505] border border-slate-800 p-4 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
              <span>Synthesizing physiological parameters with Gemini 3.7 Flash...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="border-t border-slate-800 bg-[#050505] px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 shrink-0 flex items-center gap-1 font-mono">
          <Lightbulb className="h-3 w-3 text-amber-400" /> Suggested:
        </span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="shrink-0 rounded-full border border-slate-800 bg-[#0a0a0a] px-3.5 py-1 text-[11px] text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300 transition whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="border-t border-slate-800 bg-[#050505] p-4 flex items-center gap-2.5"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask about your heart rate, autonomic stress, or blood sugar..."
          className="flex-1 rounded-full border border-slate-800 bg-[#0a0a0a] px-5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading || !inputPrompt.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:bg-cyan-400 disabled:opacity-30"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

    </div>
  );
};
