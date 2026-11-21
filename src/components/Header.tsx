import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, ArrowLeft, Sparkles, Key } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface HeaderProps {
  gameMode: 'bot' | 'local';
  hasGeminiKey: boolean;
  onOpenGeminiModal: () => void;
  onBackToLobby: () => void;
  onOpenRules: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameMode,
  hasGeminiKey,
  onOpenGeminiModal,
  onBackToLobby,
  onOpenRules
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
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
            {gameMode === 'bot'
              ? (hasGeminiKey ? '• Đang đấu: Gemini Thần Sỏi AI' : '• Đang đấu: Bot AI Minimax')
              : '• Chế độ: 2 Người (Pass & Play)'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Gemini API Key Button */}
        <button
          onClick={onOpenGeminiModal}
          className={`p-2 md:px-3 md:py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-mono ${
            hasGeminiKey
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-glow-jade'
              : 'bg-obsidian-800 hover:bg-obsidian-700 border-white/[0.08] text-slate-400 hover:text-white'
          }`}
          title="Cài đặt Gemini API Key"
        >
          <Sparkles size={14} className={hasGeminiKey ? 'text-emerald-400' : 'text-slate-400'} />
          <span className="hidden sm:inline">
            {hasGeminiKey ? 'Gemini AI Active' : 'Gemini Key'}
          </span>
        </button>

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
