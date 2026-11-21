import React, { useState } from 'react';
import { Bot, Users, Play, Sparkles } from 'lucide-react';
import { BotDifficulty } from '../game/types';

interface LobbyProps {
  onStartBot: (name: string, difficulty: BotDifficulty) => void;
  onStartLocal2P: (p1Name: string, p2Name: string) => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  onStartBot,
  onStartLocal2P
}) => {
  const [playerName, setPlayerName] = useState('Người Chơi 1');
  const [player2Name, setPlayer2Name] = useState('Người Chơi 2');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('strategic');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs mb-4">
        <Sparkles size={13} />
        <span>Neo-Heritage • Digital Craftsmanship</span>
      </div>

      {/* Hero Title */}
      <h1 className="font-display font-black text-3xl md:text-5xl text-center text-white tracking-tight mb-2">
        Ô ĂN QUAN
      </h1>
      <p className="font-mono text-xs md:text-sm text-slate-400 text-center max-w-md mb-8">
        Bản tái hiện kỹ thuật số trò chơi dân gian Việt Nam. Hoạt động 100% trong trình duyệt với Bot AI Minimax và âm thanh tổng hợp Web Audio.
      </p>

      {/* Mode Cards Grid (2 clean columns) */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        
        {/* Card 1: Bot Solo Mode */}
        <div className="p-6 md:p-8 rounded-3xl bg-obsidian-800/40 border border-white/[0.08] hover:border-emerald-500/40 transition-all backdrop-blur-md flex flex-col justify-between group shadow-elevated-card">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Bot size={28} />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">
              Đấu Thần Sỏi AI
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Đấu trí 1-vs-1 với thuật toán Minimax Alpha-Beta tìm nước đi tối ưu và giăng bẫy ăn liên hoàn.
            </p>

            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                Tên Của Bạn
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={18}
                placeholder="Nhập tên..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/[0.08] focus:border-emerald-500/80 text-white font-medium text-xs outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Difficulty selector */}
            <div className="mb-6">
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
                Độ Khó Của Bot
              </label>
              <div className="flex rounded-xl bg-obsidian-900 p-1 border border-white/[0.05]">
                <button
                  type="button"
                  onClick={() => setBotDifficulty('easy')}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                    botDifficulty === 'easy'
                      ? 'bg-obsidian-700 text-slate-200 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Tập sự
                </button>
                <button
                  type="button"
                  onClick={() => setBotDifficulty('strategic')}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    botDifficulty === 'strategic'
                      ? 'bg-emerald-500 text-obsidian-950 shadow-glow-jade'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Cao thủ (Minimax)
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => onStartBot(playerName, botDifficulty)}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-glow-jade flex items-center justify-center gap-2"
          >
            <Play size={16} />
            <span>Bắt Đầu Đấu Bot</span>
          </button>
        </div>

        {/* Card 2: 2-Player Pass & Play */}
        <div className="p-6 md:p-8 rounded-3xl bg-obsidian-800/40 border border-white/[0.08] hover:border-amber-500/40 transition-all backdrop-blur-md flex flex-col justify-between group shadow-elevated-card">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Users size={28} />
            </div>
            <h3 className="font-display font-bold text-xl text-white mb-2">
              Chơi Cùng Máy (2 Người)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Hai người ngồi đối diện nhau cùng thi đấu trên 1 máy tính hoặc máy tính bảng theo lượt.
            </p>

            {/* P1 Name */}
            <div className="mb-4">
              <label className="block text-[11px] font-mono text-emerald-400 mb-1.5 uppercase tracking-wider">
                Người Chơi 1 (Hàng dưới)
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={18}
                placeholder="Tên P1..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/[0.08] focus:border-emerald-500/80 text-white font-medium text-xs outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            {/* P2 Name */}
            <div className="mb-6">
              <label className="block text-[11px] font-mono text-amber-400 mb-1.5 uppercase tracking-wider">
                Người Chơi 2 (Hàng trên)
              </label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                maxLength={18}
                placeholder="Tên P2..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/[0.08] focus:border-amber-500/80 text-white font-medium text-xs outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            onClick={() => onStartLocal2P(playerName, player2Name)}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-glow-amber flex items-center justify-center gap-2"
          >
            <Users size={16} />
            <span>Bắt Đầu Đấu 2 Người</span>
          </button>
        </div>

      </div>

      {/* Footer Info */}
      <footer className="mt-12 text-center text-xs font-mono text-slate-500">
        Google Developer Groups (GDG) Community Project • 100% Client-Side • Deploy Anywhere
      </footer>
    </div>
  );
};
