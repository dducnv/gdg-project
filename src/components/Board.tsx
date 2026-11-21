import React, { useState } from 'react';
import { PitState, PlayerId, MoveDirection, AnimationStep } from '../game/types';
import { PebbleVisual } from './PebbleVisual';
import { ArrowLeft, ArrowRight, Hand, Sparkles } from 'lucide-react';

interface BoardProps {
  board: PitState[];
  currentTurn: PlayerId;
  localPlayerId?: PlayerId | 'spectator';
  isInteractive: boolean;
  onMove: (pitIndex: number, direction: MoveDirection) => void;
  activeAnimationStep: AnimationStep | null;
  selectedPit: number | null;
  onSelectPit: (pitIndex: number | null) => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  currentTurn,
  localPlayerId,
  isInteractive,
  onMove,
  activeAnimationStep,
  selectedPit,
  onSelectPit
}) => {
  // Pits mapping for visual layout
  // Top row (Player 2): index 11, 10, 9, 8, 7 (from left to right)
  const topPits = [11, 10, 9, 8, 7];
  // Bottom row (Player 1): index 1, 2, 3, 4, 5 (from left to right)
  const bottomPits = [1, 2, 3, 4, 5];

  const leftQuan = board[0];
  const rightQuan = board[6];

  const isPitPlayable = (pitIndex: number): boolean => {
    if (!isInteractive) return false;
    // Check if it belongs to current player's side
    if (currentTurn === 1 && (pitIndex < 1 || pitIndex > 5)) return false;
    if (currentTurn === 2 && (pitIndex < 7 || pitIndex > 11)) return false;
    // Check if network player role matches turn
    if (localPlayerId && localPlayerId !== 'spectator' && localPlayerId !== currentTurn) return false;
    // Check stone count
    return board[pitIndex].smallStones > 0;
  };

  const handlePitClick = (pitIndex: number) => {
    if (!isPitPlayable(pitIndex)) return;
    if (selectedPit === pitIndex) {
      onSelectPit(null);
    } else {
      onSelectPit(pitIndex);
    }
  };

  const handleChooseDirection = (direction: MoveDirection) => {
    if (selectedPit !== null) {
      onMove(selectedPit, direction);
      onSelectPit(null);
    }
  };

  // Check if a pit is being animated right now
  const isPitActiveInAnim = (pitIndex: number) => {
    return activeAnimationStep && activeAnimationStep.pitIndex === pitIndex;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col items-center">
      {/* Hand Indicator during animation */}
      {activeAnimationStep && activeAnimationStep.handCount > 0 && (
        <div className="mb-3 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-bounce shadow-glow-jade">
          <Hand size={14} className="text-emerald-400" />
          <span>Đang rải sỏi: <strong>{activeAnimationStep.handCount}</strong> viên trên tay</span>
        </div>
      )}

      {/* Main Board Container */}
      <div className="w-full bg-slate-900/80 border border-white/[0.08] rounded-3xl p-3 md:p-5 shadow-elevated-card backdrop-blur-xl flex items-center justify-between gap-2 md:gap-4 select-none relative overflow-visible">
        
        {/* Left Quan Pit (Index 0) */}
        <div
          className={`relative w-24 h-48 md:w-32 md:h-64 rounded-l-full bg-obsidian-950/70 border border-white/[0.08] shadow-inner-pit flex flex-col items-center justify-center transition-all duration-300 ${
            isPitActiveInAnim(0) ? 'ring-2 ring-amber-400 bg-amber-950/30' : ''
          }`}
        >
          <span className="absolute top-3 font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Quan Trái #0
          </span>
          <PebbleVisual
            count={leftQuan.smallStones}
            hasBigQuan={leftQuan.hasBigQuan}
            isQuan={true}
          />
        </div>

        {/* Center Citizen Grid: 2 Rows x 5 Pits */}
        <div className="flex-1 flex flex-col gap-2 md:gap-3">
          {/* Top Row: Player 2 (Pits 11, 10, 9, 8, 7) */}
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {topPits.map((idx) => {
              const pit = board[idx];
              const playable = isPitPlayable(idx);
              const isSelected = selectedPit === idx;
              const isAnim = isPitActiveInAnim(idx);

              return (
                <div key={idx} className="relative">
                  <button
                    onClick={() => handlePitClick(idx)}
                    disabled={!playable}
                    className={`w-full h-23 md:h-30 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center p-2 relative shadow-inner-pit group ${
                      isSelected
                        ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-950/40 shadow-glow-amber scale-105 z-20'
                        : isAnim
                        ? 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-950/30 scale-102 z-10'
                        : playable
                        ? 'bg-obsidian-950/60 border-amber-500/30 hover:border-amber-400/80 hover:bg-amber-950/20 cursor-pointer'
                        : 'bg-obsidian-950/70 border-white/[0.06] opacity-90 cursor-default'
                    }`}
                  >
                    <span className="absolute top-1.5 font-mono text-[9px] text-slate-500">
                      #{idx}
                    </span>
                    <PebbleVisual
                      count={pit.smallStones}
                      playerOwner={2}
                      isActiveHover={playable}
                    />
                  </button>

                  {/* Direction Selection Popover for Top Row */}
                  {isSelected && (
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-obsidian-900 border border-amber-500/50 shadow-glow-amber whitespace-nowrap animate-float">
                      {/* For top row: Leftwards is clockwise (+1 in loop), Rightwards is counterclockwise (-1) */}
                      <button
                        onClick={() => handleChooseDirection('clockwise')}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-display font-bold text-xs flex items-center gap-1 transition-all"
                        title="Rải sang trái (về Quan Trái)"
                      >
                        <ArrowLeft size={14} />
                        <span>Trái</span>
                      </button>
                      <button
                        onClick={() => handleChooseDirection('counterclockwise')}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-display font-bold text-xs flex items-center gap-1 transition-all"
                        title="Rải sang phải (về Quan Phải)"
                      >
                        <span>Phải</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider with subtle cyber hairline */}
          <div className="w-full flex items-center justify-between px-2 text-[10px] font-mono text-slate-600">
            <span className="h-[1px] flex-1 bg-white/[0.06]"></span>
            <span className="px-3 uppercase tracking-widest text-[9px]">Chiến Tuyến</span>
            <span className="h-[1px] flex-1 bg-white/[0.06]"></span>
          </div>

          {/* Bottom Row: Player 1 (Pits 1, 2, 3, 4, 5) */}
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {bottomPits.map((idx) => {
              const pit = board[idx];
              const playable = isPitPlayable(idx);
              const isSelected = selectedPit === idx;
              const isAnim = isPitActiveInAnim(idx);

              return (
                <div key={idx} className="relative">
                  <button
                    onClick={() => handlePitClick(idx)}
                    disabled={!playable}
                    className={`w-full h-23 md:h-30 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center p-2 relative shadow-inner-pit group ${
                      isSelected
                        ? 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-950/40 shadow-glow-jade scale-105 z-20'
                        : isAnim
                        ? 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-950/30 scale-102 z-10'
                        : playable
                        ? 'bg-obsidian-950/60 border-emerald-500/30 hover:border-emerald-400/80 hover:bg-emerald-950/20 cursor-pointer'
                        : 'bg-obsidian-950/70 border-white/[0.06] opacity-90 cursor-default'
                    }`}
                  >
                    <span className="absolute top-1.5 font-mono text-[9px] text-slate-500">
                      #{idx}
                    </span>
                    <PebbleVisual
                      count={pit.smallStones}
                      playerOwner={1}
                      isActiveHover={playable}
                    />
                  </button>

                  {/* Direction Selection Popover for Bottom Row */}
                  {isSelected && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-obsidian-900 border border-emerald-500/50 shadow-glow-jade whitespace-nowrap animate-float">
                      {/* For bottom row: Leftwards is counterclockwise (-1), Rightwards is clockwise (+1) */}
                      <button
                        onClick={() => handleChooseDirection('counterclockwise')}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-display font-bold text-xs flex items-center gap-1 transition-all"
                        title="Rải sang trái (về Quan Trái)"
                      >
                        <ArrowLeft size={14} />
                        <span>Trái</span>
                      </button>
                      <button
                        onClick={() => handleChooseDirection('clockwise')}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-display font-bold text-xs flex items-center gap-1 transition-all"
                        title="Rải sang phải (về Quan Phải)"
                      >
                        <span>Phải</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Quan Pit (Index 6) */}
        <div
          className={`relative w-24 h-48 md:w-32 md:h-64 rounded-r-full bg-obsidian-950/70 border border-white/[0.08] shadow-inner-pit flex flex-col items-center justify-center transition-all duration-300 ${
            isPitActiveInAnim(6) ? 'ring-2 ring-amber-400 bg-amber-950/30' : ''
          }`}
        >
          <span className="absolute top-3 font-mono text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Quan Phải #6
          </span>
          <PebbleVisual
            count={rightQuan.smallStones}
            hasBigQuan={rightQuan.hasBigQuan}
            isQuan={true}
          />
        </div>

      </div>

      {/* Instruction Tip */}
      <div className="mt-4 text-xs font-mono text-slate-400 text-center">
        {selectedPit !== null ? (
          <span className="text-emerald-400 font-semibold animate-pulse">
            Đã chọn ô #{selectedPit}: Hãy bấm nút Trái hoặc Phải để rải sỏi
          </span>
        ) : isInteractive ? (
          <span>
            Đến lượt <strong>Người chơi {currentTurn}</strong>: Nhấp vào ô sáng của bạn để chọn hướng đi
          </span>
        ) : (
          <span className="text-slate-500 italic">
            Đang thực hiện diễn hoạt nước đi...
          </span>
        )}
      </div>
    </div>
  );
};
