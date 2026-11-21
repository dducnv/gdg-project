import React from 'react';
import { PlayerId } from '../game/types';
import { User, Bot, Sparkles, MessageSquare } from 'lucide-react';

interface ScoreBoardProps {
  currentTurn: PlayerId;
  scores: { 1: number; 2: number };
  player1Name?: string;
  player2Name?: string;
  isBot?: boolean;
  hasGeminiKey?: boolean;
  round: number;
  geminiCommentary?: string;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  currentTurn,
  scores,
  player1Name = 'Người chơi 1',
  player2Name = 'Người chơi 2',
  isBot = false,
  hasGeminiKey = false,
  round,
  geminiCommentary
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        {/* Player 1 Card (Jade Emerald) */}
        <div
          className={`flex-1 p-3 md:p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md flex items-center gap-3.5 ${
            currentTurn === 1
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_24px_-4px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500/30'
              : 'bg-obsidian-800/40 border-white/[0.06] opacity-75'
          }`}
        >
          <div className="relative">
            <div className="w-11 h-11 md:w-13 md:h-13 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-800 flex items-center justify-center text-obsidian-950 font-display font-bold shadow-md">
              <User size={22} className="text-obsidian-950" />
            </div>
            {currentTurn === 1 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm md:text-base text-white truncate">
                {player1Name}
              </span>
            </div>
            <div className="text-xs font-mono text-emerald-400/80">Hàng Dưới (Ô #1 - #5)</div>
          </div>

          {/* Digital Counter */}
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Điểm</div>
            <div className="font-mono text-2xl md:text-3xl font-black text-emerald-400 tracking-tight">
              {scores[1]}
            </div>
          </div>
        </div>

        {/* VS & Round Center Badge */}
        <div className="flex flex-col items-center justify-center px-2 py-1">
          <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-widest">
            Lượt {round}
          </span>
          <div className="text-slate-600 font-display font-black text-sm my-0.5">VS</div>
          <div className="text-[10px] font-mono text-slate-400">
            {currentTurn === 1 ? 'Lượt P1' : 'Lượt P2'}
          </div>
        </div>

        {/* Player 2 / Bot Card (Amber Gold) */}
        <div
          className={`flex-1 p-3 md:p-4 rounded-2xl border transition-all duration-300 backdrop-blur-md flex items-center gap-3.5 ${
            currentTurn === 2
              ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_24px_-4px_rgba(245,158,11,0.35)] ring-1 ring-amber-500/30'
              : 'bg-obsidian-800/40 border-white/[0.06] opacity-75'
          }`}
        >
          {/* Digital Counter */}
          <div className="text-left">
            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Điểm</div>
            <div className="font-mono text-2xl md:text-3xl font-black text-amber-400 tracking-tight">
              {scores[2]}
            </div>
          </div>

          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center justify-end gap-1.5">
              {isBot && hasGeminiKey && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-400" />
                  Gemini
                </span>
              )}
              <span className="font-display font-bold text-sm md:text-base text-white truncate">
                {player2Name}
              </span>
            </div>
            <div className="text-xs font-mono text-amber-400/80">Hàng Trên (Ô #7 - #11)</div>
          </div>

          <div className="relative">
            <div className="w-11 h-11 md:w-13 md:h-13 rounded-xl bg-gradient-to-br from-amber-400 to-amber-800 flex items-center justify-center text-obsidian-950 font-display font-bold shadow-md">
              {isBot ? <Bot size={22} className="text-obsidian-950" /> : <User size={22} className="text-obsidian-950" />}
            </div>
            {currentTurn === 2 && (
              <span className="absolute -top-1 -left-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gemini Live Commentary Banner */}
      {isBot && geminiCommentary && (
        <div className="w-full px-4 py-2 rounded-xl bg-amber-950/30 border border-amber-500/30 backdrop-blur-md flex items-center gap-2.5 text-xs font-mono text-amber-200 animate-fade-in shadow-glow-amber">
          <MessageSquare size={14} className="text-amber-400 shrink-0" />
          <span className="text-slate-400 font-bold shrink-0">Thần Sỏi AI:</span>
          <span className="italic truncate">{geminiCommentary}</span>
        </div>
      )}
    </div>
  );
};
