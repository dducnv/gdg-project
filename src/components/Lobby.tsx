import React, { useState } from 'react';
import { Wifi, Bot, Users, Play, Sparkles, Shield, Cpu, ArrowRight } from 'lucide-react';
import { BotDifficulty } from '../game/types';

interface LobbyProps {
  onHostOnline: (name: string) => void;
  onJoinOnline: (roomCode: string, name: string) => void;
  onStartBot: (name: string, difficulty: BotDifficulty) => void;
  onStartLocal2P: (p1Name: string, p2Name: string) => void;
  serverOnline: boolean;
  lanIp?: string;
  initialRoomCode?: string;
}

export const Lobby: React.FC<LobbyProps> = ({
  onHostOnline,
  onJoinOnline,
  onStartBot,
  onStartLocal2P,
  serverOnline,
  lanIp,
  initialRoomCode = ''
}) => {
  const [playerName, setPlayerName] = useState('Người Chơi');
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('strategic');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    onJoinOnline(roomCodeInput.trim(), playerName);
  };

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
        Bản tái hiện kỹ thuật số trò chơi dân gian Việt Nam. Chạy 100% offline & LAN với WebSocket và Bot AI thuật toán.
      </p>

      {/* Name Input Bar */}
      <div className="w-full max-w-md mb-8">
        <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider">
          Tên Của Bạn
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={18}
          placeholder="Nhập biệt danh..."
          className="w-full px-4 py-3 rounded-2xl bg-obsidian-800/80 border border-white/[0.08] focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/40 text-white font-medium text-sm outline-none transition-all placeholder:text-slate-600"
        />
      </div>

      {/* Mode Cards Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        
        {/* Card 1: Bot Solo Mode */}
        <div className="p-5 md:p-6 rounded-3xl bg-obsidian-800/40 border border-white/[0.08] hover:border-emerald-500/40 transition-all backdrop-blur-md flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bot size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-1">
              Thần Sỏi AI
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Đấu tập 1-vs-1 với thuật toán Minimax Alpha-Beta tìm nước đi tối ưu và giăng bẫy ăn liên hoàn.
            </p>

            {/* Difficulty selector */}
            <div className="flex rounded-xl bg-obsidian-900/80 p-1 border border-white/[0.05] mb-5">
              <button
                type="button"
                onClick={() => setBotDifficulty('easy')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
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
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  botDifficulty === 'strategic'
                    ? 'bg-emerald-500 text-obsidian-950 shadow-glow-jade'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Cao thủ
              </button>
            </div>
          </div>

          <button
            onClick={() => onStartBot(playerName, botDifficulty)}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-glow-jade flex items-center justify-center gap-2"
          >
            <Play size={15} />
            <span>Đấu Tập Ngay</span>
          </button>
        </div>

        {/* Card 2: LAN Multiplayer (Host/Join) */}
        <div className="p-5 md:p-6 rounded-3xl bg-obsidian-800/40 border border-white/[0.08] hover:border-amber-500/40 transition-all backdrop-blur-md flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Wifi size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-1">
              Phòng Thi Đấu LAN
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Tạo phòng đấu mạng nội bộ hoặc tham gia bằng mã phòng 4 số qua WebSocket độ trễ siêu thấp.
            </p>

            <button
              onClick={() => onHostOnline(playerName)}
              className="w-full py-2.5 px-4 mb-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-glow-amber flex items-center justify-center gap-2"
            >
              <Shield size={14} />
              <span>Tạo Phòng Mới</span>
            </button>

            <form onSubmit={handleJoin} className="flex gap-2">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="Mã 4 số..."
                maxLength={6}
                className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/[0.08] text-xs font-mono text-center text-white outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!roomCodeInput.trim()}
                className="px-3 py-2 rounded-xl bg-obsidian-700 hover:bg-obsidian-600 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all"
              >
                Vào
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Trạng thái:</span>
            <span className={serverOnline ? 'text-emerald-400' : 'text-amber-400'}>
              {serverOnline ? `Sẵn sàng (${lanIp || 'LAN'})` : 'Đang kết nối WebSocket...'}
            </span>
          </div>
        </div>

        {/* Card 3: 2-Player Pass & Play */}
        <div className="p-5 md:p-6 rounded-3xl bg-obsidian-800/40 border border-white/[0.08] hover:border-slate-400/40 transition-all backdrop-blur-md flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-slate-500/10 border border-slate-500/20 text-slate-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-1">
              Chơi Cùng Máy (Pass & Play)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Hai người ngồi đối diện nhau cùng thi đấu trên 1 màn hình laptop hoặc iPad. Không cần mạng.
            </p>
          </div>

          <button
            onClick={() => onStartLocal2P(playerName, 'Người Chơi 2')}
            className="w-full py-3 px-4 rounded-xl bg-obsidian-700 hover:bg-obsidian-600 text-white border border-white/[0.08] font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Users size={15} />
            <span>Chơi 2 Người</span>
          </button>
        </div>

      </div>

      {/* Footer Info */}
      <footer className="mt-12 text-center text-xs font-mono text-slate-500">
        Google Developer Groups (GDG) Community Project • 100% Offline Capable
      </footer>
    </div>
  );
};
