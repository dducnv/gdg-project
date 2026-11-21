import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, Wifi, Users, Copy, Check, ArrowLeft } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface HeaderProps {
  roomCode?: string;
  lanUrl?: string;
  gameMode: 'bot' | 'online' | 'local';
  onBackToLobby: () => void;
  onOpenRules: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  lanUrl,
  gameMode,
  onBackToLobby,
  onOpenRules
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [copied, setCopied] = useState(false);

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleCopyLink = () => {
    if (!lanUrl) return;
    navigator.clipboard.writeText(lanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full border-b border-white/[0.08] bg-obsidian-900/80 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Brand & Mode */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToLobby}
          title="Trở về sảnh"
          className="p-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1.5 text-xs font-medium"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Sảnh</span>
        </button>

        <div className="flex items-baseline gap-2">
          <h1 className="font-display font-extrabold text-lg md:text-xl tracking-tight text-white flex items-center gap-2">
            <span>Ô ĂN QUAN</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 tracking-widest hidden md:inline-block">
              Cyber Folk
            </span>
          </h1>

          <span className="text-xs font-mono text-slate-400 hidden lg:inline">
            {gameMode === 'bot' && '• Chế độ: Đấu với Bot AI'}
            {gameMode === 'online' && `• Phòng LAN #${roomCode}`}
            {gameMode === 'local' && '• Chế độ: 2 Người (Pass & Play)'}
          </span>
        </div>
      </div>

      {/* LAN Invite & Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {gameMode === 'online' && lanUrl && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-800/90 border border-emerald-500/30 text-xs font-mono">
            <Wifi size={14} className="text-emerald-400 animate-pulse" />
            <span className="text-slate-300 hidden md:inline">Mã LAN:</span>
            <span className="text-emerald-400 font-bold">{roomCode}</span>
            <button
              onClick={handleCopyLink}
              title="Sao chép link LAN để mời bạn bè"
              className="ml-1.5 p-1 rounded hover:bg-obsidian-700 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{copied ? 'Đã chép!' : 'Chép link'}</span>
            </button>
          </div>
        )}

        {/* Rules button */}
        <button
          onClick={onOpenRules}
          className="p-2 md:px-3 md:py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Xem luật chơi"
        >
          <HelpCircle size={16} />
          <span className="hidden sm:inline">Luật chơi</span>
        </button>

        {/* Audio Mute button */}
        <button
          onClick={handleToggleSound}
          className="p-2 md:px-3 md:py-1.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1.5 text-xs font-medium"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-emerald-400" />}
          <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound On'}</span>
        </button>
      </div>
    </header>
  );
};
