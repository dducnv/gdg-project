import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, ArrowLeft, Award } from 'lucide-react';
import { PlayerId } from '../game/types';
import { soundEngine } from '../audio/soundEngine';

interface GameOverModalProps {
  isOpen: boolean;
  winner: PlayerId | 'draw' | null;
  scores: { 1: number; 2: number };
  player1Name?: string;
  player2Name?: string;
  localPlayerId?: PlayerId | 'spectator';
  onRestart: () => void;
  onBackToLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  scores,
  player1Name = 'Người chơi 1',
  player2Name = 'Người chơi 2',
  localPlayerId,
  onRestart,
  onBackToLobby
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEngine.playVictory();
      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDraw = winner === 'draw';
  const winnerName = winner === 1 ? player1Name : player2Name;
  const isLocalWinner = localPlayerId === winner;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-lg bg-obsidian-900 border border-emerald-500/30 rounded-3xl shadow-glow-jade p-6 md:p-8 text-center">
        {/* Trophy Icon */}
        <div className="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-obsidian-950 shadow-lg mb-4">
          <Trophy size={36} className="text-obsidian-950" />
        </div>

        <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white tracking-tight">
          {isDraw ? 'Trận Đấu Hòa!' : isLocalWinner ? 'Chúc Mừng Chiến Thắng!' : `${winnerName} Chiến Thắng!`}
        </h2>

        <p className="mt-1 text-xs md:text-sm font-mono text-slate-400">
          Cả 2 Ô Quan đã được thu hoạch trọn vẹn
        </p>

        {/* Score comparison card */}
        <div className="my-6 p-4 rounded-2xl bg-obsidian-800/70 border border-white/[0.08] grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-xl border ${winner === 1 ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-obsidian-900/60 border-white/[0.04]'}`}>
            <div className="text-xs font-mono text-slate-400 truncate">{player1Name}</div>
            <div className="font-mono text-3xl font-black text-emerald-400 mt-1">{scores[1]}</div>
            <div className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">Điểm chung cuộc</div>
          </div>

          <div className={`p-3 rounded-xl border ${winner === 2 ? 'bg-amber-950/40 border-amber-500/50' : 'bg-obsidian-900/60 border-white/[0.04]'}`}>
            <div className="text-xs font-mono text-slate-400 truncate">{player2Name}</div>
            <div className="font-mono text-3xl font-black text-amber-400 mt-1">{scores[2]}</div>
            <div className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">Điểm chung cuộc</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-glow-jade flex items-center justify-center gap-2"
          >
            <RefreshCw size={15} />
            <span>Tái Đấu Ngay</span>
          </button>

          <button
            onClick={onBackToLobby}
            className="py-3 px-4 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 hover:text-white border border-white/[0.08] font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={15} />
            <span>Sảnh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
