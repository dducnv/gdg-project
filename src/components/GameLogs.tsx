import React from 'react';
import { GameLogEntry } from '../game/types';
import { Terminal, Award, ArrowRight } from 'lucide-react';

interface GameLogsProps {
  logs: GameLogEntry[];
}

export const GameLogs: React.FC<GameLogsProps> = ({ logs }) => {
  return (
    <div className="w-full bg-obsidian-900/60 border border-white/[0.08] rounded-2xl p-4 backdrop-blur-md flex flex-col h-56 md:h-72">
      {/* Feed Title */}
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          <Terminal size={14} className="text-emerald-400" />
          <span>Tường thuật ván đấu</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {logs.length} nước đi
        </span>
      </div>

      {/* Log items */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs font-mono">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-center text-xs">
            Chưa có nước đi nào. Nhấp vào ô sỏi của bạn để bắt đầu rải!
          </div>
        ) : (
          logs.map((log) => {
            const isP1 = log.player === 1;
            const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return (
              <div
                key={log.id}
                className="p-2 rounded-xl bg-obsidian-800/40 border border-white/[0.04] hover:border-white/[0.1] transition-all flex items-start gap-2.5"
              >
                <span className="text-[10px] text-slate-500 mt-0.5">{time}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isP1
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  P{log.player}
                </span>

                <div className="flex-1 text-slate-300 leading-relaxed">
                  {log.description}
                  {log.harvested.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {log.harvested.map((h, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold"
                        >
                          <Award size={11} className="text-emerald-400" />
                          Ăn ô #{h.pitIndex}: +{h.points}đ {h.isQuan && '👑'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
